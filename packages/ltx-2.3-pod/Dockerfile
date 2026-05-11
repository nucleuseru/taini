FROM nvidia/cuda:12.9.1-base-ubuntu24.04 AS builder

COPY --from=ghcr.io/astral-sh/uv:0.11.6 /uv /uvx /bin/

ENV DEBIAN_FRONTEND=noninteractive \
    UV_LINK_MODE=copy \
    UV_HTTP_TIMEOUT=300 \
    UV_COMPILE_BYTECODE=1

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    curl zip unzip jq git python3 python3-dev build-essential \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

RUN git clone https://github.com/Lightricks/LTX-2.git ./ \
    && uv sync --frozen --index pytorch --index nvidia

ENV PATH="/app/.venv/bin:$PATH"

CMD ["tail", "-f", "/dev/null"]
