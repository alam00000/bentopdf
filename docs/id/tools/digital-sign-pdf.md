---
title: Tanda Tangan Digital
description: Tambahkan tanda tangan digital kriptografis ke PDF menggunakan sertifikat X.509. Mendukung format PKCS#12 dan PEM dengan opsi tanda tangan yang terlihat.
---

# Tanda Tangan Digital

Tanda tangan digital adalah bukti kriptografis bahwa orang tertentu telah menandatangani dokumen dan dokumen tersebut tidak diubah sejak saat itu. Berbeda dengan tanda tangan gambar (yang hanya berupa gambar), tanda tangan digital menggunakan sertifikat X.509 dan standar PKCS#7 untuk memberikan keaslian dan integritas yang dapat diverifikasi.

BentoPDF menerapkan tanda tangan digital sepenuhnya di browser Anda. Kunci privat Anda tidak pernah meninggalkan perangkat Anda.

## Cara Kerja

1. Unggah file PDF.
2. Unggah file sertifikat Anda (.pfx, .p12, atau .pem).
3. Masukkan kata sandi sertifikat untuk membukanya. Alat menampilkan subjek sertifikat, penerbit, dan masa berlaku.
4. Secara opsional, atur metadata tanda tangan (alasan, lokasi, info kontak).
5. Secara opsional, aktifkan **Tanda Tangan Terlihat** dengan kustomisasi posisi, ukuran, gambar, dan teks.
6. Klik **Tandatangani PDF**.

## Format Sertifikat yang Didukung

| Format      | Ekstensi   | Deskripsi                                                                                                           |
| ----------- | ---------- | ------------------------------------------------------------------------------------------------------------------- |
| **PKCS#12** | .pfx, .p12 | Bundel standar industri yang berisi kunci privat dan rantai sertifikat. Format paling umum.                         |
| **PEM**     | .pem       | Format berbasis teks. Harus berisi sertifikat dan kunci privat dalam satu file. Mendukung kunci privat terenkripsi. |

## Opsi Tanda Tangan yang Terlihat

Jika diaktifkan, blok tanda tangan yang terlihat dirender pada halaman PDF:

- **Posisi**: koordinat X/Y serta lebar/tinggi dalam point
- **Halaman**: halaman pertama, halaman terakhir, semua halaman, atau nomor halaman tertentu
- **Gambar**: unggah gambar PNG, JPG, atau WebP (tanda tangan tulisan tangan Anda, stempel perusahaan, dll.)
- **Teks**: teks kustom dengan warna dan ukuran font yang dapat diatur. Jika tidak ada gambar atau teks, alat membuat teks otomatis dari common name sertifikat dan tanggal saat ini.

## Metadata Tanda Tangan

- **Alasan**: Alasan dokumen ditandatangani (mis., "Disetujui", "Ditinjau")
- **Lokasi**: Tempat penandatanganan berlangsung (mis., "Jakarta")
- **Info Kontak**: Cara menghubungi penandatangan (mis., alamat email)

## Catatan Koneksi Internet

Penandatanganan mungkin memerlukan koneksi internet. Pustaka penandatanganan mengambil rantai sertifikat dari URL yang tertanam di ekstensi Authority Information Access (AIA) pada sertifikat Anda. Jika server tersebut tidak dapat dijangkau, penandatanganan akan gagal untuk sertifikat yang memerlukan validasi rantai.

## Kasus Penggunaan

- Menandatangani kontrak, proposal, dan perjanjian dengan tanda tangan digital yang mengikat secara hukum
- Mengesahkan dokumen resmi dalam alur kerja yang memerlukan autentikasi berbasis PKI
- Menandatangani faktur PDF untuk kepatuhan regulasi (banyak negara UE mewajibkan e-faktur bertanda tangan digital)
- Menambahkan persetujuan organisasi pada gambar teknik atau dokumen mutu

## Tips

- Sertifikat self-signed berfungsi untuk pengujian tetapi akan menampilkan peringatan di Adobe Reader. Gunakan sertifikat dari Certificate Authority tepercaya untuk dokumen produksi.
- Tanda tangan yang terlihat hanya bersifat visual. Tanda tangan kriptografis tertanam terlepas dari apakah blok yang terlihat diaktifkan.
- Verifikasi PDF yang sudah ditandatangani dengan alat Validasi Tanda Tangan untuk memastikan tanda tangan masih utuh.

## Alat Terkait

- [Validasi Tanda Tangan PDF](./validate-signature-pdf): verifikasi tanda tangan digital pada PDF yang ditandatangani
- [Ratakan PDF](./flatten-pdf): ratakan formulir sebelum menandatangani untuk mencegah modifikasi
- [Lindungi PDF](./protect-pdf): tambahkan perlindungan kata sandi di atas tanda tangan digital
- [Hapus Metadata](./remove-metadata): buang metadata sebelum menandatangani
