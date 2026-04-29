import os
import io
import torch
import requests
import soundfile as sf
from dataclasses import asdict
from convex import ConvexClient
from qwen_tts import VoiceClonePromptItem

client = ConvexClient(os.getenv("CONVEX_URL"))


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
