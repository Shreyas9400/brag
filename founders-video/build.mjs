// Generates index.html for the Founders story, synced to assets/audio/founders.wav.
// Run: node build.mjs
import { writeFileSync } from "node:fs";
import { execFileSync } from "node:child_process";

const AUDIO = "assets/audio/founders.wav";
const audioDur = parseFloat(
  execFileSync("ffprobe", [
    "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0",
    new URL(`./${AUDIO}`, import.meta.url).pathname,
  ]).toString().trim()
);

// Four narration beats, split proportionally by character count across the
// single audio track (no per-line clips were provided).
const beats = [
  { id: "b1", text: "Two college mates. Two promising careers — one in a senior management position with the Tata Group, the other in banking." },
  { id: "b2", text: "But in the 1980s, they shared a bigger dream: to build something of their own." },
  { id: "b3", text: "What began with a small family restaurant and a leap of faith has today grown into a ₹450 crore hospitality enterprise, spanning multiple brands and businesses." },
  { id: "b4", text: "This is more than a story of growth. It is the story of two friends who started with one restaurant and built a legacy." },
];
const totalChars = beats.reduce((n, b) => n + b.text.length, 0);
let t = 0;
for (const b of beats) {
  b.start = +t.toFixed(2);
  b.dur = +((b.text.length / totalChars) * audioDur).toFixed(2);
  t += b.dur;
}
// Absorb any rounding drift into the last beat.
beats[beats.length - 1].dur = +(audioDur - beats[beats.length - 1].start).toFixed(2);

const TOTAL = +audioDur.toFixed(2);
const FOUNDERS_AT = beats[2].start; // photos + "The Founders" appear from beat 3 onward
const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;");

const beatHtml = beats
  .map(
    (b) => `
      <p id="${b.id}" class="line">${esc(b.text)}</p>`
  )
  .join("");

const beatTl = beats
  .map((b, i) => {
    const e = b.start + b.dur;
    const isLast = i === beats.length - 1;
    return `
      tl.fromTo("#${b.id}", { opacity: 0, y: 22 }, { opacity: 1, y: 0, duration: 0.7, ease: "power2.out" }, ${b.start + 0.15});
      ${isLast ? "" : `tl.to("#${b.id}", { opacity: 0, duration: 0.4, ease: "power1.in" }, ${(e - 0.4).toFixed(2)});`}`;
  })
  .join("");

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
        font-family: Inter, ui-sans-serif, system-ui, sans-serif; color: #ffffff; background: #003F80;
      }
      .clip { position: absolute; inset: 0; }
      #copy {
        display: flex; align-items: center; justify-content: center; text-align: center; padding: 0 260px;
      }
      .line {
        position: absolute; left: 260px; right: 260px; top: 50%; transform: translateY(-50%);
        font-size: 52px; line-height: 1.5; font-weight: 500; opacity: 0;
      }
      /* Once the founders' photos are on screen, narration moves to a lower caption band. */
      #b3, #b4 {
        top: auto; bottom: 70px; transform: none; font-size: 38px; line-height: 1.4;
      }
      #title { position: absolute; top: 130px; left: 0; right: 0; text-align: center; font-size: 84px; font-weight: 700; opacity: 0; }
      #people { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; gap: 220px; top: 70px; }
      .person { display: flex; flex-direction: column; align-items: center; opacity: 0; }
      .photo { width: 360px; height: 440px; object-fit: cover; border: 10px solid #ffffff; border-radius: 20px 20px 20px 110px; box-shadow: 0 20px 50px rgba(0,0,0,0.35); }
      .pname { margin-top: 28px; font-size: 34px; font-weight: 700; text-align: center; }
      .prole { margin-top: 6px; font-size: 26px; font-weight: 600; color: #cfe0f5; text-align: center; }
    </style>
  </head>
  <body>
    <div id="root" data-composition-id="main" data-start="0" data-duration="${TOTAL}" data-width="1920" data-height="1080">
      <div id="copy" class="clip" data-start="0" data-duration="${TOTAL}" data-track-index="1">
${beatHtml}
      </div>
      <div id="title" class="clip" data-start="${FOUNDERS_AT}" data-duration="${(TOTAL - FOUNDERS_AT).toFixed(2)}" data-track-index="2">The Founders</div>
      <div id="people" class="clip" data-start="${FOUNDERS_AT}" data-duration="${(TOTAL - FOUNDERS_AT).toFixed(2)}" data-track-index="2">
        <div class="person" id="p1">
          <img class="photo" src="assets/photos/dinkar.png" alt="Mr. Dinkar Shetty" />
          <div class="pname">Mr. Dinkar Shetty</div>
          <div class="prole">Chairman &amp; MD</div>
        </div>
        <div class="person" id="p2">
          <img class="photo" src="assets/photos/harish.png" alt="Mr. Harish Shetty" />
          <div class="pname">Mr. Harish Shetty</div>
          <div class="prole">Vice Chairman &amp; MD</div>
        </div>
      </div>
      <audio id="a-founders" class="clip" data-start="0" data-duration="${(TOTAL - 0.05).toFixed(2)}" data-track-index="3" src="${AUDIO}"></audio>
    </div>
    <script>
      window.__timelines = window.__timelines || {};
      const tl = gsap.timeline({ paused: true });
${beatTl}
      tl.fromTo("#title", { opacity: 0, y: -20 }, { opacity: 1, y: 0, duration: 0.8, ease: "power3.out" }, ${FOUNDERS_AT + 0.1});
      tl.fromTo("#p1", { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 0.8, ease: "power2.out" }, ${FOUNDERS_AT + 0.5});
      tl.fromTo("#p2", { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 0.8, ease: "power2.out" }, ${FOUNDERS_AT + 0.75});
      window.__timelines["main"] = tl;
      tl.seek(0);
    </script>
  </body>
</html>
`;
writeFileSync(new URL("./index.html", import.meta.url), html);
console.log(`index.html written: ${TOTAL}s, founders shown from ${FOUNDERS_AT}s`);
