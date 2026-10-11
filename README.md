# Motion graphics promosi S2 UNESA — fallback lokal

Gabungan.mov tetap perlu dimasukkan lokal. Gabungan-proxy.mp4 berhasil dianalisis: 61,416667 detik, vertikal 360×640, 24 FPS, audio AAC stereo. Motion pada UNESA-Promo kini mengikuti scene proxy; lihat [rencana timestamp dan batas analisis](docs/MOTION-PLAN.md) dan [timeline visual](docs/proxy-scene-timeline.jpg). Proxy hanya untuk analisis dan tidak dipakai sebagai sumber final. Kanvas sementara 1080×1920 mengikuti aspek proxy, bukan metadata asli. MotionPreview tetap demonstrasi desain 12 detik sebelumnya.

## Jalankan di VS Code

1. Buka folder project ini di VS Code. Pasang Node.js 22+ dan FFmpeg (termasuk ffprobe).
2. Jalankan `npm install`.
3. Salin **video asli**, tanpa dipotong atau digabung ulang, ke `public/assets/Gabungan.mov`.
4. Jalankan `npm run prepare-video`. Metadata aktual dibaca melalui ffprobe; `src/source.json` dan `source-metadata.json` diperbarui. Durasi komposisi mengikuti seluruh sumber, dibulatkan ke frame terakhir.
5. Jalankan `npm run studio`; buka URL yang dicetak di terminal. Pilih **UNESA-Promo** untuk footage asli atau **MotionPreview** untuk demonstrasi grafis.
6. Tinjau seluruh footage dan isi `src/timing.ts`. Cue berbasis proxy di `footageCues`, `cameraMoves`, dan `cutAccents` sudah aktif. Timing dalam detik; tinjau ulang kecocokan dengan MOV asli. Opening/lowerThird/closing lama hanya untuk kompatibilitas demo, bukan kontrol komposisi final. Isi lower third dengan nama/jabatan yang benar-benar disebut dalam video. Kosongkan bila tidak terverifikasi.
7. Jalankan `npm run check`, lalu `npm run render`. Hasil: `out/UNESA-S2-motion.mp4` (H.264 CRF 16, AAC 320 kbps, resolusi/FPS sumber).

## Timing dan visual

`start` / `duration` menggunakan detik. `x` / `y` posisi relatif terhadap ukuran video. Opening/closing berisi hanya identitas program dari permintaan pengguna; teks ini belum dicocokkan dengan narasi. Warna navy, emas, putih adalah usulan visual sementara, bukan klaim panduan brand resmi UNESA. Sesuaikan dengan footage dan pedoman resmi jika tersedia.

Zoom final menggunakan `cameraMoves` sebesar 1,010–1,016, kembali ke skala 1 sebelum cut. `start/end` mengatur interval per shot. Periksa supaya gerakan hanya berada di dalam satu scene dan tidak memotong wajah, logo, atau teks bawaan. Nol perubahan kecepatan, trimming, pengurutan, musik tambahan, atau voice-over baru. Sumber video diputar sekali dengan audio volume 1; ekspor MP4 melakukan encoding ulang sehingga audio mempertahankan isi, bukan identik bit demi bit.

Panel teks memiliki fade dan pergerakan vertikal halus, garis emas, glow lembut, dan light sweep pada garis. Tidak ada transisi tambahan yang menutupi pergantian scene. Closing adalah overlay di dalam durasi asli; atur start agar tidak memperpanjang video. Gunakan cue setelah jeda narasi dan periksa beat dengan mendengarkan sumber. Posisi default tidak menjamin aman dari wajah; pindahkan sesuai hasil pemeriksaan.

Logo opsional memakai aset resmi `public/assets/logo-unesa.png` dengan lebar proporsional dan tinggi otomatis; aktifkan `logo.enabled` hanya bila aset tersedia. Tidak ada logo yang digambar ulang.

## Pemeriksaan sebelum UTS

- Tonton seluruh UNESA-Promo: awal/akhir lengkap, semua dialog dan audio terdengar, tidak ada duplikasi audio.
- Pastikan setiap teks mengikuti narasi, tidak menutup wajah atau teks bawaan, terbaca pada ukuran layar ponsel, dan tidak terpotong.
- Pastikan cue berakhir sebelum durasi sumber dan penutup tidak menabrak ending yang sudah ada.
- Periksa metadata resolusi/FPS/durasi hasil dengan ffprobe dan tonton MP4 sampai selesai.
- MOV dengan codec yang tidak dapat diputar browser perlu salinan kompatibel H.264/AAC. Jangan mengganti sumber diam-diam: simpan asli, periksa durasi/orientasi/audio salinan, lalu ubah referensi sumber dan skrip metadata secara eksplisit.

`npm run render:preview` menghasilkan demonstrasi desain 12 detik tanpa footage/audio asli. Demonstrasi ini **bukan hasil akhir promosi**. Tanpa Gabungan.mov, hasil MP4 promosi dan sinkronisasi narasi belum dapat diselesaikan.
