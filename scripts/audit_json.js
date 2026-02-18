
const fs = require('fs');
const path = require('path');

const esPath = path.join(__dirname, '../public/data.es.json');
const enPath = path.join(__dirname, '../public/data.en.json');

const esData = JSON.parse(fs.readFileSync(esPath, 'utf8'));
const enData = JSON.parse(fs.readFileSync(enPath, 'utf8'));

const findings = [];

function compareKeys(obj1, obj2, path = '') {
    const keys1 = Object.keys(obj1);
    const keys2 = Object.keys(obj2);

    for (const key of keys1) {
        const newPath = path ? `${path}.${key}` : key;
        if (!obj2.hasOwnProperty(key)) {
            findings.push(`Missing key in EN: ${newPath}`);
            continue;
        }

        if (typeof obj1[key] === 'object' && obj1[key] !== null && !Array.isArray(obj1[key])) {
            compareKeys(obj1[key], obj2[key], newPath);
        } else if (Array.isArray(obj1[key])) {
            if (!Array.isArray(obj2[key])) {
                findings.push(`Type mismatch at ${newPath}: ES is Array, EN is ${typeof obj2[key]}`);
            } else if (obj1[key].length !== obj2[key].length) {
                // Arrays of objects might differ in length, just warning
                findings.push(`Array length mismatch at ${newPath}: ES=${obj1[key].length}, EN=${obj2[key].length}`);
            }
        }
    }

    for (const key of keys2) {
        const newPath = path ? `${path}.${key}` : key;
        if (!obj1.hasOwnProperty(key)) {
            findings.push(`Missing key in ES: ${newPath}`);
        }
    }
}

function scanForPlaceholders(obj, lang, path = '') {
    const badWords = ['lorem', 'ipsum', 'todo', 'pendiente', 'tbd'];

    for (const key in obj) {
        const newPath = path ? `${path}.${key}` : key;
        const val = obj[key];

        if (typeof val === 'string') {
            const lowerVal = val.toLowerCase();
            for (const word of badWords) {
                if (lowerVal.includes(word)) {
                    findings.push(`[${lang.toUpperCase()}] Placeholder '${word}' found at: ${newPath}`);
                }
            }
            if (val.trim() === '') {
                findings.push(`[${lang.toUpperCase()}] Empty string at: ${newPath}`);
            }
        } else if (typeof val === 'object' && val !== null) {
            scanForPlaceholders(val, lang, newPath);
        }
    }
}

console.log("--- Starting JSON Audit ---");
compareKeys(esData, enData);
scanForPlaceholders(esData, 'es');
scanForPlaceholders(enData, 'en');

if (findings.length === 0) {
    console.log("✅ No issues found in JSON data.");
} else {
    console.log("⚠️ Issues found:");
    findings.forEach(f => console.log(`- ${f}`));
}
console.log("--- End JSON Audit ---");
