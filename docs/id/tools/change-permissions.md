---
title: Ubah Izin
description: Atur atau ubah izin penggunaan PDF untuk mencetak, menyalin, mengedit, dan memberi anotasi. Menggunakan enkripsi AES 256-bit.
---

# Ubah Izin

Atur secara rinci apa yang dapat dilakukan penerima terhadap PDF Anda. Berbeda dengan enkripsi dasar yang hanya mengunci file dengan kata sandi, alat ini memungkinkan Anda mengizinkan atau melarang pencetakan, penyalinan, pengeditan, anotasi, pengisian formulir, perakitan dokumen, dan ekstraksi halaman secara selektif, semuanya diberlakukan melalui enkripsi AES 256-bit.

## Cara Kerja

1. Unggah file PDF.
2. Jika PDF sudah terenkripsi, masukkan **Kata Sandi Saat Ini**.
3. Tetapkan **Kata Sandi Pengguna Baru** (diperlukan untuk membuka) dan/atau **Kata Sandi Pemilik Baru** (mengatur izin).
4. Aktifkan atau nonaktifkan setiap izin menggunakan kotak centang.
5. Klik **Ubah Izin**.
6. Unduh PDF yang telah diperbarui.

Jika Anda mengosongkan kedua kolom kata sandi baru, alat akan mendekripsi PDF sepenuhnya, menghapus semua enkripsi dan pembatasan.

## Kontrol Izin

| Izin                           | Yang Dikontrol                                          |
| ------------------------------ | ------------------------------------------------------- |
| **Izinkan Pencetakan**         | Apakah dokumen boleh dicetak                            |
| **Izinkan Menyalin Teks**      | Apakah teks dan gambar boleh dipilih dan disalin        |
| **Izinkan Pengubahan**         | Apakah konten dokumen boleh diedit                      |
| **Izinkan Anotasi**            | Apakah komentar, sorotan, dan stempel boleh ditambahkan |
| **Izinkan Pengisian Formulir** | Apakah kolom formulir interaktif boleh diisi            |
| **Izinkan Penyusunan Dokumen** | Apakah halaman boleh disisipkan, dihapus, atau diputar  |
| **Izinkan Ekstraksi Halaman**  | Apakah halaman tertentu boleh diekstrak                 |

Semua izin memerlukan kata sandi pemilik agar dapat diberlakukan. Tanpa kata sandi pemilik, flag izin diabaikan oleh sebagian besar pembaca PDF.

## Cara Kerja Izin di PDF

Izin PDF merupakan bagian dari spesifikasi enkripsi. Izin disimpan sebagai bit flag di dalam encryption dictionary dan diberlakukan oleh pembaca PDF yang patuh. Perbedaan utamanya:

- **Kata sandi pengguna**: Diperlukan untuk membuka file sama sekali.
- **Kata sandi pemilik**: Diperlukan untuk mengubah izin atau menghapus pembatasan. Tanpanya, flag izin menentukan operasi apa yang boleh dilakukan pengguna.

Jika Anda hanya menetapkan kata sandi pemilik (tanpa kata sandi pengguna), siapa pun dapat membuka file tetapi dibatasi pada operasi yang diizinkan. Jika Anda menetapkan keduanya, file memerlukan kata sandi untuk dibuka dan dibatasi setelah autentikasi.

## Kasus Penggunaan

- Mendistribusikan laporan yang dapat dilihat dan dicetak tetapi tidak dapat diedit atau disalin
- Membagikan templat kontrak yang dapat diisi penerima tetapi tidak dapat diubah
- Menerbitkan katalog PDF dengan penyalinan gambar dinonaktifkan
- Mengizinkan anotasi pada draf tinjauan sambil mencegah perubahan struktur

## Tips

- Agar efektif, selalu tetapkan kata sandi pemilik. Izin tanpa kata sandi pemilik tidak dapat ditegakkan.
- Beberapa alat PDF pihak ketiga mengabaikan flag izin. Untuk perlindungan lebih kuat, pertimbangkan merasterisasi PDF atau menggunakan DRM.
- Gunakan alat ini untuk meningkatkan PDF lama berenkripsi RC4 ke AES-256.

## Alat Terkait

- [Lindungi PDF](./protect-pdf): perlindungan kata sandi sederhana tanpa izin yang terperinci
- [Buka Kunci PDF](./unlock-pdf): hapus enkripsi sepenuhnya
- [Hapus Pembatasan](./remove-restrictions): hapus semua pembatasan jika Anda memiliki kata sandi pemilik
