/* Analytics del kit (GA4, propiedad "Kits de marca", cuenta Bong Studio).
   Mide desde afuera, sin tocar el código de cada módulo:
   - page_view de cada módulo (lo manda GA solo)
   - descarga: todo link con atributo download, también los que arman los scripts (blob)
   - copia: todo lo que pasa por el portapapeles (códigos de color, especificaciones)
   - busqueda: lo que se escribe en un buscador (íconos, formas), cuando se deja de tipear
   - vista: cambio de #ancla (paleta, combinaciones, texto, familias...)
   Cada evento lleva marca y modulo. Solo mide en bongstudio.ar: en local y en las
   previews de Cloudflare no manda nada. */
(function () {
  var ID = "G-D9VR4GS5WZ";
  var MARCA = "profertil";
  if (!/(^|\.)bongstudio\.ar$/.test(location.hostname)) return;

  var modulo = (document.body && document.body.dataset.tool) || "portada";
  window.dataLayer = window.dataLayer || [];
  function gtag() { window.dataLayer.push(arguments); }
  window.gtag = window.gtag || gtag;
  var s = document.createElement("script");
  s.async = true;
  s.src = "https://www.googletagmanager.com/gtag/js?id=" + ID;
  document.head.appendChild(s);
  gtag("js", new Date());
  gtag("config", ID, { marca: MARCA, modulo: modulo });

  function evento(nombre, datos) {
    datos.marca = MARCA;
    datos.modulo = modulo;
    gtag("event", nombre, datos);
  }

  // Descargas
  var contadas = new WeakSet();
  function descarga(a) {
    if (contadas.has(a)) return;
    contadas.add(a);
    var archivo = a.getAttribute("download") || decodeURIComponent((a.getAttribute("href") || "").split("/").pop());
    var punto = archivo.lastIndexOf(".");
    evento("descarga", { archivo: archivo.slice(0, 100), formato: punto > 0 ? archivo.slice(punto + 1).toLowerCase() : "" });
  }
  document.addEventListener("click", function (e) {
    var a = e.target.closest && e.target.closest("a[download]");
    if (a) descarga(a);
  }, true);
  var click = HTMLAnchorElement.prototype.click;
  HTMLAnchorElement.prototype.click = function () {
    if (this.hasAttribute("download") && !this.isConnected) descarga(this);
    return click.apply(this, arguments);
  };

  // Copias (una sola vez aunque el módulo use el método de respaldo)
  var ultima = 0;
  function copia(texto) {
    if (Date.now() - ultima < 800) return;
    ultima = Date.now();
    evento("copia", { valor: String(texto).replace(/\s+/g, " ").trim().slice(0, 100) });
  }
  if (navigator.clipboard && navigator.clipboard.writeText) {
    var writeText = navigator.clipboard.writeText.bind(navigator.clipboard);
    navigator.clipboard.writeText = function (texto) { copia(texto); return writeText(texto); };
  }
  var execCommand = document.execCommand.bind(document);
  document.execCommand = function (cmd) {
    if (String(cmd).toLowerCase() === "copy") copia(String(window.getSelection() || (document.activeElement && document.activeElement.value) || ""));
    return execCommand.apply(document, arguments);
  };

  // Búsquedas
  var espera;
  document.addEventListener("input", function (e) {
    if (!e.target.matches || !e.target.matches("input[type=search]")) return;
    clearTimeout(espera);
    var termino = e.target.value.trim().toLowerCase();
    if (termino.length < 2) return;
    espera = setTimeout(function () { evento("busqueda", { termino: termino.slice(0, 100) }); }, 1500);
  });

  // Vistas dentro de un módulo
  window.addEventListener("hashchange", function () {
    if (location.hash.length > 1) evento("vista", { vista: location.hash.slice(1, 60) });
  });
})();
