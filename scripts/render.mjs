import { refreshAudioState } from "./audio-state.mjs";
import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync } from "node:fs";
if (!existsSync("public/assets/Gabungan.mov")) {
  console.error(
    "Video asli belum siap. Jalankan npm run prepare-video setelah memasukkan Gabungan.mov.",
  );
  process.exit(1);
}
// Always refresh metadata and stale-audio checks immediately before rendering.
const prepared = spawnSync(process.execPath, ["scripts/prepare.mjs"], {
  stdio: "inherit",
});
if (prepared.status !== 0) process.exit(prepared.status ?? 1);
refreshAudioState();
mkdirSync("out", { recursive: true });
const result = spawnSync(
  process.platform === "win32" ? "npx.cmd" : "npx",
  [
    "remotion",
    "render",
    "src/index.ts",
    "UNESA-Promo",
    "out/UNESA-S2-motion.mp4",
    "--codec=h264",
    "--crf=16",
    "--pixel-format=yuv420p",
    "--audio-codec=aac",
    "--audio-bitrate=320k",
  ],
  { stdio: "inherit", shell: process.platform === "win32" },
);
process.exit(result.status ?? 1);
