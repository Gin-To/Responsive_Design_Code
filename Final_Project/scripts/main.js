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
    const allStackCards = stack.querySelectorAll('.card');
    const wasOpen = card.classList.contains('card-open');

    // Close all cards in this stack — reset everything
    allStackCards.forEach(c => {
      c.classList.remove('card-open');
      c.style.height = '';
    });
    stack.style.height = '';

    if (!wasOpen) {
      card.classList.remove('card-hover');
      card.classList.add('card-open');

      // Measure how tall the card needs to be for its content
      const originalHeight = card.offsetHeight;
      card.style.height = 'auto';
      const fullHeight = card.scrollHeight;
      card.style.height = originalHeight + 'px';

      // Force reflow so the transition works
      card.offsetHeight;

      // Calculate how much extra height is needed
      const growth = fullHeight - originalHeight;

      // Set the card to its full content height
      card.style.height = fullHeight + 'px';

      // Grow all OTHER cards by the same amount so they stay aligned
      allStackCards.forEach(c => {
        if (c !== card) {
          const currentH = c.offsetHeight;
          c.style.height = (currentH + growth) + 'px';
        }
      });

      // Grow the stack height — pushes content below down
      const stackH = stack.offsetHeight;
      stack.style.height = (stackH + growth) + 'px';
    }
  });
});
