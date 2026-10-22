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

  /* Paginación (opcional): solo se activa si la página pasa opts.porPagina.
     La página actual vive en la dirección (?pagina=2), así el botón "atrás"
     y los enlaces compartidos funcionan. Los estilos se inyectan aquí mismo,
     no hace falta tocar style.css. */
  function estilosPaginacion() {
    if (document.getElementById('cipmex-paginacion-css')) return;
    var s = document.createElement('style');
    s.id = 'cipmex-paginacion-css';
    s.textContent =
      '.paginacion{display:flex;flex-wrap:wrap;justify-content:center;align-items:center;gap:8px;margin:44px 0 8px;}' +
      '.paginacion a,.paginacion span{display:inline-flex;align-items:center;justify-content:center;min-width:42px;height:42px;padding:0 14px;box-sizing:border-box;border:1px solid #d5dbe3;border-radius:8px;font-family:Inter,sans-serif;font-size:14px;font-weight:600;color:var(--azul,#1d4488);background:#fff;text-decoration:none;transition:background .15s,color .15s,border-color .15s;}' +
      '.paginacion a:hover{background:#eef2f8;border-color:var(--azul,#1d4488);}' +
      '.paginacion a.activa{background:var(--azul,#1d4488);border-color:var(--azul,#1d4488);color:#fff;}' +
      '.paginacion span.deshabilitada{opacity:.4;}' +
      '.paginacion span.puntos{border:none;background:none;min-width:auto;padding:0 4px;color:#6b7686;}' +
      '@media (max-width:560px){.paginacion a,.paginacion span{min-width:38px;height:38px;padding:0 10px;}}';
    document.head.appendChild(s);
  }

  function paginaDeLaDireccion(total) {
    var p = parseInt(new URLSearchParams(window.location.search).get('pagina'), 10);
    if (!p || p < 1) p = 1;
    if (p > total) p = total;
    return p;
  }

  /* Lista de números a mostrar: todos si son pocos; si no, primero, último y
     los vecinos de la actual, con "…" en los huecos. */
  function numerosDePagina(actual, total) {
    var out = [], i;
    if (total <= 7) {
      for (i = 1; i <= total; i++) out.push(i);
      return out;
    }
    var ini = Math.max(2, actual - 1), fin = Math.min(total - 1, actual + 1);
    out.push(1);
    if (ini > 2) out.push('…');
    for (i = ini; i <= fin; i++) out.push(i);
    if (fin < total - 1) out.push('…');
    out.push(total);
    return out;
  }

  function htmlPaginacion(actual, total) {
    function enlace(n, texto, clase, etiqueta) {
      return '<a href="?pagina=' + n + '" data-pag="' + n + '"' +
        (clase ? ' class="' + clase + '"' : '') +
        (clase === 'activa' ? ' aria-current="page"' : '') +
        (etiqueta ? ' aria-label="' + etiqueta + '"' : '') + '>' + texto + '</a>';
    }
    var h = '';
    h += actual > 1 ? enlace(actual - 1, '← Anterior', '', 'Página anterior')
                    : '<span class="deshabilitada">← Anterior</span>';
    numerosDePagina(actual, total).forEach(function (n) {
      h += n === '…' ? '<span class="puntos">…</span>'
                     : enlace(n, n, n === actual ? 'activa' : '', 'Página ' + n);
    });
    h += actual < total ? enlace(actual + 1, 'Siguiente →', '', 'Página siguiente')
                        : '<span class="deshabilitada">Siguiente →</span>';
    return h;
  }

  function pintarTarjetas(el, lista, base) {
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

  /* Tarjeta estándar (.pub-card): usada en inicio, medio y tema.
     Si no hay resultados: si se pasó vacioSelector, se deja tal cual el
     estado vacío bonito que ya tiene la página (no se toca nada). Si no,
     se muestra un mensaje genérico dentro del propio contenedor.
     Con opts.porPagina (por ejemplo 12) se divide en páginas con botones. */
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

    var porPagina = opts.porPagina > 0 ? opts.porPagina : 0;
    if (!porPagina || lista.length <= porPagina) {
      pintarTarjetas(el, lista, base);
      return;
    }

    estilosPaginacion();
    var total = Math.ceil(lista.length / porPagina);
    var nav = document.getElementById(containerId + 'Paginacion');
    if (!nav) {
      nav = document.createElement('nav');
      nav.id = containerId + 'Paginacion';
      nav.className = 'paginacion';
      nav.setAttribute('aria-label', 'Paginación');
      el.parentNode.insertBefore(nav, el.nextSibling);
    }

    function mostrar(pagina, desplazar) {
      pintarTarjetas(el, lista.slice((pagina - 1) * porPagina, pagina * porPagina), base);
      nav.innerHTML = htmlPaginacion(pagina, total);
      if (desplazar) {
        window.scrollTo({ top: el.getBoundingClientRect().top + window.pageYOffset - 140, behavior: 'smooth' });
      }
    }

    nav.addEventListener('click', function (e) {
      var a = e.target.closest ? e.target.closest('a[data-pag]') : null;
      if (!a) return;
      e.preventDefault();
      var n = parseInt(a.getAttribute('data-pag'), 10);
      var url = n === 1 ? window.location.pathname : ('?pagina=' + n);
      window.history.pushState({}, '', url);
      mostrar(n, true);
    });
    window.addEventListener('popstate', function () {
      mostrar(paginaDeLaDireccion(total), false);
    });

    mostrar(paginaDeLaDireccion(total), false);
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
