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
