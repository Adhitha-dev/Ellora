# Production Dockerfile for Ellora Web Application
FROM node:20-alpine

# Set working directory
WORKDIR /usr/src/app

# Install app dependencies
COPY package*.json ./
RUN npm ci --only=production

# Bundle app source
COPY . .

# Expose default application port
EXPOSE 3000

# Set environment to production
ENV NODE_ENV=production

# Run the web service
CMD ["node", "index.js"]
