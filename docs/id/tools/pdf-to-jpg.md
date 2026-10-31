---
title: PDF ke JPG
description: Konversi halaman PDF ke gambar JPG dengan kualitas yang dapat diatur. PDF satu halaman diunduh langsung; PDF multi-halaman diekspor sebagai ZIP.
---

# PDF ke JPG

Mengonversi setiap halaman PDF menjadi gambar JPG. Dokumen satu halaman diunduh sebagai file `.jpg` mandiri. PDF multi-halaman menghasilkan arsip ZIP berisi satu JPG per halaman.

## Cara Kerja

1. Unggah PDF dengan mengklik zona lepas atau menyeret file ke dalamnya. Alat ini menampilkan nama file, ukuran file, dan jumlah halaman.
2. Atur penggeser **Kualitas** untuk mengontrol kompresi JPG.
3. Klik **Konversi** untuk mulai memproses.
4. Hasil diunduh otomatis: satu JPG untuk PDF satu halaman, atau file ZIP untuk dokumen multi-halaman.

## Opsi

- **Kualitas**: penggeser dari 0% hingga 100% (default 90%). Nilai lebih tinggi menghasilkan gambar lebih tajam dengan ukuran file lebih besar. Nilai lebih rendah mengompres lebih agresif.

Halaman dirender pada skala 2x secara internal, sehingga resolusi hasil dua kali dimensi halaman PDF. Halaman berukuran letter standar menghasilkan gambar sekitar 1.224 x 1.584 piksel.

## Format Hasil

- **Satu halaman**: `filename.jpg`
- **Beberapa halaman**: `filename_jpgs.zip` berisi `page_1.jpg`, `page_2.jpg`, dan seterusnya.

## Kasus Penggunaan

- Membuat thumbnail pratinjau untuk sistem manajemen dokumen.
- Membagikan satu halaman laporan lewat obrolan atau email yang tidak mendukung PDF.
- Membuat aset gambar dari diagram atau ilustrasi PDF.
- Mengarsipkan dokumen pindaian sebagai gambar terpisah.

## Tips

- Untuk hasil lossless, gunakan [PDF ke PNG](./pdf-to-png).
- Pengaturan kualitas 80-90% memberi keseimbangan yang baik antara ukuran file dan ketajaman visual.
- Jika Anda memerlukan format tertentu per halaman, pertimbangkan [Pembangun Alur Kerja PDF](./pdf-workflow) yang memiliki node keluaran PDF ke Gambar.

## Alat Terkait

- [PDF ke PNG](./pdf-to-png)
- [PDF ke WebP](./pdf-to-webp)
- [PDF ke BMP](./pdf-to-bmp)
- [PDF ke TIFF](./pdf-to-tiff)
