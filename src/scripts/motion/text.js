/**
 * motion/text.js — gerak C: nomor raksasa split per digit + flip 3D.
 * - #nomor-raksasa dipecah jadi span.digit (CSS: preserve-3d, perspective).
 * - Dengarkan 'antre:called' (detail.nomor) dari agen B:
 *   digit lama flip keluar (rotateX 90, stagger), ganti teks, flip masuk.
 * - MODE RINGAN / tanpa GSAP: ganti teks biasa.
 * - aria-live: nomor juga diumumkan ke #nakes-pesan (milik agen B) bila ada.
 */

function pecahDigit(el) {
  const teks = el.textContent.trim();
  el.textContent = '';
  const frag = document.createDocumentFragment();
  for (const ch of teks) {
    const s = document.createElement('span');
    if (ch === '-' || ch === ' ') {
      s.className = 'digit digit-sep';
    } else {
      s.className = 'digit';
    }
    s.textContent = ch;
    frag.appendChild(s);
  }
  el.appendChild(frag);
  return Array.from(el.querySelectorAll('.digit'));
}

// Hanya angka (.raksasa-nomor) yang dipecah per digit; label loket
// (.raksasa-loket) dan pesan kosong (.raksasa-kosong) dibiarkan sebagai teks
// biasa agar tidak ikut membesar dan melebarkan halaman.
function targetNomor(el) {
  return el.querySelector('.raksasa-nomor');
}

export function init(ctx) {
  const { gsap, lite } = ctx;
  const el = document.getElementById('nomor-raksasa');
  if (!el) return;

  el.classList.add('nomor-raksasa');
  el.setAttribute('aria-live', 'polite');
  let target = targetNomor(el);
  let digits = target ? pecahDigit(target) : [];

  // entrance: flip masuk saat pertama terlihat
  if (gsap && !lite) {
    gsap.set(digits, { rotationX: -90, opacity: 0 });
    const io = new IntersectionObserver(
      (entries, obs) => {
        if (entries.some((e) => e.isIntersecting)) {
          gsap.to(digits, {
            rotationX: 0,
            opacity: 1,
            duration: 0.5,
            stagger: 0.06,
            ease: 'back.out(1.6)',
            overwrite: true,
          });
          obs.disconnect();
        }
      },
      { threshold: 0.4 }
    );
    io.observe(el);
    var cleanupIo = () => io.disconnect();
  }

  const ganti = (nomorBaru) => {
    if (!nomorBaru || el.dataset.nomor === nomorBaru) return;
    el.dataset.nomor = nomorBaru;
    const terapkan = () => {
      const t = targetNomor(el);
      if (!t) return;
      t.textContent = nomorBaru;
      digits = pecahDigit(t);
    };
    if (!gsap || lite) {
      terapkan();
      return;
    }
    const tl = gsap.timeline();
    tl.to(digits, {
      rotationX: 90,
      opacity: 0,
      duration: 0.22,
      stagger: 0.04,
      ease: 'power2.in',
    }).add(() => {
      terapkan();
      gsap.set(digits, { rotationX: -90, opacity: 0 });
    }).to(digits, {
      rotationX: 0,
      opacity: 1,
      duration: 0.45,
      stagger: 0.06,
      ease: 'back.out(1.7)',
    });
  };

  const onCalled = (ev) => {
    const nomor = ev.detail?.nomor;
    if (nomor) ganti(String(nomor));
  };
  window.addEventListener('antre:called', onCalled);

  return () => {
    window.removeEventListener('antre:called', onCalled);
    if (typeof cleanupIo === 'function') cleanupIo();
  };
}
