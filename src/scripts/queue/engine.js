// engine.js — logika antrean + render DOM (defensif: semua query DOM di-guard).

import { defaultState, loadState, saveState, saveStateNow, LOKET_KEYS } from './store.js';
import { buildDemoSeed } from './demo-seed.js';

export const NAMA_LOKET = {
  A: 'L1 Pendaftaran',
  B: 'L2 Poli Umum',
  C: 'L3 Gigi & KIA',
};
export const MENIT_PER_ANTRI = 4; // contoh
const NAMA_MAX = 40;

const LABEL_STATUS = {
  menunggu: 'Menunggu',
  dipanggil: 'Dipanggil',
  selesai: 'Selesai',
  lewat: 'Terlewat',
};
const URUTAN_STATUS = { dipanggil: 0, menunggu: 1, lewat: 2, selesai: 3 };

let state = null;

// ---------- state ----------

export function getState() {
  return state;
}

// Muat simpanan; kalau kosong -> seed contoh (first run).
// Kembalikan { seeded:true } bila seed baru dibuat.
export function initEngine() {
  const tersimpan = loadState();
  if (tersimpan) {
    state = tersimpan;
    return { seeded: false };
  }
  state = buildDemoSeed();
  saveState(state);
  return { seeded: true };
}

function pastikanLoket(loket) {
  return LOKET_KEYS.includes(loket) ? loket : null;
}

export function bersihkanNama(nama) {
  return String(nama === null || nama === undefined ? '' : nama)
    .replace(/[<>&]/g, '')
    .trim()
    .slice(0, NAMA_MAX);
}

function cariTiket(nomor) {
  for (const k of LOKET_KEYS) {
    const tiket = state.loket[k].antre.find((t) => t.n === nomor);
    if (tiket) return { tiket, loket: k };
  }
  return null;
}

function berubah() {
  window.dispatchEvent(new CustomEvent('antre:changed'));
}

// ---------- aksi ----------

export function nomorBerikutnya(loket) {
  let maks = 0;
  for (const t of state.loket[loket].antre) {
    const m = /^([ABC])-(\d{3})$/.exec(t.n);
    if (m && m[1] === loket) maks = Math.max(maks, parseInt(m[2], 10));
  }
  return loket + '-' + String(maks + 1).padStart(3, '0');
}

function antreMenunggu(loket) {
  return state.loket[loket].antre.filter((t) => t.status === 'menunggu');
}

export function ambilNomor(loket, namaMentah) {
  loket = pastikanLoket(loket);
  if (!loket) return { ok: false, pesan: 'Pilih loket dulu ya.' };
  const nama = bersihkanNama(namaMentah);
  if (!nama) return { ok: false, pesan: 'Tulis nama dulu ya, biar karcisnya ada namanya.' };
  const nomor = nomorBerikutnya(loket);
  state.loket[loket].antre.push({ n: nomor, nama, ts: Date.now(), status: 'menunggu' });
  if (!state.karcisSaya.includes(nomor)) state.karcisSaya.push(nomor);
  const posisi = antreMenunggu(loket).length;
  const estimasiMenit = posisi * MENIT_PER_ANTRI;
  saveState(state);
  window.dispatchEvent(new CustomEvent('antre:ticket', { detail: { nomor, loket, nama } }));
  berubah();
  return { ok: true, nomor, posisi, estimasiMenit, nama, pesan: 'Karcis ' + nomor + ' sudah di tangan. Pantau papan ya.' };
}

export function panggilBerikutnya(loket) {
  loket = pastikanLoket(loket);
  if (!loket) return { ok: false, pesan: 'Pilih loket nakes dulu ya.' };
  const L = state.loket[loket];
  if (L.dipanggil) {
    return { ok: false, pesan: 'Masih ada ' + L.dipanggil + ' yang dipanggil. Selesaikan atau lewati dulu ya.' };
  }
  const berikut = antreMenunggu(loket)[0];
  if (!berikut) {
    return { ok: false, pesan: 'Sepi, belum ada yang antre di ' + NAMA_LOKET[loket] + '. Enak, langsung dilayani.' };
  }
  berikut.status = 'dipanggil';
  L.dipanggil = berikut.n;
  state.terakhirDipanggil = { nomor: berikut.n, loket, ts: Date.now() };
  saveState(state);
  window.dispatchEvent(new CustomEvent('antre:called', { detail: { nomor: berikut.n, loket } }));
  berubah();
  return { ok: true, nomor: berikut.n, nama: berikut.nama, pesan: berikut.n + ' (' + berikut.nama + ') dipanggil ke ' + NAMA_LOKET[loket] + '.' };
}

export function tandaiSelesai(loket) {
  loket = pastikanLoket(loket);
  if (!loket) return { ok: false, pesan: 'Pilih loket nakes dulu ya.' };
  const L = state.loket[loket];
  if (!L.dipanggil) return { ok: false, pesan: 'Belum ada nomor yang dipanggil di loket ini.' };
  const hasil = cariTiket(L.dipanggil);
  if (hasil) hasil.tiket.status = 'selesai';
  const nomor = L.dipanggil;
  L.dipanggil = null;
  L.selesai++;
  saveState(state);
  berubah();
  return { ok: true, nomor, pesan: nomor + ' selesai dilayani. Mantap.' };
}

export function lewati(loket) {
  loket = pastikanLoket(loket);
  if (!loket) return { ok: false, pesan: 'Pilih loket nakes dulu ya.' };
  const L = state.loket[loket];
  if (!L.dipanggil) return { ok: false, pesan: 'Belum ada nomor yang dipanggil di loket ini.' };
  const hasil = cariTiket(L.dipanggil);
  if (hasil) hasil.tiket.status = 'lewat';
  const nomor = L.dipanggil;
  L.dipanggil = null;
  L.lewat++;
  saveState(state);
  berubah();
  return { ok: true, nomor, pesan: nomor + ' dilewati dulu. Nanti bisa ambil nomor baru ya.' };
}

export function panggilUlang(loket) {
  loket = pastikanLoket(loket);
  if (!loket) return { ok: false, pesan: 'Pilih loket nakes dulu ya.' };
  const L = state.loket[loket];
  if (!L.dipanggil) return { ok: false, pesan: 'Belum ada nomor yang dipanggil di loket ini.' };
  window.dispatchEvent(new CustomEvent('antre:called', { detail: { nomor: L.dipanggil, loket } }));
  return { ok: true, nomor: L.dipanggil, pesan: L.dipanggil + ' dipanggil ulang.' };
}

export function resetHari() {
  const yakin = window.confirm(
    'Bu RT: Yakin mau reset papan hari ini? Semua nomor antrean bakal dihapus dan mulai dari awal lagi.'
  );
  if (!yakin) return { ok: false, dibatalkan: true };
  state = defaultState();
  saveStateNow(state);
  window.dispatchEvent(new CustomEvent('antre:issued-reset'));
  berubah();
  return { ok: true, pesan: 'Papan sudah bersih. Selamat pagi, antrean baru dimulai.' };
}

// ---------- preferensi suara ----------

export function isSuaraMati() {
  return state.suara === false;
}

export function setSuara(nyala) {
  state.suara = nyala === true;
  saveState(state);
  berubah();
}

// ---------- render (tanpa innerHTML untuk data) ----------

function el(tag, cls, teks) {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (teks !== undefined && teks !== null) e.textContent = teks;
  return e;
}

function fmtJam(ts) {
  return new Date(ts).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
}

export function renderKarcis() {
  const wadah = document.getElementById('karcis-saya');
  const pEstimasi = document.getElementById('estimasi');
  if (!wadah) return;
  wadah.textContent = '';
  const milik = [];
  for (let i = state.karcisSaya.length - 1; i >= 0; i--) {
    const hasil = cariTiket(state.karcisSaya[i]);
    if (hasil) milik.push(hasil);
  }
  const item = milik[0];
  if (!item) {
    wadah.appendChild(el('p', 'karcis-kosong', 'Belum ada karcis. Ambil nomor dulu yuk.'));
    if (pEstimasi) pEstimasi.textContent = '';
    return;
  }
  const { tiket, loket } = item;
  wadah.appendChild(el('p', 'karcis-nomor', tiket.n));
  wadah.appendChild(el('p', 'karcis-nama', tiket.nama));
  wadah.appendChild(el('p', 'karcis-loket', NAMA_LOKET[loket]));
  wadah.appendChild(el('p', 'karcis-status', 'Status: ' + LABEL_STATUS[tiket.status]));
  if (pEstimasi) {
    if (tiket.status === 'menunggu') {
      const posisi = antreMenunggu(loket).findIndex((t) => t.n === tiket.n) + 1;
      pEstimasi.textContent =
        'Kira-kira ' + posisi * MENIT_PER_ANTRI + ' menit lagi (contoh). Posisi ke-' + posisi + '.';
    } else if (tiket.status === 'dipanggil') {
      pEstimasi.textContent = 'Giliranmu! Segera ke ' + NAMA_LOKET[loket] + ' ya.';
    } else {
      pEstimasi.textContent = '';
    }
  }
}

export function renderPapan(filter) {
  const grid = document.getElementById('papan-grid');
  if (!grid) return;
  grid.textContent = '';
  const daftar = pastikanLoket(filter) ? [filter] : LOKET_KEYS;
  let totalBaris = 0;
  for (const k of daftar) {
    const baris = [...state.loket[k].antre].sort(
      (a, b) => URUTAN_STATUS[a.status] - URUTAN_STATUS[b.status] || a.ts - b.ts
    );
    for (const t of baris) {
      totalBaris++;
      const a = el('article', 'baris');
      a.dataset.loket = k;
      a.dataset.nomor = t.n;
      a.dataset.status = t.status;
      a.appendChild(el('span', 'sel-nomor', t.n));
      a.appendChild(el('span', 'sel-nama', t.nama));
      a.appendChild(el('span', 'sel-loket', NAMA_LOKET[k]));
      a.appendChild(el('span', 'sel-status', LABEL_STATUS[t.status]));
      a.appendChild(el('span', 'sel-waktu', fmtJam(t.ts)));
      grid.appendChild(a);
    }
  }
  if (totalBaris === 0) {
    grid.appendChild(el('p', 'papan-kosong', 'Sepi, belum ada yang antre. Enak, langsung dilayani.'));
  }
}

export function renderRaksasa() {
  const e = document.getElementById('nomor-raksasa');
  if (!e) return;
  e.textContent = '';
  const t = state.terakhirDipanggil;
  if (!t) {
    e.appendChild(el('span', 'raksasa-kosong', 'Belum ada panggilan hari ini.'));
    return;
  }
  e.appendChild(el('span', 'raksasa-nomor', t.nomor));
  e.appendChild(el('span', 'raksasa-loket', NAMA_LOKET[t.loket] + ' — silakan maju'));
}

export function renderRekap() {
  const e = document.getElementById('rekap');
  if (!e) return;
  e.textContent = '';
  let totSelesai = 0;
  let totLewat = 0;
  for (const k of LOKET_KEYS) {
    const L = state.loket[k];
    const menunggu = L.antre.filter((t) => t.status === 'menunggu').length;
    const dipanggil = L.dipanggil ? 1 : 0;
    totSelesai += L.selesai;
    totLewat += L.lewat;
    const baris = el('div', 'rekap-loket');
    baris.appendChild(el('span', 'rekap-nama-loket', NAMA_LOKET[k]));
    baris.appendChild(
      el(
        'span',
        'rekap-angka',
        'Menunggu ' + menunggu + ' · Dipanggil ' + dipanggil + ' · Selesai ' + L.selesai + ' · Terlewat ' + L.lewat
      )
    );
    e.appendChild(baris);
  }
  e.appendChild(el('p', 'rekap-total', 'Total dilayani: ' + totSelesai + ' · Terlewat: ' + totLewat + ' (contoh)'));
}

// Deep-link ?l=A&n=A-042 : hanya tampil, tidak memicu aksi destruktif.
export function tanganiDeepLink() {
  let q;
  try {
    q = new URLSearchParams(window.location.search);
  } catch (err) {
    return;
  }
  const l = q.get('l');
  const n = q.get('n');
  if (!l || !n) return;
  const wadah = document.getElementById('karcis-saya');
  const valid = pastikanLoket(l) && /^[ABC]-\d{3}$/.test(n);
  const hasil = valid ? cariTiket(n) : null;
  if (hasil && hasil.loket === l) {
    if (!state.karcisSaya.includes(n)) {
      state.karcisSaya.push(n);
      saveState(state);
    }
    renderKarcis();
    window.dispatchEvent(new CustomEvent('antre:show-sheet', { detail: { sheet: 'ambil' } }));
    return;
  }
  if (wadah) {
    wadah.textContent = '';
    wadah.appendChild(el('p', 'karcis-tidak-ketemu', 'Yah, nomornya nggak ketemu…'));
  }
  window.dispatchEvent(new CustomEvent('antre:show-sheet', { detail: { sheet: 'ambil' } }));
}
