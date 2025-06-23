FROM node:18-alpine

WORKDIR /app

# ✅ Install PostgreSQL client for pg_isready and curl for health checks
RUN apk add --no-cache postgresql-client curl

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application
COPY . .

# Expose the port your app runs on
EXPOSE 4000

# ✅ Copy and make scripts executable
COPY start.sh ./
RUN chmod +x ./start.sh

# Start the app with DB init and seeding
CMD ["./start.sh"]