import { readFileSync } from "node:fs";
import { convertCaptions } from "./import-captions.mjs";
const doc = JSON.parse(readFileSync("src/captions.json", "utf8"));
const source = JSON.parse(readFileSync("src/source.json", "utf8"));
if (doc.captions.length) {
  convertCaptions(doc, { durationMs: source.durationSeconds * 1000 });
  console.log(
    "Caption data/timing valid. Dialog tetap perlu diverifikasi terhadap audio original.",
  );
} else
  console.log(
    "Belum ada transkrip: subtitle tidak ditampilkan; tidak ada dialog rekaan.",
  );
