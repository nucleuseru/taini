FROM nvidia/cuda:12.9.1-cudnn-runtime-ubuntu24.04 AS builder

COPY --from=ghcr.io/astral-sh/uv:0.11.6 /uv /uvx /bin/

ENV DEBIAN_FRONTEND=noninteractive \
    UV_LINK_MODE=copy \
    UV_COMPILE_BYTECODE=1 \
    PATH="/app/.venv/bin:$PATH"

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends git python3 \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

RUN uv venv /app/.venv
RUN uv pip install torch==2.8.0 torchvision==0.23.0 --index-url https://download.pytorch.org/whl/cu129
RUN uv pip install git+https://github.com/huggingface/diffusers.git
RUN uv pip install -U transformers accelerate bitsandbytes requests runpod peft convex


FROM nvidia/cuda:12.9.1-cudnn-runtime-ubuntu24.04

ENV DEBIAN_FRONTEND=noninteractive \
    PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    HF_HUB_OFFLINE=1 \
    TRANSFORMERS_OFFLINE=1 \
    PATH="/app/.venv/bin:$PATH"

WORKDIR /app

COPY --from=builder /app/.venv /app/.venv
COPY handler.py schema.py utils.py ./

CMD ["python", "-u", "handler.py"]
