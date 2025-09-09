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

# Install Python dependencies globally (override the system protection)
COPY BE/requirements.txt .
RUN pip3 install --break-system-packages --no-cache-dir -r requirements.txt

# Copy the entire project
COPY . .

# Expose both ports
EXPOSE 3000 8000

# Start both services with correct working directories
CMD ["pnpm", "dev"]