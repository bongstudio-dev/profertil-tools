/* Profertil Type Browser — vanilla JS */
(function () {
  "use strict";

  // Manual de Marca v1.1.4, sección 04 (Tipografía).
  const FAMILIES = [
    {
      name: "Familjen Grotesk",
      cls: "ff-title",
      role: "Principal · Títulos",
      meta: "Familjen STHLM<br>Open source (OFL)",
      desc: "Para títulos y elementos de impacto visual. Las ink traps le dan personalidad en tamaños grandes y claridad en los chicos: profesionalismo sin frialdad, modernidad sin perder cercanía.",
      sample: "Vida para nuestra tierra",
      weights: [["Regular", 400], ["Medium", 500], ["SemiBold", 600], ["Bold", 700]],
      zip: "archivos/Profertil_Tipografia_Familjen_Grotesk.zip",
      google: "https://fonts.google.com/specimen/Familjen+Grotesk",
    },
    {
      name: "DM Sans",
      cls: "ff-text",
      role: "Secundaria · Textos",
      meta: "Colophon Foundry<br>Open source (OFL)",
      desc: "Para párrafos, descripciones y textos extensos. Formas abiertas y bajo contraste, pensada para leerse bien en pantalla y en papel sin competir con los títulos.",
      sample: "Producimos de manera eficiente, segura y responsable.",
      weights: [["Light", 300], ["Regular", 400], ["Medium", 500], ["SemiBold", 600], ["Bold", 700]],
      zip: "archivos/Profertil_Tipografia_DM_Sans.zip",
      google: "https://fonts.google.com/specimen/DM+Sans",
    },
  ];

  const GLYPHS = "AaBbCcDdEeFfGgHhIiJjKkLlMmNnÑñOoPpQqRrSsTtUuVvWwXxYyZz 0123456789 ¡!¿?@#$%&*()";

  const LEVELS = [
    { tag: "H1", name: "Titular principal", font: "Familjen Grotesk SemiBold", size: "48-60 pt", use: "Para títulos de máximo impacto.", cls: "ff-title", w: 600, px: 54, lh: 1.02, sample: "Vida para nuestra tierra" },
    { tag: "H2", name: "Subtítulo", font: "Familjen Grotesk Medium", size: "36-42 pt", use: "Para separar secciones principales.", cls: "ff-title", w: 500, px: 38, lh: 1.05, sample: "Transformamos energía en alimentos" },
    { tag: "H3", name: "Encabezado de sección", font: "Familjen Grotesk Regular", size: "24-28 pt", use: "Para organizar contenido interno.", cls: "ff-title", w: 400, px: 26, lh: 1.1, sample: "Con innovación, ciencia y compromiso" },
    { tag: "Body", name: "Cuerpo de texto", font: "DM Sans Regular", size: "14-16 pt", use: "Para párrafos y descripciones.", cls: "ff-text", w: 400, px: 16, lh: 1.4, sample: "Producimos de manera eficiente, segura y responsable. Impulsamos mejoras continuas en nuestros procesos, con foco en la transición energética y el uso racional de los recursos." },
    { tag: "Caption", name: "Texto secundario", font: "DM Sans Light", size: "11-12 pt", use: "Para notas, referencias y datos complementarios.", cls: "ff-text", w: 300, px: 12, lh: 1.4, sample: "Más información en profertil.com.ar" },
  ];

  const VIEWS = [
    { slug: "familias", label: "Familias", count: FAMILIES.length, unit: ["familia", "familias"] },
    { slug: "jerarquia", label: "Jerarquía", count: LEVELS.length, unit: ["nivel", "niveles"] },
    { slug: "lineamientos", label: "Lineamientos", count: 4, unit: ["pauta", "pautas"] },
  ];

  const state = { view: "familias", text: "" };

  // ---------- DOM ----------
  const $ = (sel) => document.querySelector(sel);
  const viewsNav = $("#views");
  const tester = $("#tester");
  const esc = (s) => s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const sampleOf = (fallback) => esc(state.text.trim() || fallback);

  // ---------- Render ----------
  function renderViews() {
    viewsNav.innerHTML = VIEWS.map((v) => `
      <button class="cat-item${v.slug === state.view ? " active" : ""}" data-view="${v.slug}">
        <span>${v.label}</span>
        <span class="cat-count">${v.count}</span>
      </button>`).join("");
  }

  function renderFamilies() {
    $("#families").innerHTML = FAMILIES.map((f, i) => `
      <article class="family" style="animation-delay:${80 + i * 80}ms">
        <div class="family-head">
          <div>
            <span class="family-role">${f.role}</span>
            <h2 class="family-name ${f.cls}">${f.name}</h2>
          </div>
          <span class="family-meta">${f.meta}</span>
        </div>
        <div class="family-aa ${f.cls}" style="font-weight:${f.weights[f.weights.length - 1][1]}">Aa</div>
        <p class="family-sample ${f.cls}" data-fallback="${esc(f.sample)}">${sampleOf(f.sample)}</p>
        <div class="family-glyphs ${f.cls}">${GLYPHS}</div>
        <div class="weights">${f.weights.map(([n, w]) => `<div class="weight"><span class="${f.cls}" style="font-weight:${w}">${n}</span><small>${w}</small></div>`).join("")}</div>
        <p class="family-desc">${f.desc}</p>
        <div class="family-actions">
          <a class="btn btn-green" href="${f.zip}" download>Descargar (.zip)</a>
          <a class="export-secondary" href="${f.google}" target="_blank" rel="noopener">Google Fonts</a>
        </div>
      </article>`).join("");
  }

  function renderLevels() {
    $("#levels").innerHTML = LEVELS.map((l, i) => `
      <button class="level" data-i="${i}" style="animation-delay:${80 + i * 60}ms">
        <span class="level-spec">
          <span class="level-tag">${l.tag}</span>
          <strong>${l.name}</strong>
          <small>${l.font} · ${l.size}<br>${l.use}</small>
        </span>
        <span class="level-sample ${l.cls}" data-fallback="${esc(l.sample)}" style="font-weight:${l.w};font-size:${l.px}px;line-height:${l.lh}">${sampleOf(l.sample)}</span>
      </button>`).join("");
  }

  function renderGuides() {
    const guides = [
      { t: "Interlineado", p: "Títulos al 95-110%. Cuerpo de texto al 130-145%.",
        demo: `<div class="ff-title guide-big" style="line-height:1.02">Nutrimos la tierra</div><div class="ff-text" style="line-height:1.4;margin-top:12px">Producimos de manera eficiente, segura y responsable, con foco en la transición energética.</div>` },
      { t: "Largo de línea", p: "Entre 50 y 75 caracteres por línea para que la lectura sea cómoda.",
        demo: `<div class="ff-text" style="max-width:60ch;line-height:1.4">Impulsamos mejoras continuas en nuestros procesos, con foco en la transición energética y el uso racional de los recursos.</div>` },
      { t: "Alineación", p: "A la izquierda. El justificado solo en documentos formales extensos.",
        demo: `<div class="ff-text" style="line-height:1.4">Acompañamos los desafíos globales del cambio climático y la descarbonización de la industria.</div>` },
      { t: "Alternativas de sistema", p: "Si no están instaladas: Arial Bold para titulares y Segoe UI Regular para texto. Son solo de emergencia.",
        demo: `<div style="font-family:Arial,Helvetica,sans-serif;font-weight:700;font-size:1.6rem;line-height:1.05">Vida para nuestra tierra</div><div style="font-family:'Segoe UI',system-ui,sans-serif;line-height:1.4;margin-top:10px">Impulsamos mejoras continuas en nuestros procesos.</div>` },
    ];
    $("#guides").innerHTML = guides.map((g, i) => `
      <article class="guide" style="animation-delay:${80 + i * 60}ms">
        <h3>${g.t}</h3><p>${g.p}</p><div class="guide-demo">${g.demo}</div>
      </article>`).join("");
  }

  function showView() {
    const v = VIEWS.find((x) => x.slug === state.view);
    $("#currentView").textContent = v.label;
    $("#countChip").textContent = `${v.count} ${v.unit[v.count === 1 ? 0 : 1]}`;
    document.querySelectorAll(".view").forEach((s) => { s.hidden = s.dataset.view !== state.view; });
    if (state.view === "familias") renderFamilies();
    if (state.view === "jerarquia") renderLevels();
    if (state.view === "lineamientos") renderGuides();
  }

  // El texto de prueba se aplica sin volver a dibujar todo (las tarjetas no se reaniman).
  function applyTester() {
    document.querySelectorAll("[data-fallback]").forEach((el) => {
      el.textContent = state.text.trim() || el.dataset.fallback.replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"');
    });
  }

  // ---------- Copiar ----------
  const toast = $("#toast");
  let toastTimer = null;
  function showToast(msg) {
    clearTimeout(toastTimer);
    toast.classList.remove("is-leaving");
    $("#toastText").textContent = msg;
    toast.hidden = false;
    toast.style.animation = "none";
    void toast.offsetWidth;
    toast.style.animation = "";
    toastTimer = setTimeout(() => {
      toast.classList.add("is-leaving");
      toastTimer = setTimeout(() => { toast.hidden = true; }, 260);
    }, 1800);
  }
  function copyText(text) {
    if (navigator.clipboard && window.isSecureContext) return navigator.clipboard.writeText(text).catch(() => {});
    const ta = document.createElement("textarea");
    ta.value = text; ta.style.position = "fixed"; ta.style.opacity = "0";
    document.body.appendChild(ta); ta.select();
    try { document.execCommand("copy"); } catch (e) { /* sin portapapeles */ }
    ta.remove();
    return Promise.resolve();
  }

  // ---------- Events ----------
  viewsNav.addEventListener("click", (e) => {
    const btn = e.target.closest(".cat-item");
    if (!btn || btn.dataset.view === state.view) return;
    state.view = btn.dataset.view;
    history.replaceState(null, "", "#" + state.view);
    renderViews();
    showView();
    window.scrollTo({ top: 0 });
  });

  tester.addEventListener("input", () => {
    state.text = tester.value;
    applyTester();
  });

  $("#levels").addEventListener("click", (e) => {
    const btn = e.target.closest(".level");
    if (!btn) return;
    const l = LEVELS[Number(btn.dataset.i)];
    copyText(`${l.tag} ${l.name}: ${l.font}, ${l.size}`);
    showToast(`Copiado · ${l.tag} ${l.font}, ${l.size}`);
    btn.classList.add("is-copied");
    setTimeout(() => btn.classList.remove("is-copied"), 1100);
  });

  // ---------- Init ----------
  const linked = VIEWS.find((v) => v.slug === location.hash.slice(1));
  if (linked) state.view = linked.slug;
  renderViews();
  showView();
})();
