// No Gravity port (GPL-3.0-or-later; translated in 2026 by the freegames project from realtech VR's
// No Gravity 2.0, GPL-2.0-or-later; LICENSE.md): the 3D part of a frame. The V3X engine lights the
// meshes on the CPU (V3XMesh_T2, rlx32/src/v3x_1.c: per-vertex RGB from the shade table or the
// ambient light plus the scene's lights) and the OpenGL driver draws the polygons with
// min(255, ambient / 4 + rgb * diffuse / 256) as colour (renderers/opengl/gl_v3x.cpp, SET_DIFFUSE) or
// the material's diffuse colour (SET_CONSTANT, which sends red, blue, green). This module does the
// lighting as V3X does and leaves the drawing to the screen (screen.ts) with three.js.
import * as m from '../v3x/math.ts';
import { V3X, meshOf, worldPos } from '../v3x/scene.ts';
import { type Scene, type OVI, type Mesh, type Light, V3XOBJ_MESH, V3XOBJ_LIGHT, V3XSTATE_HIDDEN, V3XSTATE_HIDDENDISPLAY } from '../v3x/vmx.ts';
import { GX } from '../gx/gx.ts';
import { files } from '../sys/sys.ts';
import { picture } from './data.ts';
import type { Picture } from '../gx/png.ts';
import { decodeFlc, type Flc } from '../gx/flc.ts';

export const LIGHT_DIRECTIONAL = 4, LIGHT_OMNI = 2, LIGHT_SPOT = 1, CAPS_RANGE = 8, CAPS_INFINITE = 0x20, CAPS_DYNAMIC = 4;
export const V3XMESH_EXCPTDYNLIGHT = 0x400;

/** the asset loader the host sets: fetches the files of a directory of the data into sys.files */
export const assets = { loadDir: async (_dir: string): Promise<void> => {} };
export async function loadEpisodeData(dir: string): Promise<void> { await assets.loadDir(dir); }

/** the textures of a scene: tex_name in the scene's directory (.png), decoded once */
export const sceneTextures = new Map<string, Picture | null>();
let sceneDir = '';
export function prepareScene(scene: Scene, dir: string): void {
  sceneDir = dir;
  sceneTextures.clear();
  for (const ORI of scene.ORI) {
    if (ORI.type !== V3XOBJ_MESH || !ORI.node) continue;
    for (const mat of (ORI.node as Mesh).material) {
      if (!(mat.info.Texturized || mat.info.Sprite) || !mat.tex_name) continue;
      const base = mat.tex_name.toLowerCase().replace(/\.[^.]*$/, '');
      if (sceneTextures.has(base)) continue;
      const path = `${dir}/${base}.png`;
      sceneTextures.set(base, files.has(path) ? picture(path) : null);
    }
  }
}
/** an animated texture (".flc" in tex_name): its frames, one frame every `speed` ms (V3XResources_Animated) */
export function flcTextureOf(texName: string): Flc | null {
  const n = texName.toLowerCase();
  if (!n.endsWith('.flc')) return null;
  const path = `${sceneDir}/${n}`;
  return files.has(path) ? decodeFlc(files.get(path)!) : null;
}
export function textureOf(texName: string): Picture | null {
  return sceneTextures.get(texName.toLowerCase().replace(/\.[^.]*$/, '')) ?? null;
}
export function releaseScene(): void { sceneTextures.clear(); }
export const currentSceneDir = (): string => sceneDir;

/** the lights of this frame: the scene's (V3XScene_LightBuild) and the game's (add_lights) */
export function buildLights(scene: Scene): void {
  V3X.Light.lights = [];
  for (const o of scene.OVI) {
    if (o.ORI?.type !== V3XOBJ_LIGHT || o.state & (V3XSTATE_HIDDEN | V3XSTATE_HIDDENDISPLAY)) continue;
    const l = o.node as Light;
    if (V3X.Light.lights.length >= 16) break;
    const tm = l.status & 2 ? V3X.Time.ms : 0;
    if (l.status & 2 && tm > l.Timer) {
      if (l.status & 1) { l.Timer = tm + l.TimeOn; l.status &= ~1; } else { l.Timer = tm + l.TimeOff; l.status |= 1; }
    }
    if (l.range === 0) l.range = V3X.Light.fogDistance;
    if (l.diminish === 0) l.diminish = 1 / 2000;
    if ((l.status & 1) === 0) V3X.Light.lights.push({ ...l, pos: Float32Array.from(l.pos), target: Float32Array.from(l.target) });
  }
  V3X.Setup.add_lights();
}

/** V3XMesh_T2 with RGB lighting: the colour of every vertex (or face, flat) of a mesh, 4 bytes each */
export function lightMesh(mesh: Mesh, out: Uint8Array): void {
  let flat = !!(mesh.flags & 0x20000);
  if (!flat && !mesh.normal) flat = true;
  else if (flat && !mesh.normal_face.length && mesh.normal) flat = false;
  if (flat && !mesh.normal_face.length) return;
  const n = flat ? mesh.numFaces : mesh.numVerts;
  const amb = V3X.Light.ambiant;
  for (let i = 0; i < n; i++) {
    if (mesh.flags & 0x800 && mesh.rgb) { out[4 * i] = mesh.rgb[4 * i]; out[4 * i + 1] = mesh.rgb[4 * i + 1]; out[4 * i + 2] = mesh.rgb[4 * i + 2]; out[4 * i + 3] = mesh.rgb[4 * i + 3]; }
    else { out[4 * i] = amb[0]; out[4 * i + 1] = amb[1]; out[4 * i + 2] = amb[2]; out[4 * i + 3] = 0; }
  }
  const M = mesh.matrix;
  const temp1 = m.vec(), v3 = m.vec(), vec = m.vec(), v2 = m.vec(), wp = m.vec();
  for (const lite of V3X.Light.lights) {
    if (lite.flags & CAPS_DYNAMIC && mesh.flags & V3XMESH_EXCPTDYNLIGHT) continue;
    const multiplier = lite.intensity;
    let invRange = 0;
    m.dif(temp1, lite.pos, m.Pos(M));
    if (lite.flags & CAPS_RANGE && !(lite.flags & CAPS_INFINITE)) invRange = 1 / lite.range;
    let ds = 0;
    if (lite.type === LIGHT_DIRECTIONAL) {
      vec.set(temp1);
      ds = m.normalize(vec, vec);
      m.applyTransposeMatrix(v3, vec, M);
    }
    if (!(lite.flags & CAPS_INFINITE) && lite.type !== LIGHT_DIRECTIONAL) ds = m.length(temp1);
    if (!(lite.flags & CAPS_INFINITE || (lite.flags & CAPS_RANGE && ds <= lite.range + mesh.radius) || !(lite.flags & CAPS_RANGE))) continue;
    const normals = flat ? mesh.normal_face : mesh.normal!;
    for (let i = 0; i < n; i++) {
      let factor = 1;
      if (!(lite.flags & CAPS_INFINITE)) {
        if (!(lite.flags & CAPS_RANGE)) {
          // dx = (vertex in camera space).z - range, factor = 1 + dx * diminish when dx < 0
          const e = mesh.vertex.length >= 3 * i + 3 ? mesh.vertex.subarray(3 * i, 3 * i + 3) : m.vec();
          worldPos(M, e, wp);
          const dx = wp[2] - lite.range;
          factor = dx < 0 ? 1 + dx * lite.diminish : 0;
        } else {
          // e walks the vertex array with the faces too when flat (as the original's loop does)
          const e = mesh.vertex.length >= 3 * i + 3 ? mesh.vertex.subarray(3 * i, 3 * i + 3) : m.vec();
          m.applyMatrixTrans(wp, e, M);
          const d = m.distance(wp, lite.pos);
          factor = d < lite.range ? 1 - d * invRange : 0;
        }
      }
      if (factor <= 0) continue;
      const a = normals.subarray(3 * i, 3 * i + 3);
      let inten = 0;
      if (lite.type === LIGHT_OMNI) {
        const e = mesh.vertex.length >= 3 * i + 3 ? mesh.vertex.subarray(3 * i, 3 * i + 3) : m.vec();
        m.dif(vec, e, temp1);
        m.normalize(vec, vec);
        m.applyTransposeMatrix(v2, vec, M);
        inten = -m.dot(v2, a);
      } else if (lite.type === LIGHT_DIRECTIONAL) inten = m.dot(v3, a);
      else if (lite.type === 3) inten = 1;
      if (inten > 0) {
        inten *= multiplier * factor;
        if (inten > multiplier) inten = multiplier;
        const k = Math.trunc(inten) >>> 0;
        const r = out[4 * i] + ((k * lite.color[0]) >>> 8), g = out[4 * i + 1] + ((k * lite.color[1]) >>> 8), b = out[4 * i + 2] + ((k * lite.color[2]) >>> 8);
        out[4 * i] = r < 255 ? r : 255; out[4 * i + 1] = g < 255 ? g : 255; out[4 * i + 2] = b < 255 ? b : 255; out[4 * i + 3] = 0;
      }
    }
  }
}

/** a 3D view of this frame: the scene seen through camera (the main camera when null), only one object (and its children) when only */
export function renderView(view: { xmin: number; ymin: number; xmax: number; ymax: number }, camera: Float32Array | null, only: OVI | null): void {
  // V3XViewport_Setup for the view: the projection centre and the focal (scaled to the view's height)
  const main = !camera;
  const cx = main ? V3X.ViewPort.center[0] : (view.xmax + view.xmin) >> 1;
  const cy = main ? V3X.ViewPort.center[1] : (view.ymax + view.ymin) >> 1;
  const F = main ? V3X.ViewPort.Focal : Math.fround((V3X.Camera.focal * (view.ymin - view.ymax)) / 480);
  GX.commands.push({ k: 'v', view, camera: Float32Array.from(camera ?? V3X.Camera.M), focal: F, cx, cy, fill: main ? null : 0, only });
}

/** V3XMesh_Cull's part the game reads: CULLEDOFR (too small on screen; the radar ignores it) and CULLED */
export function cullObjects(scene: Scene): void {
  for (const o of V3X.objects) {
    if (o.ORI?.type !== V3XOBJ_MESH || o.state & V3XSTATE_HIDDENDISPLAY || !o.ORI.node) continue;
    const mesh = meshOf(o);
    const radius = Math.fround(o.ORI.global_rayon * mesh.scale * 1.1);
    if (radius === 0) continue;
    const c = m.vec();
    worldPos(mesh.matrix, o.ORI.global_center, c);
    c[2] = -c[2];
    o.distance = c[2];
    if (c[2]) {
      const ray2 = (V3X.ViewPort.Focal * radius) / c[2];
      if (Math.abs(ray2) < V3X.ViewPort.minVisibleRadius * mesh.numFaces) { o.state |= 0x10 | 0x8; continue; }
    }
    if (o.state & 0x400) continue;
    // frustum: behind the camera or beyond the far plane
    if (c[2] + radius < -V3X.Clip.Near || c[2] - radius > -V3X.Clip.Far) o.state |= 0x8;
  }
  void scene;
}
