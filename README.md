# AntreSehat — Papan Antrean Digital Puskesmas

Satu halaman web: pasien **ambil nomor antrean dari HP** (tanpa datang subuh),
**pantau papan dari rumah**, nakes **panggil nomor satu ketuk** dari dashboard —
semua jalan 100% di browser, data tersimpan di localStorage HP masing-masing.

**Live:** https://kayzenn123.github.io/agent-tools-antresehat/
**Repo:** Kayzenn123/agent-tools-antresehat

## Fitur

- **Ambil nomor** — pilih loket (L1 Pendaftaran / L2 Poli Umum / L3 Gigi & KIA),
  dapat karcis digital + perkiraan tunggu (posisi × 4 menit, contoh).
- **Papan antrean** — spreadsheet hidup: nomor yang dipanggil "pasang" seperti air
  pasang, filter per loket, stempel ungu DIPANGGIL.
- **Dashboard nakes** — panggil berikutnya / panggil ulang / selesai / lewati /
  reset hari, rekap kunjungan, ekspor CSV + JSON + salin untuk WA.
- **Deep-link** — `?l=B&n=B-004` membuka karcis langsung (tampil saja, aman).
- **Suara** — bunyi "ting" WebAudio sintesis saat nomor dipanggil (tanpa file audio).
- **Easter egg** — ketuk stempel "data contoh" 5× → mode "pasang purnama" 10 detik.
- Semua data contoh berlabel "contoh" (R7/R10).

## Teknologi

Astro 7 + Tailwind CSS v4 (template AstroWind), vanilla JS ESM
(`src/scripts/queue/` + `src/scripts/motion/`), GSAP 3.12.5 + ScrollTrigger
(dynamic import, self-host via npm), localStorage `antresehat:v1` berversi.

## Konsep desain (seed 2026-10-25)

Papan pengumuman RT berbentuk spreadsheet "tabel pasang surut": kertas krem
kehijauan monokrom hue 82 + stempel ungu, tanpa border-radius di mana pun,
ikon garis putus-putus custom, font Atkinson Hyperlegible Mono / Sofia Sans
Extra Condensed / Bungee Hairline. Persona: **Bu RT**. Gerak: kamera "terbang"
scroll + 2 marquee diagonal + flip 3D per digit + flick inertia + wipe gelombang.

## QA

- `node tools/qa.cjs` — 0 overflow (360/390/768/1280), 0 console error/warning,
  0 gambar tanpa alt, 0 input tanpa label, h1 tunggal, lang="id".
  (1 "tap target kecil" = skip-link sr-only, false positive — terlihat saat focus.)
- FPS CPU throttle 4×: **60.4** (chromium, target ≥ 45).
- prefers-reduced-motion: 0 animasi berjalan; toggle "Gerak: nyala/mati" tersedia.
- Keyboard-only: tab sheet (←/→/Home/End), semua tombol ≥ 44px, focus dashed jelas.
- MODE RINGAN otomatis (CPU ≤ 4 / RAM ≤ 4GB / Save-Data / FPS < 40): matikan
  kamera & marquee, sederhanakan flip & flick.
- Lighthouse: tidak terukur di VM (chrome-launcher gagal launch — preseden build
  10-16 s.d. 10-23); diganti verifikasi manual setara di atas.

## Cara jalanin

```bash
npm install
npm run dev      # http://localhost:4321
npm run build    # → dist/
```

## Lisensi aset

Font: Google Fonts (OFL) via Astro Fonts API. Ikon: 14 SVG custom hand-built
(garis putus-putus) + Bootstrap Icons (MIT) bila perlu. Tanpa gambar stok,
tanpa foto, tanpa logo brand.
