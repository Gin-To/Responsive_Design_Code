// ===== MOBILE NAV PANEL =====
const menuToggle = document.querySelector('.menu-toggle');
const menuClose = document.querySelector('.menu-close');
const navPanel = document.querySelector('.nav-panel');
const navOverlay = document.querySelector('.nav-overlay');
const navLinks = document.querySelectorAll('.nav-links a');

function openMenu() {
  navPanel.classList.add('open');
  navOverlay.classList.add('open');
  document.body.classList.add('no-scroll');
}

function closeMenu() {
  navPanel.classList.remove('open');
  navOverlay.classList.remove('open');
  document.body.classList.remove('no-scroll');
}

menuToggle.addEventListener('click', openMenu);
menuClose.addEventListener('click', closeMenu);
navOverlay.addEventListener('click', closeMenu);
navLinks.forEach(link => link.addEventListener('click', closeMenu));

// ===== DESKTOP NAV HOVER EFFECT =====
const desktopNavItems = document.querySelectorAll('.desktop-nav li');
desktopNavItems.forEach(li => {
  li.addEventListener('mouseenter', () => li.classList.add('nav-hover'));
  li.addEventListener('mouseleave', () => li.classList.remove('nav-hover'));
});

// ===== CARD STACK HOVER + CLICK =====
const allCards = document.querySelectorAll('.card');

allCards.forEach(card => {
  // Hover: red border + red text
  card.addEventListener('mouseenter', () => {
    if (!card.classList.contains('card-open')) {
      card.classList.add('card-hover');
    }
  });

  card.addEventListener('mouseleave', () => {
    card.classList.remove('card-hover');
  });

  // Click: toggle open/close (expand to show detail)
  card.addEventListener('click', () => {
    const stack = card.closest('.card-stack');
    const allStackCards = Array.from(stack.querySelectorAll('.card'));
    const wasOpen = card.classList.contains('card-open');

    // Close all cards in this stack — reset everything
    allStackCards.forEach(c => {
      c.classList.remove('card-open');
      c.style.height = '';
      c.style.top = '';
    });
    stack.style.height = '';

    if (!wasOpen) {
      card.classList.remove('card-hover');
      card.classList.add('card-open');

      // Get the clicked card's position and z-index
      const clickedTop = parseInt(getComputedStyle(card).top) || 0;
      const clickedZ = parseInt(getComputedStyle(card).zIndex) || 0;

      // Measure full content height
      const cssHeight = card.offsetHeight;
      card.style.height = 'auto';
      const fullContentHeight = card.scrollHeight;
      card.style.height = cssHeight + 'px';

      // Force reflow
      card.offsetHeight;

      // Set the card to its full content height
      card.style.height = fullContentHeight + 'px';

      // The expanded card's bottom edge
      const expandedBottom = clickedTop + fullContentHeight;

      // Sort cards below by z-index (visually in front)
      const cardsBelow = allStackCards
        .filter(c => c !== card && (parseInt(getComputedStyle(c).zIndex) || 0) > clickedZ)
        .sort((a, b) => (parseInt(getComputedStyle(a).zIndex) || 0) - (parseInt(getComputedStyle(b).zIndex) || 0));

      const cardsAbove = allStackCards
        .filter(c => c !== card && (parseInt(getComputedStyle(c).zIndex) || 0) < clickedZ);

      // Get the peek gap from the original card positions
      const peekGap = cardsBelow.length > 0
        ? (parseInt(getComputedStyle(cardsBelow[0]).top) || 0) - clickedTop
        : 88;

      // Position cards below: overlap the expanded card by peekGap
      cardsBelow.forEach((c, i) => {
        c.style.top = (expandedBottom - peekGap + i * peekGap) + 'px';
      });

      // Calculate new stack height
      const newStackHeight = cardsBelow.length > 0
        ? (expandedBottom - peekGap + (cardsBelow.length - 1) * peekGap) + cardsBelow[cardsBelow.length - 1].offsetHeight
        : clickedTop + fullContentHeight;

      // Cards above: grow height to extend to new stack bottom
      cardsAbove.forEach(c => {
        const cTop = parseInt(getComputedStyle(c).top) || 0;
        c.style.height = (newStackHeight - cTop) + 'px';
      });

      stack.style.height = newStackHeight + 'px';
    }
  });
});
