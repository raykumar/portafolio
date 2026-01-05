# Guía de Despliegue: Hostinger VPS + Dokploy + GitHub

Esta guía cubre el despliegue completo de **rkbe.tech** usando:
- 🌐 **Hostinger VPS** como servidor
- 🚀 **Dokploy** para gestión de contenedores y SSL automático
- 📦 **GitHub** como repositorio de código

## 📋 Requisitos Previos

- ✅ VPS de Hostinger activo
- ✅ Dokploy instalado en el VPS
- ✅ Dominio rkbe.tech configurado
- ✅ Repositorio GitHub del proyecto
- ✅ Acceso SSH al VPS (opcional, para troubleshooting)

## 🎯 Visión General del Proceso

```
GitHub Repository → Dokploy → Docker Container → Traefik (SSL) → Internet
                                                      ↓
                                              Let's Encrypt
```

**Dokploy se encarga automáticamente de:**
- ✅ Construir la imagen Docker desde GitHub
- ✅ Desplegar el contenedor
- ✅ Configurar Traefik como proxy reverso
- ✅ Obtener certificado SSL de Let's Encrypt
- ✅ Renovar certificados automáticamente
- ✅ Redirección HTTP → HTTPS

## 🚀 Paso 1: Preparar el Repositorio GitHub

### 1.1 Verificar archivos necesarios

Asegúrate de que tu repositorio tenga estos archivos:

```bash
# Verificar archivos localmente
ls -la

# Debes tener:
# ✅ Dockerfile
# ✅ index.html
# ✅ styles/
# ✅ scripts/
# ✅ assets/
```

### 1.2 Commit y push de cambios recientes

```bash
# Ver cambios
git status

# Agregar todos los archivos
git add .

# Commit con mensaje descriptivo
git commit -m "feat: actualizar Dockerfile para soportar HTTPS (puerto 443)"

# Push a GitHub
git push origin main
```

**Archivos importantes actualizados:**
- ✅ `Dockerfile` - Ahora expone puerto 443
- ✅ `README.md` - Documentación de seguridad
- ✅ `nginx.conf` - Configuración SSL (para referencia)
- ✅ `docker-compose.yml` - Configuración Docker

### 1.3 Verificar que el repositorio es público o configurar acceso

**Opción A: Repositorio Público (Recomendado para portfolios)**
- Ir a GitHub → Settings → General
- Scroll hasta "Danger Zone"
- "Change repository visibility" → Public

**Opción B: Repositorio Privado**
- Necesitarás configurar un Deploy Key o Personal Access Token en Dokploy
- Ver sección "Configuración de GitHub Privado" más abajo

## 🌐 Paso 2: Configurar DNS en Hostinger

### 2.1 Obtener IP del VPS

```bash
# Opción 1: Desde panel de Hostinger
# VPS → Tu VPS → Ver IP pública

# Opción 2: Desde SSH
curl ifconfig.me
```

Anota la IP, por ejemplo: `123.45.67.89`

### 2.2 Configurar registros DNS

En el panel de Hostinger:

1. **Ir a Dominios → rkbe.tech → DNS Zone**

2. **Agregar/Modificar registro A para el dominio principal:**
   ```
   Type: A
   Name: @ (o dejar vacío)
   Points to: 123.45.67.89 (IP de tu VPS)
   TTL: 14400 (o automático)
   ```

3. **Agregar/Modificar registro A para www:**
   ```
   Type: A
   Name: www
   Points to: 123.45.67.89 (IP de tu VPS)
   TTL: 14400 (o automático)
   ```

4. **Guardar cambios**

### 2.3 Verificar propagación DNS

```bash
# Verificar desde tu máquina local
dig rkbe.tech +short
dig www.rkbe.tech +short

# Debe mostrar: 123.45.67.89 (tu IP)

# Verificar desde diferentes DNS
dig @8.8.8.8 rkbe.tech +short  # Google DNS
dig @1.1.1.1 rkbe.tech +short  # Cloudflare DNS
```

**Nota:** La propagación DNS puede tomar de 5 minutos a 48 horas, pero usualmente es rápida (5-15 minutos).

## 🚀 Paso 3: Configurar Aplicación en Dokploy

### 3.1 Acceder a Dokploy

1. Abrir navegador
2. Ir a: `http://TU_IP_VPS:3000` (o el puerto que configuraste)
3. Iniciar sesión con tus credenciales

### 3.2 Crear nuevo proyecto

1. **Click en "Create Project"** o "New Project"
2. **Nombre del proyecto:** `rkbe-portfolio` (o el que prefieras)
3. **Descripción:** "Portfolio personal - rkbe.tech"
4. **Click en "Create"**

### 3.3 Crear nueva aplicación

Dentro del proyecto creado:

1. **Click en "Add Application"** o "New Application"

2. **Configuración básica:**
   ```
   Application Name: rkbe-tech
   Application Type: Docker (o Application)
   ```

3. **Source Configuration (GitHub):**
   ```
   Source Type: GitHub
   Repository: https://github.com/TU_USUARIO/portafolio
   Branch: main
   Build Path: / (raíz del repositorio)
   ```

4. **Build Configuration:**
   ```
   Build Type: Dockerfile
   Dockerfile Path: ./Dockerfile
   ```

### 3.4 Configurar dominio y SSL

En la sección de **Domains** o **Networking**:

1. **Agregar dominio principal:**
   ```
   Domain: rkbe.tech
   ✅ Generate SSL Certificate (Let's Encrypt)
   ✅ Force HTTPS
   ```

2. **Agregar dominio www (opcional pero recomendado):**
   ```
   Domain: www.rkbe.tech
   ✅ Generate SSL Certificate (Let's Encrypt)
   ✅ Force HTTPS
   ```

**Importante:** 
- ✅ Asegúrate de marcar "Generate SSL Certificate"
- ✅ Asegúrate de marcar "Force HTTPS" para redirección automática

### 3.5 Configurar puertos (si es necesario)

En la sección de **Ports** o **Network**:

```
Container Port: 80
Protocol: HTTP
```

**Nota:** Dokploy/Traefik se encarga del puerto 443 automáticamente.

### 3.6 Variables de entorno (opcional)

Si necesitas variables de entorno, agrégalas aquí:

```
TZ=America/Asuncion
```

### 3.7 Guardar y desplegar

1. **Click en "Save"** o "Update"
2. **Click en "Deploy"** o "Build & Deploy"

## ⏳ Paso 4: Monitorear el Despliegue

### 4.1 Ver logs de build

En Dokploy, ir a la pestaña **Logs** o **Build Logs**:

```
[+] Building Docker image...
[+] Copying files...
[+] Running Dockerfile...
[+] Image built successfully
[+] Deploying container...
[+] Container started
[+] Configuring Traefik...
[+] Requesting SSL certificate from Let's Encrypt...
```

**Buscar estas líneas clave:**
- ✅ "Image built successfully"
- ✅ "Container started"
- ✅ "SSL certificate obtained"

### 4.2 Verificar estado del contenedor

En la pestaña **Containers** o **Status**:

```
Status: Running ✅
Uptime: XX minutes
Restarts: 0
```

### 4.3 Ver logs del contenedor

```
[nginx] Starting nginx...
[nginx] nginx: configuration file /etc/nginx/nginx.conf test is successful
[nginx] nginx started successfully
```

## ✅ Paso 5: Verificar el Despliegue

### 5.1 Verificar HTTPS en navegador

1. **Abrir navegador**
2. **Ir a:** `https://rkbe.tech`
3. **Verificar:**
   - ✅ Sitio carga correctamente
   - ✅ Candado verde visible
   - ✅ Sin advertencias de seguridad
   - ✅ Certificado válido (click en el candado)

4. **Probar redirección HTTP → HTTPS:**
   - Ir a: `http://rkbe.tech`
   - Debe redireccionar automáticamente a `https://rkbe.tech`

### 5.2 Verificar certificado SSL

**Desde el navegador:**
1. Click en el candado 🔒
2. Click en "Certificate" o "Certificado"
3. Verificar:
   - Issued by: Let's Encrypt
   - Valid from: (fecha actual)
   - Valid to: (90 días después)
   - Subject: rkbe.tech

**Desde línea de comandos:**
```bash
# Verificar certificado
echo | openssl s_client -connect rkbe.tech:443 -servername rkbe.tech 2>/dev/null | openssl x509 -noout -text | grep -E "(Issuer|Subject|Not)"

# Debe mostrar:
# Issuer: C = US, O = Let's Encrypt
# Subject: CN = rkbe.tech
# Not Before: ...
# Not After: ...
```

### 5.3 Probar en diferentes navegadores

- ✅ Google Chrome
- ✅ Mozilla Firefox
- ✅ Safari
- ✅ Edge

### 5.4 Probar en dispositivos móviles

- ✅ Android (Chrome)
- ✅ iOS (Safari)

### 5.5 Verificar con herramientas online

**SSL Labs Test (Calificación esperada: A o A+):**
```
https://www.ssllabs.com/ssltest/analyze.html?d=rkbe.tech
```

**Security Headers:**
```
https://securityheaders.com/?q=rkbe.tech
```

**Nota:** Los headers de seguridad dependen de la configuración de Traefik en Dokploy. Si quieres mejorar la calificación, ver sección "Configuración Avanzada" más abajo.

## 🔄 Paso 6: Configurar Actualizaciones Automáticas

### 6.1 Webhook de GitHub (Recomendado)

Dokploy puede desplegar automáticamente cuando haces push a GitHub:

1. **En Dokploy, ir a tu aplicación**
2. **Buscar sección "Webhooks" o "Git Integration"**
3. **Copiar la URL del webhook**
4. **Ir a GitHub → Tu repositorio → Settings → Webhooks**
5. **Click en "Add webhook"**
6. **Configurar:**
   ```
   Payload URL: [URL del webhook de Dokploy]
   Content type: application/json
   Events: Just the push event
   ✅ Active
   ```
7. **Click en "Add webhook"**

**Ahora:** Cada vez que hagas `git push`, Dokploy desplegará automáticamente.

### 6.2 Despliegue manual

Si prefieres desplegar manualmente:

1. Hacer cambios en el código
2. `git push origin main`
3. Ir a Dokploy
4. Click en "Redeploy" o "Build & Deploy"

## 🆘 Troubleshooting: Problemas Comunes

### ❌ Problema 1: "DNS validation failed" o certificado no se genera

**Causa:** DNS no apunta correctamente al servidor.

**Solución:**

```bash
# 1. Verificar DNS desde el servidor
ssh user@TU_IP_VPS
dig rkbe.tech @8.8.8.8 +short

# Debe mostrar la IP de tu VPS

# 2. Si no coincide, revisar configuración DNS en Hostinger
# 3. Esperar 15-30 minutos para propagación
# 4. En Dokploy, eliminar el dominio y agregarlo nuevamente
```

### ❌ Problema 2: "Port 80 already in use"

**Causa:** Otro servicio está usando el puerto 80.

**Solución:**

```bash
# SSH al servidor
ssh user@TU_IP_VPS

# Ver qué está usando el puerto 80
sudo netstat -tlnp | grep :80

# Si es nginx u otro servicio, detenerlo
sudo systemctl stop nginx
sudo systemctl disable nginx

# Reiniciar Dokploy/Traefik
docker restart dokploy-traefik
```

### ❌ Problema 3: Build falla con "No such file or directory"

**Causa:** Dockerfile busca archivos que no existen en el repositorio.

**Solución:**

```bash
# Verificar que todos los archivos están en GitHub
git status
git add .
git commit -m "fix: agregar archivos faltantes"
git push origin main

# Redesplegar en Dokploy
```

### ❌ Problema 4: Sitio muestra "502 Bad Gateway"

**Causa:** El contenedor no está corriendo o no responde en el puerto correcto.

**Solución:**

```bash
# En Dokploy, ver logs del contenedor
# Buscar errores de nginx

# Verificar que el contenedor está corriendo
# En Dokploy → Containers → Status debe ser "Running"

# Si está detenido, hacer "Restart" o "Redeploy"
```

### ❌ Problema 5: Certificado SSL se genera pero navegador muestra advertencia

**Causa:** Certificado no incluye el dominio correcto.

**Solución:**

1. En Dokploy, ir a Domains
2. Eliminar el dominio actual
3. Esperar 1 minuto
4. Agregar nuevamente: `rkbe.tech` (sin www primero)
5. Esperar a que se genere el certificado
6. Luego agregar `www.rkbe.tech` como dominio adicional

### ❌ Problema 6: "Too many redirects"

**Causa:** Configuración de redirección en conflicto.

**Solución:**

1. En Dokploy, verificar que "Force HTTPS" esté marcado
2. Verificar que no hay redirecciones en el código (ya está correcto en este proyecto)
3. Limpiar caché del navegador
4. Probar en modo incógnito

## 🔧 Configuración Avanzada (Opcional)

### Agregar Headers de Seguridad en Traefik

Si quieres mejorar la calificación de seguridad:

1. **SSH al servidor:**
   ```bash
   ssh user@TU_IP_VPS
   ```

2. **Editar configuración de Traefik:**
   ```bash
   # Buscar archivo de configuración de Dokploy/Traefik
   cd /path/to/dokploy
   
   # Editar traefik.yml o dynamic config
   nano traefik/config/dynamic.yml
   ```

3. **Agregar middlewares:**
   ```yaml
   http:
     middlewares:
       security-headers:
         headers:
           stsSeconds: 31536000
           stsIncludeSubdomains: true
           stsPreload: true
           forceSTSHeader: true
           contentTypeNosniff: true
           browserXssFilter: true
           referrerPolicy: "strict-origin-when-cross-origin"
           customFrameOptionsValue: "DENY"
   ```

4. **Reiniciar Traefik:**
   ```bash
   docker restart dokploy-traefik
   ```

## 📊 Monitoreo y Mantenimiento

### Renovación de Certificados

**Dokploy/Traefik renueva automáticamente** los certificados de Let's Encrypt.

**Verificar renovación:**
- Los certificados se renuevan automáticamente 30 días antes de expirar
- Ver logs de Traefik para confirmar renovaciones exitosas

### Logs y Debugging

**Ver logs en Dokploy:**
1. Ir a tu aplicación
2. Click en "Logs"
3. Seleccionar tipo de log:
   - Build logs
   - Container logs
   - Traefik logs

**Ver logs desde SSH:**
```bash
# Logs del contenedor
docker logs rkbe-tech

# Logs de Traefik
docker logs dokploy-traefik

# Logs en tiempo real
docker logs -f rkbe-tech
```

### Actualizaciones del Sitio

**Proceso recomendado:**

1. **Hacer cambios localmente**
2. **Probar localmente:**
   ```bash
   docker build -t rkbe-test .
   docker run -p 8080:80 rkbe-test
   # Abrir http://localhost:8080
   ```
3. **Commit y push:**
   ```bash
   git add .
   git commit -m "feat: descripción del cambio"
   git push origin main
   ```
4. **Despliegue automático** (si configuraste webhook) o manual en Dokploy

## ✅ Checklist Final

Antes de considerar el despliegue completo:

- [ ] DNS apunta correctamente al VPS de Hostinger
- [ ] Código está en GitHub (repositorio público o con acceso configurado)
- [ ] Aplicación creada en Dokploy
- [ ] Dominio `rkbe.tech` configurado en Dokploy
- [ ] Dominio `www.rkbe.tech` configurado en Dokploy
- [ ] SSL habilitado ("Generate SSL Certificate" marcado)
- [ ] Force HTTPS habilitado
- [ ] Build exitoso (ver logs)
- [ ] Contenedor corriendo (Status: Running)
- [ ] Sitio accesible vía HTTPS
- [ ] Candado verde visible en navegador
- [ ] Redirección HTTP → HTTPS funciona
- [ ] Certificado válido (Let's Encrypt)
- [ ] Probado en múltiples navegadores
- [ ] Webhook de GitHub configurado (opcional)

## 📚 Recursos Adicionales

- [Documentación de Dokploy](https://docs.dokploy.com/)
- [Traefik Documentation](https://doc.traefik.io/traefik/)
- [Let's Encrypt Documentation](https://letsencrypt.org/docs/)
- [Hostinger VPS Tutorials](https://www.hostinger.com/tutorials/vps)

## 🆘 Soporte

Si encuentras problemas:

1. **Revisar logs en Dokploy**
2. **Consultar [SSL-TROUBLESHOOTING.md](./SSL-TROUBLESHOOTING.md)**
3. **Verificar DNS con `dig rkbe.tech +short`**
4. **Probar en modo incógnito del navegador**

---

**¡Listo!** Una vez completados estos pasos, tu portfolio estará desplegado con HTTPS en Hostinger usando Dokploy. 🎉
