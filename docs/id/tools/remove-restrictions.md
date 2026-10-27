---
title: Hapus Pembatasan
description: Hapus perlindungan kata sandi, pembatasan pencetakan, kunci pengeditan, dan batasan penyalinan dari file PDF.
---

# Hapus Pembatasan

PDF dapat memiliki dua jenis kata sandi: kata sandi pengguna (diperlukan untuk membuka file) dan kata sandi pemilik (mengatur apa yang dapat Anda lakukan dengan file). Alat ini menghapus keduanya beserta semua pembatasan terkait: kunci pencetakan, pengeditan, penyalinan, dan anotasi.

## Cara Kerja

1. Unggah file PDF.
2. Jika PDF memiliki kata sandi pemilik, masukkan di kolom **Kata Sandi Pemilik**. Biarkan kosong jika PDF hanya memiliki pembatasan penggunaan tanpa kata sandi.
3. Klik **Hapus Pembatasan**.
4. Unduh PDF tanpa pembatasan.

Alat ini menggunakan flag `--decrypt` dan `--remove-restrictions` dari QPDF untuk menghasilkan salinan yang bersih dan tanpa pembatasan.

## Yang Dihapus

- Perlindungan kata sandi (kata sandi pengguna dan pemilik)
- Pembatasan pencetakan
- Pembatasan pengeditan
- Pembatasan penyalinan teks dan gambar
- Pembatasan anotasi dan komentar
- Semua batasan keamanan lain yang dikodekan di PDF

## Kasus Penggunaan

- Membuka kunci PDF milik Anda yang kata sandinya Anda atur bertahun-tahun lalu
- Menghapus pembatasan cetak dari dokumen yang Anda akses secara sah
- Mengaktifkan salin-tempel pada materi referensi untuk mencatat
- Menyiapkan PDF untuk alat aksesibilitas yang tidak dapat menangani dokumen terbatas

## Tips

- Anda harus mengetahui kata sandi pemilik jika ada. Alat ini tidak memecahkan atau menebak kata sandi dengan brute force.
- Jika Anda perlu mempertahankan enkripsi tetapi mengubah izin tertentu, gunakan alat Ubah Izin.
- File hasil tidak memiliki enkripsi sama sekali, sehingga siapa pun yang menerimanya dapat membukanya dengan bebas.

## Alat Terkait

- [Buka Kunci PDF](./unlock-pdf): buka kunci PDF saat Anda mengetahui kata sandi pengguna
- [Lindungi PDF](./protect-pdf): terapkan kembali enkripsi dengan pengaturan baru
- [Ubah Izin](./change-permissions): ubah secara selektif tindakan yang diizinkan
