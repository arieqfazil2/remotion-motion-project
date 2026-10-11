import React, { useMemo } from "react";
import { Easing, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import type { Caption } from "@remotion/captions";
import data from "./captions.json";
import cuts from "../docs/scene-cuts.json";
import { subtitleSettings } from "./timing";
import {
  activeCaptionPage,
  makeCaptionPages,
  type CaptionDocument,
  type CaptionPage,
} from "./caption-layout";
export const captionDocument = data as CaptionDocument;
export const captionPages = makeCaptionPages(captionDocument, cuts.seconds);
export const useActiveSubtitle = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  return subtitleSettings.enabled
    ? activeCaptionPage(captionPages, (f / fps) * 1000)
    : null;
};
export const useSubtitleBusy = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const ms = (f / fps) * 1000;
  return (
    subtitleSettings.enabled &&
    captionPages.some((p) => ms >= p.startMs - 120 && ms < p.endMs + 220)
  );
};
export const SubtitleText: React.FC<{
  page: CaptionPage;
  wordMode: boolean;
}> = ({ page, wordMode }) => {
  const f = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const ms = (f / fps) * 1000;
  const age = ms - page.startMs,
    duration = page.endMs - page.startMs,
    fade = Math.min(110, duration / 3);
  const items = wordMode
    ? page.tokens
    : page.tokens[0].text
        .trim()
        .split(/\s+/u)
        .map((text) => ({ ...page.tokens[0], text }));
  // Two explicit lines; no third line can emerge from wrapping.
  const split = items.length > 3 ? Math.ceil(items.length / 2) : items.length;
  const lines =
    items.length > 3 ? [items.slice(0, split), items.slice(split)] : [items];
  // Scale down unusually long phrases to fit the safe box; do not truncate dialogue.
  const baseFont = width * subtitleSettings.fontSizeRatio;
  const lineText = lines.map((line) =>
    line.map((c) => c.text.trim()).join(" "),
  );
  const fontSize = useMemo(() => {
    const ctx = document.createElement("canvas").getContext("2d");
    if (!ctx)
      return Math.min(
        baseFont,
        (width * 0.72) / (Math.max(...lineText.map((t) => t.length), 1) * 0.95),
      );
    ctx.font = `800 ${baseFont}px Arial`;
    const measured = Math.max(
      1,
      ...lineText.map((t) => ctx.measureText(t).width),
    );
    return Math.min(baseFont, (baseFont * width * 0.72) / measured);
  }, [baseFont, width, lineText.join("\n")]);
  const wordStyle = (c: Caption) => ({
    color:
      wordMode && ms >= c.startMs && ms < c.endMs
        ? subtitleSettings.highlight
        : "#fff",
  });
  return (
    <div
      data-subtitle-active="true"
      style={{
        position: "absolute",
        left: "7%",
        width: "76%",
        bottom: `${subtitleSettings.bottom * 100}%`,
        textAlign: "center",
        fontFamily: "Arial, Helvetica, sans-serif",
        fontWeight: 800,
        fontSize,
        lineHeight: 1.16,
        whiteSpace: "nowrap",
        pointerEvents: "none",
        textShadow: "0 2px 5px #000, 0 0 9px #000a",
        WebkitTextStroke: `${width * 0.0014}px #0008`,
        paintOrder: "stroke fill",
        opacity: interpolate(
          age,
          [0, fade, duration - fade, duration],
          [0, 1, 1, 0],
          { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
        ),
        scale: interpolate(age, [0, 150], [0.95, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
          easing: Easing.bezier(0.16, 1, 0.3, 1),
        }),
      }}
    >
      {lines.map((line, index) => (
        <div key={index}>
          {line.map((c, i) => (
            <React.Fragment key={`${c.startMs}-${i}`}>
              <span style={wordStyle(c)}>{c.text.trim()}</span>
              {i < line.length - 1 ? " " : ""}
            </React.Fragment>
          ))}
        </div>
      ))}
    </div>
  );
};
export const Subtitles: React.FC = () => {
  const page = useActiveSubtitle();
  return page ? (
    <SubtitleText page={page} wordMode={captionDocument.mode === "word"} />
  ) : null;
};
