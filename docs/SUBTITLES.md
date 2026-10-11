# Subtitle Indonesia dengan timing asli

Status revisi: `src/captions.json` berisi array kosong. Proxy tersedia, tetapi tidak ada transkrip terverifikasi atau engine ASR lokal yang siap. Fallback import yang diminta telah diimplementasikan. Caption produksi tidak diisi dengan teks contoh/promosi. Render QA memakai fixture berlabel “teks sintetis — bukan dialog”, terpisah dari data produksi.

## Membuat transkrip di laptop

1. Masukkan original `public/assets/Gabungan.mov`; jalankan `npm run prepare-video`.
2. Jalankan `npm run extract-transcription-audio`. Script menggunakan FFmpeg untuk menyalin stream audio pertama menjadi WAV mono 16 kHz di `out/transcription/original.wav`, tanpa denoise/reverb. Perbedaan start time audio/video disejajarkan untuk timeline transkripsi. File ini hanya input ASR; audio final tetap dari MOV.
3. Gunakan tool transkripsi yang mendukung bahasa Indonesia dan word timestamps. Salah satu opsi lokal adalah CLI **openai-whisper** (Python + FFmpeg, unduhan model diperlukan). Setelah tool tersebut terpasang:

```bash
whisper out/transcription/original.wav --model small --language Indonesian --task transcribe --word_timestamps True --output_format json --output_dir out/transcription
```

4. Dengarkan seluruh MOV sambil memeriksa JSON: kata, nama UNESA, awal/akhir ucapan, punctuation, dan waktu setiap kata. ASR dapat salah; timestamp ASR juga perkiraan. Koreksi dengan waveform/editor subtitle berdasarkan ucapan original, bukan membagi durasi secara merata. Zero-duration/overlap ditolak importer dan perlu diperbaiki berdasarkan audio. Tidak menganggap transkrip proxy identik dengan original.
5. `npm run import-captions -- out/transcription/original.json`, kemudian `npm run check-captions`, `npm run studio`. Review seluruh 61 detik, termasuk cut, pause dan akhir kalimat.

Audio extraction di atas belum dapat diuji terhadap MOV yang tidak tersedia di cloud. Transkrip yang disetujui boleh disimpan di Git; file WAV/MP4 tetap diabaikan.

## JSON per kata

Importer menerima export Whisper `segments[].words[]` atau `words[]` dengan `word`, `start`, `end` dalam **detik**, dan opsional `probability`. Script mempertahankan interval dalam milidetik (round ke ms), tidak membangun timing kata dari segment-only JSON.

Format Remotion juga didukung: array Caption, atau `{ "mode": "word", "captions": [...] }`. Setiap token:

```ts
type Caption = {
  text: string; // Satu kata dari dialog yang sudah diverifikasi.
  startMs: number;
  endMs: number;
  timestampMs: number | null;
  confidence: number | null;
  pageBreakAfter?: boolean; // Paksa frasa berikutnya pada page baru.
};
```

`startMs`/`endMs` menentukan interval highlight [start, end). `timestampMs` dipertahankan sebagai metadata. Caption harus berurutan, tidak overlap, dan berada dalam durasi original. Importer tidak mengubah isi ucapan, menebak kata atau menulis file jika validasi gagal.

Grouping default maksimal lima kata, dipisah pada jeda >280 ms, cut visual antar token, atau `pageBreakAfter`. Frasa satu kata diperbolehkan jika diperlukan oleh jeda/akhir kalimat. Teks maksimal dua baris eksplisit; kata panjang diukur lalu font disesuaikan tanpa membuang dialog.

## SRT

```bash
npm run import-captions -- path/subtitle.srt
```

SRT biasa menggunakan **mode phrase**. Setiap cue harus berupa frasa pendek maksimal lima kata yang waktunya benar-benar sudah diperiksa. Cue panjang ditolak, bukan dipotong otomatis dengan timing rekaan. Tidak ada highlight per kata pada mode ini.

Jika SRT memang memiliki **satu kata setiap cue** dengan waktu kata yang benar:

```bash
npm run import-captions -- path/word-level.srt --word-srt
```

JSON per frasa juga didukung melalui `{mode:"phrase",captions:[...]}` atau array Caption dengan `--mode phrase`. Semua teks adalah plaintext tanpa markup.

## Layout dan pengaturan

`subtitleSettings` di `src/timing.ts`: `enabled`, `bottom` (default 20% tinggi), `fontSizeRatio` (.055), dan `highlight` (emas). Area teks: kiri 7%, lebar 76%, menyisakan kanan 17% untuk tombol TikTok. Posisi antarmuka TikTok dapat berbeda; tinjau sebelum upload.

Pop-up scale .95→1 selama 150 ms; fade masuk/keluar ≤110 ms. Tidak ada blur kontinu pada teks. Kartu opening/lower third/closing disembunyikan saat caption aktif, termasuk buffer 120 ms sebelum / 220 ms sesudah. Subtitle menjadi prioritas; bila dialog terus berlangsung sampai penutup, kartu identitas dapat tidak tampil pada interval itu. Ubah cue hanya sesudah memeriksa ucapan, tanpa menghilangkan subtitle/dialog.

Lokasi default tidak menutupi wajah pada frame proxy opening/closing yang diuji. Setelah transkrip real diimpor, periksa seluruh wajah, baris panjang, dan layout setiap scene terhadap MOV original. Tidak ada klaim sinkronisasi kata sebelum review tersebut.
