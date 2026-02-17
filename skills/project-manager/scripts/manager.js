const fs = require('fs');
const path = require('path');

// -- Configuración --
const CONFIG_FILE = path.join(__dirname, '../skill-config.json');

function getConfig() {
    if (fs.existsSync(CONFIG_FILE)) {
        return JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf8'));
    }

    // Auto-detectar data.js
    let foundData = null;
    const projectRoot = path.resolve(__dirname, '../../../');

    // Lugares comunes donde podría estar data.js
    const possiblePaths = [
        'js/data.js',
        'src/data/data.js',
        'src/data.js',
        'data/data.js',
        'js/portfolio-data.js'
    ];

    for (const p of possiblePaths) {
        const fullPath = path.join(projectRoot, p);
        if (fs.existsSync(fullPath)) {
            foundData = p;
            break;
        }
    }

    if (!foundData) {
        console.warn('⚠️ No se encontró archivo de datos por defecto. Se usará "js/data.js" y asumimos que se creará.');
        foundData = 'js/data.js'; // Default fallback Jasmir
    }

    const config = {
        dataFile: foundData,
        uploadsDir: 'assets/uploads' // Default
    };

    // Guardar config para la próxima
    try {
        fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2));
    } catch (e) {
        // Ignorar si no se puede escribir (ej: permisos)
    }
    return config;
}

const config = getConfig();
const DATA_FILE = path.resolve(__dirname, '../../../', config.dataFile);
const UPLOADS_DIR = path.resolve(__dirname, '../../../', config.uploadsDir);

function loadData() {
    if (!fs.existsSync(DATA_FILE)) {
        console.error(`Error: No se encontró el archivo de datos en ${DATA_FILE}`);
        // Si no existe, podríamos ofrecer crearlo con un template básico, pero por seguridad abortamos.
        process.exit(1);
    }
    const content = fs.readFileSync(DATA_FILE, 'utf8');
    // Regex más flexible para encontrar la variable principal, sea cual sea su nombre
    // Buscamos "const ALGO = { ... };"
    const match = content.match(/const\s+(\w+)\s*=\s*(\{[\s\S]*\});\s*$/);

    if (!match) {
        console.error('Error: No se pudo parsear el objeto de datos. Asegúrate que siga el formato "const VARIABLE = { ... };"');
        process.exit(1);
    }

    try {
        const varName = match[1];
        const data = new Function(`return ${match[2]}`)();
        return { data, fullContent: content, jsonString: match[2], varName };
    } catch (e) {
        console.error('Error parseando JSON:', e);
        process.exit(1);
    }
}

function saveData(data, varName) {
    const newJson = JSON.stringify(data, null, 4);
    const newContent = `const ${varName} = ${newJson};\n`;
    fs.writeFileSync(DATA_FILE, newContent, 'utf8');
    console.log('Datos guardados exitosamente.');
}

function ensureUploadsDir() {
    if (!fs.existsSync(UPLOADS_DIR)) {
        fs.mkdirSync(UPLOADS_DIR, { recursive: true });
    }
}

// -- Helper: Process Cover Image --
function processCoverImage(args, projectId) {
    let coverPath = args.cover || '';

    if (args.imagePath) {
        // Determinar ruta de origen
        let sourcePath = args.imagePath;

        // Si se usa --folder, la ruta es relativa a assets/uploads/[folder]/
        if (args.folder) {
            const folderPath = path.join(UPLOADS_DIR, args.folder);
            if (!path.isAbsolute(args.imagePath)) {
                sourcePath = path.join(folderPath, args.imagePath);
            }
        }

        if (!fs.existsSync(sourcePath)) {
            console.warn(`⚠️ Imagen de portada no encontrada: ${sourcePath}`);
            return coverPath;
        }

        // Si se usa --folder, mantener estructura organizada
        if (args.folder) {
            // Ruta relativa: assets/uploads/[folder]/[filename]
            coverPath = path.join(config.uploadsDir, args.folder, path.basename(sourcePath)).replace(/\\/g, '/');
        } else {
            // Modo legacy: copiar a uploads con nomenclatura p[X]_cover
            const ext = path.extname(sourcePath);
            const fileName = `${projectId}_cover${ext}`;
            const destPath = path.join(UPLOADS_DIR, fileName);

            fs.copyFileSync(sourcePath, destPath);
            console.log(`✅ Imagen de portada copiada: ${destPath}`);

            coverPath = path.join(config.uploadsDir, fileName).replace(/\\/g, '/');
        }
    }

    return coverPath;
}

// -- Helper: Process Gallery Images --
function processGalleryImages(galleryArg, projectId, folder) {
    if (!galleryArg) return [];

    const galleryPaths = galleryArg.split(',').map(p => p.trim());
    const galleryRelative = [];

    galleryPaths.forEach((imagePath, index) => {
        let sourcePath = imagePath;

        // Si se usa --folder, la ruta es relativa a assets/uploads/[folder]/
        if (folder) {
            const folderPath = path.join(UPLOADS_DIR, folder);
            if (!path.isAbsolute(imagePath)) {
                sourcePath = path.join(folderPath, imagePath);
            }
        }

        if (!fs.existsSync(sourcePath)) {
            console.warn(`⚠️  Imagen de galería no encontrada: ${sourcePath}`);
            return;
        }

        // Si se usa --folder, mantener estructura organizada
        if (folder) {
            // Ruta relativa: assets/uploads/[folder]/[filename]
            const relativePath = path.join(config.uploadsDir, folder, path.basename(sourcePath)).replace(/\\/g, '/');
            galleryRelative.push(relativePath);
        } else {
            // Modo legacy: copiar con nomenclatura p[X]_gallery_[N]
            const ext = path.extname(sourcePath);
            const fileName = `${projectId}_gallery_${index + 1}${ext}`;
            const destPath = path.join(UPLOADS_DIR, fileName);

            fs.copyFileSync(sourcePath, destPath);
            console.log(`✅ Imagen de galería ${index + 1} copiada: ${destPath}`);

            const relativePath = path.join(config.uploadsDir, fileName).replace(/\\/g, '/');
            galleryRelative.push(relativePath);
        }
    });

    return galleryRelative;
}

function addProject(args) {
    const { data, varName } = loadData();
    ensureUploadsDir();

    const projectId = `p${data.proyectos.length + 1}`;

    // -- Process Images --
    const coverPath = processCoverImage(args, projectId);
    const galleryImages = processGalleryImages(args.galeria, projectId, args.folder);

    const newProject = {
        id: projectId,
        titulo: args.titulo || 'Nuevo Proyecto',
        cliente: args.cliente || 'Cliente Anónimo',
        anio: new Date().getFullYear().toString(),
        categoria: args.categoria || 'Varios',
        tags: args.tags ? args.tags.split(',').map(t => t.trim()) : [],
        descripcion_corta: args.desc_corta || '',
        tipo: 'imagen',
        cover: coverPath,
        detalle: {
            descripcion_larga: args.desc_larga || '',
            galeria: galleryImages
        }
    };

    // Flexible: si no existe array proyectos, lo crea
    if (!data.proyectos) data.proyectos = [];

    data.proyectos.push(newProject);
    saveData(data, varName);
    console.log(`Proyecto "${newProject.titulo}" agregado correctamente.`);
}

function updateStatus(statusText) {
    const { data, varName } = loadData();
    if (data.perfil) {
        data.perfil.disponibilidad = statusText;
        saveData(data, varName);
        console.log(`Estado actualizado a: "${statusText}"`);
    } else {
        console.error("No se encontró objeto 'perfil' en los datos.");
    }
}

function audit() {
    const { data } = loadData();
    console.log(`--- Auditoría de Portafolio (${config.dataFile}) ---`);
    console.log(`Proyectos encontrados: ${data.proyectos ? data.proyectos.length : 0}`);

    // Aquí iría más lógica de auditoría genérica
}

function deleteProjects(projectIds) {
    const { data, varName } = loadData();

    if (!data.proyectos) {
        console.error('No hay proyectos para eliminar.');
        return;
    }

    const idsToDelete = projectIds.split(',').map(id => id.trim());
    const initialCount = data.proyectos.length;

    // Filtrar proyectos que NO están en la lista de IDs a eliminar
    data.proyectos = data.proyectos.filter(p => !idsToDelete.includes(p.id));

    const deletedCount = initialCount - data.proyectos.length;

    if (deletedCount > 0) {
        saveData(data, varName);
        console.log(`✅ ${deletedCount} proyecto(s) eliminado(s): ${idsToDelete.join(', ')}`);
        console.log('⚠️  Nota: Las imágenes en assets/uploads/ NO se eliminaron automáticamente.');
    } else {
        console.log('⚠️  No se encontraron proyectos con esos IDs.');
    }
}

const command = process.argv[2];
// Argument parser mejorado
const simpleArgs = {};
for (let i = 3; i < process.argv.length; i++) {
    const arg = process.argv[i];
    if (arg.startsWith('--')) {
        const key = arg.substring(2);
        const val = process.argv[i + 1] && !process.argv[i + 1].startsWith('--') ? process.argv[i + 1] : true;
        simpleArgs[key] = val;
    }
}

switch (command) {
    case 'add-project':
        addProject(simpleArgs);
        break;
    case 'update-status':
        if (!simpleArgs.text) {
            console.error('Uso: update-status --text "Nuevo estado"');
        } else {
            updateStatus(simpleArgs.text);
        }
        break;
    case 'audit':
        audit();
        break;
    case 'delete-projects':
        if (!simpleArgs.ids) {
            console.error('Uso: delete-projects --ids "p4,p5,p6,p7"');
        } else {
            deleteProjects(simpleArgs.ids);
        }
        break;
    default:
        console.log('Comandos: add-project, update-status, audit, delete-projects');
}
