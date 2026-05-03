FROM python:3.10-slim

WORKDIR /app

# Install system dependencies needed by librosa
RUN apt-get update && apt-get install -y \
    libsndfile1 \
    ffmpeg \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements and install
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy the entire api folder
COPY . .

# Expose port 7860 (Hugging Face default)
EXPOSE 7860

ENV PORT=7860

CMD ["python", "index.py"]
