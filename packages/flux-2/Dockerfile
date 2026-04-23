FROM nvidia/cuda:12.9.1-cudnn-runtime-ubuntu24.04

ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PIP_NO_CACHE_DIR=1 \
    HF_HUB_OFFLINE=1 \
    TRANSFORMERS_OFFLINE=1

RUN apt-get update && apt-get install -y --no-install-recommends git python3.12-venv \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

RUN python3 -m venv /app/.venv

ENV PATH="/app/.venv/bin:$PATH"

RUN pip install --no-cache-dir torch==2.8.0 torchvision==0.23.0 torchaudio==2.8.0 --index-url https://download.pytorch.org/whl/cu129 && \
    pip install --no-cache-dir git+https://github.com/huggingface/diffusers.git && \
    pip install --no-cache-dir -U transformers accelerate bitsandbytes requests runpod asyncio

COPY handler.py schema.py utils.py ./

CMD ["python3", "-u", "handler.py"]