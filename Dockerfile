# Dockerfile for Render
FROM node:20-alpine

# Install openssl for Prisma
RUN apk add --no-cache openssl

WORKDIR /app

# Copy server dependencies
COPY server/package.json server/package-lock.json ./
RUN npm ci

# Copy Prisma schema
COPY server/prisma ./prisma/
RUN npx prisma generate

# Copy server source
COPY server/tsconfig.json server/src ./src/
RUN npm run build

EXPOSE 4000

CMD ["node", "dist/index.js"]
