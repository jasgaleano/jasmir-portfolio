---
name: Optimizador de Imágenes
alias: optimedia
description: Optimiza y organiza imágenes del proyecto automáticamente para mejorar el rendimiento.
---

# Optimizador de Imágenes

Esta habilidad se encarga de optimizar imágenes para web y organizarlas en carpetas por proyecto.

## Comandos Disponibles

### 1. Optimizar por Proyecto (`optimize_project`)
Optimiza imágenes de una carpeta específica y las organiza en `assets/uploads/[proyecto]/`

**Instrucciones para el Agente:**
1. Ejecuta el script con parámetros:
   ```bash
   node skills/media-optimizer/scripts/optimize.js \
     --input "C:/ruta/a/carpeta/imagenes" \
     --project "nombre-proyecto"
   ```

**Ejemplo:**
```bash
node skills/media-optimizer/scripts/optimize.js \
  --input "C:/Desktop/MyPetMatch" \
  --project "mypetmatch"
```

**Resultado:**
- Crea carpeta `assets/uploads/mypetmatch/`
- Optimiza todas las imágenes (JPG, PNG)
- Redimensiona si son >1920px
- Convierte a JPG optimizado (85% calidad)
- Muestra % de reducción de tamaño

### 2. Optimizar Todo (`optimize_all`)
Escanea la carpeta de imágenes configurada y optimiza todo (modo legacy).

**Instrucciones para el Agente:**
1. Ejecuta el script sin parámetros:
   ```bash
   node skills/media-optimizer/scripts/optimize.js
   ```

## Configuración
El script detecta automáticamente la carpeta de imágenes (`assets/uploads`, `assets`, `public/images`, etc).
Si necesitas forzar una carpeta, edita `skills/media-optimizer/skill-config.json` (se crea tras la primera ejecución).
