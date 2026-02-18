// ---------------------------
// Lightbox: Image Viewer System
// ---------------------------

let lightboxImages = [];
let lightboxIndex = 0;
let lightboxEl = null;

/**
 * Create the lightbox DOM element and attach it to body.
 * @returns {HTMLElement}
 */
export function createLightbox() {
  const div = document.createElement('div');
  div.id = 'lightbox';
  div.className = 'lightbox-backdrop';
  div.innerHTML = `
    <button class="lightbox-close" title="Cerrar">×</button>
    <button class="lightbox-nav lightbox-prev" title="Anterior">
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none"><path d="M15 18l-6-6 6-6" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
    </button>
    <div class="lightbox-content">
      <img id="lightbox-img" src="" alt="">
      <div class="lightbox-caption" id="lightbox-caption"></div>
    </div>
    <button class="lightbox-nav lightbox-next" title="Siguiente">
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none"><path d="M9 18l6-6-6-6" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
    </button>
    <div class="lightbox-counter" id="lightbox-counter"></div>
  `;

  div.querySelector('.lightbox-close').onclick = closeLightbox;
  div.querySelector('.lightbox-prev').onclick = () => navigateLightbox(-1);
  div.querySelector('.lightbox-next').onclick = () => navigateLightbox(1);
  div.onclick = (e) => { if (e.target === div) closeLightbox(); };

  document.body.appendChild(div);
  lightboxEl = div;
  return div;
}

export function openLightbox(images, index) {
  lightboxImages = images;
  lightboxIndex = index;
  updateLightboxImage();
  lightboxEl.classList.add('active');
}

export function closeLightbox() {
  if (lightboxEl) lightboxEl.classList.remove('active');
}

export function isLightboxActive() {
  return lightboxEl?.classList.contains('active') || false;
}

function navigateLightbox(direction) {
  lightboxIndex = (lightboxIndex + direction + lightboxImages.length) % lightboxImages.length;
  updateLightboxImage();
}

function updateLightboxImage() {
  if (!lightboxEl) return;
  const img = lightboxEl.querySelector('#lightbox-img');
  const caption = lightboxEl.querySelector('#lightbox-caption');
  const counter = lightboxEl.querySelector('#lightbox-counter');

  const current = lightboxImages[lightboxIndex];
  img.src = current.src;
  caption.textContent = current.caption || '';
  counter.textContent = `${lightboxIndex + 1} / ${lightboxImages.length}`;

  const navBtns = lightboxEl.querySelectorAll('.lightbox-nav');
  // Sólo ocultar si hay 1 o menos imágenes. Si hay más, dejar que el CSS controle el display (flex).
  if (lightboxImages.length <= 1) {
    navBtns.forEach(btn => btn.style.display = 'none');
  } else {
    navBtns.forEach(btn => btn.style.removeProperty('display'));
  }
}
