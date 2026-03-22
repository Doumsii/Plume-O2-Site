/* ══ LECTEUR MÉDITATION v2 ════════════════════════════════ */
(function() {
    if (typeof MEDITATIONS === 'undefined') return;

    var currentMed = null;
    var audio = null;

    function formatTime(s) {
        if (isNaN(s)) return '0:00';
        var h   = Math.floor(s / 3600);
        var m   = Math.floor((s % 3600) / 60);
        var sec = Math.floor(s % 60);
        if (h > 0) return h + ':' + pad(m) + ':' + pad(sec);
        return m + ':' + pad(sec);
    }
    function pad(n) { return n < 10 ? '0' + n : n; }

    function getEl(id) { return document.getElementById(id); }

    function stopAll() {
        // Stop any playing card
        document.querySelectorAll('.med-track-card.playing').forEach(function(c) {
            c.classList.remove('playing');
            var pi = c.querySelector('.med-play-icon');
            var pa = c.querySelector('.med-pause-icon');
            if (pi) pi.style.display = 'block';
            if (pa) pa.style.display = 'none';
        });
        if (audio) { audio.pause(); }
    }

    function buildAudio(med) {
        if (audio) { audio.pause(); audio.remove(); }
        audio = new Audio(med.file);
        audio.preload = 'metadata';

        audio.addEventListener('timeupdate', function() {
            updateProgress(med.id);
        });
        audio.addEventListener('loadedmetadata', function() {
            updateProgress(med.id);
        });
        audio.addEventListener('ended', function() {
            var card = document.querySelector('.med-track-card[data-id="' + med.id + '"]');
            if (card) {
                card.classList.remove('playing');
                var pi = card.querySelector('.med-play-icon');
                var pa = card.querySelector('.med-pause-icon');
                if (pi) pi.style.display = 'block';
                if (pa) pa.style.display = 'none';
            }
            resetProgress(med.id);
        });
        audio.addEventListener('error', function() {
            console.warn('Audio non trouvé : ' + med.file);
        });
        return audio;
    }

    function updateProgress(id) {
        if (!audio || !audio.duration) return;
        var fill = document.querySelector('.med-track-card[data-id="' + id + '"] .med-prog-fill');
        var time = document.querySelector('.med-track-card[data-id="' + id + '"] .med-prog-time');
        if (fill) fill.style.width = (audio.currentTime / audio.duration * 100) + '%';
        if (time) time.textContent = formatTime(audio.currentTime) + ' / ' + formatTime(audio.duration);
    }

    function resetProgress(id) {
        var fill = document.querySelector('.med-track-card[data-id="' + id + '"] .med-prog-fill');
        var time = document.querySelector('.med-track-card[data-id="' + id + '"] .med-prog-time');
        if (fill) fill.style.width = '0%';
        if (time) time.textContent = '0:00 / 0:00';
    }

    window.toggleMedTrack = function(id) {
        var med = MEDITATIONS.find(function(m) { return m.id === id; });
        if (!med) return;

        var card = document.querySelector('.med-track-card[data-id="' + id + '"]');
        var pi   = card ? card.querySelector('.med-play-icon')  : null;
        var pa   = card ? card.querySelector('.med-pause-icon') : null;

        // Si c'est un autre track → stop tout et charger le nouveau
        if (!currentMed || currentMed.id !== id) {
            stopAll();
            currentMed = med;
            audio = buildAudio(med);
            audio.play().catch(function(e) { console.warn('Play error:', e); });
            if (card) card.classList.add('playing');
            if (pi) pi.style.display = 'none';
            if (pa) pa.style.display = 'block';
            return;
        }

        // Même track → toggle
        if (audio.paused) {
            audio.play().catch(function(e) { console.warn('Play error:', e); });
            if (card) card.classList.add('playing');
            if (pi) pi.style.display = 'none';
            if (pa) pa.style.display = 'block';
        } else {
            audio.pause();
            if (card) card.classList.remove('playing');
            if (pi) pi.style.display = 'block';
            if (pa) pa.style.display = 'none';
        }
    };

    window.seekMedTrack = function(e, id) {
        e.stopPropagation();
        if (!audio || !currentMed || currentMed.id !== id) return;
        var bar = e.currentTarget;
        var rect = bar.getBoundingClientRect();
        audio.currentTime = ((e.clientX - rect.left) / rect.width) * audio.duration;
    };

    window.saveMedTrack = function(e, id) {
        e.stopPropagation();
        var med = MEDITATIONS.find(function(m) { return m.id === id; });
        if (!med) return;
        var btn = e.currentTarget;
        btn.style.color = '#00c8dc';
        btn.title = 'Sauvegardé !';
        setTimeout(function() {
            btn.style.color = '';
            btn.title = 'Sauvegarder';
        }, 2000);
        // Future : intégrer avec localStorage pour vraie liste de favoris
    };

    // Rebuild cards on page if container exists
    window.buildMedCards = function(containerId) {
        var container = document.getElementById(containerId);
        if (!container) return;
        container.innerHTML = '';

        MEDITATIONS.forEach(function(med) {
            var card = document.createElement('div');
            card.className = 'med-track-card';
            card.setAttribute('data-id', med.id);

            card.innerHTML =
                '<div class="med-card-img-wrap">' +
                    '<img src="' + med.image + '" alt="' + med.title + '" onerror="this.src=\'logo-original.jpg\'">' +
                    '<div class="med-card-overlay"></div>' +
                    '<button class="med-card-play-btn" onclick="toggleMedTrack(' + med.id + ');event.stopPropagation()" aria-label="Lecture">' +
                        '<svg class="med-play-icon" viewBox="0 0 24 24" width="22" height="22" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>' +
                        '<svg class="med-pause-icon" viewBox="0 0 24 24" width="22" height="22" fill="currentColor" style="display:none"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>' +
                    '</button>' +
                '</div>' +
                '<div class="med-card-info">' +
                    '<div class="med-card-title">' + med.title + '</div>' +
                    '<div class="med-card-author">' + med.author + '</div>' +
                    '<div class="med-card-date">' + med.date + '</div>' +
                    '<div class="med-prog-bar" onclick="seekMedTrack(event,' + med.id + ')">' +
                        '<div class="med-prog-fill"></div>' +
                    '</div>' +
                    '<div class="med-card-bottom">' +
                        '<span class="med-prog-time">0:00 / 0:00</span>' +
                        '<div class="med-card-actions">' +
                            '<button class="med-action-btn" onclick="saveMedTrack(event,' + med.id + ')" title="Sauvegarder">' +
                                '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z"/></svg>' +
                            '</button>' +
                            '<button class="med-action-btn" onclick="shareMedTrack(event,' + med.id + ')" title="Partager">' +
                                '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/></svg>' +
                            '</button>' +
                        '</div>' +
                    '</div>' +
                '</div>';

            container.appendChild(card);
        });
    };

    window.shareMedTrack = function(e, id) {
        e.stopPropagation();
        navigator.clipboard.writeText(window.location.origin + '/meditations.html').then(function() {
            var btn = e.currentTarget;
            btn.style.color = '#00c8dc';
            setTimeout(function() { btn.style.color = ''; }, 2000);
        });
    };
})();
