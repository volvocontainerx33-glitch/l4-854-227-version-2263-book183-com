(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
      return;
    }
    document.addEventListener("DOMContentLoaded", fn);
  }

  function setupMobileNav() {
    var toggle = document.querySelector("[data-mobile-toggle]");
    var nav = document.querySelector("[data-mobile-nav]");
    if (!toggle || !nav) {
      return;
    }
    toggle.addEventListener("click", function () {
      nav.classList.toggle("is-open");
    });
  }

  function setupSearchForms() {
    var forms = document.querySelectorAll("[data-search-form]");
    forms.forEach(function (form) {
      form.addEventListener("submit", function (event) {
        event.preventDefault();
        var input = form.querySelector("input[name='q']");
        var value = input ? input.value.trim() : "";
        var target = "./search.html";
        if (value) {
          target += "?q=" + encodeURIComponent(value);
        }
        window.location.href = target;
      });
    });
  }

  function setupHero() {
    var hero = document.querySelector("[data-hero]");
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
    if (slides.length <= 1) {
      return;
    }
    var current = 0;
    var timer = null;

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === current);
      });
    }

    function start() {
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5200);
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener("click", function () {
        if (timer) {
          window.clearInterval(timer);
        }
        show(index);
        start();
      });
    });

    show(0);
    start();
  }

  function setupFilters() {
    var panels = document.querySelectorAll("[data-filter-scope]");
    panels.forEach(function (panel) {
      var input = panel.querySelector("[data-filter-input]");
      var typeFilter = panel.querySelector("[data-type-filter]");
      var yearFilter = panel.querySelector("[data-year-filter]");
      var regionFilter = panel.querySelector("[data-region-filter]");
      var cards = Array.prototype.slice.call(panel.querySelectorAll("[data-movie-card]"));
      var empty = panel.querySelector("[data-empty-state]");

      var params = new URLSearchParams(window.location.search);
      var query = params.get("q");
      if (query && input) {
        input.value = query;
      }

      function valueOf(control) {
        return control ? control.value.trim().toLowerCase() : "";
      }

      function apply() {
        var keyword = valueOf(input);
        var type = valueOf(typeFilter);
        var year = valueOf(yearFilter);
        var region = valueOf(regionFilter);
        var visible = 0;

        cards.forEach(function (card) {
          var haystack = (card.getAttribute("data-search") || "").toLowerCase();
          var cardType = (card.getAttribute("data-type") || "").toLowerCase();
          var cardYear = (card.getAttribute("data-year") || "").toLowerCase();
          var cardRegion = (card.getAttribute("data-region") || "").toLowerCase();

          var ok = true;
          if (keyword && haystack.indexOf(keyword) === -1) {
            ok = false;
          }
          if (type && cardType.indexOf(type) === -1) {
            ok = false;
          }
          if (year && cardYear.indexOf(year) === -1) {
            ok = false;
          }
          if (region && cardRegion.indexOf(region) === -1) {
            ok = false;
          }

          card.style.display = ok ? "" : "none";
          if (ok) {
            visible += 1;
          }
        });

        if (empty) {
          empty.classList.toggle("is-visible", visible === 0);
        }
      }

      [input, typeFilter, yearFilter, regionFilter].forEach(function (control) {
        if (control) {
          control.addEventListener("input", apply);
          control.addEventListener("change", apply);
        }
      });

      apply();
    });
  }

  function setupPlayers() {
    var players = document.querySelectorAll("[data-player]");
    players.forEach(function (player) {
      var area = player.querySelector(".player-area");
      var video = player.querySelector("video");
      var overlay = player.querySelector(".player-overlay");
      var button = player.querySelector("[data-play-button]");
      var source = player.getAttribute("data-source") || (video ? video.getAttribute("data-source") : "");
      var started = false;
      var hlsInstance = null;

      if (!area || !video || !source) {
        return;
      }

      function playVideo() {
        var promise = video.play();
        if (promise && typeof promise.catch === "function") {
          promise.catch(function () {});
        }
      }

      function begin() {
        if (!started) {
          started = true;
          if (window.Hls && window.Hls.isSupported()) {
            hlsInstance = new window.Hls({
              enableWorker: true,
              lowLatencyMode: true
            });
            hlsInstance.loadSource(source);
            hlsInstance.attachMedia(video);
            hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
              playVideo();
            });
          } else {
            video.src = source;
            video.addEventListener("loadedmetadata", playVideo, { once: true });
            playVideo();
          }
        } else {
          playVideo();
        }
        area.classList.add("is-playing");
      }

      if (button) {
        button.addEventListener("click", function (event) {
          event.preventDefault();
          begin();
        });
      }

      if (overlay) {
        overlay.addEventListener("click", function () {
          begin();
        });
      }

      video.addEventListener("play", function () {
        area.classList.add("is-playing");
      });

      video.addEventListener("pause", function () {
        if (!video.ended) {
          area.classList.remove("is-playing");
        }
      });

      window.addEventListener("pagehide", function () {
        if (hlsInstance) {
          hlsInstance.destroy();
        }
      });
    });
  }

  ready(function () {
    setupMobileNav();
    setupSearchForms();
    setupHero();
    setupFilters();
    setupPlayers();
  });
})();
