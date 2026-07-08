/*
  Project Tulip audio layer
  -------------------------
  Audio is kept separate from folder/card logic so the fixed iPhone animation
  remains stable. Existing interaction files only call these small methods.
*/
function initAudio() {
  const FADE_STEP_MS = 80;
  const MUSIC_MAX_VOLUME = 0.50;
  const CARD_SOUND_MAX_MS = 460;

  const sounds = {
    seal: new Audio('audio/seal.mp3'),
    folderOpen: new Audio('audio/folder-open.mp3'),
    cardSlide: new Audio('audio/paper-slide.mp3'),
    music: new Audio('audio/music.m4r')
  };

  let musicFadeTimer = null;
  let cardSlideStopTimer = null;
  let hasUserInteracted = false;

  sounds.seal.preload = 'auto';
  sounds.folderOpen.preload = 'auto';
  sounds.cardSlide.preload = 'auto';
  sounds.music.preload = 'auto';
  sounds.music.loop = true;

  sounds.seal.volume = 0.42;
  sounds.folderOpen.volume = 0.30;
  sounds.cardSlide.volume = 0.18;
  sounds.music.volume = 0;

  function rememberInteraction() {
    hasUserInteracted = true;
  }

  function safePlay(audio) {
    if (!audio || !hasUserInteracted) return;

    try {
      audio.currentTime = 0;
      const playPromise = audio.play();

      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(() => {
          // Browsers may still block audio in some settings. Ignore silently.
        });
      }
    } catch (error) {
      // Keep visual invitation working even if audio is unavailable.
    }
  }

  function stopFade() {
    if (musicFadeTimer) {
      window.clearInterval(musicFadeTimer);
      musicFadeTimer = null;
    }
  }

  function fadeMusicTo(targetVolume, durationMs, pauseWhenSilent = false) {
    if (!hasUserInteracted) return;

    stopFade();

    const music = sounds.music;
    const startVolume = music.volume;
    const distance = targetVolume - startVolume;
    const steps = Math.max(1, Math.round(durationMs / FADE_STEP_MS));
    let step = 0;

    if (targetVolume > 0 && music.paused) {
      const playPromise = music.play();

      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(() => {
          stopFade();
        });
      }
    }

    musicFadeTimer = window.setInterval(() => {
      step += 1;
      const progress = Math.min(step / steps, 1);
      music.volume = Math.max(0, Math.min(MUSIC_MAX_VOLUME, startVolume + distance * progress));

      if (progress >= 1) {
        stopFade();

        if (pauseWhenSilent && targetVolume === 0) {
          music.pause();
          music.currentTime = 0;
        }
      }
    }, FADE_STEP_MS);
  }

  function playSeal() {
    rememberInteraction();
    safePlay(sounds.seal);
  }

  function playFolderOpen() {
    safePlay(sounds.folderOpen);
  }

  function playCardSlide() {
    safePlay(sounds.cardSlide);

    window.clearTimeout(cardSlideStopTimer);
    cardSlideStopTimer = window.setTimeout(() => {
      sounds.cardSlide.pause();
      sounds.cardSlide.currentTime = 0;
    }, CARD_SOUND_MAX_MS);
  }

  function startMusic() {
    fadeMusicTo(MUSIC_MAX_VOLUME, 2400);
  }

  function stopMusic() {
    fadeMusicTo(0, 1400, true);
  }

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      sounds.music.pause();
      return;
    }

    if (hasUserInteracted && sounds.music.volume > 0) {
      sounds.music.play().catch(() => {});
    }
  });

  return {
    playSeal,
    playFolderOpen,
    playCardSlide,
    startMusic,
    stopMusic
  };
}
