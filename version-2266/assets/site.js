(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function setupMobileMenu() {
    var button = document.querySelector(".mobile-toggle");
    var panel = document.querySelector(".mobile-panel");
    if (!button || !panel) {
      return;
    }

    button.addEventListener("click", function () {
      var isOpen = button.getAttribute("aria-expanded") === "true";
      button.setAttribute("aria-expanded", String(!isOpen));
      panel.hidden = isOpen;
    });
  }

  function setupHero() {
    var hero = document.querySelector("[data-hero]");
    if (!hero) {
      return;
    }

    var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
    if (slides.length === 0) {
      return;
    }

    var current = 0;

    function showSlide(nextIndex) {
      current = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, index) {
        var active = index === current;
        slide.classList.toggle("is-active", active);
        slide.setAttribute("aria-hidden", active ? "false" : "true");
      });
      dots.forEach(function (dot, index) {
        dot.classList.toggle("is-active", index === current);
      });
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener("click", function () {
        showSlide(index);
      });
    });

    window.setInterval(function () {
      showSlide(current + 1);
    }, 5000);
  }

  function setupImageFallbacks() {
    var images = Array.prototype.slice.call(document.querySelectorAll("img"));
    images.forEach(function (image) {
      image.addEventListener("error", function () {
        var shell = image.closest(".image-shell");
        if (shell) {
          shell.classList.add("image-missing");
        }
        image.classList.add("is-hidden");
      }, { once: true });
    });
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function cardTemplate(movie) {
    var tags = (movie.tags || []).slice(0, 3).map(function (tag) {
      return "<span>" + escapeHtml(tag) + "</span>";
    }).join("");

    return "" +
      "<a class=\"movie-card\" href=\"" + escapeHtml(movie.href) + "\">" +
      "<span class=\"image-shell card-image\" data-fallback=\"" + escapeHtml(movie.title) + "\">" +
      "<img src=\"" + escapeHtml(movie.cover) + "\" alt=\"" + escapeHtml(movie.title) + "\" class=\"poster-img\" loading=\"lazy\" decoding=\"async\">" +
      "<span class=\"play-badge\">▶</span>" +
      "<span class=\"corner-badge\">" + escapeHtml(movie.category) + "</span>" +
      "<span class=\"year-badge\">" + escapeHtml(movie.year) + "</span>" +
      "</span>" +
      "<span class=\"card-body\">" +
      "<strong>" + escapeHtml(movie.title) + "</strong>" +
      "<span class=\"line-clamp-2\">" + escapeHtml(movie.oneLine) + "</span>" +
      "<small>" + escapeHtml(movie.type) + " · " + escapeHtml(movie.region) + "</small>" +
      "<span class=\"tag-row\">" + tags + "</span>" +
      "</span>" +
      "</a>";
  }

  function setupSearch() {
    var form = document.querySelector("[data-search-form]");
    var input = document.querySelector("[data-search-input]");
    var category = document.querySelector("[data-category-filter]");
    var results = document.querySelector("[data-search-results]");
    var title = document.querySelector("[data-search-title]");
    var count = document.querySelector("[data-search-count]");

    if (!form || !input || !results || !window.MOVIE_SEARCH_DATA) {
      return;
    }

    function render(items, label) {
      results.innerHTML = items.map(cardTemplate).join("");
      setupImageFallbacks();
      if (title) {
        title.textContent = label;
      }
      if (count) {
        count.textContent = "共找到 " + items.length + " 部相关影片和剧集。";
      }
    }

    function runSearch() {
      var keyword = input.value.trim().toLowerCase();
      var categoryValue = category ? category.value : "";
      var filtered = window.MOVIE_SEARCH_DATA.filter(function (movie) {
        var text = [
          movie.title,
          movie.year,
          movie.type,
          movie.region,
          movie.category,
          movie.oneLine,
          (movie.tags || []).join(" ")
        ].join(" ").toLowerCase();
        var keywordMatched = !keyword || text.indexOf(keyword) !== -1;
        var categoryMatched = !categoryValue || movie.category === categoryValue;
        return keywordMatched && categoryMatched;
      }).slice(0, 120);
      render(filtered, keyword || categoryValue ? "搜索结果" : "推荐浏览");
    }

    form.addEventListener("submit", function (event) {
      event.preventDefault();
      runSearch();
    });
    input.addEventListener("input", runSearch);
    if (category) {
      category.addEventListener("change", runSearch);
    }
  }

  function setupPlayer(sourceUrl) {
    var video = document.getElementById("movie-player");
    if (!video || !sourceUrl) {
      return;
    }

    var overlay = document.querySelector("[data-player-overlay]");
    var status = document.querySelector("[data-player-status]");

    function setStatus(text) {
      if (status) {
        status.textContent = text;
        status.classList.remove("is-hidden");
      }
    }

    function hideStatus() {
      if (status) {
        status.classList.add("is-hidden");
      }
    }

    function hideOverlay() {
      if (overlay) {
        overlay.classList.add("is-hidden");
      }
    }

    function playVideo() {
      hideOverlay();
      var promise = video.play();
      if (promise && typeof promise.catch === "function") {
        promise.catch(function () {
          if (overlay) {
            overlay.classList.remove("is-hidden");
          }
        });
      }
    }

    function bindNativeSource() {
      video.src = sourceUrl;
      setStatus("播放源已就绪");
    }

    function bindHlsSource() {
      var hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hls.loadSource(sourceUrl);
      hls.attachMedia(video);
      hls.on(Hls.Events.MANIFEST_PARSED, function () {
        setStatus("播放源已就绪");
      });
      hls.on(Hls.Events.ERROR, function (eventName, data) {
        if (data && data.fatal) {
          setStatus("视频加载失败，请刷新重试");
        }
      });
    }

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      bindNativeSource();
    } else if (window.Hls && window.Hls.isSupported()) {
      bindHlsSource();
    } else {
      setStatus("当前浏览器暂不支持播放");
    }

    if (overlay) {
      overlay.addEventListener("click", playVideo);
    }
    video.addEventListener("click", function () {
      if (video.paused) {
        playVideo();
      }
    });
    video.addEventListener("play", function () {
      hideOverlay();
      hideStatus();
    });
  }

  ready(function () {
    setupMobileMenu();
    setupHero();
    setupImageFallbacks();
    setupSearch();
  });

  window.initializeMoviePlayer = function (sourceUrl) {
    ready(function () {
      setupPlayer(sourceUrl);
    });
  };
})();
