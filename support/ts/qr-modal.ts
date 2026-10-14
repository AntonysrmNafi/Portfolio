import { readAddressInfo } from './address-row';

export function initQrModal(): void {
  const modal = document.getElementById('qrModal');
  const closeBtn = document.getElementById('qrModalClose');
  const addressText = document.getElementById('qrModalAddress');
  const codeContainer = document.getElementById('qrCodeContainer');
  let lastFocused: HTMLElement | null = null;

  function onKeydown(e: KeyboardEvent): void {
    if (e.key === 'Escape') closeModal();
  }

  function openModal(address: string, label: string): void {
    if (!modal || !addressText || !codeContainer) return;

    lastFocused = document.activeElement as HTMLElement | null;
    codeContainer.innerHTML = '';
    if (typeof QRCode !== 'undefined') {
      new QRCode(codeContainer, {
        text: address,
        width: 200,
        height: 200,
        colorDark: '#1A1A2E',
        colorLight: '#FFFFFF',
      });
    }
    addressText.textContent = `${label}: ${address}`;
    modal.hidden = false;
    closeBtn?.focus();
    document.addEventListener('keydown', onKeydown);
  }

  function closeModal(): void {
    if (!modal) return;
    modal.hidden = true;
    document.removeEventListener('keydown', onKeydown);
    lastFocused?.focus();
  }

  document.querySelectorAll<HTMLButtonElement>('.address-row .qr-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const info = readAddressInfo(btn);
      if (info) openModal(info.address, info.label);
    });
  });

  closeBtn?.addEventListener('click', closeModal);
  // Clicking the backdrop (but not the dialog itself) closes the modal.
  modal?.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });
}
