/* Profertil Icon Browser — vanilla JS */
(function () {
  "use strict";

  const DATA = window.ICON_DATA || { categories: [], icons: [] };

  const COLORS = {
    original: { hex: "#FFFFFF", label: "Original", suffix: "blanco", needsDarkBg: true },
    azul: { hex: "#003DA5", label: "Azul", suffix: "azul", needsDarkBg: false },
    verde: { hex: "#2D8035", label: "Verde", suffix: "verde", needsDarkBg: false },
  };

  const state = {
    category: "todas",
    query: "",
    color: "azul",
  };

  // ---------- DOM ----------
  const $ = (sel) => document.querySelector(sel);
  const catNav = $("#categories");
  const grid = $("#grid");
  const empty = $("#empty");
  const searchInput = $("#search");
  const colorPills = $("#colorPills");
  const currentCat = $("#currentCat");
  const countChip = $("#countChip");
  const exportAllBtn = $("#exportAll");

  // ---------- Helpers ----------
  function bakeSvg(svgStr, colorKey) {
    return svgStr.replace(/currentColor/g, COLORS[colorKey].hex);
  }

  function slugify(str) {
    return str.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
  }

  function filteredIcons() {
    const q = state.query.trim().toLowerCase();
    return DATA.icons.filter((ic) => {
      const inCat = state.category === "todas" || ic.category === state.category;
      const inQuery = !q || ic.name.toLowerCase().includes(q) ||
        ic.file.toLowerCase().includes(q) || ic.categoryLabel.toLowerCase().includes(q);
      return inCat && inQuery;
    });
  }

  // ---------- Render: categories ----------
  function renderCategories() {
    const total = DATA.icons.length;
    const items = [{ slug: "todas", label: "Todas", count: total }, ...DATA.categories];
    catNav.innerHTML = items.map((c) => `
      <button class="cat-item${c.slug === state.category ? " active" : ""}" data-cat="${c.slug}">
        <span>${c.label}</span>
        <span class="cat-count">${c.count}</span>
      </button>`).join("");
  }

  // ---------- Render: grid ----------
  function renderGrid() {
    const icons = filteredIcons();
    currentCat.textContent =
      state.category === "todas" ? "Todas" :
      (DATA.categories.find((c) => c.slug === state.category) || {}).label || "Todas";
    countChip.textContent = `${icons.length} ícono${icons.length === 1 ? "" : "s"}`;

    if (!icons.length) {
      grid.innerHTML = "";
      empty.hidden = false;
      return;
    }
    empty.hidden = true;

    const thumbClass = "thumb is-" + state.color;
    const delays = [80, 160, 230, 300];
    grid.innerHTML = icons.map((ic, i) => `
      <div class="card" data-id="${ic.id}" style="animation-delay:${delays[Math.min(i, delays.length - 1)] + (i > 3 ? (i - 3) * 18 : 0)}ms">
        <div class="${thumbClass}">${ic.svg}</div>
        <div class="card-name" title="${ic.name}">${ic.name}</div>
      </div>`).join("");
  }

  function applyColorToVisible() {
    document.querySelectorAll(".thumb").forEach((t) => {
      t.className = "thumb is-" + state.color;
    });
  }

  // ---------- Modal ----------
  const modal = $("#modal");
  const modalPreview = $("#modalPreview");
  const modalName = $("#modalName");
  const modalCat = $("#modalCat");
  const modalColorPills = $("#modalColorPills");
  let modalIcon = null;
  let modalColor = "azul";

  function openModal(icon) {
    modalIcon = icon;
    modalColor = state.color;
    modalName.textContent = icon.name;
    modalCat.textContent = icon.categoryLabel;
    syncModalColorPills();
    renderModalPreview();
    modal.hidden = false;
    document.body.style.overflow = "hidden";
  }
  function closeModal() {
    modal.hidden = true;
    modalIcon = null;
    document.body.style.overflow = "";
  }
  function renderModalPreview() {
    modalPreview.className = "modal-preview is-" + modalColor;
    modalPreview.innerHTML = modalIcon.svg;
  }
  function syncModalColorPills() {
    modalColorPills.querySelectorAll(".pill").forEach((p) =>
      p.classList.toggle("active", p.dataset.color === modalColor));
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

  function exportSvg(icon, colorKey) {
    const svg = bakeSvg(icon.svg, colorKey);
    const blob = new Blob([svg], { type: "image/svg+xml;charset=utf-8" });
    triggerDownload(blob, `${slugify(icon.name)}-${COLORS[colorKey].suffix}.svg`);
  }

  function svgToPng(svgStr, colorKey, size) {
    return new Promise((resolve, reject) => {
      const baked = bakeSvg(svgStr, colorKey);
      const blob = new Blob([baked], { type: "image/svg+xml;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = size; canvas.height = size;
        const ctx = canvas.getContext("2d");
        if (COLORS[colorKey].needsDarkBg) {
          ctx.fillStyle = "#003DA5";
          ctx.fillRect(0, 0, size, size);
        }
        const pad = size * 0.18;
        const draw = size - pad * 2;
        ctx.drawImage(img, pad, pad, draw, draw);
        URL.revokeObjectURL(url);
        canvas.toBlob((b) => b ? resolve(b) : reject(new Error("toBlob failed")), "image/png");
      };
      img.onerror = () => { URL.revokeObjectURL(url); reject(new Error("img load failed")); };
      img.src = url;
    });
  }

  async function exportPng(icon, colorKey) {
    try {
      const blob = await svgToPng(icon.svg, colorKey, 512);
      triggerDownload(blob, `${slugify(icon.name)}-${COLORS[colorKey].suffix}.png`);
    } catch (e) {
      alert("No se pudo generar el PNG: " + e.message);
    }
  }

  async function exportZip() {
    if (typeof JSZip === "undefined") { alert("JSZip no está disponible (revisá tu conexión)."); return; }
    const icons = filteredIcons();
    if (!icons.length) return;
    const colorKey = state.color;
    const orig = exportAllBtn.innerHTML;
    exportAllBtn.disabled = true;
    exportAllBtn.textContent = "Generando ZIP…";
    try {
      const zip = new JSZip();
      const folderName = (state.category === "todas" ? "todas" : state.category) + "-" + COLORS[colorKey].suffix;
      const folder = zip.folder(folderName);
      icons.forEach((ic) => folder.file(`${slugify(ic.name)}-${COLORS[colorKey].suffix}.svg`, bakeSvg(ic.svg, colorKey)));
      const blob = await zip.generateAsync({ type: "blob" });
      triggerDownload(blob, `iconos-profertil-${folderName}.zip`);
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
    state.category = btn.dataset.cat;
    renderCategories();
    renderGrid();
  });

  searchInput.addEventListener("input", (e) => {
    state.query = e.target.value;
    renderGrid();
  });

  colorPills.addEventListener("click", (e) => {
    const btn = e.target.closest(".pill");
    if (!btn) return;
    state.color = btn.dataset.color;
    colorPills.querySelectorAll(".pill").forEach((p) => p.classList.toggle("active", p === btn));
    applyColorToVisible();
  });

  grid.addEventListener("click", (e) => {
    const card = e.target.closest(".card");
    if (!card) return;
    const icon = DATA.icons.find((ic) => ic.id === card.dataset.id);
    if (icon) openModal(icon);
  });

  modalColorPills.addEventListener("click", (e) => {
    const btn = e.target.closest(".pill");
    if (!btn) return;
    modalColor = btn.dataset.color;
    syncModalColorPills();
    renderModalPreview();
  });

  $("#modalClose").addEventListener("click", closeModal);
  modal.addEventListener("click", (e) => { if (e.target === modal) closeModal(); });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape" && !modal.hidden) closeModal(); });

  $("#dlSvg").addEventListener("click", () => modalIcon && exportSvg(modalIcon, modalColor));
  $("#dlPng").addEventListener("click", () => modalIcon && exportPng(modalIcon, modalColor));
  exportAllBtn.addEventListener("click", exportZip);

  // ---------- Init ----------
  renderCategories();
  renderGrid();
})();
