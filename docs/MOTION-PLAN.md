# Motion per scene — TikTok soft / professional

Revisi ini diterapkan langsung ke **UNESA-Promo**. Referensi tetap `scene-cuts.json`, `proxy-scene-timeline.jpg`, dan Gabungan-proxy.mp4 yang telah diperiksa. Proxy: 61,416667 detik, 360×640, 24 FPS, 1.474 frame, H.264 High10 HLG/BT.2020 dan AAC stereo 44,1 kHz. Metadata proxy bukan metadata MOV original. Terdapat 10 cut / 11 scene; semua scene memuat manusia, sehingga tidak dianggap B-roll kampus kosong.

Gerakan lebih terlihat, dengan easing cubic natural. Framing gedung yang lebih luas memakai zoom/pan sedikit lebih besar; close speaker lebih konservatif. Tidak ada parallax pemisahan depth palsu, warping orang, penggabungan ulang, atau penggantian footage. Seluruh scene tetap diputar dalam satu Video dari `public/assets/Gabungan.mov`.

| Interval (detik) | Scene yang diperiksa | Kamera default | Motion / transisi |
|---|---|---|---|
| 0–5,208 | Perempuan hitam depan gedung Pascasarjana FEB | Push 1,02→1,04; pan kecil | Opening identity 0,6–4,7; masked reveal, tracking, text trail, sweep. Satu punch 1,055 pada gestur tangan ~2 detik, kembali smooth pada 3 detik |
| 5,208–10,292 | Perempuan hijab terang di halaman/signage | Push 1,02→1,045; pan x/y | Zoom blur 0,22 detik di cut 5,208; accent line singkat |
| 10,292–15,125 | Laki-laki abu-abu dekat pohon/gedung | Pull 1,04→1,02 | Fokus wajah/dialog; tanpa nama/jabatan rekaan |
| 15,125–19,917 | Perempuan marun, panel emas | Push 1,02→1,04 | Glow tepi tipis; tanpa judul besar |
| 19,917–25,208 | Perempuan hitam di tangga | Push 1,02→1,045; pan kecil | Directional horizontal blur 0,24 detik di cut; accent line |
| 25,208–30,833 | Pembicara jauh depan gedung Pascasarjana | Pull 1,045→1,02; pan kecil | Lower third lokasi 25,6–29,9 “Pascasarjana / Universitas Negeri Surabaya” |
| 30,833–36,542 | Laki-laki dekat pohon | Push 1,02→1,04 | Accent cut tipis; prioritas subtitle |
| 36,542–41,958 | Perempuan marun dekat signage | Pull 1,04→1,02 | Gerak halus; tanpa teks menutupi signage/wajah |
| 41,958–49,875 | Perempuan hitam di pepohonan/halaman | Push 1,02→1,04; pan kecil | Zoom blur 0,22 detik di cut; accent line |
| 49,875–54,792 | Laki-laki depan gedung | Pull 1,04→1,02 | Subtitle/dialog menjadi fokus |
| 54,792–61,417 | Perempuan duduk, meja kuning/laptop | Push 1,02→1,04; pan kecil | Directional blur 0,20 detik di cut; closing identity 57–akhir footage |

Blur terpusat pada cut, separuh interval sebelum dan sesudahnya. Enam cut lain tetap clean. Blur hanya memengaruhi footage, bukan subtitle; tidak memakai duplikasi Video atau audio. Zoom blur memakai 16 samples / maksimum amount 17,28 pada lebar 1080, directional blur radius maksimum 8,64; `transitionSettings.strength` mudah disesuaikan. Soft flash lama nonaktif (`flashOpacity=0`) agar tidak menumpuk efek.

`shotMotion`, `punchIns`, `blurTransitions`, `motionSettings`, `subtitleSettings`, `footageCues`, dan `cutAccents` di `src/timing.ts` mengatur timing detik dan intensitas. Kamera dibatasi maksimum 1,07; pan maksimum 80% margin overscan pada dua sumbu. Center origin 50%/50%. Kamera berjalan sepanjang tiap scene tanpa membuka tepi kosong. Punch pada opening mengikuti gestur visual yang diperiksa, **bukan klaim penekanan kata/beat**. Tambah punch ucapan hanya sesudah memeriksa transkrip/audio original.

Subtitle berbasis dialog: putih tebal, kata aktif emas, shadow/outline, frasa ≤5 kata, ≤2 baris, scale pop .95→1. Posisi bawah 20%, kanan aman 17%. Timestamp highlight berasal dari import per kata; SRT per frasa tidak membuat timing kata buatan. Tidak ada transkrip tersedia, sehingga data produksi tetap kosong. [Panduan import](SUBTITLES.md).

Identity cards kiri 7%, y72%, lebar76%, ukuran heading lebih ringkas daripada revisi lama. Cards disembunyikan ketika subtitle aktif (dengan buffer), agar judul dan dialog tidak bertumpuk. Grain 1%, glow 3%, aksen dekoratif kontinu nonaktif; sweep/glow kecil hanya pada panel/garis. Palet navy/emas/putih selaras footage, bukan klaim brand guide resmi. Logo terpisah belum tersedia; overlay tetap nonaktif. Tidak menambahkan akreditasi, biaya, fasilitas, nama pembicara atau klaim lain.

Audio revisi ini: **satu sumber original dari Video MOV volume 1**. Track enhancement sebelumnya tidak dirujuk atau diputar. Tidak ada pemrosesan ulang, musik baru, ducking, echo/reverb atau penghapusan dialog.

Export 1080×1920; `prepare-video` membaca FPS/durasi MOV original dan memeriksa aspek/timing sesuai proxy. Seluruh footage dipertahankan; durasi quantized ke frame terdekat ke atas. File original/proxy tidak masuk GitHub. [Bukti dan batas QC](TIKTOK-QC.md).
