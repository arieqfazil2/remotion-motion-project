# Final revision: motion per scene — UNESA S2

Analisis sumber: Gabungan-proxy.mp4 yang tersedia dan identik dengan proxy terdahulu; 9.593.926 byte, 61,416667 detik, 360×640, 24 FPS, 1.474 frame; H.264 High 10 HLG/BT.2020, AAC stereo 44.100 Hz. Seluruh timeline disampel tiap 2 detik, diperiksa per shot, dan kandidat 10 cut dari FFmpeg `select='gt(scene,0.22)',showinfo` diverifikasi dengan frame ±1 frame. Metadata ini tidak dianggap metadata MOV asli.

`proxy-scene-timeline.jpg` dan `scene-cuts.json` tetap menjadi referensi visual/timing. Semua scene memuat manusia, jadi tidak diperlakukan sebagai B-roll kosong. Zoom/pan lebih besar hanya dipakai pada framing pembicara yang lebih jauh dan gedung yang memiliki ruang cukup. Tidak ada pemisahan kedalaman palsu atau warping orang; pan footage 2D dipadukan dengan pergerakan aksen grafis yang lebih lambat.

| Interval detik | Scene yang diperiksa | Kamera final | Grafis / transisi |
|---|---|---|---|
| 0–5,208 | Perempuan hitam depan gedung Pascasarjana FEB | Ease-in push 1,010→1,035; pan kecil | Opening 0,6–4,7: identitas S2, mask reveal, kinetic title, tracking, temporal trail, sweep |
| 5,208–10,292 | Perempuan hijab terang di halaman dengan signage | 1,016→1,048; pan x/y | Aksen garis singkat di cut; tanpa nama/jabatan |
| 10,292–15,125 | Laki-laki abu-abu, pohon/gedung | Pull 1,030→1,010 | Grain/glow/aksen tepi bergerak; tanpa teks baru |
| 15,125–19,917 | Perempuan marun, panel emas | Push 1,010→1,030 | Aksen tepi berwarna emas selaras panel |
| 19,917–25,208 | Perempuan hitam di tangga | Push/pan 1,015→1,045 | Soft flash 0,25 dtk opacity puncak 6,5%; aksen cut |
| 25,208–30,833 | Pembicara jauh depan gedung Pascasarjana | Pull/pan 1,044→1,014 | Lower third lokasi 25,6–29,9: “Pascasarjana / Universitas Negeri Surabaya” |
| 30,833–36,542 | Laki-laki dekat pohon | Push 1,010→1,032 | Aksen cut dan atmosfer tipis |
| 36,542–41,958 | Perempuan marun dekat signage | Pull 1,031→1,012 | Tanpa grafis yang menutupi wajah/signage |
| 41,958–49,875 | Perempuan hitam di pepohonan/halaman | Push/pan 1,012→1,038 | Soft flash di cut, aksen tepi bergerak |
| 49,875–54,792 | Laki-laki depan gedung | Pull 1,028→1,010 | Atmosfer kontinu; tanpa klaim program/fasilitas |
| 54,792–61,417 | Perempuan duduk, meja kuning/laptop | Push/pan 1,012→1,040 | Soft flash cut; closing identitas S2 57–61,417 tanpa tambahan durasi |

Kontrol final ada di `src/timing.ts`: `shotMotion`, `motionSettings`, `footageCues`, `cutAccents`, `softFlashCuts`, dan `audioSettings`. Angka kamera di atas adalah default `cameraIntensity=1`. Intensitas dibatasi 0–1,5. Pan aktual selalu dibatasi di bawah 80% margin overscan `(scale-1)/2` pada kedua sumbu, sehingga kamera tidak membuka tepi kosong. Seluruh interpolasi mengikuti frame/fps dan ease-in/out cubic; tidak memakai CSS animation.

Kartu teks y82–83%, glow/sweep hanya pada panel/garis, border shape di tepi bawah, dan grain opacity 2,2%. Soft flash terbatas pada tiga cut, tanpa glitch/shake. Temporal trail resmi `@remotion/motion-blur` menggunakan tiga lapisan dengan lag 0,35 frame; teks diam kembali tajam. Heading memiliki ruang layout eksplisit agar lapisan absolut tidak hilang. Lower third adalah lokasi/identitas yang terverifikasi, bukan identitas pembicara yang tidak diketahui.

Palet navy/emas/putih dipertahankan dan selaras dengan gedung biru/panel emas; bukan klaim pedoman resmi UNESA. Logo terpisah tidak tersedia, overlay logo tetap nonaktif dan logo bawaan footage tidak digambar ulang. Tidak menambahkan informasi akreditasi, fasilitas, biaya, program studi, slogan, atau narasi.

Audio: seluruh proxy diproses dan diukur; detail dan before/after lokal dijelaskan di `AUDIO-ENHANCEMENT.md`, angka pengujian di `PROXY-AUDIO-REPORT.json`. Tidak ada transkrip yang tersedia; timing grafis/flash mengikuti cut visual, bukan klaim sinkronisasi kata atau beat. Jika mendengarkan MOV asli menemukan kartu berbenturan dengan ucapan, ubah timing cue dalam detik.

`UNESA-Promo` tetap menggunakan `public/assets/Gabungan.mov`. Proxy tidak dimasukkan ke public, tidak dirujuk komposisi final, dan tidak dijadikan audio final. Metadata awal source available=false, kanvas kerja 1080×1920 hanya usulan sesuai aspek proxy. `prepare-video` membaca resolusi, display orientation (termasuk metadata rotasi 90°), FPS dan durasi MOV asli; perbedaan durasi/aspek terhadap proxy menyebabkan pemeriksaan berhenti agar timing diperiksa dahulu. Tidak melakukan rekonstruksi/penggabungan ulang scene.

## Quality control yang dilakukan

- TypeScript dan syntax script lulus; dependency motion blur terpasang dan terkunci.
- 12 frame QA pada 1, 2, 8, 17, 23, 27, 34, 39, 42, 46, 52, dan 59 detik dirender menggunakan frame proxy hasil ekstraksi dengan **komponen motion yang sama** dengan UNESA-Promo. Gambar referensi diam ini memeriksa layout/efek/crop, bukan full render footage.
- Heading opening/lower third/closing terlihat, wajah tidak tertutup pada frame yang diperiksa; 0 pixel magenta dari latar uji terbuka di 12 frame. Contact sheet: `final-motion-qc.jpg` (label frame / 24 = detik).
- Fallback audio: file cocok diaktifkan, sumber yang berubah dan file WAV yang hilang dinonaktifkan. Root memilih volume MOV 0 + satu WAV saat enhanced aktif, atau MOV 1 tanpa WAV saat fallback.
- Seluruh proxy audio before/after memiliki jumlah sampel sama dan offset perkiraan di bawah 2 ms pada 11 jendela korelasi; bukan uji lip-sync visual MOV.
- Render final dan enhancement default menolak jalan tanpa MOV asli. Belum menguji seluruh gerakan pada MOV asli, warna HDR/codec asli, subjective naturalitas suara, atau MP4 akhir. Periksa lokal sebelum tugas dikumpulkan.
