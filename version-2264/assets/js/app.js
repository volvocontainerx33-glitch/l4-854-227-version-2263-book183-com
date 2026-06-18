(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
      return;
    }
    document.addEventListener("DOMContentLoaded", fn);
  }

  function initMenu() {
    var toggle = document.querySelector("[data-menu-toggle]");
    var nav = document.querySelector("[data-mobile-nav]");
    if (!toggle || !nav) {
      return;
    }
    toggle.addEventListener("click", function () {
      nav.classList.toggle("is-open");
    });
  }

  function initCarousel() {
    var carousel = document.querySelector("[data-carousel]");
    if (!carousel) {
      return;
    }
    var slides = Array.prototype.slice.call(carousel.querySelectorAll("[data-slide]"));
    var dots = Array.prototype.slice.call(carousel.querySelectorAll("[data-slide-dot]"));
    if (!slides.length) {
      return;
    }
    var current = 0;
    var timer = null;

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("is-active", i === current);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("is-active", i === current);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener("click", function () {
        show(index);
        start();
      });
    });

    carousel.addEventListener("mouseenter", stop);
    carousel.addEventListener("mouseleave", start);
    show(0);
    start();
  }

  function normalize(value) {
    return String(value || "").toLowerCase().replace(/\s+/g, "");
  }

  function initFilters() {
    var grids = Array.prototype.slice.call(document.querySelectorAll("[data-filter-grid]"));
    if (!grids.length) {
      return;
    }
    var search = document.querySelector(".js-search");
    var region = document.querySelector(".js-filter-region");
    var type = document.querySelector(".js-filter-type");
    var empty = document.querySelector(".filter-empty");
    var cards = [];
    grids.forEach(function (grid) {
      cards = cards.concat(Array.prototype.slice.call(grid.querySelectorAll(".movie-card")));
    });

    function apply() {
      var q = normalize(search && search.value);
      var regionValue = region ? region.value : "";
      var typeValue = type ? type.value : "";
      var visible = 0;
      cards.forEach(function (card) {
        var haystack = normalize([
          card.getAttribute("data-title"),
          card.getAttribute("data-region"),
          card.getAttribute("data-type"),
          card.getAttribute("data-year"),
          card.getAttribute("data-keywords")
        ].join(" "));
        var matchesText = !q || haystack.indexOf(q) !== -1;
        var matchesRegion = !regionValue || card.getAttribute("data-region") === regionValue;
        var matchesType = !typeValue || card.getAttribute("data-type") === typeValue;
        var show = matchesText && matchesRegion && matchesType;
        card.hidden = !show;
        if (show) {
          visible += 1;
        }
      });
      if (empty) {
        empty.hidden = visible !== 0;
      }
    }

    [search, region, type].forEach(function (element) {
      if (element) {
        element.addEventListener("input", apply);
        element.addEventListener("change", apply);
      }
    });
  }

  function initPlayers() {
    var shells = Array.prototype.slice.call(document.querySelectorAll("[data-player-shell]"));
    shells.forEach(function (shell) {
      var video = shell.querySelector("video");
      var start = shell.querySelector("[data-player-start]");
      if (!video) {
        return;
      }
      var source = video.getAttribute("data-src");
      var hlsInstance = null;
      var loaded = false;

      function loadSource() {
        if (loaded || !source) {
          return;
        }
        loaded = true;
        if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hlsInstance.loadSource(source);
          hlsInstance.attachMedia(video);
        } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = source;
        } else {
          video.src = source;
        }
      }

      function play() {
        loadSource();
        if (start) {
          start.classList.add("is-hidden");
        }
        var promise = video.play();
        if (promise && typeof promise.catch === "function") {
          promise.catch(function () {
            video.controls = true;
          });
        }
      }

      if (start) {
        start.addEventListener("click", play);
      }
      video.addEventListener("click", function () {
        if (video.paused) {
          play();
        }
      });
      video.addEventListener("play", function () {
        if (start) {
          start.classList.add("is-hidden");
        }
      });
      window.addEventListener("pagehide", function () {
        if (hlsInstance) {
          hlsInstance.destroy();
        }
      });
    });
  }

  function initImageHandling() {
    Array.prototype.slice.call(document.querySelectorAll("img")).forEach(function (img) {
      if (img.complete && img.naturalWidth === 0) {
        img.classList.add("image-missing");
      }
      img.addEventListener("error", function () {
        img.classList.add("image-missing");
      });
    });
  }

  ready(function () {
    initMenu();
    initCarousel();
    initFilters();
    initPlayers();
    initImageHandling();
  });
})();
