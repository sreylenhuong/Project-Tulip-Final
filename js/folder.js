/*
  Folder state is kept separate from card navigation.
  iPhone/Safari stability approach:
  - Cards are present as soon as the folder starts opening.
  - Card transitions are frozen until the covers finish opening.
  - Covers are never hidden after opening, because re-showing hidden 3D layers
    is what made the right cover glitch during close on iPhone.
*/
function initFolder({ stage, openButton }) {
  const OPEN_PRESS_DELAY = 220;
  const CARD_READY_DELAY = 80;
  const CLOSING_REPAINT_DELAY = 34;

  function nextFrame() {
    return new Promise((resolve) => window.requestAnimationFrame(() => resolve()));
  }

  async function twoPaints() {
    await nextFrame();
    await nextFrame();
  }

  function waitForTransition(element, propertyName, fallbackMs) {
    return new Promise((resolve) => {
      if (!element) {
        resolve();
        return;
      }

      let done = false;

      const finish = () => {
        if (done) return;
        done = true;
        element.removeEventListener('transitionend', onEnd);
        window.clearTimeout(timer);
        resolve();
      };

      const onEnd = (event) => {
        if (event.target !== element) return;
        if (propertyName && event.propertyName !== propertyName) return;
        finish();
      };

      const timer = window.setTimeout(finish, fallbackMs);
      element.addEventListener('transitionend', onEnd);
    });
  }

  async function openInvitation() {
    if (
      stage.classList.contains('is-closing') ||
      stage.classList.contains('is-opening') ||
      stage.classList.contains('is-open')
    ) return;

    const leftCover = stage.querySelector('.left-cover');
    const rightCover = stage.querySelector('.right-cover');

    stage.classList.add('is-opening');
    stage.classList.remove('is-ready', 'is-closing', 'is-preparing-close');

    // Cards must already be inside the folder when the covers move.
    // They are visible but frozen by CSS until .is-ready is added.
    stage.classList.add('is-revealed');

    window.setTimeout(async () => {
      await twoPaints();

      stage.classList.add('is-open');
      openButton.setAttribute('aria-expanded', 'true');

      await Promise.all([
        waitForTransition(leftCover, 'transform', 1350),
        waitForTransition(rightCover, 'transform', 1350)
      ]);

      // After the cover motion is finished, restore normal card handling.
      await twoPaints();
      window.setTimeout(() => {
        stage.classList.add('is-ready');
        stage.classList.remove('is-opening');
      }, CARD_READY_DELAY);
    }, OPEN_PRESS_DELAY);
  }

  function closeInvitation() {
    if (!stage.classList.contains('is-open') || stage.classList.contains('is-closing')) return;

    const leftCover = stage.querySelector('.left-cover');
    const rightCover = stage.querySelector('.right-cover');

    openButton.setAttribute('aria-expanded', 'false');

    // Remove card-ready state first so the card layer freezes.
    // Keep is-open on while closing so the cards remain physically inside
    // until both covers have completed their fold.
    stage.classList.remove('is-ready');
    stage.classList.add('is-closing');

    // Safari needs a paint after the class change before measuring transitions.
    window.setTimeout(async () => {
      await twoPaints();

      await Promise.all([
        waitForTransition(leftCover, 'transform', 1150),
        waitForTransition(rightCover, 'transform', 1150)
      ]);

      stage.classList.remove('is-revealed');
      stage.classList.remove('is-open');

      window.setTimeout(() => {
        stage.classList.remove('is-closing');
      }, 280);
    }, CLOSING_REPAINT_DELAY);
  }

  openButton.addEventListener('click', openInvitation);

  return { openInvitation, closeInvitation };
}
