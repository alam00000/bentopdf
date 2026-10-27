---
title: Tambahkan label halaman
description: Tambahkan label halaman PDF dengan angka Romawi, awalan huruf, penomoran kustom, dan beberapa aturan per dokumen.
---

# Tambahkan label halaman

Label halaman mengatur bagaimana nomor halaman ditampilkan di penampil PDF (nomor yang tampil di toolbar, bukan yang dicetak pada halaman). Alat ini memungkinkan Anda menetapkan skema pelabelan berbeda untuk rentang halaman yang berbeda: angka Romawi untuk bagian awal, angka desimal untuk isi, lampiran berhuruf, dan lainnya.

## Cara Kerja

1. Unggah file PDF Anda.
2. Panel opsi muncul dengan satu aturan label secara default.
3. Atur setiap aturan dengan rentang halaman, gaya, awalan opsional, dan nilai awal.
4. Klik **Tambah Aturan** untuk membuat aturan tambahan bagi bagian yang berbeda.
5. Klik **Tambahkan Label Halaman** untuk menerapkan semua aturan dan mengunduh hasilnya.

## Opsi

Setiap aturan label memiliki pengaturan berikut:

- **Rentang Halaman** -- Halaman mana yang dikenai aturan. Biarkan kosong untuk semua halaman. Mendukung rentang seperti `1-4`, `7`, `odd`, atau `1-9,30-40`.
- **Gaya Label** -- Angka Arab desimal, Romawi huruf kecil (i, ii, iii), Romawi huruf besar (I, II, III), Huruf kecil (a, b, c), Huruf besar (A, B, C), atau Tanpa Label (hanya awalan).
- **Awalan Label** -- Teks opsional yang ditambahkan di depan setiap label, misalnya "A-" untuk membuat label seperti A-1, A-2, A-3.
- **Nilai Awal** -- Angka tempat mulai menghitung. Default 1. Atur ke 0 untuk penomoran berbasis nol.
- **Lanjutkan penomoran di rentang yang terpisah** -- Aktifkan ini saat aturan menargetkan halaman yang tidak berurutan (seperti `1-9,30-40` atau `odd`) dan Anda ingin penomoran tetap berlanjut secara berurutan.
- **Hapus label halaman yang ada** -- Dicentang secara default. Menghapus label sebelumnya sebelum menerapkan aturan baru Anda.

## Fitur

- Beberapa aturan label per dokumen untuk skema penomoran yang kompleks
- Enam gaya label yang mencakup semua sistem penomoran standar
- Dukungan awalan kustom untuk pelabelan per bagian
- Dukungan rentang terpisah dengan penomoran bertahap
- Opsi untuk mempertahankan atau menghapus label yang ada

## Kasus Penggunaan

- Mengatur label angka Romawi (i, ii, iii) untuk kata pengantar buku dan label desimal untuk isi utama
- Memberi label halaman lampiran dengan awalan huruf seperti "A-1", "A-2", "B-1", "B-2"
- Memperbaiki label halaman pada dokumen hasil pindai yang nomor halaman fisiknya tidak sesuai dengan urutan halaman PDF
- Menambahkan penomoran berbasis nol untuk dokumen teknis

## Tips

- Label halaman adalah metadata yang ditampilkan penampil PDF di toolbar navigasinya. Label tidak dicetak pada halaman. Untuk nomor yang terlihat, gunakan [Nomor Halaman](./page-numbers).
- Alat ini memerlukan CoherentPDF (CPDF) yang dikonfigurasi di Pengaturan WASM Anda. Jika belum diatur, Anda akan diminta untuk mengonfigurasinya.

## Alat Terkait

- [Nomor Halaman](./page-numbers)
- [Penomoran Bates](./bates-numbering)
- [Edit Bookmark](./bookmark)
