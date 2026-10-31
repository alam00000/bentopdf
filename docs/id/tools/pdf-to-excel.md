---
title: PDF ke Excel
description: Ekstrak tabel dari dokumen PDF ke spreadsheet Excel. Setiap tabel mendapat lembar kerjanya sendiri dengan rujukan halaman.
---

# PDF ke Excel

Mengekstrak tabel dari PDF dan menyimpannya sebagai spreadsheet Excel (`.xlsx`). Setiap tabel yang terdeteksi ditempatkan pada lembar kerjanya sendiri, diberi label nomor tabel dan halaman sumber. Ditenagai PyMuPDF untuk deteksi tabel dan pustaka SheetJS untuk pembuatan Excel.

## Cara Kerja

1. Unggah PDF dengan mengklik zona lepas atau menyeret file ke dalamnya.
2. Klik **Konversi** untuk memulai ekstraksi tabel.
3. Alat ini memindai setiap halaman untuk tabel, lalu membangun workbook Excel.
4. File `.xlsx` diunduh dengan satu lembar per tabel.

## Opsi

Alat ini tidak memiliki opsi yang dapat diatur. Semua tabel yang terdeteksi diekstrak secara otomatis.

## Format Hasil

- Satu file `filename.xlsx`.
- **Satu tabel**: satu lembar kerja bernama "Table".
- **Beberapa tabel**: lembar kerja bernama "Table 1 (Page 3)", "Table 2 (Page 5)", dan seterusnya. Nama lembar dipotong hingga 31 karakter (batas Excel).

## Kasus Penggunaan

- Mengonversi laporan keuangan PDF menjadi spreadsheet yang dapat diedit untuk analisis lebih lanjut.
- Mengekstrak tabel inventaris atau pesanan dari PDF pemasok.
- Mengambil data terstruktur dari formulir atau katalog PDF ke Excel untuk diurutkan dan difilter.
- Mengarsipkan data tabular PDF dalam format yang bisa dikerjakan rekan non-teknis.

## Tips

- Jika alat melaporkan "Tabel Tidak Ditemukan", PDF kemungkinan memakai tata letak teks bebas, bukan tabel terstruktur. Coba [PDF ke Teks](./pdf-to-text) untuk mengambil konten mentahnya.
- Untuk format datar yang lebih sederhana, gunakan [PDF ke CSV](./pdf-to-csv). Untuk unduhan per tabel dalam beberapa format, gunakan [Ekstrak Tabel](./extract-tables).
- Periksa nama lembar untuk mengetahui dari halaman mana setiap tabel berasal.

## Alat Terkait

- [PDF ke CSV](./pdf-to-csv)
- [Ekstrak Tabel](./extract-tables)
- [PDF ke Teks](./pdf-to-text)
