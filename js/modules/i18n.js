// ---------------------------
// i18n: Internationalization & Language Switching
// ---------------------------
import { getConfig, getLang, setLang, setData } from './store.js';

const UI_STRINGS = {
    es: {
        nav_home: 'Inicio', nav_services: 'Servicios', nav_projects: 'Proyectos',
        nav_process: 'Proceso', nav_contact: 'Contacto',
        chip_strategy: 'Estrategia', chip_design: 'Diseño', chip_growth: 'Growth',
        chip_production: 'Producción Audiovisual', chip_other: 'Otro',
        cta_call: 'Trabajemos Juntos', cta_cases: 'Ver Portafolio',
        badge_available: 'Disponible ahora',
        micro_delivery: '<b>Metodología</b> por etapas',
        micro_brand: 'Sistemas de marca', micro_production: 'Producción comercial',
        trust_title: 'Marcas y equipos con los que he colaborado',
        kicker_services: 'Oferta', h2_services: 'Soluciones Integrales.',
        sub_services: 'Tres pilares estratégicos con entregables tangibles.',
        kicker_cases: 'Selección', h2_projects: 'Casos de Estudio',
        sub_projects: 'Explora cada proyecto en detalle inmersivo.',
        kicker_process: 'Método', h2_process: 'Orden, Claridad y Ejecución.',
        step1_title: 'Diagnóstico', step1_desc: 'Auditoría profunda de marca y oferta.',
        step2_title: 'Propuesta', step2_desc: 'Plan de acción con roadmap claro.',
        step3_title: 'Ejecución', step3_desc: 'Diseño y producción de alto nivel.',
        step4_title: 'Optimización', step4_desc: 'Ajustes basados en rendimiento.',
        kicker_contact: 'Contacto', h2_contact: 'Elevemos tu marca hoy.',
        contact_quick_title: 'Comunicación Directa', contact_quick_desc: 'Sin intermediarios, hablemos de negocios.',
        form_title: 'Iniciar Proyecto', form_name: 'Tu Nombre', form_company: 'Empresa / Marca',
        form_need: '¿Qué necesitas?', form_submit: 'Enviar Solicitud',
        form_other_detail: '¿Qué necesitas específicamente?',
        modal_cta: 'Quiero un resultado así',
        modal_tools_label: 'Tech Stack', modal_equipment_label: 'Equipo Utilizado',
        modal_video_label: 'Producción Audiovisual',
        modal_client_fallback: 'Cliente Confidencial',
        cta_request_info: 'Solicitar Detalles', cta_view_case: 'Ver Caso Completo',
    },
    en: {
        nav_home: 'Home', nav_services: 'Services', nav_projects: 'Projects',
        nav_process: 'Process', nav_contact: 'Contact',
        chip_strategy: 'Strategy', chip_design: 'Design', chip_growth: 'Growth',
        chip_production: 'Video Production', chip_other: 'Other',
        cta_call: 'Let\'s Work Together', cta_cases: 'View Portfolio',
        badge_available: 'Available Now',
        micro_delivery: '<b>Phased</b> Methodology',
        micro_brand: 'Brand Systems', micro_production: 'Commercial Production',
        trust_title: 'Brands & teams I\'ve collaborated with',
        kicker_services: 'Offer', h2_services: 'Comprehensive Solutions.',
        sub_services: 'Three strategic pillars with tangible deliverables.',
        kicker_cases: 'Selected Work', h2_projects: 'Case Studies',
        sub_projects: 'Click to explore the immersive details.',
        kicker_process: 'Method', h2_process: 'Order, Clarity, Execution.',
        step1_title: 'Diagnosis', step1_desc: 'Deep audit of brand and offer.',
        step2_title: 'Proposal', step2_desc: 'Action plan with a clear roadmap.',
        step3_title: 'Execution', step3_desc: 'High-level design & production.',
        step4_title: 'Optimization', step4_desc: 'Performance-based adjustments.',
        kicker_contact: 'Contact', h2_contact: 'Let\'s Elevate Your Brand.',
        contact_quick_title: 'Direct Line', contact_quick_desc: 'No middlemen, let\'s talk business.',
        form_title: 'Start Project', form_name: 'Your Name', form_company: 'Company / Brand',
        form_need: 'What do you need?', form_submit: 'Send Request',
        form_other_detail: 'What do you specifically need?',
        modal_cta: 'I Want Results Like This',
        modal_tools_label: 'Tech Stack', modal_equipment_label: 'Equipment Used',
        modal_video_label: 'Video Production',
        modal_client_fallback: 'Confidential Client',
        cta_request_info: 'Request Details', cta_view_case: 'View Full Case',
    }
};

/**
 * Translate a UI key to the current language.
 * @param {string} key
 * @returns {string}
 */
export function t(key) {
    const lang = getLang();
    return (UI_STRINGS[lang] && UI_STRINGS[lang][key]) || UI_STRINGS.es[key] || key;
}

/**
 * Apply translations to all elements with [data-i18n] attribute.
 */
export function applyTranslations() {
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.dataset.i18n;
        const val = t(key);
        if (val.includes('<')) {
            el.innerHTML = val;
        } else {
            el.textContent = val;
        }
    });
}

/**
 * Load language data from JSON, update store, and trigger re-render.
 * @param {string} lang - 'es' or 'en'
 * @param {Function} onRender - Callback to re-render the app after data loads
 */
export async function loadLanguage(lang, onRender) {
    try {
        const config = getConfig();
        const url = config.dataUrl[lang];
        const response = await fetch(url);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);

        const data = await response.json();

        setData(data);
        setLang(lang);

        onRender(data);
        applyTranslations();
        updateLanguageUI();

    } catch (error) {
        console.error('Error loading language:', error);
        if (lang !== 'es') loadLanguage('es', onRender);
    }
}

/**
 * Setup language switcher buttons.
 * @param {Function} onRender - Callback to re-render the app
 */
export function setupLanguageSwitcher(onRender) {
    document.querySelectorAll('[data-lang]').forEach(btn => {
        btn.addEventListener('click', () => {
            const newLang = btn.dataset.lang;
            if (newLang === getLang()) return;
            loadLanguage(newLang, onRender);
        });
    });
}

function updateLanguageUI() {
    const lang = getLang();
    document.querySelectorAll('[data-lang]').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.lang === lang);
    });
}
