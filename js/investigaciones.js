/* CIPMEX — catálogo de publicaciones e investigación.
   Lee data/investigaciones.json (una entrada por artículo/reporte) y arma
   las tarjetas en publicaciones/investigacion.html. Agregar una
   investigación nueva = agregar una entrada a ese archivo + su página
   individual; la página de listado no necesita tocarse a mano.

   `base` es la ruta relativa desde la página actual hasta la raíz del
   sitio: "" en la raíz, "../" dentro de /publicaciones/, "../../" dentro
   de /publicaciones/investigacion/. */
(function (global) {

  /* Color de fondo de la tarjeta: se asigna solo, en automático. Se
     reparte una paleta de colores de marca de CIPMEX según el orden en
     que cada investigación aparece en investigaciones.json (no según su
     tipo ni su año), rotando entre colores claramente distintos entre sí
     para que nunca se repita uno igual o parecido justo al lado del
     anterior. Agregar una investigación nueva no requiere elegir nada a
     mano: solo se agrega al final del archivo y le toca el siguiente
     color de la rotación. (Si alguna vez hiciera falta fijar un color
     específico, poner "color" en esa entrada de investigaciones.json
     tiene prioridad sobre la rotación). */
  var PALETA_GRADIENTES = [
    'linear-gradient(135deg, var(--azul), var(--azul-oscuro))',
    'linear-gradient(135deg, var(--terracota), var(--morado))',
    'linear-gradient(135deg, var(--verde), var(--azul-claro))',
    'linear-gradient(135deg, var(--morado), var(--azul))',
    'linear-gradient(135deg, var(--terracota), var(--azul-oscuro))',
    'linear-gradient(135deg, var(--verde), var(--morado))'
  ];
  function gradienteDeTipo(i) {
    if (i.color) return i.color;
    var idx = typeof i._paletaIdx === 'number' ? i._paletaIdx : 0;
    return PALETA_GRADIENTES[idx % PALETA_GRADIENTES.length];
  }

  function cargar(base, callback) {
    fetch(base + 'data/investigaciones.json')
      .then(function (r) { return r.json(); })
      .then(function (data) {
        /* El color se fija según el orden original del archivo, antes de
           ordenar por año, para que cada investigación tenga siempre el
           mismo color sin importar en qué página o en qué orden se liste. */
        data.forEach(function (item, idx) { item._paletaIdx = idx; });
        data.sort(function (a, b) {
          if ((b.anio || 0) !== (a.anio || 0)) return (b.anio || 0) - (a.anio || 0);
          return (b.mes || 0) - (a.mes || 0);
        });
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
    gradienteDeTipo: gradienteDeTipo,
    renderPubCards: renderPubCards,
    renderSemblanza: renderSemblanza
  };
})(window);
