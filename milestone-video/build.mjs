// Generates index.html (the HyperFrames composition) from the milestone script,
// synced to the narrated audio clips in assets/audio/.
// Run: node build.mjs
import { writeFileSync, existsSync } from "node:fs";
import { execFileSync } from "node:child_process";

const milestones = [
  ["intro", null, null], // handled separately below
  ["1984", "1984", "Our journey began with a fast food restaurant in Mumbai."],
  ["1988", "1988", "We expanded into fine-dine restaurants and the catering business."],
  ["1993", "1993", "We entered the industrial catering segment."],
  ["1999", "1999", "Our operations expanded further into offshore catering, as well as catering for Clubs and Gymkhanas."],
  ["2004", "2004", "We further expanded our catering business, entering Institutional Catering, Guest House operations, and Facilities Management."],
  ["2006", "2006", "We began our association with the Indian Institute of Technology Gulmohar."],
  ["2007", "2007", "We expanded our catering services to Dockyards and Sports Clubs."],
  ["2009", "2009", "We entered the Indian Institute of Management Indore."],
  ["2010", "2010", "A new chapter began as we entered the hotels and resorts business with the opening of Ramada Navi Mumbai in Mahape."],
  ["2018", "2018", "We expanded our hospitality portfolio with the launch of Shriphal Resort in Kagwad, Karnataka."],
  ["2020", "2020", "We opened our second hotel, Citrus Classic, in Bengaluru, Karnataka."],
  ["2022", "2022", "We expanded our institutional presence with the Reserve Bank of India OLDR."],
  ["2023", "2023", "Our institutional portfolio continued to grow with Yashwantrao Chavan Academy of Development Administration."],
  ["2023", "2023", "We expanded into Vedanta Steel Industrial."],
  ["2023", "2023", "We strengthened our hospitality portfolio with the launch of our third hotel, Citrus, in Lonavala."],
  ["2024", "2024", "We took a significant step forward by acquiring Mirah Hospitality across India."],
  ["2026", "2026", "Our growth continues with Courtyard by Marriott."],
  ["2026", "2026", "We expanded into the Tribal Boarding School Central Kitchen project for the Maharashtra State Project."],
  ["2026", "2026", "And we further strengthened our hospitality portfolio with Radisson Bangalore."],
];
const closing =
  "From a single fast food restaurant in Mumbai in 1984 to a diversified presence across catering, institutional services, facilities management and hospitality — 42 years of growth have been built on continuous expansion, new partnerships and a commitment to creating lasting value.";

// Audio clips, in scene order, matching narration.json's `file` names.
const AUDIO_FILES = [
  "00-intro.mp3", "01-1984.mp3", "02-1988.mp3", "03-1993.mp3", "04-1999.mp3",
  "05-2004.mp3", "06-2006.mp3", "07-2007.mp3", "08-2009.mp3", "09-2010.mp3",
  "10-2018.mp3", "11-2020.mp3", "12-2022.mp3", "13-2023a.mp3", "14-2023b.mp3",
  "15-2023c.mp3", "16-2024.mp3", "17-2026a.mp3", "18-2026b.mp3", "19-2026c.mp3",
  "20-closing.mp3",
];
const AUDIO_DIR = "assets/audio";

function audioDuration(file) {
  const p = new URL(`./${AUDIO_DIR}/${file}`, import.meta.url);
  if (!existsSync(p)) return null;
  const out = execFileSync("ffprobe", [
    "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", p.pathname,
  ]).toString().trim();
  return parseFloat(out);
}

const durations = AUDIO_FILES.map(audioDuration);
const hasAudio = durations.every((d) => d != null);
if (!hasAudio) {
  console.warn("Some audio clips are missing — falling back to text-length timing for those scenes.");
}

// Pad after each line of narration finishes before cutting to the next scene.
const TAIL = 0.6;
const fallbackLen = (text) => Math.min(6, Math.max(4, 3 + (text?.length ?? 20) / 45));

const introDur = durations[0] != null ? durations[0] + TAIL : 4.5;
const INTRO = +introDur.toFixed(2);

let t = INTRO;
const scenes = milestones.slice(1).map(([_, year, text], i) => {
  const d = durations[i + 1];
  const dur = +((d != null ? d + TAIL : fallbackLen(text))).toFixed(2);
  const s = { i, year, text, start: +t.toFixed(2), dur, audio: hasAudio ? AUDIO_FILES[i + 1] : null };
  t += dur;
  return s;
});
const closingStart = +t.toFixed(2);
const closingDur = durations[20] != null ? durations[20] + TAIL : 11;
const CLOSING = +closingDur.toFixed(2);
const TOTAL = +(closingStart + CLOSING).toFixed(2);

// Timeline rail: position of each distinct year along 1984..2026.
const MIN = 1984, MAX = 2026;
const pct = (y) => ((y - MIN) / (MAX - MIN)) * 100;
// Label only well-spaced years so neighbouring ticks never collide.
const LABELS = ["1984", "1993", "1999", "2004", "2010", "2018", "2026"];
const years = [...new Set(scenes.map((s) => s.year))];

const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;");

const audioTag = (s) =>
  s.audio
    ? `<audio id="a${s.i}" class="clip" data-start="${s.start}" data-duration="${(s.dur - 0.05).toFixed(2)}" data-track-index="3" src="${AUDIO_DIR}/${s.audio}"></audio>`
    : "";

const sceneHtml = scenes
  .map(
    (s) => `
      <section id="s${s.i}" class="clip scene" data-start="${s.start}" data-duration="${s.dur}" data-track-index="1">
        <div class="count">${String(s.i + 1).padStart(2, "0")} / ${scenes.length}</div>
        <div class="year" id="y${s.i}">${s.year}</div>
        <div class="rule" id="r${s.i}"></div>
        <p class="text" id="t${s.i}">${esc(s.text)}</p>
      </section>
      ${audioTag(s)}`
  )
  .join("");

const sceneTl = scenes
  .map((s) => {
    const a = s.start, e = s.start + s.dur;
    return `
      tl.fromTo("#y${s.i}", { opacity: 0, y: 60, scale: 1.08 }, { opacity: 1, y: 0, scale: 1, duration: 0.9, ease: "power3.out" }, ${a + 0.1});
      tl.fromTo("#r${s.i}", { scaleX: 0 }, { scaleX: 1, duration: 0.7, ease: "power2.inOut" }, ${a + 0.45});
      tl.fromTo("#t${s.i}", { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.8, ease: "power2.out" }, ${a + 0.7});
      tl.to("#s${s.i}", { opacity: 0, duration: 0.45, ease: "power1.in" }, ${(e - 0.45).toFixed(2)});
      tl.to("#fill", { width: "${pct(+s.year)}%", duration: 0.9, ease: "power2.inOut" }, ${a});
      tl.to("#dot-${s.year}", { backgroundColor: "#ffffff", scale: 1.35, duration: 0.4 }, ${a + 0.3});`;
  })
  .join("");

const dots = years
  .map(
    (y) => `<div class="dot" id="dot-${y}" style="left:${pct(+y)}%"></div>${LABELS.includes(y) ? `<div class="tick" style="left:${pct(+y)}%">${y}</div>` : ""}`
  )
  .join("");

const introAudio = hasAudio ? `<audio id="a-intro" class="clip" data-start="0" data-duration="${(INTRO - 0.05).toFixed(2)}" data-track-index="3" src="${AUDIO_DIR}/${AUDIO_FILES[0]}"></audio>` : "";
const closingAudio = hasAudio ? `<audio id="a-closing" class="clip" data-start="${closingStart}" data-duration="${(CLOSING - 0.05).toFixed(2)}" data-track-index="3" src="${AUDIO_DIR}/${AUDIO_FILES[20]}"></audio>` : "";

const html = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=1920, height=1080" />
    <script src="assets/gsap.min.js"></script>
    <style>
      @font-face { font-family: "Inter"; font-weight: 100 900; font-display: block; src: url(assets/fonts/inter.woff2) format("woff2"); }
      * { margin: 0; padding: 0; box-sizing: border-box; }
      html, body { margin: 0; width: 1920px; height: 1080px; overflow: hidden; background: #003F80; }
      #root {
        position: relative; width: 100%; height: 100%;
        font-family: Inter, ui-sans-serif, system-ui, sans-serif; color: #ffffff;
        background: #003F80;
      }
      .clip { position: absolute; inset: 0; }
      .scene { display: flex; flex-direction: column; justify-content: center; padding: 0 200px 140px; }
      .count { position: absolute; top: 90px; left: 200px; font-size: 26px; letter-spacing: 0.3em; color: #cfe0f5; }
      .year { transform-origin: left bottom; font-weight: 700; font-size: 260px; line-height: 1; color: #ffffff; }
      .rule { width: 220px; height: 4px; background: #ffffff; margin: 40px 0 44px; transform-origin: left center; }
      .text { font-size: 54px; line-height: 1.35; font-weight: 500; max-width: 1450px; color: #ffffff; }
      #intro { display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; }
      #intro-big { font-size: 300px; font-weight: 700; color: #ffffff; line-height: 1; }
      #intro-sub { font-size: 76px; font-weight: 600; margin-top: 20px; color: #ffffff; }
      #intro-tag { font-size: 30px; letter-spacing: 0.4em; color: #cfe0f5; margin-top: 36px; text-transform: uppercase; }
      #closing { display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; padding: 0 220px 60px; }
      #c-range { font-size: 120px; font-weight: 700; color: #ffffff; }
      #c-text { font-size: 44px; line-height: 1.5; margin-top: 44px; max-width: 1480px; color: #ffffff; }
      #c-end { font-size: 30px; letter-spacing: 0.4em; color: #cfe0f5; margin-top: 56px; text-transform: uppercase; }
      #rail { position: absolute; top: auto; left: 200px; right: 200px; bottom: 110px; opacity: 0; height: 2px; background: rgba(255, 255, 255, 0.3); }
      #fill { position: absolute; left: 0; top: 0; height: 2px; width: 0%; background: #ffffff; }
      .dot { position: absolute; top: -7px; width: 16px; height: 16px; margin-left: -8px; border-radius: 50%; background: rgba(255, 255, 255, 0.3); }
      .tick { position: absolute; top: 22px; transform: translateX(-50%); font-size: 20px; color: #cfe0f5; }
    </style>
  </head>
  <body>
    <div id="root" data-composition-id="main" data-start="0" data-duration="${TOTAL}" data-width="1920" data-height="1080">
      <section id="intro" class="clip" data-start="0" data-duration="${INTRO}" data-track-index="1">
        <div id="intro-big">42</div>
        <div id="intro-sub">Years of Growth &amp; Expansion</div>
        <div id="intro-tag">1984 — 2026</div>
      </section>
      ${introAudio}
${sceneHtml}
      <section id="closing" class="clip" data-start="${closingStart}" data-duration="${CLOSING}" data-track-index="1">
        <div id="c-range">1984 → 2026</div>
        <p id="c-text">${esc(closing)}</p>
        <div id="c-end">42 Years of Growth</div>
      </section>
      ${closingAudio}
      <div id="rail" class="clip" data-start="${INTRO}" data-duration="${(closingStart - INTRO).toFixed(2)}" data-track-index="2">
        <div id="fill"></div>
        ${dots}
      </div>
    </div>
    <script>
      window.__timelines = window.__timelines || {};
      const tl = gsap.timeline({ paused: true });
      tl.fromTo("#intro-big", { opacity: 0, scale: 0.8 }, { opacity: 1, scale: 1, duration: 1.2, ease: "power3.out" }, 0.2);
      tl.fromTo("#intro-sub", { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.9, ease: "power2.out" }, 0.9);
      tl.fromTo("#intro-tag", { opacity: 0 }, { opacity: 1, duration: 0.8 }, 1.5);
      tl.to("#intro", { opacity: 0, duration: 0.5 }, ${INTRO - 0.5});
      tl.fromTo("#rail", { opacity: 0 }, { opacity: 1, duration: 0.6 }, ${INTRO});
      tl.to("#rail", { opacity: 0, duration: 0.45 }, ${(closingStart - 0.45).toFixed(2)});
${sceneTl}
      tl.fromTo("#c-range", { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 1, ease: "power3.out" }, ${closingStart + 0.2});
      tl.fromTo("#c-text", { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 1.2, ease: "power2.out" }, ${closingStart + 0.9});
      tl.fromTo("#c-end", { opacity: 0 }, { opacity: 1, duration: 1 }, ${closingStart + 2.2});
      tl.to("#closing", { opacity: 0, duration: 0.8 }, ${TOTAL - 0.8});
      window.__timelines["main"] = tl;
      tl.seek(0);
    </script>
  </body>
</html>
`;
writeFileSync(new URL("./index.html", import.meta.url), html);
console.log(`index.html written: ${TOTAL}s, ${scenes.length} milestones, audio ${hasAudio ? "synced" : "MISSING"}`);
