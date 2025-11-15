# 🏗️ Arquitectura Propuesta - MAGNETO Embeddable Tool

## 📋 Principios Aplicados

### Clean Code
- ✅ Nombres descriptivos y significativos
- ✅ Funciones pequeñas con una sola responsabilidad
- ✅ Código DRY (Don't Repeat Yourself)
- ✅ Separación de concerns (responsabilidades)

### SOLID
- **S** - Single Responsibility Principle: Cada clase/módulo una sola razón para cambiar
- **O** - Open/Closed Principle: Abierto a extensión, cerrado a modificación
- **L** - Liskov Substitution Principle: Interfaces intercambiables
- **I** - Interface Segregation Principle: Interfaces específicas vs generales
- **D** - Dependency Inversion Principle: Dependencias de abstracciones

### GRASP (General Responsibility Assignment Software Patterns)
- **Information Expert**: Asignar responsabilidades a quien tiene la información
- **Creator**: Asignar creación de objetos a quién tiene datos de inicialización
- **Controller**: Mediador entre UI y lógica de negocio
- **Low Coupling**: Minimizar dependencias
- **High Cohesion**: Responsabilidades relacionadas juntas

### Patrones de Diseño Aplicados
- **Repository Pattern**: Abstraer acceso a datos
- **Service Layer Pattern**: Lógica de negocio centralizada
- **Factory Pattern**: Creación de objetos complejos
- **Strategy Pattern**: Comportamientos intercambiables
- **Observer Pattern**: (React Context) Notificaciones de cambios

---

## 📂 Nueva Estructura del Cliente

```
cliente/
├── public/                     # Archivos estáticos públicos
│   ├── demo.html
│   ├── embed.js
│   ├── robots.txt
│   └── sitemap.xml
│
├── src/
│   ├── core/                   # Núcleo de la aplicación (infraestructura)
│   │   ├── config/             # Configuraciones globales
│   │   │   ├── api.config.ts
│   │   │   ├── routes.config.ts
│   │   │   └── constants.ts
│   │   │
│   │   ├── providers/          # Providers de contexto global
│   │   │   └── AppProviders.tsx
│   │   │
│   │   ├── router/             # Configuración de rutas
│   │   │   └── AppRouter.tsx
│   │   │
│   │   └── services/           # Servicios base y utilidades HTTP
│   │       └── http-client.ts
│   │
│   ├── features/               # Módulos de funcionalidad por dominio
│   │   ├── auth/               # Autenticación
│   │   │   ├── hooks/
│   │   │   │   └── useAuth.tsx
│   │   │   ├── types/
│   │   │   │   └── auth.types.ts
│   │   │   └── pages/
│   │   │       └── LoginPage.tsx
│   │   │
│   │   ├── surveys/            # Gestión de encuestas (ADMIN)
│   │   │   ├── hooks/
│   │   │   │   └── useSurveys.ts
│   │   │   ├── services/
│   │   │   │   └── survey.service.ts
│   │   │   ├── types/
│   │   │   │   └── survey.types.ts
│   │   │   └── pages/
│   │   │       ├── SurveyListPage.tsx
│   │   │       ├── CreateSurveyPage.tsx
│   │   │       ├── EditSurveyPage.tsx
│   │   │       └── SurveyDetailPage.tsx
│   │   │
│   │   ├── responses/          # Responder encuestas (USER)
│   │   │   ├── hooks/
│   │   │   │   └── useResponses.ts
│   │   │   ├── services/
│   │   │   │   └── response.service.ts
│   │   │   ├── types/
│   │   │   │   └── response.types.ts
│   │   │   └── pages/
│   │   │       ├── DynamicSurveyPage.tsx
│   │   │       ├── ResponseListPage.tsx
│   │   │       └── ResponseDetailPage.tsx
│   │   │
│   │   ├── analytics/          # Métricas y análisis
│   │   │   ├── hooks/
│   │   │   │   ├── useMetrics.ts
│   │   │   │   └── useExportMetrics.ts
│   │   │   ├── services/
│   │   │   │   └── analytics.service.ts
│   │   │   ├── types/
│   │   │   │   └── metrics.types.ts
│   │   │   └── pages/
│   │   │       └── MetricsPage.tsx
│   │   │
│   │   ├── admin/              # Dashboard administrativo
│   │   │   └── pages/
│   │   │       └── AdminHomePage.tsx
│   │   │
│   │   └── user/               # Portal del candidato
│   │       └── pages/
│   │           └── UserHomePage.tsx
│   │
│   ├── shared/                 # Recursos compartidos
│   │   ├── components/         # Componentes reutilizables
│   │   │   ├── ui/             # Componentes UI base (shadcn/ui)
│   │   │   │   ├── button.tsx
│   │   │   │   ├── card.tsx
│   │   │   │   ├── input.tsx
│   │   │   │   ├── select.tsx
│   │   │   │   ├── dialog.tsx
│   │   │   │   ├── checkbox.tsx
│   │   │   │   ├── radio-group.tsx
│   │   │   │   ├── table.tsx
│   │   │   │   ├── tabs.tsx
│   │   │   │   ├── chart.tsx
│   │   │   │   └── ... (23 componentes shadcn/ui)
│   │   │   │
│   │   │   └── common/
│   │   │       ├── AuthGuard.tsx
│   │   │       ├── QuestionDisplay.tsx
│   │   │       ├── QuestionInput.tsx
│   │   │       └── SurveyModal.tsx
│   │   │
│   │   ├── hooks/              # Hooks compartidos
│   │   │   └── use-toast.ts
│   │   │
│   │   └── lib/                # Librerías y configuraciones
│   │       └── utils.ts
│   │
│   ├── types/                  # Types globales
│   │   └── styles.d.ts
│   │
│   ├── App.tsx                 # Componente raíz con providers
│   ├── index.tsx               # Entry point (ReactDOM.render)
│   └── index.css               # Estilos globales + Tailwind
│
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
└── tailwind.config.js
```

---

## 📂 Nueva Estructura del Servidor

```
servidor/
├── src/
│   ├── config/                 # Configuraciones
│   │   └── database.ts
│   │
│   ├── domain/                 # Capa de dominio (lógica de negocio)
│   │   ├── entities/           # Entidades de dominio
│   │   │   └── Encuesta.entity.ts
│   │   │
│   │   ├── interfaces/         # Interfaces de repositorios
│   │   │   └── IEncuestaRepository.ts
│   │   │
│   │   └── services/           # Lógica de negocio
│   │       ├── EncuestaService.ts
│   │       └── ExportService.ts
│   │
│   ├── infrastructure/         # Capa de infraestructura
│   │   ├── database/           # Implementaciones de base de datos
│   │   │   ├── models/         # Modelos Mongoose
│   │   │   │   ├── Encuesta.ts
│   │   │   │   ├── Respuesta.ts
│   │   │   │   └── Usuario.ts
│   │   │   │
│   │   │   └── repositories/   # Implementación de repositorios
│   │   │       └── EncuestaRepository.ts
│   │   │
│   │   └── http/               # Capa HTTP
│   │       ├── controllers/    # Controladores
│   │       │   ├── EncuestaController.ts
│   │       │   └── RespuestaController.ts
│   │       │
│   │       ├── middlewares/    # Middlewares
│   │       │   └── errorHandler.ts
│   │       │
│   │       └── routes/         # Rutas
│   │           ├── encuestas.ts
│   │           └── respuestas.ts
│   │
│   ├── scripts/                # Scripts de utilidad
│   │   ├── seeds/
│   │   │   ├── seedEncuestas.ts
│   │   │   ├── seedRespuestas.ts
│   │   │   └── seedUsuarios.ts
│   │   └── verify/
│   │       ├── verificarEncuestas.ts
│   │       ├── verificarRespuestas.ts
│   │       └── verificarUsuarios.ts
│   │
│   └── server.ts               # Entry point
│
├── package.json
└── tsconfig.json
```

---

## 🎯 Beneficios de la Nueva Arquitectura

### 1. **Separación de Responsabilidades (SRP)**
- Cada carpeta y archivo tiene una responsabilidad clara
- Fácil de mantener y escalar

### 2. **Bajo Acoplamiento (Low Coupling)**
- Features independientes entre sí
- Servicios comunicándose mediante interfaces
- Fácil testing unitario

### 3. **Alta Cohesión (High Cohesion)**
- Código relacionado agrupado
- Features contienen todo lo que necesitan

### 4. **Escalabilidad**
- Agregar nuevas features es sencillo
- Patrones claros para seguir

### 5. **Mantenibilidad**
- Código organizado y predecible
- Fácil localizar y corregir bugs

### 6. **Testabilidad**
- Servicios y lógica separados de UI
- Repositorios fáciles de mockear

---

## 🔄 Flujo de Datos

### Cliente
```
UI Component → Hook → Service → Repository → API
    ↓          ↓        ↓
 Context ← ← ← ← ← ← ← ←
```

### Servidor
```
Route → Validator → Controller → Service → Repository → Database
   ↓       ↓          ↓           ↓
Middleware ← ← ← ← ← ←
```

---

## 📝 Ejemplo de Implementación

### Caso: Crear una Encuesta

**Cliente:**
```typescript
// 1. Component (CreateSurveyPage.tsx)
const CreateSurveyPage = () => {
  const { createSurvey } = useSurveyMutations();
  // UI logic...
};

// 2. Hook (useSurveyMutations.ts)
export const useSurveyMutations = () => {
  return useMutation({
    mutationFn: (data) => surveyService.create(data)
  });
};

// 3. Service (survey.service.ts)
class SurveyService {
  async create(data: CreateSurveyDTO) {
    return surveyRepository.create(data);
  }
}

// 4. Repository (survey.repository.ts)
class SurveyRepository {
  async create(data: CreateSurveyDTO) {
    return httpClient.post('/encuestas', data);
  }
}
```

**Servidor:**
```typescript
// 1. Route (encuestas.routes.ts)
router.post('/', 
  validateEncuesta,
  encuestaController.create
);

// 2. Validator (encuesta.validator.ts)
export const validateEncuesta = (req, res, next) => {
  // Validation logic
};

// 3. Controller (EncuestaController.ts)
class EncuestaController {
  async create(req, res) {
    const result = await encuestaService.create(req.body);
    res.json(result);
  }
}

// 4. Service (EncuestaService.ts)
class EncuestaService {
  async create(data: CreateEncuestaDTO) {
    // Business logic
    return encuestaRepository.create(data);
  }
}

// 5. Repository (EncuestaRepository.ts)
class EncuestaRepository {
  async create(data: CreateEncuestaDTO) {
    const encuesta = new EncuestaModel(data);
    return encuesta.save();
  }
}
```

---

## 🚀 Plan de Migración

1. ✅ **Crear nueva estructura de carpetas**
2. ✅ **Mover componentes UI a shared/components/ui**
3. ✅ **Separar páginas por features**
4. ✅ **Crear servicios y repositorios**
5. ✅ **Implementar controladores en servidor**
6. ✅ **Agregar validadores y middlewares**
7. ✅ **Actualizar imports**
8. ✅ **Testing**
9. ✅ **Documentación**

---

## 📚 Referencias

- [Clean Code - Robert C. Martin](https://www.amazon.com/Clean-Code-Handbook-Software-Craftsmanship/dp/0132350882)
- [SOLID Principles](https://www.digitalocean.com/community/conceptual_articles/s-o-l-i-d-the-first-five-principles-of-object-oriented-design)
- [GRASP Patterns](https://en.wikipedia.org/wiki/GRASP_(object-oriented_design))
- [Repository Pattern](https://deviq.com/design-patterns/repository-pattern)
- [Feature-Sliced Design](https://feature-sliced.design/)
