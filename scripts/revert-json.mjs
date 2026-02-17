/**
 * Revert JSON paths from .webp back to original extensions
 */

import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const DATA_FILE = join(import.meta.dirname, '..', 'public', 'data.es.json');

let json = await readFile(DATA_FILE, 'utf-8');
const original = json;

// Replace .webp back to .png (case insensitive)
json = json.replace(/\.webp/gi, '.png');

const changes = (original.match(/\.webp/gi) || []).length;

if (changes > 0) {
    await writeFile(DATA_FILE, json, 'utf-8');
    console.log(`✅ Reverted ${changes} .webp paths back to .png in data.es.json`);
} else {
    console.log('No .webp paths found in data.es.json');
}
