// graphics/Renderer.h / Renderer.cpp + RendererSettings.h + RendererFrame.h + gcache_item.h + FindingElement.h +
// gui/game/RenderPreset.h: draws the simulation.
//
// The frame (GetVideo()) is a RendererFrame as in the original: WINDOWW x YRES (629 x 384) pixels of 0x00RRGGBB,
// the simulation area being its left XRES (612) columns. GameView copies it unchanged over the top of the
// WINDOWW x WINDOWH window buffer (std::copy_n of the whole frame), so the UI does
// `graphics.video.set(renderer.GetVideo())`.
//
// Order per frame, as GameView does it: ren.Clear(); ren.RenderBackground(); ren.RenderSimulation();
import {
  CELL, COLOUR_BASC, COLOUR_DEFAULT, COLOUR_GRAD, COLOUR_HEAT, COLOUR_LIFE, DECO_FIRE, DISPLAY_AIR, DISPLAY_AIRC,
  DISPLAY_AIRH, DISPLAY_AIRP, DISPLAY_AIRV, DISPLAY_AIRW, DISPLAY_PERS, DISPLAY_WARP, EFFECT, EFFECT_DBGLINES,
  EFFECT_GRAVIN, EFFECT_GRAVOUT, EFFECT_LINES, FIRE_ADD, FIRE_BLEND, FIRE_SPARK, FIREMODE, ID, MAX_FIGHTERS,
  MAX_TEMP, MIN_TEMP, NCELL, NO_DECO, NPART, PMODE_ADD, PMODE_BLEND, PMODE_BLOB, PMODE_BLUR, PMODE_FLARE,
  PMODE_FLAT, PMODE_GLOW, PMODE_LFLARE, PMODE_SPARK, PROP_HOT_GLOW, PSPEC_STICKMAN, PT_NUM, RENDER_BASC,
  RENDER_BLOB, RENDER_BLUR, RENDER_EFFE, RENDER_FIRE, RENDER_GLOW, RENDER_SPRK, TYP, TYPE_ENERGY, UI_WALLCOUNT,
  WINDOWW, WL_EHOLE, WL_ERASE, WL_ERASEALL, WL_EWALL, WL_STASIS, WL_STREAM, WL_WALLELEC, XCELLS, XRES, YCELLS, YRES,
} from '../sim/config.ts';
import { RNG, clamp_flt, f } from '../sim/cpp.ts';
import { heatTableAt } from '../sim/colour.ts';
import { sd } from '../sim/simulationData.ts';
import { Air } from '../sim/air.ts';
import { decorationAntiClickbait, decorationDisabled, decorationEnabled } from '../sim/element.ts';
import type { Gfx, GraphicsFuncContext } from '../sim/element.ts';
import type { Particle } from '../sim/particle.ts';
import type { Playerst, Simulation } from '../sim/simulation.ts';
import {
  PT_FIGH, PT_PRTI, PT_PRTO, PT_SOAP, PT_STKM, PT_STKM2,
} from '../sim/numbers.ts';
import { RGB, RGBA, RasterDrawMethods, VideoBuffer, WithAlpha, Decay } from './raster.ts';
import { SIGN_None, sign_getDisplayText } from './sign.ts';

export { decorationAntiClickbait, decorationDisabled, decorationEnabled };

const PI = Math.PI;
const PI_F = f(Math.PI);
const SQRT2_F = f(Math.SQRT2);

/** (int)x of a float/double the way x86-64 converts (cvttss2si): out of range and NaN give INT_MIN */
function cvtt(x: number): number {
  if (x > -2147483649 && x < 2147483648) return x < 0 ? Math.ceil(x) | 0 : Math.floor(x) | 0;
  return -2147483648;
}

// ---------------------------------------------------------------------------------------------------------------
// RendererSettings.h, FindingElement.h, gcache_item.h, RenderPreset.h, RendererFrame.h

/** HdispLimit: HdispLimitExplicit{ value } or HdispLimitAuto{} */
export type HdispLimit = { auto: false; value: number } | { auto: true };
export function HdispLimitExplicit(value: number): HdispLimit {
  return { auto: false, value: f(value) };
}
export const HdispLimitAuto: HdispLimit = { auto: true };

/** StructProperty::PropertyType */
export const StructProperty_TransitionType = 0, StructProperty_ParticleType = 1, StructProperty_Colour = 2,
  StructProperty_Integer = 3, StructProperty_UInteger = 4, StructProperty_Float = 5, StructProperty_BString = 6,
  StructProperty_String = 7, StructProperty_UChar = 8, StructProperty_Removed = 9;

/**
 * FindingElement: property (Name is the Particle field, `type` for the element search; Type a StructProperty_*)
 * and the value it must have. For `type` the value is PMAP(ctype, type) as in the original.
 */
export interface FindingElement {
  property: { Name: string; Type: number };
  value: number;
}

export class RendererSettings {
  renderMode = (RENDER_BASC | RENDER_FIRE | RENDER_SPRK | RENDER_EFFE) >>> 0;
  displayMode = 0;
  colorMode = COLOUR_DEFAULT;
  findingElement: FindingElement | null = null;
  gravityZonesEnabled = false;
  gravityFieldEnabled = false;
  decorationLevel = decorationEnabled;
  debugLines = false;
  mousePos = { X: 0, Y: 0 };
  gridSize = 0;
  gridCheckerboard = false;
  fireIntensity = 1;
  wantHdispLimitMin: HdispLimit = HdispLimitExplicit(MIN_TEMP);
  wantHdispLimitMax: HdispLimit = HdispLimitExplicit(MAX_TEMP);
  /** Rect<int> autoHdispLimitArea = RES.OriginRect() */
  autoHdispLimitArea = { pos: { X: 0, Y: 0 }, size: { X: XRES, Y: YRES } };
}

const SETTINGS_FIELDS = Object.keys(new RendererSettings()) as (keyof RendererSettings)[];

/** RendererStats */
export interface RendererStats {
  foundParticles: number;
  hdispLimitMin: number;
  hdispLimitMax: number;
  hdispLimitValid: boolean;
}

export interface gcache_item {
  isready: number;
  pixel_mode: number;
  cola: number; colr: number; colg: number; colb: number;
  firea: number; firer: number; fireg: number; fireb: number;
}

/** SimulationData::graphicscache (std::array<gcache_item, PT_NUM>): the one in sd, which PIPE reads too */
export const graphicscache: gcache_item[] = sd.graphicscache;

export interface RenderPreset {
  Name: string;
  renderMode: number;
  displayMode: number;
  colorMode: number;
  wantHdispLimitMin: HdispLimit;
  wantHdispLimitMax: HdispLimit;
}

function preset(Name: string, renderMode: number, displayMode: number, colorMode: number,
  wantHdispLimitMin: HdispLimit = HdispLimitExplicit(MIN_TEMP), wantHdispLimitMax: HdispLimit = HdispLimitExplicit(MAX_TEMP)): RenderPreset {
  return { Name, renderMode: renderMode >>> 0, displayMode, colorMode, wantHdispLimitMin, wantHdispLimitMax };
}

export const RendererFrameSize = { X: WINDOWW, Y: YRES };

// ---------------------------------------------------------------------------------------------------------------

export function HeatToColour(temp: number, hdispLimitMin: number, hdispLimitMax: number): number {
  const color = heatTableAt(cvtt(f(f(f(temp - hdispLimitMin) / f(hdispLimitMax - hdispLimitMin)) * 1024)));
  const r = cvtt(f(((color >>> 16) & 0xFF) * f(0.7))) & 0xFF;
  const g = cvtt(f(((color >>> 8) & 0xFF) * f(0.7))) & 0xFF;
  const b = cvtt(f((color & 0xFF) * f(0.7))) & 0xFF;
  return RGB(r, g, b);
}

export function PressureToColour(pres: number): number {
  let c: number;
  if (pres > 0.0)
    c = RGB(clamp_flt(pres, 0.0, 8.0), 0, 0); //positive pressure is red!
  else
    c = RGB(0, 0, clamp_flt(f(-pres), 0.0, 8.0)); //negative pressure is blue!
  return c;
}

/** Element_SOAP_neighourLoop (elements/SOAP.cpp), on a { dx, dy } pair of floats */
function Element_SOAP_neighourLoop(d: { dx: number; dy: number }): void {
  if (d.dx >= (XRES / 2 - CELL)) d.dx = f(d.dx - (XRES - 2 * CELL));
  if (d.dy >= (YRES / 2 - CELL)) d.dy = f(d.dy - (YRES - 2 * CELL));
  if (d.dx < -(XRES / 2 - CELL)) d.dx = f(d.dx + (XRES - 2 * CELL));
  if (d.dy < -(YRES / 2 - CELL)) d.dy = f(d.dy + (YRES - 2 * CELL));
}

/** simulation/orbitalparts.h orbitalparts_get */
function orbitalparts_get(block1: number, block2: number, resblock1: Int32Array, resblock2: Int32Array): void {
  resblock1[0] = (block1 & 0x000000FF);
  resblock1[1] = (block1 & 0x0000FF00) >> 8;
  resblock1[2] = (block1 & 0x00FF0000) >> 16;
  resblock1[3] = (block1 & 0xFF000000) >> 24; // int: arithmetic shift as the C++
  resblock2[0] = (block2 & 0x000000FF);
  resblock2[1] = (block2 & 0x0000FF00) >> 8;
  resblock2[2] = (block2 & 0x00FF0000) >> 16;
  resblock2[3] = (block2 & 0xFF000000) >> 24;
}

export class Renderer extends RasterDrawMethods {
  // RendererSettings (private base class)
  renderMode = (RENDER_BASC | RENDER_FIRE | RENDER_SPRK | RENDER_EFFE) >>> 0;
  displayMode = 0;
  colorMode = COLOUR_DEFAULT;
  findingElement: FindingElement | null = null;
  gravityZonesEnabled = false;
  gravityFieldEnabled = false;
  decorationLevel = decorationEnabled;
  debugLines = false;
  mousePos = { X: 0, Y: 0 };
  gridSize = 0;
  gridCheckerboard = false;
  fireIntensity = 1;
  wantHdispLimitMin: HdispLimit = HdispLimitExplicit(MIN_TEMP);
  wantHdispLimitMax: HdispLimit = HdispLimitExplicit(MAX_TEMP);
  autoHdispLimitArea = { pos: { X: 0, Y: 0 }, size: { X: XRES, Y: YRES } };

  persistentVideo = new Uint32Array(WINDOWW * YRES);
  warpVideo = new Uint32Array(WINDOWW * YRES);
  stats: RendererStats = { foundParticles: 0, hdispLimitMin: 0, hdispLimitMax: 0, hdispLimitValid: false };

  rng = new RNG();
  /** unsigned char fire_r[YCELLS][XCELLS]: index y * XCELLS + x */
  fire_r = new Uint8Array(NCELL);
  fire_g = new Uint8Array(NCELL);
  fire_b = new Uint8Array(NCELL);
  /** unsigned int fire_alpha[CELL*3][CELL*3]: index y * CELL*3 + x */
  fire_alpha = new Uint32Array(CELL * 3 * CELL * 3);

  sim: Simulation | null = null;

  // per-frame scratch (no allocation per particle)
  private gfx: Gfx = { pixel_mode: 0, cola: 0, colr: 0, colg: 0, colb: 0, firea: 0, firer: 0, fireg: 0, fireb: 0 };
  private gfctxRng = new RNG();
  private orbd = new Int32Array(4);
  private orbl = new Int32Array(4);

  static renderModePresets: readonly RenderPreset[] = [
    preset('Alternative Velocity Display', RENDER_EFFE | RENDER_BASC, DISPLAY_AIRC, 0),
    preset('Velocity Display', RENDER_EFFE | RENDER_BASC, DISPLAY_AIRV, 0),
    preset('Pressure Display', RENDER_EFFE | RENDER_BASC, DISPLAY_AIRP, 0),
    preset('Persistent Display', RENDER_EFFE | RENDER_BASC, DISPLAY_PERS, 0),
    preset('Fire Display', RENDER_FIRE | RENDER_SPRK | RENDER_EFFE | RENDER_BASC, 0, 0),
    preset('Blob Display', RENDER_FIRE | RENDER_SPRK | RENDER_EFFE | RENDER_BLOB, 0, 0),
    preset('Heat Display', RENDER_BASC, DISPLAY_AIRH, COLOUR_HEAT),
    preset('Fancy Display', RENDER_FIRE | RENDER_SPRK | RENDER_GLOW | RENDER_BLUR | RENDER_EFFE | RENDER_BASC, DISPLAY_WARP, 0),
    preset('Nothing Display', RENDER_BASC, 0, 0),
    preset('Heat Gradient Display', RENDER_BASC, 0, COLOUR_GRAD),
    preset('Life Gradient Display', RENDER_BASC, 0, COLOUR_LIFE),
    preset('Dynamic Heat Display', RENDER_BASC, DISPLAY_AIRH, COLOUR_HEAT, HdispLimitAuto, HdispLimitAuto),
    preset('Vorticity Display', RENDER_EFFE | RENDER_BASC, DISPLAY_AIRW, 0),
  ];

  constructor() {
    super(WINDOWW, YRES);
    // PopulateTables(): the tables are colour.ts's (flameTable, plasmaTable, heatTable, clfmTable, firwTable)
    this.fire_r.fill(0);
    this.fire_g.fill(0);
    this.fire_b.fill(0);
    //Set defauly display modes
    this.prepare_alpha(CELL, 1.0);
    this.ClearAccumulation();
  }

  GetVideo(): Uint32Array {
    return this.video;
  }

  GetStats(): RendererStats {
    return { ...this.stats };
  }

  RenderBackground(): void {
    this.draw_air();
  }

  RenderSimulation(): void {
    this.draw_grav();
    this.DrawWalls();
    this.render_parts();

    if (this.displayMode & DISPLAY_PERS) {
      const video = this.video, pv = this.persistentVideo;
      for (let i = 0, n = WINDOWW * YRES; i < n; i++) pv[i] = Decay(video[i]);
    }

    this.render_fire();
    this.draw_other();
    this.draw_grav_zones();
    this.DrawSigns();

    if (this.displayMode & DISPLAY_WARP) {
      this.warpVideo.set(this.video);
      this.video.fill(0, 0, WINDOWW * YRES);
      this.render_gravlensing(this.warpVideo);
    }
  }

  ApproximateAccumulation(): void {
    for (let i = 0; i < 15; ++i) {
      this.render_parts();
      this.render_fire();
      this.Clear();
    }
  }

  render_gravlensing(source: Uint32Array): void {
    const sim = this.sim!;
    const fx = sim.gravOut.forceX, fy = sim.gravOut.forceY;
    const video = this.video;
    for (let py = 0; py < YRES; py++)
      for (let px = 0; px < XRES; px++) {
        const cp = ((py / CELL) | 0) * XCELLS + ((px / CELL) | 0);
        const rx = cvtt(f(f(px - f(fx[cp] * f(0.75))) + 0.5)), ry = cvtt(f(f(py - f(fy[cp] * f(0.75))) + 0.5));
        const gx = cvtt(f(f(px - f(fx[cp] * f(0.875))) + 0.5)), gy = cvtt(f(f(py - f(fy[cp] * f(0.875))) + 0.5));
        const bx = cvtt(f(f(px - fx[cp]) + 0.5)), by = cvtt(f(f(py - fy[cp]) + 0.5));
        if (rx >= 0 && rx < XRES && ry >= 0 && ry < YRES &&
          gx >= 0 && gx < XRES && gy >= 0 && gy < YRES &&
          bx >= 0 && bx < XRES && by >= 0 && by < YRES) {
          const o = py * WINDOWW + px;
          const v = video[o];
          video[o] = RGB(
            Math.min(0xFF, ((source[ry * WINDOWW + rx] >>> 16) & 0xFF) + ((v >>> 16) & 0xFF)),
            Math.min(0xFF, ((source[gy * WINDOWW + gx] >>> 8) & 0xFF) + ((v >>> 8) & 0xFF)),
            Math.min(0xFF, (source[by * WINDOWW + bx] & 0xFF) + (v & 0xFF)),
          );
        }
      }
  }

  /** Renderer::WallIcon(int wallID, Vec2<int> size): the wall's menu button texture, or null */
  static WallIcon(wallID: number, sizeX: number, sizeY: number): VideoBuffer | null {
    const wtypes = sd.wtypes;
    if (wallID < 0 || wallID >= wtypes.length) return null;
    const wtype = wtypes[wallID];

    const primary = wtype.colour;
    const secondary = wtype.eglow;

    const texture = new VideoBuffer(sizeX, sizeY);
    const each = (fn: (x: number, y: number) => void) => {
      for (let y = 0; y < sizeY; y++) for (let x = 0; x < sizeX; x++) fn(x, y);
    };
    switch (wtype.drawstyle) {
      case 1:
        // #.#.
        // ....
        // .#.#
        // ....
        each((x, y) => { if (~y & ~(x ^ (y >> 1)) & 1) texture.DrawPixel(x, y, primary); });
        break;
      case 2:
        // #.#.
        // ....
        // #.#.
        // ....
        each((x, y) => { if (~y & ~x & 1) texture.DrawPixel(x, y, primary); });
        break;
      case 3:
        // ####
        each((x, y) => texture.DrawPixel(x, y, primary));
        break;
      case 4:
        // #+.#
        // .#+.
        // +.#+
        // #+.#
        each((x, y) => {
          if (((x - y) % CELL + CELL) % CELL === 0) texture.DrawPixel(x, y, primary);
          else if (((x - y) % CELL + CELL) % CELL === 1) texture.DrawPixel(x, y, secondary);
          else texture.DrawPixel(x, y, 0x202020);
        });
        break;
    }

    switch (wallID) {
      case WL_EWALL:
        each((x, y) => { if ((x < ((sizeX / 4) | 0) + y ? 1 : 0) !== (x & y & 1)) texture.DrawPixel(x, y, primary); });
        break;
      case WL_WALLELEC:
        each((x, y) => {
          if (~y & ~x & 1) texture.DrawPixel(x, y, primary);
          else texture.DrawPixel(x, y, 0x808080);
        });
        break;
      case WL_EHOLE:
      case WL_STASIS:
        each((x, y) => { if ((x < ((sizeX / 4) | 0) + y ? 1 : 0) === (x & y & 1)) texture.DrawPixel(x, y, primary); });
        break;
      case WL_ERASE:
        each((x, y) => {
          if ((x < ((sizeX / 2) | 0)) ? (~y & ~(x ^ (y >> 1)) & 1) : true) texture.DrawPixel(x, y, primary);
        });
        texture.BlendChar(((sizeX / 2) | 0) - 4, ((sizeY / 2) | 0) - 2, 0xE06C, WithAlpha(0xFF0000, 0xFF));
        break;
      case WL_ERASEALL: {
        let r = 100, g = 150, b = 50;
        let rd = 1, gd = -1, bd = -1;
        for (let x = 0; x < sizeX; x++) {
          r += 15 * rd;
          g += 15 * gd;
          b += 15 * bd;
          if (r > 200) rd = -1;
          if (g > 200) gd = -1;
          if (b > 200) bd = -1;
          if (r < 15) rd = 1;
          if (g < 15) gd = 1;
          if (b < 15) bd = 1;
          const rc = Math.min(150, Math.max(0, r));
          const gc = Math.min(200, Math.max(0, g));
          const bc = Math.min(200, Math.max(0, b));
          texture.DrawLine(x, 0, x, sizeY - 1, RGB(rc, gc, bc));
        }
        texture.BlendChar(((sizeX / 2) | 0) - 10, ((sizeY / 2) | 0) - 2, 0xE06C, WithAlpha(0xFF0000, 0xFF));
        texture.BlendChar(((sizeX / 2) | 0) + 1, ((sizeY / 2) | 0) - 2, 0xE06C, WithAlpha(0xFF0000, 0xFF));
        break;
      }
      case WL_STREAM:
        texture.DrawRect(0, 0, sizeX, sizeY, 0xA0A0A0);
        texture.AddChar(4, 2, 0xE00D, WithAlpha(0xFFFFFF, 0xFF));
        texture.AddChar(8, 2, 0xE06D, WithAlpha(0xFFFFFF, 0xFF));
        break;
    }
    return texture;
  }

  DrawSigns(): void {
    const signs = this.sim!.signs.slice();
    for (const currentSign of signs) {
      if (currentSign.text.length) {
        const d = sign_getDisplayText(currentSign, this.sim);
        const x = d.x, y = d.y, w = d.w, h = d.h;
        this.DrawFilledRect(x + 1, y + 1, w, h - 1, 0x000000);
        this.DrawRect(x, y, w + 1, h, 0xC0C0C0);
        this.BlendText(x + 3, y + 4, d.text, WithAlpha(0xFFFFFF, 255));

        if (currentSign.ju !== SIGN_None) {
          let x = currentSign.x;
          let y = currentSign.y;
          const dx = 1 - currentSign.ju;
          const dy = (currentSign.y > 18) ? -1 : 1;
          for (let j = 0; j < 4; j++) {
            this.DrawPixel(x, y, 0xC0C0C0);
            x += dx;
            y += dy;
          }
        }
      }
    }
  }

  render_parts(): void {
    const elements = sd.elements;
    const sim = this.sim!;
    const video = this.video;
    const fire_r = this.fire_r, fire_g = this.fire_g, fire_b = this.fire_b;
    const gfctx: GraphicsFuncContext = {
      ren: this,
      sim,
      rng: this.gfctxRng,
      pipeSubcallCpart: null,
      pipeSubcallTpart: null,
    };
    gfctx.rng.seed(this.rng.call());
    const g = this.gfx;
    let deca: number, decr: number, decg: number, decb: number, cola: number, colr: number, colg: number, colb: number;
    let firea: number, firer: number, fireg: number, fireb: number, pixel_mode: number, q: number, t: number;
    let nx: number, ny: number, x: number, y: number;
    const orbd = this.orbd, orbl = this.orbl;
    orbd.fill(0); orbl.fill(0);
    let drawing_budget = 1000000; //Serves as an upper bound for costly effects such as SPARK, FLARE and LFLARE
    const renderMode = this.renderMode, colorMode = this.colorMode, displayMode = this.displayMode;
    const findingElement = this.findingElement;
    const useLuaCallbacks = !!(sim as unknown as { useLuaCallbacks?: boolean }).useLuaCallbacks;

    const parts = sim.parts;
    if (this.gridSize) { //draws the grid
      const gs4 = this.gridSize * 4;
      if (gs4 > 0) { // prevent a division by 0
        const gridColour = WithAlpha(0x646464, 80);
        for (ny = 0; ny < YRES; ny++)
          for (nx = 0; nx < XRES; nx++) {
            if (this.gridCheckerboard) {
              if ((((nx / gs4) | 0) + ((ny / gs4) | 0)) % 2) this.BlendPixel(nx, ny, gridColour);
            } else {
              if (ny % gs4 === 0) this.BlendPixel(nx, ny, gridColour);
              if (nx % gs4 === 0 && ny % gs4 !== 0) this.BlendPixel(nx, ny, gridColour);
            }
          }
      }
    }
    this.stats.foundParticles = 0;
    for (let i = 0; i < parts.active; i++) {
      const part = parts[i];
      if (part.type && part.type >= 0 && part.type < PT_NUM) {
        t = part.type;

        nx = cvtt(f(part.x + 0.5));
        ny = cvtt(f(part.y + 0.5));

        if (nx >= XRES || nx < 0 || ny >= YRES || ny < 0) continue;
        if (TYP(sim.photons[ny][nx]) && !(elements[t].Properties & TYPE_ENERGY) && t !== PT_STKM && t !== PT_STKM2 && t !== PT_FIGH)
          continue;

        //Defaults
        pixel_mode = 0 | PMODE_FLAT;
        cola = 255;
        const colour = elements[t].Colour;
        colr = (colour >>> 16) & 0xFF;
        colg = (colour >>> 8) & 0xFF;
        colb = colour & 0xFF;
        firer = fireg = fireb = firea = 0;

        deca = (part.dcolour >>> 24) & 0xFF;
        decr = (part.dcolour >>> 16) & 0xFF;
        decg = (part.dcolour >>> 8) & 0xFF;
        decb = (part.dcolour) & 0xFF;

        if (this.decorationLevel === decorationAntiClickbait) {
          if (deca < 250 || decr > 5 || decg > 5 || decb > 5)
            deca = 0;
          else {
            deca = 255;
            decr = decg = decb = 0;
          }
        }

        {
          const gc = graphicscache[t];
          if (gc.isready) {
            pixel_mode = gc.pixel_mode;
            cola = gc.cola;
            colr = gc.colr;
            colg = gc.colg;
            colb = gc.colb;
            firea = gc.firea;
            firer = gc.firer;
            fireg = gc.fireg;
            fireb = gc.fireb;
          } else if (!(colorMode & COLOUR_BASC)) {
            const graphics = elements[t].Graphics;
            let makeReady = true;
            if (graphics) {
              g.pixel_mode = pixel_mode; g.cola = cola; g.colr = colr; g.colg = colg; g.colb = colb;
              g.firea = firea; g.firer = firer; g.fireg = fireg; g.fireb = fireb;
              makeReady = !!graphics(gfctx, part, nx, ny, g); //That's a lot of args, a struct might be better
              pixel_mode = g.pixel_mode | 0; cola = g.cola | 0; colr = g.colr | 0; colg = g.colg | 0; colb = g.colb | 0;
              firea = g.firea | 0; firer = g.firer | 0; fireg = g.fireg | 0; fireb = g.fireb | 0;
            }
            if (makeReady && useLuaCallbacks) {
              gc.isready = 1;
              gc.pixel_mode = pixel_mode;
              gc.cola = cola;
              gc.colr = colr;
              gc.colg = colg;
              gc.colb = colb;
              gc.firea = firea;
              gc.firer = firer;
              gc.fireg = fireg;
              gc.fireb = fireb;
            }
          }
          const el = elements[t];
          if ((el.Properties & PROP_HOT_GLOW) && part.temp > f(el.HighTemperature - f(800.0))) {
            const lowT = f(el.HighTemperature - f(800.0));
            const gradv = PI / f(f(2 * el.HighTemperature) - lowT);
            const caddress = cvtt((part.temp > el.HighTemperature) ? f(el.HighTemperature - lowT) : f(part.temp - lowT));
            colr += cvtt(Math.sin(gradv * caddress) * 226);
            colg += cvtt(-Math.sin(gradv * caddress * 4.55) * 34);
            colb += cvtt(-Math.sin(gradv * caddress * 2.22) * 64);
          }

          if ((pixel_mode & FIRE_ADD) && !(renderMode & FIRE_ADD))
            pixel_mode |= PMODE_GLOW;
          if ((pixel_mode & FIRE_BLEND) && !(renderMode & FIRE_BLEND))
            pixel_mode |= PMODE_BLUR;
          if ((pixel_mode & PMODE_BLUR) && !(renderMode & PMODE_BLUR))
            pixel_mode |= PMODE_FLAT;
          if ((pixel_mode & PMODE_GLOW) && !(renderMode & PMODE_GLOW))
            pixel_mode |= PMODE_BLEND;
          if (renderMode & PMODE_BLOB)
            pixel_mode |= PMODE_BLOB;

          pixel_mode &= renderMode;

          //Alter colour based on display mode
          if (colorMode & COLOUR_HEAT) {
            firea = 255;
            const color = heatTableAt(cvtt(f(f(f(part.temp - this.stats.hdispLimitMin) / f(this.stats.hdispLimitMax - this.stats.hdispLimitMin)) * 1024)));
            firer = colr = (color >>> 16) & 0xFF;
            fireg = colg = (color >>> 8) & 0xFF;
            fireb = colb = color & 0xFF;
            cola = 255;
            if (pixel_mode & (FIREMODE | PMODE_GLOW))
              pixel_mode = (pixel_mode & ~(FIREMODE | PMODE_GLOW)) | PMODE_BLUR;
            else if ((pixel_mode & (PMODE_BLEND | PMODE_ADD)) === (PMODE_BLEND | PMODE_ADD))
              pixel_mode = (pixel_mode & ~(PMODE_BLEND | PMODE_ADD)) | PMODE_FLAT;
            else if (!pixel_mode)
              pixel_mode |= PMODE_FLAT;
          } else if (colorMode & COLOUR_LIFE) {
            const gradv = f(0.4);
            if (!(part.life < 5))
              q = cvtt(f(Math.sqrt(part.life)));
            else
              q = part.life;
            // sin of a float argument: computed as sinf, then float arithmetic
            colr = colg = colb = cvtt(f(f(f(Math.sin(f(gradv * q))) * 100) + 128));
            cola = 255;
            if (pixel_mode & (FIREMODE | PMODE_GLOW))
              pixel_mode = (pixel_mode & ~(FIREMODE | PMODE_GLOW)) | PMODE_BLUR;
            else if ((pixel_mode & (PMODE_BLEND | PMODE_ADD)) === (PMODE_BLEND | PMODE_ADD))
              pixel_mode = (pixel_mode & ~(PMODE_BLEND | PMODE_ADD)) | PMODE_FLAT;
            else if (!pixel_mode)
              pixel_mode |= PMODE_FLAT;
          } else if (colorMode & COLOUR_BASC) {
            colr = (colour >>> 16) & 0xFF;
            colg = (colour >>> 8) & 0xFF;
            colb = colour & 0xFF;
            pixel_mode = PMODE_FLAT;
          }

          //Apply decoration colour
          if (!(colorMode & ~COLOUR_GRAD) && this.decorationLevel !== decorationDisabled && deca) {
            deca++;
            if (!(pixel_mode & NO_DECO)) {
              colr = (deca * decr + (256 - deca) * colr) >> 8;
              colg = (deca * decg + (256 - deca) * colg) >> 8;
              colb = (deca * decb + (256 - deca) * colb) >> 8;
            }

            if (pixel_mode & DECO_FIRE) {
              firer = (deca * decr + (256 - deca) * firer) >> 8;
              fireg = (deca * decg + (256 - deca) * fireg) >> 8;
              fireb = (deca * decb + (256 - deca) * fireb) >> 8;
            }
          }

          if (colorMode & COLOUR_GRAD) {
            const frequency = f(0.05);
            const q2 = cvtt(f(part.temp - 40));
            const s = f(f(Math.sin(f(frequency * q2))) * 16);
            colr = cvtt(f(s + colr));
            colg = cvtt(f(s + colg));
            colb = cvtt(f(s + colb));
            if (pixel_mode & (FIREMODE | PMODE_GLOW)) pixel_mode = (pixel_mode & ~(FIREMODE | PMODE_GLOW)) | PMODE_BLUR;
          }

          //All colours are now set, check ranges
          if (colr > 255) colr = 255;
          else if (colr < 0) colr = 0;
          if (colg > 255) colg = 255;
          else if (colg < 0) colg = 0;
          if (colb > 255) colb = 255;
          else if (colb < 0) colb = 0;
          if (cola > 255) cola = 255;
          else if (cola < 0) cola = 0;

          if (firer > 255) firer = 255;
          else if (firer < 0) firer = 0;
          if (fireg > 255) fireg = 255;
          else if (fireg < 0) fireg = 0;
          if (fireb > 255) fireb = 255;
          else if (fireb < 0) fireb = 0;
          if (firea > 255) firea = 255;
          else if (firea < 0) firea = 0;

          let matchesFindingElement = false;
          if (findingElement) {
            if (findingElement.property.Name === 'type') {
              const ft = findingElement.value;
              matchesFindingElement = part.type === TYP(ft);
              if (ID(ft)) {
                matchesFindingElement = matchesFindingElement && part.ctype === ID(ft);
              }
            } else {
              const v = (part as unknown as Record<string, number>)[findingElement.property.Name];
              switch (findingElement.property.Type) {
                case StructProperty_Float:
                  matchesFindingElement = v === f(findingElement.value);
                  break;
                case StructProperty_ParticleType:
                case StructProperty_Integer:
                  matchesFindingElement = (v | 0) === (findingElement.value | 0);
                  break;
                case StructProperty_UInteger:
                  matchesFindingElement = (v >>> 0) === (findingElement.value >>> 0);
                  break;
                default:
                  break;
              }
            }

            if (matchesFindingElement) {
              colr = firer = 255;
              colg = fireg = colb = fireb = 0;
              this.stats.foundParticles++;
            } else {
              colr = (colr / 10) | 0;
              colg = (colg / 10) | 0;
              colb = (colb / 10) | 0;
              firer = (firer / 5) | 0;
              fireg = (fireg / 5) | 0;
              fireb = (fireb / 5) | 0;
            }
          }

          //Pixel rendering
          if (pixel_mode & EFFECT_LINES) {
            if (t === PT_SOAP) {
              if ((part.ctype & 3) === 3 && part.tmp >= 0 && part.tmp < NPART) {
                const d = { dx: f(parts[part.tmp].x - nx), dy: f(parts[part.tmp].y - ny) };
                Element_SOAP_neighourLoop(d);
                this.BlendLine(nx, ny, cvtt(f(f(nx + d.dx) + 0.5)), cvtt(f(f(ny + d.dy) + 0.5)), RGBA(colr, colg, colb, cola));
              }
            }
          }
          if (pixel_mode & PSPEC_STICKMAN) {
            let legr: number, legg: number, legb: number;
            let cplayer: Playerst;
            if (t === PT_STKM)
              cplayer = sim.player;
            else if (t === PT_STKM2)
              cplayer = sim.player2;
            else if (t === PT_FIGH && part.tmp >= 0 && part.tmp < MAX_FIGHTERS)
              cplayer = sim.fighters[part.tmp & 0xFF];
            else
              continue;

            const mousePos = this.mousePos;
            if (mousePos.X > (nx - 3) && mousePos.X < (nx + 3) && mousePos.Y < (ny + 3) && mousePos.Y > (ny - 3)) { //If mouse is in the head
              const hp = String(part.life).padStart(3, ' ');
              this.BlendText(mousePos.X - 8 - 2 * (part.life < 100 ? 1 : 0) - 2 * (part.life < 10 ? 1 : 0), mousePos.Y - 12, hp, WithAlpha(0xFFFFFF, 255));
            }

            if (matchesFindingElement) {
              colr = 255;
              colg = colb = 0;
            } else if (colorMode !== COLOUR_HEAT) {
              if (cplayer.fan) {
                const fanColor = 0x8080FF;
                colr = (fanColor >>> 16) & 0xFF;
                colg = (fanColor >>> 8) & 0xFF;
                colb = fanColor & 0xFF;
              } else if (cplayer.elem < PT_NUM && cplayer.elem > 0) {
                const elemColour = elements[cplayer.elem].Colour;
                colr = (elemColour >>> 16) & 0xFF;
                colg = (elemColour >>> 8) & 0xFF;
                colb = elemColour & 0xFF;
              } else {
                colr = 0x80;
                colg = 0x80;
                colb = 0xFF;
              }
            }

            if (matchesFindingElement) {
              legr = 255;
              legg = legb = 0;
            } else if (colorMode === COLOUR_HEAT) {
              legr = colr;
              legg = colg;
              legb = colb;
            } else if (t === PT_STKM2) {
              legr = 100;
              legg = 100;
              legb = 255;
            } else {
              legr = 255;
              legg = 255;
              legb = 255;
            }

            if (findingElement && !matchesFindingElement) {
              colr = (colr / 10) | 0;
              colg = (colg / 10) | 0;
              colb = (colb / 10) | 0;
              legr = (legr / 10) | 0;
              legg = (legg / 10) | 0;
              legb = (legb / 10) | 0;
            }

            const headColour = RGB(colr, colg, colb);
            //head
            if (t === PT_FIGH) {
              this.DrawLine(nx, ny + 2, nx + 2, ny, headColour);
              this.DrawLine(nx + 2, ny, nx, ny - 2, headColour);
              this.DrawLine(nx, ny - 2, nx - 2, ny, headColour);
              this.DrawLine(nx - 2, ny, nx, ny + 2, headColour);
            } else {
              this.DrawLine(nx - 2, ny + 2, nx + 2, ny + 2, headColour);
              this.DrawLine(nx - 2, ny - 2, nx + 2, ny - 2, headColour);
              this.DrawLine(nx - 2, ny - 2, nx - 2, ny + 2, headColour);
              this.DrawLine(nx + 2, ny - 2, nx + 2, ny + 2, headColour);
            }
            //legs
            const legs = cplayer.legs;
            const legColour = RGB(legr, legg, legb);
            this.DrawLine(nx, ny + 3, cvtt(legs[0]), cvtt(legs[1]), legColour);
            this.DrawLine(cvtt(legs[0]), cvtt(legs[1]), cvtt(legs[4]), cvtt(legs[5]), legColour);
            this.DrawLine(nx, ny + 3, cvtt(legs[8]), cvtt(legs[9]), legColour);
            this.DrawLine(cvtt(legs[8]), cvtt(legs[9]), cvtt(legs[12]), cvtt(legs[13]), legColour);
            if (cplayer.rocketBoots) {
              for (let leg = 0; leg < 2; leg++) {
                const nx = cvtt(legs[leg * 8 + 4]), ny = cvtt(legs[leg * 8 + 5]);
                const colr = 255, colg = 0, colb = 255;
                const comm = (cplayer.comm << 24) >> 24; // (int)(char)
                if ((comm & 0x04) === 0x04 || ((comm & 0x01) === 0x01 && leg === 0) || ((comm & 0x02) === 0x02 && leg === 1))
                  this.DrawPixel(nx, ny, 0x00FF00);
                else
                  this.DrawPixel(nx, ny, 0xFF0000);
                this.BlendPixel(nx + 1, ny, RGBA(colr, colg, colb, 223));
                this.BlendPixel(nx - 1, ny, RGBA(colr, colg, colb, 223));
                this.BlendPixel(nx, ny + 1, RGBA(colr, colg, colb, 223));
                this.BlendPixel(nx, ny - 1, RGBA(colr, colg, colb, 223));

                this.BlendPixel(nx + 1, ny - 1, RGBA(colr, colg, colb, 112));
                this.BlendPixel(nx - 1, ny - 1, RGBA(colr, colg, colb, 112));
                this.BlendPixel(nx + 1, ny + 1, RGBA(colr, colg, colb, 112));
                this.BlendPixel(nx - 1, ny + 1, RGBA(colr, colg, colb, 112));
              }
            }
          }
          if (pixel_mode & PMODE_FLAT) {
            video[ny * WINDOWW + nx] = RGB(colr, colg, colb);
          }
          if (pixel_mode & PMODE_BLEND) {
            this.BlendPixel(nx, ny, RGBA(colr, colg, colb, cola));
          }
          if (pixel_mode & PMODE_ADD) {
            this.AddPixel(nx, ny, RGBA(colr, colg, colb, cola));
          }
          if (pixel_mode & PMODE_BLOB) {
            video[ny * WINDOWW + nx] = RGB(colr, colg, colb);

            const c223 = RGBA(colr, colg, colb, 223), c112 = RGBA(colr, colg, colb, 112);
            this.BlendPixel(nx + 1, ny, c223);
            this.BlendPixel(nx - 1, ny, c223);
            this.BlendPixel(nx, ny + 1, c223);
            this.BlendPixel(nx, ny - 1, c223);

            this.BlendPixel(nx + 1, ny - 1, c112);
            this.BlendPixel(nx - 1, ny - 1, c112);
            this.BlendPixel(nx + 1, ny + 1, c112);
            this.BlendPixel(nx - 1, ny + 1, c112);
          }
          if (pixel_mode & PMODE_GLOW) {
            const cola1 = ((5 * cola) / 255) | 0;
            const c96 = RGBA(colr, colg, colb, ((96 * cola) / 255) | 0);
            const c1 = RGBA(colr, colg, colb, cola1);
            this.AddPixel(nx, ny, RGBA(colr, colg, colb, ((192 * cola) / 255) | 0));
            this.AddPixel(nx + 1, ny, c96);
            this.AddPixel(nx - 1, ny, c96);
            this.AddPixel(nx, ny + 1, c96);
            this.AddPixel(nx, ny - 1, c96);

            for (x = 1; x < 6; x++) {
              this.AddPixel(nx, ny - x, c1);
              this.AddPixel(nx, ny + x, c1);
              this.AddPixel(nx - x, ny, c1);
              this.AddPixel(nx + x, ny, c1);
              for (y = 1; y < 6; y++) {
                if (x + y > 7)
                  continue;
                this.AddPixel(nx + x, ny - y, c1);
                this.AddPixel(nx - x, ny + y, c1);
                this.AddPixel(nx + x, ny + y, c1);
                this.AddPixel(nx - x, ny - y, c1);
              }
            }
          }
          if (pixel_mode & PMODE_BLUR) {
            const c30 = RGBA(colr, colg, colb, 30), c20 = RGBA(colr, colg, colb, 20), c10 = RGBA(colr, colg, colb, 10);
            for (x = -3; x < 4; x++) {
              for (y = -3; y < 4; y++) {
                const ax = Math.abs(x), ay = Math.abs(y);
                if (ax + ay < 2 && !(ax === 2 || ay === 2))
                  this.BlendPixel(x + nx, y + ny, c30);
                if (ax + ay <= 3 && ax + ay)
                  this.BlendPixel(x + nx, y + ny, c20);
                if (ax + ay === 2)
                  this.BlendPixel(x + nx, y + ny, c10);
              }
            }
          }
          if (pixel_mode & PMODE_SPARK) {
            const flicker = f(gfctx.rng.call() % 20);
            let gradv = f(4 * part.life + flicker);
            for (x = 0; (gradv > 0.5) && (drawing_budget > 0); x++) {
              const ig = cvtt(gradv);
              const col = RGBA(
                Math.min(0xFF, (Math.imul(colr, ig) / 255) | 0),
                Math.min(0xFF, (Math.imul(colg, ig) / 255) | 0),
                Math.min(0xFF, (Math.imul(colb, ig) / 255) | 0),
              );
              this.AddPixel(nx + x, ny, col);
              this.AddPixel(nx - x, ny, col);
              this.AddPixel(nx, ny + x, col);
              this.AddPixel(nx, ny - x, col);
              gradv = f(gradv / f(1.5));
              drawing_budget--;
            }
          }
          if (pixel_mode & PMODE_FLARE) {
            const flicker = f(gfctx.rng.call() % 20);
            const gradv = f(f(flicker + f(Math.abs(part.vx) * 17)) + f(Math.abs(part.vy) * 17));
            drawing_budget = this.drawFlare(nx, ny, colr, colg, colb, gradv, f(1.2), drawing_budget);
          }
          if (pixel_mode & PMODE_LFLARE) {
            const flicker = f(gfctx.rng.call() % 20);
            const gradv = f(f(flicker + f(Math.abs(part.vx) * 17)) + f(Math.abs(part.vy) * 17));
            drawing_budget = this.drawFlare(nx, ny, colr, colg, colb, gradv, f(1.01), drawing_budget);
          }
          if (pixel_mode & EFFECT_GRAVIN) {
            this.drawOrbital(part, nx, ny, colr, colg, colb, PT_PRTI, orbd, orbl);
          }
          if (pixel_mode & EFFECT_GRAVOUT) {
            this.drawOrbital(part, nx, ny, colr, colg, colb, PT_PRTO, orbd, orbl);
          }
          if (pixel_mode & EFFECT_DBGLINES && !(displayMode & DISPLAY_PERS)) {
            // draw lines connecting wifi/portal channels
            if (this.mousePos.X === nx && this.mousePos.Y === ny && i === ID(sim.pmap[ny][nx]) && this.debugLines) {
              let type = part.type;
              const tmp = cvtt(f(f(f(part.temp - f(73.15)) / 100) + 1));
              if (type === PT_PRTI)
                type = PT_PRTO;
              else if (type === PT_PRTO)
                type = PT_PRTI;
              for (let z = 0; z < parts.active; z++) {
                if (parts[z].type === type) {
                  const othertmp = cvtt(f(f(f(parts[z].temp - f(73.15)) / 100) + 1));
                  if (tmp === othertmp)
                    this.XorLine(nx, ny, cvtt(f(parts[z].x + 0.5)), cvtt(f(parts[z].y + 0.5)));
                }
              }
            }
          }
          //Fire effects
          const fc = ((ny / CELL) | 0) * XCELLS + ((nx / CELL) | 0);
          if (firea && (pixel_mode & FIRE_BLEND)) {
            firea = (firea / 2) | 0;
            fire_r[fc] = (firea * firer + (255 - firea) * fire_r[fc]) >> 8;
            fire_g[fc] = (firea * fireg + (255 - firea) * fire_g[fc]) >> 8;
            fire_b[fc] = (firea * fireb + (255 - firea) * fire_b[fc]) >> 8;
          }
          if (firea && (pixel_mode & FIRE_ADD)) {
            firea = (firea / 8) | 0;
            firer = ((firea * firer) >> 8) + fire_r[fc];
            fireg = ((firea * fireg) >> 8) + fire_g[fc];
            fireb = ((firea * fireb) >> 8) + fire_b[fc];

            if (firer > 255)
              firer = 255;
            if (fireg > 255)
              fireg = 255;
            if (fireb > 255)
              fireb = 255;

            fire_r[fc] = firer;
            fire_g[fc] = fireg;
            fire_b[fc] = fireb;
          }
          if (firea && (pixel_mode & FIRE_SPARK)) {
            firea = (firea / 4) | 0;
            fire_r[fc] = (firea * firer + (255 - firea) * fire_r[fc]) >> 8;
            fire_g[fc] = (firea * fireg + (255 - firea) * fire_g[fc]) >> 8;
            fire_b[fc] = (firea * fireb + (255 - firea) * fire_b[fc]) >> 8;
          }
        }
      }
    }
  }

  /** the PMODE_FLARE / PMODE_LFLARE block (identical but for the divisor); returns drawing_budget */
  private drawFlare(nx: number, ny: number, colr: number, colg: number, colb: number, gradv: number, div: number,
    drawing_budget: number): number {
    const g4 = f(gradv * 4), g2 = f(gradv * 2);
    this.BlendPixel(nx, ny, RGBA(colr, colg, colb, cvtt(g4 > 255 ? 255 : g4)));
    const a2 = RGBA(colr, colg, colb, cvtt(g2 > 255 ? 255 : g2));
    this.BlendPixel(nx + 1, ny, a2);
    this.BlendPixel(nx - 1, ny, a2);
    this.BlendPixel(nx, ny + 1, a2);
    this.BlendPixel(nx, ny - 1, a2);
    if (gradv > 255) gradv = 255;
    const a1 = RGBA(colr, colg, colb, cvtt(gradv));
    this.BlendPixel(nx + 1, ny - 1, a1);
    this.BlendPixel(nx - 1, ny - 1, a1);
    this.BlendPixel(nx + 1, ny + 1, a1);
    this.BlendPixel(nx - 1, ny + 1, a1);
    for (let x = 1; (gradv > 0.5) && (drawing_budget > 0); x++) {
      const c = RGBA(colr, colg, colb, cvtt(gradv));
      this.AddPixel(nx + x, ny, c);
      this.AddPixel(nx - x, ny, c);
      this.AddPixel(nx, ny + x, c);
      this.AddPixel(nx, ny - x, c);
      gradv = f(gradv / div);
      drawing_budget--;
    }
    return drawing_budget;
  }

  /** the EFFECT_GRAVIN / EFFECT_GRAVOUT block: skip is PT_PRTI resp. PT_PRTO */
  private drawOrbital(part: Particle, nx: number, ny: number, colr: number, colg: number, colb: number, skip: number,
    orbd: Int32Array, orbl: Int32Array): void {
    const sim = this.sim!;
    let nxo = 0;
    let nyo = 0;
    let drad = 0.0;
    let ddist = 0.0;
    orbitalparts_get(part.life, part.ctype, orbd, orbl);
    for (let r = 0; r < 4; r++) {
      ddist = f(orbd[r] / f(16.0));
      drad = f(f(f(f(orbl[r]) * PI_F) / f(180.0)) * SQRT2_F);
      // cos/sin of a float: computed as cosf/sinf
      nxo = cvtt(f(ddist * f(Math.cos(drad))));
      nyo = cvtt(f(ddist * f(Math.sin(drad))));
      if (ny + nyo > 0 && ny + nyo < YRES && nx + nxo > 0 && nx + nxo < XRES && TYP(sim.pmap[ny + nyo][nx + nxo]) !== skip)
        this.AddPixel(nx + nxo, ny + nyo, RGBA(colr, colg, colb, 255 - orbd[r]));
    }
  }

  draw_other(): void { // EMP effect
    let emp_decor = this.sim!.emp_decor;
    if (emp_decor > 40) emp_decor = 40;
    if (emp_decor < 0) emp_decor = 0;
    if (!(this.renderMode & EFFECT)) // not in nothing mode
      return;
    if (emp_decor > 0) {
      let r = cvtt(emp_decor * 2.5), g = cvtt(100 + emp_decor * 1.5);
      const b = 255;
      let a = cvtt((1.0 * emp_decor / 110) * 255);
      if (r > 255) r = 255;
      if (g > 255) g = 255;
      if (b > 255) g = 255;
      if (a > 255) a = 255;
      const c = RGBA(r, g, b, a);
      for (let j = 0; j < YRES; j++)
        for (let i = 0; i < XRES; i++) {
          this.BlendPixel(i, j, c);
        }
    }
  }

  draw_grav_zones(): void {
    if (!this.gravityZonesEnabled) {
      return;
    }
    const mask = this.sim!.gravIn.mask;
    for (let py = 0; py < YCELLS; py++)
      for (let px = 0; px < XCELLS; px++) {
        if (mask[py * XCELLS + px]) {
          const npx = px * CELL, npy = py * CELL;
          for (let oy = 0; oy < CELL; oy++)
            for (let ox = 0; ox < CELL; ox++) {
              this.BlendPixel(npx + ox, npy + oy, WithAlpha(ox === oy ? 0xFFC800 : 0x202020, 120));
            }
        }
      }
  }

  draw_grav(): void {
    if (!this.gravityFieldEnabled) {
      return;
    }
    const fx = this.sim!.gravOut.forceX, fy = this.sim!.gravOut.forceY;
    for (let py = 0; py < YCELLS; py++)
      for (let px = 0; px < XCELLS; px++) {
        const gx = fx[py * XCELLS + px];
        const gy = fy[py * XCELLS + px];
        const agx = Math.abs(gx);
        const agy = Math.abs(gy);
        if (agx <= f(0.001) && agy <= f(0.001)) {
          continue;
        }
        let npX = f(px * CELL), npY = f(py * CELL);
        const dist = f(agx + agy);
        for (let i = 0; i < 4; ++i) {
          npX = f(npX - f(gx * 0.5));
          npY = f(npY - f(gy * 0.5));
          this.AddPixel(cvtt(f(npX + 0.5)), cvtt(f(npY + 0.5)), WithAlpha(0xFFFFFF, cvtt(f(dist * 20.0))));
        }
      }
  }

  draw_air(): void {
    const sim = this.sim!;
    const displayMode = this.displayMode;
    if (!sim.aheat_enable && (displayMode & DISPLAY_AIRH))
      return;
    if (!(displayMode & DISPLAY_AIR))
      return;
    const pv = sim.pv;
    const hv = sim.hv;
    const vx = sim.vx;
    const vy = sim.vy;
    const video = this.video;
    let c = 0x000000;
    for (let y = 0; y < YCELLS; y++)
      for (let x = 0; x < XCELLS; x++) {
        if (displayMode & DISPLAY_AIRP) {
          c = PressureToColour(pv[y][x]);
        } else if (displayMode & DISPLAY_AIRV) {
          c = RGB(clamp_flt(Math.abs(vx[y][x]), 0.0, 8.0), //vx adds red
            clamp_flt(pv[y][x], 0.0, 8.0), //pressure adds green
            clamp_flt(Math.abs(vy[y][x]), 0.0, 8.0)); //vy adds blue
        } else if (displayMode & DISPLAY_AIRH) {
          c = HeatToColour(hv[y][x], this.stats.hdispLimitMin, this.stats.hdispLimitMax);
        } else if (displayMode & DISPLAY_AIRC) {
          let r: number;
          let g: number;
          let b: number;
          // velocity adds grey
          r = clamp_flt(Math.abs(vx[y][x]), 0.0, 24.0) + clamp_flt(Math.abs(vy[y][x]), 0.0, 20.0);
          g = clamp_flt(Math.abs(vx[y][x]), 0.0, 20.0) + clamp_flt(Math.abs(vy[y][x]), 0.0, 24.0);
          b = clamp_flt(Math.abs(vx[y][x]), 0.0, 24.0) + clamp_flt(Math.abs(vy[y][x]), 0.0, 20.0);
          if (pv[y][x] > 0.0) {
            r += clamp_flt(pv[y][x], 0.0, 16.0); //pressure adds red!
            if (r > 255) r = 255;
            if (g > 255) g = 255;
            if (b > 255) b = 255;
            c = RGB(r, g, b);
          } else {
            b += clamp_flt(f(-pv[y][x]), 0.0, 16.0); //pressure adds blue!
            if (r > 255) r = 255;
            if (g > 255) g = 255;
            if (b > 255) b = 255;
            c = RGB(r, g, b);
          }
        } else if (displayMode & DISPLAY_AIRW) {
          const w = f(4 * Air.vorticity(sim, y, x));
          if (w > 0.0)
            c = RGB(clamp_flt(w, 0.0, 8.0), 0, 0); //positive vorticity is red
          else
            c = RGB(0, 0, clamp_flt(f(-w), 0.0, 8.0)); //negative vorticity is blue
        }
        if (this.findingElement) {
          c = RGB((((c >>> 16) & 0xFF) / 10) | 0, (((c >>> 8) & 0xFF) / 10) | 0, ((c & 0xFF) / 10) | 0);
        }
        for (let j = 0; j < CELL; j++) //draws the colors
          for (let i = 0; i < CELL; i++)
            video[(y * CELL + j) * WINDOWW + x * CELL + i] = c;
      }
  }

  DrawWalls(): void {
    const sim = this.sim!;
    const wtypes = sd.wtypes;
    const video = this.video;
    const W = WINDOWW;
    const fire_r = this.fire_r, fire_g = this.fire_g, fire_b = this.fire_b;
    const set = (px: number, py: number, c: number) => { video[py * W + px] = c; };
    for (let y = 0; y < YCELLS; y++)
      for (let x = 0; x < XCELLS; x++)
        if (sim.bmap[y][x]) {
          const wt = sim.bmap[y][x];
          if (wt >= UI_WALLCOUNT)
            continue;
          const powered = sim.emap[y][x];
          let prgb = wtypes[wt].colour;
          let grgb = wtypes[wt].eglow;

          if (this.findingElement) {
            prgb = RGB((((prgb >>> 16) & 0xFF) / 10) | 0, (((prgb >>> 8) & 0xFF) / 10) | 0, ((prgb & 0xFF) / 10) | 0);
            grgb = RGB((((grgb >>> 16) & 0xFF) / 10) | 0, (((grgb >>> 8) & 0xFF) / 10) | 0, ((grgb & 0xFF) / 10) | 0);
          }

          const pc = prgb;
          const gc = grgb;

          switch (wtypes[wt].drawstyle) {
            case 0:
              if (wt === WL_EWALL || wt === WL_STASIS) {
                const reverse = wt === WL_STASIS;
                if ((powered > 0) !== reverse) {
                  for (let j = 0; j < CELL; j++)
                    for (let i = 0; i < CELL; i++)
                      if (i & j & 1)
                        set(x * CELL + i, y * CELL + j, pc);
                } else {
                  for (let j = 0; j < CELL; j++)
                    for (let i = 0; i < CELL; i++)
                      if (!(i & j & 1))
                        set(x * CELL + i, y * CELL + j, pc);
                }
              } else if (wt === WL_WALLELEC) {
                for (let j = 0; j < CELL; j++)
                  for (let i = 0; i < CELL; i++) {
                    if (!((y * CELL + j) % 2) && !((x * CELL + i) % 2))
                      set(x * CELL + i, y * CELL + j, pc);
                    else
                      set(x * CELL + i, y * CELL + j, 0x808080);
                  }
              } else if (wt === WL_EHOLE) {
                if (powered) {
                  for (let j = 0; j < CELL; j++)
                    for (let i = 0; i < CELL; i++)
                      set(x * CELL + i, y * CELL + j, 0x242424);
                  for (let j = 0; j < CELL; j += 2)
                    for (let i = 0; i < CELL; i += 2)
                      set(x * CELL + i, y * CELL + j, 0x000000);
                } else {
                  for (let j = 0; j < CELL; j += 2)
                    for (let i = 0; i < CELL; i += 2)
                      set(x * CELL + i, y * CELL + j, 0x242424);
                }
              } else if (wt === WL_STREAM) {
                let xf = f(x * CELL + f(CELL * 0.5));
                let yf = f(y * CELL + f(CELL * 0.5));
                let oldX = cvtt(f(xf + 0.5)), oldY = cvtt(f(yf + 0.5));
                let newX: number, newY: number;
                let xVel = f(sim.vx[y][x] * f(0.125)), yVel = f(sim.vy[y][x] * f(0.125));
                // there is no velocity here, draw a streamline and continue
                if (!xVel && !yVel) {
                  this.BlendText(x * CELL, y * CELL - 2, '', WithAlpha(0xFFFFFF, 128));
                  this.AddPixel(oldX, oldY, WithAlpha(0xFFFFFF, 255));
                  continue;
                }
                let changed = false;
                for (let t = 0; t < 1024; t++) {
                  newX = cvtt(f(xf + 0.5));
                  newY = cvtt(f(yf + 0.5));
                  if (newX !== oldX || newY !== oldY) {
                    changed = true;
                    oldX = newX;
                    oldY = newY;
                  }
                  if (changed && (newX < 0 || newX >= XRES || newY < 0 || newY >= YRES))
                    break;
                  this.AddPixel(newX, newY, WithAlpha(0xFFFFFF, 64));
                  // cache velocity and other checks so we aren't running them constantly
                  if (changed) {
                    const wallX = (newX / CELL) | 0;
                    const wallY = (newY / CELL) | 0;
                    xVel = f(sim.vx[wallY][wallX] * f(0.125));
                    yVel = f(sim.vy[wallY][wallX] * f(0.125));
                    if (wallX !== x && wallY !== y && sim.bmap[wallY][wallX] === WL_STREAM)
                      break;
                  }
                  xf = f(xf + xVel);
                  yf = f(yf + yVel);
                }
                this.BlendText(x * CELL, y * CELL - 2, '', WithAlpha(0xFFFFFF, 128));
              }
              break;
            case 1:
              for (let j = 0; j < CELL; j += 2)
                for (let i = (j >> 1) & 1; i < CELL; i += 2)
                  set(x * CELL + i, y * CELL + j, pc);
              break;
            case 2:
              for (let j = 0; j < CELL; j += 2)
                for (let i = 0; i < CELL; i += 2)
                  set(x * CELL + i, y * CELL + j, pc);
              break;
            case 3:
              for (let j = 0; j < CELL; j++)
                for (let i = 0; i < CELL; i++)
                  set(x * CELL + i, y * CELL + j, pc);
              break;
            case 4:
              for (let j = 0; j < CELL; j++)
                for (let i = 0; i < CELL; i++)
                  if (i === j)
                    set(x * CELL + i, y * CELL + j, pc);
                  else if (i === j + 1 || (i === 0 && j === CELL - 1))
                    set(x * CELL + i, y * CELL + j, gc);
                  else
                    set(x * CELL + i, y * CELL + j, 0x202020);
              break;
          }

          // when in blob view, draw some blobs...
          if (this.renderMode & PMODE_BLOB) {
            switch (wtypes[wt].drawstyle) {
              case 0:
                if (wt === WL_EWALL || wt === WL_STASIS) {
                  const reverse = wt === WL_STASIS;
                  if ((powered > 0) !== reverse) {
                    for (let j = 0; j < CELL; j++)
                      for (let i = 0; i < CELL; i++)
                        if (i & j & 1)
                          this.DrawBlob(x * CELL + i, y * CELL + j, prgb);
                  } else {
                    for (let j = 0; j < CELL; j++)
                      for (let i = 0; i < CELL; i++)
                        if (!(i & j & 1))
                          this.DrawBlob(x * CELL + i, y * CELL + j, prgb);
                  }
                } else if (wt === WL_WALLELEC) {
                  for (let j = 0; j < CELL; j++)
                    for (let i = 0; i < CELL; i++) {
                      if (!((y * CELL + j) % 2) && !((x * CELL + i) % 2))
                        this.DrawBlob(x * CELL + i, y * CELL + j, prgb);
                      else
                        this.DrawBlob(x * CELL + i, y * CELL + j, 0x808080);
                    }
                } else if (wt === WL_EHOLE) {
                  if (powered) {
                    for (let j = 0; j < CELL; j++)
                      for (let i = 0; i < CELL; i++)
                        this.DrawBlob(x * CELL + i, y * CELL + j, 0x242424);
                    for (let j = 0; j < CELL; j += 2)
                      for (let i = 0; i < CELL; i += 2)
                        // looks bad if drawing black blobs
                        set(x * CELL + i, y * CELL + j, 0x000000);
                  } else {
                    for (let j = 0; j < CELL; j += 2)
                      for (let i = 0; i < CELL; i += 2)
                        this.DrawBlob(x * CELL + i, y * CELL + j, 0x242424);
                  }
                }
                break;
              case 1:
                for (let j = 0; j < CELL; j += 2)
                  for (let i = (j >> 1) & 1; i < CELL; i += 2)
                    this.DrawBlob(x * CELL + i, y * CELL + j, prgb);
                break;
              case 2:
                for (let j = 0; j < CELL; j += 2)
                  for (let i = 0; i < CELL; i += 2)
                    this.DrawBlob(x * CELL + i, y * CELL + j, prgb);
                break;
              case 3:
                for (let j = 0; j < CELL; j++)
                  for (let i = 0; i < CELL; i++)
                    this.DrawBlob(x * CELL + i, y * CELL + j, prgb);
                break;
              case 4:
                for (let j = 0; j < CELL; j++)
                  for (let i = 0; i < CELL; i++)
                    if (i === j)
                      this.DrawBlob(x * CELL + i, y * CELL + j, prgb);
                    else if (i === j + 1 || (i === 0 && j === CELL - 1))
                      set(x * CELL + i, y * CELL + j, gc);
                    else
                      // looks bad if drawing black blobs
                      set(x * CELL + i, y * CELL + j, 0x202020);
                break;
            }
          }

          if (wtypes[wt].eglow && powered) {
            // glow if electrified
            const glow = wtypes[wt].eglow;
            const alpha = 255;
            const fo = ((y / CELL) | 0) * XCELLS + ((x / CELL) | 0); // fire_r[y/CELL][x/CELL], as the original
            let cr = (alpha * ((glow >>> 16) & 0xFF) + (255 - alpha) * fire_r[fo]) >> 8;
            let cg = (alpha * ((glow >>> 8) & 0xFF) + (255 - alpha) * fire_g[fo]) >> 8;
            let cb = (alpha * (glow & 0xFF) + (255 - alpha) * fire_b[fo]) >> 8;

            if (cr > 255) cr = 255;
            if (cg > 255) cg = 255;
            if (cb > 255) cb = 255;
            fire_r[y * XCELLS + x] = cr;
            fire_g[y * XCELLS + x] = cg;
            fire_b[y * XCELLS + x] = cb;
          }
        }
  }

  render_fire(): void {
    if (!(this.renderMode & FIREMODE))
      return;
    const fire_r = this.fire_r, fire_g = this.fire_g, fire_b = this.fire_b, fire_alpha = this.fire_alpha;
    const finding = !!this.findingElement;
    let x: number, y: number, r: number, g: number, b: number, a: number;
    for (let j = 0; j < YCELLS; j++)
      for (let i = 0; i < XCELLS; i++) {
        r = fire_r[j * XCELLS + i];
        g = fire_g[j * XCELLS + i];
        b = fire_b[j * XCELLS + i];
        if (r || g || b) {
          const rgb = RGB(r, g, b);
          for (y = -CELL; y < 2 * CELL; y++)
            for (x = -CELL; x < 2 * CELL; x++) {
              a = fire_alpha[(y + CELL) * (CELL * 3) + x + CELL];
              if (finding)
                a = (a / 2) | 0;
              this.AddFirePixel(i * CELL + x, j * CELL + y, rgb, a);
            }
        }
        r *= 8;
        g *= 8;
        b *= 8;
        for (y = -1; y < 2; y++)
          for (x = -1; x < 2; x++)
            if ((x || y) && i + x >= 0 && j + y >= 0 && i + x < XCELLS && j + y < YCELLS) {
              r += fire_r[(j + y) * XCELLS + i + x];
              g += fire_g[(j + y) * XCELLS + i + x];
              b += fire_b[(j + y) * XCELLS + i + x];
            }
        r = (r / 16) | 0;
        g = (g / 16) | 0;
        b = (b / 16) | 0;
        fire_r[j * XCELLS + i] = r > 4 ? r - 4 : 0;
        fire_g[j * XCELLS + i] = g > 4 ? g - 4 : 0;
        fire_b[j * XCELLS + i] = b > 4 ? b - 4 : 0;
      }
  }

  AdjustHdispLimit(): void {
    const stats = this.stats;
    stats.hdispLimitValid = false;
    let autoHdispLimitMin = f(MAX_TEMP);
    let autoHdispLimitMax = f(MIN_TEMP);
    const area = this.autoHdispLimitArea;
    const visit = (px: number, py: number, value: number) => {
      if (px >= area.pos.X && px < area.pos.X + area.size.X && py >= area.pos.Y && py < area.pos.Y + area.size.Y) {
        autoHdispLimitMin = Math.min(autoHdispLimitMin, value);
        autoHdispLimitMax = Math.max(autoHdispLimitMax, value);
        stats.hdispLimitValid = true;
      }
    };
    if (this.wantHdispLimitMin.auto || this.wantHdispLimitMax.auto) {
      const sim = this.sim!;
      if (this.colorMode & COLOUR_HEAT) {
        for (let i = 0; i < sim.parts.active; ++i) {
          const t = sim.parts[i].type;
          if (t > 0 && t < PT_NUM) {
            if (!sd.elements[t].HeatConduct) {
              continue;
            }
            const nx = cvtt(f(sim.parts[i].x + 0.5));
            const ny = cvtt(f(sim.parts[i].y + 0.5));
            visit(nx, ny, sim.parts[i].temp);
          }
        }
      }
      if (sim.aheat_enable && (this.displayMode & DISPLAY_AIR) && (this.displayMode & DISPLAY_AIRH)) {
        const hv = sim.hv;
        for (let py = 0; py < YCELLS; py++)
          for (let px = 0; px < XCELLS; px++)
            visit(px * CELL, py * CELL, hv[py][px]);
      }

      // min and max will shrink towards new limits slowly, to prevent rapid flashes (but they still expand immediately)
      const maxGap = f(stats.hdispLimitMax - autoHdispLimitMax);
      autoHdispLimitMax = Math.max(autoHdispLimitMax, f(stats.hdispLimitMax - f(maxGap * f(0.05))));
      const minGap = f(autoHdispLimitMin - stats.hdispLimitMin);
      autoHdispLimitMin = Math.min(autoHdispLimitMin, f(stats.hdispLimitMin + f(minGap * f(0.05))));

      // Ensure a 1C gap between min and max to handle odd effects and flashing when there's miniscule temperature gaps
      autoHdispLimitMax = Math.min(MAX_TEMP, Math.max(autoHdispLimitMax, f(autoHdispLimitMin + 1)));
      autoHdispLimitMin = Math.max(MIN_TEMP, Math.min(autoHdispLimitMin, f(autoHdispLimitMax - 1)));
    }
    stats.hdispLimitMin = autoHdispLimitMin;
    stats.hdispLimitMax = autoHdispLimitMax;
    if (!this.wantHdispLimitMin.auto) stats.hdispLimitMin = f(this.wantHdispLimitMin.value);
    if (!this.wantHdispLimitMax.auto) stats.hdispLimitMax = f(this.wantHdispLimitMax.value);
    if (Number.isNaN(stats.hdispLimitMin)) stats.hdispLimitMin = MIN_TEMP;
    if (Number.isNaN(stats.hdispLimitMax)) stats.hdispLimitMax = MAX_TEMP;
    stats.hdispLimitMax = Math.min(Math.max(stats.hdispLimitMax, MIN_TEMP), MAX_TEMP);
    stats.hdispLimitMin = Math.min(Math.max(stats.hdispLimitMin, MIN_TEMP), stats.hdispLimitMax);
  }

  /** Renderer::Clear (hides RasterDrawMethods::Clear): restore the persistent frame or blank, then AdjustHdispLimit */
  override Clear(): void {
    if (this.displayMode & DISPLAY_PERS) {
      this.video.set(this.persistentVideo);
    } else {
      this.video.fill(0, 0, WINDOWW * YRES);
    }
    this.AdjustHdispLimit();
  }

  DrawBlob(px: number, py: number, colour: number): void {
    this.BlendPixel(px + 1, py, WithAlpha(colour, 112));
    this.BlendPixel(px - 1, py, WithAlpha(colour, 112));
    this.BlendPixel(px, py + 1, WithAlpha(colour, 112));
    this.BlendPixel(px, py - 1, WithAlpha(colour, 112));
    this.BlendPixel(px + 1, py - 1, WithAlpha(colour, 64));
    this.BlendPixel(px - 1, py - 1, WithAlpha(colour, 64));
    this.BlendPixel(px + 1, py + 1, WithAlpha(colour, 64));
    this.BlendPixel(px - 1, py + 1, WithAlpha(colour, 64));
  }

  prepare_alpha(_size: number, intensity: number): void {
    this.fireIntensity = f(intensity);
    //TODO: implement size
    const multiplier = f(f(255.0) * this.fireIntensity);
    const N = CELL * 3;
    const temp = new Float32Array(N * N);
    for (let x = 0; x < CELL; x++)
      for (let y = 0; y < CELL; y++)
        for (let i = -CELL; i < CELL; i++)
          for (let j = -CELL; j < CELL; j++)
            temp[(y + CELL + j) * N + x + CELL + i] = f(temp[(y + CELL + j) * N + x + CELL + i] + f(Math.exp(f(f(-0.1) * (i * i + j * j)))));
    for (let x = 0; x < N; x++)
      for (let y = 0; y < N; y++)
        this.fire_alpha[y * N + x] = cvtt(f(f(multiplier * temp[y * N + x]) / (CELL * CELL)));
  }

  ClearAccumulation(): void {
    this.fire_r.fill(0);
    this.fire_g.fill(0);
    this.fire_b.fill(0);
    this.persistentVideo.fill(0);
  }

  ApplySettings(newSettings: RendererSettings): void {
    if (!(newSettings.renderMode & FIREMODE) && (this.renderMode & FIREMODE)) {
      this.ClearAccumulation();
    }
    if (!(newSettings.displayMode & DISPLAY_PERS) && (this.displayMode & DISPLAY_PERS)) {
      this.ClearAccumulation();
    }
    const self = this as unknown as Record<string, unknown>;
    for (const k of SETTINGS_FIELDS) self[k] = newSettings[k];
  }

  /** the current settings as a RendererSettings (the UI edits a copy and applies it) */
  GetSettings(): RendererSettings {
    const s = new RendererSettings();
    const self = this as unknown as Record<string, unknown>;
    const out = s as unknown as Record<string, unknown>;
    for (const k of SETTINGS_FIELDS) out[k] = self[k];
    return s;
  }
}
