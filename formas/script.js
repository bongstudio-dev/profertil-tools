/* Profertil Shape Browser — vanilla JS */
(function () {
  "use strict";

  const SHAPES = window.SHAPE_DATA || [];

  // Paleta del Manual de Marca v1.1.4 (sección 03.02.03). "file" es como se
  // nombra el color en los entregables oficiales.
  const COLORS = {
    azul: { name: "Azul", file: "Azul", hex: "#003DA5" },
    celeste: { name: "Celeste", file: "Celeste", hex: "#4086FF" },
    verde: { name: "Verde", file: "Verde", hex: "#2D8035" },
    verdeClaro: { name: "Verde Claro", file: "VerdeClaro", hex: "#5EB53A" },
    amarillo: { name: "Amarillo", file: "Amarillo", hex: "#EABA2C" },
    naranja: { name: "Naranja", file: "Naranja", hex: "#E57F19" },
    terra: { name: "Terra", file: "Terra", hex: "#8A4818" },
  };
  const SOLID = ["azul", "celeste", "verde", "verdeClaro", "amarillo", "naranja", "terra"];

  // Con fondo solo se ofrecen las combinaciones que ya usa el sistema: salen de
  // los 18 badges oficiales, no se inventa ninguna.
  const ORDER = ["azul", "celeste", "verde", "verdeClaro", "amarillo", "naranja", "terra"];
  const COMBOS = [];
  SHAPES.forEach((s) => {
    if (!COMBOS.some((c) => c.bg === s.badgeBg && c.fg === s.badgeFg)) COMBOS.push({ bg: s.badgeBg, fg: s.badgeFg });
  });
  COMBOS.sort((a, b) => ORDER.indexOf(a.bg) - ORDER.indexOf(b.bg) || ORDER.indexOf(a.fg) - ORDER.indexOf(b.fg));

  const BADGE = { size: 452, rect: 451.941, rx: 146.375 };

  const state = {
    mode: "sin", // "sin" | "con"
    query: "",
    color: "azul", // sin fondo
    combo: "original", // con fondo: "original" o índice de COMBOS
  };

  // ---------- DOM ----------
  const $ = (sel) => document.querySelector(sel);
  const grid = $("#grid");
  const empty = $("#empty");
  const searchInput = $("#search");
  const modePills = $("#modePills");
  const currentMode = $("#currentMode");
  const countChip = $("#countChip");
  const swatches = $("#swatches");
  const pickerLabel = $("#pickerLabel");
  const pickerValue = $("#pickerValue");
  const exportAllBtn = $("#exportAll");

  // ---------- Helpers ----------
  function filteredShapes() {
    const q = state.query.trim().toLowerCase();
    return SHAPES.filter((s) => !q || s.name.toLowerCase().includes(q) || s.id.includes(q));
  }

  // Qué colores le tocan a una forma según la elección: { fg, bg } (bg solo con fondo).
  function resolve(shape, choice) {
    if (choice.mode === "sin") return { fg: choice.color, bg: null };
    if (choice.combo === "original") return { fg: shape.badgeFg, bg: shape.badgeBg };
    return COMBOS[choice.combo];
  }

  function choiceLabel(choice) {
    if (choice.mode === "sin") return COLORS[choice.color].name;
    if (choice.combo === "original") return "Original del sistema";
    const c = COMBOS[choice.combo];
    return `${COLORS[c.fg].name} sobre ${COLORS[c.bg].name}`;
  }

  // SVG para mostrar: los colores entran por CSS (color y --badge-bg).
  function displaySvg(shape, mode) {
    if (mode === "con") {
      return `<svg viewBox="0 0 ${BADGE.size} ${BADGE.size}" fill="none" aria-hidden="true"><rect class="badge-bg" width="${BADGE.rect}" height="${BADGE.rect}" rx="${BADGE.rx}"/>${shape.badgePaths}</svg>`;
    }
    return `<svg viewBox="0 0 ${shape.w} ${shape.h}" fill="none" aria-hidden="true">${shape.paths}</svg>`;
  }

  // SVG para exportar: colores escritos en el archivo, misma geometría que los entregables.
  function exportSvgString(shape, choice) {
    const { fg, bg } = resolve(shape, choice);
    const fill = (str) => str.replace(/currentColor/g, COLORS[fg].hex);
    if (bg) {
      return `<svg width="${BADGE.size}" height="${BADGE.size}" viewBox="0 0 ${BADGE.size} ${BADGE.size}" fill="none" xmlns="http://www.w3.org/2000/svg">\n<rect width="${BADGE.rect}" height="${BADGE.rect}" rx="${BADGE.rx}" fill="${COLORS[bg].hex}"/>\n${fill(shape.badgePaths)}\n</svg>\n`;
    }
    return `<svg width="${shape.w}" height="${shape.h}" viewBox="0 0 ${shape.w} ${shape.h}" fill="none" xmlns="http://www.w3.org/2000/svg">\n${fill(shape.paths)}\n</svg>\n`;
  }

  // Mismos nombres que los entregables: Profertil_Forma_Barras_Azul / _Fondo_Naranja.
  function fileBase(shape, choice) {
    const { fg, bg } = resolve(shape, choice);
    if (!bg) return `Profertil_Forma_${shape.file}_${COLORS[fg].file}`;
    if (choice.combo === "original") return `Profertil_Forma_${shape.file}_Fondo_${COLORS[bg].file}`;
    return `Profertil_Forma_${shape.file}_Fondo_${COLORS[bg].file}_${COLORS[fg].file}`;
  }

  function paint(el, shape, choice) {
    const { fg, bg } = resolve(shape, choice);
    el.style.color = COLORS[fg].hex;
    if (bg) el.style.setProperty("--badge-bg", COLORS[bg].hex);
  }

  // ---------- Render: selector de color ----------
  function renderSwatches(container, choice) {
    if (choice.mode === "sin") {
      container.innerHTML = SOLID.map((key) => `
        <button class="sw${choice.color === key ? " active" : ""}" data-color="${key}" style="background:${COLORS[key].hex}" title="${COLORS[key].name}" aria-label="${COLORS[key].name}"></button>`).join("");
      return;
    }
    container.innerHTML = `
        <button class="sw sw-original${choice.combo === "original" ? " active" : ""}" data-combo="original" title="Cada forma con los colores con los que la entrega el sistema">Original</button>` +
      COMBOS.map((c, i) => `
        <button class="sw${choice.combo === i ? " active" : ""}" data-combo="${i}" style="background:${COLORS[c.bg].hex}" title="${COLORS[c.fg].name} sobre ${COLORS[c.bg].name}" aria-label="${COLORS[c.fg].name} sobre ${COLORS[c.bg].name}"><i style="background:${COLORS[c.fg].hex}"></i></button>`).join("");
  }

  function readSwatch(btn, choice) {
    if (btn.dataset.color) choice.color = btn.dataset.color;
    if (btn.dataset.combo) choice.combo = btn.dataset.combo === "original" ? "original" : Number(btn.dataset.combo);
  }

  function renderPicker() {
    pickerLabel.textContent = state.mode === "sin" ? "Color" : "Combinación";
    pickerValue.textContent = choiceLabel(state);
    renderSwatches(swatches, state);
  }

  // ---------- Render: grid ----------
  function renderGrid() {
    const shapes = filteredShapes();
    currentMode.textContent = state.mode === "sin" ? "Sin fondo" : "Con fondo";
    countChip.textContent = `${shapes.length} forma${shapes.length === 1 ? "" : "s"}`;

    if (!shapes.length) {
      grid.innerHTML = "";
      empty.hidden = false;
      return;
    }
    empty.hidden = true;

    const delays = [80, 160, 230, 300];
    grid.innerHTML = shapes.map((s, i) => `
      <div class="card" data-id="${s.id}" style="animation-delay:${delays[Math.min(i, delays.length - 1)] + (i > 3 ? (i - 3) * 18 : 0)}ms">
        <div class="thumb${state.mode === "con" ? " is-badge" : ""}">${displaySvg(s, state.mode)}</div>
        <div class="card-name" title="${s.name}">${s.name}</div>
      </div>`).join("");
    applyColorToVisible();
  }

  // Cambiar de color no vuelve a animar las tarjetas: solo las repinta.
  function applyColorToVisible() {
    grid.querySelectorAll(".card").forEach((card) => {
      const shape = SHAPES.find((s) => s.id === card.dataset.id);
      paint(card.querySelector(".thumb"), shape, state);
    });
  }

  // ---------- Modal ----------
  const modal = $("#modal");
  const modalPreview = $("#modalPreview");
  const modalName = $("#modalName");
  const modalMode = $("#modalMode");
  const modalSwatches = $("#modalSwatches");
  const modalValue = $("#modalValue");
  let modalShape = null;
  let modalChoice = null;

  function renderModal() {
    modalPreview.className = "modal-preview" + (modalChoice.mode === "con" ? " is-badge" : "");
    modalPreview.innerHTML = displaySvg(modalShape, modalChoice.mode);
    paint(modalPreview, modalShape, modalChoice);
    modalMode.textContent = modalChoice.mode === "sin" ? "Sin fondo" : "Con fondo";
    modalValue.textContent = choiceLabel(modalChoice);
    renderSwatches(modalSwatches, modalChoice);
  }

  function openModal(shape) {
    modalShape = shape;
    modalChoice = { mode: state.mode, color: state.color, combo: state.combo };
    modalName.textContent = shape.name;
    renderModal();
    modal.hidden = false;
    document.body.style.overflow = "hidden";
  }
  function closeModal() {
    modal.hidden = true;
    modalShape = null;
    document.body.style.overflow = "";
  }

  // ---------- Downloads ----------
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

  function exportSvg(shape, choice) {
    const blob = new Blob([exportSvgString(shape, choice)], { type: "image/svg+xml;charset=utf-8" });
    triggerDownload(blob, fileBase(shape, choice) + ".svg");
  }

  // PNG con transparencia: 1024 px en el lado más largo.
  function svgToPng(shape, choice, size) {
    return new Promise((resolvePng, reject) => {
      const withBg = !!resolve(shape, choice).bg;
      const w = withBg ? BADGE.size : shape.w;
      const h = withBg ? BADGE.size : shape.h;
      const scale = size / Math.max(w, h);
      const blob = new Blob([exportSvgString(shape, choice)], { type: "image/svg+xml;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = Math.round(w * scale);
        canvas.height = Math.round(h * scale);
        canvas.getContext("2d").drawImage(img, 0, 0, canvas.width, canvas.height);
        URL.revokeObjectURL(url);
        canvas.toBlob((b) => (b ? resolvePng(b) : reject(new Error("toBlob failed"))), "image/png");
      };
      img.onerror = () => { URL.revokeObjectURL(url); reject(new Error("img load failed")); };
      img.src = url;
    });
  }

  async function exportPng(shape, choice) {
    try {
      const blob = await svgToPng(shape, choice, 1024);
      triggerDownload(blob, fileBase(shape, choice) + ".png");
    } catch (e) {
      alert("No se pudo generar el PNG: " + e.message);
    }
  }

  async function exportZip() {
    if (typeof JSZip === "undefined") { alert("JSZip no está disponible (revisá tu conexión)."); return; }
    const shapes = filteredShapes();
    if (!shapes.length) return;
    const choice = { mode: state.mode, color: state.color, combo: state.combo };
    const orig = exportAllBtn.innerHTML;
    exportAllBtn.disabled = true;
    exportAllBtn.textContent = "Generando ZIP…";
    try {
      const zip = new JSZip();
      const folderName = choice.mode === "sin"
        ? "Sin fondo - " + COLORS[choice.color].name
        : "Con fondo - " + choiceLabel(choice);
      const folder = zip.folder(folderName);
      shapes.forEach((s) => folder.file(fileBase(s, choice) + ".svg", exportSvgString(s, choice)));
      const blob = await zip.generateAsync({ type: "blob" });
      triggerDownload(blob, `Profertil_Formas_${folderName.replace(/[^A-Za-z0-9]+/g, "_")}.zip`);
    } catch (e) {
      alert("Error al generar el ZIP: " + e.message);
    } finally {
      exportAllBtn.disabled = false;
      exportAllBtn.innerHTML = orig;
    }
  }

  // ---------- Events ----------
  searchInput.addEventListener("input", (e) => {
    state.query = e.target.value;
    renderGrid();
  });

  modePills.addEventListener("click", (e) => {
    const btn = e.target.closest(".pill");
    if (!btn || btn.dataset.mode === state.mode) return;
    state.mode = btn.dataset.mode;
    modePills.querySelectorAll(".pill").forEach((p) => p.classList.toggle("active", p === btn));
    renderPicker();
    renderGrid();
  });

  swatches.addEventListener("click", (e) => {
    const btn = e.target.closest(".sw");
    if (!btn) return;
    readSwatch(btn, state);
    renderPicker();
    applyColorToVisible();
  });

  grid.addEventListener("click", (e) => {
    const card = e.target.closest(".card");
    if (!card) return;
    const shape = SHAPES.find((s) => s.id === card.dataset.id);
    if (shape) openModal(shape);
  });

  modalSwatches.addEventListener("click", (e) => {
    const btn = e.target.closest(".sw");
    if (!btn) return;
    readSwatch(btn, modalChoice);
    renderModal();
  });

  $("#modalClose").addEventListener("click", closeModal);
  modal.addEventListener("click", (e) => { if (e.target === modal) closeModal(); });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape" && !modal.hidden) closeModal(); });

  $("#dlSvg").addEventListener("click", () => modalShape && exportSvg(modalShape, modalChoice));
  $("#dlPng").addEventListener("click", () => modalShape && exportPng(modalShape, modalChoice));
  exportAllBtn.addEventListener("click", exportZip);

  // ---------- Init ----------
  renderPicker();
  renderGrid();
})();
