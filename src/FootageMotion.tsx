import React from "react";
import {
  AbsoluteFill,
  Easing,
  Sequence,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import {
  footageCues,
  shotMotion,
  cutAccents,
  palette,
  motionSettings,
  softFlashCuts,
  type FootageCue,
} from "./timing";
import { Trail } from "@remotion/motion-blur";
const clamp = {
  extrapolateLeft: "clamp" as const,
  extrapolateRight: "clamp" as const,
};
export const useFootageCamera = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const time = frame / fps;
  const move = shotMotion.find((m) => time >= m.start && time < m.end);
  if (!move)
    return { scale: 1, translate: "0% 0%", transformOrigin: "50% 50%" };
  const progress = interpolate(time, [move.start, move.end], [0, 1], {
    ...clamp,
    easing: Easing.bezier(0.42, 0, 0.58, 1),
  });
  const intensity = Math.max(0, Math.min(1.5, motionSettings.cameraIntensity));
  const scale =
    1 + (move.from + (move.to - move.from) * progress - 1) * intensity;
  // Translation is always below the overscan margin on BOTH axes, including mid-shot.
  const margin = Math.max(0, (scale - 1) / 2) * 0.8;
  const bound = (v: number) => Math.max(-margin, Math.min(margin, v));
  return {
    scale,
    translate: `${bound(move.panX * (progress - 0.5) * 2 * motionSettings.panIntensity) * 100}% ${bound(move.panY * (progress - 0.5) * 2 * motionSettings.panIntensity) * 100}%`,
    transformOrigin: "50% 50%",
  };
};
const FootageCard: React.FC<{ cue: FootageCue }> = ({ cue }) => {
  const f = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const end = Math.round(cue.duration * fps);
  const portrait = height > width;
  return (
    <div
      style={{
        position: "absolute",
        left: `${cue.x * 100}%`,
        top: `${cue.y * 100}%`,
        width: "84%",
        boxSizing: "border-box",
        padding: width * 0.025,
        color: palette.white,
        fontFamily: "Arial, sans-serif",
        opacity: interpolate(
          f,
          [0, 0.4 * fps, end - 0.4 * fps, end],
          [0, 1, 1, 0],
          clamp,
        ),
        clipPath: `inset(0 ${interpolate(f, [0, 0.65 * fps], [100, 0], { ...clamp, easing: Easing.bezier(0.16, 1, 0.3, 1) })}% 0 0)`,
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "linear-gradient(100deg,#071321ed,#071321aa)",
          borderLeft: `${Math.max(2, width * 0.003)}px solid ${palette.gold}`,
          borderRadius: width * 0.008,
        }}
      />
      <div
        style={{
          position: "relative",
          fontSize: width * (portrait ? 0.022 : 0.012),
          letterSpacing: interpolate(
            f,
            [0, 0.8 * fps],
            [width * 0.012, width * 0.004],
            clamp,
          ),
          color: palette.gold,
          marginBottom: height * 0.006,
        }}
      >
        UNESA
      </div>
      <div
        style={{
          overflow: "hidden",
          position: "relative",
          height: width * (portrait ? 0.061 : 0.032) * 1.14,
        }}
      >
        <Trail
          layers={motionSettings.textBlur ? 3 : 1}
          lagInFrames={0.35}
          trailOpacity={0.12}
        >
          <AnimatedHeading title={cue.title} />
        </Trail>
      </div>
      {cue.subtitle && (
        <div
          style={{
            position: "relative",
            fontSize: width * (portrait ? 0.034 : 0.018),
            lineHeight: 1.3,
            marginTop: height * 0.006,
            opacity: interpolate(f, [0.3 * fps, 0.9 * fps], [0, 1], clamp),
          }}
        >
          {cue.subtitle}
        </div>
      )}
      <div
        style={{
          position: "relative",
          overflow: "hidden",
          height: Math.max(1, width * 0.002),
          width: interpolate(
            f,
            [0.15 * fps, 0.95 * fps],
            [0, width * 0.36],
            clamp,
          ),
          background: palette.gold,
          boxShadow: `0 0 8px ${palette.gold}66`,
          marginTop: height * 0.01,
        }}
      >
        <div
          style={{
            width: width * 0.15,
            height: "100%",
            background: "linear-gradient(90deg,transparent,#fff,transparent)",
            translate: `${interpolate(f, [0.6 * fps, 1.9 * fps], [-width * 0.15, width * 0.4], clamp)}px 0`,
          }}
        />
      </div>
    </div>
  );
};
const CutAccent: React.FC = () => {
  const f = useCurrentFrame();
  const { fps, width } = useVideoConfig();
  return (
    <div
      style={{
        position: "absolute",
        left: "4%",
        bottom: "5%",
        height: 2,
        width: width * 0.22,
        background: `linear-gradient(90deg,transparent,${palette.gold},transparent)`,
        opacity: interpolate(
          f,
          [0, 0.15 * fps, 0.65 * fps],
          [0, 0.45, 0],
          clamp,
        ),
        scale: `${interpolate(f, [0, 0.65 * fps], [0.3, 1], clamp)} 1`,
      }}
    />
  );
};
export const FootageGraphics: React.FC = () => {
  const { fps } = useVideoConfig();
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <Atmosphere />
      {/* All cards use one editable data template in timing.ts; no unverified speaker names. */}
      {footageCues
        .filter((c) => c.enabled)
        .map((c) => (
          <Sequence
            key={c.id}
            name={c.id}
            from={Math.round(c.start * fps)}
            durationInFrames={Math.round(c.duration * fps)}
            premountFor={fps}
          >
            <FootageCard cue={c} />
          </Sequence>
        ))}
      {softFlashCuts.map((t) => (
        <Sequence
          key={`flash-${t}`}
          name={`Soft flash ${t}s`}
          from={Math.round(t * fps)}
          durationInFrames={Math.round(0.25 * fps)}
          premountFor={fps}
        >
          <SoftFlash />
        </Sequence>
      ))}
      {cutAccents.map((t) => (
        <Sequence
          key={t}
          name={`Cut accent ${t}s`}
          from={Math.round(t * fps)}
          durationInFrames={Math.round(0.65 * fps)}
          premountFor={fps}
        >
          <CutAccent />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};

const SoftFlash: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <AbsoluteFill
      style={{
        background: "#f5ead1",
        opacity: interpolate(
          f,
          [0, 0.06 * fps, 0.25 * fps],
          [0, motionSettings.flashOpacity, 0],
          clamp,
        ),
      }}
    />
  );
};
const Atmosphere: React.FC = () => {
  const f = useCurrentFrame();
  const { width, height, fps } = useVideoConfig();
  const t = f / fps;
  const shot = shotMotion.find((m) => t >= m.start && t < m.end);
  const progress = shot ? (t - shot.start) / (shot.end - shot.start) : 0;
  return (
    <AbsoluteFill>
      <svg
        width="100%"
        height="100%"
        style={{
          position: "absolute",
          opacity: motionSettings.grainOpacity,
          mixBlendMode: "soft-light",
        }}
      >
        <filter id="unesa-grain">
          <feTurbulence
            type="fractalNoise"
            baseFrequency=".85"
            numOctaves="2"
            stitchTiles="stitch"
            seed={Math.floor(f / 6) % 13}
          />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter="url(#unesa-grain)" />
      </svg>
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse at ${15 + progress * 70}% 104%,${palette.gold},transparent 44%)`,
          opacity: motionSettings.edgeGlowOpacity,
        }}
      />
      {motionSettings.ambientAccents && (
        <>
          <div
            style={{
              position: "absolute",
              left: "3%",
              bottom: "3%",
              width: width * 0.18,
              height: 1,
              background: `linear-gradient(90deg,${palette.gold},transparent)`,
              opacity: 0.32,
            }}
          />
          <div
            style={{
              position: "absolute",
              left: `${3 + progress * 18}%`,
              bottom: "3%",
              width: 3,
              height: 3,
              borderRadius: "50%",
              background: palette.gold,
              opacity: 0.45,
            }}
          />
          <div
            style={{
              position: "absolute",
              right: "3%",
              bottom: "3%",
              width: width * 0.06,
              height: height * 0.025,
              borderRight: `1px solid ${palette.gold}88`,
              borderBottom: `1px solid ${palette.gold}88`,
              translate: `0 ${Math.sin(t * 0.7) * height * 0.002}px`,
            }}
          />
        </>
      )}
    </AbsoluteFill>
  );
};

const AnimatedHeading: React.FC<{ title: string }> = ({ title }) => {
  const f = useCurrentFrame();
  const { width, height, fps } = useVideoConfig();
  return (
    <div
      style={{
        fontSize: width * (height > width ? 0.061 : 0.032),
        fontWeight: 600,
        lineHeight: 1.13,
        letterSpacing: interpolate(
          f,
          [0.1 * fps, 0.7 * fps],
          [width * 0.002, -width * 0.001],
          clamp,
        ),
        translate: `0 ${interpolate(f, [0.1 * fps, 0.7 * fps], [45, 0], { ...clamp, easing: Easing.bezier(0.16, 1, 0.3, 1) })}%`,
      }}
    >
      {title}
    </div>
  );
};
