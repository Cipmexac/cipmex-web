/* CIPMEX — catálogo de columnas.
   Lee data/columnas.json (una entrada por columna publicada) y arma las
   tarjetas en cada página que las lista: inicio, publicaciones/columnas,
   las páginas de medio (Sol/Universal/N+), las de tema, y la semblanza de
   cada autor/a. Agregar una columna nueva = agregar una entrada a ese
   archivo; ninguna página necesita tocarse a mano.

   `base` es la ruta relativa desde la página actual hasta la raíz del
   sitio: "" en la raíz, "../" dentro de /equipo/ o /publicaciones/,
   "../../" dentro de /publicaciones/temas/ o /publicaciones/columnas/. */
(function (global) {
  var MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio',
    'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];

  function formatMes(fechaISO) {
    var partes = fechaISO.split('-');
    var mes = MESES[parseInt(partes[1], 10) - 1];
    return mes + ', ' + partes[0];
  }

  function cargar(base, callback) {
    fetch(base + 'data/columnas.json')
      .then(function (r) { return r.json(); })
      .then(function (data) {
        data.sort(function (a, b) { return a.fecha < b.fecha ? 1 : -1; });
        callback(data);
      })
      .catch(function () { callback([]); });
  }

  function porMedio(data, medio) {
    return data.filter(function (c) { return c.medio === medio; });
  }
  function porAutor(data, autorSlug) {
    return data.filter(function (c) { return c.autorSlug === autorSlug; });
  }
  function porTema(data, temaSlug) {
    return data.filter(function (c) { return c.temaSlug === temaSlug; });
  }
  function limitar(data, n) {
    return data.slice(0, n);
  }

  function ocultarVacio(vacioSelector) {
    if (!vacioSelector) return;
    var el = document.querySelector(vacioSelector);
    if (el) el.style.display = 'none';
  }
  function mostrarContenedor(el) {
    if (el) el.style.display = '';
  }

  /* Tarjeta estándar (.pub-card): usada en inicio, medio y tema.
     Si no hay resultados: si se pasó vacioSelector, se deja tal cual el
     estado vacío bonito que ya tiene la página (no se toca nada). Si no,
     se muestra un mensaje genérico dentro del propio contenedor. */
  function renderPubCards(containerId, lista, opts) {
    opts = opts || {};
    var base = opts.base || '';
    var el = document.getElementById(containerId);
    if (!el) return;
    if (!lista.length) {
      if (opts.vacioSelector) return;
      el.innerHTML = '<p class="texto-muted" style="grid-column: 1 / -1;">Todavía no hay columnas publicadas aquí. Vuelve pronto.</p>';
      mostrarContenedor(el);
      return;
    }
    ocultarVacio(opts.vacioSelector);
    mostrarContenedor(el);
    el.innerHTML = lista.map(function (c) {
      return '' +
        '<a href="' + base + c.link + '" class="pub-card">' +
        '<div class="pub-foto">' +
        '<img src="' + base + c.portada + '" alt="' + c.titulo + '">' +
        '<span class="pub-tag">Columna</span>' +
        '</div>' +
        '<div class="pub-contenido">' +
        '<h3>' + c.titulo + '</h3>' +
        '<p class="pub-resumen">' + c.resumen + '</p>' +
        '<div class="pub-meta">' +
        '<span>' + c.autor + ' · ' + formatMes(c.fecha) + '</span>' +
        '<span class="pub-leer">Leer →</span>' +
        '</div>' +
        '</div>' +
        '</a>';
    }).join('');
  }

  /* Tarjeta de la franja "Publicaciones más recientes" (.recientes-card) */
  function renderMarquee(containerId, lista, opts) {
    opts = opts || {};
    var base = opts.base || '';
    var el = document.getElementById(containerId);
    if (!el || !lista.length) return;
    el.innerHTML = lista.map(function (c) {
      return '' +
        '<a href="' + base + c.link + '" class="recientes-card">' +
        '<div class="recientes-card-foto">' +
        '<img src="' + base + c.portada + '" alt="' + c.titulo + '">' +
        '<span class="recientes-card-medio">' + c.medio.toUpperCase() + '</span>' +
        '</div>' +
        '<div class="recientes-card-cuerpo">' +
        '<h4>' + c.titulo + '</h4>' +
        '<p class="recientes-card-fecha">' + formatMes(c.fecha) + '</p>' +
        '</div>' +
        '</a>';
    }).join('');
  }

  /* Tarjeta densa de las páginas de semblanza (.card, sin fecha ni tag) */
  function renderSemblanza(containerId, lista, opts) {
    opts = opts || {};
    var base = opts.base || '';
    var el = document.getElementById(containerId);
    if (!el) return;
    if (!lista.length) {
      el.innerHTML = '<p class="texto-muted" style="grid-column: 1 / -1;">Todavía no hay publicaciones registradas de esta persona en el catálogo.</p>';
      return;
    }
    el.innerHTML = lista.map(function (c) {
      return '' +
        '<a href="' + base + c.link + '" class="card" style="text-decoration:none; color:inherit;">' +
        '<div class="foto"><img src="' + base + c.portada + '" alt="' + c.titulo + '"></div>' +
        '<div class="contenido">' +
        '<h4>' + c.titulo + '</h4>' +
        '<p class="desc">' + c.resumen + '</p>' +
        '</div>' +
        '</a>';
    }).join('');
  }

  global.CIPMEXColumnas = {
    cargar: cargar,
    porMedio: porMedio,
    porAutor: porAutor,
    porTema: porTema,
    limitar: limitar,
    formatMes: formatMes,
    renderPubCards: renderPubCards,
    renderMarquee: renderMarquee,
    renderSemblanza: renderSemblanza
  };
})(window);
