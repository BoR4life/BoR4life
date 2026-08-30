"""
Procedurally build, render and export a clinical resuscitation bay.

Runs headless against Blender-as-a-module (`pip install bpy`), so it works in
CI with no GUI and no .blend file to keep in version control — the scene is
code, reviewable in a diff.

    python scripts/build_clinical_bay.py --preview      # fast 960x540 check
    python scripts/build_clinical_bay.py --render-4k    # 3840x2160 hero still
    python scripts/build_clinical_bay.py --export-gltf  # web model

Look-dev follows docs/03-3d-production-spec.md: soft high-key HDRI-style
lighting, 40mm lens, restrained depth of field. Real wards are bright and
even — dramatic rim-lit darkness reads as a horror game and undermines the
pedagogy.
"""

import argparse
import math
import os
import sys

import bpy
import bmesh
from mathutils import Vector

# ----------------------------------------------------------------------------
# Clinical palette. Getting stainless, PVC, vinyl and skin right is ~80% of
# believability in a clinical space, so these are tuned rather than guessed.
# ----------------------------------------------------------------------------
PALETTE = {
    "floor_vinyl":   ((0.15, 0.17, 0.19, 1), 0.0, 0.20),
    "wall_paint":    ((0.52, 0.54, 0.55, 1), 0.0, 0.65),
    "wall_accent":   ((0.13, 0.26, 0.30, 1), 0.0, 0.60),
    "ceiling":       ((0.62, 0.63, 0.64, 1), 0.0, 0.80),
    "stainless":     ((0.48, 0.50, 0.53, 1), 1.0, 0.26),
    "chrome":        ((0.66, 0.68, 0.70, 1), 1.0, 0.10),
    "bed_frame":     ((0.46, 0.48, 0.50, 1), 0.35, 0.35),
    "mattress":      ((0.26, 0.28, 0.32, 1), 0.0, 0.74),
    "linen":         ((0.74, 0.75, 0.76, 1), 0.0, 0.88),
    "pvc_rail":      ((0.58, 0.59, 0.61, 1), 0.0, 0.42),
    "device_body":   ((0.20, 0.21, 0.23, 1), 0.15, 0.48),
    "cart_body":     ((0.52, 0.09, 0.05, 1), 0.10, 0.42),
    "cart_drawer":   ((0.60, 0.13, 0.07, 1), 0.10, 0.40),
    "curtain":       ((0.24, 0.34, 0.37, 1), 0.0, 0.88),
    "sharps":        ((0.62, 0.42, 0.03, 1), 0.0, 0.45),
    "iv_bag":        ((0.60, 0.66, 0.70, 1), 0.0, 0.20),
    "rubber":        ((0.10, 0.10, 0.11, 1), 0.0, 0.65),
    "blanket":       ((0.17, 0.27, 0.29, 1), 0.0, 0.92),
}

EMISSIVE = {
    # name: (colour, strength)
    "screen_vitals": ((0.06, 0.42, 0.40, 1), 9.0),
    "screen_defib":  ((0.10, 0.40, 0.18, 1), 7.0),
    "ceiling_light": ((1.00, 0.98, 0.95, 1), 2.2),
}


# ----------------------------------------------------------------------------
# Helpers
# ----------------------------------------------------------------------------
def reset_scene():
    bpy.ops.wm.read_factory_settings(use_empty=True)


def _set(bsdf, key, value):
    """Socket names shift between Blender versions; fail soft rather than hard."""
    if key in bsdf.inputs:
        bsdf.inputs[key].default_value = value


def make_material(name, base_color, metallic, roughness,
                  emission=None, emission_strength=0.0, alpha=1.0):
    mat = bpy.data.materials.new(name)
    mat.use_nodes = True
    bsdf = mat.node_tree.nodes["Principled BSDF"]
    _set(bsdf, "Base Color", base_color)
    _set(bsdf, "Metallic", metallic)
    _set(bsdf, "Roughness", roughness)
    _set(bsdf, "Alpha", alpha)
    if emission:
        _set(bsdf, "Emission Color", emission)
        _set(bsdf, "Emission Strength", emission_strength)
    if alpha < 1.0:
        mat.blend_method = 'BLEND'
    return mat


MATS = {}


def build_materials():
    for name, (col, met, rough) in PALETTE.items():
        MATS[name] = make_material(name, col, met, rough)
    for name, (col, strength) in EMISSIVE.items():
        MATS[name] = make_material(name, (0.02, 0.02, 0.02, 1), 0.0, 0.5,
                                   emission=col, emission_strength=strength)


def box(name, size, location, material, rotation=(0, 0, 0)):
    """Axis-aligned box specified by full size (not half-extent) and centre."""
    bpy.ops.mesh.primitive_cube_add(size=1, location=location, rotation=rotation)
    obj = bpy.context.object
    obj.name = name
    obj.scale = (size[0] / 2 * 2, size[1] / 2 * 2, size[2] / 2 * 2)
    obj.scale = (size[0], size[1], size[2])
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    obj.data.materials.append(MATS[material])
    return obj


def cylinder(name, radius, depth, location, material, rotation=(0, 0, 0), verts=32):
    bpy.ops.mesh.primitive_cylinder_add(radius=radius, depth=depth,
                                        location=location, rotation=rotation,
                                        vertices=verts)
    obj = bpy.context.object
    obj.name = name
    obj.data.materials.append(MATS[material])
    return obj


def bevel(obj, width=0.006, segments=2):
    """A tiny bevel on every hard edge. This single detail does more for
    'expensive render' than any amount of extra geometry — real objects have
    no infinitely sharp edges, and the highlight they catch is what sells it."""
    mod = obj.modifiers.new("Bevel", 'BEVEL')
    mod.width = width
    mod.segments = segments
    mod.limit_method = 'ANGLE'
    mod.angle_limit = math.radians(40)
    return obj


def castors(prefix, corners, z=0.04, r=0.035):
    for i, (x, y) in enumerate(corners):
        cylinder(f"{prefix}_castor_{i}", r, 0.022, (x, y, z), "rubber",
                 rotation=(math.pi / 2, 0, 0), verts=16)


# ----------------------------------------------------------------------------
# Room
# ----------------------------------------------------------------------------
ROOM_W, ROOM_D, ROOM_H = 5.0, 6.0, 3.0


def build_room():
    box("Floor", (ROOM_W, ROOM_D, 0.05), (ROOM_W / 2, ROOM_D / 2, -0.025), "floor_vinyl")
    box("Ceiling", (ROOM_W, ROOM_D, 0.05), (ROOM_W / 2, ROOM_D / 2, ROOM_H + 0.025), "ceiling")

    # Headwall (behind the bed) gets the accent colour — real bays use a
    # colour break at the head of the bed to orient staff quickly.
    box("Wall_Head", (ROOM_W, 0.08, ROOM_H), (ROOM_W / 2, ROOM_D - 0.04, ROOM_H / 2), "wall_accent")
    box("Wall_Foot", (ROOM_W, 0.08, ROOM_H), (ROOM_W / 2, 0.04, ROOM_H / 2), "wall_paint")
    box("Wall_L", (0.08, ROOM_D, ROOM_H), (0.04, ROOM_D / 2, ROOM_H / 2), "wall_paint")
    box("Wall_R", (0.08, ROOM_D, ROOM_H), (ROOM_W - 0.04, ROOM_D / 2, ROOM_H / 2), "wall_paint")

    # Skirting — cheap, and its absence is one of the tells of a fake room.
    box("Skirt_Head", (ROOM_W, 0.02, 0.10), (ROOM_W / 2, ROOM_D - 0.09, 0.05), "wall_paint")
    box("Skirt_L", (0.02, ROOM_D, 0.10), (0.09, ROOM_D / 2, 0.05), "wall_paint")
    box("Skirt_R", (0.02, ROOM_D, 0.10), (ROOM_W - 0.09, ROOM_D / 2, 0.05), "wall_paint")

    # Headwall service rail + medical gas outlets (O2, air, suction)
    rail = box("Service_Rail", (2.2, 0.10, 0.14), (2.6, ROOM_D - 0.14, 1.45), "stainless")
    bevel(rail)
    for i, (dx, col) in enumerate([(-0.55, "wall_accent"), (-0.25, "stainless"), (0.05, "wall_accent")]):
        o = box(f"Gas_Outlet_{i}", (0.09, 0.07, 0.11), (2.6 + dx, ROOM_D - 0.20, 1.45), col)
        bevel(o, 0.004)
    for i in range(2):
        s = box(f"Socket_{i}", (0.16, 0.04, 0.10), (3.35 + i * 0.22, ROOM_D - 0.17, 1.45), "wall_paint")
        bevel(s, 0.004)


def build_ceiling_lights():
    """Recessed panels. These are the key light and they are IN frame, so they
    must read as real fixtures, not as invisible studio lights."""
    for i, (x, y) in enumerate([(1.6, 2.0), (1.6, 4.2), (3.6, 2.0), (3.6, 4.2)]):
        box(f"Light_Panel_{i}", (1.10, 0.34, 0.04), (x, y, ROOM_H - 0.04), "ceiling_light")
        frame = box(f"Light_Frame_{i}", (1.18, 0.42, 0.05), (x, y, ROOM_H - 0.025), "wall_paint")
        bevel(frame, 0.004)


# ----------------------------------------------------------------------------
# Hero props
# ----------------------------------------------------------------------------
BED_X, BED_Y = 2.6, 3.45


def build_bed():
    # Base and column
    base = box("Bed_Base", (0.72, 1.70, 0.16), (BED_X, BED_Y, 0.22), "bed_frame")
    bevel(base)
    cylinder("Bed_Column", 0.09, 0.34, (BED_X, BED_Y, 0.47), "chrome")

    # Deck + mattress, split into back-rest and leg sections. The raised
    # back-rest is what makes a bed read as "in use" rather than "showroom".
    deck = box("Bed_Deck", (0.92, 2.05, 0.06), (BED_X, BED_Y, 0.66), "bed_frame")
    bevel(deck)
    mat_l = box("Mattress_Legs", (0.88, 1.15, 0.16), (BED_X, BED_Y - 0.44, 0.79), "mattress")
    bevel(mat_l, 0.03, 3)
    mat_b = box("Mattress_Back", (0.88, 0.88, 0.16), (BED_X, BED_Y + 0.60, 0.90),
                "mattress", rotation=(math.radians(-22), 0, 0))
    bevel(mat_b, 0.03, 3)

    # Linen draped over the leg section
    lin = box("Linen", (0.94, 1.05, 0.03), (BED_X, BED_Y - 0.46, 0.885), "linen")
    bevel(lin, 0.02, 2)

    pil = box("Pillow", (0.56, 0.34, 0.12), (BED_X, BED_Y + 0.78, 1.06),
              "linen", rotation=(math.radians(-22), 0, 0))
    bevel(pil, 0.045, 3)

    bl = box("Blanket", (0.95, 0.44, 0.06), (BED_X, BED_Y - 0.70, 0.900), "blanket")
    bevel(bl, 0.028, 3)
    bl2 = box("Blanket_Fold", (0.96, 0.16, 0.05), (BED_X, BED_Y - 0.40, 0.955), "blanket")
    bevel(bl2, 0.022, 3)

    # Head and foot boards
    hb = box("Headboard", (0.94, 0.06, 0.34), (BED_X, BED_Y + 1.06, 0.86), "pvc_rail")
    bevel(hb, 0.012, 3)
    fb = box("Footboard", (0.94, 0.05, 0.20), (BED_X, BED_Y - 1.06, 0.80), "pvc_rail")
    bevel(fb, 0.012, 3)

    # Side rails — one up, one down. Asymmetry reads as human activity.
    for side, sx in (("L", -0.47), ("R", 0.47)):
        z = 0.99 if side == "L" else 0.72
        r = box(f"Rail_{side}", (0.05, 0.86, 0.26), (BED_X + sx, BED_Y + 0.30, z), "pvc_rail")
        bevel(r, 0.012, 3)
        cylinder(f"Rail_{side}_post", 0.018, 0.30, (BED_X + sx, BED_Y - 0.10, z - 0.16), "chrome")

    castors("Bed", [(BED_X - 0.30, BED_Y - 0.75), (BED_X + 0.30, BED_Y - 0.75),
                    (BED_X - 0.30, BED_Y + 0.75), (BED_X + 0.30, BED_Y + 0.75)], r=0.055)


def build_monitor():
    """Patient monitor on an articulated wall arm, angled toward the camera."""
    cylinder("Mon_Arm_Pivot", 0.035, 0.22, (3.72, ROOM_D - 0.16, 1.86), "stainless")
    arm = box("Mon_Arm", (0.52, 0.06, 0.05), (3.48, ROOM_D - 0.34, 1.90),
              "stainless", rotation=(0, 0, math.radians(28)))
    bevel(arm, 0.008)

    body = box("Mon_Body", (0.44, 0.14, 0.34), (3.22, ROOM_D - 0.62, 1.86),
               "device_body", rotation=(0, 0, math.radians(-24)))
    bevel(body, 0.010, 3)
    scr = box("Mon_Screen", (0.38, 0.02, 0.26), (3.205, ROOM_D - 0.695, 1.87),
              "screen_vitals", rotation=(0, 0, math.radians(-24)))

    # Trace bar under the screen suggesting a rhythm strip
    box("Mon_Trace", (0.34, 0.015, 0.03), (3.20, ROOM_D - 0.700, 1.70),
        "screen_vitals", rotation=(0, 0, math.radians(-24)))


def build_iv_pole():
    x, y = 3.62, 4.58
    cylinder("IV_Pole", 0.014, 1.90, (x, y, 0.95), "chrome", verts=16)
    cylinder("IV_Foot", 0.16, 0.03, (x, y, 0.02), "chrome", verts=20)
    for i in range(5):
        a = i * (2 * math.pi / 5)
        cylinder(f"IV_Leg_{i}", 0.012, 0.30, (x + math.cos(a) * 0.14, y + math.sin(a) * 0.14, 0.05),
                 "chrome", rotation=(math.pi / 2, 0, a), verts=10)
    hook = box("IV_Hook", (0.22, 0.02, 0.02), (x, y, 1.88), "chrome")
    bevel(hook, 0.004)
    bag = box("IV_Bag", (0.16, 0.05, 0.26), (x + 0.08, y, 1.72), "iv_bag")
    bevel(bag, 0.02, 3)


def build_crash_cart():
    """The red cart is the single strongest 'this is emergency care' signal in
    the frame, so it is placed where the eye lands after the bed."""
    x, y = 4.15, 2.35
    body = box("Cart_Body", (0.56, 0.46, 0.86), (x, y, 0.53), "cart_body")
    bevel(body, 0.010, 3)
    for i in range(5):
        d = box(f"Cart_Drawer_{i}", (0.52, 0.02, 0.13), (x, y - 0.24, 0.20 + i * 0.16), "cart_drawer")
        bevel(d, 0.006, 2)
        h = box(f"Cart_Handle_{i}", (0.26, 0.03, 0.02), (x, y - 0.265, 0.20 + i * 0.16), "stainless")
        bevel(h, 0.005)
    top = box("Cart_Top", (0.60, 0.50, 0.03), (x, y, 0.975), "stainless")
    bevel(top, 0.006)
    castors("Cart", [(x - 0.22, y - 0.17), (x + 0.22, y - 0.17),
                     (x - 0.22, y + 0.17), (x + 0.22, y + 0.17)])

    # Defibrillator sitting on the cart
    d_body = box("Defib_Body", (0.40, 0.34, 0.24), (x, y + 0.02, 1.11), "device_body")
    bevel(d_body, 0.012, 3)
    box("Defib_Screen", (0.24, 0.02, 0.16), (x - 0.02, y - 0.155, 1.15), "screen_defib")
    for i, dx in enumerate((-0.12, 0.12)):
        p = box(f"Defib_Paddle_{i}", (0.11, 0.16, 0.05), (x + dx, y + 0.24, 1.26), "device_body")
        bevel(p, 0.010, 2)

    # Oxygen cylinder strapped to the side
    cylinder("O2_Cyl", 0.075, 0.62, (x + 0.36, y + 0.08, 0.36), "wall_accent", verts=20)
    cylinder("O2_Neck", 0.028, 0.10, (x + 0.36, y + 0.08, 0.71), "stainless", verts=14)


def build_overbed_table():
    x, y = 1.52, 4.55
    top = box("Table_Top", (0.78, 0.42, 0.03), (x, y, 0.92), "pvc_rail")
    bevel(top, 0.008, 3)
    cylinder("Table_Col", 0.035, 0.88, (x + 0.24, y, 0.46), "chrome", verts=20)
    base = box("Table_Base", (0.30, 0.52, 0.04), (x + 0.24, y, 0.03), "chrome")
    bevel(base, 0.006)
    # A few items on the table so it does not read as staged-empty
    box("Tray", (0.30, 0.22, 0.02), (x - 0.14, y + 0.02, 0.945), "stainless")
    cylinder("Cup", 0.035, 0.09, (x + 0.02, y - 0.10, 0.985), "pvc_rail", verts=18)


def build_curtain():
    """Subdivided plane with a sine displacement for folds. Cheap, and the
    vertical rhythm of the folds gives the frame a soft edge that stops the
    room feeling like a box."""
    track = box("Curtain_Track", (0.04, 1.90, 0.05), (0.80, 4.85, ROOM_H - 0.08), "stainless")
    bevel(track, 0.006)

    bpy.ops.mesh.primitive_grid_add(x_subdivisions=48, y_subdivisions=12, size=1,
                                    location=(0.80, 4.85, 1.45))
    obj = bpy.context.object
    obj.name = "Curtain"
    obj.rotation_euler = (0, math.radians(90), math.radians(90))
    obj.scale = (2.85, 1.90, 1.0)
    bpy.ops.object.transform_apply(location=False, rotation=True, scale=True)

    me = obj.data
    bm = bmesh.new()
    bm.from_mesh(me)
    for v in bm.verts:
        # Fold amplitude tapers toward the track so it hangs believably.
        taper = (v.co.z - 0.15) / 2.85
        taper = max(0.0, min(1.0, taper))
        v.co.x += math.sin(v.co.y * 9.0) * 0.055 * (1.0 - taper * 0.55)
    bm.to_mesh(me)
    bm.free()

    obj.data.materials.append(MATS["curtain"])
    m = obj.modifiers.new("Solid", 'SOLIDIFY')
    m.thickness = 0.006
    obj.modifiers.new("Smooth", 'SUBSURF').levels = 1


def build_sundries():
    # Sharps container and sanitiser on the wall — small, but their presence is
    # the difference between "3D room" and "clinical space someone works in".
    s = box("Sharps", (0.22, 0.18, 0.30), (4.62, ROOM_D - 1.55, 1.28), "sharps")
    bevel(s, 0.010, 2)
    box("Sharps_Lid", (0.23, 0.19, 0.05), (4.62, ROOM_D - 1.55, 1.45), "pvc_rail")
    g = box("Sanitiser", (0.11, 0.10, 0.24), (4.62, ROOM_D - 2.15, 1.42), "pvc_rail")
    bevel(g, 0.008, 2)
    for i in range(3):
        b = box(f"Glove_Box_{i}", (0.13, 0.09, 0.15), (4.62, 1.30 + i * 0.16, 1.55), "wall_accent")
        bevel(b, 0.006, 2)


# ----------------------------------------------------------------------------
# Lighting, camera, render
# ----------------------------------------------------------------------------
def build_lighting(night=False):
    """Soft, high-key, broad. Matches how a real bay actually looks and keeps
    every clinical detail legible — which is the whole point of the image."""
    world = bpy.data.worlds.new("World")
    bpy.context.scene.world = world
    world.use_nodes = True
    bg = world.node_tree.nodes["Background"]
    if night:
        bg.inputs["Color"].default_value = (0.04, 0.05, 0.08, 1)
        bg.inputs["Strength"].default_value = 0.06
    else:
        bg.inputs["Color"].default_value = (0.55, 0.60, 0.66, 1)
        bg.inputs["Strength"].default_value = 0.22

    def area(name, loc, size, energy, rot=(0, 0, 0)):
        d = bpy.data.lights.new(name, 'AREA')
        d.energy = energy
        d.size = size[0]
        d.size_y = size[1]
        d.shape = 'RECTANGLE'
        o = bpy.data.objects.new(name, d)
        o.location = loc
        o.rotation_euler = rot
        bpy.context.collection.objects.link(o)
        return o

    if night:
        # The moment before: one warm strip washing down the headwall (per
        # Brad's night-ward reference), screens carrying the rest. Darkness
        # here is narrative — the stake, not styling.
        strip = bpy.data.lights.new("NightStrip", 'AREA')
        strip.energy = 40
        strip.color = (1.0, 0.72, 0.42)
        strip.size = 2.0
        strip.size_y = 0.08
        strip.shape = 'RECTANGLE'
        o = bpy.data.objects.new("NightStrip", strip)
        o.location = (2.6, ROOM_D - 0.22, 2.10)
        o.rotation_euler = (math.radians(28), 0, 0)
        bpy.context.collection.objects.link(o)
        # Faint cool spill from the corridor side, so shadows aren't dead black
        area("NightSpill", (0.6, 0.6, 1.8), (1.8, 1.8), 3.4,
             rot=(math.radians(60), 0, math.radians(30)))
        return

    # Ceiling panels as real emitters, matching the visible fixtures
    for i, (x, y) in enumerate([(1.6, 2.0), (1.6, 4.2), (3.6, 2.0), (3.6, 4.2)]):
        area(f"Key_{i}", (x, y, ROOM_H - 0.10), (1.10, 0.34), 34)

    # Broad fill from camera side to lift shadows — high-key, not moody
    area("Fill", (0.9, 0.8, 2.10), (3.0, 3.0), 14, rot=(math.radians(58), 0, math.radians(38)))
    # Gentle bounce off the foot wall
    area("Bounce", (2.5, 0.30, 1.40), (3.0, 2.0), 7, rot=(math.radians(-90), 0, 0))


def build_camera(dof=True):
    cam_data = bpy.data.cameras.new("Camera")
    cam_data.lens = 32.0           # 32mm — wide enough to read the room, short of distortion
    cam_data.sensor_width = 36.0
    cam = bpy.data.objects.new("Camera", cam_data)
    cam.location = (1.05, 0.66, 1.64)   # foot-corner, standing eye height
    bpy.context.collection.objects.link(cam)

    target = bpy.data.objects.new("CamTarget", None)
    target.location = (2.86, 3.66, 1.10)
    bpy.context.collection.objects.link(target)
    con = cam.constraints.new('TRACK_TO')
    con.target = target
    con.track_axis = 'TRACK_NEGATIVE_Z'
    con.up_axis = 'UP_Y'

    if dof:
        cam_data.dof.use_dof = True
        cam_data.dof.focus_object = target
        cam_data.dof.aperture_fstop = 4.0   # restrained; heavy bokeh hides detail

    bpy.context.scene.camera = cam
    return cam


def configure_render(width, height, samples):
    sc = bpy.context.scene
    sc.render.engine = 'CYCLES'
    sc.cycles.device = 'CPU'
    sc.cycles.samples = samples
    sc.cycles.use_adaptive_sampling = True
    sc.cycles.adaptive_threshold = 0.02
    sc.cycles.use_denoising = True
    sc.cycles.max_bounces = 6
    sc.cycles.diffuse_bounces = 3
    sc.cycles.glossy_bounces = 3
    sc.cycles.transmission_bounces = 4
    sc.cycles.caustics_reflective = False
    sc.cycles.caustics_refractive = False
    sc.render.use_persistent_data = True
    sc.render.resolution_x = width
    sc.render.resolution_y = height
    sc.render.resolution_percentage = 100
    sc.render.image_settings.file_format = 'PNG'
    sc.render.image_settings.color_mode = 'RGB'
    sc.view_settings.view_transform = 'AgX'   # filmic highlight rolloff
    sc.view_settings.look = 'AgX - Medium High Contrast'
    sc.view_settings.exposure = -0.35


def build_all(dof=True, night=False):
    reset_scene()
    build_materials()
    build_room()
    build_ceiling_lights()
    build_bed()
    build_monitor()
    build_iv_pole()
    build_crash_cart()
    build_overbed_table()
    build_curtain()
    build_sundries()
    build_lighting(night=night)
    build_camera(dof=dof)
    if night:
        # Panels off; the wall monitor stays lit and becomes a key light.
        mat = MATS["ceiling_light"]
        _set(mat.node_tree.nodes["Principled BSDF"], "Emission Strength", 0.0)
        _set(MATS["screen_vitals"].node_tree.nodes["Principled BSDF"], "Emission Strength", 16.0)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--preview", action="store_true")
    ap.add_argument("--render-4k", action="store_true")
    ap.add_argument("--export-gltf", action="store_true")
    ap.add_argument("--night", action="store_true",
                    help="the 'moment before' lighting state: one warm strip, screens glowing")
    ap.add_argument("--out", default="renders")
    ap.add_argument("--samples", type=int, default=0)
    args = ap.parse_args()

    os.makedirs(args.out, exist_ok=True)
    build_all(dof=not args.export_gltf, night=args.night)

    tris = sum(len(o.data.loop_triangles) if o.type == 'MESH' else 0
               for o in bpy.data.objects
               if o.type == 'MESH' and (o.data.calc_loop_triangles() or True))
    print(f"[scene] objects={len(bpy.data.objects)} triangles~={tris}")

    if args.preview:
        configure_render(960, 540, args.samples or 48)
        bpy.context.scene.render.filepath = os.path.join(args.out, "preview-night.png" if args.night else "preview.png")
        bpy.ops.render.render(write_still=True)
        print("[render] preview written")

    if args.render_4k:
        configure_render(3840, 2160, args.samples or 110)
        bpy.context.scene.render.filepath = os.path.join(args.out, "hero-ward-night-4k.png" if args.night else "hero-ward-4k.png")
        bpy.ops.render.render(write_still=True)
        print("[render] 4K written")

    if args.export_gltf:
        out = os.path.join(args.out, "hero-ward-raw.glb")
        bpy.ops.export_scene.gltf(filepath=out, export_format='GLB',
                                  export_apply=True, export_cameras=False,
                                  export_lights=False)
        print(f"[export] {out}")


if __name__ == "__main__":
    main()
