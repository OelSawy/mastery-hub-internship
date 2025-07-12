# Use Node image
FROM node:18

# Set working dir
WORKDIR /app

# Copy package.json and install deps
COPY package.json package-lock.json ./
RUN npm install

# Copy source code
COPY ./backend .

# Expose the port defined in .env
EXPOSE 5000

# Run server (for production you can replace with node server.js)
CMD ["npm", "run", "dev"]
