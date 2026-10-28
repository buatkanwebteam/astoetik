# ASTERA-X

Prototype web app untuk **CV. Astoetik Indonesia** (produsen kompor dan canting batik listrik, Bantul, DIY).

Dua modul dalam satu aplikasi Next.js:

- **Scan QR to Website** (publik): QR per produk → `/p/<kode>` berisi foto, spesifikasi, FAQ, dan chatbot AI yang hanya menjawab tentang produk itu.
- **Dashboard Analytics** (admin): KPI, customer journey funnel, AI Advisor, top content, ringkasan performa, content planner Instagram/TikTok, ringkasan AI pertanyaan pelanggan, generator QR, dan export `.xlsx`.

Pertanyaan yang masuk lewat chatbot disimpan, lalu diringkas di `/dashboard/insights`. Itulah penghubung kedua modul.

> Data analitik media sosial masih **DATA DUMMY** (generator deterministik). Semua halaman analytics diberi label jelas.

## Stack

Next.js 16 (App Router, Turbopack) · React 19 · TypeScript · Tailwind CSS 4 · Supabase · Gemini (`@google/genai`) · Recharts · qrcode · SheetJS (xlsx) · zod · lucide-react.

## Menjalankan lokal (Mode Demo, tanpa env apa pun)

```bash
npm install
npm run dev
```

Buka http://localhost:3000.

| Yang dicoba | Cara |
|---|---|
| Halaman produk | http://localhost:3000/p/A-AS001 (simulasi scan: `?src=qr`) |
| Login admin | http://localhost:3000/login → `admin@astoetik.test` / `astera123` |
| Dashboard | `/dashboard`, `/dashboard/content`, `/dashboard/insights`, `/dashboard/products` |

Dalam Mode Demo:

- Produk, FAQ, dan analitik dibaca dari `src/data/*.ts`.
- Chat, event, content plan, dan laporan insight disimpan di `.data/store.json` (di Vercel tanpa Supabase: `/tmp`, tidak permanen).
- Tanpa `GEMINI_API_KEY`, semua fitur AI memakai respons mock deterministik dengan badge **Mode Demo**.

Alur uji end-to-end: buka `/p/K-CL001`, kirim beberapa pertanyaan di chatbot → login → `/dashboard/insights` → tekan **Ringkas**.

## Environment

Salin `.env.example` ke `.env.local`, lalu isi seperlunya.

| Variabel | Fungsi |
|---|---|
| `NEXT_PUBLIC_SITE_URL` | URL publik aplikasi. **Dipakai di dalam QR.** Wajib domain publik sebelum QR dicetak. |
| `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Project Supabase. Anon key dipakai untuk verifikasi login admin. |
| `SUPABASE_SERVICE_ROLE_KEY` | Hanya server. Semua baca/tulis database dari route handler. Bersama `NEXT_PUBLIC_SUPABASE_URL` mengaktifkan mode Supabase. |
| `GEMINI_API_KEY` | Hanya server. Mengaktifkan AI sungguhan. |
| `GEMINI_MODEL` | Default `gemini-2.5-flash`. |
| `DEMO_ADMIN_EMAIL`, `DEMO_ADMIN_PASSWORD` | Akun admin Mode Demo (dipakai bila Supabase belum diisi). |
| `SESSION_SECRET` | Kunci tanda tangan cookie sesi admin. **Wajib** string acak panjang di produksi (`openssl rand -base64 32`). |
| `NEXT_PUBLIC_WA_NUMBER` | Nomor WhatsApp CS (format 62…). |

## Setup Supabase

1. **Buat project** di https://supabase.com → New project. Catat *Project URL*, *anon key*, dan *service_role key* (Project Settings → API).
2. **Buat tabel.** Buka SQL Editor → tempel isi `supabase/schema.sql` → Run. (Aman dijalankan ulang; skrip men-drop tabel lama dulu.)
3. **Isi data awal.** Tempel isi `supabase/seed.sql` → Run. Berisi 15 produk, 81 FAQ, dan data dummy analitik 90 hari.
   - Data dummy dibuat relatif terhadap tanggal saat seed digenerate. Untuk menyegarkan tanggalnya: `npm run seed:sql`, lalu jalankan ulang `schema.sql` + `seed.sql`.
4. **Buat user admin.** Authentication → Users → *Add user* → *Create new user*, isi email + password, centang *Auto Confirm User*. Akun ini yang dipakai di `/login`.
5. **Isi env** `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` di `.env.local`, restart `npm run dev`. Badge "Mode Demo: data lokal" di dashboard akan hilang.

Keamanan database: RLS aktif di semua tabel. `products` dan `product_faqs` bisa dibaca publik. `chat_*` dan `events` tidak punya policy untuk `anon`, jadi hanya bisa ditulis lewat `/api/chat` dan `/api/track` (service role). Tabel dashboard hanya untuk user ter-autentikasi.

## Setup Gemini

1. Buat API key di https://aistudio.google.com/apikey.
2. Isi `GEMINI_API_KEY` (dan opsional `GEMINI_MODEL`) di `.env.local`, restart. Badge "Mode Demo: AI mock" hilang.

Key hanya dipakai di server (route handler); tidak pernah dikirim ke browser.

## Deploy ke Vercel

1. Push repo ini ke GitHub.
2. Di https://vercel.com → *Add New → Project* → import repo. Framework terdeteksi otomatis (Next.js).
3. Sebelum *Deploy*, buka **Environment Variables** dan isi semua variabel di atas untuk environment *Production* (dan *Preview* bila perlu):
   - `NEXT_PUBLIC_SITE_URL` = domain produksi, mis. `https://astera-x.vercel.app` (bisa diisi setelah deploy pertama, lalu *Redeploy*).
   - `SESSION_SECRET` = string acak panjang.
   - Kredensial Supabase dan Gemini.
4. Deploy. Setelah domain final diketahui, pastikan `NEXT_PUBLIC_SITE_URL` sudah benar, lalu **Redeploy** (variabel `NEXT_PUBLIC_*` dibaca saat build).
5. Buka `/dashboard/products` → unduh QR / cetak label. Pindai dengan kamera HP: harus membuka `https://<domain>/p/<kode>?src=qr`.

Atau lewat CLI: `npm i -g vercel`, `vercel link`, `vercel env add <NAMA>`, `vercel --prod`.

> Tanpa Supabase, Vercel tetap jalan dalam Mode Demo, tetapi data chat/event/content plan hanya tersimpan sementara di `/tmp` instance serverless.

## Struktur

```
src/
  app/
    page.tsx                  landing
    p/[kode]/                 halaman produk publik (+ 404 ramah)
    login/                    login admin (server action)
    dashboard/                ringkasan, content, insights, products (+ print)
    api/chat                  chatbot produk (streaming)
    api/track                 event qr_scan, page_view, chat_open, marketplace_click
    api/ai/*                  advisor, content-ideas, insights (admin)
    api/content-plans/*       CRUD kalender konten (admin)
    api/qr/[kode], api/qr/all QR PNG / zip (admin)
    api/export/[dataset]      .xlsx: metrics | posts | funnel | insights | content | all
  proxy.ts                    proteksi /dashboard dan API admin
  data/                       seed produk, FAQ, potongan manual, generator data dummy
  lib/db/                     interface Db + implementasi local & supabase
  lib/ai/                     klien Gemini, prompt, schema zod, mock
supabase/schema.sql, seed.sql
scripts/generate-seed.mjs     generator seed.sql dari src/data
DECISIONS.md                  catatan keputusan & konflik data
```

## Perintah

```bash
npm run dev        # dev server
npm run build      # production build
npm run start      # jalankan build
npm run lint       # ESLint
npm run seed:sql   # regenerasi supabase/seed.sql
```

## Catatan

- Sumber kebenaran spesifikasi: "Data per Produk" (Draft Website ASTERA-X). Konflik dengan katalog/manual dicatat di `DECISIONS.md`.
- Link marketplace masih berupa pencarian Shopee/Tokopedia karena URL toko resmi belum tersedia; ganti di `src/data/products.ts` atau kolom `marketplace_links`.
- Rate limit chat (20 pesan / 10 menit per IP) dan login disimpan in-memory per instance; untuk produksi skala besar gunakan Redis/Upstash.
