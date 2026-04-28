import os
import runpod
import asyncio
import threading
from schema import InputSchema
from utils import resolve_snapshot_path
from faster_whisper import WhisperModel, BatchedInferencePipeline

GPU_CONCURRENCY = int(os.getenv("GPU_CONCURRENCY", "8"))
gpu_semaphore = threading.Semaphore(GPU_CONCURRENCY)

repo_path = resolve_snapshot_path("nucleuseru/whisper")
model_size = os.getenv("MODEL_SIZE", "whisper-large-v3")
model_path = f"{repo_path}/faster-{model_size}"

print(f"--- [INIT] Loading Whisper model: {model_size} from {model_path} ---")
print(f"--- [INIT] GPU Concurrency Limit: {GPU_CONCURRENCY} ---")

model = WhisperModel(
    model_path, device="cuda", compute_type="float16", local_files_only=True
)
batched_model = BatchedInferencePipeline(model=model)
print("--- [INIT] Whisper model loaded successfully ---")


def run_transcription(data):
    """
    Run transcription/translation in a separate thread to avoid blocking the event loop.
    Uses a GPU semaphore to manage concurrent access to the model.
    """
    with gpu_semaphore:
        print(f"--- Starting transcription/translation | Audio: {data.audio_url} ---")
        segments, _ = batched_model.transcribe(
            data.audio_url,
            task=data.task,
            language=data.language,
            batch_size=data.batch_size,
            multilingual=data.multilingual,
            word_timestamps=data.word_timestamps,
            without_timestamps=data.without_timestamps,
        )

        # The transcription actually runs when we iterate over the segments generator
        results = [segment._asdict() for segment in segments]

        print(f"--- Transcription complete | Generated {len(results)} segments ---")
        return results


async def handler(job):
    try:
        # Validate input using InputSchema
        data = InputSchema.model_validate(job["input"])

        segments = await asyncio.to_thread(run_transcription, data)

        return {"output": {"segments": segments}}

    except Exception as e:
        print(f"--- ERROR: {str(e)} ---")
        return {"error": str(e)}


def adjust_concurrency(_current_concurrency):
    return GPU_CONCURRENCY


if __name__ == "__main__":
    runpod.serverless.start(
        {"handler": handler, "concurrency_modifier": adjust_concurrency}
    )
