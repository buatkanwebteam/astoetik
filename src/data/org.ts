/** Struktur organisasi Astoetik (popup "Lihat struktur" di bagian Tentang). */
export interface OrgPerson {
  /** Jabatan / nama divisi */
  title: string;
  name: string;
  desc?: string[];
  /** Anggota: teks bebas, mis. "Isni Widarti" atau "Tenaga Part time & Freelance" */
  members?: string[];
  /** Sub-bagian di dalam divisi */
  subs?: { label: string; members: string[] }[];
  icon: "direktur" | "komisaris" | "finance" | "ops" | "sales" | "produksi" | "ri" | "it";
}

export const ORG_TOP: OrgPerson[] = [
  {
    title: "Direktur",
    name: "Aris Stiyawan, A.Md., S.Pd.",
    desc: ["Kompetensi Kewirausahaan Industri", "Staff Administrasi PT. Angkasa Pura 1 (Persero) (Experience)", "Komisaris PT. PMC Teknikindo"],
    icon: "direktur",
  },
  {
    title: "Komisaris",
    name: "Nova Suparmanto M.Sc.",
    desc: ["Kompetensi Kewirausahaan Industri", "Dosen Teknik Industri UNY", "Direktur PT. PMC Teknikindo"],
    icon: "komisaris",
  },
];

export const ORG_SUPPORT: OrgPerson[] = [
  { title: "Divisi A&F (Admin & Finance)", name: "Dwi Lestari", icon: "finance" },
  { title: "Manajer Operasional", name: "Maulana Agus Rifma, S.T.", icon: "ops" },
];

/** Divisi pelaksana: berada di bawah Manajer Operasional. */
export const ORG_DIVISIONS: OrgPerson[] = [
  { title: "Divisi S&M (Sales & Marketing)", name: "Diyah Handayani, S.E.", members: ["Isni Widarti", "Part time & Freelance Marketing"], icon: "sales" },
  { title: "Divisi P&S Astoetik (Produksi & Stok)", name: "Hastono Adi", members: ["Dhio Nanda S", "Tenaga Part time & Freelance"], icon: "produksi" },
  {
    title: "Divisi P&S RI (Produksi & Stok)",
    name: "Imam Fatoni",
    subs: [
      { label: "Kayu", members: ["Sapar"] },
      { label: "Besi", members: ["Irawan", "Septian Tri A.", "Freelance"] },
    ],
    icon: "ri",
  },
  { title: "Divisi IT - R&D Innovation Center", name: "Hardiansyah K. Atmaja, A.Md.", icon: "it" },
];
