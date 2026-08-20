// Get every navigation link and the section that each link points to.
const navigationLinks = document.querySelectorAll('#nav-links a');
const pageSections = Array.from(navigationLinks)
  .map((link) => document.querySelector(link.getAttribute('href')))
  .filter((section) => section !== null);

// These elements control the mobile menu. The desktop navigation does not use them.
const navigationBar = document.querySelector('#nav-bar');
const navigationToggle = document.querySelector('#nav-toggle');
const navigationClose = document.querySelector('#nav-close');
const mediaInfoButtons = document.querySelectorAll('.media-info-button');

const menuFocusableElements = () => Array.from(
  navigationBar.querySelectorAll('a, button')
).filter((element) => !element.hasAttribute('disabled'));

// Open or close the menu and keep its accessibility information up to date.
function setMenuOpen(isOpen) {
  navigationBar.classList.toggle('is-open', isOpen);
  navigationToggle.setAttribute('aria-expanded', String(isOpen));
  navigationBar.setAttribute('aria-hidden', String(!isOpen));

  // Move keyboard focus to the button that makes sense for the new menu state.
  if (isOpen) {
    navigationClose.focus();
  } else if (window.matchMedia('(max-width: 767px)').matches) {
    navigationToggle.focus();
  }
}

// Clicking the hamburger opens the full-screen mobile navigation.
navigationToggle.addEventListener('click', () => setMenuOpen(true));

// Clicking the X closes the full-screen mobile navigation.
navigationClose.addEventListener('click', () => setMenuOpen(false));

// Selecting a link closes the menu before the browser scrolls to its section.
navigationLinks.forEach((link) => {
  link.addEventListener('click', () => {
    if (navigationBar.classList.contains('is-open')) {
      setMenuOpen(false);
    }
  });
});

// Escape is a familiar keyboard shortcut for closing an open menu or dialog.
document.addEventListener('keydown', (event) => {
  if (!navigationBar.classList.contains('is-open')) {
    return;
  }

  if (event.key === 'Escape') {
    setMenuOpen(false);
    return;
  }

  if (event.key === 'Tab') {
    const focusableElements = menuFocusableElements();
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    if (event.shiftKey && document.activeElement === firstElement) {
      event.preventDefault();
      lastElement.focus();
    } else if (!event.shiftKey && document.activeElement === lastElement) {
      event.preventDefault();
      firstElement.focus();
    }
  }
});

// Toggle each gallery caption so its production details are available without hover.
mediaInfoButtons.forEach((button) => {
  button.addEventListener('click', () => {
    const caption = document.querySelector(`#${button.getAttribute('aria-controls')}`);
    const isVisible = button.getAttribute('aria-expanded') === 'true';

    button.setAttribute('aria-expanded', String(!isVisible));
    caption.classList.toggle('is-visible', !isVisible);
  });
});

// Keep the menu's ARIA state correct if the browser changes between mobile and desktop widths.
function syncMenuToViewport() {
  const isMobile = window.matchMedia('(max-width: 767px)').matches;

  if (isMobile) {
    navigationBar.setAttribute('aria-hidden', String(!navigationBar.classList.contains('is-open')));
  } else {
    navigationBar.classList.remove('is-open');
    navigationToggle.setAttribute('aria-expanded', 'false');
    navigationBar.setAttribute('aria-hidden', 'false');
  }
}

// The menu starts closed on mobile, while remaining available to screen readers on desktop.
syncMenuToViewport();
window.addEventListener('resize', syncMenuToViewport);

// Mark one link as active and remove the active style from the other links.
function setActiveLink(sectionId) {
  navigationLinks.forEach((link) => {
    const isCurrentSection = link.getAttribute('href') === `#${sectionId}`;
    link.classList.toggle('active', isCurrentSection);

    // aria-current helps screen readers identify the section being viewed.
    if (isCurrentSection) {
      link.setAttribute('aria-current', 'page');
    } else {
      link.removeAttribute('aria-current');
    }
  });
}

// IntersectionObserver tells us when a section enters the middle of the screen.
// This avoids checking the page position on every scroll event.
const sectionObserver = new IntersectionObserver(
  (visibleSections) => {
    const sectionInView = visibleSections.find((entry) => entry.isIntersecting);

    if (sectionInView) {
      setActiveLink(sectionInView.target.id);
    }
  },
  {
    // A section counts as "current" when it reaches the middle portion of the viewport.
    rootMargin: '-30% 0px -55% 0px',
    threshold: 0
  }
);

// Watch each linked section so the matching navigation link updates as we scroll.
pageSections.forEach((section) => sectionObserver.observe(section));

// Home is the starting section before the observer has detected a section.
setActiveLink('home-container');
