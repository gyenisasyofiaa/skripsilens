import type { Metadata } from "next";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import StatusBadge from "@/components/analisis/StatusBadge";
import UploadForm from "@/components/analisis/UploadForm";
import type { StatusRekomendasi } from "@/types/analisis";

export const metadata: Metadata = {
  title: "Analisis Baru",
};

const KRITERIA = [
  { nama: "Judul – latar belakang", bobot: 25 },
  { nama: "Judul – rumusan masalah", bobot: 25 },
  { nama: "Rumusan – tujuan", bobot: 20 },
  { nama: "Objek & lokasi penelitian", bobot: 15 },
  { nama: "Kesesuaian metode", bobot: 15 },
];

const ATURAN: { status: StatusRekomendasi; syarat: string }[] = [
  { status: "DITERIMA", syarat: "Skor total minimal 75 dan tidak ada kriteria di bawah 50." },
  { status: "TIDAK_SINKRON", syarat: "Skor total 50–74, atau ada kriteria di bawah 50." },
  { status: "DITOLAK", syarat: "Skor total di bawah 50, atau dokumen bukan Bab 1." },
];

export default function AnalisisBaruPage() {
  return (
    <div className="flex flex-col gap-7">
      <header className="flex flex-col gap-1.5">
        <Link
          href="/"
          className="inline-flex min-h-8 items-center gap-1.5 self-start text-[13px] font-medium text-neutral-600 hover:text-neutral-900"
        >
          <ChevronLeft className="size-4" aria-hidden="true" />
          Kembali ke Beranda
        </Link>
        <h1 className="text-2xl font-bold tracking-tight text-neutral-900 sm:text-3xl">Analisis Baru</h1>
        <p className="text-[15px] text-neutral-600">
          Isi data singkat mahasiswa dan unggah Bab 1 untuk dinilai keselarasannya dengan judul.
        </p>
      </header>

      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <UploadForm />

        <aside aria-label="Informasi penilaian" className="flex flex-col gap-4">
          <section className="flex flex-col gap-3.5 rounded-xl border border-neutral-200 bg-white p-5 sm:p-6">
            <h2 className="text-[15px] font-semibold text-neutral-900">Kriteria yang dinilai</h2>
            <ul className="flex flex-col gap-3">
              {KRITERIA.map((kriteria) => (
                <li key={kriteria.nama} className="flex justify-between gap-3 text-sm text-neutral-800">
                  <span>{kriteria.nama}</span>
                  <span className="font-semibold text-neutral-600">{kriteria.bobot}%</span>
                </li>
              ))}
            </ul>
          </section>

          <section className="flex flex-col gap-3.5 rounded-xl border border-neutral-200 bg-white p-5 sm:p-6">
            <h2 className="text-[15px] font-semibold text-neutral-900">Aturan rekomendasi</h2>
            <ul className="flex flex-col gap-4">
              {ATURAN.map((aturan) => (
                <li key={aturan.status} className="flex flex-col items-start gap-1.5">
                  <StatusBadge status={aturan.status} />
                  <p className="text-[13px] leading-relaxed text-neutral-700">{aturan.syarat}</p>
                </li>
              ))}
            </ul>
          </section>
        </aside>
      </div>
    </div>
  );
}