/**
 * Data contoh ANTRESEHAT — papan antrean digital puskesmas.
 *
 * Semua data di sini adalah CONTOH untuk demo (R7/R10). Copy yang tampil
 * selalu berlabel "contoh" — jangan dikira data puskesmas sungguhan, ya Bu…
 */

export interface Loket {
  /** id internal loket */
  id: 'L1' | 'L2' | 'L3';
  /** nama loket */
  nama: string;
  /** kode nomor antrean */
  kode: 'A' | 'B' | 'C';
}

export const LOKET: Loket[] = [
  { id: 'L1', nama: 'Pendaftaran', kode: 'A' },
  { id: 'L2', nama: 'Poli Umum', kode: 'B' },
  { id: 'L3', nama: 'Gigi & KIA', kode: 'C' },
];

export const NAMA_PUSKESMAS = 'PUSKESMAS MEKAR CONTOH';

/** Jam operasional contoh. */
export const JAM_OPERASIONAL =
  'Senin–Jumat 07.30–14.00 · Sabtu 07.30–11.00 (contoh)';

/** 5 teks marquee pengumuman (contoh). Di-render ke .marquee-track. */
export const MARQUEE: string[] = [
  'BAWA KTP/KK YA, BU… JANGAN SAMPAI KETINGGALAN (contoh)',
  'DATANG 10 MENIT SEBELUM DIPANGGIL, BIAR NGGAK KELEWAT (contoh)',
  'LOKET 2 POLI UMUM DIBUKA — SILAKAN AMBIL NOMOR B (contoh)',
  'NOMOR YANG TERLEWAT BISA DIAMBIL LAGI, JANGAN PANIK (contoh)',
  'SABTU TUTUP SIANG — SENIN BUKA LAGI JAM 07.30 (contoh)',
];

/** 4 langkah ambil nomor (contoh). Dipakai widget Steps. */
export const LANGKAH: Array<{ title: string; description: string }> = [
  {
    title: 'Pilih loket',
    description:
      'Puskesmas Mekar Contoh punya 3 loket: Pendaftaran (A), Poli Umum (B), Gigi & KIA (C). Ketuk loket tujuan, Bu…',
  },
  {
    title: 'Dapat karcis digital',
    description:
      'Nomor langsung keluar di layar HP, lengkap dengan perkiraan giliran. Screenshot boleh, biar aman.',
  },
  {
    title: 'Pantau papan dari rumah',
    description:
      'Buka tab Papan kapan saja — nomor yang dipanggil naik seperti air pasang. Nggak perlu nongkrong di puskesmas.',
  },
  {
    title: 'Datang saat dipanggil',
    description:
      'Begitu nomor Bapak/Ibu berkedip di papan, segera merapat ke loket. Bawa KTP/KK ya.',
  },
];

/** 4 FAQ pasien & nakes (contoh). Dipakai widget FAQs. */
export const FAQ: Array<{ title: string; description: string }> = [
  {
    title: 'Nomor saya hilang, gimana?',
    description:
      'Yah, nomornya nggak ketemu, Bu… coba cek lagi ya. Karcis tersimpan di browser HP ini — kalau kehapus, ambil nomor baru di tab Ambil. Ini data contoh untuk demo, jadi santai saja.',
  },
  {
    title: 'Telat dipanggil, hangus?',
    description:
      'Tenang, Bu. Nomor yang terlewat dicatat nakes dan bisa dipanggil ulang — datang saja ke loketnya, sebutkan nomornya.',
  },
  {
    title: 'Bisa ganti loket?',
    description:
      'Bisa, Bu. Ambil nomor baru di loket yang dituju. Satu HP boleh pegang beberapa nomor, asal sabar nunggunya.',
  },
  {
    title: 'Data saya disimpan di mana?',
    description:
      'Cuma di browser HP Bapak/Ibu sendiri, nggak dikirim ke mana-mana. Versi demo ini pakai data contoh, bukan data pasien sungguhan.',
  },
];

/** Estimasi tunggu contoh: posisi × 4 menit. */
export const ESTIMASI_PER_POSISI_MENIT = 4;

export const LABEL_CONTOH = 'data contoh';
