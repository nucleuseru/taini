import os
import io
import uuid
import torch
import requests
import mimetypes
import soundfile as sf
from typing import Union, List
from dataclasses import asdict
from convex import ConvexClient
from qwen_tts import VoiceClonePromptItem

client = ConvexClient(os.getenv("CONVEX_URL"))


def download_audio(
    url: Union[str, List[str]], output_dir: str
) -> Union[str, List[str]]:
    os.makedirs(output_dir, exist_ok=True)

    is_single = isinstance(url, str)
    urls = [url] if is_single else url

    paths = []
    for u in urls:
        response = requests.get(u, timeout=60)
        response.raise_for_status()

        filename = u.split("/")[-1].split("?")[0]
        ext = os.path.splitext(filename)[1]

        if not ext:
            content_type = (
                response.headers.get("Content-Type", "").split(";")[0].strip()
            )
            if content_type == "audio/mpeg":
                ext = ".mp3"
            elif content_type in ["audio/wav", "audio/x-wav"]:
                ext = ".wav"
            elif content_type == "audio/ogg":
                ext = ".ogg"
            elif content_type == "audio/mp4":
                ext = ".m4a"
            elif content_type == "audio/flac":
                ext = ".flac"
            elif content_type == "audio/webm":
                ext = ".webm"
            else:
                ext = mimetypes.guess_extension(content_type) or ""

            if not filename:
                filename = f"{uuid.uuid4().hex}{ext}"
            else:
                filename = f"{filename}{ext}"

        file_path = os.path.join(output_dir, filename)
        with open(file_path, "wb") as f:
            f.write(response.content)

        paths.append(file_path)

    return paths[0] if is_single else paths


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
