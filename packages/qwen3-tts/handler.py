import torch
import runpod
from qwen_tts import Qwen3TTSModel
from schema import InputSchema, VoiceCloneInputSchema, GenerateInputSchema
from utils import (
    resolve_snapshot_path,
    download_prompt_item,
    upload_prompt_item,
    upload_audio,
)

# --- Initialization ---
device = "cuda:0"
print(f"--- [INIT] Initializing Qwen3-TTS on {device} ---")

repo_path = resolve_snapshot_path("nucleuseru/qwen3-tts")
model_path = f"{repo_path}/Qwen3-TTS-12Hz-1.7B-Base"

# Initialize Qwen3-TTS model
model = Qwen3TTSModel.from_pretrained(
    model_path, device_map=device, dtype=torch.bfloat16, local_files_only=True
)
print("--- [INIT] Qwen3-TTS Model initialized successfully ---")


# --- RunPod Handler ---


@torch.inference_mode()
def handler(job):
    """
    Main RunPod handler that processes Qwen3-TTS generation and voice cloning requests.
    """
    try:
        # Validate base input and identify task
        data = InputSchema.model_validate(job["input"])
        print(f"--- Starting request | Task: {data.task} ---")

        if data.task == "generate":
            # Process voice generation/cloning task
            data = GenerateInputSchema.model_validate(job["input"])
            print(f"--- Task: Generate | Text: {data.text[:100]}... ---")

            prompt_items = None
            if data.voice_clone_prompt:
                print(
                    f"--- Downloading {len(data.voice_clone_prompt)} prompt items... ---"
                )
                prompt_items = [
                    download_prompt_item(url, device) for url in data.voice_clone_prompt
                ]

            # Run inference
            print("--- Starting voice generation ---")
            wavs, sr = model.generate_voice_clone(
                text=data.text,
                language=data.language,
                ref_text=data.ref_text,
                ref_audio=data.ref_audio,
                voice_clone_prompt=prompt_items,
                x_vector_only_mode=data.x_vector_only_mode,
            )
            print("--- Generation complete | Uploading audio... ---")

            # Upload generated audio to storage
            storage_ids = [upload_audio(wav, sr) for wav in wavs]
            print(f"--- Finished | Storage IDs: {storage_ids} ---")

            return {"storage_ids": storage_ids}

        else:
            # Process voice clone prompt creation
            print("--- Task: Create Voice Clone Prompt ---")
            data = VoiceCloneInputSchema.model_validate(job["input"])

            # Create the clone prompt items
            prompt_items = model.create_voice_clone_prompt(
                ref_text=data.ref_text,
                ref_audio=data.ref_audio,
                x_vector_only_mode=data.x_vector_only_mode,
            )

            # Upload prompt items to storage
            storage_ids = [upload_prompt_item(pt) for pt in prompt_items]
            print(f"--- Finished | Storage IDs: {storage_ids} ---")

            return {"storage_ids": storage_ids}

    except Exception as e:
        print(f"--- ERROR: {str(e)} ---")
        return {"error": str(e)}


if __name__ == "__main__":
    runpod.serverless.start({"handler": handler})
