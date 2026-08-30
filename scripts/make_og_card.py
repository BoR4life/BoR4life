"""
Generate the Open Graph / social share card.

Every link shared into LinkedIn, an email client or Slack renders this. For
a B2B company selling into procurement, that preview is often the first
impression a decision-maker gets — and with no og:image at all, a shared
link renders as a bare grey box, which reads as an unfinished site.

Composed rather than rendered: it needs typography, and text is far easier
to control in PIL than in Blender. The background is a real render, so the
card still shows the product rather than a logo on a gradient.

    python scripts/make_og_card.py --bg renders/web.png --out public/images
"""

import argparse
import os

from PIL import Image, ImageDraw, ImageFilter, ImageFont

# 1200x630 is the Open Graph standard. LinkedIn, Slack and iMessage all
# crop toward the centre, so nothing important goes near the edges.
W, H = 1200, 630

INK = (10, 12, 15)
PAPER = (244, 245, 247)
SIGNAL = (0, 224, 184)
MUTED = (170, 178, 188)

BOLD = [
    '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf',
    '/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf',
]
REG = [
    '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf',
    '/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf',
]


def font(paths, size):
    for p in paths:
        if os.path.exists(p):
            return ImageFont.truetype(p, size)
    return ImageFont.load_default()


def build(bg_path: str | None) -> Image.Image:
    card = Image.new('RGB', (W, H), INK)

    if bg_path and os.path.exists(bg_path):
        bg = Image.open(bg_path).convert('RGB')
        # Cover-crop to the card aspect, biased upward to keep the headwall
        # and monitor rather than a lot of floor.
        scale = max(W / bg.width, H / bg.height)
        bg = bg.resize((round(bg.width * scale), round(bg.height * scale)), Image.LANCZOS)
        top = int((bg.height - H) * 0.30)
        bg = bg.crop((0, top, W, top + H))
        bg = bg.filter(ImageFilter.GaussianBlur(1.2))
        card.paste(bg, (0, 0))

        # Scrim: the render is bright, and text over it must clear 4.5:1.
        # A left-weighted gradient keeps the image readable on the right.
        scrim = Image.new('L', (W, H), 0)
        sd = ImageDraw.Draw(scrim)
        for x in range(W):
            a = 245 - int(200 * min(1.0, max(0.0, (x - 60) / (W * 0.85))))
            sd.line([(x, 0), (x, H)], fill=max(a, 40))
        card = Image.composite(Image.new('RGB', (W, H), INK), card, scrim)

    d = ImageDraw.Draw(card)

    f_eyebrow = font(BOLD, 20)
    f_title = font(BOLD, 62)
    f_sub = font(REG, 26)
    f_mark = font(BOLD, 24)

    x = 72

    d.text((x, 92), 'BUNDLE OF RAYS', font=f_mark, fill=PAPER)
    d.line([(x, 132), (x + 46, 132)], fill=SIGNAL, width=3)

    d.text((x, 196), 'CLINICALLY AUTHORED IMMERSIVE TRAINING',
           font=f_eyebrow, fill=SIGNAL)

    for i, line in enumerate(['Practise the moment', 'before it counts.']):
        d.text((x, 240 + i * 72), line, font=f_title, fill=PAPER)

    d.text((x, 420),
           'Built by nurses, for nurses.',
           font=f_sub, fill=PAPER)
    d.text((x, 462),
           'Five years with Queensland Health.',
           font=f_sub, fill=MUTED)

    d.line([(x, 534), (W - 72, 534)], fill=(48, 54, 64), width=1)
    d.text((x, 556), 'bundleofrays.com', font=f_sub, fill=MUTED)

    return card


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--bg', default=None, help='background render to composite')
    ap.add_argument('--out', default='public/images')
    args = ap.parse_args()
    os.makedirs(args.out, exist_ok=True)
    card = build(args.bg)
    path = os.path.join(args.out, 'og-default.png')
    card.save(path, optimize=True)
    print(f'[og] {path}  {os.path.getsize(path)/1024:.0f}KB')


if __name__ == '__main__':
    main()
