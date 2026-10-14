const SEEN_KEY = 'bv-crypto-warning-seen';
const AUTO_HIDE_MS = 7000;
const HIDE_TRANSITION_MS = 350;

// Shown once per session, the first time the Direct Crypto card scrolls into view.
export function initCryptoToast(): void {
  const toast = document.getElementById('cryptoToast');
  const closeBtn = document.getElementById('toastClose');
  const cryptoCard = document.querySelector('.crypto-full');

  let seen = false;
  try {
    seen = sessionStorage.getItem(SEEN_KEY) === '1';
  } catch {
    // Treat blocked storage as "not seen yet".
  }

  function hideToast(): void {
    if (!toast) return;
    toast.classList.remove('is-visible');
    setTimeout(() => {
      toast.hidden = true;
    }, HIDE_TRANSITION_MS);
  }

  function showToast(): void {
    if (!toast || seen) return;
    toast.hidden = false;
    requestAnimationFrame(() => toast.classList.add('is-visible'));
    seen = true;
    try {
      sessionStorage.setItem(SEEN_KEY, '1');
    } catch {
      // The toast may show again next visit if storage is blocked.
    }
    setTimeout(hideToast, AUTO_HIDE_MS);
  }

  closeBtn?.addEventListener('click', hideToast);

  if (cryptoCard && !seen && 'IntersectionObserver' in window) {
    const observer = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            showToast();
            obs.disconnect();
          }
        });
      },
      { threshold: 0.4 },
    );
    observer.observe(cryptoCard);
  }
}
