import { spawnSync } from "node:child_process";
import {
  readFileSync,
  writeFileSync,
  mkdirSync,
  existsSync,
  renameSync,
} from "node:fs";
import { resolve, join } from "node:path";
import { fingerprint, probe, refreshAudioState } from "./audio-state.mjs";
const args = process.argv.slice(2);
const value = (name, fallback) => {
  const i = args.indexOf(name);
  return i < 0 ? fallback : args[i + 1];
};
const analysisOnly = args.includes("--analysis-only");
if (args.includes("--input") && !analysisOnly)
  throw new Error(
    "--input hanya untuk --analysis-only. Sumber final wajib public/assets/Gabungan.mov.",
  );
const input = analysisOnly
  ? value("--input", null)
  : "public/assets/Gabungan.mov";
if (!input || !existsSync(input))
  throw new Error(
    "Masukkan Gabungan.mov asli, atau gunakan --analysis-only --input PATH untuk uji proxy.",
  );
const out = analysisOnly
  ? resolve(value("--output", "out/proxy-audio-test"))
  : resolve("public/assets/audio");
if (analysisOnly && out.startsWith(resolve("public")))
  throw new Error("Hasil proxy tidak boleh ditulis ke folder public.");
mkdirSync(out, { recursive: true });
const cfg = JSON.parse(
  readFileSync(value("--config", "scripts/audio-settings.json"), "utf8"),
);
const range = (key, min, max) => {
  if (!Number.isFinite(cfg[key]) || cfg[key] < min || cfg[key] > max)
    throw new Error(`Pengaturan ${key} di luar batas ${min}..${max}`);
};
for (const [key, min, max] of [
  ["highpassHz", 20, 150],
  ["noiseReductionDb", 0, 12],
  ["noiseFloorDb", -80, -25],
  ["lowMidGainDb", -3, 3],
  ["presenceGainDb", -3, 3],
  ["compressionThresholdDb", -35, -6],
  ["compressionRatio", 1, 3],
  ["targetLufs", -24, -16],
  ["truePeakDb", -6, -1],
  ["maxSceneGainDb", 0, 6],
  ["sceneGainRampSeconds", 0.05, 0.5],
  ["sampleRate", 44100, 48000],
  ["musicDuckDb", -18, 0],
])
  range(key, min, max);
if (![44100, 48000].includes(cfg.sampleRate))
  throw new Error("Sample rate harus 44100 atau 48000.");
const sourceIdentity = fingerprint(input);
const data = probe(input),
  v = data.streams.find((s) => s.codec_type === "video"),
  a = data.streams.find((s) => s.codec_type === "audio");
if (!v || !a) throw new Error("Stream video/audio tidak tersedia.");
const duration = Number(data.format.duration);
if (!Number.isFinite(duration) || duration <= 0)
  throw new Error("Durasi tidak valid.");
if (Math.abs(duration - 61.416667) > 0.25)
  throw new Error(
    "Durasi berbeda dari timeline; periksa scene-cuts.json dahulu.",
  );
const ff = (list) => {
  const r = spawnSync("ffmpeg", ["-hide_banner", "-nostdin", ...list], {
    encoding: "utf8",
    maxBuffer: 32 * 1024 * 1024,
  });
  if (r.status !== 0) throw new Error(r.error?.message || r.stderr);
  return r.stderr;
};
const delta = Number(a.start_time || 0) - Number(v.start_time || 0);
const align = `aresample=${cfg.sampleRate}:async=0,${delta > 0 ? `adelay=${Math.round(delta * 1000)}:all=1` : delta < 0 ? `atrim=start=${-delta},asetpts=PTS-STARTPTS` : "anull"},apad,atrim=duration=${duration}`;
const before = join(out, "before.wav");
ff([
  "-y",
  "-i",
  input,
  "-map",
  "0:a:0",
  "-vn",
  "-af",
  align,
  "-c:a",
  "pcm_s16le",
  before,
]);
// Broad speech-band RMS is a level estimate, NOT source separation or a speech detector.
const cuts = [
  0,
  ...JSON.parse(readFileSync("docs/scene-cuts.json")).seconds,
  duration,
];
const levels = [];
for (let i = 0; i < cuts.length - 1; i++) {
  const log = ff([
    "-ss",
    String(cuts[i]),
    "-t",
    String(cuts[i + 1] - cuts[i]),
    "-i",
    before,
    "-af",
    "highpass=f=120,lowpass=f=4000,volumedetect",
    "-f",
    "null",
    "-",
  ]);
  const match = log.match(/mean_volume:\s*([-.\d]+) dB/);
  levels.push(match ? Number(match[1]) : -99);
}
const sorted = levels.filter((n) => n > -65).sort((a, b) => a - b);
const median = sorted[Math.floor(sorted.length / 2)] ?? -25;
const gains = levels.map((n) =>
  n <= -65
    ? 0
    : Math.max(-cfg.maxSceneGainDb, Math.min(cfg.maxSceneGainDb, median - n)),
);
const ramps = gains
  .slice(1)
  .map(
    (gain, i) =>
      `(${gain - gains[i]})*clip((t-${cuts[i + 1] - cfg.sceneGainRampSeconds / 2})/${cfg.sceneGainRampSeconds},0,1)`,
  );
const gainExpr = [String(gains[0]), ...ramps].join("+");
// Calibrate FFT denoiser latency on this FFmpeg build with an isolated impulse.
// Pad before the FFT stage so compensation does not discard the final spoken samples.
let denoiseLatencySamples = 0;
if (cfg.noiseReductionDb > 0) {
  const impulseAt = Math.round(cfg.sampleRate * 0.1);
  const test = spawnSync(
    "ffmpeg",
    [
      "-v",
      "error",
      "-f",
      "lavfi",
      "-i",
      `aevalsrc=if(eq(n\\,${impulseAt})\\,0.8\\,0):s=${cfg.sampleRate}:d=0.5`,
      "-af",
      `afftdn=nr=${cfg.noiseReductionDb}:nf=${cfg.noiseFloorDb}:tn=0`,
      "-f",
      "f64le",
      "-",
    ],
    { maxBuffer: 4 * 1024 * 1024 },
  );
  if (test.status !== 0 || !test.stdout?.length)
    throw new Error("Kalibrasi latency denoiser gagal.");
  let peak = 0,
    index = 0;
  for (let j = 0; j < test.stdout.length / 8; j++) {
    const v = Math.abs(test.stdout.readDoubleLE(j * 8));
    if (v > peak) {
      peak = v;
      index = j;
    }
  }
  denoiseLatencySamples = index - impulseAt;
  if (
    denoiseLatencySamples < 0 ||
    denoiseLatencySamples > cfg.sampleRate * 0.1 ||
    peak < 0.001
  )
    throw new Error("Kalibrasi latency tidak masuk akal.");
}
const chain = [
  `highpass=f=${cfg.highpassHz}`,
  cfg.noiseReductionDb > 0
    ? `apad=pad_len=${denoiseLatencySamples},afftdn=nr=${cfg.noiseReductionDb}:nf=${cfg.noiseFloorDb}:tn=0,atrim=start_sample=${denoiseLatencySamples},asetpts=N/SR/TB`
    : null,
  `equalizer=f=250:t=q:w=1:g=${cfg.lowMidGainDb}`,
  `equalizer=f=2800:t=q:w=1:g=${cfg.presenceGainDb}`,
  `volume='pow(10,(${gainExpr})/20)':eval=frame`,
  `acompressor=threshold=${10 ** (cfg.compressionThresholdDb / 20)}:ratio=${cfg.compressionRatio}:attack=20:release=180:makeup=1`,
]
  .filter(Boolean)
  .join(",");
const loud = `loudnorm=I=${cfg.targetLufs}:TP=${cfg.truePeakDb}:LRA=11`;
const parseLoud = (log) => {
  const matches = log.match(/\{\s*"input_i"[\s\S]*?\}/g);
  if (!matches) throw new Error("Pengukuran loudness gagal.");
  return JSON.parse(matches.at(-1));
};
const measured = parseLoud(
  ff([
    "-i",
    before,
    "-af",
    chain + "," + loud + ":print_format=json",
    "-f",
    "null",
    "-",
  ]),
);
if (
  !Object.values(measured)
    .filter((v) => typeof v === "string" && v !== "dynamic" && v !== "linear")
    .every((v) => Number.isFinite(Number(v)))
)
  throw new Error("Audio hening atau pengukuran tidak valid.");
const norm =
  loud +
  `:measured_I=${measured.input_i}:measured_TP=${measured.input_tp}:measured_LRA=${measured.input_lra}:measured_thresh=${measured.input_thresh}:offset=${measured.target_offset}:linear=true`;
const temp = join(out, "enhanced-temp.wav"),
  clean = join(out, "enhanced.wav");
ff([
  "-y",
  "-i",
  before,
  "-af",
  `${chain},${norm},aresample=${cfg.sampleRate},asetpts=N/SR/TB,apad,atrim=end_sample=${Math.round(duration * cfg.sampleRate)}`,
  "-c:a",
  "pcm_s16le",
  temp,
]);
const result = probe(temp);
if (Math.abs(Number(result.format.duration) - duration) > 0.025) {
  throw new Error(
    `Durasi audio berubah (${result.format.duration} vs ${duration}); hasil ditolak.`,
  );
}
renameSync(temp, clean);
const beforeStats = parseLoud(
  ff(["-i", before, "-af", loud + ":print_format=json", "-f", "null", "-"]),
);
const afterStats = parseLoud(
  ff(["-i", clean, "-af", loud + ":print_format=json", "-f", "null", "-"]),
);
const report = {
  analysisOnly,
  duration,
  denoiseLatencySamples,
  settings: cfg,
  original: beforeStats,
  processed: afterStats,
  scenes: levels.map((rms, i) => ({
    start: cuts[i],
    end: cuts[i + 1],
    speechBandRmsDb: rms,
    gainDb: gains[i],
  })),
  filter: chain + ", " + norm,
  notes: [
    "Mixed track processed conservatively; no music/voice separation.",
    "No time stretching, sample deletion, dialogue synthesis or gate.",
    "Listen before/after: measurements do not establish naturalness or perfect denoising.",
  ],
};
writeFileSync(join(out, "report.json"), JSON.stringify(report, null, 2));
// Optional ducking ONLY for a verified, separately supplied MUSIC stem; never duck the mixed dialogue.
const music = value("--music-stem", null);
if (music) {
  if (!cfg.speechWindows.length)
    throw new Error(
      "Isi speechWindows [start,end] yang telah diverifikasi sebelum ducking stem musik.",
    );
  const windows = cfg.speechWindows;
  if (
    !windows.every(
      (w) =>
        Array.isArray(w) &&
        w.length === 2 &&
        Number.isFinite(w[0]) &&
        Number.isFinite(w[1]) &&
        w[0] >= 0 &&
        w[1] > w[0] &&
        w[1] <= duration,
    )
  )
    throw new Error("speechWindows tidak valid.");
  const env = windows
    .map(
      ([s, e]) =>
        `min(clip((t-${s - 0.15})/.15,0,1),clip((${e + 0.25}-t)/.25,0,1))`,
    )
    .reduce((x, y) => (x ? `max(${x},${y})` : y), "");
  ff([
    "-y",
    "-i",
    music,
    "-vn",
    "-af",
    `volume='pow(10,(${cfg.musicDuckDb})*(${env})/20)':eval=frame,apad,atrim=duration=${duration}`,
    "-c:a",
    "pcm_s16le",
    join(out, "music-ducked.wav"),
  ]);
  console.log(
    "music-ducked.wav dibuat untuk evaluasi saja. Jangan campur dengan track yang masih mengandung musik yang sama.",
  );
}
writeFileSync(
  join(out, "compare.html"),
  `<!doctype html><meta charset="utf-8"><title>Before / After</title><style>body{font:18px Arial;background:#102e50;color:white;padding:40px}audio{display:block;margin:16px 0;width:90%}</style><h1>${analysisOnly ? "Proxy — analisis saja" : "Gabungan.mov — evaluasi audio"}</h1><p>Dengarkan pada volume perangkat yang sama. Perbedaan loudness bukan bukti noise hilang.</p><h2>Before</h2><audio controls src="before.wav"></audio><h2>After</h2><audio controls src="enhanced.wav"></audio><p>Periksa semua kata, suara rendah, sibilance, pumping, dan naturalitas. Revisi TikTok saat ini selalu memakai audio MOV original. Hasil enhancement ini hanya untuk evaluasi dan tidak dirujuk UNESA-Promo.</p>`,
);
if (!analysisOnly) {
  const current = fingerprint(input);
  if (
    current.size !== sourceIdentity.size ||
    current.mtimeMs !== sourceIdentity.mtimeMs
  )
    throw new Error(
      "MOV berubah selama pemrosesan. Jalankan ulang enhancement.",
    );
  writeFileSync(
    join(out, "manifest.json"),
    JSON.stringify(
      { source: sourceIdentity, duration, settings: cfg },
      null,
      2,
    ),
  );
  refreshAudioState();
}
console.log(
  `Selesai: ${out}. Before ${beforeStats.input_i} LUFS; after ${afterStats.input_i} LUFS; after true peak ${afterStats.input_tp} dBTP.`,
);
console.log(
  analysisOnly
    ? "Hasil proxy TIDAK diaktifkan di Remotion."
    : "Audio bersih tersedia. Studio memilihnya sekali; audio MOV dibisukan. Jalankan prepare-video sebelum render.",
);
