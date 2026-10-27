---
title: Luruskan PDF
description: Luruskan otomatis halaman miring pada PDF hasil pindai menggunakan deteksi kemiringan OpenCV. Ambang batas dan pengaturan DPI dapat disesuaikan.
---

# Luruskan PDF

Dokumen hasil pindai jarang benar-benar lurus. Kemiringan sedikit saja membuat OCR kurang akurat dan hasil cetak tampak berantakan. Alat ini memakai algoritma pemrosesan gambar OpenCV untuk mendeteksi sudut kemiringan setiap halaman dan memutarnya kembali agar rata.

## Cara Kerja

1. Unggah satu atau beberapa PDF hasil pindai.
2. Atur **Ambang Kemiringan**: halaman dengan kemiringan terdeteksi di bawah nilai ini dibiarkan apa adanya.
3. Pilih **Kualitas Pemrosesan (DPI)**: DPI lebih tinggi meningkatkan akurasi deteksi tetapi memakan waktu lebih lama.
4. Klik **Luruskan PDF**.
5. Setelah pemrosesan, panel hasil menampilkan sudut yang terdeteksi pada setiap halaman dan apakah halaman itu dikoreksi.

## Opsi

| Pengaturan                    | Nilai                      | Default |
| ----------------------------- | -------------------------- | ------- |
| **Ambang Kemiringan**         | 0.1, 0.5, 1.0, 2.0 derajat | 0.5     |
| **Kualitas Pemrosesan (DPI)** | 100, 150, 200, 300         | 150     |

## Cara Kerja Deteksi Kemiringan

Alat merender setiap halaman menjadi gambar pada DPI yang dipilih, lalu memakai OpenCV untuk mendeteksi sudut garis dominan pada konten. Jika kemiringan yang terdeteksi melebihi ambang batas, halaman diputar dengan sudut kebalikannya agar lurus. Halaman di bawah ambang batas diteruskan tanpa perubahan.

## Kasus Penggunaan

- Merapikan kontrak atau dokumen hukum yang dipindai secara batch
- Menyiapkan struk atau faktur hasil pindai untuk pemrosesan OCR
- Meluruskan halaman dari pemindai flatbed dengan penempatan kertas yang tidak konsisten
- Meningkatkan kualitas visual materi arsip yang didigitalkan

## Tips

- Turunkan ambang batas ke 0.1 derajat jika Anda memerlukan keselarasan sempurna untuk OCR.
- 150 DPI cepat dan akurat untuk sebagian besar dokumen. Gunakan 300 DPI untuk teks yang sangat kecil atau halaman dengan detail halus.
- Deskew bekerja paling baik pada dokumen dengan garis teks horizontal yang jelas. Alat mungkin kesulitan pada halaman yang sebagian besar berupa gambar atau elemen desain diagonal.

## Alat Terkait

- [Rasterisasi PDF](./rasterize-pdf): ubah hasil yang sudah diluruskan menjadi PDF berbasis gambar datar
- [Kompres PDF](./compress-pdf): kurangi ukuran file setelah diluruskan
- [Perbaiki PDF](./repair-pdf): perbaiki masalah struktural pada PDF hasil pindai
