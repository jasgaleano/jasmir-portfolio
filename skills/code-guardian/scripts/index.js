const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Colores
const colors = {
    reset: "\x1b[0m",
    bright: "\x1b[1m",
    red: "\x1b[31m",
    green: "\x1b[32m",
    yellow: "\x1b[33m",
    blue: "\x1b[34m",
    cyan: "\x1b[36m"
};

const args = process.argv.slice(2);
const command = args[0];

console.log(`\n${colors.bright}${colors.blue}🛡️  CODE GUARDIAN${colors.reset}\n`);

if (!command) {
    console.log("Comandos disponibles:");
    console.log(`  ${colors.cyan}check${colors.reset}   Audita el código (Errores, Estilo, Seguridad)`);
    console.log(`  ${colors.cyan}fix${colors.reset}     Intenta arreglar problemas automáticamente`);
    console.log(`  ${colors.cyan}init${colors.reset}    Instala el 'Portero' (Git Hooks)`);
    process.exit(0);
}

const scriptsDir = __dirname;

try {
    switch (command) {
        case 'check':
            require('./check.js');
            break;
        case 'fix':
            require('./fix.js');
            break;
        case 'init':
            require('./init.js');
            break;
        default:
            console.log(`${colors.red}Comando no reconocido: ${command}${colors.reset}`);
    }
} catch (err) {
    console.error(`${colors.red}Error fatal del Guardián:${colors.reset}`, err.message);
}
