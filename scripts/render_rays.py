"""
Abstract volumetric light studies — a working renderer, NOT currently shipping.

Read this before using it. It was built to answer "can we get world-class
abstract 3D onto this site without Blender", and the honest answer it
produced was "not yet". The renderer works; the imagery it makes is
competent and not exceptional, and the site is better with no image than
with a merely competent one — that is the lesson the removed 3D scene
already taught this project once.

WHAT IT DOES

A small volumetric raymarcher in numpy. A dark room, one shuttered aperture
in a side wall, light raking across the space. Everything is analytic: the
occluder is a plane with a periodic mask, so a shadow test is one ray/plane
crossing rather than a march. That is what lets a 2400px frame render in
about five minutes on a CPU with no GPU and no dependency beyond numpy.

    python scripts/render_rays.py --out renders/rays.png --width 2400 --ratio 2.4
    node scripts/encode-still.mjs renders/rays.png public/images/hero-rays

Output at 2400x1000 encodes to roughly 15KB AVIF — far inside the budget in
budgets.json.

WHAT WAS LEARNED, so the next attempt starts further along

  - Light must CROSS the view for a shaft to read as a shaft. Pointing the
    camera at the aperture means looking down the beams end-on, and a beam
    seen end-on is just a bright patch.
  - Consequently the phase function must be near-isotropic. Henyey-Greenstein
    with a high g concentrates scatter toward the light, which renders
    side-lit shafts nearly invisible. HG_G is 0.12 here for that reason.
  - A constant-density medium and a point light give shafts a flat interior
    and a razor edge — the "cut paper" look. Density variation (see
    `density`) and a jittered light direction (LIGHT_SOFTNESS) are what make
    it read as light in air rather than as vector shapes.
  - Downsample in linear light. Averaging gamma-encoded pixels darkens edges.
  - `np.cross(fwd, worldUp)` is left-handed for a +z view and silently
    mirrors the scene.

WHY IT IS NOT ON THE SITE

The composition needs its native ~2.4:1 frame. Cropped into a hero band it
slices the aperture with a hard vertical edge that reads as a rendering
fault, and every fix for that traded one flaw for another. The imagery also
stays essentially one flat idea — slats and beams — with no material depth,
no reflection, no depth of field. Against the reference Brad gave
(Matthias Winckelmann), it is not close.

The path to closing that gap is real 3D tooling — Blender with a path
tracer, which this environment does not have — or a commissioned artist.
See docs/03-3d-production-spec.md, which is parked for the same reason.

import argparse
import struct
import zlib

import numpy as np

# --- Brand anchors (docs/01-art-direction.md) -------------------------------
# Linear-light versions of the tokens. sRGB values are gamma-encoded; doing
# physics on them directly is the single most common reason a render looks
# muddy, so they are converted once here and never used encoded.
def srgb_to_linear(c):
    c = np.asarray(c, dtype=np.float64)
    return np.where(c <= 0.04045, c / 12.92, ((c + 0.055) / 1.055) ** 2.4)


SIGNAL = srgb_to_linear([0x00 / 255, 0xE0 / 255, 0xB8 / 255])  # #00E0B8
INK_900 = srgb_to_linear([0x0A / 255, 0x0C / 255, 0x0F / 255])  # #0A0C0F


# --- Scene ------------------------------------------------------------------
# A long dark room with one shuttered aperture in the SIDE wall. Light rakes
# across the space from right to left, so the beams cross the frame instead
# of pointing at the camera.
#
# That is the whole composition, and it took three attempts. Version one
# pointed the camera into a full-width colonnade and produced an even teal
# wash with no blacks. Version two moved the aperture to the far wall, which
# gave real darkness but no visible shafts — with the light travelling almost
# parallel to the view direction you are looking *down* the beams, end-on, and
# a beam seen end-on is just a bright patch. Light has to cross the view for
# a shaft to read as a shaft.
WALL_X = 5.0                     # the aperture is a side wall now
BACK_Z = 21.0                    # far wall, so the room is enclosed
FLOOR_Y = 0.0

# The window, defined in the plane of that wall: (z along the room, y up).
WIN_Z0, WIN_Z1 = 0.5, 17.0
WIN_Y0, WIN_Y1 = 1.0, 7.4
SLAT_PERIOD = 1.30
SLAT_DUTY = 0.55                 # fraction of each slat cycle that is solid

FOG = 0.036
HG_G = 0.12                      # near-isotropic, and this matters
# Henyey-Greenstein with a high g concentrates scattering toward the light,
# which is right when you look into a beam and exactly wrong here: these
# beams cross the view at close to a right angle, and a forward-scattering
# medium renders them nearly invisible. Side-lit shafts need g near zero.

CAM = np.array([-7.8, 2.4, -7.0])
LOOK = np.array([1.2, 2.0, 7.0])
FOV_DEG = 58.0

# Direction from a scene point toward the light: out through the side wall,
# and above. Mostly +x, so the beams travel across the frame.
LIGHT_DIR = np.array([1.0, 0.46, 0.10])
LIGHT_DIR = LIGHT_DIR / np.linalg.norm(LIGHT_DIR)

EXPOSURE = 0.46
SCATTER_GAIN = 5.0
LIGHT_SOFTNESS = 0.035           # angular jitter; gives the shafts a penumbra

def wall_solid(z, y):
    """
    True where the side wall blocks light. Solid everywhere except inside the
    window, and inside the window only where a slat falls.
    """
    in_window = (z > WIN_Z0) & (z < WIN_Z1) & (y > WIN_Y0) & (y < WIN_Y1)
    slat = np.mod(y, SLAT_PERIOD) < (SLAT_PERIOD * SLAT_DUTY)
    return ~in_window | slat


def occluded(px, py, pz, ldir=None):
    """
    Is this point in shadow?

    The occluder is a single plane, so this is one ray/plane crossing and a
    modulo — no marching. That is the whole performance trick.
    """
    L = LIGHT_DIR if ldir is None else ldir
    t = (WALL_X - px) / L[0]
    behind = t <= 0.0                      # already outside the wall
    yc = py + t * L[1]
    zc = pz + t * L[2]
    return wall_solid(zc, yc) & ~behind


def density(x, y, z):
    """
    Non-uniform medium.

    A constant-density fog gives every shaft a perfectly flat interior and a
    razor edge, which is why the earlier versions read as cut paper rather
    than light. Real air is uneven, and it is that unevenness the eye uses to
    decide it is looking at a volume. A short sum of sines is smooth, cheap,
    vectorises perfectly and is indistinguishable from value noise at this
    scale.
    """
    n = (0.34 * np.sin(0.62 * x + 1.20 * z + 0.4)
         * np.sin(0.83 * y - 0.55 * z)
         + 0.17 * np.sin(1.90 * x - 1.45 * y + 0.35 * z)
         + 0.09 * np.sin(3.30 * z + 2.10 * y))
    return np.clip(1.0 + n, 0.25, 2.0)


def hg_phase(cos_t, g=HG_G):
    """Henyey-Greenstein. Concentrates scatter toward the light."""
    return (1.0 - g * g) / (4.0 * np.pi * (1.0 + g * g - 2.0 * g * cos_t) ** 1.5)


def aces(x):
    """Filmic tone map. Keeps the highlight in the shaft from clipping flat."""
    a, b, c, d, e = 2.51, 0.03, 2.43, 0.59, 0.14
    return np.clip((x * (a * x + b)) / (x * (c * x + d) + e), 0.0, 1.0)


def render(width, height, steps, seed=7, ss=2):
    """Renders at `ss`x and box-filters down — the slat edges are hard, and
    a single jittered sample per pixel leaves them visibly speckled."""
    full = _render_raw(width * ss, height * ss, steps, seed)
    if ss == 1:
        return full
    h, w, c = full.shape
    return full.reshape(h // ss, ss, w // ss, ss, c).mean(axis=(1, 3))


def _render_raw(width, height, steps, seed=7):
    aspect = width / height
    fwd = LOOK - CAM
    fwd /= np.linalg.norm(fwd)
    right = np.cross(np.array([0.0, 1.0, 0.0]), fwd)
    right /= np.linalg.norm(right)
    up = np.cross(right, fwd)
    half = np.tan(np.radians(FOV_DEG) * 0.5)

    rng = np.random.default_rng(seed)
    out = np.zeros((height, width, 3), dtype=np.float64)

    # Row blocks keep peak memory sane at 2400px without changing the result.
    block = max(1, 4_000_000 // width)
    for y0 in range(0, height, block):
        y1 = min(height, y0 + block)
        ys, xs = np.mgrid[y0:y1, 0:width]
        # Half-pixel offset plus jitter: free antialiasing on the hard fin
        # edges, which alias badly without it.
        u = ((xs + rng.random(xs.shape)) / width * 2.0 - 1.0) * half * aspect
        v = (1.0 - (ys + rng.random(ys.shape)) / height * 2.0) * half

        d = (fwd[None, None, :]
             + u[..., None] * right[None, None, :]
             + v[..., None] * up[None, None, :])
        d /= np.linalg.norm(d, axis=-1, keepdims=True)
        dx, dy, dz = d[..., 0], d[..., 1], d[..., 2]

        # --- solid geometry -------------------------------------------------
        # Four surfaces: floor, the shuttered side wall, the far wall, and the
        # open slats of the window (the only place the exterior shows).
        big = 1e9
        t_floor = np.where(dy < -1e-6, (FLOOR_Y - CAM[1]) / dy, big)
        t_floor = np.where(t_floor > 0, t_floor, big)

        t_side = np.where(dx > 1e-6, (WALL_X - CAM[0]) / dx, big)
        t_side = np.where(t_side > 0, t_side, big)
        yw = CAM[1] + t_side * dy
        zw = CAM[2] + t_side * dz
        side_hit = (t_side < big) & (yw > FLOOR_Y)
        side_is_solid = wall_solid(zw, yw)
        t_side = np.where(side_hit, t_side, big)

        t_back = np.where(dz > 1e-6, (BACK_Z - CAM[2]) / dz, big)
        t_back = np.where(t_back > 0, t_back, big)
        yb = CAM[1] + t_back * dy
        t_back = np.where((t_back < big) & (yb > FLOOR_Y), t_back, big)

        t_hit = np.minimum(np.minimum(t_floor, t_side), t_back)
        hit_floor = (t_floor <= t_hit) & (t_floor < big)
        hit_side = (t_side <= t_hit) & (t_side < big) & ~hit_floor
        hit_back = (t_back <= t_hit) & (t_back < big) & ~hit_floor & ~hit_side
        # Only the open slats show the exterior. Everything else is interior.
        hit_open = hit_side & ~side_is_solid
        hit_side = hit_side & side_is_solid
        t_march = np.where(t_hit < big, t_hit, 45.0)

        # --- surface shading ------------------------------------------------
        col = np.zeros(d.shape, dtype=np.float64)

        # Floor. Nearly black material so the slat pools have somewhere dark
        # to land; the pools are the subject, not the surface.
        fx = CAM[0] + t_floor * dx
        fy = np.full_like(fx, FLOOR_Y)
        fz = CAM[2] + t_floor * dz
        lit_floor = ~occluded(fx, fy + 1e-4, fz)
        ndl = max(LIGHT_DIR[1], 0.0)
        dist = np.sqrt((fx - CAM[0]) ** 2 + (fz - CAM[2]) ** 2)
        atten = 1.0 / (1.0 + 0.010 * dist ** 2)
        floor_rgb = (SIGNAL[None, None, :]
                     * (lit_floor * ndl * 0.42 * atten)[..., None]
                     + INK_900[None, None, :] * 0.9)
        col = np.where(hit_floor[..., None], floor_rgb, col)

        # The shuttered wall, and the far wall. Silhouette with a whisper of
        # bounce, so they read as surfaces rather than holes in the image.
        wall_rgb = INK_900[None, None, :] + SIGNAL[None, None, :] * 0.012
        col = np.where(hit_side[..., None], wall_rgb, col)
        back_rgb = INK_900[None, None, :] + SIGNAL[None, None, :] * 0.020
        col = np.where(hit_back[..., None], back_rgb, col)

        # Through the open slats: the exterior. Bright, but tone-mapped, so
        # the slat edges stay crisp rather than blooming to a white block.
        col = np.where(hit_open[..., None],
                       SIGNAL[None, None, :] * 0.62 + 0.05, col)

        # --- volumetric in-scattering ---------------------------------------
        # This is what makes them rays rather than stripes on a floor.
        cos_t = dx * LIGHT_DIR[0] + dy * LIGHT_DIR[1] + dz * LIGHT_DIR[2]
        phase = hg_phase(cos_t)
        scatter = np.zeros(d.shape, dtype=np.float64)
        transmit = np.ones(dx.shape, dtype=np.float64)

        # Stratified samples along the view ray, jittered per pixel so the
        # medium does not band.
        for k in range(steps):
            frac = (k + rng.random(dx.shape)) / steps
            t = frac * t_march
            dt = t_march / steps
            px = CAM[0] + t * dx
            py = CAM[1] + t * dy
            pz = CAM[2] + t * dz

            # Soft shadow. The light is treated as a small area source by
            # jittering its direction per sample; across the march that
            # integrates to a real penumbra. A point source gives shafts a
            # razor edge no physical window ever produces.
            jit = rng.normal(0.0, LIGHT_SOFTNESS, size=3)
            ldir = LIGHT_DIR + jit
            ldir /= np.linalg.norm(ldir)

            lit = (~occluded(px, py, pz, ldir)) & (py > FLOOR_Y)
            # Decay along the beam's own path. Without it every shaft stays
            # at full strength forever and ends in a hard wedge at the frame
            # edge — the flat, cut-paper look. A real source is finite, and
            # the light gets weaker the further it has travelled from the
            # aperture that made it.
            travelled = np.maximum(WALL_X - px, 0.0)
            beam_falloff = np.exp(-0.20 * travelled)
            rho = FOG * density(px, py, pz)
            step_tr = np.exp(-rho * dt)
            contrib = (rho * dt) * lit * phase * transmit * beam_falloff
            scatter += SIGNAL[None, None, :] * contrib[..., None]
            transmit *= step_tr

        beam = scatter * SCATTER_GAIN
        # Desaturate the brightest part of the beam toward white. Light that
        # stays fully saturated at its core reads as a coloured gel, not as
        # something bright — this is what separates a render from a glow.
        lum = beam.mean(axis=-1, keepdims=True)
        beam = beam + np.clip(lum - 0.34, 0.0, None) * 0.85
        col = col * transmit[..., None] + beam
        out[y0:y1] = col

    return out


def encode(hdr):
    """Exposure, filmic curve, sRGB. Kept separate so downsampling happens in
    linear light — averaging gamma-encoded pixels darkens edges."""
    img = aces(hdr * EXPOSURE)
    img = np.where(img <= 0.0031308, img * 12.92,
                   1.055 * np.power(np.maximum(img, 1e-8), 1 / 2.4) - 0.055)
    return np.clip(img * 255.0 + 0.5, 0, 255).astype(np.uint8)


def write_png(path, arr):
    h, w, _ = arr.shape
    raw = b"".join(b"\x00" + arr[y].tobytes() for y in range(h))

    def chunk(tag, data):
        return (struct.pack(">I", len(data)) + tag + data
                + struct.pack(">I", zlib.crc32(tag + data) & 0xFFFFFFFF))

    png = (b"\x89PNG\r\n\x1a\n"
           + chunk(b"IHDR", struct.pack(">IIBBBBB", w, h, 8, 2, 0, 0, 0))
           + chunk(b"IDAT", zlib.compress(raw, 6))
           + chunk(b"IEND", b""))
    with open(path, "wb") as f:
        f.write(png)


if __name__ == "__main__":
    ap = argparse.ArgumentParser()
    ap.add_argument("--out", required=True)
    ap.add_argument("--width", type=int, default=2400)
    ap.add_argument("--ratio", type=float, default=2.0)
    ap.add_argument("--steps", type=int, default=96)
    ap.add_argument("--ss", type=int, default=2)
    a = ap.parse_args()
    h = int(a.width / a.ratio)
    print(f"rendering {a.width}x{h}, {a.steps} volume steps…")
    img = encode(render(a.width, h, a.steps, ss=a.ss))
    write_png(a.out, img)
    print("wrote", a.out)
