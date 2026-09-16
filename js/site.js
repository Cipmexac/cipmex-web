/* CIPMEX — comportamiento compartido en todas las páginas del sitio.
   Un solo archivo para: header al hacer scroll, menú móvil (hamburguesa +
   acordeón de submenús), tarjetas que voltean con click/tap, botón
   "Leer más" de las semblanzas, y animación de aparición al hacer scroll. */
(function () {
  function ready(fn) {
    if (document.readyState !== 'loading') { fn(); }
    else { document.addEventListener('DOMContentLoaded', fn); }
  }

  ready(function () {
    /* Header que se encoge al hacer scroll */
    var headerWrap = document.getElementById('headerWrap');
    if (headerWrap) {
      window.addEventListener('scroll', function () {
        if (window.scrollY > 20) { headerWrap.classList.add('scrolled'); }
        else { headerWrap.classList.remove('scrolled'); }
      });
    }

    /* Menú móvil: botón de hamburguesa */
    var toggle = document.getElementById('menuToggle');
    if (toggle && headerWrap) {
      toggle.addEventListener('click', function () {
        var abierto = headerWrap.classList.toggle('menu-abierto');
        toggle.setAttribute('aria-expanded', abierto ? 'true' : 'false');
        if (!abierto) {
          headerWrap.querySelectorAll('.nav-item-dropdown.abierto').forEach(function (d) {
            d.classList.remove('abierto');
          });
        }
      });
    }

    /* Menú móvil: acordeón de "Sobre nosotros" / "Publicaciones" */
    document.querySelectorAll('.nav-item-dropdown').forEach(function (dd) {
      var span = dd.querySelector('span');
      if (!span) return;
      span.addEventListener('click', function (e) {
        if (window.innerWidth > 720) return;
        e.preventDefault();
        var estabaAbierto = dd.classList.contains('abierto');
        document.querySelectorAll('.nav-item-dropdown').forEach(function (d) {
          d.classList.remove('abierto');
        });
        if (!estabaAbierto) dd.classList.add('abierto');
      });
    });

    /* Tarjetas que voltean: click/tap además del hover de escritorio */
    document.querySelectorAll('.flip-outer').forEach(function (card) {
      card.addEventListener('click', function () {
        card.classList.toggle('flipped');
      });
    });

    /* Botón "Leer más" de las semblanzas */
    document.querySelectorAll('.semblanza-leermas').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var texto = btn.previousElementSibling;
        texto.classList.toggle('clamp');
        btn.textContent = texto.classList.contains('clamp') ? 'Leer más →' : 'Leer menos ←';
      });
    });

    /* Animación de aparición al hacer scroll (tarjetas de equipo/servicios) */
    var reveals = document.querySelectorAll('.persona-card, .servicio-item');
    if (reveals.length) {
      if (!('IntersectionObserver' in window)) {
        reveals.forEach(function (el) { el.classList.add('visible'); });
      } else {
        var obs = new IntersectionObserver(function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              entry.target.classList.add('visible');
              obs.unobserve(entry.target);
            }
          });
        }, { threshold: 0.15 });
        reveals.forEach(function (el) { obs.observe(el); });
      }
    }
  });
})();
