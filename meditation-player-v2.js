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
            var cover    = item.querySelector('.med-track-cover');
            var btn      = item.querySelector('.med-play-btn');
            var iconP    = item.querySelector('.med-play-icon');
            var iconPa   = item.querySelector('.med-pause-icon');
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
        document.querySelectorAll('.med-track-item[data-id="' + id + '"] .track-progress-bar').forEach(function(b) { b.style.width = pct; });
        document.querySelectorAll('.med-track-item[data-id="' + id + '"] .med-time').forEach(function(t) { t.textContent = formatTime(audio.currentTime) + ' / ' + formatTime(audio.duration); });
    }

    window.toggleMedTrack = function(id) {
        var med = MEDITATIONS.find(function(m) { return m.id === id; });
        if (!med) return;
        if (currentId && currentId !== id) {
            setPlaying(currentId, false);
            if (audio) audio.pause();
        }
        if (currentId !== id) {
            currentId = id;
            if (audio) { audio.pause(); audio.src = ''; }
            audio = new Audio(med.file);
            audio.addEventListener('timeupdate', function() { updateBars(id); });
            audio.addEventListener('loadedmetadata', function() {
                document.querySelectorAll('.med-track-item[data-id="' + id + '"] .med-time').forEach(function(t) { t.textContent = '0:00 / ' + formatTime(audio.duration); });
            });
            audio.addEventListener('ended', function() {
                setPlaying(id, false);
                document.querySelectorAll('.med-track-item[data-id="' + id + '"] .track-progress-bar').forEach(function(b) { b.style.width = '0%'; });
                document.querySelectorAll('.med-track-item[data-id="' + id + '"] .med-time').forEach(function(t) { t.textContent = '0:00'; });
            });
        }
        if (audio.paused) {
            audio.play().catch(function(e) { console.warn('Erreur:', e); });
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

    window.likeMedTrack = function(e, id) {
        e.stopPropagation();
        var btn = e.currentTarget;
        var liked = btn.getAttribute('data-liked') === '1';
        btn.setAttribute('data-liked', liked ? '0' : '1');
        var heart = btn.querySelector('svg path');
        if (heart) heart.style.fill = liked ? '' : 'rgba(0,200,220,0.9)';
        btn.style.color = liked ? '' : 'rgba(0,200,220,0.9)';
    };

    window.shareMedTrack = function(e, id) {
        e.stopPropagation();
        var btn = e.currentTarget;
        var url = window.location.origin + '/meditations.html';
        if (navigator.share) {
            navigator.share({ title: "Plume d'O² — Méditation", url: url });
        } else {
            navigator.clipboard.writeText(url).catch(function(){});
        }
        btn.style.color = '#00c8dc';
        setTimeout(function() { btn.style.color = ''; }, 2000);
    };

    window.buildMedCards = function(containerId) {
        var container = document.getElementById(containerId);
        if (!container) return;
        container.innerHTML = '';

        MEDITATIONS.forEach(function(med) {
            var div = document.createElement('div');
            div.className = 'track-item med-track-item';
            div.setAttribute('data-id', med.id);

            // Clic sur l'image OU sur le bouton play → toggle audio
            div.innerHTML =
                /* Image cliquable */
                '<img class="track-cover med-track-cover" src="' + med.image + '" alt="' + med.title + '" '
                + 'onclick="toggleMedTrack(' + med.id + ')" '
                + 'onerror="this.src=\'logo-original.jpg\'" '
                + 'style="cursor:pointer;">' +

                /* Infos + barre */
                '<div class="track-info" style="cursor:default;">' +
                    '<span class="track-name">' + med.title + '</span>' +
                    '<span class="track-artist">' + med.author + '</span>' +
                    '<div class="track-progress" onclick="seekMedTrack(event,' + med.id + ')">' +
                        '<div class="track-progress-bar"></div>' +
                    '</div>' +
                '</div>' +

                /* Boutons droite */
                '<div style="display:flex;align-items:center;gap:10px;flex-shrink:0;">' +
                    '<span class="med-time" style="font-family:Montserrat,sans-serif;font-size:10px;color:rgba(255,255,255,0.35);white-space:nowrap;">0:00</span>' +

                    /* ❤️ Coeur */
                    '<button onclick="likeMedTrack(event,' + med.id + ')" title="J\'aime" '
                    + 'style="background:none;border:none;cursor:pointer;color:rgba(255,255,255,0.45);transition:color 0.2s,transform 0.2s;display:flex;align-items:center;padding:3px;"'
                    + 'onmouseover="this.style.transform=\'scale(1.15)\';this.style.color=\'rgba(0,200,220,0.8)\'"'
                    + 'onmouseout="if(this.getAttribute(\'data-liked\')!==\'1\'){this.style.transform=\'\';this.style.color=\'rgba(255,255,255,0.45)\'}">'
                        + '<svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>'
                    + '</button>' +

                    /* 📤 Partage */
                    '<button onclick="shareMedTrack(event,' + med.id + ')" title="Partager" '
                    + 'style="background:none;border:none;cursor:pointer;color:rgba(255,255,255,0.45);transition:color 0.2s,transform 0.2s;display:flex;align-items:center;padding:3px;"'
                    + 'onmouseover="this.style.transform=\'scale(1.15)\';this.style.color=\'rgba(0,200,220,0.8)\'"'
                    + 'onmouseout="this.style.transform=\'\';this.style.color=\'rgba(255,255,255,0.45)\'">'
                        + '<svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/></svg>'
                    + '</button>' +

                    /* ▶ Play/Pause */
                    '<button class="play-btn med-play-btn" onclick="toggleMedTrack(' + med.id + ');event.stopPropagation()" aria-label="Lecture" style="margin-left:2px;">' +
                        '<svg class="med-play-icon" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>' +
                        '<svg class="med-pause-icon" viewBox="0 0 24 24" fill="currentColor" style="display:none"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>' +
                    '</button>' +
                '</div>';

            container.appendChild(div);
        });
    };
})();
