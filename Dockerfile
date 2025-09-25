# Etapa 1: Construcción con Node
FROM node:18-alpine AS build

WORKDIR /app

# Copiar dependencias
COPY package*.json ./
RUN npm install

# Copiar el código fuente
COPY . .

# Construir la app
RUN npm run build

# Etapa 2: Servir con Nginx
FROM nginx:alpine

# Copiar la build a la carpeta pública de Nginx
COPY --from=build /app/dist /usr/share/nginx/html

# Configuración de Nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
