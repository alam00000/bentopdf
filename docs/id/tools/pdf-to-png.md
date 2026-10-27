---
title: PDF ke PNG
description: Konversi halaman PDF ke gambar PNG lossless dengan skala yang dapat diatur. Ideal untuk tangkapan layar berkualitas tinggi dan latar belakang transparan.
---

# PDF ke PNG

Mengonversi setiap halaman PDF menjadi gambar PNG. PNG memakai kompresi lossless, sehingga hasilnya mempertahankan setiap detail halaman asli. PDF satu halaman diunduh sebagai file `.png`; PDF multi-halaman menghasilkan ZIP.

## Cara Kerja

1. Unggah PDF dengan mengklik zona lepas atau menyeret file ke dalamnya.
2. Atur penggeser **Skala** untuk mengontrol resolusi hasil.
3. Klik **Konversi** untuk mulai memproses.
4. Satu PNG atau arsip ZIP diunduh secara otomatis.

## Opsi

- **Skala**: berkisar dari 1.0x hingga 3.0x (default 2.0x). Pada 2.0x, halaman berukuran letter standar dirender sekitar 1.224 x 1.584 piksel. Nilai skala lebih tinggi menghasilkan gambar lebih besar dan tajam dengan konsekuensi ukuran file dan waktu pemrosesan.

## Format Hasil

- **Satu halaman**: `filename.png`
- **Beberapa halaman**: `filename_pngs.zip` berisi `page_1.png`, `page_2.png`, dan seterusnya.

## Kasus Penggunaan

- Mengambil tangkapan layar halaman PDF berfidelitas tinggi untuk presentasi.
- Mengekstrak grafik atau diagram yang memerlukan tepi tajam tanpa artefak kompresi.
- Menyiapkan aset desain web dari mockup PDF.
- Membuat gambar halaman lossless untuk pra-pemrosesan OCR.

## Tips

- File PNG jauh lebih besar daripada JPG. Jika ukuran file lebih penting daripada kualitas sempurna, gunakan [PDF ke JPG](./pdf-to-jpg) atau [PDF ke WebP](./pdf-to-webp).
- Pada skala 1.0x, hasil sesuai dengan resolusi asli PDF. Naikkan ke 3.0x untuk ekspor berkualitas cetak.

## Alat Terkait

- [PDF ke JPG](./pdf-to-jpg)
- [PDF ke WebP](./pdf-to-webp)
- [PDF ke SVG](./pdf-to-svg)
