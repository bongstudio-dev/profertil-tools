/* Profertil Color Browser — vanilla JS */
(function () {
  "use strict";

  // Valores del Manual de Marca v1.1.4, sección 03.02.03 (Paleta completa).
  const COLORS = {
    azul: { name: "Azul", role: "Primario", note: "La energía que transformamos.", hex: "#003DA5", rgb: [0, 61, 165], cmyk: [100, 63, 0, 35], pms: "293C" },
    celeste: { name: "Celeste", role: "Secundario", note: "Complementario del Azul.", hex: "#4086FF", rgb: [64, 134, 255], cmyk: [75, 47, 0, 0], pms: "PQ 2727C" },
    verde: { name: "Verde", role: "Primario", note: "La tierra que nutrimos.", hex: "#2D8035", rgb: [45, 128, 53], cmyk: [65, 0, 59, 50], pms: "356C" },
    verdeClaro: { name: "Verde Claro", role: "Secundario", note: "Complementario del Verde.", hex: "#5EB53A", rgb: [94, 181, 58], cmyk: [48, 0, 68, 29], pms: "361C" },
    amarillo: { name: "Amarillo", role: "Primario", note: "Los alimentos que generamos.", hex: "#EABA2C", rgb: [234, 186, 44], cmyk: [0, 21, 81, 8], pms: "7408C" },
    naranja: { name: "Naranja", role: "Secundario", note: "Complementario del Amarillo.", hex: "#E57F19", rgb: [229, 127, 25], cmyk: [0, 45, 89, 10], pms: "138C" },
    marfil: { name: "Marfil", role: "Soporte", note: "Reemplaza al blanco puro: fondo, separador y descanso.", hex: "#FFFEEF", rgb: [255, 254, 239], cmyk: [0, 0, 10, 0], pms: "P 1-2 U", light: true, edge: true },
    terra: { name: "Terra", role: "Auxiliar", note: "No domina: suma tierra, raíces y comunidad.", hex: "#8A4818", rgb: [138, 72, 24], cmyk: [0, 48, 83, 46], pms: "2315C" },
  };
  const PALETTE = ["azul", "celeste", "verde", "verdeClaro", "amarillo", "naranja", "marfil", "terra"];

  // Solo para la vista de texto: no son colores de la paleta.
  const NEUTRALS = {
    blanco: { name: "Blanco", hex: "#FFFFFF", rgb: [255, 255, 255], cmyk: [0, 0, 0, 0], light: true, edge: true },
    negro: { name: "Negro", hex: "#000000", rgb: [0, 0, 0], cmyk: [0, 0, 0, 100] },
  };

  const FORMATS = {
    hex: { label: "HEX" },
    rgb: { label: "RGB" },
    cmyk: { label: "CMYK" },
    pms: { label: "Pantone" },
  };

  // Manual, secciones 03.05.01 (Jerarquías) y 03.06.01 (Proporciones).
  const LEVELS = {
    primaria: {
      label: "Primaria",
      rule: "Los 3 colores fundacionales en proporción equilibrada. Ninguno domina sobre el otro.",
      roles: ["Fundacional", "Fundacional", "Fundacional"],
      combos: [{ colors: ["azul", "verde", "amarillo"], parts: [1, 1, 1], turn: -60 }],
    },
    secundarias: {
      label: "Secundarias",
      rule: "El primario ocupa 70% y su complementario 30%. Jerarquía clara: uno manda, el otro acompaña.",
      roles: ["Dominante", "Complementario"],
      combos: [
        { colors: ["azul", "celeste"], parts: [70, 30] },
        { colors: ["verde", "verdeClaro"], parts: [70, 30] },
        { colors: ["amarillo", "naranja"], parts: [70, 30] },
        { colors: ["naranja", "terra"], parts: [70, 30] },
      ],
    },
    terciarias: {
      label: "Terciarias",
      rule: "Combinaciones de 2 o 3 familias, siempre con un color protagonista. Más riqueza cromática para las piezas que la necesitan.",
      roles: ["Protagonista", "Complementario", "Acento"],
      combos: [
        { colors: ["azul", "celeste", "verde"], parts: [50, 25, 25] },
        { colors: ["verde", "verdeClaro", "amarillo"], parts: [50, 25, 25] },
        { colors: ["amarillo", "naranja", "verde"], parts: [50, 25, 25] },
        { colors: ["amarillo", "naranja", "terra"], parts: [50, 25, 25] },
      ],
    },
  };

  // Manual, sección 03.07.01 (Color y texto): [fondo, texto].
  const TEXT_PAIRS = [
    ["marfil", "negro"], ["marfil", "azul"], ["marfil", "verde"], ["marfil", "verdeClaro"], ["marfil", "amarillo"], ["marfil", "naranja"],
    ["azul", "blanco"], ["azul", "marfil"], ["azul", "celeste"],
    ["celeste", "blanco"], ["celeste", "marfil"], ["celeste", "azul"],
    ["verde", "blanco"], ["verde", "marfil"], ["verde", "verdeClaro"],
    ["verdeClaro", "blanco"], ["verdeClaro", "marfil"], ["verdeClaro", "verde"],
    ["amarillo", "blanco"], ["amarillo", "marfil"], ["amarillo", "naranja"],
    ["naranja", "blanco"], ["naranja", "marfil"], ["naranja", "terra"],
    ["terra", "blanco"], ["terra", "marfil"], ["terra", "naranja"],
  ];

  const VIEWS = [
    { slug: "paleta", hash: "paleta", label: "Paleta completa", count: PALETTE.length, unit: ["color", "colores"] },
    { slug: "combos", hash: "combinaciones", label: "Combinaciones", count: Object.values(LEVELS).reduce((n, l) => n + l.combos.length, 0), unit: ["combinación", "combinaciones"] },
    { slug: "texto", hash: "texto", label: "Color y texto", count: TEXT_PAIRS.length, unit: ["uso", "usos"] },
  ];

  const state = {
    view: "paleta",
    format: "hex",
    level: "primaria",
    combo: 0,
    marfil: false,
  };

  // ---------- DOM ----------
  const $ = (sel) => document.querySelector(sel);
  const viewsNav = $("#views");
  const currentView = $("#currentView");
  const countChip = $("#countChip");
  const formatPills = $("#formatPills");
  const paletteGrid = $("#paletteGrid");
  const levelPills = $("#levelPills");
  const levelRule = $("#levelRule");
  const comboChips = $("#comboChips");
  const stage = $("#stage");
  const pieGroup = $("#pieGroup");
  const pieBase = $("#pieBase");
  // En el SVG el dominante va último para quedar arriba; acá se ordenan por rol.
  const slices = Array.from(document.querySelectorAll(".slice")).sort((a, b) => a.dataset.i - b.dataset.i);
  const legend = $("#legend");
  const marfilToggle = $("#marfilToggle");
  const textGrid = $("#textGrid");
  const toast = $("#toast");
  const toastDot = $("#toastDot");
  const toastText = $("#toastText");

  const ICON_COPY = '<svg class="code-ic" viewBox="0 0 24 24" fill="none" aria-hidden="true"><rect x="9" y="9" width="11" height="11" rx="3" stroke="currentColor" stroke-width="2"/><path d="M15 9V7a3 3 0 00-3-3H7a3 3 0 00-3 3v5a3 3 0 003 3h2" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>';
  const ICON_CHECK = '<svg class="code-ic" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>';

  // ---------- Helpers ----------
  const getColor = (key) => COLORS[key] || NEUTRALS[key];

  // Blanco y Negro no tienen Pantone: caen a HEX.
  function formatValue(key, format) {
    const c = getColor(key);
    if (format === "rgb") return c.rgb.join(", ");
    if (format === "cmyk") return c.cmyk.join(", ");
    if (format === "pms" && c.pms) return c.pms;
    return c.hex;
  }

  function delay(i) {
    const steps = [60, 120, 180, 240];
    return steps[Math.min(i, steps.length - 1)] + (i > 3 ? (i - 3) * 22 : 0);
  }

  function percents(parts) {
    const total = parts.reduce((a, b) => a + b, 0);
    return parts.map((p) => Math.round((p / total) * 100));
  }

  // ---------- Copiar ----------
  function fallbackCopy(text) {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.setAttribute("readonly", "");
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand("copy"); } catch (e) { /* sin portapapeles */ }
    ta.remove();
  }

  function copyText(text) {
    if (navigator.clipboard && window.isSecureContext) {
      return navigator.clipboard.writeText(text).catch(() => fallbackCopy(text));
    }
    fallbackCopy(text);
    return Promise.resolve();
  }

  let toastTimer = null;
  function showToast(message, swatchHex) {
    clearTimeout(toastTimer);
    toast.classList.remove("is-leaving");
    toastText.textContent = message;
    toastDot.style.background = swatchHex || "transparent";
    toastDot.hidden = !swatchHex;
    toast.hidden = false;
    // Reinicia la animación de entrada si ya estaba visible.
    toast.style.animation = "none";
    void toast.offsetWidth;
    toast.style.animation = "";
    toastTimer = setTimeout(() => {
      toast.classList.add("is-leaving");
      toastTimer = setTimeout(() => { toast.hidden = true; }, 260);
    }, 1800);
  }

  function flash(el) {
    if (!el) return;
    el.classList.add("is-copied");
    setTimeout(() => el.classList.remove("is-copied"), 1100);
  }

  function copyColor(key, format, el) {
    const value = formatValue(key, format);
    copyText(value);
    showToast("Copiado · " + value, getColor(key).hex);
    flash(el);
  }

  // ---------- Render: navegación ----------
  function renderViews() {
    viewsNav.innerHTML = VIEWS.map((v) => `
      <button class="cat-item${v.slug === state.view ? " active" : ""}" data-view="${v.slug}">
        <span>${v.label}</span>
        <span class="cat-count">${v.count}</span>
      </button>`).join("");
  }

  function showView() {
    const v = VIEWS.find((x) => x.slug === state.view);
    currentView.textContent = v.label;
    countChip.textContent = `${v.count} ${v.unit[v.count === 1 ? 0 : 1]}`;
    document.querySelectorAll(".view").forEach((s) => { s.hidden = s.dataset.view !== state.view; });
    if (state.view === "paleta") renderPalette();
    if (state.view === "combos") renderCombos(true);
    if (state.view === "texto") renderText();
  }

  // ---------- Render: paleta ----------
  function renderPalette() {
    paletteGrid.innerHTML = PALETTE.map((key, i) => {
      const c = COLORS[key];
      const rows = Object.keys(FORMATS).map((f) => `
          <button class="code-row${f === state.format ? " is-active" : ""}" data-key="${key}" data-format="${f}" aria-label="Copiar ${FORMATS[f].label} de ${c.name}">
            <span class="code-k">${FORMATS[f].label}</span>
            <span class="code-v">${formatValue(key, f)}</span>
            ${ICON_COPY}
          </button>`).join("");
      return `
      <article class="card color-card" style="animation-delay:${delay(i)}ms">
        <button class="swatch${c.light ? " is-light" : ""}${c.edge ? " has-edge" : ""}" data-key="${key}" style="background:${c.hex}" aria-label="Copiar ${c.name} en ${FORMATS[state.format].label}">
          <span class="swatch-role">${c.role}</span>
          <span class="swatch-copy">${ICON_COPY.replace('class="code-ic" ', "")}</span>
          <span class="swatch-name">${c.name}</span>
          <span class="swatch-code">${formatValue(key, state.format)}</span>
        </button>
        <p class="color-note">${c.note}</p>
        <div class="codes">${rows}</div>
      </article>`;
    }).join("");
  }

  // Cambiar de formato no vuelve a animar las tarjetas: solo actualiza los textos.
  function syncPaletteFormat() {
    paletteGrid.querySelectorAll(".swatch").forEach((s) => {
      s.querySelector(".swatch-code").textContent = formatValue(s.dataset.key, state.format);
      s.setAttribute("aria-label", `Copiar ${COLORS[s.dataset.key].name} en ${FORMATS[state.format].label}`);
    });
    paletteGrid.querySelectorAll(".code-row").forEach((r) =>
      r.classList.toggle("is-active", r.dataset.format === state.format));
  }

  // ---------- Render: combinaciones ----------
  const shownPct = [0, 0, 0];

  function tweenPct(el, i, to) {
    const from = shownPct[i];
    shownPct[i] = to;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || from === to) {
      el.textContent = to + "%";
      return;
    }
    const start = performance.now();
    const dur = 700;
    (function tick(now) {
      // Si otra combinación pisó el destino, esta animación se corta.
      if (shownPct[i] !== to) return;
      const t = Math.min(1, (now - start) / dur);
      const eased = 1 - Math.pow(1 - t, 3);
      el.textContent = Math.round(from + (to - from) * eased) + "%";
      if (t < 1) requestAnimationFrame(tick);
    })(start);
  }

  function currentCombo() {
    return LEVELS[state.level].combos[state.combo];
  }

  function comboName(combo) {
    return combo.colors.map((k) => COLORS[k].name).join(" + ");
  }

  function renderChips() {
    const level = LEVELS[state.level];
    comboChips.innerHTML = level.combos.map((combo, i) => `
      <button class="combo-chip${i === state.combo ? " active" : ""}" data-combo="${i}" style="animation-delay:${i * 50}ms">
        <span class="chip-pie" style="background:${pieGradient(combo)}"></span>
        ${comboName(combo)}
      </button>`).join("");
  }

  // La torta se arma como en el manual: en sentido horario desde arriba van el
  // segundo color, el tercero y por último el dominante. La primaria gira 60°
  // (turn) para que el Verde quede centrado arriba.
  const SEAM = 0.4;

  function pieLayout(combo) {
    const total = combo.parts.reduce((a, b) => a + b, 0);
    const size = combo.parts.map((p) => (p / total) * 100);
    const start = [];
    let at = 0;
    [1, 2, 0].forEach((i) => {
      start[i] = at;
      if (i < size.length) at += size[i];
    });
    return { size, start, offset: combo.turn || 0 };
  }

  function pieGradient(combo) {
    const { size, start, offset } = pieLayout(combo);
    const stops = [1, 2, 0].filter((i) => i < size.length)
      .map((i) => `${COLORS[combo.colors[i]].hex} ${start[i]}% ${start[i] + size[i]}%`);
    return `conic-gradient(from ${offset}deg, ${stops.join(", ")})`;
  }

  function renderLegend() {
    const level = LEVELS[state.level];
    const combo = currentCombo();
    const pct = percents(combo.parts);
    legend.innerHTML = combo.colors.map((key, i) => {
      const c = COLORS[key];
      return `
      <button class="legend-item" data-key="${key}" style="animation-delay:${80 + i * 70}ms" aria-label="${c.name}, ${pct[i]}%. Copiar en ${FORMATS[state.format].label}">
        <span class="legend-dot${c.edge ? " has-edge" : ""}" style="background:${c.hex}"></span>
        <span class="legend-pct">${shownPct[i]}%</span>
        <span class="legend-text"><small>${level.roles[i]}</small><strong>${c.name}</strong></span>
        <span class="legend-code">${formatValue(key, state.format)}</span>
      </button>`;
    }).join("");
    for (let i = combo.colors.length; i < shownPct.length; i++) shownPct[i] = 0;
    legend.querySelectorAll(".legend-pct").forEach((el, i) => tweenPct(el, i, pct[i]));
  }

  function paintStage(fromZero) {
    const combo = currentCombo();
    const { size, start, offset } = pieLayout(combo);
    if (fromZero) {
      // Al entrar a la vista las porciones se abren desde cero.
      slices.forEach((s) => { s.style.transition = "none"; s.style.strokeDasharray = "0 100"; });
      pieBase.style.transition = "none";
      pieBase.style.opacity = 0;
      void stage.offsetWidth;
      slices.forEach((s) => { s.style.transition = ""; });
      pieBase.style.transition = "";
    }
    pieBase.style.opacity = 1;
    pieBase.style.fill = COLORS[combo.colors[0]].hex;
    pieGroup.style.setProperty("--rot", (offset - 90) + "deg");
    slices.forEach((s, i) => {
      const key = combo.colors[i];
      s.style.strokeDashoffset = -start[i];
      if (!key) {
        s.style.strokeDasharray = "0 100";
        s.removeAttribute("data-key");
        return;
      }
      s.dataset.key = key;
      s.style.stroke = COLORS[key].hex;
      // Las porciones que no son la dominante se estiran un pelo por debajo de la siguiente.
      s.style.strokeDasharray = `${size[i] + (i === 0 ? 0 : SEAM)} 100`;
    });
  }

  function renderCombos(fromZero) {
    const level = LEVELS[state.level];
    levelPills.querySelectorAll(".pill").forEach((p) => p.classList.toggle("active", p.dataset.level === state.level));
    levelRule.textContent = level.rule;
    if (fromZero) shownPct.fill(0);
    renderChips();
    renderLegend();
    paintStage(fromZero);
  }

  // ---------- Render: color y texto ----------
  function renderText() {
    textGrid.innerHTML = TEXT_PAIRS.map(([bg, fg], i) => {
      const b = getColor(bg);
      const f = getColor(fg);
      return `
      <button class="card text-card" data-bg="${bg}" data-fg="${fg}" style="animation-delay:${delay(i)}ms" aria-label="Texto ${f.name} sobre fondo ${b.name}. Copiar ambos códigos">
        <span class="text-tile${b.edge ? " has-edge" : ""}" style="background:${b.hex};color:${f.hex}">Aa</span>
        <span class="text-caption"><strong>${f.name}</strong><small>sobre ${b.name}</small></span>
      </button>`;
    }).join("");
  }

  // ---------- Descarga .ase (Adobe Swatch Exchange) ----------
  function aseBlock(type, nameStr, payload) {
    const nameLen = nameStr ? nameStr.length + 1 : 0;
    const bodyLen = (nameStr ? 2 + nameLen * 2 : 0) + (payload ? payload.byteLength : 0);
    const buf = new DataView(new ArrayBuffer(6 + bodyLen));
    let o = 0;
    buf.setUint16(o, type); o += 2;
    buf.setUint32(o, bodyLen); o += 4;
    if (nameStr) {
      buf.setUint16(o, nameLen); o += 2;
      for (let i = 0; i < nameStr.length; i++) { buf.setUint16(o, nameStr.charCodeAt(i)); o += 2; }
      buf.setUint16(o, 0); o += 2;
    }
    if (payload) new Uint8Array(buf.buffer).set(new Uint8Array(payload), o);
    return buf.buffer;
  }

  function aseColor(model, values) {
    const buf = new DataView(new ArrayBuffer(4 + values.length * 4 + 2));
    for (let i = 0; i < 4; i++) buf.setUint8(i, model.charCodeAt(i));
    values.forEach((v, i) => buf.setFloat32(4 + i * 4, v));
    buf.setUint16(4 + values.length * 4, 2); // 2 = color normal (ni global ni tinta plana)
    return buf.buffer;
  }

  function buildAse() {
    const blocks = [];
    const groups = [
      { name: "Profertil CMYK", model: "CMYK", values: (c) => c.cmyk.map((v) => v / 100) },
      { name: "Profertil RGB", model: "RGB ", values: (c) => c.rgb.map((v) => v / 255) },
    ];
    groups.forEach((g) => {
      blocks.push(aseBlock(0xc001, g.name));
      PALETTE.forEach((key) => {
        const c = COLORS[key];
        blocks.push(aseBlock(0x0001, "Profertil " + c.name, aseColor(g.model, g.values(c))));
      });
      blocks.push(aseBlock(0xc002));
    });
    const head = new DataView(new ArrayBuffer(12));
    "ASEF".split("").forEach((ch, i) => head.setUint8(i, ch.charCodeAt(0)));
    head.setUint16(4, 1);
    head.setUint16(6, 0);
    head.setUint32(8, blocks.length);
    return new Blob([head.buffer, ...blocks], { type: "application/octet-stream" });
  }

  function triggerDownload(blob, filename) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  // ---------- Events ----------
  viewsNav.addEventListener("click", (e) => {
    const btn = e.target.closest(".cat-item");
    if (!btn || btn.dataset.view === state.view) return;
    state.view = btn.dataset.view;
    history.replaceState(null, "", "#" + VIEWS.find((v) => v.slug === state.view).hash);
    renderViews();
    showView();
    window.scrollTo({ top: 0 });
  });

  formatPills.addEventListener("click", (e) => {
    const btn = e.target.closest(".pill");
    if (!btn) return;
    state.format = btn.dataset.format;
    formatPills.querySelectorAll(".pill").forEach((p) => p.classList.toggle("active", p === btn));
    if (state.view === "paleta") syncPaletteFormat();
    if (state.view === "combos") {
      legend.querySelectorAll(".legend-item").forEach((it) => {
        it.querySelector(".legend-code").textContent = formatValue(it.dataset.key, state.format);
      });
    }
  });

  paletteGrid.addEventListener("click", (e) => {
    const row = e.target.closest(".code-row");
    if (row) {
      copyColor(row.dataset.key, row.dataset.format, row);
      const ic = row.querySelector(".code-ic");
      if (ic) {
        ic.outerHTML = ICON_CHECK;
        setTimeout(() => { const now = row.querySelector(".code-ic"); if (now) now.outerHTML = ICON_COPY; }, 1100);
      }
      return;
    }
    const swatch = e.target.closest(".swatch");
    if (swatch) copyColor(swatch.dataset.key, state.format, swatch);
  });

  levelPills.addEventListener("click", (e) => {
    const btn = e.target.closest(".pill");
    if (!btn || btn.dataset.level === state.level) return;
    state.level = btn.dataset.level;
    state.combo = 0;
    renderCombos(false);
  });

  comboChips.addEventListener("click", (e) => {
    const btn = e.target.closest(".combo-chip");
    if (!btn) return;
    state.combo = Number(btn.dataset.combo);
    comboChips.querySelectorAll(".combo-chip").forEach((c) => c.classList.toggle("active", c === btn));
    renderLegend();
    paintStage(false);
  });

  stage.addEventListener("click", (e) => {
    const slice = e.target.closest(".slice");
    if (slice && slice.dataset.key) copyColor(slice.dataset.key, state.format);
  });

  legend.addEventListener("click", (e) => {
    const item = e.target.closest(".legend-item");
    if (item) copyColor(item.dataset.key, state.format, item);
  });

  marfilToggle.addEventListener("click", () => {
    state.marfil = !state.marfil;
    marfilToggle.setAttribute("aria-checked", String(state.marfil));
    stage.classList.toggle("on-marfil", state.marfil);
  });

  $("#copyCombo").addEventListener("click", () => {
    const combo = currentCombo();
    const pct = percents(combo.parts);
    const lines = combo.colors.map((k, i) => `${COLORS[k].name} ${pct[i]}%: ${formatValue(k, state.format)}`);
    if (state.marfil) lines.push(`Fondo Marfil: ${formatValue("marfil", state.format)}`);
    copyText(lines.join("\n"));
    showToast("Copiada · " + comboName(combo));
  });

  textGrid.addEventListener("click", (e) => {
    const card = e.target.closest(".text-card");
    if (!card) return;
    const { bg, fg } = card.dataset;
    const text = `Texto ${getColor(fg).name}: ${formatValue(fg, state.format)}\nFondo ${getColor(bg).name}: ${formatValue(bg, state.format)}`;
    copyText(text);
    showToast(`Copiado · ${getColor(fg).name} sobre ${getColor(bg).name}`, getColor(fg).hex);
    flash(card);
  });

  $("#downloadAse").addEventListener("click", () => {
    triggerDownload(buildAse(), "profertil-paleta.ase");
    showToast("Descargando profertil-paleta.ase");
  });

  // ---------- Init ----------
  // Permite linkear directo a una vista: #paleta, #combinaciones, #texto.
  const linked = VIEWS.find((v) => v.hash === location.hash.slice(1));
  if (linked) state.view = linked.slug;
  renderViews();
  showView();
})();
