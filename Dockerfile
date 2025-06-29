# Use Node.js 20 Alpine as the build image
FROM node:20-alpine AS builder
WORKDIR /app

# Copy package files and install dependencies
COPY package.json package-lock.json* ./
RUN npm ci

# Copy the rest of the application source code
COPY . .

# Set environment variables for build-time and runtime configuration
ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

ARG TURSO_DATABASE_URL
ENV TURSO_DATABASE_URL=${TURSO_DATABASE_URL}

ARG TURSO_AUTH_TOKEN
ENV TURSO_AUTH_TOKEN=${TURSO_AUTH_TOKEN}

ARG OPENAI_API_KEY
ENV OPENAI_API_KEY=${OPENAI_API_KEY}    

# Build the application
RUN npm run build

# Use a fresh Node.js 20 Alpine image for running the app
FROM node:20-alpine AS runner
WORKDIR /app

# Copy built files and dependencies from the builder stage
COPY --from=builder ./app ./

# Expose the application port
EXPOSE 3000

# Start the application using ts-node with ESM loader
CMD ["npm", "run", "start"]