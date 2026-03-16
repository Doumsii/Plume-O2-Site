/* ============================================================
   PLUME D'O² — Lecteur audio
   Ajoute avant </body> :
   <script src="plumedo2-player.js"></script>
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {

  /* ── CONFIG : associe chaque track à son fichier audio ── */
  const TRACKS = [
    {
      name:   'Al Kahf',
      artist: 'Ustadh Idriss',
      cover:  'pochette1.jpg',
      src:    'extrait-alkahf.mp3',
      spotify:'https://open.spotify.com/intl-fr/artist/3QGBoMKOchcr6qyKXZOab5'
    },
    {
      name:   'Ayat Al Kursy',
      artist: 'Oways Ahmad',
      cover:  'pochette3.jpg',
      src:    'extrait-ayat-alkursy.mp3',
      spotify:'https://open.spotify.com/intl-fr/artist/3QGBoMKOchcr6qyKXZOab5'
    },
    {
      name:   'Al Asr',
      artist: 'Ustadh Muhammad',
      cover:  'pochette5.jpg',
      src:    'extrait-alasr.mp3',
      spotify:'https://open.spotify.com/intl-fr/artist/3QGBoMKOchcr6qyKXZOab5'
    },
    {
      name:   'Al Fatiha',
      artist: 'Ustadh Mounir',
      cover:  'pochette4.jpg',
      src:    'extrait-alfatiha.mp3',
      spotify:'https://open.spotify.com/intl-fr/artist/3QGBoMKOchcr6qyKXZOab5'
    },
    {
      name:   'Morning Invocations',
      artist: 'Oways Ahmad',
      cover:  'pochette2.jpg',
      src:    'extrait-morning-invocations.mp3',
      spotify:'https://open.spotify.com/intl-fr/artist/3QGBoMKOchcr6qyKXZOab5'
    },
    {
      name:   'Sourate Al Baqara',
      artist: 'Oways Ahmad',
      cover:  'pochette6.jpg',
      src:    'extrait-albaqara.mp3',
      spotify:'https://open.spotify.com/intl-fr/artist/3QGBoMKOchcr6qyKXZOab5'
    }
  ];

  /* ── ICÔNES SVG ─────────────────────────────────────── */
  const ICON_PLAY = `<svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>`;
  const ICON_PAUSE = `<svg viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>`;

  /* ── ÉTAT ───────────────────────────────────────────── */
  let audio       = new Audio();
  let currentIdx  = null;
  let isPlaying   = false;

  /* ── MINI PLAYER HTML ───────────────────────────────── */
  const miniPlayer = document.createElement('div');
  miniPlayer.className = 'mini-player';
  miniPlayer.innerHTML = `
    <img class="mini-player-cover" src="" alt="">
    <div class="mini-player-info">
      <div class="mini-player-title"></div>
      <div class="mini-player-artist"></div>
    </div>
    <div class="mini-player-controls">
      <button class="mini-play-btn">${ICON_PLAY}</button>
      <a class="mini-spotify-btn" href="#" target="_blank" rel="noopener">Spotify ↗</a>
    </div>
    <button class="mini-close-btn">✕</button>
    <div class="mini-player-progress">
      <div class="mini-player-progress-bar"></div>
    </div>
  `;
  document.body.appendChild(miniPlayer);

  const miniCover    = miniPlayer.querySelector('.mini-player-cover');
  const miniTitle    = miniPlayer.querySelector('.mini-player-title');
  const miniArtist   = miniPlayer.querySelector('.mini-player-artist');
  const miniPlayBtn  = miniPlayer.querySelector('.mini-play-btn');
  const miniSpotify  = miniPlayer.querySelector('.mini-spotify-btn');
  const miniClose    = miniPlayer.querySelector('.mini-close-btn');
  const miniProgress = miniPlayer.querySelector('.mini-player-progress-bar');

  /* ── AJOUTER LES BOUTONS PLAY SUR CHAQUE TRACK ─────── */
  const trackItems = document.querySelectorAll('.track-item');

  trackItems.forEach((item, idx) => {
    const track = TRACKS[idx];
    if (!track) return;

    // Ajouter attribut data
    item.dataset.trackIdx = idx;

    // Créer bouton play
    const btn = document.createElement('button');
    btn.className = 'play-btn';
    btn.innerHTML = ICON_PLAY;
    btn.setAttribute('aria-label', `Écouter ${track.name}`);
    item.appendChild(btn);

    // Créer barre de progression
    const progressWrap = document.createElement('div');
    progressWrap.className = 'track-progress';
    progressWrap.innerHTML = `<div class="track-progress-bar"></div>`;
    item.appendChild(progressWrap);

    // Clic sur le bouton ou la track
    item.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      handlePlay(idx, item, track);
    });
  });

  /* ── LOGIQUE DE LECTURE ─────────────────────────────── */
  function handlePlay(idx, item, track) {
    if (currentIdx === idx) {
      // Même track : toggle play/pause
      isPlaying ? pauseAudio() : resumeAudio();
    } else {
      // Nouvelle track
      stopCurrent();
      playTrack(idx, item, track);
    }
  }

  function playTrack(idx, item, track) {
    currentIdx = idx;
    audio.src  = track.src;
    audio.play().catch(() => {
      console.warn('Lecture impossible :', track.src);
    });
    isPlaying = true;
    updateUI(idx, item, track, true);
  }

  function pauseAudio() {
    audio.pause();
    isPlaying = false;
    updatePlayButtons(false);
  }

  function resumeAudio() {
    audio.play();
    isPlaying = true;
    updatePlayButtons(true);
  }

  function stopCurrent() {
    audio.pause();
    audio.currentTime = 0;
    isPlaying = false;
    // Reset toutes les tracks
    document.querySelectorAll('.track-item').forEach(t => {
      t.classList.remove('active');
      const btn = t.querySelector('.play-btn');
      if (btn) { btn.innerHTML = ICON_PLAY; btn.classList.remove('playing'); }
      const cover = t.querySelector('.track-cover');
      if (cover) cover.classList.remove('playing-cover');
      const bar = t.querySelector('.track-progress-bar');
      if (bar) bar.style.width = '0%';
    });
  }

  function updateUI(idx, item, track, playing) {
    // Track item
    item.classList.add('active');
    const btn = item.querySelector('.play-btn');
    if (btn) { btn.innerHTML = playing ? ICON_PAUSE : ICON_PLAY; btn.classList.toggle('playing', playing); }
    const cover = item.querySelector('.track-cover');
    if (cover) cover.classList.toggle('playing-cover', playing);

    // Mini player
    miniCover.src        = track.cover;
    miniTitle.textContent  = track.name;
    miniArtist.textContent = track.artist;
    miniSpotify.href     = track.spotify;
    miniPlayBtn.innerHTML  = playing ? ICON_PAUSE : ICON_PLAY;
    miniPlayBtn.classList.toggle('playing', playing);
    miniPlayer.classList.add('visible');
  }

  function updatePlayButtons(playing) {
    if (currentIdx === null) return;
    const item = document.querySelectorAll('.track-item')[currentIdx];
    if (!item) return;
    const btn = item.querySelector('.play-btn');
    if (btn) { btn.innerHTML = playing ? ICON_PAUSE : ICON_PLAY; btn.classList.toggle('playing', playing); }
    miniPlayBtn.innerHTML = playing ? ICON_PAUSE : ICON_PLAY;
    miniPlayBtn.classList.toggle('playing', playing);
  }

  /* ── PROGRESSION ────────────────────────────────────── */
  audio.addEventListener('timeupdate', () => {
    if (!audio.duration) return;
    const pct = (audio.currentTime / audio.duration) * 100;

    // Barre dans la track
    const item = document.querySelectorAll('.track-item')[currentIdx];
    if (item) {
      const bar = item.querySelector('.track-progress-bar');
      if (bar) bar.style.width = pct + '%';
    }
    // Mini player
    miniProgress.style.width = pct + '%';
  });

  /* ── FIN DE LECTURE ─────────────────────────────────── */
  audio.addEventListener('ended', () => {
    isPlaying = false;
    updatePlayButtons(false);
    miniProgress.style.width = '0%';
  });

  /* ── CONTRÔLES MINI PLAYER ──────────────────────────── */
  miniPlayBtn.addEventListener('click', () => {
    isPlaying ? pauseAudio() : resumeAudio();
  });

  miniClose.addEventListener('click', () => {
    stopCurrent();
    currentIdx = null;
    miniPlayer.classList.remove('visible');
  });

});
