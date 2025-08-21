FROM node:20

# Install system dependencies
RUN apt-get update && apt-get install -y \
    pandoc \
    wget \
    fonts-liberation \
    fonts-dejavu-core \
    fonts-freefont-ttf \
    libnss3 \
    libatk-bridge2.0-0 \
    libxss1 \
    libasound2 \
    libgtk-3-0 \
    libgbm-dev \
    xvfb \
    unzip \
    zip \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install Node.js dependencies
RUN npm install

# Install Playwright browsers
RUN npx playwright install chromium

# Copy application files
COPY . .

# Create necessary directories
RUN mkdir -p uploads output public/exports template-css fonts checklist

# Set permissions
RUN chmod +x worker.js

# Expose port (if needed for health checks)
EXPOSE 3001

# Default command
CMD ["node", "worker.js"] 