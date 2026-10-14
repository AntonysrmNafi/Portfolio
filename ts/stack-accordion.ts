// Skills stack accordion: each layer toggles its own aria-expanded state.
export function initStackAccordion(): void {
  document.querySelectorAll<HTMLButtonElement>('.stack-trigger').forEach((button) => {
    button.addEventListener('click', () => {
      const expanded = button.getAttribute('aria-expanded') === 'true';
      button.setAttribute('aria-expanded', String(!expanded));
    });
  });
}
