function initCards({
  stage,
  cards,
  closeInvitation,
  previousButton,
  nextButton,
  previousZone,
  nextZone,
  indicator
}) {
  let current = 0;
  let isCardTurning = false;

  function waitForCardTransition(card, fallbackMs = 620) {
    return new Promise((resolve) => {
      let done = false;

      const finish = () => {
        if (done) return;
        done = true;
        card.removeEventListener('transitionend', onEnd);
        window.clearTimeout(timer);
        resolve();
      };

      const onEnd = (event) => {
        if (event.target !== card) return;
        if (event.propertyName !== 'transform') return;
        finish();
      };

      const timer = window.setTimeout(finish, fallbackMs);
      card.addEventListener('transitionend', onEnd);
    });
  }

  function updateCards() {
    cards.forEach((card, index) => {
      let position = 'hidden-next';

      if (index === current) position = 'active';
      else if (index === current - 1) position = 'prev';
      else if (index === current + 1) position = 'next';
      else if (index < current) position = 'hidden-prev';

      card.dataset.position = position;
    });

    indicator.textContent = `${current + 1} / ${cards.length}`;

    previousButton.setAttribute('aria-label', current === 0 ? 'Close invitation' : 'Previous card');
    previousZone.setAttribute('aria-label', current === 0 ? 'Close invitation by tapping left side' : 'Previous card by tapping left side');
    nextButton.setAttribute('aria-label', current === cards.length - 1 ? 'Close invitation' : 'Next card');
    nextZone.setAttribute('aria-label', current === cards.length - 1 ? 'Close invitation by tapping right side' : 'Next card by tapping right side');
  }

  function resetAndClose() {
    if (stage.classList.contains('is-closing')) return;

    window.setTimeout(() => {
      current = 0;
      updateCards();
    }, 940);

    closeInvitation();
  }

  async function goNext() {
    if (!stage.classList.contains('is-ready') || stage.classList.contains('is-closing') || isCardTurning) return;

    if (current < cards.length - 1) {
      isCardTurning = true;
      stage.dataset.nav = 'next';
      current += 1;
      updateCards();

      await waitForCardTransition(cards[current], 620);

      if (stage.dataset.nav === 'next') delete stage.dataset.nav;
      isCardTurning = false;
      return;
    }

    resetAndClose();
  }

  async function goPrevious() {
    if (!stage.classList.contains('is-ready') || stage.classList.contains('is-closing') || isCardTurning) return;

    if (current > 0) {
      isCardTurning = true;
      stage.dataset.nav = 'prev';
      current -= 1;
      updateCards();

      await waitForCardTransition(cards[current], 620);

      if (stage.dataset.nav === 'prev') delete stage.dataset.nav;
      isCardTurning = false;
      return;
    }

    resetAndClose();
  }

nextButton.addEventListener('click', goNext);
previousButton.addEventListener('click', goPrevious);

nextZone.addEventListener('click', () => {
  if (window.matchMedia('(pointer: coarse)').matches) return;
  goNext();
});

previousZone.addEventListener('click', () => {
  if (window.matchMedia('(pointer: coarse)').matches) return;
  goPrevious();
});

  /*
    Mobile tap navigation belongs to the paper card, not a full-screen overlay.
    This keeps real controls, like Google Maps and Close Invitation, tappable.
  */


  initGestureNavigation({ stage, goNext, goPrevious });
  updateCards();
}
