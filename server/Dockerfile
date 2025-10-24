FROM node:20-alpine

# Install Chromium for Puppeteer
RUN apk add --no-cache \
    chromium \
    nss \
    freetype \
    harfbuzz \
    ca-certificates \
    ttf-freefont

# Tell Puppeteer to use installed Chromium
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true

WORKDIR /app

# Copy everything
COPY . .

# Install dependencies (will be compiled for Alpine Linux)
RUN npm install

# Create data directory
RUN mkdir -p /app/data

EXPOSE 3001

CMD ["npm", "run", "dev"]
