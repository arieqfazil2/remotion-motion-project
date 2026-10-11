# Analisis proxy dan rencana motion — S2 UNESA

Sumber yang benar-benar dapat dibuka: Gabungan-proxy.mp4, 9.593.926 byte. ffprobe: 61,416667 detik, 360×640, 24 FPS, 1.474 frame; H.264 High 10, HLG/BT.2020, AAC stereo 44.100 Hz. Ini metadata **proxy**, bukan resolusi/codec asli Gabungan.mov.

FFmpeg mengekstrak overview setiap 2 detik dan frame representatif pada setiap shot. `proxy-scene-timeline.jpg` memuat timestamp frame. Deteksi `select='gt(scene,0.22)',showinfo` menghasilkan kandidat cut berikut; frame sebelum/sesudah dan overview dipakai untuk memeriksa pergantian lokasi/pembicara. Threshold adalah heuristik, bukan identifikasi semua gerakan kamera.

| Interval (detik) | Pengamatan visual | Motion yang diterapkan |
|---|---|---|
| 0–5,208333 | Perempuan berbaju hitam, gedung bertuliskan Pascasarjana Fakultas Ekonomika & Bisnis | Identitas program 0,6–4,7; mask reveal dan typography bertahap; zoom 1,012 |
| 5,208333–10,291667 | Perempuan berhijab terang, halaman dengan signage | Zoom 1,016; aksen garis di cut |
| 10,291667–15,125 | Laki-laki berkemeja abu-abu, pohon/gedung | Zoom 1,010; tanpa label nama |
| 15,125–19,916667 | Perempuan berhijab gelap, baju marun, panel emas | Zoom 1,010; tanpa klaim tambahan |
| 19,916667–25,208333 | Perempuan hitam di tangga | Zoom 1,016 berjangkar x43% y53%; aksen garis di cut |
| 25,208333–30,833333 | Perempuan berhijab terang, depan gedung Pascasarjana | Lower third lokasi 25,6–29,9; zoom 1,012 |
| 30,833333–36,541667 | Laki-laki di dekat pohon | Zoom 1,010; aksen cut |
| 36,541667–41,958333 | Perempuan marun dekat signage gedung | Zoom 1,012; tanpa menutup signage dengan teks |
| 41,958333–49,875 | Perempuan hitam di area pepohonan/halaman | Zoom 1,012; aksen cut |
| 49,875–54,791667 | Laki-laki depan gedung | Zoom 1,010 |
| 54,791667–61,416667 | Perempuan duduk di meja kuning dengan laptop | Zoom 1,014; penutup overlay 57–61,416667 |

Setiap camera move kembali ke skala netral sebelum cut. Tidak mengubah urutan, durasi, kecepatan, audio, atau transisi footage. Aksen cut hanya garis emas kecil di tepi bawah, bukan wipe layar. Lower thirds dan penutup ditempatkan di y82–83% agar berada di bawah area wajah dalam frame yang diperiksa; menutup sebagian badan/meja, bukan wajah. Teks lokasi diambil dari signage; tidak menambahkan nama/jabatan, akreditasi, biaya, fasilitas, atau klaim mutu.

Audio dapat didekode oleh FFmpeg. Stream AAC berdurasi 61,345669 detik. `silencedetect=noise=-30dB:d=0.25` tidak menemukan interval hening. Tidak ada transkrip yang diberikan, alat transkripsi lokal tidak terpasang, dan belum dilakukan verifikasi isi ucapan/beat secara semantik. Karena itu teks bersifat identitas yang sudah disebut pengguna/signage, timing mengikuti shot dan bukan klaim sinkronisasi kata atau beat. Periksa narasi secara lokal sebelum penyerahan UTS.

Sumber final di UNESA-Promo tetap `staticFile('assets/Gabungan.mov')`, audio volume 1. Proxy dan salinan konversinya tidak dibundel atau dirujuk oleh komposisi final. `source.json` available=false: ukuran 1080×1920 adalah kanvas kerja usulan 9:16, FPS/durasi mengikuti proxy untuk menyiapkan timing. `npm run prepare-video` wajib membaca metadata asli saat file MOV tersedia. Jika durasi/aspek sumber berbeda dari proxy, skrip menghentikan persiapan untuk menghindari timing/crop yang salah.

Warna navy/emas/putih dipertahankan dari desain sebelumnya dan selaras dengan gedung biru/panel emas pada proxy; bukan klaim pedoman warna resmi. Logo tidak tersedia sebagai aset terpisah, sehingga overlay logo tetap nonaktif; logo dalam footage tetap utuh.

Validasi implementasi: TypeScript lulus; frame QA 2, 27, dan 59 detik dirender dengan frame proxy hasil ekstraksi (bukan penggantian video final). Teks tidak menutup wajah pada tiga frame ini. Cut sebelum/sesudah diperiksa pada ±1 frame. Verifikasi sepanjang footage asli dan pemeriksaan narasi tetap dilakukan lokal.
