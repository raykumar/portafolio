FROM nginx:alpine

# Copiar archivos del sitio
COPY . /usr/share/nginx/html/

# Exponer puerto 80
EXPOSE 80

# Comando por defecto
CMD ["nginx", "-g", "daemon off;"]
