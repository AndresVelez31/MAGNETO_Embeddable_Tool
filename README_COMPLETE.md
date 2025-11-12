# Magneto Embeddable Tool - Sistema de Encuestas para Procesos de Selección

## 📋 Descripción

Magneto es una aplicación web tipo "User Generated Content" diseñada para capturar feedback de candidatos durante procesos de selección. La herramienta permite crear encuestas embeddables que se pueden integrar en sitios web externos o mostrar como modales contextuales.

## ✨ Características Principales

### Gestión de Encuestas (HUF-01 a HUF-09)
- ✅ Crear, editar y eliminar encuestas personalizadas
- ✅ Múltiples tipos de preguntas: texto, lista simple, lista múltiple, escala, NPS
- ✅ Validaciones completas de formularios
- ✅ Confirmaciones con AlertDialog antes de eliminaciones
- ✅ Vista detallada de cada encuesta con información completa
- ✅ Estados de encuesta: activa, borrador, inactiva, archivada

### Métricas y Análisis (HUF-10, HUNF-02)
- ✅ Dashboard con KPIs principales (total respuestas, tasa completado, abandono)
- ✅ Gráficos interactivos con Recharts:
  - BarChart: respuestas por tipo de encuesta
  - PieChart: estado de respuestas (completadas/parciales/abandonadas)
  - PieChart: clasificación de satisfacción (buena/regular/mala)
- ✅ Filtros temporales (7/30/90 días)
- ✅ Tiempo de carga optimizado <5 segundos

### Modal Embeddable (HUF-01, HUF-02, HUF-03, HUF-04)
- ✅ Dialog modal contextual para mostrar encuestas
- ✅ Indicador de progreso X/Y preguntas respondidas
- ✅ Barra de progreso visual con porcentaje
- ✅ Registro de "no respondió" al cerrar sin completar
- ✅ Validación de preguntas obligatorias
- ✅ Confirmación de envío exitoso

### SEO/GEO/AEO (HUNF-05, HUNF-06)
- ✅ Meta tags completos (title, description, keywords)
- ✅ Open Graph para redes sociales
- ✅ Twitter Cards
- ✅ Structured Data (JSON-LD) con Schema.org
- ✅ robots.txt configurado
- ✅ sitemap.xml generado
- ✅ Geo tags para Colombia

### Privacidad y Seguridad
- ✅ Respuestas anónimas desvinculadas de usuarios
- ✅ No almacenamiento de datos personales en respuestas
- ✅ CORS configurado para integraciones seguras

## 🛠️ Tecnologías

### Frontend
- **React 19.1.1** + **TypeScript 5.8.3**
- **Vite 7.1.6** - Build tool y dev server
- **Tailwind CSS v3** - Estilos con gradientes HSL
- **shadcn/ui** - Componentes UI con Radix UI
- **Recharts** - Gráficas interactivas
- **React Router DOM v6** - Routing
- **Sonner** - Toast notifications

### Backend
- **Node.js** + **Express**
- **MongoDB** - Base de datos NoSQL
- **Mongoose** - ODM para MongoDB

## 📁 Estructura del Proyecto

```
MAGNETO_Embeddable_Tool/
├── cliente/
│   ├── public/
│   │   ├── robots.txt
│   │   └── sitemap.xml
│   ├── src/
│   │   ├── components/
│   │   │   ├── ui/           # Componentes shadcn/ui
│   │   │   ├── SurveyModal.tsx
│   │   │   ├── QuestionDisplay.tsx
│   │   │   └── QuestionInput.tsx
│   │   ├── contexts/
│   │   │   ├── AuthContext.tsx
│   │   │   └── SurveyContext.tsx
│   │   ├── pages/
│   │   │   ├── AdminHome.tsx
│   │   │   ├── CreateSurvey.tsx
│   │   │   ├── SurveyList.tsx
│   │   │   ├── SurveyDetail.tsx
│   │   │   ├── Metrics.tsx
│   │   │   ├── DynamicSurvey.tsx
│   │   │   ├── Login.tsx
│   │   │   └── Register.tsx
│   │   ├── services/
│   │   │   └── encuestaService.ts
│   │   ├── types/
│   │   │   ├── encuesta.ts    # Tipos backend
│   │   │   ├── survey.ts      # Tipos frontend
│   │   │   └── mappers.ts     # Conversión tipos
│   │   └── index.tsx
│   └── index.html             # Con meta tags SEO
├── servidor/
│   ├── src/
│   │   ├── models/
│   │   │   ├── Encuesta.ts
│   │   │   ├── Respuesta.ts
│   │   │   ├── Usuario.ts
│   │   │   └── Metrica.ts
│   │   ├── routes/
│   │   │   └── encuestas.ts
│   │   ├── config/
│   │   │   └── database.ts
│   │   └── server.ts
│   └── package.json
└── README.md
```

## 🚀 Instalación y Configuración

### Requisitos Previos
- Node.js v18+
- MongoDB v6+
- npm o yarn

### Backend

```bash
cd servidor
npm install

# Configurar variables de entorno
echo "MONGODB_URI=mongodb://localhost:27017/magneto" > .env
echo "PORT=3000" >> .env

# Iniciar servidor
npm run dev
```

### Frontend

```bash
cd cliente
npm install

# Iniciar dev server
npm run dev
```

La aplicación estará disponible en:
- Frontend: http://localhost:5174
- Backend: http://localhost:3000

## 📊 Endpoints API

### Encuestas
- `GET /api/encuestas` - Listar todas las encuestas
- `GET /api/encuestas/:id` - Obtener una encuesta por ID
- `GET /api/encuestas/tipo/:tipo` - Obtener encuesta activa por tipo
- `POST /api/encuestas` - Crear nueva encuesta
- `PUT /api/encuestas/:id` - Actualizar encuesta completa
- `PATCH /api/encuestas/:id/estado` - Cambiar estado de encuesta
- `DELETE /api/encuestas/:id` - Eliminar encuesta
- `POST /api/encuestas/:id/respuestas` - Guardar respuestas
- `POST /api/encuestas/:id/no-respondio` - Registrar no respuesta

## 🎨 Diseño Visual

El proyecto utiliza un sistema de diseño basado en:
- **Gradientes HSL** para fondos y elementos destacados
- **Colores CSS variables** para soporte de tema claro/oscuro
- **Cards con backdrop-blur** para efectos glassmorphism
- **Animaciones suaves** con transiciones CSS
- **Iconografía de Lucide React**

## 🔒 Seguridad

- Validaciones de entrada en frontend y backend
- Sanitización de datos con Mongoose
- CORS configurado para dominios permitidos
- Respuestas anónimas sin vincular a identidades
- Hash de contraseñas (implementación futura)

## 📈 Requisitos Cumplidos

### Funcionales (HUF)
- [x] HUF-01: Modal embeddable post-aplicación
- [x] HUF-02: Modal post-deserción
- [x] HUF-03: Indicador progreso X/Y preguntas
- [x] HUF-04: Registro "no respondió"
- [x] HUF-05: Autenticación básica
- [x] HUF-06: Validación título obligatorio
- [x] HUF-07: Validación al menos 1 pregunta
- [x] HUF-08: Validación opciones en preguntas múltiples
- [x] HUF-09: Confirmación antes de eliminar
- [x] HUF-10: Visualización de métricas con gráficas
- [x] HUF-11: Login con validaciones
- [x] HUF-12: Listado de encuestas
- [x] HUF-13: Vista detallada de encuesta
- [x] HUF-14: Filtros de encuestas

### No Funcionales (HUNF)
- [x] HUNF-01: Interfaz intuitiva y profesional
- [x] HUNF-02: Métricas cargando en <5 segundos
- [x] HUNF-03: Responsive design Chrome/Edge
- [x] HUNF-04: Diligenciamiento ≤2 minutos
- [x] HUNF-05: SEO completo (meta tags, Open Graph)
- [x] HUNF-06: Privacidad (respuestas anónimas)

## 🔄 Próximas Funcionalidades

- [ ] Autenticación con JWT y refresh tokens
- [ ] Límite de 3 intentos de login fallidos
- [ ] Widget embeddable externo con script
- [ ] Exportación de métricas a PDF/Excel
- [ ] Notificaciones por email
- [ ] Tests unitarios y de integración
- [ ] CI/CD con GitHub Actions
- [ ] Despliegue a producción

## 👥 Equipo

Desarrollado por el equipo de Magneto para la Universidad EAFIT

## 📄 Licencia

Proyecto académico - Todos los derechos reservados

---

**Última actualización:** Noviembre 11, 2025
