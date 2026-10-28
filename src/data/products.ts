import type { MarketplaceLinks, Product, ProductCategory, ProductSpec } from "../types";

// Source of truth: "Data per Produk" (Draft Website ASTERA-X.pdf).
// Cells marked "-" in the source are left out entirely (never guessed).

type SpecTuple = [label: string, value: string | null];

interface SeedRow {
  code: string;
  name: string;
  category: ProductCategory;
  price: number;
  specs: SpecTuple[];
  tkdn: string | null;
  sni: boolean;
  gallery: number;
  note: string | null;
}

// No official store URLs exist in the source documents, so we link to a
// marketplace search for the product code (see DECISIONS.md).
function searchLinks(code: string): MarketplaceLinks {
  const q = encodeURIComponent(`astoetik ${code}`);
  return {
    shopee: `https://shopee.co.id/search?keyword=${q}`,
    tokopedia: `https://www.tokopedia.com/search?q=${q}`,
  };
}

const rows: SeedRow[] = [
  {
    code: "A-AS001",
    name: "Kompor Batik Listrik Low Cost v1",
    category: "kompor",
    price: 220000,
    specs: [
      ["Bahan Bodi", "Alumunium"],
      ["Handle", "Alumunium"],
      ["Daya", "150 W"],
      ["Tegangan", "220 V"],
      ["Kontrol Panas", "Manual"],
      ["Tinggi", "12,5 cm"],
      ["Diameter", "16 cm"],
    ],
    tkdn: null,
    sni: false,
    gallery: 4,
    note: null,
  },
  {
    code: "A-AS002",
    name: "Kompor Batik Listrik v1",
    category: "kompor",
    price: 240000,
    specs: [
      ["Bahan Bodi", "Alumunium"],
      ["Daya", "150 W"],
      ["Kontrol Panas", "Manual"],
      ["Ukuran", "16 x 13 cm"],
    ],
    tkdn: null,
    sni: false,
    gallery: 3,
    note: null,
  },
  {
    code: "A-AS003",
    name: "Kompor Batik Tulis Listrik",
    category: "kompor",
    price: 225000,
    specs: [
      ["Bahan Bodi", "Kayu"],
      ["Daya", "150 W"],
      ["Kontrol Panas", "Manual"],
      ["Ukuran", "16 x 13 cm"],
    ],
    tkdn: null,
    sni: false,
    gallery: 4,
    note: null,
  },
  {
    code: "A-AS003N",
    name: "Kompor Batik Listrik Low Cost SNI",
    category: "kompor",
    price: 270000,
    specs: [
      ["Bahan Bodi", "Alumunium"],
      ["Handle", "Plastik"],
      ["Daya", "150 W"],
      ["Tegangan", "220 V AC"],
      ["Kontrol Panas", "Manual"],
      ["Tinggi", "13,5 cm"],
      ["Diameter", "16 cm"],
    ],
    tkdn: null,
    sni: true,
    gallery: 3,
    note: null,
  },
  {
    code: "A-AU002",
    name: "Kompor Batik Listrik Otomatis",
    category: "kompor",
    price: 310000,
    specs: [
      ["Bahan Bodi", "Alumunium"],
      ["Handle", "Plastik"],
      ["Daya", "300 W"],
      ["Tegangan", "220 V"],
      ["Kontrol Panas", "Otomatis"],
      ["Tinggi", "20,5 cm"],
      ["Diameter", "16 cm"],
    ],
    tkdn: null,
    sni: false,
    gallery: 3,
    note: null,
  },
  {
    code: "A-SD001",
    name: "Kompor Batik Listrik Standar v1",
    category: "kompor",
    price: 290000,
    specs: [
      ["Bahan Bodi", "Alumunium"],
      ["Handle", "Alumunium"],
      ["Daya", "300 W"],
      ["Tegangan", "220 V"],
      ["Kontrol Panas", "Manual"],
      ["Tinggi", "20,5 cm"],
      ["Diameter", "16 cm"],
    ],
    tkdn: "42,27%",
    sni: false,
    gallery: 2,
    note: null,
  },
  {
    code: "A-SD002",
    name: "Kompor Batik Tulis Listrik",
    category: "kompor",
    price: 300000,
    specs: [
      ["Bahan Bodi", "Alumunium"],
      ["Handle", "Plastik"],
      ["Daya", "300 W"],
      ["Tegangan", "220 V"],
      ["Kontrol Panas", "Manual"],
      ["Tinggi", "20,5 cm"],
      ["Diameter", "16 cm"],
    ],
    tkdn: "42,45%",
    sni: false,
    gallery: 2,
    note: null,
  },
  {
    code: "A-SD002N",
    name: "Kompor Batik Listrik SNI",
    category: "kompor",
    price: 300000,
    specs: [
      ["Bahan Bodi", "Alumunium"],
      ["Handle", "Plastik"],
      ["Daya", "150 W"],
      ["Tegangan", "220 V AC"],
      ["Kontrol Panas", "Manual"],
      ["Tinggi", "20 cm"],
      ["Diameter", "16 cm"],
    ],
    tkdn: null,
    sni: true,
    gallery: 3,
    note: null,
  },
  {
    code: "A-SD003N",
    name: "Kompor Batik Listrik SNI New",
    category: "kompor",
    price: 375000,
    specs: [
      ["Bahan Bodi", "Besi"],
      ["Handle", "Plastik"],
      ["Daya", "280 W"],
      ["Tegangan", "220 V AC"],
      ["Kontrol Panas", "Manual"],
      ["Tinggi", "19 cm"],
      ["Diameter", "20 cm"],
    ],
    tkdn: "42,37%",
    sni: true,
    gallery: 3,
    note: null,
  },
  {
    code: "B-KC001",
    name: "Kompor Cap Besi",
    category: "kompor-cap",
    price: 950000,
    specs: [
      ["Bahan Bodi", "Besi"],
      ["Daya Maks", "700 W"],
      ["Tegangan", "220 V AC"],
      ["Kontrol Panas", "Manual"],
      ["Tinggi", "12 cm"],
      ["Diameter", "40 cm"],
      ["Berat", "5 kg"],
    ],
    tkdn: "34%",
    sni: false,
    gallery: 2,
    note: "Kompor untuk batik cap",
  },
  {
    code: "T-SD001",
    name: "Kompor Batik Listrik Tanah Liat",
    category: "kompor",
    price: 310000,
    specs: [
      ["Bahan Bodi", "Tanah Liat"],
      ["Handle", "Tanah Liat"],
      ["Daya", "300 W"],
      ["Tegangan", "220 V"],
      ["Kontrol Panas", "Manual"],
      ["Tinggi", "19,5 cm"],
      ["Diameter", "17 cm"],
    ],
    tkdn: "46,50%",
    sni: false,
    gallery: 3,
    note: null,
  },
  {
    code: "T-SD003N",
    name: "Kompor Batik Listrik SNI Tanah Liat",
    category: "kompor",
    price: 325000,
    specs: [
      ["Bahan Bodi", "Tanah Liat"],
      ["Handle", "Tanah Liat"],
      ["Daya Maks", "280 W"],
      ["Tegangan", "220 V"],
      ["Kontrol Panas", "Manual"],
      ["Tinggi", "20,5 cm"],
      ["Diameter", "18 cm"],
    ],
    tkdn: null,
    sni: true,
    gallery: 4,
    note: null,
  },
  {
    code: "K-CL001",
    name: "Canting Listrik (V1)",
    category: "canting",
    price: 150000,
    specs: [
      ["Bahan Gagang", "Kayu"],
      ["Bahan Bodi Canting", "Kuningan"],
      ["Model", "Cucuk Klowong"],
      ["Panjang Gagang", "11 cm"],
      ["Daya", "40 W"],
      ["Tegangan", "220 V"],
      ["Pengaturan", "Manual"],
      ["Berat", "95 gr"],
    ],
    tkdn: "32,85%",
    sni: false,
    gallery: 2,
    note: null,
  },
  {
    code: "K-CL002",
    name: "Canting Listrik 3in1",
    category: "canting",
    price: 250000,
    specs: [
      ["Bahan Gagang", "Kayu"],
      ["Bahan Bodi Canting", "Kuningan"],
      ["Model", "Cucuk 3 jenis (Cecek, Klowong, Tembokan)"],
      ["Panjang Gagang", "11 cm"],
      ["Daya", "40 W"],
      ["Tegangan", "220 V"],
      ["Pengaturan", "Manual"],
      ["Berat", "95 gr"],
    ],
    tkdn: "32,85%",
    sni: false,
    gallery: 2,
    note: null,
  },
  {
    code: "K-CL003",
    name: "Canting Listrik Ekonomis (Portabel)",
    category: "canting",
    price: 700000,
    specs: [
      ["Bahan Bodi Canting", "PVC"],
      ["Model", "Stick Tabung"],
      ["Daya", "40 W"],
      ["Tegangan", "220 V AC (input adaptor) / 14 VDC (baterai)"],
      ["Kapasitas Baterai", "18.000 - 20.000 mAh"],
      ["Pengaturan", "Manual"],
    ],
    tkdn: null,
    sni: false,
    gallery: 2,
    note: "Portabel",
  },
];

function toSpecs(tuples: SpecTuple[]): ProductSpec[] {
  return tuples
    .filter((t): t is [string, string] => t[1] !== null && t[1] !== "")
    .map(([label, value]) => ({ label, value }));
}

export const PRODUCTS: Product[] = rows.map((r) => {
  const slug = r.code.toLowerCase();
  const gallery = [`/products/${slug}.jpg`];
  for (let i = 2; i <= r.gallery; i++) gallery.push(`/products/${slug}-${i}.jpg`);
  return {
    code: r.code,
    name: r.name,
    category: r.category,
    price: r.price,
    specs: toSpecs(r.specs),
    tkdn: r.tkdn,
    sni: r.sni,
    image: gallery[0],
    gallery,
    marketplaceLinks: searchLinks(r.code),
    note: r.note,
  };
});

export const CATEGORY_LABEL: Record<ProductCategory, string> = {
  kompor: "Kompor Batik Listrik",
  "kompor-cap": "Kompor Batik Cap",
  canting: "Canting Listrik",
};
