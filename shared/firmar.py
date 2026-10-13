#!/usr/bin/env python3
"""Pone la firma de Bong Studio (shared/firma.txt) como comentario al principio
de cada página. Se puede correr las veces que haga falta: reemplaza la anterior.

    python3 shared/firmar.py                 # las páginas de este sitio
    python3 shared/firmar.py otra/index.html # o las que se le pasen
"""
import glob, os, re, sys

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
firma = open(os.path.join(HERE, "firma.txt"), encoding="utf-8").read().rstrip("\n")
assert "--" not in firma, "un comentario HTML no puede llevar dos guiones seguidos"
bloque = "<!-- firma:bong\n" + firma + "\n-->\n"

paginas = sys.argv[1:] or [os.path.join(ROOT, "index.html")] + sorted(glob.glob(os.path.join(ROOT, "*", "index.html")))
for ruta in paginas:
    html = open(ruta, encoding="utf-8").read()
    html = re.sub(r"<!-- firma:bong\n.*?-->\n", "", html, flags=re.S)
    html, n = re.subn(r"(?i)(<!doctype html>\n)", lambda m: m.group(1) + bloque, html, count=1)
    assert n == 1, ruta + ": no se encontró el doctype"
    open(ruta, "w", encoding="utf-8").write(html)
    print("firmada:", os.path.relpath(ruta, ROOT))
