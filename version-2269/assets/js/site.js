(function () {
    var mobileToggle = document.querySelector('[data-mobile-toggle]');
    var mobileNav = document.querySelector('[data-mobile-nav]');

    if (mobileToggle && mobileNav) {
        mobileToggle.addEventListener('click', function () {
            mobileNav.classList.toggle('is-open');
        });
    }

    function setupHeroSlider() {
        var slider = document.querySelector('[data-hero-slider]');
        if (!slider) {
            return;
        }

        var slides = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-dot]'));
        var prevButton = slider.querySelector('[data-hero-prev]');
        var nextButton = slider.querySelector('[data-hero-next]');
        var currentIndex = 0;
        var timer = null;

        function showSlide(index) {
            if (!slides.length) {
                return;
            }

            currentIndex = (index + slides.length) % slides.length;

            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === currentIndex);
            });

            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === currentIndex);
            });
        }

        function nextSlide() {
            showSlide(currentIndex + 1);
        }

        function startTimer() {
            stopTimer();
            timer = window.setInterval(nextSlide, 5000);
        }

        function stopTimer() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        dots.forEach(function (dot, index) {
            dot.addEventListener('click', function () {
                showSlide(index);
                startTimer();
            });
        });

        if (prevButton) {
            prevButton.addEventListener('click', function () {
                showSlide(currentIndex - 1);
                startTimer();
            });
        }

        if (nextButton) {
            nextButton.addEventListener('click', function () {
                nextSlide();
                startTimer();
            });
        }

        slider.addEventListener('mouseenter', stopTimer);
        slider.addEventListener('mouseleave', startTimer);
        showSlide(0);
        startTimer();
    }

    function setupSearchPage() {
        var page = document.querySelector('[data-search-page]');
        if (!page) {
            return;
        }

        var params = new URLSearchParams(window.location.search);
        var keywordInput = page.querySelector('[data-search-input]');
        var regionFilter = page.querySelector('[data-region-filter]');
        var genreFilter = page.querySelector('[data-genre-filter]');
        var yearFilter = page.querySelector('[data-year-filter]');
        var cards = Array.prototype.slice.call(page.querySelectorAll('[data-movie-card]'));
        var countNode = page.querySelector('[data-result-count]');

        if (keywordInput && params.get('q')) {
            keywordInput.value = params.get('q');
        }

        function normalize(value) {
            return String(value || '').trim().toLowerCase();
        }

        function applyFilters() {
            var keyword = normalize(keywordInput && keywordInput.value);
            var region = normalize(regionFilter && regionFilter.value);
            var genre = normalize(genreFilter && genreFilter.value);
            var year = normalize(yearFilter && yearFilter.value);
            var visibleCount = 0;

            cards.forEach(function (card) {
                var haystack = normalize(card.getAttribute('data-search'));
                var cardRegion = normalize(card.getAttribute('data-region'));
                var cardYear = normalize(card.getAttribute('data-year'));
                var cardGenre = normalize(card.getAttribute('data-genre'));
                var matchesKeyword = !keyword || haystack.indexOf(keyword) !== -1;
                var matchesRegion = !region || cardRegion.indexOf(region) !== -1;
                var matchesGenre = !genre || haystack.indexOf(genre) !== -1 || cardGenre.indexOf(genre) !== -1;
                var matchesYear = !year || cardYear.indexOf(year) !== -1;
                var isVisible = matchesKeyword && matchesRegion && matchesGenre && matchesYear;

                card.style.display = isVisible ? '' : 'none';
                if (isVisible) {
                    visibleCount += 1;
                }
            });

            if (countNode) {
                countNode.textContent = visibleCount;
            }
        }

        [keywordInput, regionFilter, genreFilter, yearFilter].forEach(function (control) {
            if (!control) {
                return;
            }

            control.addEventListener('input', applyFilters);
            control.addEventListener('change', applyFilters);
        });

        applyFilters();
    }

    function setupPlayers() {
        var players = Array.prototype.slice.call(document.querySelectorAll('[data-player]'));

        players.forEach(function (frame) {
            var video = frame.querySelector('video[data-src]');
            var button = frame.querySelector('[data-player-button]');
            var hlsInstance = null;
            var initialized = false;

            if (!video || !button) {
                return;
            }

            function initializeSource() {
                if (initialized) {
                    return;
                }

                var source = video.getAttribute('data-src');
                initialized = true;

                if (!source) {
                    return;
                }

                if (video.canPlayType('application/vnd.apple.mpegurl')) {
                    video.src = source;
                    return;
                }

                if (window.Hls && window.Hls.isSupported()) {
                    hlsInstance = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: false,
                        backBufferLength: 90
                    });
                    hlsInstance.loadSource(source);
                    hlsInstance.attachMedia(video);
                    return;
                }

                video.src = source;
            }

            function playVideo() {
                initializeSource();
                button.classList.add('is-hidden');
                var playPromise = video.play();

                if (playPromise && typeof playPromise.catch === 'function') {
                    playPromise.catch(function () {
                        button.classList.remove('is-hidden');
                    });
                }
            }

            button.addEventListener('click', playVideo);

            video.addEventListener('play', function () {
                button.classList.add('is-hidden');
            });

            video.addEventListener('pause', function () {
                button.classList.remove('is-hidden');
            });

            video.addEventListener('ended', function () {
                button.classList.remove('is-hidden');
            });

            window.addEventListener('beforeunload', function () {
                if (hlsInstance) {
                    hlsInstance.destroy();
                }
            });
        });
    }

    setupHeroSlider();
    setupSearchPage();
    setupPlayers();
})();
