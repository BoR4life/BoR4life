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

Composition is deliberately restrained: one low silhouette ridge, a vast
still water plane, and the ray. Procedural terrain without erosion maps or
scanned displacement reads as draped cloth at any real level of detail, and
a busy alien vista is the house style of every AI/tech startup anyway (see
docs/01-art-direction.md) — the opposite of what a healthcare-education
brand needs. Restraint is the more premium, more on-brand choice here.

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

SUN_LOC = (10, 66, 5.4)           # the single light source everything keys off


def reset_scene():
    bpy.ops.wm.read_factory_settings(use_empty=True)


def _set(bsdf, key, value):
    if key in bsdf.inputs:
        bsdf.inputs[key].default_value = value


def rock_material():
    """Dark, cool basalt so the ridge reads as a clean silhouette against the
    sky rather than competing with it in value or hue."""
    mat = bpy.data.materials.new("Rock")
    mat.use_nodes = True
    bsdf = mat.node_tree.nodes["Principled BSDF"]
    _set(bsdf, "Base Color", (0.020, 0.022, 0.028, 1))
    _set(bsdf, "Roughness", 0.9)
    return mat


def water_material():
    """Near-black mirror. All its interest comes from what it reflects —
    the sky, the ray, the shoreline glow."""
    mat = bpy.data.materials.new("Water")
    mat.use_nodes = True
    bsdf = mat.node_tree.nodes["Principled BSDF"]
    _set(bsdf, "Base Color", (0.010, 0.016, 0.020, 1))
    _set(bsdf, "Roughness", 0.045)
    _set(bsdf, "Metallic", 0.9)
    return mat


def make_terrain(name, location, scale, noise_scale, height, seed,
                  material, subdivisions=180):
    """A displaced grid. Noise scale must be sized to the object's own
    footprint (scale) or the ridged-multifractal pattern reads as a field of
    shards instead of landform — this bit us once already."""
    bpy.ops.mesh.primitive_grid_add(x_subdivisions=subdivisions,
                                     y_subdivisions=subdivisions,
                                     size=1, location=location)
    obj = bpy.context.object
    obj.name = name
    obj.scale = scale
    # As above: transform_apply applies location by default, which would
    # move every terrain layer to the origin.
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)

    tex = bpy.data.textures.new(f"{name}_noise", 'MUSGRAVE')
    tex.noise_basis = 'ORIGINAL_PERLIN'
    tex.noise_scale = noise_scale
    tex.octaves = 4.0
    tex.lacunarity = 2.2
    tex.dimension_max = 1.05
    tex.musgrave_type = 'RIDGED_MULTIFRACTAL'

    mod = obj.modifiers.new("Displace", 'DISPLACE')
    mod.texture = tex
    mod.strength = height
    mod.texture_coords = 'GLOBAL'
    obj.location.x += seed * 0.001  # offset sampling per-layer

    smooth = obj.modifiers.new("Smooth", 'SMOOTH')
    smooth.iterations = 2  # enough to soften facets, not enough to erase ridges

    obj.data.materials.append(material)
    bpy.ops.object.shade_smooth()
    return obj


def build_world():
    """Night sky: a vertical gradient from a faintly lifted horizon to
    ink-900 at the zenith, with a sparse procedural starfield. Stars are
    thresholded high-frequency noise — cheap, and they read correctly in the
    water reflection too, which is where they earn their keep."""
    world = bpy.data.worlds.new("World")
    bpy.context.scene.world = world
    world.use_nodes = True
    nt = world.node_tree
    nt.nodes.clear()

    out = nt.nodes.new('ShaderNodeOutputWorld')
    bg = nt.nodes.new('ShaderNodeBackground')

    tex_co = nt.nodes.new('ShaderNodeTexCoord')
    sep = nt.nodes.new('ShaderNodeSeparateXYZ')
    sky_ramp = nt.nodes.new('ShaderNodeValToRGB')
    sky_ramp.color_ramp.elements[0].position = 0.0
    sky_ramp.color_ramp.elements[0].color = (0.050, 0.068, 0.098, 1)
    sky_ramp.color_ramp.elements[1].position = 0.40
    sky_ramp.color_ramp.elements[1].color = (*INK_900, 1)
    nt.links.new(tex_co.outputs['Generated'], sep.inputs['Vector'])
    nt.links.new(sep.outputs['Z'], sky_ramp.inputs['Fac'])

    noise = nt.nodes.new('ShaderNodeTexNoise')
    noise.inputs['Scale'].default_value = 420.0
    noise.inputs['Detail'].default_value = 0.0

    star_ramp = nt.nodes.new('ShaderNodeValToRGB')
    star_ramp.color_ramp.elements[0].position = 0.885
    star_ramp.color_ramp.elements[0].color = (0, 0, 0, 1)
    star_ramp.color_ramp.elements[1].position = 0.925
    star_ramp.color_ramp.elements[1].color = (1.0, 0.98, 0.92, 1)
    nt.links.new(noise.outputs['Fac'], star_ramp.inputs['Fac'])

    add = nt.nodes.new('ShaderNodeMixRGB')
    add.blend_type = 'ADD'
    add.inputs['Fac'].default_value = 1.0
    nt.links.new(sky_ramp.outputs['Color'], add.inputs['Color1'])
    nt.links.new(star_ramp.outputs['Color'], add.inputs['Color2'])

    nt.links.new(add.outputs['Color'], bg.inputs['Color'])
    bg.inputs['Strength'].default_value = 1.0
    nt.links.new(bg.outputs['Background'], out.inputs['Surface'])


def _glow_sphere(name, radius, location, strength, fresnel_ramp_pos=None, color=SUN_WARM):
    """A soft glow using Fresnel-driven transparency, the standard technique
    for a view-independent light bloom. This is deliberately NOT a flat
    billboard disc with a hand-rolled radial gradient — that approach was
    tried first and produced a directional lens/crescent artifact once the
    camera viewed it from any real angle, because a flat disc's "Generated"
    texture coordinates are not radially uniform once combined with a
    spherical-gradient falloff. Fresnel on an actual sphere has no such
    failure mode: it is correct from any camera position by construction.

    A radius=None ramp position means "solid emissive core" (the sun itself);
    otherwise the sphere is a transparent glow shell.
    """
    bpy.ops.mesh.primitive_uv_sphere_add(radius=radius, location=location,
                                          segments=32, ring_count=16)
    obj = bpy.context.object
    obj.name = name
    mat = bpy.data.materials.new(name)
    mat.use_nodes = True
    nt = mat.node_tree
    nt.nodes.clear()
    outn = nt.nodes.new('ShaderNodeOutputMaterial')
    em = nt.nodes.new('ShaderNodeEmission')
    em.inputs['Color'].default_value = (*color, 1)
    em.inputs['Strength'].default_value = strength

    if fresnel_ramp_pos is None:
        nt.links.new(em.outputs['Emission'], outn.inputs['Surface'])
    else:
        fres = nt.nodes.new('ShaderNodeFresnel')
        fres.inputs['IOR'].default_value = 1.05
        ramp = nt.nodes.new('ShaderNodeValToRGB')
        # Fresnel Fac is 0 facing the camera (sphere centre) and rises to 1
        # at the grazing silhouette edge. Bright core, fading to transparent
        # at the rim, is what a soft glow needs — so centre maps to opaque
        # white and the edge maps to fully transparent black.
        ramp.color_ramp.elements[0].position = 0.0
        ramp.color_ramp.elements[0].color = (1, 1, 1, 1)
        ramp.color_ramp.elements[1].position = fresnel_ramp_pos
        ramp.color_ramp.elements[1].color = (0, 0, 0, 1)
        tr = nt.nodes.new('ShaderNodeBsdfTransparent')
        mix = nt.nodes.new('ShaderNodeMixShader')
        nt.links.new(fres.outputs['Fac'], ramp.inputs['Fac'])
        nt.links.new(ramp.outputs['Color'], mix.inputs['Fac'])
        nt.links.new(tr.outputs['BSDF'], mix.inputs[1])
        nt.links.new(em.outputs['Emission'], mix.inputs[2])
        nt.links.new(mix.outputs['Shader'], outn.inputs['Surface'])
        mat.blend_method = 'BLEND'

    obj.data.materials.append(mat)
    return obj


def build_lights():
    # The first ray: a sun lamp just past the ridge, near-horizontal, warm.
    sun_data = bpy.data.lights.new("Sun", 'SUN')
    sun_data.energy = 6.0
    sun_data.color = SUN_WARM
    sun_data.angle = math.radians(0.8)
    sun = bpy.data.objects.new("Sun", sun_data)
    sun.rotation_euler = (math.radians(86), 0, math.radians(-12))
    bpy.context.collection.objects.link(sun)

    # The visible source: a small solid core plus three glow shells of
    # increasing radius and decreasing strength — a cheap, robust stand-in
    # for a compositor glare pass (Blender 5.0 dropped scene.node_tree; see
    # docs/03-3d-production-spec.md for that history).
    _glow_sphere("SunCore", 0.4, SUN_LOC, 420.0, fresnel_ramp_pos=None)
    for i, (r, strength, ramp_pos) in enumerate([
        (1.6, 20.0, 0.55),
        (3.4, 5.0, 0.40),
        (6.5, 1.1, 0.30),
    ]):
        _glow_sphere(f"SunHalo_{i}", r, SUN_LOC, strength, ramp_pos)

    # Shoreline glow: the --signal teal, low along the water using the same
    # proven Fresnel glow-sphere technique as the sun — a flat emissive
    # plane was tried first (both a hard rectangle and a procedural
    # spherical-gradient falloff on it) and neither read as an organic glow;
    # reusing the geometry that is already known to work is the reliable
    # choice here rather than debugging a second custom shader graph.
    for i, x in enumerate([-3, 2, 7]):
        # Mostly submerged (radius 0.6, centre just below the surface) so
        # only a soft cap breaks the waterline — light emanating from the
        # water, not a ball resting on top of it.
        _glow_sphere(f"ShoreGlow_{i}", 0.6, (x, 6, -0.25), 10.0, fresnel_ramp_pos=0.6,
                     color=SIGNAL)


def build_scene():
    reset_scene()
    rock = rock_material()
    water = water_material()

    # Water: deliberately vast (3000 units) so its edge never enters frame at
    # any camera position — the whole lower half of the image is this
    # surface doing reflection work.
    bpy.ops.mesh.primitive_plane_add(size=3000, location=(0, 400, 0))
    plane = bpy.context.object
    plane.name = "Water"
    plane.data.materials.append(water)

    # ONE ridge: low, wide, distant. It exists to give the ray something to
    # crest and to put a horizon line in frame. Restraint over spectacle —
    # see the module docstring.
    make_terrain("Ridge_Far", (-8, 82, -2.4), (180, 24, 1), 30.0, 6.0, 71, rock)

    build_world()
    build_lights()

    cam_data = bpy.data.cameras.new("Camera")
    cam_data.lens = 35.0
    cam_data.sensor_width = 36.0
    cam = bpy.data.objects.new("Camera", cam_data)
    cam.location = (-2, -24, 3.4)
    bpy.context.collection.objects.link(cam)
    target = bpy.data.objects.new("CamTarget", None)
    target.location = (SUN_LOC[0] - 3, SUN_LOC[1] - 8, SUN_LOC[2] - 1.0)
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
