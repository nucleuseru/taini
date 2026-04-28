# --- Utility Functions and Configuration ---
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

# Predefined sigmas for the Flux.2 Turbo LoRA inference
TURBO_SIGMAS = [1.0, 0.6509, 0.4374, 0.2932, 0.1893, 0.1108, 0.0495, 0.00031]


# --- Configuration and Initialization ---
device = "cuda:0"
print(f"--- [INIT] Initializing Flux.2 on {device} ---")
client = ConvexClient(os.getenv("CONVEX_URL"))
repo_path = resolve_snapshot_path("nucleuseru/flux-2")
# Initialize Flux inference pipeline
pipe = Flux2Pipeline.from_pretrained(repo_path, torch_dtype=torch.bfloat16)
pipe.load_lora_weights(repo_path, weight_name="flux.2-turbo-lora.safetensors")
pipe.enable_model_cpu_offload()
print("--- [INIT] Flux.2 Pipeline initialized successfully ---")


# --- Helper Functions ---


def upload_image(image):
    """
    Uploads a PIL image to Convex storage after converting to PNG.
    """
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


@torch.inference_mode()
def handler(job):
    """
    Main RunPod handler that processes Flux image generation requests.
    """
    try:
        # Validate input and setup generator
        data = InputSchema.model_validate(job["input"])
        print(f"--- Starting request | Prompt: {data.prompt[:100]}... ---")
        generator = torch.Generator(device=device).manual_seed(data.seed)

        # Load input images for conditioning
        if data.input_images:
            print(f"--- Loading {len(data.input_images)} input images... ---")
        images = [load_image(img) for img in data.input_images]

        # Run inference using Flux.2 pipeline
        print("--- Starting inference ---")
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
        print("--- Inference complete | Uploading images... ---")

        # Upload generated images to storage
        storage_ids = [upload_image(img) for img in output.images]
        print(f"--- Finished | Storage IDs: {storage_ids} ---")

        return {"output": {"storage_ids": storage_ids}}

    except Exception as e:
        print(f"--- ERROR: {str(e)} ---")
        return {"error": str(e)}


if __name__ == "__main__":
    runpod.serverless.start({"handler": handler})
