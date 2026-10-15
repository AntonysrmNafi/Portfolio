const REVEAL_SELECTOR = '.reveal, .reveal-fade';
const REVEAL_CHILDREN_SELECTOR = '.reveal > .block-card, .reveal > .timeline__item, .reveal > .stack-layer';
const STAGGER_CHILDREN_SELECTOR = ':scope > .block-card, :scope > .timeline__item, :scope > .stack-layer';

function isTouchDevice(): boolean {
  return window.matchMedia('(hover: none)').matches || window.matchMedia('(max-width: 860px)').matches;
}

// Custom cursor: a dot that follows instantly and a ring that trails behind.
function initCursor(): void {
  const cursorDot = document.querySelector<HTMLElement>('.cursor-dot');
  const cursorRing = document.querySelector<HTMLElement>('.cursor-ring');
  if (!cursorDot || !cursorRing) return;

  document.body.classList.add('has-custom-cursor');
  let mouseX = window.innerWidth / 2;
  let mouseY = window.innerHeight / 2;

  window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    gsap.set(cursorDot, { x: mouseX, y: mouseY });
  });

  // The ring eases toward the pointer on every frame for the trailing feel.
  gsap.ticker.add(() => {
    gsap.to(cursorRing, { x: mouseX, y: mouseY, duration: 0.4, ease: 'power3.out', overwrite: 'auto' });
  });

  // The ring grows over interactive elements.
  document.querySelectorAll('a, button').forEach((el) => {
    el.addEventListener('mouseenter', () => cursorRing.classList.add('is-active'));
    el.addEventListener('mouseleave', () => cursorRing.classList.remove('is-active'));
  });

  document.addEventListener('mouseleave', () => {
    gsap.to([cursorDot, cursorRing], { opacity: 0, duration: 0.2 });
  });
  document.addEventListener('mouseenter', () => {
    gsap.to([cursorDot, cursorRing], { opacity: 1, duration: 0.2 });
  });
}

// Magnetic buttons pull toward the pointer. Touch devices get a squeeze and release pulse instead.
function initMagnetic(isTouch: boolean): void {
  const elements = document.querySelectorAll<HTMLElement>('.magnetic');

  if (!isTouch) {
    const strength = 0.35;
    elements.forEach((el) => {
      el.addEventListener('mousemove', (e) => {
        const rect = el.getBoundingClientRect();
        const relX = e.clientX - rect.left - rect.width / 2;
        const relY = e.clientY - rect.top - rect.height / 2;
        gsap.to(el, { x: relX * strength, y: relY * strength, duration: 0.4, ease: 'power3.out' });
      });
      el.addEventListener('mouseleave', () => {
        gsap.to(el, { x: 0, y: 0, duration: 0.5, ease: 'elastic.out(1, 0.4)' });
      });
    });
    return;
  }

  elements.forEach((el) => {
    el.addEventListener(
      'touchstart',
      () => gsap.to(el, { scale: 0.94, duration: 0.15, ease: 'power2.out' }),
      { passive: true },
    );
    el.addEventListener(
      'touchend',
      () => gsap.to(el, { scale: 1, duration: 0.5, ease: 'elastic.out(1, 0.4)' }),
      { passive: true },
    );
  });
}

// Subtle 3D tilt on project and stack cards.
function initCardTilt(): void {
  document.querySelectorAll<HTMLElement>('.block-card').forEach((card) => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const px = (e.clientX - rect.left) / rect.width - 0.5;
      const py = (e.clientY - rect.top) / rect.height - 0.5;
      gsap.to(card, {
        rotateY: px * 6,
        rotateX: py * -6,
        transformPerspective: 600,
        duration: 0.4,
        ease: 'power2.out',
      });
    });
    card.addEventListener('mouseleave', () => {
      gsap.to(card, { rotateX: 0, rotateY: 0, duration: 0.6, ease: 'power3.out' });
    });
  });
}

// Staggered hero entrance. Runs once on load and has no scroll dependency.
function initHeroEntrance(): void {
  gsap.from('.hero h1', { opacity: 0, y: 24, duration: 0.7, ease: 'power3.out' });
  gsap.from('.hero__role', { opacity: 0, y: 16, duration: 0.6, delay: 0.12, ease: 'power3.out' });
  gsap.from('.hero__lede', { opacity: 0, y: 16, duration: 0.6, delay: 0.2, ease: 'power3.out' });
  gsap.from('.hero__actions .magnetic', {
    opacity: 0,
    y: 16,
    duration: 0.6,
    delay: 0.28,
    stagger: 0.1,
    ease: 'power3.out',
  });
}

// Parallax on the decorative ambient blobs. Scrub ties the motion to scroll position and only
// moves position (never opacity), so it cannot conflict with the CSS reveal transitions.
// Scroll exists on every device, so this is intentionally not gated behind isTouch.
function initParallax(): void {
  const scrollTrigger = { trigger: 'body', start: 'top top', end: 'bottom bottom', scrub: true };

  gsap.to('.ambient__blob--1', { y: '20vh', ease: 'none', scrollTrigger });
  gsap.to('.ambient__blob--2', { y: '-15vh', ease: 'none', scrollTrigger });
  gsap.to('.ambient__blob--3', { y: '10vh', x: '-4vw', ease: 'none', scrollTrigger });
}

// The stagger delay is only meant for the entrance. Left in place it would also delay every later
// hover or tilt transition, so card #4 would react 270ms after card #1. Remove it once the reveal
// has finished so all siblings behave identically afterwards.
function clearDelayAfterReveal(el: HTMLElement): void {
  const onEnd = (e: TransitionEvent): void => {
    if (e.target !== el || e.propertyName !== 'opacity') return;
    el.style.transitionDelay = '';
    el.removeEventListener('transitionend', onEnd);
  };
  el.addEventListener('transitionend', onEnd);
}

// Scroll reveals use a plain CSS class toggle through IntersectionObserver instead of GSAP opacity
// tweens. Trigger math can miscalculate on short final sections or file:// pages and leave content
// stuck at opacity 0, while an observed element reliably gets its class and the CSS transition runs.
function initScrollReveal(): void {
  const revealObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;

        entry.target.classList.add('is-visible');

        // Stagger the direct children of grid and list containers.
        entry.target.querySelectorAll<HTMLElement>(STAGGER_CHILDREN_SELECTOR).forEach((child, i) => {
          child.style.transitionDelay = `${i * 90}ms`;
          child.classList.add('is-visible');
          clearDelayAfterReveal(child);
        });

        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -40px 0px' },
  );

  document.querySelectorAll(REVEAL_SELECTOR).forEach((el) => revealObserver.observe(el));
}

export function initMotion(prefersReducedMotion: boolean): void {
  // Section eyebrows and headings use the lighter fade-in variant. Footer socials are left out on
  // purpose: as the last element on the page they are the riskiest case for a missed trigger.
  document.querySelectorAll('.section .eyebrow, .section h2').forEach((el) => {
    el.classList.add('reveal-fade');
  });

  if (prefersReducedMotion || typeof gsap === 'undefined') {
    // Fallback: show everything immediately and skip all motion extras.
    document.querySelectorAll(REVEAL_SELECTOR).forEach((el) => el.classList.add('is-visible'));
    document.querySelectorAll(REVEAL_CHILDREN_SELECTOR).forEach((el) => el.classList.add('is-visible'));
    return;
  }

  gsap.registerPlugin(ScrollTrigger);

  const isTouch = isTouchDevice();
  if (!isTouch) {
    initCursor();
    initCardTilt();
  }
  initMagnetic(isTouch);
  initHeroEntrance();
  initParallax();
  initScrollReveal();
}
