// Source of truth for operation, shutdown, troubleshooting and care: "FAQ per Produk.pdf"
// (referensi/). Only the three products below are covered by that document. The wording follows
// the PDF; the chatbot, the FAQ accordion and the support fallback all read from here.

export interface Trouble {
  /** The symptom, as titled in the PDF ("Pertanyaan Lanjutan"). */
  symptom: string;
  steps: string[];
}

export interface PdfFaq {
  /** "Jenis Produk" in the PDF. */
  type: string;
  operate: string[];
  shutdown: string[];
  trouble: Trouble[];
  care: string[];
}

const CARE_COMMON = [
  "Pastikan bahwa tegangan listrik memenuhi persyaratan perangkat. Pastikan bahwa beban listrik dari kabel listrik memenuhi persyaratan. Periksa kabel secara berkala. Silakan ganti kabel jika terjadi kerusakan dengan segera.",
  "Pastikan terdapat cukup ruang guna pembuangan panas dari perangkat untuk memperpanjang umur.",
  "Tempatkan perangkat pada permukaan yang datar. Jangan menaruh benda berat pada perangkat.",
  "Jauhkan perangkat dari air atau hujan.",
];
const CARE_TAIL = [
  "Matikan dan cabut tusuk kabel (steker) jika perangkat tidak akan digunakan untuk waktu yang lama.",
  "Setelah power OFF, tunggu setidaknya 15 detik antara mematikan dan menghidupkan perangkat berikutnya.",
];

const STOVE_TROUBLE: Trouble[] = [
  {
    symptom: "Lampu indikator tidak menyala",
    steps: [
      "Jika tusuk kontak (steker) belum dihubungkan ke stop kontak, pastikan tusuk kontak (steker) dihubungkan ke stop kontak.",
      "Jika saklar belum pada kondisi ON, pastikan bahwa saklar pada kondisi ON.",
      "Jika kompor belum teraliri arus listrik, pastikan arus listrik normal (bantuan alat).",
    ],
  },
  {
    symptom: "Lampu indikator menyala, tetapi malam tidak bisa mencair",
    steps: [
      "Jika elemen pemanas rusak/putus, pastikan elemen dalam kondisi baik. Lakukan penggantian jika rusak.",
      "Jika kabel power untuk elemen pemanas putus, lakukan penggantian.",
      "Jika skala pemanas mengalami kerusakan, lakukan penggantian.",
      "Jika terjadi gangguan pada rangkaian komponen elektronik, matikan kompor dan nyalakan kembali.",
    ],
  },
  {
    symptom: "Suhu panas melebihi batas",
    steps: [
      "Jika skala pemanas belum diatur, putar berlawanan arah jarum jam untuk menurunkan suhu.",
      "Jika terjadi gangguan pada rangkaian komponen elektronik, matikan kompor selama ± 5 menit dan nyalakan kembali.",
    ],
  },
];

const STOVE_CARE = [...CARE_COMMON, "Gunakan air panas atau minyak tanah untuk membersihkan bodi yang terkena malam dengan cara dilap (kondisi perangkat mati).", ...CARE_TAIL];

export const FAQ_PDF: Record<string, PdfFaq> = {
  "A-AS001": {
    type: "Kompor Listrik",
    operate: [
      "Letakkan wajan khusus membatik ke atas tungku kompor dengan posisi sempurna.",
      "Masukkan malam sesuai kebutuhan dengan memperhatikan berat maksimal pada wajan batik yang telah dipotong-potong (± 250 gr).",
      "Pastikan kompor listrik dalam keadaan nonaktif dengan melihat tanda off pada skala pemanas (potensio) pada titik terendah (titik paling kecil).",
      "Masukkan tusuk kontak (steker) ke stop kontak agar kompor mendapatkan arus listrik.",
      "Pastikan kompor listrik dalam keadaan aktif dengan memutar skala pemanas (potensio) searah jarum jam.",
      "Pastikan lampu indikator berwarna merah menyala pada panel kompor. Lampu indikator menandakan bahwa kompor telah mendapatkan arus listrik dan menyala dengan tingkatan kecerahan sesuai tingkatan suhu pada elemen pemanas.",
      "Untuk menaikkan suhu, putar skala pemanas searah jarum jam; untuk menurunkan suhu, putar berlawanan arah jarum jam. Penanda titik mengartikan tingkatan suhu untuk memanaskan elemen pemanas.",
      "Bila malam sudah mencair secara rata, pastikan suhu malam sudah stabil dan siap dicantingkan ke kain. Atur skala pemanas sesuai dengan kebutuhan dengan cara diputar.",
    ],
    shutdown: [
      "Nonaktifkan kompor dengan memutar skala pada titik terendah (titik paling kecil).",
      "Lepaskan tusuk kontak (steker) dari stop kontak agar kompor tidak mendapatkan arus listrik.",
    ],
    trouble: STOVE_TROUBLE,
    care: STOVE_CARE,
  },
  "A-SD002": {
    type: "Kompor Listrik",
    operate: [
      "Letakkan wajan khusus membatik ke atas tungku kompor dengan posisi sempurna.",
      "Masukkan malam sesuai kebutuhan dengan memperhatikan berat maksimal pada wajan batik yang telah dipotong-potong (± 250 gr).",
      "Pastikan kompor listrik dalam keadaan nonaktif dengan melihat tanda off pada saklar dan skala pemanas (potensio) pada titik terendah (titik paling kecil).",
      "Masukkan tusuk kontak (steker) ke stop kontak agar kompor mendapatkan arus listrik.",
      "Pastikan kompor listrik dalam keadaan aktif dengan mengubah tanda OFF menjadi ON pada saklar.",
      "Pastikan lampu indikator berwarna merah menyala dengan memutar skala pemanas (potensio) searah jarum jam pada panel kompor. Lampu indikator menandakan bahwa kompor telah mendapatkan arus listrik dan menyala dengan tingkatan kecerahan sesuai tingkatan suhu pada elemen pemanas.",
      "Untuk menaikkan suhu, putar skala pemanas searah jarum jam; untuk menurunkan suhu, putar berlawanan arah jarum jam. Penanda titik mengartikan tingkatan suhu untuk memanaskan elemen pemanas.",
      "Bila malam sudah mencair secara rata, pastikan suhu malam sudah stabil dan siap dicantingkan ke kain. Atur skala pemanas sesuai dengan kebutuhan dengan cara diputar.",
    ],
    shutdown: [
      "Nonaktifkan kompor dengan mengubah kondisi ON menjadi OFF pada saklar dan memutar skala pada titik terendah (titik paling kecil).",
      "Lepaskan tusuk kontak (steker) dari stop kontak agar kompor tidak mendapatkan arus listrik.",
    ],
    trouble: STOVE_TROUBLE,
    care: STOVE_CARE,
  },
  "K-CL001": {
    type: "Canting Listrik",
    operate: [
      "Posisikan canting listrik sesuai posisinya di dudukan canting.",
      "Masukkan malam kecil yang sudah dipotong ke dalam tabung/nyamplung (± 10 gr).",
      "Pastikan canting listrik dalam keadaan off dengan melihat posisi saklar pengatur suhu pada titik terendah (min).",
      "Masukkan tusuk kontak (steker) ke stop kontak agar canting mendapatkan arus listrik.",
      "Pastikan canting listrik dalam keadaan aktif dengan memutar tanda skala pemanas dari titik minimal ke titik maksimal.",
      "Tunggu (±) 10 menit hingga malam/lilin mencair sempurna.",
      "Setelah malam mencair, posisikan tanda ke titik tengah untuk mendapatkan suhu malam yang stabil.",
      "Canting siap digunakan.",
    ],
    shutdown: [
      "Nonaktifkan canting dengan mengubah kondisi Max menjadi Min pada saklar.",
      "Keluarkan tusuk kontak (steker) dari stop kontak agar canting tidak mendapatkan arus listrik.",
    ],
    trouble: [
      {
        symptom: "Canting tidak panas",
        steps: [
          "Jika tusuk kontak (steker) belum dihubungkan ke stop kontak, pastikan tusuk kontak sudah dihubungkan ke stop kontak.",
          "Jika saklar belum pada kondisi ON, pastikan bahwa saklar pada kondisi ON.",
          "Jika kabel belum teraliri arus listrik, pastikan bahwa arus listrik normal.",
        ],
      },
      {
        symptom: "Suhu panas melebihi batas",
        steps: ["Jika skala pemanas belum diatur, putar berlawanan arah jarum jam untuk menurunkan suhu."],
      },
    ],
    care: [...CARE_COMMON, "Gunakan air panas, bensin atau minyak tanah untuk membersihkan bodi yang terkena malam dengan cara dilap.", ...CARE_TAIL],
  },
};

const numbered = (steps: string[]) => steps.map((s, i) => `${i + 1}) ${s}`).join("\n");

/** Question and answer pairs for the FAQ accordion and the chatbot. */
export function pdfQuestions(code: string): [question: string, answer: string][] {
  const d = FAQ_PDF[code];
  if (!d) return [];
  const noun = d.type === "Canting Listrik" ? "canting" : "kompor";
  return [
    [`Bagaimana cara mengoperasikan ${noun} ini?`, numbered(d.operate)],
    [`Bagaimana cara mematikan ${noun} ini?`, numbered(d.shutdown)],
    ...d.trouble.map((t): [string, string] => [`${t.symptom}, apa yang harus dilakukan?`, numbered(t.steps)]),
    [`Bagaimana cara merawat ${noun} ini?`, numbered(d.care)],
  ];
}

/** Plain-text knowledge block for the chatbot context. */
export function pdfContext(code: string): string {
  const d = FAQ_PDF[code];
  if (!d) return "";
  return [
    `FAQ per Produk (sumber resmi, utamakan bila ada perbedaan dengan teks lain). Jenis produk: ${d.type}.`,
    `Cara mengoperasikan perangkat:\n${numbered(d.operate)}`,
    `Cara mematikan perangkat:\n${numbered(d.shutdown)}`,
    ...d.trouble.map((t) => `Kendala/permasalahan, ${t.symptom}:\n${numbered(t.steps)}`),
    `Perawatan:\n${numbered(d.care)}`,
  ].join("\n\n");
}
