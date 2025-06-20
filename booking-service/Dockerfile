# Gunakan image Node.js sebagai base
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Install curl untuk health checks
RUN apk add --no-cache curl

# Copy package.json dan package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY src/ ./src/

# Expose port aplikasi
EXPOSE 3003

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3003/health || exit 1

# Jalankan aplikasi
CMD ["npm", "start"]