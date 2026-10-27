---
title: Kepala & Kaki Halaman
description: Tambahkan teks header dan footer yang dapat disesuaikan ke halaman PDF dengan variabel nomor halaman dinamis.
---

# Kepala & Kaki Halaman

Tambahkan teks ke enam posisi pada halaman PDF Anda: header kiri, header tengah, header kanan, footer kiri, footer tengah, dan footer kanan. Alat ini mendukung variabel dinamis untuk nomor halaman dan jumlah total halaman, sehingga Anda dapat membuat templat seperti "Halaman 3 dari 10" yang diperbarui otomatis di setiap halaman.

## Cara Kerja

1. Unggah file PDF Anda.
2. Panel opsi muncul menampilkan kontrol pemformatan dan enam kolom input teks.
3. Masukkan teks yang diinginkan pada posisi header/footer mana pun.
4. Gunakan placeholder `{page}` dan `{total}` untuk penomoran halaman dinamis.
5. Atur ukuran font, warna font, dan secara opsional batasi ke rentang halaman tertentu.
6. Klik **Tambah Kepala & Kaki Halaman** untuk memproses dan mengunduh.

## Opsi

- **Rentang Halaman**: Secara opsional batasi halaman yang mendapat header dan footer. Biarkan kosong untuk menerapkan ke semua halaman. Format: "1-3, 5" (rentang dipisahkan koma).
- **Ukuran Font**: Antara 6 dan 24 poin. Default 10.
- **Warna Font**: Pilih warna apa pun menggunakan pemilih warna.
- **Header Kiri / Tengah / Kanan**: Kolom teks untuk bagian atas setiap halaman.
- **Footer Kiri / Tengah / Kanan**: Kolom teks untuk bagian bawah setiap halaman.

## Fitur

- Enam posisi teks independen per halaman
- Variabel dinamis `{page}` yang menyisipkan nomor halaman saat ini
- Variabel dinamis `{total}` yang menyisipkan jumlah total halaman
- Penyaringan rentang halaman untuk menargetkan halaman tertentu
- Ukuran dan warna font yang dapat disesuaikan
- Font Helvetica untuk hasil yang bersih dan profesional

## Kasus Penggunaan

- Menambahkan "Halaman {page} dari {total}" di footer tengah sebuah laporan
- Menempatkan nama perusahaan di header kiri dan tanggal dokumen di header kanan
- Menambahkan pemberitahuan kerahasiaan di footer dokumen hukum
- Menstempel nomor revisi dokumen pada rentang halaman tertentu

## Tips

- Gabungkan `{page}` dan `{total}` dalam satu kolom untuk format seperti "Halaman {page} dari {total}" atau "{page}/{total}".
- Anda dapat mengosongkan sebagian besar kolom dan hanya mengisi posisi yang diperlukan. Kolom kosong akan dilewati.
- Untuk header yang lebih kompleks dengan gambar atau logo, pertimbangkan alat [Tambah Watermark](./add-watermark) yang diposisikan di bagian atas halaman.

## Alat Terkait

- [Nomor Halaman](./page-numbers)
- [Tambah Watermark](./add-watermark)
- [Penomoran Bates](./bates-numbering)
