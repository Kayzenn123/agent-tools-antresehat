# BRIEF — ANTRESEHAT — 2026-10-24

## Masalah/usecase (1 kalimat + siapa yang kena)

Pasien puskesmas harus datang subuh cuma buat dapat nomor antrean kecil yang gampang hilang, sementara nakes memanggil manual pakai toa — ANTRESEHAT memindahkan karcis antrean ke HP pasien (ambil nomor dari browser, pantau papan dari rumah) dan memberi nakes dashboard panggil-satu-klik.

## Konsep visual (1 kalimat)

Seluruh situs adalah SATU papan pengumuman RT raksasa berbentuk spreadsheet "tabel pasang surut": baris-baris nomor antrean mengalir naik-turun seperti air pasang di atas kertas krem, tanpa satu pun sudut membulat, ornamen garis putus-putus di mana-mana.

## Hasil seed (base 2026-10-25 — re-seed 1× disahkan: seed 2026-10-24 ditolak pick-seed, mirip build 10-13 di 4/5 sumbu + font display duplikat; v3 ATURAN 5 menang)

- domain: pasang surut · layout: spreadsheet sebagai UI · referensi: papan pengumuman RT
- constraint: tanpa border-radius (radius 0 di semua elemen, tanpa kecuali)
- gerak: A kamera "terbang" scroll (scale+translate+rotate) · B marquee diagonal ikon+teks
  · C split huruf flip 3D · D drag inertia flick · E morph SVG blob mask
- ikon: garis putus-putus (dashed), sumber custom hand-built SVG (+ Bootstrap Icons bila perlu)
- font: display Atkinson Hyperlegible Mono · body Sofia Sans Extra Condensed · aksen Bungee Hairline
- palet mid/monochrome hue 82: kertas krem kehijauan + tinta + stempel ungu (pop <5%)

## 3 arah desain (2 kalimat masing-masing) + terpilih

1. **Spreadsheet raksasa sebagai satu-satunya UI** — navigasi = tab sheet (AMBIL | PAPAN | LOKET);
   nomor antrean = sel-sel yang "pasang" saat dipanggil. Paling jauh dari default, domain+layout+referensi jadi satu napas.
2. Terminal loket ala DOS dengan prompt diketik — mirip build 10-23 (TIMLOMBA terminal), DITOLAK.
3. Koran pengumuman multi-kolom — mirip build 10-19 (WARTEG koran), DITOLAK.
   Terpilih: #1.

## Keputusan berani

Tanpa navbar klasik dan tanpa hero marketing: pengunjung mendarat LANGSUNG di papan antrean
yang hidup (sheet PAPAN), dan seluruh situs dioperasikan seperti spreadsheet — tab sheet di
bawah, sel bisa diketuk, kolom bisa di-flick. Situs ini mesinnya, bukan brosurnya.

## Persona/suara

**Bu RT** — penjaga papan pengumuman: hangat, tegas, bahasa sehari-hari orang RT.
Judul: "Papan Antrean Puskesmas". Tombol: "Ambil nomor", "Panggil berikutnya".
Error: "Yah, nomornya nggak ketemu, Bu… coba cek lagi ya." Empty: "Sepi, belum ada yang
antre. Enak, langsung dilayani." Konsisten sampai footer dan pesan clipboard.

## Palet (harmoni, kenapa, psikologi warna, token final, kontras)

Monokromatik hue 82 (kuning-hijau tanah) = kertas pengumuman yang ditempel di papan RT,
tinta hitam-hijau, stempel ungu. Psikologi: tenang-tertib — antrean yang tidak bikin panik.

Token final (oklch, akan diverifikasi AA via skrip oleh agen C):
- --bg: oklch(0.72 0.090 82) — kertas krem kehijauan (60%)
- --surface: oklch(0.81 0.065 82) — kertas lebih terang untuk sel aktif (30%)
- --text: oklch(0.18 0.030 82) — tinta (kontras vs bg ≈ 9:1, target AA lolos)
- --muted: oklch(0.38 0.035 82) — tinta pudar (target ≥ 4.5:1 vs bg)
- --accent: oklch(0.50 0.170 82) — hijau lumut (teks aksen di atas kertas, target ≥ 4.5:1)
- --accent-2: oklch(0.36 0.110 82) — hijau botol (strip header papan)
- --pop: oklch(0.58 0.210 300) — ungu stempel, dipakai <5% area (stempel "DIPANGGIL", easter egg)
- Kertas bertekstur: grain via feTurbulence SVG (constraint "grain/noise" tidak wajib tapi cocok referensi).

## Font (display/body/aksen, alasan, id Fontsource)

- Display: **Atkinson Hyperlegible Mono** (id: `atkinson-hyperlegible-mono`) — mono = papan jadwal/
  papan skor; hiper-legibel = nomor antrean kebaca dari jauh. Untuk judul sheet & nomor besar.
- Body: **Sofia Sans Extra Condensed** (id: `sofia-sans-extra-condensed`) — condensed = kolom
  spreadsheet padat, banyak baris muat di layar HP. Body 400/700, diuji paragraf 3 baris di 390px.
- Aksen: **Bungee Hairline** (id: `bungee-hairline`) — hairline raksasa untuk angka nomor yang
  "pasang" (momen teatrikal). Hanya untuk display angka raksasa.
- Via Astro Fonts API (provider google) di astro.config.ts; preload + swap; maks 3 family.

## Ikon (gaya, sumber, daftar 12+ ikon, 3+ custom)

Gaya: **garis putus-putus (dashed)** — semua ikon digambar sebagai outline dashed 2px, sudut tajam
(tanpa border-radius, selaras constraint). Sumber: custom hand-built SVG inline (nol risiko atribusi).

12 ikon: karcis bernomor, loket/pintu, stetoskop, jam dinding, gelombang pasang, lonceng panggil,
printer struk, papan clipboard, orang antre, panah flick, stempel, kalender, plus/minus, salin.
3+ custom sesuai domain (wajib beda dari ikon generik): **karcis antrean bernomor sobek** (tiket dengan
nomor + garis sobek dashed), **papan loket** (papan RT mini dengan angka loket), **gelombang pasang**
(3 garis gelombang naik = antrean naik).

## Gerak (kategori A-F, narasi, MODE RINGAN)

Narasi penyatu: **air pasang** — scroll = air naik menggenangi papan; nomor dipanggil = gelombang
mengangkat nomor ke permukaan; marquee = angin pengumuman; flick = melempar karcis ke loket.

- A (kamera): section PAPAN di-pin ringan — scale 1→1.5 + rotate 1.2° + translateY saat scroll
  (GSAP ScrollTrigger scrub). "Menyelam" ke dalam spreadsheet.
- B (marquee): 2 band DIAGONAL berlawanan arah (pengumuman: "LOKET 2 DIBUKA…", "BAWA KTP/KK…"),
  skew mengikuti velocity scroll, tombol jeda (WCAG 2.2.2).
- C (teks): nomor yang dipanggil = split per digit, flip 3D bergantian (bukan fade-up).
- D (input): strip "karcis saya" & baris papan bisa di-flick horizontal dengan inertia
  (drag dengan momentum); magnetic di tombol "Ambil nomor".
- E (reveal): transisi antar sheet = morph SVG blob mask berbentuk gelombang.
- F: tidak dipakai (dipangkas sadar).
- MODE RINGAN (hardwareConcurrency ≤4 / deviceMemory ≤4 / Save-Data / FPS<40 2 dtk): matikan A,
  marquee jadi statis, C jadi pergantian biasa, D tanpa inertia. Wajib dites.
- prefers-reduced-motion: semua gerak mati → layout statis tetap rapi. Toggle UI "Gerak: nyala/mati".

## Storyboard hero moment (scroll 0/25/50/75/100%)

| Scroll | Terlihat | Kamera | Marquee | Teks | Interaksi |
|---|---|---|---|---|---|
| 0% | Strip header papan RT + nomor TERKINI raksasa (Bungee Hairline) "A-042 DIPANGGIL" + tab sheet | normal | 2 band diagonal jalan | nomor raksasa flip 3D masuk | ketuk "Ambil nomor" |
| 25% | Sheet PAPAN: spreadsheet antrean 3 loket, baris "dipanggil" berstempel ungu | mulai zoom 1.15×, rotate 0.5° | skew saat scroll | — | flick baris horizontal |
| 50% | Baris antrean penuh, gelombang SVG naik dari bawah | zoom 1.35× | band 1 jeda-able | digit nomor bergantian flip | filter loket (ketuk header kolom) |
| 75% | Sheet LOKET (dashboard nakes): tombol "Panggil berikutnya" besar | zoom 1.5×, rotate 1.2° | — | — | panggil → bunyi ting + nomor pasang |
| 100% | Rekap + ekspor CSV + footer Bu RT | zoom out kembali 1× | band 2 | stempel "SELESAI" morph | unduh CSV / salin WA |

Pertunjukan utama: **detik ke-5 — nomor raksasa "pasang"** (naik seperti air + flip 3D + ting)
saat nakes menekan "Panggil berikutnya". 5 detik pertama: pengunjung paham ini papan antrean
hidup, bukan brosur.

## Konten (15+ item nyata + easter egg)

Semua data contoh berlabel "contoh" (R7/R10 — bukan klaim fakta):
1-3. Tiga loket: **L1 Pendaftaran** (A), **L2 Poli Umum** (B), **L3 Gigi & KIA** (C)
4. Jam contoh: Senin–Jumat 07.30–14.00, Sabtu 07.30–11.00
5-8. Empat langkah ambil nomor (pilih loket → dapat karcis → pantau papan → datang saat dipanggil)
9-13. Lima teks marquee pengumuman ("Bawa KTP/KK…", "Datang 10 menit sebelum dipanggil…", dst.)
14-17. Empat FAQ (nakes + pasien): nomor hilang? telat dipanggil? ganti loket? data tersimpan di mana?
18-41. 24 nomor contoh terisi (A-001…C-008) dengan status beragam
42. Estimasi tunggu: posisi × 4 menit (label "contoh")
43. Rekap contoh: 24 dilayani, 3 terlewat
Easter egg: ketuk stempel papan 5× → mode "pasang purnama" (pop ungu membanjiri aksen 10 detik + marquee berubah "PURNAMA TIBA…").

## Teknik visual orisinal (2+)

1. **Grain kertas feTurbulence** — seluruh bg kertas punya tekstur serat (SVG filter, bukan gambar).
2. **Gelombang pasang generatif** — canvas/SVG gelombang yang tingginya mengikuti jumlah antrean
   menunggu (data-driven, bukan dekorasi mati).
3. **Stempel "DIPANGGIL"** — cap ungu dengan rotasi acak kecil + tekstur tinta tidak rata
   (mask noise), beda tiap baris.

## Suara

Ya — bunyi mikro WebAudio sintesis (oscillator "ting" 880→1320Hz, <1 dtk) HANYA setelah nakes
menekan "Panggil berikutnya"; default NYALA tapi hanya post-interaksi (aman); ada toggle bisu
di dashboard. Total 0 byte file. Dicatat di sini sesuai v5 ATURAN 13.
