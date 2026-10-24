// demo-seed.js — 24 nomor contoh untuk first run (store kosong).
// Semua nama jelas fiktif ("Bu Contoh 1" dst). Semua angka berlabel contoh di UI.

import { defaultState, LOKET_KEYS } from './store.js';

const SAPAAN = ['Bu', 'Pak', 'Mbak', 'Mas', 'Nek', 'Kak'];

function namaContoh(i) {
  return SAPAAN[i % SAPAAN.length] + ' Contoh ' + (i + 1);
}

// Rencana per loket: jumlah nomor, berapa selesai, berapa sedang dipanggil.
const RENCANA = {
  A: { jumlah: 10, selesai: 3, dipanggil: 1 },
  B: { jumlah: 8, selesai: 2, dipanggil: 1 },
  C: { jumlah: 6, selesai: 1, dipanggil: 1 },
};

const JAM_BUKA_MENIT = 7 * 60 + 30; // 07.30 (contoh)
const JARAK_MENIT = 4;

export function buildDemoSeed() {
  const state = defaultState();
  const hariIni = new Date();
  hariIni.setHours(0, 0, 0, 0);
  const dasar = hariIni.getTime() + JAM_BUKA_MENIT * 60000;

  let idx = 0;
  let terakhir = null;
  for (const k of LOKET_KEYS) {
    const r = RENCANA[k];
    const loket = state.loket[k];
    for (let i = 1; i <= r.jumlah; i++) {
      idx++;
      const n = k + '-' + String(i).padStart(3, '0');
      let status = 'menunggu';
      if (i <= r.selesai) status = 'selesai';
      else if (i <= r.selesai + r.dipanggil) status = 'dipanggil';
      const ts = dasar + idx * JARAK_MENIT * 60000;
      loket.antre.push({ n, nama: namaContoh(idx - 1), ts, status });
      if (status === 'selesai') loket.selesai++;
      if (status === 'dipanggil') {
        loket.dipanggil = n;
        if (!terakhir || ts > terakhir.ts) terakhir = { nomor: n, loket: k, ts };
      }
    }
  }
  state.terakhirDipanggil = terakhir;
  return state;
}
