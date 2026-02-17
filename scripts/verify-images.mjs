/**
 * Verify all image paths in data.es.json exist in the filesystem
 */

import { readFile, access } from 'node:fs/promises';
import { join } from 'node:path';

const DATA_FILE = join(import.meta.dirname, '..', 'public', 'data.es.json');
const PUBLIC_DIR = join(import.meta.dirname, '..', 'public');

const data = JSON.parse(await readFile(DATA_FILE, 'utf-8'));

let totalImages = 0;
let missingImages = [];

for (const proyecto of data.proyectos) {
    if (!proyecto.detalle?.media_showcase) continue;

    for (const media of proyecto.detalle.media_showcase) {
        if (!media.url || media.url.startsWith('http')) continue; // skip external URLs

        totalImages++;
        const fullPath = join(PUBLIC_DIR, media.url);

        try {
            await access(fullPath);
        } catch (err) {
            missingImages.push({
                project: proyecto.nombre,
                path: media.url
            });
        }
    }
}

console.log(`\n📊 Image Verification Report`);
console.log(`─────────────────────────────────`);
console.log(`Total images referenced: ${totalImages}`);
console.log(`Missing images: ${missingImages.length}`);

if (missingImages.length > 0) {
    console.log(`\n❌ Missing files:\n`);
    missingImages.forEach(m => {
        console.log(`  Project: ${m.project}`);
        console.log(`  Path: ${m.path}\n`);
    });
} else {
    console.log(`\n✅ All images exist! Ready for production.`);
}
