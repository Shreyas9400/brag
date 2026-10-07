// Builds both formats of the ClinicFloww ad from src/template.html.
//   landscape 1920x1080 -> index.html
//   portrait  1080x1920 -> portrait/index.html   (assets shared via symlink)
// Run: node build.mjs
import { readFileSync, writeFileSync, mkdirSync, existsSync, symlinkSync, copyFileSync } from "node:fs";

const here = (p) => new URL(`./${p}`, import.meta.url).pathname;
const template = readFileSync(here("src/template.html"), "utf8");

const words = (text, accentFrom = Infinity) =>
  text
    .split(" ")
    .map((w, i) => (w === "|" ? w : `<span class="w${i >= accentFrom ? " accent" : ""}">${w}</span>`))
    .join(" ")
    .replace(/ \| /g, "<br />");

const formats = {
  landscape: {
    out: "index.html",
    W: 1920,
    H: 1080,
    H1: `<div id="h1" class="headline">${words("We didn’t move your clinic | to the cloud.")}</div>`,
    H2: `<div id="h2" class="headline">${words("We brought your | clinic to you.", 5)}</div>`,
    RA: `<div id="ra">CLINICFLOWW <span class="t">REMOTE ACCESS</span></div>`,
    FINAL: `<div id="final">${words("YOUR CLINIC. WHEREVER YOU ARE.", 2)}</div>`,
    SWEEP_D: "M640 664 C840 694 1080 694 1280 658",
    SWEEP_X1: 640,
    SWEEP_X2: 1280,
    CSS_FMT: "",
    CAMERA_JS: `
      const FX = 960, FY = 540;
      const K = [
        { t: 0.0, cx: 1080, cy: 540, z: 1.0 },
        { t: 7.0, cx: 1120, cy: 545, z: 1.6, ease: "power1.inOut" },   // slow push to the dashboard
        { t: 12.9, cx: 3560, cy: 575, z: 1.18, ease: "power2.inOut" }, // follow the connection
        { t: 19.6, cx: 3610, cy: 592, z: 1.3, ease: "sine.inOut" },    // gentle push on the dentist
      ];
      const FOLLOW = 0;
${CAM_FN()}`,
  },
  portrait: {
    out: "portrait/index.html",
    W: 1080,
    H: 1920,
    H1: `<div id="h1" class="headline">${words("We didn’t move | your clinic | to the cloud.")}</div>`,
    H2: `<div id="h2" class="headline">${words("We brought | your clinic | to you.", 6)}</div>`,
    RA: `<div id="ra">CLINICFLOWW<br /><span class="t">REMOTE ACCESS</span></div>`,
    FINAL: `<div id="final">${words("YOUR CLINIC. | WHEREVER YOU ARE.", 3)}</div>`,
    SWEEP_D: "M300 1132 C450 1162 630 1162 780 1126",
    SWEEP_X1: 300,
    SWEEP_X2: 780,
    CSS_FMT: `
      /* ---- portrait overrides ---- */
      #scrim { background: linear-gradient(180deg, rgba(247,250,253,0.95) 0%, rgba(247,250,253,0.86) 26%, rgba(247,250,253,0) 44%); }
      #scrim3 { background: linear-gradient(180deg, rgba(250,247,242,0.95) 0%, rgba(250,247,242,0.85) 22%, rgba(250,247,242,0) 38%); }
      .headline { left: 0; right: 0; top: 250px; transform: none; text-align: center; font-size: 72px; line-height: 1.12; }
      #title3 { left: 0; right: 0; top: 190px; text-align: center; }
      #ra { font-size: 58px; line-height: 1.18; letter-spacing: 0.12em; white-space: normal; }
      #ra-sub { margin: 30px auto 0; max-width: 820px; font-size: 36px; line-height: 1.35; }
      #logo { top: 800px; height: 540px; }
      #final { top: 1196px; font-size: 48px; line-height: 1.5; }`,
    CAMERA_JS: `
      const FX = 540, FY = 960;
      const K = [
        { t: 0.0, cx: 1330, cy: 540, z: 1.8 },
        { t: 7.0, cx: 1380, cy: 431, z: 2.4, ease: "power1.inOut" },   // slow push to the dashboard
        { t: 12.9, cx: 3545, cy: 600, z: 1.28, ease: "power2.inOut" }, // follow the connection
        { t: 19.6, cx: 3550, cy: 612, z: 1.32, ease: "sine.inOut" },   // gentle push on the dentist
      ];
      const FOLLOW = 1; // narrow frame: camera tracks the travelling line
${CAM_FN()}`,
  },
};

function CAM_FN() {
  return `
      function camKey(t) {
        for (let i = 1; i < K.length; i++) {
          if (t <= K[i].t || i === K.length - 1) {
            const a = K[i - 1], b = K[i];
            const u = E(b.ease)(Math.min(1, Math.max(0, (t - a.t) / (b.t - a.t))));
            return { cx: lerp(a.cx, b.cx, u), cy: lerp(a.cy, b.cy, u), z: Math.exp(lerp(Math.log(a.z), Math.log(b.z), u)) };
          }
        }
      }
      const _conn = document.getElementById("conn"), _L = _conn.getTotalLength(), _pe = E("power1.inOut");
      function camAt(t) {
        const c = camKey(t);
        if (!FOLLOW || t <= 7.0 || t >= 12.9) return c;
        // blend toward the (slightly lagged) head of the connection line during the travel
        const u = (t - 7.0) / 5.9, w = Math.sin(Math.PI * u) ** 0.6 * 0.9;
        const lu = Math.min(1, Math.max(0, (t - 0.25 - 6.9) / 5.95));
        const h = _conn.getPointAtLength(_L * _pe(lu));
        return { cx: c.cx + (h.x - c.cx) * w, cy: c.cy + (h.y - c.cy) * w * 0.5, z: c.z };
      }`;
}

for (const [name, f] of Object.entries(formats)) {
  let html = template;
  for (const [k, v] of Object.entries(f)) html = html.split(`{{${k}}}`).join(String(v));
  if (/\{\{[A-Z_0-9]+\}\}/.test(html)) throw new Error(`unfilled placeholder in ${name}`);
  if (name === "portrait") {
    mkdirSync(here("portrait/renders"), { recursive: true });
    if (!existsSync(here("portrait/assets"))) symlinkSync("../assets", here("portrait/assets"));
    for (const fl of ["hyperframes.json", "CLAUDE.md", "AGENTS.md"]) copyFileSync(here(fl), here(`portrait/${fl}`));
    writeFileSync(here("portrait/package.json"), readFileSync(here("package.json"), "utf8").replace(/clinicfloww-ad/g, "clinicfloww-ad-portrait"));
    writeFileSync(here("portrait/meta.json"), JSON.stringify({ id: "clinicfloww-ad-portrait", name: "clinicfloww-ad-portrait", createdAt: "2026-10-07T00:00:00.000Z" }, null, 2) + "\n");
  }
  writeFileSync(here(f.out), html);
  console.log(`${name}: ${f.out} (${f.W}x${f.H})`);
}
