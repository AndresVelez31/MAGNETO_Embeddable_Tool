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
│   │   │   ├── AppProviders.tsx
│   │   │   ├── AuthProvider.tsx
│   │   │   └── QueryProvider.tsx
│   │   │
│   │   ├── router/             # Configuración de rutas
│   │   │   ├── AppRouter.tsx
│   │   │   ├── PrivateRoute.tsx
│   │   │   └── routes.ts
│   │   │
│   │   └── services/           # Servicios base y utilidades HTTP
│   │       ├── http-client.ts
│   │       └── api-error.handler.ts
│   │
│   ├── features/               # Módulos de funcionalidad por dominio
│   │   ├── auth/               # Autenticación
│   │   │   ├── components/
│   │   │   │   ├── LoginForm.tsx
│   │   │   │   └── RegisterForm.tsx
│   │   │   ├── hooks/
│   │   │   │   └── useAuth.ts
│   │   │   ├── services/
│   │   │   │   └── auth.service.ts
│   │   │   ├── types/
│   │   │   │   └── auth.types.ts
│   │   │   └── pages/
│   │   │       └── LoginPage.tsx
│   │   │
│   │   ├── surveys/            # Gestión de encuestas (ADMIN)
│   │   │   ├── components/
│   │   │   │   ├── SurveyCard.tsx
│   │   │   │   ├── SurveyForm.tsx
│   │   │   │   ├── QuestionBuilder.tsx
│   │   │   │   └── QuestionEditor.tsx
│   │   │   ├── hooks/
│   │   │   │   ├── useSurveys.ts
│   │   │   │   └── useSurveyMutations.ts
│   │   │   ├── services/
│   │   │   │   ├── survey.service.ts
│   │   │   │   └── survey.repository.ts
│   │   │   ├── types/
│   │   │   │   └── survey.types.ts
│   │   │   ├── utils/
│   │   │   │   └── survey.validators.ts
│   │   │   └── pages/
│   │   │       ├── SurveyListPage.tsx
│   │   │       ├── CreateSurveyPage.tsx
│   │   │       ├── EditSurveyPage.tsx
│   │   │       └── SurveyDetailPage.tsx
│   │   │
│   │   ├── responses/          # Responder encuestas (USER)
│   │   │   ├── components/
│   │   │   │   ├── QuestionDisplay.tsx
│   │   │   │   ├── QuestionInput.tsx
│   │   │   │   ├── SurveyProgress.tsx
│   │   │   │   └── SurveyModal.tsx
│   │   │   ├── hooks/
│   │   │   │   └── useResponseForm.ts
│   │   │   ├── services/
│   │   │   │   └── response.service.ts
│   │   │   ├── types/
│   │   │   │   └── response.types.ts
│   │   │   └── pages/
│   │   │       ├── DynamicSurveyPage.tsx
│   │   │       └── ThankYouPage.tsx
│   │   │
│   │   ├── analytics/          # Métricas y análisis
│   │   │   ├── components/
│   │   │   │   ├── MetricsCard.tsx
│   │   │   │   ├── ResponseChart.tsx
│   │   │   │   └── SatisfactionChart.tsx
│   │   │   ├── hooks/
│   │   │   │   └── useMetrics.ts
│   │   │   ├── services/
│   │   │   │   └── analytics.service.ts
│   │   │   ├── types/
│   │   │   │   └── metrics.types.ts
│   │   │   └── pages/
│   │   │       └── MetricsPage.tsx
│   │   │
│   │   ├── admin/              # Dashboard administrativo
│   │   │   ├── components/
│   │   │   │   ├── AdminHeader.tsx
│   │   │   │   └── AdminSidebar.tsx
│   │   │   └── pages/
│   │   │       └── AdminHomePage.tsx
│   │   │
│   │   └── user/               # Portal del candidato
│   │       ├── components/
│   │       │   └── UserHeader.tsx
│   │       └── pages/
│   │           └── UserHomePage.tsx
│   │
│   ├── shared/                 # Recursos compartidos
│   │   ├── components/         # Componentes reutilizables
│   │   │   ├── ui/             # Componentes UI base (shadcn)
│   │   │   │   ├── button.tsx
│   │   │   │   ├── card.tsx
│   │   │   │   ├── input.tsx
│   │   │   │   ├── select.tsx
│   │   │   │   ├── dialog.tsx
│   │   │   │   └── ...
│   │   │   ├── layout/
│   │   │   │   ├── Header.tsx
│   │   │   │   ├── Footer.tsx
│   │   │   │   └── Container.tsx
│   │   │   └── common/
│   │   │       ├── Loading.tsx
│   │   │       ├── ErrorBoundary.tsx
│   │   │       └── AuthGuard.tsx
│   │   │
│   │   ├── hooks/              # Hooks compartidos
│   │   │   ├── useToast.ts
│   │   │   ├── useLocalStorage.ts
│   │   │   └── useDebounce.ts
│   │   │
│   │   ├── types/              # Types compartidos
│   │   │   ├── common.types.ts
│   │   │   └── api.types.ts
│   │   │
│   │   ├── utils/              # Utilidades compartidas
│   │   │   ├── cn.ts
│   │   │   ├── formatters.ts
│   │   │   └── validators.ts
│   │   │
│   │   └── lib/                # Librerías y configuraciones
│   │       └── utils.ts
│   │
│   ├── App.tsx                 # Componente raíz simplificado
│   ├── main.tsx                # Entry point
│   └── index.css               # Estilos globales
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
│   │   ├── database.ts
│   │   ├── env.ts
│   │   └── constants.ts
│   │
│   ├── domain/                 # Capa de dominio (modelos y lógica)
│   │   ├── entities/           # Entidades de dominio
│   │   │   ├── Encuesta.entity.ts
│   │   │   ├── Respuesta.entity.ts
│   │   │   ├── Usuario.entity.ts
│   │   │   └── Metrica.entity.ts
│   │   │
│   │   ├── interfaces/         # Interfaces de repositorios
│   │   │   ├── IEncuestaRepository.ts
│   │   │   ├── IRespuestaRepository.ts
│   │   │   └── IUsuarioRepository.ts
│   │   │
│   │   └── services/           # Lógica de negocio
│   │       ├── EncuestaService.ts
│   │       ├── RespuestaService.ts
│   │       ├── AnalyticsService.ts
│   │       └── UsuarioService.ts
│   │
│   ├── infrastructure/         # Capa de infraestructura
│   │   ├── database/           # Implementaciones de base de datos
│   │   │   ├── models/         # Modelos Mongoose
│   │   │   │   ├── Encuesta.model.ts
│   │   │   │   ├── Respuesta.model.ts
│   │   │   │   ├── Usuario.model.ts
│   │   │   │   └── Metrica.model.ts
│   │   │   │
│   │   │   └── repositories/   # Implementación de repositorios
│   │   │       ├── EncuestaRepository.ts
│   │   │       ├── RespuestaRepository.ts
│   │   │       └── UsuarioRepository.ts
│   │   │
│   │   └── http/               # Capa HTTP
│   │       ├── controllers/    # Controladores
│   │       │   ├── EncuestaController.ts
│   │       │   ├── RespuestaController.ts
│   │       │   ├── AnalyticsController.ts
│   │       │   └── UsuarioController.ts
│   │       │
│   │       ├── middlewares/    # Middlewares
│   │       │   ├── error.middleware.ts
│   │       │   ├── auth.middleware.ts
│   │       │   ├── validation.middleware.ts
│   │       │   └── logger.middleware.ts
│   │       │
│   │       ├── validators/     # Validadores de entrada
│   │       │   ├── encuesta.validator.ts
│   │       │   ├── respuesta.validator.ts
│   │       │   └── usuario.validator.ts
│   │       │
│   │       └── routes/         # Rutas
│   │           ├── index.ts
│   │           ├── encuestas.routes.ts
│   │           ├── respuestas.routes.ts
│   │           ├── analytics.routes.ts
│   │           └── usuarios.routes.ts
│   │
│   ├── shared/                 # Utilidades compartidas
│   │   ├── utils/
│   │   │   ├── logger.ts
│   │   │   └── errors.ts
│   │   ├── types/
│   │   │   ├── express.d.ts
│   │   │   └── common.types.ts
│   │   └── constants/
│   │       └── messages.ts
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
