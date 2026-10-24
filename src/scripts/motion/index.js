/**
 * motion/index.js — orkestrasi gerak ANTRESEHAT (agen C).
 *
 * init()    : muat GSAP, deteksi MODE RINGAN, hormati prefers-reduced-motion
 *             + toggle #toggle-gerak, lalu nyalakan modul yang lolos.
 * destroy() : matikan semua (dipakai toggle + Astro view transitions).
 *
 * Aturan: semua animasi hanya transform / opacity / clip-path.
 * Pause saat tab hidden (globalTimeline) & saat offscreen per modul.
 */

import { init as initCamera } from './camera.js';
import { init as initMarquee } from './marquee.js';
import { init as initText } from './text.js';
import { init as initInput } from './input.js';
import { init as initReveal } from './reveal.js';

const LS_KEY = 'antresehat:gerak';

let cleanups = [];
let gsapRef = null;
let aktif = false;

/* ---------- util ---------- */

export function prefersReduced() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function wantMotion() {
  if (prefersReduced()) return false;
  try {
    const v = localStorage.getItem(LS_KEY);
    if (v === 'mati') return false;
    if (v === 'nyala') return true;
  } catch {
    /* abaikan */
  }
  return true; // default nyala
}

async function loadGsap() {
  if (gsapRef) return gsapRef;
  try {
    const [m, st] = await Promise.all([import('gsap'), import('gsap/ScrollTrigger')]);
    const gsap = m.gsap || m.default;
    const ScrollTrigger = st.ScrollTrigger || st.default;
    gsap.registerPlugin(ScrollTrigger);
    gsapRef = { gsap, ScrollTrigger };
    return gsapRef;
  } catch {
    return null; // GSAP belum terinstal (agen A) -> gerak mati diam-diam
  }
}

/* ---------- MODE RINGAN ---------- */

function sinyalKeras() {
  const nav = navigator;
  if (typeof nav.hardwareConcurrency === 'number' && nav.hardwareConcurrency <= 4) return true;
  const dm = nav.deviceMemory;
  if (typeof dm === 'number' && dm <= 4) return true;
  const conn = nav.connection;
  if (conn && (conn.saveData === true || /2g/.test(conn.effectiveType || ''))) return true;
  return false;
}

function ukurFps(ms = 2000) {
  return new Promise((resolve) => {
    let frames = 0;
    const t0 = performance.now();
    function tick() {
      frames += 1;
      if (performance.now() - t0 < ms) requestAnimationFrame(tick);
      else resolve((frames / (performance.now() - t0)) * 1000);
    }
    requestAnimationFrame(tick);
  });
}

async function detectLite() {
  if (sinyalKeras()) return true;
  try {
    const fps = await ukurFps(2000);
    return fps < 40;
  } catch {
    return false;
  }
}

/* ---------- gelombang data-driven ---------- */

function pathGelombang(amp, fase) {
  const W = 1440;
  const H = 120;
  const base = 64;
  const n = 12;
  const dx = W / n;
  let d = `M0,${(base + amp * Math.sin(fase)).toFixed(1)}`;
  for (let i = 1; i <= n; i++) {
    const x = i * dx;
    const y = base + amp * Math.sin(i * 0.9 + fase);
    const px = (i - 0.5) * dx;
    const py = base + amp * Math.sin((i - 0.5) * 0.9 + fase);
    d += ` Q${px.toFixed(1)},${py.toFixed(1)} ${x.toFixed(1)},${y.toFixed(1)}`;
  }
  return `${d} L${W},${H} L0,${H} Z`;
}

function pasangGelombang() {
  const wadah = document.getElementById('gelombang');
  const grid = document.getElementById('papan-grid');
  if (!wadah) return;
  const n = grid ? grid.querySelectorAll('[data-status="menunggu"]').length : 0;
  const amp = 8 + Math.min(n, 24) * 2; // 8..56
  const tinggi = Math.min(320, 56 + n * 8); // px, maks 320
  wadah.style.setProperty('--gelombang-tinggi', `${tinggi}px`);
  const path = document.getElementById('gelombang-path');
  if (path) path.setAttribute('d', pathGelombang(amp, n * 0.35));
}

function initGelombang() {
  pasangGelombang();
  let eventDatang = false;
  const onChange = () => {
    eventDatang = true;
    pasangGelombang();
  };
  window.addEventListener('antre:changed', onChange);
  // fallback: kalau event agen B belum ada, amati DOM #papan-grid
  const timer = setTimeout(() => {
    if (eventDatang) return;
    const grid = document.getElementById('papan-grid');
    if (!grid || !('MutationObserver' in window)) return;
    const mo = new MutationObserver(pasangGelombang);
    mo.observe(grid, { childList: true, subtree: true, attributes: true, attributeFilter: ['data-status'] });
    cleanups.push(() => mo.disconnect());
  }, 4000);
  cleanups.push(() => {
    clearTimeout(timer);
    window.removeEventListener('antre:changed', onChange);
  });
}

/* ---------- toggle UI ---------- */

function initToggle() {
  const btn = document.getElementById('toggle-gerak');
  const terapkan = (nyala) => {
    document.documentElement.classList.toggle('gerak-mati', !nyala);
    if (btn) {
      btn.setAttribute('aria-pressed', String(nyala));
      btn.textContent = nyala ? 'Gerak: nyala' : 'Gerak: mati';
    }
  };
  if (btn) {
    btn.addEventListener('click', async () => {
      const nyala = btn.getAttribute('aria-pressed') !== 'true';
      try {
        localStorage.setItem(LS_KEY, nyala ? 'nyala' : 'mati');
      } catch {
        /* abaikan */
      }
      terapkan(nyala);
      if (nyala) await init();
      else destroy();
    });
  }
  const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
  mq.addEventListener?.('change', () => {
    if (mq.matches) {
      destroy();
      terapkan(false);
    }
  });
  terapkan(wantMotion());
}

/* ---------- pause saat tab hidden ---------- */

function initVisibilityPause(getGsap) {
  const onVis = () => {
    const g = getGsap();
    if (!g) return;
    if (document.hidden) g.gsap.globalTimeline.pause();
    else g.gsap.globalTimeline.play();
  };
  document.addEventListener('visibilitychange', onVis);
  return () => document.removeEventListener('visibilitychange', onVis);
}

/* ---------- API ---------- */

export async function init() {
  if (aktif) return;
  if (!wantMotion()) return;
  aktif = true;

  const g = await loadGsap();
  const lite = await detectLite();

  const ctx = {
    gsap: g?.gsap || null,
    ScrollTrigger: g?.ScrollTrigger || null,
    lite,
    reduced: prefersReduced(),
    nyala: () => aktif && wantMotion(),
  };

  cleanups.push(initVisibilityPause(() => g));
  initGelombang();

  // Tanpa GSAP: modul yang butuh GSAP no-op; gelombang + toggle tetap jalan.
  const mods = [initCamera, initMarquee, initText, initInput, initReveal];
  for (const m of mods) {
    try {
      const cleanup = m(ctx);
      if (typeof cleanup === 'function') cleanups.push(cleanup);
    } catch {
      /* satu modul gagal -> lainnya tetap jalan */
    }
  }
}

export function destroy() {
  aktif = false;
  for (const fn of cleanups.splice(0)) {
    try {
      fn();
    } catch {
      /* abaikan */
    }
  }
  document.documentElement.classList.add('gerak-mati');
}

// auto-start saat DOM siap; dukung Astro view transitions
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    initToggle();
    init();
  });
} else {
  initToggle();
  init();
}
document.addEventListener('astro:after-swap', () => {
  destroy();
  document.documentElement.classList.remove('gerak-mati');
  initToggle();
  init();
});
