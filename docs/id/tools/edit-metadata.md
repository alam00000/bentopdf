---
title: Edit Metadata
description: Lihat dan ubah kolom metadata PDF termasuk judul, penulis, kata kunci, tanggal, dan properti kustom.
---

# Edit Metadata

Edit metadata yang tertanam di file PDF. Alat ini mengisi formulir dengan metadata dokumen yang ada, memungkinkan Anda mengubah kolom apa pun, dan menyimpan perubahan ke PDF baru.

## Cara Kerja

1. Unggah file PDF. Alat membaca metadata saat ini dan mengisi formulir.
2. Edit kolom standar apa pun: Judul, Penulis, Subjek, Kata Kunci, Pembuat, Produsen.
3. Sesuaikan Tanggal Pembuatan dan Tanggal Modifikasi menggunakan pemilih tanggal-waktu.
4. Tambahkan kolom metadata kustom dengan mengklik tombol tambah dan memasukkan pasangan kunci-nilai.
5. Klik tombol proses untuk menyimpan PDF yang sudah dimodifikasi.

## Fitur

- Mengisi otomatis semua metadata yang ada dari PDF yang diunggah
- Kolom standar: Judul, Penulis, Subjek, Kata Kunci, Pembuat, Produsen
- Pemilih tanggal-waktu untuk Tanggal Pembuatan dan Tanggal Modifikasi
- Kolom metadata kunci-nilai kustom untuk properti sembarang
- Menyimpan perubahan langsung ke document info dictionary milik PDF

## Kolom yang Dapat Diedit

| Kolom                  | Deskripsi                                              |
| ---------------------- | ------------------------------------------------------ |
| **Judul**              | Judul dokumen yang ditampilkan di pembaca PDF          |
| **Penulis**            | Orang atau organisasi yang membuat dokumen             |
| **Subjek**             | Deskripsi singkat topik dokumen                        |
| **Kata Kunci**         | Istilah dipisah koma untuk pencarian dan pengategorian |
| **Pembuat**            | Aplikasi yang pertama kali membuat konten              |
| **Produsen**           | Aplikasi yang menghasilkan PDF                         |
| **Tanggal Pembuatan**  | Kapan dokumen pertama kali dibuat                      |
| **Tanggal Modifikasi** | Kapan dokumen terakhir diubah                          |
| **Kolom Kustom**       | Pasangan kunci-nilai tambahan yang Anda tentukan       |

## Kasus Penggunaan

- Menetapkan judul dan penulis yang tepat sebelum menerbitkan dokumen
- Menambahkan kata kunci untuk meningkatkan kemudahan pencarian di sistem manajemen dokumen
- Memperbarui tanggal modifikasi agar mencerminkan revisi terkini
- Menambahkan kolom metadata kustom seperti Department, Project ID, atau Classification
- Membersihkan metadata yang ditinggalkan perangkat lunak penyusun asli

## Tips

- Kolom kustom ditulis langsung ke info dictionary PDF. Beberapa pembaca PDF mungkin tidak menampilkan kolom kustom, tetapi kolom tersebut tetap tersimpan di file.
- Kosongkan sebuah kolom untuk menghapusnya dari metadata. Tombol proses menyimpan apa pun yang ada di formulir.
- Untuk melihat metadata tanpa mengedit, gunakan [Lihat Metadata](./view-metadata). Untuk menghapus seluruh metadata, gunakan Hapus Metadata.

## Alat Terkait

- [Lihat Metadata](./view-metadata)
- [Lapisan PDF (OCG)](./pdf-layers)
- [Kompres PDF](./compress-pdf)
