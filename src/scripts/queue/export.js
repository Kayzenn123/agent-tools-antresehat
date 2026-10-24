// export.js — unduh CSV/JSON rekap + salin ringkasan WA ke clipboard.
// Semua fungsi mengembalikan { ok, pesan } ala Bu RT; main.js yang menampilkan.

import { getState, NAMA_LOKET } from './engine.js';
import { LOKET_KEYS } from './store.js';

function namaFile(ext) {
  const t = new Date();
  const p = (x) => String(x).padStart(2, '0');
  return 'antresehat-rekap-' + t.getFullYear() + p(t.getMonth() + 1) + p(t.getDate()) + '.' + ext;
}

function unduh(nama, mime, isi) {
  const blob = new Blob([isi], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = nama;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 5000);
}

function selCSV(v) {
  return '"' + String(v).replace(/"/g, '""') + '"';
}

function bangunCSV() {
  const baris = [['nomor', 'loket', 'nama', 'status', 'waktu']];
  const s = getState();
  for (const k of LOKET_KEYS) {
    for (const t of s.loket[k].antre) {
      baris.push([t.n, NAMA_LOKET[k], t.nama, t.status, new Date(t.ts).toLocaleString('id-ID')]);
    }
  }
  return baris.map((r) => r.map(selCSV).join(',')).join('\r\n');
}

export function unduhCSV() {
  try {
    unduh(namaFile('csv'), 'text/csv;charset=utf-8', '﻿' + bangunCSV());
    return { ok: true, pesan: 'Rekap CSV sudah diunduh.' };
  } catch (err) {
    return { ok: false, pesan: 'Yah, unduhnya gagal… coba lagi ya.' };
  }
}

export function unduhJSON() {
  try {
    unduh(namaFile('json'), 'application/json;charset=utf-8', JSON.stringify(getState(), null, 2));
    return { ok: true, pesan: 'Data JSON sudah diunduh.' };
  } catch (err) {
    return { ok: false, pesan: 'Yah, unduhnya gagal… coba lagi ya.' };
  }
}

export function teksRingkasanWA() {
  const s = getState();
  const baris = ['*Rekap Antrean Puskesmas (contoh)*'];
  for (const k of LOKET_KEYS) {
    const L = s.loket[k];
    const menunggu = L.antre.filter((t) => t.status === 'menunggu').length;
    baris.push(
      NAMA_LOKET[k] + ': menunggu ' + menunggu + ', selesai ' + L.selesai + ', terlewat ' + L.lewat
    );
  }
  baris.push('Catatan: data contoh, tersimpan di HP masing-masing.');
  return baris.join('\n');
}

async function salinFallback(teks) {
  const ta = document.createElement('textarea');
  ta.value = teks;
  ta.setAttribute('readonly', '');
  ta.style.position = 'fixed';
  ta.style.opacity = '0';
  document.body.appendChild(ta);
  ta.select();
  let berhasil = false;
  try {
    berhasil = document.execCommand('copy');
  } catch (err) {
    berhasil = false;
  }
  ta.remove();
  return berhasil;
}

export async function salinWA() {
  const teks = teksRingkasanWA();
  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(teks);
      return { ok: true, pesan: 'Ringkasan sudah disalin, tinggal tempel di WA.' };
    }
  } catch (err) {
    // lanjut ke fallback
  }
  try {
    const berhasil = await salinFallback(teks);
    if (berhasil) return { ok: true, pesan: 'Ringkasan sudah disalin, tinggal tempel di WA.' };
  } catch (err) {
    // abaikan, pesan gagal di bawah
  }
  return { ok: false, pesan: 'Yah, salinnya gagal… unduh CSV saja ya.' };
}
