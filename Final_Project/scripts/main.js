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
  const careerSection = document.querySelector('.career');
  const wrapper = document.querySelector('.career-circle-wrapper');
  if (!careerSection || !wrapper) return;

  // Year order matches scroll direction (scroll down = advance through career)
  const yearOrder = ['2006', '2007', '2009', '2010', '2014', '2015', '2017', '2018'];
  const angles = { '2006': 225, '2007': 270, '2009': 315, '2010': 0, '2014': 45, '2015': 90, '2017': 135, '2018': 180 };

  // Get active label offsets based on breakpoint
  function getActiveOffsets() {
    if (window.matchMedia('(min-width: 600px)').matches) {
      return { x: 51, y: -22 };
    }
    return { x: 39.5, y: -16 };
  }

  // Start with 2010 active (index 3)
  let currentIndex = 3;
  // Track cumulative rotation to avoid jumps across 0°/360° boundary
  // 2010 is at angle 0°, so initial wrapper rotation is 0
  let currentRotation = 0;

  function setActiveYear(index) {
    if (index < 0 || index >= yearOrder.length) return;
    if (index === currentIndex) return;

    const oldIndex = currentIndex;
    currentIndex = index;

    // Calculate the step: difference in angles between old and new
    const oldAngle = angles[yearOrder[oldIndex]];
    const newAngle = angles[yearOrder[index]];

    // Find the shortest rotation step between the two angles
    let diff = newAngle - oldAngle;
    // Normalize to [-180, 180] for shortest path
    while (diff > 180) diff -= 360;
    while (diff < -180) diff += 360;

    // Accumulate rotation (negative because we rotate the wrapper opposite)
    currentRotation -= diff;

    const year = yearOrder[index];
    const o = getActiveOffsets();

    // Apply cumulative rotation
    wrapper.style.transform = 'rotate(' + currentRotation + 'deg)';

    // Toggle active on dots
    document.querySelectorAll('.career-dot').forEach(dot => {
      dot.classList.toggle('active', dot.dataset.year === year);
    });

    // Toggle active on labels
    document.querySelectorAll('.career-label').forEach(label => {
      const isActive = label.dataset.year === year;
      label.classList.toggle('active', isActive);

      const inner = label.querySelector('.career-label-inner');

      if (isActive) {
        // Counter-rotate so text is horizontal: negate the cumulative rotation
        inner.style.transform =
          'rotate(' + (-currentRotation) + 'deg) translateX(' + o.x + 'px) translateY(' + o.y + 'px)';
      } else {
        // Clear inline style — let CSS --text-rotate handle tangent rotation
        inner.style.transform = '';
      }
    });
  }

  // Scroll-on-circle: always capture wheel on the circle, one step per gesture
  let isLocked = false;
  let lockTimer = null;

  wrapper.addEventListener('wheel', (e) => {
    e.preventDefault(); // Always stop page scroll on the circle

    if (isLocked) {
      // Keep resetting timer — unlock only after user STOPS scrolling
      clearTimeout(lockTimer);
      lockTimer = setTimeout(() => { isLocked = false; }, 400);
      return;
    }

    // Advance one step and lock
    isLocked = true;
    if (e.deltaY > 0 && currentIndex < yearOrder.length - 1) {
      setActiveYear(currentIndex + 1);
    } else if (e.deltaY < 0 && currentIndex > 0) {
      setActiveYear(currentIndex - 1);
    }

    // Unlock only after user stops scrolling for 400ms
    clearTimeout(lockTimer);
    lockTimer = setTimeout(() => { isLocked = false; }, 400);
  }, { passive: false });

  // Touch support for mobile
  let touchStartY = 0;
  let isTouchLocked = false;
  let touchLockTimer = null;

  wrapper.addEventListener('touchstart', (e) => {
    touchStartY = e.touches[0].clientY;
    isTouchLocked = false;
    clearTimeout(touchLockTimer);
  }, { passive: true });

  wrapper.addEventListener('touchmove', (e) => {
    const touchY = e.touches[0].clientY;
    const diff = touchStartY - touchY;

    // At the boundaries, let the page scroll normally
    if (diff > 0 && currentIndex >= yearOrder.length - 1) return;
    if (diff < 0 && currentIndex <= 0) return;

    if (Math.abs(diff) > 40) {
      e.preventDefault();
      if (isTouchLocked) return;

      isTouchLocked = true;
      if (diff > 0) {
        setActiveYear(currentIndex + 1);
      } else {
        setActiveYear(currentIndex - 1);
      }
      touchStartY = touchY;

      clearTimeout(touchLockTimer);
      touchLockTimer = setTimeout(() => { isTouchLocked = false; }, 300);
    }
  }, { passive: false });

  // Initialize: set 2010 as active on load
  // Don't use setActiveYear for init since it needs oldIndex to compute diff
  currentIndex = 3;
  currentRotation = 0; // 2010 is at angle 0°, so no initial rotation needed
  // Apply active classes
  const initYear = yearOrder[3];
  const initO = getActiveOffsets();
  document.querySelectorAll('.career-dot').forEach(dot => {
    dot.classList.toggle('active', dot.dataset.year === initYear);
  });
  document.querySelectorAll('.career-label').forEach(label => {
    const isActive = label.dataset.year === initYear;
    label.classList.toggle('active', isActive);
    const inner = label.querySelector('.career-label-inner');
    if (isActive) {
      inner.style.transform =
        'rotate(0deg) translateX(' + initO.x + 'px) translateY(' + initO.y + 'px)';
    }
  });
})();
