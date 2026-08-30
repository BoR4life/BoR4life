"""
State 1 of the scroll narrative: "The Frontier".

The opening frame of the homepage journey — a dark landscape a moment before
dawn, with the first ray of light cresting the ridge. The ray is the
protagonist of the whole scroll sequence (the company is called Bundle of
Rays): this same light later falls through the rising structure of states 2-3
and ends as the ceiling light panels of the resus bay in the final state.

Translated from Brad's mood reference (night alien vistas, star over the
horizon, luminous teal water) into brand terms: no planets, no nebulae, no
genre signals — cosmic scale carried by darkness, silhouette and a single
light source. Sky sits on --ink-900, the shoreline glow on --signal.

    python scripts/build_frontier_state1.py --preview
    python scripts/build_frontier_state1.py --render-4k
"""

import argparse
import math
import os

import bpy


# --- Brand anchors (docs/01-art-direction.md) -------------------------------
INK_900 = (0.012, 0.014, 0.020)   # night sky ground
SIGNAL = (0.0, 0.878, 0.722)      # #00E0B8 — the teal shoreline glow
SUN_WARM = (1.0, 0.86, 0.62)      # first light, warm against the teal


def reset_scene():
    bpy.ops.wm.read_factory_settings(use_empty=True)


def _set(bsdf, key, value):
    if key in bsdf.inputs:
        bsdf.inputs[key].default_value = value


def rock_material():
    """Dark basalt with a faint value ramp by height so ridgelines separate."""
    mat = bpy.data.materials.new("Rock")
    mat.use_nodes = True
    nt = mat.node_tree
    bsdf = nt.nodes["Principled BSDF"]
    _set(bsdf, "Base Color", (0.045, 0.042, 0.048, 1))
    _set(bsdf, "Roughness", 0.85)
    return mat


def water_material():
    """Near-black mirror. All its interest comes from what it reflects —
    the sky, the sun streak, the shoreline glow."""
    mat = bpy.data.materials.new("Water")
    mat.use_nodes = True
    bsdf = mat.node_tree.nodes["Principled BSDF"]
    _set(bsdf, "Base Color", (0.010, 0.016, 0.020, 1))
    _set(bsdf, "Roughness", 0.045)
    _set(bsdf, "Metallic", 0.9)
    return mat


def make_terrain(name, location, scale, noise_scale, height, seed,
                 material, subdivisions=180):
    """A displaced grid. Three of these at increasing distance give the
    layered-silhouette depth of the reference without any sculpting."""
    bpy.ops.mesh.primitive_grid_add(x_subdivisions=subdivisions,
                                    y_subdivisions=subdivisions,
                                    size=1, location=location)
    obj = bpy.context.object
    obj.name = name
    obj.scale = scale
    bpy.ops.object.transform_apply(scale=True)

    tex = bpy.data.textures.new(f"{name}_noise", 'MUSGRAVE')
    tex.noise_basis = 'ORIGINAL_PERLIN'
    tex.noise_scale = noise_scale
    tex.octaves = 3.0
    tex.lacunarity = 2.2
    tex.dimension_max = 1.05
    tex.musgrave_type = 'RIDGED_MULTIFRACTAL'

    mod = obj.modifiers.new("Displace", 'DISPLACE')
    mod.texture = tex
    mod.strength = height
    mod.texture_coords = 'GLOBAL'
    # Offset the sampling per-layer so ridgelines differ
    obj.location.x += seed * 0.001

    smooth = obj.modifiers.new("Smooth", 'SMOOTH')
    smooth.iterations = 6

    obj.data.materials.append(material)
    bpy.ops.object.shade_smooth()
    return obj


def build_world():
    """Night sky: ink-900 ground with a procedural starfield. Stars are a
    thresholded high-frequency noise — cheap, and they read as stars in the
    water reflection too, which is where they earn their keep."""
    world = bpy.data.worlds.new("World")
    bpy.context.scene.world = world
    world.use_nodes = True
    nt = world.node_tree
    nt.nodes.clear()

    out = nt.nodes.new('ShaderNodeOutputWorld')
    bg = nt.nodes.new('ShaderNodeBackground')

    noise = nt.nodes.new('ShaderNodeTexNoise')
    noise.inputs['Scale'].default_value = 420.0
    noise.inputs['Detail'].default_value = 0.0

    ramp = nt.nodes.new('ShaderNodeValToRGB')
    ramp.color_ramp.elements[0].position = 0.885
    ramp.color_ramp.elements[0].color = (0, 0, 0, 1)
    ramp.color_ramp.elements[1].position = 0.925
    ramp.color_ramp.elements[1].color = (1.0, 0.98, 0.92, 1)

    add = nt.nodes.new('ShaderNodeMixRGB')
    add.blend_type = 'ADD'
    add.inputs['Fac'].default_value = 1.0
    add.inputs['Color1'].default_value = (*INK_900, 1)

    nt.links.new(noise.outputs['Fac'], ramp.inputs['Fac'])
    nt.links.new(ramp.outputs['Color'], add.inputs['Color2'])
    nt.links.new(add.outputs['Color'], bg.inputs['Color'])
    bg.inputs['Strength'].default_value = 1.0
    nt.links.new(bg.outputs['Background'], out.inputs['Surface'])


def build_lights():
    # The first ray: a sun just past the far ridge, near-horizontal, warm.
    sun_data = bpy.data.lights.new("Sun", 'SUN')
    sun_data.energy = 6.0
    sun_data.color = SUN_WARM
    sun_data.angle = math.radians(0.8)
    sun = bpy.data.objects.new("Sun", sun_data)
    sun.rotation_euler = (math.radians(86), 0, math.radians(-12))
    bpy.context.collection.objects.link(sun)

    # The visible source: a small intense emissive disc cresting the ridge.
    # The compositor's glare node turns this into the star-burst.
    bpy.ops.mesh.primitive_circle_add(vertices=32, radius=0.85, fill_type='NGON',
                                      location=(14, 58, 7.4))
    disc = bpy.context.object
    disc.name = "SunDisc"
    m = bpy.data.materials.new("SunDisc")
    m.use_nodes = True
    nt = m.node_tree
    nt.nodes.clear()
    em = nt.nodes.new('ShaderNodeEmission')
    em.inputs['Color'].default_value = (*SUN_WARM, 1)
    em.inputs['Strength'].default_value = 900.0
    outn = nt.nodes.new('ShaderNodeOutputMaterial')
    nt.links.new(em.outputs['Emission'], outn.inputs['Surface'])
    disc.data.materials.append(m)
    disc.rotation_euler = (math.radians(90), 0, 0)

    # Shoreline glow: the --signal teal, low and hidden behind the near bank
    # so only its light reaches the water. Bioluminescent-shallows read,
    # brand-accurate colour.
    glow_data = bpy.data.lights.new("ShoreGlow", 'AREA')
    glow_data.energy = 260
    glow_data.color = SIGNAL
    glow_data.size = 26
    glow_data.size_y = 3.2
    glow_data.shape = 'RECTANGLE'
    glow = bpy.data.objects.new("ShoreGlow", glow_data)
    glow.location = (2, 13.5, 0.35)
    glow.rotation_euler = (math.radians(112), 0, 0)
    bpy.context.collection.objects.link(glow)


def build_scene():
    reset_scene()
    rock = rock_material()
    water = water_material()

    # Water plane — the whole lower half of the frame works off it
    bpy.ops.mesh.primitive_plane_add(size=240, location=(0, 40, 0))
    plane = bpy.context.object
    plane.name = "Water"
    plane.data.materials.append(water)

    # Three terrain layers: near bank, mid ridge, far ridge (sun crests this)
    make_terrain("Bank_Near", (-14, 6, -0.4), (34, 18, 1), 11.0, 3.0, 11, rock)
    make_terrain("Ridge_Mid", (18, 30, -0.5), (46, 22, 1), 17.0, 7.5, 37, rock)
    make_terrain("Ridge_Far", (0, 56, -0.5), (90, 26, 1), 26.0, 13.0, 71, rock)

    build_world()
    build_lights()

    # Camera: low over the water, 28mm, looking at the crest point
    cam_data = bpy.data.cameras.new("Camera")
    cam_data.lens = 28.0
    cam_data.sensor_width = 36.0
    cam = bpy.data.objects.new("Camera", cam_data)
    cam.location = (-4, -16, 2.4)
    bpy.context.collection.objects.link(cam)
    target = bpy.data.objects.new("CamTarget", None)
    target.location = (10, 52, 6.5)
    bpy.context.collection.objects.link(target)
    con = cam.constraints.new('TRACK_TO')
    con.target = target
    con.track_axis = 'TRACK_NEGATIVE_Z'
    con.up_axis = 'UP_Y'
    bpy.context.scene.camera = cam


def configure_render(width, height, samples):
    sc = bpy.context.scene
    sc.render.engine = 'CYCLES'
    sc.cycles.device = 'CPU'
    sc.cycles.samples = samples
    sc.cycles.use_adaptive_sampling = True
    sc.cycles.adaptive_threshold = 0.02
    sc.cycles.use_denoising = True
    sc.cycles.max_bounces = 4
    sc.render.use_persistent_data = True
    sc.render.resolution_x = width
    sc.render.resolution_y = height
    sc.render.image_settings.file_format = 'PNG'
    sc.view_settings.view_transform = 'AgX'
    sc.view_settings.look = 'AgX - Medium High Contrast'


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--preview", action="store_true")
    ap.add_argument("--render-4k", action="store_true")
    ap.add_argument("--out", default="renders")
    ap.add_argument("--samples", type=int, default=0)
    args = ap.parse_args()

    os.makedirs(args.out, exist_ok=True)
    build_scene()

    if args.preview:
        configure_render(960, 540, args.samples or 48)
        bpy.context.scene.render.filepath = os.path.join(args.out, "frontier-preview.png")
        bpy.ops.render.render(write_still=True)
        print("[render] frontier preview written")

    if args.render_4k:
        configure_render(3840, 2160, args.samples or 96)
        bpy.context.scene.render.filepath = os.path.join(args.out, "frontier-state1-4k.png")
        bpy.ops.render.render(write_still=True)
        print("[render] frontier 4K written")


if __name__ == "__main__":
    main()
