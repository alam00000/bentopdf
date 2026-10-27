---
title: BMP ke PDF
description: Ubah gambar bitmap BMP menjadi PDF langsung di browser Anda, tanpa unggahan ke server mana pun.
---

# BMP ke PDF

Ubah file Windows Bitmap (BMP) menjadi PDF. BMP adalah format gambar tanpa kompresi yang masih ditemukan pada sistem lama, pencitraan medis, dan pemindai industri. Alat ini mengubahnya menjadi PDF tanpa perlu menginstal apa pun.

## Format yang Didukung

| Format | Ekstensi |
| :----- | :------- |
| BMP    | `.bmp`   |

## Cara Kerja

1. Klik area unggah atau seret dan lepas file BMP Anda.
2. Tinjau daftar file. Tambahkan file lain atau hapus yang tidak diinginkan.
3. Klik **Konversi ke PDF**. Hasilnya diunduh sebagai `from_bmps.pdf`.

Setiap BMP digambar pada canvas, diekspor sebagai PNG, lalu disematkan ke PDF menggunakan pdf-lib. Ukuran halaman sesuai dengan dimensi gambar asli.

## Opsi

Alat ini tidak menyediakan pengaturan kualitas tambahan. Gambar disematkan dalam resolusi aslinya sebagai PNG lossless di dalam PDF.

## Kasus Penggunaan

- Mengubah dokumen pindaian lama yang tersimpan sebagai BMP menjadi PDF arsip
- Mengubah tangkapan layar BMP dari aplikasi Windows lama menjadi dokumen yang mudah dibagikan
- Memproses keluaran pemindai medis atau industri yang secara default berformat BMP
- Memigrasikan arsip gambar lama ke format yang lebih portabel

## Tips

- File BMP tidak terkompresi, sehingga cenderung besar. PDF yang dihasilkan akan jauh lebih kecil karena gambar dienkode ulang sebagai PNG secara internal.
- Jika Anda memiliki file BMP bersama format gambar lain, gunakan alat [Gambar ke PDF](./image-to-pdf) untuk mengonversi semuanya dalam satu batch.

## Alat Terkait

- [Gambar ke PDF](./image-to-pdf)
- [PNG ke PDF](./png-to-pdf)
- [TIFF ke PDF](./tiff-to-pdf)
