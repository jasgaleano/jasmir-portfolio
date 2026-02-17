---
name: Gestor de Datos del Proyecto
alias: manager
description: Asistente para la gestión de contenido del proyecto (Proyectos, Perfil, Recursos).
---

# Gestor de Datos del Proyecto

Esta habilidad te permite administrar el contenido del proyecto sin editar manualmente el código. Utiliza scripts automatizados para asegurar la integridad de los datos.

## Comandos Disponibles

### 1. `add_project`
Agrega un nuevo proyecto al portafolio.

**Parámetros:**
- `--titulo`: Título del proyecto
- `--cliente`: Nombre del cliente
- `--categoria`: Categoría (ej: "Branding", "Web", "App")
- `--tags`: Tags separados por comas
- `--desc_corta`: Descripción breve
- `--desc_larga`: Descripción completa
- `--imagePath`: Ruta a la imagen de portada
- `--galeria`: (Opcional) Rutas de imágenes de galería separadas por comas
- `--folder`: (Opcional) Nombre de carpeta en `assets/uploads/` donde están las imágenes ya optimizadas

**Modo Organizado (Recomendado):**
Cuando las imágenes ya fueron optimizadas y organizadas por `media-optimizer` (Optimedia):
```bash
node skills/project-manager/scripts/manager.js add-project \
  --titulo "MyPetMatch" \
  --cliente "MyPetMatch Inc." \
  --categoria "Branding & Plataforma Digital" \
  --tags "identidad,plataforma,mascotas" \
  --desc_corta "Identidad visual y plataforma digital" \
  --desc_larga "Proyecto completo de branding..." \
  --folder "mypetmatch" \
  --imagePath "cover.jpg" \
  --galeria "pagina1.jpg,pagina2.jpg"
```

**Modo Legacy (Rutas Absolutas):**
```bash
node skills/project-manager/scripts/manager.js add-project \
  --titulo "Proyecto" \
  --imagePath "C:/Desktop/cover.jpg" \
  --galeria "C:/Desktop/img1.jpg,C:/Desktop/img2.jpg"
```

### 2. `update_status`
Actualiza el estado del perfil/portafolio.

**Ejemplo:**
```bash
node skills/project-manager/scripts/manager.js update-status --text "Disponible para proyectos"
```

### 3. `audit`
Muestra información sobre el portafolio.

**Ejemplo:**
```bash
node skills/project-manager/scripts/manager.js audit
```

### 4. `delete_projects`
Elimina proyectos por ID.

**Parámetros:**
- `--ids`: IDs separados por comas (ej: "p4,p5,p6")

**Ejemplo:**
```bash
node skills/project-manager/scripts/manager.js delete-projects --ids "p4,p5"
```

**Nota:** Las imágenes en `assets/uploads/` NO se eliminan automáticamente.

## Estructura de Datos
El script `manager.js` lee y escribe en `js/data.js`.
Formato esperado en `js/data.js`:
```javascript
const PORTFOLIO_DATA = { ... };
```
El script debe respetar esta declaración al guardar.
