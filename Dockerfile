# Используем образ node версии 20 как базовый для этапа сборки
FROM node:20 as build

# Устанавливаем переменную окружения NODE_ENV
ENV NODE_ENV=production

# Устанавливаем рабочую директорию в контейнере
WORKDIR /opt/app/

# Копируем файлы package.json и package-lock.json (если есть)
COPY package*.json ./

# Устанавливаем все зависимости, включая devDependencies
RUN npm ci

# Устанавливаем NestJS CLI глобально
RUN npm install -g @nestjs/cli

# Копируем остальные файлы проекта
COPY . .

# Собираем приложение
RUN npm run build

# Используем образ node версии 20 как базовый для финального этапа
FROM node:20-slim as production

# Устанавливаем переменную окружения NODE_ENV
ENV NODE_ENV=production
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/google-chrome-stable

# Установка необходимых зависимостей для Chrome и Puppeteer
RUN apt-get update \
    && apt-get install -y wget gnupg \
    && wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | gpg --dearmor -o /usr/share/keyrings/googlechrome-linux-keyring.gpg \
    && sh -c 'echo "deb [arch=amd64 signed-by=/usr/share/keyrings/googlechrome-linux-keyring.gpg] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list' \
    && apt-get update \
    && apt-get install -y google-chrome-stable fonts-ipafont-gothic fonts-wqy-zenhei fonts-thai-tlwg fonts-khmeros fonts-kacst fonts-freefont-ttf libxss1 \
      --no-install-recommends \
    && apt-get install -y \
        libglib2.0-0 \
        libnss3 \
        libatk1.0-0 \
        libatk-bridge2.0-0 \
        libcups2 \
        libdrm2 \
        libxkbcommon0 \
        libxcomposite1 \
        libxdamage1 \
        libxfixes3 \
        libxrandr2 \
        libgbm1 \
        libpango-1.0-0 \
        libcairo2 \
        libasound2 \
    && rm -rf /var/lib/apt/lists/*

# Устанавливаем рабочую директорию в контейнере
WORKDIR /opt/app

# Копируем файлы package.json и package-lock.json
COPY package*.json ./

# Устанавливаем только production зависимости
RUN npm ci --only=production

# Копируем собранное приложение из build stage
COPY --from=build /opt/app/dist ./dist

# Создаем папку envs и копируем в нее .env.production
COPY --from=build /opt/app/envs/.env.production ./envs/.env.production

# Запускаем приложение
CMD ["node", "dist/main"]