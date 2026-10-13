#!/usr/bin/env python3
import os, re, json, shutil, html

# Project root = folder containing this script; icon source folders live one level up.
DST = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.dirname(DST)
ICONS_DST = os.path.join(DST, "public", "iconos")

CATEGORIES = [
    ("administracion", "Administración"),
    ("agro", "Agro"),
    ("compliance", "Compliance"),
    ("industria", "Industria"),
    ("personas", "Personas"),
    ("planta", "Planta"),
    ("sostenibilidad", "Sostenibilidad"),
    ("supply chain", "Supply Chain"),
]

def humanize(fname):
    base = re.sub(r"\.svg$", "", fname, flags=re.I)
    base = re.sub(r"-?blanco$", "", base)
    base = base.replace("_", " ").replace("-", " ")
    base = re.sub(r"\s+", " ", base).strip()
    return base[:1].upper() + base[1:] if base else fname

def clean_svg(raw):
    # Convert hardcoded white to currentColor so we can recolor via CSS `color`
    s = raw
    s = re.sub(r'(stroke|fill)="(?:white|#fff|#ffffff|#FFFFFF|#FFF)"',
               lambda m: f'{m.group(1)}="currentColor"', s)
    # Remove top-level width/height so the svg scales to its container (keep viewBox)
    s = re.sub(r'(<svg\b[^>]*?)\swidth="[^"]*"', r'\1', s, count=1)
    s = re.sub(r'(<svg\b[^>]*?)\sheight="[^"]*"', r'\1', s, count=1)
    return s.strip()

data = {"categories": [], "icons": []}
total = 0
for slug, label in CATEGORIES:
    src_dir = os.path.join(SRC, slug)
    if not os.path.isdir(src_dir):
        continue
    files = sorted([f for f in os.listdir(src_dir) if f.lower().endswith(".svg")])
    # copy folder
    dst_dir = os.path.join(ICONS_DST, slug)
    os.makedirs(dst_dir, exist_ok=True)
    for f in files:
        shutil.copy2(os.path.join(src_dir, f), os.path.join(dst_dir, f))
        with open(os.path.join(src_dir, f), "r", encoding="utf-8") as fh:
            raw = fh.read()
        data["icons"].append({
            "id": f"{slug}/{f}",
            "name": humanize(f),
            "file": f,
            "category": slug,
            "categoryLabel": label,
            "svg": clean_svg(raw),
        })
        total += 1
    data["categories"].append({"slug": slug, "label": label, "count": len(files)})

out = os.path.join(DST, "icons-data.js")
with open(out, "w", encoding="utf-8") as fh:
    fh.write("// Auto-generado: librería de íconos Profertil 2026 (white -> currentColor)\n")
    fh.write("window.ICON_DATA = ")
    json.dump(data, fh, ensure_ascii=False)
    fh.write(";\n")

print(f"Total icons: {total}")
print(f"Categories: {len(data['categories'])}")
print("Wrote", out)
