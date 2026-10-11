# QC revisi TikTok soft / professional

Tanggal: 11 Oktober 2026. Pemeriksaan terhadap kode revisi, komponen produksi, dan frame proxy; **bukan render final Gabungan.mov**. Semua fixture subtitle diberi label sintetis dan tidak ditulis ke `src/captions.json`.

## Terverifikasi

- `npm run check`: TypeScript tanpa error. Dependency Remotion/captions/effects/motion-blur dikunci pada 4.0.534.
- `npm test`: tujuh pemeriksaan lulus. Import mempertahankan timestamp kata Whisper; SRT default tetap timing frasa; multiword cue pada word-SRT, overlap, waktu di luar durasi, timestamp metadata salah, serta frasa >5 kata ditolak. Grouping mengikuti cut/jeda/pageBreak dan maksimal lima token.
- Kamera diperiksa pada seluruh 1.474 frame / 24 FPS. Semua frame termasuk satu dari 11 shot, skala 1,02–1,07 dan pan berada di bawah margin overscan pada kedua sumbu. Tiap shot memiliki perubahan zoom >0,015 antara awal/akhir. Peak punch opening ≥1,054 dan kembali <1,04 pada 3 detik.
- Blur diperiksa pada seluruh frame referensi. Hanya empat interval `blurTransitions` yang memiliki effect; durasi masing-masing 0,20–0,24 detik. Tidak ada efek blur footage kontinu.
- Render WebGL2: directional blur pada frame 478 / 19,9167 detik dan zoom blur frame 1007 / 41,9583 detik lulus memakai `swangle` + Chromium cloud. Percobaan backend `angle` gagal karena WebGL2 GPU tidak tersedia di cloud; backend software dipilih di konfigurasi. Ini bukan verifikasi decoding MOV original.
- Render 11 frame dengan **SubtitleText dan camera/graphics hooks produksi** pada 2, 8, 12, 17, 23, 27, 34, 39, 46, 52, dan 59 detik. Fixture teks “Uji subtitle bukan transkrip” maksimal dua baris, posisi bawah aman, dan tidak menutupi wajah pada frame yang diperiksa. Highlight berpindah dari “Uji” pada 2 detik ke “subtitle” pada 2,4167 detik sesuai interval fixture. Ini uji mekanisme timing, bukan subtitle percakapan terverifikasi.
- Opening, lower third, closing pada 2/27/59 detik dirender ulang sesudah layout direvisi ke y72%; judul terbaca dan wajah tidak tertutup. Kartu tidak ditampilkan bersamaan dengan fixture subtitle. Root menyembunyikan kartu ketika caption real aktif beserta buffer.
- 16 frame QA (11 subtitle, tiga identitas, dua cut blur) memiliki **0 pixel magenta** dari background uji yang terbuka. Pemeriksaan visual juga dilakukan; batas matematis kamera menguatkan hasil frame sampling, bukan jaminan framing sepanjang gerak original.
- Klip QA kamera 42 frame (1,5–3,25 detik pada timeline), 540×960 / 24 FPS / H.264 berhasil dirender. Memakai satu frame proxy diam agar perubahan zoom dapat diperiksa terpisah dari gerakan kamera bawaan footage. Sampel awal/peak/return disertakan pada contact sheet. Klip tidak berisi audio dan tidak disimpan dalam Git.
- Studio memuat komposisi **UNESA-Promo**, 1080×1920, 24 FPS, 1.474 frame, tanpa page error. Tanpa MOV, layar memberi petunjuk memasukkan original.
- Audit komposisi: satu `<Video>` dengan `assets/Gabungan.mov` dan volume 1; tidak ada `<Audio>`, routing enhanced, atau referensi proxy. `prepare-video`/render tidak menjalankan enhancement. File enhanced lokal lama tidak ikut diputar.
- `npm run check-captions`: data produksi kosong dan tidak menampilkan dialog rekaan. Render final menolak berjalan ketika MOV original tidak ada. Syntax script dan `git diff --check` lulus.

[Contact sheet QA](tiktok-motion-qc.jpg) menggunakan frame referensi proxy; bukan export final, bukan transkrip. `final-motion-qc.jpg` dan laporan proxy audio adalah artefak revisi sebelumnya.

## Masih membutuhkan MOV/transkrip lokal

MOV original tidak tersedia di cloud. Belum diuji: decoding/rotasi/warna HDR original, gerakan tubuh/wajah antar frame original, render full-length original, kualitas/audio MP4 akhir, lip-sync, dan kecocokan setiap kata subtitle dengan ucapan.

Tidak ada transkrip tersedia. Sistem import/animasi subtitle siap tetapi **subtitle dialog belum terisi**. Jalankan [workflow transkripsi](SUBTITLES.md), koreksi manual terhadap original dan import data sebelum final export. SRT tanpa word timestamps hanya memiliki highlight per frasa (putih), tanpa highlight per kata buatan.

Enhanced audio sebelumnya tidak dipakai, sesuai revisi. Tidak dilakukan pemrosesan atau evaluasi noise ulang; suara yang melekat pada audio original tetap ada. Menggunakan satu track menghindari duplikasi track, tetapi tidak membuktikan bahwa echo yang sudah terekam dalam original hilang.

Sebelum menyerahkan UTS: tonton seluruh `UNESA-Promo` dan MP4 lokal dari awal hingga akhir. Periksa kata/timing, wajah, UI TikTok, seluruh cut, text reveal, warna, tidak ada blank frame, awal/akhir dialog, volume, dan satu sumber audio. Verifikasi metadata MP4 1080×1920 serta durasi dalam toleransi satu frame terhadap original. Jangan mengganti original dengan proxy untuk menyatakan hasil final berhasil.
