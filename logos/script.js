/* Profertil Logo Browser — vanilla JS */
(function () {
  "use strict";

  // Archivos oficiales en archivos/: <file>.svg y <file>.pdf. El PNG se arma en el
  // navegador desde el SVG, a 2048 px de ancho (los PNG de los entregables son de 512).
  // Notas y tamaños mínimos: Manual de Marca v1.1.4, sección 02.
  const GROUPS = [
    { slug: "profertil", label: "Profertil" },
    { slug: "aniversario", label: "25 años" },
  ];

  const LOGOS = [
    { group: "profertil", name: "Principal", variant: "Color", file: "Profertil_Logo_Principal_Color",
      note: "La versión principal: usala siempre que sea posible, sobre fondos blancos, claros o neutros.", min: "Mínimo 28,5 px / 1 cm de ancho." },
    { group: "profertil", name: "Con slogan", variant: "Color", file: "Profertil_Logo_Slogan_Color",
      note: "Para contextos institucionales y comunicaciones de alto perfil, cuando hay espacio para el mensaje completo.", min: "Mínimo 56,7 px / 2 cm de ancho." },
    { group: "profertil", name: "Monocromático", variant: "Azul", file: "Profertil_Logo_Monocromatico_Azul",
      note: "Para impresión a una tinta o cuando no se puede reproducir a todo color.", min: "Mínimo 28,5 px / 1 cm de ancho." },
    { group: "profertil", name: "Monocromático", variant: "Blanco", file: "Profertil_Logo_Monocromatico_Blanco", dark: true,
      note: "Negativo: para fondos de color, fondos oscuros y fotos.", min: "Mínimo 28,5 px / 1 cm de ancho." },
    { group: "profertil", name: "Monocromático", variant: "Negro", file: "Profertil_Logo_Monocromatico_Negro",
      note: "Para impresiones en blanco y negro, fotocopias y documentos sin color.", min: "Mínimo 28,5 px / 1 cm de ancho." },
    { group: "profertil", name: "Símbolo", variant: "Color", file: "Profertil_Simbolo_Color", tall: true,
      note: "Solo cuando la marca ya está presente en el contexto: espacios muy reducidos, apps, favicons. No usarlo como primera presentación de la marca.", min: "Mínimo 15,5 px / 0,5 cm de ancho." },

    { group: "aniversario", name: "25 años horizontal", variant: "Color", file: "Profertil_Logo25Aniversario_Horizontal_Color",
      note: "La versión principal del logo aniversario, sobre fondos blancos, claros o neutros." },
    { group: "aniversario", name: "25 años horizontal", variant: "Azul", file: "Profertil_Logo25Aniversario_Horizontal_Monocromatico_Azul",
      note: "A una tinta, cuando no se puede reproducir a todo color." },
    { group: "aniversario", name: "25 años horizontal", variant: "Blanco", file: "Profertil_Logo25Aniversario_Horizontal_Monocromatico_Blanco", dark: true,
      note: "Negativo: para fondos de color, fondos oscuros y fotos." },
    { group: "aniversario", name: "25 años horizontal", variant: "Negro", file: "Profertil_Logo25Aniversario_Horizontal_Monocromatico_Negro",
      note: "Para impresiones en blanco y negro." },
    { group: "aniversario", name: "25 años vertical", variant: "Color", file: "Profertil_Logo25Aniversario_Vertical_Color", tall: true,
      note: "Para formatos verticales o cuadrados, sobre fondos claros." },
    { group: "aniversario", name: "25 años vertical", variant: "Azul", file: "Profertil_Logo25Aniversario_Vertical_Monocromatico_Azul", tall: true,
      note: "A una tinta, cuando no se puede reproducir a todo color." },
    { group: "aniversario", name: "25 años vertical", variant: "Blanco", file: "Profertil_Logo25Aniversario_Vertical_Monocromatico_Blanco", dark: true, tall: true,
      note: "Negativo: para fondos de color, fondos oscuros y fotos." },
    { group: "aniversario", name: "25 años vertical", variant: "Negro", file: "Profertil_Logo25Aniversario_Vertical_Monocromatico_Negro", tall: true,
      note: "Para impresiones en blanco y negro." },
  ];

  const FILES = "archivos/";
  const state = { group: "todos" };

  // ---------- DOM ----------
  const $ = (sel) => document.querySelector(sel);
  const catNav = $("#categories");
  const grid = $("#grid");
  const currentCat = $("#currentCat");
  const countChip = $("#countChip");
  const exportAllBtn = $("#exportAll");

  const filtered = () => LOGOS.filter((l) => state.group === "todos" || l.group === state.group);
  const groupLabel = (slug) => (GROUPS.find((g) => g.slug === slug) || {}).label || "Todos";

  // ---------- Render ----------
  function renderCategories() {
    const items = [{ slug: "todos", label: "Todos", count: LOGOS.length },
      ...GROUPS.map((g) => ({ ...g, count: LOGOS.filter((l) => l.group === g.slug).length }))];
    catNav.innerHTML = items.map((c) => `
      <button class="cat-item${c.slug === state.group ? " active" : ""}" data-group="${c.slug}">
        <span>${c.label}</span>
        <span class="cat-count">${c.count}</span>
      </button>`).join("");
  }

  function card(logo, i) {
    const idx = LOGOS.indexOf(logo);
    return `
      <div class="card logo-card" data-i="${idx}" style="animation-delay:${80 + Math.min(i, 10) * 30}ms">
        <div class="logo-thumb${logo.dark ? " is-dark" : ""}${logo.tall ? " is-tall" : ""}">
          <img src="${FILES}${logo.file}.svg" alt="${logo.name} ${logo.variant}" loading="lazy" />
        </div>
        <div class="logo-caption"><strong>${logo.name}</strong><small>${logo.variant}</small></div>
      </div>`;
  }

  function renderGrid() {
    const logos = filtered();
    currentCat.textContent = groupLabel(state.group);
    countChip.textContent = `${logos.length} logo${logos.length === 1 ? "" : "s"}`;
    let i = 0;
    if (state.group === "todos") {
      grid.innerHTML = GROUPS.map((g) => `<span class="eyebrow group-title">${g.label}</span>` +
        LOGOS.filter((l) => l.group === g.slug).map((l) => card(l, i++)).join("")).join("");
    } else {
      grid.innerHTML = logos.map((l) => card(l, i++)).join("");
    }
  }

  // ---------- Modal ----------
  const modal = $("#modal");
  let current = null;

  function openModal(logo) {
    current = logo;
    $("#modalPreview").className = "modal-logo" + (logo.dark ? " is-dark" : "");
    $("#modalPreview").innerHTML = `<img src="${FILES}${logo.file}.svg" alt="" />`;
    $("#modalGroup").textContent = groupLabel(logo.group);
    $("#modalName").textContent = `${logo.name} · ${logo.variant}`;
    $("#modalNote").textContent = logo.note || "";
    $("#modalMin").textContent = logo.min || "";
    $("#modalMin").hidden = !logo.min;
    modal.hidden = false;
    document.body.style.overflow = "hidden";
  }
  function closeModal() {
    modal.hidden = true;
    current = null;
    document.body.style.overflow = "";
  }

  // ---------- Descargas ----------
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

  async function fetchBlob(path) {
    const res = await fetch(path);
    if (!res.ok) throw new Error(`${res.status} ${path}`);
    return res.blob();
  }

  async function download(logo, ext) {
    try {
      if (ext === "png") {
        triggerDownload(await svgToPng(logo, 2048), `${logo.file}.png`);
      } else {
        triggerDownload(await fetchBlob(`${FILES}${logo.file}.${ext}`), `${logo.file}.${ext}`);
      }
    } catch (e) {
      alert("No se pudo descargar el archivo: " + e.message);
    }
  }

  // PNG con transparencia, 2048 px de ancho y el alto en proporción.
  async function svgToPng(logo, width) {
    const svgText = await (await fetchBlob(`${FILES}${logo.file}.svg`)).text();
    const url = URL.createObjectURL(new Blob([svgText], { type: "image/svg+xml;charset=utf-8" }));
    try {
      const img = new Image();
      img.src = url;
      await img.decode();
      const ratio = (img.naturalHeight || 1) / (img.naturalWidth || 1);
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = Math.round(width * ratio);
      canvas.getContext("2d").drawImage(img, 0, 0, canvas.width, canvas.height);
      return await new Promise((res, rej) => canvas.toBlob((b) => (b ? res(b) : rej(new Error("toBlob"))), "image/png"));
    } finally {
      URL.revokeObjectURL(url);
    }
  }

  async function exportZip() {
    if (typeof JSZip === "undefined") { alert("JSZip no está disponible (revisá tu conexión)."); return; }
    const logos = filtered();
    const orig = exportAllBtn.innerHTML;
    exportAllBtn.disabled = true;
    exportAllBtn.textContent = "Generando ZIP…";
    try {
      const zip = new JSZip();
      for (const logo of logos) {
        const folder = zip.folder(`${groupLabel(logo.group)}/${logo.name} - ${logo.variant}`);
        folder.file(`${logo.file}.svg`, await fetchBlob(`${FILES}${logo.file}.svg`));
        folder.file(`${logo.file}.pdf`, await fetchBlob(`${FILES}${logo.file}.pdf`));
        folder.file(`${logo.file}.png`, await svgToPng(logo, 2048));
      }
      const name = state.group === "todos" ? "Profertil_Logos" : `Profertil_Logos_${groupLabel(state.group).normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^A-Za-z0-9]+/g, "_")}`;
      triggerDownload(await zip.generateAsync({ type: "blob" }), `${name}.zip`);
    } catch (e) {
      alert("Error al generar el ZIP: " + e.message);
    } finally {
      exportAllBtn.disabled = false;
      exportAllBtn.innerHTML = orig;
    }
  }

  // ---------- Events ----------
  catNav.addEventListener("click", (e) => {
    const btn = e.target.closest(".cat-item");
    if (!btn) return;
    state.group = btn.dataset.group;
    renderCategories();
    renderGrid();
  });
  grid.addEventListener("click", (e) => {
    const c = e.target.closest(".logo-card");
    if (c) openModal(LOGOS[Number(c.dataset.i)]);
  });
  $("#modalClose").addEventListener("click", closeModal);
  modal.addEventListener("click", (e) => { if (e.target === modal) closeModal(); });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape" && !modal.hidden) closeModal(); });
  $("#dlSvg").addEventListener("click", () => current && download(current, "svg"));
  $("#dlPdf").addEventListener("click", () => current && download(current, "pdf"));
  $("#dlPng").addEventListener("click", () => current && download(current, "png"));
  exportAllBtn.addEventListener("click", exportZip);

  // ---------- Init ----------
  renderCategories();
  renderGrid();
})();
