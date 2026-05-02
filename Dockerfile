# Dockerfile для Render (сервер)
FROM node:20-alpine

WORKDIR /app

# Устанавливаем openssl для Prisma
RUN apk add --no-cache openssl

# Копируем зависимости
COPY server/package*.json ./
RUN npm ci

# Копируем исходники
COPY server/ .

# Генерируем Prisma client + компилируем TS
RUN npx prisma generate
RUN npm run build

# Порт
EXPOSE 4000

# Запуск
CMD ["node", "dist/index.js"]
