// ---------------------------
// Render: Pure HTML Generation Functions
// ---------------------------
import { t } from './i18n.js';
import { trackEvent } from './tracking.js';

/**
 * Master render function. Calls all sub-renderers.
 * @param {object} data - Full portfolio data object
 */
export function renderApp(data) {
    renderSEO(data.perfil, data.hero);
    renderProfile(data.perfil);
    renderHero(data.hero, data.perfil);
    renderServices(data.servicios);
    renderProjects(data.proyectos);
}

function renderSEO(perfil, hero) {
    document.title = `${perfil.nombre} — ${perfil.rol}`;
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) metaDesc.content = hero.descripcion;
}

function renderProfile(perfil) {
    document.querySelectorAll('.js-name').forEach(el => el.textContent = perfil.nombre);
    document.querySelectorAll('.js-role').forEach(el => el.textContent = perfil.rol);

    const avatarHTML = `<img src="${perfil.foto_desktop}" alt="${perfil.nombre}" style="width:100%;height:100%;object-fit:cover">`;
    document.querySelectorAll('.js-avatar').forEach(el => el.innerHTML = avatarHTML);
}

function renderHero(hero, perfil) {
    const titleEl = document.querySelector('.hero-title');
    if (titleEl) {
        titleEl.innerHTML = `<span>${hero.titulo_principal}</span><br>${hero.titulo_secundario}`;
    }

    const descEl = document.querySelector('.hero-p');
    if (descEl) descEl.textContent = hero.descripcion;

    const frameEl = document.querySelector('.portrait-img');
    if (frameEl) {
        frameEl.innerHTML = `<img src="${perfil.foto_movil}" alt="Hero" style="width:100%;height:100%;object-fit:cover;border-radius:16px;">`;
    }
}

function renderServices(servicios) {
    const container = document.querySelector('#servicios .grid');
    if (!container) return;

    container.innerHTML = servicios.map(s => `
    <article class="card-w">
      <h3>${s.titulo}</h3>
      <p>${s.descripcion}</p>
      <ul class="bullets">
        ${s.puntos.map(p => `<li>${p}</li>`).join('')}
      </ul>
      <a class="card-link" href="#contacto" data-track-interest="${s.titulo}">
        ${t('cta_request_info')}
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" class="arrow"><path d="M9 18l6-6-6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
      </a>
    </article>
  `).join('');

    // Attach tracking via delegation instead of inline onclick
    container.addEventListener('click', (e) => {
        const link = e.target.closest('[data-track-interest]');
        if (link) {
            trackEvent('Lead', { interest: link.dataset.trackInterest });
        }
    });
}

function renderProjects(proyectos) {
    const container = document.querySelector('#proyectos .grid');
    if (!container) return;

    container.innerHTML = proyectos.map((p, index) => {
        const hasVideo = p.detalle.media_showcase?.some(m => m.tipo === 'video');
        return `
    <article class="card-w project-card" data-id="${index}">
      <div class="case">
        <div>
          <span class="tag">${p.categoria}</span>
          <h3>${p.titulo}</h3>
          <p>${p.descripcion_corta}</p>
          <div class="meta">
            ${p.tags.map(tag => `<span>#${tag}</span>`).join('')}
          </div>
          <button class="card-link btn-text js-open-modal" data-index="${index}">
            ${t('cta_view_case')}
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M9 18l6-6-6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
          </button>
        </div>
        <div class="thumb" style="background-image: url('${p.cover}'); background-size: cover; background-position: center;">
          ${hasVideo ? '<div class="play-icon">▶</div>' : ''}
        </div>
      </div>
    </article>
    `;
    }).join('');
}
