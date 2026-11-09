// drawing.cpp of HyperRogue 13.1o: rendering shapes (dqi_draw), the queue of shapes to render (ptds).
// (C) Zeno Rogue, GPL-2.0-or-later; TypeScript port (stage 2, package D1; PORTING-STAGE2.md).
//
// The non-GL path, as the drawing oracle sees it (svg::render sets vid.usingGL = false): the queue, its sorting
// by PPR, dqi_poly::draw with the projection (applymodel), clipping behind the disk, two-sided and inverse
// polygons, glcoords (floats: Float32Array(4) vertices) and coords_to_poly (int pixels), then svg:: (when
// svg::in) or the SDL_gfx calls (src/sdlgfx.ts on a canvas). Left out: the GL renderer (gldraw, glflush's
// vertex batches, MINIMIZE_GL_CALLS is 0 in the desktop build), textures (CAP_TEXTURE's drawTexturedTriangle),
// ODS/VR, the s2xe / stretch renderers and write_in_space (GL only); branches for spherical and other models
// keep their runtime tests and call into hypgraph.ts / models.ts.
//
// Names: the structs are classes (dqi_poly, dqi_line, dqi_string, dqi_circle, dqi_action); `queuea<T>(prio)`
// is `queuea(new T(), prio)`. Overloads: queuestr(int x, int y, ...) keeps the name; queuestr(shiftpoint, ...)
// is queuestr_sp, queuestr(shiftmatrix, ...) is queuestr_V; queuecircle(int x, ...) keeps the name,
// queuecircle(shiftmatrix, ...) is queuecircle_V. The by-reference out-parameters of getcoord0 are returned.
// polyi is a file-local int that the svg branch of dqi_poly::draw reads before coords_to_poly sets it (the
// original's order, kept). flagtype values of the polygons (POLY_*) are numbers (bits 0..31, as hpcshape.flags).
import { G, pconf } from './globals.ts';
import type { fontdata } from './basegraph.ts';
import { among, isize, PPR, OUTLINE_NONE, NotPorted, callhooks, callhandlers } from './hyper.ts';
import { fround, std_sort } from './cpp.ts';
import {
  sphere, hyperbolic, euclid, GDIM, LDIM, MDIM, gproduct, nonisotropic, sl2, sol,
  mdDisk, mdBand, mdPolygonal, mdEquidistant, mdEquiarea, mdHyperboloid, mdHemisphere,
  mdBandEquidistant, mdBandEquiarea, mdSinusoidal, mdTwoPoint, mdFisheye, mdJoukowsky, mdJoukowskyInverted,
  mdRotatedHyperboles, mdSpiral, mdPerspective, mdCentralInversion, mdGeodesic, mdMollweide, mdCollignon, mdAxial,
  mdMiller, mdRetroLittrow, mdRetroHammer, mdLiePerspective, mdRelPerspective, mdConformalSquare, mdPolar,
  mdPixel, mdHyperboloidFlat, mdPolynomial,
  type eModel,
} from './classes.ts';
import {
  type hyperpoint, type transmatrix, type shiftpoint, type shiftmatrix, Id, C0, Hypc, hpt, tmulh, tmul, smulh,
  shiftless, shiftless_t, midz, mid, zlevel, sqhypot_d, hypot_d, det, det2, intval, xpush0, ypush, tC0, tC0_sm,
  rgpushxto0, asign, xcross, lerp, normalize, unshift, unshift_sm, cspin, cspin90, signum, hdiv, hadd, hmul,
  hsub, inverse_exp, deg, lp_apply,
} from './hyperpoint.ts';
import { ilerp, round_nearest } from './util.ts';
import type { glvertex, hpcshape, basic_textureinfo } from './geometry.ts';
import { glhr_pointtogl, glhr_gltopoint, glhr_makevertex } from './glhr.ts';
import { gradient, darkened, apply_neon_color, eNeon, magentize, monochromatize } from './colors.ts';
import {
  applymodel, cone_side, invalid_point_sp, point_behind, signed_sqrt, lie_log, rel_log,
} from './hypgraph.ts';
import {
  mdBandAny, mdAzimuthalEqui, models_get_broken_coord, models_scr_to_ori, models_is_perspective,
} from './models.ts';
import { reset_projection, display_data_separate_eyes, display_data_eyewidth, display_data_set_all, get_shader_flags, drawCircle, displayfrSP } from './basegraph.ts';
import { svg_polygon, svg_text, svg_circle } from './screenshot.ts';
import { filledPolygonColorI, polylineColor, aapolylineColor, sdl_srend } from './sdlgfx.ts';
import { in_s2xe } from './nonisotropic.ts';

// flagtype POLY_* (static constexpr flagtype in drawing.cpp's HDR part)
export const POLY_DRAWLINES = 1;            // draw the lines
export const POLY_DRAWAREA = 2;             // draw the area
export const POLY_INVERSE = 4;              // draw the inverse -- useful in stereographic projection
export const POLY_ISSIDE = 8;               // never draw in inverse
export const POLY_BEHIND = 16;              // there are points behind the camera
export const POLY_TOOLARGE = 32;            // some coordinates are too large -- best not to draw to avoid glitches
export const POLY_INFRONT = 64;             // on the sphere (orthogonal projection), do not draw without any points in front
export const POLY_HASWALLS = 128;           // floor shapes which have their sidewalls
export const POLY_PLAIN = 256;              // plain floors
export const POLY_FULL = 512;               // full floors
export const POLY_HASSHADOW = 1024;         // floor shapes which have their shadows, or can use shFloorShadow
export const POLY_GP = 2048;                // Goldberg shapes
export const POLY_VCONVEX = 4096;           // Convex shape (vertex)
export const POLY_CCONVEX = 8192;           // Convex shape (central)
export const POLY_CENTERIN = 16384;         // new system of side checking
export const POLY_FORCEWIDE = 1 << 15;      // force wide lines
export const POLY_NOTINFRONT = 1 << 16;     // points not in front
export const POLY_NIF_ERROR = 1 << 17;      // points moved to the outline cross the image, disable
export const POLY_BADCENTERIN = 1 << 18;    // new system of side checking
export const POLY_PRECISE_WIDE = 1 << 19;   // precise width calculation
export const POLY_FORCE_INVERTED = 1 << 20; // force inverted
export const POLY_ALWAYS_IN = 1 << 21;      // always draw this
export const POLY_TRIANGLES = 1 << 22;      // made of TRIANGLES, not TRIANGLE_FAN
export const POLY_INTENSE = 1 << 23;        // extra intense colors
export const POLY_DEBUG = 1 << 24;          // debug this shape
export const POLY_PRINTABLE = 1 << 25;      // these walls are printable
export const POLY_FAT = 1 << 26;            // fatten this model in WRL export (used for Rug)
export const POLY_SHADE_TEXTURE = 1 << 27;  // texture has 'z' coordinate for shading
export const POLY_ONE_LEVEL = 1 << 28;      // only one level of the universal cover in SL(2,R)
export const POLY_APEIROGONAL = 1 << 29;    // only vertices indexed up to she are drawn as the boundary
export const POLY_NO_FOG = 1 << 30;         // disable fog for this
export const POLY_FORCE_DEPTH = 1 << 31;    // always depth test (Flag(31): negative as an int32; only tested with &)

/** #define OUTLINE_DEFAULT ((bordcolor << 8) + 0xFF) */
export const OUTLINE_DEFAULT = (): number => ((G.bordcolor << 8) + 0xFF) >>> 0;
/** #define OUTLINE_FORE ((forecolor << 8) + 0xFF) */
export const OUTLINE_FORE = (): number => ((G.forecolor << 8) + 0xFF) >>> 0;
/** #define OUTLINE_BACK ((backcolor << 8) + 0xFF) */
export const OUTLINE_BACK = (): number => ((G.backcolor << 8) + 0xFF) >>> 0;

/** #define POLYMAX 60000 */
export const POLYMAX = 60000;
/** #define BEHIND_LIMIT 1e-6 (hyper.h) */
export const BEHIND_LIMIT = 1e-6;

/** \brief A graphical element that can be drawn. Objects are not drawn immediately but rather queued. */
export abstract class drawqueueitem {
  /** \brief The higher the priority, the earlier we should draw this object. */
  prio: PPR = 0;
  /** \brief Color of this object. */
  color = 0;
  /** \brief Some priorities need extra sorting inside the given class. */
  subprio = 0;
  /** \brief Draw the object. */
  abstract draw(): void;
  /** \brief Draw the object as background. */
  draw_back(): void { }
  abstract outline_group(): number;
  as_poly(): dqi_poly | null { return null; }
}

/** \brief Drawqueueitem used to draw polygons. The majority of drawqueueitems fall here. */
export class dqi_poly extends drawqueueitem {
  /** \brief matrix used to transform the model */
  V: shiftmatrix = shiftless_t(Id);
  /** \brief a vector of GL vertices where the model is stored */
  tab: glvertex[] = [];
  /** \brief the where does the model start */
  offset = 0;
  /** \brief how many vertices in the model */
  cnt = 0;
  /** cnt for POLY_APEIROGONAL */
  apeiro_cnt = 0;
  /** \brief the offset in the texture vertices */
  offset_texture = 0;
  /** \brief outline color */
  outline = 0;
  /** \brief width of boundary lines */
  linewidth = 0;
  /** \brief various flags */
  flags = 0;
  /** \brief Texture data for textured polygons. Requires POLY_TRIANGLES flag */
  tinf: basic_textureinfo | null = null;
  /** \brief used to find the correct side to draw in spherical geometries, and also to sort sidewalls */
  intester: hyperpoint = [0, 0, 0, 0];
  /** \brief temporarily cached data (float) */
  cache = 0;
  draw(): void { dqi_poly_draw(this); }
  draw_back(): void {
    const dvo = this.outline, dvc = this.color;
    this.outline = darken_color(this.outline, true);
    this.color = darken_color(this.color, false);
    try { this.draw(); } finally { this.outline = dvo; this.color = dvc; }
  }
  outline_group(): number { return this.outline; }
  as_poly(): dqi_poly | null { return this; }
  /** the struct copy (`dqi_poly p = p0`) */
  copy(): dqi_poly {
    const p = new dqi_poly();
    p.prio = this.prio; p.color = this.color; p.subprio = this.subprio;
    p.V = { T: this.V.T, shift: this.V.shift }; p.tab = this.tab; p.offset = this.offset; p.cnt = this.cnt;
    p.apeiro_cnt = this.apeiro_cnt; p.offset_texture = this.offset_texture; p.outline = this.outline;
    p.linewidth = this.linewidth; p.flags = this.flags; p.tinf = this.tinf; p.intester = this.intester;
    p.cache = this.cache;
    return p;
  }
}

/** \brief Drawqueueitem used to draw lines */
export class dqi_line extends drawqueueitem {
  /** \brief starting and ending point */
  H1: shiftpoint = shiftless(hpt(0, 0, 0, 0));
  H2: shiftpoint = shiftless(hpt(0, 0, 0, 0));
  /** \brief how accurately to render the line */
  prf = 0;
  /** \brief width of this line */
  width = 0;
  draw(): void {
    const d = G.vid.linewidth;
    G.vid.linewidth = this.width;
    try { prettyline(this.H1.h, unshift(this.H2, this.H1.shift), this.H1.shift, this.color, this.prf, 0, this.prio); }
    finally { G.vid.linewidth = d; }
  }
  draw_back(): void {
    const dvc = this.color;
    this.color = darken_color(this.color, true);
    try { this.draw(); } finally { this.color = dvc; }
  }
  outline_group(): number { return this.color; }
}

/** \brief Drawqueueitem used to draw strings, using sccreen coodinates */
export class dqi_string extends drawqueueitem {
  /** \brief text */
  str = '';
  /** onscreen position */
  x = 0; y = 0;
  /** shift in anaglyph mode */
  shift = 0;
  /** font size */
  size = 0;
  /** frame color */
  frame = 0;
  /** alignment (0-8-16) */
  align = 0;
  /** current font (fontdata*) */
  font: fontdata | null = null;
  draw(): void {
    const df = G.cfont;
    G.cfont = this.font;
    try {
      // CAP_SVG
      if (G.svg_in) {
        svg_text(this.x, this.y, this.size, this.str, this.frame !== 0, this.color, this.align);
        return;
      }
      // !ISMOBILE
      const fr = this.frame & 255;
      displayfrSP(this.x, this.y, this.shift, fr, this.size, this.str, this.color, this.align, this.frame >> 8);
    }
    finally { G.cfont = df; }
  }
  outline_group(): number { return 1; }
}

/** Drawqueueitem used to draw circles, using screen coordinates */
export class dqi_circle extends drawqueueitem {
  /** \brief onscreen position */
  x = 0; y = 0;
  /** \brief circle size */
  size = 0;
  /** \brief which color should it be filled with */
  fillcolor = 0;
  /** \brief width of the circle */
  linewidth = 0;
  draw(): void {
    // CAP_SVG
    if (G.svg_in) {
      svg_circle(this.x, this.y, this.size, this.color, this.fillcolor, this.linewidth);
    }
    else
      drawCircle(this.x, this.y, this.size, this.color, this.fillcolor);
  }
  outline_group(): number { return 2; }
}

/** \brief Perform an arbitrary action. May temporarily change the model, etc. */
export class dqi_action extends drawqueueitem {
  action: () => void;
  constructor(a: () => void) { super(); this.action = a; }
  draw(): void { this.action(); }
  outline_group(): number { return 2; }
}

// hyperpoint vr_sphere_center (VR only)

let fatborder = false;
/** (fatborder is file-local; nothing sets it in 13.1o) */
export function set_fatborder(b: boolean): void { fatborder = b; }

/** glflush(): the GL batches (MINIMIZE_GL_CALLS is 0) and the GL text vertices; nothing to do without GL */
export function glflush(): void { }

// CAP_POLY
let polyi = 0;
let poly_flags = 0;

/** the vertices add1 fills (performance, added after stage 2): glcoords[i] of a polygon is glcoords_pool[i], a
 *  Float32Array(4) reused by every polygon instead of a new one per vertex. The stores round to float as
 *  glhr_pointtogl's; nothing keeps a glcoords vertex beyond the polygon being drawn (dqi_poly::draw empties
 *  glcoords first; cyl_adjust and the inverse fill push their own new vertices). */
const glcoords_pool: glvertex[] = [];

function add1(H: hyperpoint): void {
  const glcoords = G.glcoords, i = glcoords.length;
  let v = glcoords_pool[i];
  if (v === undefined) v = glcoords_pool[i] = new Float32Array(4);
  // glhr_pointtogl(H)
  v[0] = H[0]; v[1] = H[1]; v[2] = H[2];
  v[3] = (MDIM() === 4) ? H[3] : 1;
  glcoords.push(v);
}

function axial_sign(): number {
  return ((G.axial_x ^ G.axial_y) & 1) ? -1 : 1;
}

function is_behind(H: hyperpoint): boolean {
  const pmodel = pconf().model;
  if (pmodel === mdAxial && sphere()) return axial_sign() * H[2] <= BEHIND_LIMIT;
  if (G.in_vr_sphere) return false;
  return pmodel === mdDisk && (hyperbolic() ? H[2] >= 0 : true) && (nonisotropic() ? false : pconf().alpha + H[2] <= BEHIND_LIMIT);
}

function be_just_on_view(H1: hyperpoint, H2: hyperpoint): hyperpoint {
  // H1[2] * t + H2[2] * (1-t) == BEHIND_LIMIT - pconf.alpha
  // H2[2]- BEHIND_LIMIT + pconf.alpha = t * (H2[2] - H1[2])
  const t = (axial_sign() * H2[2] - BEHIND_LIMIT + (pconf().model === mdAxial ? 0 : pconf().alpha)) / (H2[2] - H1[2]) * axial_sign();
  return hadd(hmul(H1, t), hmul(H2, 1 - t));
}

let last_infront = false;

function nif_error_in(x1: number, y1: number, x2: number, y2: number): boolean {
  return Math.pow(x1 * x2 + y2 * y2, 2) < (x1 * x1 + y1 * y1) * (x2 * x2 + y2 * y2) * .5;
}

let knowgood = false;
let goodpoint: hyperpoint = [0, 0, 0, 0];
const tofix: [number, hyperpoint][] = [];

export function two_sided_model(): boolean {
  const in_vr = false; // CAP_VR: vrhr::rendering() (not in stage 2)
  const i = callhandlers(0, G.hooks_two_sided_model); if (i) return i > 0;
  if (GDIM() === 3) return false;
  if (G.in_vr_sphere) return true;
  const pmodel = pconf().model;
  if (pmodel === mdHemisphere || pmodel === mdHyperboloid) return !in_vr;
  // if(pmodel == mdHemisphere) return true;
  if (pmodel === mdDisk) return sphere() || (hyperbolic() && pconf().alpha < 0 && pconf().alpha > -1);
  if (pmodel === mdRetroLittrow) return sphere();
  if (pmodel === mdRetroHammer) return sphere();
  if (pmodel === mdRotatedHyperboles) return true;
  if (pmodel === mdSpiral && pconf().spiral_cone < 360) return true;
  return false;
}

export function get_side(H: hyperpoint): number {
  const i = callhandlers(0, G.hooks_get_side, H);
  if (i) return i;
  // CAP_VR: in_vr_sphere (VR only)
  const pmodel = pconf().model;
  if (pmodel === mdDisk && sphere()) {
    const curnorm = H[0] * H[0] + H[1] * H[1] + H[2] * H[2];
    const horizon = curnorm / pconf().alpha;
    return (H[2] <= -horizon) ? -1 : 1;
  }
  if (pmodel === mdDisk && hyperbolic() && pconf().alpha < 0 && pconf().alpha > -1) {
    return (H[2] * (H[2] + pconf().alpha) < sqhypot_d(2, H)) ? -1 : 1;
  }
  if (pmodel === mdRetroLittrow && sphere()) {
    return H[2] >= 0 ? 1 : -1;
  }
  if (pmodel === mdRetroHammer && sphere()) {
    return H[2] >= 0 ? 1 : -1;
  }
  if (pmodel === mdRotatedHyperboles)
    return H[1] > 0 ? -1 : 1;
  if (pmodel === mdHyperboloid) {
    let H1 = H; if (sphere() && pconf().small_hyperboloid) H1 = mid(H, C0());
    return det2(tmul(tmul(pconf().ball(), cspin90(2, 1)), rgpushxto0(H1))) > 0 ? 1 : -1;
  }
  if (pmodel === mdHyperboloidFlat && sphere())
    return H[2] >= 0 ? 1 : -1;
  if (pmodel === mdHemisphere && !sphere()) {
    const res: hyperpoint = [0, 0, 0, 0];
    applymodel(shiftless(H), res);
    return res[2] < 0 ? 1 : -1;
  }
  if (pmodel === mdHemisphere && sphere()) {
    // dynamicval<geometryinfo1> g(cginf.g, giHyperb2): spherical geometries are not in stage 2
    throw new NotPorted('get_side: mdHemisphere on the sphere'); // STAGE2-STUB (sphere)
  }
  if (pmodel === mdSpiral && pconf().spiral_cone < 360) {
    return cone_side(shiftless(H));
  }
  return 0;
}

export function correct_side(H: hyperpoint): boolean {
  return get_side(H) === G.spherespecial;
}

let Hlast: hyperpoint = [0, 0, 0, 0];

function fixpoint(idx: number, H: hyperpoint): void {
  let bad = H, good = goodpoint;

  for (let i = 0; i < 10; i++) {
    const m = midz(bad, good);
    if (correct_side(m))
      good = m;
    else
      bad = m;
  }
  const Hscr: hyperpoint = [0, 0, 0, 0];
  applymodel(shiftless(good), Hscr);
  // CAP_VR: vrhr::rendering() (not in stage 2)
  const r = G.current_display.radius;
  G.glcoords[idx] = glhr_makevertex(Hscr[0] * r, Hscr[1] * r * pconf().stretch, Hscr[2] * r);
}

function addpoint(H: shiftpoint): void {
  if (true) {
    let z = G.current_display.radius;
    // if(pconf.alpha + H[2] <= BEHIND_LIMIT && pmodel == mdDisk) poly_flags |= POLY_BEHIND;

    // CAP_VR: if(vrhr::rendering()) z = 1;

    if (G.spherespecial) {
      const H0 = H.h;
      if (correct_side(H0)) {
        poly_flags |= POLY_INFRONT; last_infront = false;
        if (!knowgood || (G.spherespecial > 0 ? H.h[2] > goodpoint[2] : H.h[2] < goodpoint[2])) { goodpoint = H0; knowgood = true; }
      }
      else if (sphere() && (poly_flags & POLY_ISSIDE)) {
        const curnorm = H.h[0] * H.h[0] + H.h[1] * H.h[1] + H.h[2] * H.h[2];
        const horizon = curnorm / pconf().alpha;
        poly_flags |= POLY_NOTINFRONT;
        const back = G.glcoords[G.glcoords.length - 1];
        if (last_infront && nif_error_in(back[0], back[1], H.h[0], H.h[1]))
          poly_flags |= POLY_NIF_ERROR;

        last_infront = true;

        z *=
          (Math.sqrt(curnorm - horizon * horizon) / (pconf().alpha - horizon)) /
          (Math.sqrt(curnorm - H.h[2] * H.h[2]) / (pconf().alpha + H.h[2]));
      }
      else {
        poly_flags |= POLY_NOTINFRONT;
        tofix.push([G.glcoords.length, H0]);
        add1(H0);
        return;
      }
    }
    let Hscr: hyperpoint = [0, 0, 0, 0];
    applymodel(H, Hscr);
    if (sphere() && pconf().model === mdSpiral) {
      if (isize(G.glcoords)) {
        const Hscr1: hyperpoint = [0, 0, 0, 0];
        const H1: shiftpoint = { h: H.h, shift: H.shift }; H1.shift += 2 * Math.PI;
        applymodel(H1, Hscr1);
        if (hypot_d(2, hsub(Hlast, Hscr1)) < hypot_d(2, hsub(Hlast, Hscr))) { Hscr = [...Hscr1]; }
        H1.shift -= 2 * 2 * Math.PI;
        applymodel(H1, Hscr1);
        if (hypot_d(2, hsub(Hlast, Hscr1)) < hypot_d(2, hsub(Hlast, Hscr))) { Hscr = [...Hscr1]; }
      }
      Hlast = Hscr;
    }
    // CAP_VR
    if (GDIM() === 2) {
      for (let i = 0; i < 3; i++) Hscr[i] *= z;
      Hscr[1] *= pconf().stretch;
    }
    else {
      Hscr[0] *= z;
      Hscr[1] *= z * pconf().stretch;
      Hscr[2] = 1 - 2 * (-Hscr[2] - pconf().clip_min) / (pconf().clip_max - pconf().clip_min);
    }
    add1(Hscr);
  }
}

function coords_to_poly(): void {
  const glcoords = G.glcoords, dd = G.current_display;
  polyi = isize(glcoords);
  const sep = display_data_separate_eyes(dd);
  for (let i = 0; i < polyi; i++) {
    if (!sep) glcoords[i][2] = 0;

    // int = int + float - float: the sum is computed in float (xcenter converts to float), then truncated
    G.polyx[i] = Math.trunc(fround(fround(dd.xcenter + glcoords[i][0]) - glcoords[i][2]));
    G.polyxr[i] = Math.trunc(fround(fround(dd.xcenter + glcoords[i][0]) + glcoords[i][2]));
    G.polyy[i] = Math.trunc(fround(dd.ycenter + glcoords[i][1]));
  }
}

function behind3(h: shiftpoint): boolean {
  const pmodel = pconf().model;
  if (pmodel === mdGeodesic)
    return lp_apply(inverse_exp(h))[2] < 0;
  if (pmodel === mdLiePerspective)
    return lp_apply(lie_log(h))[2] < 0;
  // MAXMDIM >= 4
  if (pmodel === mdRelPerspective)
    return lp_apply(rel_log(h, false))[2] < 0;
  return h.h[2] < 0;
}

/** bool in_perspective() (graph.cpp: models::is_perspective(pconf.model)) */
function in_perspective(): boolean { return models_is_perspective(pconf().model); }

/** SF_SEMIDIRECT (shaders.cpp): get_shader_flags() is 0 without GL, so the value does not matter here */
const SF_SEMIDIRECT = 1n << 12n;

/** addpoly's loop (from `let last = ...` on) for pconf.model == mdDisk in a 2D geometry that is neither a product
 *  nor nonisotropic, with models::camera_straight and no spherespecial (performance, added after stage 2): the
 *  vertex V * tab[i] (tmulh: z[a] = 0, then += T[a][b] * h[b] for b < MDIM), is_behind, and addpoint's
 *  applymodel (apply_other_model's mdDisk branch with get_tz), the scaling by the radius and stretch and add1,
 *  inlined: the same operations in the same order, so the same floats. knowgood stays false (it is set only
 *  with spherespecial), so the tofix pass of addpoly does not apply. */
function addpoly_disk(V: shiftmatrix, tab: glvertex[], ofs: number, cnt: number): void {
  const dd = G.current_display, pc = pconf();
  const alpha = pc.alpha, radius = dd.radius, stretch = pc.stretch, ipd = G.vid.ipd;
  const eye = G.vid.xres * display_data_eyewidth(dd) / 2 / dd.radius;
  const T = V.T, n = MDIM(), four = n === 4;
  if (n !== 3 && n !== 4) throw new Error('addpoly_disk: MDIM');
  const T0 = T[0], T1 = T[1], T2 = T[2], T3 = T[3];
  const hyp = hyperbolic(), in_vr_sphere = G.in_vr_sphere;
  const glcoords = G.glcoords;
  let l0 = 0, l1 = 0, l2 = 0, l3 = 0;
  let last_behind = false;
  let enter: hyperpoint = C0();
  let firstleave: hyperpoint = [0, 0, 0, 0];
  let start_behind = 0;
  for (let i = ofs; i < ofs + cnt; i++) {
    const t = tab[i];
    const t0 = t[0], t1 = t[1], t2 = t[2];
    // tmulh(V.T, glhr_gltopoint(t))
    let z0 = 0, z1 = 0, z2 = 0, z3 = 0;
    if (four) {
      const t3 = t[3];
      z0 += T0[0] * t0; z0 += T0[1] * t1; z0 += T0[2] * t2; z0 += T0[3] * t3;
      z1 += T1[0] * t0; z1 += T1[1] * t1; z1 += T1[2] * t2; z1 += T1[3] * t3;
      z2 += T2[0] * t0; z2 += T2[1] * t1; z2 += T2[2] * t2; z2 += T2[3] * t3;
      z3 += T3[0] * t0; z3 += T3[1] * t1; z3 += T3[2] * t2; z3 += T3[3] * t3;
    }
    else {
      z0 += T0[0] * t0; z0 += T0[1] * t1; z0 += T0[2] * t2;
      z1 += T1[0] * t0; z1 += T1[1] * t1; z1 += T1[2] * t2;
      z2 += T2[0] * t0; z2 += T2[1] * t1; z2 += T2[2] * t2;
    }
    // is_behind (mdDisk, not nonisotropic)
    const behind = !in_vr_sphere && (hyp ? z2 >= 0 : true) && alpha + z2 <= BEHIND_LIMIT;
    if (i === ofs) {
      last_behind = behind;
      start_behind = last_behind ? 1 : 0;
    }
    else if (behind !== last_behind) {
      const h = be_just_on_view([l0, l1, l2, l3], [z0, z1, z2, z3]);
      if (start_behind === 1) { start_behind = 2; firstleave = h; }
      if (!last_behind) enter = h;
      else if (h[0] * enter[0] + h[1] * enter[1] < 0) poly_flags |= POLY_BEHIND;
      addpoint(shiftless(h));
      last_behind = !last_behind;
    }
    if (!last_behind) {
      // addpoint: applymodel (get_tz, H[i] / tz, the eye shift), Hscr[i] *= z for i < 3, Hscr[1] *= stretch, add1
      let tz = alpha + (four ? z3 : z2);
      if (tz < BEHIND_LIMIT && tz > -BEHIND_LIMIT) tz = BEHIND_LIMIT;
      const k = glcoords.length;
      let v = glcoords_pool[k];
      if (v === undefined) v = glcoords_pool[k] = new Float32Array(4);
      v[0] = z0 / tz * radius;
      v[1] = z1 / tz * radius * stretch;
      v[2] = (eye - ipd / tz / 2) * radius;
      v[3] = 1;
      glcoords.push(v);
    }
    l0 = z0; l1 = z1; l2 = z2; l3 = z3;
  }
  if (start_behind === 2) {
    if (firstleave[0] * enter[0] + firstleave[1] * enter[1] < 0) poly_flags |= POLY_BEHIND;
    else addpoint(shiftless(firstleave));
  }
}

function addpoly(V: shiftmatrix, tab: glvertex[], ofs: number, cnt: number): void {
  if (pconf().model === mdPixel) {
    for (let i = ofs; i < ofs + cnt; i++) {
      let h = glhr_gltopoint(tab[i]);
      // MAXMDIM >= 4
      h[3] = 1;
      h = tmulh(V.T, h);
      add1(h);
    }
    return;
  }
  tofix.length = 0; knowgood = false;
  if (in_perspective()) {
    if (get_shader_flags() & SF_SEMIDIRECT) {
      const d = G.computing_semidirect;
      G.computing_semidirect = true;
      try {
        for (let i = ofs; i < ofs + cnt; i++) {
          const Hscr: hyperpoint = [0, 0, 0, 0];
          applymodel(smulh(V, glhr_gltopoint(tab[i])), Hscr);
          add1(Hscr);
        }
      } finally { G.computing_semidirect = d; }
    }
    else if (poly_flags & POLY_TRIANGLES) {
      for (let i = ofs; i < ofs + cnt; i += 3) {
        const h0 = smulh(V, glhr_gltopoint(tab[i]));
        const h1 = smulh(V, glhr_gltopoint(tab[i + 1]));
        const h2 = smulh(V, glhr_gltopoint(tab[i + 2]));
        if (!behind3(h0) && !behind3(h1) && !behind3(h2)) {
          addpoint(h0); addpoint(h1); addpoint(h2);
        }
      }
    }
    else {
      for (let i = ofs; i < ofs + cnt; i++) {
        const h = smulh(V, glhr_gltopoint(tab[i]));
        if (!behind3(h)) addpoint(h);
      }
    }
    return;
  }
  // the common case (an mdDisk projection of a 2D non-product geometry, straight camera, no spherespecial):
  // addpoly_disk, the same computation without the generic calls and allocations
  if (pconf().model === mdDisk && !G.spherespecial && GDIM() === 2 && G.models_camera_straight && !gproduct() &&
    !nonisotropic()) {
    addpoly_disk(V, tab, ofs, cnt);
    return;
  }
  let last = smulh(V, glhr_gltopoint(tab[ofs]));
  let last_behind = is_behind(last.h);
  if (!last_behind) addpoint(last);
  let enter: hyperpoint = C0();
  let firstleave: hyperpoint = [0, 0, 0, 0];
  let start_behind = last_behind ? 1 : 0;
  for (let i = ofs + 1; i < ofs + cnt; i++) {
    const curr = smulh(V, glhr_gltopoint(tab[i]));
    if (is_behind(curr.h) !== last_behind) {
      const h = be_just_on_view(last.h, curr.h);
      if (start_behind === 1) { start_behind = 2; firstleave = h; }
      if (!last_behind) enter = h;
      else if (h[0] * enter[0] + h[1] * enter[1] < 0) poly_flags |= POLY_BEHIND;
      addpoint(shiftless(h));
      last_behind = !last_behind;
    }
    if (!last_behind) addpoint(curr);
    last = curr;
  }
  if (start_behind === 2) {
    if (firstleave[0] * enter[0] + firstleave[1] * enter[1] < 0) poly_flags |= POLY_BEHIND;
    else addpoint(shiftless(firstleave));
  }
  if (knowgood && isize(tofix)) {

    if (true) {
      let Hx = tmulh(V.T, C0()), Hy = goodpoint;
      for (let i = 0; i < 20; i++) {
        const m = midz(Hx, Hy);
        if (correct_side(m)) Hy = m;
        else Hx = m;
      }
      goodpoint = midz(Hy, goodpoint);
    }

    for (const p of tofix)
      fixpoint(p[0], p[1]);

    if (sphere() && among(pconf().model, mdHemisphere, mdHyperboloid) && pconf().small_hyperboloid) {
      let left = false, right = false;
      for (const h of G.glcoords) {
        const h1: hyperpoint = [0, 0, 0, 0]; applymodel(shiftless(glhr_gltopoint(h)), h1);
        if (h1[0] < -0) left = true;
        if (h1[0] > +0) right = true;
      }
      if (left && right) poly_flags |= POLY_NIF_ERROR;
    }
  }
}

// CAP_SDLGFX: aapolylineColor, polylineColor, filledPolygonColorI are in sdlgfx.ts (the shim on the canvas)
// CAP_TEXTURE: drawTexturedTriangle (textures: not in stage 2)

// !CAP_GL: get_shader_flags() { return 0; } (basegraph.ts)

export function scale_at(T: shiftmatrix): number {
  const pmodel = pconf().model;
  if (GDIM() === 3 && pmodel === mdPerspective) {
    let z = (tC0(unshift_sm(T)))[2];
    if (z === 0) return 1;
    z = 1 / Math.abs(z);
    if (z > 10) return 10;
    return z;
  }
  if (sol()) return 1;
  const h1: hyperpoint = [0, 0, 0, 0], h2: hyperpoint = [0, 0, 0, 0], h3: hyperpoint = [0, 0, 0, 0];
  applymodel(tC0_sm(T), h1);
  applymodel(smulh(T, xpush0(.01)), h2);
  applymodel(smulh(T, tmulh(ypush(.01), C0())), h3);
  if (mdBandAny()) {
    let x2 = 2;
    if (pmodel === mdBandEquiarea) x2 /= 2;
    const x4 = 2 * x2;
    if (h2[0] > h1[0] + x2) h2[0] -= x4;
    if (h2[0] < h1[0] - x2) h2[0] += x4;
    if (h3[0] > h1[0] + x2) h3[0] -= x4;
    if (h3[0] < h1[0] - x2) h3[0] += x4;
  }
  return Math.sqrt(hypot_d(2, hsub(h2, h1)) * hypot_d(2, hsub(h3, h1)) / .0001);
}

export function linewidthat(h: shiftpoint): number {
  const pmodel = pconf().model;
  if (!G.vid.fineline) return 1;
  else if (hyperbolic() && pmodel === mdDisk && pconf().alpha === 1 && !G.flat_on) { // !ISWEB
    const dz = h.h[LDIM()];
    if (dz < 1) return 1;
    else {
      const dx = Math.sqrt(dz * dz - 1);
      let dfc = dx / (dz + 1);
      dfc = 1 - dfc * dfc;
      return dfc;
    }
  }
  else if (hyperbolic() && pmodel === mdRelPerspective) {
    if (Math.abs(h.h[3]) < 1e-6) return 1;
    return 1 / (1 + Math.abs(h.h[3]));
  }
  else if (sl2() && pmodel === mdRelPerspective) {
    if (Math.abs(h.h[2]) < 1e-6) return 1;
    return 1 / (1 + Math.abs(h.h[2]));
  }
  else if (hyperbolic() && GDIM() === 3 && pmodel === mdPerspective && pconf().alpha === 0 && h.h[3] < 0.99) {
    return 1;
  }
  else if (G.perfect_linewidth >= (G.inHighQual ? 1 : 2)) {
    const h0 = hdiv(h.h, zlevel(h.h));
    const T = shiftless_t(rgpushxto0(h0), h.shift);
    return scale_at(T);
  }
  return 1;
}

export function set_width(_w: number): void {
  // MINIMIZE_GL_CALLS / CAP_GL: glhr::set_linewidth (GL only)
}

// this part makes cylindrical projections on the sphere work

let cyl_loop_min = 0, cyl_loop_max = 0;
const cyl_periods: number[] = [];

function cyl_period_at(y: number): number {

  const m = G.current_display.radius;
  y /= (m * pconf().stretch);

  switch (pconf().model) {
    case mdBand:
    case mdMiller:
      return m * 4;
    case mdSinusoidal:
      return m * 2 * Math.cos(y * Math.PI);
    case mdMollweide:
      return m * 2 * Math.sqrt(1 - y * y * 4);
    case mdCollignon: {
      if (pconf().collignon_reflected && y > 0) y = -y;
      y += signed_sqrt(pconf().collignon_parameter);
      return Math.abs(m * y * 2 / 1.2);
    }
    default:
      return m * 2;
  }
}

function cyl_ori_to_scr(g: glvertex): void {
  const Ori = pconf().mori().v2;
  const a = Ori[0][0] * g[0] + Ori[0][1] * g[1], b = Ori[1][0] * g[0] + Ori[1][1] * g[1];
  g[0] = a; g[1] = b;
}

function cyl_scr_to_ori(g: glvertex): void {
  const Ori = pconf().mori().v2;
  /* we invert it, so transposition is applied in the formula */
  const a = Ori[0][0] * g[0] + Ori[1][0] * g[1], b = Ori[0][1] * g[0] + Ori[1][1] * g[1];
  g[0] = a; g[1] = b;
}

function cyl_adjust(tinf: boolean): void {
  const glcoords = G.glcoords;
  cyl_periods.length = isize(glcoords);

  if (!G.models_model_straight)
    for (const g of glcoords)
      cyl_scr_to_ori(g);

  for (let i = 0; i < isize(glcoords); i++) cyl_periods[i] = cyl_period_at(glcoords[i][1]);

  const dist = (a: number, b: number): number => Math.max(b, a - b);

  const chypot = Math.hypot(dist(G.vid.xres, G.current_display.xcenter), dist(G.vid.yres, G.current_display.ycenter));

  const cmin = -chypot / 2, cmax = chypot / 2;
  let dmin = -chypot, dmax = chypot;

  const z = pconf().stretch * G.current_display.radius;

  switch (pconf().model) {
    case mdSinusoidal: case mdBandEquidistant: case mdMollweide:
      dmax = z / 2; dmin = -dmax;
      break;

    case mdBandEquiarea:
      dmax = z / Math.PI; dmin = -dmax;
      break;

    case mdCollignon:
      dmin = z * (signed_sqrt(pconf().collignon_parameter - 1) - signed_sqrt(pconf().collignon_parameter));
      if (pconf().collignon_reflected) dmax = -dmin;
      else dmax = z * (signed_sqrt(pconf().collignon_parameter + 1) - signed_sqrt(pconf().collignon_parameter));
      break;

    default: ;
  }

  let had = false;
  let first = 0, next = 0;

  for (let i = 0; i < isize(glcoords); i++) if (cyl_periods[i] > 1) {
    if (!had) {
      next = first = glcoords[i][0] / cyl_periods[i];
      had = true;
    }
    else {
      glcoords[i][0] /= cyl_periods[i];
      glcoords[i][0] -= round_nearest(glcoords[i][0] - next);
      next = glcoords[i][0];
      glcoords[i][0] *= cyl_periods[i];
    }
    cyl_loop_min = Math.min(cyl_loop_min, Math.trunc(Math.floor((cmin - glcoords[i][0]) / cyl_periods[i])));
    cyl_loop_max = Math.max(cyl_loop_max, Math.trunc(Math.ceil((cmax - glcoords[i][0]) / cyl_periods[i])));
  }

  if (!had) return;

  let last = first - round_nearest(first - next);

  if (cyl_loop_max > 100) cyl_loop_max = 100;
  if (cyl_loop_min < -100) cyl_loop_min = -100;

  if (Math.abs(first - last) < 1e-6) {
    if (!G.models_model_straight)
      for (const g of glcoords)
        cyl_ori_to_scr(g);
  }
  else {
    if (tinf) {
      // this cannot work after cycled
      cyl_loop_min = 1; cyl_loop_max = 0; return;
    }
    if (last < first) {
      glcoords.reverse();
      cyl_periods.reverse();
      const t = first; first = last; last = t;
    }

    for (let i = 0; i < isize(glcoords); i++) glcoords[i][0] += cyl_periods[i] * cyl_loop_min;

    const base = isize(glcoords);

    for (let i = cyl_loop_min; i < cyl_loop_max; i++) {
      for (let j = 0; j < base; j++) {
        glcoords.push(Float32Array.from(glcoords[isize(glcoords) - base]));
        glcoords[glcoords.length - 1][0] += cyl_periods[j];
      }
    }
    glcoords.push(Float32Array.from(glcoords[glcoords.length - 1]));
    glcoords.push(Float32Array.from(glcoords[0]));
    for (let u = 1; u <= 2; u++) {
      const g = glcoords[isize(glcoords) - u];
      g[1] = g[1] < 0 ? dmin : dmax;
    }
    if (!G.models_model_straight)
      for (const g of glcoords)
        cyl_ori_to_scr(g);
    // we have already looped
    cyl_loop_min = cyl_loop_max = 0;
  }
}

let in_twopoint = false;

function glhypot2(a: glvertex, b: glvertex): number {
  return (a[0] - b[0]) * (a[0] - b[0]) + (a[1] - b[1]) * (a[1] - b[1]) + (a[2] - b[2]) * (a[2] - b[2]);
}

function compute_side_by_centerin(p: dqi_poly, nofill: { v: boolean }): void {

  const hscr: hyperpoint = [0, 0, 0, 0];
  const h1 = smulh(p.V, p.intester);
  if (is_behind(h1.h)) {
    if (sphere()) {
      for (let i = 0; i < 3; i++) h1.h[i] = -h1.h[i];
      poly_flags &= ~POLY_CENTERIN;
    }
    else
      nofill.v = true;
  }
  applymodel(h1, hscr);
  // !vrhr::rendering()
  hscr[0] *= G.current_display.radius; hscr[1] *= G.current_display.radius * pconf().stretch;
  const glcoords = G.glcoords;
  for (let i = 0; i < isize(glcoords) - 1; i++) {
    const x1 = glcoords[i][0] - hscr[0];
    const y1 = glcoords[i][1] - hscr[1];
    const x2 = glcoords[i + 1][0] - hscr[0];
    const y2 = glcoords[i + 1][1] - hscr[1];
    if (asign(y1, y2)) {
      const x = xcross(x1, y1, x2, y2);
      if (x < -1e-6) poly_flags ^= POLY_CENTERIN;
      else if (x < 1e-6) nofill.v = true;
    }
  }

  poly_flags &= ~POLY_INVERSE;
  if (poly_flags & POLY_CENTERIN) {
    poly_flags |= POLY_INVERSE;
    if (Math.abs(zlevel(tC0(p.V.T)) - 1) > 1e-6) nofill.v = true;
  }
}

function compute_side_by_area(): void {
  const glcoords = G.glcoords;
  let rarea = 0;
  for (let i = 0; i < isize(glcoords) - 1; i++)
    rarea += glcoords[i][0] * glcoords[i + 1][1] - glcoords[i][1] * glcoords[i + 1][0];
  const b = glcoords[glcoords.length - 1];
  rarea += b[0] * glcoords[0][1] - b[1] * glcoords[0][0];

  if (rarea > 0)
    poly_flags ^= POLY_INVERSE;
}

function get_width(p: dqi_poly): number {
  if ((p.flags & POLY_FORCEWIDE) || pconf().model === mdPixel)
    return p.linewidth;
  else if (p.flags & POLY_PRECISE_WIDE) {
    let maxwidth = 0;
    for (let i = 0; i < p.cnt; i++) {
      const h1 = smulh(p.V, glhr_gltopoint(p.tab[p.offset + i]));
      maxwidth = Math.max(maxwidth, linewidthat(h1));
    }
    return maxwidth * p.linewidth;
  }
  else
    return linewidthat(tC0_sm(p.V)) * p.linewidth;
}

// namespace s2xe (draw_s2xe, draw_s2xe0: GL only), draw_stretch (GL only), namespace ods (CAP_ODS): not ported

let in_broken = false;

function broken_projection(p0: dqi_poly): boolean {
  const pmodel = pconf().model;
  const broken_coord = models_get_broken_coord(pmodel);
  const both_broken = pmodel === mdConformalSquare;

  let T: transmatrix = p0.V.T, IT: transmatrix = Id, FT: transmatrix = Id;
  if (both_broken) { FT = cspin(0, 1, deg(45)); T = tmul(FT, T); IT = cspin(0, 1, -deg(45)); }

  let zlow = 0;
  if (both_broken) {
    const t = pconf().model_transition;
    zlow = (1 - t * t) / (1 + t * t);
  }

  if (broken_coord && !in_broken) {

    let zcoord = broken_coord;
    let ycoord = 3 - zcoord;
    let xcoord = 0;

    zcoord = 2;

    const all: hyperpoint[] = [];
    for (let i = 0; i < p0.cnt; i++)
      all.push(tmulh(T, glhr_gltopoint(p0.tab[p0.offset + i])));
    let fail = 0;
    let last_fail = 0;

    for (let k = 0; k < all.length; k++) all[k] = models_scr_to_ori(all[k]);

    const break_in_xz = (a: hyperpoint, b: hyperpoint, xcoord: number, zcoord: number): boolean =>
      a[xcoord] * b[xcoord] <= 0 && (a[xcoord] * (b[zcoord] + zlow) - b[xcoord] * (a[zcoord] + zlow)) * (a[xcoord] - b[xcoord]) < 0;

    const break_in = (a: hyperpoint, b: hyperpoint): boolean => {
      if (both_broken) {
        for (let xc = 0; xc < 2; xc++) { if (break_in_xz(a, b, xc, zcoord)) { xcoord = xc; ycoord = 1 - xc; return true; } }
        return false;
      }
      return break_in_xz(a, b, xcoord, zcoord);
    };

    for (let i = 0; i < p0.cnt - 1; i++)
      if (break_in(all[i], all[i + 1])) {
        last_fail = i; fail++;
      }
    const v: glvertex[] = [];
    const p = p0.copy();
    p.tab = v;
    p.offset = 0;
    p.V = { T: IT, shift: p0.V.shift };

    /* we don't rotate h's back, just change p.V */
    // for(int i=0; i<3; i++) models::scr_to_ori(p.V.T[i]): the rows, as hyperpoints
    p.V.T = [models_scr_to_ori(IT[0]), models_scr_to_ori(IT[1]), models_scr_to_ori(IT[2]), [...IT[3]]];

    if (fail) {
      if (p0.tinf) return true;
      const ib = in_broken;
      in_broken = true;
      try {
        let part = ilerp(all[last_fail][xcoord], all[last_fail + 1][xcoord], 0);
        if (both_broken && all[last_fail][ycoord] * all[last_fail + 1][ycoord] < 0) {
          const part2 = ilerp(all[last_fail][ycoord], all[last_fail + 1][ycoord], 0);
          if (part2 > part) { part = part2; const t = xcoord; xcoord = ycoord; ycoord = t; }
        }
        let initial = normalize(lerp(all[last_fail], all[last_fail + 1], 1 - (1 - part) * .99));
        let have_initial = true;
        v.push(glhr_pointtogl(initial));
        last_fail++;
        let at = last_fail;
        do {
          v.push(glhr_pointtogl(all[at]));
          if (at === p0.cnt - 1 && sqhypot_d(2, hsub(all[at], all[0])) > 1e-6) {
            p.cnt = isize(v); p.draw(); v.length = 0; at = 0;
            have_initial = false;
          }
          let next = at + 1;
          if (next === p0.cnt) next = 0;
          if (break_in(all[at], all[next])) {
            let part = ilerp(all[at][xcoord], all[next][xcoord], 0);
            if (both_broken && all[at][ycoord] * all[next][ycoord] < 0) {
              const part2 = ilerp(all[at][ycoord], all[next][ycoord], 0);
              if (part2 < part) { part = part2; const t = xcoord; xcoord = ycoord; ycoord = t; }
            }

            const final = normalize(lerp(all[at], all[next], part * .99));
            v.push(glhr_pointtogl(final));
            if (have_initial) {
              const max = 4 << G.vid.linequality;
              if (both_broken) {
                const square_close_corner = (h: hyperpoint): hyperpoint => {
                  const end = hmul(C0(), -1);
                  end[0] = 0.01 * signum(h[0]);
                  end[1] = 0.01 * signum(h[1]);
                  return normalize(end);
                };
                const endf = square_close_corner(final);
                const endi = square_close_corner(initial);
                if (endf[0] !== endi[0] || endf[1] !== endi[1] || endf[2] !== endi[2] || endf[3] !== endi[3]) {
                  for (let i = 1; i <= max; i++)
                    v.push(glhr_pointtogl(lerp(final, endf, i * 1. / max)));
                  for (let i = 0; i <= max; i++)
                    v.push(glhr_pointtogl(lerp(endi, initial, i * 1. / max)));
                }
                else {
                  for (let i = 1; i <= max; i++)
                    v.push(glhr_pointtogl(lerp(final, initial, i * 1. / max)));
                }
              }
              else if (final[xcoord] * initial[xcoord] > 0) {
                for (let i = 1; i <= max; i++)
                  v.push(glhr_pointtogl(lerp(final, initial, i * 1. / max)));
              }
              else {
                const end = [...Hypc];
                end[ycoord] = final[ycoord] > 0 ? 1 : -1;
                for (let i = 1; i <= max; i++)
                  v.push(glhr_pointtogl(lerp(final, end, i * 1. / max)));
                for (let i = 1; i <= max; i++)
                  v.push(glhr_pointtogl(lerp(end, initial, i * 1. / max)));
              }
            }
            p.cnt = isize(v); p.draw(); v.length = 0;
            initial = normalize(lerp(all[at], all[next], 1 - (1 - part) * .99));
            have_initial = true;
            v.push(glhr_pointtogl(initial));
          }
          at = next;
        }
        while (at !== last_fail);
        return true;
      } finally { in_broken = ib; }
    }
  }
  return false;
}

/** void dqi_poly::draw() */
function dqi_poly_draw(self: dqi_poly): void {
  // if(flags & POLY_DEBUG) debug_this(); if(debug_vertex) println(...): debug output, left out

  // CAP_ODS: vid.stereo_mode == sODS (not in stage 2)

  // CAP_GL: in_s2xe() && vid.usingGL && ...: usingGL is false on this path
  if (in_s2xe() && G.vid.usingGL && pconf().model === mdPerspective)
    throw new NotPorted('dqi_poly::draw: s2xe with GL'); // STAGE2-STUB (GL)

  const pmodel0 = pconf().model;
  if (!hyperbolic() && among(pmodel0, mdPolygonal, mdPolynomial)) {
    let any = false;
    for (let i = 0; i < self.cnt; i++) {
      const h1 = tmulh(self.V.T, glhr_gltopoint(self.tab[self.offset + i]));
      if (h1[2] > 0) any = true;
    }
    if (!any) return;
  }

  if (sphere() && self.tinf && GDIM() === 2 && self.cnt > 3) {
    const i = self.cnt;
    self.cnt = 3;
    for (let j = 0; j < i; j += 3) {
      self.offset += j;
      self.offset_texture += j;
      self.draw();
      self.offset -= j;
      self.offset_texture -= j;
    }
    self.cnt = i;
    return;
  }

  if (broken_projection(self)) return;

  if (sphere() && pconf().model === mdTwoPoint && !in_twopoint) {
    void glhypot2; // (used by the spherical two-point branch)
    throw new NotPorted('dqi_poly::draw: two-point on the sphere'); // STAGE2-STUB (sphere)
  }

  // CAP_GL: vid.usingGL && ... && sphere && (stretch::factor || ray::in_use): draw_stretch (GL only)

  G.glcoords.length = 0;
  poly_flags = self.flags;

  let d = 0, curradius = 0;
  if (sphere()) {
    d = det(self.V.T);
    curradius = Math.pow(Math.abs(d), 1 / 3.);
  }

  last_infront = false;

  addpoly(self.V, self.tab, self.offset, self.cnt);
  const glcoords = G.glcoords;
  const pmodel = pconf().model;
  if (!(sphere() && pconf().alpha < .9)) if (pmodel !== mdJoukowsky) if (!(self.flags & POLY_ALWAYS_IN)) {
    const xlim = G.vid.xres * 2, ylim = G.vid.yres * 2;
    for (let i = 1; i < glcoords.length; i++) {
      const g = glcoords[i], g1 = glcoords[i - 1];
      const dx = g[0] - g1[0];
      const dy = g[1] - g1[1];
      if (dx > xlim || dy > ylim) return;
    }
  }
  if (poly_flags & POLY_BEHIND) return;
  if (isize(glcoords) <= 1) return;

  cyl_loop_min = cyl_loop_max = 0;
  if ((sphere() && mdBandAny()) || pmodel === mdPolar)
    cyl_adjust(!!self.tinf);

  // int poly_limit = max(vid.xres, vid.yres) * 2; if(0) ...: never used

  const equi = mdAzimuthalEqui() || pmodel === mdFisheye;

  const nofill = { v: false };

  if (poly_flags & POLY_NIF_ERROR) return;

  if (G.spherespecial === 1 && sphere() && (poly_flags & POLY_INFRONT) && (poly_flags & POLY_NOTINFRONT) && pconf().alpha <= 1) {
    let around_center = false;
    for (let i = 0; i < isize(glcoords) - 1; i++) {
      const x1 = glcoords[i][0];
      const y1 = glcoords[i][1];
      const x2 = glcoords[i + 1][0];
      const y2 = glcoords[i + 1][1];
      if (asign(y1, y2)) {
        const x = xcross(x1, y1, x2, y2);
        if (x < -1e-6) around_center = !around_center;
      }
    }
    if (around_center) return;
  }

  let can_have_inverse = false;
  if (sphere() && pmodel === mdDisk && (G.spherespecial > 0 || equi)) can_have_inverse = true;
  // if(vrhr::rendering()) can_have_inverse = false;
  if (sphere() && among(pmodel, mdEquidistant, mdEquiarea)) can_have_inverse = true;
  if (pmodel === mdJoukowsky) can_have_inverse = true;
  if (pmodel === mdJoukowskyInverted && pconf().skiprope) can_have_inverse = true;
  if (pmodel === mdDisk && hyperbolic() && pconf().alpha <= -1) can_have_inverse = true;
  if (pmodel === mdSpiral && pconf().skiprope) can_have_inverse = true;
  if (pmodel === mdCentralInversion) can_have_inverse = true;

  if (among(pmodel, mdHemisphere, mdHyperboloid) && sphere() && pconf().small_hyperboloid) can_have_inverse = true;
  if (GDIM() === 3) can_have_inverse = false;

  if (can_have_inverse && !(poly_flags & POLY_ISSIDE)) {

    if (!self.tinf)
      compute_side_by_centerin(self, nofill);

    else {
      if (d < 0) poly_flags ^= POLY_INVERSE;
      if (pmodel === mdCentralInversion) poly_flags ^= POLY_INVERSE;
      compute_side_by_area();
    }

    if (poly_flags & POLY_INVERSE) {
      if (curradius < pconf().alpha - 1e-6) return;
      if (!sphere()) return;
    }

  }
  else poly_flags &= ~POLY_INVERSE;

  if (among(pmodel, mdHemisphere, mdHyperboloid) && sphere() && pconf().small_hyperboloid && (poly_flags & POLY_INVERSE)) return;

  if (G.spherespecial) {
    if (!(poly_flags & POLY_INFRONT)) return;
  }

  let lastl = 0;

  for (let l = cyl_loop_min; l <= cyl_loop_max; l++) {

    if (l || lastl) {
      for (let i = 0; i < isize(glcoords); i++) {
        glcoords[i][0] += pconf().mori().get()[0][0] * cyl_periods[i] * (l - lastl);
        glcoords[i][1] += pconf().mori().get()[1][0] * cyl_periods[i] * (l - lastl);
      }
      lastl = l;
    }

    if (equi && (poly_flags & POLY_INVERSE)) {
      if (Math.abs(zlevel(tmulh(self.V.T, C0())) - 1) < 1e-6 && !self.tinf) {
        // we should fill the other side
        const h = Math.atan2(glcoords[0][0], glcoords[0][1]);
        for (let i = 0; i <= 360; i++) {
          const a = i * (Math.PI / 180) + h;
          glcoords.push(glhr_makevertex(G.current_display.radius * Math.sin(a), G.current_display.radius * pconf().stretch * Math.cos(a), 0));
        }
        poly_flags ^= POLY_INVERSE;
      }
      else {
        // If we are on a zlevel, the algorithm above will not work correctly.
        // It is hard to tell what to do in this case. Just fill neither side
        nofill.v = true;
      }
    }

    // CAP_GL: if(vid.usingGL) { ... npoly.gldraw(); continue; } -- not on this path
    if (G.vid.usingGL) throw new NotPorted('dqi_poly::gldraw'); // STAGE2-STUB (GL: the port draws without GL)

    // CAP_SVG
    if (G.svg_in) {
      let bad = false;
      // polyi: the value of the previous coords_to_poly (the original reads it before setting it)
      for (let i = 0; i < polyi; i++) if (Number.isNaN(glcoords[i]?.[0]) || Number.isNaN(glcoords[i]?.[1]) || Number.isNaN(glcoords[i]?.[2])) bad = true;
      if (bad) continue;

      coords_to_poly();
      let col = self.color;
      if (poly_flags & POLY_INVERSE) col = 0;
      if (poly_flags & POLY_TRIANGLES) {
        for (let i = 0; i < polyi; i += 3)
          svg_polygon(G.polyx.subarray(i), G.polyy.subarray(i), 3, col, self.outline, get_width(self));
      }
      else
        svg_polygon(G.polyx, G.polyy, polyi, col, self.outline, get_width(self));
      continue;
    }

    coords_to_poly();

    // CAP_SDLGFX
    const polyx = G.polyx, polyy = G.polyy;
    const srend = sdl_srend();
    if (self.tinf) {
      // CAP_TEXTURE: drawTexturedTriangle (textures: not in stage 2)
    }
    else if (poly_flags & POLY_INVERSE) {
      let i = polyi;
      if (true) {
        polyx[i] = 0; polyy[i] = 0; i++;
        polyx[i] = G.vid.xres; polyy[i] = 0; i++;
        polyx[i] = G.vid.xres; polyy[i] = G.vid.yres; i++;
        polyx[i] = 0; polyy[i] = G.vid.yres; i++;
        polyx[i] = 0; polyy[i] = 0; i++;
      }
      filledPolygonColorI(srend, polyx, polyy, polyi + 5, self.color);
    }
    else if (poly_flags & POLY_TRIANGLES) {
      for (let i = 0; i < polyi; i += 3)
        filledPolygonColorI(srend, polyx.subarray(i), polyy.subarray(i), 3, self.color);
    }
    else
      filledPolygonColorI(srend, polyx, polyy, polyi, self.color);

    // if(current_display->separate_eyes()) filledPolygonColorI(auxrend, ...): anaglyph / side by side (stage 3)

    ((G.vid.antialias & 1 /* AA_NOGL */) ? aapolylineColor : polylineColor)(srend, polyx, polyy, polyi, self.outline);
    // if(current_display->separate_eyes()) aapolylineColor(auxrend, ...)

    if (G.vid.xres >= 2000 || fatborder) {
      let xmi = 3000, xma = -3000;
      for (let t = 0; t < polyi; t++) { xmi = Math.min(xmi, polyx[t]); xma = Math.max(xma, polyx[t]); }

      if (xma > xmi + 20) for (let x = -1; x < 2; x++) for (let y = -1; y <= 2; y++) if (x * x + y * y === 1) {
        for (let t = 0; t < polyi; t++) { polyx[t] += x; polyy[t] += y; }
        aapolylineColor(srend, polyx, polyy, polyi, self.outline);
        for (let t = 0; t < polyi; t++) { polyx[t] -= x; polyy[t] -= y; }
      }
    }
  }
}

const prettylinepoints: glvertex[] = [];

export function prettypoint(h: hyperpoint): void {
  prettylinepoints.push(glhr_pointtogl(h));
}

export function prettylinesub(h1: hyperpoint, h2: hyperpoint, lev: number): void {
  if (lev >= 0 && pconf().model !== mdPixel) {
    const h3 = midz(h1, h2);
    prettylinesub(h1, h3, lev - 1);
    prettylinesub(h3, h2, lev - 1);
  }
  else prettypoint(h2);
}

export function prettyline(h1: hyperpoint, h2: hyperpoint, shift: number, col: number, lev: number, flags: number, prio: PPR): void {
  prettylinepoints.length = 0;
  prettypoint(h1);
  prettylinesub(h1, h2, lev);
  const ptd = new dqi_poly();
  ptd.V = shiftless_t(Id, shift);
  ptd.tab = prettylinepoints;
  ptd.offset = 0;
  ptd.cnt = isize(prettylinepoints);
  ptd.linewidth = G.vid.linewidth;
  ptd.color = 0;
  ptd.outline = col;
  ptd.flags = POLY_ISSIDE | POLY_PRECISE_WIDE | flags;
  ptd.tinf = null;
  ptd.intester = C0();
  ptd.prio = prio;
  ptd.draw();
}

export function prettypoly(t: hyperpoint[], fillcol: number, linecol: number, lev: number): void {
  prettylinepoints.length = 0;
  prettypoint(t[0]);
  for (let i = 0; i < isize(t); i++)
    prettylinesub(t[i], t[(i + 1) % 3], lev);
  const ptd = new dqi_poly();
  ptd.V = shiftless_t(Id);
  ptd.tab = prettylinepoints;
  ptd.offset = 0;
  ptd.cnt = isize(prettylinepoints);
  ptd.linewidth = G.vid.linewidth;
  ptd.color = fillcol;
  ptd.outline = linecol;
  ptd.flags = POLY_ISSIDE | POLY_PRECISE_WIDE;
  ptd.tinf = null;
  ptd.intester = C0();
  ptd.draw();
}

export function queuereset(m: eModel, prio: PPR): void {
  queueaction(prio, () => { glflush(); pconf().model = m; });
}

export function initquickqueue(): void {
  G.ptds.length = 0;
  G.poly_outline = OUTLINE_NONE;
}

export function sortquickqueue(): void {
  const ptds = G.ptds;
  for (let i = 1; i < isize(ptds);)
    if (i && ptds[i].prio < ptds[i - 1].prio) {
      const t = ptds[i]; ptds[i] = ptds[i - 1]; ptds[i - 1] = t;
      i--;
    }
    else i++;
}

export function clear_curvedata(): void {
  if (G.keep_curvedata) return;
  G.curvedata.length = 0;
  // for(auto& d: fontdatas) if(d.second.finf) d.second.finf->tvertices.clear(); (the GL fonts: not ported)
  G.curvestart = 0;
}

export function quickqueue(): void {
  G.current_display.next_shader_flags = 0n;
  G.spherespecial = 0;
  reset_projection(); display_data_set_all(G.current_display, 0, 0);
  const siz = isize(G.ptds);
  for (let i = 0; i < siz; i++) G.ptds[i].draw();
  G.ptds.length = 0;
  clear_curvedata();
}

/* todo */
function xintval(h: shiftpoint): number {
  if (G.sphere_flipped) return -h.h[2];
  if (hyperbolic()) return -h.h[2];
  if (euclid()) return -Math.hypot(h.h[0], h.h[1]);
  return -intval(h.h, C0());
}

const PMAX = PPR.MAX;
const qp = new Int32Array(PMAX), qp0 = new Int32Array(PMAX);

function darken_color(color: number, outline: boolean): number {
  const alpha = color & 255;
  if (sphere() && pconf().model === mdDisk && pconf().alpha <= 0.99)
    return 0;
  else {
    if (outline && alpha < 255)
      return (color - alpha + Math.trunc(G.backbrightness * alpha)) >>> 0;
    else
      return ((gradient(G.modelcolor >>> 8, color >>> 8, 0, G.backbrightness, 1) << 8) | 0xFF) >>> 0;
  }
}

export function sort_drawqueue(): void {
  // DEBBI(debug_graph, ("sort_drawqueue"));

  for (let a = 0; a < PMAX; a++) qp[a] = 0;

  const ptds = G.ptds;
  const siz = isize(ptds);

  // MINIMIZE_GL_CALLS is 0 (not EMSCRIPTEN): no grouping by colour

  for (const p of ptds) {
    const pd = p.prio - PPR.ZERO;
    if (pd < 0 || pd >= PMAX) {
      // printf("Illegal priority %d\n", pd);
      throw new NotPorted(`sort_drawqueue: illegal priority ${pd} (the original draws a random one with rand())`);
    }
    qp[pd]++;
  }

  let total = 0;
  for (let a = 0; a < PMAX; a++) {
    const b = qp[a];
    qp0[a] = qp[a] = total; total += b;
  }

  const ptds2: drawqueueitem[] = new Array(siz);

  for (let i = 0; i < siz; i++) ptds2[qp[ptds[i].prio]++] = ptds[i];
  G.ptds = ptds2;
}

function reverse_range(a: drawqueueitem[], from: number, to: number): void {
  for (let i = from, j = to - 1; i < j; i++, j--) { const t = a[i]; a[i] = a[j]; a[j] = t; }
}

export function reverse_priority(p: PPR): void {
  reverse_range(G.ptds, qp0[p], qp[p]);
}

const all_side_prios: PPR[] = [
  PPR.DEEP_SIDE, PPR.SHALLOW_SIDE, PPR.WATERLEVEL_SIDE, PPR.FLOOR_SIDE, PPR.RED1_SIDE, PPR.RED2_SIDE, PPR.RED3_SIDE, PPR.WALL_SIDE,
];

export function reverse_side_priorities(): void {
  for (const p of all_side_prios)
    reverse_priority(p);
}

// on the sphere, parts on the back are drawn first
export function draw_backside(): void {
  // DEBBI(debug_graph, ("draw_backside"));
  const ptds = G.ptds;
  if (pconf().model === mdHyperboloid && hyperbolic() && pconf().show_hyperboloid_flat) {
    const dv = pconf().model;
    pconf().model = mdHyperboloidFlat;
    try {
      for (const ptd of ptds)
        if (!among(ptd.prio, PPR.MOBILE_ARROW, PPR.OUTCIRCLE, PPR.CIRCLE))
          ptd.draw();
    } finally { pconf().model = dv; }
  }

  G.spherespecial = G.sphere_flipped ? 1 : -1;
  reset_projection();

  if (pconf().model === mdRotatedHyperboles) {
    for (const ptd of ptds)
      if (!among(ptd.prio, PPR.MOBILE_ARROW, PPR.OUTCIRCLE, PPR.CIRCLE))
        ptd.draw();
    glflush();
  }
  else {
    reverse_side_priorities();
    for (let i = isize(ptds) - 1; i >= 0; i--)
      if (!among(ptds[i].prio, PPR.MOBILE_ARROW, PPR.OUTCIRCLE, PPR.CIRCLE))
        ptds[i].draw_back();

    glflush();
    reverse_side_priorities();
  }

  G.spherespecial *= -1;
  G.spherephase = 1;
  reset_projection();
}

export function reverse_transparent_walls(): void {
  const pt = PPR.TRANSPARENT_WALL;
  reverse_range(G.ptds, qp0[pt], qp[pt]);
}

export function set_vr_sphere(): void {
  G.in_vr_sphere = false;
  // CAP_VR (not in stage 2)
}

export function draw_main(): void {
  // DEBBI(debug_graph, ("draw_main"));

  if (callhandlers(false, G.hooks_draw_main)) return;

  if (pconf().back_and_front === 1 && G.vid.consider_shader_projection) {
    const pa = pconf().back_and_front;
    try {
      pconf().back_and_front = 0;
      draw_main();
      pconf().back_and_front = 2;
      reset_projection();
      draw_main();
    } finally { pconf().back_and_front = pa; }
    return;
  }

  if (pconf().model === mdHemisphere && sphere() && G.hemi_side === 0 && !pconf().small_hyperboloid) { // && !vrhr::rendering()
    throw new NotPorted('draw_main: the hemisphere model on the sphere'); // STAGE2-STUB (sphere)
  }

  set_vr_sphere();

  const ptds = G.ptds;
  if (sphere() && GDIM() === 3 && pconf().model === mdPerspective) { // && !stretch::in() && !ray::in_use
    throw new NotPorted('draw_main: 3D spherical perspective'); // STAGE2-STUB (3D, GL)
  }
  else if (pconf().model === mdAxial && sphere()) {
    for (const ptd of ptds) if (ptd.prio === PPR.OUTCIRCLE)
      ptd.draw();
    for (G.axial_x = -4; G.axial_x <= 4; G.axial_x++)
      for (G.axial_y = -4; G.axial_y <= 4; G.axial_y++)
        for (const ptd of ptds) if (ptd.prio !== PPR.OUTCIRCLE) {
          ptd.draw();
        }
    glflush();
  }
  else {
    // DEBB(debug_graph, ("draw_main1"));
    // if(ray::in_use && !ray::comparison_mode) ray::cast(): the raycaster is GL only

    // DEBB(debug_graph, ("outcircle"));
    for (const ptd of ptds) if (ptd.prio === PPR.OUTCIRCLE)
      ptd.draw();

    if (two_sided_model()) draw_backside();

    for (const ptd of G.ptds) if (ptd.prio !== PPR.OUTCIRCLE) {
      // DEBBI(debug_vertex, ...)
      const ss = G.spherespecial;
      G.spherespecial = among(ptd.prio, PPR.MOBILE_ARROW, PPR.OUTCIRCLE, PPR.CIRCLE) ? 0 : G.spherespecial;
      try { ptd.draw(); } finally { G.spherespecial = ss; }
    }
    glflush();

    // CAP_RAY: comparison_mode (GL only)
  }
}

export function drawqueue(): void {

  // DEBBI(debug_graph, ("drawqueue"));

  // CAP_WRL: if(wrl::in) { wrl::render(); return; } (not in stage 2)

  // MAXMDIM >= 4 && CAP_GL: make_air() (3D)

  // CAP_VR

  callhooks(G.hooks_drawqueue);
  G.current_display.next_shader_flags = 0n;
  reset_projection();
  // reset_projection() is not sufficient here, because we need to know shaderside_projection

  // CAP_GL: if(vid.usingGL) glClear(GL_STENCIL_BUFFER_BIT);

  sort_drawqueue();

  // DEBB(debug_graph, ("sort walls"));

  if (GDIM() === 2)
    for (const p of all_side_prios) {
      const pp = p;
      if (qp0[pp] === qp[pp]) continue;
      for (let i = qp0[pp]; i < qp[pp]; i++) {
        const ap = G.ptds[i] as dqi_poly;
        ap.cache = fround(xintval(smulh(ap.V, ap.intester)));
      }
      sort_range(G.ptds, qp0[pp], qp[pp], (p1, p2) => (p1 as dqi_poly).cache < (p2 as dqi_poly).cache);
    }

  for (const p of [PPR.TRANSPARENT_WALL]) {
    const pp = p;
    sort_range(G.ptds, qp0[pp], qp[pp], (p1, p2) => p1.subprio > p2.subprio);
  }

  if (G.draw_plain_floors && (G.default_flooralpha < 255 || G.svg_in)) for (const p of [PPR.FLOOR]) {
    const pp = p;
    if (qp0[pp] === qp[pp]) continue;
    const get_z = (p: drawqueueitem): number => {
      const d = p.as_poly();
      if (!d) return 0;
      let h: hyperpoint = [...Hypc];

      for (let i = 0; i < d.cnt; i++) h = hadd(h, glhr_gltopoint(d.tab[d.offset + i]));
      h = hdiv(h, d.cnt); normalize(h);
      h = tmulh(unshift_sm(d.V), h);
      return h[2];
    };
    sort_range(G.ptds, qp0[pp], qp[pp], (p1, p2) => get_z(p1) > get_z(p2));
  }

  // CAP_SDL: separate_eyes && !usingGL: the aux surface (anaglyph / side by side: stage 3)

  G.spherespecial = 0;
  G.spherephase = 0;
  reset_projection();

  // CAP_GL: model_needs_depth() && separate_eyes(): two projections (stage 3)
  {
    draw_main();
  }

  // CAP_SDL: the anaglyph / side by side merge (stage 3)

  clear_curvedata();
}

/** std::sort on [from, to) of a: introsort is not stable; the port sorts with cpp.ts std_sort (libstdc++'s
 *  algorithm), so equal keys end in the same order as in the original */
function sort_range(a: drawqueueitem[], from: number, to: number, less: (x: drawqueueitem, y: drawqueueitem) => boolean): void {
  std_sort(a, less, from, to);
}

/** template<class T, class... U> T& queuea(PPR prio, U&&... u) */
export function queuea<T extends drawqueueitem>(item: T, prio: PPR): T {
  G.ptds.push(item);
  item.prio = prio;
  return item;
}

// CAP_SHAPES
export function queuepolyat(V: shiftmatrix, h: hpcshape, col: number, prio: PPR): dqi_poly {
  if (prio === PPR.DEFAULT) prio = h.prio;

  const ptd = queuea(new dqi_poly(), prio);

  ptd.V = V;
  ptd.offset = h.s;
  ptd.cnt = h.e - h.s;
  ptd.tab = G.cgip!.ourshape;
  [ptd.color, ptd.outline] = apply_neon_color(col, h.flags);
  ptd.linewidth = G.vid.linewidth;
  ptd.flags = h.flags;
  ptd.tinf = h.tinf;
  if (G.neon_mode !== eNeon.none && (h.flags & POLY_TRIANGLES))
    ptd.tinf = null;
  ptd.apeiro_cnt = h.she - h.s;
  ptd.offset_texture = h.texture_offset;
  ptd.intester = h.intester;
  return ptd;
}

export function queuetable(V: shiftmatrix, f: glvertex[], cnt: number, linecol: number, fillcol: number, prio: PPR): dqi_poly {

  const ptd = queuea(new dqi_poly(), prio);

  ptd.V = V;
  ptd.tab = f;
  ptd.offset = 0;
  ptd.cnt = cnt;
  ptd.color = fillcol;
  ptd.outline = linecol;
  ptd.linewidth = G.vid.linewidth;
  ptd.flags = POLY_ISSIDE | POLY_PRECISE_WIDE;
  ptd.tinf = null;
  ptd.intester = C0();
  return ptd;
}

// CAP_SHAPES
export function queuepoly(V: shiftmatrix, h: hpcshape, col: number): dqi_poly {
  return queuepolyat(V, h, col, h.prio);
}

export function queuepolyb(V: shiftmatrix, h: hpcshape, col: number, b: number): void {
  queuepolyat(V, h, col, h.prio + b);
}

export function curvepoint(H1: hyperpoint): void {
  G.curvedata.push(glhr_pointtogl(H1));
}

export function curvepoint_pretty(h1: hyperpoint, h2: hyperpoint, lev: number): void {
  if (lev >= 0 && pconf().model !== mdPixel) {
    const h3 = midz(h1, h2);
    curvepoint_pretty(h1, h3, lev - 1);
    curvepoint_pretty(h3, h2, lev - 1);
  }
  else curvepoint(h2);
}

export function curvepoint_first(): void {
  G.curvedata.push(G.curvedata[G.curvestart]);
}

export function queuecurve_reuse(V: shiftmatrix, linecol: number, fillcol: number, prio: PPR): dqi_poly {
  const res = queuetable(V, G.curvedata, isize(G.curvedata) - G.curvestart, linecol, fillcol, prio);
  res.offset = G.curvestart;
  return res;
}

export function queuecurve(V: shiftmatrix, linecol: number, fillcol: number, prio: PPR): dqi_poly {
  const res = queuecurve_reuse(V, linecol, fillcol, prio);
  G.curvestart = isize(G.curvedata);
  return res;
}

export function queueaction(prio: PPR, action: () => void): dqi_action {
  return queuea(new dqi_action(action), prio);
}

export function queueline(H1: shiftpoint, H2: shiftpoint, col: number, prf = 0, prio: PPR = PPR.LINE): dqi_line {
  const ptd = queuea(new dqi_line(), prio);

  ptd.H1 = H1;
  ptd.H2 = H2;
  ptd.prf = prf;
  ptd.width = G.vid.linewidth;
  ptd.color = ((darkened(col >>> 8) << 8) + (col & 0xFF)) >>> 0;

  return ptd;
}

export function queuestr(x: number, y: number, shift: number, size: number, str: string, col: number, frame = 0, align = 8): void {
  const ptd = queuea(new dqi_string(), PPR.TEXT);
  ptd.x = x;
  ptd.y = y;
  ptd.str = str;
  ptd.align = align;
  ptd.shift = shift;
  ptd.size = size;
  ptd.color = darkened(col);
  ptd.frame = frame ? (((G.poly_outline & ~255) + frame) | 0) : 0;
  ptd.font = G.cfont;
}

export function queuecircle(x: number, y: number, size: number, color: number, prio: PPR = PPR.CIRCLE, fillcolor = 0): void {
  const ptd = queuea(new dqi_circle(), prio);
  ptd.x = x;
  ptd.y = y;
  ptd.size = size;
  ptd.color = color;
  ptd.fillcolor = fillcolor;
  ptd.linewidth = G.vid.linewidth;
}

/** getcoord0(const shiftpoint& h, int& xc, int &yc, int &sc): returns [xc, yc, sc] */
export function getcoord0(h: shiftpoint): [number, number, number] {
  const hscr: hyperpoint = [0, 0, 0, 0];
  applymodel(h, hscr);
  const xc = Math.trunc(G.current_display.xcenter + G.current_display.radius * hscr[0]);
  const yc = Math.trunc(G.current_display.ycenter + G.current_display.radius * pconf().stretch * hscr[1]);
  const sc = 0;
  // EYETODO sc = vid.eye * current_display->radius * hscr[2];
  return [xc, yc, sc];
}

export function scale_in_pixels(V: shiftmatrix): number {
  return scale_at(V) * G.cgip!.scalefactor * G.current_display.radius / 2.5;
}

/** getcoord0_checked: null when the point is invalid or behind */
export function getcoord0_checked(h: shiftpoint): [number, number, number] | null {
  if (invalid_point_sp(h)) return null;
  if (point_behind(h)) return null;
  return getcoord0(h);
}

/** queuestr(const shiftpoint& h, int size, const string& chr, color_t col, int frame IS(0)) */
export function queuestr_sp(h: shiftpoint, size: number, chr: string, col: number, frame = 0): void {
  const c = getcoord0_checked(h);
  if (c)
    queuestr(c[0], c[1], c[2], size, chr, col, frame);
}

// CAP_GL: default_pointfunction, write_in_space (the GL font in space): not ported

/** queuestr(const shiftmatrix& V, double size, const string& chr, color_t col, int frame IS(0), int align IS(8)) */
export function queuestr_V(V: shiftmatrix, size: number, chr: string, col: number, frame = 0, align = 8): void {
  // CAP_GL && !CAP_EXTFONT: if(vid.usingGL) write_in_space(...) -- the port draws without GL
  if (G.vid.usingGL) throw new NotPorted('queuestr: write_in_space (GL)'); // STAGE2-STUB (GL)
  const c = getcoord0_checked(tC0_sm(V));
  if (c)
    queuestr(c[0], c[1], c[2], Math.trunc(scale_in_pixels(V) * size), chr, col, frame, align);
}

export function queuestrn(V: shiftmatrix, size: number, chr: string, col: number, frame = 0, align = 8): void {
  switch (G.neon_mode) {
    case eNeon.none:
      queuestr_V(V, size, chr, col, frame, align);
      break;
    case eNeon.neon: {
      const c = G.poly_outline;
      G.poly_outline = (col << 8) >>> 0;
      try { queuestr_V(V, size, chr, 0, frame, align); } finally { G.poly_outline = c; }
      break;
    }
    case eNeon.no_boundary: {
      queuestr_V(V, size, chr, col, 0, align);
      break;
    }
    case eNeon.neon2: {
      const c = G.poly_outline;
      G.poly_outline = ((col << 8) | 0xFF) >>> 0;
      try { queuestr_V(V, size, chr, (col & 0xFEFEFE) >>> 1, frame, align); } finally { G.poly_outline = c; }
      break;
    }
    case eNeon.illustration: {
      const c = G.poly_outline;
      try {
        if (G.poly_outline && (G.poly_outline >>> 8) !== G.bordcolor) {
          col = magentize((col << 8) >>> 0) >>> 8;
          G.poly_outline = 0xFF;
        }
        else {
          col = monochromatize((col << 8) >>> 0) >>> 8;
        }
        queuestr_V(V, size, chr, col, frame, align);
      } finally { G.poly_outline = c; }
    }
  }
}

/** queuecircle(const shiftmatrix& V, double size, color_t col) */
export function queuecircle_V(V: shiftmatrix, size: number, col: number): void {
  const c = getcoord0_checked(tC0_sm(V));
  if (!c) return;
  getcoord0(smulh(V, xpush0(.01)));
  queuecircle(c[0], c[1], Math.trunc(scale_in_pixels(V) * size), col);
}

