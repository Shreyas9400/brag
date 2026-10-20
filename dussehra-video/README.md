# Happy Dussehra — Dr. Sayali’s Smile Care Dental Clinic

A 12-second animated Dussehra greeting, built with **Remotion** (React) and rendered to H.264 MP4.

## Deliverables (`renders/`)

| File | Format |
| --- | --- |
| `dussehra-vertical-1080x1920.mp4` | 9:16, 1080×1920, 30 fps, 12 s, H.264 High + AAC 48 kHz stereo (Reels / Stories / WhatsApp Status) |
| `dussehra-landscape-1920x1080.mp4` | 16:9, 1920×1080, 30 fps, 12 s, same encode settings |
| `final-frame-vertical.png`, `final-frame-landscape.png` | Final composition stills (thumbnails / covers) |

## Storyboard (as built)

| Time | Scene |
| --- | --- |
| 0.0–2.0 s | Ivory opening, golden glow, faint rotating mandala, light rays, golden dust. Temples rise in two parallax layers, toran garland drops in, diyas light and flicker. Logo fades in top-left. |
| 2.0–5.0 s | “HAPPY” then “DUSSEHRA” rise letter by letter in deep maroon (Cinzel). Gold filigree dividers draw out from the centre, then shimmer. |
| 5.0–8.0 s | Golden bow fades in on the right. The string is drawn back, released at 6.6 s with a soft sparkle, and the tooth-headed arrow glides forward on a golden light trail. |
| 8.0–12.0 s | “May goodness, health & happiness triumph.” fades in (Cormorant Garamond italic) and holds about 2.5 s fully readable. Warm golden bloom, then a soft fade back to the opening ivory, so the clip loops cleanly. |

## Setup and regeneration

Requirements: Node 18+ (tested with Node 22), Python 3 with NumPy and Pillow, and Chromium.
`remotion.config.ts` points at the pre-installed headless Chromium (`/opt/pw-browsers/...`). On another machine, delete the `setBrowserExecutable` line and Remotion will download its own browser.

```bash
cd dussehra-video
npm ci                      # install pinned dependencies
python3 scripts/prepare_logo.py   # (only if the logo changes) transparent logo
python3 scripts/score.py          # (only if the music changes) regenerate the score
npm run render              # renders BOTH MP4s into renders/
```

Individual formats:

```bash
npx remotion render src/index.ts DussehraVertical  renders/dussehra-vertical-1080x1920.mp4
npx remotion render src/index.ts DussehraLandscape renders/dussehra-landscape-1920x1080.mp4
```

Live preview/editing: `npm run studio`.

## Project layout

```
src/
  theme.ts        palette, fonts, frame-accurate timeline (T)
  layout.ts       per-format placement (vertical / landscape)
  util.ts         easing ramp, flicker noise, tapered-ribbon geometry
  fonts.ts        self-hosted font loading (render waits for fonts)
  Dussehra.tsx    layer stack for one format
  Root.tsx        registers DussehraVertical and DussehraLandscape
  components/
    Background.tsx  ivory base, glow, mandala, vignette, closing frame
    LightRays.tsx   soft rays     Particles.tsx  golden dust
    Temples.tsx     parallax temple silhouettes
    Garland.tsx     marigold toran     Marigold.tsx  flower artwork
    Diya.tsx        clay diya + flickering flame     Foreground.tsx  diya row
    Greeting.tsx    HAPPY DUSSEHRA     Ornament.tsx  gold dividers
    BowArrow.tsx    bow, tooth-headed arrow, trail, sparkles
    Message.tsx     closing line       Logo.tsx      clinic logo
public/
  logo/logo-source.png        official logo as supplied (unchanged)
  logo/logo-transparent.png   same artwork, white made transparent
  fonts/                      Cinzel, Cormorant Garamond (SIL OFL, licences included)
  audio/dussehra-score.wav    original synthesised score
scripts/
  prepare_logo.py   background removal for the logo
  score.py          music synthesis
```

## Logo handling

The official logo is pure greyscale line art on white. `prepare_logo.py` sets alpha = 1 − luminance and keeps the colour pure black. Every anti-aliased black outline, and the soft shadow under the signature, is therefore kept exactly; the white areas, including the inside of the tooth outline, become transparent and show the ivory background. The only other change is cropping to the artwork’s bounding box. The logo is never redrawn or rescaled unevenly: it is placed with its height locked to the source aspect ratio (1098:716).

## Audio

`scripts/score.py` synthesises the music from scratch with NumPy, so it contains no samples or third-party recordings and has no licensing to clear. It is a tanpura drone (Pa–Sa–Sa–Sa), santoor-style plucked phrases in Raag Bhupali on D, a soft bansuri-like pad and two quiet temple bells. Cues follow the animation: bell at the open, rising phrase with the greeting, a gentle high ripple at the arrow’s release, then a resolving phrase and bell with the final message. The mix measures −15.9 LUFS integrated with a −4 dBFS peak, fading in over 0.6 s and out over the last 1.2 s.

To export a silent version: `npx remotion render src/index.ts DussehraVertical renders/silent.mp4 --muted`.

## Note on the poster

The Dussehra poster was not among the supplied files, so it could not be used as a base layer or traced. Every motif here (ivory/gold palette, maroon type, diyas, marigolds, temple silhouettes, the ornate golden bow and the tooth-shaped arrowhead) is original vector artwork drawn in code from the written creative brief. To align more closely with the poster, adjust `src/theme.ts` (colours) and `src/layout.ts` (positions), or add the poster under `public/` and place it in `Dussehra.tsx`.
