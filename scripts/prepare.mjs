import { refreshAudioState } from "./audio-state.mjs";
import { execFileSync } from "node:child_process";
import { existsSync, writeFileSync } from "node:fs";
const file = "public/assets/Gabungan.mov";
if (!existsSync(file))
  throw new Error(
    "Salin Gabungan.mov ke public/assets/Gabungan.mov terlebih dahulu.",
  );
const data = JSON.parse(
  execFileSync(
    "ffprobe",
    ["-v", "error", "-show_streams", "-show_format", "-of", "json", file],
    { encoding: "utf8", maxBuffer: 16 * 1024 * 1024 },
  ),
);
const v = data.streams.find((s) => s.codec_type === "video");
if (!v) throw new Error("Stream video tidak ditemukan.");
const rate = v.avg_frame_rate !== "0/0" ? v.avg_frame_rate : v.r_frame_rate;
const [n, d] = rate.split("/").map(Number);
const fps = n / d;
const duration = Number(data.format.duration || v.duration);
if (
  !Number.isFinite(fps) ||
  fps <= 0 ||
  !Number.isFinite(duration) ||
  duration <= 0
)
  throw new Error("Metadata durasi/FPS tidak valid.");
// Preserve display orientation from MOV metadata without modifying the original file.
const rotation = Number(
  (v.side_data_list || []).find((s) => s.rotation !== undefined)?.rotation ||
    v.tags?.rotate ||
    0,
);
if (Math.abs(rotation % 90) > 0.001)
  throw new Error("Rotasi non-90 derajat perlu diperiksa sebelum render.");
const swap = Math.abs(rotation) % 180 === 90;
const width = swap ? v.height : v.width,
  height = swap ? v.width : v.height;
// Timings were authored against the full-length 9:16 proxy. Never read proxy as final source.
if (
  Math.abs(duration - 61.416667) > 0.25 ||
  Math.abs(width / height - 9 / 16) > 0.015
)
  throw new Error(
    "Durasi/aspek Gabungan.mov berbeda dari proxy. Cocokkan timeline asli sebelum mengaktifkan motion.",
  );
writeFileSync(
  "src/source.json",
  JSON.stringify(
    {
      available: true,
      width,
      height,
      fps,
      durationInFrames: Math.ceil(duration * fps),
      durationSeconds: duration,
    },
    null,
    2,
  ),
);
writeFileSync("source-metadata.json", JSON.stringify(data, null, 2));
console.log(
  `Metadata aktual: ${width}x${height}, ${fps} FPS, ${duration}s. Semua footage diputar sekali dari awal.`,
);
console.log(
  "Metadata bukan analisis scene/audio/narasi. Tinjau video di Studio dan sesuaikan src/timing.ts sebelum render.",
);

console.log(
  refreshAudioState()
    ? "Audio enhanced cocok dengan sumber asli dan diaktifkan."
    : "Audio enhanced belum tersedia/cocok; gunakan audio MOV asli.",
);
