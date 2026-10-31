---
title: Pisah PDF
description: Pisahkan PDF menjadi file yang lebih kecil berdasarkan rentang halaman, pemilihan visual, bookmark, halaman genap/ganjil, atau interval tetap.
---

# Pisah PDF

Pecah PDF menjadi dokumen yang lebih kecil dengan salah satu dari enam mode pemisahan. Dari rentang halaman sederhana hingga pemisahan berbasis bookmark, alat ini menangani setiap skenario pembagian dokumen.

## Cara Kerja

1. Unggah satu file PDF.
2. Pilih mode pemisahan dari dropdown.
3. Atur opsi khusus mode (rentang halaman, pilihan, dan sebagainya).
4. Klik tombol proses.
5. Hasilnya diunduh sebagai satu PDF atau arsip ZIP tergantung mode dan pengaturan.

## Mode Pemisahan

| Mode                 | Deskripsi                                                                                                                                  |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| **Rentang**          | Masukkan rentang halaman seperti `1-3, 5, 8-10`. Beberapa rentang menghasilkan PDF terpisah dalam ZIP. Satu rentang menghasilkan satu PDF. |
| **Pilih Visual**     | Telusuri thumbnail halaman dan klik untuk memilih halaman yang Anda inginkan. Halaman terpilih diekstrak ke PDF baru.                      |
| **Genap / Ganjil**   | Ekstrak hanya halaman bernomor genap atau ganjil.                                                                                          |
| **Semua Halaman**    | Pisahkan setiap halaman menjadi file PDF tersendiri, diunduh sebagai ZIP.                                                                  |
| **Bookmark**         | Pisahkan pada batas bookmark. Pilih tingkat bookmark untuk mengatur di mana pemisahan terjadi.                                             |
| **Setiap N Halaman** | Pisahkan menjadi potongan masing-masing N halaman (misalnya, setiap 5 halaman). Potongan terakhir mungkin memiliki lebih sedikit halaman.  |

## Fitur

- Enam mode pemisahan berbeda yang mencakup hampir semua kasus penggunaan
- Pemilih halaman visual dengan thumbnail yang dimuat secara lazy
- Pemisahan berbasis bookmark dengan filter tingkat
- Opsi keluaran ZIP untuk mode rentang dan visual
- Menangani rentang halaman dengan sintaks campuran (`1-3, 5, 8-10`)
- Peringatan saat pemisahan N halaman menghasilkan potongan yang tidak sama

## Kasus Penggunaan

- Mengekstrak bab atau bagian tertentu dari dokumen besar
- Memisahkan halaman ganjil dan genap untuk alur kerja pencetakan bolak-balik
- Memecah PDF buku menjadi file bab individual pada batas bookmark
- Mengisolasi halaman tertentu (seperti halaman tanda tangan) dari kontrak
- Memisahkan laporan gabungan menjadi file per bagian untuk distribusi

## Tips

- Beberapa rentang halaman yang dipisahkan koma (misalnya, `1-5, 10-15, 20-25`) menghasilkan PDF terpisah, satu per rentang, dikemas dalam ZIP.
- Mode pemisahan bookmark mengharuskan PDF benar-benar memiliki bookmark. Jika tidak ditemukan, Anda akan mendapatkan pesan error.
- Kotak centang "Unduh sebagai ZIP" pada mode Rentang dan Visual memungkinkan Anda mendapatkan PDF individual per halaman, bukan file gabungan.

## Alat Terkait

- [Gabung PDF](./merge-pdf)
- [Ekstrak Halaman](./extract-pages)
- [Hapus Halaman](./delete-pages)
- [Alat Multi PDF](./pdf-multi-tool)
