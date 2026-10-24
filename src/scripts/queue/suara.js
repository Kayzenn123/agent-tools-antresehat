// suara.js — bunyi "ting" WebAudio (oscillator 880->1320Hz, 0.6 dtk).
// HANYA dipanggil setelah aksi panggil nakes (post-interaksi), jadi aman
// dari kebijakan autoplay. 0 byte file audio.

let ctx = null;

function dapatkanCtx() {
  const AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) return null;
  if (!ctx) {
    try {
      ctx = new AC();
    } catch (err) {
      return null;
    }
  }
  if (ctx.state === 'suspended') {
    ctx.resume().catch(() => {});
  }
  return ctx;
}

export function mainkanTing() {
  const ac = dapatkanCtx();
  if (!ac) return false;
  try {
    const t0 = ac.currentTime;
    const osc = ac.createOscillator();
    const gain = ac.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, t0);
    osc.frequency.exponentialRampToValueAtTime(1320, t0 + 0.6);
    gain.gain.setValueAtTime(0.0001, t0);
    gain.gain.exponentialRampToValueAtTime(0.5, t0 + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.6);
    osc.connect(gain);
    gain.connect(ac.destination);
    osc.start(t0);
    osc.stop(t0 + 0.65);
    return true;
  } catch (err) {
    return false;
  }
}
