/* ══ LECTEUR MÉDITATION v2 — Dynamique ════════════════════ */
(function() {
    if (typeof MEDITATIONS === 'undefined') return;

    var lang = localStorage.getItem('plumedo2_lang') || 'fr';
    var currentMed = MEDITATIONS[0]; // Toujours la plus récente
    var audio = document.getElementById('meditation-audio');
    var card  = document.getElementById('med-card');
    var iconPlay  = document.getElementById('med-icon-play');
    var iconPause = document.getElementById('med-icon-pause');
    var fill  = document.getElementById('med-progress-fill');
    var bar   = document.getElementById('med-progress-bar');
    var time  = document.getElementById('med-time');
    var titleEl  = document.getElementById('med-track-title');
    var authorEl = document.getElementById('med-track-author');
    var descEl   = document.getElementById('med-track-desc');
    var dateEl   = document.getElementById('med-track-date');

    if (!audio || !card) return;

    function getLang() {
        return localStorage.getItem('plumedo2_lang') || 'fr';
    }

    function loadMeditation(med) {
        currentMed = med;
        var l = getLang();
        var d = med[l] || med.fr;
        if (titleEl)  titleEl.textContent  = d.title;
        if (authorEl) authorEl.textContent = d.author;
        if (descEl)   descEl.textContent   = d.desc;
        if (dateEl)   dateEl.textContent   = med.date;
        audio.src = med.file;
        audio.load();
        // Stop current
        card.classList.remove('playing');
        iconPlay.style.display  = 'block';
        iconPause.style.display = 'none';
        fill.style.width = '0%';
        time.textContent = '0:00 / 0:00';
    }

    function formatTime(s) {
        var h   = Math.floor(s / 3600);
        var m   = Math.floor((s % 3600) / 60);
        var sec = Math.floor(s % 60);
        if (h > 0) {
            return h + ':' + (m < 10 ? '0' : '') + m + ':' + (sec < 10 ? '0' : '') + sec;
        }
        return m + ':' + (sec < 10 ? '0' : '') + sec;
    }

    audio.addEventListener('timeupdate', function() {
        if (!audio.duration) return;
        fill.style.width = (audio.currentTime / audio.duration * 100) + '%';
        time.textContent = formatTime(audio.currentTime) + ' / ' + formatTime(audio.duration);
    });

    audio.addEventListener('loadedmetadata', function() {
        time.textContent = '0:00 / ' + formatTime(audio.duration);
    });

    audio.addEventListener('ended', function() {
        card.classList.remove('playing');
        iconPlay.style.display  = 'block';
        iconPause.style.display = 'none';
        fill.style.width = '0%';
    });

    window.toggleMeditation = function() {
        if (audio.paused) {
            audio.play();
            card.classList.add('playing');
            iconPlay.style.display  = 'none';
            iconPause.style.display = 'block';
        } else {
            audio.pause();
            card.classList.remove('playing');
            iconPlay.style.display  = 'block';
            iconPause.style.display = 'none';
        }
    };

    window.seekMeditation = function(e) {
        e.stopPropagation();
        var rect = bar.getBoundingClientRect();
        audio.currentTime = ((e.clientX - rect.left) / rect.width) * audio.duration;
    };

    window.playMedById = function(id) {
        var med = MEDITATIONS.find(function(m) { return m.id === id; });
        if (med) loadMeditation(med);
    };

    // Init
    loadMeditation(currentMed);

    // Reload text on language change
    document.querySelectorAll('.lang-btn').forEach(function(btn) {
        btn.addEventListener('click', function() {
            setTimeout(function() { loadMeditation(currentMed); }, 50);
        });
    });
})();
