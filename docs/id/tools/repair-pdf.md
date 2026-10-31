---
title: Perbaiki PDF
description: Pulihkan data dari file PDF yang rusak atau korup menggunakan mesin perbaikan QPDF. Mendukung pemrosesan batch.
---

# Perbaiki PDF

Saat PDF tidak mau terbuka, menampilkan konten acak, atau memicu error di penampil Anda, alat ini mencoba membangun ulang struktur internalnya. Alat ini menggunakan mesin perbaikan QPDF yang dapat memulihkan data dari berbagai jenis kerusakan: tabel referensi silang yang rusak, aliran yang terpotong, referensi objek yang tidak valid, dan lainnya.

## Cara Kerja

1. Unggah satu atau beberapa file PDF yang rusak.
2. Klik **Perbaiki PDF**.
3. Satu file yang diperbaiki diunduh langsung. Beberapa file menghasilkan arsip ZIP.

Alat ini memproses setiap file melalui QPDF dengan flag `--decrypt`, yang memaksa QPDF membaca dan menulis ulang seluruh struktur PDF, memperbaiki masalah yang dapat dipulihkan.

## Fitur

- Perbaikan batch beberapa PDF dalam satu operasi
- Deteksi otomatis file yang dapat dipulihkan dan yang tidak
- Pelaporan berhasil/gagal per file saat memproses beberapa file
- Menggunakan QPDF (WebAssembly), pustaka transformasi PDF yang teruji

## Yang Dapat Diperbaiki

- Tabel referensi silang yang rusak atau hilang
- Akhir file yang terpotong akibat unduhan tidak lengkap
- Penomoran objek dan panjang aliran yang tidak valid
- Ketidakkonsistenan struktur kecil dari generator PDF yang bermasalah
- Artefak enkripsi dari upaya dekripsi yang gagal

## Yang Tidak Dapat Diperbaiki

- File yang sangat terpotong di mana sebagian besar data konten hilang
- PDF yang dienkripsi dengan kata sandi yang tidak Anda miliki
- File yang sebenarnya bukan PDF (ekstensi file salah)
- Kerusakan gambar di dalam PDF (strukturnya diperbaiki, tetapi data piksel tidak dibuat ulang)

## Kasus Penggunaan

- Memulihkan PDF dari unduhan email yang gagal
- Membuka file yang dihasilkan oleh generator PDF lama atau tidak standar
- Memperbaiki PDF yang berfungsi di satu penampil tetapi tidak di penampil lain
- Menyiapkan dokumen arsip yang rusak untuk penyimpanan jangka panjang

## Tips

- Jika perbaikan gagal, coba buka file di browser terlebih dahulu. Browser memiliki logika pemulihan sendiri dan mungkin merender cukup konten untuk disimpan ulang.
- Untuk PDF terenkripsi yang gagal diperbaiki, coba Buka Kunci PDF terlebih dahulu, lalu perbaiki hasil dekripsinya.

## Alat Terkait

- [Kompres PDF](./compress-pdf): rapikan lebih lanjut struktur PDF yang sudah diperbaiki
- [Linierisasi PDF](./linearize-pdf): optimalkan file yang diperbaiki untuk pengiriman web
- [Ratakan PDF](./flatten-pdf): ratakan formulir yang mungkin rusak
