import os
import runpod
import asyncio
import whisper
import threading
from schema import InputSchema

GPU_CONCURRENCY = int(os.getenv("GPU_CONCURRENCY", "2"))
gpu_semaphore = threading.Semaphore(GPU_CONCURRENCY)
model_size = os.getenv("WHISPER_MODEL", "turbo")

print(f"--- [INIT] GPU Concurrency Limit: {GPU_CONCURRENCY} ---")
print(f"--- [INIT] Loading Whisper model: {model_size} ---")
model = whisper.load_model(model_size)
print("--- [INIT] Whisper model loaded successfully ---")


def run_transcription(data):
    """
    Run transcription in a separate thread to avoid blocking the event loop.
    Uses a GPU semaphore to manage concurrent access to the model.
    """
    with gpu_semaphore:
        print(f"--- Starting transcription | Audio: {data.audio_url} ---")
        result = model.transcribe(
            data.audio_url,
            word_timestamps=data.word_timestamps,
        )
        print(
            f"--- Transcription complete | Generated {len(result['segments'])} segments ---"
        )
        return result["segments"]


async def handler(job):
    try:
        # Validate input using InputSchema
        data = InputSchema.model_validate(job["input"])

        segments = await asyncio.to_thread(run_transcription, data)

        return {"segments": segments}

    except Exception as e:
        print(f"--- ERROR: {str(e)} ---")
        return {"error": str(e)}


def adjust_concurrency(_current_concurrency):
    return GPU_CONCURRENCY


if __name__ == "__main__":
    runpod.serverless.start(
        {"handler": handler, "concurrency_modifier": adjust_concurrency}
    )
