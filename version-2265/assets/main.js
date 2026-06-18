(function () {
  var menuButton = document.querySelector('[data-menu-toggle]');
  var mobileNav = document.querySelector('[data-mobile-nav]');
  if (menuButton && mobileNav) {
    menuButton.addEventListener('click', function () {
      mobileNav.classList.toggle('open');
    });
  }

  var hero = document.querySelector('[data-hero]');
  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var current = 0;
    var timer = null;

    function showSlide(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === current);
      });
    }

    function startHero() {
      stopHero();
      timer = window.setInterval(function () {
        showSlide(current + 1);
      }, 5000);
    }

    function stopHero() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        showSlide(Number(dot.getAttribute('data-hero-dot')) || 0);
        startHero();
      });
    });

    hero.addEventListener('mouseenter', stopHero);
    hero.addEventListener('mouseleave', startHero);
    startHero();
  }

  var filterInput = document.querySelector('[data-card-filter]');
  if (filterInput) {
    var cards = Array.prototype.slice.call(document.querySelectorAll('[data-card-list] .movie-card'));
    filterInput.addEventListener('input', function () {
      var keyword = filterInput.value.trim().toLowerCase();
      cards.forEach(function (card) {
        var text = card.getAttribute('data-search') || '';
        card.style.display = !keyword || text.indexOf(keyword) !== -1 ? '' : 'none';
      });
    });
  }

  var searchInput = document.querySelector('[data-search-input]');
  var searchButton = document.querySelector('[data-search-button]');
  var searchResults = document.querySelector('[data-search-results]');
  var searchSummary = document.querySelector('[data-search-summary]');

  if (searchInput && searchResults && window.movieIndex) {
    var params = new URLSearchParams(window.location.search);
    var initial = params.get('q') || '';
    searchInput.value = initial;

    function createCard(item) {
      var tags = item.tags.slice(0, 4).map(function (tag) {
        return '<span>' + escapeHtml(tag) + '</span>';
      }).join('');
      return [
        '<article class="movie-card">',
        '<a class="poster-link" href="' + item.url + '" aria-label="' + escapeHtml(item.title) + '">',
        '<img src="' + item.cover + '" alt="' + escapeHtml(item.title) + '" loading="lazy">',
        '<span class="play-chip">播放</span>',
        '</a>',
        '<div class="card-body">',
        '<div class="meta-row"><span>' + escapeHtml(item.region) + '</span><span>' + escapeHtml(item.year) + '</span><span>' + escapeHtml(item.type) + '</span></div>',
        '<h3><a href="' + item.url + '">' + escapeHtml(item.title) + '</a></h3>',
        '<p>' + escapeHtml(item.line) + '</p>',
        '<div class="tag-row">' + tags + '</div>',
        '</div>',
        '</article>'
      ].join('');
    }

    function escapeHtml(value) {
      return String(value || '').replace(/[&<>"]/g, function (match) {
        return {
          '&': '&amp;',
          '<': '&lt;',
          '>': '&gt;',
          '"': '&quot;'
        }[match];
      });
    }

    function renderSearch() {
      var keyword = searchInput.value.trim().toLowerCase();
      var matched = window.movieIndex.filter(function (item) {
        return !keyword || item.text.indexOf(keyword) !== -1;
      }).slice(0, 120);
      searchResults.innerHTML = matched.map(createCard).join('');
      if (searchSummary) {
        searchSummary.textContent = keyword ? '搜索结果' : '精选影片';
      }
    }

    searchInput.addEventListener('input', renderSearch);
    if (searchButton) {
      searchButton.addEventListener('click', renderSearch);
    }
    renderSearch();
  }
})();
