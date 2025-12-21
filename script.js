// ============================
// CONFIGURACIÓN Y DETECCIÓN
// ============================

// Detectar si es un dispositivo lento
const isSlowDevice = (() => {
  // Heurísticas para detectar dispositivos antiguos/lentos
  const ua = navigator.userAgent;
  const isOldAndroid = /Android [2-4]/.test(ua);
  const isOldIOS = /iOS [7-9]/.test(ua);
  const isOldBrowser = /MSIE|Trident/.test(ua);
  const lowCores = navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 2;
  const lowMemory = navigator.deviceMemory && navigator.deviceMemory <= 2;
  
  return isOldAndroid || isOldIOS || isOldBrowser || lowCores || lowMemory;
})();

// Aplicar optimizaciones para dispositivos lentos
if (isSlowDevice) {
  console.log('Dispositivo lento detectado - aplicando optimizaciones');
  document.documentElement.classList.add('slow-device');
  
  // Crear estilo para optimizaciones
  const style = document.createElement('style');
  style.textContent = `
    .slow-device * {
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.01ms !important;
    }
    .slow-device .video-background video {
      opacity: 0.7;
    }
  `;
  document.head.appendChild(style);
}

// ============================
// SISTEMA DE MÚSICA DE FONDO
// ============================

// Variables globales para la música
let backgroundMusic = null;
let isMusicPlaying = false;
let musicVolume = 0.5; // Volumen por defecto al 50%

// Inicializar el reproductor de música
function initializeMusic() {
  if (backgroundMusic) return backgroundMusic;
  
  backgroundMusic = new Audio('media/song.mp3');
  backgroundMusic.loop = true;
  backgroundMusic.volume = musicVolume;
  
  // Optimizar para dispositivos lentos
  if (isSlowDevice) {
    backgroundMusic.preload = 'none'; // No precargar en dispositivos lentos
  } else {
    backgroundMusic.preload = 'metadata'; // Precargar solo metadatos
  }
  
  // Manejar eventos de música
  backgroundMusic.addEventListener('canplaythrough', () => {
    console.log('🎵 Música cargada y lista para reproducir');
  });
  
  backgroundMusic.addEventListener('error', (e) => {
    console.error('❌ Error al cargar la música:', e);
  });
  
  return backgroundMusic;
}

// Reproducir música de fondo
async function playBackgroundMusic() {
  try {
    const music = initializeMusic();
    
    if (!isMusicPlaying) {
      // En navegadores modernos, necesitamos interacción del usuario primero
      music.volume = 0; // Empezar en silencio
      await music.play();
      
      // Fade in suave del volumen
      fadeVolumeIn(music, 0, musicVolume, 2000);
      
      isMusicPlaying = true;
      console.log('🎵 Música de fondo iniciada');
      
      // Actualizar icono del botón de mute si existe
      updateMusicButtonIcon(true);
    }
  } catch (error) {
    console.log('⚠️ No se pudo reproducir la música automáticamente:', error.message);
    
    // Crear un botón de "activar música" si falla el autoplay
    createMusicEnableButton();
  }
}

// Función para fade in del volumen
function fadeVolumeIn(audio, startVolume, endVolume, duration) {
  const steps = 20;
  const stepTime = duration / steps;
  const volumeStep = (endVolume - startVolume) / steps;
  let currentStep = 0;
  
  audio.volume = startVolume;
  
  const fadeInterval = setInterval(() => {
    currentStep++;
    audio.volume = startVolume + (volumeStep * currentStep);
    
    if (currentStep >= steps) {
      clearInterval(fadeInterval);
      audio.volume = endVolume;
    }
  }, stepTime);
}

// Función para fade out del volumen
function fadeVolumeOut(audio, startVolume, endVolume, duration) {
  const steps = 20;
  const stepTime = duration / steps;
  const volumeStep = (startVolume - endVolume) / steps;
  let currentStep = 0;
  
  audio.volume = startVolume;
  
  const fadeInterval = setInterval(() => {
    currentStep++;
    audio.volume = startVolume - (volumeStep * currentStep);
    
    if (currentStep >= steps) {
      clearInterval(fadeInterval);
      audio.volume = endVolume;
      audio.pause();
      isMusicPlaying = false;
      updateMusicButtonIcon(false);
    }
  }, stepTime);
}

// Pausar música de fondo
function pauseBackgroundMusic() {
  if (backgroundMusic && isMusicPlaying) {
    fadeVolumeOut(backgroundMusic, musicVolume, 0, 1000);
    console.log('⏸️ Música pausada');
  }
}

// Reanudar música de fondo
async function resumeBackgroundMusic() {
  if (backgroundMusic && !isMusicPlaying) {
    try {
      backgroundMusic.volume = 0;
      await backgroundMusic.play();
      fadeVolumeIn(backgroundMusic, 0, musicVolume, 1000);
      isMusicPlaying = true;
      console.log('▶️ Música reanudada');
      updateMusicButtonIcon(true);
    } catch (error) {
      console.log('Error al reanudar música:', error);
    }
  }
}

// Alternar música (play/pause)
async function toggleBackgroundMusic() {
  if (isMusicPlaying) {
    pauseBackgroundMusic();
  } else {
    await resumeBackgroundMusic();
  }
}

// Actualizar icono del botón de música
function updateMusicButtonIcon(playing) {
  const muteIcon = document.querySelector('.mute-button i');
  if (muteIcon) {
    muteIcon.className = playing ? 'fas fa-volume-up' : 'fas fa-volume-mute';
  }
}

// Crear botón para activar música si falla el autoplay
function createMusicEnableButton() {
  // Verificar si ya existe
  if (document.getElementById('enableMusicBtn')) return;
  
  const enableBtn = document.createElement('button');
  enableBtn.id = 'enableMusicBtn';
  enableBtn.className = 'enable-music-button';
  enableBtn.innerHTML = '<i class="fas fa-music"></i> Activar música';
  enableBtn.style.cssText = `
    position: fixed;
    bottom: 20px;
    right: 20px;
    background: rgba(0, 0, 0, 0.7);
    color: white;
    border: 2px solid gold;
    padding: 10px 15px;
    border-radius: 30px;
    cursor: pointer;
    z-index: 1000;
    font-family: inherit;
    display: flex;
    align-items: center;
    gap: 8px;
    transition: all 0.3s ease;
  `;
  
  enableBtn.addEventListener('click', async () => {
    try {
      await playBackgroundMusic();
      enableBtn.style.display = 'none';
    } catch (error) {
      console.log('Usuario necesita interactuar más:', error);
    }
  });
  
  enableBtn.addEventListener('mouseenter', () => {
    enableBtn.style.background = 'rgba(0, 0, 0, 0.9)';
    enableBtn.style.transform = 'scale(1.05)';
  });
  
  enableBtn.addEventListener('mouseleave', () => {
    enableBtn.style.background = 'rgba(0, 0, 0, 0.7)';
    enableBtn.style.transform = 'scale(1)';
  });
  
  document.body.appendChild(enableBtn);
  
  // Auto-ocultar después de 10 segundos
  setTimeout(() => {
    if (enableBtn.parentNode) {
      enableBtn.style.opacity = '0.5';
    }
  }, 10000);
}

// ============================
// PRECARGA INTELIGENTE DE IMÁGENES
// ============================

// Precargar solo imágenes críticas para el inicio
// Función actualizada para precargar imágenes críticas
function preloadCriticalImages() {
  return new Promise((resolve, reject) => {
    const isLandscape = window.innerWidth > window.innerHeight;
    const backgroundImage = isLandscape ? 'media/mesa.jpg' : 'media/mesa2.jpg';
    
    // Imágenes críticas para mostrar la pantalla inicial
    const criticalImages = [
      backgroundImage,
      'media/sello.png',
      'media/invitacion.jpg', // AÑADIDA: Precargar invitación también
      'media/title.png',
      'media/btn1.png', // Añadir imágenes de botones
      'media/btn2.png',
      'media/btn3.png',
      'media/btn4.png'
    ];
    
    let loaded = 0;
    const total = criticalImages.length;
    let hasError = false;
    
    // Timeout global para toda la carga
    const globalTimeout = setTimeout(() => {
      console.warn('⚠️ Timeout en precarga de imágenes');
      if (!hasError && loaded < total) {
        console.log(`Cargadas ${loaded} de ${total} imágenes`);
        resolve(backgroundImage);
      }
    }, 10000); // 10 segundos máximo
    
    // Función para verificar si todas están cargadas
    const checkAllLoaded = () => {
      loaded++;
      
      // Actualizar texto de carga si existe
      const loadingText = document.querySelector('.loading-text');
      if (loadingText) {
        loadingText.textContent = `Cargando invitación... ${Math.round((loaded/total)*100)}%`;
      }
      
      if (loaded === total) {
        clearTimeout(globalTimeout);
        console.log('✅ Todas las imágenes críticas cargadas');
        resolve(backgroundImage);
      }
    };
    
    // Función para manejar errores
    const handleImageError = (src) => {
      console.error(`❌ Error al cargar imagen: ${src}`);
      hasError = true;
      checkAllLoaded();
    };
    
    // Precargar cada imagen con timeout individual
    criticalImages.forEach(src => {
      const img = new Image();
      
      // Timeout individual por imagen
      const individualTimeout = setTimeout(() => {
        if (!img.complete) {
          console.warn(`⚠️ Timeout en imagen: ${src}`);
          handleImageError(src);
        }
      }, 5000);
      
      img.onload = () => {
        clearTimeout(individualTimeout);
        console.log(`✅ Cargada: ${src}`);
        checkAllLoaded();
      };
      
      img.onerror = () => {
        clearTimeout(individualTimeout);
        handleImageError(src);
      };
      
      img.src = src;
      
      // Forzar la carga para imágenes críticas
      if (src === backgroundImage || src === 'media/invitacion.jpg') {
        img.loading = 'eager';
      }
    });
  });
}

// Cargar imágenes secundarias después del inicio
function lazyLoadSecondaryImages() {
  const secondaryImages = [
    'media/papel-textura-interior.jpg',
    'media/papel-textura-exterior.jpg',
    'media/iglesia.jpg',
    'media/cason.jpg',
    'media/wring.png',
    'media/wcocktail.png',
    'media/wdinner.png',
    'media/wparty.png',
    'media/wdress.png',
    'media/whotel.png'
  ];
  
  // Usar requestIdleCallback si está disponible, sino setTimeout
  const scheduleLoad = (callback) => {
    if ('requestIdleCallback' in window) {
      requestIdleCallback(callback, { timeout: 3000 });
    } else {
      setTimeout(callback, 1500);
    }
  };
  
  scheduleLoad(() => {
    secondaryImages.forEach(src => {
      const img = new Image();
      img.loading = 'lazy'; // Usar carga lazy
      img.src = src;
      img.onload = () => {
        console.log(`📦 Cargada imagen secundaria: ${src}`);
      };
    });
    console.log('📦 Imágenes secundarias en proceso de carga');
  });
}

// ============================
// INICIALIZACIÓN DE LA APLICACIÓN
// ============================

async function initializeApp() {
  console.log('🚀 Inicializando aplicación...');
  
  // 1. Precargar imágenes críticas
  const backgroundImage = await preloadCriticalImages();
  
  // 2. Configurar fondo inmediatamente
  setBackgroundImage(backgroundImage);
  
  // 3. Ajustar máscara
  adjustMaskClipPath();
  
  // 4. Mostrar contenido después de un mínimo de tiempo (mejor UX)
  setTimeout(() => {
    const loadingScreen = document.getElementById('loadingScreen');
    const envelopeScreen = document.getElementById('envelopeScreen');
    
    if (loadingScreen) {
      loadingScreen.classList.add('hidden');
    }
    if (envelopeScreen) {
      envelopeScreen.classList.add('loaded');
    }
    
    console.log('✨ Pantalla principal visible');
    
    // 5. Cargar imágenes secundarias en segundo plano
    lazyLoadSecondaryImages();
  }, isSlowDevice ? 800 : 500); // Más tiempo para dispositivos lentos
}

// ============================
// FUNCIONES DE UTILIDAD
// ============================

function setBackgroundImage(backgroundImage) {
  const envelopeScreen = document.querySelector('.envelope-screen');
  const envelopeMask = document.querySelector('.envelope-mask');
  
  if (envelopeScreen) {
    envelopeScreen.style.backgroundImage = `url('${backgroundImage}')`;
  }
  if (envelopeMask) {
    envelopeMask.style.backgroundImage = `url('${backgroundImage}')`;
  }
}

function adjustMaskClipPath() {
  const envelope = document.querySelector('.envelope');
  if (!envelope) return;
  
  const envelopeRect = envelope.getBoundingClientRect();
  const maskStart = Math.max(0, (envelopeRect.bottom / window.innerHeight) * 100);
  
  const mask = document.querySelector('.envelope-mask');
  if (mask) {
    mask.style.clipPath = `polygon(0% 100%, 100% 100%, 100% ${maskStart}%, 0% ${maskStart}%)`;
  }
}

function getBackgroundImage() {
  return window.innerWidth > window.innerHeight ? 'media/mesa.jpg' : 'media/mesa2.jpg';
}

// ============================
// MANEJO DE EVENTOS DE VENTANA
// ============================

let resizeTimeout;
window.addEventListener('resize', () => {
  clearTimeout(resizeTimeout);
  resizeTimeout = setTimeout(() => {
    setBackgroundImage(getBackgroundImage());
    adjustMaskClipPath();
  }, 100);
});

window.addEventListener('orientationchange', () => {
  setTimeout(() => {
    setBackgroundImage(getBackgroundImage());
    adjustMaskClipPath();
  }, 300);
});

// ============================
// INTERACTIVIDAD DEL SOBRE
// ============================

const seal = document.getElementById('seal');
const envelope = document.getElementById('envelope');
const envelopeScreen = document.getElementById('envelopeScreen');
const mainContent = document.getElementById('mainContent');
const video = document.getElementById('videoFondo');
const buttonsContainer = document.getElementById('buttonsContainer');
const muteButton = document.getElementById('muteButton');
const eyeButton = document.getElementById('eyeButton');
const videoBackground = document.getElementById('videoBackground');
const overlay = document.getElementById('overlay');
const dateSubtitleContainer = document.getElementById('dateSubtitleContainer');

// Prevenir múltiples clics en el sello
let sealClicked = false;

seal.addEventListener('click', () => {
  if (sealClicked) return;
  sealClicked = true;
  
  console.log("💌 Abriendo invitación...");
  
  // Animación del sello
  seal.classList.add('broken');

  // Abrir sobre
  setTimeout(() => {
    envelope.classList.add('open');
  }, 800);

  // Mostrar contenido principal
  setTimeout(() => {
    envelopeScreen.style.opacity = '0';
    
    setTimeout(() => {
      envelopeScreen.style.display = 'none';
      mainContent.classList.add('visible');
      
      // 1. Manejo del video optimizado
      if (isSlowDevice) {
        video.preload = 'auto';
        video.load();
      }
      
      video.muted = false;
      
      // Intentar reproducir el video
      const playPromise = video.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => {
          // Si autoplay falla, mostrar controles
          video.controls = true;
        });
      }
      
      document.body.style.overflow = 'hidden';
      
      // 2. Iniciar música de fondo junto con el video
      setTimeout(() => {
        playBackgroundMusic().catch(error => {
          console.log('Música no pudo iniciarse automáticamente:', error.message);
        });
      }, 500); // Pequeño delay para mejor experiencia
      
      // 3. Mostrar controles después de un momento
      setTimeout(() => {
        buttonsContainer.classList.add('visible');
        muteButton.classList.add('visible');
        eyeButton.classList.add('visible');
      }, 500);
    }, isSlowDevice ? 100 : 300);
  }, 4000);
});

// ============================
// CONTROLES DE VIDEO Y MÚSICA
// ============================

const muteIcon = muteButton.querySelector('i');
const eyeIcon = eyeButton.querySelector('i');
let elementsVisible = true;

// MODIFICADO: Ahora el botón de mute controla tanto video como música
muteButton.addEventListener('click', async () => {
  if (isMusicPlaying) {
    // Si la música está sonando, pausar todo
    pauseBackgroundMusic();
    video.muted = true;
    muteIcon.className = 'fas fa-volume-mute';
  } else {
    // Si está en silencio, reanudar todo
    await resumeBackgroundMusic();
    video.muted = false;
    muteIcon.className = 'fas fa-volume-up';
  }
});

// Función para alternar visibilidad
eyeButton.addEventListener('click', () => {
  if (elementsVisible) {
    buttonsContainer.classList.add('hidden');
    overlay.classList.add('hidden');
    videoBackground.classList.add('video-clear');
    dateSubtitleContainer.classList.add('hidden-interface');
    eyeIcon.className = 'fas fa-eye-slash';
  } else {
    buttonsContainer.classList.remove('hidden');
    overlay.classList.remove('hidden');
    videoBackground.classList.remove('video-clear');
    dateSubtitleContainer.classList.remove('hidden-interface');
    eyeIcon.className = 'fas fa-eye';
  }
  elementsVisible = !elementsVisible;
});

// ============================
// SISTEMA DE MENÚS
// ============================

// Configuración de menús
const menus = {
  donde: {
    btn: document.getElementById('dondeBtn'),
    menu: document.getElementById('dondeMenu'),
    close: document.getElementById('closeDonde')
  },
  itinerario: {
    btn: document.getElementById('itinerarioBtn'),
    menu: document.getElementById('itinerarioMenu'),
    close: document.getElementById('closeItinerario')
  },
  asistencia: {
    btn: document.getElementById('asistenciaBtn'),
    menu: document.getElementById('asistenciaMenu'),
    close: document.getElementById('closeAsistencia')
  },
  info: {
    btn: document.getElementById('infoBtn'),
    menu: document.getElementById('infoMenu'),
    close: document.getElementById('closeInfo')
  }
};

// Configurar todos los menús
Object.values(menus).forEach(({ btn, menu, close }) => {
  if (btn && menu) {
    btn.addEventListener('click', () => menu.classList.add('active'));
    close.addEventListener('click', () => menu.classList.remove('active'));
    
    // Cerrar al hacer clic fuera
    menu.addEventListener('click', (e) => {
      if (e.target === menu) {
        menu.classList.remove('active');
      }
    });
  }
});

// ============================
// FORMULARIO DE ASISTENCIA (ACTUALIZADO CON ACOMPAÑANTES)
// ============================

// Elementos del formulario
const agregarComensalBtn = document.getElementById('agregarComensal');
const enviarAsistenciaBtn = document.getElementById('enviarAsistencia');
const listaComensales = document.getElementById('listaComensales');
const mensajeConfirmacion = document.getElementById('mensajeConfirmacion');
const netlifyForm = document.getElementById('netlifyForm');
const comensalesDataField = document.getElementById('comensalesData');
const asistenciaOpcionField = document.getElementById('asistenciaOpcion');
const nombreNoAsistenteField = document.getElementById('nombreNoAsistente');
const noAsistenciaText = document.getElementById('noAsistenciaText');
const asistenciaFields = document.getElementById('asistenciaFields');
const nombreGrupo = document.getElementById('nombreGrupo');
const optionButtons = document.querySelectorAll('.option-button');
const nombreComensalInput = document.getElementById('nombreComensal');

// NUEVAS VARIABLES para el control de acompañantes
const numAcompanantesInput = document.getElementById('numAcompanantes');
const decrementBtn = document.getElementById('decrementBtn');
const incrementBtn = document.getElementById('incrementBtn');
const comensalesContador = document.getElementById('comensalesContador');
const acompanantesAlert = document.getElementById('acompanantesAlert');
const acompanantesGrupo = document.getElementById('acompanantesGrupo');

let comensales = [];
let asistira = true;
let numAcompanantes = 1; // Valor por defecto

// Inicializar el campo de acompañantes
function inicializarControlAcompanantes() {
  // Configurar botones de incremento/decremento
  decrementBtn.addEventListener('click', () => {
    if (numAcompanantes > 1) {
      numAcompanantes--;
      actualizarControlAcompanantes();
    }
  });
  
  incrementBtn.addEventListener('click', () => {
    if (numAcompanantes < 4) {
      numAcompanantes++;
      actualizarControlAcompanantes();
    }
  });
  
  // Actualizar botones de +/- según límites
  function actualizarBotones() {
    decrementBtn.disabled = numAcompanantes <= 1;
    incrementBtn.disabled = numAcompanantes >= 4;
  }
  
  // Actualizar todo el control
  function actualizarControlAcompanantes() {
    numAcompanantesInput.value = numAcompanantes;
    actualizarContadorComensales();
    actualizarBotones();
    actualizarBotonEnviar();
  }
  
  // Inicializar
  actualizarControlAcompanantes();
}

// Actualizar contador de comensales añadidos
function actualizarContadorComensales() {
  const total = numAcompanantes;
  const añadidos = comensales.length;
  
  comensalesContador.innerHTML = `Comensales añadidos: <strong>${añadidos}</strong> de <strong>${total}</strong>`;
  
  // Mostrar/ocultar alerta según necesidad
  if (asistira && total > añadidos) {
    acompanantesAlert.style.display = 'block';
  } else {
    acompanantesAlert.style.display = 'none';
  }
  
  // Actualizar clase del botón de enviar
  if (asistira && total > añadidos) {
    enviarAsistenciaBtn.classList.add('incomplete');
  } else {
    enviarAsistenciaBtn.classList.remove('incomplete');
  }
}

// Manejar opción de asistencia
function manejarOpcionAsistencia(opcion) {
  asistira = opcion === 'si';
  asistenciaOpcionField.value = opcion;
  
  optionButtons.forEach(btn => {
    btn.classList.toggle('active', btn.dataset.value === opcion);
  });
  
  if (asistira) {
    asistenciaFields.classList.remove('hidden');
    acompanantesGrupo.classList.remove('hidden');
    noAsistenciaText.style.display = 'none';
    nombreGrupo.style.display = 'block';
    enviarAsistenciaBtn.textContent = 'Confirmar asistencia';
  } else {
    asistenciaFields.classList.add('hidden');
    acompanantesGrupo.classList.add('hidden');
    noAsistenciaText.style.display = 'block';
    nombreGrupo.style.display = 'block';
    enviarAsistenciaBtn.textContent = 'Enviar';
  }
  
  actualizarBotonEnviar();
  actualizarContadorComensales();
}

// Configurar botones de opción
optionButtons.forEach(button => {
  button.addEventListener('click', () => {
    manejarOpcionAsistencia(button.dataset.value);
  });
});

// Agregar comensal
function agregarComensal() {
  const nombre = nombreComensalInput.value.trim();
  if (!nombre) {
    alert('Por favor, introduce al menos el nombre del comensal.');
    return;
  }
  
  // Verificar que no se exceda el número de acompañantes
  if (comensales.length >= numAcompanantes) {
    alert(`Ya has añadido el número máximo de ${numAcompanantes} comensales.`);
    return;
  }
  
  const comensal = {
    id: Date.now(),
    nombre,
    intolerancias: document.getElementById('intolerancias').value.trim(),
    menuInfantil: document.getElementById('menuInfantil').checked,
    cancion: document.getElementById('cancion').value.trim()
  };
  
  comensales.push(comensal);
  actualizarListaComensales();
  limpiarFormulario();
  actualizarBotonEnviar();
  actualizarContadorComensales();
}

// Actualizar lista de comensales
function actualizarListaComensales() {
  listaComensales.innerHTML = '';
  
  if (comensales.length === 0) {
    listaComensales.innerHTML = '<div class="empty-list">Aún no has añadido ningún comensal</div>';
    return;
  }
  
  comensales.forEach(comensal => {
    const comensalItem = document.createElement('div');
    comensalItem.className = 'comensal-item';
    
    const comensalInfo = document.createElement('div');
    comensalInfo.className = 'comensal-info';
    
    const nombreElement = document.createElement('div');
    nombreElement.className = 'comensal-name';
    nombreElement.textContent = comensal.nombre;
    
    const detallesElement = document.createElement('div');
    detallesElement.className = 'comensal-details';
    
    let detalles = [];
    if (comensal.intolerancias) detalles.push(`Intolerancias: ${comensal.intolerancias}`);
    if (comensal.menuInfantil) detalles.push('Menú infantil');
    if (comensal.cancion) detalles.push(`Canción: ${comensal.cancion}`);
    
    detallesElement.textContent = detalles.join(' | ');
    
    comensalInfo.appendChild(nombreElement);
    comensalInfo.appendChild(detallesElement);
    
    const deleteButton = document.createElement('button');
    deleteButton.className = 'delete-button';
    deleteButton.textContent = '×';
    deleteButton.addEventListener('click', () => eliminarComensal(comensal.id));
    
    comensalItem.appendChild(comensalInfo);
    comensalItem.appendChild(deleteButton);
    
    listaComensales.appendChild(comensalItem);
  });
}

// Eliminar comensal
function eliminarComensal(id) {
  comensales = comensales.filter(comensal => comensal.id !== id);
  actualizarListaComensales();
  actualizarBotonEnviar();
  actualizarContadorComensales();
}

// Limpiar formulario
function limpiarFormulario() {
  nombreComensalInput.value = '';
  document.getElementById('intolerancias').value = '';
  document.getElementById('menuInfantil').checked = false;
  document.getElementById('cancion').value = '';
}

// Actualizar estado del botón de enviar
function actualizarBotonEnviar() {
  if (asistira) {
    // Para "Sí" asistencia: habilitado solo si se han añadido todos los comensales
    const totalAcompanantes = numAcompanantes;
    const añadidos = comensales.length;
    
    enviarAsistenciaBtn.disabled = añadidos < totalAcompanantes;
    
    // Actualizar texto del botón si faltan comensales
    if (añadidos < totalAcompanantes) {
      enviarAsistenciaBtn.setAttribute('title', `Faltan ${totalAcompanantes - añadidos} comensales por añadir`);
    } else {
      enviarAsistenciaBtn.removeAttribute('title');
    }
  } else {
    // Para "No" asistencia: habilitado si hay nombre
    enviarAsistenciaBtn.disabled = !nombreComensalInput.value.trim();
  }
}

// Enviar a Netlify
async function enviarAsistenciaNetlify() {
  try {
    // Preparar datos según la opción
    if (asistira) {
      comensalesDataField.value = JSON.stringify(comensales);
      nombreNoAsistenteField.value = '';
    } else {
      comensalesDataField.value = '';
      nombreNoAsistenteField.value = nombreComensalInput.value.trim();
    }
    
    // Enviar usando fetch
    const formData = new FormData(netlifyForm);
    const response = await fetch('/', {
      method: 'POST',
      body: formData,
    });
    
    return response.ok;
  } catch (error) {
    console.error('Error al enviar:', error);
    return false;
  }
}

// Enviar asistencia
async function enviarAsistencia() {
  // Validaciones
  if (asistira) {
    const totalAcompanantes = numAcompanantes;
    const añadidos = comensales.length;
    
    if (añadidos < totalAcompanantes) {
      alert(`Faltan ${totalAcompanantes - añadidos} comensales por añadir. Por favor, añade todos los comensales antes de confirmar.`);
      return;
    }
  }
  
  if (!asistira && !nombreComensalInput.value.trim()) {
    alert('Por favor, introduce tu nombre.');
    return;
  }
  
  // Mostrar mensaje de confirmación
  mensajeConfirmacion.style.display = 'block';
  
  // Enviar a Netlify
  const exito = await enviarAsistenciaNetlify();
  console.log(exito ? '✅ Enviado a Netlify' : '⚠️ Guardado localmente');
  
  // Limpiar formulario
  comensales = [];
  numAcompanantes = 1; // Resetear a valor por defecto
  numAcompanantesInput.value = '1';
  actualizarListaComensales();
  limpiarFormulario();
  actualizarBotonEnviar();
  actualizarContadorComensales();
  
  // Ocultar mensaje después de 3 segundos
  setTimeout(() => {
    mensajeConfirmacion.style.display = 'none';
    document.getElementById('asistenciaMenu').classList.remove('active');
  }, 3000);
}

// Event listeners del formulario
agregarComensalBtn.addEventListener('click', agregarComensal);
enviarAsistenciaBtn.addEventListener('click', enviarAsistencia);

// Permitir Enter para agregar/enviar
nombreComensalInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    asistira ? agregarComensal() : enviarAsistencia();
  }
});

// Observar cambios para actualizar botón
const observer = new MutationObserver(actualizarBotonEnviar);
observer.observe(listaComensales, { childList: true, subtree: true });

nombreComensalInput.addEventListener('input', actualizarBotonEnviar);

// Inicializar control de acompañantes
inicializarControlAcompanantes();

// Inicializar estado
actualizarBotonEnviar();

// ============================
// INICIALIZACIÓN FINAL
// ============================

// Iniciar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
  initializeApp();
});

// Manejar la pausa de música cuando la página no está visible
document.addEventListener('visibilitychange', () => {
  if (document.hidden && isMusicPlaying) {
    // Pausar música cuando la pestaña no está activa
    backgroundMusic.pause();
  } else if (!document.hidden && isMusicPlaying) {
    // Reanudar cuando la pestaña vuelve a estar activa
    backgroundMusic.play().catch(e => console.log('No se pudo reanudar automáticamente'));
  }
});

console.log('🎉 Aplicación de boda cargada y optimizada con música');