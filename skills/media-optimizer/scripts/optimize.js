const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// -- Dependencia: Sharp --
function ensureSharp() {
    try {
        return require('sharp');
    } catch (e) {
        console.log('📦 Instalando dependencia necesaria: sharp...');
        try {
            const installCwd = path.resolve(__dirname, '../../../');
            execSync('npm install sharp', { stdio: 'inherit', cwd: installCwd });
            return require('sharp');
        } catch (err) {
            console.error('❌ Error instalando sharp. Por favor ejecuta "npm install sharp" manualmente.');
            process.exit(1);
        }
    }
}

const sharp = ensureSharp();

// -- Configuración --
const CONFIG_FILE = path.join(__dirname, '../skill-config.json');
const DEFAULT_DIRS = ['assets/uploads', 'assets', 'public/images', 'public/img', 'src/assets'];

function getConfig() {
    if (fs.existsSync(CONFIG_FILE)) {
        return JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf8'));
    }

    // Auto-detectar
    let foundDir = null;
    const projectRoot = path.resolve(__dirname, '../../../');

    for (const dir of DEFAULT_DIRS) {
        const fullPath = path.join(projectRoot, dir);
        if (fs.existsSync(fullPath)) {
            foundDir = dir;
            break;
        }
    }

    if (!foundDir) {
        console.warn('⚠️ No se encontró carpeta de imágenes por defecto. Usando "assets/uploads" y creándola si no existe.');
        foundDir = 'assets/uploads';
    }

    const config = { imagesDir: foundDir };
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2));
    return config;
}

// -- Parsing de Argumentos --
function parseArgs() {
    const args = process.argv.slice(2);
    const parsed = {
        input: null,
        project: null,
        output: null
    };

    for (let i = 0; i < args.length; i++) {
        if (args[i] === '--input' && args[i + 1]) {
            parsed.input = args[i + 1];
            i++;
        } else if (args[i] === '--project' && args[i + 1]) {
            parsed.project = args[i + 1];
            i++;
        } else if (args[i] === '--output' && args[i + 1]) {
            parsed.output = args[i + 1];
            i++;
        }
    }

    return parsed;
}

// -- Generar slug del nombre del proyecto --
function generateSlug(name) {
    return name
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '') // Remover acentos
        .replace(/[^a-z0-9]+/g, '-')     // Reemplazar caracteres especiales con guiones
        .replace(/^-+|-+$/g, '');        // Remover guiones al inicio y final
}

// -- Lógica de Optimización --
async function optimizeImage(inputPath, outputPath) {
    const ext = path.extname(inputPath).toLowerCase();
    if (!['.jpg', '.jpeg', '.png', '.webp'].includes(ext)) {
        console.log(`⏭️ Saltando (formato no soportado): ${path.basename(inputPath)}`);
        return null;
    }

    try {
        const image = sharp(inputPath);
        const metadata = await image.metadata();

        // Redimensionar si es muy grande (>1920px ancho)
        if (metadata.width > 1920) {
            image.resize({ width: 1920 });
        }

        // Convertir a JPG optimizado (mejor compatibilidad que WebP)
        const outputExt = '.jpg';
        const finalOutputPath = outputPath.replace(path.extname(outputPath), outputExt);

        await image
            .jpeg({ quality: 85, progressive: true })
            .toFile(finalOutputPath);

        const originalSize = fs.statSync(inputPath).size;
        const optimizedSize = fs.statSync(finalOutputPath).size;
        const savings = ((1 - optimizedSize / originalSize) * 100).toFixed(1);

        console.log(`✅ ${path.basename(inputPath)} → ${path.basename(finalOutputPath)} (${savings}% reducción)`);

        return finalOutputPath;
    } catch (err) {
        console.error(`❌ Error procesando ${path.basename(inputPath)}:`, err.message);
        return null;
    }
}

// -- Modo 1: Optimizar carpeta completa con organización por proyecto --
async function optimizeFolder(inputDir, projectName) {
    const config = getConfig();
    const projectRoot = path.resolve(__dirname, '../../../');
    const slug = generateSlug(projectName);

    // Crear carpeta de destino: assets/uploads/[project-slug]/
    const outputDir = path.join(projectRoot, config.imagesDir, slug);

    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
        console.log(`📁 Carpeta creada: ${path.relative(projectRoot, outputDir)}`);
    }

    console.log(`🚀 Optimizando carpeta: ${inputDir}`);
    console.log(`📂 Destino: ${path.relative(projectRoot, outputDir)}`);
    console.log('');

    const files = fs.readdirSync(inputDir);
    let processedCount = 0;

    for (const file of files) {
        const inputPath = path.join(inputDir, file);

        if (fs.statSync(inputPath).isDirectory()) {
            continue; // Ignorar subcarpetas por ahora
        }

        const outputPath = path.join(outputDir, file);
        const result = await optimizeImage(inputPath, outputPath);

        if (result) {
            processedCount++;
        }
    }

    console.log('');
    console.log(`✨ Optimización completada: ${processedCount} imagen(es) procesada(s)`);
    console.log(`📍 Ubicación: ${path.relative(projectRoot, outputDir)}`);

    return outputDir;
}

// -- Modo 2: Optimizar todo el directorio de imágenes (modo legacy) --
async function optimizeAll() {
    const config = getConfig();
    const projectRoot = path.resolve(__dirname, '../../../');
    const IMAGES_DIR = path.join(projectRoot, config.imagesDir);

    if (!fs.existsSync(IMAGES_DIR)) {
        console.log(`Creando directorio: ${IMAGES_DIR}`);
        fs.mkdirSync(IMAGES_DIR, { recursive: true });
    }

    console.log(`🚀 Optimizando todo en: ${path.relative(projectRoot, IMAGES_DIR)}`);

    await scanDir(IMAGES_DIR);

    console.log('✨ Optimización completada.');
}

async function scanDir(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            await scanDir(fullPath);
        } else {
            await processFileInPlace(fullPath);
        }
    }
}

async function processFileInPlace(filePath) {
    const ext = path.extname(filePath).toLowerCase();
    if (!['.jpg', '.jpeg', '.png'].includes(ext)) return;

    const dir = path.dirname(filePath);
    const name = path.basename(filePath, ext);
    const webpPath = path.join(dir, `${name}.webp`);

    // Si ya existe el webp y es más nuevo que el original, saltar
    if (fs.existsSync(webpPath)) {
        const statOrig = fs.statSync(filePath);
        const statWebp = fs.statSync(webpPath);
        if (statWebp.mtime > statOrig.mtime) return;
    }

    console.log(`🔄 Optimizando: ${path.basename(filePath)}`);

    try {
        const image = sharp(filePath);
        const metadata = await image.metadata();

        if (metadata.width > 1920) {
            image.resize({ width: 1920 });
        }

        await image
            .webp({ quality: 80 })
            .toFile(webpPath);

        console.log(`✅ Generado: ${path.basename(webpPath)}`);
    } catch (err) {
        console.error(`❌ Error procesando ${filePath}:`, err.message);
    }
}

// -- Main --
(async () => {
    const args = parseArgs();

    if (args.input && args.project) {
        // Modo nuevo: optimizar carpeta con organización por proyecto
        if (!fs.existsSync(args.input)) {
            console.error(`❌ Error: La carpeta de entrada no existe: ${args.input}`);
            process.exit(1);
        }

        await optimizeFolder(args.input, args.project);
    } else if (args.input || args.project) {
        console.error('❌ Error: Debes especificar tanto --input como --project');
        console.log('');
        console.log('Uso:');
        console.log('  node optimize.js --input "C:/Fotos/Proyecto" --project "nombre-proyecto"');
        console.log('  node optimize.js  (optimiza todo el directorio de imágenes)');
        process.exit(1);
    } else {
        // Modo legacy: optimizar todo
        await optimizeAll();
    }
})();
