import io
import torch
import requests
import soundfile as sf
from dataclasses import asdict
from qwen_tts import VoiceClonePromptItem


def download_prompt_item(url: str, device: str = "cuda:0") -> VoiceClonePromptItem:
    response = requests.get(url, timeout=60)
    response.raise_for_status()
    buffer = io.BytesIO(response.content)
    prompt_dict = torch.load(buffer, map_location=device)
    return VoiceClonePromptItem(**prompt_dict)


def upload_prompt_item(upload_url, prompt_item: VoiceClonePromptItem) -> str:
    buffer = io.BytesIO()
    torch.save(asdict(prompt_item), buffer)
    buffer.seek(0)

    response = requests.post(
        upload_url,
        headers={"Content-Type": "application/octet-stream"},
        data=buffer.getvalue(),
        timeout=60,
    )

    response.raise_for_status()
    return response.json().get("storageId")


def upload_audio(upload_url, wav, sr):
    buffer = io.BytesIO()
    sf.write(buffer, wav, sr, format="WAV")
    buffer.seek(0)

    response = requests.post(
        upload_url,
        headers={"Content-Type": "audio/wav"},
        data=buffer.getvalue(),
        timeout=60,
    )

    response.raise_for_status()
    return response.json().get("storageId")
