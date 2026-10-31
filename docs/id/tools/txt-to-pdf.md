---
title: Teks ke PDF
description: Konversi file teks biasa atau teks ketikan ke PDF dengan font, warna, dan ukuran halaman kustom.
---

# Teks ke PDF

Konversi teks biasa menjadi PDF terformat. Anda dapat mengunggah file `.txt` atau mengetik langsung di editor teks bawaan. Alat ini mendukung beberapa font, warna teks kustom, dan beragam ukuran halaman, dari A0 hingga A10, ditambah US Letter, Legal, dan Tabloid.

## Format yang Didukung

| Input               | Ekstensi                    |
| :------------------ | :-------------------------- |
| File teks biasa     | `.txt`                      |
| Input teks langsung | Ketik atau tempel ke editor |

## Cara Kerja

1. Pilih mode input menggunakan sakelar di bagian atas: **Unggah File** atau **Ketik Teks**.
2. Jika mengunggah, seret dan lepas atau klik untuk memilih satu atau beberapa file `.txt`. Jika mengetik, masukkan teks Anda langsung di textarea.
3. Atur opsi format: jenis font, ukuran font, warna teks, dan ukuran halaman.
4. Klik **Buat PDF**. Hasilnya diunduh sebagai `text_to_pdf.pdf`.

Saat mengunggah beberapa file, isinya digabungkan dengan baris kosong di antaranya.

## Opsi

| Opsi               | Nilai                                                                    | Default         |
| :----------------- | :----------------------------------------------------------------------- | :-------------- |
| **Jenis Font**     | Helvetica (sans-serif), Tiro (serif), Courier (monospace), Times (serif) | Helvetica       |
| **Ukuran Font**    | 6 -- 72 pt                                                               | 12              |
| **Warna Teks**     | Warna apa pun melalui pemilih warna                                      | Hitam (#000000) |
| **Ukuran Halaman** | ISO A0--A10, B0--B10, C0--C10, US Letter, Legal, Tabloid, Ledger, 11x17  | A4              |

Bahasa RTL (Arab, Ibrani, Persia, Urdu) terdeteksi secara otomatis. Saat teks RTL ditemukan, arah teks dan perataan beralih sesuai.

## Kasus Penggunaan

- Mengonversi cuplikan kode atau file log menjadi PDF yang dapat dicetak dengan font Courier
- Membuat PDF cepat dari catatan rapat yang diketik langsung
- Memformat naskah teks biasa dengan font dan ukuran halaman tertentu untuk pengajuan
- Membuat versi PDF dari README atau changelog untuk distribusi offline

## Tips

- Gunakan mode **Ketik Teks** saat Anda ingin mengonversi isi clipboard dengan cepat tanpa menyimpannya sebagai file terlebih dahulu.
- Courier (monospace) adalah pilihan font terbaik untuk kode, log, atau konten apa pun yang memerlukan perataan kolom.
- Margin halaman ditetapkan 72 poin (1 inci) di semua sisi.

## Alat Terkait

- [Markdown ke PDF](./markdown-to-pdf)
- [CSV ke PDF](./csv-to-pdf)
- [Word ke PDF](./word-to-pdf)
