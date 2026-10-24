/**
 * motion/reveal.js — gerak E: transisi antar sheet = morph blob gelombang.
 * Dengarkan 'antre:show-sheet' (agen B): overlay .wipe-gelombang menyapu
 * naik dengan tepi atas BERGELOMBANG (clip-path polygon, titik-titik
 * gelombang dihitung JS), lalu menyapu keluar. Hanya clip-path.
 * MODE RINGAN / tanpa GSAP: no-op.
 */

function polygonGelombang(n, fase, yBase, amp) {
  // titik: kiri-bawah, kanan-bawah, lalu tepi atas bergelombang kanan->kiri
  const pts = ['0% 100%', '100% 100%'];
  for (let i = n; i >= 0; i--) {
    const x = (i / n) * 100;
    const y = yBase + amp * Math.sin((i / n) * Math.PI * 2 + fase);
    pts.push(`${x.toFixed(2)}% ${y.toFixed(2)}%`);
  }
  return `polygon(${pts.join(', ')})`;
}

export function init(ctx) {
  const { gsap, lite } = ctx;
  if (!gsap || lite) return;

  let wipe = document.querySelector('.wipe-gelombang');
  if (!wipe) {
    wipe = document.createElement('div');
    wipe.className = 'wipe-gelombang';
    wipe.setAttribute('aria-hidden', 'true');
    document.body.appendChild(wipe);
  }

  const N = 16;
  let sibuk = false;

  const sapu = () => {
    if (sibuk) return;
    sibuk = true;
    const o = { p: 0 };
    gsap.set(wipe, { visibility: 'visible' });
    gsap
      .timeline({ onComplete: () => {
        gsap.set(wipe, { visibility: 'hidden' });
        sibuk = false;
      }})
      // masuk: gelombang naik menutupi layar (yBase 110 -> -10)
      .to(o, {
        p: 1,
        duration: 0.45,
        ease: 'power2.inOut',
        onUpdate: () => {
          const y = 110 - o.p * 125;
          wipe.style.clipPath = polygonGelombang(N, o.p * 2.2, y, 7);
        },
      })
      // keluar: gelombang terus naik meninggalkan layar (yBase -10 -> -120)
      .to(o, {
        p: 2,
        duration: 0.5,
        ease: 'power2.inOut',
        onUpdate: () => {
          const y = -15 - (o.p - 1) * 110;
          wipe.style.clipPath = polygonGelombang(N, o.p * 2.2, y, 7);
        },
      });
  };

  window.addEventListener('antre:show-sheet', sapu);
  return () => window.removeEventListener('antre:show-sheet', sapu);
}
