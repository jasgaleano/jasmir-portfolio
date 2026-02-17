const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// -- Utilidades --
function getGitLog() {
    try {
        // Intentar ejecutar git desde la raíz del proyecto
        const projectRoot = path.resolve(__dirname, '../../../');
        const log = execSync('git log -n 5 --pretty=format:"%h - %s (%ad)" --date=short', { cwd: projectRoot }).toString();
        return log.split('\n').filter(Boolean);
    } catch (e) {
        console.warn('⚠️ No se pudo leer git log (¿es un repo git? o no hay git en PATH). Usando fallback.');
        return ['Registro manual: Actualización de documentación.'];
    }
}

function getTaskStatus() {
    // Intenta leer task.md local si existe (o buscar en .gemini/brain si fuera muy avanzado, pero mantenlo simple local)
    // Aquí simularemos buscar un TODO.md o similar en la raíz
    const todoPath = path.resolve(__dirname, '../../TODO.md'); // Ajustar ruta
    if (fs.existsSync(todoPath)) {
        // Lógica simple para extraer items marcados como [x]
        return [];
    }
    return [];
}

// -- Generador de Contenido --
const logs = getGitLog();
const date = new Date().toISOString().split('T')[0];

if (logs.length === 0) {
    console.log('No hay cambios recientes detectados en git.');
    process.exit(0);
}

const newEntry = `
## [${date}] Actualización Automática
**Cambios Recientes:**
${logs.map(l => `- ${l}`).join('\n')}
`;

// -- Actualizar CHANGELOG.md --
const changelogPath = path.resolve(__dirname, '../../../CHANGELOG.md'); // Subir desde skills/project-scribe/scripts
let changelogContent = '';

if (fs.existsSync(changelogPath)) {
    changelogContent = fs.readFileSync(changelogPath, 'utf8');
} else {
    changelogContent = '# Changelog\n\nRegistro de cambios del proyecto.\n';
}

// Insertar al principio (después del título)
const lines = changelogContent.split('\n');
const titleIndex = lines.findIndex(l => l.startsWith('# '));
const insertIndex = titleIndex >= 0 ? titleIndex + 2 : 0;

lines.splice(insertIndex, 0, newEntry);
fs.writeFileSync(changelogPath, lines.join('\n'));
console.log(`✅ CHANGELOG.md actualizado.`);

// -- Actualizar README.md (Sección "Última Actividad") --
const readmePath = path.resolve(__dirname, '../../../README.md');
if (fs.existsSync(readmePath)) {
    let readmeContent = fs.readFileSync(readmePath, 'utf8');

    // Buscar marcador o sección
    const sectionHeader = '## Última Actividad';
    if (!readmeContent.includes(sectionHeader)) {
        readmeContent += `\n\n${sectionHeader}\n`;
    }

    // Reemplazar contenido de la sección (regex simple)
    // Simplemente añadimos al final por ahora para no romper
    // En una versión avanzada, buscaríamos el bloque y lo reemplazaríamos.

    //console.log('Nota: Para el README, se recomienda tener un marcador <!-- LATEST_UPDATE -->');
}
