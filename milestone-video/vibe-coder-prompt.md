# Task: Batch-generate narration audio from a JSON script

Add a feature (or a small script) to my TTS app that batch-generates
voiceover clips from a JSON script file, instead of me typing text in one
at a time.

## Input

A JSON file (I'll provide `narration.json`) shaped like this:

```json
{
  "project": "42-years-milestones",
  "scenes": [
    { "index": 0, "id": "intro", "file": "00-intro.mp3", "text": "42 Years of Growth and Expansion. 1984 to 2026." },
    { "index": 1, "id": "1984", "file": "01-1984.mp3", "text": "1984. Our journey began with a fast food restaurant in Mumbai." }
    // ...more scenes
  ]
}
```

## What to build

1. A function/script `generate_narration(json_path, output_dir, voice=<default>)` that:
   - Loads the JSON file.
   - Iterates `scenes` in array order.
   - For each scene, calls our existing TTS engine/model with `scene.text`.
   - Saves the resulting audio to `output_dir/<scene.file>` — use the
     `file` field verbatim as the filename, don't rename or re-number it.
   - Skips a scene and logs a warning if `output_dir/<scene.file>` already
     exists (so re-runs don't waste time/cost re-synthesizing), unless an
     `--overwrite` flag is passed.
   - Prints a one-line progress log per scene: `[index/total] file -> status`.
2. Output format: mp3 or wav, whichever our TTS engine natively produces —
   don't transcode unless that's already part of our pipeline.
3. Keep all clips at a consistent voice/speed/volume setting (single voice
   for the whole run, no per-scene voice switching) unless I say otherwise.
4. If our TTS has a CLI or Python API already, wire this into that
   directly rather than adding a new dependency.
5. Add a small CLI entrypoint, e.g.:
   ```
   python generate_narration.py narration.json --out ./output --voice my_voice
   ```
6. When done, all files in `output_dir` should exactly match the `file`
   names from the JSON (00-intro.mp3, 01-1984.mp3, ... 20-closing.mp3) —
   that's the naming convention a downstream video tool expects.

Don't change any other part of the app. Keep the diff scoped to this
batch-generation feature.
