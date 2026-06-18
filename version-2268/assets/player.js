(function () {
  const players = document.querySelectorAll('[data-player]');

  players.forEach(function (player) {
    const video = player.querySelector('video[data-video]');
    const overlay = player.querySelector('[data-play]');
    if (!video || !overlay) {
      return;
    }

    const videoUrl = video.getAttribute('data-video');
    let ready = false;
    let hls = null;

    const attach = function () {
      if (ready || !videoUrl) {
        return;
      }
      ready = true;

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = videoUrl;
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(videoUrl);
        hls.attachMedia(video);
      } else {
        video.src = videoUrl;
      }
    };

    const start = function () {
      attach();
      overlay.classList.add('is-hidden');
      const played = video.play();
      if (played && typeof played.catch === 'function') {
        played.catch(function () {
          overlay.classList.remove('is-hidden');
        });
      }
    };

    overlay.addEventListener('click', start);
    video.addEventListener('play', function () {
      overlay.classList.add('is-hidden');
    });
    video.addEventListener('pause', function () {
      if (video.currentTime === 0 || video.ended) {
        overlay.classList.remove('is-hidden');
      }
    });
    video.addEventListener('ended', function () {
      overlay.classList.remove('is-hidden');
    });
    window.addEventListener('beforeunload', function () {
      if (hls) {
        hls.destroy();
      }
    });
  });
})();
