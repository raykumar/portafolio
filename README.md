# Portfolio - rkbe.tech

Portfolio personal de Raj Kumar Bhag Chandani Escobar, Ingeniero en Informática especializado en desarrollo de software fullstack, IoT y automatización.

## 🌐 Demo

Visita el sitio en: [rkbe.tech](https://rkbe.tech)

## 🚀 Características

- ✨ Diseño moderno y elegante con tema oscuro
- 🎨 Animaciones suaves y efectos interactivos
- 📱 Totalmente responsive (móvil, tablet, desktop)
- ⚡ Rendimiento optimizado con HTML/CSS/JavaScript puro
- 🎯 SEO optimizado con structured data (JSON-LD)
- 📧 Formulario de contacto funcional con Formspree
- 📊 Google Analytics 4 integrado
- 🖼️ Open Graph images para redes sociales
- 🔒 Headers de seguridad configurados

## 📋 Secciones

- **Hero**: Presentación principal con llamados a la acción
- **Servicios**: Propuesta, Desarrollo, Despliegue y Mantenimiento
- **Proyectos Destacados**: Neuromulti y LavApp
- **Sobre mí**: Experiencia profesional y áreas de expertise
- **Contacto**: Formulario funcional y información de contacto

## 🛠️ Tecnologías

- HTML5
- CSS3 (Custom Properties, Grid, Flexbox, Animations)
- JavaScript (ES6+, Intersection Observer API)
- Google Fonts (Inter, Space Grotesk)
- Google Analytics 4
- Formspree (formulario de contacto)

## 💻 Instalación Local

1. Clona el repositorio:
```bash
git clone https://github.com/raykumar/portafolio.git
cd portafolio
```

2. Abre el sitio localmente:

**Opción 1 - Python:**
```bash
python3 -m http.server 8000
```

**Opción 2 - Node.js:**
```bash
npx http-server
```

**Opción 3 - PHP:**
```bash
php -S localhost:8000
```

3. Abre tu navegador en `http://localhost:8000`

## 📁 Estructura del Proyecto

```
portafolio/
├── index.html          # Página principal
├── robots.txt          # Instrucciones para crawlers
├── sitemap.xml         # Mapa del sitio para SEO
├── assets/
│   ├── favicon.svg     # Favicon vectorial
│   └── images/
│       ├── favicon.png # Favicon PNG
│       └── og-image.png # Open Graph image (1200x630)
├── styles/
│   ├── main.css       # Estilos principales y sistema de diseño
│   └── animations.css # Animaciones y efectos
└── scripts/
    └── main.js        # Funcionalidad interactiva
```

## 🎨 Personalización

El sitio utiliza CSS Custom Properties para facilitar la personalización. Puedes modificar los colores, tipografía y espaciado en `styles/main.css`:

```css
:root {
  --color-accent-primary: #3b82f6;
  --color-accent-secondary: #8b5cf6;
  --font-primary: 'Inter', sans-serif;
  /* ... más variables */
}
```

## 🚀 Despliegue

> [!WARNING]
> **Importante para Producción:** Este proyecto requiere configuración SSL/HTTPS para evitar advertencias de "sitio no seguro" en navegadores. El Dockerfile base solo expone puerto 80 (HTTP).

### 🎯 Despliegue en Hostinger VPS con Dokploy (Recomendado)

Este proyecto está configurado para desplegarse en **Hostinger VPS** usando **Dokploy** y **GitHub**.

**Guía rápida (20 minutos):**

📖 **[Guía Rápida de Dokploy](docs/QUICK-START-DOKPLOY.md)** ⚡

**Guía completa paso a paso:**

📖 **[Guía Completa de Despliegue con Dokploy](docs/DOKPLOY-DEPLOYMENT.md)**

**Pasos resumidos:**
1. Subir código a GitHub
2. Configurar DNS en Hostinger (apuntar a IP del VPS)
3. Crear aplicación en Dokploy
4. Configurar dominios `rkbe.tech` y `www.rkbe.tech` con SSL
5. Deploy automático

**Resultado:** HTTPS automático con Let's Encrypt, sin configuración manual de certificados.

---

### Despliegue en Producción con HTTPS (Otros métodos)

Para otros métodos de despliegue con certificado SSL de Let's Encrypt:

📖 **[Guía de Despliegue Completa](docs/DEPLOYMENT.md)**

Esta guía incluye:
- Configuración de Nginx con SSL
- Obtención de certificados Let's Encrypt
- Configuración de renovación automática
- Headers de seguridad
- Troubleshooting

### Método Rápido: Docker + Nginx en Host

```bash
# 1. Construir y ejecutar el contenedor
docker-compose up -d

# 2. Configurar Nginx en el host como proxy reverso
# Ver docs/DEPLOYMENT.md para configuración detallada

# 3. Obtener certificado SSL
sudo certbot --nginx -d rkbe.tech -d www.rkbe.tech
```

### Despliegue Local (Desarrollo)

Para desarrollo local sin SSL:

```bash
# Opción 1: Docker Compose
docker-compose up

# Opción 2: Docker directo
docker build -t rkbe-portfolio .
docker run -p 80:80 rkbe-portfolio

# Opción 3: Servidor simple
python3 -m http.server 8000
```

### VPS con Nginx

Para configuración manual en VPS:

1. Subir archivos al servidor:
```bash
rsync -avz --progress ./ user@vps-ip:/var/www/rkbe.tech/
```

2. Configurar Nginx y SSL:
```bash
# Copiar configuración de Nginx
sudo cp nginx.conf /etc/nginx/sites-available/rkbe.tech
sudo ln -s /etc/nginx/sites-available/rkbe.tech /etc/nginx/sites-enabled/

# Obtener certificado SSL
sudo certbot --nginx -d rkbe.tech -d www.rkbe.tech
```

Ver [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) para instrucciones completas.


## 🔒 Seguridad

El sitio implementa las siguientes medidas de seguridad cuando se despliega correctamente:

- ✅ HTTPS con certificados Let's Encrypt
- ✅ HSTS (HTTP Strict Transport Security)
- ✅ Content Security Policy (CSP)
- ✅ X-Frame-Options (protección contra clickjacking)
- ✅ X-Content-Type-Options (prevención de MIME sniffing)
- ✅ Referrer Policy
- ✅ TLS 1.2+ únicamente

**Nota:** Estas configuraciones requieren el uso del archivo `nginx.conf` incluido.

## 🆘 Troubleshooting

Si experimentas problemas con certificados SSL o el mensaje "sitio no seguro":

📖 **[Guía de Troubleshooting SSL](docs/SSL-TROUBLESHOOTING.md)**

Problemas comunes cubiertos:
- Certificado inválido o expirado
- Error de validación DNS
- Demasiadas redirecciones
- Puerto 443 no responde
- Renovación automática no funciona


## 📊 SEO y Analytics

- **Google Analytics 4**: Configurado con ID `G-QXVQTBHVCL`
- **Structured Data**: Schema.org Person implementado
- **Sitemap**: `/sitemap.xml`
- **Robots.txt**: `/robots.txt`
- **Open Graph**: Meta tags completos para redes sociales

## 📞 Contacto

- **Email**: rkbe.tech@gmail.com
- **LinkedIn**: [Raj Kumar Bhag](https://www.linkedin.com/in/raj-kumar-bhag-chandani-escobar-0b6072118/)
- **GitHub**: [rajkumarbhag](https://github.com/rajkumarbhag)
- **Ubicación**: Ciudad del Este, Paraguay

## 📄 Licencia

© 2026 Raj Kumar Bhag. Todos los derechos reservados.

---

Desarrollado con ❤️ por Raj Kumar Bhag
