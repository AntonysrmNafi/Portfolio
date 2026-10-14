import { readAddressInfo } from './address-row';
import { getCurrentDictionary } from './language';

const FEEDBACK_MS = 1500;

// Falls back to execCommand where navigator.clipboard is unavailable
// (file:// pages, non-HTTPS origins, or older browsers).
function copyText(text: string): Promise<void> {
  if (navigator.clipboard && window.isSecureContext) {
    return navigator.clipboard.writeText(text);
  }

  return new Promise<void>((resolve, reject) => {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();

    try {
      const ok = document.execCommand('copy');
      document.body.removeChild(textarea);
      if (ok) resolve();
      else reject(new Error('execCommand copy failed'));
    } catch (err) {
      document.body.removeChild(textarea);
      reject(err);
    }
  });
}

export function initCopyButtons(): void {
  document.querySelectorAll<HTMLButtonElement>('.address-row .copy-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const info = readAddressInfo(btn);
      if (!info) return;

      const dict = getCurrentDictionary();
      const statusEl = document.getElementById('copyStatus');

      // Shows a temporary label on the button, then restores the original text.
      const flash = (text: string, status: string): void => {
        const original = btn.textContent;
        btn.textContent = text;
        if (statusEl) statusEl.textContent = status;
        setTimeout(() => {
          btn.textContent = original;
        }, FEEDBACK_MS);
      };

      copyText(info.address)
        .then(() => flash(dict.copied, `${info.label} address copied to clipboard`))
        .catch((err: unknown) => {
          console.error('Copy failed:', err);
          flash(dict.copyFailed, `Could not copy ${info.label} address`);
        });
    });
  });
}
