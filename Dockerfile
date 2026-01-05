FROM nginx:alpine

# Copiar archivos del sitio
COPY . /usr/share/nginx/html/

# Nota: Para usar configuración personalizada de Nginx con SSL,
# montar nginx.conf como volumen o usar Nginx en el host como proxy reverso.
# Ver docs/DEPLOYMENT.md para más detalles.

# Exponer puertos HTTP y HTTPS
EXPOSE 80 443

CMD ["nginx", "-g", "daemon off;"]

