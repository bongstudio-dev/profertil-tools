#!/usr/bin/env python3
"""Arma shapes-data.js con las 18 formas del sistema.

Fuentes (los entregables oficiales del sistema de marca):
- sin fondo: ../patrones/public/shapes/Profertil_Forma_<X>_Amarillo.svg (recorte justo)
- con fondo: fuente/con-fondo/Profertil_Forma_<X>_Fondo_<Color>.svg (badge de 452 x 452)
"""
import json, os, re, glob

HERE = os.path.dirname(os.path.abspath(__file__))
SIN_FONDO = os.path.join(HERE, "..", "patrones", "public", "shapes")
CON_FONDO = os.path.join(HERE, "fuente", "con-fondo")

NAMES = {"Circulos": "Círculos", "Grafico": "Gráfico"}
HEX = {
    "#003DA5": "azul", "#4086FF": "celeste", "#2D8035": "verde", "#5EB53A": "verdeClaro",
    "#EABA2C": "amarillo", "#E57F19": "naranja",
    "#8A4718": "terra", "#8A4818": "terra",  # los SVG traen el terra viejo; el manual dice #8A4818
}

def paths(svg):
    """Los <path> del SVG con el relleno pasado a currentColor."""
    found = re.findall(r"<path\b[^>]*/>", svg)
    return "".join(re.sub(r'fill="#[0-9A-Fa-f]{6}"', 'fill="currentColor"', p) for p in found)

shapes = []
for src in sorted(glob.glob(os.path.join(SIN_FONDO, "Profertil_Forma_*_Amarillo.svg"))):
    key = re.search(r"Profertil_Forma_(.+)_Amarillo\.svg$", src).group(1)
    svg = open(src, encoding="utf-8").read()
    w, h = re.search(r'viewBox="0 0 ([\d.]+) ([\d.]+)"', svg).groups()

    badge_files = glob.glob(os.path.join(CON_FONDO, f"Profertil_Forma_{key}_Fondo_*.svg"))
    assert len(badge_files) == 1, f"{key}: se esperaba un solo archivo con fondo"
    badge = open(badge_files[0], encoding="utf-8").read()
    rect = re.search(r"<rect\b[^>]*/>", badge).group(0)
    bg = HEX[re.search(r'fill="(#[0-9A-Fa-f]{6})"', rect).group(1).upper()]
    fg = HEX[re.search(r'fill="(#[0-9A-Fa-f]{6})"', re.search(r"<path\b[^>]*/>", badge).group(0)).group(1).upper()]

    shapes.append({
        "id": key.lower(),
        "file": key,
        "name": NAMES.get(key, key),
        "w": float(w), "h": float(h),
        "paths": paths(svg),
        "badgePaths": paths(badge),
        "badgeBg": bg, "badgeFg": fg,
    })

out = os.path.join(HERE, "shapes-data.js")
with open(out, "w", encoding="utf-8") as f:
    f.write("/* Generado por build-data.py: no editar a mano. */\n")
    f.write("window.SHAPE_DATA = " + json.dumps(shapes, ensure_ascii=False, separators=(",", ":")) + ";\n")
print(f"{len(shapes)} formas -> {os.path.relpath(out, HERE)} ({os.path.getsize(out)} bytes)")
for s in shapes:
    print(f"  {s['name']:10} {s['w']:g} x {s['h']:g}  original: {s['badgeFg']} sobre {s['badgeBg']}")
