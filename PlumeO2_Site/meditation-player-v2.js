(function() {
    if (typeof MEDITATIONS === 'undefined') return;

    var currentId = null;
    var audio = null;

    function pad(n) { return n < 10 ? '0' + n : '' + n; }

    function formatTime(s) {
        if (!s || isNaN(s)) return '0:00';
        var h = Math.floor(s / 3600);
        var m = Math.floor((s % 3600) / 60);
        var sec = Math.floor(s % 60);
        if (h > 0) return h + ':' + pad(m) + ':' + pad(sec);
        return m + ':' + pad(sec);
    }

    function setPlaying(id, playing) {
        document.querySelectorAll('.med-track-item[data-id="' + id + '"]').forEach(function(item) {
            var cover   = item.querySelector('.med-track-cover');
            var btn     = item.querySelector('.med-play-btn');
            var iconP   = item.querySelector('.med-play-icon');
            var iconPa  = item.querySelector('.med-pause-icon');
            var progress = item.querySelector('.track-progress');
            if (playing) {
                item.classList.add('active');
                if (cover)    cover.classList.add('playing-cover');
                if (btn)      btn.classList.add('playing');
                if (iconP)    iconP.style.display = 'none';
                if (iconPa)   iconPa.style.display = 'block';
                if (progress) progress.style.opacity = '1';
            } else {
                item.classList.remove('active');
                if (cover)    cover.classList.remove('playing-cover');
                if (btn)      btn.classList.remove('playing');
                if (iconP)    iconP.style.display = 'block';
                if (iconPa)   iconPa.style.display = 'none';
            }
        });
    }

    function updateBars(id) {
        if (!audio || !audio.duration) return;
        var pct = (audio.currentTime / audio.duration * 100).toFixed(1) + '%';
        document.querySelectorAll('.med-track-item[data-id="' + id + '"] .track-progress-bar').forEach(function(b) {
            b.style.width = pct;
        });
        document.querySelectorAll('.med-track-item[data-id="' + id + '"] .med-time').forEach(function(t) {
            t.textContent = formatTime(audio.currentTime) + ' / ' + formatTime(audio.duration);
        });
    }

    window.toggleMedTrack = function(id) {
        var med = MEDITATIONS.find(function(m) { return m.id === id; });
        if (!med) return;

        // Arrêter le track précédent
        if (currentId && currentId !== id) {
            setPlaying(currentId, false);
            if (audio) audio.pause();
        }

        // Nouveau track
        if (currentId !== id) {
            currentId = id;
            if (audio) { audio.pause(); audio.src = ''; }
            audio = new Audio(med.file);
            audio.addEventListener('timeupdate', function() { updateBars(id); });
            audio.addEventListener('loadedmetadata', function() {
                document.querySelectorAll('.med-track-item[data-id="' + id + '"] .med-time').forEach(function(t) {
                    t.textContent = '0:00 / ' + formatTime(audio.duration);
                });
            });
            audio.addEventListener('ended', function() {
                setPlaying(id, false);
                document.querySelectorAll('.med-track-item[data-id="' + id + '"] .track-progress-bar').forEach(function(b) { b.style.width = '0%'; });
            });
        }

        if (audio.paused) {
            audio.play().catch(function(e) { console.warn('Erreur lecture:', e); });
            setPlaying(id, true);
        } else {
            audio.pause();
            setPlaying(id, false);
        }
    };

    window.seekMedTrack = function(e, id) {
        e.stopPropagation();
        if (!audio || currentId !== id || !audio.duration) return;
        var rect = e.currentTarget.getBoundingClientRect();
        audio.currentTime = ((e.clientX - rect.left) / rect.width) * audio.duration;
    };

    window.saveMedTrack = function(e, id) {
        e.stopPropagation();
        var btn = e.currentTarget;
        var saved = btn.getAttribute('data-saved') === '1';
        btn.setAttribute('data-saved', saved ? '0' : '1');
        btn.style.color = saved ? '' : '#00c8dc';
    };

    window.shareMedTrack = function(e, id) {
        e.stopPropagation();
        var btn = e.currentTarget;
        navigator.clipboard.writeText(window.location.origin + '/meditations.html').then(function() {
            btn.style.color = '#00c8dc';
            setTimeout(function() { btn.style.color = ''; }, 2000);
        });
    };

    window.buildMedCards = function(containerId) {
        var container = document.getElementById(containerId);
        if (!container) return;
        container.innerHTML = '';

        MEDITATIONS.forEach(function(med) {
            var div = document.createElement('div');
            div.className = 'track-item med-track-item';
            div.setAttribute('data-id', med.id);

            div.innerHTML =
                '<img class="track-cover med-track-cover" src="' + med.image + '" alt="' + med.title + '" onerror="this.src=\'logo-original.jpg\'">' +
                '<div class="track-info">' +
                    '<span class="track-name">' + med.title + '</span>' +
                    '<span class="track-artist">' + med.author + '</span>' +
                    '<div class="track-progress" onclick="seekMedTrack(event,' + med.id + ')">' +
                        '<div class="track-progress-bar"></div>' +
                    '</div>' +
                '</div>' +
                '<span class="med-time" style="font-family:Montserrat,sans-serif;font-size:10px;color:rgba(255,255,255,0.35);margin:0 8px;white-space:nowrap;flex-shrink:0;">0:00</span>' +
                '<div style="display:flex;gap:6px;align-items:center;flex-shrink:0;">' +
                    '<button onclick="saveMedTrack(event,' + med.id + ')" title="Sauvegarder" style="background:none;border:none;cursor:pointer;color:rgba(255,255,255,0.4);transition:color 0.2s;display:flex;padding:2px;">' +
                        '<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z"/></svg>' +
                    '</button>' +
                    '<button onclick="shareMedTrack(event,' + med.id + ')" title="Partager" style="background:none;border:none;cursor:pointer;color:rgba(255,255,255,0.4);transition:color 0.2s;display:flex;padding:2px;">' +
                        '<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/></svg>' +
                    '</button>' +
                    '<button class="play-btn med-play-btn" onclick="toggleMedTrack(' + med.id + ');event.stopPropagation()" aria-label="Lecture">' +
                        '<svg class="med-play-icon" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>' +
                        '<svg class="med-pause-icon" viewBox="0 0 24 24" fill="currentColor" style="display:none"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>' +
                    '</button>' +
                '</div>';

            container.appendChild(div);
        });
    };
})();
