import os
import io
import torch
import runpod
import requests
from schema import schema
from convex import ConvexClient
from diffusers import Flux2Pipeline
from diffusers.utils import load_image
from utils import resolve_snapshot_path
from runpod.serverless.utils.rp_validator import validate


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


def upload_image(image):
    buffer = io.BytesIO()
    image.save(buffer, format="PNG")
    buffer.seek(0)

    post_url = client.mutation("upload:generateUrl", {})

    response = requests.post(
        post_url,
        data=buffer.getvalue(),
        headers={"Content-Type": "image/png"},
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

        output = pipe(
            prompt=data["prompt"],
            image=images,
            generator=generator,
            sigmas=TURBO_SIGMAS,
            width=data["width"],
            height=data["height"],
            guidance_scale=data["guidance"],
            num_inference_steps=data["num_steps"],
        )

        storage_id = upload_image(output.images[0])

        return {"output": {"storage_id": storage_id}}

    except Exception as e:
        return {"error": str(e)}


runpod.serverless.start({"handler": handler})
