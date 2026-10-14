# Kit de marca Profertil

Los recursos del **Sistema de marca Profertil 2026** en un solo sitio, con un selector abajo para pasar de un módulo a otro:

| Módulo | Carpeta | Qué hace |
|---|---|---|
| Logo Browser | `logos/` | Los logos oficiales (6 versiones) y los del 25 aniversario (8), con sus reglas de uso. Descarga SVG, PDF y PNG de 2048 px, sueltos o en ZIP. |
| Color Browser | `color/` | Paleta con códigos HEX, RGB, CMYK y Pantone para copiar, combinaciones en torta y usos de color sobre texto. Descarga de muestras `.ase`. |
| Type Browser | `tipografia/` | Familjen Grotesk y DM Sans: muestrario con texto de prueba, jerarquía (H1 a Caption), lineamientos y las fuentes en ZIP con su licencia OFL. |
| Icon Browser | `iconos/` | Los 194 íconos de marca: búsqueda, recoloreo y exportación SVG, PNG y ZIP. Descarga del `.ai` con los 194. |
| Shape Browser | `formas/` | Las 18 formas del sistema, sin fondo (7 colores) o con fondo (badge), con exportación SVG, PNG y ZIP. Descarga del `.ai` con todas (una mesa de trabajo por color y los badges). |
| Pattern Generator | `patrones/` | Patrones con las 18 formas del sistema, con exportación SVG, PNG y JPG. |

Publicado en **https://entregables.bongstudio.ar/profertil/kit-de-marca/**. Es público a propósito (sin Cloudflare Access): entra quien tenga el link, y no lo indexan los buscadores (`X-Robots-Tag: noindex` en todo el sitio de entregables).

### Publicar

Este repo es la fuente. Se publica desde `~/Documents/Desarrollo/bong-entregables`:

```bash
~/Documents/Desarrollo/bong-entregables/publicar.sh
```

El script copia este repo (sin `.git`, scripts ni documentación) a `public/profertil/kit-de-marca/` y sube todo a Cloudflare Pages. Hacer commit y push acá también, para que quede el historial.

### Direcciones viejas

Hasta el 14/10/2026 vivió en `bongstudio-dev.github.io/profertil-tools/`. GitHub Pages ahora publica la rama `gh-pages`, que tiene solo páginas que redirigen cada ruta vieja a la nueva (conservando `#ancla`). `main` no se publica en GitHub. Las tres herramientas anteriores (`profertil-color-browser`, `profertil-icon-browser`, `profertil-pattern-generator`) redirigen directo a la dirección nueva.

HTML + CSS + JS vanilla, sin build step.

## Uso

```bash
python3 -m http.server 5056     # o: npm run dev
# abrí http://localhost:5056
```

> No usar el puerto 5060: Chrome lo bloquea (ERR_UNSAFE_PORT).

## Cómo está armado

Cada módulo es una página propia, con su `index.html`, `styles.css` y `script.js`. Lo que las hace sentir una sola está en **`shared/shell.css`**, que se carga después del CSS de cada una:

- **Selector de herramienta** (`.tools-dock`): el mismo bloque de HTML en todas las páginas, fijo abajo y centrado en el área de trabajo. En celular pasa a ser una barra de pestañas.
- **Barra lateral**: misma posición, ancho y alto en todas (340 px, de arriba a abajo).
- **Crédito** y espacio libre abajo para que el contenido no quede tapado por el selector.
- **Transición entre páginas**: `@view-transition { navigation: auto; }`. El navegador funde una herramienta con la otra y deja quietos la barra lateral, el selector y el crédito; la pastilla activa se desliza. Donde el navegador no lo soporta, cambia de página sin animación.

La portada (`index.html`) redirige a `color/` y conserva el ancla, así que `…/kit-de-marca/#combinaciones` abre esa vista.

Qué es este producto y cómo se replica para otra marca: ver **[KIT-DE-MARCA.md](KIT-DE-MARCA.md)**.

## Firma del estudio

Cada página lleva al principio del HTML un comentario con el logo de Bong en ASCII, una nota y los créditos, y lo mismo sale en la consola del navegador (`shared/firma.js`). El texto está en `shared/firma.txt`; después de editarlo, `python3 shared/firmar.py` lo vuelve a poner en todas las páginas.

## Para sumar otro módulo

1. Carpeta nueva con su `index.html`, que cargue `../shared/shell.css` al final y tenga `<body data-tool="nombre">`.
2. Copiar el bloque `<nav class="tools-dock">` y agregar el link nuevo en todas las páginas.
3. Correr `python3 shared/firmar.py` para firmar la página nueva.
4. Si la estructura no es `.app > .sidebar + .main`, sumar sus reglas en `shared/shell.css`.

## De dónde sale cada una

- `logos/archivos/`: SVG y PDF de los entregables oficiales (`Entregables/01. Logos/01. Profertil` y `25 aniversario/Entregables/01. Logo 25/01. Logos`). El PNG se arma en el navegador desde el SVG. Notas y tamaños mínimos: manual v1.1.4, sección 02.
- `tipografia/archivos/`: las dos familias tal como están en `Entregables/02. Tipografías`, comprimidas. Jerarquía y lineamientos: manual, sección 04.
- `iconos/descargas/Profertil_Iconos_Sistema_2026.ai`: el .ai entregado a Profertil el 30/06/2026.
- `formas/descargas/Profertil_Formas_Sistema_2026.ai`: se genera con `python3 formas/build-ai.py` (necesita Illustrator).

- `color/`: los datos están al principio de `color/script.js` y salen del Manual de Marca v1.1.4 (p. 45 a 48).
- `iconos/`: copia del repo `profertil-icon-browser` al 13/10/2026. `icons-data.js` se regenera con `build-data.py`.
- `formas/`: `shapes-data.js` se genera con `python3 formas/build-data.py` a partir de los entregables oficiales: las formas sin fondo de `patrones/public/shapes/` y los 18 badges de `formas/fuente/con-fondo/`. Los SVG que exporta tienen la misma geometría y los mismos nombres que los entregables (`Profertil_Forma_Barras_Celeste.svg`, `Profertil_Forma_Barras_Fondo_Naranja.svg`). Con fondo solo ofrece las combinaciones de color que ya usan los 18 badges. El Terra sale en `#8A4818` (manual); los SVG de origen traen `#8A4718`.
- `patrones/`: copia del repo `profertil-pattern-generator` al 13/10/2026 (commit `43fb8e7`). Su CSS no se tocó: los ajustes de layout para convivir con el selector están en `shared/shell.css`, bajo `body[data-tool="patrones"]`.

---

Sistema de marca por **[Bong](https://bongstudio.ar)**.
