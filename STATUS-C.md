# STATUS-C — AGENT C (design system + ikon + motion) — SIAP

Tanggal: 2026-10-24. Semua berkas di bawah milik agen C, jangan ditimpa agen lain.

## Berkas

**Token & gaya**
- `src/assets/styles/tokens.css` — token final (oklch, lolos WCAG), alias `--font-accent`,
  utilitas Tailwind `@theme` (bg-kertas, text-tinta, bg-botol, font-accent, …),
  token durasi/easing micro-interactions, `:focus-visible` dashed.
- `src/assets/styles/queue.css` — gaya spreadsheet dalam `@layer`:
  reset keras `* { border-radius: 0 !important }`, grid garis tegas, header kolom loket,
  4 status baris (menunggu/dipanggil/selesai/lewat), `.stempel-dipanggil` (rotate via
  `--stempel-rot`, mask noise SVG), karcis + `.divider-sobek`, `.sheet-tab`,
  marquee 2 band diagonal (skew via `--skew`), `#gelombang` (tinggi via `--gelombang-tinggi`),
  `.nomor-raksasa` (perspective flip 3D), `.wipe-gelombang`, tap target ≥44px,
  `100dvh`, reduced-motion mematikan marquee.
- `src/assets/styles/tailwind.css` — ditambah 2 baris `@import` (tokens.css, queue.css).
- `scripts/cek-kontras.js` — skrip verifikasi kontras oklch→WCAG (self-test hitam/putih = 21:1).
  Perbaikan bug saat pengerjaan: pangkat-3 negatif (NaN), EOTF ganda, shadowing variabel biru.

**Ikon** (`src/components/icons/`, 14 berkas, semua dashed 2px sudut tajam, `aria-hidden="true"`):
KarcisNomor, PapanLoket, GelombangPasang (3 custom domain), Stetoskop, JamDinding,
LoncengPanggil, PrinterStruk, ClipboardPapan, OrangAntre, PanahFlick, StempelCap,
Kalender, Salin, PlusMinus (prop `varian="plus"|"minus"`).

**Decor** (`src/components/decor/`): GrainKertas.astro, GelombangPasang.astro
(`#gelombang` + `#gelombang-path`), DividerSobek.astro (class `.divider-sobek`),
Stempel.astro (prop `teks`, `putar`; default acak ±3deg).

**Motion** (`src/scripts/motion/`, `node --check` lolos semua):
- `index.js` — `init()`/`destroy()`; muat GSAP dinamis (gagal = gerak mati diam-diam);
  MODE RINGAN (hardwareConcurrency≤4 / deviceMemory≤4 / saveData / fps<40 selama 2 dtk);
  hormati prefers-reduced-motion; toggle `#toggle-gerak` (aria-pressed, localStorage
  `antresehat:gerak`); pause `gsap.globalTimeline` saat tab hidden;
  **gelombang data-driven**: dengar `antre:changed` (agen B) → hitung
  `[data-status="menunggu"]` → `--gelombang-tinggi` + morph path `d`;
  fallback MutationObserver `#papan-grid` bila event tak datang dalam 4 dtk.
- `camera.js` — `#sheet-papan`: scale 1→1.5 + rotate 1.2° + yPercent scrub (tanpa pin).
- `marquee.js` — skew `--skew` mengikuti scroll velocity (lerp); `[data-marquee-pause]`
  toggle `.marquee-jeda` + aria-pressed; offscreen via IntersectionObserver;
  MODE RINGAN = statis.
- `text.js` — `#nomor-raksasa` split `.digit` + flip 3D; dengar `antre:called`
  (detail.nomor); entrance flip saat terlihat; lite = ganti teks biasa.
- `input.js` — `#karcis-saya` flick scroll inertia; `.baris` geser horizontal +
  snap-back elastis (ketukan <8px tetap jadi click); magnetic tombol ambil nomor
  (`#btn-ambil`, fallback `#form-ambil button`); pointer kasar/halus dipisah;
  `touch-action: pan-y` di CSS.
- `reveal.js` — dengar `antre:show-sheet`: overlay `.wipe-gelombang` menyapu
  dengan tepi atas bergelombang (clip-path polygon 16 titik, morph via GSAP).

## Hasil cek kontras (scripts/cek-kontras.js, exit 0, 7/7 LOLOS)

| Pasangan | Rasio | Syarat |
|---|---|---|
| teks vs bg | 7.54:1 | ≥ 4.5 |
| muted vs bg | 4.72:1 | ≥ 4.5 |
| accent vs bg | 4.78:1 | ≥ 4.5 |
| accent-2 vs surface | 6.03:1 | ≥ 4.5 |
| pop vs surface | 3.10:1 | ≥ 3 (grafis besar) |
| surface vs accent-2 | 6.03:1 | ≥ 4.5 |
| teks vs surface | 10.39:1 | ≥ 4.5 |

Penyesuaian lightness saja (hue/chroma utuh): muted 0.38→0.34, accent 0.50→0.34,
pop 0.58→0.54. Token final tercatat di tokens.css.

## Catatan wiring untuk AGEN A
1. Sertakan skrip motion sekali, mis. di layout: `<script src="~/scripts/motion/index.js"></script>`
   (modul auto-start; aman bila GSAP belum ada).
2. Marquee: pakai class `.marquee` > `.marquee-band--a/b` > `.marquee-track` > `.marquee-item`
   (isi track digandakan 2x agar loop mulus) + tombol `[data-marquee-pause]`.
3. Decor: pasang `<GrainKertas />` sekali di layout; `<GelombangPasang />` di bawah papan.
4. Nomor raksasa: elemen `#nomor-raksasa` (text.js yang memecah digit + menambah class).
5. Font: astro.config.ts + CustomStyles.astro sudah dikonfigurasi agen A
   (`--font-display/--font-body/--font-aksen`); tokens.css TIDAK menimpanya.
6. Stempel per baris: JS agen B disarankan mengisi `--stempel-rot` acak ±3deg inline
   pada `.stempel` tiap baris dipanggil (fallback CSS: 3deg).

## Catatan untuk AGEN D (QA)
- JANGAN build sebelum agen A `npm i gsap` (motion memakai dynamic import gsap/ScrollTrigger).
- Verifikasi manual disarankan: toggle Gerak mati/nyala, prefers-reduced-motion,
  marquee pause, flip digit saat `antre:called`, tinggi gelombang vs jumlah menunggu.
