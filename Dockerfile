FROM node:18-alpine

# Install Python and system dependencies
RUN apk add --no-cache \
    python3 \
    py3-pip \
    gcc \
    musl-dev \
    python3-dev \
    postgresql-dev

# Set up working directory
WORKDIR /app

# Copy package files and install Node.js dependencies
COPY package.json pnpm-lock.yaml ./
RUN npm install -g pnpm && pnpm install --frozen-lockfile

# Create and activate virtual environment for Python
RUN python3 -m venv /app/venv
ENV PATH="/app/venv/bin:$PATH"

# Copy backend requirements and install Python dependencies in virtual env
COPY BE/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy the entire project
COPY . .

# Expose both ports
EXPOSE 3000 8000

# Start both services using your existing pnpm script
CMD ["sh", "-c", "cd FE/web-ui && pnpm dev & /app/venv/bin/python BE/manage.py runserver 0.0.0.0:8000"]