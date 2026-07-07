### Stage 1: Build
FROM node:22-alpine AS builder
WORKDIR /usr/src/app
# Copy package files
COPY package*.json ./
# Install all dependencies
RUN npm install
# Copy all source files including Prisma schema
COPY . .
# Build the application (this runs db:generate && nest build)
RUN npm run build

### Stage 2: Production
FROM node:22-alpine
WORKDIR /usr/src/app
# Copy package files
COPY package*.json ./
# Install production dependencies
RUN npm install --production
# Copy built application
COPY --from=builder /usr/src/app/dist ./dist
# Expose port
EXPOSE 3000
# Start application
CMD ["node", "dist/main.js"]