/* CIPMEX — catálogo de publicaciones e investigación.
   Lee data/investigaciones.json (una entrada por artículo/reporte) y arma
   las tarjetas en publicaciones/investigacion.html. Agregar una
   investigación nueva = agregar una entrada a ese archivo + su página
   individual; la página de listado no necesita tocarse a mano.

   `base` es la ruta relativa desde la página actual hasta la raíz del
   sitio: "" en la raíz, "../" dentro de /publicaciones/, "../../" dentro
   de /publicaciones/investigacion/. */
(function (global) {

  /* Color de fondo de la tarjeta según el tipo de publicación. Si se
     agrega un tipo nuevo, se agrega aquí una sola vez. */
  var GRADIENTE_POR_TIPO = {
    'Revista de paz': 'linear-gradient(135deg, var(--azul), var(--azul-oscuro))',
    'Reporte propio': 'linear-gradient(135deg, var(--terracota), var(--morado))',
    'Investigación con datos': 'linear-gradient(135deg, var(--verde), var(--azul-claro))'
  };
  function gradienteDeTipo(i) {
    return i.color || GRADIENTE_POR_TIPO[i.tipo] || 'linear-gradient(135deg, var(--gris), var(--azul-oscuro))';
  }

  function cargar(base, callback) {
    fetch(base + 'data/investigaciones.json')
      .then(function (r) { return r.json(); })
      .then(function (data) {
        data.sort(function (a, b) { return (b.anio || 0) - (a.anio || 0); });
        callback(data);
      })
      .catch(function () { callback([]); });
  }

  function limitar(data, n) {
    return data.slice(0, n);
  }

  function porAutor(data, autorSlug) {
    return data.filter(function (i) { return i.autorSlug === autorSlug; });
  }

  /* Tarjeta de la página de listado (#pubInvestigacionGrid) */
  function renderPubCards(containerId, lista, opts) {
    opts = opts || {};
    var base = opts.base || '';
    var el = document.getElementById(containerId);
    if (!el) return;
    if (!lista.length) {
      el.innerHTML = '<p class="texto-muted" style="grid-column: 1 / -1;">Todavía no hay investigaciones publicadas aquí. Vuelve pronto.</p>';
      return;
    }
    el.innerHTML = lista.map(function (i) {
      var fuente = i.tipo === 'Reporte propio' || i.tipo === 'Investigación con datos' ? 'CIPMEX' : i.revista;
      return '' +
        '<a href="' + base + i.link + '" class="pub-card">' +
        '<div class="pub-foto" style="background: ' + gradienteDeTipo(i) + ';">' +
        '<span class="pub-tag">' + i.tipo + '</span>' +
        '</div>' +
        '<div class="pub-contenido">' +
        '<h3>' + i.titulo + '</h3>' +
        '<p class="pub-resumen">' + i.resumen + '</p>' +
        '<div class="pub-meta">' +
        '<span>' + fuente + ' · ' + i.anio + '</span>' +
        '<span class="pub-leer">Leer →</span>' +
        '</div>' +
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
      el.innerHTML = '';
      return;
    }
    el.innerHTML = lista.map(function (i) {
      return '' +
        '<a href="' + base + i.link + '" class="card" style="text-decoration:none; color:inherit;">' +
        '<div class="foto" style="background: ' + gradienteDeTipo(i) + ';"></div>' +
        '<div class="contenido">' +
        '<h4>' + i.titulo + '</h4>' +
        '<p class="desc">' + i.resumen + '</p>' +
        '</div>' +
        '</a>';
    }).join('');
  }

  global.CIPMEXInvestigaciones = {
    cargar: cargar,
    limitar: limitar,
    porAutor: porAutor,
    renderPubCards: renderPubCards,
    renderSemblanza: renderSemblanza
  };
})(window);
