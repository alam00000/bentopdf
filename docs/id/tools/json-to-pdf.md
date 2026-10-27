---
title: JSON ke PDF
description: Rekonstruksi file PDF dari format JSON BentoPDF. Konversi ekspor JSON kembali ke dokumen PDF aslinya.
---

# JSON ke PDF

Rekonstruksi dokumen PDF dari file JSON yang sebelumnya dibuat oleh alat **PDF ke JSON** BentoPDF. Ini adalah alat konversi bolak-balik: alat ini mengambil representasi JSON terstruktur dari sebuah PDF dan membangun kembali dokumen aslinya.

::: warning
Alat ini hanya menerima file JSON yang dihasilkan oleh konverter PDF ke JSON BentoPDF. File JSON standar dari API, basis data, atau alat lain tidak didukung.
:::

## Format yang Didukung

| Input   | Deskripsi                                              |
| :------ | :----------------------------------------------------- |
| `.json` | File JSON yang diekspor oleh alat PDF ke JSON BentoPDF |

## Cara Kerja

1. Klik area unggah atau seret dan lepas satu atau beberapa file JSON.
2. Daftar file menampilkan setiap file yang dipilih beserta ukurannya.
3. Klik **Konversi ke PDF**. Alat ini memproses semua file menggunakan Web Worker dan mesin CPDF.
4. Hasilnya diunduh sebagai `jsons-to-pdf.zip` yang berisi satu PDF untuk setiap file JSON input.

Konversi berjalan di Web Worker latar belakang, sehingga antarmuka tetap responsif bahkan dengan file besar.

## Opsi

Alat ini tidak memiliki opsi yang dapat dikonfigurasi. Struktur JSON sepenuhnya menentukan PDF hasil.

## Output

Saat mengonversi beberapa file JSON, hasilnya dikirim sebagai arsip ZIP. Setiap PDF dinamai sesuai file JSON sumbernya (misalnya, `report.json` menjadi `report.pdf`).

## Kasus Penggunaan

- Memulihkan PDF dari cadangan berbasis JSON atau pipeline arsip
- Melakukan konversi bolak-balik PDF melalui JSON untuk inspeksi lalu kembali ke PDF
- Membangun ulang dokumen setelah modifikasi struktur JSON secara terprogram
- Memverifikasi bahwa ekspor PDF ke JSON menangkap seluruh isi dokumen dengan mengonversinya kembali

## Tips

- Jika Anda perlu mengonversi data JSON sembarang (seperti respons API atau file konfigurasi) menjadi PDF yang terformat, alat [Teks ke PDF](./txt-to-pdf) lebih cocok. Tempel JSON sebagai teks dan akan dirender dengan format yang tepat.
- Mesin WebAssembly CPDF harus tersedia agar alat ini berfungsi. Instans yang dihosting sendiri memerlukan file WASM CPDF yang sudah dikonfigurasi.

## Alat Terkait

- [Teks ke PDF](./txt-to-pdf)
- [Markdown ke PDF](./markdown-to-pdf)
- [CSV ke PDF](./csv-to-pdf)
