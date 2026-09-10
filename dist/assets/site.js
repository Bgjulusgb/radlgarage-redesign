const menuButton = document.querySelector('[data-menu-button]');
const menu = document.querySelector('[data-menu]');
const header = document.querySelector('[data-header]');

if (header) {
  const updateHeader = () => header.classList.toggle('is-scrolled', window.scrollY > 24);
  updateHeader();
  window.addEventListener('scroll', updateHeader, { passive: true });
}

if (menuButton && menu) {
  menuButton.addEventListener('click', () => {
    const isOpen = menuButton.getAttribute('aria-expanded') === 'true';
    menuButton.setAttribute('aria-expanded', String(!isOpen));
    menu.classList.toggle('is-open', !isOpen);
  });

  menu.addEventListener('click', (event) => {
    if (event.target.closest('a')) {
      menuButton.setAttribute('aria-expanded', 'false');
      menu.classList.remove('is-open');
    }
  });
}

const brandDirectory = document.querySelector('[data-brand-directory]');

if (brandDirectory) {
  const brandDrops = [...brandDirectory.querySelectorAll('.brand-drop')];

  const openBrandFromHash = () => {
    const target = document.querySelector(window.location.hash);

    if (!target || !target.classList.contains('brand-drop')) return;

    brandDrops.forEach((drop) => {
      drop.open = drop === target;
    });
  };

  brandDrops.forEach((drop) => {
    drop.addEventListener('toggle', () => {
      if (!drop.open) return;

      brandDrops.forEach((otherDrop) => {
        if (otherDrop !== drop) otherDrop.open = false;
      });
    });
  });

  if (window.location.hash) openBrandFromHash();
  window.addEventListener('hashchange', openBrandFromHash);
}

const revealTargets = document.querySelectorAll([
  '.bulletin',
  '.intro',
  '.brand-preview > header',
  '.brand-drop',
  '.service-cta',
  '.service-lead',
  '.service-columns',
  '.service-notes',
  '.legal-copy'
].join(','));

revealTargets.forEach((target) => target.setAttribute('data-reveal', ''));

if ('IntersectionObserver' in window) {
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;

      entry.target.classList.add('is-visible');
      revealObserver.unobserve(entry.target);
    });
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });

  revealTargets.forEach((target) => revealObserver.observe(target));
} else {
  revealTargets.forEach((target) => target.classList.add('is-visible'));
}
