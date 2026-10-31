---
title: Susun Ulang Pindaian Dupleks
description: Susun ulang PDF pindaian dupleks yang berisi halaman depan dan halaman belakang dalam blok terpisah menjadi urutan halaman depan/belakang yang benar.
---

# Susun Ulang Pindaian Dupleks

Susun Ulang Pindaian Dupleks dirancang untuk alur kerja pemindaian ADF di mana satu PDF berisi dua blok halaman:

- semua sisi depan terlebih dahulu
- semua sisi belakang kemudian

Alih-alih memisah dan merakit ulang secara manual, alat ini menyisipkan kedua blok menjadi urutan baca yang natural: depan1, belakang1, depan2, belakang2, dan seterusnya.

## Cara Kerja

1. Unggah satu PDF yang dibuat dari pemindaian tumpukan dupleks.
2. Tetapkan titik pemisah tempat blok depan berakhir.
3. Pilih penanganan blok belakang:
   - **Balik blok halaman belakang** (umum saat tumpukan dibalik sebelum memindai sisi belakang)
   - **Biarkan blok halaman belakang apa adanya**
4. Klik **Susun PDF** untuk mengunduh hasil yang sudah disusun ulang.

## Opsi

- **Deteksi pemisahan otomatis (setengah)**: menetapkan titik pemisah ke `ceil(totalPages / 2)`.
- **Peringatan halaman ganjil**: memberi peringatan saat total halaman ganjil (sering menandakan pindaian tidak cocok).
- **Konfirmasi blok tidak seimbang**: meminta konfirmasi saat ukuran blok depan/belakang berbeda.
- **Ekspor berkelompok**: pisahkan hasil susunan menjadi PDF terpisah berdasarkan jumlah halaman dokumen asli dan unduh sebagai ZIP.

## Perilaku Output

- **Bawaan**: satu PDF output (satu PDF masuk, satu PDF keluar).
- **Mode berkelompok**: output dipecah menurut nilai halaman-per-dokumen Anda; jika dihasilkan beberapa potongan, semuanya diunduh sebagai satu ZIP, jika tidak satu PDF diunduh.

Jika ukuran blok tidak sama, halaman yang berpasangan disusun terlebih dahulu, dan sisa halaman tanpa pasangan ditambahkan di akhir.

## Kasus Penggunaan Umum

- Memulihkan urutan setelah memindai setumpuk formulir bolak-balik dalam dua kali proses.
- Membangun ulang paket depan/belakang dari pemindai kantor yang menghasilkan semua sisi depan lalu semua sisi belakang.
- Pascapemrosesan pindaian arsip sebelum dipecah menjadi file per dokumen.

## Tips

- Sebagian besar batch dupleks seharusnya memiliki jumlah halaman total yang genap.
- Jika sisi belakang tampak terbalik pada hasil, beralihlah antara **Balik blok halaman belakang** dan **Biarkan blok halaman belakang apa adanya**.
- Untuk dokumen asli 2 halaman (depan+belakang), gunakan ekspor berkelompok dengan `2` halaman per dokumen.

## Alat Terkait

- [Alternatif & Campur Halaman](./alternate-merge)
- [Pisah PDF](./split-pdf)
- [Gabung PDF](./merge-pdf)
- [Duplikat & Atur](./organize-pdf)
