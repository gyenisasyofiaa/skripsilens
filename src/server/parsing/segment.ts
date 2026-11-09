import type { CakupanDokumen } from "@/generated/prisma/enums";

export type KodeBagian = "LATAR_BELAKANG" | "RUMUSAN_MASALAH" | "TUJUAN" | "BATASAN" | "MANFAAT";

export type HasilSegmentasi = {
  bagian: Partial<Record<KodeBagian, string>>;
  cakupan: CakupanDokumen | null;
};

const MAKS_PANJANG_JUDUL = 80;
const MIN_PANJANG_BAGIAN = 100;

const AWALAN = String.raw`(?:(?:\d+(?:\.\d+)*|[A-Za-z]|[IVX]+)[.)]?\s+)?`;

function pola(isi: string) {
  return new RegExp(`^${AWALAN}(?:${isi})$`, "i");
}

const POLA_BAGIAN: [KodeBagian, RegExp][] = [
  ["LATAR_BELAKANG", pola(String.raw`latar\s+belakang(?:\s+masalah)?`)],
  ["RUMUSAN_MASALAH", pola(String.raw`(?:rumusan|perumusan)\s+masalah`)],
  ["TUJUAN", pola(String.raw`tujuan(?:\s+penelitian)?`)],
  ["BATASAN", pola(String.raw`(?:batasan|pembatasan)\s+masalah|ruang\s+lingkup(?:\s+penelitian)?`)],
  ["MANFAAT", pola(String.raw`manfaat(?:\s+penelitian)?`)],
];

const POLA_JUDUL_LAIN = pola(
  String.raw`identifikasi\s+masalah|sistematika\s+penulisan|hipotesis(?:\s+penelitian)?|definisi\s+operasional|metode\s+penelitian|tinjauan\s+pustaka`,
);
const POLA_BAB = /^BAB\s+[IVX\d]+\b/i;
const POLA_SUBBAB_BERNOMOR = /^\d{1,2}\.\d{1,2}(?:\.\d{1,2})*\.?\s+[A-Za-z][^.?!]{2,60}$/;

function kenaliJudul(baris: string): KodeBagian | "LAINNYA" | null {
  if (baris.length > MAKS_PANJANG_JUDUL) return null;

  for (const [kode, polaJudul] of POLA_BAGIAN) {
    if (polaJudul.test(baris)) return kode;
  }

  if (POLA_BAB.test(baris) || POLA_JUDUL_LAIN.test(baris) || POLA_SUBBAB_BERNOMOR.test(baris)) {
    return "LAINNYA";
  }

  return null;
}

export function segmentasiBab1(teks: string): HasilSegmentasi {
  const daftarBaris = teks
    .split("\n")
    .map((baris) => baris.trim())
    .filter(Boolean);

  const bagian: Partial<Record<KodeBagian, string>> = {};
  let bagianAktif: KodeBagian | null = null;
  let isiAktif: string[] = [];

  function simpanBagianAktif() {
    if (!bagianAktif) return;
    const isi = isiAktif.join(" ").replace(/\s+/g, " ").trim();
    const isiSebelumnya = bagian[bagianAktif] ?? "";
    if (isi.length >= MIN_PANJANG_BAGIAN && isi.length > isiSebelumnya.length) {
      bagian[bagianAktif] = isi;
    }
  }

  for (const baris of daftarBaris) {
    const judul = kenaliJudul(baris);

    if (judul !== null) {
      simpanBagianAktif();
      bagianAktif = judul === "LAINNYA" ? null : judul;
      isiAktif = [];
      continue;
    }

    if (bagianAktif) isiAktif.push(baris);
  }
  simpanBagianAktif();

  let cakupan: CakupanDokumen | null = null;
  if (bagian.LATAR_BELAKANG) {
    cakupan = bagian.RUMUSAN_MASALAH && bagian.TUJUAN ? "BAB1_LENGKAP" : "LATAR_BELAKANG";
  }

  return { bagian, cakupan };
}