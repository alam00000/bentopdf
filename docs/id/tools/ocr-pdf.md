---
title: OCR PDF
description: Buat PDF hasil pindai dapat dicari dan disalin menggunakan Tesseract OCR dengan dukungan multibahasa dan penyaringan karakter.
---

# OCR PDF

Ubah dokumen hasil pindai menjadi PDF yang dapat dicari dan disalin. Alat ini menggunakan Tesseract OCR untuk mengenali teks pada gambar dan menempatkan lapisan teks tak terlihat di atas halaman asli, sehingga tampilan visualnya tetap terjaga sementara kontennya sepenuhnya dapat dicari.

## Cara Kerja

1. Unggah PDF hasil pindai atau PDF berbasis gambar.
2. Pilih satu atau beberapa bahasa yang ada dalam dokumen dari daftar bahasa yang dapat dicari.
3. Secara opsional sesuaikan pengaturan lanjutan (resolusi, binarisasi, daftar putih).
4. Klik **Mulai OCR** dan pantau kemajuan pada bilah kemajuan real-time.
5. Setelah selesai, periksa teks yang diekstrak, lalu unduh PDF yang dapat dicari atau file `.txt` biasa.

## Fitur

- OCR multibahasa dengan pemilih bahasa yang dapat dicari
- Lapisan teks tak terlihat mempertahankan tampilan dokumen asli
- Bilah kemajuan real-time dan keluaran log selama pemrosesan
- Unduh hasil sebagai PDF yang dapat dicari atau file teks biasa
- Salin teks yang diekstrak langsung ke clipboard
- Tiga tingkat resolusi untuk menyeimbangkan kecepatan dan akurasi

## Opsi

| Pengaturan                       | Nilai                                                                                         | Default   | Tujuan                                                                                     |
| -------------------------------- | --------------------------------------------------------------------------------------------- | --------- | ------------------------------------------------------------------------------------------ |
| **Resolusi**                     | Standar (192 DPI), Tinggi (288 DPI), Ultra (384 DPI)                                          | Tinggi    | Resolusi lebih tinggi meningkatkan akurasi pada teks kecil tetapi lebih lama               |
| **Binarisasi Gambar**            | Aktif / Nonaktif                                                                              | Nonaktif  | Meningkatkan kontras untuk hasil pindai yang bersih dengan mengubahnya menjadi hitam putih |
| **Preset Daftar Putih Karakter** | Tidak Ada, Alfanumerik, Angka + Mata Uang, Hanya Huruf, Hanya Angka, Faktur, Formulir, Kustom | Tidak Ada | Membatasi karakter yang dikenali untuk meningkatkan akurasi pada jenis dokumen tertentu    |
| **Daftar Putih Karakter**        | Teks bebas                                                                                    | Kosong    | Kumpulan karakter manual saat preset diatur ke Kustom                                      |

## Kasus Penggunaan

- Membuat kontrak dan faktur hasil pindai dapat dicari sehingga Anda bisa menggunakan Ctrl+F di dalamnya
- Mengekstrak teks dari dokumen hasil foto atau arsip kertas lama
- Memproses struk dengan preset Faktur untuk menangkap jumlah uang dan tanggal secara akurat
- Membuat PDF yang aksesibel dari hasil pindai berupa gambar saja untuk kebutuhan kepatuhan
- Mengekstrak isi teks secara massal dari buku atau manual hasil pindai

## Tips

- Pilih beberapa bahasa jika dokumen Anda berisi konten campuran bahasa (misalnya, judul bahasa Inggris dengan isi bahasa Jepang).
- Gunakan opsi binarisasi untuk dokumen dengan teks pudar atau berkontras rendah: ini dapat meningkatkan akurasi pengenalan secara signifikan.
- Preset daftar putih Faktur dan Formulir sangat mengurangi positif palsu pada dokumen terstruktur dengan mengabaikan bentuk karakter yang tidak relevan.

## Alat Terkait

- [Ekstrak Tabel PDF](./extract-tables)
- [Gabung PDF](./merge-pdf)
- [Kompres PDF](./compress-pdf)
