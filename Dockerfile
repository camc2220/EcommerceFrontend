# ----------------------
# 1. Build Stage
# ----------------------
FROM node:20-alpine AS build

WORKDIR /app

# Copiamos package.json y package-lock.json primero para aprovechar cache
COPY package*.json ./

# Instalamos dependencias
RUN npm install

# Copiamos el resto del código
COPY . .

# Construimos la aplicación (Vite → carpeta dist/)
RUN npm run build

# ----------------------
# 2. Serve Stage
# ----------------------
FROM nginx:stable-alpine

# Copiamos la build de Vite al directorio que Nginx sirve por defecto
COPY --from=build /app/dist /usr/share/nginx/html

# Copiamos configuración personalizada de Nginx (para React Router)
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
