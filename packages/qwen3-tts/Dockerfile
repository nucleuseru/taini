FROM pytorch/pytorch:2.11.0-cuda12.6-cudnn9-runtime

ENV DEBIAN_FRONTEND=noninteractive
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Install system dependencies
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    sox \
    libsox-fmt-all \
    ffmpeg \
    libsndfile1 \
    && apt-get clean && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /app

RUN python3 -m venv /app/venv

ENV PATH="/app/venv/bin:$PATH"

# Install Python dependencies
RUN pip3 install --no-cache-dir -U qwen-tts runpod soundfile


COPY handler.py .

CMD ["python3", "-u", "handler.py"]