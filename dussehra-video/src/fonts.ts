import { cancelRender, continueRender, delayRender, staticFile } from "remotion";

// Self-hosted OFL fonts (Cinzel, Cormorant Garamond). Rendering waits until they are loaded.
const faces: [string, string, string, string][] = [
  ["Cinzel", "cinzel-latin-500-normal.woff2", "500", "normal"],
  ["Cinzel", "cinzel-latin-700-normal.woff2", "700", "normal"],
  ["Cormorant Garamond", "cormorant-garamond-latin-500-italic.woff2", "500", "italic"],
  ["Cormorant Garamond", "cormorant-garamond-latin-600-italic.woff2", "600", "italic"],
];

const handle = delayRender("Loading fonts");
Promise.all(
  faces.map(([family, file, weight, style]) => {
    const face = new FontFace(family, `url(${staticFile(`fonts/${file}`)}) format('woff2')`, { weight, style });
    document.fonts.add(face);
    return face.load();
  }),
)
  .then(() => continueRender(handle))
  .catch((e) => cancelRender(e));
