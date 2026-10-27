---
title: Ekstrak Gambar
description: Ekstrak semua gambar tertanam dari file PDF. Pratinjau dalam kisi dan unduh satu per satu atau sebagai arsip ZIP.
---

# Ekstrak Gambar

Mengeluarkan setiap gambar tertanam dari satu atau beberapa file PDF. Gambar yang diekstrak ditampilkan dalam kisi pratinjau tempat Anda dapat mengunduhnya satu per satu, atau mengambil semuanya sekaligus sebagai ZIP. Ditenagai oleh PyMuPDF.

## Cara Kerja

1. Unggah satu atau beberapa PDF dengan mengklik area unggah atau menyeret file ke dalamnya. Tambahkan file lain atau hapus file tertentu sesuai kebutuhan.
2. Klik **Ekstrak Gambar** untuk memulai pemrosesan.
3. Alat memindai setiap halaman dari setiap PDF yang diunggah, menemukan dan mengekstrak gambar tertanam.
4. Gambar yang diekstrak muncul dalam kisi dengan thumbnail. Setiap gambar memiliki tombol unduh.
5. Klik **Unduh Semua** untuk menyimpan semuanya sebagai arsip ZIP.

## Opsi

Alat ini tidak memiliki opsi yang dapat dikonfigurasi. Semua gambar tertanam diekstrak dalam format aslinya (biasanya PNG, JPEG, atau format apa pun yang dipakai saat gambar disematkan di PDF).

## Format Output

- Gambar ditampilkan dalam kisi pratinjau dengan nama `image_1.png`, `image_2.jpg`, dan seterusnya.
- **Unduh Semua** menghasilkan `extracted-images.zip` berisi semua gambar.
- Gambar individual dapat diunduh satu per satu dari kisi.

## Kasus Penggunaan

- Memulihkan foto atau grafik dari PDF untuk dipakai ulang di proyek lain.
- Mengekstrak gambar produk dari PDF katalog untuk listing e-commerce.
- Mengambil diagram dari dokumentasi teknis untuk dipakai di presentasi.
- Mengaudit gambar apa saja yang tertanam di dokumen sebelum dibagikan.

## Tips

- Alat mengekstrak gambar persis seperti yang tersimpan di PDF. Alat tidak merender halaman sebagai gambar. Untuk itu, gunakan [PDF ke PNG](./pdf-to-png) atau [PDF ke JPG](./pdf-to-jpg).
- Jika alat melaporkan "Gambar Tidak Ditemukan", PDF mungkin menggunakan grafik vektor alih-alih gambar raster tertanam, atau mungkin dokumen hasil pindai di mana seluruh halaman adalah satu gambar besar.
- Pemrosesan batch berlaku untuk beberapa PDF. Semua gambar dari semua file digabung dalam satu kisi dan ZIP.

## Alat Terkait

- [PDF ke PNG](./pdf-to-png)
- [PDF ke JPG](./pdf-to-jpg)
- [Pembangun Alur Kerja PDF](./pdf-workflow)
