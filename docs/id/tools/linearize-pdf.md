---
title: Linierisasi PDF
description: Optimalkan file PDF untuk penayangan web yang cepat dengan pemuatan progresif. Juga dikenal sebagai optimasi "Fast Web View".
---

# Linierisasi PDF

Linierisasi menyusun ulang struktur PDF sehingga halaman pertama dapat ditampilkan sebelum seluruh file selesai diunduh. Adobe menyebutnya "Fast Web View". Jika Anda menghosting PDF di situs web atau menyajikannya melalui portal dokumen, linierisasi membuatnya terasa jauh lebih cepat dibuka.

## Cara Kerja

1. Unggah satu atau beberapa file PDF.
2. Klik **Linierisasi PDF**.
3. Unduh hasilnya sebagai arsip ZIP yang berisi semua file yang telah dilinierisasi.

Tidak ada pengaturan yang perlu dikonfigurasi. Alat ini menggunakan flag `--linearize` dari QPDF, yang menyusun ulang struktur internal PDF tanpa mengubah konten visualnya.

## Yang Dilakukan Linierisasi

- Menyusun ulang objek PDF sehingga data halaman pertama berada di awal file
- Menambahkan kamus linierisasi dan tabel petunjuk agar penampil tahu di mana menemukan setiap halaman
- Mengaktifkan permintaan byte-range: browser dapat mengambil halaman pertama saja tanpa mengunduh seluruh file
- Merapikan tabel referensi silang untuk akses acak yang efisien

## Fitur

- Pemrosesan batch beberapa PDF dalam satu operasi
- Output mempertahankan semua konten, font, gambar, dan elemen interaktif
- Menggunakan QPDF (WebAssembly) untuk linierisasi yang andal dan sesuai standar
- Hasil dikemas dalam ZIP agar mudah diunduh

## Kasus Penggunaan

- Menghosting laporan PDF di situs web yang pengunjungnya mengharapkan halaman tampil seketika
- Menyematkan PDF di aplikasi web dengan penampil di dalam browser
- Menerbitkan katalog atau manual PDF yang diakses melalui koneksi seluler yang lambat
- Menyiapkan dokumen untuk content delivery network (CDN) yang mendukung penyajian byte-range

## Tips

- Lakukan linierisasi setelah semua pengeditan lain selesai. Modifikasi apa pun setelahnya (menggabungkan, menambah halaman) akan merusak linierisasi.
- Kombinasikan dengan Kompres PDF untuk PDF terkecil dan tercepat dimuat.
- Linierisasi menambah sedikit overhead pada ukuran file (biasanya di bawah 1%).

## Alat Terkait

- [Kompres PDF](./compress-pdf): kurangi ukuran file sebelum linierisasi
- [Perbaiki PDF](./repair-pdf): perbaiki masalah struktural yang menghalangi linierisasi
- [Hapus Metadata](./remove-metadata): hapus metadata sebelum dipublikasikan secara online
