import "server-only";
import QRCode from "qrcode";
import { env } from "@/lib/env";

/** Public URL encoded in every product QR. */
export function productQrUrl(code: string): string {
  return `${env.siteUrl}/p/${encodeURIComponent(code)}?src=qr`;
}

const OPTIONS = {
  errorCorrectionLevel: "M" as const,
  margin: 2,
  width: 768,
  color: { dark: "#2a190e", light: "#ffffff" },
};

export function qrPng(code: string): Promise<Buffer> {
  return QRCode.toBuffer(productQrUrl(code), { ...OPTIONS, type: "png" });
}

export function qrSvg(code: string): Promise<string> {
  return QRCode.toString(productQrUrl(code), { ...OPTIONS, type: "svg" });
}
