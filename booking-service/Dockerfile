# Gunakan image Node.js sebagai base
FROM node:16

# Set working directory
WORKDIR /app

# Copy package.json dan package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY src/ ./src

# Expose port aplikasi
EXPOSE 3003

# Jalankan aplikasi
CMD ["node", "src/index.js"]