-- CreateEnum
CREATE TYPE "StatusAnalisis" AS ENUM ('MENUNGGU', 'DIPROSES', 'SELESAI', 'GAGAL');

-- CreateEnum
CREATE TYPE "CakupanDokumen" AS ENUM ('BAB1_LENGKAP', 'LATAR_BELAKANG');

-- CreateEnum
CREATE TYPE "StatusRekomendasi" AS ENUM ('DITERIMA', 'TIDAK_SINKRON', 'DITOLAK');

-- CreateEnum
CREATE TYPE "JenisKeputusan" AS ENUM ('DISETUJUI', 'REVISI', 'DITOLAK');

-- CreateTable
CREATE TABLE "pengajuan" (
    "id" TEXT NOT NULL,
    "namaMahasiswa" TEXT NOT NULL,
    "nim" TEXT NOT NULL,
    "judul" TEXT NOT NULL,
    "pembimbing" TEXT,
    "namaFile" TEXT NOT NULL,
    "pathFile" TEXT NOT NULL,
    "teksDokumen" TEXT,
    "cakupan" "CakupanDokumen",
    "statusAnalisis" "StatusAnalisis" NOT NULL DEFAULT 'MENUNGGU',
    "pesanGagal" TEXT,
    "skorTotal" INTEGER,
    "rekomendasi" "StatusRekomendasi",
    "modelVersi" TEXT,
    "promptVersi" TEXT,
    "dibuatPada" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "diperbaruiPada" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pengajuan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "skor_kriteria" (
    "id" TEXT NOT NULL,
    "pengajuanId" TEXT NOT NULL,
    "kode" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "bobot" INTEGER NOT NULL,
    "bobotEfektif" DOUBLE PRECISION,
    "dinilai" BOOLEAN NOT NULL DEFAULT true,
    "skor" INTEGER,
    "kutipan" JSONB NOT NULL DEFAULT '[]',
    "saran" TEXT,

    CONSTRAINT "skor_kriteria_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "keputusan" (
    "id" TEXT NOT NULL,
    "pengajuanId" TEXT NOT NULL,
    "keputusan" "JenisKeputusan" NOT NULL,
    "catatan" TEXT,
    "diputuskanPada" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "keputusan_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "pengajuan_dibuatPada_idx" ON "pengajuan"("dibuatPada");

-- CreateIndex
CREATE UNIQUE INDEX "skor_kriteria_pengajuanId_kode_key" ON "skor_kriteria"("pengajuanId", "kode");

-- CreateIndex
CREATE UNIQUE INDEX "keputusan_pengajuanId_key" ON "keputusan"("pengajuanId");

-- AddForeignKey
ALTER TABLE "skor_kriteria" ADD CONSTRAINT "skor_kriteria_pengajuanId_fkey" FOREIGN KEY ("pengajuanId") REFERENCES "pengajuan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "keputusan" ADD CONSTRAINT "keputusan_pengajuanId_fkey" FOREIGN KEY ("pengajuanId") REFERENCES "pengajuan"("id") ON DELETE CASCADE ON UPDATE CASCADE;
