/**
 * Update data.es.json: Convert all image extensions to .webp
 */

import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const DATA_FILE = join(import.meta.dirname, '..', 'public', 'data.es.json');

let json = await readFile(DATA_FILE, 'utf-8');
const original = json;

// Replace all image extensions with .webp
json = json.replace(/\.(jpg|jpeg|JPG|JPEG|png|PNG)/g, '.webp');

const changes = (original.match(/\.(jpg|jpeg|JPG|JPEG|png|PNG)/g) || []).length;

if (changes > 0) {
    await writeFile(DATA_FILE, json, 'utf-8');
    console.log(`✅ Updated ${changes} image extensions to .webp in data.es.json`);
} else {
    console.log('ℹ️  All image paths already use .webp');
}
