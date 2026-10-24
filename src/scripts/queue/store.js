// store.js — state antrean ANTRESEHAT di localStorage (versioned).
// Skema v1:
// { v:1,
//   loket:{ A:{antre:[{n,nama,ts,status}], dipanggil:null, selesai:0, lewat:0}, B:{...}, C:{...} },
//   suara:true, karcisSaya:[], terakhirDipanggil:{nomor,loket,ts}|null }

export const STORE_KEY = 'antresehat:v1';
export const LOKET_KEYS = ['A', 'B', 'C'];
export const STATUS_LIST = ['menunggu', 'dipanggil', 'selesai', 'lewat'];
const SAVE_DEBOUNCE_MS = 300;

export function loketKosong() {
  return { antre: [], dipanggil: null, selesai: 0, lewat: 0 };
}

export function defaultState() {
  const loket = {};
  for (const k of LOKET_KEYS) loket[k] = loketKosong();
  return { v: 1, loket, suara: true, karcisSaya: [], terakhirDipanggil: null };
}

function tiketValid(t) {
  return (
    t !== null && typeof t === 'object' &&
    typeof t.n === 'string' && /^[ABC]-\d{3}$/.test(t.n) &&
    typeof t.nama === 'string' &&
    typeof t.ts === 'number' && Number.isFinite(t.ts) &&
    STATUS_LIST.includes(t.status)
  );
}

function skemaValid(s) {
  if (s === null || typeof s !== 'object' || s.v !== 1) return false;
  if (s.loket === null || typeof s.loket !== 'object') return false;
  for (const k of LOKET_KEYS) {
    const l = s.loket[k];
    if (l === null || typeof l !== 'object') return false;
    if (!Array.isArray(l.antre) || !l.antre.every(tiketValid)) return false;
    if (typeof l.selesai !== 'number' || typeof l.lewat !== 'number') return false;
    if (l.dipanggil !== null && typeof l.dipanggil !== 'string') return false;
  }
  if (typeof s.suara !== 'boolean') return false;
  if (!Array.isArray(s.karcisSaya)) return false;
  return true;
}

// null = tidak ada simpanan ATAU simpanan rusak (fallback: panggil defaultState()).
export function loadState() {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!skemaValid(parsed)) {
      console.warn('[antresehat] data tersimpan rusak, mulai ulang dari awal.');
      return null;
    }
    return parsed;
  } catch (err) {
    console.warn('[antresehat] gagal membaca simpanan, mulai ulang dari awal.');
    return null;
  }
}

let timerSimpan = null;

function tulisSekarang(state) {
  try {
    localStorage.setItem(STORE_KEY, JSON.stringify(state));
  } catch (err) {
    console.warn('[antresehat] gagal menyimpan state.');
  }
}

// Simpan tiap mutasi, debounce 300ms.
export function saveState(state) {
  if (timerSimpan) clearTimeout(timerSimpan);
  timerSimpan = setTimeout(() => {
    timerSimpan = null;
    tulisSekarang(state);
  }, SAVE_DEBOUNCE_MS);
}

// Untuk momen kritis (reset hari): tulis sinkron.
export function saveStateNow(state) {
  if (timerSimpan) {
    clearTimeout(timerSimpan);
    timerSimpan = null;
  }
  tulisSekarang(state);
}
