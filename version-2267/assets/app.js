(function () {
    function selectAll(selector, scope) {
        return Array.prototype.slice.call((scope || document).querySelectorAll(selector));
    }

    function normalize(value) {
        return String(value || '').toLowerCase().trim();
    }

    function setupNavigation() {
        var toggle = document.querySelector('[data-nav-toggle]');
        var nav = document.querySelector('[data-site-nav]');
        if (!toggle || !nav) {
            return;
        }
        toggle.addEventListener('click', function () {
            nav.classList.toggle('is-open');
        });
    }

    function setupHero() {
        var slider = document.querySelector('[data-hero-slider]');
        if (!slider) {
            return;
        }
        var slides = selectAll('.hero-slide', slider);
        var dots = selectAll('.hero-dot', slider);
        if (slides.length === 0) {
            return;
        }
        var active = 0;
        var timer;

        function show(index) {
            active = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === active);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === active);
            });
        }

        function play() {
            timer = window.setInterval(function () {
                show(active + 1);
            }, 5200);
        }

        dots.forEach(function (dot, index) {
            dot.addEventListener('click', function () {
                window.clearInterval(timer);
                show(index);
                play();
            });
        });

        show(0);
        play();
    }

    function setupFilters() {
        var toolbar = document.querySelector('[data-filter-toolbar]');
        if (!toolbar) {
            return;
        }
        var keyword = toolbar.querySelector('[data-filter-keyword]');
        var year = toolbar.querySelector('[data-filter-year]');
        var region = toolbar.querySelector('[data-filter-region]');
        var genre = toolbar.querySelector('[data-filter-genre]');
        var cards = selectAll('[data-movie-card]');

        function run() {
            var q = normalize(keyword && keyword.value);
            var y = normalize(year && year.value);
            var r = normalize(region && region.value);
            var g = normalize(genre && genre.value);
            cards.forEach(function (card) {
                var haystack = normalize([
                    card.dataset.title,
                    card.dataset.year,
                    card.dataset.region,
                    card.dataset.genre,
                    card.dataset.tags
                ].join(' '));
                var visible = true;
                if (q && haystack.indexOf(q) === -1) {
                    visible = false;
                }
                if (y && normalize(card.dataset.year) !== y) {
                    visible = false;
                }
                if (r && normalize(card.dataset.region).indexOf(r) === -1) {
                    visible = false;
                }
                if (g && normalize(card.dataset.genre).indexOf(g) === -1 && normalize(card.dataset.tags).indexOf(g) === -1) {
                    visible = false;
                }
                card.classList.toggle('is-hidden', !visible);
            });
        }

        [keyword, year, region, genre].forEach(function (node) {
            if (!node) {
                return;
            }
            node.addEventListener('input', run);
            node.addEventListener('change', run);
        });
    }

    function createResult(item) {
        var link = document.createElement('a');
        link.className = 'search-result';
        link.href = item.url;

        var img = document.createElement('img');
        img.src = item.cover;
        img.alt = item.title;
        img.loading = 'lazy';
        link.appendChild(img);

        var body = document.createElement('span');
        var title = document.createElement('strong');
        title.textContent = item.title;
        var summary = document.createElement('em');
        summary.textContent = item.oneLine;
        var meta = document.createElement('span');
        meta.className = 'meta-line';
        meta.textContent = item.year + ' · ' + item.region + ' · ' + item.genre;
        body.appendChild(title);
        body.appendChild(summary);
        body.appendChild(meta);
        link.appendChild(body);
        return link;
    }

    function setupSearchPage() {
        var input = document.querySelector('[data-site-search]');
        var output = document.querySelector('[data-search-results]');
        if (!input || !output || !window.MOVIE_SEARCH_INDEX) {
            return;
        }

        function render() {
            var q = normalize(input.value);
            output.innerHTML = '';
            var results = window.MOVIE_SEARCH_INDEX.filter(function (item) {
                var haystack = normalize([
                    item.title,
                    item.year,
                    item.region,
                    item.genre,
                    item.tags,
                    item.oneLine
                ].join(' '));
                return !q || haystack.indexOf(q) !== -1;
            }).slice(0, 80);

            if (results.length === 0) {
                var empty = document.createElement('div');
                empty.className = 'empty-state';
                empty.textContent = '没有找到匹配影片';
                output.appendChild(empty);
                return;
            }

            results.forEach(function (item) {
                output.appendChild(createResult(item));
            });
        }

        input.addEventListener('input', render);
        render();
    }

    document.addEventListener('DOMContentLoaded', function () {
        setupNavigation();
        setupHero();
        setupFilters();
        setupSearchPage();
    });
})();
