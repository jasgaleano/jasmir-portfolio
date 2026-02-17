// ---------------------------
// App: Entry Point & Orchestrator
// ---------------------------
import '../css/styles.css';

import { getConfig, getLang } from './modules/store.js';
import { loadLanguage, setupLanguageSwitcher } from './modules/i18n.js';
import { initPixel } from './modules/tracking.js';
import { renderApp } from './modules/render.js';
import { createModal } from './modules/modal.js';
import { createLightbox } from './modules/lightbox.js';
import { setupEventListeners, initScrollReveal, initScrollSpy, scrollToHash } from './modules/ui.js';

document.addEventListener('DOMContentLoaded', async () => {
    // 1. Initialize tracking
    initPixel(getConfig().pixelId);

    // 2. Create persistent DOM elements (Modal + Lightbox)
    createModal();
    createLightbox();

    // 3. Load data & render
    await loadLanguage(getLang(), renderApp);

    // 4. Setup interactions
    setupEventListeners();
    setupLanguageSwitcher(renderApp);

    // 5. Animations
    initScrollReveal();
    initScrollSpy();

    // 6. Handle initial hash
    if (location.hash) scrollToHash(location.hash);
});
