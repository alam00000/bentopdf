---
title: PDF ke SVG
description: Konversi halaman PDF ke grafik vektor SVG yang dapat diskalakan. Mempertahankan teks dan bentuk sebagai jalur vektor untuk penskalaan tanpa batas.
---

# PDF ke SVG

Mengonversi setiap halaman PDF menjadi file SVG (Scalable Vector Graphics). Berbeda dengan format raster, SVG mempertahankan jalur vektor, teks, dan bentuk sehingga hasilnya dapat diskalakan ke ukuran apa pun tanpa pikselasi. Ditenagai PyMuPDF.

## Cara Kerja

1. Unggah satu atau beberapa PDF dengan mengklik zona lepas atau menyeret file ke dalamnya. Anda dapat menambahkan beberapa file dan mengelolanya satu per satu.
2. Klik **Konversi** untuk memproses semua file yang diunggah.
3. Konversi satu file satu halaman diunduh sebagai `.svg` mandiri. Selain itu, hasilnya diunduh sebagai arsip ZIP.

## Opsi

Alat ini tidak memiliki opsi yang dapat diatur. Setiap halaman dikonversi ke SVG menggunakan ekspor vektor bawaan PyMuPDF.

## Format Hasil

- **Satu file, satu halaman**: `filename.svg`
- **Satu file, beberapa halaman**: `filename_svg.zip` berisi `page_1.svg`, `page_2.svg`, dan seterusnya.
- **Beberapa file**: `pdf_to_svg.zip` dengan file diatur menurut nama dokumen sumber.

## Kasus Penggunaan

- Mengekstrak diagram vektor, grafik, atau ilustrasi dari laporan PDF untuk digunakan di halaman web.
- Mengedit konten halaman PDF di editor vektor seperti Inkscape atau Illustrator.
- Menyematkan pratinjau halaman yang dapat diskalakan di aplikasi web responsif.
- Mengekstrak logo atau grafik dari brosur PDF dengan tepi yang tetap tajam.

## Tips

- SVG paling cocok untuk PDF yang berisi konten vektor. Dokumen pindaian atau PDF yang banyak gambar akan menghasilkan file SVG besar dengan data raster tersemat.
- Untuk hasil raster dari PDF yang banyak gambar, gunakan [PDF ke PNG](./pdf-to-png) atau [PDF ke JPG](./pdf-to-jpg).
- Alat ini mendukung konversi massal: unggah beberapa PDF sekaligus untuk mengonversinya dalam satu kali proses.

## Alat Terkait

- [PDF ke PNG](./pdf-to-png)
- [PDF ke JPG](./pdf-to-jpg)
- [PDF ke Markdown](./pdf-to-markdown)
