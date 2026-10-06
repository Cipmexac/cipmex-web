/* CIPMEX — catálogo de columnas.
   Lee un archivo JSON por medio (data/columnas-sol.json, data/columnas-nmas.json)
   y los junta en una sola lista, así que cada página que lista columnas
   (inicio, publicaciones/columnas, las páginas de medio y de tema, y la
   semblanza de cada autor/a) sigue funcionando igual. Agregar una columna
   nueva = agregar una entrada al archivo de su medio; ninguna página necesita
   tocarse a mano.

   Para sumar un medio nuevo (por ejemplo El Universal): crear su archivo
   data/columnas-<medio>.json, agregarlo a ARCHIVOS_DE_COLUMNAS aquí abajo y
   registrar su logo en LOGOS_POR_MEDIO. Eso se hace una sola vez.

   `base` es la ruta relativa desde la página actual hasta la raíz del
   sitio: "" en la raíz, "../" dentro de /equipo/ o /publicaciones/,
   "../../" dentro de /publicaciones/temas/ o /publicaciones/columnas/. */
(function (global) {
  var MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio',
    'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];

  /* Logo por medio: con poner el nombre del medio en el JSON alcanza,
     no hace falta escribir la ruta del logo cada vez. Si se agrega un medio
     nuevo, se agrega su logo aquí una sola vez y ya queda disponible para
     siempre. c.medioLogo en el JSON sigue funcionando como excepción manual
     si algún día hace falta. */
  var LOGOS_POR_MEDIO = {
    'El Sol de México': 'img/logo-sol-de-mexico.jpg',
    'El Universal': 'img/logo-el-universal.jpg',
    'N+ Opinión': 'img/logo-nmas.jpg'
  };
  function logoDeMedio(c) {
    return c.medioLogo || LOGOS_POR_MEDIO[c.medio] || null;
  }

  function formatMes(fechaISO) {
    var partes = fechaISO.split('-');
    var mes = MESES[parseInt(partes[1], 10) - 1];
    return mes + ', ' + partes[0];
  }

  /* Un archivo por medio. Si alguno falta o falla, los demás se siguen
     mostrando con normalidad. */
  var ARCHIVOS_DE_COLUMNAS = [
    'data/columnas-sol.json',
    'data/columnas-nmas.json'
  ];

  function cargar(base, callback) {
    var pendientes = ARCHIVOS_DE_COLUMNAS.length;
    var todas = [];
    ARCHIVOS_DE_COLUMNAS.forEach(function (archivo) {
      fetch(base + archivo)
        .then(function (r) {
          if (!r.ok) throw new Error(archivo);
          return r.json();
        })
        .then(function (data) { todas = todas.concat(data); })
        .catch(function () { /* este archivo no se pudo leer: se omite */ })
        .then(function () {
          pendientes--;
          if (pendientes) return;
          todas.sort(function (a, b) { return a.fecha < b.fecha ? 1 : -1; });
          callback(todas);
        });
    });
  }

  function porMedio(data, medio) {
    return data.filter(function (c) { return c.medio === medio; });
  }
  function porAutor(data, autorSlug) {
    return data.filter(function (c) { return c.autorSlug === autorSlug; });
  }
  function porTema(data, temaSlug) {
    return data.filter(function (c) {
      if (Array.isArray(c.temaSlug)) return c.temaSlug.indexOf(temaSlug) !== -1;
      return c.temaSlug === temaSlug;
    });
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
      var logo = logoDeMedio(c);
      var medioCirculo = logo ?
        '<span class="pub-medio-circulo" title="' + c.medio + '"><img src="' + base + logo + '" alt="' + c.medio + '"></span>' : '';
      var tiempo = c.tiempoLectura ? (' · ' + c.tiempoLectura) : '';
      return '' +
        '<a href="' + base + c.link + '" class="pub-card">' +
        '<div class="pub-foto">' +
        '<img src="' + base + c.portada + '" alt="' + c.titulo + '">' +
        '<span class="pub-tag">Columna</span>' +
        medioCirculo +
        '</div>' +
        '<div class="pub-contenido">' +
        '<h3>' + c.titulo + '</h3>' +
        '<p class="pub-resumen">' + c.resumen + '</p>' +
        '<div class="pub-meta">' +
        '<span>' + c.autor + ' · ' + formatMes(c.fecha) + tiempo + '</span>' +
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
      var tiempo = c.tiempoLectura ? (' · ' + c.tiempoLectura) : '';
      return '' +
        '<a href="' + base + c.link + '" class="recientes-card">' +
        '<div class="recientes-card-foto">' +
        '<img src="' + base + c.portada + '" alt="' + c.titulo + '">' +
        '<span class="recientes-card-medio">' + c.medio.toUpperCase() + '</span>' +
        '</div>' +
        '<div class="recientes-card-cuerpo">' +
        '<h4>' + c.titulo + '</h4>' +
        '<p class="recientes-card-fecha">' + formatMes(c.fecha) + tiempo + '</p>' +
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
