import type { Caption } from "@remotion/captions";
export type CaptionDocument = { mode: "word" | "phrase"; captions: Caption[] };
export type CaptionPage = { startMs: number; endMs: number; tokens: Caption[] };
// Keep imported word timestamps intact. Page boundaries never create estimated word timings.
export function makeCaptionPages(
  document: CaptionDocument,
  cuts: number[],
  maxWords = 5,
): CaptionPage[] {
  if (document.mode === "phrase")
    return document.captions.map((c) => ({
      startMs: c.startMs,
      endMs: c.endMs,
      tokens: [c],
    }));
  const pages: CaptionPage[] = [];
  let group: Caption[] = [];
  const flush = () => {
    if (group.length) {
      pages.push({
        startMs: group[0].startMs,
        endMs: group.at(-1)!.endMs,
        tokens: group,
      });
      group = [];
    }
  };
  for (const caption of document.captions) {
    const previous = group.at(-1);
    const crossesCut =
      previous &&
      cuts.some(
        (c) => c * 1000 > previous.startMs && c * 1000 <= caption.startMs,
      );
    if (
      previous &&
      (group.length >= maxWords ||
        caption.startMs - previous.endMs > 280 ||
        previous.pageBreakAfter ||
        crossesCut)
    )
      flush();
    group.push(caption);
  }
  flush();
  return pages;
}
export const activeCaptionPage = (pages: CaptionPage[], timeMs: number) =>
  pages.find((p) => timeMs >= p.startMs && timeMs < p.endMs) ?? null;
