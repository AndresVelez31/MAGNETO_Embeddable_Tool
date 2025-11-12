# MAGNETO_Embeddable_Tool

**MAGNETO Embeddable Tool** — 
Es una herramienta digital creada principalmente para usuarios que interactúan con los procesos de empleo de Magneto que tienen la necesidad de expresar su experiencia o razones para no continuar en el proceso y el equipo de Magneto que requiere ver los resultados de dichas encuestas graficamente, Se llama "SNAS" y es una client-side embeddable tool que recoge feedback directo, estructurado y en tiempo real a través de encuestas contextuales, mejorando la comprensión del comportamiento del candidato y optimizando los procesos de selección; a diferencia de la ausencia de mecanismos automatizados y visibles de retroalimentación, nuestro producto permite una mejora continua de la experiencia del candidato y de la percepción de la marca empleadora.

## Instalación


## 🚀 Requisitos Previos

- Node.js v14+
- MongoDB v4.4+
- npm o yarn

## 📦 Instalación

### 1. Clonar el repositorio
```bash
git clone https://github.com/AndresVelez31/MAGNETO_Embeddable_Tool.git
cd MAGNETO_Embeddable_Tool
```

### 2. Instalar dependencias del proyecto completo
```bash
npm install
```

Esto instalará `concurrently` para correr cliente y servidor simultáneamente.

### 3. Instalar dependencias de cliente y servidor
```bash
cd servidor && npm install && cd ..
cd cliente && npm install && cd ..
```

O usar el script:
```bash
npm run install:all
```
## 🗄️ Configurar Base de Datos

### 1. Iniciar MongoDB

**En una terminal separada (manténla abierta):**

```bash
# Iniciar MongoDB
mongod

# O si usas MongoDB como servicio:
# Linux:
sudo service mongodb start

# macOS:
brew services start mongodb-community
```

### 2. Poblar la Base de Datos (Opcional pero Recomendado)

Para probar la aplicación con datos de ejemplo, ejecuta los siguientes scripts:

```bash
cd servidor

# Poblar usuarios de prueba
npm run seed-usuarios

# Poblar encuestas de prueba
npm run seed-encuestas

# Poblar respuestas de prueba
npm run seed-respuestas
```

### 3. Verificar que los datos se cargaron correctamente

```bash
# Verificar usuarios
npm run verify-usuarios

# Verificar encuestas
npm run verify-encuestas

# Verificar respuestas
npm run verify-respuestas
```

Deberías ver un resumen de los datos insertados en cada colección.

---


## 🏃 Ejecutar el Proyecto

### Opción 1: Todo junto (Recomendado)

**Asegúrate de que MongoDB esté corriendo:**
```bash
mongod
```

**Luego ejecuta:**
```bash
npm run dev
```

Esto iniciará automáticamente:
- 🔧 Servidor en http://localhost:3000
- 🎨 Cliente en http://localhost:5173

### Opción 2: Separado (Manual)

**Terminal 1 - MongoDB:**
```bash
mongod
```

**Terminal 2 - Servidor:**
```bash
cd servidor
npm run dev
```

**Terminal 3 - Cliente:**
```bash
cd cliente
npm run dev
```

## 🌐 Acceso

- **Aplicación Web:** http://localhost:5173

## 📁 Estructura del Proyecto

```
MAGNETO_Embeddable_Tool/
├── cliente/                 # Frontend React + TypeScript
│   ├── src/
│   │   ├── components/      # Componentes React
│   │   ├── services/        # Servicios API
│   │   └── types/           # Tipos TypeScript
│   └── package.json
│
├── servidor/                # Backend Node.js + Express
│   ├── src/
│   │   ├── config/          # Configuración BD
│   │   ├── models/          # Modelos Mongoose
│   │   ├── routes/          # Rutas Express
│   │   ├── scripts/         # Scripts de seed/verificación
│   │   └── server.ts        # Punto de entrada
│   └── package.json
│
└── package.json             # Scripts globales
```

## 🛠️ Tecnologías

### Frontend
- React 19
- TypeScript
- Vite
- CSS Modules

### Backend
- Node.js
- Express
- TypeScript
- MongoDB + Mongoose

## 🧪 Scripts Disponibles

### Raíz del proyecto
```bash
npm run dev              # Correr cliente y servidor
npm run install:all      # Instalar todas las dependencias
```

### Servidor
```bash
npm run dev              # Modo desarrollo
npm run build            # Compilar TypeScript
npm run start            # Producción
npm run seed-encuestas   # Poblar encuestas
npm run verify-encuestas # Verificar encuestas
```

### Cliente
```bash
npm run dev              # Modo desarrollo
npm run build            # Build para producción
npm run preview          # Preview del build
```


## 👥 Contribuidores

- Andres Velez
- Sebastian Salazar
- Simon Mazo
