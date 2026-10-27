---
title: Ekstrak Tabel PDF
description: Deteksi dan ekstrak tabel dari dokumen PDF. Ekspor sebagai CSV, JSON, atau Markdown dengan granularitas per tabel.
---

# Ekstrak Tabel PDF

Mendeteksi semua tabel di PDF dan memungkinkan Anda mengekspornya dalam format pilihan Anda: CSV, JSON, atau Markdown. Setiap tabel diekstrak secara individual dengan metadata halaman dan posisi. Ditenagai oleh mesin deteksi tabel PyMuPDF.

## Cara Kerja

1. Unggah PDF dengan mengklik area unggah atau menyeret file ke dalamnya.
2. Pilih **Format Ekspor** yang Anda inginkan: CSV, JSON, atau Markdown.
3. Klik **Ekstrak Tabel** untuk memulai pemrosesan.
4. Jika satu tabel ditemukan, tabel diunduh sebagai satu file. Beberapa tabel menghasilkan arsip ZIP dengan satu file per tabel.

## Opsi

- **Format Ekspor**: pilih antara:
  - **CSV**: nilai dipisah koma dengan pengutipan yang benar untuk kolom yang berisi koma, tanda kutip, atau baris baru. Cocok untuk spreadsheet dan database.
  - **JSON**: struktur array-of-arrays, dicetak rapi dengan indentasi 2 spasi. Cocok untuk dikonsumsi secara terprogram.
  - **Markdown**: format tabel berpembatas pipa yang dirender oleh PyMuPDF. Cocok untuk dokumentasi dan file README.

## Format Output

- **Satu tabel**: `filename_table.csv` (atau `.json` / `.md`)
- **Beberapa tabel**: `filename_tables.zip` berisi file bernama `table_1_page3.csv`, `table_2_page5.csv`, dan seterusnya.

## Kasus Penggunaan

- Mengekstrak tabel tertentu dari laporan PDF yang panjang tanpa mengambil data seluruh dokumen.
- Mendapatkan tabel dalam format Markdown untuk ditempel langsung ke issue GitHub, wiki, atau dokumentasi.
- Mengambil data JSON terstruktur dari tabel PDF untuk integrasi API atau skrip.
- Membandingkan tabel antar versi PDF dengan mengekspor keduanya ke CSV dan melakukan diff.

## Tips

- Alat ini memberi Anda kendali per tabel. Jika Anda hanya ingin semua tabel dijadikan satu CSV, gunakan [PDF ke CSV](./pdf-to-csv). Untuk buku kerja Excel lengkap, gunakan [PDF ke Excel](./pdf-to-excel).
- Tabel yang membentang di beberapa halaman mungkin terdeteksi sebagai tabel terpisah per halaman. Anda mungkin perlu menggabungkannya secara manual.
- Jika tidak ada tabel terdeteksi, PDF mungkin berupa gambar hasil pindai. Jalankan OCR terlebih dahulu untuk menambahkan lapisan teks.

## Alat Terkait

- [PDF ke CSV](./pdf-to-csv)
- [PDF ke Excel](./pdf-to-excel)
- [PDF ke Teks](./pdf-to-text)
