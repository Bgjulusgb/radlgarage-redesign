const menuButton = document.querySelector('[data-menu-button]');
const menu = document.querySelector('[data-menu]');
const header = document.querySelector('[data-header]');
let firstPageView = true;

try {
  firstPageView = sessionStorage.getItem('radlgarage-ready') !== 'true';
  sessionStorage.setItem('radlgarage-ready', 'true');
} catch {
  firstPageView = true;
}

const revealPage = () => {
  const minimumDuration = firstPageView ? 560 : 120;
  const delay = Math.max(0, minimumDuration - performance.now());
  window.setTimeout(() => document.documentElement.classList.add('is-ready'), delay);
};

if (document.readyState === 'complete') {
  revealPage();
} else {
  window.addEventListener('load', revealPage, { once: true });
}

if (header) {
  const toTop = document.querySelector('[data-to-top]');
  const updateHeader = () => {
    header.classList.toggle('is-scrolled', window.scrollY > 24);
    if (toTop) toTop.classList.toggle('is-visible', window.scrollY > window.innerHeight);
  };
  updateHeader();
  window.addEventListener('scroll', updateHeader, { passive: true });
}

if (menuButton && menu) {
  const closeMenu = () => {
    menuButton.setAttribute('aria-expanded', 'false');
    menu.classList.remove('is-open');
    document.body.classList.remove('menu-open');
  };

  menuButton.addEventListener('click', () => {
    const isOpen = menuButton.getAttribute('aria-expanded') === 'true';
    menuButton.setAttribute('aria-expanded', String(!isOpen));
    menu.classList.toggle('is-open', !isOpen);
    document.body.classList.toggle('menu-open', !isOpen);
  });

  menu.addEventListener('click', (event) => {
    if (event.target.closest('a')) closeMenu();
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') closeMenu();
  });

  window.addEventListener('resize', () => {
    if (window.innerWidth > 860) closeMenu();
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

const galleries = [...document.querySelectorAll('[data-gallery]')];
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

galleries.forEach((gallery) => {
  const viewport = gallery.querySelector('[data-gallery-viewport]');
  const slides = [...gallery.querySelectorAll('.gallery-slide')];
  const previous = gallery.querySelector('[data-gallery-prev]');
  const next = gallery.querySelector('[data-gallery-next]');
  const dots = gallery.querySelector('[data-gallery-dots]');
  const status = gallery.querySelector('[data-gallery-status]');

  if (!viewport || slides.length < 2 || !previous || !next || !dots) return;

  let current = 0;
  let scrollFrame = 0;
  let timer = 0;
  let visible = false;
  let paused = false;

  const dotButtons = slides.map((slide, index) => {
    const dot = document.createElement('button');
    dot.type = 'button';
    dot.setAttribute('aria-label', String(index + 1));
    dot.addEventListener('click', () => show(index));
    dots.append(dot);
    return dot;
  });

  const update = (index) => {
    current = (index + slides.length) % slides.length;
    slides.forEach((slide, slideIndex) => slide.setAttribute('aria-hidden', String(slideIndex !== current)));
    dotButtons.forEach((dot, dotIndex) => dot.setAttribute('aria-current', String(dotIndex === current)));
    if (status) status.textContent = `${current + 1} / ${slides.length}`;
  };

  const show = (index, behavior = 'smooth') => {
    const nextIndex = (index + slides.length) % slides.length;
    update(nextIndex);
    viewport.scrollTo({ left: slides[nextIndex].offsetLeft, behavior: reduceMotion.matches ? 'auto' : behavior });
  };

  const stop = () => {
    window.clearInterval(timer);
    timer = 0;
  };

  const start = () => {
    stop();
    if (!visible || paused || reduceMotion.matches || document.hidden) return;
    timer = window.setInterval(() => show(current + 1), 7000);
  };

  previous.addEventListener('click', () => { show(current - 1); start(); });
  next.addEventListener('click', () => { show(current + 1); start(); });
  viewport.addEventListener('keydown', (event) => {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
    event.preventDefault();
    show(current + (event.key === 'ArrowRight' ? 1 : -1));
    start();
  });
  viewport.addEventListener('scroll', () => {
    window.cancelAnimationFrame(scrollFrame);
    scrollFrame = window.requestAnimationFrame(() => {
      const closest = slides.reduce((best, slide, index) => Math.abs(slide.offsetLeft - viewport.scrollLeft) < Math.abs(slides[best].offsetLeft - viewport.scrollLeft) ? index : best, 0);
      if (closest !== current) update(closest);
    });
  }, { passive: true });

  gallery.addEventListener('mouseenter', () => { paused = true; stop(); });
  gallery.addEventListener('mouseleave', () => { paused = false; start(); });
  gallery.addEventListener('focusin', () => { paused = true; stop(); });
  gallery.addEventListener('focusout', (event) => {
    if (gallery.contains(event.relatedTarget)) return;
    paused = false;
    start();
  });
  gallery.addEventListener('touchstart', () => { paused = true; stop(); }, { passive: true });
  gallery.addEventListener('touchend', () => { paused = false; start(); }, { passive: true });
  document.addEventListener('visibilitychange', start);
  reduceMotion.addEventListener?.('change', start);

  if ('ResizeObserver' in window) {
    new ResizeObserver(() => viewport.scrollTo({ left: slides[current].offsetLeft, behavior: 'auto' })).observe(viewport);
  }

  if ('IntersectionObserver' in window) {
    new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      start();
    }, { threshold: .55 }).observe(gallery);
  } else {
    visible = true;
    start();
  }

  update(0);
  gallery.classList.add('is-active');
});

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
