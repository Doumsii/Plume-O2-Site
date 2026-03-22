/* ══ LECTEUR MÉDITATIONS — Style track-item ══════════════ */
(function() {
    if (typeof MEDITATIONS === 'undefined') return;

    var currentId  = null;
    var audio      = null;
    var isPlaying  = false;

    function pad(n) { return n < 10 ? '0' + n : '' + n; }
    function formatTime(s) {
        if (!s || isNaN(s)) return '0:00';
        var h = Math.floor(s / 3600);
        var m = Math.floor((s % 3600) / 60);
        var sec = Math.floor(s % 60);
        return h > 0 ? h + ':' + pad(m) + ':' + pad(sec) : m + ':' + pad(sec);
    }

    function setUI(id, playing) {
        document.querySelectorAll('.med-track-item[data-id="' + id + '"]').forEach(function(item) {
            var cover = item.querySelector('.med-track-cover');
            var playBtn = item.querySelector('.med-play-btn');
            var playIcon  = item.querySelector('.med-play-icon');
            var pauseIcon = item.querySelector('.med-pause-icon');
            if (playing) {
                item.classList.add('active');
                if (cover)     cover.classList.add('playing-cover');
                if (playBtn)   playBtn.classList.add('playing');
                if (playIcon)  playIcon.style.display = 'none';
                if (pauseIcon) pauseIcon.style.display = 'block';
            } else {
                item.classList.remove('active');
                if (cover)     cover.classList.remove('playing-cover');
                if (playBtn)   playBtn.classList.remove('playing');
                if (playIcon)  playIcon.style.display = 'block';
                if (pauseIcon) pauseIcon.style.display = 'none';
            }
        });
    }

    function resetUI(id) {
        setUI(id, false);
        document.querySelectorAll('.med-track-item[data-id="' + id + '"] .med-prog-bar').forEach(function(b) { b.style.width = '0%'; });
        document.querySelectorAll('.med-track-item[data-id="' + id + '"] .med-prog-time').forEach(function(t) { t.textContent = '0:00 / 0:00'; });
    }

    function buildAudio(med) {
        if (audio) { audio.pause(); audio.src = ''; }
        audio = new Audio(med.file);
        audio.addEventListener('timeupdate', function() {
            if (!audio.duration) return;
            var pct = (audio.currentTime / audio.duration * 100).toFixed(1) + '%';
            document.querySelectorAll('.med-track-item[data-id="' + med.id + '"] .med-prog-bar').forEach(function(b) { b.style.width = pct; });
            document.querySelectorAll('.med-track-item[data-id="' + med.id + '"] .med-prog-time').forEach(function(t) { t.textContent = formatTime(audio.currentTime) + ' / ' + formatTime(audio.duration); });
        });
        audio.addEventListener('loadedmetadata', function() {
            document.querySelectorAll('.med-track-item[data-id="' + med.id + '"] .med-prog-time').forEach(function(t) { t.textContent = '0:00 / ' + formatTime(audio.duration); });
        });
        audio.addEventListener('ended', function() {
            isPlaying = false;
            resetUI(med.id);
        });
        audio.addEventListener('error', function() { console.warn('Audio introuvable: ' + med.file); });
        return audio;
    }

    window.toggleMedTrack = function(id) {
        var med = MEDITATIONS.find(function(m) { return m.id === id; });
        if (!med) return;

        if (currentId && currentId !== id) {
            setUI(currentId, false);
            audio.pause();
        }

        if (currentId !== id) {
            currentId = id;
            audio = buildAudio(med);
        }

        if (audio.paused) {
            audio.play().catch(function(e) { console.warn('Lecture impossible:', e); });
            isPlaying = true;
            setUI(id, true);
        } else {
            audio.pause();
            isPlaying = false;
            setUI(id, false);
        }
    };

    window.seekMedTrack = function(e, id) {
        e.stopPropagation();
        if (!audio || currentId !== id || !audio.duration) return;
        var bar = e.currentTarget;
        var rect = bar.getBoundingClientRect();
        audio.currentTime = ((e.clientX - rect.left) / rect.width) * audio.duration;
    };

    window.saveMedTrack = function(e, id) {
        e.stopPropagation();
        var btn = e.currentTarget;
        var saved = btn.getAttribute('data-saved') === '1';
        btn.setAttribute('data-saved', saved ? '0' : '1');
        btn.style.color = saved ? '' : 'rgba(0,200,220,0.9)';
        btn.style.fill  = saved ? '' : 'rgba(0,200,220,0.9)';
    };

    window.shareMedTrack = function(e, id) {
        e.stopPropagation();
        var btn = e.currentTarget;
        navigator.clipboard.writeText(window.location.origin + '/meditations.html').then(function() {
            btn.style.color = 'rgba(0,200,220,0.9)';
            setTimeout(function() { btn.style.color = ''; }, 2000);
        });
    };

    window.buildMedCards = function(containerId) {
        var container = document.getElementById(containerId);
        if (!container) return;
        container.innerHTML = '';
        MEDITATIONS.forEach(function(med) {
            var li = document.createElement('div');
            li.className = 'track-item med-track-item';
            li.setAttribute('data-id', med.id);
            li.innerHTML =
                '<img class="track-cover med-track-cover" src="' + med.image + '" alt="' + med.title + '" onerror="this.src='logo-original.jpg'">' +
                '<div class="track-info">' +
                    '<span class="track-name">' + med.title + '</span>' +
                    '<span class="track-artist">' + med.author + '</span>' +
                    '<div class="track-progress" style="opacity:1;">' +
                        '<div class="track-progress-bar med-prog-bar" style="width:0%"></div>' +
                    '</div>' +
                '</div>' +
                '<span class="med-prog-time" style="font-family:Montserrat,sans-serif;font-size:10px;color:rgba(255,255,255,0.35);margin-right:8px;white-space:nowrap;">0:00 / 0:00</span>' +
                '<div style="display:flex;gap:6px;align-items:center;">' +
                    '<button class="med-action-btn" onclick="saveMedTrack(event,' + med.id + ')" title="Sauvegarder" style="background:none;border:none;cursor:pointer;color:rgba(255,255,255,0.4);transition:color 0.2s;display:flex;padding:2px;">' +
                        '<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z"/></svg>' +
                    '</button>' +
                    '<button class="med-action-btn" onclick="shareMedTrack(event,' + med.id + ')" title="Partager" style="background:none;border:none;cursor:pointer;color:rgba(255,255,255,0.4);transition:color 0.2s;display:flex;padding:2px;">' +
                        '<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/></svg>' +
                    '</button>' +
                    '<button class="play-btn med-play-btn" onclick="toggleMedTrack(' + med.id + ');event.stopPropagation()" aria-label="Lecture">' +
                        '<svg class="med-play-icon" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>' +
                        '<svg class="med-pause-icon" viewBox="0 0 24 24" fill="currentColor" style="display:none"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>' +
                    '</button>' +
                '</div>';
            container.appendChild(li);
        });
    };
})();
