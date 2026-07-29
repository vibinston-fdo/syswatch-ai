# ==================================
# Stage 1: Build the React frontend
# ==================================
FROM node:18-alpine AS frontend-builder
WORKDIR /app/frontend

# Install dependencies first (for caching)
COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci

# Copy frontend source and build
COPY frontend/ ./
RUN npm run build

# ==================================
# Stage 2: Build the FastAPI backend
# ==================================
FROM python:3.11-slim
WORKDIR /app/backend

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

# Install system dependencies (for building some python packages if needed, and MySQL)
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    default-libmysqlclient-dev \
    pkg-config \
    && rm -rf /var/lib/apt/lists/*

# Install python dependencies
COPY backend/requirements.txt ./
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# Install extra dependency for MySQL and PostgreSQL
RUN pip install --no-cache-dir cryptography pymysql psycopg2-binary

# Copy backend source
COPY backend/ ./

# Copy the built React app from Stage 1 into the backend/frontend/build directory
# (FastAPI main.py serves it from `../frontend/build`)
COPY --from=frontend-builder /app/frontend/build /app/frontend/build

# Expose port
EXPOSE 8000

# Start the application
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
