import "server-only";
import QRCode from "qrcode";
import { env } from "@/lib/env";

/** Public URL encoded in a QR: the product type page, or one unit's page when a serial is given. */
export function productQrUrl(code: string, serial?: string): string {
  const unit = serial ? `/${encodeURIComponent(serial)}` : "";
  return `${env.siteUrl}/p/${encodeURIComponent(code)}${unit}?src=qr`;
}

const OPTIONS = {
  errorCorrectionLevel: "M" as const,
  margin: 2,
  width: 768,
  color: { dark: "#2a190e", light: "#ffffff" },
};

export function qrPng(code: string, serial?: string): Promise<Buffer> {
  return QRCode.toBuffer(productQrUrl(code, serial), { ...OPTIONS, type: "png" });
}

export function qrSvg(code: string, serial?: string): Promise<string> {
  return QRCode.toString(productQrUrl(code, serial), { ...OPTIONS, type: "svg" });
}
