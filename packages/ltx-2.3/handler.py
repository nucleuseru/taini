import io
import os
import torch
import runpod
import requests
import asyncio
from schema import InputSchema
from convex import ConvexClient
from utils import resolve_snapshot_path
from ltx_pipelines.utils.media_io import encode_video
from ltx_pipelines.utils.args import ImageConditioningInput
from ltx_pipelines.ti2vid_two_stages_hq import TI2VidTwoStagesHQPipeline
from ltx_core.model.video_vae import TilingConfig, get_video_chunks_number
from ltx_pipelines.utils.constants import DEFAULT_LORA_STRENGTH, LTX_2_3_HQ_PARAMS
from ltx_core.loader import LTXV_LORA_COMFY_RENAMING_MAP, LoraPathStrengthAndSDOps


# --- Configuration and Initialization ---
device = "cuda:0"
print(f"--- [INIT] Initializing LTX-2.3 on {device} ---")
client = ConvexClient(os.getenv("CONVEX_URL"))
repo_path = resolve_snapshot_path("nucleuseru/ltx-2.3")
distilled_lora = LoraPathStrengthAndSDOps(
    f"{repo_path}/ltx-2.3-22b-distilled-lora-384-1.1.safetensors",
    DEFAULT_LORA_STRENGTH,
    LTXV_LORA_COMFY_RENAMING_MAP,
)

# Initialize LTX inference pipeline
pipeline = TI2VidTwoStagesHQPipeline(
    loras=[],
    device=device,
    torch_compile=True,
    gemma_root=repo_path,
    distilled_lora=[distilled_lora],
    distilled_lora_strength_stage_2=0.5,
    distilled_lora_strength_stage_1=0.25,
    checkpoint_path=f"{repo_path}/ltx-2.3-22b-dev.safetensors",
    spatial_upsampler_path=f"{repo_path}/ltx-2.3-spatial-upscaler-x2-1.1.safetensors",
)
print(f"--- [INIT] LTX-2.3 Pipeline initialized successfully ---")


# GPU access control for concurrent requests
_gpu_semaphore = None


def get_gpu_semaphore():
    global _gpu_semaphore
    if _gpu_semaphore is None:
        _gpu_semaphore = asyncio.Semaphore(1)
    return _gpu_semaphore


# --- Helper Functions ---
async def download_img(url):
    response = await asyncio.to_thread(requests.get, url, timeout=60)
    response.raise_for_status()
    return io.BytesIO(response.content)


async def upload_video(video_bytes):
    post_url = await asyncio.to_thread(client.mutation, "upload:generateUrl")

    response = await asyncio.to_thread(
        requests.post,
        post_url,
        headers={"Content-Type": "video/mp4"},
        data=video_bytes,
        timeout=60,
    )

    response.raise_for_status()
    return response.json().get("storageId")


@torch.inference_mode()
async def handler(job):
    """
    Main RunPod handler that processes video generation requests.
    """
    try:
        # Validate input and calculate required frames
        data = InputSchema.model_validate(job["input"])
        print(
            f"--- [JOB {job['id']}] Starting request | Prompt: {data.prompt[:100]}... ---"
        )
        num_frames = (((data.duration * data.frame_rate) // 8) * 8) + 1
        images = []

        # Handle image conditioning downloads
        img_tasks = []
        if data.start_frame or data.end_frame:
            print(f"--- [JOB {job['id']}] Downloading conditioning images... ---")

        if data.start_frame:
            img_tasks.append(download_img(data.start_frame))
        if data.end_frame:
            img_tasks.append(download_img(data.end_frame))

        downloaded_images = await asyncio.gather(*img_tasks)

        img_idx = 0
        if data.start_frame:
            images.append(
                ImageConditioningInput(
                    path=downloaded_images[img_idx],
                    frame_idx=0,
                    strength=1.0,
                )
            )
            img_idx += 1

        if data.end_frame:
            images.append(
                ImageConditioningInput(
                    path=downloaded_images[img_idx],
                    frame_idx=num_frames - 1,
                    strength=1.0,
                )
            )

        tiling_config = TilingConfig.default()
        video_chunks_number = get_video_chunks_number(num_frames, tiling_config)

        # Run inference with GPU locking
        print(f"--- [JOB {job['id']}] Waiting for GPU lock... ---")
        async with get_gpu_semaphore():
            print(
                f"--- [JOB {job['id']}] GPU lock acquired | Starting inference ({num_frames} frames) ---"
            )
            video, audio = await asyncio.to_thread(
                pipeline,
                images=images,
                seed=data.seed,
                width=data.width,
                height=data.height,
                prompt=data.prompt,
                num_frames=num_frames,
                frame_rate=data.frame_rate,
                tiling_config=tiling_config,
                enhance_prompt=data.enhance_prompt,
                max_batch_size=data.max_batch_size,
                negative_prompt=data.negative_prompt,
                num_inference_steps=data.inference_steps,
                video_guider_params=LTX_2_3_HQ_PARAMS.video_guider_params,
                audio_guider_params=LTX_2_3_HQ_PARAMS.audio_guider_params,
            )
        print(f"--- [JOB {job['id']}] Inference complete | Encoding video... ---")

        # Encode generated tensors to MP4
        buffer = io.BytesIO()
        await asyncio.to_thread(
            encode_video,
            video=video,
            audio=audio,
            fps=data.frame_rate,
            output_path=buffer,
            video_chunks_number=video_chunks_number,
        )

        # Upload result to storage
        print(f"--- [JOB {job['id']}] Uploading video to Convex... ---")
        buffer.seek(0)
        storage_id = await upload_video(buffer.getvalue())
        print(f"--- [JOB {job['id']}] Finished | Storage ID: {storage_id} ---")

        return {"output": {"storage_id": storage_id}}

    except Exception as e:
        print(f"--- [JOB {job['id']}] ERROR: {str(e)} ---")
        return {"error": str(e)}


def adjust_concurrency(_current_concurrency):
    """Static concurrency boost for the worker."""
    return 8


if __name__ == "__main__":
    runpod.serverless.start(
        {"handler": handler, "concurrency_modifier": adjust_concurrency}
    )
