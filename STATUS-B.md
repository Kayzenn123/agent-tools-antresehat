# STATUS-B — AGENT B (mesin antrean client-side)

**SIAP** — 2026-10-24 08:25 WIB

7 modul vanilla JS (ESM) selesai di `src/scripts/queue/`, sintaks lolos `node --check`,
smoke test logika lolos (seed 24 nomor, ambil/panggil/selesai/lewati/reset, fallback data korup).
Tanpa console.log, tanpa innerHTML untuk data pengguna (textContent/createElement),
tanpa emoji. Semua query DOM defensif (`if(!el) return`) — aman di-wire kapan pun skeleton jadi.

- `store.js` — state localStorage `antresehat:v1`, validasi skema + fallback reset diam-diam + console.warn, save debounce 300ms.
- `demo-seed.js` — 24 nomor contoh (A-001…A-010, B-001…B-008, C-001…C-006), status campur, nama fiktif "Bu Contoh N" dst.
- `engine.js` — ambilNomor (sanitasi nama: strip <>&, maks 40) → {nomor, posisi, estimasiMenit = posisi×4 "contoh"}; panggilBerikutnya/tandaiSelesai/lewati/panggilUlang/resetHari (confirm Bu RT); renderKarcis/renderPapan/renderRaksasa/renderRekap; deep-link ?l=A&n=A-042 (hanya tampil; tak ketemu → "Yah, nomornya nggak ketemu…").
- `export.js` — CSV (BOM, kolom nomor,loket,nama,status,waktu) + JSON + salin WA (clipboard API + fallback textarea/execCommand).
- `suara.js` — ting WebAudio 880→1320Hz 0.6 dtk, hanya via event `antre:called`.
- `easter-egg.js` — 5 ketuk [data-easter] dalam 4 dtk → class `pasang-purnama` 10 dtk + event `antre:purnama`.
- `main.js` — init: tab sheet (role=tablist, keyboard ←/→/Home/End), wire form/nakes/ekspor/toggle suara (aria-pressed, tersimpan di store), loading state "Sebentar, papan disiapin…", empty state "Sepi, belum ada yang antre…".

Event keluar: `antre:called` {nomor,loket}, `antre:ticket`, `antre:issued-reset` (+ internal `antre:changed`, `antre:show-sheet`, `antre:purnama`).

**WIRE-UP untuk agen A** — taruh SATU baris ini di `src/pages/index.astro` (mis. sebelum `</body>`):

```html
<script src="../scripts/queue/main.js"></script>
```

CATATAN PATH: dari `src/pages/index.astro`, path relatif yang benar adalah `../scripts/queue/main.js`
(bukan `./scripts/...` — itu akan resolve ke `src/pages/scripts/` yang tidak ada).
Astro/Vite akan me-bundle main.js beserta import relatifnya (`./store.js` dst).
