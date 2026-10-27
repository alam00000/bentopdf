---
title: Rasterisasi PDF
description: Konversi halaman PDF menjadi PDF berbasis gambar. Ratakan semua layer, hapus teks yang dapat dipilih, dan atur DPI serta format gambar.
---

# Rasterisasi PDF

Rasterisasi mengubah setiap halaman PDF menjadi gambar dan menyusun kembali gambar tersebut menjadi PDF. Hasilnya tampak identik dengan aslinya tetapi tidak berisi teks yang dapat dipilih, elemen interaktif, atau layer yang dapat diedit. Pada dasarnya ini adalah fotokopi berkualitas tinggi.

## Cara Kerja

1. Unggah satu atau beberapa file PDF.
2. Atur **DPI** (resolusi) untuk hasil rasterisasi.
3. Pilih **Format Gambar**: PNG untuk kualitas tanpa kehilangan atau JPEG untuk file lebih kecil.
4. Secara opsional, centang **Konversi ke Skala Abu-abu**.
5. Klik **Rasterisasi PDF**. Beberapa file diunduh sebagai ZIP.

## Opsi

| Pengaturan        | Nilai                                      | Default  |
| ----------------- | ------------------------------------------ | -------- |
| **DPI**           | 72, 150, 200, 300, 600                     | 150      |
| **Format Gambar** | PNG (tanpa kehilangan), JPEG (lebih kecil) | PNG      |
| **Skala Abu-abu** | Aktif/Nonaktif                             | Nonaktif |

## Panduan DPI

- **72**: Hanya untuk dilihat di layar, ukuran file terkecil
- **150**: Keseimbangan yang baik untuk penggunaan umum
- **200**: Teks lebih tajam, ukuran file sedang
- **300**: Hasil berkualitas cetak
- **600**: Arsip berkualitas tinggi atau pencetakan profesional

## Kasus Penggunaan

- Mencegah ekstraksi teks dari dokumen rahasia sebelum dibagikan
- Menghilangkan masalah ketergantungan font dengan mengubah teks menjadi piksel
- Membuat versi "datar" dari PDF dengan layer atau transparansi kompleks yang dirender berbeda di berbagai penampil
- Menyiapkan PDF untuk sistem yang hanya menerima input berbasis gambar
- Menghapus konten tersembunyi (seperti perubahan terlacak atau data formulir) dengan mengubah PDF menjadi gambar murni

## Tips

- 150 DPI dengan PNG adalah default yang solid. Naikkan hanya jika Anda memerlukan hasil cetak atau perlu memperbesar detail halus.
- JPEG menghasilkan file yang jauh lebih kecil tetapi menimbulkan artefak kompresi pada tepi teks yang tajam.
- Rasterisasi tidak dapat dibatalkan, jadi simpan PDF asli Anda jika nanti mungkin memerlukan teks yang dapat diedit.

## Alat Terkait

- [Kompres PDF](./compress-pdf): kurangi ukuran file PDF hasil rasterisasi
- [Luruskan PDF](./deskew-pdf): luruskan halaman sebelum merasterisasi dokumen pindaian
- [Font ke Outline](./font-to-outline): ubah font menjadi jalur vektor jika Anda ingin tetap skalabel
- [Ratakan PDF](./flatten-pdf): ratakan formulir tanpa mengubahnya menjadi gambar
