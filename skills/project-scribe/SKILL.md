---
name: Documentador de Proyecto
alias: docup
description: Mantiene la documentación del proyecto (README, CHANGELOG) actualizada automáticamente.
---

# Documentador de Proyecto

Esta skill se encarga de actualizar el `README.md` y `CHANGELOG.md` basándose en la actividad reciente del proyecto.

## Comandos

### 1. Actualizar Documentación (`update_docs`)
Analiza los cambios recientes y actualiza los archivos de documentación.

**Uso:**
> "Actualiza el README con lo que hicimos hoy."
> "Registra los últimos cambios en la bitácora."

**Ejecución:**
```bash
node skills/project-scribe/scripts/scribe.js
```

## Funcionamiento
El script:
1.  **Analiza `git log`** para obtener los commits recientes (si es un repo git).
2.  **(Opcional) Lee `task.md`** si existe, para ver tareas marcadas como completadas.
3.  **Genera un resumen** estructurado.
4.  **Inyecta** el resumen en `CHANGELOG.md` (creándolo si no existe).
5.  **Actualiza** la sección "Últimas Actualizaciones" del `README.md`.
