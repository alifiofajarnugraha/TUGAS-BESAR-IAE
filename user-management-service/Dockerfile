FROM node:18
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 3001
CMD ["./wait-for-it.sh", "db:5432", "--", "node", "src/index.js"]
