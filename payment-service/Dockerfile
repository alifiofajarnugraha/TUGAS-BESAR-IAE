FROM node:18-alpine

WORKDIR /app

# Install curl untuk health checks
RUN apk add --no-cache curl

# Copy package files
COPY package*.json ./

# Install dependencies (hapus --only=production)
RUN npm install

# Copy source code
COPY . .

# Expose port
EXPOSE 3004

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3004/health || exit 1

# Start the application
CMD ["npm", "start"]