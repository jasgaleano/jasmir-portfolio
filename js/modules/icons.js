// ---------------------------
// Icons: Centralized Tool Logo System
// Uses SVG files from /assets/img/logos/herramientas/
// ---------------------------

const LOGOS_BASE = '/assets/img/logos/herramientas/';

/**
 * Map from tool name (as it appears in tools.txt) to the SVG filename.
 * Keys are normalized to lowercase for matching.
 */
const TOOL_FILE_MAP = {
    'illustrator': 'illustrator.svg',
    'photoshop': 'photoshop.svg',
    'lightroom': 'lightroom.svg',
    'indesign': 'indesign.svg',
    'after effects': 'after-effects.svg',
    'premier': 'premier.svg',
    'figma': 'figma.svg',
    'capcut': 'capcut.svg',
    'cap cut': 'capcut.svg',
    'wordpress': 'wordpress.svg',
    'elementor': 'elementor.svg',
    'meta': 'meta.svg',
    'ads manager': 'ads-manager.svg',
    'canon eos utility': 'canon-eos-utility.svg',
    'chat gpt': 'chat-gpt.svg',
    'chatgpt': 'chat-gpt.svg',
    'gemini': 'gemini.svg',
    'claude': 'claude.svg',
    'claude code': 'claude-code.svg',
    'antigravity': 'antigravity.svg',
    'airtable': 'airtable.svg',
    'n8n': 'n8n.svg',
    'make': 'make.svg',
    'notion': 'notion.svg',
    'trello': 'trello.svg',
    'supabase': 'supabase.svg',
    'vite': 'vite.svg',
    'javascript': 'javascript.svg',
    'html 5': 'html-5.svg',
    'html5': 'html-5.svg',
    'css 3': 'css-3.svg',
    'css3': 'css-3.svg',
    'adobe creative cloud': 'adobe-creative-cloud.svg',
};

/**
 * Map equipment keywords to their SVG filenames.
 */
const EQUIPMENT_FILE_MAP = {
    'canon': 'camara.svg',
    'lente': 'lente-de-camara.svg',
    'micrófono': 'microfonos.svg',
    'microfono': 'microfonos.svg',
    'micrófono': 'microfonos.svg',
};

/**
 * Get the <img> tag for a tool logo from the centralized folder.
 * @param {string} toolName - Tool name as it appears in tools.txt
 * @returns {string} HTML string (<img> or fallback icon)
 */
export function getToolIcon(toolName) {
    const key = toolName.trim().toLowerCase();
    const file = TOOL_FILE_MAP[key];

    if (file) {
        return `<img src="${LOGOS_BASE}${file}" alt="${toolName}" width="20" height="20" loading="lazy" class="tool-logo">`;
    }

    // Return a generic fallback circle
    return `<svg viewBox="0 0 24 24" width="20" height="20"><rect width="24" height="24" rx="4" fill="#666"/><circle cx="12" cy="12" r="4" fill="#fff" opacity="0.6"/></svg>`;
}

/**
 * Get the <img> tag for an equipment item.
 * @param {string} equipName - Equipment name (e.g., "Canon Sl2")
 * @returns {string} HTML string
 */
export function getEquipmentIcon(equipName) {
    const lower = equipName.trim().toLowerCase();

    for (const [keyword, file] of Object.entries(EQUIPMENT_FILE_MAP)) {
        if (lower.includes(keyword)) {
            return `<img src="${LOGOS_BASE}${file}" alt="${equipName}" width="20" height="20" loading="lazy" class="tool-logo">`;
        }
    }

    // Fallback: wrench icon
    return `<svg viewBox="0 0 24 24" width="20" height="20"><rect width="24" height="24" rx="4" fill="#444"/><text x="5" y="17" font-size="12" fill="#fff">🔧</text></svg>`;
}

/**
 * Parse a tools.txt content string into { tools: string[], equipment: string[] }
 * @param {string} text - Raw content of tools.txt
 * @returns {{ tools: string[], equipment: string[] }}
 */
export function parseToolsFile(text) {
    const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
    const tools = [];
    const equipment = [];

    let section = 'tools';

    for (const line of lines) {
        if (line.toLowerCase() === 'equipo') {
            section = 'equipment';
            continue;
        }
        if (section === 'tools') {
            tools.push(line);
        } else {
            equipment.push(line);
        }
    }

    return { tools, equipment };
}
