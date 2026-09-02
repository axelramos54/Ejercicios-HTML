/* =========================================================================
   HTTP — Mapa de Ruta (variación de diseño)
   main.js — interactividad (JavaScript puro, sin dependencias)
   ========================================================================= */

document.addEventListener('DOMContentLoaded', function () {

  var root = document.documentElement;

  /* ---------- 1. Menú de navegación móvil + overlay ---------- */
  var navToggle = document.getElementById('navToggle');
  var navLinks  = document.getElementById('navLinks');
  var overlay   = document.getElementById('navOverlay');

  function closeMenu() {
    navLinks.classList.remove('open');
    overlay.classList.remove('visible');
    navToggle.setAttribute('aria-expanded', 'false');
  }
  function toggleMenu() {
    var open = navLinks.classList.toggle('open');
    overlay.classList.toggle('visible', open);
    navToggle.setAttribute('aria-expanded', String(open));
  }
  if (navToggle) {
    navToggle.addEventListener('click', toggleMenu);
    overlay.addEventListener('click', closeMenu);
    navLinks.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', closeMenu);
    });
  }

  /* ---------- 2. Scrollspy: sección activa + "ahora en" + color dinámico ---------- */
  var sections  = document.querySelectorAll('section[id]');
  var links     = document.querySelectorAll('.legend-links a');
  var nowAt     = document.getElementById('nowAt');
  var badge     = document.getElementById('brandBadge');
  var header    = document.getElementById('platformHeader');
  var progressFill = document.getElementById('progressFill');
  var progressTrain = document.getElementById('progressTrain');

  var sectionMeta = {}; // id -> { label, color }
  sections.forEach(function (s) {
    sectionMeta[s.id] = {
      label: s.getAttribute('data-label') || s.id,
      color: s.getAttribute('data-color') || 'var(--c2xx)'
    };
  });

  function setActive(id) {
    var meta = sectionMeta[id];
    if (!meta) return;
    links.forEach(function (l) {
      var isActive = l.getAttribute('href') === '#' + id;
      l.classList.toggle('active', isActive);
      if (isActive) { l.setAttribute('aria-current', 'page'); }
      else { l.removeAttribute('aria-current'); }
    });
    if (nowAt) { nowAt.textContent = 'ahora en: ' + meta.label; }
    if (badge) { badge.style.background = meta.color; }
    if (header) { header.style.borderBottomColor = meta.color; }
    if (progressFill) { progressFill.style.background = meta.color; }
    if (progressTrain) { progressTrain.style.background = meta.color; }
  }

  if ('IntersectionObserver' in window && sections.length) {
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) { setActive(entry.target.id); }
      });
    }, { rootMargin: '-45% 0px -50% 0px', threshold: 0 });
    sections.forEach(function (s) { spy.observe(s); });
  }

  /* ---------- 3. Barra de progreso de lectura ("el tren avanza") ---------- */
  function updateProgress() {
    var scrollTop = window.scrollY;
    var docHeight = document.documentElement.scrollHeight - window.innerHeight;
    var pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    if (progressFill) { progressFill.style.width = pct + '%'; }
    if (progressTrain) { progressTrain.style.left = pct + '%'; }
  }
  window.addEventListener('scroll', updateProgress, { passive: true });
  updateProgress();

  /* ---------- 4. Revelado progresivo de secciones ---------- */
  document.querySelectorAll('.reveal').forEach(function (el) {
    if ('IntersectionObserver' in window) {
      var revealObs = new IntersectionObserver(function (entries, obs) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('revealed');
            obs.unobserve(entry.target);
          }
        });
      }, { threshold: 0.12 });
      revealObs.observe(el);
    } else {
      el.classList.add('revealed');
    }
  });

  /* ---------- 5. Tema claro / oscuro ---------- */
  var themeToggle = document.getElementById('themeToggle');
  if (themeToggle) {
    themeToggle.addEventListener('click', function () {
      var next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      root.setAttribute('data-theme', next);
      themeToggle.textContent = next === 'dark' ? '☀ claro' : '● oscuro';
    });
  }

  /* ---------- 6. Botón "volver arriba" ---------- */
  var backToTop = document.getElementById('backToTop');
  if (backToTop) {
    window.addEventListener('scroll', function () {
      backToTop.classList.toggle('visible', window.scrollY > 600);
    }, { passive: true });
    backToTop.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  /* ---------- 7. Copiar ejemplos de código ---------- */
  document.querySelectorAll('.copy-btn').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var codeEl = btn.closest('.code-block').querySelector('pre code');
      var text = codeEl ? codeEl.textContent : '';
      navigator.clipboard.writeText(text).then(function () {
        var original = btn.textContent;
        btn.textContent = 'Copiado ✓';
        setTimeout(function () { btn.textContent = original; }, 1500);
      }).catch(function () {
        btn.textContent = 'No se pudo copiar';
      });
    });
  });

  /* ---------- 8. Solo un término de glosario abierto a la vez (opcional, mejora UX) ---------- */
  var terms = document.querySelectorAll('.glossary details');
  terms.forEach(function (term) {
    term.addEventListener('toggle', function () {
      if (term.open) {
        terms.forEach(function (other) {
          if (other !== term) other.open = false;
        });
      }
    });
  });

});
