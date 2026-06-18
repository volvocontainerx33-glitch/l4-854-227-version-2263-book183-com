(function () {
  const toggle = document.querySelector('[data-menu-toggle]');
  const panel = document.querySelector('[data-mobile-panel]');

  if (toggle && panel) {
    toggle.addEventListener('click', function () {
      panel.classList.toggle('is-open');
    });
  }

  document.addEventListener('error', function (event) {
    const target = event.target;
    if (target && target.matches && target.matches('img[data-cover]')) {
      const wrap = target.closest('.poster');
      if (wrap) {
        wrap.classList.add('image-failed');
      }
    }
  }, true);

  const hero = document.querySelector('[data-hero]');
  if (hero) {
    const slides = Array.from(hero.querySelectorAll('[data-hero-slide]'));
    const dots = Array.from(hero.querySelectorAll('[data-hero-dot]'));
    const prev = hero.querySelector('[data-hero-prev]');
    const next = hero.querySelector('[data-hero-next]');
    let index = 0;
    let timer = null;

    const show = function (nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === index);
      });
    };

    const run = function () {
      clearInterval(timer);
      timer = setInterval(function () {
        show(index + 1);
      }, 5200);
    };

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-hero-dot')) || 0);
        run();
      });
    });

    if (prev) {
      prev.addEventListener('click', function () {
        show(index - 1);
        run();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
        run();
      });
    }

    show(0);
    run();
  }

  const toolbar = document.querySelector('[data-catalog-toolbar]');
  if (toolbar) {
    const search = toolbar.querySelector('[data-catalog-search]');
    const region = toolbar.querySelector('[data-filter-region]');
    const genre = toolbar.querySelector('[data-filter-genre]');
    const year = toolbar.querySelector('[data-filter-year]');
    const items = Array.from(document.querySelectorAll('.movie-item'));
    const empty = document.querySelector('[data-empty-state]');

    const normalize = function (value) {
      return String(value || '').trim().toLowerCase();
    };

    const apply = function () {
      const q = normalize(search && search.value);
      const r = normalize(region && region.value);
      const g = normalize(genre && genre.value);
      const y = normalize(year && year.value);
      let visible = 0;

      items.forEach(function (item) {
        const haystack = normalize([
          item.getAttribute('data-title'),
          item.getAttribute('data-region'),
          item.getAttribute('data-genre'),
          item.getAttribute('data-year'),
          item.getAttribute('data-tags')
        ].join(' '));
        const ok = (!q || haystack.indexOf(q) >= 0) &&
          (!r || normalize(item.getAttribute('data-region')) === r) &&
          (!g || normalize(item.getAttribute('data-genre')).indexOf(g) >= 0 || normalize(item.getAttribute('data-tags')).indexOf(g) >= 0) &&
          (!y || normalize(item.getAttribute('data-year')) === y);
        item.style.display = ok ? '' : 'none';
        if (ok) {
          visible += 1;
        }
      });

      if (empty) {
        empty.classList.toggle('is-visible', visible === 0);
      }
    };

    [search, region, genre, year].forEach(function (control) {
      if (control) {
        control.addEventListener('input', apply);
        control.addEventListener('change', apply);
      }
    });
  }
})();
