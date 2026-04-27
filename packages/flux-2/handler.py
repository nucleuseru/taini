import os
import io
import torch
import runpod
import random
import requests
from schema import schema
from convex import ConvexClient
from diffusers import Flux2Pipeline
from diffusers.utils import load_image
from utils import resolve_snapshot_path
from runpod.serverless.utils.rp_validator import validate


DEVICE = "cuda:0"
TORCH_DTYPE = torch.bfloat16
REPO_PATH = resolve_snapshot_path("nucleuseru/flux-2")
TURBO_SIGMAS = [1.0, 0.6509, 0.4374, 0.2932, 0.1893, 0.1108, 0.0495, 0.00031]


client = ConvexClient(os.getenv("CONVEX_URL"))
pipe = Flux2Pipeline.from_pretrained(REPO_PATH, torch_dtype=TORCH_DTYPE)
pipe.load_lora_weights(REPO_PATH, weight_name="flux.2-turbo-lora.safetensors")
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


def handler(event):
    try:
        validated_input = validate(event["input"], schema)

        if "errors" in validated_input:
            return {"error": validated_input["errors"]}

        data = validated_input["validated_input"]

        generator = torch.Generator(device=DEVICE).manual_seed(
            data["seed"] if data["seed"] != 0 else random.randint(0, 2**32 - 1)
        )

        images = None

        if data["input_images"] != "None":
            images = [
                load_image(img)
                for img in data["input_images"].replace(" ", "").split(",")
            ]

        output = pipe(
            prompt=data["prompt"],
            image=images,
            generator=generator,
            sigmas=TURBO_SIGMAS,
            width=data["width"],
            height=data["height"],
            guidance_scale=data["guidance"],
            num_inference_steps=data["num_steps"],
            num_images_per_prompt=data["num_images_per_prompt"],
        )

        storage_ids = []

        for img in output.images:
            storage_ids.append(upload_image(img))

        return {"output": {"storage_ids": storage_ids}}

    except Exception as e:
        return {"error": str(e)}


runpod.serverless.start({"handler": handler})
