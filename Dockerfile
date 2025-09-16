FROM python:3.11-slim

# Install Node.js
RUN apt-get update && apt-get install -y \
    curl \
    && curl -fsSL https://deb.nodesource.com/setup_18.x | bash - \
    && apt-get install -y nodejs \
    && rm -rf /var/lib/apt/lists/*

# Set up working directory
WORKDIR /app

# Copy package files and install Node.js dependencies
COPY package.json pnpm-lock.yaml ./
RUN npm install -g pnpm && pnpm install

# Install Python dependencies globally (override the system protection)
COPY requirements.txt .
RUN pip3 install --break-system-packages --no-cache-dir -r requirements.txt

# Copy the entire project
COPY . .

# apply migration for BE app
RUN cd ./BE && python manage.py migrate

# Expose both ports
EXPOSE 3000 8000

# Start both services with correct working directories
CMD ["pnpm", "dev"]
