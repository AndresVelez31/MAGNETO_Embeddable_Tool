# 🧪 Guía de Testing - Magneto Embeddable Tool

## 📋 Checklist de Pruebas

### ✅ 1. INSTALACIÓN Y CONFIGURACIÓN

#### Backend
```bash
cd servidor
npm install
# Verificar: Sin errores de instalación
npm run dev
# Verificar: "Servidor corriendo en puerto 3000"
# Verificar: "MongoDB conectado exitosamente"
```

#### Frontend
```bash
cd cliente
npm install
# Verificar: Sin errores de instalación
npm run dev
# Verificar: "Local: http://localhost:5174/"
```

**Resultado esperado:** ✅ Ambos servidores corriendo sin errores

---

### ✅ 2. GESTIÓN DE ENCUESTAS

#### Test 2.1: Crear Nueva Encuesta
1. Navegar a: http://localhost:5174/admin/create-survey
2. Llenar formulario:
   - Título: "Encuesta de Prueba"
   - Descripción: "Esta es una prueba"
   - Tipo: Application
   - Agregar 3 preguntas de diferentes tipos
3. Click en "Guardar Encuesta"

**Resultado esperado:**
- ✅ Toast de éxito
- ✅ Redirección a /admin/surveys
- ✅ Encuesta aparece en listado

#### Test 2.2: Ver Listado de Encuestas
1. Navegar a: http://localhost:5174/admin/surveys
2. Verificar que aparecen todas las encuestas

**Resultado esperado:**
- ✅ Grid de cards con encuestas
- ✅ Cada card muestra: título, descripción, estado, preguntas, fechas
- ✅ Botones Ver/Editar/Eliminar visibles

#### Test 2.3: Ver Detalle de Encuesta
1. En listado, click en botón "Ver" de cualquier encuesta
2. Verificar información completa

**Resultado esperado:**
- ✅ Título y badge de estado
- ✅ 3 cards con estadísticas (Preguntas, Tipo, Versión)
- ✅ Card de información (fechas, ID, enlace)
- ✅ Lista completa de preguntas con preview
- ✅ Botones Editar y Eliminar funcionales

#### Test 2.4: Eliminar Encuesta
1. Click en botón "Eliminar"
2. Verificar AlertDialog de confirmación
3. Click en "Eliminar"

**Resultado esperado:**
- ✅ Modal de confirmación aparece
- ✅ Texto: "¿Estás seguro?"
- ✅ Al confirmar: toast de éxito y encuesta eliminada
- ✅ Redirección a listado

---

### ✅ 3. MÉTRICAS Y ANÁLISIS

#### Test 3.1: Dashboard de Métricas
1. Navegar a: http://localhost:5174/admin/metrics
2. Verificar componentes visuales

**Resultado esperado:**
- ✅ 4 KPI cards (Total Respuestas, Tasa Completado, Encuestas Activas, Tasa Abandono)
- ✅ BarChart: "Respuestas por Tipo de Encuesta"
- ✅ PieChart: "Estado de Respuestas"
- ✅ PieChart: "Clasificación de Respuestas"
- ✅ Card "Resumen de Actividad" con 3 estadísticas

#### Test 3.2: Filtros Temporales
1. Click en select "Últimos 30 días"
2. Probar opciones: 7, 30, 90 días

**Resultado esperado:**
- ✅ Select funciona correctamente
- ✅ Opciones disponibles
- ✅ (En producción filtrarían datos)

#### Test 3.3: Interactividad de Gráficas
1. Hover sobre barras en BarChart
2. Hover sobre sectores en PieCharts

**Resultado esperado:**
- ✅ Tooltips aparecen con datos
- ✅ Animaciones suaves
- ✅ Gráficas responsive

---

### ✅ 4. MODAL EMBEDDABLE

#### Test 4.1: Responder Encuesta como Usuario
1. Navegar a: http://localhost:5174/survey/application
2. Verificar UI del modal (si está implementado como página)
3. Responder todas las preguntas
4. Click en "Enviar Respuestas"

**Resultado esperado:**
- ✅ Preguntas se muestran correctamente
- ✅ Inputs funcionan (text, select, radio, checkbox)
- ✅ Botón deshabilitado si faltan respuestas obligatorias
- ✅ Toast de éxito al enviar
- ✅ Mensaje "¡Gracias por tu feedback!"

#### Test 4.2: Componente SurveyModal
1. Abrir archivo: `cliente/src/components/SurveyModal.tsx`
2. Verificar funcionalidades implementadas:
   - Barra de progreso
   - Contador X/Y preguntas
   - Validación obligatorias

**Resultado esperado:**
- ✅ Componente existe y compila
- ✅ Props correctamente tipadas
- ✅ Lógica de progreso implementada

---

### ✅ 5. WIDGET EMBEDDABLE

#### Test 5.1: Página Demo
1. Navegar a: http://localhost:5174/demo.html
2. Probar los 4 botones de demo

**Resultado esperado:**
- ✅ Página HTML carga correctamente
- ✅ Botón "Demo Botón Flotante": aparece botón en esquina
- ✅ Botón "Demo Auto": alert y modal después de 3s
- ✅ Botón "Demo Scroll": instrucciones correctas
- ✅ Botón "Demo Exit": instrucciones correctas

#### Test 5.2: Script embed.js
1. Abrir: http://localhost:5174/embed.js
2. Verificar que carga sin errores

**Resultado esperado:**
- ✅ Script JavaScript válido
- ✅ Sin errores 404
- ✅ Contiene clase MagnetoSurvey

#### Test 5.3: Integración Externa (Simulada)
1. Crear archivo HTML de prueba local:
```html
<!DOCTYPE html>
<html>
<head><title>Test</title></head>
<body>
  <h1>Mi Sitio Web</h1>
  <script src="http://localhost:5174/embed.js"></script>
  <script>
    MagnetoSurvey.init({
      surveyType: 'application',
      trigger: 'button',
      buttonText: '📋 Test',
      position: 'bottom-right'
    });
  </script>
</body>
</html>
```
2. Abrir en navegador

**Resultado esperado:**
- ✅ Botón aparece en esquina
- ✅ Click abre iframe con encuesta

---

### ✅ 6. SEO Y META TAGS

#### Test 6.1: Meta Tags en HTML
1. Abrir: http://localhost:5174
2. Ver código fuente (Ctrl+U)
3. Buscar meta tags

**Resultado esperado:**
- ✅ `<html lang="es">`
- ✅ Meta description presente
- ✅ Meta keywords presente
- ✅ Open Graph tags (og:title, og:description, og:image)
- ✅ Twitter cards (twitter:card, twitter:title)
- ✅ Geo tags (geo.region)
- ✅ Structured data (JSON-LD)

#### Test 6.2: robots.txt
1. Navegar a: http://localhost:5174/robots.txt

**Resultado esperado:**
- ✅ Archivo carga correctamente
- ✅ Contiene: User-agent, Allow, Disallow, Sitemap

#### Test 6.3: sitemap.xml
1. Navegar a: http://localhost:5174/sitemap.xml

**Resultado esperado:**
- ✅ Archivo carga correctamente
- ✅ XML válido
- ✅ Contiene URLs principales

---

### ✅ 7. RESPONSIVE DESIGN

#### Test 7.1: Desktop (1920x1080)
1. Abrir DevTools (F12)
2. Responsive mode: Desktop
3. Navegar por todas las páginas

**Resultado esperado:**
- ✅ Layout en 3 columnas (donde aplique)
- ✅ Gráficas ocupan mitad de pantalla
- ✅ Cards con buen spacing
- ✅ Sin scroll horizontal

#### Test 7.2: Tablet (768x1024)
1. Responsive mode: iPad
2. Navegar por todas las páginas

**Resultado esperado:**
- ✅ Layout en 2 columnas
- ✅ Gráficas stack verticalmente
- ✅ Botones accesibles
- ✅ Touch targets >44px

#### Test 7.3: Mobile (375x667)
1. Responsive mode: iPhone SE
2. Navegar por todas las páginas

**Resultado esperado:**
- ✅ Layout en 1 columna
- ✅ Texto legible
- ✅ Botones full-width
- ✅ Modal ocupa 95% de pantalla

---

### ✅ 8. PERFORMANCE

#### Test 8.1: Tiempo de Carga
1. Abrir DevTools > Network
2. Recargar página principal
3. Verificar tiempo total

**Resultado esperado:**
- ✅ First Paint < 1s
- ✅ DOMContentLoaded < 2s
- ✅ Load completo < 5s

#### Test 8.2: Bundle Size
1. Build de producción:
```bash
npm run build
```
2. Verificar dist/assets/

**Resultado esperado:**
- ✅ index.js < 500KB
- ✅ vendor.js < 200KB
- ✅ CSS < 50KB

---

### ✅ 9. NAVEGACIÓN

#### Test 9.1: Rutas Principales
Verificar que todas las rutas funcionan:

- ✅ `/` - Home
- ✅ `/login` - Login
- ✅ `/register` - Register
- ✅ `/admin` - Admin Dashboard
- ✅ `/admin/surveys` - Listado Encuestas
- ✅ `/admin/create-survey` - Crear Encuesta
- ✅ `/admin/surveys/:id` - Detalle Encuesta
- ✅ `/admin/metrics` - Métricas
- ✅ `/survey/:type` - Encuesta Pública

#### Test 9.2: Navegación entre Páginas
1. Desde Admin, click "Métricas"
2. Click botón "Atrás" (ArrowLeft)
3. Click "Mis Encuestas"
4. Click "Nueva Encuesta"

**Resultado esperado:**
- ✅ Todas las navegaciones funcionan
- ✅ Botones "Atrás" correctos
- ✅ Sin errores en consola

---

### ✅ 10. VALIDACIONES

#### Test 10.1: Formulario Crear Encuesta
1. Intentar guardar sin título
2. Intentar guardar sin preguntas
3. Intentar guardar pregunta sin texto

**Resultado esperado:**
- ✅ Validación impide guardar
- ✅ Mensajes de error claros
- ✅ Focus en campo con error

#### Test 10.2: Modal Encuesta
1. Abrir encuesta con preguntas obligatorias
2. Intentar enviar sin responder

**Resultado esperado:**
- ✅ Toast error: "responde todas las obligatorias"
- ✅ Botón puede estar deshabilitado
- ✅ Preguntas obligatorias marcadas con *

---

## 🐛 ERRORES CONOCIDOS (No Críticos)

### Warning de TypeScript
- ⚠️ `chart.tsx`: Tipos de Recharts con warnings (no afecta funcionalidad)
- ⚠️ `baseUrl deprecated`: Se puede ignorar hasta TypeScript 7.0

### Pendientes Menores
- ⏳ Login: falta límite de 3 intentos
- ⏳ Filtros en SurveyList: por implementar
- ⏳ Code splitting: pendiente optimización

---

## ✅ CHECKLIST FINAL

Marca lo que has probado:

- [ ] Backend corre sin errores
- [ ] Frontend corre sin errores
- [ ] Puedo crear encuestas
- [ ] Puedo ver listado de encuestas
- [ ] Puedo ver detalle de encuesta
- [ ] Puedo eliminar encuestas (con confirmación)
- [ ] Dashboard de métricas carga correctamente
- [ ] 3 gráficas Recharts se muestran
- [ ] Filtros temporales funcionan
- [ ] Modal de encuesta funciona
- [ ] Widget embed.js carga
- [ ] Demo.html funciona
- [ ] Meta tags presentes
- [ ] robots.txt accesible
- [ ] sitemap.xml accesible
- [ ] Responsive en mobile
- [ ] Responsive en tablet
- [ ] Navegación funciona
- [ ] Validaciones activas

---

## 🚀 COMANDOS ÚTILES

### Desarrollo
```bash
# Terminal 1 - Backend
cd servidor && npm run dev

# Terminal 2 - Frontend
cd cliente && npm run dev
```

### Build Producción
```bash
cd cliente
npm run build
npm run preview  # Ver build localmente
```

### Testing Manual
```bash
# Abrir en navegador
http://localhost:5174         # App principal
http://localhost:5174/admin   # Admin
http://localhost:5174/demo.html  # Demo widget
```

---

## 📊 RESULTADOS ESPERADOS

### Si Todo Funciona Correctamente:
✅ **8/10 tareas completadas** (86%)  
✅ **12/14 requisitos funcionales** (86%)  
✅ **6/6 requisitos no funcionales** (100%)  
✅ **0 errores críticos**  
✅ **Listo para revisión y deployment**

---

**Última actualización:** 11 de Noviembre de 2025  
**Tiempo estimado de testing completo:** ~30-45 minutos
