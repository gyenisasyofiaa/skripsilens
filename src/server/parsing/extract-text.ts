import "server-only";
import { extractText, getDocumentProxy } from "unpdf";
import { BerkasTidakValidError } from "@/server/storage";

const MAKS_HALAMAN = 40;
const MIN_KARAKTER_PER_HALAMAN = 200;
const POLA_NOMOR_HALAMAN = /^(?:-\s*)?(?:\d{1,3}|[ivxlcdm]{1,6})(?:\s*-)?$/i;

function bersihkanHalaman(teks: string) {
  return teks
    .replace(/\r/g, "")
    .split("\n")
    .map((baris) => baris.replace(/[ \t]+/g, " ").trim())
    .filter((baris) => baris.length > 0 && !POLA_NOMOR_HALAMAN.test(baris))
    .join("\n");
}

export async function ekstrakTeksPdf(buffer: Buffer) {
  let halaman: string[];
  let jumlahHalaman: number;

  try {
    const pdf = await getDocumentProxy(new Uint8Array(buffer));
    jumlahHalaman = pdf.numPages;

    if (jumlahHalaman > MAKS_HALAMAN) {
      throw new BerkasTidakValidError(
        `Dokumen terlalu panjang (${jumlahHalaman} halaman). Maksimal ${MAKS_HALAMAN} halaman untuk Bab 1.`,
      );
    }

    const hasil = await extractText(pdf, { mergePages: false });
    halaman = hasil.text;
  } catch (error) {
    if (error instanceof BerkasTidakValidError) throw error;
    throw new BerkasTidakValidError(
      "PDF tidak dapat dibaca. Pastikan file tidak rusak dan tidak dikunci password.",
    );
  }

  const teks = halaman.map(bersihkanHalaman).filter(Boolean).join("\n\n").trim();

  if (teks.length < jumlahHalaman * MIN_KARAKTER_PER_HALAMAN) {
    throw new BerkasTidakValidError(
      "PDF tidak berisi teks yang bisa dibaca. Unggah PDF hasil ekspor dari Word, bukan hasil scan.",
    );
  }

  return { teks, jumlahHalaman };
}