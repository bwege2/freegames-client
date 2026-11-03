// simulation/Element.h / Element.cpp: an element's properties and callbacks.
import {
  CELL, CFDS, DECO_FIRE, FIRE_BLEND, ID, IPH, IPL, ITH, ITL, NT, PMAPID, PMODE, PMODE_BLUR, PMODE_GLOW, PROP_NOCTYPEDRAW,
  PROP_RADIOACTIVE, R_TEMP, TYP, TYPE_GAS, TYPE_LIQUID, TYPE_SOLID, XRES, YRES,
} from './config.ts';
import {
  PT_DESL, PT_DSTW, PT_FIRE, PT_GAS, PT_ICEI, PT_LAVA, PT_LIFE, PT_OIL, PT_SALT, PT_SLTW, PT_SNOW, PT_WATR, PT_WTRV,
} from './numbers.ts';
import { f } from './cpp.ts';
import { Particle } from './particle.ts';
import type { RNG } from './cpp.ts';
import type { Simulation } from './simulation.ts';

/** what the renderer passes to a graphics function (graphics/Renderer.h GraphicsFuncContext) */
export interface GraphicsFuncContext {
  /** RendererSettings: decorationLevel and the rest the elements read */
  ren: { decorationLevel: number };
  sim: Simulation;
  rng: RNG;
  pipeSubcallCpart: Particle | null;
  pipeSubcallTpart: Particle | null;
}

/** RendererSettings::DecorationLevel */
export const decorationDisabled = 0, decorationEnabled = 1, decorationAntiClickbait = 2;

/**
 * The out-parameters of GRAPHICS_FUNC_ARGS (`int *pixel_mode, int *cola, ...`): a graphics function writes
 * `*colr = 5` as `g.colr = 5`.
 */
export interface Gfx {
  pixel_mode: number;
  cola: number; colr: number; colg: number; colb: number;
  firea: number; firer: number; fireg: number; fireb: number;
}

/** UPDATE_FUNC_ARGS: Simulation* sim, int i, int x, int y, int surround_space, int nt, Parts &parts, int pmap[YRES][XRES] */
export type UpdateFunc = (sim: Simulation, i: number, x: number, y: number, surround_space: number, nt: number,
  parts: Particle[], pmap: Int32Array[]) => number;
/** GRAPHICS_FUNC_ARGS: GraphicsFuncContext &gfctx, const Particle *cpart, int nx, int ny, int *pixel_mode, ... */
export type GraphicsFunc = (gfctx: GraphicsFuncContext, cpart: Particle, nx: number, ny: number, g: Gfx) => number;
/** ELEMENT_CREATE_FUNC_ARGS: Simulation *sim, int i, int x, int y, int t, int v */
export type CreateFunc = (sim: Simulation, i: number, x: number, y: number, t: number, v: number) => void;
/** ELEMENT_CREATE_ALLOWED_FUNC_ARGS: Simulation *sim, int i, int x, int y, int t */
export type CreateAllowedFunc = (sim: Simulation, i: number, x: number, y: number, t: number) => boolean;
/** ELEMENT_CHANGETYPE_FUNC_ARGS: Simulation *sim, int i, int x, int y, int from, int to */
export type ChangeTypeFunc = (sim: Simulation, i: number, x: number, y: number, from: number, to: number) => void;
/** CTYPEDRAW_FUNC_ARGS: Simulation *sim, int i, int t, int v */
export type CtypeDrawFunc = (sim: Simulation, i: number, t: number, v: number) => boolean;

export class Element {
  Identifier = 'DEFAULT_INVALID';
  Name = '';
  /** 0xRRGGBB (RGB) */
  Colour = 0xFF00FF;
  MenuVisible = 0;
  MenuSection = 0;
  MenuSort = 0;
  Enabled = 0;

  Advection = 0.0;
  AirDrag = f(-0.0 * CFDS);
  AirLoss = 1.0;
  Loss = 1.0;
  Collision = 0.0;
  Gravity = 0.0;
  NewtonianGravity = 1.0;
  Diffusion = 0.0;
  HotAir = f(0.0 * CFDS);
  Falldown = 0;
  Flammable = 0;
  Explosive = 0;
  Meltable = 0;
  Hardness = 30;
  PhotonReflectWavelengths = 0x3FFFFFFF;
  Weight = 50;
  /** unsigned char */
  HeatConduct = 128;
  HeatCapacity = 1.0;
  Description = 'No description';
  Properties = TYPE_SOLID;
  CarriesTypeIn = 0;

  LowPressure = IPL;
  LowPressureTransition = NT;
  HighPressure = IPH;
  HighPressureTransition = NT;
  LowTemperature = ITL;
  LowTemperatureTransition = NT;
  HighTemperature = ITH;
  HighTemperatureTransition = NT;

  Update: UpdateFunc | null = null;
  Graphics: GraphicsFunc | null = Element.defaultGraphics;
  Create: CreateFunc | null = null;
  CreateAllowed: CreateAllowedFunc | null = null;
  ChangeType: ChangeTypeFunc | null = null;
  CtypeDraw: CtypeDrawFunc | null = null;
  /** IconGenerator: only some tools/elements have one; the port draws their buttons from the generator's id */
  IconGenerator: ((id: number, w: number, h: number) => ImageData | null) | null = null;

  DefaultProperties = new Particle();

  constructor() {
    this.DefaultProperties.temp = f(R_TEMP + f(273.15));
  }

  // Element.cpp

  static legacyUpdate(sim: Simulation, i: number, x: number, y: number, _surround_space: number, _nt: number, parts: Particle[], pmap: Int32Array[]): number {
    let r: number, rx: number, ry: number;
    const t = parts[i].type;
    if (t == PT_WTRV) {
      for (rx = -2; rx < 3; rx++)
        for (ry = -2; ry < 3; ry++)
          if (x + rx >= 0 && y + ry > 0 &&
            x + rx < XRES && y + ry < YRES && (rx || ry)) {
            r = pmap[y + ry][x + rx];
            if (!r)
              continue;
            if ((TYP(r) == PT_WATR || TYP(r) == PT_DSTW || TYP(r) == PT_SLTW) && sim.rng.chance(1, 1000)) {
              sim.part_change_type(i, x, y, PT_WATR);
              sim.part_change_type(ID(r), x + rx, y + ry, PT_WATR);
            }
            if ((TYP(r) == PT_ICEI || TYP(r) == PT_SNOW) && sim.rng.chance(1, 1000)) {
              sim.part_change_type(i, x, y, PT_WATR);
              if (sim.rng.chance(1, 1000))
                sim.part_change_type(ID(r), x + rx, y + ry, PT_WATR);
            }
          }
    } else if (t == PT_WATR) {
      for (rx = -2; rx < 3; rx++)
        for (ry = -2; ry < 3; ry++)
          if (x + rx >= 0 && y + ry > 0 &&
            x + rx < XRES && y + ry < YRES && (rx || ry)) {
            r = pmap[y + ry][x + rx];
            if (!r)
              continue;
            if ((TYP(r) == PT_FIRE || TYP(r) == PT_LAVA) && sim.rng.chance(1, 10)) {
              sim.part_change_type(i, x, y, PT_WTRV);
            }
          }
    } else if (t == PT_SLTW) {
      for (rx = -2; rx < 3; rx++)
        for (ry = -2; ry < 3; ry++)
          if (x + rx >= 0 && y + ry > 0 &&
            x + rx < XRES && y + ry < YRES && (rx || ry)) {
            r = pmap[y + ry][x + rx];
            if (!r)
              continue;
            if ((TYP(r) == PT_FIRE || TYP(r) == PT_LAVA) && sim.rng.chance(1, 10)) {
              if (sim.rng.chance(1, 4))
                sim.part_change_type(i, x, y, PT_SALT);
              else
                sim.part_change_type(i, x, y, PT_WTRV);
            }
          }
    } else if (t == PT_DSTW) {
      for (rx = -2; rx < 3; rx++)
        for (ry = -2; ry < 3; ry++)
          if (x + rx >= 0 && y + ry > 0 &&
            x + rx < XRES && y + ry < YRES && (rx || ry)) {
            r = pmap[y + ry][x + rx];
            if (!r)
              continue;
            if ((TYP(r) == PT_FIRE || TYP(r) == PT_LAVA) && sim.rng.chance(1, 10)) {
              sim.part_change_type(i, x, y, PT_WTRV);
            }
          }
    } else if (t == PT_ICEI) {
      for (rx = -2; rx < 3; rx++)
        for (ry = -2; ry < 3; ry++)
          if (x + rx >= 0 && y + ry > 0 && x + rx < XRES && y + ry < YRES && (rx || ry)) {
            r = pmap[y + ry][x + rx];
            if (!r)
              continue;
            if ((TYP(r) == PT_WATR || TYP(r) == PT_DSTW) && sim.rng.chance(1, 1000)) {
              sim.part_change_type(i, x, y, PT_ICEI);
              sim.part_change_type(ID(r), x + rx, y + ry, PT_ICEI);
            }
          }
    } else if (t == PT_SNOW) {
      for (rx = -2; rx < 3; rx++)
        for (ry = -2; ry < 3; ry++)
          if (x + rx >= 0 && y + ry > 0 && x + rx < XRES && y + ry < YRES && (rx || ry)) {
            r = pmap[y + ry][x + rx];
            if (!r)
              continue;
            if ((TYP(r) == PT_WATR || TYP(r) == PT_DSTW) && sim.rng.chance(1, 1000)) {
              sim.part_change_type(i, x, y, PT_ICEI);
              sim.part_change_type(ID(r), x + rx, y + ry, PT_ICEI);
            }
            if ((TYP(r) == PT_WATR || TYP(r) == PT_DSTW) && sim.rng.chance(3, 200))
              sim.part_change_type(i, x, y, PT_WATR);
          }
    }
    if (t == PT_WTRV && sim.pv[(y / CELL) | 0][(x / CELL) | 0] > 4.0)
      sim.part_change_type(i, x, y, PT_DSTW);
    if (t == PT_OIL && sim.pv[(y / CELL) | 0][(x / CELL) | 0] < -6.0)
      sim.part_change_type(i, x, y, PT_GAS);
    if (t == PT_GAS && sim.pv[(y / CELL) | 0][(x / CELL) | 0] > 6.0)
      sim.part_change_type(i, x, y, PT_OIL);
    if (t == PT_DESL && sim.pv[(y / CELL) | 0][(x / CELL) | 0] > 12.0) {
      sim.part_change_type(i, x, y, PT_FIRE);
      parts[i].life = sim.rng.between(120, 169);
    }
    return 0;
  }

  static defaultGraphics(_gfctx: GraphicsFuncContext, cpart: Particle, _nx: number, _ny: number, g: Gfx): number {
    const elements = sdRef!.elements;
    const t = cpart.type;
    //Property based defaults
    if (elements[t].Properties & PROP_RADIOACTIVE) g.pixel_mode |= PMODE_GLOW;
    if (elements[t].Properties & TYPE_LIQUID) {
      g.pixel_mode |= PMODE_BLUR;
    }
    if (elements[t].Properties & TYPE_GAS) {
      g.pixel_mode &= ~PMODE;
      g.pixel_mode |= FIRE_BLEND;
      g.firer = (g.colr / 2) | 0;
      g.fireg = (g.colg / 2) | 0;
      g.fireb = (g.colb / 2) | 0;
      g.firea = 125;
      g.pixel_mode |= DECO_FIRE;
    }
    return 1;
  }

  static basicCtypeDraw(sim: Simulation, i: number, t: number, _v: number): boolean {
    const elements = sdRef!.elements;
    if (sim.parts[i].type == t || elements[t].Properties & PROP_NOCTYPEDRAW) {
      return false;
    }
    sim.parts[i].ctype = t;
    return true;
  }

  static ctypeDrawVInTmp(sim: Simulation, i: number, t: number, v: number): boolean {
    if (!Element.basicCtypeDraw(sim, i, t, v)) {
      return false;
    }
    if (t == PT_LIFE) {
      sim.parts[i].tmp = v;
    }
    return true;
  }

  static ctypeDrawVInCtype(sim: Simulation, i: number, t: number, v: number): boolean {
    if (!Element.basicCtypeDraw(sim, i, t, v)) {
      return false;
    }
    if (t == PT_LIFE) {
      sim.parts[i].ctype |= PMAPID(v);
    }
    return true;
  }
}

/** Element::GetProperties (StructProperty types as names; Temperature is DefaultProperties.temp) */
export const ELEMENT_PROPERTIES: readonly { name: string; type: 'String' | 'Colour' | 'Integer' | 'UInteger' | 'Float' | 'UChar' | 'Removed' | 'TransitionType'; member: string }[] = [
  { name: 'Name', type: 'String', member: 'Name' },
  { name: 'Colour', type: 'Colour', member: 'Colour' },
  { name: 'Color', type: 'Colour', member: 'Colour' },
  { name: 'MenuVisible', type: 'Integer', member: 'MenuVisible' },
  { name: 'MenuSort', type: 'Integer', member: 'MenuSort' },
  { name: 'MenuSection', type: 'Integer', member: 'MenuSection' },
  { name: 'Enabled', type: 'Integer', member: 'Enabled' },
  { name: 'Advection', type: 'Float', member: 'Advection' },
  { name: 'AirDrag', type: 'Float', member: 'AirDrag' },
  { name: 'AirLoss', type: 'Float', member: 'AirLoss' },
  { name: 'Loss', type: 'Float', member: 'Loss' },
  { name: 'Collision', type: 'Float', member: 'Collision' },
  { name: 'Gravity', type: 'Float', member: 'Gravity' },
  { name: 'NewtonianGravity', type: 'Float', member: 'NewtonianGravity' },
  { name: 'Diffusion', type: 'Float', member: 'Diffusion' },
  { name: 'HotAir', type: 'Float', member: 'HotAir' },
  { name: 'Falldown', type: 'Integer', member: 'Falldown' },
  { name: 'Flammable', type: 'Integer', member: 'Flammable' },
  { name: 'Explosive', type: 'Integer', member: 'Explosive' },
  { name: 'Meltable', type: 'Integer', member: 'Meltable' },
  { name: 'Hardness', type: 'Integer', member: 'Hardness' },
  { name: 'PhotonReflectWavelengths', type: 'UInteger', member: 'PhotonReflectWavelengths' },
  { name: 'CarriesTypeIn', type: 'UInteger', member: 'CarriesTypeIn' },
  { name: 'Weight', type: 'Integer', member: 'Weight' },
  { name: 'Temperature', type: 'Float', member: 'DefaultProperties.temp' },
  { name: 'HeatConduct', type: 'UChar', member: 'HeatConduct' },
  { name: 'HeatCapacity', type: 'Float', member: 'HeatCapacity' },
  { name: 'Description', type: 'String', member: 'Description' },
  { name: 'State', type: 'Removed', member: '' },
  { name: 'Properties', type: 'Integer', member: 'Properties' },
  { name: 'LowPressure', type: 'Float', member: 'LowPressure' },
  { name: 'LowPressureTransition', type: 'TransitionType', member: 'LowPressureTransition' },
  { name: 'HighPressure', type: 'Float', member: 'HighPressure' },
  { name: 'HighPressureTransition', type: 'TransitionType', member: 'HighPressureTransition' },
  { name: 'LowTemperature', type: 'Float', member: 'LowTemperature' },
  { name: 'LowTemperatureTransition', type: 'TransitionType', member: 'LowTemperatureTransition' },
  { name: 'HighTemperature', type: 'Float', member: 'HighTemperature' },
  { name: 'HighTemperatureTransition', type: 'TransitionType', member: 'HighTemperatureTransition' },
];

/**
 * The element table the static functions read (SimulationData::CRef()). simulationData.ts sets it once it has
 * built `sd`; element.ts does not import simulationData.ts, so the two modules never form an import cycle.
 */
let sdRef: { elements: Element[] } | null = null;
export function setSimulationData(s: { elements: Element[] }): void {
  sdRef = s;
}

/**
 * The element's float properties are `float` in C++: an element file assigns them through this helper so the
 * value is the binary32 the original holds (`Loss = 0.95f` is `el.Loss = f(0.95)`). simulationData.ts (GetElements) rounds every
 * float property once after the element's initializer ran, so a plain number there is fine too.
 */
export const FLOAT_PROPERTIES = ['Advection', 'AirDrag', 'AirLoss', 'Loss', 'Collision', 'Gravity', 'NewtonianGravity',
  'Diffusion', 'HotAir', 'HeatCapacity', 'LowPressure', 'HighPressure', 'LowTemperature', 'HighTemperature'] as const;
