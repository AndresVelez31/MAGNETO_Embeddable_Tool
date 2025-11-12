/**
 * Magneto Embeddable Survey Widget
 * 
 * Este script permite integrar encuestas de Magneto en sitios web externos.
 * 
 * Uso:
 * <script src="https://magneto-tool.com/embed.js"></script>
 * <script>
 *   MagnetoSurvey.init({
 *     surveyType: 'application', // 'application', 'abandonment', 'custom'
 *     trigger: 'button', // 'button', 'auto', 'scroll', 'exit'
 *     buttonText: 'Dar Feedback',
 *     position: 'bottom-right', // 'bottom-right', 'bottom-left', 'top-right', 'top-left'
 *     delay: 3000, // Delay para trigger 'auto' en ms
 *     jobTitle: 'Desarrollador Full Stack', // Opcional
 *     onComplete: function() { console.log('Survey completed!'); }
 *   });
 * </script>
 */

(function(window, document) {
  'use strict';

  const API_BASE_URL = window.MAGNETO_API_URL || 'https://magneto-tool.com';
  
  class MagnetoSurvey {
    constructor() {
      this.config = {};
      this.isOpen = false;
      this.modalElement = null;
      this.buttonElement = null;
    }

    /**
     * Inicializa el widget con la configuración proporcionada
     */
    init(config = {}) {
      this.config = {
        surveyType: config.surveyType || 'application',
        trigger: config.trigger || 'button',
        buttonText: config.buttonText || '📋 Dar Feedback',
        position: config.position || 'bottom-right',
        delay: config.delay || 3000,
        jobTitle: config.jobTitle || '',
        onComplete: config.onComplete || function() {},
        onNoResponse: config.onNoResponse || function() {}
      };

      this.injectStyles();
      
      switch(this.config.trigger) {
        case 'button':
          this.createButton();
          break;
        case 'auto':
          setTimeout(() => this.openModal(), this.config.delay);
          break;
        case 'scroll':
          this.setupScrollTrigger();
          break;
        case 'exit':
          this.setupExitTrigger();
          break;
      }
    }

    /**
     * Inyecta los estilos CSS necesarios
     */
    injectStyles() {
      if (document.getElementById('magneto-styles')) return;

      const styles = `
        #magneto-button {
          position: fixed;
          z-index: 9998;
          padding: 12px 24px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          border-radius: 50px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
          transition: all 0.3s ease;
          font-family: system-ui, -apple-system, sans-serif;
        }
        
        #magneto-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(102, 126, 234, 0.5);
        }
        
        #magneto-button.bottom-right {
          bottom: 20px;
          right: 20px;
        }
        
        #magneto-button.bottom-left {
          bottom: 20px;
          left: 20px;
        }
        
        #magneto-button.top-right {
          top: 20px;
          right: 20px;
        }
        
        #magneto-button.top-left {
          top: 20px;
          left: 20px;
        }
        
        #magneto-modal {
          position: fixed;
          z-index: 9999;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0, 0, 0, 0.7);
          display: none;
          align-items: center;
          justify-content: center;
          animation: fadeIn 0.3s ease;
        }
        
        #magneto-modal.show {
          display: flex;
        }
        
        #magneto-modal-content {
          background: white;
          border-radius: 12px;
          max-width: 600px;
          max-height: 90vh;
          overflow-y: auto;
          width: 90%;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
          animation: slideUp 0.3s ease;
        }
        
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes slideUp {
          from { transform: translateY(30px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        
        @media (max-width: 768px) {
          #magneto-modal-content {
            width: 95%;
            max-height: 95vh;
          }
          
          #magneto-button {
            padding: 10px 20px;
            font-size: 14px;
          }
        }
      `;

      const styleSheet = document.createElement('style');
      styleSheet.id = 'magneto-styles';
      styleSheet.textContent = styles;
      document.head.appendChild(styleSheet);
    }

    /**
     * Crea el botón flotante
     */
    createButton() {
      if (this.buttonElement) return;

      this.buttonElement = document.createElement('button');
      this.buttonElement.id = 'magneto-button';
      this.buttonElement.className = this.config.position;
      this.buttonElement.textContent = this.config.buttonText;
      this.buttonElement.onclick = () => this.openModal();
      
      document.body.appendChild(this.buttonElement);
    }

    /**
     * Configura trigger por scroll (75% de la página)
     */
    setupScrollTrigger() {
      let triggered = false;
      window.addEventListener('scroll', () => {
        if (triggered) return;
        
        const scrollPercent = (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100;
        if (scrollPercent >= 75) {
          triggered = true;
          this.openModal();
        }
      });
    }

    /**
     * Configura trigger por intento de salida
     */
    setupExitTrigger() {
      let triggered = false;
      document.addEventListener('mouseout', (e) => {
        if (triggered) return;
        if (e.clientY <= 0) {
          triggered = true;
          this.openModal();
        }
      });
    }

    /**
     * Abre el modal con la encuesta
     */
    async openModal() {
      if (this.isOpen) return;
      this.isOpen = true;

      // Crear modal si no existe
      if (!this.modalElement) {
        this.modalElement = document.createElement('div');
        this.modalElement.id = 'magneto-modal';
        
        const content = document.createElement('div');
        content.id = 'magneto-modal-content';
        
        this.modalElement.appendChild(content);
        document.body.appendChild(this.modalElement);
        
        // Cerrar al hacer clic fuera
        this.modalElement.addEventListener('click', (e) => {
          if (e.target === this.modalElement) {
            this.closeModal(true);
          }
        });
      }

      // Cargar iframe con la encuesta
      const iframe = document.createElement('iframe');
      iframe.src = `${API_BASE_URL}/survey/${this.config.surveyType}?embedded=true&jobTitle=${encodeURIComponent(this.config.jobTitle)}`;
      iframe.style.width = '100%';
      iframe.style.height = '80vh';
      iframe.style.border = 'none';
      iframe.style.borderRadius = '12px';
      
      const content = this.modalElement.querySelector('#magneto-modal-content');
      content.innerHTML = '';
      content.appendChild(iframe);
      
      this.modalElement.classList.add('show');
      document.body.style.overflow = 'hidden';

      // Escuchar mensajes del iframe
      window.addEventListener('message', this.handleMessage.bind(this));
    }

    /**
     * Cierra el modal
     */
    closeModal(noResponse = false) {
      if (!this.isOpen) return;
      this.isOpen = false;
      
      if (this.modalElement) {
        this.modalElement.classList.remove('show');
      }
      
      document.body.style.overflow = '';
      
      if (noResponse) {
        this.config.onNoResponse();
        // Registrar en analytics
        this.trackEvent('survey_closed_no_response');
      }
    }

    /**
     * Maneja mensajes del iframe
     */
    handleMessage(event) {
      if (event.origin !== API_BASE_URL) return;
      
      if (event.data.type === 'survey_completed') {
        this.config.onComplete(event.data.data);
        this.closeModal();
        this.trackEvent('survey_completed');
      } else if (event.data.type === 'survey_closed') {
        this.closeModal(true);
      }
    }

    /**
     * Tracking de eventos (puede integrarse con Google Analytics)
     */
    trackEvent(eventName, data = {}) {
      if (window.gtag) {
        window.gtag('event', eventName, {
          event_category: 'Magneto Survey',
          event_label: this.config.surveyType,
          ...data
        });
      }
      
      // También enviar a servidor de Magneto para métricas propias
      fetch(`${API_BASE_URL}/api/analytics`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event: eventName,
          surveyType: this.config.surveyType,
          timestamp: new Date().toISOString(),
          ...data
        })
      }).catch(() => {}); // Fail silently
    }
  }

  // Exponer API global
  window.MagnetoSurvey = new MagnetoSurvey();

})(window, document);

// Auto-inicializar si hay configuración en el data attribute
document.addEventListener('DOMContentLoaded', function() {
  const script = document.querySelector('script[data-magneto-config]');
  if (script) {
    try {
      const config = JSON.parse(script.getAttribute('data-magneto-config'));
      window.MagnetoSurvey.init(config);
    } catch (e) {
      console.error('Magneto: Invalid config', e);
    }
  }
});
