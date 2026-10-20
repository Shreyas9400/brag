# Synthesises an original, royalty-free 12 s festive score -> public/audio/dussehra-score.wav
# Tanpura drone + santoor-like plucks in Raag Bhupali (D) + soft temple bells.
# Fully procedural and deterministic (fixed seed); no samples or third-party audio.
# Cue times match src/theme.ts (frames / 30). Run: python3 scripts/score.py
import wave
import numpy as np

SR = 48000
DUR = 12.0
N = int(SR * DUR)
rng = np.random.default_rng(1010)
L = np.zeros(N)
R = np.zeros(N)


def hz(m):
    return 440.0 * 2 ** ((m - 69) / 12)


def place(sig, at, gain=1.0, pan=0.0):
    i = int(at * SR)
    j = min(N, i + len(sig))
    if j <= i:
        return
    s = sig[: j - i] * gain
    L[i:j] += s * np.sqrt(0.5 * (1 - pan))
    R[i:j] += s * np.sqrt(0.5 * (1 + pan))


def tanpura(f, dur=3.6):
    # additive string with a "jawari" bloom: upper partials swell after the pluck, then fade
    n = int(SR * dur)
    t = np.arange(n) / SR
    out = np.zeros(n)
    for k in range(1, 18):
        bloom = 1 + 2.2 * (k / 17) * np.exp(-((t - 0.45) / 0.35) ** 2)
        amp = (1 / k**0.85) * np.exp(-t / (2.4 / (1 + k * 0.05)))
        det = 1 + 0.0007 * rng.standard_normal()
        out += amp * bloom * np.sin(2 * np.pi * f * k * det * t + rng.uniform(0, 6.28))
    out *= np.minimum(1, t / 0.012)
    return out / 6.0


def santoor(f, dur=2.6, bright=0.55):
    # Karplus-Strong pair (two slightly detuned courses, like a hammered santoor)
    n = int(SR * dur)
    res = np.zeros(n)
    for det in (1.0, 1.0016):
        p = int(SR / (f * det))
        buf = rng.uniform(-1, 1, p)
        buf = bright * buf + (1 - bright) * np.convolve(buf, np.ones(3) / 3, "same")
        y = np.zeros(n)
        y[:p] = buf
        for i in range(p, n):
            y[i] = 0.4985 * (y[i - p] + y[i - p + 1]) if i - p + 1 < n else y[i - p]
        res += y
    t = np.arange(n) / SR
    return res * np.exp(-t / 1.4) * 0.5


def bell(f, dur=4.0):
    n = int(SR * dur)
    t = np.arange(n) / SR
    ratios = [0.5, 1.0, 1.183, 1.506, 2.0, 2.514, 2.662, 3.011]
    amps = [0.35, 1.0, 0.5, 0.45, 0.3, 0.2, 0.14, 0.1]
    out = np.zeros(n)
    for r, a in zip(ratios, amps):
        out += a * np.sin(2 * np.pi * f * r * t) * np.exp(-t / (2.2 / r**0.7))
    out *= np.minimum(1, t / 0.004)
    return out / 3.0


def pad(f, dur, att=1.2, rel=1.5):
    # soft breathy sine pad (bansuri-like), gentle vibrato
    n = int(SR * dur)
    t = np.arange(n) / SR
    vib = 1 + 0.003 * np.sin(2 * np.pi * 5.2 * t) * np.minimum(1, t / 1.5)
    ph = 2 * np.pi * np.cumsum(f * vib) / SR
    tone = np.sin(ph) + 0.25 * np.sin(2 * ph) + 0.08 * np.sin(3 * ph)
    breath = np.convolve(rng.standard_normal(n), np.ones(40) / 40, "same") * 0.05
    env = np.minimum(1, t / att) * np.minimum(1, (dur - t) / rel).clip(0)
    return (tone + breath) * env * 0.3


D2, A2, D3, A3 = hz(38), hz(45), hz(50), hz(57)
S = {"D4": 62, "E4": 64, "F#4": 66, "A4": 69, "B4": 71, "D5": 74, "E5": 76, "F#5": 78, "A5": 81, "B5": 83, "D6": 86, "F#6": 90, "A6": 93}

# tanpura cycle: Pa  Sa  Sa  Sa(low)
cyc = [A2, D3, D3, D2]
t0 = 0.05
k = 0
while t0 < DUR - 0.4:
    place(tanpura(cyc[k % 4]), t0, 0.55, pan=[-0.3, 0.1, 0.25, -0.1][k % 4])
    t0 += 0.78
    k += 1

# opening: a soft, distant bell
place(bell(hz(74)), 0.25, 0.22, pan=-0.2)

# greeting reveal (2.1 s – 4.8 s): rising Bhupali phrase
for at, nt, g in [(2.10, "A4", 0.5), (2.42, "B4", 0.5), (2.74, "D5", 0.55), (3.20, "E5", 0.55), (3.62, "F#5", 0.5), (4.15, "E5", 0.45), (4.60, "D5", 0.5)]:
    place(santoor(hz(S[nt])), at, g, pan=0.25)

# bansuri-like pad under the hero section
place(pad(hz(62), 6.2, att=1.6, rel=2.0), 4.8, 0.32, pan=-0.15)

# release (6.6 s): a gentle high ripple, no impact sounds
for i, nt in enumerate(["D6", "F#6", "A6", "B5", "D6"]):
    place(santoor(hz(S[nt]), dur=1.8, bright=0.35), 6.58 + i * 0.055, 0.18, pan=0.5 - i * 0.2)

# final greeting (7.9 s+): bell + resolving phrase
place(bell(hz(62)), 7.92, 0.3, pan=0.15)
for at, nt, g in [(8.05, "F#5", 0.42), (8.45, "E5", 0.42), (8.90, "D5", 0.48), (9.45, "A4", 0.4), (9.47, "D5", 0.32)]:
    place(santoor(hz(S[nt]), dur=3.0), at, g, pan=-0.2)

# light convolution reverb
ir_n = int(SR * 2.4)
ti = np.arange(ir_n) / SR
def ir():
    x = rng.standard_normal(ir_n) * np.exp(-ti / 0.55)
    return np.convolve(x, np.ones(6) / 6, "same")
def conv(x, h):
    m = len(x) + len(h)
    return np.fft.irfft(np.fft.rfft(x, m) * np.fft.rfft(h, m), m)[: len(x)]
irL, irR = ir(), ir()
irL /= np.sqrt(np.sum(irL**2)); irR /= np.sqrt(np.sum(irR**2))
Lw = L + 0.32 * conv(L, irL)
Rw = R + 0.32 * conv(R, irR)

# gentle low-pass for warmth
def lowpass(x, fc):
    X = np.fft.rfft(x)
    f = np.fft.rfftfreq(len(x), 1 / SR)
    return np.fft.irfft(X / np.sqrt(1 + (f / fc) ** 4), len(x))
mix = np.stack([lowpass(Lw, 8500), lowpass(Rw, 8500)], 1)

t = np.arange(N) / SR
env = np.minimum(1, t / 0.6) * np.clip((DUR - t) / 1.2, 0, 1) ** 1.5
mix *= env[:, None]
mix *= 10 ** (-4 / 20) / np.max(np.abs(mix))  # peak -4 dBFS: soft, elegant level

pcm = (mix * 32767).astype("<i2")
with wave.open("public/audio/dussehra-score.wav", "wb") as w:
    w.setnchannels(2)
    w.setsampwidth(2)
    w.setframerate(SR)
    w.writeframes(pcm.tobytes())
print("wrote public/audio/dussehra-score.wav", DUR, "s")
