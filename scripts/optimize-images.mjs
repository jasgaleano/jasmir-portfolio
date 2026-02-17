/**
 * Image Optimizer for Jasmir Portfolio
 * Compresses and converts heavy images for production.
 *
 * Strategy:
 * - PNG > 200KB → WebP (quality 82, max 2000px wide)
 * - JPG/JPEG > 200KB → compressed JPEG (quality 80, max 2000px wide)
 * - Creates backup of originals in _originals/ before replacing
 * - Updates data.es.json paths from .png → .webp
 */

import sharp from 'sharp';
import { readdir, stat, mkdir, copyFile, readFile, writeFile, rename } from 'node:fs/promises';
import { join, extname, basename, dirname } from 'node:path';

const ROOT = join(import.meta.dirname, '..', 'public', 'assets', 'img', 'proyectos');
const DATA_FILE = join(import.meta.dirname, '..', 'public', 'data.es.json');
const MIN_SIZE = 200 * 1024; // 200KB threshold
const MAX_WIDTH = 2000;
const JPEG_QUALITY = 80;
const WEBP_QUALITY = 82;

let stats = { processed: 0, skipped: 0, totalSavedMB: 0, errors: 0 };

/**
 * Recursively find all image files
 */
async function findImages(dir) {
    const files = [];
    const entries = await readdir(dir, { withFileTypes: true });

    for (const entry of entries) {
        const fullPath = join(dir, entry.name);
        if (entry.name === '_originals') continue; // skip backup folder

        if (entry.isDirectory()) {
            files.push(...await findImages(fullPath));
        } else {
            const ext = extname(entry.name).toLowerCase();
            if (['.png', '.jpg', '.jpeg'].includes(ext)) {
                files.push(fullPath);
            }
        }
    }
    return files;
}

/**
 * Optimize a single image
 */
async function optimizeImage(filePath) {
    const fileInfo = await stat(filePath);
    if (fileInfo.size < MIN_SIZE) {
        stats.skipped++;
        return null; // skip small files
    }

    const ext = extname(filePath).toLowerCase();
    const originalSizeMB = fileInfo.size / (1024 * 1024);

    try {
        const image = sharp(filePath);
        const metadata = await image.metadata();

        // Resize if wider than MAX_WIDTH
        const needsResize = metadata.width && metadata.width > MAX_WIDTH;
        let pipeline = needsResize ? image.resize(MAX_WIDTH, null, { withoutEnlargement: true }) : image;

        let outputPath;
        let newSize;

        if (ext === '.png') {
            // PNG → WebP conversion
            outputPath = filePath.replace(/\.png$/i, '.webp');
            const buffer = await pipeline.webp({ quality: WEBP_QUALITY }).toBuffer();
            newSize = buffer.length;

            // Only convert if it's actually smaller
            if (newSize < fileInfo.size * 0.9) {
                // Backup original
                const backupDir = join(dirname(filePath), '_originals');
                await mkdir(backupDir, { recursive: true });
                await copyFile(filePath, join(backupDir, basename(filePath)));

                // Write optimized
                await writeFile(outputPath, buffer);

                // Remove original PNG (the .webp replaces it)
                const { unlink } = await import('node:fs/promises');
                await unlink(filePath);

                const savedMB = originalSizeMB - (newSize / (1024 * 1024));
                stats.totalSavedMB += savedMB;
                stats.processed++;
                console.log(`  ✅ ${basename(filePath)} → .webp | ${originalSizeMB.toFixed(1)}MB → ${(newSize / 1024 / 1024).toFixed(1)}MB (saved ${savedMB.toFixed(1)}MB)`);
                return { original: filePath, optimized: outputPath, type: 'png-to-webp' };
            } else {
                stats.skipped++;
                console.log(`  ⏭️  ${basename(filePath)} — WebP not smaller, skipping`);
                return null;
            }
        } else {
            // JPEG → compressed JPEG (keep format)
            outputPath = filePath;
            const buffer = await pipeline.jpeg({ quality: JPEG_QUALITY, mozjpeg: true }).toBuffer();
            newSize = buffer.length;

            if (newSize < fileInfo.size * 0.9) {
                // Backup original
                const backupDir = join(dirname(filePath), '_originals');
                await mkdir(backupDir, { recursive: true });
                await copyFile(filePath, join(backupDir, basename(filePath)));

                // Overwrite with compressed
                await writeFile(outputPath, buffer);

                const savedMB = originalSizeMB - (newSize / (1024 * 1024));
                stats.totalSavedMB += savedMB;
                stats.processed++;
                console.log(`  ✅ ${basename(filePath)} | ${originalSizeMB.toFixed(1)}MB → ${(newSize / 1024 / 1024).toFixed(1)}MB (saved ${savedMB.toFixed(1)}MB)`);
                return { original: filePath, optimized: outputPath, type: 'jpeg-compress' };
            } else {
                stats.skipped++;
                console.log(`  ⏭️  ${basename(filePath)} — already well compressed`);
                return null;
            }
        }
    } catch (err) {
        stats.errors++;
        console.error(`  ❌ ${basename(filePath)}: ${err.message}`);
        return null;
    }
}

/**
 * Update data.es.json to reference .webp instead of .png
 */
async function updateJsonPaths(conversions) {
    const pngToWebp = conversions.filter(c => c && c.type === 'png-to-webp');
    if (pngToWebp.length === 0) return;

    let json = await readFile(DATA_FILE, 'utf-8');
    let replacements = 0;

    for (const conv of pngToWebp) {
        // Extract the relative path from the full path
        const publicIdx = conv.original.indexOf('assets\\img\\');
        if (publicIdx === -1) continue;

        const relOriginal = conv.original.substring(publicIdx).replace(/\\/g, '/');
        const relOptimized = conv.optimized.substring(conv.optimized.indexOf('assets\\img\\')).replace(/\\/g, '/');

        if (json.includes(relOriginal)) {
            json = json.replaceAll(relOriginal, relOptimized);
            replacements++;
        }
    }

    if (replacements > 0) {
        await writeFile(DATA_FILE, json, 'utf-8');
        console.log(`\n📄 Updated ${replacements} paths in data.es.json`);
    }
}

// ── Main ──
console.log('🖼️  Jasmir Portfolio Image Optimizer\n');
console.log(`📁 Scanning: ${ROOT}`);
console.log(`📏 Threshold: >${MIN_SIZE / 1024}KB | Max width: ${MAX_WIDTH}px\n`);

const images = await findImages(ROOT);
console.log(`Found ${images.length} images total\n`);

const conversions = [];
for (const img of images) {
    const result = await optimizeImage(img);
    conversions.push(result);
}

// Update JSON paths
await updateJsonPaths(conversions);

console.log('\n─────────────────────────────────');
console.log(`✅ Processed: ${stats.processed}`);
console.log(`⏭️  Skipped: ${stats.skipped}`);
console.log(`❌ Errors: ${stats.errors}`);
console.log(`💾 Total saved: ${stats.totalSavedMB.toFixed(1)} MB`);
console.log('─────────────────────────────────');
