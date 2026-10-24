// main.js — entry point mesin antrean client-side ANTRESEHAT.
// Wire semua modul queue/. Semua query DOM defensif: kalau skeleton agen A
// belum ada, modul diam tanpa error.

import {
  initEngine,
  ambilNomor,
  panggilBerikutnya,
  tandaiSelesai,
  lewati,
  panggilUlang,
  resetHari,
  renderKarcis,
  renderPapan,
  renderRaksasa,
  renderRekap,
  tanganiDeepLink,
  isSuaraMati,
  setSuara,
} from './engine.js';
import { unduhCSV, unduhJSON, salinWA } from './export.js';
import { mainkanTing } from './suara.js';
import { initEasterEgg } from './easter-egg.js';

const $ = (id) => document.getElementById(id);
const SHEETS = ['ambil', 'papan', 'loket'];
let filterAktif = 'semua';
let toastTimer = null;

function renderSemua() {
  renderKarcis();
  renderPapan(filterAktif === 'semua' ? null : filterAktif);
  renderRaksasa();
  renderRekap();
}

// Pesan kecil ala Bu RT, mengambang 4 detik.
function toast(pesan) {
  if (!pesan) return;
  let t = $('pesan-sistem');
  if (!t) {
    t = document.createElement('div');
    t.id = 'pesan-sistem';
    t.className = 'pesan-sistem';
    t.setAttribute('role', 'status');
    document.body.appendChild(t);
  }
  t.textContent = pesan;
  if (toastTimer) clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    t.textContent = '';
  }, 4000);
}

// ---------- tab sheet ----------

function pindahSheet(nama) {
  if (!SHEETS.includes(nama)) return;
  const nav = $('sheet-tabs');
  const tombol = nav ? Array.from(nav.querySelectorAll('button[data-sheet]')) : [];
  tombol.forEach((b) => {
    const aktif = b.dataset.sheet === nama;
    b.setAttribute('aria-selected', aktif ? 'true' : 'false');
    b.tabIndex = aktif ? 0 : -1;
  });
  SHEETS.forEach((s) => {
    const sec = $('sheet-' + s);
    if (sec) sec.hidden = s !== nama;
  });
}

function wireTabs() {
  const nav = $('sheet-tabs');
  if (!nav) return;
  nav.setAttribute('role', 'tablist');
  const tombol = Array.from(nav.querySelectorAll('button[data-sheet]'));
  if (!tombol.length) return;
  tombol.forEach((b, i) => {
    b.setAttribute('role', 'tab');
    b.addEventListener('click', () => pindahSheet(b.dataset.sheet));
    b.addEventListener('keydown', (ev) => {
      let j = null;
      if (ev.key === 'ArrowRight') j = (i + 1) % tombol.length;
      else if (ev.key === 'ArrowLeft') j = (i - 1 + tombol.length) % tombol.length;
      else if (ev.key === 'Home') j = 0;
      else if (ev.key === 'End') j = tombol.length - 1;
      if (j !== null) {
        ev.preventDefault();
        tombol[j].focus();
        pindahSheet(tombol[j].dataset.sheet);
      }
    });
  });
  window.addEventListener('antre:show-sheet', (ev) => {
    if (ev.detail && ev.detail.sheet) pindahSheet(ev.detail.sheet);
  });
}

// ---------- form ambil nomor ----------

function wireFormAmbil() {
  const form = $('form-ambil');
  if (!form) return;
  form.addEventListener('submit', (ev) => {
    ev.preventDefault();
    const pilih = $('pilih-loket');
    const nama = $('nama-pasien');
    const hasil = ambilNomor(pilih ? pilih.value : null, nama ? nama.value : '');
    toast(hasil.pesan);
    if (hasil.ok) {
      if (nama) nama.value = '';
      renderSemua();
      pindahSheet('ambil');
    }
  });
}

// ---------- filter papan ----------

function wireFilter() {
  const tombol = document.querySelectorAll('button[data-filter-loket]');
  tombol.forEach((b) => {
    b.addEventListener('click', () => {
      filterAktif = b.dataset.filterLoket || 'semua';
      tombol.forEach((x) => x.setAttribute('aria-pressed', x === b ? 'true' : 'false'));
      renderPapan(filterAktif === 'semua' ? null : filterAktif);
    });
  });
}

// ---------- dashboard nakes ----------

function wireNakes() {
  const loketDipilih = () => {
    const s = $('loket-nakes');
    return s ? s.value : null;
  };
  const jalan = (fn) => {
    const hasil = fn(loketDipilih());
    toast(hasil.pesan);
    if (hasil.ok || !hasil.dibatalkan) renderSemua();
  };
  const btnPanggil = $('btn-panggil');
  if (btnPanggil) btnPanggil.addEventListener('click', () => jalan(panggilBerikutnya));
  const btnUlang = $('btn-ulang');
  if (btnUlang) btnUlang.addEventListener('click', () => jalan(panggilUlang));
  const btnSelesai = $('btn-selesai');
  if (btnSelesai) btnSelesai.addEventListener('click', () => jalan(tandaiSelesai));
  const btnLewati = $('btn-lewati');
  if (btnLewati) btnLewati.addEventListener('click', () => jalan(lewati));
  const btnReset = $('btn-reset');
  if (btnReset) btnReset.addEventListener('click', () => jalan(resetHari));
}

// ---------- ekspor ----------

function wireEkspor() {
  const csv = $('btn-export-csv');
  if (csv) csv.addEventListener('click', () => toast(unduhCSV().pesan));
  const json = $('btn-export-json');
  if (json) json.addEventListener('click', () => toast(unduhJSON().pesan));
  const wa = $('btn-salin-wa');
  if (wa) wa.addEventListener('click', async () => toast((await salinWA()).pesan));
}

// ---------- toggle suara ----------

function sinkronToggleSuara() {
  const t = $('toggle-suara');
  if (!t) return;
  t.setAttribute('aria-pressed', isSuaraMati() ? 'false' : 'true');
}

function wireSuara() {
  const t = $('toggle-suara');
  if (t) {
    t.addEventListener('click', () => {
      setSuara(isSuaraMati());
      sinkronToggleSuara();
      toast(isSuaraMati() ? 'Suara dimatikan.' : 'Suara dinyalakan.');
    });
  }
  window.addEventListener('antre:called', () => {
    if (!isSuaraMati()) mainkanTing();
  });
}

// ---------- init ----------

function tampilkanError(msg) {
  const p = document.createElement('p');
  p.className = 'antre-error';
  p.setAttribute('role', 'alert');
  p.textContent = msg;
  document.body.prepend(p);
}

function init() {
  try {
    initEngine();
  } catch (err) {
    tampilkanError('Yah, papannya lagi rewel… coba muat ulang halamannya ya.');
    return;
  }

  // Loading state ala Bu RT, lalu render.
  const grid = $('papan-grid');
  if (grid) grid.textContent = 'Sebentar, papan disiapin…';

  wireTabs();
  wireFormAmbil();
  wireFilter();
  wireNakes();
  wireEkspor();
  wireSuara();
  initEasterEgg();

  window.addEventListener('antre:changed', () => {
    renderSemua();
    sinkronToggleSuara();
  });

  requestAnimationFrame(() => {
    renderSemua();
    sinkronToggleSuara();
    tanganiDeepLink();
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
