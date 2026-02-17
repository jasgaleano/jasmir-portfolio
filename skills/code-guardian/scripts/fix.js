const { execSync } = require('child_process');
const fs = require('fs');

const colors = {
    reset: "\x1b[0m",
    bright: "\x1b[1m",
    green: "\x1b[32m",
    blue: "\x1b[34m",
    yellow: "\x1b[33m",
    cyan: "\x1b[36m"
};

console.log(`${colors.cyan}🛠️  El Guardián está reparando tu código...${colors.reset}\n`);

try {
    if (fs.existsSync('package.json')) {
        const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));

        // 1. Prettier (Formato)
        const hasPrettier = pkg.dependencies?.prettier || pkg.devDependencies?.prettier;
        if (hasPrettier) {
            console.log(`${colors.blue}✨ Aplicando formato (Prettier)...${colors.reset}`);
            try {
                execSync('npx prettier --write .', { stdio: 'inherit' });
                console.log(`${colors.green}✅ Formato arreglado.${colors.reset}\n`);
            } catch (e) {
                console.log(`${colors.yellow}⚠️  No se pudo formatear todo.${colors.reset}\n`);
            }
        }

        // 2. ESLint (Fixes automáticos)
        const hasEslint = pkg.dependencies?.eslint || pkg.devDependencies?.eslint;
        if (hasEslint) {
            console.log(`${colors.blue}🐛 Corrigiendo errores (ESLint fix)...${colors.reset}`);
            try {
                execSync('npx eslint . --fix', { stdio: 'inherit' });
                console.log(`${colors.green}✅ Errores corregidos.${colors.reset}\n`);
            } catch (e) {
                console.log(`${colors.yellow}⚠️  Quedaron errores que requieren intervención manual.${colors.reset}\n`);
            }
        }

        if (!hasPrettier && !hasEslint) {
            console.log(`${colors.yellow}⚠️  No encontré Prettier ni ESLint en este proyecto. No puedo arreglar nada automáticamente.${colors.reset}`);
        } else {
            console.log(`${colors.bright}${colors.green}🎉 ¡Reparación completada!${colors.reset}`);
        }

    } else {
        console.log(`${colors.yellow}⚠️  No veo un archivo package.json. Asegúrate de estar en la raíz del proyecto.${colors.reset}`);
    }
} catch (error) {
    console.error(`${colors.yellow}❌ Ocurrió un error inesperado al intentar arreglar:${colors.reset}`, error.message);
}
