# 🎯 Demo del Widget Embebible MAGNETO

## Descripción

Este directorio contiene los archivos necesarios para demostrar el funcionamiento del widget embebible de encuestas MAGNETO.

## Archivos

### `embed.js`
Script principal del widget embebible que puede ser integrado en cualquier sitio web.

**Características:**
- ✅ Múltiples modos de activación (button, auto, scroll, exit)
- ✅ Soporte para diferentes tipos de encuesta (postulación, deserción, satisfacción)
- ✅ Personalización completa (posición, texto, delay)
- ✅ Tracking de eventos
- ✅ Comunicación con iframe

### `demo.html`
Página de demostración interactiva del widget.

**Incluye:**
- 📋 Documentación de uso
- 🎨 Ejemplos de personalización
- 🧪 Demos interactivos
- 📊 Características y opciones

## Uso Rápido

### 1. Iniciar el servidor de desarrollo

```bash
# Desde la carpeta raíz del proyecto cliente
npm run dev
```

### 2. Abrir la demo

Navegar a: `http://localhost:5173/demo.html`

### 3. Probar los diferentes modos

- **Demo Postulación**: Encuesta para feedback tras aplicar a vacante
- **Demo Deserción**: Encuesta para entender abandono de proceso
- **Demo Auto**: Encuesta que se abre automáticamente
- **Demo Scroll**: Encuesta que se activa al hacer scroll

## Integración en tu sitio web

### Instalación Básica

```html
<!-- Cargar el script de MAGNETO -->
<script src="https://tu-dominio.com/embed.js"></script>

<!-- Inicializar -->
<script>
  MagnetoSurvey.init({
    surveyType: 'postulacion',
    trigger: 'button',
    buttonText: '📋 Dar Feedback',
    position: 'bottom-right',
    jobTitle: 'Desarrollador Full Stack',
    onComplete: function() {
      console.log('¡Encuesta completada!');
    }
  });
</script>
```

### Ejemplo: Tras Aplicar a Vacante

```javascript
// Cuando el usuario hace clic en "Aplicar"
document.getElementById('apply-button').addEventListener('click', function() {
  // Tu lógica de aplicación aquí...
  
  // Mostrar encuesta
  MagnetoSurvey.init({
    surveyType: 'postulacion',
    trigger: 'auto',
    delay: 1000,
    jobTitle: document.querySelector('.job-title').textContent,
    onComplete: function() {
      alert('¡Gracias por tu feedback!');
    }
  });
});
```

### Ejemplo: Al Abandonar Proceso

```javascript
// Cuando el usuario hace clic en "Abandonar"
document.getElementById('abandon-button').addEventListener('click', function() {
  MagnetoSurvey.init({
    surveyType: 'desercion',
    trigger: 'auto',
    delay: 500,
    jobTitle: 'Diseñador UX/UI',
    onNoResponse: function() {
      // Continuar con el abandono aunque no responda
      window.location.href = '/home';
    },
    onComplete: function() {
      // Agradecer y continuar
      window.location.href = '/home';
    }
  });
});
```

## Configuración Completa

### Opciones Disponibles

| Opción | Tipo | Por Defecto | Descripción |
|--------|------|-------------|-------------|
| `surveyType` | string | 'postulacion' | Tipo de encuesta: 'postulacion', 'desercion', 'satisfaccion', 'custom' |
| `trigger` | string | 'button' | Modo de activación: 'button', 'auto', 'scroll', 'exit' |
| `buttonText` | string | '📋 Dar Feedback' | Texto del botón flotante |
| `position` | string | 'bottom-right' | Posición: 'bottom-right', 'bottom-left', 'top-right', 'top-left' |
| `delay` | number | 3000 | Delay en ms (solo para trigger 'auto') |
| `jobTitle` | string | '' | Nombre de la vacante |
| `vacancyName` | string | '' | Alias de jobTitle |
| `onComplete` | function | null | Callback cuando se completa |
| `onNoResponse` | function | null | Callback cuando se cierra sin responder |

### Tipos de Encuesta

1. **Postulación** (`postulacion` / `application`)
   - Para capturar feedback tras aplicar a vacante
   - Mide experiencia del proceso de aplicación

2. **Deserción** (`desercion` / `abandonment`)
   - Para entender por qué abandonan el proceso
   - Identifica puntos de fricción

3. **Satisfacción** (`satisfaccion` / `satisfaction`)
   - Para medir satisfacción general
   - Puede usarse en múltiples contextos

4. **Personalizada** (`custom`)
   - Para encuestas específicas de tu negocio

### Triggers (Modos de Activación)

1. **Button** - Botón Flotante
   ```javascript
   { trigger: 'button', position: 'bottom-right' }
   ```

2. **Auto** - Automático
   ```javascript
   { trigger: 'auto', delay: 3000 }
   ```

3. **Scroll** - Por Desplazamiento
   ```javascript
   { trigger: 'scroll' } // Se activa al 75% del scroll
   ```

4. **Exit** - Intento de Salida
   ```javascript
   { trigger: 'exit' } // Se activa al intentar salir
   ```

## Personalización Avanzada

### Estilos Personalizados

Puedes personalizar los estilos del botón con CSS:

```html
<style>
  #magneto-button {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
    font-family: 'Tu Fuente', sans-serif !important;
  }
</style>
```

### Tracking con Google Analytics

```javascript
MagnetoSurvey.init({
  surveyType: 'postulacion',
  trigger: 'button',
  onComplete: function() {
    // Track con GA4
    gtag('event', 'survey_completed', {
      'event_category': 'Engagement',
      'event_label': 'Postulacion Survey'
    });
  }
});
```

## Casos de Uso

### 1. Portal de Empleo

```javascript
// Al aplicar a vacante
MagnetoSurvey.init({
  surveyType: 'postulacion',
  trigger: 'auto',
  delay: 2000,
  jobTitle: vacancy.title,
  position: 'bottom-right'
});
```

### 2. Plataforma de E-learning

```javascript
// Al completar un curso
MagnetoSurvey.init({
  surveyType: 'satisfaccion',
  trigger: 'auto',
  delay: 1000,
  jobTitle: course.name
});
```

### 3. Proceso de Onboarding

```javascript
// Durante el proceso
MagnetoSurvey.init({
  surveyType: 'satisfaccion',
  trigger: 'exit',
  jobTitle: 'Proceso de Onboarding'
});
```

## Características Técnicas

### Seguridad
- ✅ CORS configurado correctamente
- ✅ Validación de origen de mensajes
- ✅ Sin dependencias externas maliciosas

### Performance
- ⚡ Script ligero (< 10KB)
- ⚡ Carga asíncrona
- ⚡ No bloquea el DOM

### Compatibilidad
- ✅ Todos los navegadores modernos
- ✅ IE11+ con polyfills
- ✅ Responsive (mobile, tablet, desktop)

### Accesibilidad
- ♿ Teclado navegable
- ♿ Screen reader friendly
- ♿ ARIA labels

## Solución de Problemas

### El widget no aparece

1. Verifica que el script esté cargado
2. Revisa la consola del navegador
3. Confirma que `MagnetoSurvey.init()` se llama después de que el DOM esté listo

### El modal no se abre

1. Verifica que el servidor esté corriendo
2. Revisa la URL en `API_BASE_URL`
3. Confirma que hay encuestas activas del tipo especificado

### Las respuestas no se guardan

1. Verifica la conexión a internet
2. Revisa que el backend esté funcionando
3. Confirma que el usuario responda las preguntas obligatorias

## Desarrollo

### Modificar el Widget

```bash
# Editar embed.js
nano cliente/public/embed.js

# Probar cambios
npm run dev

# Abrir demo
open http://localhost:5173/demo.html
```

### Agregar Nuevas Características

1. Editar `embed.js`
2. Actualizar `demo.html` con ejemplos
3. Documentar en este README
4. Probar en diferentes navegadores

## Soporte

¿Necesitas ayuda?

1. Revisa este README
2. Consulta `MEJORAS_ENVIO_ENCUESTAS.md`
3. Abre un issue en GitHub
4. Contacta al equipo de desarrollo

## Licencia

Este proyecto es parte de MAGNETO Embeddable Tool - Universidad EAFIT

---

**Última Actualización:** 12 de Noviembre de 2025  
**Versión del Widget:** 2.0.0
