---
title: PDF ke CSV
description: Ekstrak tabel dari dokumen PDF dan ekspor sebagai satu file CSV. Mendukung PDF multi-halaman dengan deteksi tabel otomatis.
---

# PDF ke CSV

Mengekstrak tabel dari PDF dan mengekspornya sebagai file CSV. Alat ini memindai setiap halaman untuk data tabel menggunakan mesin deteksi tabel PyMuPDF, lalu menulis semua baris yang ditemukan ke satu keluaran yang dipisahkan koma.

## Cara Kerja

1. Unggah PDF dengan mengklik zona lepas atau menyeret file ke dalamnya.
2. Klik **Konversi** untuk memulai ekstraksi tabel.
3. Alat ini memindai setiap halaman dan mengidentifikasi tabel secara otomatis.
4. File `.csv` diunduh dengan semua data tabel yang diekstrak.

Tabel dari halaman berbeda dipisahkan oleh baris kosong pada hasil. Sel yang berisi koma, tanda kutip, atau baris baru di-escape dengan benar mengikuti RFC 4180.

## Opsi

Alat ini tidak memiliki opsi yang dapat diatur. Semua tabel yang ditemukan dalam dokumen diekstrak dan digabung menjadi satu CSV.

## Format Hasil

- Satu file `filename.csv` yang berisi semua tabel yang terdeteksi.

## Kasus Penggunaan

- Mengambil data keuangan dari rekening koran atau faktur PDF ke dalam spreadsheet.
- Mengekstrak tabel harga dari penawaran vendor untuk perbandingan.
- Mengonversi data penelitian tabular dari makalah PDF ke format yang cocok untuk alat analisis.
- Memigrasikan data dari laporan PDF lama ke database.

## Tips

- Jika tidak ada tabel ditemukan, alat ini menampilkan pesan "Tabel Tidak Ditemukan". Biasanya ini berarti PDF memakai tata letak teks yang tampak seperti tabel tetapi tidak terstruktur sebagai tabel sungguhan.
- Untuk kontrol lebih atas setiap tabel, gunakan [Ekstrak Tabel](./extract-tables) yang memungkinkan Anda memilih format hasil CSV, JSON, dan Markdown.
- Jika Anda memerlukan data dalam format Excel dengan lembar terpisah per tabel, gunakan [PDF ke Excel](./pdf-to-excel).

## Alat Terkait

- [PDF ke Excel](./pdf-to-excel)
- [Ekstrak Tabel](./extract-tables)
- [PDF ke Teks](./pdf-to-text)
