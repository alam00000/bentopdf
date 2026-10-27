---
title: HEIC ke PDF
description: Konversi gambar HEIC dan HEIF dari iPhone dan iPad ke format PDF langsung di browser Anda.
---

# HEIC ke PDF

Konversi gambar HEIC/HEIF ke PDF. HEIC adalah format foto default di iPhone dan iPad sejak iOS 11. Alat ini memungkinkan Anda mengubah foto tersebut menjadi PDF tanpa memasang perangkat lunak desktop atau mengunggah file ke server.

## Format yang Didukung

| Format | Ekstensi |
| :----- | :------- |
| HEIC   | `.heic`  |
| HEIF   | `.heif`  |

## Cara Kerja

1. Klik area unggah atau seret dan lepas file HEIC/HEIF Anda.
2. Periksa daftar file dan hapus file yang tidak diinginkan.
3. Klik **Konversi ke PDF**. Hasilnya diunduh sebagai `from_heic.pdf`.

Setiap file HEIC didekode menggunakan pustaka heic2any, yang mengonversinya ke PNG dengan kualitas 92%. PNG tersebut kemudian disematkan ke PDF menggunakan pdf-lib, dengan setiap gambar di halamannya sendiri pada resolusi penuh.

## Opsi

Alat ini tidak menyediakan pengaturan tambahan. Gambar HEIC dikonversi dengan kualitas tinggi (0.92) ke PNG sebelum disematkan.

## Kasus Penggunaan

- Membuat PDF dari foto iPhone untuk dilampirkan pada klaim asuransi atau laporan
- Mengonversi foto HEIC untuk listing properti menjadi satu dokumen yang siap cetak
- Mengubah tangkapan layar iPad (format HEIF) menjadi PDF yang mudah dibagikan
- Mengonversi massal foto liburan untuk jurnal perjalanan

## Tips

- Dekode HEIC berlangsung sepenuhnya di browser menggunakan WebAssembly. Konversi pertama mungkin memerlukan waktu sebentar saat dekoder dimuat.
- Jika Anda perlu menggabungkan HEIC dengan format gambar lain (JPG, PNG, dll.), gunakan alat [Gambar ke PDF](./image-to-pdf), yang menangani HEIC bersama semua format lainnya.
- File HEIC dari iPhone sering berisi data EXIF termasuk koordinat GPS. Output PDF tidak membawa metadata ini.

## Alat Terkait

- [Gambar ke PDF](./image-to-pdf)
- [JPG ke PDF](./jpg-to-pdf)
- [PNG ke PDF](./png-to-pdf)
