---
title: PDF ke Skala Abu-abu
description: Konversi PDF berwarna menjadi versi skala abu-abu (hitam putih). Menghasilkan PDF baru tanpa warna pada setiap halaman.
---

# PDF ke Skala Abu-abu

Mengonversi PDF berwarna menjadi versi skala abu-abu. Setiap halaman dirender, didesaturasi, dan disematkan ulang sebagai gambar JPEG dalam PDF baru. Hasilnya mempertahankan dimensi halaman asli.

## Cara Kerja

1. Unggah PDF dengan mengklik zona lepas atau menyeret file ke dalamnya.
2. Klik **Konversi** untuk memproses file.
3. File `greyscale.pdf` baru diunduh dengan semua halaman dikonversi menjadi hitam putih.

Di balik layar, setiap halaman dirender pada skala 2x, data pikselnya dilewatkan melalui filter skala abu-abu, lalu dienkode ulang sebagai JPEG berkualitas 90% dan ditempatkan dalam dokumen PDF baru.

## Opsi

Alat ini tidak memiliki opsi yang dapat diatur. Konversi skala abu-abu memakai rumus luminansi standar dan kualitas JPEG ditetapkan 90%.

## Format Hasil

- Satu file `greyscale.pdf` berisi semua halaman sebagai gambar JPEG skala abu-abu.

## Kasus Penggunaan

- Menyiapkan dokumen untuk pencetakan hitam putih guna menghemat biaya tinta warna.
- Memenuhi persyaratan pengajuan untuk berkas hukum atau pemerintah yang mewajibkan skala abu-abu.
- Mengurangi ukuran file pada PDF yang banyak warna (gambar JPEG skala abu-abu lebih kecil daripada berwarna).
- Membuat gaya visual yang konsisten pada dokumen dengan halaman berwarna dan hitam putih.

## Tips

- Karena setiap halaman dirasterisasi dan disematkan ulang sebagai JPEG, hasilnya berbasis gambar. Teks pada PDF asli tidak lagi dapat dipilih atau dicari. Jika Anda memerlukan teks yang dapat dicari setelahnya, jalankan hasilnya melalui alat OCR.
- Untuk kontrol penyesuaian warna lebih lanjut (kecerahan, kontras, saturasi), lihat alat Sesuaikan Warna atau node Skala Abu-abu di [Pembangun Alur Kerja PDF](./pdf-workflow).

## Alat Terkait

- [PDF ke JPG](./pdf-to-jpg)
- [PDF ke PNG](./pdf-to-png)
- [Pembangun Alur Kerja PDF](./pdf-workflow)
