import os
import io
import torch
import requests
import soundfile as sf
from dataclasses import asdict
from convex import ConvexClient
from qwen_tts import VoiceClonePromptItem


HF_CACHE_ROOT = "/runpod-volume/huggingface-cache/hub"
client = ConvexClient(os.getenv("CONVEX_URL"))


def resolve_snapshot_path(model_id: str) -> str:
    if "/" not in model_id:
        raise ValueError(f"model_id '{model_id}' must be in 'org/name' format")

    org, name = model_id.split("/", 1)
    model_root = os.path.join(HF_CACHE_ROOT, f"models--{org}--{name}")
    refs_main = os.path.join(model_root, "refs", "main")
    snapshots_dir = os.path.join(model_root, "snapshots")

    if os.path.isfile(refs_main):
        with open(refs_main, "r") as f:
            snapshot_hash = f.read().strip()
        candidate = os.path.join(snapshots_dir, snapshot_hash)
        if os.path.isdir(candidate):
            return candidate

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


def download_prompt_item(url: str, device: str = "cuda:0") -> VoiceClonePromptItem:
    response = requests.get(url, timeout=60)
    response.raise_for_status()
    buffer = io.BytesIO(response.content)
    prompt_dict = torch.load(buffer, map_location=device)
    return VoiceClonePromptItem(**prompt_dict)


def upload_prompt_item(prompt_item: VoiceClonePromptItem) -> str:
    buffer = io.BytesIO()
    torch.save(asdict(prompt_item), buffer)
    buffer.seek(0)

    response = requests.post(
        client.mutation("upload:generateUrl"),
        headers={"Content-Type": "application/octet-stream"},
        data=buffer.getvalue(),
        timeout=60,
    )

    response.raise_for_status()
    return response.json().get("storageId")


def upload_audio(wav, sr):
    buffer = io.BytesIO()
    sf.write(buffer, wav, sr, format="WAV")
    buffer.seek(0)

    response = requests.post(
        client.mutation("upload:generateUrl"),
        headers={"Content-Type": "audio/wav"},
        data=buffer.getvalue(),
        timeout=60,
    )

    response.raise_for_status()
    return response.json().get("storageId")
