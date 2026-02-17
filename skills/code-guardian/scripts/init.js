const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const colors = {
    reset: "\x1b[0m",
    bright: "\x1b[1m",
    green: "\x1b[32m",
    blue: "\x1b[34m",
    yellow: "\x1b[33m",
    red: "\x1b[31m",
    cyan: "\x1b[36m"
};

console.log(`${colors.cyan}🛡️  Instalando al Portero (Git Hooks)...${colors.reset}\n`);

try {
    // 0. Verificar que es un repo git
    try {
        execSync('git rev-parse --is-inside-work-tree', { stdio: 'ignore' });
    } catch (e) {
        console.log(`${colors.red}❌ No estás en un repositorio Git.${colors.reset} Ejecuta 'git init' primero.`);
        process.exit(1);
    }

    if (!fs.existsSync('package.json')) {
        console.log(`${colors.red}❌ No encuentro package.json.${colors.reset}`);
        process.exit(1);
    }

    // 1. Instalar dependencias
    console.log(`${colors.blue}📦 Instalando husky y lint-staged...${colors.reset}`);
    execSync('npm install --save-dev husky lint-staged', { stdio: 'inherit' });

    // 2. Inicializar Husky
    console.log(`${colors.blue}🐶 Inicializando Husky...${colors.reset}`);
    execSync('npx husky init', { stdio: 'inherit' }); // Crea .husky/ y script pre-commit

    // 3. Configurar lint-staged en package.json
    console.log(`${colors.blue}📝 Configurando lint-staged...${colors.reset}`);
    const pkgPath = path.resolve('package.json');
    const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));

    // Configuración segura para JS/TS/JSON/MD
    pkg['lint-staged'] = {
        "*.{js,jsx,ts,tsx}": [
            "eslint --fix",
            "prettier --write"
        ],
        "*.{json,md}": [
            "prettier --write"
        ]
    };

    fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2));

    // 4. Configurar el hook pre-commit
    // Nota: 'npx husky init' crea un pre-commit con 'npm test' por defecto en v9+. Lo sobreescribimos.
    const hookPath = path.resolve('.husky', 'pre-commit');
    fs.writeFileSync(hookPath, 'npx lint-staged\n');

    console.log(`\n${colors.bright}${colors.green}✅ ¡El Portero está activo!${colors.reset}`);
    console.log(`Ahora, antes de cada commit, el Guardián limpiará tu código automáticamente.`);

} catch (error) {
    console.error(`${colors.red}❌ Error al instalar el portero:${colors.reset}`, error.message);
}
