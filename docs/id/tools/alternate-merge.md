---
title: Selang-seling & Campur Halaman
description: Gabungkan PDF dengan menyisipkan halaman dari setiap file secara bergantian, dengan bookmark tetap dipertahankan.
---

# Selang-seling & Campur Halaman

Selingi halaman dari beberapa file PDF sehingga halaman muncul bergantian antardokumen. Gunakan alat ini ketika penggabungan biasa hanya menyambung file ujung ke ujung, padahal Anda membutuhkan halaman 1 File A, lalu halaman 1 File B, lalu halaman 2 File A, dan seterusnya.

## Cara Kerja

1. Unggah setidaknya dua file PDF menggunakan area unggah.
2. Alat ini menampilkan setiap file beserta jumlah halaman dan ukuran filenya.
3. Seret pegangan untuk mengatur ulang halaman file mana yang tampil lebih dulu dalam urutan penyelingan.
4. Klik **Campur Halaman** untuk menghasilkan keluaran yang diselingi.
5. Hasilnya diunduh sebagai `alternated-mixed.pdf`.

## Fitur

- Menyelingi halaman dari sejumlah PDF (minimal dua)
- Pengaturan ulang urutan file dengan seret dan lepas untuk mengatur prioritas penyelingan
- Mempertahankan bookmark dari dokumen sumber
- Menampilkan jumlah halaman dan ukuran file untuk setiap file yang diunggah
- Diproses melalui web worker khusus agar UI tetap responsif

## Kasus Penggunaan

- Menyusun ulang hasil pindai bolak-balik ketika halaman ganjil dan genap dipindai secara terpisah
- Menggabungkan lembar soal dengan kunci jawaban sehingga setiap soal diikuti jawabannya
- Menggabungkan dokumen dua bahasa halaman demi halaman (misalnya bahasa Inggris di satu sisi, terjemahan di sisi berikutnya)
- Menyelingi pindaian depan dan belakang dari pemindai satu sisi

## Tips

- Jika PDF sumber Anda memiliki jumlah halaman berbeda, halaman dokumen yang lebih pendek akan habis lebih dulu dan sisa halaman dari dokumen yang lebih panjang akan muncul di bagian akhir.
- Urutan file penting: file pertama dalam daftar menyumbang halaman pertama pada hasil. Seret untuk mengatur ulang jika perlu.

## Alat Terkait

- [Gabung PDF](./merge-pdf)
- [Atur & Duplikat](./organize-pdf)
- [Pisah PDF](./split-pdf)
