/**
 * motion/marquee.js — gerak B: 2 band marquee diagonal.
 * - Band A & B jalan berlawanan arah (arah via CSS animation-direction).
 * - skew mengikuti scroll velocity: --skew di tiap .marquee-band
 *   (basis -8deg dari tokens.css, tambah hingga +-6deg sesuai kecepatan).
 * - Tombol [data-marquee-pause]: toggle .marquee-jeda + aria-pressed (WCAG 2.2.2).
 * - MODE RINGAN: track statis (tambah .marquee-jeda), skew mati.
 * - Pause saat offscreen via IntersectionObserver.
 */

export function init(ctx) {
  const { lite } = ctx;
  const bands = Array.from(document.querySelectorAll('.marquee-band'));
  if (!bands.length) return;

  const root = bands[0].closest('.marquee') || bands[0].parentElement;
  const jedaTombols = Array.from(document.querySelectorAll('[data-marquee-pause]'));
  let jeda = false;

  const setJeda = (v) => {
    jeda = v;
    root?.classList.toggle('marquee-jeda', v);
    for (const b of jedaTombols) {
      b.setAttribute('aria-pressed', String(v));
      b.textContent = v ? 'Jalan' : 'Jeda';
    }
  };

  for (const b of jedaTombols) {
    b.setAttribute('aria-pressed', 'false');
    b.addEventListener('click', () => setJeda(!jeda));
  }

  const cleanups = [() => setJeda(false)];

  if (lite) {
    setJeda(true); // marquee statis di MODE RINGAN
    return () => cleanups.forEach((fn) => fn());
  }

  // --- skew mengikuti scroll velocity (hanya transform via CSS var) ---
  let lastY = window.scrollY;
  let skew = -8;
  let raf = 0;
  let terlihat = true;

  const io = new IntersectionObserver(
    (entries) => {
      terlihat = entries.some((e) => e.isIntersecting);
    },
    { threshold: 0 }
  );
  if (root) io.observe(root);
  cleanups.push(() => io.disconnect());

  const loop = () => {
    raf = requestAnimationFrame(loop);
    if (!terlihat || jeda || document.hidden) {
      lastY = window.scrollY;
      return;
    }
    const y = window.scrollY;
    const v = y - lastY; // px per frame
    lastY = y;
    // target skew: -8deg +- hingga 6deg mengikuti kecepatan
    const target = -8 + Math.max(-6, Math.min(6, v * 0.35));
    skew += (target - skew) * 0.12; // lerp halus
    if (Math.abs(skew - target) > 0.05) {
      for (const band of bands) band.style.setProperty('--skew', `${skew.toFixed(2)}deg`);
    }
  };
  raf = requestAnimationFrame(loop);
  cleanups.push(() => cancelAnimationFrame(raf));

  return () => cleanups.forEach((fn) => fn());
}
