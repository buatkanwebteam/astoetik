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

23. **QR berisi `NEXT_PUBLIC_SITE_URL/p/<kode>?src=qr`**, warna coklat gelap di atas putih (kontras tinggi agar mudah dipindai), level koreksi M. Domain produksi: `https://asterax.my.id` (default `NEXT_PUBLIC_SITE_URL`).
24. **Export .xlsx**: satu workbook per dataset (`metrics`, `posts`, `funnel`, `insights`, `content`) atau semuanya (`all`). Tiap sheet punya baris judul (lingkup + label DATA DUMMY), header, autofilter, lebar kolom, format angka `#,##0` / `0.00%` / tanggal. Tanggal ditulis sebagai serial Excel dari komponen UTC yang sudah digeser ke WIB, karena konversi `Date` bawaan SheetJS bergantung pada zona waktu server.

## Katalog Produk (database admin)

25. **Katalog Produk = database admin**, bukan toko. Tinggal di `/dashboard/products` (wajib login): cari, filter (kategori, kontrol panas, bahan, daya, harga, sertifikasi), urutkan, tampilan kartu/tabel, unduh QR, buka halaman publik, serta tambah/edit/hapus produk. Pengunjung hanya melihat produk lewat scan QR (`/p/<kode>`). Tidak ada keranjang, wishlist, atau checkout.
26. **Facet filter diturunkan dari spesifikasi nyata** (`src/lib/catalog.ts`): label `Bahan Bodi`/`Bahan Bodi Canting`, `Daya`/`Daya Maks`, `Kontrol Panas`/`Pengaturan`. Stok, diskon, dan tanggal rilis tidak ada di sumber, jadi tidak ditampilkan.
27. **Kode produk tidak bisa diubah** setelah dibuat karena tercetak di QR. Menghapus produk membuat QR lamanya menampilkan halaman 404 ramah.
28. **Foto unggahan disimpan sebagai data URL JPEG** (diperkecil di browser ke maks. 1200 px) di kolom `image`. Tidak butuh storage tambahan dan jalan di mode lokal maupun Supabase. Untuk skala besar, pindahkan ke Supabase Storage. Foto baru menggantikan foto utama; foto galeri lain tetap.
29. **TKDN tidak diinput dari dashboard.** Nilai TKDN yang sudah ada di seed tetap dipertahankan saat produk diedit; produk baru tanpa TKDN.
30. **Mode lokal memuat ulang `store.json` bila file berubah** (cek `mtime`). Next membundel route handler dan page terpisah, sehingga cache memori satu bundle tidak tahu perubahan dari bundle lain.
31. **Token warna `kat-*`/`aksen`** (putih + coklat tanah) dipakai katalog dan halaman QR. Di dashboard mode gelap, token yang sama diganti nilainya lewat `:root[data-theme="dark"]`, jadi komponen tidak perlu varian `dark:`.

## Unit produk (QR per unit fisik)

32. **Dua level QR.** `/p/<kode>` = halaman umum jenis produk (tetap ada, mis. untuk brosur/kemasan). `/p/<kode>/<seri>` = satu unit fisik: isi halaman umum ditambah kartu "Data unit ini". Komponen halaman dipakai bersama (`ProductView`).
33. **Data unit**: nomor seri (bagian URL, unik per jenis, tidak bisa diubah), kode produksi, tanggal produksi, garansi (bulan), tanggal/petugas QC (semua unit berstatus Lolos QC, tidak ada pilihan lain), catatan. Disimpan di `product_units` (PK `product_code, serial`, cascade saat produk dihapus).
34. **Garansi dihitung dari tanggal produksi**, karena tanggal pembelian tidak diketahui sistem. Status aktif/berakhir dihitung per hari WIB. Penambahan bulan yang melewati akhir bulan dijepit ke hari terakhir bulan itu (31 Jan + 1 bln = 28 Feb).
35. **Unit diinput satu per satu** di `/dashboard/products/<kode>`. Form unit baru mengusulkan seri berikutnya (0001, 0002, …) dan menyalin kode produksi, garansi, dan petugas QC dari unit terakhir.
36. **Halaman unit `noindex`** karena memuat nama petugas QC dan data garansi per unit. Tabel `product_units` tidak punya policy `anon`; data dibaca lewat server (service role).
37. **Event analitik tetap per jenis produk**; halaman unit menambahkan `meta.serial` pada `page_view`/`qr_scan`. Chatbot tetap konteks jenis produk (belum tahu data unit).
38. **Cetak label**: `/dashboard/products/print` = label per jenis; `?kode=<kode>` = label per unit produk itu.
39. **Unit contoh untuk semua produk** (`src/data/units.ts`): 3 unit per produk (seri 0001–0003, total 45). Kode produksi `PRD-YYMM-NN`, tanggal tetap, petugas QC berupa kode netral (`QC-01`…), dan setiap unit bercatatan "Data contoh untuk demo." Variasi disengaja: tiap produk ke-5 punya unit 0001 dengan garansi sudah berakhir, sebagian unit 0003 berstatus QC menunggu. Mode lokal memakai seed ini sampai admin mengubah unit; `seed.sql` ikut memuatnya. Hapus/ganti dengan data produksi asli sebelum dipakai nyata.

## AI (Gemini)

- **Dua model, keduanya free tier** (diuji dengan kunci proyek ini, Nov 2026): `gemini-3.5-flash` (`GEMINI_MODEL`) untuk analisis berskema JSON (Advisor, Insight, ide konten), `gemini-3.5-flash-lite` (`GEMINI_FAST_MODEL`) untuk jawaban chat. Respons uji: flash-lite 1,5 dtk, flash 3,8 dtk; `gemini-2.5-flash` 14 dtk dan `gemini-3.8-flash` hingga 196 dtk, sedangkan `gemini-2.5-flash-lite` sudah tidak tersedia (404). Masing-masing menjadi cadangan bagi yang lain bila sibuk (503) atau kena batas.
- **Sumber pengetahuan chatbot**: `referensi/FAQ per Produk.pdf` ditranskripsi ke `src/data/faq-pdf.ts` (A-AS001, A-SD002, K-CL001): cara mengoperasikan, mematikan, kendala, perawatan. Dipakai sebagai FAQ halaman produk dan konteks chatbot (utama bila berbeda dengan teks manual). Produk lain memakai FAQ umum.
- **Kunci API hanya di server** (`.env.local`, tidak di-commit). Bila Gemini menolak (kunci, kuota, jaringan), semua fitur AI otomatis memakai jawaban lokal (pencarian FAQ, bank ide, aturan kata kunci) dan berhenti memanggil Gemini selama 5 menit.
