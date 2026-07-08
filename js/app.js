document.addEventListener('DOMContentLoaded', () => {
  const stage = document.getElementById('stage');
  const openButton = document.getElementById('openInvitation');
  const cards = [...document.querySelectorAll('.card')];
  const previousButton = document.getElementById('prevCard');
  const nextButton = document.getElementById('nextCard');
  const previousZone = document.getElementById('prevZone');
  const nextZone = document.getElementById('nextZone');
  const indicator = document.getElementById('indicator');

  const folder = initFolder({ stage, openButton });

  initCards({
    stage,
    cards,
    closeInvitation: folder.closeInvitation,
    previousButton,
    nextButton,
    previousZone,
    nextZone,
    indicator
  });

  initCountdown({
    weddingDate: '2026-09-12T18:45:00+12:00',
    days: document.getElementById('days'),
    hours: document.getElementById('hours'),
    minutes: document.getElementById('minutes'),
    seconds: document.getElementById('seconds')
  });
});
