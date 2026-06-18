(function () {
    function closest(element, selector) {
        while (element && element !== document) {
            if (element.matches(selector)) {
                return element;
            }
            element = element.parentElement;
        }
        return null;
    }

    var header = document.querySelector('.site-header');
    var menuButton = document.querySelector('.menu-toggle');
    if (header && menuButton) {
        menuButton.addEventListener('click', function () {
            header.classList.toggle('is-open');
        });
    }

    var slider = document.querySelector('.hero-slider');
    if (slider) {
        var slides = Array.prototype.slice.call(slider.querySelectorAll('.hero-slide'));
        var dots = Array.prototype.slice.call(slider.querySelectorAll('.hero-dot'));
        var current = 0;
        var showSlide = function (index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === current);
            });
        };
        dots.forEach(function (dot, index) {
            dot.addEventListener('click', function () {
                showSlide(index);
            });
        });
        if (slides.length > 1) {
            window.setInterval(function () {
                showSlide(current + 1);
            }, 5200);
        }
        showSlide(0);
    }

    var catalogInput = document.querySelector('.catalog-search');
    var catalogSort = document.querySelector('.catalog-sort');
    var catalogGrid = document.querySelector('.catalog-grid');
    var emptyState = document.querySelector('.empty-state');
    var filterCatalog = function () {
        if (!catalogGrid) {
            return;
        }
        var query = catalogInput ? catalogInput.value.trim().toLowerCase() : '';
        var cards = Array.prototype.slice.call(catalogGrid.querySelectorAll('.movie-card'));
        var visible = 0;
        cards.forEach(function (card) {
            var text = [
                card.getAttribute('data-title') || '',
                card.getAttribute('data-year') || '',
                card.getAttribute('data-tags') || '',
                card.textContent || ''
            ].join(' ').toLowerCase();
            var matched = !query || text.indexOf(query) !== -1;
            card.style.display = matched ? '' : 'none';
            if (matched) {
                visible += 1;
            }
        });
        if (emptyState) {
            emptyState.style.display = visible ? 'none' : 'block';
        }
    };
    if (catalogInput) {
        catalogInput.addEventListener('input', filterCatalog);
    }
    if (catalogSort && catalogGrid) {
        catalogSort.addEventListener('change', function () {
            var cards = Array.prototype.slice.call(catalogGrid.querySelectorAll('.movie-card'));
            var mode = catalogSort.value;
            cards.sort(function (a, b) {
                if (mode === 'year') {
                    return Number(b.getAttribute('data-year')) - Number(a.getAttribute('data-year'));
                }
                if (mode === 'title') {
                    return (a.getAttribute('data-title') || '').localeCompare(b.getAttribute('data-title') || '', 'zh-CN');
                }
                return Number(a.getAttribute('data-rank')) - Number(b.getAttribute('data-rank'));
            });
            cards.forEach(function (card) {
                catalogGrid.appendChild(card);
            });
            filterCatalog();
        });
    }

    var searchResults = document.querySelector('.search-results');
    var searchInput = document.querySelector('.search-input');
    if (searchResults && searchInput && window.MOVIE_SEARCH_INDEX) {
        var params = new URLSearchParams(window.location.search);
        var initialQuery = params.get('q') || '';
        searchInput.value = initialQuery;
        var renderResults = function () {
            var query = searchInput.value.trim().toLowerCase();
            var results = window.MOVIE_SEARCH_INDEX.filter(function (movie) {
                if (!query) {
                    return true;
                }
                return [movie.title, movie.year, movie.region, movie.genre, movie.category, movie.tags].join(' ').toLowerCase().indexOf(query) !== -1;
            }).slice(0, 120);
            if (!results.length) {
                searchResults.innerHTML = '<div class="empty-state" style="display:block">没有找到相关影片</div>';
                return;
            }
            searchResults.innerHTML = results.map(function (movie) {
                return [
                    '<article class="movie-card">',
                    '<a class="poster" href="' + movie.url + '">',
                    '<img src="' + movie.cover + '" alt="' + movie.title.replace(/"/g, '&quot;') + '" loading="lazy">',
                    '<span class="poster-gradient"></span>',
                    '<span class="poster-play"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5v14l11-7z"></path></svg></span>',
                    '</a>',
                    '<div class="card-body">',
                    '<a class="card-title" href="' + movie.url + '">' + movie.title + '</a>',
                    '<p>' + movie.desc + '</p>',
                    '<div class="meta-line">' + movie.year + ' / ' + movie.region + ' / ' + movie.genre + '</div>',
                    '<div class="tag-row"><span>' + movie.category + '</span></div>',
                    '</div>',
                    '</article>'
                ].join('');
            }).join('');
        };
        searchInput.addEventListener('input', renderResults);
        renderResults();
    }

    window.initMoviePlayer = function (options) {
        var video = options.video;
        var button = options.button;
        var source = options.source;
        var hlsInstance = null;
        var ready = false;
        var prepare = function () {
            if (ready || !video || !source) {
                return;
            }
            ready = true;
            if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({ enableWorker: true });
                hlsInstance.loadSource(source);
                hlsInstance.attachMedia(video);
            } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = source;
            }
        };
        var begin = function () {
            prepare();
            if (button) {
                button.classList.add('is-hidden');
            }
            var playTask = video.play();
            if (playTask && playTask.catch) {
                playTask.catch(function () {});
            }
        };
        if (button) {
            button.addEventListener('click', begin);
        }
        if (video) {
            video.addEventListener('click', function () {
                if (!ready) {
                    begin();
                }
            });
            video.addEventListener('play', function () {
                if (button) {
                    button.classList.add('is-hidden');
                }
            });
        }
        window.addEventListener('pagehide', function () {
            if (hlsInstance) {
                hlsInstance.destroy();
            }
        });
    };

    document.addEventListener('click', function (event) {
        var link = closest(event.target, '.mobile-panel a');
        if (link && header) {
            header.classList.remove('is-open');
        }
    });
})();
