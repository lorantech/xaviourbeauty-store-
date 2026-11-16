FROM node:20-alpine
WORKDIR /app

# Install dependencies first (better caching)
COPY package*.json ./
RUN npm ci --only=production

# Copy source and build
COPY . .
RUN npm run build

EXPOSE 8080
CMD ["node", "dist/server.js"]