/**
 * KIM HO-JUN RESPONSIVE ONE-PAGER — JAVASCRIPT
 * ==============================================
 * 
 * This file contains all interactive behavior:
 * 1. Mobile navigation (hamburger menu, slide-in panel)
 * 2. Desktop navigation (hover effects)
 * 3. Card stack animations (expand/collapse on click)
 * 4. Career circle scroll animation (scroll/touch/keyboard-driven)
 * 
 * Key Design Decisions:
 * - IIFE pattern (Immediately Invoked Function Expression) to avoid polluting global scope
 * - Event delegation for efficient listener management
 * - Smooth transitions with CSS + carefully timed requestAnimationFrame()
 * - Lock mechanisms to prevent multiple animations triggering simultaneously
 */

/* ===== MOBILE NAVIGATION ===== */
/*
 * Hamburger menu functionality:
 * - Clicking the burger icon opens the slide-in panel
 * - Clicking the close button, overlay, or a nav link closes it
 * - Adds 'no-scroll' class to body to prevent background scrolling when menu open
 */
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

/* ===== DESKTOP NAVIGATION HOVER EFFECT ===== */
/*
 * On desktop: hovering over a nav item highlights it with red text + red border
 * The 'nav-hover' class triggers CSS effects (see styles.css .desktop-nav li.nav-hover)
 */
const desktopNavItems = document.querySelectorAll('.desktop-nav li');
desktopNavItems.forEach(li => {
  li.addEventListener('mouseenter', () => li.classList.add('nav-hover'));
  li.addEventListener('mouseleave', () => li.classList.remove('nav-hover'));
});

/* ===== CARD STACK ANIMATIONS ===== */
/*
 * CARD STACK BEHAVIOR:
 * 
 * Each section (Olympia, Weltmeisterschaften) has a stack of 3-5 cards.
 * - Front card (top): clickable, shows title + metadata
 * - Middle cards: peek above the expanded card
 * - Back card (bottom): extends to the bottom of the stack
 * 
 * INTERACTION:
 * 1. Hover front card (no expand) → red border + red text (CSS)
 * 2. Click front card → all cards reset → card expands to show detail text
 * 3. Click expanded card → collapses back to 90px
 * 4. Click different card → current collapses, new one expands
 * 
 * ANIMATION LOGIC:
 * - When expanding: card height becomes `scrollHeight` (content height)
 * - Cards below: repositioned to overlap the expanded card with peek gap (88px)
 * - Cards above: extended height to reach new stack bottom
 * - Stack container: height recalculates to fit all repositioned cards
 * 
 * TRANSITIONS MANAGEMENT:
 * - Normal animation: 0.4s ease (smooth expand/collapse)
 * - When switching cards: disable transitions (isSwitching flag)
 *   → Reset all cards instantly without animation
 *   → Force reflow (stack.offsetHeight) to apply reset
 *   → Re-enable transitions via rAF for smooth next animation
 *   This prevents glitchy overlapping animations
 */
const allCards = document.querySelectorAll('.card');

allCards.forEach(card => {
  // Accessibility: make cards focusable and button-like
  card.setAttribute('tabindex', '0');
  card.setAttribute('role', 'button');
  card.setAttribute('aria-expanded', 'false');

  // Hover state (on mouse only, not on focus): red border + text
  card.addEventListener('mouseenter', () => {
    if (!card.classList.contains('card-open')) {
      card.classList.add('card-hover');
    }
  });

  card.addEventListener('mouseleave', () => {
    card.classList.remove('card-hover');
  });

  // Keyboard support: Enter or Space opens/closes card
  card.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      card.click();
    }
  });

  // Focus support: auto-open card on focus
  // (This makes keyboard navigation more intuitive)
  card.addEventListener('focus', () => {
    if (!card.classList.contains('card-open')) {
      card.click();
    }
  });

  /* Main click handler: toggle card open/close */
  card.addEventListener('click', () => {
    const stack = card.closest('.card-stack');
    const allStackCards = Array.from(stack.querySelectorAll('.card'));
    const wasOpen = card.classList.contains('card-open');
    const hadOpenCard = allStackCards.some(c => c.classList.contains('card-open'));
    const isSwitching = hadOpenCard && !wasOpen; // closing one, opening another

    /* 
     * STEP 1: Disable transitions when switching cards
     * This allows us to reset all cards instantly without animation
     */
    if (isSwitching) {
      allStackCards.forEach(c => { c.style.transition = 'none'; });
      stack.style.transition = 'none';
    }

    /* 
     * STEP 2: Reset all cards in this stack
     * Remove open class, reset height and position, aria-expanded
     */
    allStackCards.forEach(c => {
      c.classList.remove('card-open');
      c.setAttribute('aria-expanded', 'false');
      c.style.height = '';
      c.style.top = '';
    });
    stack.style.height = '';

    /* 
     * STEP 3: Force reflow to apply reset instantly
     * Reading .offsetHeight triggers a browser recalculation
     * This ensures the 'transition: none' takes effect before we re-enable transitions
     */
    if (isSwitching) {
      stack.offsetHeight;
      // Re-enable transitions after reset
      allStackCards.forEach(c => { c.style.transition = ''; });
      stack.style.transition = '';
    }

    /* 
     * STEP 4: If clicking an unopened card, expand it
     */
    if (!wasOpen) {
      card.classList.remove('card-hover');
      card.classList.add('card-open');
      card.setAttribute('aria-expanded', 'true');

      // Get the clicked card's z-index and current top position
      const clickedTop = parseInt(getComputedStyle(card).top) || 0;
      const clickedZ = parseInt(getComputedStyle(card).zIndex) || 0;

      /* 
       * STEP 5: Measure the full content height
       * - Card starts at CSS height (90px)
       * - Temporarily set to 'auto' to measure scrollHeight
       * - Reset to original height
       * - Then set to full scrollHeight for expansion animation
       */
      const cssHeight = card.offsetHeight;
      card.style.height = 'auto';
      const fullContentHeight = card.scrollHeight;
      card.style.height = cssHeight + 'px';

      // Force reflow so transition sees the height change
      card.offsetHeight;

      // Expand to full content
      card.style.height = fullContentHeight + 'px';

      /* 
       * STEP 6: Calculate expanded card's bottom edge
       * This is where the cards below will start overlapping
       */
      const expandedBottom = clickedTop + fullContentHeight;

      /* 
       * STEP 7: Partition cards into "above" and "below" based on z-index
       * Cards with higher z-index appear "in front" (visually lower)
       * Cards with lower z-index appear "behind" (visually higher)
       */
      const cardsBelow = allStackCards
        .filter(c => c !== card && (parseInt(getComputedStyle(c).zIndex) || 0) > clickedZ)
        .sort((a, b) => (parseInt(getComputedStyle(a).zIndex) || 0) - (parseInt(getComputedStyle(b).zIndex) || 0));

      const cardsAbove = allStackCards
        .filter(c => c !== card && (parseInt(getComputedStyle(c).zIndex) || 0) < clickedZ);

      /* 
       * STEP 8: Calculate peek gap
       * Peek gap = how much of the next card is visible below the expanded card
       * Default 88px if no cards below, otherwise use the original offset
       */
      const peekGap = cardsBelow.length > 0
        ? (parseInt(getComputedStyle(cardsBelow[0]).top) || 0) - clickedTop
        : 88;

      /* 
       * STEP 9: Reposition cards below
       * Each card below gets moved down so it overlaps the expanded card
       * Calculation: expandedBottom - peekGap (overlap start)
       *            + i * peekGap (spacing between overlapping cards)
       */
      cardsBelow.forEach((c, i) => {
        c.style.top = (expandedBottom - peekGap + i * peekGap) + 'px';
      });

      /* 
       * STEP 10: Extend cards above to reach new stack bottom
       * The stack needs to be tall enough to contain all repositioned cards
       * Calculate the lowest point: bottom of last card below + its height
       */
      const newStackHeight = cardsBelow.length > 0
        ? (expandedBottom - peekGap + (cardsBelow.length - 1) * peekGap) + cardsBelow[cardsBelow.length - 1].offsetHeight
        : clickedTop + fullContentHeight;

      /* 
       * Cards above: extend height so they visually reach the new bottom
       * This creates the "wall" effect where behind cards grow
       */
      cardsAbove.forEach(c => {
        const cTop = parseInt(getComputedStyle(c).top) || 0;
        c.style.height = (newStackHeight - cTop) + 'px';
      });

      // Set stack to new height
      stack.style.height = newStackHeight + 'px';
    }
  });
});

/* ===== CAREER CIRCLE SCROLL ANIMATION ===== */
/*
 * SCROLL-DRIVEN CIRCULAR TIMELINE:
 * 
 * The career circle has 8 year dots positioned at 45° intervals around a circle.
 * User can navigate through years via:
 * 1. Mouse wheel scroll (one step per scroll gesture)
 * 2. Touch swipe (one step per swipe)
 * 3. Keyboard arrows (step up/down)
 * 4. Focus/Tab navigation (jump to specific year)
 * 
 * ANIMATION:
 * - Wrapper rotates to bring each year to the "top" (0°) position
 * - Each label's text rotates individually so text always faces outward
 * - Active year: larger text, shows detail text, navy color
 * - Inactive years: smaller, grey, detail hidden
 * 
 * LOCK MECHANISM:
 * - Scroll lock (700ms): prevents multiple steps from a single scroll gesture
 * - User scrolls continuously → lock resets on each scroll event
 * - Once lock unlocks, next scroll is allowed (one step per gesture)
 * - Touch/keyboard use same lock to prevent overlap
 * 
 * TRANSITION PREVENTION:
 * - When label switches active/inactive, disable transition on text
 * - This prevents the text from rotating through the inactive angle
 * - Re-enable after two frames (requestAnimationFrame x2) for smooth next transition
 */
(() => {
  const wrapper = document.querySelector('.career-circle-wrapper');
  if (!wrapper) return; // Skip if no career circle on page

  /* Accessibility: make wrapper focusable and announce its purpose */
  wrapper.setAttribute('tabindex', '0');
  wrapper.setAttribute('role', 'region');
  wrapper.setAttribute('aria-label', 'Karriere-Zeitleiste. Mit Pfeiltasten oben und unten durch Jahre navigieren.');

  /* Year configuration */
  const yearOrder = ['2006', '2007', '2009', '2010', '2014', '2015', '2017', '2018'];
  const stepAngle = 45; // 360° / 8 years = 45° per step

  /* Get responsive offsets for active/inactive label positions */
  function getOffsets() {
    // On mobile: active (39.5px, -16px), inactive (14px, -7px)
    // On tablet+: active (51px, -22px), inactive (26px, -9px)
    if (window.matchMedia('(min-width: 600px)').matches) {
      return { active: { x: 51, y: -22 }, inactive: { x: 26, y: -9 } };
    }
    return { active: { x: 39.5, y: -16 }, inactive: { x: 14, y: -7 } };
  }

  let currentIndex = 0; // Start at 2006 (index 0)
  let currentRotation = -225; // Initial rotation: 2006 positioned at 225°, rotate by -225° to show it at top
  let previousActiveYear = yearOrder[0];

  /* 
   * APPLY STATE: Update wrapper rotation, active dot, label styling
   * Called whenever the user navigates to a new year
   */
  function applyState() {
    const year = yearOrder[currentIndex];
    const o = getOffsets();

    // Rotate wrapper to bring current year to top
    wrapper.style.transform = 'rotate(' + currentRotation + 'deg)';

    // Update dot: only current year's dot gets .active class
    document.querySelectorAll('.career-dot').forEach(dot => {
      dot.classList.toggle('active', dot.dataset.year === year);
    });

    // Update labels: handle text rotation transitions
    document.querySelectorAll('.career-label').forEach(label => {
      const yr = label.dataset.year;
      const isActive = yr === year;
      const wasActive = yr === previousActiveYear;
      const inner = label.querySelector('.career-label-inner');
      const baseTextRotate = parseFloat(label.style.getPropertyValue('--text-rotate'));

      /* 
       * Prevent transition glitch:
       * When label switches from active→inactive or vice versa,
       * the text would rotate through the inactive angle (creating a flip).
       * Solution: disable transition during state change, re-enable after render
       */
      if (isActive !== wasActive) {
        inner.style.transition = 'none';
        // Force reflow to ensure 'none' takes effect
        inner.offsetHeight;
      }

      // Add/remove active class
      label.classList.toggle('active', isActive);

      // Set text position and rotation
      if (isActive) {
        // Active: rotate text to face outward + move further out
        inner.style.transform =
          'rotate(' + (-currentRotation) + 'deg) translateX(' + o.active.x + 'px) translateY(' + o.active.y + 'px)';
      } else {
        // Inactive: use base text rotation + move closer to center
        inner.style.transform =
          'rotate(' + baseTextRotate + 'deg) translate(' + o.inactive.x + 'px, ' + o.inactive.y + 'px)';
      }

      /* Re-enable transition after two frames */
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

  /* Step forward: next year (with wrap-around) */
  function stepForward() {
    currentIndex = (currentIndex + 1) % yearOrder.length; // Wrap to start if at end
    currentRotation -= stepAngle; // Rotate wrapper clockwise
    applyState();
  }

  /* Step backward: previous year (with wrap-around) */
  function stepBackward() {
    currentIndex = (currentIndex - 1 + yearOrder.length) % yearOrder.length; // Wrap to end if at start
    currentRotation += stepAngle; // Rotate wrapper counter-clockwise
    applyState();
  }

  /* ===== WHEEL SCROLL SUPPORT ===== */
  /*
   * Lock mechanism ensures one step per scroll gesture
   * User scrolls → step → lock → wait 700ms → unlock
   * If user scrolls again while locked, reset timer (keeps lock)
   */
  let isLocked = false;
  let unlockTimer = null;

  wrapper.addEventListener('wheel', (e) => {
    e.preventDefault(); // Don't scroll page
    if (isLocked) return; // Ignore if still locked from previous step

    isLocked = true;

    // Scroll down = forward, scroll up = backward
    if (e.deltaY > 0) {
      stepForward();
    } else if (e.deltaY < 0) {
      stepBackward();
    }

    // Set timer to unlock after pause
    clearTimeout(unlockTimer);
    unlockTimer = setTimeout(() => { isLocked = false; }, 700);
  }, { passive: false }); // passive: false allows preventDefault()

  // Also keep resetting timer while scroll events keep coming
  wrapper.addEventListener('wheel', (e) => {
    if (isLocked) {
      clearTimeout(unlockTimer);
      unlockTimer = setTimeout(() => { isLocked = false; }, 700);
    }
  }, { passive: true });

  /* ===== TOUCH SUPPORT ===== */
  /*
   * Mobile swipe: track vertical distance, trigger step when > 40px threshold
   * Same lock mechanism as wheel (700ms pause)
   */
  let touchStartY = 0;
  let isTouchLocked = false;
  let touchUnlockTimer = null;

  wrapper.addEventListener('touchstart', (e) => {
    touchStartY = e.touches[0].clientY;
  }, { passive: true });

  wrapper.addEventListener('touchmove', (e) => {
    const touchY = e.touches[0].clientY;
    const diff = touchStartY - touchY; // Positive = swipe up, negative = swipe down

    // Require 40px movement + not already locked
    if (Math.abs(diff) > 40 && !isTouchLocked) {
      e.preventDefault();
      isTouchLocked = true;

      // Swipe up = forward, swipe down = backward
      if (diff > 0) {
        stepForward();
      } else {
        stepBackward();
      }

      // Update start position for next gesture
      touchStartY = touchY;

      // Lock until pause
      clearTimeout(touchUnlockTimer);
      touchUnlockTimer = setTimeout(() => { isTouchLocked = false; }, 700);
    }
  }, { passive: false });

  /* ===== KEYBOARD SUPPORT ===== */
  /*
   * Arrow Up / Page Up = previous year
   * Arrow Down / Page Down = next year
   * No lock needed for keyboard (discrete events)
   */
  wrapper.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowDown' || e.key === 'PageDown') {
      e.preventDefault();
      stepForward();
    } else if (e.key === 'ArrowUp' || e.key === 'PageUp') {
      e.preventDefault();
      stepBackward();
    }
  });

  /* ===== FOCUS SUPPORT ===== */
  /*
   * When user tabs to a career label and focuses it,
   * automatically rotate circle to that year via shortest path
   */

  // Initialize at 2006
  applyState();

  // Add focus listener to each career label
  document.querySelectorAll('.career-label').forEach(label => {
    label.setAttribute('role', 'button');
    label.setAttribute('aria-label', 'Jahr ' + label.dataset.year);

    label.addEventListener('focus', () => {
      const year = label.dataset.year;
      const yearIndex = yearOrder.indexOf(year);

      // Only navigate if valid year and not already on it
      if (yearIndex !== -1 && yearIndex !== currentIndex) {
        // Calculate shortest path: forward or backward with wrap-around
        const forward = (yearIndex - currentIndex + yearOrder.length) % yearOrder.length;
        const backward = (currentIndex - yearIndex + yearOrder.length) % yearOrder.length;

        // Step in the direction that's shorter
        if (forward <= backward) {
          for (let i = 0; i < forward; i++) {
            stepForward();
          }
        } else {
          for (let i = 0; i < backward; i++) {
            stepBackward();
          }
        }
      }
    });
  });
})();
