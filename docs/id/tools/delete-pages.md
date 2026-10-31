---
title: Hapus Halaman
description: Hapus halaman tertentu dari PDF menurut nomor halaman, rentang, atau pemilihan thumbnail visual.
---

# Hapus Halaman

Hapus halaman yang tidak diinginkan dari dokumen PDF. Tentukan halaman yang akan dihapus dengan mengetik nomor halaman atau rentang, atau klik langsung thumbnail halaman untuk menandainya.

## Cara Kerja

1. Unggah file PDF. Alat merender pratinjau thumbnail setiap halaman.
2. Masukkan halaman yang akan dihapus di kolom teks dengan sintaks rentang (mis., `2, 5-8`), atau klik thumbnail untuk mengaktifkan/menonaktifkannya.
3. Halaman yang ditandai disorot secara visual agar Anda dapat memastikan pilihan Anda.
4. Klik tombol proses. PDF baru dibuat tanpa halaman yang dipilih.

## Fitur

- Pemilihan halaman berbasis teks dengan sintaks rentang (`2, 5-8, 12`)
- Kisi thumbnail visual untuk penghapusan dengan klik
- Sorotan pratinjau real-time untuk halaman yang ditandai untuk dihapus
- Validasi input terhadap jumlah halaman sebenarnya
- Mempertahankan semua halaman yang tidak dihapus dalam urutan aslinya

## Kasus Penggunaan

- Menghapus halaman kosong atau halaman pengisi dari dokumen hasil pindai
- Membuang halaman sampul atau lampiran sebelum membagikan dokumen
- Membersihkan halaman draf yang tidak sengaja tertinggal di PDF final
- Menghapus halaman berisi informasi sensitif sebelum distribusi

## Tips

- Menghapus halaman tidak memengaruhi konten atau format halaman yang tersisa. Hasilnya adalah salinan setia dari aslinya dikurangi halaman yang dihapus.
- Jika Anda ingin mempertahankan halaman tertentu saja alih-alih menghapus halaman tertentu, [Ekstrak Halaman](./extract-pages) lebih cocok.
- Tampilan thumbnail dimuat secara lazy, sehingga dokumen besar tetap responsif.

## Alat Terkait

- [Ekstrak Halaman](./extract-pages)
- [Duplikat & Atur](./organize-pdf)
- [Pisah PDF](./split-pdf)
