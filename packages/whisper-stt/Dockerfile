FROM pytorch/pytorch:2.1.0-cuda12.1-cudnn8-runtime

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

RUN apt-get update && \
    apt-get install -y --no-install-recommends ffmpeg && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /app

RUN pip3 install --no-cache-dir openai-whisper runpod asyncio

ARG WHISPER_MODEL=turbo
ENV WHISPER_MODEL=${WHISPER_MODEL}

RUN python3 - <<'PY'
import os, whisper
model = os.getenv("WHISPER_MODEL", "turbo")
whisper.load_model(model)
PY

COPY handler.py .

CMD ["python3", "-u", "handler.py"]