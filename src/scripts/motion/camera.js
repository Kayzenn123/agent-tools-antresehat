/**
 * motion/camera.js — gerak A: kamera "terbang" di sheet PAPAN.
 * #sheet-papan di-pin ringan: scale 1 -> 1.5 + rotate 1.2deg + translateY,
 * scrub mengikuti scroll (GSAP ScrollTrigger).
 * MODE RINGAN / tanpa GSAP: no-op (layout statis).
 * Pause saat offscreen: ScrollTrigger otomatis; toggle via ctx.nyala().
 */

export function init(ctx) {
  const { gsap, ScrollTrigger, lite } = ctx;
  if (!gsap || !ScrollTrigger || lite) return;

  const target = document.getElementById('sheet-papan');
  if (!target) return;

  const tween = gsap.to(target, {
    scale: 1.5,
    rotation: 1.2,
    yPercent: -6,
    transformOrigin: '50% 30%',
    ease: 'none',
    scrollTrigger: {
      trigger: target,
      start: 'top 80%',
      end: 'bottom 20%',
      scrub: 0.6,
      // pin ringan: tidak pakai pin:true agar layout spreadsheet tidak patah;
      // efek "menyelam" cukup dari scale+rotate+translate.
    },
  });

  return () => {
    tween.scrollTrigger?.kill();
    tween.kill();
    gsap.set(target, { clearProps: 'transform' });
  };
}
