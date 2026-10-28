import JSZip from "jszip";
import { requireApiSession } from "@/lib/auth/session";
import { getDb } from "@/lib/db";
import { productQrUrl, qrPng } from "@/lib/qr";

export async function GET() {
  const denied = await requireApiSession();
  if (denied) return denied;

  const products = await getDb().listProducts();
  const zip = new JSZip();
  const index: string[] = ["kode,nama,url"];
  for (const p of products) {
    zip.file(`QR-${p.code}.png`, await qrPng(p.code));
    index.push(`${p.code},"${p.name.replace(/"/g, '""')}",${productQrUrl(p.code)}`);
  }
  zip.file("daftar-qr.csv", index.join("\n"));
  const body = await zip.generateAsync({ type: "uint8array", compression: "DEFLATE" });

  return new Response(new Uint8Array(body), {
    headers: {
      "Content-Type": "application/zip",
      "Content-Disposition": 'attachment; filename="QR-produk-astoetik.zip"',
      "Cache-Control": "no-store",
    },
  });
}
