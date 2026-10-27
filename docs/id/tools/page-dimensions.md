---
title: Dimensi Halaman
description: Analisis ukuran halaman PDF, orientasi, rasio aspek, dan rotasi. Deteksi dokumen berukuran campuran dan ekspor data ke CSV.
---

# Dimensi Halaman

Alat diagnostik yang membaca setiap halaman di PDF Anda dan melaporkan dimensi tepatnya, orientasi, nama ukuran standar, rasio aspek, luas, dan rotasi. Berguna untuk menemukan halaman berukuran campuran sebelum mencetak atau untuk mendokumentasikan properti PDF yang Anda terima.

## Cara Kerja

1. Unggah file PDF. Analisis dimulai otomatis, tanpa tombol yang perlu ditekan.
2. Panel ringkasan menampilkan jumlah halaman, jumlah ukuran halaman unik, dan apakah dokumen memiliki ukuran campuran.
3. Telusuri tabel hasil lengkap dengan detail per halaman.
4. Ganti satuan tampilan antara Poin, Inci, Milimeter, atau Piksel.
5. Klik **Ekspor ke CSV** untuk menyimpan data.

## Kolom yang Dilaporkan

| Kolom          | Deskripsi                                        |
| -------------- | ------------------------------------------------ |
| Halaman #      | Nomor halaman berurutan                          |
| Dimensi        | Lebar x Tinggi dalam satuan yang dipilih         |
| Ukuran Standar | Nama yang cocok (A4, Letter, dll.) atau "Kustom" |
| Orientasi      | Potret atau Lanskap                              |
| Rasio Aspek    | Rasio lebar terhadap tinggi dalam desimal        |
| Luas           | Luas halaman dalam satuan terpilih kuadrat       |
| Rotasi         | Rotasi halaman dalam derajat                     |

## Fitur

- Deteksi otomatis ukuran kertas standar (A3, A4, A5, Letter, Legal, Tabloid, dan lainnya)
- Peringatan dokumen berukuran campuran beserta rincian ukuran yang muncul dan jumlah halaman untuk tiap ukuran
- Konversi satuan antara poin, inci, milimeter, dan piksel (pada 96 PPI)
- Ekspor CSV untuk digunakan di spreadsheet atau sistem dokumentasi

## Kasus Penggunaan

- Memastikan semua halaman berukuran A4 sebelum mengirim dokumen ke percetakan
- Mendiagnosis mengapa PDF gabungan tercetak dengan margin tak terduga pada halaman tertentu
- Mendokumentasikan tata letak halaman arsip PDF besar untuk catatan metadata
- Mengidentifikasi halaman terputar yang perlu dikoreksi

## Tips

- Jika ringkasan menunjukkan "Ukuran Campuran", gunakan alat Perbaiki Ukuran Halaman untuk menyeragamkan sebelum mencetak.
- Kolom rotasi membantu mengidentifikasi halaman yang tampil benar tetapi memiliki atribut rotasi bukan nol, yang dapat menimbulkan masalah di beberapa alur kerja.

## Alat Terkait

- [Perbaiki Ukuran Halaman](./fix-page-size): seragamkan halaman setelah menemukan ukuran campuran
- [Kompres PDF](./compress-pdf): optimalkan PDF setelah memperbaiki masalah halaman
- [Putar PDF](./rotate-pdf): koreksi halaman yang terputar
