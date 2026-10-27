---
title: Layer OCG PDF
description: Lihat, alihkan, tambah, dan hapus layer Optional Content Group (OCG) dalam dokumen PDF.
---

# Layer OCG PDF

Kelola Optional Content Group (OCG), yang umum disebut "layer", di dalam PDF. Anda dapat mengalihkan visibilitas layer, menambah layer baru (termasuk layer anak bertingkat), menghapus layer, dan menyimpan PDF yang telah diubah.

## Cara Kerja

1. Unggah file PDF.
2. Klik tombol proses untuk memuat dokumen dengan engine PyMuPDF.
3. Alat ini menampilkan semua layer yang ada beserta status visibilitas, status kunci, dan hierarki bertingkatnya.
4. Centang atau hapus centang kotak untuk menampilkan atau menyembunyikan layer. Layer terkunci tidak dapat dialihkan.
5. Tambahkan layer tingkat atas dengan mengetik nama lalu mengklik tombol tambah, atau tambahkan layer anak di bawah induk yang ada.
6. Hapus layer yang tidak lagi Anda perlukan.
7. Klik **Simpan** untuk mengunduh PDF yang telah diubah dengan perubahan layer Anda.

## Fitur

- Menampilkan hierarki layer dengan indentasi yang tepat untuk layer bertingkat
- Mengalihkan visibilitas layer
- Indikator layer terkunci mencegah perubahan tidak sengaja
- Menambah layer tingkat atas atau layer anak dengan nama kustom
- Menghapus layer satu per satu
- Menyimpan semua perubahan ke file PDF baru

## Kasus Penggunaan

- Mengalihkan visibilitas layer markup pada gambar arsitektur atau teknik
- Menambah layer anotasi baru pada dokumen desain multi-layer
- Menghapus layer usang dari templat sebelum didistribusikan
- Memeriksa layer apa saja yang ada dalam PDF kompleks dari pihak ketiga

## Tips

- Jika PDF tidak memiliki layer, alat ini menampilkan tampilan kosong dengan ajakan untuk menambahkan satu. Tidak semua PDF menggunakan layer OCG, layer paling umum ada pada ekspor CAD dan file desain.
- Layer anak ditampilkan menjorok di bawah induknya. Anda dapat menumpuk layer hingga kedalaman berapa pun.
- Layer terkunci ditampilkan dengan ikon kunci dan kotak centangnya dinonaktifkan. Kunci ini diatur oleh pembuat PDF.

## Alat Terkait

- [Lihat Metadata](./view-metadata)
- [Edit Metadata](./edit-metadata)
- [Atur & Duplikat](./organize-pdf)
