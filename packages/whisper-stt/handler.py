import os
import torch
import runpod
import whisper
import asyncio

# Global configuration
model_name = os.getenv("WHISPER_MODEL", "turbo")
device = "cuda" if torch.cuda.is_available() else "cpu"

print(f"Loading model '{model_name}' on {device}...")
model = whisper.load_model(model_name, device=device)
print("Model loaded successfully.")

# Tracking active jobs for dynamic concurrency adjustment
active_jobs = 0


async def handler(job):
    """
    Processes incoming transcription requests concurrently.
    """
    global active_jobs
    active_jobs += 1

    job_input = job.get("input", {})
    audio_url = job_input.get("audio_url")

    if not audio_url:
        active_jobs -= 1
        return {"error": "Missing audio_url in input"}

    try:
        # Extract additional whisper parameters if provided
        params = {
            "word_timestamps": job_input.get("word_timestamps", True),
            "fp16": torch.cuda.is_available(),
        }

        # Run transcription in a separate thread to avoid blocking the event loop.
        # This is crucial for maintaining concurrency on a single worker.
        result = await asyncio.to_thread(model.transcribe, audio_url, **params)

        return {
            "text": result.get("text", "").strip(),
            "segments": result.get("segments", []),
        }
    except Exception as e:
        print(f"Error during transcription: {str(e)}")
        return {"error": str(e)}
    finally:
        active_jobs -= 1


def adjust_concurrency(current_concurrency):
    """
    Dynamically adjusts the worker's concurrency level.
    For Whisper, we balance between VRAM limits and I/O efficiency.
    """
    max_concurrency = int(os.getenv("MAX_CONCURRENCY", 4))
    min_concurrency = 1

    # If we are nearing capacity and have more work, we can signal to increase
    # This is a simplified version of the logic in the documentation
    if active_jobs >= current_concurrency and current_concurrency < max_concurrency:
        return current_concurrency + 1
    elif (
        active_jobs < current_concurrency / 2 and current_concurrency > min_concurrency
    ):
        return current_concurrency - 1

    return current_concurrency


if __name__ == "__main__":
    runpod.serverless.start(
        {"handler": handler, "concurrency_modifier": adjust_concurrency}
    )
