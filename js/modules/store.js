// ---------------------------
// Store: Central State Management
// ---------------------------

const CONFIG = {
    dataUrl: {
        es: '/data.es.json',
        en: '/data.en.json'
    },
    defaultLang: 'es',
    pixelId: import.meta.env.VITE_PIXEL_ID || 'TU_PIXEL_ID_AQUI'
};

let appData = null;
let currentLang = localStorage.getItem('lang') || navigator.language.split('-')[0] || CONFIG.defaultLang;
if (!['es', 'en'].includes(currentLang)) currentLang = CONFIG.defaultLang;

export function getConfig() {
    return CONFIG;
}

export function getData() {
    return appData;
}

export function setData(data) {
    appData = data;
}

export function getLang() {
    return currentLang;
}

export function setLang(lang) {
    currentLang = lang;
    localStorage.setItem('lang', lang);
    document.documentElement.lang = lang;
}
