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
    const hadOpenCard = allStackCards.some(c => c.classList.contains('card-open'));
    const isSwitching = hadOpenCard && !wasOpen; // closing one card, opening another

    // Disable transitions only when switching cards so reset is instant
    if (isSwitching) {
      allStackCards.forEach(c => { c.style.transition = 'none'; });
      stack.style.transition = 'none';
    }

    // Close all cards in this stack — reset everything
    allStackCards.forEach(c => {
      c.classList.remove('card-open');
      c.style.height = '';
      c.style.top = '';
    });
    stack.style.height = '';

    if (isSwitching) {
      // Force reflow so the reset takes effect instantly
      stack.offsetHeight;
      // Re-enable transitions
      allStackCards.forEach(c => { c.style.transition = ''; });
      stack.style.transition = '';
    }

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

// ===== CAREER CIRCLE SCROLL ANIMATION =====
(() => {
  const wrapper = document.querySelector('.career-circle-wrapper');
  if (!wrapper) return;

  const yearOrder = ['2006', '2007', '2009', '2010', '2014', '2015', '2017', '2018'];
  const stepAngle = 45; // Each year is 45° apart on the circle

  function getOffsets() {
    if (window.matchMedia('(min-width: 600px)').matches) {
      return { active: { x: 51, y: -22 }, inactive: { x: 26, y: -9 } };
    }
    return { active: { x: 39.5, y: -16 }, inactive: { x: 14, y: -7 } };
  }

  let currentIndex = 0; // Start at 2006
  let currentRotation = -225; // 2006 is at 225°, rotate wrapper by -225° to put it at 0°
  let previousActiveYear = yearOrder[0];

  function applyState() {
    const year = yearOrder[currentIndex];
    const o = getOffsets();

    wrapper.style.transform = 'rotate(' + currentRotation + 'deg)';

    document.querySelectorAll('.career-dot').forEach(dot => {
      dot.classList.toggle('active', dot.dataset.year === year);
    });

    document.querySelectorAll('.career-label').forEach(label => {
      const yr = label.dataset.year;
      const isActive = yr === year;
      const wasActive = yr === previousActiveYear;
      const inner = label.querySelector('.career-label-inner');
      const baseTextRotate = parseFloat(label.style.getPropertyValue('--text-rotate'));

      // If switching between active/inactive, disable transition to prevent flip
      if (isActive !== wasActive) {
        inner.style.transition = 'none';
        // Force reflow so the 'none' takes effect before we set the new transform
        inner.offsetHeight;
      }

      label.classList.toggle('active', isActive);

      if (isActive) {
        inner.style.transform =
          'rotate(' + (-currentRotation) + 'deg) translateX(' + o.active.x + 'px) translateY(' + o.active.y + 'px)';
      } else {
        inner.style.transform =
          'rotate(' + baseTextRotate + 'deg) translate(' + o.inactive.x + 'px, ' + o.inactive.y + 'px)';
      }

      // Re-enable transition after two frames to ensure no flip
      if (isActive !== wasActive) {
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            inner.style.transition = '';
          });
        });
      }
    });

    previousActiveYear = year;
  }

  function stepForward() {
    currentIndex = (currentIndex + 1) % yearOrder.length;
    currentRotation -= stepAngle;
    applyState();
  }

  function stepBackward() {
    currentIndex = (currentIndex - 1 + yearOrder.length) % yearOrder.length;
    currentRotation += stepAngle;
    applyState();
  }

  // Wheel: one step per scroll gesture, then wait for user to stop and scroll again
  let isLocked = false;
  let unlockTimer = null;

  wrapper.addEventListener('wheel', (e) => {
    e.preventDefault();
    if (isLocked) return;

    isLocked = true;

    if (e.deltaY > 0) {
      stepForward();
    } else if (e.deltaY < 0) {
      stepBackward();
    }

    // Unlock after a pause — user must stop scrolling before next step
    clearTimeout(unlockTimer);
    unlockTimer = setTimeout(() => { isLocked = false; }, 700);
  }, { passive: false });

  // Also keep resetting the timer while scroll events keep coming
  wrapper.addEventListener('wheel', (e) => {
    if (isLocked) {
      clearTimeout(unlockTimer);
      unlockTimer = setTimeout(() => { isLocked = false; }, 700);
    }
  }, { passive: true });

  // Touch support
  let touchStartY = 0;
  let isTouchLocked = false;
  let touchUnlockTimer = null;

  wrapper.addEventListener('touchstart', (e) => {
    touchStartY = e.touches[0].clientY;
  }, { passive: true });

  wrapper.addEventListener('touchmove', (e) => {
    const touchY = e.touches[0].clientY;
    const diff = touchStartY - touchY;

    if (Math.abs(diff) > 40 && !isTouchLocked) {
      e.preventDefault();
      isTouchLocked = true;

      if (diff > 0) {
        stepForward();
      } else {
        stepBackward();
      }
      touchStartY = touchY;

      clearTimeout(touchUnlockTimer);
      touchUnlockTimer = setTimeout(() => { isTouchLocked = false; }, 700);
    }
  }, { passive: false });

  // Initialize at 2006
  applyState();
})();
