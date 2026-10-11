// Legacy MotionPreview styling. UNESA-Promo uses footageCues/shotMotion below.
// Seconds are editable; no speaker names or unverified promotional claims.
export type Cue = {
  enabled: boolean;
  start: number;
  duration: number;
  title: string;
  subtitle: string;
  x: number;
  y: number;
};
export const palette = { navy: "#102E50", gold: "#D9B66F", white: "#F7F6F2" }; // provisional, not an official brand specification
export const opening: Cue = {
  enabled: false,
  start: 0.8,
  duration: 4.5,
  title: "Program Magister (S2)",
  subtitle: "Universitas Negeri Surabaya",
  x: 0.07,
  y: 0.68,
};
export const lowerThird: Cue = {
  enabled: false,
  start: 8,
  duration: 4,
  title: "",
  subtitle: "",
  x: 0.07,
  y: 0.76,
};
export const closing: Cue = {
  enabled: false,
  start: 0,
  duration: 4,
  title: "Program Magister (S2)",
  subtitle: "Universitas Negeri Surabaya",
  x: 0.07,
  y: 0.68,
};
export const camera = {
  enabled: false,
  start: 0,
  end: 5,
  maxScale: 1.025,
  originX: 50,
  originY: 50,
};
export const logo = { enabled: false, path: "assets/logo-unesa.png" };

// Authored from the 61.416667s proxy, 24fps. Final source stays Gabungan.mov.
// Scene-relative seconds keep these timings independent of original FPS.
export type FootageCue = Cue & { id: string };
export const footageCues: FootageCue[] = [
  {
    id: "Opening identity",
    enabled: true,
    start: 0.6,
    duration: 4.1,
    title: "Program Magister (S2)",
    subtitle: "Universitas Negeri Surabaya",
    x: 0.08,
    y: 0.82,
  },
  {
    id: "Pascasarjana lower third",
    enabled: true,
    start: 25.6,
    duration: 4.3,
    title: "Pascasarjana",
    subtitle: "Universitas Negeri Surabaya",
    x: 0.08,
    y: 0.83,
  },
  {
    id: "Closing identity",
    enabled: true,
    start: 57,
    duration: 4.416667,
    title: "Program Magister (S2)",
    subtitle: "Universitas Negeri Surabaya",
    x: 0.08,
    y: 0.83,
  },
];
// Edge accents preserve the existing cut and do not obscure the speaker.
export const cutAccents = [
  5.208333, 19.916667, 30.833333, 41.958333, 54.791667,
];

// Final-revision controls: independent of FPS; all typography is verified identity.
export const motionSettings = {
  cameraIntensity: 1,
  panIntensity: 1,
  textBlur: true,
  grainOpacity: 0.022,
  edgeGlowOpacity: 0.065,
  flashOpacity: 0.065,
  ambientAccents: true,
};
export const audioSettings = { useEnhanced: true }; // Missing/stale asset falls back to the MOV audio.
export const shotMotion = [
  { start: 0, end: 5.208333, from: 1.01, to: 1.035, panX: -0.003, panY: 0.003 },
  {
    start: 5.208333,
    end: 10.291667,
    from: 1.016,
    to: 1.048,
    panX: 0.006,
    panY: -0.004,
  },
  {
    start: 10.291667,
    end: 15.125,
    from: 1.03,
    to: 1.01,
    panX: -0.003,
    panY: 0,
  },
  {
    start: 15.125,
    end: 19.916667,
    from: 1.01,
    to: 1.03,
    panX: 0.003,
    panY: 0.002,
  },
  {
    start: 19.916667,
    end: 25.208333,
    from: 1.015,
    to: 1.045,
    panX: 0.006,
    panY: -0.004,
  },
  {
    start: 25.208333,
    end: 30.833333,
    from: 1.044,
    to: 1.014,
    panX: -0.005,
    panY: 0.003,
  },
  {
    start: 30.833333,
    end: 36.541667,
    from: 1.01,
    to: 1.032,
    panX: 0.003,
    panY: 0.002,
  },
  {
    start: 36.541667,
    end: 41.958333,
    from: 1.031,
    to: 1.012,
    panX: -0.003,
    panY: 0.002,
  },
  {
    start: 41.958333,
    end: 49.875,
    from: 1.012,
    to: 1.038,
    panX: 0.004,
    panY: -0.003,
  },
  {
    start: 49.875,
    end: 54.791667,
    from: 1.028,
    to: 1.01,
    panX: -0.002,
    panY: 0.002,
  },
  {
    start: 54.791667,
    end: 61.416667,
    from: 1.012,
    to: 1.04,
    panX: 0.004,
    panY: 0.003,
  },
];
export const softFlashCuts = [19.916667, 41.958333, 54.791667];
