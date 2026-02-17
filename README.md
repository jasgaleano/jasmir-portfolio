# Guía de Edición - Portafolio Jasmir Galeano

Este sitio web ha sido refactorizado para ser robusto, rápido y fácil de editar.

## 📂 Estructura de Carpetas

- `index.html`: El esqueleto del sitio y los textos. **Aquí harás el 90% de tus cambios.**
- `css/styles.css`: Los colores, fuentes y diseño visual.
- `js/main.js`: La lógica (menú móvil, validación de formulario).
- `images/`: (Carpeta creada) Aquí debes guardar tus fotos (logo, perfil, trabajos).

---

## ✏️ Cómo Cambiar Contenidos

### 1. Cambiar tu Foto de Perfil

**Opción A (Foto Sidebar Desktop):**
1. Guarda tu foto como `perfil.jpg` dentro de la carpeta `images/`.
2. Abre `index.html`.
3. Busca la línea comentada: `<!-- CAMBIAR FOTO DESKTOP AQUÍ -->` (aprox. línea 66).
4. Reemplaza el bloque `<svg>...</svg>` por:
   ```html
   <img src="images/perfil.jpg" alt="Jasmir Galeano" style="width:100%; height:100%; object-fit:cover;">
   ```

**Opción B (Foto Sidebar Móvil):**
1. Busca `<!-- CAMBIAR FOTO MÓVIL AQUÍ -->` (aprox. línea 23) y haz lo mismo.

**Opción C (Foto Hero - Marco Inclinado):**
1. Busca `<!-- CAMBIAR FOTO PRINCIPAL AQUÍ -->` (aprox. línea 165).
2. Reemplaza el `<div>` con clase `placeholder` por tu imagen.

### 2. Cambiar Textos y Servicios
Simplemente edita el texto que está en color blanco dentro de `index.html`.

Ejemplo para cambiar el título principal:
- Busca: `<h1 class="hero-title">`
- Cambia: `Estrategia + diseño` por lo que tú quieras.

### 3. Agregar Proyectos al Portafolio
Ve a la sección `<!-- PROYECTOS Section -->`.
Copia todo el bloque `<article class="card-w">...</article>` y pégalo debajo para añadir uno nuevo.

### 4. Cambiar Colores (Branding)
Si quieres cambiar el color azul de los botones o el fondo oscuro:
1. Abre `css/styles.css`.
2. Al principio del archivo verás `:root`.
3. Cambia los códigos de color hexadecimales (ej: `#2D7CFF`).

---

## 🚀 Cómo Publicar
Este sitio es estático (HTML/CSS/JS), lo que significa que puedes alojarlo **gratis** y con alto rendimiento en:
- **Netlify** (Recomendado: arrastras la carpeta y listo).
- **Vercel**
- **GitHub Pages**

---

**Nota:** El formulario actual es una demostración. Para recibir los correos, te recomiendo usar un servicio gratuito como **Formspree.io**. Solo tendrías que cambiar la etiqueta `<form>` en el HTML así:
`<form action="https://formspree.io/f/tu-codigo" method="POST">`
