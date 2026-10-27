---
title: XPS ke PDF
description: Konversi dokumen XPS dan OXPS ke format PDF di browser Anda. Tanpa unggah, tanpa daftar, sepenuhnya privat.
---

# XPS ke PDF

Konversi dokumen Microsoft XPS dan OXPS menjadi file PDF standar. XPS (XML Paper Specification) adalah jawaban Microsoft atas PDF, tetapi dukungannya makin menyusut di berbagai platform. Alat ini membuat dokumen tersebut dapat dibaca secara universal lagi.

## Format yang Didukung

| Format | Ekstensi | Catatan                           |
| :----- | :------- | :-------------------------------- |
| XPS    | `.xps`   | Format XPS asli Microsoft         |
| OXPS   | `.oxps`  | Open XPS, varian standar ECMA-388 |

## Cara Kerja

1. Klik area unggah atau seret dan lepas file XPS/OXPS Anda. Anda bisa memilih beberapa file sekaligus.
2. Tinjau daftar file. Hapus file tertentu dengan ikon tempat sampah, atau klik **Tambah Lebih Banyak File** untuk menambah dokumen.
3. Klik **Konversi ke PDF**. Mesin PyMuPDF memproses setiap dokumen secara lokal di browser Anda.
4. Satu file langsung diunduh sebagai PDF. Beberapa file dikemas dalam arsip ZIP bernama `xps-converted.zip`.

## Opsi

Alat ini melakukan konversi format langsung tanpa konfigurasi tambahan. Keluaran mempertahankan dimensi halaman, grafik vektor, font, dan gambar asli dari sumber XPS.

## Kasus Penggunaan

- Membuka file XPS dari sistem Windows lama yang memakai driver cetak XPS secara default
- Mengonversi dokumen OXPS dari Windows 10/11 untuk dibagikan ke pengguna macOS atau Linux
- Mengarsipkan file XPS lama ke format yang lebih luas didukung
- Membuat dokumen pemerintah atau perusahaan berbasis XPS dapat diakses oleh penerima eksternal

## Tips

- Ekstensi `.xps` dan `.oxps` ditangani otomatis, jadi Anda bisa mencampurnya dalam batch yang sama.
- Jika file XPS asli dibuat dari driver cetak beresolusi tinggi, PDF hasilnya mempertahankan kualitas itu. Tidak ada resampling.

## Alat Terkait

- [Word ke PDF](./word-to-pdf)
- [XML ke PDF](./xml-to-pdf)
