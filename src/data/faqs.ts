import type { Product, ProductFaq } from "../types";
import { PRODUCTS } from "./products";

type QA = [question: string, answer: string];

// Manual-backed FAQs: only for the 3 products with an official manual.
const MANUAL_FAQS: Record<string, QA[]> = {
  "A-AS001": [
    [
      "Apa saja isi dalam kardus?",
      "Satu kompor batik listrik ASTOETIK versi Standar, satu wajan khusus batik, kartu garansi, dan buku petunjuk penggunaan.",
    ],
    [
      "Bagaimana cara menyalakan kompor?",
      "Letakkan wajan di atas tungku, masukkan potongan malam, pastikan skala pemanas di titik terendah, colokkan steker, lalu putar skala pemanas searah jarum jam sampai lampu indikator merah menyala.",
    ],
    [
      "Berapa banyak malam yang boleh dimasukkan?",
      "Masukkan malam yang sudah dipotong-potong sesuai kebutuhan, dengan berat maksimal sekitar 250 gram pada wajan batik.",
    ],
    [
      "Bagaimana mengatur suhu malam?",
      "Putar skala pemanas (potensio) searah jarum jam untuk menaikkan suhu dan berlawanan arah jarum jam untuk menurunkan. Malam siap dicantingkan bila sudah mencair rata.",
    ],
    [
      "Bagaimana cara mematikan kompor dengan aman?",
      "Putar skala pemanas ke titik terendah, lalu cabut steker dari stop kontak. Tunggu minimal 15 detik sebelum menyalakan kembali.",
    ],
    [
      "Lampu indikator tidak menyala, apa yang harus dilakukan?",
      "Pastikan steker sudah terhubung ke stop kontak dan arus listrik normal. Jika masih bermasalah, hubungi technical support Astoetik.",
    ],
    [
      "Bagaimana membersihkan bodi yang terkena malam?",
      "Lap bodi dengan air panas atau minyak tanah saat kompor dalam kondisi mati dan steker sudah dicabut. Jauhkan kompor dari air atau hujan.",
    ],
  ],
  "A-SD002": [
    [
      "Apa saja isi dalam kardus?",
      "Satu kompor batik listrik ASTOETIK, satu wajan khusus batik, kartu garansi, dan buku petunjuk penggunaan.",
    ],
    [
      "Bagaimana cara menyalakan kompor?",
      "Letakkan wajan, masukkan potongan malam, pastikan saklar OFF dan skala pemanas di titik terendah, colokkan steker, ubah saklar ke ON, lalu putar skala pemanas searah jarum jam sampai lampu indikator merah menyala.",
    ],
    [
      "Berapa banyak malam yang boleh dimasukkan?",
      "Berat maksimal malam yang sudah dipotong-potong sekitar 250 gram pada wajan batik.",
    ],
    [
      "Bagaimana cara mematikan kompor?",
      "Ubah saklar dari ON ke OFF, putar skala pemanas ke titik terendah, lalu cabut steker dari stop kontak.",
    ],
    [
      "Lampu menyala tetapi malam tidak mencair, kenapa?",
      "Kemungkinan elemen pemanas atau kabel power elemen putus, atau skala pemanas rusak. Jangan membongkar sendiri; hubungi technical support atau mitra toko alat batik terdekat.",
    ],
    [
      "Suhu terlalu panas, bagaimana menurunkannya?",
      "Putar skala pemanas berlawanan arah jarum jam untuk menurunkan suhu.",
    ],
    [
      "Apa yang perlu diperhatikan soal keselamatan?",
      "Tempatkan di permukaan datar, jauhkan dari air dan jangkauan anak-anak, beri ruang untuk pembuangan panas, periksa kabel secara berkala, dan cabut steker bila tidak dipakai lama.",
    ],
  ],
  "K-CL001": [
    [
      "Apa saja isi dalam kardus?",
      "Satu canting listrik, 20 gram malam/lilin, kartu garansi, buku petunjuk penggunaan, dan dudukan canting.",
    ],
    [
      "Berapa kapasitas malam di canting?",
      "Kapasitas malam/lilin pada nyamplung sekitar 20 gram.",
    ],
    [
      "Bagaimana cara menggunakan canting listrik?",
      "Taruh canting di dudukannya, masukkan potongan malam kecil ke nyamplung, pastikan pengatur suhu di posisi min, colokkan steker, lalu putar dari min ke max. Setelah malam mencair, putar ke titik tengah agar suhu stabil.",
    ],
    [
      "Bagaimana cara mematikan canting?",
      "Putar pengatur suhu dari Max ke Min, lalu cabut steker dari stop kontak.",
    ],
    [
      "Canting tidak panas, apa penyebabnya?",
      "Pastikan steker sudah terhubung, saklar dalam kondisi ON, dan arus listrik normal. Jika masih tidak panas, hubungi technical support atau mitra toko alat batik terdekat.",
    ],
    [
      "Bagaimana membersihkan canting dari sisa malam?",
      "Lap bodi yang terkena malam memakai air panas, bensin, atau minyak tanah. Pastikan canting sudah dimatikan dan tidak panas.",
    ],
    [
      "Apakah canting bisa dibongkar sendiri?",
      "Tidak disarankan. Jangan membongkar perangkat; bila ada kerusakan kabel, korsleting, atau cairan masuk, hubungi mitra toko alat batik terdekat.",
    ],
  ],
};

function specValue(p: Product, ...labels: string[]): string | null {
  for (const label of labels) {
    const hit = p.specs.find((s) => s.label === label);
    if (hit) return hit.value;
  }
  return null;
}

// Generic, safe FAQs for products without a manual. Built only from the
// product's own data plus general electrical-safety advice.
function generatedFaqs(p: Product): QA[] {
  const out: QA[] = [];
  const daya = specValue(p, "Daya", "Daya Maks");
  const tegangan = specValue(p, "Tegangan");
  if (daya || tegangan) {
    const parts = [daya && `daya ${daya}`, tegangan && `tegangan ${tegangan}`].filter(Boolean);
    out.push([
      "Berapa daya dan tegangan produk ini?",
      `Menurut data produk, ${p.name} memiliki ${parts.join(" dan ")}. Pastikan instalasi listrik di rumah sesuai sebelum digunakan.`,
    ]);
  }
  const bodi = specValue(p, "Bahan Bodi", "Bahan Bodi Canting");
  if (bodi) {
    out.push(["Apa bahan bodi produk ini?", `Bahan bodi ${p.name} adalah ${bodi}.`]);
  }
  const cert: string[] = [];
  if (p.sni) cert.push("bertanda SNI");
  if (p.tkdn) cert.push(`memiliki nilai TKDN ${p.tkdn}`);
  out.push([
    "Apakah produk ini bersertifikat SNI atau TKDN?",
    cert.length
      ? `Ya, produk ini ${cert.join(" dan ")}.`
      : "Data SNI/TKDN untuk produk ini belum tercantum. Silakan tanyakan ke CS melalui WhatsApp.",
  ]);
  out.push([
    "Apa tips aman menggunakan alat batik listrik?",
    "Gunakan di permukaan datar dan kering, jauhkan dari air dan jangkauan anak-anak, jangan menyentuh bagian panas saat menyala, dan cabut steker setelah selesai atau bila tidak dipakai lama.",
  ]);
  out.push([
    "Bagaimana menanyakan stok, garansi, atau cara pembelian?",
    "Untuk stok, garansi, dan pembelian, silakan hubungi CS Astoetik melalui tombol WhatsApp di halaman ini atau beli lewat marketplace.",
  ]);
  return out;
}

export const PRODUCT_FAQS: ProductFaq[] = PRODUCTS.flatMap((p) => {
  const manual = MANUAL_FAQS[p.code];
  const list = manual ?? generatedFaqs(p);
  const source = manual ? "manual" : "generated";
  return list.map(([question, answer], i) => ({
    id: `${p.code}-${i + 1}`,
    productCode: p.code,
    question,
    answer,
    source,
  }));
});
