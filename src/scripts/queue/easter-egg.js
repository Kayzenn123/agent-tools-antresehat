// easter-egg.js — ketuk elemen [data-easter] (stempel papan) 5x dalam 4 detik
// -> body.classList 'pasang-purnama' selama 10 detik + dispatch 'antre:purnama'.
// Agen C memakai event itu untuk mengganti marquee jadi "PURNAMA TIBA…".

const KETUKAN_DIBUTUHKAN = 5;
const JENDELA_MS = 4000;
const DURASI_MS = 10000;
const KELAS = 'pasang-purnama';

export function initEasterEgg() {
  const target = document.querySelectorAll('[data-easter]');
  if (!target.length) return;
  let ketukan = 0;
  let timerJendela = null;
  let aktif = false;

  function reset() {
    ketukan = 0;
    if (timerJendela) {
      clearTimeout(timerJendela);
      timerJendela = null;
    }
  }

  target.forEach((elm) => {
    elm.addEventListener('click', () => {
      if (aktif) return;
      ketukan++;
      if (!timerJendela) timerJendela = setTimeout(reset, JENDELA_MS);
      if (ketukan >= KETUKAN_DIBUTUHKAN) {
        reset();
        aktif = true;
        document.body.classList.add(KELAS);
        window.dispatchEvent(new CustomEvent('antre:purnama'));
        setTimeout(() => {
          document.body.classList.remove(KELAS);
          aktif = false;
        }, DURASI_MS);
      }
    });
  });
}
