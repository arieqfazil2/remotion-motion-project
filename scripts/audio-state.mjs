import { existsSync, readFileSync, writeFileSync, statSync } from "node:fs";
import { execFileSync } from "node:child_process";
export const fingerprint = (file) => {
  const s = statSync(file);
  return { size: s.size, mtimeMs: s.mtimeMs };
};
export const probe = (file) =>
  JSON.parse(
    execFileSync(
      "ffprobe",
      ["-v", "error", "-show_streams", "-show_format", "-of", "json", file],
      { encoding: "utf8", maxBuffer: 8 * 1024 * 1024 },
    ),
  );
export function refreshAudioState(paths = {}) {
  const input = paths.input || "public/assets/Gabungan.mov",
    clean = paths.clean || "public/assets/audio/enhanced.wav",
    manifest = paths.manifest || "public/assets/audio/manifest.json";
  let available = false;
  if (existsSync(input) && existsSync(clean) && existsSync(manifest)) {
    try {
      const m = JSON.parse(readFileSync(manifest));
      const current = fingerprint(input);
      const a = probe(clean);
      available =
        m.source.size === current.size &&
        m.source.mtimeMs === current.mtimeMs &&
        Math.abs(Number(a.format.duration) - m.duration) < 0.025;
    } catch {
      available = false;
    }
  }
  writeFileSync(
    paths.state || "src/audio.json",
    JSON.stringify({ available, path: "assets/audio/enhanced.wav" }, null, 2) +
      "\n",
  );
  return available;
}
