import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { resolve, dirname } from "node:path";
import ts from "typescript";
import * as blurEffect from "@remotion/effects/blur";
import * as zoomEffect from "@remotion/effects/zoom-blur";
import { convertCaptions } from "../scripts/import-captions.mjs";
// Load the production TS functions; fixtures never enter src/captions.json.
const cache = new Map();
function loadTS(path) {
  path = resolve(path);
  if (cache.has(path)) return cache.get(path);
  const module = { exports: {} };
  cache.set(path, module.exports);
  const js = ts.transpileModule(readFileSync(path, "utf8"), {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
      jsx: ts.JsxEmit.React,
      esModuleInterop: true,
    },
  }).outputText;
  const nativeRequire = createRequire(path);
  const localRequire = (name) =>
    name === "@remotion/effects/blur"
      ? blurEffect
      : name === "@remotion/effects/zoom-blur"
        ? zoomEffect
        : name.startsWith(".")
          ? loadTS(
              resolve(dirname(path), name) +
                (name.endsWith(".ts") ? "" : ".ts"),
            )
          : nativeRequire(name);
  new Function("require", "module", "exports", js)(
    localRequire,
    module,
    module.exports,
  );
  return module.exports;
}
const layout = loadTS("src/caption-layout.ts");
const motion = loadTS("src/FootageMotion.tsx");
const timing = loadTS("src/timing.ts");
const word = (text, startMs, endMs, extra = {}) => ({
  text,
  startMs,
  endMs,
  timestampMs: null,
  confidence: null,
  ...extra,
});
test("Whisper imports exact word times and metadata", () => {
  const doc = convertCaptions({
    segments: [
      {
        words: [
          { word: "Uji", start: 1, end: 1.3, probability: 0.9 },
          { word: "teks", start: 1.3, end: 1.8 },
        ],
      },
    ],
  });
  assert.deepEqual(
    doc.captions.map((c) => [c.startMs, c.endMs]),
    [
      [1000, 1300],
      [1300, 1800],
    ],
  );
  assert.equal(doc.captions[0].confidence, 0.9);
  assert.throws(
    () =>
      convertCaptions({ segments: [{ text: "segment without word timing" }] }),
    /word timestamps/,
  );
});
test("SRT phrase timing stays phrase timing; word SRT requires single word cues", () => {
  const srt = "1\n00:00:01,000 --> 00:00:02,000\nUji teks\n";
  const doc = convertCaptions(srt, { format: "srt" });
  assert.equal(doc.mode, "phrase");
  assert.equal(doc.captions[0].startMs, 1000);
  assert.equal(doc.captions[0].endMs, 2000);
  assert.throws(
    () => convertCaptions(srt, { format: "srt", wordSrt: true }),
    /satu kata/,
  );
  const single = convertCaptions(srt.replace("Uji teks", "Uji"), {
    format: "srt",
    wordSrt: true,
  });
  assert.equal(single.mode, "word");
});
test("unsafe timing and oversized phrases are rejected before save", () => {
  assert.throws(
    () => convertCaptions([word("a", 0, 300), word("b", 200, 400)]),
    /overlap/,
  );
  assert.throws(
    () => convertCaptions([word("a", 0, 500)], { durationMs: 400 }),
    /durasi/,
  );
  assert.throws(
    () =>
      convertCaptions({
        mode: "phrase",
        captions: [word("satu dua tiga empat lima enam", 0, 500)],
      }),
    /5 kata/,
  );
  assert.throws(
    () => convertCaptions([word("a", 0, 500, { timestampMs: 700 })]),
    /timestampMs/,
  );
});
test("pages respect scene cuts, pauses, explicit breaks and five-word limit", () => {
  const words = Array.from({ length: 12 }, (_, i) =>
    word(String(i), i * 200, i * 200 + 190),
  );
  const pages = layout.makeCaptionPages({ mode: "word", captions: words }, [
    1.2,
  ]);
  assert.deepEqual(
    pages.map((p) => p.tokens.length),
    [5, 1, 5, 1],
  );
  assert.deepEqual(
    pages.flatMap((p) => p.tokens),
    words,
  );
  assert.equal(layout.activeCaptionPage(pages, 0), pages[0]);
  assert.equal(layout.activeCaptionPage(pages, 990), null);
  const breaks = layout.makeCaptionPages(
    {
      mode: "word",
      captions: [
        word("a", 0, 100, { pageBreakAfter: true }),
        word("b", 100, 200),
        word("c", 600, 800),
      ],
    },
    [],
  );
  assert.equal(breaks.length, 3);
});
test("camera covers every frame without exposing empty edges", () => {
  for (let frame = 0; frame < 1474; frame++) {
    const c = motion.cameraAtTime(frame / 24);
    const shift = c.translate.split(" ").map(parseFloat);
    assert.ok(c.scale >= 1.02 && c.scale <= 1.07, `scale at frame ${frame}`);
    const margin = ((c.scale - 1) / 2) * 100;
    assert.ok(shift.every((s) => Math.abs(s) <= margin + 0.000001));
  }
  assert.ok(motion.cameraAtTime(2.1875).scale >= 1.054);
  assert.ok(motion.cameraAtTime(3).scale < 1.04);
  for (const shot of timing.shotMotion)
    assert.ok(
      Math.abs(
        motion.cameraAtTime(shot.start + 0.1).scale -
          motion.cameraAtTime(shot.end - 0.1).scale,
      ) > 0.015,
    );
});
test("blur is restricted to configured short transition intervals", () => {
  for (const b of timing.blurTransitions) {
    assert.ok(b.duration >= 0.15 && b.duration <= 0.35);
    assert.equal(motion.footageEffectsAtTime(b.at, 1080).length, 1);
  }
  for (let frame = 0; frame < 1474; frame++) {
    const t = frame / 24;
    const expected = timing.blurTransitions.some(
      (b) => Math.abs(t - b.at) < b.duration / 2,
    );
    assert.equal(motion.footageEffectsAtTime(t, 1080).length, expected ? 1 : 0);
  }
});
test("final composition retains the MOV path and a single original audio source", () => {
  const root = readFileSync("src/Root.tsx", "utf8");
  assert.equal((root.match(/<Video\b/g) || []).length, 1);
  assert.equal((root.match(/<Audio\b/g) || []).length, 0);
  assert.match(root, /staticFile\("assets\/Gabungan\.mov"\)/);
  assert.match(root, /volume=\{1\}/);
  assert.doesNotMatch(root, /useEnhanced|audio\.json|Gabungan-proxy/);
  const doc = JSON.parse(readFileSync("src/captions.json", "utf8"));
  if (!doc.captions.length) assert.deepEqual(doc.captions, []);
});
