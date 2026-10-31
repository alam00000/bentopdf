---
title: Buka Kunci PDF
description: Hapus perlindungan kata sandi dari PDF terenkripsi. Mendukung dekripsi massal dengan satu kata sandi untuk banyak file.
---

# Buka Kunci PDF

Jika Anda memiliki kata sandi PDF terenkripsi, alat ini menghapus enkripsinya sepenuhnya dan menghasilkan salinan tanpa kunci yang bisa dibuka siapa saja tanpa kredensial. Alat ini mendukung dekripsi massal ketika beberapa PDF memakai kata sandi yang sama.

## Cara Kerja

1. Unggah satu atau beberapa file PDF terenkripsi.
2. Masukkan **kata sandi** yang digunakan untuk melindungi file.
3. Klik **Dekripsi PDF**.
4. Satu file akan langsung diunduh. Beberapa file menghasilkan arsip ZIP berisi semua PDF yang sudah dibuka kuncinya.

## Fitur

- Dekripsi satu file dan massal
- Mendukung kata sandi pengguna maupun kata sandi pemilik
- Menghasilkan keluaran tanpa enkripsi sama sekali dan tanpa sisa pembatasan
- Pelaporan error yang jelas untuk kata sandi salah atau file rusak
- Pelacakan berhasil/gagal per file dalam mode massal

## Perbedaan dengan Hapus Pembatasan

**Dekripsi PDF** memerlukan kata sandi dan menghapus seluruh enkripsi. **Hapus Pembatasan** menargetkan pembatasan penggunaan (cetak, salin, edit) dan mungkin tidak memerlukan kata sandi jika hanya kata sandi pemilik yang diatur. Gunakan Dekripsi jika PDF sama sekali tidak bisa dibuka tanpa kata sandi.

## Kasus Penggunaan

- Membuka kunci PDF yang dulu Anda enkripsi secara permanen ketika kata sandinya tidak lagi diperlukan
- Menghapus enkripsi dari sekumpulan dokumen arsip agar lebih mudah diakses dalam jangka panjang
- Menyiapkan PDF berkata sandi untuk sistem manajemen dokumen yang tidak mendukung file terenkripsi
- Membuka kunci PDF sebelum menggabungkannya dengan dokumen lain (banyak alat penggabung tidak bisa memproses masukan terenkripsi)

## Tips

- Kolom kata sandi berlaku untuk semua file yang diunggah. Jika PDF Anda memiliki kata sandi berbeda, proses dalam batch terpisah.
- Jika muncul error "Kata Sandi Salah", periksa kembali spasi di akhir atau caps lock.
- Setelah didekripsi, keluaran sama sekali tidak memiliki pengamanan. Enkripsi ulang dengan Enkripsi PDF jika Anda perlu menerapkan kata sandi baru.

## Alat Terkait

- [Lindungi PDF](./protect-pdf): terapkan kembali enkripsi dengan kata sandi baru
- [Hapus Pembatasan](./remove-restrictions): hapus pembatasan penggunaan tanpa dekripsi penuh
- [Ubah Izin](./change-permissions): ubah izin tertentu pada PDF terenkripsi
