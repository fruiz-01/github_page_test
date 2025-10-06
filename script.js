// ============================================
// ISF CHILE - ALCANCÍAS DIGITALES
// Sistema de tracking de voluntarios
// ============================================

(function() {
  'use strict';

  // ============================================
  // 1. DETECTAR Y GUARDAR VOLUNTARIO
  // ============================================
  function inicializarTracking() {
    const urlParams = new URLSearchParams(window.location.search);
    const voluntarioParam = urlParams.get('vol');
    
    if (voluntarioParam) {
      localStorage.setItem('isf_voluntario', voluntarioParam);
      console.log('✅ Voluntario detectado:', voluntarioParam);
      personalizarMensaje(voluntarioParam);
    }
    
    // Mostrar mensaje si ya hay un voluntario guardado
    const voluntarioActual = localStorage.getItem('isf_voluntario');
    if (voluntarioActual && !voluntarioParam) {
      personalizarMensaje(voluntarioActual);
    }
  }

  // ============================================
  // 2. PERSONALIZAR MENSAJE EN LA PÁGINA
  // ============================================
  function personalizarMensaje(codigoVoluntario) {
    // Convertir "juan_perez" → "Juan Perez"
    const nombreFormateado = codigoVoluntario
      .split('_')
      .map(palabra => palabra.charAt(0).toUpperCase() + palabra.slice(1))
      .join(' ');
    
    // Buscar el elemento donde mostrar el mensaje
    const hero = document.querySelector('.hero');
    
    if (hero) {
      // Crear div para el mensaje si no existe
      let mensajeDiv = document.getElementById('mensaje-voluntario');
      
      if (!mensajeDiv) {
        mensajeDiv = document.createElement('div');
        mensajeDiv.id = 'mensaje-voluntario';
        mensajeDiv.style.cssText = `
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 15px 20px;
          border-radius: 10px;
          margin: 20px auto;
          max-width: 600px;
          text-align: center;
          box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
          animation: slideIn 0.5s ease-out;
        `;
        
        // Insertar después del título del hero
        const heroContent = hero.querySelector('.hero-content');
        if (heroContent) {
          heroContent.appendChild(mensajeDiv);
        }
      }
      
      mensajeDiv.innerHTML = `
        <p style="margin: 0; font-size: 1.1rem;">
          🤝 Estás apoyando la campaña de <strong>${nombreFormateado}</strong>
        </p>
      `;
    }
  }

  // ============================================
  // 3. FUNCIÓN PRINCIPAL: IR A DONAR
  // ============================================
  function irADonar(monto) {
    // Obtener voluntario (o 'directo' si llegó sin referral)
    const voluntario = localStorage.getItem('isf_voluntario') || 'directo';
    
    // Generar UUID único para esta transacción
    const uuid = generarUUID();
    
    // IMPORTANTE: Ajustar según documentación real de Payku
    const paykuConfig = {
      baseUrl: 'https://app.payku.cl/payment', // ← VERIFICAR CON PAYKU
      publicKey: 'tu_public_key_aqui' // ← AGREGAR TU KEY
    };
    
    // Construir parámetros
    const params = new URLSearchParams({
      amount: monto,
      subject: 'Donación ISF Chile',
      external_id: uuid,
      'custom_fields[voluntario]': voluntario,
      'custom_fields[campana]': 'alcancia_digital_2025',
      return_url: `${window.location.origin}/gracias.html?uuid=${uuid}`,
      cancel_url: window.location.href
    });
    
    const urlCompleta = `${paykuConfig.baseUrl}?${params.toString()}`;
    
    // Log para debugging (comentar en producción)
    console.log('🚀 Datos de donación:', {
      monto: monto,
      voluntario: voluntario,
      uuid: uuid,
      timestamp: new Date().toISOString()
    });
    
    // Redirigir a Payku
    window.location.href = urlCompleta;
  }

  // ============================================
  // 4. GENERAR UUID (compatible con todos los navegadores)
  // ============================================
  function generarUUID() {
    // Usar crypto.randomUUID si está disponible (navegadores modernos)
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      return crypto.randomUUID();
    }
    
    // Fallback para navegadores antiguos
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  // ============================================
  // 5. INICIALIZAR BOTONES DE DONACIÓN
  // ============================================
  function inicializarBotones() {
    // Buscar todos los botones con clase 'donation-btn'
    const botones = document.querySelectorAll('.donation-btn');
    
    botones.forEach(boton => {
      boton.addEventListener('click', function(e) {
        e.preventDefault();
        
        // Obtener monto del data-attribute o del texto del botón
        let monto = this.getAttribute('data-monto');
        
        if (!monto) {
          // Extraer del texto: "Donar $5.000" → 5000
          const texto = this.textContent;
          const match = texto.match(/\$?([\d.,]+)/);
          if (match) {
            monto = match[1].replace(/[.,]/g, '');
          }
        }
        
        if (monto) {
          irADonar(parseInt(monto));
        } else {
          console.error('❌ No se pudo determinar el monto');
          alert('Error: No se pudo procesar la donación. Por favor intenta nuevamente.');
        }
      });
    });
    
    console.log(`✅ ${botones.length} botones de donación inicializados`);
  }

  // ============================================
  // 6. INICIAR TODO CUANDO EL DOM ESTÉ LISTO
  // ============================================
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
      inicializarTracking();
      inicializarBotones();
    });
  } else {
    inicializarTracking();
    inicializarBotones();
  }

  // ============================================
  // 7. EXPONER FUNCIÓN GLOBALMENTE (opcional)
  // ============================================
  window.ISFDonaciones = {
    irADonar: irADonar,
    obtenerVoluntario: function() {
      return localStorage.getItem('isf_voluntario');
    },
    limpiarVoluntario: function() {
      localStorage.removeItem('isf_voluntario');
      console.log('🧹 Voluntario limpiado del storage');
    }
  };

})();
