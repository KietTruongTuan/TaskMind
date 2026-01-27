FROM python:3.11-slim

# Install Node.js
RUN apt-get update && apt-get install -y \
    curl \
    && curl -fsSL https://deb.nodesource.com/setup_18.x | bash - \
    && apt-get install -y nodejs \
    && rm -rf /var/lib/apt/lists/*

# Set up working directory
WORKDIR /app

COPY requirements.txt .
RUN pip3 install --break-system-packages --no-cache-dir -r requirements.txt

# Copy the entire project
COPY . .

# Expose both ports
EXPOSE 8000

# Start both services with correct working directories
CMD ["sh", "-c", "cd BE && python manage.py migrate && cd ../FE/web-ui && pnpm dev:be"]
