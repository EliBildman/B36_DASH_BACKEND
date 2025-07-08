# Step 1: Build Stage
FROM node:18-slim AS builder

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install

COPY . .

RUN npm run build

# Step 2: Run Stage
FROM node:18-slim

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm ci --only=production

COPY --from=builder /usr/src/app/build ./build
COPY --from=builder /usr/src/app/static ./static
# COPY --from=builder /usr/src/app/ssl ./ssl

EXPOSE 4000

CMD ["node", "build/source/server.js"]