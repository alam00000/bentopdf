---
title: Font ke Garis Tepi
description: Konversi semua font PDF menjadi garis tepi vektor agar tampil konsisten di semua perangkat. Menghilangkan masalah ketergantungan font.
---

# Font ke Garis Tepi

Mengonversi font menjadi garis tepi mengubah setiap karakter teks dari glif berbasis font menjadi jalur vektor. PDF tidak lagi bergantung pada font yang terpasang: tampilannya identik di setiap perangkat, sistem operasi, dan printer. Ini adalah langkah standar dalam alur kerja prepress.

## Cara Kerja

1. Unggah satu atau beberapa file PDF.
2. Klik **Konversi ke Garis Tepi**.
3. Ghostscript mengubah semua teks menjadi jalur vektor.
4. Unduh hasilnya. Beberapa file menghasilkan arsip ZIP.

Tidak ada pengaturan yang perlu dikonfigurasi. Alat ini menggunakan Ghostscript (WebAssembly) untuk mengubah semua referensi font menjadi jalur garis tepi dalam satu proses.

## Yang Berubah

- Karakter teks menjadi kurva vektor (jalur bezier)
- Penyematan font tidak lagi diperlukan: PDF mandiri pada tingkat glif
- Ukuran file dapat bertambah karena jalur vektor biasanya lebih besar daripada referensi font
- Tampilan visual dipertahankan persis sama

## Yang Hilang

- Pemilihan teks dan salin-tempel
- Kemampuan pencarian teks (Ctrl+F tidak lagi berfungsi)
- Kemampuan mengedit isi teks
- Aksesibilitas pembaca layar

## Kasus Penggunaan

- Mengirim PDF ke percetakan yang mewajibkan font dalam bentuk garis tepi
- Membagikan dokumen yang memakai font kustom atau berlisensi kepada orang yang tidak memiliki font tersebut
- Mencegah penggantian font yang mengubah tampilan dokumen Anda di sistem lain
- Menyiapkan PDF untuk alur kerja ukiran laser atau pemotongan CNC yang membutuhkan input vektor
- Memastikan PDF yang banyak berisi logo tampil benar di semua platform

## Tips

- Simpan PDF asli Anda. Pengubahan ke garis tepi tidak dapat dibatalkan: jalur tidak bisa dikonversi kembali menjadi teks yang dapat diedit.
- Jika teks perlu tetap dapat dicari, pertimbangkan alat Rasterisasi PDF dengan OCR sebagai langkah lanjutan.
- PDF dengan garis tepi cenderung lebih besar. Jalankan Kompres PDF setelahnya jika ukuran file penting.

## Alat Terkait

- [Ratakan PDF](./flatten-pdf): ratakan formulir dan anotasi tanpa menyentuh font
- [Rasterisasi PDF](./rasterize-pdf): konversi ke PDF berbasis gambar, bukan garis tepi vektor
- [Kompres PDF](./compress-pdf): kurangi ukuran file setelah diubah ke garis tepi
- [PDF ke PDF/A](./pdf-to-pdfa): konversi untuk arsip setelah memastikan kemandirian font
