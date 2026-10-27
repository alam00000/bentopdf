---
title: Lindungi PDF
description: Lindungi file PDF dengan kata sandi menggunakan enkripsi AES 256-bit. Atur kata sandi pengguna dan pemilik dengan pembatasan penggunaan yang dapat dikonfigurasi.
---

# Lindungi PDF

Kunci PDF Anda dengan kata sandi agar hanya orang yang berwenang yang dapat membukanya. BentoPDF menggunakan enkripsi AES 256-bit, standar yang sama dengan yang dipakai bank dan lembaga pemerintah, dan diterapkan sepenuhnya di browser Anda melalui QPDF.

## Cara Kerja

1. Unggah file PDF.
2. Masukkan **Kata Sandi Pengguna** (wajib). Ini adalah kata sandi yang diperlukan untuk membuka file.
3. Secara opsional, masukkan **Kata Sandi Pemilik**. Jika diatur, PDF mendapatkan pembatasan penggunaan yang mencegah pencetakan, pengeditan, penyalinan, dan pemberian anotasi.
4. Klik **Lindungi PDF**.
5. Unduh file terenkripsi.

## Jenis Kata Sandi

### Kata Sandi Pengguna (Wajib)

Kata sandi pengguna adalah yang diketik penerima untuk membuka PDF. Tanpanya, dokumen sama sekali tidak dapat diakses. Setiap PDF terenkripsi harus memilikinya.

### Kata Sandi Pemilik (Opsional)

Kata sandi pemilik mengatur apa yang dapat dilakukan pengguna berwenang setelah membuka file. Saat Anda mengatur kata sandi pemilik yang berbeda, BentoPDF otomatis menerapkan set pembatasan paling ketat:

- Modifikasi dinonaktifkan
- Ekstraksi/penyalinan dinonaktifkan
- Pencetakan dinonaktifkan
- Anotasi dinonaktifkan
- Pengisian formulir dinonaktifkan
- Perakitan dokumen dinonaktifkan

Jika Anda mengosongkan kata sandi pemilik, PDF tetap dienkripsi (masih memerlukan kata sandi pengguna untuk dibuka) tetapi tidak memiliki pembatasan penggunaan setelah dibuka.

## Detail Enkripsi

- **Algoritma**: AES-256 (256-bit Advanced Encryption Standard)
- **Panjang kunci**: 256 bit
- **Standar**: Enkripsi PDF 2.0 (implementasi QPDF)

AES-256 secara komputasi tidak mungkin ditembus dengan brute force menggunakan teknologi saat ini. Keamanan PDF terenkripsi Anda sepenuhnya bergantung pada kekuatan kata sandi Anda.

## Kasus Penggunaan

- Melindungi laporan keuangan rahasia sebelum dikirim lewat email
- Mengamankan dokumen hukum yang dibagikan kepada pihak lawan
- Menambahkan kata sandi pada rekam medis atau informasi identitas pribadi
- Mendistribusikan konten berbayar (e-book, laporan) dengan kontrol akses
- Memenuhi kebijakan perlindungan data yang mewajibkan enkripsi saat disimpan

## Tips

- Gunakan kata sandi yang kuat dan unik. Frasa sandi 12+ karakter dengan huruf besar dan kecil, angka, dan simbol adalah yang ideal.
- Bagikan kata sandi melalui saluran terpisah (telepon, pesan teks), jangan pernah di email yang sama dengan PDF.
- Jika Anda hanya perlu membatasi tindakan (tanpa pencetakan, tanpa penyalinan) tanpa mewajibkan kata sandi untuk membuka, gunakan alat Ubah Izin.

## Alat Terkait

- [Buka Kunci PDF](./unlock-pdf): hapus enkripsi saat Anda mengetahui kata sandinya
- [Ubah Izin](./change-permissions): ubah pembatasan penggunaan tertentu
- [Hapus Pembatasan](./remove-restrictions): hapus semua pengamanan dari PDF
- [Sanitasi PDF](./sanitize-pdf): hapus konten tersembunyi sebelum mengenkripsi
