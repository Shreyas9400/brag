# Synthesises the 24 s ClinicFloww score + sound design into assets/audio/clinicfloww-score.wav.
# Deterministic (fixed seed). Run: python3 score.py
# Cue times below match the animation timeline in index.html.
import wave
import numpy as np

SR = 48000
DUR = 24.0
N = int(SR * DUR)
rng = np.random.default_rng(7)
t_all = np.arange(N) / SR


def midi(m):
    return 440.0 * 2 ** ((m - 69) / 12)


def place(buf, sig, at):
    i = int(at * SR)
    j = min(N, i + len(sig))
    buf[i:j] += sig[: j - i]


def lowpass(x, cutoff):
    # Gentle low-pass via FFT magnitude shaping (no scipy available).
    X = np.fft.rfft(x)
    f = np.fft.rfftfreq(len(x), 1 / SR)
    X *= 1 / np.sqrt(1 + (f / cutoff) ** 4)
    return np.fft.irfft(X, len(x))


def bandpass_sweep(n, f0, f1, q=2.5):
    # Noise shaped by a moving band: render a few overlapping static bands and crossfade.
    out = np.zeros(n)
    noise = rng.standard_normal(n)
    X = np.fft.rfft(noise)
    f = np.fft.rfftfreq(n, 1 / SR)
    steps = 12
    for k in range(steps):
        c = f0 * (f1 / f0) ** (k / (steps - 1))
        bw = c / q
        band = np.fft.irfft(X * np.exp(-0.5 * ((f - c) / bw) ** 2), n)
        w = np.zeros(n)
        centre = k / (steps - 1) * n
        idx = np.arange(n)
        w = np.clip(1 - np.abs(idx - centre) / (n / (steps - 1)), 0, 1)
        out += band * w
    return out / (np.max(np.abs(out)) + 1e-9)


def env_adsr(n, a, r):
    e = np.ones(n)
    na, nr = int(a * SR), int(r * SR)
    e[:na] = np.sin(np.linspace(0, np.pi / 2, na)) ** 2
    e[n - nr:] *= np.cos(np.linspace(0, np.pi / 2, nr)) ** 2
    return e


def reverb(x, seconds=2.8, mix=0.35):
    n = int(seconds * SR)
    ir = rng.standard_normal(n) * np.exp(-np.arange(n) / SR * 6.9 / seconds)
    ir = lowpass(ir, 5000)
    ir /= np.sqrt(np.sum(ir ** 2))
    L = len(x) + n
    wet = np.fft.irfft(np.fft.rfft(x, L) * np.fft.rfft(ir, L), L)[: len(x)]
    return (1 - mix) * x + mix * wet


# ---------------------------------------------------------------- music
music = np.zeros(N)

# Warm pad: D maj9 -> B m11 -> G maj9 -> D maj9 (resolve)
chords = [
    (0.0, 6.6, [50, 57, 61, 64, 66]),       # D A C# E F#
    (6.6, 12.8, [47, 54, 57, 61, 62]),      # B F# A C# D
    (12.8, 19.0, [43, 50, 54, 57, 62, 66]), # G D F# A D F#
    (19.0, 24.0, [50, 57, 62, 64, 66, 69]), # D A D E F# A
]
for start, end, notes in chords:
    s, e = start - 0.6 if start > 0 else 0, min(DUR, end + 1.2)
    n = int((e - s) * SR)
    t = np.arange(n) / SR
    sig = np.zeros(n)
    for m in notes:
        fr = midi(m)
        for det in (-0.12, 0.0, 0.11):
            fd = fr * 2 ** (det / 12)
            sig += np.sin(2 * np.pi * fd * t + rng.uniform(0, 6.28)) * 0.6
            sig += np.sin(2 * np.pi * 2 * fd * t) * 0.08
    sig *= env_adsr(n, 1.4 if start > 0 else 2.2, 1.6)
    place(music, sig * 0.018, s)

# Slow filter "breath" on the pad
music = lowpass(music, 2400)

# Sub bass root notes
for start, end, root in [(0, 6.6, 38), (6.6, 12.8, 35), (12.8, 19.0, 31), (19.0, 24.0, 38)]:
    n = int((end - start + 0.8) * SR)
    t = np.arange(n) / SR
    place(music, np.sin(2 * np.pi * midi(root) * t) * env_adsr(n, 0.9, 1.0) * 0.05, start)

# Gentle pluck arpeggio that builds through the connection sequence (6.8 - 18.6)
arp = [74, 78, 81, 85, 81, 78]  # D F# A C#
arp_b = [71, 74, 78, 81, 78, 74]
arp_g = [74, 78, 81, 83, 81, 78]
step = 60 / 92 / 2  # eighth notes at 92 bpm
k = 0
tt = 6.8
while tt < 18.4:
    seq = arp if tt < 6.6 else (arp_b if tt < 12.8 else arp_g)
    m = seq[k % len(seq)]
    n = int(1.2 * SR)
    t = np.arange(n) / SR
    pl = (np.sin(2 * np.pi * midi(m) * t) + 0.25 * np.sin(2 * np.pi * 2 * midi(m) * t)) * np.exp(-t * 5.5)
    pl *= np.minimum(1, t / 0.004)
    build = np.clip((tt - 6.8) / 6.0, 0, 1) * 0.7 + 0.3       # swells in
    fade = np.clip((18.4 - tt) / 1.5, 0, 1)                  # recedes before the end card
    place(music, pl * 0.016 * build * fade, tt)
    k += 1
    tt += step

music = reverb(music, 3.2, 0.4)

# ---------------------------------------------------------------- sfx
sfx = np.zeros(N)


def whoosh(at, length, f0, f1, gain):
    n = int(length * SR)
    w = bandpass_sweep(n, f0, f1)
    t = np.linspace(0, 1, n)
    e = np.sin(np.pi * t ** 0.8) ** 2
    place(sfx, w * e * gain, at)


def tick(at, gain=0.05, f=2600):
    n = int(0.05 * SR)
    t = np.arange(n) / SR
    place(sfx, np.sin(2 * np.pi * f * t) * np.exp(-t * 140) * gain, at)


def bell(at, f, gain, decay=2.2, partials=((1, 1.0), (2.0, 0.35), (2.76, 0.18), (5.4, 0.05))):
    n = int(decay * 2.2 * SR)
    t = np.arange(n) / SR
    sig = np.zeros(n)
    for ratio, amp in partials:
        sig += amp * np.sin(2 * np.pi * f * ratio * t) * np.exp(-t * (1.6 + ratio) / decay)
    sig *= np.minimum(1, t / 0.006)
    place(sfx, sig * gain, at)


# Airy opening whoosh as the headline arrives
whoosh(0.7, 1.6, 600, 3200, 0.05)
# Dashboard populates: minimal UI ticks
for i, at in enumerate([0.95, 1.25, 1.55, 1.85, 2.15]):
    tick(at, 0.028, 2400 + 120 * i)
# Headline transition
whoosh(4.2, 1.3, 2600, 700, 0.04)

# Delicate digital connection tone as the line leaves the screen (glide up)
n = int(1.6 * SR)
t = np.arange(n) / SR
f = 880 * 2 ** (np.clip(t / 0.5, 0, 1) * 7 / 12)
ph = 2 * np.pi * np.cumsum(f) / SR
tone = (np.sin(ph) + 0.2 * np.sin(2 * ph)) * np.exp(-t * 2.2) * np.minimum(1, t / 0.02)
place(sfx, tone * 0.05, 6.75)
# Soft travel shimmer under the line
n = int(6.0 * SR)
t = np.arange(n) / SR
sh = np.sin(2 * np.pi * 1318.5 * t) * (0.5 + 0.5 * np.sin(2 * np.pi * 3 * t)) * env_adsr(n, 1.5, 2.0)
place(sfx, sh * 0.006, 7.0)
whoosh(7.0, 2.4, 500, 1800, 0.035)

# Soft lock chime
bell(9.95, midi(86), 0.05, 1.6)
bell(10.05, midi(93), 0.025, 1.4)

# Arrival at the laptop
bell(12.85, midi(81), 0.04, 1.8)
tick(12.95, 0.03, 2800)

# Title tick
tick(13.7, 0.022, 2200)

# Transition to end card
whoosh(18.5, 1.4, 900, 3600, 0.04)

# Gentle final resolving chime with the logo sweep
for m, g, d in [(74, 0.05, 3.0), (81, 0.035, 3.0), (86, 0.025, 2.6), (90, 0.015, 2.4)]:
    bell(20.1 + (m - 74) * 0.006, midi(m), g, d)

sfx = reverb(sfx, 2.4, 0.3)

# ---------------------------------------------------------------- mix
mix = music * 1.0 + sfx * 1.0
# overall fades
mix *= np.clip(t_all / 0.8, 0, 1) * np.clip((DUR - t_all) / 1.4, 0, 1) ** 0.7
# normalise to a quiet, premium level (peak ~ -6 dBFS)
mix *= 0.5 / np.max(np.abs(mix))
stereo = np.stack([mix, mix], axis=1)
# subtle width: delay right channel of the reverb-ish content by 9 ms
d = int(0.009 * SR)
stereo[d:, 1] = 0.85 * mix[d:] + 0.15 * mix[:-d]
pcm = (np.clip(stereo, -1, 1) * 32767).astype("<i2")
with wave.open("assets/audio/clinicfloww-score.wav", "wb") as w:
    w.setnchannels(2)
    w.setsampwidth(2)
    w.setframerate(SR)
    w.writeframes(pcm.tobytes())
print("wrote assets/audio/clinicfloww-score.wav")
