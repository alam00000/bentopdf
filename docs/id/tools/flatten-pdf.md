---
title: Ratakan PDF
description: Ratakan formulir interaktif dan anotasi menjadi konten statis. Membuat kolom formulir tidak dapat diedit dan menyatukan anotasi ke dalam halaman.
---

# Ratakan PDF

Perataan menggabungkan elemen interaktif (kolom formulir, menu tarik-turun, kotak centang, anotasi, sorotan, catatan tempel) langsung ke dalam konten halaman. Tampilan visual tetap sama, tetapi tidak ada lagi yang dapat diedit atau diekstrak. Ini setara dengan mencetak formulir yang sudah diisi lalu memindainya kembali, hanya saja kualitasnya tetap sempurna.

## Cara Kerja

1. Unggah satu atau beberapa file PDF.
2. Klik **Ratakan PDF**.
3. Satu file langsung diunduh. Beberapa file menghasilkan arsip ZIP.

Alat ini menggunakan pdf-lib untuk meratakan kolom formulir (melalui `form.flatten()`) dan perata anotasi khusus untuk menyatukan anotasi ke dalam aliran halaman. Kedua operasi berjalan dalam satu proses.

## Yang Diratakan

- **Kolom formulir**: Input teks, kotak centang, tombol radio, menu tarik-turun, kolom tanda tangan
- **Anotasi**: Komentar, sorotan, coretan, garis bawah, catatan tempel, stempel, anotasi tinta
- **Elemen interaktif**: Tombol, pemicu aksi

## Yang Tidak Berubah

- Konten teks (tetap dapat dipilih dan dicari)
- Gambar dan grafik
- Tata letak dan dimensi halaman
- Bookmark dan daftar isi
- Hyperlink (kecuali yang berbasis anotasi)

## Kasus Penggunaan

- Mengunci formulir yang sudah diisi agar penerima tidak dapat mengubah jawaban yang dikirim
- Menyiapkan PDF untuk arsip yang tidak memerlukan elemen interaktif
- Memperbaiki masalah tampilan akibat anotasi yang dirender berbeda di berbagai penampil
- Memastikan dokumen yang sudah ditandatangani tidak dapat diubah setelah tanda tangan diterapkan
- Mengurangi ukuran file dengan menghilangkan definisi kolom formulir dan objek anotasi

## Tips

- Ratakan setelah semua pengeditan selesai. Tidak ada cara untuk membatalkan perataan PDF.
- Jika Anda perlu meratakan sekaligus menghapus metadata, JavaScript, dan lampiran, gunakan alat Sanitasi PDF, yang menyertakan perataan sebagai salah satu opsinya.
- Beberapa PDF melaporkan "tidak ada formulir ditemukan". Ini normal jika dokumen hanya memiliki anotasi dan tidak memiliki kolom formulir.

## Alat Terkait

- [Sanitasi PDF](./sanitize-pdf): ratakan formulir sekaligus hapus metadata, skrip, dan lainnya
- [Rasterisasi PDF](./rasterize-pdf): konversi ke PDF berbasis gambar untuk perataan maksimal
- [Font ke Garis Tepi](./font-to-outline): ratakan font menjadi jalur vektor
- [Lindungi PDF](./protect-pdf): kunci PDF yang sudah diratakan dengan kata sandi
