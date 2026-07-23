# Dockerfile for collar WS bridge using pm2-runtime
FROM node:18-alpine

# Create app directory
WORKDIR /usr/seven-os/app

# Copy package files first to leverage layer caching
COPY package.json package-lock.json* ./

# Install production deps and pm2-runtime
RUN npm ci --only=production || npm install --production && \
    npm install -g pm2

# Copy app source
COPY . .

# Expose WS port
EXPOSE 8081

ENV NODE_ENV=production

# Use pm2-runtime to run the process defined in ecosystem.config.js
CMD ["pm2-runtime", "ecosystem.config.js", "--env", "production"]
