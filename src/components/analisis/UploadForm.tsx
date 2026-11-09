"use client";

import { useState } from "react";
import type { ChangeEvent, DragEvent, FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FileText, LoaderCircle, Sparkles, Upload, X } from "lucide-react";

const MAKS_UKURAN = 10 * 1024 * 1024;
const EKSTENSI_DIIZINKAN = ".pdf"; // DIUBAH: hanya PDF

type FieldWajib = "nama" | "nim" | "judul" | "berkas";
type FormErrors = Partial<Record<FieldWajib, string>>;

function cekBerkas(file: File): string | null {
  if (!file.name.toLowerCase().endsWith(EKSTENSI_DIIZINKAN)) {
    return "Format file harus PDF.";
  }
  if (file.size > MAKS_UKURAN) {
    return "Ukuran file maksimal 10 MB.";
  }
  return null;
}

function formatUkuran(bytes: number) {
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function kelasInput(adaError: boolean) {
  return `w-full rounded-lg border bg-white px-3 text-sm text-neutral-900 placeholder:text-neutral-400 focus:ring-2 focus:ring-brand/20 focus:outline-none ${
    adaError ? "border-red-500" : "border-neutral-300 focus:border-brand"
  }`;
}

export default function UploadForm() {
  const router = useRouter();
  const [berkas, setBerkas] = useState<File | null>(null);
  const [errors, setErrors] = useState<FormErrors>({});
  const [sedangDiseret, setSedangDiseret] = useState(false);
  const [mengirim, setMengirim] = useState(false);
  const [pesanGagal, setPesanGagal] = useState<string | null>(null);

  function pilihBerkas(file: File | undefined) {
    if (!file) return;
    const masalah = cekBerkas(file);
    setErrors((sebelumnya) => ({ ...sebelumnya, berkas: masalah ?? undefined }));
    setBerkas(masalah ? null : file);
  }

  function handleInputBerkas(event: ChangeEvent<HTMLInputElement>) {
    pilihBerkas(event.target.files?.[0]);
    event.target.value = "";
  }

  function handleDrop(event: DragEvent<HTMLLabelElement>) {
    event.preventDefault();
    setSedangDiseret(false);
    pilihBerkas(event.dataTransfer.files[0]);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPesanGagal(null);

    const data = new FormData(event.currentTarget);
    const nama = String(data.get("nama") ?? "").trim();
    const nim = String(data.get("nim") ?? "").trim();
    const judul = String(data.get("judul") ?? "").trim();

    const errorBaru: FormErrors = {};
    if (nama.length < 3) errorBaru.nama = "Nama minimal 3 karakter.";
    if (!/^\d{5,15}$/.test(nim)) errorBaru.nim = "NIM hanya berisi angka, 5 sampai 15 digit.";
    if (judul.length < 10) errorBaru.judul = "Judul minimal 10 karakter.";
    if (!berkas) errorBaru.berkas = errors.berkas ?? "Unggah dokumen Bab 1.";

    setErrors(errorBaru);
    if (!berkas || Object.keys(errorBaru).length > 0) return;

    data.set("berkas", berkas);
    setMengirim(true);

    try {
      const response = await fetch("/api/analisis", { method: "POST", body: data });
      if (!response.ok) {
        throw new Error(`Gagal mengirim data (status ${response.status}). Coba lagi.`);
      }
      const hasil: { id: string } = await response.json();
      router.push(`/analisis/${hasil.id}`);
    } catch (error) {
      setPesanGagal(error instanceof Error ? error.message : "Terjadi kesalahan. Coba lagi.");
      setMengirim(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="flex flex-col gap-5 rounded-xl border border-neutral-200 bg-white p-5 sm:p-7"
    >
      <h2 className="text-base font-semibold text-neutral-900">Data pengajuan</h2>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="nama" className="text-[13px] font-semibold text-neutral-900">
            Nama mahasiswa
          </label>
          <input
            id="nama"
            name="nama"
            type="text"
            autoComplete="off"
            placeholder="Contoh: Rina Aprilia"
            aria-invalid={Boolean(errors.nama)}
            aria-describedby={errors.nama ? "nama-error" : undefined}
            className={`min-h-11 ${kelasInput(Boolean(errors.nama))}`}
          />
          {errors.nama && (
            <p id="nama-error" className="text-xs text-red-700">
              {errors.nama}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="nim" className="text-[13px] font-semibold text-neutral-900">
            NIM
          </label>
          <input
            id="nim"
            name="nim"
            type="text"
            inputMode="numeric"
            autoComplete="off"
            placeholder="Contoh: 2101011"
            aria-invalid={Boolean(errors.nim)}
            aria-describedby={errors.nim ? "nim-error" : undefined}
            className={`min-h-11 ${kelasInput(Boolean(errors.nim))}`}
          />
          {errors.nim && (
            <p id="nim-error" className="text-xs text-red-700">
              {errors.nim}
            </p>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="judul" className="text-[13px] font-semibold text-neutral-900">
          Judul skripsi yang diajukan
        </label>
        <textarea
          id="judul"
          name="judul"
          rows={3}
          maxLength={300}
          placeholder="Tulis judul lengkap persis seperti yang diajukan mahasiswa"
          aria-invalid={Boolean(errors.judul)}
          aria-describedby={errors.judul ? "judul-error" : undefined}
          className={`resize-y py-2.5 leading-relaxed ${kelasInput(Boolean(errors.judul))}`}
        />
        {errors.judul && (
          <p id="judul-error" className="text-xs text-red-700">
            {errors.judul}
          </p>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="pembimbing" className="text-[13px] font-semibold text-neutral-900">
          Calon dosen pembimbing <span className="font-normal text-neutral-600">(opsional)</span>
        </label>
        <input
          id="pembimbing"
          name="pembimbing"
          type="text"
          autoComplete="off"
          placeholder="Nama dosen"
          className={`min-h-11 ${kelasInput(false)}`}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <span className="text-[13px] font-semibold text-neutral-900">Dokumen Bab 1</span>

        {berkas ? (
          <div className="flex items-center gap-3 rounded-xl border border-neutral-200 bg-neutral-50 p-4">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-lg border border-neutral-200 bg-white text-neutral-700">
              <FileText className="size-5" aria-hidden="true" />
            </span>
            <div className="flex min-w-0 flex-1 flex-col">
              <span className="truncate text-sm font-semibold text-neutral-900">{berkas.name}</span>
              <span className="text-xs text-neutral-600">{formatUkuran(berkas.size)}</span>
            </div>
            <button
              type="button"
              onClick={() => setBerkas(null)}
              aria-label="Hapus file"
              disabled={mengirim}
              className="flex size-11 shrink-0 items-center justify-center rounded-lg text-neutral-600 hover:bg-neutral-200 hover:text-neutral-900 disabled:opacity-50"
            >
              <X className="size-5" aria-hidden="true" />
            </button>
          </div>
        ) : (
          <label
            htmlFor="berkas"
            onDragOver={(event) => {
              event.preventDefault();
              setSedangDiseret(true);
            }}
            onDragLeave={() => setSedangDiseret(false)}
            onDrop={handleDrop}
            className={`flex cursor-pointer flex-col items-center justify-center gap-2.5 rounded-xl border-[1.5px] border-dashed px-4 py-8 text-center transition-colors focus-within:ring-2 focus-within:ring-brand/20 ${
              sedangDiseret
                ? "border-brand bg-blue-50"
                : errors.berkas
                  ? "border-red-500 bg-red-50/40"
                  : "border-neutral-300 bg-neutral-50 hover:bg-neutral-100"
            }`}
          >
            <span className="flex size-11 items-center justify-center rounded-full border border-neutral-200 bg-white text-neutral-700">
              <Upload className="size-5" aria-hidden="true" />
            </span>
            <span className="text-sm font-semibold text-neutral-900">
              Klik untuk memilih file atau seret ke sini
            </span>
            {/* DIUBAH: hanya PDF */}
            <span className="text-[13px] text-neutral-600">PDF, maksimal 10 MB</span>
            <input
              id="berkas"
              type="file"
              accept=".pdf,application/pdf" // DIUBAH
              onChange={handleInputBerkas}
              aria-describedby={errors.berkas ? "berkas-error" : undefined}
              className="sr-only"
            />
          </label>
        )}

        {errors.berkas && (
          <p id="berkas-error" className="text-xs text-red-700">
            {errors.berkas}
          </p>
        )}
      </div>

      {pesanGagal && (
        <p role="alert" className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {pesanGagal}
        </p>
      )}

      <div className="flex flex-col-reverse gap-3 pt-1 sm:flex-row sm:justify-end">
        <Link
          href="/"
          className="flex min-h-11 items-center justify-center rounded-lg border border-neutral-300 bg-white px-5 text-sm font-semibold text-neutral-900 hover:bg-neutral-50"
        >
          Batal
        </Link>
        <button
          type="submit"
          disabled={mengirim}
          className="flex min-h-11 items-center justify-center gap-2 rounded-lg bg-brand px-5 text-sm font-semibold text-white hover:bg-brand-hover disabled:cursor-not-allowed disabled:opacity-70"
        >
          {mengirim ? (
            <LoaderCircle className="size-18px animate-spin" aria-hidden="true" />
          ) : (
            <Sparkles className="size-18px" aria-hidden="true" />
          )}
          {mengirim ? "Menganalisis..." : "Mulai Analisis"}
        </button>
      </div>
    </form>
  );
}