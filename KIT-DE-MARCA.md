# Kit de marca Bong

Un sitio que reúne los recursos de una marca diseñada por Bong para que cualquier persona del cliente los use sin abrir un programa de diseño ni depender de servicios de terceros. El primero es el de Profertil (este repo), que nació el 13/10/2026 cuando Adobe dejó de dar soporte a Adobe Color y el link de la paleta dejó de funcionar.

Este documento explica qué es y cómo se arma uno para otra marca.

## Qué entra y qué no

Entran los **recursos de marca**: lo que una persona necesita para producir piezas con la marca.
No entran las **piezas** ya hechas (papelería, stickers, banners, presentaciones): esas se entregan aparte.

## Módulos

Cada módulo es una página propia con la misma barra lateral, el mismo selector abajo y la misma transición entre páginas. Una marca puede no tener alguno (por ejemplo, formas o patrones): se saca del selector y listo.

| Módulo | Qué resuelve | Qué hace falta de la marca |
|---|---|---|
| Logos | Ver y bajar cada versión en SVG, PDF y PNG, con sus reglas de uso | SVG y PDF de cada versión; notas de uso, área de exclusión y tamaños mínimos del manual |
| Color | Copiar códigos, ver las combinaciones y qué color de texto va sobre cada fondo; muestras `.ase` | HEX, RGB, CMYK y Pantone de cada color; jerarquías y proporciones; tabla de color y texto |
| Tipografía | Muestrario con texto de prueba, jerarquía y lineamientos; las fuentes para instalar | Las familias (si la licencia no permite redistribuir, solo el link); jerarquía y alternativas de sistema |
| Íconos | Buscar, recolorear y bajar íconos sueltos o en ZIP; el `.ai` completo | SVG de cada ícono por categoría, en un solo color; el `.ai` |
| Formas | Cada forma sin fondo o con fondo, en los colores y combinaciones del sistema; el `.ai` | SVG de cada forma y de su versión con fondo; el `.ai` se genera solo |
| Patrones | Generar patrones con las formas y exportarlos | Las formas y sus reglas de composición. Es el módulo más atado a cada marca: hay que adaptar el generador |

## Cómo se arma uno para otra marca

1. **Repo nuevo.** Duplicar este repo como `<cliente>-kit-de-marca` en `bongstudio-dev` (es la fuente; no se publica desde GitHub).
2. **Datos de la marca.** Reemplazar los de Profertil:

   | Módulo | Dónde están los datos |
   |---|---|
   | Logos | Lista `LOGOS` al principio de `logos/script.js` y los archivos en `logos/archivos/` |
   | Color | Constantes `COLORS`, `LEVELS` y `TEXT_PAIRS` al principio de `color/script.js` |
   | Tipografía | `FAMILIES` y `LEVELS` en `tipografia/script.js`, los zip en `tipografia/archivos/` y el link de Google Fonts en el `<head>` |
   | Íconos | SVG por categoría y `iconos/build-data.py`, que arma `icons-data.js` |
   | Formas | SVG en `patrones/public/shapes/` y `formas/fuente/con-fondo/`; `formas/build-data.py` arma los datos y `formas/build-ai.py` el `.ai` |
   | Patrones | `patrones/public/shapes/` y la lógica de `patrones/script.js` |

3. **Piel.** Los colores de la interfaz (azul de las píldoras, verde de los botones, marfil de fondo) y la fuente de la interfaz pasan a los de la marca nueva: están en el `:root` de cada `styles.css` y en `shared/shell.css`.
4. **Selector.** Sacar los módulos que no apliquen del bloque `<nav class="tools-dock">` de cada página.
5. **Analytics.** Todos los kits miden en la misma propiedad de GA4 ("Kits de marca"): en `shared/analytics.js` solo se cambia `MARCA`. En los informes se separan por el parámetro `marca` o por la ruta.
6. **Firma.** Cambiar el nombre del proyecto en `shared/firma.txt` y correr `python3 shared/firmar.py` (ver la memoria `bong-firma-codigo`).
7. **Probar.** Cada página carga sin errores en consola; cada descarga baja el archivo correcto; en celular no hay scroll horizontal y el selector entra; pasar de un módulo a otro deja quieta la barra lateral.
8. **Publicar.** Va en `entregables.bongstudio.ar/<cliente>/kit-de-marca/`, público y sin Cloudflare Access (ver el `LEEME.md` de `bong-entregables`): sumar al `publicar.sh` de ese sitio la copia del repo, como la de Profertil.
9. **Entregar.** Link al cliente, y si reemplaza algo (un link viejo, una carpeta de SharePoint), actualizar esa carpeta también.

## Lo que falta para que sea un producto

- **Los tokens de la interfaz están repetidos** en el `styles.css` de cada módulo. Para cambiar de marca en un solo lugar hay que moverlos a `shared/`.
- **Los datos de la marca viven dentro de cada `script.js`.** El paso siguiente es un único archivo de marca (`marca.json`) que lean todos los módulos.
- **Nombre y dirección**: se llama "Kit de marca" y vive en `entregables.bongstudio.ar/<cliente>/kit-de-marca/` (decidido el 14/10/2026).

---

Sistema de marca y kit por **[Bong](https://bongstudio.ar)**.
