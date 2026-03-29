# 🚀 Manufacturing Test Monitoring System - Deployment Guide

Guía completa para desplegar la aplicación en GitHub Pages (frontend) y Render (backend).

## 📋 Checklist Pre-Deployment

### ✅ Verificaciones Previas

- [ ] Código probado localmente sin errores
- [ ] Variables de entorno documentadas en `.env.example`
- [ ] CSS optimizado y bundleado correctamente
- [ ] CORS configurado para dominios de producción
- [ ] Base de datos MongoDB Atlas configurada
- [ ] JWT secrets generados de forma segura

---

## 🎯 Frontend Deployment - GitHub Pages

### 📦 Pre-requisitos

- Cuenta de GitHub
- Repositorio público con el código
- Node.js 18+ instalado localmente

### 🔧 Configuración Inicial

#### 1. Verificar Configuración de Vite

Confirma que `vite.config.js` tenga la configuración correcta:

```javascript
export default defineConfig({
  plugins: [react()],
  base: "/manufacturing_test_monitoring_system/", // Nombre de tu repo
  build: {
    outDir: "dist", // GitHub Pages busca en 'dist'
    sourcemap: false, // Opcional: deshabilitar sourcemaps en producción
  },
});
```

#### 2. Verificar package.json Scripts

Asegúrate de tener los scripts de build:

```json
{
  "scripts": {
    "build": "vite build",
    "preview": "vite preview"
  }
}
```

#### 3. Build y Test Local

```bash
cd frontend
npm run build
npm run preview
```

Verifica que funcione en `http://localhost:4173/manufacturing_test_monitoring_system/`

### 🚀 Deployment Steps

#### Opción A: GitHub Actions (Recomendado - Automático)

1. **Crear archivo de workflow**

```bash
mkdir -p .github/workflows
```

2. **Crear `.github/workflows/deploy.yml`:**

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: "pages"
  cancel-in-progress: false

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: "18"
          cache: "npm"
          cache-dependency-path: ./frontend/package-lock.json

      - name: Setup Pages
        uses: actions/configure-pages@v4

      - name: Install dependencies
        working-directory: ./frontend
        run: npm ci

      - name: Build
        working-directory: ./frontend
        run: npm run build

      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: ./frontend/dist

  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    needs: build
    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

3. **Configurar GitHub Pages:**
   - Ve a repositorio > Settings > Pages
   - Source: "GitHub Actions"
   - Save

4. **Push y Deploy:**

```bash
git add .
git commit -m "feat: setup GitHub Actions deployment"
git push origin main
```

#### Opción B: Manual Deploy

1. **Build local:**

```bash
cd frontend
npm run build
```

2. **Deploy con gh-pages:**

```bash
npm install -g gh-pages
cd frontend
npx gh-pages -d dist
```

### ✅ Verificación Frontend

- [ ] Build exitoso sin errores
- [ ] Página accesible en `https://tu-username.github.io/manufacturing_test_monitoring_system/`
- [ ] CSS carga correctamente
- [ ] Rutas funcionan (no 404 en refresh)
- [ ] CORS errors visibles en console (esperado hasta configurar backend)

---

## ☁️ Backend Deployment - Render

### 📦 Pre-requisitos

- Cuenta en [Render](https://render.com)
- Cuenta en [MongoDB Atlas](https://www.mongodb.com/atlas)
- JWT secret generado securely

### 🗄️ MongoDB Atlas Setup

#### 1. Crear Cluster (Free Tier)

1. Registrarse en MongoDB Atlas
2. Create New Project: "Manufacturing Monitoring"
3. Create Cluster (M0 Free tier)
4. Cluster Name: "manufacturing-cluster"

#### 2. Configurar Security

1. **Database Access:**
   - Add Database User
   - Username: `api-user`
   - Password: genera uno seguro
   - Database User Privileges: "Atlas admin"

2. **Network Access:**
   - Add IP Address: `0.0.0.0/0` (Allow access from anywhere)
   - Comment: "Render deployment"

#### 3. Obtener Connection String

1. Cluster > Connect > "Drivers"
2. Driver: Node.js
3. Copiar connection string:

```
mongodb+srv://api-user:<password>@manufacturing-cluster.xxxxx.mongodb.net/?retryWrites=true&w=majority
```

### 🔐 Secrets y Variables

#### 1. Generar JWT Secret

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

#### 2. Preparar Variables de Entorno

Basándote en `.env.example`, prepara estos valores:

```env
NODE_ENV=production
PORT=10000
MONGODB_URI=mongodb+srv://USERNAME:PASSWORD@CLUSTER.mongodb.net/DATABASE_NAME?retryWrites=true&w=majority
JWT_SECRET=GENERATE_SECURE_SECRET_HERE
JWT_EXPIRES_IN=7d
FRONTEND_URL=https://YOUR_USERNAME.github.io/manufacturing_test_monitoring_system
ALLOWED_ORIGINS=https://YOUR_USERNAME.github.io,http://localhost:5173
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

**⚠️ IMPORTANTE**: Reemplaza todos los valores en MAYÚSCULAS con tus credenciales reales en Render.
**NUNCA** commitees archivos `.env` con credenciales reales.

### 🚀 Render Deployment

#### 1. Crear Web Service

1. Ir a [Render Dashboard](https://dashboard.render.com)
2. "New" > "Web Service"
3. Connect Repository o "Public Git repository"
4. Repository URL: `https://github.com/tu-username/manufacturing_test_monitoring_system`

#### 2. Configurar Service

```
Name: manufacturing-test-api
Environment: Node
Region: Oregon (US West)
Branch: main
Root Directory: backend
Build Command: npm install
Start Command: node server.js
```

#### 3. Configurar Variables de Entorno

En Render > Environment:

- Agregar todas las variables del paso anterior
- ⚠️ **NUNCA** commitear archivos `.env` reales

#### 4. Configurar Advanced Settings

```
Health Check Path: /health
Auto-Deploy: Yes (recomendado)
```

### ✅ Verificación Backend

- [ ] Build successful en Render
- [ ] Health check `/health` responde 200
- [ ] Logs sin errores de conexión a MongoDB
- [ ] CORS configurado correctamente

---

## 🔗 Integration Testing

### 🧪 Conectar Frontend con Backend

#### 1. Actualizar API Base URL

En `frontend/src/services/api.js`, verifica:

```javascript
const API_BASE_URL =
  import.meta.env.MODE === "development"
    ? "http://localhost:5000/api"
    : "https://manufacturing-test-api.onrender.com/api"; // Tu URL de Render
```

#### 2. Rebuild Frontend

```bash
cd frontend
npm run build
git add dist
git commit -m "feat: connect to production backend"
git push origin main
```

#### 3. Test End-to-End

- [ ] Login funciona desde GitHub Pages
- [ ] Dashboard carga datos desde Render
- [ ] CORS sin errores en browser console
- [ ] Formularios submit correctamente

---

## 🚨 Troubleshooting

### Frontend Issues

#### CSS no carga

```bash
# Verificar build output
ls -la frontend/dist/

# Verificar vite.config.js base URL
grep "base:" frontend/vite.config.js
```

#### 404 en rutas

- Verificar que GitHub Pages esté configurado para GitHub Actions
- Router debe estar en "hash" mode o configurar redirects

#### CORS Errors

- Backend no está corriendo
- URL del backend incorrecta en `api.js`
- CORS mal configurado en `server.js`

### Backend Issues

#### Build Fails en Render

```bash
# Verificar package.json
cat backend/package.json

# Test build local
cd backend && npm install
```

#### MongoDB Connection Error

- Verificar connection string en variables de entorno
- Whitelist IP 0.0.0.0/0 en Atlas
- Verificar username/password

#### JWT Errors

- Verificar JWT_SECRET está configurado
- Secret debe ser largo (64+ chars)

### Environment Issues

#### Variables no cargan

- Verificar sintaxis en Render environment variables
- No usar comillas extras: `VALUE` no `"VALUE"`
- Restart service después de cambios

---

## 📈 Performance & Monitoring

### Frontend Metrics

- Lighthouse score > 90
- First Contentful Paint < 1.5s
- Cumulative Layout Shift < 0.1

### Backend Monitoring

- Health check endpoint: `/health`
- Response time < 500ms
- Memory usage < 512MB (Render free tier)

### Production Checklist

- [ ] HTTPS en todos los endpoints
- [ ] Rate limiting funcionando
- [ ] Logs sin datos sensibles
- [ ] Error handling apropiado
- [ ] Database backups configurados

---

## 🔒 Security Notes

### Secretos y Seguridad

- ⚠️ **NUNCA** commitear archivos `.env`
- Usar `.env.example` para documentación
- JWT secrets únicos por ambiente
- Passwords complejos para MongoDB
- CORS restrictivo (solo dominios necesarios)

### Maintenance

- Actualizar dependencias regularmente
- Monitoring de logs de errores
- Backup de base de datos mensual
- Review de access logs

---

## 🔄 Update Workflow

### Para cambios de Frontend:

```bash
cd frontend
# hacer cambios
npm run build
git add .
git commit -m "feat: nueva funcionalidad"
git push origin main
# GitHub Actions auto-deploy
```

### Para cambios de Backend:

```bash
cd backend
# hacer cambios
git add .
git commit -m "feat: nueva funcionalidad"
git push origin main
# Render auto-deploy
```

---

**✅ ¡Deployment Completo!**  
Frontend: `https://tu-username.github.io/manufacturing_test_monitoring_system/`  
Backend: `https://manufacturing-test-api.onrender.com/`
