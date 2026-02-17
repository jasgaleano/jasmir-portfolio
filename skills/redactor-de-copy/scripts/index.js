const fs = require('fs');
const path = require('path');
const readline = require('readline');

// Configuración
const SKILL_NAME = "Redactor-de-copy";
const HISTORY_FILE = path.join(__dirname, '..', '.copywriter_history.json');
const OUTPUT_DIR = path.join(process.cwd(), 'copy');
const TEMPLATES_DIR = path.join(__dirname, '..', 'templates');

// Colores para consola
const colors = {
    reset: "\x1b[0m",
    bright: "\x1b[1m",
    green: "\x1b[32m",
    cyan: "\x1b[36m",
    yellow: "\x1b[33m",
    magenta: "\x1b[35m"
};

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const ask = (q) => new Promise((resolve) => rl.question(`${colors.cyan}? ${q}${colors.reset} `, resolve));

// --- 1. Contexto del Proyecto ---
function getProjectContext() {
    let context = {
        product: 'Mi Producto',
        audience: 'Mi Audiencia',
        pain: 'Un problema doloroso',
        benefit: 'Una solución increíble'
    };

    try {
        const packageJsonPath = path.join(process.cwd(), 'package.json');
        if (fs.existsSync(packageJsonPath)) {
            const pkg = require(packageJsonPath);
            if (pkg.name) context.product = pkg.name;
        }

        const readmePath = path.join(process.cwd(), 'README.md');
        if (fs.existsSync(readmePath)) {
            const readme = fs.readFileSync(readmePath, 'utf-8');
            // Intentar extraer descripción simple
            const firstLines = readme.split('\n').slice(0, 10).join(' ');
            if (firstLines.length > 10) {
                // Heurística muy básica
            }
        }
    } catch (e) {
        // Ignorar errores de lectura
    }
    return context;
}

// --- 2. Gestión de Templates ---
function getTemplates() {
    if (!fs.existsSync(TEMPLATES_DIR)) return [];
    return fs.readdirSync(TEMPLATES_DIR)
        .filter(f => f.endsWith('.md'))
        .map(f => f.replace('.md', ''));
}

function loadTemplate(name) {
    const filePath = path.join(TEMPLATES_DIR, `${name}.md`);
    if (fs.existsSync(filePath)) {
        return fs.readFileSync(filePath, 'utf-8');
    }
    return null;
}

function fillTemplate(template, data) {
    let content = template;
    for (const [key, value] of Object.entries(data)) {
        const regex = new RegExp(`{{${key}}}`, 'g');
        content = content.replace(regex, value);
    }
    return content;
}

// --- 3. Historial ---
function saveToHistory(entry) {
    let history = [];
    if (fs.existsSync(HISTORY_FILE)) {
        try { history = JSON.parse(fs.readFileSync(HISTORY_FILE, 'utf-8')); } catch (e) { }
    }
    history.unshift({ date: new Date().toISOString(), ...entry });
    if (history.length > 20) history = history.slice(0, 20); // Mantener últimos 20
    fs.writeFileSync(HISTORY_FILE, JSON.stringify(history, null, 2));
}

function showHistory() {
    if (!fs.existsSync(HISTORY_FILE)) {
        console.log("📭 Historial vacío.");
        return;
    }
    const history = JSON.parse(fs.readFileSync(HISTORY_FILE, 'utf-8'));
    console.log(`\n${colors.bright}📜 Historial Reciente:${colors.reset}\n`);
    history.forEach((h, i) => {
        console.log(`${i + 1}. [${h.type.toUpperCase()}] ${h.data.product} -> ${h.outputFile || 'No guardado'}`);
    });
}

// --- 4. Flujo Principal ---
async function modeInteractive() {
    console.log(`\n${colors.magenta}✍️  ${SKILL_NAME} (Copywriter)${colors.reset}`);
    console.log(`${colors.green}Vamos a escribir algo genial.${colors.reset}\n`);

    const context = getProjectContext();
    const templates = getTemplates();

    // 1. Elegir Template
    console.log("Elige un framework:");
    templates.forEach((t, i) => console.log(`${i + 1}. ${t.toUpperCase()}`));
    const tIndex = await ask("Número (o escribe el nombre):");

    let selectedTemplate = templates[parseInt(tIndex) - 1] || tIndex;
    if (!templates.includes(selectedTemplate)) {
        console.log("❌ Template no válido.");
        rl.close();
        return;
    }

    // 2. Rellenar Datos
    const data = {};
    console.log(`\nConfigurando ${selectedTemplate.toUpperCase()}... (Enter para usar default)`);

    data.product = await ask(`Producto/Proyecto [${context.product}]:`) || context.product;
    data.audience = await ask(`Audiencia [${context.audience}]:`) || context.audience;
    data.pain = await ask(`Dolor principal [${context.pain}]:`) || context.pain;
    data.benefit = await ask(`Beneficio clave [${context.benefit}]:`) || context.benefit;

    // 3. Generar
    const rawTemplate = loadTemplate(selectedTemplate);
    const result = fillTemplate(rawTemplate, data);

    console.log(`\n${colors.yellow}--- PREVIEW ---${colors.reset}`);
    console.log(result);
    console.log(`${colors.yellow}---------------${colors.reset}\n`);

    // 4. Guardar
    const save = await ask("¿Guardar en archivo? (s/n):");
    if (save.toLowerCase() === 's') {
        if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR);
        const filename = `${selectedTemplate}_${Date.now()}.md`;
        const filepath = path.join(OUTPUT_DIR, filename);
        fs.writeFileSync(filepath, result);
        console.log(`✅ Guardado en: copy/${filename}`);

        saveToHistory({ type: selectedTemplate, data, outputFile: filename });
    } else {
        saveToHistory({ type: selectedTemplate, data, outputFile: null });
    }

    rl.close();
}

async function run() {
    const args = process.argv.slice(2);
    const command = args[0];

    if (command === 'history') {
        showHistory();
        rl.close();
    } else if (command === 'ideas') {
        // Implementación rápida de ideas
        const topic = args[args.indexOf('--topic') + 1] || 'General';
        console.log(`\n🧠 Ideas para: ${topic}`);
        console.log("1. Cómo [Beneficio] sin [Dolor]");
        console.log("2. La guía definitiva de [Producto]");
        console.log("3. 3 Errores comunes en [Industria]");
        rl.close();
    } else {
        await modeInteractive();
    }
}

run();
