(function () {
  var players = Array.prototype.slice.call(document.querySelectorAll('.site-player'));
  players.forEach(function (player) {
    var video = player.querySelector('video');
    var overlay = player.querySelector('.player-overlay');
    var message = player.querySelector('.player-message');
    var streamUrl = player.getAttribute('data-stream');
    var started = false;
    var hlsInstance = null;

    function showMessage(text) {
      if (message) {
        message.textContent = text;
      }
    }

    function playVideo() {
      var promise = video.play();
      if (promise && typeof promise.catch === 'function') {
        promise.catch(function () {
          showMessage('点击视频继续播放');
        });
      }
    }

    function start() {
      if (!video || !streamUrl) {
        showMessage('视频暂时无法加载');
        return;
      }

      if (started) {
        playVideo();
        return;
      }

      started = true;
      video.controls = true;
      if (overlay) {
        overlay.classList.add('hidden');
      }
      showMessage('');

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = streamUrl;
        playVideo();
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hlsInstance.loadSource(streamUrl);
        hlsInstance.attachMedia(video);
        hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
          playVideo();
        });
        hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
          if (data && data.fatal) {
            showMessage('视频加载失败');
          }
        });
        return;
      }

      showMessage('视频暂时无法播放');
    }

    if (overlay) {
      overlay.addEventListener('click', start);
    }

    if (video) {
      video.addEventListener('click', function () {
        if (!started) {
          start();
        }
      });
    }

    window.addEventListener('pagehide', function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  });
})();
