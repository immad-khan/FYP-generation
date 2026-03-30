# Use Node as base image
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package.json and install dependencies
COPY package*.json ./

# Try normal install first, fallback to legacy if needed
RUN npm install --legacy-peer-deps

# Copy the rest of the frontend code
COPY . .

# Expose the port the app runs on
EXPOSE 3000

# Start the application
CMD ["npm", "start"]
