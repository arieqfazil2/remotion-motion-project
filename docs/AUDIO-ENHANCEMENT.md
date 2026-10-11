> **ARSIP — revisi TikTok soft/professional memakai satu audio MOV original. Enhanced audio tidak dirujuk komposisi final. Jangan menjalankan workflow ini untuk revisi terbaru. Hasil proxy sebelumnya bukan evaluasi MOV original.**

# Audio enhancement lokal

Proxy yang dilampirkan ulang identik (SHA-256 `79f081ebcda98f943b00b70e710b8532ea73624a2565883487b54091a0c7b250`) dengan analisis sebelumnya. Seluruh audio proxy didekode dan diproses. Tidak ada transkrip atau identifikasi sumber suara yang diklaim.

RMS full-band antarscene: −34,3 hingga −18,4 dBFS, dengan energi bawah 100 Hz relatif kuat pada scene 30,83–49,88 detik. Ini mendukung high-pass ringan dan penyeimbangan level, tetapi tidak membuktikan bahwa energi tersebut berasal dari angin/kendaraan: suara manusia dan musik juga dapat menyumbang energi yang sama. Tidak tersedia stem musik/dialog terpisah. Tidak dilakukan pemisahan musik/percakapan atau klaim noise sudah hilang seluruhnya.

## Jalankan dari root project di terminal VS Code

Pasang Node.js 22+ dan FFmpeg/ffprobe pada PATH. Salin MOV asli ke `public/assets/Gabungan.mov`.

```bash
npm install
npm run prepare-video
npm run enhance-audio
npm run prepare-video
npm run studio
npm run render
```

Buka `public/assets/audio/compare.html` di browser untuk evaluasi before/after pada volume perangkat yang sama. File `before.wav`, `enhanced.wav`, `report.json`, dan `manifest.json` dibuat lokal. Sebelum WAV adalah audio sumber yang disejajarkan dengan timeline dan dipad dengan keheningan akhir jika diperlukan, tanpa denoise/EQ/normalisasi. Semuanya diabaikan Git.

Parameter tersedia di `scripts/audio-settings.json`:

- High-pass 70 Hz (hindari cutoff tinggi yang menghilangkan warna suara laki-laki).
- FFT denoise `afftdn`, reduksi 4 dB, noise floor −45 dB; tracking noise dinonaktifkan agar tidak menganggap ucapan sebagai noise.
- EQ 250 Hz −1 dB dan 2.800 Hz +1 dB.
- Gain antarscene berdasarkan RMS band 120–4.000 Hz, dibatasi ±3 dB, ramp 120 ms di cut. Estimasi band ini bukan speech detector; mixed music/noise dapat memengaruhi pengukuran.
- Compressor ratio 1,6:1, threshold −20 dB, attack 20 ms, release 180 ms.
- Two-pass loudnorm target −19 LUFS, true peak −2 dBTP, LRA 11. FFmpeg dapat memakai mode dynamic ketika linear tidak memenuhi constraint; periksa report dan naturalitas.
- WAV PCM 16 bit 48 kHz, tanpa time stretching/gating/penggantian perkataan.

Script mengkalibrasi latency FFT dengan impuls pada build FFmpeg lokal, memberi padding untuk menjaga sampel akhir, lalu mengompensasi latency tersebut. Timestamp awal audio relatif terhadap video diperhitungkan. Durasi WAV diperiksa sebelum file diaktifkan. `prepare-video` mencocokkan ukuran/waktu modifikasi MOV dengan manifest dan panjang WAV. Jika MOV diubah/disalin ulang, proses ulang audio; jangan memindahkan manifest lama untuk sumber lain.

## Pilihan audio Remotion

`src/timing.ts`: `audioSettings.useEnhanced=true` memilih WAV bersih jika file dan manifest cocok setelah persiapan. Video tetap memakai `Gabungan.mov` dengan volume **0** dan hanya satu `<Audio>` WAV volume 1. Jika tidak tersedia, `<Audio>` tidak dipasang dan volume MOV kembali **1**. Set `useEnhanced=false` untuk fallback manual. Setelah membuat/menghapus audio, jalankan `prepare-video` dan refresh Studio.

## Music ducking

Track campuran tidak diduck karena akan menurunkan dialog juga. Tidak ada musik baru ditambahkan. Jika tersedia stem musik asli yang sudah terpisah dan terverifikasi, isi `speechWindows` sebagai daftar `[awal,akhir]` detik, lalu:

```bash
node scripts/enhance-audio.mjs --music-stem "PATH-KE-STEM-MUSIK-ASLI.wav"
```

Script membuat `music-ducked.wav` dengan ramp masuk/keluar dan default −6 dB. File ini **hanya untuk evaluasi**, tidak otomatis ditambahkan ke Remotion. Jangan mencampurnya dengan track yang sudah mengandung musik yang sama. Untuk penggunaan stem final, perlu sumber dialog terpisah yang benar dan pemeriksaan alignment; track campuran saat ini tetap memakai pemrosesan konservatif.

## Uji proxy dan batas hasil

```bash
node scripts/enhance-audio.mjs --analysis-only --input "PATH-Gabungan-proxy.mp4" --output out/proxy-audio-test
```

Mode ini tidak mengubah `src/audio.json`, tidak menulis ke public, dan tidak mengaktifkan proxy di komposisi final. Perbandingan before/after dan report dibuat di folder output uji.

Uji penuh proxy: −23,06 → −19,05 LUFS; true peak hasil −2,00 dBTP; 2.948.000 sampel pada before dan after, durasi 61,416667 detik. Latency denoiser terukur 1.200 sampel (25 ms) dan dikompensasi. Korelasi 11 jendela menunjukkan selisih puncak −0,02 hingga −1,54 ms setelah pemrosesan. Angka ini menunjukkan alignment sinyal proxy, bukan verifikasi lip-sync MOV asli atau bukti subjective voice clarity. Report lengkap: `PROXY-AUDIO-REPORT.json`.

Dengarkan seluruh before/after: setiap kata, suara rendah, sibilance, bunyi lingkungan, pumping, dan bagian awal/akhir. Jika timbre tidak natural, turunkan `noiseReductionDb`, ubah EQ ke 0, ratio ke 1, atau pilih audio asli. MOV asli, naturalitas akhir, codec/rotasi/HDR asli, lip-sync visual, serta MP4 akhir belum dapat diuji di cloud.
