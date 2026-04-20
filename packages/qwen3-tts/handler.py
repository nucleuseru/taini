import os
import torch
import runpod
import soundfile as sf
import io
import base64
import asyncio
from qwen_tts import Qwen3TTSModel

HF_CACHE_ROOT = "/runpod-volume/huggingface-cache/hub"


def resolve_snapshot_path(model_id: str) -> str:
    """
    Resolve the local snapshot path for a cached model.

    Args:
        model_id: The model name from Hugging Face
            (e.g., 'distilbert/distilbert-base-uncased-finetuned-sst-2-english')

    Returns:
        The full path to the cached model snapshot
    """
    if "/" not in model_id:
        raise ValueError(f"model_id '{model_id}' must be in 'org/name' format")

    org, name = model_id.split("/", 1)
    model_root = os.path.join(HF_CACHE_ROOT, f"models--{org}--{name}")
    refs_main = os.path.join(model_root, "refs", "main")
    snapshots_dir = os.path.join(model_root, "snapshots")

    # Read the snapshot hash from refs/main
    if os.path.isfile(refs_main):
        with open(refs_main, "r") as f:
            snapshot_hash = f.read().strip()
        candidate = os.path.join(snapshots_dir, snapshot_hash)
        if os.path.isdir(candidate):
            return candidate

    # Fall back to first available snapshot
    if os.path.isdir(snapshots_dir):
        versions = [
            d
            for d in os.listdir(snapshots_dir)
            if os.path.isdir(os.path.join(snapshots_dir, d))
        ]
        if versions:
            versions.sort()
            return os.path.join(snapshots_dir, versions[0])

    raise RuntimeError(f"Cached model not found: {model_id}")


# Global configuration
device = "cuda:0" if torch.cuda.is_available() else "cpu"
dtype = torch.bfloat16 if torch.cuda.is_available() else torch.float32

print(f"Loading Qwen3-TTS model on {device}...")
attn_implementation = "flash_attention_2" if torch.cuda.is_available() else "eager"

model = Qwen3TTSModel.from_pretrained(
    resolve_snapshot_path("Qwen/Qwen3-TTS-12Hz-1.7B-Base"),
    device_map=device,
    dtype=dtype,
    attn_implementation=attn_implementation,
)
print("Model loaded successfully.")


async def handler(job):
    """
    Processes incoming TTS and Voice Cloning requests.
    Supports batch generation and reusable voice clone prompts.
    """
    job_input = job.get("input", {})
    action = job_input.get("action", "generate")

    try:
        if action == "create_prompt":
            ref_audio = job_input.get("ref_audio")
            ref_text = job_input.get("ref_text")
            x_vector_only_mode = job_input.get("x_vector_only_mode", False)

            if not ref_audio or not ref_text:
                return {
                    "error": "action 'create_prompt' requires both 'ref_audio' and 'ref_text'"
                }

            print(f"Creating reusable voice clone prompt for audio: {ref_audio}")
            prompt_items = await asyncio.to_thread(
                model.create_voice_clone_prompt,
                ref_audio=ref_audio,
                ref_text=ref_text,
                x_vector_only_mode=x_vector_only_mode,
            )

            # Serialize prompt_items to base64
            buffer = io.BytesIO()
            torch.save(prompt_items, buffer)
            prompt_base64 = base64.b64encode(buffer.getvalue()).decode("utf-8")

            return {"voice_clone_prompt": prompt_base64}

        elif action == "generate":
            text = job_input.get("text")
            language = job_input.get("language", "English")
            ref_audio = job_input.get("ref_audio")
            ref_text = job_input.get("ref_text")
            voice_clone_prompt_base64 = job_input.get("voice_clone_prompt")

            if not text:
                return {"error": "Missing 'text' in input"}

            # Standardize text and language to lists for batch processing
            texts = [text] if isinstance(text, str) else text
            languages = (
                [language] * len(texts) if isinstance(language, str) else language
            )

            prompt_items = None
            if voice_clone_prompt_base64:
                # Deserialize provided prompt
                print("Using provided voice_clone_prompt...")
                prompt_data = base64.b64decode(voice_clone_prompt_base64)
                # Note: using weights_only=False as prompt_items might be a dict of tensors/objects
                prompt_items = torch.load(io.BytesIO(prompt_data), map_location=device)
            elif ref_audio and ref_text:
                # Create prompt on the fly
                print(f"Creating prompt on the fly for audio: {ref_audio}")
                prompt_items = await asyncio.to_thread(
                    model.create_voice_clone_prompt,
                    ref_audio=ref_audio,
                    ref_text=ref_text,
                )
            else:
                return {
                    "error": "Generation requires 'ref_audio'/'ref_text' OR a 'voice_clone_prompt'"
                }

            # Generate audios
            print(f"Generating {len(texts)} voice clone(s)...")
            wavs, sr = await asyncio.to_thread(
                model.generate_voice_clone,
                text=texts,
                language=languages,
                voice_clone_prompt=prompt_items,
            )

            # Encode all generated wavs to base64
            audios_base64 = []
            for wav in wavs:
                buffer = io.BytesIO()
                sf.write(buffer, wav, sr, format="WAV")
                audios_base64.append(
                    base64.b64encode(buffer.getvalue()).decode("utf-8")
                )

            # If only one audio was requested, return it directly in the old format as well for compatibility
            response = {"audios": audios_base64, "sample_rate": sr, "format": "wav"}
            if len(audios_base64) == 1:
                response["audio_base64"] = audios_base64[0]

            return response

        else:
            return {"error": f"Unknown action: {action}"}

    except Exception as e:
        print(f"Error during Qwen3-TTS execution: {str(e)}")
        import traceback

        traceback.print_exc()
        return {"error": str(e)}


if __name__ == "__main__":
    runpod.serverless.start({"handler": handler})
