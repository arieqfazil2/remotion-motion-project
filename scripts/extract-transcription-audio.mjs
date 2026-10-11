import { execFileSync } from "node:child_process";
import { mkdirSync, existsSync } from "node:fs";
const source = "public/assets/Gabungan.mov";
if (!existsSync(source))
  throw new Error("Masukkan Gabungan.mov original terlebih dahulu.");
const metadata = JSON.parse(
  execFileSync(
    "ffprobe",
    ["-v", "error", "-show_streams", "-show_format", "-of", "json", source],
    { encoding: "utf8" },
  ),
);
const video = metadata.streams.find((s) => s.codec_type === "video"),
  audio = metadata.streams.find((s) => s.codec_type === "audio");
if (!video || !audio) throw new Error("Stream video/audio tidak ditemukan.");
const offset = Number(audio.start_time || 0) - Number(video.start_time || 0);
const align =
  offset > 0
    ? `adelay=${Math.round(offset * 1000)}:all=1`
    : offset < 0
      ? `atrim=start=${-offset},asetpts=PTS-STARTPTS`
      : "anull";
mkdirSync("out/transcription", { recursive: true });
execFileSync(
  "ffmpeg",
  [
    "-hide_banner",
    "-nostdin",
    "-y",
    "-i",
    source,
    "-map",
    "0:a:0",
    "-vn",
    "-af",
    align,
    "-ac",
    "1",
    "-ar",
    "16000",
    "-c:a",
    "pcm_s16le",
    "out/transcription/original.wav",
  ],
  { stdio: "inherit" },
);
console.log(
  "Salinan mono 16 kHz untuk ASR dibuat tanpa denoise/reverb. Track final tetap MOV original.",
);
