---
title: Validasi Tanda Tangan
description: Verifikasi tanda tangan digital pada file PDF. Periksa validitas sertifikat, identitas penanda tangan, integritas dokumen, dan status rantai kepercayaan.
---

# Validasi Tanda Tangan

Unggah PDF yang sudah ditandatangani dan alat ini akan mengekstrak setiap tanda tangan digital, mengidentifikasi penanda tangan, memeriksa validitas sertifikat, dan melaporkan apakah dokumen diubah sejak ditandatangani. Anda juga dapat menyertakan sertifikat tepercaya untuk memverifikasi rantai tanda tangan.

## Cara Kerja

1. Unggah file PDF yang sudah ditandatangani. Validasi dimulai secara otomatis.
2. Alat menampilkan ringkasan: jumlah tanda tangan yang ditemukan dan berapa yang valid.
3. Setiap tanda tangan mendapat kartu rinci yang menampilkan nama penanda tangan, penerbit, tanggal, dan status.
4. Opsional, unggah **sertifikat tepercaya** (.pem, .crt, .cer, .der) untuk memverifikasi tanda tangan terhadap jangkar kepercayaan tertentu. Validasi ulang berjalan otomatis.

## Yang Diperiksa

### Penguraian Tanda Tangan

Alat mengekstrak objek tanda tangan PKCS#7 dari PDF, mendekode struktur ASN.1, dan mengambil sertifikat X.509 penanda tangan beserta rantai sertifikat yang tertanam di dalam tanda tangan.

### Validitas Sertifikat

- **Kedaluwarsa**: Apakah sertifikat saat ini masih berada dalam rentang tanggal berlakunya?
- **Deteksi tanda tangan sendiri**: Apakah sertifikat adalah penerbitnya sendiri?
- **Rantai kepercayaan**: Jika sertifikat tepercaya diberikan, apakah sertifikat penanda tangan tersambung ke sertifikat tersebut?

### Verifikasi Kriptografis

- Alat merekonstruksi byte yang dicakup oleh `/ByteRange` tanda tangan, melakukan hash dengan algoritma yang dinyatakan penanda tangan, lalu membandingkan hasilnya dengan atribut `messageDigest` di dalam tanda tangan.
- Kemudian alat menserialisasi ulang atribut yang ditandatangani sebagai DER SET dan memverifikasi tanda tangan terhadap kunci publik sertifikat penanda tangan.
- **Tanda tangan dilaporkan valid hanya jika semua pemeriksaan ini lolos.** Jika byte PDF diubah setelah penandatanganan, atau tanda tangan yang tertanam tidak cocok dengan kunci penanda tangan, status menampilkan "Tidak valid: Verifikasi Kriptografi Gagal" beserta alasan spesifiknya.

#### Algoritma Tanda Tangan yang Didukung

| Algoritma               | Jalur verifikasi                                                                          |
| ----------------------- | ----------------------------------------------------------------------------------------- |
| RSA (PKCS#1 v1.5)       | node-forge `publicKey.verify`, dengan cadangan Web Crypto                                 |
| RSA-PSS (RSASSA-PSS)    | Web Crypto `verify({name: 'RSA-PSS', saltLength})`                                        |
| ECDSA P-256/P-384/P-521 | Web Crypto `verify({name: 'ECDSA', hash})` setelah konversi tanda tangan DER → IEEE P1363 |

Jika tanda tangan memakai algoritma di luar daftar ini (misalnya Ed25519, SM2, atau RSA dengan OID digest yang tidak lazim), kartu menampilkan **"Tidak Terverifikasi: Algoritma Tanda Tangan Tidak Didukung"** dengan warna kuning, beserta OID atau alasan spesifiknya. Ini adalah pembedaan tiga status yang disengaja:

- **Valid**: tanda tangan terverifikasi secara kriptografis terhadap kunci publik penanda tangan.
- **Tidak valid**: verifikasi berjalan dan menghasilkan hasil negatif (byte berubah, kunci tidak cocok).
- **Tidak terverifikasi**: alat tidak dapat menjalankan verifikasi untuk algoritma ini. Metadata sertifikat tetap ditampilkan, tetapi anggap tanda tangan sebagai "tidak diketahui" dan verifikasi dengan Adobe Acrobat atau `openssl cms -verify`.

### Algoritma Digest yang Tidak Aman

- Tanda tangan yang memakai **MD5 atau SHA-1** ditolak sebagai tidak valid dan ditandai dengan status "Digest Tidak Aman". Kedua algoritma ini memiliki serangan tabrakan yang sudah dipublikasikan, sehingga tanda tangan atas hash SHA-1 atau MD5 tidak memberikan jaminan integritas.
- SHA-224, SHA-256, SHA-384, dan SHA-512 semuanya diterima.

### Cakupan Dokumen

- **Cakupan penuh**: Tanda tangan mencakup seluruh file PDF, artinya tidak ada byte yang ditambahkan atau diubah setelah penandatanganan.
- **Cakupan sebagian**: Tanda tangan hanya mencakup sebagian file. Ini bisa menandakan adanya perubahan setelah penandatanganan (belum tentu berbahaya, karena penyimpanan inkremental menghasilkan cakupan sebagian).

## Detail Tanda Tangan

Setiap kartu tanda tangan menampilkan:

- **Ditandatangani Oleh**: Nama umum, organisasi, dan email dari sertifikat penanda tangan
- **Penerbit**: Otoritas Sertifikat yang menerbitkan sertifikat penanda tangan
- **Ditandatangani Pada**: Cap waktu yang tertanam dalam tanda tangan
- **Berlaku Dari / Berlaku Hingga**: Masa berlaku sertifikat
- **Alasan**: Mengapa dokumen ditandatangani (jika diberikan)
- **Lokasi**: Di mana dokumen ditandatangani (jika diberikan)
- **Status Cakupan**: Penuh atau Sebagian
- **Lencana Kepercayaan**: Tepercaya atau Tidak dalam rantai kepercayaan (hanya jika sertifikat kustom diberikan)

### Detail Teknis

Perluas bagian detail teknis untuk melihat:

- Nomor seri sertifikat penanda tangan
- Algoritma digest (SHA-256, SHA-512, dll.)
- Algoritma tanda tangan (RSA dengan SHA-256, ECDSA dengan SHA-256, dll.)
- Pesan error untuk tanda tangan yang tidak valid

## Kasus Penggunaan

- Memverifikasi kontrak bertanda tangan digital sebelum ikut menandatangani
- Mengaudit dokumen bertanda tangan untuk memastikan tidak dimanipulasi
- Memeriksa apakah sertifikat sudah kedaluwarsa sejak dokumen ditandatangani
- Memvalidasi tanda tangan terhadap sertifikat root organisasi Anda
- Memeriksa detail penandatanganan dokumen pemerintah atau hukum

## Tips

- Sertifikat yang ditandatangani sendiri tidak berarti tanda tangannya tidak valid, melainkan identitas penanda tangan tidak dapat diverifikasi lewat pihak ketiga tepercaya. Ini umum pada dokumen internal.
- Cakupan sebagian tidak selalu menandakan manipulasi. Banyak alur kerja PDF menambahkan pembaruan inkremental (seperti tanda tangan kedua) yang menghasilkan cakupan sebagian.
- Unggah sertifikat root atau intermediate organisasi Anda sebagai sertifikat tepercaya untuk mendapatkan verifikasi rantai kepercayaan.

## Alat Terkait

- [Tanda Tangan Digital PDF](./digital-sign-pdf): tandatangani PDF dengan sertifikat Anda sendiri
- [Ratakan PDF](./flatten-pdf): ratakan PDF sebelum ditandatangani untuk mencegah perubahan setelah penandatanganan
- [Hapus Metadata](./remove-metadata): bersihkan PDF sebelum menerapkan tanda tangan
