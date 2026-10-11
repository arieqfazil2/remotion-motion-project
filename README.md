# UNESA S2 — TikTok soft / professional

Revisi project Remotion React + TypeScript yang sudah ada. Semua perubahan visual berada langsung pada **UNESA-Promo**: zoom natural di 11 scene, satu punch-in pada gestur opening, empat transisi blur singkat, subtitle dinamis dari transkrip, serta identity reveal/lower third yang tidak bertumpuk dengan subtitle. Footage, urutan scene, dan dialog tetap dari file yang telah diedit.

Sumber final tetap **`public/assets/Gabungan.mov`** dan **satu track suara original dari Video tersebut**. Enhanced audio lama tidak diputar, meskipun file hasil enhancement masih ada di laptop. Tidak ada reverb, echo, pemrosesan ulang, atau musik baru dalam revisi ini.

## Buka di VS Code dan Studio

Pasang Node.js 22+, FFmpeg dan ffprobe pada PATH. Unduh/checkout branch Pull Request, buka root repository di VS Code, lalu:

```bash
npm ci
# Salin video original ke public/assets/Gabungan.mov
npm run prepare-video
npm run check
npm test
npm run studio
```

Buka URL Studio yang dicetak, pilih **UNESA-Promo**. Export tetap **1080 × 1920**, menggunakan FPS dan seluruh durasi dari MOV original. `prepare-video` mencatat ukuran display original serta orientasi dari metadata tanpa mengubah file. Durasi dibulatkan ke atas ke frame terdekat (<1 frame). Perbedaan durasi/aspek terhadap proxy menghentikan persiapan agar timing diperiksa dahulu.

Tanpa MOV, komposisi menampilkan petunjuk memasukkan file; script render menolak export. `MotionPreview` adalah demo desain lama. Revisi ini tidak bergantung pada komposisi demo tersebut.

## Subtitle dialog asli

**Transkrip belum tersedia; `src/captions.json` sengaja kosong.** Tidak ada subtitle percakapan rekaan. Sistem subtitle sudah terhubung ke komposisi final: font tebal putih, highlight emas pada kata aktif, shadow/outline, maksimal dua baris dan lima kata, animasi pop lembut, dan area aman bagian bawah.

Buat dan koreksi transkrip dari MOV original sesuai [panduan subtitle](docs/SUBTITLES.md). Import hanya setelah memeriksa teks/timestamp:

```bash
npm run extract-transcription-audio
# Buat transkrip bahasa Indonesia dengan word timestamps menggunakan tool lokal.
npm run import-captions -- out/transcription/original.json
npm run check-captions
```

SRT biasa juga didukung, tetapi hanya timing per frasa: highlight per kata tidak diaktifkan jika timing kata tidak tersedia. Jangan menggunakan teks promosi sebagai pengganti dialog.

## Edit dan render MP4

- `src/timing.ts`: kamera per scene, punch-in, cut blur/durasi/intensitas, subtitle/font/posisi, identity cards, grain/glow, dan logo opsional.
- `src/FootageMotion.tsx`: kamera, masked reveal, tracking, temporal text trail, accent line/light sweep, dan efek footage.
- `src/Subtitles.tsx`, `src/caption-layout.ts`, `src/captions.json`: layout, highlight, grouping, serta data subtitle.
- `src/Root.tsx`: komposisi final dengan satu Video/audio original.

```bash
npm run render
```

Hasil: `out/UNESA-S2-motion.mp4`, 1080×1920, H.264 CRF 16, yuv420p, AAC 320 kbps. Script membaca ulang metadata original, memvalidasi caption, kemudian merender. Audio original dienkode ulang satu kali dalam MP4, tanpa enhancement. Blur memakai efek resmi `@remotion/effects`; backend WebGL2 software `swangle` dipilih karena lulus render QA cloud. Rendering ini dapat lebih lambat daripada GPU.

Logo resmi opsional: masukkan `public/assets/logo-unesa.png` dan aktifkan `logo.enabled` di timing. Logo dipertahankan proporsinya. Tidak ada logo terpisah dalam repo, dan tidak ada logo rekaan.

## Dokumentasi dan pengujian

- [Timestamp kamera/grafis setiap scene](docs/MOTION-PLAN.md)
- [Timeline proxy hasil analisis](docs/proxy-scene-timeline.jpg), [scene cuts](docs/scene-cuts.json)
- [Subtitle dan transkripsi lokal](docs/SUBTITLES.md)
- [QC revisi ini: terverifikasi dan belum diuji](docs/TIKTOK-QC.md)
- [Contact sheet QA](docs/tiktok-motion-qc.jpg) — teks sintetis hanya untuk uji komponen, bukan transkrip.

**MOV original tidak tersedia di cloud.** Full render original, decoding/warna HLG/HDR original, lip-sync, kecocokan transkrip dengan ucapan, dan kualitas MP4 akhir perlu diperiksa di VS Code lokal. Proxy hanya referensi visual/timing; tidak dirujuk sebagai sumber final. Video/audio besar, node_modules, dan hasil render tidak masuk GitHub.

Script dan [dokumen enhancement sebelumnya](docs/AUDIO-ENHANCEMENT.md) dipertahankan sebagai arsip. **Jangan jalankan enhance-audio untuk workflow revisi ini**; final mengabaikan track enhancement. Pengukuran audio proxy lama bukan bukti audio original atau revisi ini.
