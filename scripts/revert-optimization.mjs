/**
 * Revert Image Optimization
 * Restores original files from _originals/ folders and deletes .webp versions
 */

import { readdir, stat, copyFile, unlink, rmdir } from 'node:fs/promises';
import { join, dirname, basename, extname } from 'node:path';

const ROOT = join(import.meta.dirname, '..', 'public', 'assets', 'img', 'proyectos');

async function findOriginalsFolders(dir) {
    const folders = [];
    const entries = await readdir(dir, { withFileTypes: true });

    for (const entry of entries) {
        const fullPath = join(dir, entry.name);
        if (entry.isDirectory()) {
            if (entry.name === '_originals') {
                folders.push(fullPath);
            } else {
                folders.push(...await findOriginalsFolders(fullPath));
            }
        }
    }
    return folders;
}

console.log('🔄 Reverting image optimization...\n');

const originalsFolders = await findOriginalsFolders(ROOT);
console.log(`Found ${originalsFolders.length} _originals folders\n`);

let restored = 0;
let deleted = 0;

for (const originalsFolder of originalsFolders) {
    const parentDir = dirname(originalsFolder);
    const files = await readdir(originalsFolder);

    for (const file of files) {
        const originalPath = join(originalsFolder, file);
        const targetPath = join(parentDir, file);

        // Restore original
        await copyFile(originalPath, targetPath);
        console.log(`  ✅ Restored: ${file}`);
        restored++;

        // Delete corresponding .webp if it exists
        const ext = extname(file).toLowerCase();
        if (ext === '.png') {
            const webpPath = targetPath.replace(/\.png$/i, '.webp');
            try {
                await unlink(webpPath);
                console.log(`  🗑️  Deleted: ${basename(webpPath)}`);
                deleted++;
            } catch (err) {
                // webp doesn't exist, that's fine
            }
        }
    }

    // Delete _originals folder
    await readdir(originalsFolder).then(async files => {
        for (const f of files) await unlink(join(originalsFolder, f));
    });
    await rmdir(originalsFolder);
    console.log(`  📁 Removed: ${originalsFolder}\n`);
}

console.log('─────────────────────────────────');
console.log(`✅ Restored: ${restored} files`);
console.log(`🗑️  Deleted: ${deleted} .webp files`);
console.log('─────────────────────────────────');
