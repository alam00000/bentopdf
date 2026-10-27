---
title: WebP ke PDF
description: Konversi gambar WebP ke format PDF langsung di browser Anda dengan kualitas kompresi yang bisa diatur.
---

# WebP ke PDF

Konversi format gambar WebP milik Google ke PDF. Ini sangat berguna ketika Anda mengunduh gambar dari web dalam format WebP dan memerlukannya dalam format yang lebih umum diterima untuk dicetak atau dibagikan.

## Format yang Didukung

| Format | Ekstensi |
| :----- | :------- |
| WebP   | `.webp`  |

## Cara Kerja

1. Klik area unggah atau seret dan lepas file WebP Anda.
2. Tinjau daftar file dan hapus file yang tidak diperlukan.
3. Pilih tingkat **Kualitas PDF**.
4. Klik **Konversi ke PDF**. Hasilnya diunduh sebagai `from_webps.pdf`.

Secara internal, setiap gambar WebP didekode melalui API canvas browser, lalu disematkan ke PDF menggunakan pdf-lib. Artinya konversi berfungsi di browser mana pun yang mendukung dekode WebP (semua browser modern mendukungnya).

## Opsi

**Kualitas PDF** mengatur kompresi saat menyematkan gambar:

- **Kualitas Tinggi**: mempertahankan detail terbanyak.
- **Kualitas Sedang** (default): hasil yang seimbang.
- **Kualitas Rendah**: ukuran file terkecil.

## Kasus Penggunaan

- Mengonversi gambar unduhan web yang tersimpan sebagai WebP menjadi PDF yang bisa dicetak
- Mengemas tangkapan layar WebP dari Chrome atau Edge ke dalam dokumentasi
- Membuat portofolio PDF dari gambar yang diekspor alat desain yang memakai WebP secara default
- Mengarsipkan gambar WebP dalam format yang lebih umum dibaca

## Tips

- WebP didekode ke PNG secara internal sebelum disematkan ke PDF, sehingga gambar WebP lossless mempertahankan kualitasnya pada pengaturan Tinggi.
- Jika Anda punya campuran WebP dan format gambar lain, gunakan alat [Gambar ke PDF](./image-to-pdf), yang menerima semuanya sekaligus.

## Alat Terkait

- [Gambar ke PDF](./image-to-pdf)
- [PNG ke PDF](./png-to-pdf)
- [JPG ke PDF](./jpg-to-pdf)
