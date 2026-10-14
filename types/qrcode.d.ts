// Minimal ambient types for qrcodejs loaded from the CDN.
interface QRCodeOptions {
  text: string;
  width?: number;
  height?: number;
  colorDark?: string;
  colorLight?: string;
}

declare const QRCode: new (element: HTMLElement, options: QRCodeOptions) => unknown;
