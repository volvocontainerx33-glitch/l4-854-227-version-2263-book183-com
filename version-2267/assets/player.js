var SitePlayer = (function () {
    function start(videoId, buttonId, source) {
        var video = document.getElementById(videoId);
        var button = document.getElementById(buttonId);
        if (!video || !source) {
            return;
        }

        var hlsInstance = null;
        var loaded = false;

        function load() {
            if (loaded) {
                return;
            }
            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = source;
            } else if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hlsInstance.loadSource(source);
                hlsInstance.attachMedia(video);
            } else {
                video.src = source;
            }
            loaded = true;
        }

        function hideButton() {
            if (button) {
                button.classList.add('is-hidden');
            }
        }

        function play() {
            load();
            hideButton();
            var promise = video.play();
            if (promise && promise.catch) {
                promise.catch(function () {});
            }
        }

        load();

        if (button) {
            button.addEventListener('click', play);
        }

        video.addEventListener('click', function () {
            if (video.paused) {
                play();
            }
        });

        video.addEventListener('play', hideButton);
        window.addEventListener('beforeunload', function () {
            if (hlsInstance) {
                hlsInstance.destroy();
            }
        });
    }

    return {
        start: start
    };
})();
