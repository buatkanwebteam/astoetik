import type { Product, ProductFaq } from "@/types";
import { formatRupiah } from "@/lib/format";

// Deterministic chatbot used when GEMINI_API_KEY is not set. It only answers
// from the product's own data/FAQ, mirroring the real bot's guardrails.

const STOPWORDS = new Set(
  "apa apakah ini itu yang dan di ke dari untuk dengan bisa saya kak min ya tidak gak ga berapa bagaimana gimana cara produk kompor canting ada adalah pada atau juga".split(" "),
);

function tokens(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((t) => t.length > 2 && !STOPWORDS.has(t));
}

const SAFETY = "Ingat: cabut steker sebelum membersihkan, jangan sentuh bagian yang panas, dan jauhkan dari air serta anak-anak.";
const NEED_SAFETY = /(panas|listrik|bersih|cuci|perbaik|bongkar|rusak|aman|steker|kabel|nyala|mati)/i;
const PRODUCT_HINT = /(kompor|canting|malam|lilin|batik|wajan|daya|watt|volt|tegangan|harga|bahan|ukuran|tinggi|diameter|berat|sni|tkdn|garansi|stok|beli|pakai|guna|nyala|mati|panas|bersih|suhu|kirim|ongkir|isi|kardus|nyamplung|cucuk|baterai|steker|kabel|listrik|aman|rusak)/i;

function spec(p: Product, re: RegExp): string | null {
  const hits = p.specs.filter((s) => re.test(s.label));
  return hits.length ? hits.map((s) => `${s.label.toLowerCase()} ${s.value}`).join(", ") : null;
}

export function mockChatAnswer(product: Product, faqs: ProductFaq[], question: string): string {
  const q = question.toLowerCase();

  if (/(abaikan|ignore|system prompt|instruksi|prompt kamu|jailbreak)/i.test(q)) {
    return `Maaf, saya hanya bisa membantu pertanyaan seputar ${product.name}. Ada yang ingin ditanyakan tentang produk ini?`;
  }
  if (!PRODUCT_HINT.test(q)) {
    return `Maaf, saya hanya bisa menjawab pertanyaan tentang ${product.name}. Silakan tanya soal spesifikasi, cara pakai, atau perawatannya.`;
  }
  if (/(garansi|stok|ongkir|kirim|diskon|promo|cicil)/i.test(q)) {
    return "Untuk info stok, garansi, ongkir, dan promo, saya belum punya datanya. Silakan hubungi CS Astoetik lewat tombol WhatsApp di bawah, ya.";
  }
  if (/(harga|berapa duit|biaya)/i.test(q)) {
    return `Harga katalog ${product.name} adalah ${formatRupiah(product.price)}. Harga di marketplace bisa berbeda; cek tombol "Beli di Marketplace" atau tanya CS via WhatsApp.`;
  }
  if (/(sni|tkdn|sertifikat)/i.test(q)) {
    const parts = [product.sni ? "bertanda SNI" : null, product.tkdn ? `memiliki TKDN ${product.tkdn}` : null].filter(Boolean);
    return parts.length
      ? `${product.name} ${parts.join(" dan ")}.`
      : "Data SNI/TKDN produk ini belum tercantum di sistem saya. Silakan konfirmasi ke CS via WhatsApp.";
  }

  // Best FAQ by token overlap.
  const qt = new Set(tokens(q));
  let best: { faq: ProductFaq; score: number } | null = null;
  for (const faq of faqs) {
    const score = tokens(faq.question).filter((t) => qt.has(t)).length;
    if (score > 0 && (!best || score > best.score)) best = { faq, score };
  }
  if (best) {
    return NEED_SAFETY.test(q) && !/steker/i.test(best.faq.answer) ? `${best.faq.answer} ${SAFETY}` : best.faq.answer;
  }

  const lookups: [RegExp, RegExp][] = [
    [/(daya|watt|listrik)/i, /daya/i],
    [/(tegangan|volt)/i, /tegangan/i],
    [/(bahan|material)/i, /bahan|handle/i],
    [/(ukuran|tinggi|diameter|besar|berat|dimensi)/i, /tinggi|diameter|ukuran|berat|panjang/i],
    [/(suhu|kontrol|atur|otomatis)/i, /kontrol|pengaturan/i],
    [/(baterai|batrai|portabel)/i, /baterai|tegangan/i],
  ];
  for (const [qre, labelRe] of lookups) {
    if (qre.test(q)) {
      const v = spec(product, labelRe);
      if (v) return `Menurut data produk, ${product.name} memiliki ${v}.${NEED_SAFETY.test(q) ? ` ${SAFETY}` : ""}`;
    }
  }

  return "Maaf, informasi itu belum ada di data produk saya. Silakan tanyakan langsung ke CS Astoetik lewat tombol WhatsApp agar jawabannya akurat.";
}
