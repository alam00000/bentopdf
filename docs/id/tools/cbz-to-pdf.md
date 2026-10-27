---
title: CBZ ke PDF
description: Konversi arsip komik CBZ dan CBR ke PDF di browser Anda. Gratis, privat, tanpa unggahan.
---

# CBZ ke PDF

Ubah file arsip komik menjadi PDF. CBZ dan CBR adalah format standar untuk komik digital, yaitu arsip ZIP atau RAR berisi gambar. Alat ini mengekstrak setiap halaman, mempertahankan urutan baca, dan menghasilkan PDF rapi di mana setiap gambar menjadi halaman berukuran penuh.

## Format yang Didukung

| Format | Ekstensi | Catatan                                                         |
| :----- | :------- | :-------------------------------------------------------------- |
| CBZ    | `.cbz`   | Arsip komik berbasis ZIP (diproses secara lokal dengan pdf-lib) |
| CBR    | `.cbr`   | Arsip komik berbasis RAR (diproses melalui mesin PyMuPDF)       |

Konverter CBZ mengenali gambar JPEG, PNG, GIF, BMP, WebP, AVIF, TIFF, HEIC, dan JXL di dalam arsip. Format non-standar dikonversi otomatis ke PNG sebelum disematkan.

## Cara Kerja

1. Klik area unggah atau seret dan lepas file CBZ atau CBR Anda. Anda dapat mencampur kedua format dalam satu batch.
2. Tinjau file yang terdaftar. Hapus yang tidak Anda perlukan, atau klik **Tambah Lebih Banyak File** untuk menambah file.
3. Klik **Konversi ke PDF**. Untuk file CBZ, alat membuka arsip ZIP, mengurutkan file gambar menurut nama secara natural, mendeteksi format asli setiap gambar, lalu menyematkannya ke PDF menggunakan pdf-lib. File CBR diproses melalui mesin PyMuPDF.
4. Satu file diunduh sebagai PDF. Beberapa file menghasilkan arsip ZIP bernama `comic-converted.zip`.

## Opsi

Tidak diperlukan konfigurasi. Setiap gambar menjadi halaman yang ukurannya sama dengan dimensi aslinya, sehingga halaman ganda tetap lebar dan halaman tunggal tetap sempit.

## Kasus Penggunaan

- Membaca komik di tablet atau aplikasi ponsel yang mendukung PDF tetapi tidak CBZ/CBR
- Mencetak halaman tertentu dari komik digital
- Mengarsipkan koleksi komik ke format yang dapat dibuka penampil file apa pun
- Membagikan komik kepada orang yang tidak memiliki pembaca komik khusus

## Tips

- Gambar di dalam arsip diurutkan secara natural (jadi `page2.jpg` muncul sebelum `page10.jpg`). Beri nama file dengan penomoran yang konsisten agar urutan halaman benar.
- Konverter mendeteksi format gambar dari signature biner, bukan ekstensi file. PNG yang tidak sengaja diberi nama `.jpg` tetap akan tersemat dengan benar.
- File CBZ diproses sepenuhnya di browser tanpa memuat mesin PyMuPDF, sehingga konversinya lebih cepat daripada file CBR.

## Alat Terkait

- [EPUB ke PDF](./epub-to-pdf)
- [MOBI ke PDF](./mobi-to-pdf)
- [Gambar ke PDF](./image-to-pdf)
