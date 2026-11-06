export type StatusRekomendasi = "DITERIMA" | "TIDAK_SINKRON" | "DITOLAK";

export type StatusKeputusan = "MENUNGGU" | "DISETUJUI" | "REVISI" | "DITOLAK";

export type RingkasanPengajuan = {
  id: string;
  namaMahasiswa: string;
  nim: string;
  judul: string;
  skorTotal: number;
  rekomendasi: StatusRekomendasi;
  keputusan: StatusKeputusan;
};