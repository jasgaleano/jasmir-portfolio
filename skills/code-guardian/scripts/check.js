const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const colors = {
    reset: "\x1b[0m",
    bright: "\x1b[1m",
    red: "\x1b[31m",
    green: "\x1b[32m",
    yellow: "\x1b[33m",
    cyan: "\x1b[36m"
};

console.log(`${colors.cyan}🔍 Iniciando Auditoría del Guardián...${colors.reset}\n`);

let issuesFound = 0;

// 1. Auditoría de Seguridad (NPM Audit)
try {
    console.log(`${colors.bright}1. Verificando Seguridad (npm audit)...${colors.reset}`);
    execSync('npm audit --audit-level=high', { stdio: 'inherit' });
    console.log(`${colors.green}✅ Seguridad OK${colors.reset}\n`);
} catch (error) {
    console.log(`${colors.red}❌ Se encontraron vulnerabilidades altas.${colors.reset}\n`);
    issuesFound++;
}

// 2. Auditoría de Estilo (Prettier)
try {
    if (fs.existsSync('package.json')) {
        const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
        const hasPrettier = pkg.dependencies?.prettier || pkg.devDependencies?.prettier;

        if (hasPrettier) {
            console.log(`${colors.bright}2. Verificando Estilo (Prettier)...${colors.reset}`);
            execSync('npx prettier --check .', { stdio: 'inherit' });
            console.log(`${colors.green}✅ Estilo OK${colors.reset}\n`);
        } else {
            console.log(`${colors.yellow}⚠️  Prettier no detectado. Saltando chequeo de estilo.${colors.reset}\n`);
        }
    }
} catch (error) {
    console.log(`${colors.red}❌ Problemas de estilo detectados.${colors.reset}\n`);
    issuesFound++;
}

// 3. Auditoría de Linter (ESLint)
try {
    if (fs.existsSync('package.json')) {
        const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
        const hasEslint = pkg.dependencies?.eslint || pkg.devDependencies?.eslint;

        if (hasEslint) {
            console.log(`${colors.bright}3. Verificando Calidad (ESLint)...${colors.reset}`);
            execSync('npx eslint .', { stdio: 'inherit' });
            console.log(`${colors.green}✅ Calidad OK${colors.reset}\n`);
        } else {
            console.log(`${colors.yellow}⚠️  ESLint no detectado. Saltando chequeo de calidad.${colors.reset}\n`);
        }
    }
} catch (error) {
    console.log(`${colors.red}❌ Errores de Linter detectados.${colors.reset}\n`);
    issuesFound++;
}

console.log("---------------------------------------------------");
if (issuesFound === 0) {
    console.log(`${colors.green}${colors.bright}🎉 ¡Código Limpio! El Guardián aprueba este proyecto.${colors.reset}`);
} else {
    console.log(`${colors.red}${colors.bright}🚨 Se encontraron problemas.${colors.reset} Intenta correr: ${colors.cyan}guardian fix${colors.reset}`);
    process.exit(1);
}
