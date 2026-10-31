---
title: Excel ke PDF
description: Konversi spreadsheet Excel (XLS, XLSX), ODS, dan file CSV ke PDF dengan format yang terjaga.
---

# Excel ke PDF

Konversi file spreadsheet ke PDF. Alat ini menangani file Excel modern, format XLS lama, OpenDocument Spreadsheet, bahkan CSV, semuanya dirender melalui mesin LibreOffice berbasis browser yang mempertahankan format sel, rumus (sebagai nilai hasil hitung), grafik, dan tata letak multi-sheet.

## Format yang Didukung

| Format                   | Ekstensi |
| :----------------------- | :------- |
| Excel (modern)           | `.xlsx`  |
| Excel (lama)             | `.xls`   |
| OpenDocument Spreadsheet | `.ods`   |
| CSV                      | `.csv`   |

## Cara Kerja

1. Klik area unggah atau seret dan lepas file spreadsheet Anda.
2. Tinjau daftar file. Tambahkan file lain atau hapus yang tidak diinginkan.
3. Klik **Konversi ke PDF**. Mesin LibreOffice diinisialisasi pada penggunaan pertama, lalu memproses setiap file.
4. Satu file diunduh langsung sebagai PDF. Beberapa file dikirim sebagai `excel-converted.zip`.

## Opsi

Alat ini tidak memiliki konfigurasi tambahan. Mesin LibreOffice menentukan tata letak halaman, skala, dan area cetak berdasarkan pengaturan bawaan spreadsheet.

## Output

| Jumlah Input | Output                                                     |
| :----------- | :--------------------------------------------------------- |
| 1 file       | Satu unduhan PDF (nama file asli dengan ekstensi `.pdf`)   |
| 2+ file      | Arsip ZIP (`excel-converted.zip`) berisi satu PDF per file |

## Kasus Penggunaan

- Mengonversi laporan keuangan atau anggaran dari Excel ke PDF untuk distribusi
- Membuat PDF siap cetak dari spreadsheet inventaris atau katalog produk
- Membagikan hasil analisis data kepada pemangku kepentingan yang tidak memiliki Excel
- Mengarsipkan laporan kuartalan dalam format yang tidak dapat diedit
- Mengonversi file ODS dari LibreOffice Calc ke PDF

## Tips

- Grafik yang tertanam di spreadsheet dirender di PDF. Pastikan tampilannya benar di file sumber sebelum dikonversi.
- Jika spreadsheet Anda memiliki beberapa sheet, semua sheet disertakan dalam output PDF.
- Untuk data CSV sederhana tanpa format, alat [CSV ke PDF](./csv-to-pdf) menyediakan konversi yang lebih ringan. Gunakan Excel ke PDF saat Anda membutuhkan format, grafik, atau beberapa sheet tetap terjaga.

## Alat Terkait

- [CSV ke PDF](./csv-to-pdf)
- [Word ke PDF](./word-to-pdf)
- [PowerPoint ke PDF](./powerpoint-to-pdf)
