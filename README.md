# Tools Profertil

Las tres herramientas del **Sistema de marca Profertil 2026** en un solo sitio, con un selector abajo para pasar de una a otra:

| Herramienta | Carpeta | Qué hace |
|---|---|---|
| Color Browser | `color/` | Paleta con códigos HEX, RGB, CMYK y Pantone para copiar, combinaciones en torta y usos de color sobre texto. Descarga de muestras `.ase`. |
| Icon Browser | `iconos/` | Los 194 íconos de marca: búsqueda, recoloreo y exportación SVG, PNG y ZIP. |
| Pattern Generator | `patrones/` | Patrones con las 18 formas del sistema, con exportación SVG, PNG y JPG. |

Publicado en https://bongstudio-dev.github.io/profertil-tools/

HTML + CSS + JS vanilla, sin build step.

## Uso

```bash
python3 -m http.server 5056     # o: npm run dev
# abrí http://localhost:5056
```

> No usar el puerto 5060: Chrome lo bloquea (ERR_UNSAFE_PORT).

## Cómo está armado

Cada herramienta es una página propia, con su `index.html`, `styles.css` y `script.js`. Lo que las hace sentir una sola está en **`shared/shell.css`**, que se carga después del CSS de cada una:

- **Selector de herramienta** (`.tools-dock`): el mismo bloque de HTML en las tres páginas, fijo abajo y centrado en el área de trabajo. En celular pasa a ser una barra de pestañas.
- **Barra lateral**: misma posición, ancho y alto en las tres (340 px, de arriba a abajo).
- **Crédito** y espacio libre abajo para que el contenido no quede tapado por el selector.
- **Transición entre páginas**: `@view-transition { navigation: auto; }`. El navegador funde una herramienta con la otra y deja quietos la barra lateral, el selector y el crédito; la pastilla activa se desliza. Donde el navegador no lo soporta, cambia de página sin animación.

La portada (`index.html`) redirige a `color/` y conserva el ancla, así que `…/profertil-tools/#combinaciones` abre esa vista.

## Para sumar una cuarta herramienta

1. Carpeta nueva con su `index.html`, que cargue `../shared/shell.css` al final y tenga `<body data-tool="nombre">`.
2. Copiar el bloque `<nav class="tools-dock">` y agregar el link nuevo en las cuatro páginas.
3. Si la estructura no es `.app > .sidebar + .main`, sumar sus reglas en `shared/shell.css`.

## De dónde sale cada una

- `color/`: los datos están al principio de `color/script.js` y salen del Manual de Marca v1.1.4 (p. 45 a 48).
- `iconos/`: copia del repo `profertil-icon-browser` al 13/10/2026. `icons-data.js` se regenera con `build-data.py`.
- `patrones/`: copia del repo `profertil-pattern-generator` al 13/10/2026 (commit `43fb8e7`). Su CSS no se tocó: los ajustes de layout para convivir con el selector están en `shared/shell.css`, bajo `body[data-tool="patrones"]`.

---

Sistema de marca por **[Bong](https://bongstudio.ar)**.
