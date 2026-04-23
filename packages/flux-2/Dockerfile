FROM pytorch/pytorch:2.8.0-cuda12.9-cudnn9-runtime

ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PIP_NO_CACHE_DIR=1 \
    HF_HUB_OFFLINE=1 \
    TRANSFORMERS_OFFLINE=1

RUN apt-get update && apt-get install -y --no-install-recommends git python3.12-venv \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

RUN python3 -m venv /app/venv

ENV PATH="/app/venv/bin:$PATH"

RUN pip3 install --no-cache-dir git+https://github.com/huggingface/diffusers.git && \
    pip3 install --no-cache-dir -U transformers accelerate bitsandbytes && \
    pip3 install --no-cache-dir requests runpod asyncio

COPY handler.py schema.py utils.py ./

CMD ["python3", "-u", "handler.py"]