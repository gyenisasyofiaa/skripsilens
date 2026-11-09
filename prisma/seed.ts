import { readFileSync } from "node:fs";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import type { StatusRekomendasi } from "../src/types/analisis";

process.loadEnvFile(".env.local");

type ItemManifest = {
  file: string;
  namaMahasiswa: string;
  nim: string;
  judul: string;
  expectedRekomendasi: StatusRekomendasi;
  expectedCakupan: "BAB1_LENGKAP" | "LATAR_BELAKANG";
};

type HasilContoh = {
  skorTotal: number;
  keputusan?: "DISETUJUI" | "REVISI" | "DITOLAK";
};

const PENANDA_SEED = "seed";

const HASIL_CONTOH: Record<string, HasilContoh> = {
  "2101027": { skorTotal: 84, keputusan: "DISETUJUI" },
  "2101011": { skorTotal: 67 },
  "2101042": { skorTotal: 41 },
  "2101055": { skorTotal: 58, keputusan: "REVISI" },
  "2101034": { skorTotal: 79 },
  "2101068": { skorTotal: 82 },
  "2101073": { skorTotal: 56 },
};

async function main() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL belum diisi di file .env.local");
  }

  const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString }) });

  try {
    const manifest: ItemManifest[] = JSON.parse(
      readFileSync("samples/bab1/manifest.json", "utf-8"),
    );

    const terhapus = await prisma.pengajuan.deleteMany({
      where: { modelVersi: PENANDA_SEED },
    });
    console.log(`Menghapus ${terhapus.count} data contoh lama.`);

    let jumlahDibuat = 0;

    for (const item of manifest) {
      const hasil = HASIL_CONTOH[item.nim];
      if (!hasil) {
        console.warn(`Dilewati: ${item.file} (hasil contoh untuk NIM ${item.nim} tidak ada).`);
        continue;
      }

      await prisma.pengajuan.create({
        data: {
          namaMahasiswa: item.namaMahasiswa,
          nim: item.nim,
          judul: item.judul,
          namaFile: item.file,
          pathFile: `samples/bab1/${item.file}`,
          cakupan: item.expectedCakupan,
          statusAnalisis: "SELESAI",
          skorTotal: hasil.skorTotal,
          rekomendasi: item.expectedRekomendasi,
          modelVersi: PENANDA_SEED,
          promptVersi: PENANDA_SEED,
          keputusan: hasil.keputusan ? { create: { keputusan: hasil.keputusan } } : undefined,
        },
      });

      jumlahDibuat += 1;
      console.log(`✓ ${item.namaMahasiswa} (${item.expectedRekomendasi})`);
    }

    console.log(`Selesai: ${jumlahDibuat} pengajuan contoh dibuat.`);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});