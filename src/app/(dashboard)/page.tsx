import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Beranda",
};

const SECTIONS = [
  {
    id: "ringkasan",
    title: "Ringkasan",
    description: "Jumlah pengajuan, yang menunggu keputusan, dan sebaran status rekomendasi.",
  },
  {
    id: "terbaru",
    title: "Pengajuan Terbaru",
    description: "Daftar pengajuan judul terakhir beserta skor dan status rekomendasinya.",
  },
  {
    id: "panduan",
    title: "Panduan",
    description: "Tiga langkah menilai judul: unggah Bab 1, tunggu hasil analisis, lalu putuskan.",
  },
];

export default function BerandaPage() {
  return (
    <div className="flex flex-col gap-10">
      <header className="flex flex-col gap-1.5">
        <h1 className="text-2xl font-bold tracking-tight text-neutral-900 sm:text-3xl">
          Selamat datang, Kaprodi
        </h1>
        <p className="text-[15px] text-neutral-600">
          Pantau pengajuan judul skripsi dan tinjau rekomendasi sistem sebelum memutuskan.
        </p>
      </header>

      {SECTIONS.map((section) => (
        <section
          key={section.id}
          id={section.id}
          aria-labelledby={`${section.id}-title`}
          className="flex min-h-[60vh] flex-col gap-2 rounded-xl border border-neutral-200 bg-white p-6"
        >
          <h2 id={`${section.id}-title`} className="text-lg font-semibold text-neutral-900">
            {section.title}
          </h2>
          <p className="text-sm text-neutral-600">{section.description}</p>
        </section>
      ))}
    </div>
  );
}