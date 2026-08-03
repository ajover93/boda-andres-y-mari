// ============================
// CONFIGURACIÓN Y DETECCIÓN
// ============================

const isSlowDevice = (() => {
  const ua = navigator.userAgent;
  const isOldAndroid = /Android [2-4]/.test(ua);
  const isOldIOS = /iOS [7-9]/.test(ua);
  const isOldBrowser = /MSIE|Trident/.test(ua);
  const lowCores = navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 2;
  const lowMemory = navigator.deviceMemory && navigator.deviceMemory <= 2;
  
  return isOldAndroid || isOldIOS || isOldBrowser || lowCores || lowMemory;
})();

if (isSlowDevice) {
  console.log('Dispositivo lento detectado - aplicando optimizaciones');
  document.documentElement.classList.add('slow-device');
  
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

let backgroundMusic = null;
let isMusicPlaying = false;
let musicVolume = 0.5;

function initializeMusic() {
  if (backgroundMusic) return backgroundMusic;
  
  backgroundMusic = new Audio('media/song.mp3');
  backgroundMusic.loop = true;
  backgroundMusic.volume = musicVolume;
  
  if (isSlowDevice) {
    backgroundMusic.preload = 'none';
  } else {
    backgroundMusic.preload = 'metadata';
  }
  
  backgroundMusic.addEventListener('canplaythrough', () => {
    console.log('🎵 Música cargada y lista para reproducir');
  });
  
  backgroundMusic.addEventListener('error', (e) => {
    console.error('❌ Error al cargar la música:', e);
  });
  
  return backgroundMusic;
}

async function playBackgroundMusic() {
  try {
    const music = initializeMusic();
    
    if (!isMusicPlaying) {
      music.volume = 0;
      await music.play();
      fadeVolumeIn(music, 0, musicVolume, 2000);
      isMusicPlaying = true;
      console.log('🎵 Música de fondo iniciada');
      updateMusicButtonIcon(true);
    }
  } catch (error) {
    console.log('⚠️ No se pudo reproducir la música automáticamente:', error.message);
    createMusicEnableButton();
  }
}

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

function pauseBackgroundMusic() {
  if (backgroundMusic && isMusicPlaying) {
    fadeVolumeOut(backgroundMusic, musicVolume, 0, 1000);
    console.log('⏸️ Música pausada');
  }
}

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

function updateMusicButtonIcon(playing) {
  const muteIcon = document.querySelector('.mute-button i');
  if (muteIcon) {
    muteIcon.className = playing ? 'fas fa-volume-up' : 'fas fa-volume-mute';
  }
}

function createMusicEnableButton() {
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
  
  document.body.appendChild(enableBtn);
}

// ============================
// PRECARGA INTELIGENTE DE IMÁGENES
// ============================

function preloadCriticalImages() {
  return new Promise((resolve) => {
    const isLandscape = window.innerWidth > window.innerHeight;
    const backgroundImage = isLandscape ? 'media/mesa.jpg' : 'media/mesa2.jpg';
    
    const criticalImages = [
      backgroundImage,
      'media/sello.png',
      'media/invitacion.jpg',
      'media/title.png',
      'media/btn1.png',
      'media/btn2.png',
      'media/btn3.png',
      'media/btn4.png'
    ];
    
    let loaded = 0;
    const total = criticalImages.length;
    
    const checkAllLoaded = () => {
      loaded++;
      if (loaded === total) resolve(backgroundImage);
    };

    criticalImages.forEach(src => {
      const img = new Image();
      img.onload = checkAllLoaded;
      img.onerror = checkAllLoaded;
      img.src = src;
    });
  });
}

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
    'media/wdress.png'
  ];
  
  setTimeout(() => {
    secondaryImages.forEach(src => {
      const img = new Image();
      img.src = src;
    });
  }, 1500);
}

// ============================
// INICIALIZACIÓN DE LA APLICACIÓN
// ============================

async function initializeApp() {
  const backgroundImage = await preloadCriticalImages();
  setBackgroundImage(backgroundImage);
  adjustMaskClipPath();
  
  setTimeout(() => {
    const loadingScreen = document.getElementById('loadingScreen');
    const envelopeScreen = document.getElementById('envelopeScreen');
    
    if (loadingScreen) loadingScreen.classList.add('hidden');
    if (envelopeScreen) envelopeScreen.classList.add('loaded');
    
    lazyLoadSecondaryImages();
  }, isSlowDevice ? 800 : 500);
}

function setBackgroundImage(backgroundImage) {
  const envelopeScreen = document.querySelector('.envelope-screen');
  const envelopeMask = document.querySelector('.envelope-mask');
  
  if (envelopeScreen) envelopeScreen.style.backgroundImage = `url('${backgroundImage}')`;
  if (envelopeMask) envelopeMask.style.backgroundImage = `url('${backgroundImage}')`;
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

let sealClicked = false;

if (seal) {
  seal.addEventListener('click', () => {
    if (sealClicked) return;
    sealClicked = true;
    
    seal.classList.add('broken');

    setTimeout(() => { envelope.classList.add('open'); }, 800);

    setTimeout(() => {
      envelopeScreen.style.opacity = '0';
      
      setTimeout(() => {
        envelopeScreen.style.display = 'none';
        mainContent.classList.add('visible');
        
        if (isSlowDevice) {
          video.preload = 'auto';
          video.load();
        }
        
        video.muted = false;
        video.play().catch(() => { video.controls = true; });
        document.body.style.overflow = 'hidden';
        
        setTimeout(() => playBackgroundMusic(), 500);
        
        setTimeout(() => {
          buttonsContainer.classList.add('visible');
          muteButton.classList.add('visible');
          eyeButton.classList.add('visible');
        }, 500);
      }, isSlowDevice ? 100 : 300);
    }, 4000);
  });
}

// ============================
// CONTROLES DE VIDEO Y MÚSICA
// ============================

const muteIcon = muteButton.querySelector('i');
const eyeIcon = eyeButton.querySelector('i');
let elementsVisible = true;

muteButton.addEventListener('click', async () => {
  if (isMusicPlaying) {
    pauseBackgroundMusic();
    video.muted = true;
    muteIcon.className = 'fas fa-volume-mute';
  } else {
    await resumeBackgroundMusic();
    video.muted = false;
    muteIcon.className = 'fas fa-volume-up';
  }
});

eyeButton.addEventListener('click', () => {
  const overlay = document.getElementById('overlay');
  const videoBackground = document.getElementById('videoBackground');
  const dateSubtitleContainer = document.getElementById('dateSubtitleContainer');

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

const menus = {
  donde: { btn: document.getElementById('dondeBtn'), menu: document.getElementById('dondeMenu'), close: document.getElementById('closeDonde') },
  itinerario: { btn: document.getElementById('itinerarioBtn'), menu: document.getElementById('itinerarioMenu'), close: document.getElementById('closeItinerario') },
  asistencia: { btn: document.getElementById('asistenciaBtn'), menu: document.getElementById('asistenciaMenu'), close: document.getElementById('closeAsistencia') },
  info: { btn: document.getElementById('infoBtn'), menu: document.getElementById('infoMenu'), close: document.getElementById('closeInfo') }
};

Object.values(menus).forEach(({ btn, menu, close }) => {
  if (btn && menu) {
    btn.addEventListener('click', () => menu.classList.add('active'));
    close.addEventListener('click', () => menu.classList.remove('active'));
    menu.addEventListener('click', (e) => {
      if (e.target === menu) menu.classList.remove('active');
    });
  }
});

// ============================
// FORMULARIO DE ASISTENCIA DINÁMICO CON SELECTOR
// ============================

const enviarAsistenciaBtn = document.getElementById('enviarAsistencia');
const mensajeConfirmacion = document.getElementById('mensajeConfirmacion');
const netlifyForm = document.getElementById('netlifyForm');
const comensalesDataField = document.getElementById('comensalesData');
const asistenciaOpcionField = document.getElementById('asistenciaOpcion');
const nombreNoAsistenteField = document.getElementById('nombreNoAsistente');
const noAsistenciaText = document.getElementById('noAsistenciaText');
const asistenciaFields = document.getElementById('asistenciaFields');
const optionButtons = document.querySelectorAll('.option-button');
const comensalesFormContainer = document.getElementById('comensalesFormContainer');

const numAcompanantesInput = document.getElementById('numAcompanantes');
const decrementBtn = document.getElementById('decrementBtn');
const incrementBtn = document.getElementById('incrementBtn');
const acompanantesGrupo = document.getElementById('acompanantesGrupo');
const nombreNoAsistenteGrupo = document.getElementById('nombreNoAsistenteGrupo');
const nombreNoAsistenteInput = document.getElementById('nombreNoAsistenteInput');

// Límite máximo permitido según la URL (ej: ?max=4)
const urlParams = new URLSearchParams(window.location.search);
const maxPermitido = parseInt(urlParams.get('max')) || 1;

let asistira = true;
let numAcompanantes = maxPermitido; // Por defecto inicia con el máximo asignado a esa invitación

// Inicializa el contador y los eventos de los botones - y +
function inicializarControlAcompanantes() {
  if (maxPermitido <= 1) {
    if (acompanantesGrupo) acompanantesGrupo.style.display = 'none';
    numAcompanantes = 1;
    if (numAcompanantesInput) numAcompanantesInput.value = 1;
    renderizarCamposComensales();
    return;
  }

  if (numAcompanantesInput) numAcompanantesInput.max = maxPermitido;

  decrementBtn.addEventListener('click', () => {
    if (numAcompanantes > 1) {
      numAcompanantes--;
      actualizarControlAcompanantes();
    }
  });

  incrementBtn.addEventListener('click', () => {
    if (numAcompanantes < maxPermitido) {
      numAcompanantes++;
      actualizarControlAcompanantes();
    }
  });

  actualizarControlAcompanantes();
}

function actualizarControlAcompanantes() {
  numAcompanantesInput.value = numAcompanantes;
  decrementBtn.disabled = numAcompanantes <= 1;
  incrementBtn.disabled = numAcompanantes >= maxPermitido;
  renderizarCamposComensales();
}

// Renderiza los campos dinámicamente según 'numAcompanantes' seleccionado
function renderizarCamposComensales() {
  if (!comensalesFormContainer) return;
  
  // Guardar datos temporalmente antes de renderizar para no borrar la información que el usuario ya haya escrito
  const valoresPrevios = [];
  for (let i = 0; i < maxPermitido; i++) {
    const nom = document.getElementById(`nombre_${i}`);
    if (nom) {
      valoresPrevios.push({
        nombre: nom.value,
        intolerancias: document.getElementById(`intolerancias_${i}`)?.value || '',
        menuInfantil: document.getElementById(`menuInfantil_${i}`)?.checked || false,
        cancion: document.getElementById(`cancion_${i}`)?.value || ''
      });
    }
  }

  comensalesFormContainer.innerHTML = '';

  for (let i = 0; i < numAcompanantes; i++) {
    const etiqueta = i === 0 ? 'Nombre y apellidos del comensal (tú)' : `Nombre y apellidos del comensal (invitado ${i})`;
    const datos = valoresPrevios[i] || {};

    const comensalBlock = document.createElement('div');
    comensalBlock.className = 'comensal-block';
    comensalBlock.style.cssText = 'margin-bottom: 25px; padding-bottom: 15px; border-bottom: 1px dashed rgba(255,255,255,0.2);';

    comensalBlock.innerHTML = `
      <div class="form-group">
        <label for="nombre_${i}">${etiqueta}:</label>
        <input type="text" id="nombre_${i}" class="input-comensal-nombre" placeholder="Ej: Juan Pérez García" value="${datos.nombre || ''}" required>
      </div>

      <div class="form-group">
        <label for="intolerancias_${i}">Intolerancias/Alergias alimentarias (opcional):</label>
        <input type="text" id="intolerancias_${i}" placeholder="Ej: Sin gluten, alergia a los frutos secos" value="${datos.intolerancias || ''}">
      </div>

      <div class="checkbox-group" style="margin: 10px 0;">
        <input type="checkbox" id="menuInfantil_${i}" ${datos.menuInfantil ? 'checked' : ''}>
        <label for="menuInfantil_${i}">Este comensal tomará menú infantil</label>
      </div>

      <div class="form-group">
        <label for="cancion_${i}">Canción que no puede faltar (opcional):</label>
        <input type="text" id="cancion_${i}" placeholder="Ej: 'Bohemian Rhapsody' - Queen" value="${datos.cancion || ''}">
      </div>
    `;

    comensalesFormContainer.appendChild(comensalBlock);
  }
}

// Manejo de la opción Sí / No
function manejarOpcionAsistencia(opcion) {
  asistira = opcion === 'si';
  asistenciaOpcionField.value = opcion;

  optionButtons.forEach(btn => {
    btn.classList.toggle('active', btn.dataset.value === opcion);
  });

  if (asistira) {
    asistenciaFields.style.display = 'block';
    if (maxPermitido > 1) {
      acompanantesGrupo.style.display = 'block';
    }
    noAsistenciaText.style.display = 'none';
    nombreNoAsistenteGrupo.style.display = 'none';
    enviarAsistenciaBtn.textContent = 'Confirmar asistencia';
  } else {
    asistenciaFields.style.display = 'none';
    acompanantesGrupo.style.display = 'none';
    noAsistenciaText.style.display = 'block';
    nombreNoAsistenteGrupo.style.display = 'block';
    enviarAsistenciaBtn.textContent = 'Enviar';
  }
}

optionButtons.forEach(button => {
  button.addEventListener('click', () => manejarOpcionAsistencia(button.dataset.value));
});

// Enviar respuestas a Netlify
async function enviarAsistenciaNetlify() {
  try {
    if (asistira) {
      const listaComensales = [];
      for (let i = 0; i < numAcompanantes; i++) {
        listaComensales.push({
          nombre: document.getElementById(`nombre_${i}`).value.trim(),
          intolerancias: document.getElementById(`intolerancias_${i}`).value.trim(),
          menuInfantil: document.getElementById(`menuInfantil_${i}`).checked,
          cancion: document.getElementById(`cancion_${i}`).value.trim()
        });
      }
      comensalesDataField.value = JSON.stringify(listaComensales);
      nombreNoAsistenteField.value = '';
    } else {
      comensalesDataField.value = '';
      nombreNoAsistenteField.value = nombreNoAsistenteInput.value.trim();
    }

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

async function enviarAsistencia() {
  if (asistira) {
    // Validar que todos los comensales visibles tengan el nombre relleno
    for (let i = 0; i < numAcompanantes; i++) {
      const nombreVal = document.getElementById(`nombre_${i}`)?.value.trim();
      if (!nombreVal) {
        const campoLabel = i === 0 ? 'tu nombre (Comensal principal)' : `el nombre del invitado ${i}`;
        alert(`Por favor, rellena ${campoLabel}.`);
        document.getElementById(`nombre_${i}`).focus();
        return;
      }
    }
  } else {
    if (!nombreNoAsistenteInput.value.trim()) {
      alert('Por favor, introduce tu nombre.');
      nombreNoAsistenteInput.focus();
      return;
    }
  }

  // 1. Cerramos el submenú de asistencia inmediatamente
  document.getElementById('asistenciaMenu').classList.remove('active');

  // 2. Mostramos el mensaje flotante centrado en pantalla
  mensajeConfirmacion.style.display = 'block';

  // 3. Enviamos los datos a Netlify
  const exito = await enviarAsistenciaNetlify();
  console.log(exito ? '✅ Enviado a Netlify' : '⚠️ Guardado localmente');

  // 4. Ocultamos el mensaje emergente tras 3 segundos
  setTimeout(() => {
    mensajeConfirmacion.style.display = 'none';
  }, 3000);
}

enviarAsistenciaBtn.addEventListener('click', enviarAsistencia);

// Inicializar control de invitados
inicializarControlAcompanantes();

// ============================
// INICIALIZACIÓN FINAL
// ============================

document.addEventListener('DOMContentLoaded', () => {
  initializeApp();
});

document.addEventListener('visibilitychange', () => {
  if (document.hidden && isMusicPlaying) {
    backgroundMusic.pause();
  } else if (!document.hidden && isMusicPlaying) {
    backgroundMusic.play().catch(() => {});
  }
});