FROM node:20 as build
ENV NODE_ENV=development

WORKDIR /opt/app/

# Диагностика npm конфигурации
RUN echo "Current npm registry:" && npm config get registry
RUN npm config delete registry
RUN npm config set registry=https://registry.npmjs.org/

COPY package*.json ./
RUN npm ci 
COPY . .
RUN npm run build

FROM node:20-slim
ENV NODE_ENV=production

WORKDIR /opt/app
COPY package*.json ./

# Принудительная очистка и установка
RUN npm cache clean --force
RUN npm config delete registry
RUN npm config set registry=https://registry.npmjs.org/
RUN npm ci --only=production

COPY --from=build /opt/app/dist ./dist
CMD ["npm", "run", "start:prod"]