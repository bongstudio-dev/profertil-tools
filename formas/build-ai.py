#!/usr/bin/env python3
"""Arma descargas/Profertil_Formas_Sistema_2026.ai con Illustrator.

Lee shapes-data.js (ver build-data.py), escribe un SVG por forma y color en una
carpeta temporal y le pasa a Illustrator un script que los importa: una mesa de
trabajo y una capa por color sin fondo, otra con los 18 badges originales, y los
colores de marca como muestras globales.

    python3 formas/build-ai.py

Necesita Adobe Illustrator instalado (lo abre si está cerrado).
"""
import json, os, subprocess, tempfile

JSX = r'''  var COLS = 6, GAP = 48, MARGIN = 96, BOARD_GAP = 240;
  app.userInteractionLevel = UserInteractionLevel.DONTDISPLAYALERTS;
  // Cierra un intento anterior que haya quedado abierto (solo documentos nuestros, sin guardar)
  for (var d = app.documents.length - 1; d >= 0; d--) {
    var od = app.documents[d];
    if (!od.saved && od.name.indexOf("Untitled") === 0 && od.artboards[0].name === "Sin fondo - Azul") od.close(SaveOptions.DONOTSAVECHANGES);
  }
  var doc = app.documents.add(DocumentColorSpace.RGB, 1000, 1000);

  // Muestras globales con los colores de marca
  var SW = [];
  for (var i = 0; i < PAL.length; i++) {
    var c = new RGBColor(); c.red = PAL[i][1]; c.green = PAL[i][2]; c.blue = PAL[i][3];
    var spot = doc.spots.add(); spot.name = PAL[i][0]; spot.colorType = ColorModel.PROCESS; spot.color = c;
    var sc = new SpotColor(); sc.spot = spot; sc.tint = 100;
    SW.push({ r: PAL[i][1], g: PAL[i][2], b: PAL[i][3], color: sc });
  }
  function swatchFor(col) {
    if (!col || col.typename !== "RGBColor") return null;
    for (var k = 0; k < SW.length; k++) {
      if (Math.abs(SW[k].r - col.red) < 3 && Math.abs(SW[k].g - col.green) < 3 && Math.abs(SW[k].b - col.blue) < 3) return SW[k].color;
    }
    return null;
  }
  function paint(it) {
    var j;
    if (it.typename === "GroupItem") { for (j = 0; j < it.pageItems.length; j++) paint(it.pageItems[j]); }
    else if (it.typename === "CompoundPathItem") { for (j = 0; j < it.pathItems.length; j++) paint(it.pathItems[j]); }
    else if (it.typename === "PathItem" && it.filled) { var s = swatchFor(it.fillColor); if (s) it.fillColor = s; }
  }

  var first = doc.artboards[0].artboardRect;
  // Grilla de 2 columnas: el lienzo de Illustrator no admite una sola columna tan larga
  var PITCH_X = 0, PITCH_Y = 0;
  for (var p = 0; p < BOARDS.length; p++) {
    var rp = Math.ceil(BOARDS[p].items.length / COLS);
    PITCH_X = Math.max(PITCH_X, MARGIN * 2 + COLS * BOARDS[p].cell + (COLS - 1) * GAP);
    PITCH_Y = Math.max(PITCH_Y, MARGIN * 2 + rp * BOARDS[p].cell + (rp - 1) * GAP);
  }
  PITCH_X += BOARD_GAP; PITCH_Y += BOARD_GAP;
  var baseLayer = doc.layers[0];
  for (var bIdx = 0; bIdx < BOARDS.length; bIdx++) {
    var B = BOARDS[bIdx], n = B.items.length, rows = Math.ceil(n / COLS);
    var w = MARGIN * 2 + COLS * B.cell + (COLS - 1) * GAP;
    var h = MARGIN * 2 + rows * B.cell + (rows - 1) * GAP;
    var left = first[0] + (bIdx % 2) * PITCH_X, top = first[1] - Math.floor(bIdx / 2) * PITCH_Y;
    var rect = [left, top, left + w, top - h];
    var ab = bIdx === 0 ? doc.artboards[0] : doc.artboards.add(rect);
    ab.artboardRect = rect; ab.name = B.name;
    var layer = bIdx === 0 ? baseLayer : doc.layers.add();
    layer.name = B.name;
    for (var k = 0; k < n; k++) {
      // Importar en la capa activa: layer.groupItems.createFromFile en una capa nueva deja la referencia rota
      doc.activeLayer = layer;
      var g = doc.groupItems.createFromFile(new File(B.items[k][1]));
      g.name = B.items[k][0];
      paint(g);
      var col = k % COLS, row = Math.floor(k / COLS);
      var cx = rect[0] + MARGIN + col * (B.cell + GAP) + (B.cell - g.width) / 2;
      var cy = rect[1] - MARGIN - row * (B.cell + GAP) - (B.cell - g.height) / 2;
      g.position = [cx, cy];
    }
  }
  // Las capas en el mismo orden que las mesas de trabajo (la primera arriba)
  for (var m = doc.layers.length - 1; m >= 0; m--) doc.layers[m].zOrder(ZOrderMethod.SENDTOBACK);
  for (var q = 0; q < BOARDS.length; q++) {
    for (var z = 0; z < doc.layers.length; z++) if (doc.layers[z].name === BOARDS[q].name) doc.layers[z].zOrder(ZOrderMethod.SENDTOBACK);
  }
  var opts = new IllustratorSaveOptions(); opts.pdfCompatible = true; opts.compressed = true; opts.embedICCProfile = false;
  doc.saveAs(new File(OUT), opts);
  var res = "ok " + doc.artboards.length + " mesas, " + doc.layers.length + " capas, " + doc.pageItems.length + " objetos";
  doc.close(SaveOptions.DONOTSAVECHANGES);
  return res;
})();
'''

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, "descargas", "Profertil_Formas_Sistema_2026.ai")
PAL = [("azul", "Azul", "#003DA5"), ("celeste", "Celeste", "#4086FF"), ("verde", "Verde", "#2D8035"),
       ("verdeClaro", "Verde Claro", "#5EB53A"), ("amarillo", "Amarillo", "#EABA2C"),
       ("naranja", "Naranja", "#E57F19"), ("terra", "Terra", "#8A4818")]
HEX = {k: h for k, _, h in PAL}


def js(s):
    """String de ExtendScript con escapes: el .jsx sin BOM se lee como MacRoman."""
    out = ""
    for c in s:
        if c in '"\\':
            out += "\\" + c
        elif 32 <= ord(c) < 127:
            out += c
        else:
            out += "\\u%04x" % ord(c)
    return '"' + out + '"'


src = open(os.path.join(HERE, "shapes-data.js"), encoding="utf-8").read()
shapes = json.loads(src[src.index("=") + 1:].strip().rstrip(";"))
tmp = tempfile.mkdtemp(prefix="formas-ai-")
boards = []
for key, name, hexv in PAL:
    items = []
    for s in shapes:
        p = os.path.join(tmp, f"{key}-{s['file']}.svg")
        with open(p, "w") as f:
            f.write(f'<svg width="{s["w"]}" height="{s["h"]}" viewBox="0 0 {s["w"]} {s["h"]}" fill="none" xmlns="http://www.w3.org/2000/svg">{s["paths"].replace("currentColor", hexv)}</svg>')
        items.append((f"Forma {s['name']} {name}", p))
    boards.append((f"Sin fondo - {name}", 320, items))
items = []
for s in shapes:
    p = os.path.join(tmp, f"badge-{s['file']}.svg")
    with open(p, "w") as f:
        f.write(f'<svg width="452" height="452" viewBox="0 0 452 452" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="451.941" height="451.941" rx="146.375" fill="{HEX[s["badgeBg"]]}"/>{s["badgePaths"].replace("currentColor", HEX[s["badgeFg"]])}</svg>')
    items.append((f"Badge {s['name']}", p))
boards.append(("Con fondo - Original", 452, items))

head = "#target illustrator\n(function () {\n"
head += "  var OUT = " + js(OUT) + ";\n"
head += "  var PAL = [" + ",".join("[" + js("Profertil " + n) + ",%d,%d,%d]" % tuple(int(h[i:i + 2], 16) for i in (1, 3, 5)) for _, n, h in PAL) + "];\n"
head += "  var BOARDS = [" + ",".join("{name:" + js(n) + ",cell:%d,items:[" % c + ",".join("[" + js(a) + "," + js(b) + "]" for a, b in it) + "]}" for n, c, it in boards) + "];\n"

os.makedirs(os.path.dirname(OUT), exist_ok=True)
script = os.path.join(tmp, "formas.jsx")
with open(script, "w", encoding="ascii") as f:
    f.write(head + JSX)
res = subprocess.run(["osascript", "-e", "with timeout of 900 seconds",
                      "-e", f'tell application id "com.adobe.illustrator" to do javascript file (POSIX file "{script}")',
                      "-e", "end timeout"], capture_output=True, text=True)
print(res.stdout.strip() or res.stderr.strip())
