# Guía de Configuración de Dominio (jasmirgaleano.com)

Ya tenemos el código actualizado con tu nuevo dominio. Ahora solo faltan dos pasos para que funcione.

## 1. Configuración en Vercel

1.  Ve a tu dashboard de Vercel y entra en el proyecto **jasmir-portfolio-health** (o como lo tengas nombrado).
2.  Ve a la pestaña **Settings** -> **Domains**.
3.  En el campo de "Add a Domain", escribe: `jasmirgaleano.com`
4.  Dale a **Add**.
5.  Vercel te mostrará una alerta indicando que la configuración DNS no válida (Invalid Configuration).
6.  **Toma nota de los valores que te pide.** Normalmente te pedirá configurar un registros **A** o un registro **CNAME**.
    *   Si te pide un **A Record**, anota la IP (ej: `76.76.21.21`).
    *   Si te pide un **CNAME**, anota el valor (ej: `cname.vercel-dns.com`).

## 2. Configuración en Namecheap

1.  Ve a tu cuenta de Namecheap y busca `jasmirgaleano.com` en tu **Domain List**.
2.  Dale clic al botón **Manage** a la derecha del dominio.
3.  Ve a la pestaña **Advanced DNS**.
4.  Borra cualquier registro existente (a veces vienen unos por defecto).
5.  Añade los registros que te pidió Vercel:

    **Si Vercel te pidió un registro A:**
    *   Type: **A Record**
    *   Host: **@**
    *   Value: `76.76.21.21` (o la IP que te dio Vercel)
    *   TTL: Automatic

    **Si Vercel te pidió un registro CNAME para `www`:**
    *   Type: **CNAME Record**
    *   Host: **www**
    *   Value: `cname.vercel-dns.com` (o lo que te dio Vercel)
    *   TTL: Automatic

6.  Dale al "check" verde para guardar cambios.

## 3. Esperar propagación

*   La propagación DNS puede tardar desde unos minutos hasta 24 horas, pero normalmente en Namecheap es rápido (< 30 min).
*   Vercel detectará el cambio automáticamente y te dará certificado SSL (https) gratis.

¡Si tienes dudas con lo que te pide Vercel, mándame captura o copia el texto aquí!
