/* CIPMEX — catálogo de noticias.
   Lee data/noticias.json (una entrada por noticia) y arma las tarjetas en
   noticias/index.html. Agregar una noticia nueva = agregar una entrada a
   ese archivo; la página no necesita tocarse a mano.

   `base` es la ruta relativa desde la página actual hasta la raíz del
   sitio: "" en la raíz, "../" dentro de /noticias/. */
(function (global) {
  var MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio',
    'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];

  var GRADIENTES_POR_TAG = {
    'Investigación propia': ['var(--terracota)', 'var(--azul-oscuro)'],
    'Evento': ['var(--azul)', 'var(--morado)'],
    'Comunicado': ['var(--verde)', 'var(--azul-claro)'],
    'Resultado': ['var(--morado)', 'var(--azul-claro)']
  };
  var GRADIENTE_DEFAULT = ['var(--azul)', 'var(--azul-oscuro)'];

  function gradienteDeTag(tag) {
    var g = GRADIENTES_POR_TAG[tag] || GRADIENTE_DEFAULT;
    return 'linear-gradient(135deg, ' + g[0] + ', ' + g[1] + ')';
  }

  function formatMes(fechaISO) {
    var partes = fechaISO.split('-');
    var mes = MESES[parseInt(partes[1], 10) - 1];
    return mes + ', ' + partes[0];
  }

  function cargar(base, callback) {
    fetch(base + 'data/noticias.json')
      .then(function (r) { return r.json(); })
      .then(function (data) {
        data.sort(function (a, b) { return a.fecha < b.fecha ? 1 : -1; });
        callback(data);
      })
      .catch(function () { callback([]); });
  }

  function limitar(data, n) {
    return data.slice(0, n);
  }

  function renderPubCards(containerId, lista, opts) {
    opts = opts || {};
    var base = opts.base || '';
    var el = document.getElementById(containerId);
    if (!el) return;
    if (!lista.length) {
      el.innerHTML = '<p class="texto-muted" style="grid-column: 1 / -1;">Todavía no hay noticias publicadas. Vuelve pronto.</p>';
      return;
    }
    el.innerHTML = lista.map(function (n) {
      var foto = n.portada ?
        '<img src="' + base + n.portada + '" alt="' + n.titulo + '">' :
        '<span class="pub-foto-tag">FOTO</span>';
      return '' +
        '<div class="pub-card">' +
        '<div class="pub-foto" style="background: ' + gradienteDeTag(n.tag) + ';">' +
        '<span class="pub-tag">' + n.tag + '</span>' +
        foto +
        '</div>' +
        '<div class="pub-contenido">' +
        '<h3>' + n.titulo + '</h3>' +
        '<p class="pub-resumen">' + n.resumen + '</p>' +
        '<div class="pub-meta">' +
        '<span>CIPMEX · ' + formatMes(n.fecha) + '</span>' +
        '</div>' +
        '</div>' +
        '</div>';
    }).join('');
  }

  global.CIPMEXNoticias = {
    cargar: cargar,
    limitar: limitar,
    formatMes: formatMes,
    renderPubCards: renderPubCards
  };
})(window);
