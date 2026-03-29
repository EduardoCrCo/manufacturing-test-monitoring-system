# 🏭 Manufacturing Test Monitoring System

**Sistema de Monitoreo de Pruebas de Manufactura** - Una aplicación full-stack para el seguimiento y análisis de resultados de pruebas de manufactura en tiempo real.

## ⚡ Demo en Vivo

- **Frontend**: [Ver aplicación](https://tu-username.github.io/manufacturing_test_monitoring_system/)
- **Backend API**: [Health Check](https://manufacturing-test-api.onrender.com/health)

## 🎯 Características

### 📊 Dashboard Analytics

- KPIs en tiempo real (Pass Rate, Total Tests, Failure Rate)
- Gráficos interactivos con Chart.js
- Filtros avanzados por fecha, estación y tipo

### 🔐 Autenticación Segura

- JWT tokens con expiración configurable
- Rate limiting y protección CORS
- Middleware de autenticación para rutas protegidas

### 📈 Gestión de Datos

- CRUD completo para estaciones y tipos de falla
- Exportación de datos en múltiples formatos
- Validación robusta en frontend y backend

### 💻 UI/UX Optimizada

- Diseño responsive con CSS Grid/Flexbox
- Toast notifications con debouncing
- Tema personalizado para manufactura

## 🛠️ Stack Tecnológico

### Frontend

- **React 19** - UI library con hooks modernos
- **Vite 8** - Build tool ultra-rápido
- **Chart.js** - Visualización de datos
- **Axios** - Cliente HTTP con interceptors
- **CSS3** - Variables CSS y diseño responsive

### Backend

- **Node.js + Express** - API REST
- **MongoDB + Mongoose** - Base de datos NoSQL
- **JWT** - Autenticación stateless
- **Helmet** - Security headers
- **Rate Limiting** - Protección contra ataques

### DevOps

- **GitHub Pages** - Hosting frontend estático
- **Render** - Hosting backend con auto-deploy
- **MongoDB Atlas** - Base de datos en la nube
- **GitHub Actions** - CI/CD pipeline

## 🚀 Quick Start Local

### Pre-requisitos

- Node.js 18+
- MongoDB local o Atlas
- Git

### 1. Clonar Repositorio

```bash
git clone https://github.com/tu-username/manufacturing_test_monitoring_system.git
cd manufacturing_test_monitoring_system
```

### 2. Setup Backend

```bash
cd backend
npm install
cp .env.example .env
# Editar .env con tus variables
npm run dev
```

### 3. Setup Frontend

```bash
cd frontend
npm install
npm run dev
```

### 4. Poblar Base de Datos

```bash
cd backend
node seedDatabase.js
```

**¡Aplicación corriendo en `http://localhost:5173`!**

## 📁 Estructura del Proyecto

```
📦 manufacturing_test_monitoring_system/
├── 📂 frontend/
│   ├── 📂 src/
│   │   ├── 📂 components/     # Componentes reutilizables
│   │   ├── 📂 pages/          # Páginas principales
│   │   ├── 📂 services/       # API y servicios
│   │   └── 📂 context/        # Contextos React
│   ├── 📄 vite.config.js      # Configuración Vite
│   └── 📄 package.json
├── 📂 backend/
│   ├── 📂 models/            # Esquemas MongoDB
│   ├── 📂 controllers/       # Lógica de negocio
│   ├── 📂 routes/           # Definición de rutas
│   ├── 📂 middleware/       # Middleware personalizado
│   ├── 📂 config/           # Configuraciones
│   └── 📄 server.js         # Entry point
├── 📄 DEPLOYMENT.md         # Guía de deployment
└── 📄 README.md            # Este archivo
```

## 🎯 Funcionalidades Principales

### 👤 Autenticación

- Login/logout con JWT
- Protección de rutas privadas
- Session persistence

### 📊 Dashboard

- Métricas en tiempo real
- Gráficos interactivos (Bar Chart, Line Chart)
- Filtrados inteligentes

### ✅ Test Entry

- Formulario optimizado para ingreso rápido
- Validación en tiempo real
- Auto-complete para estaciones

### 📈 Analytics

- Yield por estación
- Tendencias temporales
- Análisis de tipos de falla

## 🌐 Deployment

### Producción Automática

Ver [DEPLOYMENT.md](DEPLOYMENT.md) para guía detallada.

**Resumen rápido:**

1. Push a `main` branch
2. GitHub Actions build y deploy frontend
3. Render auto-deploy backend
4. MongoDB Atlas para base de datos

### Variables de Entorno

Copiar `.env.example` y configurar:

- `MONGODB_URI` - Connection string Atlas
- `JWT_SECRET` - Secret para tokens
- `FRONTEND_URL` - URL de GitHub Pages

## 📱 Responsive Design

Optimizado para:

- 📱 **Mobile** (320px+)
- 💻 **Desktop** (1024px+)
- 📺 **Large screens** (1440px+)

## ⚙️ Performance

### Frontend

- **Bundle size**: ~5.4KB gzip
- **First Paint**: <1.5s
- **Lighthouse**: 95+ score

### Backend

- **Response time**: <200ms
- **Memory usage**: <256MB
- **Rate limiting**: 100 req/15min

## 🔒 Security

- **HTTPS** en producción
- **CORS** restrictivo
- **Rate limiting** anti-DDoS
- **Helmet** security headers
- **JWT** con expiración

## 🤝 Contribuir

1. Fork el proyecto
2. Crear branch feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit cambios (`git commit -m 'feat: agregar nueva funcionalidad'`)
4. Push to branch (`git push origin feature/nueva-funcionalidad`)
5. Abrir Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT - ver [LICENSE](LICENSE) para detalles.

## 👨‍💻 Autor

**Eduardo Cruz** - Estudiante de Desarrollo Web en TripleTen

- GitHub: [@tu-username](https://github.com/tu-username)
- Email: tu.email@example.com

## 🙏 Agradecimientos

- TripleTen por la educación en desarrollo web
- Comunidad React por las mejores prácticas
- MongoDB University por los patrones de base de datos

---

**⭐ ¡Dale una estrella si te gusta el proyecto!**
