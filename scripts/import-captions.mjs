import { readFileSync, writeFileSync } from "node:fs";
import { extname } from "node:path";
import { parseSrt } from "@remotion/captions";
export function convertCaptions(
  input,
  { format = "json", wordSrt = false, mode, durationMs = Infinity } = {},
) {
  let document;
  if (format === "srt")
    document = {
      mode: wordSrt ? "word" : "phrase",
      captions: parseSrt({ input, strict: true }).captions,
    };
  else {
    const raw = typeof input === "string" ? JSON.parse(input) : input;
    if (raw.segments || raw.words) {
      const words =
        raw.words ||
        raw.segments.flatMap((s) => {
          if (!s.words)
            throw new Error(
              "JSON Whisper tidak memiliki word timestamps. Buat ulang dengan --word_timestamps True.",
            );
          return s.words;
        });
      document = {
        mode: "word",
        captions: words.map((w) => ({
          text: w.word ?? w.text,
          startMs: Math.round(w.start * 1000),
          endMs: Math.round(w.end * 1000),
          timestampMs: null,
          confidence: w.probability ?? null,
        })),
      };
    } else
      document = {
        mode: mode ?? raw.mode ?? "word",
        captions: Array.isArray(raw) ? raw : raw.captions,
      };
  }
  if (
    !["word", "phrase"].includes(document.mode) ||
    !Array.isArray(document.captions) ||
    !document.captions.length
  )
    throw new Error("Dokumen caption kosong atau mode tidak valid.");
  let end = -1;
  document.captions = document.captions.map((c, i) => {
    if (typeof c.text !== "string" || !c.text.trim() || /[<>]/u.test(c.text))
      throw new Error(
        `Caption ${i}: teks kosong atau markup. Gunakan teks biasa yang diverifikasi.`,
      );
    const text = c.text.trim();
    const words = text.split(/\s+/u).length;
    if (document.mode === "word" && words !== 1)
      throw new Error(
        `Caption ${i}: mode word harus satu kata dengan timing asli. Gunakan --mode phrase jika hanya timing frasa tersedia.`,
      );
    if (document.mode === "phrase" && words > 5)
      throw new Error(
        `Caption ${i}: frasa melebihi 5 kata. Perbaiki batas frasa sesuai ucapan di editor; script tidak mengarang timing kata.`,
      );
    if (
      !Number.isFinite(c.startMs) ||
      !Number.isFinite(c.endMs) ||
      c.startMs < 0 ||
      c.endMs <= c.startMs ||
      c.startMs < end ||
      c.endMs > durationMs + 1
    )
      throw new Error(
        `Caption ${i}: timestamp tidak valid, overlap, atau melewati durasi sumber.`,
      );
    end = c.endMs;
    if (
      c.confidence != null &&
      (!Number.isFinite(c.confidence) || c.confidence < 0 || c.confidence > 1)
    )
      throw new Error(`Caption ${i}: confidence di luar 0..1.`);
    if (
      c.timestampMs != null &&
      (!Number.isFinite(c.timestampMs) ||
        c.timestampMs < c.startMs ||
        c.timestampMs > c.endMs)
    )
      throw new Error(`Caption ${i}: timestampMs di luar interval kata.`);
    return {
      text: " " + text,
      startMs: c.startMs,
      endMs: c.endMs,
      timestampMs: c.timestampMs ?? null,
      confidence: c.confidence ?? null,
      ...(c.pageBreakAfter ? { pageBreakAfter: true } : {}),
    };
  });
  return document;
}
if (process.argv[1]?.endsWith("import-captions.mjs")) {
  const args = process.argv.slice(2),
    path = args[0];
  if (!path)
    throw new Error(
      "npm run import-captions -- path/transkrip.json atau path/subtitle.srt [--word-srt] [--mode phrase]",
    );
  const modeIndex = args.indexOf("--mode");
  const source = JSON.parse(readFileSync("src/source.json", "utf8"));
  const doc = convertCaptions(readFileSync(path, "utf8"), {
    format: extname(path).toLowerCase() === ".srt" ? "srt" : "json",
    wordSrt: args.includes("--word-srt"),
    mode: modeIndex >= 0 ? args[modeIndex + 1] : undefined,
    durationMs: source.durationSeconds * 1000,
  });
  writeFileSync("src/captions.json", JSON.stringify(doc, null, 2) + "\n");
  console.log(
    `${doc.captions.length} caption diimpor, mode ${doc.mode}. ${doc.mode === "phrase" ? "Highlight per kata nonaktif; timing kata tidak tersedia." : "Highlight menggunakan interval kata impor."} Periksa seluruh dialog dan timing terhadap audio original di Studio.`,
  );
}
