// Función para precargar imágenes
function preloadImages() {
  return new Promise((resolve, reject) => {
    const isLandscape = screen.availWidth > screen.availHeight;
    const finalIsLandscape = (screen.availWidth && screen.availHeight) 
      ? isLandscape 
      : window.innerWidth > window.innerHeight;
    
    const backgroundImage = finalIsLandscape ? 'media/mesa.jpg' : 'media/mesa2.jpg';
    
    const images = [
      backgroundImage,
      'media/invitacion.jpg',
      'media/papel-textura-interior.jpg',
      'media/papel-textura-exterior.jpg',
      'media/sello.png',
      'media/title.png',
      'media/iglesia.jpg',
      'media/cason.png',
      'media/wring.png',
      'media/wcocktail.png',
      'media/wdinner.png',
      'media/wparty.png',
      'media/wdress.png',
      'media/whotel.png'
    ];
    
    let loadedCount = 0;
    const totalImages = images.length;
    
    images.forEach(src => {
      const img = new Image();
      img.onload = () => {
        loadedCount++;
        updateLoadingProgress(loadedCount, totalImages);
        if (loadedCount === totalImages) {
          resolve(backgroundImage);
        }
      };
      img.onerror = () => {
        loadedCount++;
        updateLoadingProgress(loadedCount, totalImages);
        if (loadedCount === totalImages) {
          resolve(backgroundImage);
        }
      };
      img.src = src;
    });
  });
}

function updateLoadingProgress(loaded, total) {
  const progress = (loaded / total) * 100;
  console.log(`Cargando: ${progress.toFixed(0)}%`);
}

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
  const envelopeBottom = envelopeRect.bottom;
  const windowHeight = window.innerHeight;
  
  const maskStart = Math.max(0, (envelopeBottom / windowHeight) * 100);
  
  const mask = document.querySelector('.envelope-mask');
  if (mask) {
    mask.style.clipPath = `polygon(
      0% 100%, 
      100% 100%, 
      100% ${maskStart}%, 
      0% ${maskStart}%
    )`;
  }
}

// Inicializar la aplicación cuando todo esté cargado
window.addEventListener('load', () => {
  preloadImages().then(backgroundImage => {
    setBackgroundImage(backgroundImage);
    adjustMaskClipPath();
    
    setTimeout(() => {
      const loadingScreen = document.getElementById('loadingScreen');
      const envelopeScreen = document.getElementById('envelopeScreen');
      
      if (loadingScreen) loadingScreen.classList.add('hidden');
      if (envelopeScreen) envelopeScreen.classList.add('loaded');
    }, 500);
  });
});

window.addEventListener('resize', () => {
  const isLandscape = screen.availWidth > screen.availHeight;
  const finalIsLandscape = (screen.availWidth && screen.availHeight) 
    ? isLandscape 
    : window.innerWidth > window.innerHeight;
  
  const backgroundImage = finalIsLandscape ? 'media/mesa.jpg' : 'media/mesa2.jpg';
  setBackgroundImage(backgroundImage);
  setTimeout(adjustMaskClipPath, 100);
});

window.addEventListener('orientationchange', () => {
  setTimeout(() => {
    const isLandscape = screen.availWidth > screen.availHeight;
    const finalIsLandscape = (screen.availWidth && screen.availHeight) 
      ? isLandscape 
      : window.innerWidth > window.innerHeight;
    
    const backgroundImage = finalIsLandscape ? 'media/mesa.jpg' : 'media/mesa2.jpg';
    setBackgroundImage(backgroundImage);
    adjustMaskClipPath();
  }, 300);
});

// Obtener elementos del DOM
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

// Referencias a los iconos
const muteIcon = muteButton.querySelector('i');
const eyeIcon = eyeButton.querySelector('i');

// Estado inicial: elementos visibles
let elementsVisible = true;

// FUNCIÓN ACTUALIZADA: para alternar la visibilidad de los elementos
function toggleElementsVisibility() {
  if (elementsVisible) {
    // Ocultar elementos (excepto el título y el texto)
    buttonsContainer.classList.add('hidden');
    overlay.classList.add('hidden');
    videoBackground.classList.add('video-clear');
    
    // Mover el texto a la parte baja
    dateSubtitleContainer.classList.add('hidden-interface');
    
    // Cambiar icono a ojo cerrado
    eyeIcon.className = 'fas fa-eye-slash';
  } else {
    // Mostrar elementos
    buttonsContainer.classList.remove('hidden');
    overlay.classList.remove('hidden');
    videoBackground.classList.remove('video-clear');
    
    // Mover el texto de vuelta a su posición original
    dateSubtitleContainer.classList.remove('hidden-interface');
    
    // Cambiar icono a ojo abierto
    eyeIcon.className = 'fas fa-eye';
  }
  
  elementsVisible = !elementsVisible;
}

// Event listener para el botón de ojo
eyeButton.addEventListener('click', toggleElementsVisibility);

// Función para controlar el mute/desmute
function toggleMute() {
  if (video.muted) {
    video.muted = false;
    muteIcon.className = 'fas fa-volume-up';
  } else {
    video.muted = true;
    muteIcon.className = 'fas fa-volume-mute';
  }
}

// Event listener para el botón de mute
muteButton.addEventListener('click', toggleMute);

// Animación del sobre
seal.addEventListener('click', () => {
  console.log("Sello clickeado - iniciando animación");
  
  seal.classList.add('broken');

  setTimeout(() => {
    console.log("Abriendo solapa...");
    envelope.classList.add('open');
  }, 800);

  setTimeout(() => {
    console.log("Mostrando contenido principal...");
    envelopeScreen.style.opacity = '0';
    setTimeout(() => {
      envelopeScreen.style.display = 'none';
      mainContent.classList.add('visible');
      video.muted = false;
      video.play();
      document.body.style.overflow = 'hidden';
      
      // Mostrar los botones cuando el video esté listo
      video.addEventListener('loadeddata', () => {
        setTimeout(() => {
          buttonsContainer.classList.add('visible');
          muteButton.classList.add('visible');
          eyeButton.classList.add('visible');
        }, 500);
      });
      
      // Si el video ya está cargado, mostrar los botones inmediatamente
      if (video.readyState >= 3) {
        setTimeout(() => {
          buttonsContainer.classList.add('visible');
          muteButton.classList.add('visible');
          eyeButton.classList.add('visible');
        }, 500);
      }
    }, 1000);
  }, 4000);
});

// Referencias a los botones y menús
const dondeBtn = document.getElementById('dondeBtn');
const itinerarioBtn = document.getElementById('itinerarioBtn');
const asistenciaBtn = document.getElementById('asistenciaBtn');
const infoBtn = document.getElementById('infoBtn');

const dondeMenu = document.getElementById('dondeMenu');
const itinerarioMenu = document.getElementById('itinerarioMenu');
const asistenciaMenu = document.getElementById('asistenciaMenu');
const infoMenu = document.getElementById('infoMenu');

const closeDonde = document.getElementById('closeDonde');
const closeItinerario = document.getElementById('closeItinerario');
const closeAsistencia = document.getElementById('closeAsistencia');
const closeInfo = document.getElementById('closeInfo');

// Funciones para abrir menús
dondeBtn.addEventListener('click', () => {
  dondeMenu.classList.add('active');
});

itinerarioBtn.addEventListener('click', () => {
  itinerarioMenu.classList.add('active');
});

asistenciaBtn.addEventListener('click', () => {
  asistenciaMenu.classList.add('active');
});

infoBtn.addEventListener('click', () => {
  infoMenu.classList.add('active');
});

// Funciones para cerrar menús
closeDonde.addEventListener('click', () => {
  dondeMenu.classList.remove('active');
});

closeItinerario.addEventListener('click', () => {
  itinerarioMenu.classList.remove('active');
});

closeAsistencia.addEventListener('click', () => {
  asistenciaMenu.classList.remove('active');
});

closeInfo.addEventListener('click', () => {
  infoMenu.classList.remove('active');
});

// Cerrar menús al hacer clic fuera del contenido
dondeMenu.addEventListener('click', (e) => {
  if (e.target === dondeMenu) {
    dondeMenu.classList.remove('active');
  }
});

itinerarioMenu.addEventListener('click', (e) => {
  if (e.target === itinerarioMenu) {
    itinerarioMenu.classList.remove('active');
  }
});

asistenciaMenu.addEventListener('click', (e) => {
  if (e.target === asistenciaMenu) {
    asistenciaMenu.classList.remove('active');
  }
});

infoMenu.addEventListener('click', (e) => {
  if (e.target === infoMenu) {
    infoMenu.classList.remove('active');
  }
});

// Lógica para el formulario de asistencia - CORREGIDA
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

let comensales = [];
let asistira = true; // Por defecto marcado como "Sí"

// Función para manejar la opción de asistencia
function manejarOpcionAsistencia(opcion) {
  asistira = opcion === 'si';
  asistenciaOpcionField.value = opcion;
  
  // Actualizar botones
  optionButtons.forEach(btn => {
    if (btn.dataset.value === opcion) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });
  
  // Mostrar/ocultar campos según la opción
  if (asistira) {
    asistenciaFields.classList.remove('hidden');
    noAsistenciaText.style.display = 'none';
    nombreGrupo.style.display = 'block';
    enviarAsistenciaBtn.textContent = 'Confirmar asistencia';
    actualizarBotonEnviar();
  } else {
    asistenciaFields.classList.add('hidden');
    noAsistenciaText.style.display = 'block';
    nombreGrupo.style.display = 'block';
    enviarAsistenciaBtn.textContent = 'Enviar';
    actualizarBotonEnviar();
  }
}

// Event listeners para los botones de opción
optionButtons.forEach(button => {
  button.addEventListener('click', () => {
    manejarOpcionAsistencia(button.dataset.value);
  });
});

// Función para agregar un comensal
function agregarComensal() {
  const nombre = nombreComensalInput.value.trim();
  const intolerancias = document.getElementById('intolerancias').value.trim();
  const menuInfantil = document.getElementById('menuInfantil').checked;
  const cancion = document.getElementById('cancion').value.trim();
  
  if (!nombre) {
    alert('Por favor, introduce al menos el nombre del comensal.');
    return;
  }
  
  const comensal = {
    id: Date.now(), // ID único basado en timestamp
    nombre,
    intolerancias,
    menuInfantil,
    cancion
  };
  
  comensales.push(comensal);
  actualizarListaComensales();
  limpiarFormulario();
  actualizarBotonEnviar();
}

// Función para eliminar un comensal
function eliminarComensal(id) {
  comensales = comensales.filter(comensal => comensal.id !== id);
  actualizarListaComensales();
  actualizarBotonEnviar();
}

// Función para actualizar la lista de comensales en la interfaz
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
    if (comensal.intolerancias) {
      detalles.push(`Intolerancias: ${comensal.intolerancias}`);
    }
    if (comensal.menuInfantil) {
      detalles.push('Menú infantil');
    }
    if (comensal.cancion) {
      detalles.push(`Canción: ${comensal.cancion}`);
    }
    
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

// Función para limpiar el formulario después de agregar un comensal
function limpiarFormulario() {
  nombreComensalInput.value = '';
  document.getElementById('intolerancias').value = '';
  document.getElementById('menuInfantil').checked = false;
  document.getElementById('cancion').value = '';
}

// Función para actualizar el estado del botón de enviar - CORREGIDA
function actualizarBotonEnviar() {
  if (asistira) {
    // Para "Sí": solo necesita que haya al menos un comensal en la lista
    enviarAsistenciaBtn.disabled = comensales.length === 0;
  } else {
    // Para "No": necesita que el campo de nombre esté completo
    const nombre = nombreComensalInput.value.trim();
    enviarAsistenciaBtn.disabled = !nombre;
  }
}

// Función para enviar los datos a Netlify usando fetch - CORREGIDA
async function enviarAsistenciaNetlify() {
  try {
    // Preparar los datos según la opción seleccionada
    if (asistira) {
      // Para "Sí": enviar la lista de comensales
      comensalesDataField.value = JSON.stringify(comensales);
      nombreNoAsistenteField.value = ''; // Limpiar campo de nombre para "No"
    } else {
      // Para "No": enviar solo el nombre
      comensalesDataField.value = ''; // Limpiar campo de comensales
      nombreNoAsistenteField.value = nombreComensalInput.value.trim();
    }
    
    // Crear FormData desde el formulario oculto
    const formData = new FormData(netlifyForm);
    
    // Enviar los datos usando fetch
    const response = await fetch('/', {
      method: 'POST',
      body: formData,
    });
    
    if (response.ok) {
      console.log('Datos enviados correctamente a Netlify');
      return true;
    } else {
      console.error('Error al enviar datos a Netlify');
      return false;
    }
  } catch (error) {
    console.error('Error de red:', error);
    return false;
  }
}

// Función para enviar la confirmación de asistencia - CORREGIDA
async function enviarAsistencia() {
  // Validaciones según la opción seleccionada
  if (asistira && comensales.length === 0) {
    alert('Por favor, añade al menos un comensal antes de confirmar la asistencia.');
    return;
  }
  
  if (!asistira && !nombreComensalInput.value.trim()) {
    alert('Por favor, introduce tu nombre antes de enviar.');
    return;
  }
  
  // Mostrar mensaje de confirmación
  mensajeConfirmacion.style.display = 'block';
  
  // Enviar datos a Netlify en segundo plano
  const exito = await enviarAsistenciaNetlify();
  
  if (exito) {
    console.log('Respuesta enviada correctamente a Netlify');
  } else {
    console.log('Respuesta enviada localmente (error en envío a Netlify)');
  }
  
  // Limpiar el formulario después de enviar
  comensales = [];
  actualizarListaComensales();
  limpiarFormulario();
  actualizarBotonEnviar();
  
  // Ocultar el mensaje después de unos segundos
  setTimeout(() => {
    mensajeConfirmacion.style.display = 'none';
    asistenciaMenu.classList.remove('active');
  }, 3000);
}

// Event listeners para el formulario de asistencia
agregarComensalBtn.addEventListener('click', agregarComensal);
enviarAsistenciaBtn.addEventListener('click', enviarAsistencia);

// Permitir agregar comensal con la tecla Enter en el campo de nombre
nombreComensalInput.addEventListener('keypress', function(e) {
  if (e.key === 'Enter') {
    if (asistira) {
      agregarComensal();
    } else {
      enviarAsistencia();
    }
  }
});

// Actualizar estado del botón cuando cambie la lista de comensales
document.addEventListener('DOMContentLoaded', function() {
  // Observar cambios en la lista de comensales
  const observer = new MutationObserver(function(mutations) {
    mutations.forEach(function(mutation) {
      if (mutation.type === 'childList') {
        actualizarBotonEnviar();
      }
    });
  });
  
  observer.observe(listaComensales, { childList: true, subtree: true });
});

// Actualizar estado del botón cuando cambie el campo de nombre
nombreComensalInput.addEventListener('input', actualizarBotonEnviar);

// Inicializar el estado del botón
actualizarBotonEnviar();