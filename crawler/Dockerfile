# Multi-stage build for 1-Group Cuisine Recipe Crawler

# Stage 1: Builder
FROM python:3.11-slim as builder

WORKDIR /build

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Copy project files
COPY pyproject.toml README.md ./
COPY src ./src
COPY config ./config

# Create wheels
RUN pip install --upgrade pip setuptools wheel && \
    pip wheel --no-cache-dir --no-deps --wheel-dir /build/wheels -e .

# Stage 2: Runtime
FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    libpq5 \
    ca-certificates \
    chromium-browser \
    && rm -rf /var/lib/apt/lists/*

# Install Playwright browsers
RUN pip install --upgrade pip && \
    pip install playwright && \
    playwright install chromium

# Copy wheels from builder
COPY --from=builder /build/wheels /wheels
COPY --from=builder /build/pyproject.toml ./

# Install application
RUN pip install --no-cache /wheels/*

# Copy application code
COPY src ./src
COPY config ./config
COPY cli.py .

# Create non-root user
RUN useradd -m -u 1000 crawler && chown -R crawler:crawler /app
USER crawler

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD python -c "import sys; sys.exit(0)" || exit 1

# Entrypoint
ENTRYPOINT ["python", "-m", "crawler.cli"]
CMD ["--help"]
