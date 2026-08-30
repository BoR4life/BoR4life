"""
Generate the patient-monitor screen texture used by build_clinical_bay.py.

The monitor is the one surface in the bay where the product's actual claim —
that it measures what the learner does — becomes visible. A blank glowing
rectangle cannot carry that, so this draws a real vitals display: ECG and
plethysmograph traces plus the numbers a clinician would read.

Deliberately generic and clinically plausible, NOT a real patient's data and
not a real vendor's UI. Values sit in normal adult ranges so the frame reads
as a monitored patient rather than an emergency, which would misrepresent
what the scenario is.

    python scripts/make_vitals_screen.py --out public/textures
"""

import argparse
import math
import os
import random

from PIL import Image, ImageDraw, ImageFont

W, H = 1024, 640
BG = (8, 12, 16)

# Standard clinical colour conventions, nudged toward the brand accent.
ECG = (0, 224, 184)      # --signal
PLETH = (120, 200, 255)
RESP = (250, 210, 90)
LABEL = (150, 160, 172)

FONT_DIRS = [
    '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf',
    '/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf',
]
FONT_BOLD = [
    '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf',
    '/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf',
]


def load_font(paths, size):
    for p in paths:
        if os.path.exists(p):
            return ImageFont.truetype(p, size)
    return ImageFont.load_default()


def ecg_wave(x: float) -> float:
    """One PQRST complex per unit of x, roughly the right shape.

    Not a clinical model — just the recognisable silhouette: small P bump,
    sharp QRS spike, broader T wave. A sine wave would read as a heart
    monitor from a film, which is exactly the tell to avoid.
    """
    t = x % 1.0
    if 0.10 <= t < 0.18:                       # P
        return 0.13 * math.sin((t - 0.10) / 0.08 * math.pi)
    if 0.30 <= t < 0.34:                       # Q
        return -0.16 * math.sin((t - 0.30) / 0.04 * math.pi)
    if 0.34 <= t < 0.40:                       # R
        return 1.0 * math.sin((t - 0.34) / 0.06 * math.pi)
    if 0.40 <= t < 0.46:                       # S
        return -0.34 * math.sin((t - 0.40) / 0.06 * math.pi)
    if 0.56 <= t < 0.72:                       # T
        return 0.26 * math.sin((t - 0.56) / 0.16 * math.pi)
    return 0.0


def pleth_wave(x: float) -> float:
    t = x % 1.0
    return math.exp(-3.0 * t) * math.sin(t * math.pi * 1.15) * 1.4


def resp_wave(x: float) -> float:
    return math.sin(x * math.pi * 2.0) * 0.8


def draw_trace(d, fn, *, y_mid, amp, colour, cycles, x0, x1, width=3):
    pts = []
    span = x1 - x0
    for px in range(int(span)):
        x = px / span * cycles
        pts.append((x0 + px, y_mid - fn(x) * amp))
    d.line(pts, fill=colour, width=width, joint='curve')


def build(seed: int = 7) -> Image.Image:
    random.seed(seed)
    im = Image.new('RGB', (W, H), BG)
    d = ImageDraw.Draw(im)

    f_num = load_font(FONT_BOLD, 78)
    f_small = load_font(FONT_BOLD, 34)
    f_lbl = load_font(FONT_DIRS, 22)

    panel_x = int(W * 0.70)
    d.line([(panel_x, 24), (panel_x, H - 24)], fill=(28, 34, 42), width=2)

    rows = [
        ('ECG', 'HR', '88', 'bpm', ECG, ecg_wave, 4.0, 0.30),
        ('SpO₂', 'SpO₂', '97', '%', PLETH, pleth_wave, 4.0, 0.55),
        ('RESP', 'RR', '16', '/min', RESP, resp_wave, 3.0, 0.80),
    ]

    for label, key, value, unit, colour, fn, cycles, y_frac in rows:
        y = int(H * y_frac)
        d.text((30, y - 66), label, font=f_lbl, fill=LABEL)
        draw_trace(
            d, fn,
            y_mid=y, amp=H * 0.11, colour=colour,
            cycles=cycles, x0=30, x1=panel_x - 40,
        )
        d.text((panel_x + 28, y - 74), key, font=f_lbl, fill=LABEL)
        d.text((panel_x + 28, y - 52), value, font=f_num, fill=colour)
        w = d.textlength(value, font=f_num)
        d.text((panel_x + 34 + w, y - 6), unit, font=f_lbl, fill=LABEL)

    # Blood pressure has no waveform on this layout, so it gets its own row.
    d.text((30, 34), 'NIBP', font=f_lbl, fill=LABEL)
    d.text((110, 20), '124/78', font=f_small, fill=(235, 240, 245))
    d.text((250, 34), 'mmHg', font=f_lbl, fill=LABEL)

    # Very light scanlines so the panel reads as an emissive display without
    # eating the traces. An earlier pass drew these every 3px at full black,
    # which dominated the image once it was small in frame.
    scan = Image.new('RGB', (W, H), (0, 0, 0))
    sd = ImageDraw.Draw(scan)
    for y in range(0, H, 4):
        sd.line([(0, y), (W, y)], fill=(255, 255, 255), width=1)
    return Image.blend(im, Image.composite(im, Image.new('RGB', (W, H), BG), scan.convert('L')), 0.35)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--out', default='public/textures')
    args = ap.parse_args()
    os.makedirs(args.out, exist_ok=True)
    path = os.path.join(args.out, 'vitals-screen.png')
    build().save(path)
    print(f'[vitals] {path}')


if __name__ == '__main__':
    main()
