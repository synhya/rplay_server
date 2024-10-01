FROM node:22.9.0-slim

# Install pnpm globally
RUN npm install -g pnpm

# Create app directory
WORKDIR /usr/src/app

# Copy package.json and pnpm-lock.yaml
COPY package.json pnpm-lock.yaml ./

# Install app dependencies using pnpm
RUN pnpm install

# Bundle app source
COPY . .

# Build the TypeScript files
RUN pnpm run build

# Start the app
CMD pnpm run start
