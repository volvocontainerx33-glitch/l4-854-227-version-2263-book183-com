(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
    } else {
      document.addEventListener("DOMContentLoaded", fn);
    }
  }

  function setupMenu() {
    var toggle = document.querySelector(".menu-toggle");
    var panel = document.querySelector(".mobile-panel");
    if (!toggle || !panel) {
      return;
    }
    toggle.addEventListener("click", function () {
      var opened = !panel.hasAttribute("hidden");
      if (opened) {
        panel.setAttribute("hidden", "");
        toggle.setAttribute("aria-expanded", "false");
      } else {
        panel.removeAttribute("hidden");
        toggle.setAttribute("aria-expanded", "true");
      }
    });
  }

  function setupHero() {
    var root = document.querySelector("[data-hero-carousel]");
    if (!root) {
      return;
    }
    var slides = Array.prototype.slice.call(root.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(root.querySelectorAll("[data-hero-dot]"));
    var prev = root.querySelector("[data-hero-prev]");
    var next = root.querySelector("[data-hero-next]");
    var index = 0;
    var timer;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("is-active", i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("is-active", i === index);
      });
    }

    function start() {
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    function reset(nextIndex) {
      window.clearInterval(timer);
      show(nextIndex);
      start();
    }

    if (next) {
      next.addEventListener("click", function () {
        reset(index + 1);
      });
    }
    if (prev) {
      prev.addEventListener("click", function () {
        reset(index - 1);
      });
    }
    dots.forEach(function (dot, i) {
      dot.addEventListener("click", function () {
        reset(i);
      });
    });
    start();
  }

  function setupFilters() {
    var panels = Array.prototype.slice.call(document.querySelectorAll("[data-filter-panel]"));
    panels.forEach(function (panel) {
      var input = panel.querySelector("[data-search-input]");
      var buttons = Array.prototype.slice.call(panel.querySelectorAll("[data-filter-value]"));
      var cards = Array.prototype.slice.call(panel.querySelectorAll(".movie-card"));
      var active = "all";

      function normalize(value) {
        return (value || "").toString().toLowerCase().trim();
      }

      function apply() {
        var q = normalize(input ? input.value : "");
        cards.forEach(function (card) {
          var text = normalize([
            card.getAttribute("data-title"),
            card.getAttribute("data-category"),
            card.getAttribute("data-genre"),
            card.getAttribute("data-year"),
            card.textContent
          ].join(" "));
          var cat = card.getAttribute("data-category") || "";
          var matchedText = !q || text.indexOf(q) !== -1;
          var matchedCat = active === "all" || cat === active;
          card.classList.toggle("is-hidden-card", !(matchedText && matchedCat));
        });
      }

      if (input) {
        var params = new URLSearchParams(window.location.search);
        if (params.get("q")) {
          input.value = params.get("q");
        }
        input.addEventListener("input", apply);
      }

      buttons.forEach(function (button) {
        button.addEventListener("click", function () {
          active = button.getAttribute("data-filter-value") || "all";
          buttons.forEach(function (item) {
            item.classList.toggle("is-active", item === button);
          });
          apply();
        });
      });

      apply();
    });
  }

  function setupPlayer() {
    var root = document.querySelector("[data-player]");
    if (!root) {
      return;
    }
    var video = root.querySelector("video");
    var overlay = root.querySelector(".player-overlay");
    var stream = root.getAttribute("data-stream");
    var loaded = false;
    var hls = null;

    function attach() {
      if (loaded || !video || !stream) {
        return;
      }
      loaded = true;
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = stream;
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({ enableWorker: true });
        hls.loadSource(stream);
        hls.attachMedia(video);
      } else {
        video.src = stream;
      }
    }

    function play() {
      attach();
      if (overlay) {
        overlay.classList.add("is-hidden");
      }
      video.setAttribute("controls", "controls");
      var promise = video.play();
      if (promise && typeof promise.catch === "function") {
        promise.catch(function () {});
      }
    }

    if (overlay) {
      overlay.addEventListener("click", play);
    }
    video.addEventListener("click", function () {
      if (video.paused) {
        play();
      }
    });
  }

  ready(function () {
    setupMenu();
    setupHero();
    setupFilters();
    setupPlayer();
  });
})();
