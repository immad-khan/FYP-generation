# Use Node as base image
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package.json and install dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of the backend code
COPY . .

# Expose the port the backend runs on
EXPOSE 5000

# Start the application using server.js
CMD ["npm", "run", "dev"]
