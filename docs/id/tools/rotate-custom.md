---
title: Putar dengan Derajat Kustom
description: Putar halaman PDF dengan sudut apa pun menggunakan input derajat per halaman dan kontrol rotasi batch.
---

# Putar dengan Derajat Kustom

Putar halaman PDF dengan sudut sembarang, tidak hanya kelipatan 90 derajat. Setiap halaman memiliki input sudutnya sendiri, dan Anda dapat menerapkan satu sudut ke semua halaman sekaligus menggunakan kontrol batch.

## Cara Kerja

1. Unggah file PDF. Thumbnail dirender untuk setiap halaman.
2. Setiap halaman memiliki kolom input numerik yang menampilkan sudut rotasinya saat ini.
3. Ketik nilai derajat apa pun (positif atau negatif) untuk memutar halaman tertentu, atau gunakan tombol kiri/kanan per halaman untuk penyesuaian cepat 90 derajat.
4. Gunakan input **sudut batch** di bagian atas untuk mengatur rotasi seragam bagi semua halaman.
5. Klik tombol proses untuk menghasilkan PDF yang sudah diputar.

## Fitur

- Input derajat bebas per halaman (nilai bilangan bulat apa pun)
- Kontrol sudut batch untuk mengatur rotasi yang sama pada setiap halaman
- Pratinjau rotasi secara real-time di thumbnail
- Tombol putar cepat per halaman untuk kelipatan 90 derajat
- Thumbnail dimuat secara lazy untuk performa pada dokumen besar

## Kasus Penggunaan

- Memperbaiki pindaian yang sedikit miring beberapa derajat
- Memutar halaman agar sesuai dengan persyaratan orientasi non-standar
- Menerapkan rotasi presisi pada halaman tertentu dalam dokumen dengan konten campuran
- Menyempurnakan sudut halaman setelah rotasi massal awal

## Tips

- Nilai positif memutar searah jarum jam, nilai negatif memutar berlawanan arah jarum jam.
- Kolom sudut batch menimpa semua sudut per halaman saat diterapkan. Atur penyesuaian individual setelah operasi batch jika perlu.
- Untuk rotasi standar 90/180/270 derajat dengan antarmuka yang lebih sederhana, gunakan [Putar PDF](./rotate-pdf).

## Alat Terkait

- [Putar PDF](./rotate-pdf)
- [Alat Multi PDF](./pdf-multi-tool)
- [Duplikat & Atur](./organize-pdf)
