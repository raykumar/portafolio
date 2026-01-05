# Guía de Troubleshooting SSL - rkbe.tech

Esta guía cubre los problemas más comunes relacionados con certificados SSL y sus soluciones.

## 🔍 Diagnóstico Rápido

### Comandos de diagnóstico esenciales

```bash
# 1. Verificar DNS
dig rkbe.tech +short
nslookup rkbe.tech

# 2. Verificar puertos abiertos
nmap -p 80,443 rkbe.tech
sudo netstat -tlnp | grep -E '(80|443)'

# 3. Verificar certificado actual
echo | openssl s_client -connect rkbe.tech:443 -servername rkbe.tech 2>/dev/null | openssl x509 -noout -text

# 4. Probar conexión HTTPS
curl -vI https://rkbe.tech

# 5. Ver logs de Nginx
sudo tail -50 /var/log/nginx/error.log
```

## ❌ Problema 1: "Sitio no seguro" / "NET::ERR_CERT_AUTHORITY_INVALID"

### Síntomas
- Navegador muestra advertencia de seguridad
- Certificado autofirmado o inválido
- Error: "La conexión no es privada"

### Causas posibles

#### A) No hay certificado SSL instalado

**Verificar:**
```bash
sudo ls -la /etc/letsencrypt/live/rkbe.tech/
```

**Solución:**
```bash
# Obtener certificado con Certbot
sudo certbot --nginx -d rkbe.tech -d www.rkbe.tech

# Verificar instalación
sudo certbot certificates
```

#### B) Certificado expirado

**Verificar:**
```bash
echo | openssl s_client -connect rkbe.tech:443 -servername rkbe.tech 2>/dev/null | openssl x509 -noout -dates
```

**Solución:**
```bash
# Renovar certificado
sudo certbot renew --force-renewal

# Recargar Nginx
sudo systemctl reload nginx
```

#### C) Nginx no está usando el certificado

**Verificar configuración:**
```bash
sudo nginx -T | grep ssl_certificate
```

**Solución:**
```bash
# Editar configuración
sudo nano /etc/nginx/sites-available/rkbe.tech

# Asegurar que estas líneas existen:
ssl_certificate /etc/letsencrypt/live/rkbe.tech/fullchain.pem;
ssl_certificate_key /etc/letsencrypt/live/rkbe.tech/privkey.pem;

# Verificar y recargar
sudo nginx -t
sudo systemctl reload nginx
```

## ❌ Problema 2: Error de validación DNS (Dokploy/Let's Encrypt)

### Síntomas
- Let's Encrypt no puede validar el dominio
- Error: "DNS problem: NXDOMAIN looking up A for rkbe.tech"
- Certificado no se genera en Dokploy

### Causas posibles

#### A) DNS no apunta al servidor correcto

**Verificar:**
```bash
# Desde cualquier máquina
dig rkbe.tech @8.8.8.8 +short

# Debe mostrar la IP de tu servidor
```

**Solución:**
1. Ir al panel de tu proveedor de DNS
2. Verificar registro A:
   - Host: `@` o `rkbe.tech`
   - Tipo: `A`
   - Valor: IP del servidor
   - TTL: 300 (o automático)
3. Verificar registro A para www:
   - Host: `www`
   - Tipo: `A` o `CNAME`
   - Valor: IP del servidor o `rkbe.tech`
4. Esperar propagación DNS (puede tomar hasta 48h, usualmente 5-10 min)

**Verificar propagación:**
```bash
# Verificar desde múltiples DNS
dig rkbe.tech @8.8.8.8 +short  # Google DNS
dig rkbe.tech @1.1.1.1 +short  # Cloudflare DNS
dig rkbe.tech @208.67.222.222 +short  # OpenDNS
```

#### B) Firewall bloqueando puerto 80

Let's Encrypt necesita acceso al puerto 80 para validación HTTP-01.

**Verificar:**
```bash
# Verificar firewall
sudo ufw status

# Verificar que puerto 80 está abierto
sudo netstat -tlnp | grep :80
```

**Solución:**
```bash
# Abrir puertos necesarios
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw reload
```

#### C) Proxy/CDN interfiriendo (Cloudflare, etc.)

**Verificar:**
```bash
# Ver si hay proxy intermedio
dig rkbe.tech +short

# Si la IP no es la de tu servidor, hay un proxy
```

**Solución:**
Si usas Cloudflare:
1. Ir a Cloudflare Dashboard
2. En DNS, hacer clic en la nube naranja (debe quedar gris)
3. Esperar 5 minutos
4. Intentar obtener certificado nuevamente
5. Después de obtener el certificado, puedes reactivar el proxy

## ❌ Problema 3: "Too many redirects" / ERR_TOO_MANY_REDIRECTS

### Síntomas
- Navegador muestra "Esta página no funciona"
- Error: "ERR_TOO_MANY_REDIRECTS"
- Loop infinito de redirecciones

### Causa
Configuración incorrecta de redirección HTTP → HTTPS cuando hay múltiples capas de proxy.

**Solución:**

Si usas Nginx + Docker:
```nginx
# En /etc/nginx/sites-available/rkbe.tech
server {
    listen 443 ssl http2;
    server_name rkbe.tech www.rkbe.tech;
    
    # ... certificados SSL ...
    
    location / {
        proxy_pass http://127.0.0.1:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;  # ← IMPORTANTE
        
        # NO agregar redirecciones aquí
    }
}
```

Si usas Cloudflare:
1. En Cloudflare → SSL/TLS
2. Cambiar modo a "Full" o "Full (strict)"
3. NO usar "Flexible"

## ❌ Problema 4: Puerto 443 no responde

### Síntomas
- `curl https://rkbe.tech` timeout
- Puerto 443 no accesible
- `nmap` muestra puerto 443 cerrado

### Verificar

```bash
# Verificar que Nginx escucha en 443
sudo netstat -tlnp | grep :443

# Verificar configuración de Nginx
sudo nginx -T | grep "listen.*443"

# Verificar firewall
sudo ufw status | grep 443
```

### Solución

```bash
# 1. Verificar que Nginx tiene configuración SSL
sudo nano /etc/nginx/sites-available/rkbe.tech

# Debe tener:
listen 443 ssl http2;
listen [::]:443 ssl http2;

# 2. Verificar certificados existen
sudo ls -la /etc/letsencrypt/live/rkbe.tech/

# 3. Abrir puerto en firewall
sudo ufw allow 443/tcp
sudo ufw reload

# 4. Reiniciar Nginx
sudo systemctl restart nginx

# 5. Verificar
sudo netstat -tlnp | grep :443
```

## ❌ Problema 5: Certificado válido pero navegador muestra advertencia

### Síntomas
- Certificado es válido según `openssl`
- Navegador aún muestra advertencia
- Error: "NET::ERR_CERT_COMMON_NAME_INVALID"

### Causa
El certificado no incluye el dominio que estás visitando.

**Verificar:**
```bash
echo | openssl s_client -connect rkbe.tech:443 -servername rkbe.tech 2>/dev/null | openssl x509 -noout -text | grep DNS
```

Debe mostrar:
```
DNS:rkbe.tech, DNS:www.rkbe.tech
```

**Solución:**
```bash
# Obtener nuevo certificado con ambos dominios
sudo certbot certonly --nginx -d rkbe.tech -d www.rkbe.tech --force-renewal

# Recargar Nginx
sudo systemctl reload nginx
```

## ❌ Problema 6: Renovación automática no funciona

### Síntomas
- Certificado expira
- Certbot timer no está activo
- Renovación manual funciona pero automática no

### Verificar

```bash
# Verificar timer
sudo systemctl status certbot.timer

# Verificar próximas renovaciones
sudo certbot certificates

# Probar renovación
sudo certbot renew --dry-run
```

### Solución

```bash
# Habilitar timer
sudo systemctl enable certbot.timer
sudo systemctl start certbot.timer

# Verificar que está activo
sudo systemctl status certbot.timer

# Ver logs
sudo journalctl -u certbot.timer
```

## ❌ Problema 7: Mixed Content (contenido mixto)

### Síntomas
- Sitio carga con HTTPS pero algunos recursos no
- Advertencia en consola del navegador
- Candado con advertencia

### Verificar

Abrir consola del navegador (F12) y buscar:
```
Mixed Content: The page at 'https://rkbe.tech' was loaded over HTTPS, 
but requested an insecure resource 'http://...'
```

### Solución

```bash
# Buscar referencias HTTP en el código
cd /opt/rkbe-portfolio
grep -r "http://" --include="*.html" --include="*.css" --include="*.js"

# Reemplazar todas las referencias HTTP por HTTPS o rutas relativas
```

En el caso de rkbe.tech, ya está correcto (todas las referencias usan HTTPS).

## 🔧 Comandos Útiles de Diagnóstico

### Ver configuración completa de Nginx
```bash
sudo nginx -T
```

### Ver todos los certificados instalados
```bash
sudo certbot certificates
```

### Verificar sintaxis de Nginx
```bash
sudo nginx -t
```

### Ver logs en tiempo real
```bash
# Nginx access log
sudo tail -f /var/log/nginx/access.log

# Nginx error log
sudo tail -f /var/log/nginx/error.log

# Certbot logs
sudo tail -f /var/log/letsencrypt/letsencrypt.log
```

### Probar conexión SSL detallada
```bash
openssl s_client -connect rkbe.tech:443 -servername rkbe.tech -showcerts
```

### Verificar cadena de certificados
```bash
openssl verify -CAfile /etc/letsencrypt/live/rkbe.tech/chain.pem /etc/letsencrypt/live/rkbe.tech/cert.pem
```

## 📞 Cuando todo lo demás falla

### Opción 1: Reinstalar certificado desde cero

```bash
# 1. Eliminar certificado actual
sudo certbot delete --cert-name rkbe.tech

# 2. Limpiar configuración de Nginx
sudo nano /etc/nginx/sites-available/rkbe.tech
# Eliminar todas las líneas ssl_*

# 3. Recargar Nginx
sudo nginx -t
sudo systemctl reload nginx

# 4. Obtener nuevo certificado
sudo certbot --nginx -d rkbe.tech -d www.rkbe.tech

# 5. Verificar
curl -I https://rkbe.tech
```

### Opción 2: Usar certificado manual (webroot)

```bash
# 1. Obtener certificado con método webroot
sudo certbot certonly --webroot -w /var/www/html -d rkbe.tech -d www.rkbe.tech

# 2. Configurar Nginx manualmente
sudo nano /etc/nginx/sites-available/rkbe.tech

# Agregar:
ssl_certificate /etc/letsencrypt/live/rkbe.tech/fullchain.pem;
ssl_certificate_key /etc/letsencrypt/live/rkbe.tech/privkey.pem;

# 3. Recargar
sudo nginx -t
sudo systemctl reload nginx
```

## 📚 Recursos Adicionales

- [Let's Encrypt Community](https://community.letsencrypt.org/)
- [Certbot Documentation](https://eff-certbot.readthedocs.io/)
- [SSL Labs Test](https://www.ssllabs.com/ssltest/)
- [Why No Padlock?](https://www.whynopadlock.com/)

## 🆘 Contacto de Soporte

Si ninguna de estas soluciones funciona, proporciona la siguiente información:

```bash
# Ejecutar estos comandos y compartir el output:

# 1. Verificar DNS
dig rkbe.tech +short

# 2. Verificar certificados
sudo certbot certificates

# 3. Verificar Nginx
sudo nginx -T | grep -A 20 "server_name rkbe.tech"

# 4. Ver logs recientes
sudo tail -50 /var/log/nginx/error.log
sudo tail -50 /var/log/letsencrypt/letsencrypt.log

# 5. Probar conexión
curl -vI https://rkbe.tech 2>&1 | head -30
```
