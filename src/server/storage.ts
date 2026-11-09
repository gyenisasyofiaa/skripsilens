import "server-only";
import { randomUUID } from "node:crypto";
import { mkdir, unlink, writeFile } from "node:fs/promises";
import path from "node:path";

const FOLDER_UNGGAHAN = "storage/uploads";
const MAKS_UKURAN = 10 * 1024 * 1024;
const TANDA_PDF = "%PDF-";

export class BerkasTidakValidError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "BerkasTidakValidError";
  }
}

export function pathAbsolut(pathRelatif: string) {
  return path.join(process.cwd(), pathRelatif);
}

export async function simpanPdf(file: File) {
  if (file.size === 0) {
    throw new BerkasTidakValidError("File kosong.");
  }
  if (file.size > MAKS_UKURAN) {
    throw new BerkasTidakValidError("Ukuran file maksimal 10 MB.");
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const awalFile = buffer.subarray(0, TANDA_PDF.length).toString("latin1");

  if (awalFile !== TANDA_PDF) {
    throw new BerkasTidakValidError("File bukan PDF yang valid.");
  }

  await mkdir(pathAbsolut(FOLDER_UNGGAHAN), { recursive: true });

  const pathFile = `${FOLDER_UNGGAHAN}/${randomUUID()}.pdf`;
  await writeFile(pathAbsolut(pathFile), buffer);

  return { pathFile, buffer };
}

export async function hapusFile(pathFile: string) {
  await unlink(pathAbsolut(pathFile)).catch(() => {});
}