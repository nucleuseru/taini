import os
import io
import torch
import runpod
import asyncio
import requests
from schema import schema
from convex import ConvexClient
from diffusers import Flux2Pipeline
from diffusers.utils import load_image
from utils import resolve_snapshot_path


ACTIVE_JOBS = 0
MIN_CONCURRENCY = 1
MAX_CONCURRENCY = int(os.getenv("MAX_CONCURRENCY", "4"))

DEVICE = "cuda:0"
REPO_ID = "nucleuseru/flux-2"
TORCH_DTYPE = torch.bfloat16
TURBO_SIGMAS = [1.0, 0.6509, 0.4374, 0.2932, 0.1893, 0.1108, 0.0495, 0.00031]


client = ConvexClient(os.getenv("CONVEX_URL"))

pipe = Flux2Pipeline.from_pretrained(
    resolve_snapshot_path(REPO_ID), torch_dtype=TORCH_DTYPE
)

pipe.enable_model_cpu_offload()
pipe.to(DEVICE)

pipe.load_lora_weights(
    resolve_snapshot_path(REPO_ID), weight_name="flux.2-turbo-lora.safetensors"
)


async def upload_image(image, client):
    buffer = io.BytesIO()
    image.save(buffer, format="PNG")
    buffer.seek(0)

    post_url = client.mutation("upload:generateUrl", {})
    response = await asyncio.to_thread(
        requests.post,
        post_url,
        data=buffer.getvalue(),
        headers={"Content-Type": "image/png"},
        timeout=60,
    )
    response.raise_for_status()
    return response.json().get("storageId")


async def handler(event):
    try:
        global ACTIVE_JOBS
        ACTIVE_JOBS += 1

        data = event["input"]

        generator = (
            torch.Generator(device=DEVICE).manual_seed(data["seed"])
            if "seed" in data
            else None
        )

        images = (
            [
                load_image(img)
                for img in data["input_images"].replace(" ", "").split(",")
            ]
            if "input_images" in data
            else None
        )

        output = await asyncio.to_thread(
            pipe,
            prompt=data["prompt"],
            image=images,
            generator=generator,
            sigmas=TURBO_SIGMAS,
            width=data["width"],
            height=data["height"],
            guidance_scale=data["guidance"],
            num_inference_steps=data["num_steps"],
        )

        image = output.images[0]
        storage_id = await asyncio.to_thread(upload_image, image=image, client=client)

        return {"storage_id": storage_id}

    except Exception as e:
        return {"error": str(e)}
    finally:
        ACTIVE_JOBS -= 1


def adjust_concurrency(current_concurrency):
    if ACTIVE_JOBS >= current_concurrency and current_concurrency < MAX_CONCURRENCY:
        return current_concurrency + 1

    if ACTIVE_JOBS < current_concurrency / 2 and current_concurrency > MIN_CONCURRENCY:
        return current_concurrency - 1

    return current_concurrency


if __name__ == "__main__":
    runpod.serverless.start(
        {"handler": handler, "concurrency_modifier": adjust_concurrency}
    )
