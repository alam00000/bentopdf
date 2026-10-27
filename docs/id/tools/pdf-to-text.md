---
title: PDF ke Teks
description: Ekstrak konten teks biasa dari file PDF. Mendukung ekstraksi massal beberapa PDF dengan hasil berupa file TXT.
---

# PDF ke Teks

Mengekstrak semua konten teks dari file PDF dan menyimpannya sebagai file `.txt` biasa. Mendukung pemrosesan massal: unggah beberapa PDF dan teks masing-masing diekstrak dalam satu operasi. Ditenagai PyMuPDF.

## Cara Kerja

1. Unggah satu atau beberapa PDF dengan mengklik zona lepas atau menyeret file ke dalamnya. Kelola daftar file dengan tombol Tambah File Lagi dan Hapus Semua.
2. Klik **Ekstrak** untuk mulai memproses.
3. Satu file diunduh sebagai `filename.txt`. Beberapa file menghasilkan arsip `pdf-to-text.zip`.

## Opsi

Alat ini tidak memiliki opsi yang dapat diatur. Semua konten teks diekstrak dari setiap halaman sesuai urutan baca.

## Format Hasil

- **Satu file**: `filename.txt`
- **Beberapa file**: `pdf-to-text.zip` berisi satu `.txt` per PDF input.

## Kasus Penggunaan

- Mengekstrak teks isi dari laporan PDF untuk pengindeksan pencarian teks lengkap.
- Mengonversi ebook atau artikel PDF ke teks biasa untuk dibaca di perangkat e-ink.
- Mengambil teks dari kontrak atau dokumen hukum untuk analisis kata kunci.
- Menghapus format dari PDF untuk mendapatkan teks bersih bagi skrip pemrosesan data.
- Menyiapkan korpus teks dari arsip PDF untuk pemrosesan bahasa alami.

## Tips

- PDF hasil pindaian (hanya gambar) akan menghasilkan file teks kosong karena tidak ada lapisan teks untuk diekstrak. Jalankan dokumen pindaian melalui OCR terlebih dahulu.
- Hasilnya mempertahankan urutan baca sebagaimana ditafsirkan PyMuPDF, yang umumnya mengikuti kiri ke kanan, atas ke bawah. Tata letak multi-kolom dapat menghasilkan teks yang saling bercampur.
- Untuk hasil terstruktur dengan judul dan format, coba [PDF ke Markdown](./pdf-to-markdown). Untuk JSON terstruktur siap AI, gunakan [Siapkan PDF untuk AI](./prepare-pdf-for-ai).

## Alat Terkait

- [PDF ke Markdown](./pdf-to-markdown)
- [Siapkan PDF untuk AI](./prepare-pdf-for-ai)
- [PDF ke Word](./pdf-to-word)
