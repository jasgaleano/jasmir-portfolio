// ---------------------------
// UI: Interactive UI Logic (Sidebar, Drawer, ScrollSpy, ScrollReveal)
// ---------------------------
import { getData } from './store.js';
import { getLang } from './store.js';
import { trackEvent } from './tracking.js';
import { openProjectModal, closeModal } from './modal.js';
import { closeLightbox, isLightboxActive } from './lightbox.js';

// ── Toast Notification System ──
function showToast(message, type = 'success') {
    // Remove existing toast if any
    const existing = document.querySelector('.toast-notification');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.className = `toast-notification toast-${type}`;
    toast.innerHTML = `
        <span class="toast-icon">${type === 'success' ? '✓' : '✕'}</span>
        <span class="toast-msg">${message}</span>
    `;
    document.body.appendChild(toast);

    // Trigger animation
    requestAnimationFrame(() => toast.classList.add('toast-visible'));

    // Auto-dismiss
    setTimeout(() => {
        toast.classList.remove('toast-visible');
        toast.addEventListener('transitionend', () => toast.remove(), { once: true });
    }, 4000);
}

/**
 * Setup all interactive event listeners.
 */
export function setupEventListeners() {
    // Project card click delegation
    const proyectosSection = document.querySelector('#proyectos');
    if (proyectosSection) {
        proyectosSection.addEventListener('click', (e) => {
            const btn = e.target.closest('.js-open-modal');
            if (btn) {
                const index = btn.dataset.index;
                const data = getData();
                if (data) openProjectModal(data.proyectos[index]);
            }
        });
    }

    // ESC key handling
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            if (isLightboxActive()) {
                closeLightbox();
            } else {
                closeModal();
            }
        }
    });

    // Form Submission (Supabase)
    setupFormHandler();

    // Drawer (Mobile Menu)
    setupDrawer();

    // Nav link click → smooth scroll + close drawer
    setupNavClicks();

    // "Otros" field toggle in form
    setupOtrosToggle();

    // Footer Year
    const yearEl = document.getElementById('year');
    if (yearEl) yearEl.textContent = new Date().getFullYear();
}

function setupFormHandler() {
    const leadForm = document.getElementById('leadForm');
    if (!leadForm) return;

    leadForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const btn = leadForm.querySelector('button[type="submit"]');
        const originalText = btn.textContent;

        try {
            btn.disabled = true;
            btn.textContent = getLang() === 'es' ? 'Enviando...' : 'Sending...';

            const formData = new FormData(leadForm);
            const necesidadVal = formData.get('necesidad');
            const otrosText = formData.get('otros_detalle');
            const entry = {
                nombre: formData.get('nombre'),
                empresa: formData.get('empresa'),
                necesidad: necesidadVal === 'otro' ? `Otro: ${otrosText}` : necesidadVal
            };

            const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/rest/v1/leads`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
                    'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
                    'Prefer': 'return=minimal'
                },
                body: JSON.stringify(entry)
            });

            if (!response.ok) throw new Error('Error al enviar');

            trackEvent('Lead', { method: 'form', need: entry.necesidad });
            leadForm.reset();
            showToast(getLang() === 'es'
                ? '¡Solicitud enviada con éxito! Me pondré en contacto contigo pronto.'
                : 'Request sent successfully! I will get in touch with you soon.', 'success');

        } catch (err) {
            console.error(err);
            showToast(getLang() === 'es'
                ? 'Hubo un error. Por favor intenta de nuevo.'
                : 'There was an error. Please try again.', 'error');
        } finally {
            btn.disabled = false;
            btn.textContent = originalText;
        }
    });
}

function setupDrawer() {
    const openMenuBtn = document.getElementById('openMenu');
    const drawer = document.getElementById('drawer');
    const backdrop = document.getElementById('backdrop');

    openMenuBtn?.addEventListener('click', () => {
        drawer.classList.add('open');
        backdrop.classList.add('open');
    });
    backdrop?.addEventListener('click', () => {
        drawer.classList.remove('open');
        backdrop.classList.remove('open');
    });
}

// ── Nav Link Clicks: scroll to anchor + close drawer ──
function setupNavClicks() {
    const drawer = document.getElementById('drawer');
    const backdrop = document.getElementById('backdrop');

    document.querySelectorAll('[data-nav], .sb-cta a[href^="#"]').forEach(link => {
        link.addEventListener('click', (e) => {
            const hash = link.getAttribute('href');
            if (!hash || !hash.startsWith('#')) return;

            e.preventDefault();

            // Close drawer if open
            if (drawer?.classList.contains('open')) {
                drawer.classList.remove('open');
                backdrop?.classList.remove('open');
            }

            // Scroll to target
            const target = document.querySelector(hash);
            if (target) {
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                history.replaceState(null, '', hash);
            }
        });
    });
}

// ── "Otros" field toggle in form ──
function setupOtrosToggle() {
    const select = document.querySelector('#leadForm select[name="necesidad"]');
    const otrosWrap = document.getElementById('otrosWrap');
    const otrosInput = document.getElementById('otrosInput');
    if (!select || !otrosWrap) return;

    select.addEventListener('change', () => {
        const isOtro = select.value === 'otro';
        otrosWrap.style.display = isOtro ? 'block' : 'none';
        if (otrosInput) otrosInput.required = isOtro;
    });
}

/**
 * Initialize IntersectionObserver-based scroll reveal.
 */
export function initScrollReveal() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('revealed');
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -60px 0px'
    });

    document.querySelectorAll('.card-w, .section-head, .step, .hero, .trust').forEach(el => {
        el.classList.add('reveal-on-scroll');
        observer.observe(el);
    });
}

/**
 * Initialize ScrollSpy for active nav highlighting.
 */
export function initScrollSpy() {
    const sections = document.querySelectorAll('main[id], section[id]');
    const allNavLinks = document.querySelectorAll('[data-nav]');

    if (!sections.length || !allNavLinks.length) return;

    function checkTopOfPage() {
        if (window.scrollY < 100) {
            allNavLinks.forEach(link => {
                const isHome = link.getAttribute('href') === '#inicio';
                link.classList.toggle('active', isHome);
            });
        }
    }

    const spyObserver = new IntersectionObserver((entries) => {
        if (window.scrollY < 100) return;

        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const id = entry.target.id;
                allNavLinks.forEach(link => {
                    const isActive = link.getAttribute('href') === `#${id}`;
                    link.classList.toggle('active', isActive);
                });
            }
        });
    }, {
        rootMargin: '-20% 0px -60% 0px',
        threshold: 0
    });

    sections.forEach(section => spyObserver.observe(section));

    window.addEventListener('scroll', checkTopOfPage, { passive: true });
    checkTopOfPage();
}

/**
 * Smooth scroll to a hash target.
 * @param {string} hash
 */
export function scrollToHash(hash) {
    const el = document.querySelector(hash);
    if (!el) return;
    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
}
