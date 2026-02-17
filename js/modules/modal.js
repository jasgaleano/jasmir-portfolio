// ---------------------------
// Modal: Project Detail Modal System
// ---------------------------
import { t } from './i18n.js';
import { getToolIcon, getEquipmentIcon } from './icons.js';
import { trackEvent } from './tracking.js';
import { openLightbox } from './lightbox.js';

let modalEl = null;

/**
 * Create the modal DOM element and attach it to body.
 * @returns {HTMLElement}
 */
export function createModal() {
  const div = document.createElement('div');
  div.id = 'project-modal';
  div.className = 'modal-backdrop';
  div.innerHTML = `
    <div class="modal-content">
      <button class="modal-close" title="Close">×</button>
      
      <!-- Left: Media Gallery -->
      <div class="modal-media" id="m-media">
        <!-- Media items injected here -->
      </div>
      
      <!-- Right: Info Panel -->
      <div class="modal-info">
        <div class="modal-header">
          <div class="modal-meta">
            <span id="m-client"></span> • <span id="m-year"></span>
          </div>
          <h2 class="modal-title" id="m-title"></h2>
        </div>
        
        <div class="services-list" id="m-services">
          <!-- Tags injected here -->
        </div>

        <!-- Tools & Equipment Section -->
        <div id="m-tools-section" class="modal-tools-section"></div>

        <div class="modal-body-text" id="m-desc"></div>
        
        <!-- Desktop CTA (Inside Info Panel) -->
        <div class="modal-cta-box desktop-cta">
          <a href="#contacto" class="btn btn-primary js-modal-cta" data-source="modal_cta_desktop">
            <span data-i18n="modal_cta">Quiero resultados así</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M5 12h12M13 6l6 6-6 6" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
          </a>
        </div>
      </div>

      <!-- Mobile CTA (At the very end of scroll) -->
      <div class="modal-cta-box mobile-cta">
        <a href="#contacto" class="btn btn-primary js-modal-cta" data-source="modal_cta_mobile">
          <span data-i18n="modal_cta">Quiero resultados así</span>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M5 12h12M13 6l6 6-6 6" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
        </a>
      </div>
    </div>
  `;

  div.querySelector('.modal-close').onclick = closeModal;
  div.onclick = (e) => { if (e.target === div) closeModal(); };

  // CTA tracking via delegation (replaces inline onclick)
  div.querySelectorAll('.js-modal-cta').forEach(btn => {
    btn.addEventListener('click', () => {
      closeModal();
      trackEvent('Contact', { source: btn.dataset.source });
    });
  });

  document.body.appendChild(div);
  modalEl = div;
  return div;
}

/**
 * Open the project modal with the given project data.
 * @param {object} project
 */
export function openProjectModal(project) {
  if (!modalEl) return;
  const m = modalEl;

  // 1. Text Data
  m.querySelector('#m-client').textContent = project.cliente || t('modal_client_fallback');
  m.querySelector('#m-year').textContent = project.anio || new Date().getFullYear();
  m.querySelector('#m-title').textContent = project.titulo;

  // Format description with markdown-like bold
  const descText = project.detalle.descripcion_larga
    .replace(/\\\\/g, '')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  m.querySelector('#m-desc').innerHTML = descText;

  // Services Tags
  const tagsContainer = m.querySelector('#m-services');
  if (project.servicios_lista && project.servicios_lista.length > 0) {
    tagsContainer.innerHTML = project.servicios_lista.map(tag => `<span class="service-tag">${tag}</span>`).join('');
    tagsContainer.style.display = '';
  } else {
    tagsContainer.style.display = 'none';
  }

  // 2. Tools & Equipment Section
  renderToolsSection(m, project);

  // 3. Media Gallery Logic (v3: Hero + Thumbnail Grid + Videos at Bottom)
  const mediaContainer = m.querySelector('#m-media');
  mediaContainer.innerHTML = '';

  // --- Build ordered media items from showcase ---
  const showcaseItems = [];
  const videos = [];

  if (project.detalle.media_showcase && project.detalle.media_showcase.length > 0) {
    project.detalle.media_showcase.forEach(item => {
      if (item.tipo === 'video') {
        videos.push(item);
      } else {
        showcaseItems.push(item);
      }
    });
  } else if (project.detalle.galeria && project.detalle.galeria.length > 0) {
    project.detalle.galeria.forEach(src => {
      showcaseItems.push({ tipo: 'imagen', url: src, caption: '' });
    });
  }

  // Fallback: use cover if no images
  const imageItems = showcaseItems.filter(i => i.tipo === 'imagen');
  if (imageItems.length === 0) {
    showcaseItems.unshift({ tipo: 'imagen', url: project.cover, caption: '' });
  }

  if (project.detalle.video_url && videos.length === 0) {
    videos.push({ url: project.detalle.video_url, caption: '' });
  }

  // Build flat image list for lightbox (only actual images, no labels)
  const allImages = showcaseItems
    .filter(i => i.tipo === 'imagen')
    .map(img => ({ src: img.url, caption: img.caption || '' }));

  // --- HERO IMAGE (first image in showcase) ---
  const firstImage = showcaseItems.find(i => i.tipo === 'imagen');
  if (firstImage) {
    const heroDiv = document.createElement('div');
    heroDiv.className = 'gallery-hero';
    heroDiv.innerHTML = `
      <img src="${firstImage.url}" loading="lazy" alt="${project.titulo}">
      ${firstImage.caption ? `<div class="media-caption">${firstImage.caption}</div>` : ''}
    `;
    heroDiv.querySelector('img').addEventListener('click', () => openLightbox(allImages, 0));
    mediaContainer.appendChild(heroDiv);
  }

  // --- SECTIONED GALLERY (labels + image grids) ---
  // Skip the first image (hero) and process remaining items in sections
  let lightboxIndex = 0; // track lightbox index for images after hero
  let pastHero = false;
  let currentGrid = null;

  showcaseItems.forEach(item => {
    if (item.tipo === 'section_label') {
      // Flush previous grid
      if (currentGrid && currentGrid.childElementCount > 0) {
        mediaContainer.appendChild(currentGrid);
      }
      // Render section divider
      const label = document.createElement('div');
      label.className = 'gallery-section-label';
      label.innerHTML = `<span>${item.label}</span>`;
      mediaContainer.appendChild(label);
      // Start a new grid
      currentGrid = document.createElement('div');
      currentGrid.className = 'gallery-grid';
    } else if (item.tipo === 'imagen') {
      if (!pastHero) {
        pastHero = true; // skip the hero image
        lightboxIndex = 1;
        return;
      }
      if (!currentGrid) {
        currentGrid = document.createElement('div');
        currentGrid.className = 'gallery-grid';
      }
      const idx = lightboxIndex;
      const thumb = document.createElement('div');
      thumb.className = 'gallery-thumb';
      thumb.innerHTML = `
        <img src="${item.url}" loading="lazy" alt="${project.titulo}">
        <div class="thumb-overlay">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
        </div>
        ${item.caption ? `<div class="thumb-caption">${item.caption}</div>` : ''}
      `;
      thumb.addEventListener('click', () => openLightbox(allImages, idx));
      currentGrid.appendChild(thumb);
      lightboxIndex++;
    }
  });

  // Flush last grid
  if (currentGrid && currentGrid.childElementCount > 0) {
    mediaContainer.appendChild(currentGrid);
  }

  // --- VIDEOS SECTION ---
  if (videos.length > 0) {
    const videoSection = document.createElement('div');
    videoSection.className = 'gallery-videos';
    videoSection.innerHTML = `<div class="video-section-label">${t('modal_video_label')}</div>`;

    videos.forEach(vid => {
      const vidDiv = document.createElement('div');
      vidDiv.className = 'media-item media-video';

      if (vid.url.includes('youtube') || vid.url.includes('youtu.be')) {
        let videoId = '';
        if (vid.url.includes('watch?v=')) {
          videoId = vid.url.split('watch?v=')[1].split('&')[0];
        } else if (vid.url.includes('youtu.be/')) {
          videoId = vid.url.split('youtu.be/')[1].split('?')[0];
        } else if (vid.url.includes('embed/')) {
          videoId = vid.url.split('embed/')[1].split('?')[0];
        } else if (vid.url.includes('/shorts/')) {
          videoId = vid.url.split('/shorts/')[1].split('?')[0];
        }
        vidDiv.innerHTML = `
          <div class="video-wrapper">
            <iframe src="https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1" 
                    frameborder="0" 
                    allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" 
                    allowfullscreen></iframe>
          </div>
          ${vid.caption ? `<div class="media-caption">${vid.caption}</div>` : ''}
        `;
      } else {
        vidDiv.innerHTML = `
          <video src="${vid.url}" controls playsinline preload="metadata"></video>
          ${vid.caption ? `<div class="media-caption">${vid.caption}</div>` : ''}
        `;
      }
      videoSection.appendChild(vidDiv);
    });

    mediaContainer.appendChild(videoSection);
  }

  trackEvent('ViewContent', { content_name: project.titulo });

  m.classList.add('active');
  document.body.style.overflow = 'hidden';
}

/**
 * Close the modal.
 */
export function closeModal() {
  if (!modalEl) return;
  modalEl.classList.remove('active');
  modalEl.querySelector('#m-media').innerHTML = '';
  document.body.style.overflow = '';
}

// --- Internal helper ---
function renderToolsSection(modal, project) {
  const container = modal.querySelector('#m-tools-section');
  let html = '';

  // Software Tools (from herramientas array)
  if (project.herramientas && project.herramientas.length > 0) {
    html += `
      <div class="tools-group">
        <h4 class="tools-label">${t('modal_tools_label')}</h4>
        <div class="tools-list">
          ${project.herramientas.map(tool => `
            <span class="tool-badge">
              <span class="tool-icon">${getToolIcon(tool)}</span>
              ${tool}
            </span>
          `).join('')}
        </div>
      </div>
    `;
  }

  // Equipment (from equipamiento object or array)
  if (project.equipamiento) {
    const eq = project.equipamiento;

    // If equipamiento is an array of strings (new format from tools.txt)
    if (Array.isArray(eq)) {
      if (eq.length > 0) {
        html += `
              <div class="equipment-group">
                <h4 class="tools-label">${t('modal_equipment_label')}</h4>
                <div class="equipment-list">
                  ${eq.map(item => `
                    <div class="equipment-item">
                      <span class="eq-icon">${getEquipmentIcon(item)}</span>
                      <span>${item}</span>
                    </div>
                  `).join('')}
                </div>
              </div>
            `;
      }
    } else {
      // Legacy object format
      html += `
          <div class="equipment-group">
            <h4 class="tools-label">${t('modal_equipment_label')}</h4>
            <div class="equipment-list">
              <div class="equipment-item">
                <span class="eq-icon">${getEquipmentIcon(eq.camara || '')}</span>
                <span>${eq.camara}</span>
              </div>
              <div class="equipment-item">
                <span class="eq-icon">${getEquipmentIcon('lente')}</span>
                <span>${eq.lentes.join(' · ')}</span>
              </div>
              ${eq.audio ? `
              <div class="equipment-item">
                <span class="eq-icon">${getEquipmentIcon('micrófono')}</span>
                <span>${eq.audio}</span>
              </div>
              ` : ''}
              ${eq.accesorios ? `
              <div class="equipment-item">
                <span class="eq-icon">${getEquipmentIcon(eq.accesorios[0] || '')}</span>
                <span>${eq.accesorios.join(' · ')}</span>
              </div>
              ` : ''}
            </div>
          </div>
        `;
    }
  }

  container.innerHTML = html;
  container.style.display = html ? '' : 'none';
}
