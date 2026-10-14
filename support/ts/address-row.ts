// Shared lookup for the wallet row a copy or QR button belongs to.
export interface AddressInfo {
  address: string;
  label: string;
}

export function readAddressInfo(button: HTMLElement): AddressInfo | null {
  const address = button
    .closest('.address-row__main')
    ?.querySelector<HTMLElement>('.crypto-address')?.dataset.address;
  const label = button
    .closest('.address-row')
    ?.querySelector('.address-row__label')?.textContent?.trim();

  if (!address || !label) return null;
  return { address, label };
}
