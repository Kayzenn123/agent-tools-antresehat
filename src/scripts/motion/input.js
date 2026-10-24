/**
 * motion/input.js — gerak D: flick inertia + magnetic.
 * - #karcis-saya & .baris (di #papan-grid): drag horizontal dengan inertia
 *   (momentum + gesekan), hanya di pointer kasar (mobile).
 * - Magnetic: tombol ambil nomor (#btn-ambil, fallback #form-ambil submit)
 *   tertarik ringan ke arah kursor (desktop, pointer halus).
 * - touch-action: pan-y di CSS agar scroll vertikal tetap jalan.
 * - MODE RINGAN: tanpa inertia (drag biasa tanpa momentum).
 * Semua gerak: transform saja.
 */

function pointerKasar() {
  return window.matchMedia('(pointer: coarse)').matches;
}

function pointerHalus() {
  return window.matchMedia('(pointer: fine)').matches;
}

/* ---------- flick inertia horizontal ---------- */
function pasangFlick(el, { inertia }) {
  let aktif = false;
  let startX = 0;
  let scrollAwal = 0;
  let meluncur = false;
  let vx = 0;
  let lastX = 0;
  let lastT = 0;
  let raf = 0;

  const hentikan = () => {
    meluncur = false;
    cancelAnimationFrame(raf);
  };

  const luncur = () => {
    if (!meluncur) return;
    vx *= 0.94; // gesekan
    el.scrollLeft -= vx;
    if (Math.abs(vx) < 0.4) {
      meluncur = false;
      return;
    }
    raf = requestAnimationFrame(luncur);
  };

  const onDown = (e) => {
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    aktif = true;
    hentikan();
    startX = e.clientX;
    lastX = e.clientX;
    lastT = performance.now();
    scrollAwal = el.scrollLeft;
    vx = 0;
    try {
      el.setPointerCapture(e.pointerId);
    } catch {
      /* abaikan */
    }
  };

  const onMove = (e) => {
    if (!aktif) return;
    const dx = e.clientX - lastX;
    const now = performance.now();
    const dt = Math.max(1, now - lastT);
    vx = (dx / dt) * 16; // px per frame
    lastX = e.clientX;
    lastT = now;
    el.scrollLeft = scrollAwal - (e.clientX - startX);
  };

  const onUp = () => {
    if (!aktif) return;
    aktif = false;
    if (inertia && Math.abs(vx) > 2) {
      meluncur = true;
      raf = requestAnimationFrame(luncur);
    }
  };

  el.addEventListener('pointerdown', onDown);
  el.addEventListener('pointermove', onMove);
  el.addEventListener('pointerup', onUp);
  el.addEventListener('pointercancel', onUp);

  return () => {
    hentikan();
    el.removeEventListener('pointerdown', onDown);
    el.removeEventListener('pointermove', onMove);
    el.removeEventListener('pointerup', onUp);
    el.removeEventListener('pointercancel', onUp);
  };
}

/* ---------- geser baris (swipe) dengan snap-back elastis ---------- */
function pasangGeserBaris(baris, { inertia }) {
  const BATAS = 72;
  let aktif = false;
  let dx = 0;
  let vx = 0;
  let lastX = 0;
  let lastT = 0;
  let gerakTotal = 0;
  let raf = 0;

  const setX = (x) => {
    baris.style.transform = `translateX(${x.toFixed(1)}px)`;
  };

  const kembali = () => {
    cancelAnimationFrame(raf);
    baris.style.transition = 'transform 450ms cubic-bezier(0.34, 1.56, 0.64, 1)';
    setX(0);
    dx = 0;
    setTimeout(() => {
      baris.style.transition = '';
    }, 480);
  };

  const onDown = (e) => {
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    aktif = true;
    gerakTotal = 0;
    dx = 0;
    vx = 0;
    lastX = e.clientX;
    lastT = performance.now();
    baris.style.transition = '';
    cancelAnimationFrame(raf);
    try {
      baris.setPointerCapture(e.pointerId);
    } catch {
      /* abaikan */
    }
  };

  const onMove = (e) => {
    if (!aktif) return;
    const now = performance.now();
    const step = e.clientX - lastX;
    vx = (step / Math.max(1, now - lastT)) * 16; // px per frame
    lastX = e.clientX;
    lastT = now;
    gerakTotal += Math.abs(step);
    dx = Math.max(-BATAS, Math.min(BATAS, dx + step));
    setX(dx);
  };

  const onUp = () => {
    if (!aktif) return;
    aktif = false;
    // gerakan < 8px = ketukan, biarkan click jalan, kembalikan diam-diam
    if (gerakTotal < 8) {
      baris.style.transform = '';
      dx = 0;
      return;
    }
    let v = inertia ? vx : 0;
    const jalan = () => {
      if (Math.abs(v) > 1.5) {
        dx = Math.max(-BATAS - 30, Math.min(BATAS + 30, dx + v));
        v *= 0.92;
        setX(dx);
        raf = requestAnimationFrame(jalan);
      } else {
        kembali();
      }
    };
    if (Math.abs(v) > 3) jalan();
    else kembali();
  };

  baris.addEventListener('pointerdown', onDown);
  baris.addEventListener('pointermove', onMove);
  baris.addEventListener('pointerup', onUp);
  baris.addEventListener('pointercancel', onUp);

  return () => {
    cancelAnimationFrame(raf);
    baris.style.transition = '';
    baris.style.transform = '';
    baris.removeEventListener('pointerdown', onDown);
    baris.removeEventListener('pointermove', onMove);
    baris.removeEventListener('pointerup', onUp);
    baris.removeEventListener('pointercancel', onUp);
  };
}

/* ---------- magnetic ---------- */
function pasangMagnetic(el, gsap) {
  const KUAT = 0.28;
  const onMove = (e) => {
    const r = el.getBoundingClientRect();
    const dx = e.clientX - (r.left + r.width / 2);
    const dy = e.clientY - (r.top + r.height / 2);
    const x = dx * KUAT;
    const y = dy * KUAT;
    if (gsap) gsap.to(el, { x, y, duration: 0.25, ease: 'power2.out', overwrite: 'auto' });
    else el.style.transform = `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px)`;
  };
  const onLeave = () => {
    if (gsap) gsap.to(el, { x: 0, y: 0, duration: 0.45, ease: 'elastic.out(1, 0.5)', overwrite: 'auto' });
    else el.style.transform = '';
  };
  el.addEventListener('pointermove', onMove);
  el.addEventListener('pointerleave', onLeave);
  return () => {
    el.removeEventListener('pointermove', onMove);
    el.removeEventListener('pointerleave', onLeave);
    el.style.transform = '';
  };
}

export function init(ctx) {
  const { gsap, lite } = ctx;
  const cleanups = [];

  // flick: strip karcis (scroll momentum) + baris papan (geser + snap-back)
  // hanya di pointer kasar (mobile)
  if (pointerKasar()) {
    const karcis = document.getElementById('karcis-saya');
    if (karcis) cleanups.push(pasangFlick(karcis, { inertia: !lite }));

    const grid = document.getElementById('papan-grid');
    if (grid) {
      const pasang = (baris) => {
        if (baris.dataset.flick) return;
        baris.dataset.flick = '1';
        cleanups.push(pasangGeserBaris(baris, { inertia: !lite }));
      };
      for (const baris of grid.querySelectorAll('.baris')) pasang(baris);
      // baris baru yang ditambah agen B ikut dapat geser
      const mo = new MutationObserver(() => {
        for (const baris of grid.querySelectorAll('.baris:not([data-flick])')) pasang(baris);
      });
      mo.observe(grid, { childList: true, subtree: true });
      cleanups.push(() => mo.disconnect());
    }
  }

  // magnetic: tombol ambil nomor (desktop / pointer halus)
  if (pointerHalus()) {
    const btn =
      document.getElementById('btn-ambil') ||
      document.querySelector('#form-ambil button[type="submit"], #form-ambil button');
    if (btn) cleanups.push(pasangMagnetic(btn, gsap && !lite ? gsap : null));
  }

  return () => cleanups.forEach((fn) => fn());
}
