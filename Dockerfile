# Etapa de build
FROM node:18 AS build

WORKDIR /app

# Copiar dependencias primero para aprovechar caché
COPY package*.json ./
RUN npm install

# Copiar todo el código fuente
COPY . .

# Build de la aplicación
RUN npm run build

# Etapa de producción
FROM node:18-alpine

WORKDIR /app

# Copiar la app ya compilada
COPY --from=build /app/dist ./dist

# Instalar un servidor estático ligero
RUN npm install -g serve

# Railway usará este puerto
EXPOSE 3000

# Comando de arranque
CMD ["serve", "-s", "dist", "-l", "3000"]

