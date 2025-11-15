# 🧲 MAGNETO Embeddable Tool

<div align="center">

![MAGNETO](https://img.shields.io/badge/MAGNETO-Survey%20Platform-blue?style=for-the-badge)
![Version](https://img.shields.io/badge/version-1.0.0-green?style=for-the-badge)
![License](https://img.shields.io/badge/license-ISC-orange?style=for-the-badge)

**Sistema de Encuestas Embebibles con Clean Architecture**

[Características](#-características) • [Instalación](#-instalación) • [Arquitectura](#-arquitectura) • [Uso](#-uso) • [Documentación](#-documentación)

</div>

---

## 📖 Descripción

**MAGNETO Embeddable Tool** (SNAS - Survey and Notification Automation System) es una herramienta digital avanzada diseñada para capturar feedback estructurado en tiempo real de candidatos que interactúan con los procesos de selección de Magneto.

### 🎯 Propósito

- **Para Candidatos**: Expresar su experiencia, satisfacción y razones para continuar o abandonar procesos de empleo
- **Para Magneto**: Analizar resultados mediante dashboards interactivos, identificar patrones y optimizar la experiencia del candidato
- **Valor Agregado**: Mejora continua basada en datos, fortalecimiento de la marca empleadora y toma de decisiones informadas

### 🌟 Diferenciadores

✅ Client-side embeddable tool (integrable en cualquier plataforma)  
✅ Feedback contextual y en tiempo real  
✅ Analytics avanzados con métricas clave (NPS, tasa de respuesta, tendencias)  
✅ Clean Architecture con separación de capas (Domain, Infrastructure, Presentation)  
✅ Múltiples formatos de exportación (CSV, PDF, JSON)

---

## 🚀 Requisitos Previos

Antes de comenzar, asegúrate de tener instalado:

| Herramienta | Versión Mínima | Propósito |
|-------------|----------------|-----------|
| **Node.js** | v18.0+ | Runtime de JavaScript |
| **npm** | v9.0+ | Gestor de paquetes |
| **MongoDB** | v6.0+ | Base de datos NoSQL |
| **Git** | v2.30+ | Control de versiones |

### Verificación de Requisitos

```bash
node --version   # v18.0.0 o superior
npm --version    # v9.0.0 o superior
mongod --version # v6.0.0 o superior
```

## 📦 Instalación

### 1️⃣ Clonar el repositorio

```bash
git clone https://github.com/AndresVelez31/MAGNETO_Embeddable_Tool.git
cd MAGNETO_Embeddable_Tool
```

### 2️⃣ Instalar todas las dependencias

**Opción A: Instalación automática (Recomendado)**
```bash
npm run install:all
```

**Opción B: Instalación manual**
```bash
# Instalar dependencias raíz (concurrently)
npm install

# Instalar dependencias del servidor
cd servidor && npm install && cd ..

# Instalar dependencias del cliente
cd cliente && npm install && cd ..
```

## 🗄️ Configuración de Base de Datos

### 1️⃣ Iniciar MongoDB

**Terminal independiente (mantén abierta):**

```bash
# Windows
mongod

# Linux
sudo service mongodb start

# macOS
brew services start mongodb-community

# O usando Docker
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

### 2️⃣ Poblar Base de Datos (Datos de Prueba)

```bash
cd servidor

# Poblar usuarios de prueba
npm run seed:usuarios

# Poblar encuestas de ejemplo
npm run seed:encuestas

# Poblar respuestas simuladas
npm run seed:respuestas

# Poblar métricas adicionales
npm run seed:metricas
```

### 3️⃣ Verificar Datos

```bash
# Verificar usuarios insertados
npm run verify:usuarios

# Verificar encuestas creadas
npm run verify:encuestas

# Verificar respuestas registradas
npm run verify:respuestas
```

✅ **Resultado esperado**: Resumen con conteo de documentos por colección

---


## 🏃 Ejecutar el Proyecto

### ⚡ Modo Desarrollo (Recomendado)

**1. Asegúrate de que MongoDB esté ejecutándose:**
```bash
mongod
```

**2. Inicia cliente y servidor simultáneamente:**
```bash
npm run dev
```

**Servicios iniciados:**
- 🖥️ **Backend API**: http://localhost:3000
- 🎨 **Frontend React**: http://localhost:5173
- 📊 **MongoDB**: mongodb://localhost:27017

### 🔧 Modo Manual (Separado)

**Terminal 1 - MongoDB:**
```bash
mongod
```

**Terminal 2 - Servidor Backend:**
```bash
cd servidor
npm run dev
```

**Terminal 3 - Cliente Frontend:**
```bash
cd cliente
npm run dev
```

### 🚀 Modo Producción

```bash
# Build de ambos proyectos
npm run build

# Ejecutar servidor (sirve cliente compilado)
cd servidor && npm start
```

## 🌐 Acceso a la Aplicación

- **🌍 Aplicación Web**: http://localhost:5173
- **🔌 API Backend**: http://localhost:3000/api
- **📄 Health Check**: http://localhost:3000/health

## 📁 Estructura del Proyecto

```
MAGNETO_Embeddable_Tool/
├── 📄 README.md                              # Este archivo
├── 📄 package.json                           # Scripts globales
├
├── 📄 ARQUITECTURA_PROPUESTA.md              # Arquitectura del sistema
├── 📄 DIAGRAMAS_ARQUITECTURA.md              # Diagramas arquitectónicos
├
├── 📂 cliente/                               # 🎨 Frontend React + TypeScript
│   ├── 📂 public/
│   │   ├── demo.html                         # Demo embebible
│   │   ├── embed.js                          # Script de integración
│   │   └── README_DEMO.md                    # Guía de demostración
│   ├── 📂 src/
│   │   ├── 📂 core/                          # Núcleo de la aplicación
│   │   │   ├── 📂 config/                    # Configuración global
│   │   │   │   ├── api.config.ts             # Config de API
│   │   │   │   ├── constants.ts              # Constantes del sistema
│   │   │   │   └── routes.config.ts          # Configuración de rutas
│   │   │   ├── 📂 providers/
│   │   │   │   └── AppProviders.tsx          # Context Providers
│   │   │   ├── 📂 router/
│   │   │   │   └── AppRouter.tsx             # Router principal
│   │   │   └── 📂 services/
│   │   │       └── http-client.ts            # Cliente HTTP Singleton
│   │   │
│   │   ├── 📂 features/                      # Módulos por funcionalidad
│   │   │   ├── 📂 auth/                      # Autenticación
│   │   │   │   ├── hooks/useAuth.tsx
│   │   │   │   ├── pages/LoginPage.tsx
│   │   │   │   └── types/auth.types.ts
│   │   │   ├── 📂 surveys/                   # Gestión de encuestas
│   │   │   │   ├── hooks/useSurveys.ts
│   │   │   │   ├── pages/
│   │   │   │   │   ├── CreateSurveyPage.tsx
│   │   │   │   │   ├── EditSurveyPage.tsx
│   │   │   │   │   ├── SurveyListPage.tsx
│   │   │   │   │   └── SurveyDetailPage.tsx
│   │   │   │   ├── services/survey.service.ts
│   │   │   │   └── types/survey.types.ts
│   │   │   ├── 📂 responses/                 # Gestión de respuestas
│   │   │   │   ├── hooks/useResponses.ts
│   │   │   │   ├── pages/
│   │   │   │   │   ├── DynamicSurveyPage.tsx
│   │   │   │   │   ├── ResponseListPage.tsx
│   │   │   │   │   └── ResponseDetailPage.tsx
│   │   │   │   ├── services/response.service.ts
│   │   │   │   └── types/response.types.ts
│   │   │   ├── 📂 analytics/                 # Analytics y métricas
│   │   │   │   ├── hooks/
│   │   │   │   │   ├── useMetrics.ts
│   │   │   │   │   └── useExportMetrics.ts
│   │   │   │   ├── pages/MetricsPage.tsx
│   │   │   │   ├── services/analytics.service.ts
│   │   │   │   └── types/metrics.types.ts
│   │   │   ├── 📂 admin/
│   │   │   │   └── pages/AdminHomePage.tsx
│   │   │   └── 📂 user/
│   │   │       └── pages/UserHomePage.tsx
│   │   │
│   │   ├── 📂 shared/                        # Componentes compartidos
│   │   │   ├── 📂 components/
│   │   │   │   ├── common/
│   │   │   │   │   ├── AuthGuard.tsx
│   │   │   │   │   ├── QuestionDisplay.tsx
│   │   │   │   │   ├── QuestionInput.tsx
│   │   │   │   │   └── SurveyModal.tsx
│   │   │   │   └── ui/                       # Componentes UI (shadcn)
│   │   │   ├── 📂 hooks/
│   │   │   │   └── use-toast.ts
│   │   │   └── 📂 lib/
│   │   │       └── utils.ts                  # Utilidades compartidas
│   │   │
│   │   ├── App.tsx                           # Componente raíz
│   │   ├── index.tsx                         # Punto de entrada
│   │   └── index.css                         # Estilos globales
│   │
│   ├── 📄 package.json
│   ├── 📄 vite.config.ts                     # Configuración Vite
│   ├── 📄 tsconfig.json                      # Config TypeScript
│   └── 📄 tailwind.config.js                 # Config Tailwind CSS
│
└── 📂 servidor/                              # 🖥️ Backend Node.js + Express
    ├── 📂 src/
    │   ├── 📂 domain/                        # Capa de Dominio (Clean Arch)
    │   │   ├── 📂 entities/
    │   │   │   └── Encuesta.entity.ts        # Entidad de dominio
    │   │   ├── 📂 interfaces/
    │   │   │   └── IEncuestaRepository.ts    # Interfaz del repositorio
    │   │   └── 📂 services/
    │   │       ├── EncuestaService.ts        # Lógica de negocio
    │   │       └── ExportService.ts          # Servicio de exportación
    │   │
    │   ├── 📂 infrastructure/                # Capa de Infraestructura
    │   │   ├── 📂 database/
    │   │   │   ├── 📂 models/
    │   │   │   │   ├── Encuesta.ts
    │   │   │   │   ├── Respuesta.ts
    │   │   │   │   └── Usuario.ts
    │   │   │   └── 📂 repositories/
    │   │   │       └── EncuestaRepository.ts # Implementación repo
    │   │   └── 📂 http/
    │   │       ├── 📂 controllers/
    │   │       │   ├── EncuestaController.ts
    │   │       │   └── RespuestaController.ts
    │   │       ├── 📂 middlewares/
    │   │       └── 📂 routes/
    │   │           ├── encuestas.ts
    │   │           └── respuestas.ts
    │   │
    │   ├── 📂 config/
    │   │   └── database.ts                   # Configuración MongoDB
    │   ├── 📂 scripts/
    │   │   ├── 📂 seeds/                     # Scripts de población
    │   │   │   ├── seedUsuarios.ts
    │   │   │   ├── seedEncuestas.ts
    │   │   │   ├── seedRespuestas.ts
    │   │   │   └── seedRespuestasMetricas.ts
    │   │   └── 📂 verify/                    # Scripts de verificación
    │   │       ├── verificarUsuarios.ts
    │   │       ├── verificarEncuestas.ts
    │   │       ├── verificarRespuestas.ts
    │   │       └── verificarTimestamps.ts
    │   │
    │   └── server.ts                         # Punto de entrada del servidor
    │
    ├── 📄 package.json
    └── 📄 tsconfig.json                      # Config TypeScript
```

### 📂 Descripción de Capas

| Capa | Propósito | Tecnologías |
|------|-----------|-------------|
| **Domain** | Lógica de negocio pura, independiente de frameworks | TypeScript, Entidades, Interfaces |
| **Infrastructure** | Implementación técnica (BD, HTTP, externos) | Express, Mongoose, MongoDB |
| **Presentation** | Interfaz de usuario y experiencia | React, Tailwind, shadcn/ui |
| **Cross-Cutting** | Servicios transversales (auth, logging, utils) | React Query, Context API |

## 🛠️ Stack Tecnológico

### 🎨 Frontend (Cliente)

| Tecnología | Versión | Propósito |
|------------|---------|------------|
| **React** | 19.1.1 | Librería UI con componentes funcionales |
| **TypeScript** | 5.8.3 | Tipado estático y seguridad |
| **Vite** | 7.1.6 | Build tool ultra rápido |
| **React Router** | 7.9.5 | Enrutamiento SPA |
| **TanStack Query** | 5.90.7 | Server state management |
| **Tailwind CSS** | 3.4.18 | Framework CSS utility-first |
| **shadcn/ui** | - | Componentes UI accesibles (Radix UI) |
| **Lucide React** | 0.553.0 | Iconografía moderna |
| **Recharts** | 3.4.1 | Visualización de datos |
| **Sonner** | 2.0.7 | Sistema de notificaciones toast |

### 🖥️ Backend (Servidor)

| Tecnología | Versión | Propósito |
|------------|---------|------------|
| **Node.js** | 18+ | Runtime de JavaScript |
| **Express** | 5.1.0 | Framework web minimalista |
| **TypeScript** | 5.9.2 | Tipado estático en backend |
| **MongoDB** | 6.0+ | Base de datos NoSQL |
| **Mongoose** | 8.18.2 | ODM para MongoDB |
| **bcrypt** | 6.0.0 | Hashing de contraseñas |
| **CORS** | 2.8.5 | Middleware de políticas CORS |
| **PDFKit** | 0.17.2 | Generación de PDFs |
| **json2csv** | 6.0.0 | Exportación a CSV |
| **dotenv** | 17.2.2 | Variables de entorno |

### 🏗️ Arquitectura y Patrones

- **Clean Architecture** (Domain, Infrastructure, Presentation)
- **Repository Pattern** (Abstracción de acceso a datos)
- **Service Layer** (Lógica de negocio encapsulada)
- **Dependency Injection** (Inversión de dependencias)
- **Singleton Pattern** (HttpClient, conexión DB)
- **Strategy Pattern** (Exportación multi-formato)
- **Adapter Pattern** (Integración con APIs externas)
- **Observer Pattern** (React Context, React Query)
- **Facade Pattern** (Simplificación de interfaces)
- **MVC Architecture** (Separación de responsabilidades)

### 📚 Principios Aplicados

- ✅ **SOLID** (Single Responsibility, Open/Closed, Liskov, Interface Segregation, Dependency Inversion)
- ✅ **GRASP** (Low Coupling, High Cohesion, Information Expert, Controller, etc.)
- ✅ **Clean Code** (Nombres significativos, funciones pequeñas, DRY, KISS, etc.)

## 🧪 Scripts Disponibles

### 📦 Raíz del Proyecto

```bash
npm run install:all      # Instalar dependencias (raíz, servidor, cliente)
npm run dev              # Ejecutar cliente y servidor simultáneamente
npm run build            # Build completo (cliente + servidor)
npm run clean            # Limpiar node_modules y dist
```

### 🖥️ Servidor (cd servidor)

**Desarrollo:**
```bash
npm run dev              # Modo desarrollo con hot-reload
npm run build            # Compilar TypeScript a JavaScript
npm run start            # Ejecutar en producción
```

**Base de Datos - Población:**
```bash
npm run seed:usuarios    # Poblar usuarios de prueba
npm run seed:encuestas   # Poblar encuestas de ejemplo
npm run seed:respuestas  # Poblar respuestas simuladas
npm run seed:metricas    # Poblar métricas adicionales
```

**Base de Datos - Verificación:**
```bash
npm run verify:usuarios  # Verificar usuarios insertados
npm run verify:encuestas # Verificar encuestas creadas
npm run verify:respuestas# Verificar respuestas registradas
```

### 🎨 Cliente (cd cliente)

```bash
npm run dev              # Servidor de desarrollo (Vite)
npm run build            # Build optimizado para producción
npm run preview          # Preview del build de producción
npm run lint             # Ejecutar ESLint
```

---

## 🌟 Características Principales

### 📋 Gestión de Encuestas

- ✅ Crear encuestas con múltiples tipos de preguntas (texto, escala, selección múltiple)
- ✅ Editar y eliminar encuestas existentes
- ✅ Activar/desactivar/archivar encuestas
- ✅ Soporte para encuestas de satisfacción (CSAT, NPS) y no continuidad

### 📊 Analytics y Métricas

- 📈 Dashboard interactivo con gráficos (barras, líneas, donut)
- 📉 Métricas clave: NPS, tasa de respuesta, tendencias temporales
- 📊 Distribución de satisfacción por pregunta
- 🎯 Filtros por tipo de encuesta y rango de fechas

### 📤 Exportación de Datos

- 📄 **CSV**: Para análisis en Excel/Google Sheets
- 📕 **PDF**: Reportes visuales con gráficos
- 🗂️ **JSON**: Integración con otros sistemas

### 🔐 Autenticación y Autorización

- 🔑 Login con credenciales seguras (bcrypt)
- 👤 Roles de usuario (Admin, User)
- 🛡️ Rutas protegidas con AuthGuard
- 🔄 Persistencia de sesión con localStorage

### 🧩 Integración Embebible

- 🌐 Script `embed.js` para integración en cualquier sitio web
- 🎨 Personalización de estilos (colores, fuentes, dimensiones)
- ⚡ Carga asíncrona sin bloquear el DOM
- 📱 Responsive y accesible (WCAG 2.1)

---

## 📚 Documentación Adicional

| Documento | Descripción |
|-----------|-------------|
| [**Arquitectura del Sistema**](./ARQUITECTURA_PROPUESTA.md) | Diseño arquitectónico y decisiones técnicas |
| [**Diagrama de Clases UML**](./DIAGRAMA_CLASES.md) | Estructura de clases e interacciones |



## 👥 Equipo de Desarrollo

<table>
  <tr>
    <td align="center">
      <img src="https://github.com/AndresVelez31.png" width="100px;" alt="Andrés Vélez"/><br />
      <sub><b>Andrés Vélez</b></sub><br />
      <a href="https://github.com/AndresVelez31">@AndresVelez31</a>
    </td>
    <td align="center">
    <img src="https://github.com/Salazar1022.png" width="100px;" alt="Andrés Vélez"/><br />
      <sub><b>Sebastián Salazar</b></sub><br />
      <a href="https://github.com/Salazar1022">@Salazar1022</a>
    </td>
    <td align="center">
    <img src="https://github.com/Smg4315.png" width="100px;" alt="Andrés Vélez"/><br />
      <sub><b>Simón Mazo</b></sub><br />
      <a href="https://github.com/Smg4315">@Smg4315</a>
    </td>
    <td align="center">
    <img src="https://github.com/NicoRDJ.png" width="100px;" alt="Andrés Vélez"/><br />
      <sub><b>Nicolas Rodriguez</b></sub><br />
      <a href="https://github.com/NicoRDJ">@NicoRDJ</a>
    </td>
  </tr>
</table>

### 🎓 Contexto Académico

**Universidad EAFIT** - Ingeniería de Software (4to Semestre)  
**Proyecto**: Sistema de Encuestas Embebibles de Magneto SNAS  
**Año**: 2024-2025


---

<div align="center">
  <p>Hecho con ❤️ por el equipo SNAS</p>
  <p>Universidad EAFIT - 2024-2025</p>
</div>
