#!/usr/bin/env node
/**
 * cek-kontras.js — verifikasi rasio kontras WCAG untuk token oklch ANTRESEHAT.
 *
 * Target:
 *   teks vs bg      >= 4.5:1  (AA normal)
 *   muted vs bg     >= 4.5:1  (AA normal — teks bantu kecil)
 *   accent vs bg    >= 4.5:1  (AA normal)
 *   accent-2 vs surface >= 4.5:1
 *   pop vs surface  >= 3:1   (teks besar / stempel grafis)
 *
 * Bila gagal: turunkan LIGHTNESS saja (0.02 per langkah), hue/chroma tetap.
 * Nilai final dicatat ke src/assets/styles/tokens.css.
 *
 * Cara pakai: node scripts/cek-kontras.js [--json]
 */

const TOKENS = {
  bg:       { l: 0.72, c: 0.09,  h: 82,  label: 'kertas krem' },
  surface:  { l: 0.81, c: 0.065, h: 82,  label: 'kertas terang / sel aktif' },
  text:     { l: 0.18, c: 0.03,  h: 82,  label: 'tinta' },
  muted:    { l: 0.38, c: 0.035, h: 82,  label: 'tinta pudar' },
  accent:   { l: 0.50, c: 0.17,  h: 82,  label: 'hijau lumut' },
  'accent-2': { l: 0.36, c: 0.11, h: 82, label: 'hijau botol' },
  pop:      { l: 0.58, c: 0.21,  h: 300, label: 'ungu stempel' },
};

const CHECKS = [
  ['text', 'bg', 4.5, 'teks vs bg (AA)'],
  ['muted', 'bg', 4.5, 'muted vs bg (AA)'],
  ['accent', 'bg', 4.5, 'accent vs bg (AA)'],
  ['accent-2', 'surface', 4.5, 'accent-2 vs surface (AA)'],
  ['pop', 'surface', 3.0, 'pop vs surface (grafis besar, AA-large)'],
  ['surface', 'accent-2', 4.5, 'teks terang di strip accent-2 (AA)'],
  ['text', 'surface', 4.5, 'teks vs surface (AA)'],
];

// --- konversi oklch -> luminance relatif ---
function oklchToLin(l, c, hDeg) {
  const h = (hDeg * Math.PI) / 180;
  const a = c * Math.cos(h);
  const b = c * Math.sin(h);
  // pangkat 3 ganjil: pakai perkalian agar negatif tidak jadi NaN
  const cube = (x) => x * x * x;
  const L = cube(l + 0.3963377774 * a + 0.2158037573 * b);
  const M = cube(l - 0.1055613458 * a - 0.0638541728 * b);
  const S = cube(l - 0.0894841775 * a - 1.291485548 * b);
  let r = +4.0767416621 * L - 3.3077115913 * M + 0.2309699292 * S;
  let g = -1.2684380046 * L + 2.6097574011 * M - 0.3413193965 * S;
  let bl = -0.0041960863 * L - 0.7034186147 * M + 1.707614701 * S;
  // snap floating-point noise di titik ekstrem, lalu clip gamut sRGB
  const snap = (v) => (Math.abs(v) < 1e-9 ? 0 : v > 1 && v < 1 + 1e-6 ? 1 : v);
  r = Math.min(1, Math.max(0, snap(r)));
  g = Math.min(1, Math.max(0, snap(g)));
  bl = Math.min(1, Math.max(0, snap(bl)));
  // r/g/b sudah LINEAR sRGB -> langsung dipakai untuk luminance (tanpa EOTF)
  return { r, g, b: bl };
}

function luminance(t) {
  const { r, g, b } = oklchToLin(t.l, t.c, t.h);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function ratio(a, b) {
  const la = luminance(a);
  const lb = luminance(b);
  const [hi, lo] = la >= lb ? [la, lb] : [lb, la];
  return (hi + 0.05) / (lo + 0.05);
}

function runCheck(tokens) {
  return CHECKS.map(([fg, bg, min, label]) => {
    const r = ratio(tokens[fg], tokens[bg]);
    return { fg, bg, min, label, ratio: r, pass: r >= min };
  });
}

// --- penyesuaian lightness otomatis: turunkan lightness warna gelap / naikkan warna terang ---
// tiap ronde: setiap cek yang gagal dapat 1 langkah (round-robin), berhenti jika buntu.
function autoFix(tokens) {
  const out = JSON.parse(JSON.stringify(tokens));
  const adjustments = {};
  let stuck = 0;
  for (let round = 0; round < 60; round++) {
    const results = runCheck(out);
    const failing = results.filter((x) => !x.pass);
    if (!failing.length) break;
    let changed = false;
    const seen = new Set();
    for (const f of failing) {
      if (seen.has(f.fg)) continue;
      seen.add(f.fg);
      const t = out[f.fg];
      const lBg = out[f.bg].l;
      const dir = t.l <= lBg ? -0.02 : 0.02;
      const next = Math.round(Math.min(1, Math.max(0, t.l + dir)) * 100) / 100;
      if (next !== t.l) {
        t.l = next;
        changed = true;
      }
      adjustments[f.fg] = (adjustments[f.fg] || 0) + 1;
    }
    if (!changed && ++stuck > 2) break;
  }
  return { tokens: out, adjustments, results: runCheck(out) };
}

// --- self-test: hitam vs putih wajib 21:1 ---
{
  const bw = ratio({ l: 0, c: 0, h: 0 }, { l: 1, c: 0, h: 0 });
  if (Math.abs(bw - 21) > 0.5) {
    console.error(`SELF-TEST GAGAL: hitam/putih = ${bw.toFixed(2)} (harus ~21)`);
    process.exit(3);
  }
}

const json = process.argv.includes('--json');
const { tokens, adjustments, results } = autoFix(TOKENS);

const failed = results.filter((r) => !r.pass);
if (json) {
  console.log(JSON.stringify({ tokens, adjustments, results }, null, 2));
} else {
  console.log('=== CEK KONTRAS ANTRESEHAT (WCAG 2.x) ===\n');
  for (const r of results) {
    console.log(
      `${r.pass ? 'LOLOS' : 'GAGAL'}  ${r.label}: ${r.ratio.toFixed(2)}:1 (min ${r.min}:1)`
    );
  }
  console.log('\n--- penyesuaian lightness (hue/chroma utuh) ---');
  for (const [k, n] of Object.entries(adjustments)) {
    console.log(`--${k}: ${n} langkah x 0.02 -> ${tokens[k].l.toFixed(2)}`);
  }
  console.log('\n--- token final ---');
  for (const [k, t] of Object.entries(tokens)) {
    console.log(`--${k}: oklch(${t.l.toFixed(2)} ${t.c.toFixed(3)} ${t.h})`);
  }
}
process.exit(failed.length ? 2 : 0);
