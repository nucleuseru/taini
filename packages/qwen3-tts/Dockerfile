FROM nvidia/cuda:12.9.1-base-ubuntu24.04 AS builder

COPY --from=ghcr.io/astral-sh/uv:0.11.6 /uv /uvx /bin/

ENV DEBIAN_FRONTEND=noninteractive \
    UV_LINK_MODE=copy \
    UV_HTTP_TIMEOUT=300 \
    UV_COMPILE_BYTECODE=1

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    sox ffmpeg libsndfile1 libsox-fmt-all python3 \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

RUN uv venv /app/.venv

ENV PATH="/app/.venv/bin:$PATH"

RUN uv pip install --no-cache-dir requests pydantic qwen-tts runpod convex \
    torch==2.8.0 torchaudio==2.8.0 \
    --index https://download.pytorch.org/whl/cu129 --index https://pypi.nvidia.com


FROM nvidia/cuda:12.9.1-base-ubuntu24.04

ENV DEBIAN_FRONTEND=noninteractive \
    PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    HF_HUB_OFFLINE=1 \
    TRANSFORMERS_OFFLINE=1

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    sox ffmpeg libsndfile1 libsox-fmt-all python3 \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

COPY --from=builder /app/.venv /app/.venv

ENV PATH="/app/.venv/bin:$PATH"

COPY handler.py schema.py utils.py ./

CMD ["python", "-u", "handler.py"]