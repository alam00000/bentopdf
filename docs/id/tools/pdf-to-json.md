---
title: PDF ke JSON
description: Konversi file PDF ke format JSON terstruktur menggunakan CPDF. Mengekspor struktur internal PDF sebagai data JSON yang dapat dibaca mesin.
---

# PDF ke JSON

Mengonversi satu atau beberapa file PDF ke format JSON. Alat ini memakai CPDF (Coherent PDF) untuk menserialisasi struktur internal setiap PDF menjadi representasi JSON yang dapat dibaca mesin. Hasilnya selalu dikirim sebagai arsip ZIP.

## Cara Kerja

1. Pilih satu atau beberapa file PDF menggunakan pemilih file.
2. Klik **Konversi** untuk mulai memproses. Konversi berjalan di web worker latar belakang.
3. Arsip ZIP diunduh berisi satu file JSON untuk setiap PDF input.

Bilah status menampilkan kemajuan melalui tahap konversi dan pembuatan ZIP.

## Opsi

Alat ini tidak memiliki opsi yang dapat diatur. Setiap PDF dikonversi ke representasi JSON lengkapnya.

## Format Hasil

- File `pdfs-to-json.zip` berisi `filename.json` untuk setiap PDF input.

Hasil JSON merepresentasikan struktur objek internal PDF, termasuk pohon halaman, rujukan font, metadata, dan content stream.

## Kasus Penggunaan

- Memeriksa struktur internal PDF untuk debugging atau validasi.
- Mengekstrak metadata terstruktur dan properti halaman secara terprogram.
- Memasukkan data struktur PDF ke pipeline pemrosesan kustom.
- Mengaudit dokumen PDF untuk kepatuhan dengan menganalisis pohon objeknya.

## Tips

- Alat ini menghasilkan struktur objek PDF mentah, bukan isi teks yang diekstrak. Jika Anda memerlukan teks halaman dalam format JSON, gunakan [Siapkan PDF untuk AI](./prepare-pdf-for-ai).
- Untuk ekstraksi teks biasa, [PDF ke Teks](./pdf-to-text) lebih sederhana.
- PDF besar dengan struktur kompleks menghasilkan file JSON yang sangat besar.

## Alat Terkait

- [PDF ke Teks](./pdf-to-text)
- [Siapkan PDF untuk AI](./prepare-pdf-for-ai)
- [Ekstrak Tabel](./extract-tables)
