---
title: PDF ke BMP
description: Konversi halaman PDF ke gambar BMP tanpa kompresi. Berguna untuk sistem lama dan alur kerja cetak yang memerlukan input bitmap.
---

# PDF ke BMP

Mengonversi setiap halaman PDF menjadi gambar BMP (Bitmap). BMP adalah format tanpa kompresi, sehingga hasilnya sempurna per piksel tanpa kehilangan kualitas, tetapi ukuran filenya besar.

## Cara Kerja

1. Unggah PDF dengan mengklik zona lepas atau menyeret file ke dalamnya.
2. Klik **Konversi** untuk memproses file.
3. Satu file `.bmp` atau arsip ZIP diunduh secara otomatis.

## Opsi

Alat ini tidak memiliki opsi yang dapat diatur. Halaman dirender pada skala tetap 2x, menghasilkan gambar dengan dimensi sekitar dua kali dimensi asli halaman PDF.

## Format Hasil

- **Satu halaman**: `filename.bmp`
- **Beberapa halaman**: `filename_bmps.zip` berisi `page_1.bmp`, `page_2.bmp`, dan seterusnya.

## Kasus Penggunaan

- Memasukkan halaman PDF ke sistem lama atau perangkat keras yang hanya menerima input BMP.
- Menyiapkan gambar tanpa kompresi untuk alur kerja cetak tertentu.
- Menggunakan hasil bitmap sebagai input untuk alat pengolah gambar yang memerlukan data piksel mentah.

## Tips

- File BMP sangat besar karena menyimpan data piksel mentah tanpa kompresi. Untuk sebagian besar keperluan, [PDF ke PNG](./pdf-to-png) memberikan kualitas lossless dengan file yang jauh lebih kecil.
- Jika sistem tujuan Anda menerima PNG atau TIFF, pilih format tersebut untuk menghemat ruang disk.

## Alat Terkait

- [PDF ke PNG](./pdf-to-png)
- [PDF ke TIFF](./pdf-to-tiff)
- [PDF ke JPG](./pdf-to-jpg)
