# 🚀 Guía Rápida: Despliegue en Hostinger con Dokploy

Esta es una guía rápida para desplegar **rkbe.tech** en Hostinger VPS usando Dokploy.

## ⚡ Pasos Rápidos

### 1️⃣ Preparar GitHub (2 minutos)

```bash
# Asegurarte de que todos los cambios están en GitHub
git add .
git commit -m "feat: preparar para despliegue en Dokploy"
git push origin main
```

### 2️⃣ Configurar DNS en Hostinger (5 minutos)

1. **Panel de Hostinger → Dominios → rkbe.tech → DNS Zone**
2. **Agregar/Modificar registros A:**
   - `@` → IP de tu VPS
   - `www` → IP de tu VPS
3. **Guardar**

**Verificar:**
```bash
dig rkbe.tech +short
# Debe mostrar la IP de tu VPS
```

### 3️⃣ Crear Aplicación en Dokploy (10 minutos)

1. **Acceder a Dokploy:** `http://TU_IP_VPS:3000`

2. **Crear Proyecto:**
   - Nombre: `rkbe-portfolio`
   - Click "Create"

3. **Agregar Aplicación:**
   - Nombre: `rkbe-tech`
   - Tipo: Docker
   - Source: GitHub
   - Repository: `https://github.com/TU_USUARIO/portafolio`
   - Branch: `main`
   - Dockerfile: `./Dockerfile`

4. **Configurar Dominios:**
   - Dominio 1: `rkbe.tech`
     - ✅ Generate SSL Certificate
     - ✅ Force HTTPS
   - Dominio 2: `www.rkbe.tech`
     - ✅ Generate SSL Certificate
     - ✅ Force HTTPS

5. **Click "Deploy"**

### 4️⃣ Verificar (2 minutos)

1. **Esperar el build** (ver logs en Dokploy)
2. **Abrir:** `https://rkbe.tech`
3. **Verificar:**
   - ✅ Sitio carga
   - ✅ Candado verde
   - ✅ Sin advertencias

## ✅ Checklist Rápido

- [ ] Código en GitHub
- [ ] DNS apunta al VPS
- [ ] Aplicación creada en Dokploy
- [ ] Dominios configurados con SSL
- [ ] Build exitoso
- [ ] Sitio accesible con HTTPS

## 🆘 Problemas Comunes

### ❌ Certificado SSL no se genera

**Solución:**
```bash
# Verificar DNS
dig rkbe.tech @8.8.8.8 +short

# Debe mostrar la IP de tu VPS
# Si no, esperar 15 minutos y reintentar
```

### ❌ Build falla

**Solución:**
- Ver logs en Dokploy
- Verificar que `Dockerfile` existe en GitHub
- Verificar que todos los archivos están en GitHub

### ❌ 502 Bad Gateway

**Solución:**
- En Dokploy, verificar que el contenedor está "Running"
- Click en "Restart" si está detenido

## 📚 Documentación Completa

Para más detalles, ver:
- **[DOKPLOY-DEPLOYMENT.md](./DOKPLOY-DEPLOYMENT.md)** - Guía completa paso a paso
- **[SSL-TROUBLESHOOTING.md](./SSL-TROUBLESHOOTING.md)** - Solución de problemas SSL

## 🎯 Resultado Esperado

Una vez completado:
- ✅ `https://rkbe.tech` funciona con HTTPS
- ✅ `https://www.rkbe.tech` funciona con HTTPS
- ✅ Redirección automática HTTP → HTTPS
- ✅ Certificado SSL válido de Let's Encrypt
- ✅ Renovación automática de certificados
- ✅ Sin mensaje de "sitio no seguro"

---

**Tiempo total estimado:** ~20 minutos
