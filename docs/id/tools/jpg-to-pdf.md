---
title: JPG ke PDF
description: Konversi satu atau beberapa gambar JPG, JPEG, dan JPEG 2000 menjadi satu file PDF langsung di browser Anda.
---

# JPG ke PDF

Ubah gambar JPG menjadi PDF yang rapi. Unggah satu file atau beberapa JPG sekaligus: setiap gambar menjadi satu halaman penuh di dokumen hasil.

## Format yang Didukung

| Format    | Ekstensi        |
| :-------- | :-------------- |
| JPEG      | `.jpg`, `.jpeg` |
| JPEG 2000 | `.jp2`, `.jpx`  |

## Cara Kerja

1. Klik area unggah atau seret dan lepas file JPG Anda. Pemilihan banyak file didukung.
2. Periksa file yang diunggah. Gunakan ikon tempat sampah untuk menghapus file tertentu, atau klik **Tambah File Lagi** untuk menambahkannya ke daftar.
3. Pilih tingkat **Kualitas PDF**.
4. Klik **Konversi ke PDF**. Alat ini mengompresi gambar sesuai pengaturan kualitas Anda, mengonversinya melalui mesin PyMuPDF, dan mengunduh `from_jpgs.pdf`.

## Opsi

**Kualitas PDF** menyesuaikan kompresi yang diterapkan pada setiap gambar sebelum disematkan ke PDF:

- **Kualitas Tinggi**: mempertahankan detail maksimal. Gunakan untuk fotografi atau cetak.
- **Kualitas Sedang** (default): keseimbangan yang baik antara kejernihan dan ukuran file.
- **Kualitas Rendah**: kompresi agresif untuk hasil terkecil.

## Kasus Penggunaan

- Mengonversi dokumen hasil pindai yang disimpan sebagai JPG menjadi satu PDF untuk diserahkan
- Mengemas foto produk menjadi katalog untuk klien
- Mengubah gambar medis atau satelit JPEG 2000 menjadi PDF portabel
- Membuat album foto yang dapat dicetak dari ekspor kamera

## Tips

- File JPEG 2000 (`.jp2`, `.jpx`) didukung sepenuhnya, bukan hanya JPEG standar. Ini berguna untuk pencitraan medis dan data geospasial.
- Jika JPG Anda berasal dari kamera ponsel, kualitas Sedang biasanya menghasilkan file yang 40-60% lebih kecil daripada Tinggi tanpa perbedaan yang terlihat di layar.

## Alat Terkait

- [Gambar ke PDF](./image-to-pdf)
- [PNG ke PDF](./png-to-pdf)
- [WebP ke PDF](./webp-to-pdf)
