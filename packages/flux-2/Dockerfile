FROM nvidia/cuda:12.9.1-cudnn-runtime-ubuntu24.04

COPY --from=ghcr.io/astral-sh/uv:latest /uv /uvx /bin/

ENV DEBIAN_FRONTEND=noninteractive \
    PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    UV_HTTP_TIMEOUT=300 \
    HF_HUB_OFFLINE=1 \
    TRANSFORMERS_OFFLINE=1 \
    UV_LINK_MODE=copy

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends git python3 \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

RUN uv venv /app/.venv
ENV PATH="/app/.venv/bin:$PATH"

RUN uv pip install torch==2.8.0 torchvision==0.23.0 --index-url https://download.pytorch.org/whl/cu129

RUN uv pip install git+https://github.com/huggingface/diffusers.git && \
    uv pip install -U transformers accelerate bitsandbytes requests runpod peft convex

COPY handler.py schema.py utils.py ./

CMD ["python3", "-u", "handler.py"]
