// Highlights the chain nav link of the section currently near the top of the viewport.
export function initChainNav(): void {
  const sections = document.querySelectorAll<HTMLElement>('main section[id]');
  const chainLinks = document.querySelectorAll<HTMLElement>('.chain__link');

  const setActiveLink = (id: string): void => {
    chainLinks.forEach((link) => {
      link.classList.toggle('is-active', link.dataset.section === id);
    });
  };

  const navObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) setActiveLink(entry.target.id);
      });
    },
    // Fires when a section is near the top of the viewport, just under the nav.
    { rootMargin: '-40% 0px -55% 0px' },
  );

  sections.forEach((section) => navObserver.observe(section));
}
