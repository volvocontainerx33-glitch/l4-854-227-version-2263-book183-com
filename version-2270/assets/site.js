
(function () {
    var menuButton = document.querySelector('[data-menu-button]');
    var mobilePanel = document.querySelector('[data-mobile-panel]');

    if (menuButton && mobilePanel) {
        menuButton.addEventListener('click', function () {
            mobilePanel.classList.toggle('is-open');
        });
    }

    var yearTargets = document.querySelectorAll('[data-year]');
    yearTargets.forEach(function (target) {
        target.textContent = new Date().getFullYear();
    });

    function initHero() {
        var slider = document.querySelector('[data-hero-slider]');
        if (!slider) {
            return;
        }

        var slides = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-dot]'));
        var prev = slider.querySelector('[data-hero-prev]');
        var next = slider.querySelector('[data-hero-next]');
        var index = 0;
        var timer = null;

        function show(nextIndex) {
            if (!slides.length) {
                return;
            }
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === index);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === index);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5200);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                show(Number(dot.getAttribute('data-hero-dot')) || 0);
                start();
            });
        });

        if (prev) {
            prev.addEventListener('click', function () {
                show(index - 1);
                start();
            });
        }

        if (next) {
            next.addEventListener('click', function () {
                show(index + 1);
                start();
            });
        }

        slider.addEventListener('mouseenter', stop);
        slider.addEventListener('mouseleave', start);
        show(0);
        start();
    }

    function initFilters() {
        var scopes = document.querySelectorAll('[data-filter-scope]');
        scopes.forEach(function (scope) {
            var input = scope.querySelector('[data-search-input]');
            var clearButton = scope.querySelector('[data-clear-search]');
            var filterButtons = Array.prototype.slice.call(scope.querySelectorAll('[data-filter-button]'));
            var cards = Array.prototype.slice.call(scope.querySelectorAll('[data-card]'));
            var currentFilter = 'all';

            function apply() {
                var query = input ? input.value.trim().toLowerCase() : '';
                cards.forEach(function (card) {
                    var text = (card.getAttribute('data-text') || '').toLowerCase();
                    var group = card.getAttribute('data-group') || '';
                    var matchQuery = !query || text.indexOf(query) !== -1;
                    var matchFilter = currentFilter === 'all' || group === currentFilter || text.indexOf(currentFilter.toLowerCase()) !== -1;
                    card.classList.toggle('is-hidden', !(matchQuery && matchFilter));
                });
            }

            if (input) {
                var params = new URLSearchParams(window.location.search);
                var q = params.get('q');
                if (q) {
                    input.value = q;
                }
                input.addEventListener('input', apply);
            }

            if (clearButton && input) {
                clearButton.addEventListener('click', function () {
                    input.value = '';
                    apply();
                    input.focus();
                });
            }

            filterButtons.forEach(function (button) {
                button.addEventListener('click', function () {
                    currentFilter = button.getAttribute('data-filter-button') || 'all';
                    filterButtons.forEach(function (item) {
                        item.classList.toggle('is-active', item === button);
                    });
                    apply();
                });
            });

            apply();
        });
    }

    function initPlayer() {
        var shell = document.querySelector('[data-player]');
        if (!shell) {
            return;
        }

        var video = shell.querySelector('video');
        var triggers = shell.querySelectorAll('[data-play-trigger]');
        var url = shell.getAttribute('data-m3u8');
        var hlsInstance = null;
        var started = false;

        function attachStream() {
            if (!video || !url || started) {
                return;
            }

            if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: false
                });
                hlsInstance.loadSource(url);
                hlsInstance.attachMedia(video);
            } else {
                video.src = url;
            }

            started = true;
        }

        function play() {
            attachStream();
            shell.classList.add('is-playing');
            if (video) {
                var promise = video.play();
                if (promise && typeof promise.catch === 'function') {
                    promise.catch(function () {});
                }
            }
        }

        triggers.forEach(function (trigger) {
            trigger.addEventListener('click', play);
        });

        if (video) {
            video.addEventListener('click', function () {
                if (!started) {
                    play();
                }
            });
            video.addEventListener('play', function () {
                shell.classList.add('is-playing');
            });
        }

        window.addEventListener('pagehide', function () {
            if (hlsInstance) {
                hlsInstance.destroy();
            }
        });
    }

    document.addEventListener('DOMContentLoaded', function () {
        initHero();
        initFilters();
        initPlayer();
    });
})();
