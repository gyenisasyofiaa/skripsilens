import type { Metadata } from "next";
import { connection } from "next/server";
import StatusBadge from "@/components/analisis/StatusBadge";
import { prisma } from "@/server/db/client";
import type { RingkasanPengajuan, StatusKeputusan } from "@/types/analisis";

export const metadata: Metadata = {
  title: "Beranda",
};

const JUMLAH_TERBARU = 10;

const KEPUTUSAN_STYLE: Record<StatusKeputusan, { label: string; className: string }> = {
  MENUNGGU: { label: "Menunggu", className: "text-neutral-600" },
  DISETUJUI: { label: "Disetujui", className: "font-medium text-green-800" },
  REVISI: { label: "Revisi", className: "font-medium text-amber-800" },
  DITOLAK: { label: "Ditolak", className: "font-medium text-red-800" },
};

const LANGKAH_PANDUAN = [
  {
    judul: "Isi data & unggah Bab 1",
    deskripsi: "Masukkan nama, NIM, dan judul yang diajukan, lalu unggah Bab 1 dalam format PDF.",
  },
  {
    judul: "Sistem menganalisis",
    deskripsi: "Teks dipotong per subbab, dinilai per kriteria, dan setiap kutipan bukti dicocokkan ulang dengan isi dokumen.",
  },
  {
    judul: "Tinjau & putuskan",
    deskripsi: "Baca skor, bukti, dan saran. Rekomendasi hanya alat bantu; keputusan resmi tetap Anda tetapkan dengan satu klik.",
  },
];

const KOLOM_TABEL = ["Mahasiswa", "Judul", "Skor", "Rekomendasi", "Keputusan"];

async function ambilDataBeranda() {
  const [total, menunggu, diterima, tidakDiterima, terbaru] = await Promise.all([
    prisma.pengajuan.count(),
    prisma.pengajuan.count({
      where: { statusAnalisis: "SELESAI", keputusan: { is: null } },
    }),
    prisma.pengajuan.count({ where: { rekomendasi: "DITERIMA" } }),
    prisma.pengajuan.count({
      where: { rekomendasi: { in: ["TIDAK_SINKRON", "DITOLAK"] } },
    }),
    prisma.pengajuan.findMany({
      where: { statusAnalisis: "SELESAI" },
      orderBy: { dibuatPada: "desc" },
      take: JUMLAH_TERBARU,
      select: {
        id: true,
        namaMahasiswa: true,
        nim: true,
        judul: true,
        skorTotal: true,
        rekomendasi: true,
        keputusan: { select: { keputusan: true } },
      },
    }),
  ]);

  const daftar: RingkasanPengajuan[] = terbaru.flatMap((p) =>
    p.skorTotal !== null && p.rekomendasi !== null
      ? [
          {
            id: p.id,
            namaMahasiswa: p.namaMahasiswa,
            nim: p.nim,
            judul: p.judul,
            skorTotal: p.skorTotal,
            rekomendasi: p.rekomendasi,
            keputusan: p.keputusan?.keputusan ?? "MENUNGGU",
          },
        ]
      : [],
  );

  return {
    ringkasan: [
      { label: "Total pengajuan", nilai: total, className: "text-neutral-900" },
      { label: "Menunggu keputusan", nilai: menunggu, className: "text-neutral-900" },
      { label: "Rekomendasi diterima", nilai: diterima, className: "text-green-800" },
      { label: "Tidak sinkron / ditolak", nilai: tidakDiterima, className: "text-amber-800" },
    ],
    daftar,
  };
}

export default async function BerandaPage() {
  await connection();
  const { ringkasan, daftar } = await ambilDataBeranda();

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

      <section id="ringkasan" aria-labelledby="ringkasan-title" className="flex flex-col gap-4">
        <h2 id="ringkasan-title" className="text-lg font-semibold text-neutral-900">
          Ringkasan
        </h2>
        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          {ringkasan.map((item) => (
            <div
              key={item.label}
              className="flex flex-col gap-2 rounded-xl border border-neutral-200 bg-white p-4 sm:p-5"
            >
              <span className="text-[13px] text-neutral-600">{item.label}</span>
              <span className={`text-2xl font-bold sm:text-3xl ${item.className}`}>{item.nilai}</span>
            </div>
          ))}
        </div>
      </section>

      <section id="terbaru" aria-labelledby="terbaru-title" className="flex flex-col gap-4">
        <h2 id="terbaru-title" className="text-lg font-semibold text-neutral-900">
          Pengajuan Terbaru
        </h2>

        {daftar.length === 0 ? (
          <div className="rounded-xl border border-dashed border-neutral-300 bg-white px-6 py-10 text-center">
            <p className="text-sm font-semibold text-neutral-900">Belum ada pengajuan</p>
            <p className="mt-1 text-sm text-neutral-600">
              Pengajuan yang selesai dianalisis akan tampil di sini.
            </p>
          </div>
        ) : (
          <>
            <ul className="flex flex-col gap-3 md:hidden">
              {daftar.map((p) => (
                <li
                  key={p.id}
                  className="flex flex-col gap-2.5 rounded-xl border border-neutral-200 bg-white p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-neutral-900">{p.namaMahasiswa}</p>
                      <p className="text-xs text-neutral-600">{p.nim}</p>
                    </div>
                    <span className="text-sm font-bold text-neutral-900">
                      {p.skorTotal}
                      <span className="font-normal text-neutral-600">/100</span>
                    </span>
                  </div>
                  <p className="text-[13px] leading-relaxed text-neutral-700">{p.judul}</p>
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <StatusBadge status={p.rekomendasi} />
                    <span className={`text-xs ${KEPUTUSAN_STYLE[p.keputusan].className}`}>
                      Keputusan: {KEPUTUSAN_STYLE[p.keputusan].label}
                    </span>
                  </div>
                </li>
              ))}
            </ul>

            <div className="hidden overflow-x-auto rounded-xl border border-neutral-200 bg-white md:block">
              <table className="w-full min-w-[720px] text-left text-sm">
                <thead className="bg-neutral-50">
                  <tr>
                    {KOLOM_TABEL.map((kolom) => (
                      <th
                        key={kolom}
                        scope="col"
                        className="border-b border-neutral-200 px-4 py-3 text-xs font-semibold text-neutral-600"
                      >
                        {kolom}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {daftar.map((p) => (
                    <tr key={p.id}>
                      <td className="px-4 py-3.5 align-top">
                        <p className="font-semibold text-neutral-900">{p.namaMahasiswa}</p>
                        <p className="text-xs text-neutral-600">{p.nim}</p>
                      </td>
                      <td className="max-w-sm px-4 py-3.5 align-top text-neutral-700">{p.judul}</td>
                      <td className="px-4 py-3.5 align-top font-semibold text-neutral-900">{p.skorTotal}</td>
                      <td className="px-4 py-3.5 align-top">
                        <StatusBadge status={p.rekomendasi} />
                      </td>
                      <td className={`px-4 py-3.5 align-top ${KEPUTUSAN_STYLE[p.keputusan].className}`}>
                        {KEPUTUSAN_STYLE[p.keputusan].label}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </section>

      <section id="panduan" aria-labelledby="panduan-title" className="flex flex-col gap-4">
        <h2 id="panduan-title" className="text-lg font-semibold text-neutral-900">
          Panduan
        </h2>
        <ol className="grid gap-4 sm:grid-cols-3">
          {LANGKAH_PANDUAN.map((langkah, index) => (
            <li
              key={langkah.judul}
              className="flex flex-col gap-2.5 rounded-xl border border-neutral-200 bg-white p-5"
            >
              <span className="flex size-8 items-center justify-center rounded-full bg-neutral-100 text-sm font-bold text-neutral-900">
                {index + 1}
              </span>
              <h3 className="text-[15px] font-semibold text-neutral-900">{langkah.judul}</h3>
              <p className="text-sm leading-relaxed text-neutral-600">{langkah.deskripsi}</p>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}