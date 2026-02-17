---
name: code-guardian
description: El Guardián del Código. Auditor de calidad, seguridad y estilo.
version: 1.0.0
author: @atlz
alias: guardian
---

# 🛡️ Code Guardian (El Guardián)

Tu Ingeniero de Calidad (QA) personal. Se asegura de que no subas código roto, inseguro o desordenado.

## 🎯 Objetivo
Proteger tu base de código de errores humanos comunes antes de que lleguen a producción (o al repositorio).

## 🚀 Comandos

### `guardian check`
Realiza una inspección completa del proyecto actual.
- **Busca:** Errores de sintaxis, problemas de estilo (linting), vulnerabilidades de seguridad en dependencias.
- **Salida:** Reporte detallado en consola.

### `guardian fix`
Intenta reparar automáticamente los problemas encontrados.
- **Acciones:** Formatea código (Prettier), corrige reglas de linter auto-fixable.

### `guardian init`
Instala el "Portero" (Husky + Lint-Staged) en el proyecto actual.
- **Efecto:** A partir de ahora, cada vez que hagas `git commit`, el Guardián revisará tus cambios. Si hay errores graves, bloqueará el commit hasta que los arregles.

## 🛠️ Herramientas que usa
- **ESLint:** Para calidad de código.
- **Prettier:** Para formato y estilo.
- **NPM Audit:** Para seguridad.
