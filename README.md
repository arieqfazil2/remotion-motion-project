# UNESA S2 — Remotion cinematic promotional video

Project React + TypeScript yang dapat dibuka di VS Code. Revisi motion diterapkan langsung pada **UNESA-Promo** sepanjang 11 scene: zoom in/out dan pan halus, masking dan kinetic typography, animated lower third, text tracking/temporal motion trail, light sweep/glow, garis/shape bergerak, soft flash pada tiga cut, serta film grain lembut. Footage/urutan/durasi tetap dari video yang sudah diedit.

Sumber final wajib **`public/assets/Gabungan.mov`**. Proxy hanya dipakai untuk analisis 61,416667 detik, 360×640, 24 FPS. Tidak ada proxy, video asli, audio besar, node_modules, atau hasil render dalam repository.

## Jalankan lokal

Pasang Node.js 22+ dan FFmpeg/ffprobe pada PATH. Buka folder repository di VS Code, kemudian:

```bash
npm install
# Masukkan Gabungan.mov ke public/assets/ terlebih dahulu.
npm run prepare-video
npm run enhance-audio
npm run prepare-video
npm run check
npm run studio
```

Buka URL Studio yang dicetak di terminal dan pilih **UNESA-Promo**. Resolusi/display orientation, FPS, dan durasi komposisi dibaca dari MOV asli. Ukuran 1080×1920 dalam source awal adalah kanvas kerja sementara. Jika durasi/aspek berbeda dari proxy atau rotasi tidak standar, periksa timing/aspek dahulu; script tidak mengubah orientasi atau memotong file asli.

Audio enhancement opsional. Untuk mengevaluasinya, buka `public/assets/audio/compare.html`: before/after, report, dan WAV bersih dibuat lokal. Default high-pass 70 Hz, noise reduction ringan 4 dB, EQ ±1 dB, compression 1,6:1, gain scene terbatas ±3 dB, target −19 LUFS / −2 dBTP. Proxy dan original dianalisis ulang secara terpisah; hasil proxy tidak dianggap identik dengan original.

`audioSettings.useEnhanced=true` memilih WAV yang tersedia dan cocok dengan manifest sumber. Audio MOV dibisukan saat WAV dimainkan, sehingga tidak terdengar dua kali. Tanpa WAV yang valid, komposisi memakai suara MOV asli. Set `useEnhanced=false` untuk fallback manual; jalankan prepare-video dan refresh Studio setelah perubahan file audio.

## Edit dan render

- `src/timing.ts`: timestamp teks, posisi, zoom/pan per shot, grain/glow/flash, motion blur, serta pilihan audio.
- `scripts/audio-settings.json`: kekuatan noise reduction, EQ, compressor, normalisasi dan gain scene. Dengarkan seluruh A/B setelah perubahan.
- `src/FootageMotion.tsx`: kamera dan efek sepanjang video. `src/Root.tsx`: komposisi final dan routing audio.
- `MotionPreview` tetap demo desain lama; bukan hasil promosi final.

```bash
npm run render
```

Hasil lokal: `out/UNESA-S2-motion.mp4` — H.264 CRF 16, yuv420p, AAC 320 kbps. Script mempersiapkan ulang metadata MOV dan memeriksa kecocokan WAV sebelum render. Simpan MOV/audio asli; export adalah encoding ulang, bukan salinan bit identik. Jika MOV HLG/HDR atau codec kurang kompatibel browser, periksa hasil warna/decoding secara lokal sebelum memilih workflow konversi. Tidak ada konversi sumber diam-diam.

Logo resmi opsional: salin `public/assets/logo-unesa.png` dan aktifkan `logo.enabled`. Proporsi logo dijaga. Tidak ada logo rekaan.

## Dokumentasi dan batas pengujian

- [Timestamp motion setiap scene](docs/MOTION-PLAN.md)
- [Timeline frame proxy](docs/proxy-scene-timeline.jpg)
- [Frame QA motion final](docs/final-motion-qc.jpg)
- [Audio enhancement, A/B, fallback, dan ducking stem opsional](docs/AUDIO-ENHANCEMENT.md)
- [Pengukuran dan pengujian proxy audio](docs/PROXY-AUDIO-REPORT.json)

TypeScript/syntax dan 12 frame representatif telah diperiksa; pengujian audio penuh proxy menjaga jumlah sampel dan mengompensasi latency denoiser. Narasi/beat tidak ditranskripsikan atau diklaim terverifikasi. Musik yang menyatu dengan dialog tidak bisa diduck secara sempurna memakai filter biasa; tidak ada musik baru atau ducking track campuran.

**Gabungan.mov original tidak tersedia di cloud. Full render original, warna/rotasi/codec original, lip-sync visual, naturalitas audio hasil original, dan playback MP4 akhir masih wajib diperiksa lokal.** Tonton seluruh video, periksa setiap kata/akhir kalimat, semua wajah/teks/logo, awal/akhir footage, kualitas suara serta volume antarscene sebelum menyerahkan UTS.
