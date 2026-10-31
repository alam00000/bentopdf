---
title: PDF ke TIFF
description: Konversi halaman PDF ke gambar TIFF, yang umum dipakai dalam alur kerja cetak, faks, dan arsip. Beralih ke PNG jika encoding gagal.
---

# PDF ke TIFF

Mengonversi setiap halaman PDF menjadi gambar TIFF. TIFF adalah format standar untuk produksi cetak, sistem faks, dan pengarsipan dokumen. Alat ini memakai kompresi PackBits untuk encoding TIFF dan beralih ke PNG jika suatu halaman gagal di-encode.

## Cara Kerja

1. Unggah PDF dengan mengklik zona lepas atau menyeret file ke dalamnya.
2. Klik **Konversi** untuk memproses file.
3. Satu file TIFF atau arsip ZIP diunduh secara otomatis.

## Opsi

Alat ini tidak memiliki opsi yang dapat diatur. Halaman dirender pada skala tetap 2x.

## Format Hasil

- **Satu halaman**: `filename.tiff`
- **Beberapa halaman**: `filename_tiffs.zip` berisi `page_1.tiff`, `page_2.tiff`, dan seterusnya.

Jika encoding TIFF gagal untuk halaman tertentu (karena masalah kompresi), halaman itu disimpan sebagai file `.png`. Dalam kasus itu, ZIP akan berisi campuran file TIFF dan PNG.

## Kasus Penggunaan

- Mengirim dokumen ke instansi pemerintah atau sistem hukum yang mewajibkan format TIFF.
- Menyiapkan halaman untuk pengiriman faks melalui layanan faks digital.
- Mengarsipkan dokumen pindaian dalam format lossless yang didukung luas.
- Memasukkan halaman ke sistem manajemen dokumen perusahaan.

## Tips

- File TIFF berukuran besar. Jika Anda hanya memerlukan kualitas lossless untuk web atau layar, [PDF ke PNG](./pdf-to-png) adalah pilihan yang lebih baik.
- Periksa isi ZIP jika beberapa halaman memakai cadangan PNG, Anda mungkin ingin mengonversinya secara terpisah.

## Alat Terkait

- [PDF ke PNG](./pdf-to-png)
- [PDF ke BMP](./pdf-to-bmp)
- [PDF ke JPG](./pdf-to-jpg)
