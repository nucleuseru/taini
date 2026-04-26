import os
import runpod
import requests
from io import BytesIO
from schema import schema
from convex import ConvexClient
from utils import resolve_snapshot_path, encode_video
from runpod.serverless.utils.rp_validator import validate
from ltx_pipelines.utils.args import ImageConditioningInput
from ltx_pipelines.ti2vid_two_stages_hq import TI2VidTwoStagesHQPipeline
from ltx_core.model.video_vae import TilingConfig, get_video_chunks_number
from ltx_core.loader import LTXV_LORA_COMFY_RENAMING_MAP, LoraPathStrengthAndSDOps
from ltx_pipelines.utils.constants import (
    DEFAULT_LORA_STRENGTH,
    DEFAULT_NEGATIVE_PROMPT,
    LTX_2_3_HQ_PARAMS,
)

DEVICE = "cuda:0"
REPO_PATH = resolve_snapshot_path("nucleuseru/ltx-2.3")
DISTILLED_LORA = LoraPathStrengthAndSDOps(
    f"{REPO_PATH}/ltx-2.3-22b-distilled-lora-384-1.1.safetensors",
    DEFAULT_LORA_STRENGTH,
    LTXV_LORA_COMFY_RENAMING_MAP,
)

client = ConvexClient(os.getenv("CONVEX_URL"))
print(f"--- Loading LTX-2.3 Pipeline from {REPO_PATH} ---")
pipeline = TI2VidTwoStagesHQPipeline(
    loras=[],
    device=DEVICE,
    gemma_root=REPO_PATH,
    distilled_lora=[DISTILLED_LORA],
    distilled_lora_strength_stage_2=0.5,
    distilled_lora_strength_stage_1=0.25,
    checkpoint_path=f"{REPO_PATH}/ltx-2.3-22b-dev.safetensors",
    spatial_upsampler_path=f"{REPO_PATH}/ltx-2.3-spatial-upscaler-x2-1.1.safetensors",
)
print("--- Pipeline Initialized ---")


def upload_video(video_bytes):
    response = requests.post(
        client.mutation("upload:generateUrl"),
        headers={"Content-Type": "video/mp4"},
        data=video_bytes,
        timeout=60,
    )

    response.raise_for_status()

    return response.json().get("storageId")


def handler(event):
    print("--- Received Request ---")
    try:
        validated_input = validate(event["input"], schema)

        if "errors" in validated_input:
            return {"error": validated_input["errors"]}

        data = validated_input["validated_input"]
        print(f"--- Validated Input: {data} ---")
        num_frames = (((data["duration"] * data["frame_rate"]) // 8) * 8) + 1
        images = []

        if data["start_frame"] != "None":
            print(f"--- Downloading Start Frame: {data['start_frame']} ---")
            response = requests.get(data["start_frame"], timeout=60)
            response.raise_for_status()
            images.append(
                ImageConditioningInput(
                    path=BytesIO(response.content), frame_idx=0, strength=1.0
                )
            )

        if data["end_frame"] != "None":
            print(f"--- Downloading End Frame: {data['end_frame']} ---")
            response = requests.get(data["end_frame"], timeout=60)
            response.raise_for_status()
            images.append(
                ImageConditioningInput(
                    path=BytesIO(response.content),
                    frame_idx=num_frames - 1,
                    strength=1.0,
                )
            )

        tiling_config = TilingConfig.default()
        video_chunks_number = get_video_chunks_number(num_frames, tiling_config)

        print(
            f"--- Running Pipeline (frames: {num_frames}, size: {data['width']}x{data['height']}, seed: {data['seed']}) ---"
        )
        video, audio = pipeline(
            images=images,
            seed=data["seed"],
            width=data["width"],
            height=data["height"],
            prompt=data["prompt"],
            num_frames=num_frames,
            tiling_config=tiling_config,
            frame_rate=data["frame_rate"],
            negative_prompt=DEFAULT_NEGATIVE_PROMPT,
            num_inference_steps=LTX_2_3_HQ_PARAMS.num_inference_steps,
            video_guider_params=LTX_2_3_HQ_PARAMS.video_guider_params,
            audio_guider_params=LTX_2_3_HQ_PARAMS.audio_guider_params,
        )
        print("--- Pipeline Execution Finished ---")

        print("--- Encoding Video ---")
        video_bytes = encode_video(
            video=video,
            audio=audio,
            fps=data["frame_rate"],
            video_chunks_number=video_chunks_number,
        )

        print("--- Uploading Video ---")
        storage_id = upload_video(video_bytes)

        print(f"--- Finished Successfully (storage_id: {storage_id}) ---")
        return {"output": {"storage_id": storage_id}}

    except Exception as e:
        print(f"--- Error in Handler: {str(e)} ---")
        return {"error": str(e)}


runpod.serverless.start({"handler": handler})
