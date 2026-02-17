
import fs from 'fs';
import path from 'path';

const esPath = path.resolve('public/data.es.json');
const enPath = path.resolve('public/data.en.json');

const esData = JSON.parse(fs.readFileSync(esPath, 'utf-8'));
let enDataOriginal = {};

try {
    enDataOriginal = JSON.parse(fs.readFileSync(enPath, 'utf-8'));
} catch (e) {
    console.log("No existing EN data found, creating from ES.");
}

// Function to recursively merge logic? 
// Actually, we want ES structure 100%. We just want to pull string values from EN if they exist.

const newEnData = JSON.parse(JSON.stringify(esData)); // Deep copy ES

// Helper: Attempt to find project in EN data by ID
function findEnProject(id) {
    if (!enDataOriginal.proyectos) return null;
    return enDataOriginal.proyectos.find(p => p.id === id);
}

// 1. Profile
if (enDataOriginal.perfil) {
    newEnData.perfil.rol = enDataOriginal.perfil.rol || newEnData.perfil.rol;
    newEnData.perfil.disponibilidad = enDataOriginal.perfil.disponibilidad || newEnData.perfil.disponibilidad;
    // Keep photos from ES to ensure webp
}

// 2. Hero
if (enDataOriginal.hero) {
    newEnData.hero.titulo_principal = enDataOriginal.hero.titulo_principal || newEnData.hero.titulo_principal;
    newEnData.hero.titulo_secundario = enDataOriginal.hero.titulo_secundario || newEnData.hero.titulo_secundario;
    newEnData.hero.descripcion = enDataOriginal.hero.descripcion || newEnData.hero.descripcion;
}

// 3. Servicios
if (enDataOriginal.servicios && Array.isArray(enDataOriginal.servicios)) {
    newEnData.servicios.forEach((svc, index) => {
        const enSvc = enDataOriginal.servicios[index];
        if (enSvc) {
            svc.titulo = enSvc.titulo;
            svc.descripcion = enSvc.descripcion;
            svc.puntos = enSvc.puntos;
        }
    });
}

// 4. Proyectos
if (newEnData.proyectos) {
    newEnData.proyectos.forEach(proj => {
        const enProj = findEnProject(proj.id);
        if (enProj) {
            proj.titulo = enProj.titulo;
            proj.categoria = enProj.categoria;
            proj.tags = enProj.tags; // These are usually English anyway
            proj.servicios_lista = enProj.servicios_lista;
            proj.descripcion_corta = enProj.descripcion_corta;

            // Detail
            if (proj.detalle) {
                if (enProj.detalle && enProj.detalle.descripcion_larga) {
                    proj.detalle.descripcion_larga = enProj.detalle.descripcion_larga;
                }
                // Media Showcase: Keep ES structure (images/order), but try to translate captions?
                // It's hard to match captions if structure changed. 
                // We will leave ES captions for now, User can review text.
            }
        }
    });
}

fs.writeFileSync(enPath, JSON.stringify(newEnData, null, 4));
console.log("Synced data.en.json with ES structure and EN text.");
