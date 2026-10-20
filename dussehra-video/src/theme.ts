// Palette and timeline shared by every component. All times are in frames @ 30 fps.
export const FPS = 30;
export const DURATION = 360; // 12 s

export const C = {
  ivory: "#FCF6EA",
  ivoryWarm: "#F6E7C8",
  gold: "#C9973A",
  goldLight: "#F4DC97",
  goldPale: "#FBEFC9",
  goldDeep: "#946219",
  maroon: "#6B1222",
  maroonDeep: "#480A15",
  marigold: "#EE7F14",
  marigoldDeep: "#C9550A",
  marigoldYellow: "#F7B718",
  leaf: "#4F7A2A",
  clay: "#9A4A22",
  clayDeep: "#6E2E12",
};

export const T = {
  // Scene 1 — festive opening
  bgGlow: [0, 45],
  rays: [8, 60],
  dust: [6, 50],
  scenery: [0, 54],
  logo: [24, 58],
  // Scene 2 — greeting reveal
  happy: [62, 96],
  dussehra: [74, 130],
  ornament: [96, 140],
  // Scene 3 — hero
  bow: [146, 174],
  draw: [178, 196],
  release: 198,
  flightEnd: 228,
  // Scene 4 — final greeting
  message: [238, 266],
  fadeOut: [336, 360],
} as const;

export const FONT_DISPLAY = "Cinzel, serif";
export const FONT_SCRIPT = "'Cormorant Garamond', serif";
