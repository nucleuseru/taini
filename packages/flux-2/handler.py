import os
import io
import torch
import runpod
import requests
from schema import InputSchema
from convex import ConvexClient
from diffusers import Flux2Pipeline
from diffusers.utils import load_image
from utils import resolve_snapshot_path

TURBO_SIGMAS = [1.0, 0.6509, 0.4374, 0.2932, 0.1893, 0.1108, 0.0495, 0.00031]


device = "cuda:0"
client = ConvexClient(os.getenv("CONVEX_URL"))
repo_path = resolve_snapshot_path("nucleuseru/flux-2")
pipe = Flux2Pipeline.from_pretrained(repo_path, torch_dtype=torch.bfloat16)
pipe.load_lora_weights(repo_path, weight_name="flux.2-turbo-lora.safetensors")
pipe.enable_model_cpu_offload()


def upload_image(image):
    buffer = io.BytesIO()
    image.save(buffer, format="PNG")
    buffer.seek(0)

    response = requests.post(
        client.mutation("upload:generateUrl"),
        headers={"Content-Type": "image/png"},
        data=buffer.getvalue(),
        timeout=60,
    )

    response.raise_for_status()
    return response.json().get("storageId")


def handler(job):
    try:
        data = InputSchema.model_validate(job["input"])
        images = [load_image(img) for img in data.input_images]
        generator = torch.Generator(device=device).manual_seed(data.seed)

        output = pipe(
            prompt=data.prompt,
            image=images,
            width=data.width,
            height=data.height,
            generator=generator,
            sigmas=TURBO_SIGMAS,
            guidance_scale=data.guidance,
            num_images_per_prompt=data.num_images,
            num_inference_steps=data.inference_steps,
        )

        storage_ids = [upload_image(img) for img in output.images]
        return {"output": {"storage_ids": storage_ids}}

    except Exception as e:
        return {"error": str(e)}


if __name__ == "__main__":
    runpod.serverless.start({"handler": handler})
