# DECISIONS

Log keputusan penting selama membangun prototype ASTERA-X.

## Fondasi

1. **Struktur `src/`.** Scaffold awal memakai `app/` di root. Dipindah ke `src/app` agar sesuai spesifikasi (`src/proxy.ts`). Alias `@/*` → `./src/*`.
2. **Cache Components dimatikan** (`cacheComponents: false`). Next 16.4 men-scaffold dengan `cacheComponents: true`, yang mewajibkan setiap baca cookie/data request-time dibungkus `<Suspense>`. Hampir semua rute prototype ini dinamis (sesi, store JSON lokal, analitik live), jadi model caching lama (dinamis default saat memakai `cookies()`/`headers()`) lebih sederhana dan stabil. `partialPrefetching` ikut dihapus karena bergantung pada Cache Components.
3. **`@supabase/ssr` tidak dipakai.** Semua akses Supabase terjadi di server dengan service role setelah sesi admin diverifikasi oleh `proxy.ts`. Login admin mode Supabase memverifikasi email/password via Supabase Auth (`signInWithPassword`), lalu aplikasi menerbitkan cookie sesi bertanda tangan sendiri (sama seperti mode demo). Satu mekanisme sesi untuk kedua mode, tanpa dependensi tambahan.
4. **`xlsx` (SheetJS 0.18.5 dari npm)** memiliki advisory untuk *parsing* file. Aplikasi hanya *menulis* workbook, jadi risiko tidak relevan. Bisa diganti ke build CDN SheetJS bila perlu.
5. **Folder `referensi/` di-gitignore** (PDF besar ±9 MB). Foto produk sudah diekstrak ke `public/products/`.

## Data produk

6. **Sumber kebenaran: "Data per Produk"** (Draft Website ASTERA-X.pdf). Konflik yang ditemukan dan diputuskan:
   - Katalog Company Profile menulis daya kompor 170 W / 270 W dan canting portabel 8 W, 5–12 V DC. Diabaikan; dipakai 150/300/280 W dan 40 W, 220 V AC / 14 VDC dari Data per Produk.
   - Manual A-SD002 menyebut "versi OTOMATIS" dan "tungku berbahan tanah liat". Bertentangan dengan Data per Produk (bodi Alumunium, kontrol Manual), jadi kalimat itu **tidak** dimasukkan ke konteks chatbot maupun FAQ.
   - Manual K-CL001 melompati langkah 6 (nomor 5 → 7). Langkah dinomori ulang tanpa mengubah isi.
7. **Nilai kosong (`-`) disembunyikan.** Spesifikasi disimpan sebagai array `{label, value}` hanya untuk nilai yang ada. Tidak ada tebakan.
8. **Informasi dari manual yang tidak bertentangan** (kapasitas malam 20 gram K-CL001, malam maks ±250 gr pada wajan, isi kardus, saklar ON/OFF A-SD002) dipakai di FAQ `source: manual` dan konteks chatbot.
9. **Link marketplace.** Tidak ada URL toko resmi di dokumen sumber. Tombol "Beli di Marketplace" mengarah ke halaman *pencarian* Shopee/Tokopedia dengan kata kunci `astoetik <kode>`. Ganti di `src/data/products.ts` (atau kolom `marketplace_links` di Supabase) begitu URL toko resmi tersedia.
10. **Foto produk.** Diekstrak dari Draft Website PDF (`pdfimages`), dipetakan per produk berdasarkan label pada foto. Foto utama = foto produk tanpa kardus; sisanya galeri (`<kode>-2.jpg`, dst.).
11. **FAQ generik** untuk 12 produk tanpa manual dibangun otomatis dari data spesifikasi + saran keselamatan listrik umum, ditandai `faq_source: "generated"` dan label "FAQ umum".

## Data dummy

12. **Generator deterministik** (mulberry32, seed tetap) di `src/data/dummy.ts`. Tanggal di-*anchor* ke hari ini (mode lokal) supaya dashboard selalu menampilkan 90 hari terakhir. Dua lonjakan: hari ke-35 (tutorial viral) dan ke-70 (promo). Funnel dijamin menurun.

## Auth

13. **Sesi admin = cookie HMAC-SHA256 bertanda tangan** (`astera_session`, httpOnly, 7 hari) dibuat dengan Web Crypto agar bisa diverifikasi di `proxy.ts` maupun server. Tanpa `SESSION_SECRET`, dipakai secret fallback agar mode demo jalan; **wajib** diisi di produksi.
14. **Proteksi berlapis.** `proxy.ts` memblokir `/dashboard/**`, `/api/ai/**`, `/api/export/**`, `/api/content-plans/**`, `/api/qr/**`. Layout dashboard dan setiap route handler admin memeriksa ulang sesi (proxy hanya *optimistic check* menurut docs Next).
15. **Login dirate-limit** 10 percobaan / 10 menit per IP. Parameter `next` hanya menerima path `/dashboard…` (cegah open redirect).
16. **Dark mode hanya untuk dashboard**, via atribut `data-theme` di `<html>` + `@custom-variant dark`. Halaman publik tidak memakai varian `dark:`.

## AI

17. **Advisor** hanya menerima *snapshot agregat* (`advisorSnapshot`): total, funnel, rasio per platform, ringkasan per format, 3 judul konten teratas. Tidak ada baris mentah.
18. **Insights**: model mengembalikan `messageIndexes` per topik, dan jumlah per topik **dihitung server** dari indeks itu (bukan angka karangan model). Tiap pesan hanya masuk satu topik, lalu topik ditulis balik ke `chat_messages.topic`. Laporan terakhir disimpan di tabel tambahan `insight_reports`.
19. **Content ideas** dijadwalkan dalam jam WIB (UTC+7) terlepas dari zona waktu server. Ide masuk sebagai `status = idea`, `created_by_ai = true`.
20. **Mock AI deterministik** (`src/lib/ai/mock-*.ts`) dipakai bila `GEMINI_API_KEY` kosong, membaca input yang sama dengan prompt asli sehingga UI tetap realistis. UI menampilkan badge "Mode Demo".
21. **Structured output**: `responseMimeType: application/json` + `responseJsonSchema` dari `z.toJSONSchema`, divalidasi zod, retry 1×, lalu pesan error ramah (HTTP 502).
22. **Kalender konten dirender di klien saja** (setelah mount) karena jam tampil bergantung zona waktu peramban; mencegah hydration mismatch.

## QR & Export

23. **QR berisi `NEXT_PUBLIC_SITE_URL/p/<kode>?src=qr`**, warna coklat gelap di atas putih (kontras tinggi agar mudah dipindai), level koreksi M. Dashboard memberi peringatan bila `NEXT_PUBLIC_SITE_URL` masih localhost. Unduhan tunggal (PNG 768 px), semua (.zip berisi PNG + `daftar-qr.csv`), dan halaman cetak label 6 × 8 cm (QR SVG agar tajam saat dicetak).
24. **Export .xlsx**: satu workbook per dataset (`metrics`, `posts`, `funnel`, `insights`, `content`) atau semuanya (`all`). Tiap sheet punya baris judul (lingkup + label DATA DUMMY), header, autofilter, lebar kolom, format angka `#,##0` / `0.00%` / tanggal. Tanggal ditulis sebagai serial Excel dari komponen UTC yang sudah digeser ke WIB, karena konversi `Date` bawaan SheetJS bergantung pada zona waktu server.
