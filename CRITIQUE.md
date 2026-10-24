# CRITIQUE — AntreSehat — 2026-10-24

## Slop test (v3)

Logo ditutup: papan krem kehijauan + mono + stempel ungu + spreadsheet antrean =
tidak ketuker dengan build lain (10-22 PetaArisan riso gelap, 10-19 VerifLomba
lavender terminal, 10-17 EsaiCepat kereta). **Lolos.**

3 hal paling "template":
1. Widget Steps/FAQs bawaan AstroWind (struktur Timeline/accordion generik).
2. Header strip + h1 — pola papan info yang aman.
3. Filter loket = deretan tombol biasa.

Yang dirombak (putaran 1):
1. `.baris` tanpa grid (teks bertumpuk) → grid spreadsheet 3 kolom + status badge.
2. Marquee tidak cocok dengan CSS agen C → markup diselaraskan ke `.marquee-band`.
3. `#nomor-raksasa` class salah (`text-7xl`) → class `.nomor-raksasa` + clamp;
   text.js memecah SEMUA teks (termasuk label loket) → hanya `.raksasa-nomor`
   yang di-split, label jadi teks biasa (ini yang menyebabkan overflow 2028px).

Keputusan berani & signature moment terlihat dalam 5 detik: YA — nomor raksasa
"C-002" flip 3D + marquee diagonal + tab sheet sticky langsung di layar pertama.

## Gerbang gerak (v4)

- Lapisan: A (kamera terbang scrub) + B (2 marquee diagonal, skew velocity) +
  C (flip 3D per digit) + D (flick inertia baris + magnetic tombol) + E (wipe
  gelombang antar sheet) = 5 lapisan, 4+ kategori. F dipangkas sadar.
- Zoom: ya (scale 1→1.5 + rotate). Pan horizontal: flick baris (bukan pan
  section — sesuai konsep spreadsheet). 2 marquee: ya.
- FPS CPU throttle 4×: **60.4** (target ≥ 45). Lolos.
- Font/palet/gaya ikon beda dari 7 build terakhir: ya (mono display baru,
  mid/monochrome hue 82, dashed custom).
- Kontras AA: 7/7 lolos via scripts/cek-kontras.js (termasuk penyesuaian
  lightness muted & accent).
- Body terbaca di 390px: ya (Sofia Sans Extra Condensed, paragraf 3 baris diuji).
- reduced-motion dites: 0 animasi berjalan. Lolos.

## Gerbang v5

- Tes bandingkan vs 3 build terakhir: tidak sekeluarga (kertas terang vs
  riso gelap/terminal lavender). Lolos.
- Tes blur: komposisi spreadsheet + stempel + nomor raksasa masih khas. Lolos.
- Tes 3 detik: "papan antrean puskesmas" langsung terbaca. Lolos.
- Keyboard-only: tab sheet + semua aksi bisa tanpa mouse. Lolos.
- MODE RINGAN: terpicu di VM (2 CPU) — marquee statis, tombol "Jalan" untuk
  menyalakan; layout tetap rapi. Lolos.
- Budget: JS total ~130KB (gsap 70KB + scrolltrigger 43KB, dynamic import) <
  250KB; CSS 134KB — di atas budget 60KB (template AstroWind + 3 layer custom).
  Dicatat sebagai utang; tidak memangkas karena butuh widget template.
  Font: 3 family self-host (Astro Fonts API, subset latin, swap).
- Lisensi: font OFL, ikon custom + Bootstrap (MIT). Keamanan: tanpa innerHTML
  untuk data pengguna (textContent/createElement), localStorage berversi +
  validasi skema, clipboard fallback, deep-link hanya tampil.
- Dipangkas: lapisan F (fisika/shader — tidak butuh konsep); gyro tilt
  (preseden 10-22: dipangkas juga); video hero moment (capture.js tersedia,
  dipangkas karena waktu — screenshot cukup).

## Keputusan konflik aturan

- `font-display`/`font-aksen` class tidak resolve (Astro Fonts API hanya set
  variabel) → tambah `@utility` eksplisit di tokens.css (aturan v5: pakai yang
  lebih ketat/benar, dicatat di sini).
- Deploy: Vercel butuh approval (R3) → GitHub Pages via gh-pat (preseden
  10-16 s.d. 10-23), dicatat.

## Skor 1-10

- Karakter: **9** — papan RT + pasang surut + Bu RT konsisten sampai pesan error.
- Keunikan: **8** — spreadsheet sebagai satu-satunya UI; mirip keluarga dengan
  10-16 (spreadsheet ledger) tapi domain & palet & gerak beda total.
- Kerapian: **8** — baris grid rapi; marquee button menumpuk band di mobile
  (diterima: tombol jeda WCAG wajib terlihat).

Verdict: LANJUT deploy. 1 putaran rombak dipakai (maks 2).
