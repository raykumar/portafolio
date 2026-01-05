# Guía de Despliegue - rkbe.tech

Esta guía cubre el despliegue completo del portfolio con HTTPS usando Let's Encrypt.

## 📋 Requisitos Previos

- Servidor VPS con Ubuntu/Debian (mínimo 1GB RAM)
- Dominio configurado (rkbe.tech apuntando a la IP del servidor)
- Acceso SSH al servidor
- Docker y Docker Compose instalados

## 🔍 Verificación Inicial

### 1. Verificar DNS

```bash
# Verificar que el dominio apunta a tu servidor
dig rkbe.tech +short
dig www.rkbe.tech +short

# Debe mostrar la IP de tu servidor
```

### 2. Verificar puertos abiertos

```bash
# Verificar que los puertos 80 y 443 están disponibles
sudo netstat -tlnp | grep -E '(80|443)'

# Si hay algo escuchando, detenerlo primero
```

## 🚀 Método 1: Docker + Nginx en Host (Recomendado)

Este método es el más simple y robusto para producción.

### Paso 1: Instalar dependencias en el servidor

```bash
# Actualizar sistema
sudo apt update && sudo apt upgrade -y

# Instalar Nginx
sudo apt install nginx -y

# Instalar Certbot
sudo apt install certbot python3-certbot-nginx -y

# Instalar Docker (si no está instalado)
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
```

### Paso 2: Construir y ejecutar el contenedor Docker

```bash
# Clonar el repositorio (o subir archivos)
cd /opt
sudo git clone https://github.com/raykumar/portafolio.git rkbe-portfolio
cd rkbe-portfolio

# Construir la imagen
sudo docker build -t rkbe-portfolio .

# Ejecutar el contenedor en puerto 8080 (interno)
sudo docker run -d \
  --name rkbe-portfolio \
  --restart unless-stopped \
  -p 127.0.0.1:8080:80 \
  rkbe-portfolio
```

### Paso 3: Configurar Nginx como proxy reverso

```bash
# Crear configuración de Nginx
sudo nano /etc/nginx/sites-available/rkbe.tech
```

Agregar esta configuración (SIN SSL primero):

```nginx
server {
    listen 80;
    listen [::]:80;
    server_name rkbe.tech www.rkbe.tech;

    location / {
        proxy_pass http://127.0.0.1:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

```bash
# Habilitar el sitio
sudo ln -s /etc/nginx/sites-available/rkbe.tech /etc/nginx/sites-enabled/

# Deshabilitar sitio default
sudo rm /etc/nginx/sites-enabled/default

# Verificar configuración
sudo nginx -t

# Reiniciar Nginx
sudo systemctl restart nginx
```

### Paso 4: Obtener certificado SSL con Let's Encrypt

```bash
# Obtener certificado (Certbot configurará Nginx automáticamente)
sudo certbot --nginx -d rkbe.tech -d www.rkbe.tech

# Seguir las instrucciones:
# 1. Ingresar email
# 2. Aceptar términos
# 3. Elegir redirección automática HTTP -> HTTPS (opción 2)
```

### Paso 5: Verificar renovación automática

```bash
# Probar renovación (dry-run)
sudo certbot renew --dry-run

# Verificar timer de renovación automática
sudo systemctl status certbot.timer
```

### Paso 6: Optimizar configuración de Nginx

Editar `/etc/nginx/sites-available/rkbe.tech` y agregar headers de seguridad:

```bash
sudo nano /etc/nginx/sites-available/rkbe.tech
```

Reemplazar con esta configuración optimizada:

```nginx
# Redirección HTTP a HTTPS
server {
    listen 80;
    listen [::]:80;
    server_name rkbe.tech www.rkbe.tech;

    location /.well-known/acme-challenge/ {
        root /var/www/html;
    }

    location / {
        return 301 https://$server_name$request_uri;
    }
}

# Servidor HTTPS
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name rkbe.tech www.rkbe.tech;

    # Certificados SSL (gestionados por Certbot)
    ssl_certificate /etc/letsencrypt/live/rkbe.tech/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/rkbe.tech/privkey.pem;
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;

    # Headers de Seguridad
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;
    add_header X-Frame-Options "DENY" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;

    # Proxy al contenedor Docker
    location / {
        proxy_pass http://127.0.0.1:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # Cache para assets estáticos
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
# Verificar y recargar
sudo nginx -t
sudo systemctl reload nginx
```

## 🎯 Método 2: Usando Dokploy

Si estás usando Dokploy (según conversación anterior):

### Paso 1: Verificar configuración de dominio

1. Acceder a Dokploy UI
2. Ir a tu aplicación
3. En "Domains", asegurar que esté configurado exactamente: `rkbe.tech`
4. Agregar también: `www.rkbe.tech`

### Paso 2: Forzar regeneración de certificado

```bash
# SSH al servidor Dokploy
ssh user@your-server

# Ver logs de Traefik
docker logs dokploy-traefik -f

# Buscar errores relacionados con Let's Encrypt
```

### Paso 3: Verificar DNS

El problema más común en Dokploy es DNS:

```bash
# Desde el servidor Dokploy
dig rkbe.tech @8.8.8.8 +short

# Debe mostrar la IP del servidor Dokploy
```

### Paso 4: Limpiar y regenerar

En la UI de Dokploy:
1. Eliminar el dominio actual
2. Esperar 1 minuto
3. Agregar nuevamente el dominio
4. Dokploy intentará obtener el certificado automáticamente

## ✅ Verificación Post-Despliegue

### 1. Verificar HTTPS funciona

```bash
# Probar conexión HTTPS
curl -I https://rkbe.tech

# Debe retornar HTTP/2 200
```

### 2. Verificar certificado

```bash
# Ver detalles del certificado
echo | openssl s_client -connect rkbe.tech:443 -servername rkbe.tech 2>/dev/null | openssl x509 -noout -dates -subject -issuer

# Verificar que:
# - Issuer: Let's Encrypt
# - Válido por 90 días
# - Subject: rkbe.tech
```

### 3. Verificar redirección HTTP → HTTPS

```bash
# Debe redireccionar a HTTPS
curl -I http://rkbe.tech

# Buscar: Location: https://rkbe.tech/
```

### 4. Probar en navegadores

Abrir en diferentes navegadores:
- Chrome: https://rkbe.tech
- Firefox: https://rkbe.tech
- Safari: https://rkbe.tech

**Verificar:**
- ✅ Candado verde visible
- ✅ Sin advertencias de seguridad
- ✅ Certificado válido al hacer clic en el candado

### 5. Probar con herramientas online

```bash
# SSL Labs (calificación A+ esperada)
https://www.ssllabs.com/ssltest/analyze.html?d=rkbe.tech

# Security Headers
https://securityheaders.com/?q=rkbe.tech

# Mozilla Observatory
https://observatory.mozilla.org/analyze/rkbe.tech
```

## 🔧 Mantenimiento

### Renovación de certificados

Los certificados de Let's Encrypt son válidos por 90 días.

**Renovación automática (ya configurada):**
```bash
# Verificar que el timer está activo
sudo systemctl status certbot.timer

# Ver próximas renovaciones
sudo certbot certificates
```

**Renovación manual (si es necesario):**
```bash
sudo certbot renew
sudo systemctl reload nginx
```

### Actualización del sitio

```bash
# Detener contenedor actual
sudo docker stop rkbe-portfolio
sudo docker rm rkbe-portfolio

# Actualizar código
cd /opt/rkbe-portfolio
sudo git pull

# Reconstruir y ejecutar
sudo docker build -t rkbe-portfolio .
sudo docker run -d \
  --name rkbe-portfolio \
  --restart unless-stopped \
  -p 127.0.0.1:8080:80 \
  rkbe-portfolio

# Verificar
curl -I https://rkbe.tech
```

### Monitoreo

```bash
# Ver logs de Nginx
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log

# Ver logs del contenedor
sudo docker logs -f rkbe-portfolio

# Verificar estado del contenedor
sudo docker ps | grep rkbe-portfolio
```

## 🆘 Troubleshooting

Ver [SSL-TROUBLESHOOTING.md](./SSL-TROUBLESHOOTING.md) para soluciones a problemas comunes.

## 📚 Referencias

- [Let's Encrypt Documentation](https://letsencrypt.org/docs/)
- [Certbot Documentation](https://certbot.eff.org/)
- [Nginx SSL Configuration](https://nginx.org/en/docs/http/configuring_https_servers.html)
- [Mozilla SSL Configuration Generator](https://ssl-config.mozilla.org/)
