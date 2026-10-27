---
title: PNG ke PDF
description: Konversi satu atau beberapa gambar PNG menjadi dokumen PDF dengan kualitas yang dapat diatur, sepenuhnya di browser Anda.
---

# PNG ke PDF

Konversi gambar PNG ke PDF sambil mempertahankan resolusi penuhnya. Setiap PNG menjadi satu halaman, berukuran sesuai dimensi gambar asli. Transparansi ditangani secara otomatis.

## Format yang Didukung

| Format | Ekstensi |
| :----- | :------- |
| PNG    | `.png`   |

## Cara Kerja

1. Klik area unggah atau seret dan lepas file PNG. Anda dapat memilih beberapa sekaligus.
2. Kelola daftar file: hapus file yang tidak diinginkan atau tambah lainnya.
3. Pilih tingkat **Kualitas PDF** dari menu tarik-turun.
4. Klik **Konversi ke PDF**. Hasilnya diunduh sebagai `from_jpgs.pdf`.

Alat ini memakai pdf-lib untuk menyematkan setiap gambar secara langsung. Jika PNG tidak dapat disematkan secara native (mis., karena profil warna yang tidak umum), alat ini beralih dengan merender ulang melalui canvas sebagai JPEG.

## Opsi

**Kualitas PDF** mengontrol kompresi yang diterapkan sebelum penyematan:

- **Kualitas Tinggi**: kompresi minimal, ukuran file terbesar.
- **Kualitas Sedang** (default): keseimbangan yang baik antara ukuran dan kejernihan.
- **Kualitas Rendah**: kompresi maksimal, hasil terkecil.

## Kasus Penggunaan

- Mengonversi tangkapan layar menjadi PDF multi-halaman untuk laporan bug atau dokumentasi
- Mengemas ekspor desain UI ke dalam satu file untuk ditinjau
- Mengubah ekspor diagram (draw.io, Excalidraw) menjadi PDF yang dapat dibagikan
- Menyusun sekumpulan gambar grafik menjadi laporan

## Tips

- File PNG dengan transparansi mendapat latar belakang putih di PDF. Jika Anda memerlukan latar belakang lain, edit gambarnya terlebih dahulu.
- Untuk tangkapan layar dan diagram dengan tepi tajam dan teks, kualitas Tinggi menghindari artefak kompresi JPEG. Kualitas Sedang atau Rendah dapat dikonversi ke JPEG secara internal.

## Alat Terkait

- [Gambar ke PDF](./image-to-pdf)
- [JPG ke PDF](./jpg-to-pdf)
- [SVG ke PDF](./svg-to-pdf)
