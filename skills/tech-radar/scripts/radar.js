const fs = require('fs');
const path = require('path');

// -- Configuración --
const REPORT_FILE = 'TECH_REPORT.md';
const COMPLEXITY_THRESHOLD_LINES = 300; // Líneas para considerar un archivo "complejo"
const CSS_DEBT_THRESHOLD = 500; // Líneas de CSS para sugerir Tailwind/Modules

// -- Utilidades --
function loadRules() {
    const rulesPath = path.join(__dirname, '../radar.json');
    if (!fs.existsSync(rulesPath)) return [];
    return JSON.parse(fs.readFileSync(rulesPath, 'utf8'));
}

function getAllFiles(dirPath, arrayOfFiles) {
    const files = fs.readdirSync(dirPath);
    arrayOfFiles = arrayOfFiles || [];

    files.forEach(function (file) {
        if (fs.statSync(dirPath + "/" + file).isDirectory()) {
            if (file !== 'node_modules' && file !== '.git' && file !== 'dist') {
                arrayOfFiles = getAllFiles(dirPath + "/" + file, arrayOfFiles);
            }
        } else {
            arrayOfFiles.push(path.join(dirPath, "/", file));
        }
    });
    return arrayOfFiles;
}

// -- Analizadores Heurísticos --

function analyzeBackendNeed(files, projectRoot) {
    let score = 0;
    const risks = [];

    files.forEach(file => {
        const content = fs.readFileSync(file, 'utf8');

        // 1. Datos Mockeados Masivos
        if (file.includes('mock') || file.includes('data')) {
            const lines = content.split('\n').length;
            if (lines > 200) {
                score += 2;
                risks.push(`Archivo de datos estáticos grande: ${path.relative(projectRoot, file)} (${lines} líneas).`);
            }
        }

        // 2. Secretos Potenciales (Heurística simple)
        if (file.endsWith('.js') || file.endsWith('.ts')) {
            if (content.includes('API_KEY') && !content.includes('process.env')) {
                score += 3;
                risks.push(`Posible API Key expuesta en cliente: ${path.relative(projectRoot, file)}.`);
            }
        }

        // 3. Lógica de Fetch compleja
        if ((file.endsWith('.js') || file.endsWith('.jsx')) && content.includes('fetch(')) {
            const fetchCount = (content.match(/fetch\(/g) || []).length;
            if (fetchCount > 5) {
                score += 1;
                risks.push(`Alta densidad de llamadas a API en ${path.relative(projectRoot, file)}.`);
            }
        }
    });

    if (score >= 3) {
        return {
            title: "🚨 Necesidad de Backend / CMS",
            severity: "ALTA",
            description: "El frontend está manejando demasiada lógica de datos o seguridad.",
            evidence: risks,
            proposal: "Considerar implementar un Backend (Node.js) o usar Supabase como Backend-as-a-Service.",
            action: "Evaluar migración a Supabase o Next.js API Routes."
        };
    }
    return null;
}

function analyzeStyles(files, projectRoot) {
    let cssLines = 0;
    let cssFiles = 0;

    files.filter(f => f.endsWith('.css')).forEach(file => {
        cssFiles++;
        cssLines += fs.readFileSync(file, 'utf8').split('\n').length;
    });

    if (cssLines > CSS_DEBT_THRESHOLD) {
        return {
            title: "🎨 Deuda Técnica en Estilos",
            severity: "MEDIA",
            description: `Tu proyecto tiene ${cssLines} líneas de CSS puro distribuidas en ${cssFiles} archivos. Esto será difícil de mantener.`,
            evidence: [`Total CSS: ${cssLines} líneas.`],
            proposal: "Migrar a Tailwind CSS o CSS Modules.",
            action: "Instalar Tailwind CSS."
        };
    }
    return null;
}

function analyzeBasicRules(projectRoot) {
    const findings = [];
    const rules = loadRules();

    // Leer package.json
    const packagePath = path.join(projectRoot, 'package.json');
    let dependencies = [];
    if (fs.existsSync(packagePath)) {
        try {
            const pkg = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
            dependencies = [
                ...Object.keys(pkg.dependencies || {}),
                ...Object.keys(pkg.devDependencies || {})
            ];
        } catch (e) { }
    }

    rules.forEach(rule => {
        let matched = false;
        // Lógica simplificada de keywords del v1
        if (rule.trigger.files && rule.trigger.files.includes('package.json')) {
            if (rule.trigger.contains && rule.trigger.contains.some(k => dependencies.some(d => d.includes(k)))) matched = true;
            if (rule.trigger.missing && rule.trigger.missing.every(k => !dependencies.some(d => d.includes(k)))) {
                if (!rule.trigger.contains || matched) matched = true;
            }
        }
        if (rule.trigger.files && rule.trigger.exists && rule.trigger.files.some(f => fs.existsSync(path.join(projectRoot, f)))) {
            matched = true;
        }

        // Comprobación: Missing Directory (para no sugerir skills ya instaladas)
        if (rule.trigger.missing_dir) {
            const dirExists = rule.trigger.missing_dir.some(d => fs.existsSync(path.join(projectRoot, d)));
            if (dirExists) matched = false; // Si existe, no sugerir (anula el match anterior)
        }

        if (matched) {
            findings.push({
                title: "💡 Oportunidad Detectada",
                severity: "BAJA",
                description: rule.suggestion,
                evidence: ["Basado en reglas de radar.json"],
                proposal: rule.action,
                action: rule.action
            });
        }
    });
    return findings;
}

// -- Generador de Reporte --

function generateMarkdownReport(findings, projectRoot) {
    const date = new Date().toISOString().split('T')[0];
    let md = `# 📡 Tech Radar Report - ${date}\n\n`;
    md += `**Proyecto:** ${path.basename(projectRoot)}\n`;
    md += `**Estado:** Se encontraron ${findings.length} oportunidades de mejora.\n\n`;
    md += `> **Nota:** Este informe NO aplica cambios. Revisa y aprueba las acciones manualmente.\n\n`;
    md += `---\n\n`;

    findings.forEach(f => {
        const icon = f.severity === 'ALTA' ? '🔴' : (f.severity === 'MEDIA' ? '🟡' : '🟢');
        md += `### ${icon} ${f.title}\n\n`;
        md += `**Descripción:** ${f.description}\n`;
        if (f.evidence && f.evidence.length > 0) {
            md += `**Evidencia:**\n`;
            f.evidence.forEach(e => md += `- ${e}\n`);
        }
        md += `\n**Propuesta:** ${f.proposal}\n`;
        md += `**Acción Recomendada:** \`${f.action}\`\n\n`;
        md += `---\n`;
    });

    return md;
}

// -- Main --
console.log('📡 Iniciando escaneo profundo (Tech Radar v2)...');
const projectRoot = path.resolve(__dirname, '../../../');
const allFiles = getAllFiles(projectRoot);

const findings = [];

// 1. Análisis Arquitectónico
const backendAnalysis = analyzeBackendNeed(allFiles, projectRoot);
if (backendAnalysis) findings.push(backendAnalysis);

const styleAnalysis = analyzeStyles(allFiles, projectRoot);
if (styleAnalysis) findings.push(styleAnalysis);

// 2. Reglas Básicas (v1)
const basicFindings = analyzeBasicRules(projectRoot);
findings.push(...basicFindings);

// 3. Generar Reporte
if (findings.length === 0) {
    console.log('✅ El proyecto se ve saludable. Sin reportes.');
} else {
    const reportContent = generateMarkdownReport(findings, projectRoot);
    const reportPath = path.join(projectRoot, REPORT_FILE);
    fs.writeFileSync(reportPath, reportContent);
    console.log(`\n📄 **INFORME GENERADO:** ${REPORT_FILE}`);
    console.log('    Por favor, abre este archivo para ver los detalles y aprobar acciones.');
}
