import { pdfContext } from "./faq-pdf";

// Excerpts transcribed from the official user manuals (PANDUAN_K-CL001,
// Petunjuk_Penggunaan_ASTOETIK-S_A-AS001, PANDUAN_ASD002). Used as chatbot
// context. Statements that conflict with "Data per Produk" were dropped
// (see DECISIONS.md).

const SAFETY_STOVE = `Instruksi keselamatan:
- Jika ada penutup plastik/styrofoam pembungkus perangkat, keluarkan terlebih dahulu sebelum menggunakan perangkat.
- Jangan mengubah desain struktur dan keamanan perangkat (kerusakan akibat hal ini bukan tanggung jawab produsen).
- Pastikan tegangan listrik memenuhi persyaratan perangkat dan beban listrik kabel memenuhi persyaratan. Periksa kabel secara berkala; segera ganti kabel jika rusak.
- Pastikan ada cukup ruang untuk pembuangan panas dari perangkat agar umur perangkat lebih panjang.
- Tempatkan perangkat pada permukaan yang datar. Jangan menaruh benda berat pada perangkat.
- Jauhkan perangkat dari air atau hujan.
- Bersihkan bodi yang terkena malam dengan cara dilap memakai air panas atau minyak tanah, dalam kondisi perangkat mati.
- Matikan dan cabut steker jika perangkat tidak digunakan dalam waktu lama.
- Setelah power OFF, tunggu setidaknya 15 detik sebelum menghidupkan perangkat kembali.
- Hindarkan dari jangkauan anak-anak. Gunakan dan simpan produk di tempat yang kering.
Layanan: jangan membongkar perangkat. Hubungi mitra toko alat batik terdekat bila kabel listrik/soket rusak, ada cairan bocor ke dalam perangkat, perangkat gagal berjalan normal setelah mengikuti petunjuk, atau keluar asap berlebih/suara korsleting.`;

const A_AS001 = `${SAFETY_STOVE}

Isi kardus: 1 kompor batik listrik ASTOETIK versi Standar, 1 wajan khusus batik, 1 kartu garansi, 1 buku petunjuk penggunaan.

Bagian perangkat: sirkulasi udara (agar bodi tidak terlalu panas), elemen pemanas (memanaskan malam pada wajan), lampu indikator merah (tidak menyala bila skala pemanas di titik terendah; makin terang sesuai tingkat suhu), pegangan (untuk memindahkan kompor dan sebagai isolator), tusuk kontak/steker, skala pemanas (potensio) untuk mengatur suhu dengan diputar searah jarum jam.

Cara pengoperasian:
1. Letakkan wajan khusus membatik di atas tungku kompor dengan posisi sempurna.
2. Masukkan malam yang sudah dipotong-potong sesuai kebutuhan, berat maksimal ±250 gr.
3. Pastikan kompor nonaktif: skala pemanas (potensio) di titik terendah.
4. Masukkan steker ke stop kontak.
5. Aktifkan kompor dengan memutar skala pemanas searah jarum jam.
6. Pastikan lampu indikator merah menyala; kecerahannya sesuai tingkat suhu.
7. Putar searah jarum jam untuk menaikkan suhu, berlawanan arah jarum jam untuk menurunkan suhu.
8. Bila malam sudah mencair rata, suhu malam sudah stabil dan siap dicantingkan ke kain. Atur skala pemanas sesuai kebutuhan.

Cara mematikan: putar skala pemanas ke titik terendah, lalu cabut steker dari stop kontak.

Penanganan masalah:
- Lampu indikator tidak menyala: pastikan steker terhubung ke stop kontak dan arus listrik normal.
- Lampu indikator menyala tetapi malam tidak bisa mencair: kemungkinan elemen pemanas rusak/putus, kabel power elemen putus, atau skala pemanas rusak; perlu penggantian komponen. Bila ada gangguan rangkaian elektronik, matikan kompor lalu nyalakan kembali.
- Suhu panas melebihi batas: putar skala pemanas berlawanan arah jarum jam untuk menurunkan suhu.
Jika masalah belum teratasi, hubungi technical support Astoetik.

Catatan: bila ingin menaikkan daya kompor, silakan datang ke workshop Astoetik.`;

const A_SD002 = `${SAFETY_STOVE}

Isi kardus: 1 kompor batik listrik ASTOETIK, 1 wajan khusus batik, 1 kartu garansi, 1 buku petunjuk penggunaan.

Bagian perangkat: sirkulasi udara, elemen pemanas, lampu indikator merah (menyala sesuai tingkat suhu), skala pemanas (potensio), pegangan (untuk memindahkan kompor dan sebagai isolator), saklar ON/OFF, tusuk kontak/steker.

Cara pengoperasian:
1. Letakkan wajan khusus membatik di atas tungku kompor dengan posisi sempurna.
2. Masukkan malam yang sudah dipotong-potong sesuai kebutuhan, berat maksimal ±250 gr.
3. Pastikan kompor nonaktif: saklar pada posisi OFF dan skala pemanas di titik terendah.
4. Masukkan steker ke stop kontak.
5. Ubah saklar dari OFF menjadi ON.
6. Putar skala pemanas searah jarum jam sampai lampu indikator merah menyala.
7. Putar searah jarum jam untuk menaikkan suhu, berlawanan arah jarum jam untuk menurunkan suhu.
8. Bila malam sudah mencair rata, suhu malam sudah stabil dan siap dicantingkan ke kain.

Cara mematikan: ubah saklar dari ON ke OFF dan putar skala pemanas ke titik terendah, lalu cabut steker dari stop kontak.

Penanganan masalah:
- Lampu indikator tidak menyala: pastikan steker terhubung, saklar pada posisi ON, dan arus listrik normal.
- Lampu indikator menyala tetapi malam tidak bisa mencair: kemungkinan elemen pemanas rusak/putus, kabel power elemen putus, atau skala pemanas rusak; perlu penggantian komponen. Bila ada gangguan rangkaian elektronik, matikan kompor lalu nyalakan kembali.
- Suhu panas melebihi batas: putar skala pemanas berlawanan arah jarum jam untuk menurunkan suhu.
Jika masalah belum teratasi, hubungi technical support Astoetik.`;

const K_CL001 = `Instruksi keselamatan:
- Jika ada penutup plastik/styrofoam pembungkus perangkat, keluarkan terlebih dahulu sebelum menggunakan perangkat.
- Jangan mengubah desain struktur dan keamanan perangkat.
- Pastikan tegangan listrik memenuhi persyaratan perangkat. Periksa kabel secara berkala; segera ganti kabel jika rusak.
- Pastikan ada cukup ruang untuk pembuangan panas dari perangkat.
- Tempatkan perangkat pada permukaan datar. Jangan menaruh benda berat pada perangkat.
- Jauhkan perangkat dari air atau hujan.
- Bersihkan bodi yang terkena malam dengan cara dilap memakai air panas, bensin, atau minyak tanah.
- Matikan dan cabut steker jika tidak digunakan dalam waktu lama.
- Setelah power OFF, tunggu setidaknya 15 detik sebelum menghidupkan kembali.
Layanan: jangan membongkar perangkat. Hubungi mitra toko alat batik terdekat bila kabel/soket rusak, ada cairan bocor ke dalam perangkat, canting tidak panas, atau terjadi korsleting yang menimbulkan tegangan kejut.

Spesifikasi tambahan dari manual: kapasitas malam/lilin 20 gram, pengaturan suhu manual dengan potensio.

Isi kardus: 1 canting listrik, 20 gram malam/lilin, 1 kartu garansi, 1 buku petunjuk penggunaan, 1 dudukan canting.

Bagian perangkat: cucuk canting (tembaga, saluran keluarnya malam), nyamplung (tabung penampung malam), heater/pemanas, lubang pelepas panas, gagang kayu, tusuk kontak/steker, pengatur suhu, dudukan canting (untuk menaruh canting saat tidak digunakan).

Cara pengoperasian:
1. Posisikan canting listrik di dudukan canting.
2. Masukkan malam yang sudah dipotong kecil ke dalam nyamplung.
3. Pastikan canting dalam keadaan off: pengatur suhu di titik terendah (min).
4. Masukkan steker ke stop kontak.
5. Putar skala pemanas dari titik minimal ke titik maksimal.
6. Setelah malam mencair, posisikan tanda ke titik tengah agar suhu malam stabil.
7. Canting siap digunakan.

Cara mematikan: putar pengatur dari Max ke Min, lalu cabut steker dari stop kontak.

Penanganan masalah:
- Canting tidak panas: pastikan steker terhubung ke stop kontak, saklar pada kondisi ON, dan arus listrik normal.
- Suhu panas melebihi batas: putar berlawanan arah jarum jam untuk menurunkan suhu.
Jika masalah belum teratasi, hubungi technical support Astoetik.`;

export const MANUAL_EXCERPTS: Record<string, string> = {
  "A-AS001": `${A_AS001}

${pdfContext("A-AS001")}`,
  "A-SD002": `${A_SD002}

${pdfContext("A-SD002")}`,
  "K-CL001": `${K_CL001}

${pdfContext("K-CL001")}`,
};

export const CS_ADDRESS = "Jeblog RT.02, Tirtonirmolo, Kasihan, Bantul, Yogyakarta 55181";
