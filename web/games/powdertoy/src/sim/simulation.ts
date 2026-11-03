// simulation/Simulation.h / Simulation.cpp: the simulation. Fields and method names are the original's.
// The SimulationImpl parts of Simulation.cpp (GetNeighbourhood, UpdateParticles, TransitionPhase, MovementPhase)
// are methods of Simulation here; PlanMove and get_normal_interp are methods too (the C++ templates are only
// instantiated for Simulation itself, plus the const variants without side effects, see the flags).
//
// Layout of the original's arrays in the port:
//   pmap[y][x], photons[y][x]        Int32Array rows (YRES rows of XRES)
//   pv/vx/vy/hv/fvx/fvy[y][x]        Float32Array rows (YCELLS rows of XCELLS)
//   bmap/emap[y][x]                  Uint8Array rows (YCELLS rows of XCELLS)
//   gravIn.mass, gravIn.mask, gravOut.forceX/forceY: flat, index cy * XCELLS + cx (GravityPlane)
//   parts[i]                         Particle objects (NPART of them, allocated once)
// Out-parameters become Ref objects ({ v }) or an `out` object, see each method.
//
// Simulation::Load, Save and SaveSimOptions (GameSave) are not here: the save code is ported with GameSave.
// CreateSnapshot/Restore, GetSample, the drawing functions (CreateParts, CreateBox, CreateWalls, Apply-
// Decoration..., clear_area, SetDecoSpace) are Editing.cpp: src/sim/editing.ts.
//
// simulationData.ts is imported first: it builds the element table, and every element module must be evaluated
// before that (see the note there).
import { sd } from './simulationData.ts';
import {
  CELL, CFDS, CHANNELS, DECOSPACE_SRGB, EDGE_LOOP, EDGE_SOLID, EDGE_VOID, FLAG_MOVABLE, FLAG_SKIPMOVE,
  FLAG_STAGNANT, GLASS_DISP, GLASS_IOR, GRAV_CUSTOM, GRAV_OFF, GRAV_RADIAL, GRAV_VERTICAL, ID, InBounds, ISTP,
  MAX_FIGHTERS, MAX_TEMP, MAX_VELOCITY, MIN_TEMP, NGOL, NORMAL_FRAC, NORMAL_INTERP, NORMAL_MIN_EST, NPART, NT,
  PMAP, PMAPMASK, PROP_CONDUCTS, PROP_LIFE_DEC, PROP_LIFE_KILL, PROP_LIFE_KILL_DEC, PROP_NEUTABSORB,
  PROP_NEUTPENETRATE, PROP_NOAMBHEAT, PT_NUM, REFRACT, ST, SURF_RANGE, TYP, TYPE_ENERGY, TYPE_GAS, TYPE_LIQUID,
  TYPE_PART, TYPE_SOLID, WL_ALLOWAIR, WL_ALLOWALLELEC, WL_ALLOWENERGY, WL_ALLOWGAS, WL_ALLOWLIQUID,
  WL_ALLOWPOWDER, WL_BLOCKAIR, WL_DESTROYALL, WL_DETECT, WL_EHOLE, WL_EWALL, WL_GRAV, WL_STASIS, WL_STREAM,
  WL_WALL, WL_WALLELEC, XCELLS, XCNTR, XRES, YCELLS, YCNTR, YRES,
} from './config.ts';
import { RNG, f, isign, restrict_flt, type Ref } from './cpp.ts';
import { FIELD_TYPE, PARTICLE_PROPERTIES, Particle } from './particle.ts';
import { Air } from './air.ts';
import { Gravity } from './gravity.ts';
import {
  PT_BCLN, PT_BCOL, PT_BGLA, PT_BHOL, PT_BIZR, PT_BIZRG, PT_BIZRS, PT_BMTL, PT_BRAY, PT_BRMT, PT_BVBR, PT_C5,
  PT_CLNE, PT_CNCT, PT_COAL, PT_CRMC, PT_DEUT, PT_DSTW, PT_DUST, PT_ELEC, PT_EMBR, PT_ETRD, PT_FIGH, PT_FILT,
  PT_FIRE, PT_FOG, PT_GBMB, PT_GEL, PT_GLAS, PT_GLOW, PT_GPMP, PT_GRVT, PT_H2, PT_HEAC, PT_HSWC, PT_ICEI, PT_INSL,
  PT_INST, PT_INVIS, PT_IRON, PT_LAVA, PT_LCRY, PT_LIFE, PT_LITH, PT_LNTG, PT_LOLZ, PT_LOVE, PT_METL, PT_NBHL,
  PT_NBLE, PT_NEUT, PT_NONE, PT_NSCN, PT_NWHL, PT_PBCN, PT_PCLN, PT_PHOT, PT_PIPE, PT_PLSM, PT_PLUT, PT_PPIP,
  PT_PQRT, PT_PRTI, PT_PROT, PT_PSCN, PT_PVOD, PT_QRTZ, PT_RIME, PT_ROCK, PT_SALT, PT_SAND, PT_SAWD, PT_SEED,
  PT_SLTW, PT_SNOW, PT_SPNG, PT_SPRK, PT_STKM, PT_STKM2, PT_STNE, PT_SWCH, PT_THDR, PT_THRM, PT_TRON, PT_TUNG,
  PT_VIBR, PT_VOID, PT_WATR, PT_WHOL, PT_WIRE, PT_WOOD, PT_WTRV, PT_ACID, PT_ANAR, PT_GAS, PT_FRZW, PT_CFLM,
} from './numbers.ts';
import { Element } from './element.ts';
import { Element_EMP_Trigger } from '../elements/EMP.ts';
import { Element_LOLZ_RuleTable } from '../elements/LOLZ.ts';
import { Element_LOVE_RuleTable } from '../elements/LOVE.ts';
import { Element_PIPE_transfer_part_to_pipe } from '../elements/PIPE.ts';
import { Element_FILT_interactWavelengths } from '../elements/FILT.ts';
import { portal_rx, portal_ry } from '../elements/PRTI.ts';
import { PLNT_COLOUR } from '../elements/PLNT.ts';
import { Element_SOAP_detach } from '../elements/SOAP.ts';

/** Stickman.h playerst */
export class Playerst {
  /** char */
  comm = 0;
  pcomm = 0;
  elem = 0;
  legs = new Float32Array(16);
  accs = new Float32Array(8);
  /** char */
  spwn = 0;
  /** unsigned int */
  frames = 0;
  rocketBoots = false;
  fan = false;
  spawnID = 0;

  /** memset(this, 0, sizeof(playerst)) */
  clear(): void {
    this.comm = 0; this.pcomm = 0; this.elem = 0;
    this.legs.fill(0); this.accs.fill(0);
    this.spwn = 0; this.frames = 0; this.rocketBoots = false; this.fan = false; this.spawnID = 0;
  }

  copyFrom(o: Playerst): this {
    this.comm = o.comm; this.pcomm = o.pcomm; this.elem = o.elem;
    this.legs.set(o.legs); this.accs.set(o.accs);
    this.spwn = o.spwn; this.frames = o.frames; this.rocketBoots = o.rocketBoots; this.fan = o.fan;
    this.spawnID = o.spawnID;
    return this;
  }
}

/** Sign.h sign */
export interface Sign {
  x: number;
  y: number;
  /** sign::Justification: Left 0, Middle 1, Right 2, None 3 */
  ju: number;
  text: string;
}

/** gravity/GravityData.h */
export class GravityInput {
  mass = new Float32Array(XCELLS * YCELLS);
  mask = new Uint32Array(XCELLS * YCELLS).fill(0xFFFFFFFF);

  clone(): GravityInput {
    const g = new GravityInput();
    g.mass.set(this.mass);
    g.mask.set(this.mask);
    return g;
  }
}
export class GravityOutput {
  forceX = new Float32Array(XCELLS * YCELLS);
  forceY = new Float32Array(XCELLS * YCELLS);

  clone(): GravityOutput {
    const g = new GravityOutput();
    g.forceX.set(this.forceX);
    g.forceY.set(this.forceY);
    return g;
  }
}

/** Simulation::Parts: the particle array with its free list */
export class Parts extends Array<Particle> {
  static get [Symbol.species](): ArrayConstructor { return Array; }

  pfree = -1;
  // initialized in clear_sim
  active = 0;

  constructor() {
    super();
    for (let k = 0; k < NPART; k++) this.push(new Particle());
    this.Reset();
  }

  /** Parts &operator =(const Parts &other) */
  assign(other: Parts): void {
    for (let k = 0; k < other.active; k++) this[k].copyFrom(other[k]);
    this.active = other.active;
    this.pfree = other.pfree;
  }

  Reset(): void {
    for (let k = 0; k < NPART; k++) this[k].clear();
    this.active = 0;
    this.pfree = -1;
  }

  Free(i: number): void {
    this[i].type = PT_NONE;
    this[i].life = this.pfree;
    this.pfree = i;
  }

  Alloc(): number {
    if (this.pfree != -1) {
      const i = this.pfree;
      this.pfree = this[i].life;
      return i;
    }
    if (this.active < NPART) {
      const i = this.active;
      this.active += 1;
      return i;
    }
    return -1;
  }

  Flatten(): void {
    let newActive = 0;
    // ppfree: -1 is &pfree, otherwise &data[j].life
    let ppfree = -1;
    const store = (v: number): void => {
      if (ppfree == -1) this.pfree = v;
      else this[ppfree].life = v;
    };
    for (let i = 0; i < this.active; i++) {
      if (this[i].type) {
        for (let j = newActive; j < i; ++j) {
          store(j);
          ppfree = j;
        }
        newActive = i + 1;
      }
    }
    store(-1);
    this.active = newActive;
  }

  MaxPartsReached(): boolean {
    return this.pfree == -1 && this.active >= NPART;
  }
}

/** GetNormalResult */
export interface GetNormalResult {
  success: boolean;
  nx: number; ny: number;
  lx: number; ly: number; rx: number; ry: number;
}

/** PlanMoveResult */
export interface PlanMoveResult {
  fin_x: number; fin_y: number; clear_x: number; clear_y: number;
  fin_xf: number; fin_yf: number; clear_xf: number; clear_yf: number;
  vx: number; vy: number;
}

/** SimulationImpl::Neighbourhood */
export interface Neighbourhood {
  surround: Int32Array;
  surround_space: number;
  /** if nt is greater than 1 after this, then there is a particle around the current particle, that is NOT the current particle's type, for water movement. */
  nt: number;
  pGravX: number;
  pGravY: number;
}

const NORMAL_FAIL: GetNormalResult = { success: false, nx: 0, ny: 0, lx: 0, ly: 0, rx: 0, ry: 0 };

/** CoordStack.h */
export class CoordStack {
  private stack = new Uint16Array(XRES * YRES * 2);
  private stack_size = 0;
  static readonly stack_limit = XRES * YRES;

  push(x: number, y: number): void {
    if (this.stack_size >= CoordStack.stack_limit)
      throw new Error('Maximum number of entries in the coordinate stack was exceeded');
    this.stack[this.stack_size * 2] = x;
    this.stack[this.stack_size * 2 + 1] = y;
    this.stack_size++;
  }
  /** pop(int &x, int &y): returns [x, y] */
  pop(): [number, number] {
    this.stack_size--;
    return [this.stack[this.stack_size * 2], this.stack[this.stack_size * 2 + 1]];
  }
  getSize(): number { return this.stack_size; }
  clear(): void { this.stack_size = 0; }
}
const coordStack = new CoordStack();

function rows<T>(n: number, make: () => T): T[] {
  const out: T[] = [];
  for (let k = 0; k < n; k++) out.push(make());
  return out;
}

/** (int)x of a float (cvttss2si): truncation, and INT_MIN for NaN and out-of-range values */
export function ci(x: number): number {
  return x > -2147483649 && x < 2147483648 ? x | 0 : -2147483648;
}

/** static float remainder_p(float x, float y) */
function remainder_p(x: number, y: number): number {
  return f(f(x % y) + (x >= 0 ? 0 : y));
}

/** fmaxf: a NaN argument loses */
function fmaxf(a: number, b: number): number {
  if (a !== a) return b;
  if (b !== b) return a;
  return a > b ? a : b;
}

/** std::max(a, b) */
function stdmax(a: number, b: number): number {
  return a < b ? b : a;
}

/** std::min(a, b) */
function stdmin(a: number, b: number): number {
  return b < a ? b : a;
}

/** hypotf (glibc computes it in double) */
function hypotf(a: number, b: number): number {
  return f(Math.sqrt(a * a + b * b));
}

/** roundf: halves away from zero */
function roundf(x: number): number {
  return x < 0 ? -Math.round(-x) : Math.round(x);
}

/** unsigned static direction_to_map(float dx, float dy, int t) */
function direction_to_map(dx: number, dy: number, _t: number): number {
  // TODO:
  // Adding extra directions causes some inaccuracies.
  // Not adding them causes problems with some diagonal surfaces (photons absorbed instead of reflected).
  // For now, don't add them.
  // Solution may involve more intelligent setting of initial i0 value in find_next_boundary?
  // or rewriting normal/boundary finding code

  return (dx >= 0 ? 1 : 0) |
    ((f(dx + dy) >= 0 ? 1 : 0) << 1) |     /*  567  */
    ((dy >= 0 ? 1 : 0) << 2) |             /*  4+0  */
    ((f(dy - dx) >= 0 ? 1 : 0) << 3) |     /*  321  */
    ((dx <= 0 ? 1 : 0) << 4) |
    ((f(dx + dy) <= 0 ? 1 : 0) << 5) |
    ((dy <= 0 ? 1 : 0) << 6) |
    ((f(dy - dx) <= 0 ? 1 : 0) << 7);
}

const fnb_dx = [1, 1, 0, -1, -1, -1, 0, 1];
const fnb_dy = [0, 1, 1, 1, 0, -1, -1, -1];
const fnb_de = [0x83, 0x07, 0x0E, 0x1C, 0x38, 0x70, 0xE0, 0xC1];

const PI_F = f(Math.PI);

export class Simulation {
  // RenderableSimulation
  gravIn = new GravityInput();
  /** invariant: when grav is empty, this is in its default-constructed state */
  gravOut = new GravityOutput();
  gravForceRecalc = true;
  signs: Sign[] = [];
  currentTick = 0;
  emp_decor = 0;
  player = new Playerst();
  player2 = new Playerst();
  /** Defined in Stickman.h */
  fighters: Playerst[] = rows(MAX_FIGHTERS, () => new Playerst());
  vx: Float32Array[] = rows(YCELLS, () => new Float32Array(XCELLS));
  vy: Float32Array[] = rows(YCELLS, () => new Float32Array(XCELLS));
  pv: Float32Array[] = rows(YCELLS, () => new Float32Array(XCELLS));
  hv: Float32Array[] = rows(YCELLS, () => new Float32Array(XCELLS));
  bmap: Uint8Array[] = rows(YCELLS, () => new Uint8Array(XCELLS));
  emap: Uint8Array[] = rows(YCELLS, () => new Uint8Array(XCELLS));
  parts: Parts = new Parts();
  pmap: Int32Array[] = rows(YRES, () => new Int32Array(XRES));
  photons: Int32Array[] = rows(YRES, () => new Int32Array(XRES));
  aheat_enable = 0;
  useLuaCallbacks = false;

  // Simulation
  /** GravityPtr: non-null while Newtonian gravity is on */
  grav: Gravity | null = null;
  air!: Air;
  rng = new RNG();
  replaceModeSelected = 0;
  replaceModeFlags = 0;
  debug_nextToUpdate = 0;
  /** -1 when between full update loops */
  debug_mostRecentlyUpdated = -1;
  elementCount = new Int32Array(PT_NUM);
  ISWIRE = 0;
  force_stacking_check = false;
  emp_trigger_count = 0;
  etrd_count_valid = false;
  etrd_life0_count = 0;
  lightningRecreate = 0;
  gravWallChanged = false;
  /** portalp[CHANNELS][8][80] */
  portalp: Particle[][][] = rows(CHANNELS, () => rows(8, () => rows(80, () => new Particle())));
  /** wireless[CHANNELS][2] */
  wireless: Int32Array[] = rows(CHANNELS, () => new Int32Array(2));
  CGOL = 0;
  GSPEED = 1;
  /** gol[YRES][XRES][5]: gol[y][x * 5 + k] */
  gol: Uint32Array[] = rows(YRES, () => new Uint32Array(XRES * 5));
  fvx: Float32Array[] = rows(YCELLS, () => new Float32Array(XCELLS));
  fvy: Float32Array[] = rows(YCELLS, () => new Float32Array(XCELLS));
  /** Element_LOLZ_lolz[XRES/9][YRES/9] */
  Element_LOLZ_lolz: Int32Array[] = rows((XRES / 9) | 0, () => new Int32Array((YRES / 9) | 0));
  /** Element_LOVE_love[XRES/9][YRES/9] */
  Element_LOVE_love: Int32Array[] = rows((XRES / 9) | 0, () => new Int32Array((YRES / 9) | 0));
  Element_PSTN_tempParts = new Int32Array(Math.max(XRES, YRES));
  Element_PPIP_ppip_changed = 0;
  pmap_count: Uint32Array[] = rows(YRES, () => new Uint32Array(XRES));
  edgeMode = EDGE_VOID;
  gravityMode = GRAV_VERTICAL;
  /** float */
  customGravityX = 0;
  /** float */
  customGravityY = 0;
  legacy_enable = 0;
  water_equal_test = 0;
  pretty_powder = 0;
  sandcolour_frame = 0;
  deco_space = DECOSPACE_SRGB;

  // initialized in clear_sim
  elementRecount = true;
  /** unsigned char: Contains the number of fighters */
  fighcount = 0;
  /** uint64_t */
  frameCount = 0;
  ensureDeterminism = false;

  // initialized very late >_>
  NUM_PARTS = 0;
  sandcolour = 0;
  sandcolour_interface = 0;

  frameTime: unknown = null;

  constructor() {
    this.elementCount.fill(0);
    this.elementRecount = true;

    //Create and attach air simulation
    this.air = new Air(this);

    this.player.comm = 0;
    this.player2.comm = 0;

    this.clear_sim();

    this.UpdateGravityMask();
  }

  /** static std::unique_ptr<Simulation> Factory() */
  static Factory(): Simulation {
    return new Simulation();
  }

  FloodFillPmapCheck(x: number, y: number, type: number): boolean {
    const elements = sd.elements;
    if (type == 0)
      return !this.pmap[y][x] && !this.photons[y][x];
    if (elements[type].Properties & TYPE_ENERGY)
      return TYP(this.photons[y][x]) == type;
    else
      return TYP(this.pmap[y][x]) == type;
  }

  getCoordStackSingleton(): CoordStack {
    return coordStack;
  }

  /** AccessProperty::Set(sim, i) for an AccessProperty { propertyIndex, value } (tools.ts has the class) */
  private accessPropertySet(changeProperty: { propertyIndex: number; value: number }, i: number): void {
    const part = this.parts[i];
    const prop = PARTICLE_PROPERTIES[changeProperty.propertyIndex];
    if (changeProperty.propertyIndex == FIELD_TYPE) {
      this.part_change_type(i, ci(f(part.x + 0.5)), ci(f(part.y + 0.5)), changeProperty.value | 0);
      return;
    }
    // the Particle setters round floats and wrap ints as the C++ stores do
    (part as unknown as Record<string, number>)[prop.name] = prop.kind == 'uint' ? changeProperty.value >>> 0 : changeProperty.value;
  }

  /** int flood_prop(int x, int y, const AccessProperty &changeProperty) */
  flood_prop(x: number, y: number, changeProperty: { propertyIndex: number; value: number }): number {
    let i: number, x1: number, x2: number;
    const dy = 1;
    let did_something = 0;
    let r = this.pmap[y][x];
    if (!r)
      r = this.photons[y][x];
    if (!r)
      return 0;
    const parttype = TYP(r);
    const bitmap = new Uint8Array(XRES * YRES); //Bitmap for checking
    try {
      const cs = this.getCoordStackSingleton();
      cs.clear();

      cs.push(x, y);
      do {
        [x, y] = cs.pop();
        x1 = x2 = x;
        while (x1 >= CELL) {
          if (!this.FloodFillPmapCheck(x1 - 1, y, parttype) || bitmap[(y * XRES) + x1 - 1])
            break;
          x1--;
        }
        while (x2 < XRES - CELL) {
          if (!this.FloodFillPmapCheck(x2 + 1, y, parttype) || bitmap[(y * XRES) + x2 + 1])
            break;
          x2++;
        }
        for (x = x1; x <= x2; x++) {
          i = this.pmap[y][x];
          if (!i)
            i = this.photons[y][x];
          if (!i)
            continue;
          this.accessPropertySet(changeProperty, ID(i));
          bitmap[(y * XRES) + x] = 1;
          did_something = 1;
        }
        if (y >= CELL + dy)
          for (x = x1; x <= x2; x++)
            if (this.FloodFillPmapCheck(x, y - dy, parttype) && !bitmap[((y - dy) * XRES) + x])
              cs.push(x, y - dy);
        if (y < YRES - CELL - dy)
          for (x = x1; x <= x2; x++)
            if (this.FloodFillPmapCheck(x, y + dy, parttype) && !bitmap[((y + dy) * XRES) + x])
              cs.push(x, y + dy);
      } while (cs.getSize() > 0);
    } catch (e) {
      console.error((e as Error).message);
      return -1;
    }
    return did_something;
  }

  FloodINST(x: number, y: number): number {
    let x1: number, x2: number;
    let created_something = 0;
    const pmap = this.pmap, parts = this.parts;

    const isSparkableInst = (x: number, y: number): boolean => {
      return TYP(pmap[y][x]) == PT_INST && parts[ID(pmap[y][x])].life == 0;
    };

    const isInst = (x: number, y: number): boolean => {
      return TYP(pmap[y][x]) == PT_INST || (TYP(pmap[y][x]) == PT_SPRK && parts[ID(pmap[y][x])].ctype == PT_INST);
    };

    if (!isSparkableInst(x, y))
      return 1;

    const cs = this.getCoordStackSingleton();
    cs.clear();

    cs.push(x, y);

    try {
      do {
        [x, y] = cs.pop();
        x1 = x2 = x;
        // go left as far as possible
        while (x1 >= CELL && isSparkableInst(x1 - 1, y)) {
          x1--;
        }
        // go right as far as possible
        while (x2 < XRES - CELL && isSparkableInst(x2 + 1, y)) {
          x2++;
        }
        // fill span
        for (x = x1; x <= x2; x++) {
          if (this.create_part(-1, x, y, PT_SPRK) >= 0)
            created_something = 1;
        }

        // add vertically adjacent pixels to stack
        // (wire crossing for INST)
        if (y >= CELL + 1 && x1 == x2 &&
          isInst(x1 - 1, y - 1) && isInst(x1, y - 1) && isInst(x1 + 1, y - 1) &&
          !isInst(x1 - 1, y - 2) && isInst(x1, y - 2) && !isInst(x1 + 1, y - 2)) {
          // travelling vertically up, skipping a horizontal line
          if (isSparkableInst(x1, y - 2)) {
            cs.push(x1, y - 2);
          }
        } else if (y >= CELL + 1) {
          for (x = x1; x <= x2; x++) {
            if (isSparkableInst(x, y - 1)) {
              if (x == x1 || x == x2 || y >= YRES - CELL - 1 || !isInst(x, y + 1) || isInst(x + 1, y + 1) || isInst(x - 1, y + 1)) {
                // if at the end of a horizontal section, or if it's a T junction or not a 1px wire crossing
                cs.push(x, y - 1);
              }
            }
          }
        }

        if (y < YRES - CELL - 1 && x1 == x2 &&
          isInst(x1 - 1, y + 1) && isInst(x1, y + 1) && isInst(x1 + 1, y + 1) &&
          !isInst(x1 - 1, y + 2) && isInst(x1, y + 2) && !isInst(x1 + 1, y + 2)) {
          // travelling vertically down, skipping a horizontal line
          if (isSparkableInst(x1, y + 2)) {
            cs.push(x1, y + 2);
          }
        } else if (y < YRES - CELL - 1) {
          for (x = x1; x <= x2; x++) {
            if (isSparkableInst(x, y + 1)) {
              if (x == x1 || x == x2 || y < 0 || !isInst(x, y - 1) || isInst(x + 1, y - 1) || isInst(x - 1, y - 1)) {
                // if at the end of a horizontal section, or if it's a T junction or not a 1px wire crossing
                cs.push(x, y + 1);
              }
            }
          }
        }
      } while (cs.getSize() > 0);
    } catch (e) {
      console.error((e as Error).message);
      return -1;
    }

    return created_something;
  }

  flood_water(x: number, y: number, i: number): boolean {
    let x1: number, x2: number;
    const originalX = x, originalY = y;
    const pmap = this.pmap;
    const r = pmap[y][x];
    if (!r)
      return false;

    // Bitmap for checking where we've already looked
    const bitmap = new Uint8Array(XRES * YRES);

    const elements = sd.elements;
    try {
      const cs = this.getCoordStackSingleton();
      cs.clear();

      cs.push(x, y);
      do {
        [x, y] = cs.pop();
        x1 = x2 = x;
        while (x1 >= CELL) {
          if (elements[TYP(pmap[y][x1 - 1])].Falldown != 2 || bitmap[(y * XRES) + x1 - 1])
            break;
          x1--;
        }
        while (x2 < XRES - CELL) {
          if (elements[TYP(pmap[y][x2 + 1])].Falldown != 2 || bitmap[(y * XRES) + x2 + 1])
            break;
          x2++;
        }
        for (let x = x1; x <= x2; x++) {
          if ((y - 1) > originalY && !pmap[y - 1][x]) {
            // Try to move the water to a random position on this line, because there's probably a free location somewhere
            const randPos = this.rng.between(x, x2);
            if (!pmap[y - 1][randPos] && this.eval_move(this.parts[i].type, randPos, y - 1, null))
              x = randPos;
            // Couldn't move to random position, so try the original position on the left
            else if (!this.eval_move(this.parts[i].type, x, y - 1, null))
              continue;

            this.move(i, originalX, originalY, x, y - 1);
            return true;
          }

          bitmap[(y * XRES) + x] = 1;
        }
        if (y >= CELL + 1)
          for (let x = x1; x <= x2; x++)
            if (elements[TYP(pmap[y - 1][x])].Falldown == 2 && !bitmap[((y - 1) * XRES) + x])
              cs.push(x, y - 1);
        if (y < YRES - CELL - 1)
          for (let x = x1; x <= x2; x++)
            if (elements[TYP(pmap[y + 1][x])].Falldown == 2 && !bitmap[((y + 1) * XRES) + x])
              cs.push(x, y + 1);
      } while (cs.getSize() > 0);
    } catch (e) {
      console.error((e as Error).message);
      return false;
    }
    return false;
  }

  SetEdgeMode(newEdgeMode: number): void {
    this.edgeMode = newEdgeMode;
    const bmap = this.bmap;
    switch (this.edgeMode) {
      case EDGE_VOID:
      case EDGE_LOOP:
        for (let i = 0; i < XCELLS; i++) {
          bmap[0][i] = 0;
          bmap[YCELLS - 1][i] = 0;
        }
        for (let i = 1; i < (YCELLS - 1); i++) {
          bmap[i][0] = 0;
          bmap[i][XCELLS - 1] = 0;
        }
        break;
      case EDGE_SOLID: {
        let i: number;
        for (i = 0; i < XCELLS; i++) {
          bmap[0][i] = WL_WALL;
          bmap[YCELLS - 1][i] = WL_WALL;
        }
        for (i = 1; i < (YCELLS - 1); i++) {
          bmap[i][0] = WL_WALL;
          bmap[i][XCELLS - 1] = WL_WALL;
        }
        break;
      }
      default:
        this.SetEdgeMode(EDGE_VOID);
    }
  }

  // Now simply creates a 0 pixel radius line without all the complicated flags / other checks
  // Would make sense to move to Editing.cpp but SPRK needs it.
  /** void CreateLine(int x1, int y1, int x2, int y2, int c) */
  CreateLine(x1: number, y1: number, x2: number, y2: number, c: number): void {
    const reverseXY = Math.abs(y2 - y1) > Math.abs(x2 - x1);
    let x: number, y: number;
    let e: number;
    const v = ID(c);
    c = TYP(c);
    if (reverseXY) {
      y = x1;
      x1 = y1;
      y1 = y;
      y = x2;
      x2 = y2;
      y2 = y;
    }
    if (x1 > x2) {
      y = x1;
      x1 = x2;
      x2 = y;
      y = y1;
      y1 = y2;
      y2 = y;
    }
    const dx = x2 - x1;
    const dy = Math.abs(y2 - y1);
    e = 0.0;
    const de = dx ? f(dy / f(dx)) : 0.0;
    y = y1;
    const sy = (y1 < y2) ? 1 : -1;
    for (x = x1; x <= x2; x++) {
      if (reverseXY)
        this.create_part(-1, y, x, c, v);
      else
        this.create_part(-1, x, y, c, v);
      e = f(e + de);
      if (e >= 0.5) {
        y += sy;
        if ((y1 < y2) ? (y <= y2) : (y >= y2)) {
          if (reverseXY)
            this.create_part(-1, y, x, c, v);
          else
            this.create_part(-1, x, y, c, v);
        }
        e = f(e - 1.0);
      }
    }
  }

  is_wire(x: number, y: number): number {
    const b = this.bmap[y][x];
    return (b == WL_DETECT || b == WL_EWALL || b == WL_ALLOWLIQUID || b == WL_WALLELEC || b == WL_ALLOWALLELEC || b == WL_EHOLE || b == WL_STASIS) ? 1 : 0;
  }

  is_wire_off(x: number, y: number): number {
    const b = this.bmap[y][x];
    return ((b == WL_DETECT || b == WL_EWALL || b == WL_ALLOWLIQUID || b == WL_WALLELEC || b == WL_ALLOWALLELEC || b == WL_EHOLE || b == WL_STASIS) && this.emap[y][x] < 8) ? 1 : 0;
  }

  /** int get_wavelength_bin(int *wm) */
  get_wavelength_bin(wm: Ref): number {
    let i: number;

    if (!(wm.v & 0x3FFFFFFF))
      return -1;

    // __builtin_ctz(*wm | 0xC0000000), 31 - __builtin_clz(*wm & 0x3FFFFFFF)
    const lo = (wm.v | 0xC0000000) >>> 0;
    const w0 = 31 - Math.clz32(lo & -lo);
    const wM = 31 - Math.clz32(wm.v & 0x3FFFFFFF);

    if (wM - w0 < 5)
      return wM + w0;

    const r = this.rng.gen();
    i = (r >> 1) % (wM - w0 - 4);
    i += w0;

    if (r & 1) {
      wm.v &= 0x1F << i;
      return (i + 2) * 2;
    } else {
      wm.v &= 0xF << i;
      return (i + 2) * 2 - 1;
    }
  }

  set_emap(x: number, y: number): void {
    let x1: number, x2: number;

    if (!this.is_wire_off(x, y))
      return;

    // go left as far as possible
    x1 = x2 = x;
    while (x1 > 0) {
      if (!this.is_wire_off(x1 - 1, y))
        break;
      x1--;
    }
    while (x2 < XCELLS - 1) {
      if (!this.is_wire_off(x2 + 1, y))
        break;
      x2++;
    }

    // fill span
    for (x = x1; x <= x2; x++)
      this.emap[y][x] = 16;

    // fill children

    if (y > 1 && x1 == x2 &&
      this.is_wire(x1 - 1, y - 1) && this.is_wire(x1, y - 1) && this.is_wire(x1 + 1, y - 1) &&
      !this.is_wire(x1 - 1, y - 2) && this.is_wire(x1, y - 2) && !this.is_wire(x1 + 1, y - 2))
      this.set_emap(x1, y - 2);
    else if (y > 0)
      for (x = x1; x <= x2; x++)
        if (this.is_wire_off(x, y - 1)) {
          if (x == x1 || x == x2 || y >= YCELLS - 1 ||
            this.is_wire(x - 1, y - 1) || this.is_wire(x + 1, y - 1) ||
            this.is_wire(x - 1, y + 1) || !this.is_wire(x, y + 1) || this.is_wire(x + 1, y + 1))
            this.set_emap(x, y - 1);
        }

    if (y < YCELLS - 2 && x1 == x2 &&
      this.is_wire(x1 - 1, y + 1) && this.is_wire(x1, y + 1) && this.is_wire(x1 + 1, y + 1) &&
      !this.is_wire(x1 - 1, y + 2) && this.is_wire(x1, y + 2) && !this.is_wire(x1 + 1, y + 2))
      this.set_emap(x1, y + 2);
    else if (y < YCELLS - 1)
      for (x = x1; x <= x2; x++)
        if (this.is_wire_off(x, y + 1)) {
          if (x == x1 || x == x2 || y < 0 ||
            this.is_wire(x - 1, y + 1) || this.is_wire(x + 1, y + 1) ||
            this.is_wire(x - 1, y - 1) || !this.is_wire(x, y - 1) || this.is_wire(x + 1, y - 1))
            this.set_emap(x, y + 1);
        }
  }

  parts_avg(ci_: number, ni: number, t: number): number {
    const parts = this.parts;
    if (t == PT_INSL)//to keep electronics working
    {
      const pmr = this.pmap[((ci(f(parts[ci_].y + 0.5)) + ci(f(parts[ni].y + 0.5))) / 2) | 0][((ci(f(parts[ci_].x + 0.5)) + ci(f(parts[ni].x + 0.5))) / 2) | 0];
      if (pmr)
        return parts[ID(pmr)].type;
      else
        return PT_NONE;
    } else {
      const pmr2 = this.pmap[ci(f(f(f(parts[ci_].y + parts[ni].y) / 2) + 0.5))][ci(f(f(f(parts[ci_].x + parts[ni].x) / 2) + 0.5))];//seems to be more accurate.
      if (pmr2) {
        if (parts[ID(pmr2)].type == t)
          return t;
      } else
        return PT_NONE;
    }
    return PT_NONE;
  }

  clear_sim(): void {
    for (let i = 0; i < this.parts.active; i++) {
      if (this.parts[i].type) {
        this.kill_part(i);
      }
    }
    this.ensureDeterminism = false;
    this.frameCount = 0;
    this.debug_nextToUpdate = 0;
    this.debug_mostRecentlyUpdated = -1;
    this.emp_decor = 0;
    this.emp_trigger_count = 0;
    this.signs.length = 0;
    for (const r of this.bmap) r.fill(0);
    for (const r of this.emap) r.fill(0);
    this.parts.Reset();
    this.NUM_PARTS = 0;
    for (const r of this.pmap) r.fill(0);
    for (const r of this.fvx) r.fill(0);
    for (const r of this.fvy) r.fill(0);
    for (const r of this.photons) r.fill(0);
    for (const r of this.wireless) r.fill(0);
    for (const r of this.gol) r.fill(0);
    for (const a of this.portalp) for (const b of a) for (const p of b) p.clear();
    for (const p of this.fighters) p.clear();
    this.player.clear();
    this.player2.clear();
    for (const r of this.Element_LOLZ_lolz) r.fill(0);
    for (const r of this.Element_LOVE_love) r.fill(0);
    this.Element_PSTN_tempParts.fill(0);
    this.Element_PPIP_ppip_changed = 0;
    this.elementCount.fill(0);
    this.elementRecount = true;
    this.fighcount = 0;
    this.player.spwn = 0;
    this.player.spawnID = -1;
    this.player.rocketBoots = false;
    this.player.fan = false;
    this.player2.spwn = 0;
    this.player2.spawnID = -1;
    this.player2.rocketBoots = false;
    this.player2.fan = false;
    this.ResetNewtonianGravity(new GravityInput(), new GravityOutput());
    if (this.air) {
      this.air.Clear();
      this.air.ClearAirH();
    }
    this.SetEdgeMode(this.edgeMode);
  }

  IsWallBlocking(x: number, y: number, type: number): boolean {
    const elements = sd.elements;
    const cy = (y / CELL) | 0, cx = (x / CELL) | 0;
    if (this.bmap[cy][cx]) {
      const wall = this.bmap[cy][cx];
      if (wall == WL_ALLOWGAS && !(elements[type].Properties & TYPE_GAS))
        return true;
      else if (wall == WL_ALLOWENERGY && !(elements[type].Properties & TYPE_ENERGY))
        return true;
      else if (wall == WL_ALLOWLIQUID && !(elements[type].Properties & TYPE_LIQUID))
        return true;
      else if (wall == WL_ALLOWPOWDER && !(elements[type].Properties & TYPE_PART))
        return true;
      else if (wall == WL_ALLOWAIR || wall == WL_WALL || wall == WL_WALLELEC)
        return true;
      else if (wall == WL_EWALL && !this.emap[cy][cx])
        return true;
      else if (wall == WL_DETECT && (elements[type].Properties & TYPE_SOLID))
        return true;
    }
    return false;
  }

  /*
     RETURN-value explanation
  1 = Swap
  0 = No move/Bounce
  2 = Both particles occupy the same space.
   */
  /** int eval_move(int pt, int nx, int ny, unsigned *rr) const; rr may be null */
  eval_move(pt: number, nx: number, ny: number, rr: Ref | null): number {
    let r: number;
    let result: number;
    const parts = this.parts;

    if (nx < 0 || ny < 0 || nx >= XRES || ny >= YRES)
      return 0;

    r = this.pmap[ny][nx];
    if (r)
      r = (r & ~PMAPMASK) | parts[ID(r)].type;
    if (rr)
      rr.v = r;
    if (pt >= PT_NUM || TYP(r) >= PT_NUM)
      return 0;
    const can_move = sd.can_move;
    const elements = sd.elements;
    result = can_move[pt][TYP(r)];
    if (result == 3) {
      switch (TYP(r)) {
        case PT_LCRY:
          if (pt == PT_PHOT)
            result = (parts[ID(r)].life > 5) ? 2 : 0;
          break;
        case PT_GPMP:
          if (pt == PT_PHOT)
            result = (parts[ID(r)].life < 10) ? 2 : 0;
          break;
        case PT_INVIS: {
          let pressureResistance = 0.0;
          if (parts[ID(r)].tmp > 0)
            pressureResistance = f(parts[ID(r)].tmp);
          else
            pressureResistance = 4.0;

          const p = this.pv[(ny / CELL) | 0][(nx / CELL) | 0];
          if (p < -pressureResistance || p > pressureResistance)
            result = 2;
          else
            result = 0;
          break;
        }
        case PT_PVOD:
          if (parts[ID(r)].life == 10) {
            if (!parts[ID(r)].ctype || ((parts[ID(r)].ctype == pt ? 1 : 0) != (parts[ID(r)].tmp & 1)))
              result = 1;
            else
              result = 0;
          } else result = 0;
          break;
        case PT_VOID:
          if (!parts[ID(r)].ctype || ((parts[ID(r)].ctype == pt ? 1 : 0) != (parts[ID(r)].tmp & 1)))
            result = 1;
          else
            result = 0;
          break;
        case PT_SWCH:
          if (pt == PT_TRON) {
            if (parts[ID(r)].life >= 10)
              return 2;
            else
              return 0;
          }
          break;
        default:
          // This should never happen
          // If it were to happen, try_move would interpret a 3 as a 1
          result = 1;
      }
    }
    const cy = (ny / CELL) | 0, cx = (nx / CELL) | 0;
    if (this.bmap[cy][cx]) {
      if (this.IsWallBlocking(nx, ny, pt))
        return 0;
      if (this.bmap[cy][cx] == WL_EHOLE && !this.emap[cy][cx] && !(elements[pt].Properties & TYPE_SOLID) && !(elements[TYP(r)].Properties & TYPE_SOLID))
        return 2;
    }
    return result;
  }

  try_move(i: number, x: number, y: number, nx: number, ny: number): number {
    const rref: Ref = { v: 0 };
    let e: number;
    const parts = this.parts, pmap = this.pmap;

    if (x == nx && y == ny)
      return 1;
    if (nx < 0 || ny < 0 || nx >= XRES || ny >= YRES)
      return 1;

    e = this.eval_move(parts[i].type, nx, ny, rref);
    const r = rref.v;

    /* half-silvered mirror */
    if (!e && parts[i].type == PT_PHOT && ((TYP(r) == PT_BMTL && this.rng.chance(1, 2)) || TYP(pmap[y][x]) == PT_BMTL))
      e = 2;

    const elements = sd.elements;
    if (!e) //if no movement
    {
      const rt = TYP(r);
      if (rt == PT_WOOD) {
        //@ WOOD -> SAWD
        const vel = f(Math.sqrt(parts[i].vx * parts[i].vx + parts[i].vy * parts[i].vy));
        if (vel > 5)
          this.part_change_type(ID(r), nx, ny, PT_SAWD);
      }
      if (!(elements[parts[i].type].Properties & TYPE_ENERGY))
        return 0;
      if (!this.legacy_enable && parts[i].type == PT_PHOT && r)//PHOT heat conduction
      {
        if (rt == PT_COAL || rt == PT_BCOL)
          parts[ID(r)].temp = parts[i].temp;

        if (rt < PT_NUM && !sd.IsHeatInsulator(parts[ID(r)]) && rt != PT_FILT)
          parts[i].temp = parts[ID(r)].temp = restrict_flt(f(f(parts[ID(r)].temp + parts[i].temp) / 2), MIN_TEMP, MAX_TEMP);
      } else if ((parts[i].type == PT_NEUT || parts[i].type == PT_ELEC) && (rt == PT_CLNE || rt == PT_PCLN || rt == PT_BCLN || rt == PT_PBCN)) {
        if (!parts[ID(r)].ctype)
          parts[ID(r)].ctype = parts[i].type;
      }
      if (rt == PT_PRTI && (elements[parts[i].type].Properties & TYPE_ENERGY)) {
        let nnx: number, count: number;
        for (count = 0; count < 8; count++) {
          if (isign(x - nx) == isign(portal_rx[count]) && isign(y - ny) == isign(portal_ry[count]))
            break;
        }
        count = count % 8;
        parts[ID(r)].tmp = ci(f(f(f(parts[ID(r)].temp - f(73.15)) / 100) + 1));
        if (parts[ID(r)].tmp >= CHANNELS) parts[ID(r)].tmp = CHANNELS - 1;
        else if (parts[ID(r)].tmp < 0) parts[ID(r)].tmp = 0;
        for (nnx = 0; nnx < 80; nnx++)
          if (!this.portalp[parts[ID(r)].tmp][count][nnx].type) {
            this.portalp[parts[ID(r)].tmp][count][nnx].copyFrom(parts[i]);
            this.kill_part(i);
            break;
          }
      }
      return 0;
    }

    if (e == 2) //if occupy same space
    {
      switch (parts[i].type) {
        case PT_PHOT: {
          switch (TYP(r)) {
            case PT_GLOW:
              if (!parts[ID(r)].life && this.rng.chance(1, 30)) {
                parts[ID(r)].life = 120;
                this.create_gain_photon(i);
              }
              break;
            case PT_FILT:
              parts[i].ctype = Element_FILT_interactWavelengths(this, parts[ID(r)], parts[i].ctype);
              break;
            case PT_C5:
              if (parts[ID(r)].life > 0 && (parts[ID(r)].ctype & parts[i].ctype & 0xFFFFFFC0)) {
                const vx = f(((parts[ID(r)].tmp << 16) >> 16) / f(255.0));
                const vy = f((parts[ID(r)].tmp >> 16) / f(255.0));
                let vn = f(f(parts[i].vx * parts[i].vx) + f(parts[i].vy * parts[i].vy));
                // if the resulting velocity would be 0, that would cause division by 0 inside the else
                // shoot the photon off at a 90 degree angle instead (probably particle order dependent)
                if (f(parts[i].vx + vx) == 0 && f(parts[i].vy + vy) == 0) {
                  parts[i].vx = vy;
                  parts[i].vy = -vx;
                } else {
                  parts[i].ctype = (parts[ID(r)].ctype & parts[i].ctype) >>> 6;
                  // add momentum of photons to each other
                  parts[i].vx = f(parts[i].vx + vx);
                  parts[i].vy = f(parts[i].vy + vy);
                  // normalize velocity to original value
                  vn = f(vn / f(f(parts[i].vx * parts[i].vx) + f(parts[i].vy * parts[i].vy)));
                  vn = f(Math.sqrt(vn));
                  parts[i].vx = f(parts[i].vx * vn);
                  parts[i].vy = f(parts[i].vy * vn);
                }
                parts[ID(r)].life = 0;
                parts[ID(r)].ctype = 0;
              } else if (!parts[ID(r)].ctype && parts[i].ctype & 0xFFFFFFC0) {
                parts[ID(r)].life = 1;
                parts[ID(r)].ctype = parts[i].ctype;
                parts[ID(r)].tmp = (0xFFFF & ci(f(parts[i].vx * 255.0))) | (0xFFFF0000 & ci(f(parts[i].vy * 16711680.0)));
                parts[ID(r)].tmp2 = (0xFFFF & ci(f(f(parts[i].x - x) * 255.0))) | (0xFFFF0000 & ci(f(f(parts[i].y - y) * 16711680.0)));
                this.kill_part(i);
              }
              break;
            case PT_INVIS: {
              const pressureResistance = (parts[ID(r)].tmp > 0) ? f(parts[ID(r)].tmp) : 4.0;
              const p = this.pv[(ny / CELL) | 0][(nx / CELL) | 0];
              if (p >= -pressureResistance && p <= pressureResistance) {
                //@ PHOT + INVIS -> NEUT + INVIS
                this.part_change_type(i, x, y, PT_NEUT);
                parts[i].ctype = 0;
              }
              break;
            }
            case PT_BIZR:
            case PT_BIZRG:
            case PT_BIZRS:
              //@ PHOT + BIZR/BIZRG/BIZRS -> ELEC + BIZR/BIZRG/BIZRS
              this.part_change_type(i, x, y, PT_ELEC);
              parts[i].ctype = 0;
              break;
            case PT_H2:
              if (!(parts[i].tmp & 0x1)) {
                //@ PHOT + H2 -> PROT + ELEC
                this.part_change_type(i, x, y, PT_PROT);
                parts[i].ctype = 0;
                parts[i].tmp2 = 0x1;

                this.create_part(ID(r), x, y, PT_ELEC);
                return 1;
              }
              break;
            case PT_GPMP:
              if (parts[ID(r)].life == 0) {
                //@ PHOT + GPMP -> GRVT + GPMP
                this.part_change_type(i, x, y, PT_GRVT);
                parts[i].tmp = ci(f(parts[ID(r)].temp - f(273.15)));
              }
              break;
          }
          break;
        }
        case PT_NEUT:
          //@ NEUT + GLAS/BGLA -> NEUT + GLAS/BGLA + PHOT
          if (TYP(r) == PT_GLAS || TYP(r) == PT_BGLA)
            if (this.rng.chance(1, 10))
              this.create_cherenkov_photon(i);
          break;
        case PT_ELEC:
          if (TYP(r) == PT_GLOW) {
            //@ ELEC + GLOW -> PHOT + GLOW
            this.part_change_type(i, x, y, PT_PHOT);
            parts[i].ctype = 0x3FFFFFFF;
          }
          break;
        case PT_PROT:
          //@ PROT + INVIS -> NEUT + INVIS
          if (TYP(r) == PT_INVIS)
            this.part_change_type(i, x, y, PT_NEUT);
          break;
        case PT_BIZR:
        case PT_BIZRG:
          if (TYP(r) == PT_FILT)
            parts[i].ctype = Element_FILT_interactWavelengths(this, parts[ID(r)], parts[i].ctype);
          break;
      }
      return 1;
    }
    //else e=1 , we are trying to swap the particles, return 0 no swap/move, 1 is still overlap/move, because the swap takes place later

    switch (TYP(r)) {
      case PT_VOID:
      case PT_PVOD:
        // this is where void eats particles
        // void ctype already checked in eval_move
        this.kill_part(i);
        return 0;
      case PT_BHOL:
      case PT_NBHL:
        // this is where blackhole eats particles
        if (!this.legacy_enable) {
          parts[ID(r)].temp = restrict_flt(f(parts[ID(r)].temp + f(parts[i].temp / 2)), MIN_TEMP, MAX_TEMP);//3.0f;
        }
        this.kill_part(i);
        return 0;
      case PT_WHOL:
      case PT_NWHL:
        // whitehole eats anar
        if (parts[i].type == PT_ANAR) {
          if (!this.legacy_enable) {
            parts[ID(r)].temp = restrict_flt(f(parts[ID(r)].temp - f(f(MAX_TEMP - parts[i].temp) / 2)), MIN_TEMP, MAX_TEMP);
          }
          this.kill_part(i);
          return 0;
        }
        break;
      case PT_DEUT:
        if (parts[i].type == PT_ELEC) {
          if (parts[ID(r)].life < 6000)
            parts[ID(r)].life += 1;
          parts[ID(r)].temp = 0;
          this.kill_part(i);
          return 0;
        }
        break;
      case PT_VIBR:
      case PT_BVBR:
        if ((elements[parts[i].type].Properties & TYPE_ENERGY)) {
          parts[ID(r)].tmp += 20;
          this.kill_part(i);
          return 0;
        }
        break;
    }

    switch (parts[i].type) {
      case PT_NEUT:
        if (elements[TYP(r)].Properties & PROP_NEUTABSORB) {
          this.kill_part(i);
          return 0;
        }
        break;
      case PT_CNCT: {
        // Calculate offset from gravity
        const g = { x: 0, y: 0 };
        this.GetGravityField(x, y, elements[PT_CNCT].Gravity, elements[PT_CNCT].Gravity, g);
        const cnctGravX = g.x, cnctGravY = g.y;
        let offsetX = 0, offsetY = 0;
        if (cnctGravX > 0.0) offsetX++;
        else if (cnctGravX < 0.0) offsetX--;
        if (cnctGravY > 0.0) offsetY++;
        else if (cnctGravY < 0.0) offsetY--;
        if ((offsetX != 0) != (offsetY != 0) && // Is this a different position (avoid diagonals, doesn't work well)
          ((nx - x) * offsetX > 0 || (ny - y) * offsetY > 0) && // Is the destination particle below the moving particle
          (TYP(pmap[y + offsetY][x + offsetX]) == PT_CNCT || TYP(pmap[y + offsetY][x + offsetX]) == PT_ROCK)) //check below CNCT for another CNCT or ROCK
          return 0;
        break;
      }
      case PT_GBMB:
        if (parts[i].life > 0)
          return 0;
        break;
    }

    const bmap = this.bmap, emap = this.emap;
    if ((bmap[(y / CELL) | 0][(x / CELL) | 0] == WL_EHOLE && !emap[(y / CELL) | 0][(x / CELL) | 0]) && !(bmap[(ny / CELL) | 0][(nx / CELL) | 0] == WL_EHOLE && !emap[(ny / CELL) | 0][(nx / CELL) | 0]))
      return 0;

    const ri = ID(r); //ri is the particle number at r (pmap[ny][nx])
    if (r)//the swap part, if we make it this far, swap
    {
      if (parts[i].type == PT_NEUT) {
        // target material is NEUTPENETRATE, meaning it gets moved around when neutron passes
        const s = pmap[y][x];
        if (s && !(elements[TYP(s)].Properties & PROP_NEUTPENETRATE))
          return 1; // if the element currently underneath neutron isn't NEUTPENETRATE, don't move anything except the neutron
        // if nothing is currently underneath neutron, only move target particle
        if (bmap[(y / CELL) | 0][(x / CELL) | 0] == WL_ALLOWENERGY)
          return 1; // do not drag target particle into an energy only wall
        if (s) {
          pmap[ny][nx] = (s & ~PMAPMASK) | parts[ID(s)].type;
          parts[ID(s)].x = nx;
          parts[ID(s)].y = ny;
        } else
          pmap[ny][nx] = 0;
        parts[ri].x = x;
        parts[ri].y = y;
        pmap[y][x] = PMAP(ri, parts[ri].type);
        return 1;
      }

      if (pmap[ny][nx] && ID(pmap[ny][nx]) == ri)
        pmap[ny][nx] = 0;
      parts[ri].x = parts[i].x;
      parts[ri].y = parts[i].y;
      const rx = ci(f(parts[ri].x + 0.5));
      const ry = ci(f(parts[ri].y + 0.5));
      pmap[ry][rx] = PMAP(ri, parts[ri].type);
    }
    return 1;
  }

  // try to move particle, and if successful update pmap and parts[i].x,y
  do_move(i: number, x: number, y: number, nxf: number, nyf: number): number {
    let nx = ci(f(nxf + 0.5)), ny = ci(f(nyf + 0.5));
    if (this.edgeMode == EDGE_LOOP) {
      const x_ok = (nx >= CELL && nx < XRES - CELL);
      const y_ok = (ny >= CELL && ny < YRES - CELL);
      if (!x_ok)
        nxf = f(f(remainder_p(f(f(nxf - CELL) + 0.5), f(XRES - f(CELL * 2.0))) + CELL) - 0.5);
      if (!y_ok)
        nyf = f(f(remainder_p(f(f(nyf - CELL) + 0.5), f(YRES - f(CELL * 2.0))) + CELL) - 0.5);
      nx = ci(f(nxf + 0.5));
      ny = ci(f(nyf + 0.5));
    }
    if (this.parts[i].type == PT_NONE)
      return 0;
    const result = this.try_move(i, x, y, nx, ny);
    if (result) {
      if (!this.move(i, x, y, nxf, nyf))
        return -1;
    }
    return result;
  }

  move(i: number, x: number, y: number, nxf: number, nyf: number): boolean {
    const elements = sd.elements;
    const parts = this.parts;
    const nx = ci(f(nxf + 0.5)), ny = ci(f(nyf + 0.5));
    const t = parts[i].type;
    parts[i].x = nxf;
    parts[i].y = nyf;
    if (ny != y || nx != x) {
      if (this.pmap[y][x] && ID(this.pmap[y][x]) == i)
        this.pmap[y][x] = 0;
      if (this.photons[y][x] && ID(this.photons[y][x]) == i)
        this.photons[y][x] = 0;
      // kill_part if particle is out of bounds
      if (nx < CELL || nx >= XRES - CELL || ny < CELL || ny >= YRES - CELL) {
        this.kill_part(i);
        return false;
      }
      if (elements[t].Properties & TYPE_ENERGY)
        this.photons[ny][nx] = PMAP(i, t);
      else if (t)
        this.pmap[ny][nx] = PMAP(i, t);
    }

    return true;
  }

  photoelectric_effect(nx: number, ny: number): void//create sparks from PHOT when hitting PSCN and NSCN
  {
    const pmap = this.pmap;
    const r = pmap[ny][nx];

    if (TYP(r) == PT_PSCN && !this.parts[ID(r)].life) {
      if (TYP(pmap[ny][nx - 1]) == PT_NSCN || TYP(pmap[ny][nx + 1]) == PT_NSCN ||
        TYP(pmap[ny - 1][nx]) == PT_NSCN || TYP(pmap[ny + 1][nx]) == PT_NSCN) {
        this.parts[ID(r)].ctype = PT_PSCN;
        this.part_change_type(ID(r), nx, ny, PT_SPRK);
        this.parts[ID(r)].life = 4;
      }
    }
  }

  is_blocking(t: number, x: number, y: number): number {
    if (t & REFRACT) {
      if (x < 0 || y < 0 || x >= XRES || y >= YRES)
        return 0;
      if (TYP(this.pmap[y][x]) == PT_GLAS || TYP(this.pmap[y][x]) == PT_BGLA)
        return 1;
      return 0;
    }

    return !this.eval_move(t, x, y, null) ? 1 : 0;
  }

  is_boundary(pt: number, x: number, y: number): number {
    if (!this.is_blocking(pt, x, y))
      return 0;
    if (this.is_blocking(pt, x, y - 1) && this.is_blocking(pt, x, y + 1) && this.is_blocking(pt, x - 1, y) && this.is_blocking(pt, x + 1, y))
      return 0;
    return 1;
  }

  /** int find_next_boundary(int pt, int *x, int *y, int dm, int *em, bool reverse) const; p = { x, y, em } */
  find_next_boundary(pt: number, p: { x: number; y: number; em: number }, dm: number, reverse: boolean): number {
    if (p.x <= 0 || p.x >= XRES - 1 || p.y <= 0 || p.y >= YRES - 1) {
      return 0;
    }

    if (p.em != -1) {
      dm &= fnb_de[p.em];
    }

    let mask = 0;
    for (let i = 0; i < 8; ++i) {
      if ((dm & (1 << i)) && this.is_blocking(pt, p.x + fnb_dx[i], p.y + fnb_dy[i])) {
        mask |= (1 << i);
      }
    }
    for (let i = 0; i < 8; ++i) {
      const n = (i + (reverse ? 1 : -1)) & 7;
      if (((mask & (1 << i))) && !(mask & (1 << n))) {
        p.x += fnb_dx[i];
        p.y += fnb_dy[i];
        p.em = i;
        return 1;
      }
    }

    return 0;
  }

  get_normal(pt: number, x: number, y: number, dx: number, dy: number): GetNormalResult {
    let lv: number, rv: number;
    let i: number, j: number;

    if (!dx && !dy)
      return NORMAL_FAIL;

    if (!this.is_boundary(pt, x, y))
      return NORMAL_FAIL;

    const ldm = (pt & REFRACT) ? 0xFF : direction_to_map(-dy, dx, pt);
    const rdm = (pt & REFRACT) ? 0xFF : direction_to_map(dy, -dx, pt);
    const l = { x, y, em: -1 };
    const r = { x, y, em: -1 };
    lv = rv = 1;

    j = 0;
    for (i = 0; i < SURF_RANGE; i++) {
      if (lv)
        lv = this.find_next_boundary(pt, l, ldm, true);
      if (rv)
        rv = this.find_next_boundary(pt, r, rdm, false);
      j += lv + rv;
      if (!lv && !rv)
        break;
    }

    if (j < NORMAL_MIN_EST)
      return NORMAL_FAIL;

    if ((l.x == r.x) && (l.y == r.y))
      return NORMAL_FAIL;
    const ex = r.x - l.x;
    const ey = r.y - l.y;
    // hypot of the floats promoted to double (::hypot), 1.0f/double in double, stored into float r
    const rr = f(1.0 / Math.sqrt(ex * ex + ey * ey));
    const nx = f(ey * rr);
    const ny = f(-ex * rr);

    return { success: true, nx, ny, lx: l.x, ly: l.y, rx: r.x, ry: r.y };
  }

  /** template<bool PhotoelectricEffect> get_normal_interp(sim, pt, x0, y0, dx, dy) */
  get_normal_interp(PhotoelectricEffect: boolean, pt: number, x0: number, y0: number, dx: number, dy: number): GetNormalResult {
    let x = 0, y = 0, i: number;

    dx = f(dx / NORMAL_FRAC);
    dy = f(dy / NORMAL_FRAC);

    for (i = 0; i < NORMAL_INTERP; i++) {
      x = ci(f(x0 + 0.5));
      y = ci(f(y0 + 0.5));
      if (x < 0 || y < 0 || x >= XRES || y >= YRES) {
        return NORMAL_FAIL;
      }
      if (this.is_boundary(pt, x, y))
        break;
      x0 = f(x0 + dx);
      y0 = f(y0 + dy);
    }
    if (i >= NORMAL_INTERP)
      return NORMAL_FAIL;

    if (PhotoelectricEffect) {
      if (pt == PT_PHOT)
        this.photoelectric_effect(x, y);
    }

    return this.get_normal(pt, x, y, dx, dy);
  }

  kill_part(i: number): void//kills particle number i
  {
    if (i < 0 || i >= NPART)
      return;

    const parts = this.parts;
    const x = ci(f(parts[i].x + 0.5));
    const y = ci(f(parts[i].y + 0.5));

    const elements = sd.elements;
    const t = parts[i].type;
    if (t && elements[t].ChangeType) {
      elements[t].ChangeType!(this, i, x, y, t, PT_NONE);
    }

    if (x >= 0 && y >= 0 && x < XRES && y < YRES) {
      if (this.pmap[y][x] && ID(this.pmap[y][x]) == i)
        this.pmap[y][x] = 0;
      else if (this.photons[y][x] && ID(this.photons[y][x]) == i)
        this.photons[y][x] = 0;
    }

    // This shouldn't happen but ... you never know?
    if (t == PT_NONE)
      return;

    this.elementCount[t]--;

    parts.Free(i);
    this.NUM_PARTS -= 1;
  }

  /** void detach(int i): declared in Simulation.h, defined nowhere in v100.1.400; SOAP's detach is the one */
  detach(i: number): void {
    Element_SOAP_detach(this, i);
  }

  // Changes the type of particle number i, to t.  This also changes pmap at the same time
  // Returns true if the particle was killed
  part_change_type(i: number, x: number, y: number, t: number): boolean {
    const parts = this.parts;
    if (x < 0 || y < 0 || x >= XRES || y >= YRES || i >= NPART || t < 0 || t >= PT_NUM || !parts[i].type)
      return false;

    const elements = sd.elements;
    if (!elements[t].Enabled || t == PT_NONE) {
      this.kill_part(i);
      return true;
    }
    if (elements[t].CreateAllowed) {
      if (!elements[t].CreateAllowed!(this, i, x, y, t))
        return false;
    }

    if (elements[parts[i].type].ChangeType)
      elements[parts[i].type].ChangeType!(this, i, x, y, parts[i].type, t);
    if (elements[t].ChangeType)
      elements[t].ChangeType!(this, i, x, y, parts[i].type, t);

    if (parts[i].type > 0 && parts[i].type < PT_NUM && this.elementCount[parts[i].type])
      this.elementCount[parts[i].type]--;
    this.elementCount[t]++;

    parts[i].type = t;
    if (elements[t].Properties & TYPE_ENERGY) {
      this.photons[y][x] = PMAP(i, t);
      if (this.pmap[y][x] && ID(this.pmap[y][x]) == i)
        this.pmap[y][x] = 0;
    } else {
      this.pmap[y][x] = PMAP(i, t);
      if (this.photons[y][x] && ID(this.photons[y][x]) == i)
        this.photons[y][x] = 0;
    }
    return false;
  }

  //the function for creating a particle, use p=-1 for creating a new particle, -2 is from a brush, or a particle number to replace a particle.
  //tv = Type (PMAPBITS bits) + Var (32-PMAPBITS bits), var is usually 0
  /** int create_part(int p, int x, int y, int t, int v = -1) */
  create_part(p: number, x: number, y: number, t: number, v = -1): number {
    let i: number, oldType = PT_NONE;
    const parts = this.parts, pmap = this.pmap;

    const elements = sd.elements;
    if (x < 0 || y < 0 || x >= XRES || y >= YRES || t <= 0 || t >= PT_NUM || !elements[t].Enabled)
      return -1;

    if (t == PT_SPRK && p != -3 && !(p == -2 && elements[TYP(pmap[y][x])].CtypeDraw)) {
      const type = TYP(pmap[y][x]);
      const index = ID(pmap[y][x]);
      if (type == PT_WIRE) {
        parts[index].ctype = PT_DUST;
        return index;
      }
      if (!(type == PT_INST || (elements[type].Properties & PROP_CONDUCTS)) || parts[index].life != 0)
        return -1;
      if (p == -2 && type == PT_INST) {
        this.FloodINST(x, y);
        return index;
      }
      parts[index].type = PT_SPRK;
      parts[index].life = 4;
      parts[index].ctype = type;
      pmap[y][x] = (pmap[y][x] & ~PMAPMASK) | PT_SPRK;
      if (f(parts[index].temp + 10.0) < 673.0 && !this.legacy_enable && (type == PT_METL || type == PT_BMTL || type == PT_BRMT || type == PT_PSCN || type == PT_NSCN || type == PT_ETRD || type == PT_NBLE || type == PT_IRON))
        parts[index].temp = f(parts[index].temp + 10.0);
      return index;
    }

    if (p == -2) {
      if (pmap[y][x]) {
        const drawOn = TYP(pmap[y][x]);
        if (elements[drawOn].CtypeDraw)
          elements[drawOn].CtypeDraw!(this, ID(pmap[y][x]), t, v);
        return -1;
      } else if (this.IsWallBlocking(x, y, t))
        return -1;
      else if (this.photons[y][x] && (elements[t].Properties & TYPE_ENERGY))
        return -1;
    }

    if (elements[t].CreateAllowed) {
      if (!elements[t].CreateAllowed!(this, p, x, y, t))
        return -1;
    }

    if (p == -1 || //creating from anything but brush
      p == -2 || //creating from brush
      p == -3) //skip pmap checks, e.g. for sing explosion
    {
      if (p == -1) {
        // If there is a particle, only allow creation if the new particle can occupy the same space as the existing particle
        // If there isn't a particle but there is a wall, check whether the new particle is allowed to be in it
        //   (not "!=2" for wall check because eval_move returns 1 for moving into empty space)
        // If there's no particle and no wall, assume creation is allowed
        if (pmap[y][x] ? (this.eval_move(t, x, y, null) != 2) : (this.bmap[(y / CELL) | 0][(x / CELL) | 0] && this.eval_move(t, x, y, null) == 0)) {
          return -1;
        }
      }
      i = parts.Alloc();
      if (i == -1) {
        return -1;
      }
      this.NUM_PARTS += 1;
    } else {
      const oldX = ci(f(parts[p].x + 0.5));
      const oldY = ci(f(parts[p].y + 0.5));

      if (InBounds(oldX, oldY)) {
        if (pmap[oldY][oldX] && ID(pmap[oldY][oldX]) == p)
          pmap[oldY][oldX] = 0;
        if (this.photons[oldY][oldX] && ID(this.photons[oldY][oldX]) == p)
          this.photons[oldY][oldX] = 0;
      }

      oldType = parts[p].type;

      if (elements[oldType].ChangeType)
        elements[oldType].ChangeType!(this, p, oldX, oldY, oldType, t);
      if (oldType)
        this.elementCount[oldType]--;

      i = p;
    }

    parts[i].copyFrom(elements[t].DefaultProperties);
    parts[i].type = t;
    parts[i].x = x;
    parts[i].y = y;

    //and finally set the pmap/photon maps to the newly created particle
    if (elements[t].Properties & TYPE_ENERGY)
      this.photons[y][x] = PMAP(i, t);
    else if (t != PT_STKM && t != PT_STKM2 && t != PT_FIGH)
      pmap[y][x] = PMAP(i, t);

    //Fancy dust effects for powder types
    if ((elements[t].Properties & TYPE_PART) && this.pretty_powder) {
      let colr: number, colg: number, colb: number;
      const sandcolourToUse = p == -2 ? this.sandcolour_interface : this.sandcolour;
      const colour = elements[t].Colour;
      colr = ((colour >>> 16) & 0xFF) + ci(sandcolourToUse * 1.3) + this.rng.between(-20, 20) + this.rng.between(-15, 15);
      colg = ((colour >>> 8) & 0xFF) + ci(sandcolourToUse * 1.3) + this.rng.between(-20, 20) + this.rng.between(-15, 15);
      colb = (colour & 0xFF) + ci(sandcolourToUse * 1.3) + this.rng.between(-20, 20) + this.rng.between(-15, 15);
      colr = Math.min(Math.max(colr, 0), 255);
      colg = Math.min(Math.max(colg, 0), 255);
      colb = Math.min(Math.max(colb, 0), 255);
      parts[i].dcolour = (this.rng.between(0, 149) << 24) | (colr << 16) | (colg << 8) | colb;
    }

    // Set non-static properties (such as randomly generated ones)
    if (elements[t].Create)
      elements[t].Create!(this, i, x, y, t, v);

    if (elements[t].ChangeType)
      elements[t].ChangeType!(this, i, x, y, oldType, t);

    this.elementCount[t]++;
    return i;
  }

  // Change part type but preserve temperature and velocity.
  // May fail if i isn't an existing particle id.
  createPartTempVel(i: number, x: number, y: number, t: number): number {
    const parts = this.parts;
    const temp = parts[i].temp;
    const vx = parts[i].vx;
    const vy = parts[i].vy;

    const np = this.create_part(i, x, y, t);
    if (np >= 0) {
      parts[np].temp = temp;
      parts[np].vx = vx;
      parts[np].vy = vy;
    }

    return np;
  }

  create_gain_photon(pp: number): void//photons from PHOT going through GLOW
  {
    const parts = this.parts;
    if (parts.MaxPartsReached()) {
      return;
    }
    const lr = 2 * this.rng.between(0, 1) - 1; // -1 or 1
    const xx = f(parts[pp].x - f(f(lr * f(0.3)) * parts[pp].vy));
    const yy = f(parts[pp].y + f(f(lr * f(0.3)) * parts[pp].vx));
    const nx = ci(f(xx + 0.5));
    const ny = ci(f(yy + 0.5));
    if (nx < 0 || ny < 0 || nx >= XRES || ny >= YRES) {
      return;
    }
    const g = this.pmap[ny][nx];
    if (TYP(g) != PT_GLOW) {
      return;
    }
    const oldTemp = parts[ID(g)].temp;
    const i = this.create_part(-3, nx, ny, PT_PHOT);
    if (i == -1) {
      return;
    }
    parts[i].x = xx;
    parts[i].y = yy;
    parts[i].vx = parts[pp].vx;
    parts[i].vy = parts[pp].vy;
    parts[i].temp = oldTemp;
    let temp_bin = ci(f(f(parts[i].temp - 273.0) * 0.25));
    if (temp_bin < 0) temp_bin = 0;
    if (temp_bin > 25) temp_bin = 25;
    parts[i].ctype = 0x1F << temp_bin;
  }

  create_cherenkov_photon(pp: number): void//photons from NEUT going through GLAS
  {
    const parts = this.parts;
    if (parts.MaxPartsReached()) {
      return;
    }
    const nx = ci(f(parts[pp].x + 0.5));
    const ny = ci(f(parts[pp].y + 0.5));
    const g = this.pmap[ny][nx];
    if (TYP(g) != PT_GLAS && TYP(g) != PT_BGLA) {
      return;
    }
    if (hypotf(parts[pp].vx, parts[pp].vy) < f(1.44)) {
      return;
    }
    const oldTemp = parts[ID(g)].temp;
    const i = this.create_part(-3, nx, ny, PT_PHOT);
    if (i == -1) {
      return;
    }
    const lr = 2 * this.rng.between(0, 1) - 1; // -1 or 1
    parts[i].ctype = 0x00000F80;
    parts[i].x = parts[pp].x;
    parts[i].y = parts[pp].y;
    parts[i].temp = oldTemp;
    parts[i].vx = f(parts[pp].vx - f(f(lr * 2.5) * parts[pp].vy));
    parts[i].vy = f(parts[pp].vy + f(f(lr * 2.5) * parts[pp].vx));
    /* photons have speed of light. no discussion. */
    const r = f(f(1.269) / hypotf(parts[i].vx, parts[i].vy));
    parts[i].vx = f(parts[i].vx * r);
    parts[i].vy = f(parts[i].vy * r);
  }

  /** void GetGravityField(int x, int y, float particleGrav, float newtonGrav, float &pGravX, float &pGravY) const */
  GetGravityField(x: number, y: number, particleGrav: number, newtonGrav: number, out: { x: number; y: number }): void {
    switch (this.gravityMode) {
      default:
      case GRAV_VERTICAL: //normal, vertical gravity
        out.x = 0;
        out.y = particleGrav;
        break;
      case GRAV_OFF: //no gravity
        out.x = 0;
        out.y = 0;
        break;
      case GRAV_RADIAL: //radial gravity
      {
        out.x = 0;
        out.y = 0;
        const dx = x - XCNTR;
        const dy = y - YCNTR;
        if (dx || dy) {
          const pGravD = f(f(0.01) - hypotf(dx, dy));
          out.x = f(particleGrav * f(dx / pGravD));
          out.y = f(particleGrav * f(dy / pGravD));
        }
      }
        break;
      case GRAV_CUSTOM: //custom gravity
        out.x = f(particleGrav * this.customGravityX);
        out.y = f(particleGrav * this.customGravityY);
        break;
    }
    if (newtonGrav) {
      const k = ((y / CELL) | 0) * XCELLS + ((x / CELL) | 0);
      out.x = f(out.x + f(newtonGrav * this.gravOut.forceX[k]));
      out.y = f(out.y + f(newtonGrav * this.gravOut.forceY[k]));
    }
  }

  delete_part(x: number, y: number): void//calls kill_part with the particle located at x,y
  {
    if (x < 0 || y < 0 || x >= XRES || y >= YRES)
      return;

    const i = this.photons[y][x] ? this.photons[y][x] : this.pmap[y][x];

    if (!i)
      return;
    this.kill_part(ID(i));
  }

  /** template<bool UpdateEmap> static PlanMoveResult PlanMove(Sim &sim, int i, int x, int y) */
  PlanMove(UpdateEmap: boolean, i: number, _x: number, _y: number): PlanMoveResult {
    const parts = this.parts;
    const bmap = this.bmap;
    const emap = this.emap;
    const pmap = this.pmap;
    const edgeMode = this.edgeMode;
    const can_move = sd.can_move;
    const t = parts[i].type;
    let fin_x: number, fin_y: number, clear_x: number, clear_y: number;
    let fin_xf: number, fin_yf: number, clear_xf: number, clear_yf: number;
    let vx = parts[i].vx;
    let vy = parts[i].vy;
    let mv = fmaxf(Math.abs(vx), Math.abs(vy));
    if (mv < ISTP || mv !== mv) {
      clear_x = _x;
      clear_y = _y;
      clear_xf = parts[i].x;
      clear_yf = parts[i].y;
      fin_xf = f(clear_xf + vx);
      fin_yf = f(clear_yf + vy);
      fin_x = ci(f(fin_xf + 0.5));
      fin_y = ci(f(fin_yf + 0.5));
    } else {
      if (mv > MAX_VELOCITY) {
        vx = f(vx * f(MAX_VELOCITY / mv));
        vy = f(vy * f(MAX_VELOCITY / mv));
        mv = MAX_VELOCITY;
      }
      // interpolate to see if there is anything in the way
      const dx = f(f(vx * ISTP) / mv);
      const dy = f(f(vy * ISTP) / mv);
      fin_xf = parts[i].x;
      fin_yf = parts[i].y;
      fin_x = ci(f(fin_xf + 0.5));
      fin_y = ci(f(fin_yf + 0.5));
      const closedEholeStart = InBounds(fin_x, fin_y) && (bmap[(fin_y / CELL) | 0][(fin_x / CELL) | 0] == WL_EHOLE && !emap[(fin_y / CELL) | 0][(fin_x / CELL) | 0]);
      for (;;) {
        mv = f(mv - ISTP);
        fin_xf = f(fin_xf + dx);
        fin_yf = f(fin_yf + dy);
        fin_x = ci(f(fin_xf + 0.5));
        fin_y = ci(f(fin_yf + 0.5));
        if (edgeMode == EDGE_LOOP) {
          const x_ok = (fin_xf >= f(CELL - 0.5) && fin_xf < f(XRES - CELL - 0.5));
          const y_ok = (fin_yf >= f(CELL - 0.5) && fin_yf < f(YRES - CELL - 0.5));
          if (!x_ok)
            fin_xf = f(f(remainder_p(f(f(fin_xf - CELL) + 0.5), f(XRES - f(CELL * 2.0))) + CELL) - 0.5);
          if (!y_ok)
            fin_yf = f(f(remainder_p(f(f(fin_yf - CELL) + 0.5), f(YRES - f(CELL * 2.0))) + CELL) - 0.5);
          fin_x = ci(f(fin_xf + 0.5));
          fin_y = ci(f(fin_yf + 0.5));
        }
        if (mv <= 0.0) {
          // nothing found
          fin_xf = f(parts[i].x + vx);
          fin_yf = f(parts[i].y + vy);
          if (edgeMode == EDGE_LOOP) {
            const x_ok = (fin_xf >= f(CELL - 0.5) && fin_xf < f(XRES - CELL - 0.5));
            const y_ok = (fin_yf >= f(CELL - 0.5) && fin_yf < f(YRES - CELL - 0.5));
            if (!x_ok)
              fin_xf = f(f(remainder_p(f(f(fin_xf - CELL) + 0.5), f(XRES - f(CELL * 2.0))) + CELL) - 0.5);
            if (!y_ok)
              fin_yf = f(f(remainder_p(f(f(fin_yf - CELL) + 0.5), f(YRES - f(CELL * 2.0))) + CELL) - 0.5);
          }
          fin_x = ci(f(fin_xf + 0.5));
          fin_y = ci(f(fin_yf + 0.5));
          clear_xf = f(fin_xf - dx);
          clear_yf = f(fin_yf - dy);
          clear_x = ci(f(clear_xf + 0.5));
          clear_y = ci(f(clear_yf + 0.5));
          break;
        }
        //block if particle can't move (0), or some special cases where it returns 1 (can_move = 3 but returns 1 meaning particle will be eaten)
        //also photons are still blocked (slowed down) by any particle (even ones it can move through), and absorb wall also blocks particles
        const evalr = this.eval_move(t, fin_x, fin_y, null);
        if (!evalr || (can_move[t][TYP(pmap[fin_y][fin_x])] == 3 && evalr == 1) || (t == PT_PHOT && pmap[fin_y][fin_x]) || bmap[(fin_y / CELL) | 0][(fin_x / CELL) | 0] == WL_DESTROYALL || closedEholeStart != (bmap[(fin_y / CELL) | 0][(fin_x / CELL) | 0] == WL_EHOLE && !emap[(fin_y / CELL) | 0][(fin_x / CELL) | 0])) {
          // found an obstacle
          clear_xf = f(fin_xf - dx);
          clear_yf = f(fin_yf - dy);
          clear_x = ci(f(clear_xf + 0.5));
          clear_y = ci(f(clear_yf + 0.5));
          break;
        }
        if (UpdateEmap) {
          if (bmap[(fin_y / CELL) | 0][(fin_x / CELL) | 0] == WL_DETECT && emap[(fin_y / CELL) | 0][(fin_x / CELL) | 0] < 8)
            this.set_emap((fin_x / CELL) | 0, (fin_y / CELL) | 0);
        }
      }
    }
    return {
      fin_x,
      fin_y,
      clear_x,
      clear_y,
      fin_xf,
      fin_yf,
      clear_xf,
      clear_yf,
      vx,
      vy,
    };
  }

  // ---- SimulationImpl ----

  GetNeighbourhood(i: number): Neighbourhood {
    const parts = this.parts, pmap = this.pmap;
    const t = parts[i].type;
    const x = ci(f(parts[i].x + 0.5));
    const y = ci(f(parts[i].y + 0.5));
    const elements = sd.elements;
    const n: Neighbourhood = { surround: new Int32Array(8), surround_space: 0, nt: 0, pGravX: 0, pGravY: 0 };
    let j = 0;
    for (let nx = -1; nx < 2; nx++) {
      for (let ny = -1; ny < 2; ny++) {
        if (nx || ny) {
          const r = pmap[y + ny][x + nx];
          n.surround[j] = r;
          j++;
          n.surround_space += (!TYP(r)) ? 1 : 0; // count empty space
          n.nt += (TYP(r) != t) ? 1 : 0; // count empty space and particles of different type
        }
      }
    }
    if (!(elements[t].Properties & TYPE_SOLID) && (elements[t].Gravity || elements[t].NewtonianGravity)) {
      const g = { x: 0, y: 0 };
      this.GetGravityField(x, y, elements[t].Gravity, elements[t].NewtonianGravity, g);
      n.pGravX = g.x;
      n.pGravY = g.y;
    }
    return n;
  }

  /** Dispatches an update to the range [start, end). */
  UpdateParticles(start: number, end: number): void {
    //the main particle loop function, goes over all particles.
    const elements = sd.elements;
    const parts = this.parts, bmap = this.bmap, emap = this.emap, vxm = this.vx, vym = this.vy, pv = this.pv;
    for (let i = start; i < end && i < parts.active; i++) {
      let t = parts[i].type;
      if (!t) {
        continue;
      }
      this.debug_mostRecentlyUpdated = i;

      let x = ci(f(parts[i].x + 0.5));
      let y = ci(f(parts[i].y + 0.5));

      // Kill a particle off screen
      if (x < CELL || y < CELL || x >= XRES - CELL || y >= YRES - CELL) {
        this.kill_part(i);
        continue;
      }

      const cy = (y / CELL) | 0, cx = (x / CELL) | 0;
      // Kill a particle in a wall where it isn't supposed to go
      if (bmap[cy][cx] &&
        (bmap[cy][cx] == WL_WALL ||
          bmap[cy][cx] == WL_WALLELEC ||
          bmap[cy][cx] == WL_ALLOWAIR ||
          (bmap[cy][cx] == WL_DESTROYALL) ||
          (bmap[cy][cx] == WL_ALLOWLIQUID && !(elements[t].Properties & TYPE_LIQUID)) ||
          (bmap[cy][cx] == WL_ALLOWPOWDER && !(elements[t].Properties & TYPE_PART)) ||
          (bmap[cy][cx] == WL_ALLOWGAS && !(elements[t].Properties & TYPE_GAS)) || //&& elements[t].Falldown!=0 && parts[i].type!=PT_FIRE && parts[i].type!=PT_SMKE && parts[i].type!=PT_CFLM) ||
          (bmap[cy][cx] == WL_ALLOWENERGY && !(elements[t].Properties & TYPE_ENERGY)) ||
          (bmap[cy][cx] == WL_EWALL && !emap[cy][cx])) && (t != PT_STKM) && (t != PT_STKM2) && (t != PT_FIGH)) {
        this.kill_part(i);
        continue;
      }

      // Make sure that STASIS'd particles don't tick.
      if (bmap[cy][cx] == WL_STASIS && emap[cy][cx] < 8) {
        continue;
      }

      if (bmap[cy][cx] == WL_DETECT && emap[cy][cx] < 8)
        this.set_emap(cx, cy);

      //adding to velocity from the particle's velocity
      vxm[cy][cx] = f(f(vxm[cy][cx] * elements[t].AirLoss) + f(elements[t].AirDrag * parts[i].vx));
      vym[cy][cx] = f(f(vym[cy][cx] * elements[t].AirLoss) + f(elements[t].AirDrag * parts[i].vy));

      if (elements[t].HotAir) {
        if (t == PT_GAS || t == PT_NBLE) {
          if (pv[cy][cx] < f(3.5))
            pv[cy][cx] = f(pv[cy][cx] + f(f(4.0 * elements[t].HotAir) * f(3.5 - pv[cy][cx])));
        } else//add the hotair variable to the pressure map, like black hole, or white hole.
        {
          pv[cy][cx] = f(pv[cy][cx] + f(4.0 * elements[t].HotAir));
        }
      }

      const neighbourhood = this.GetNeighbourhood(i);

      //velocity updates for the particle
      if (t != PT_SPNG || !(parts[i].flags & FLAG_MOVABLE)) {
        parts[i].vx = f(parts[i].vx * elements[t].Loss);
        parts[i].vy = f(parts[i].vy * elements[t].Loss);
      }
      //particle gets velocity from the vx and vy maps
      parts[i].vx = f(parts[i].vx + f(f(elements[t].Advection * vxm[cy][cx]) + neighbourhood.pGravX));
      parts[i].vy = f(parts[i].vy + f(f(elements[t].Advection * vym[cy][cx]) + neighbourhood.pGravY));


      if (elements[t].Diffusion)//the random diffusion that gasses have
      {
        parts[i].vx = f(parts[i].vx + f(elements[t].Diffusion * f(f(2.0 * this.rng.uniform01()) - 1.0)));
        parts[i].vy = f(parts[i].vy + f(elements[t].Diffusion * f(f(2.0 * this.rng.uniform01()) - 1.0)));
      }

      const transitionOccurred = this.TransitionPhase(i, neighbourhood);
      if (!parts[i].type) {
        continue;
      }
      if (transitionOccurred) {
        t = parts[i].type;
      }

      //call the particle update function, if there is one
      if (elements[t].Update) {
        if (elements[t].Update!(this, i, x, y, neighbourhood.surround_space, neighbourhood.nt, parts, this.pmap))
          continue;
        x = ci(f(parts[i].x + 0.5));
        y = ci(f(parts[i].y + 0.5));
      }

      if (this.legacy_enable)//if heat sim is off
        Element.legacyUpdate(this, i, x, y, neighbourhood.surround_space, neighbourhood.nt, parts, this.pmap);

      if (parts[i].type == PT_NONE)//if its dead, skip to next particle
        continue;

      if (transitionOccurred)
        continue;

      if (!parts[i].vx && !parts[i].vy)//if its not moving, skip to next particle, movement code it next
        continue;

      this.MovementPhase(i, neighbourhood);
    }
  }

  TransitionPhase(i: number, neighbourhood: Neighbourhood): boolean {
    const elements = sd.elements;
    const parts = this.parts, pmap = this.pmap, pv = this.pv, hv = this.hv;

    let t = parts[i].type;
    const x = ci(f(parts[i].x + 0.5));
    const y = ci(f(parts[i].y + 0.5));
    const cy = (y / CELL) | 0, cx = (x / CELL) | 0;
    let transitionOccurred = false;
    if (!this.legacy_enable) {
      let gel_scale = 1.0;
      if (t == PT_GEL)
        gel_scale = f(parts[i].tmp * f(2.55));

      if ((elements[t].Properties & TYPE_LIQUID) && (t != PT_GEL || gel_scale > (1 + this.rng.between(0, 254)))) {
        const cg = { x: 0, y: 0 };
        this.GetGravityField(x, y, -2.0, -2.0, cg);
        const convGravX = cg.x, convGravY = cg.y;
        const offsetX = Math.min(Math.max(ci(roundf(f(convGravX + x))), x - 1), x + 1);
        const offsetY = Math.min(Math.max(ci(roundf(f(convGravY + y))), y - 1), y + 1);
        // Some heat convection for liquids
        if (offsetX != x || offsetY != y) {
          const r = pmap[offsetY][offsetX];
          if (r && parts[i].type == TYP(r)) {
            if (parts[i].temp > parts[ID(r)].temp) {
              const swappage = parts[i].temp;
              parts[i].temp = parts[ID(r)].temp;
              parts[ID(r)].temp = swappage;
            }
          }
        }
      }

      // Heat transfer code
      if (t && !sd.IsHeatInsulator(parts[i]) && this.rng.chance(ci(f(elements[t].HeatConduct * gel_scale)), 250)) {
        // Heat transfer with air
        if (this.aheat_enable && !(elements[t].Properties & PROP_NOAMBHEAT)) {
          const dtemp = f(hv[cy][cx] - parts[i].temp); // Temperature difference
          const hc = sd.HeatCapacityOf(parts[i]);
          const alpha = stdmin(f(0.04), f(f(0.4) * hc)); // alpha / heat_capacity must be < 1

          // Here we completely ignore that there are CELL^2 "air pixels" in a cell, and the heat capacity of air
          parts[i].temp = restrict_flt(f(parts[i].temp + f(f(alpha * dtemp) / hc)), MIN_TEMP, MAX_TEMP);
          hv[cy][cx] = restrict_flt(f(hv[cy][cx] - f(alpha * dtemp)), MIN_TEMP, MAX_TEMP);
        }

        // Heat transfer with other elements
        let hc_total = 0.0; // Total heat capacity of elements involved
        let c_heat = 0.0; // Total heat distributed between elements
        const surround_hconduct = new Int32Array(8); // IDs of elements which exchange heat

        for (let j = 0; j < 8; j++) {
          surround_hconduct[j] = i;
          const r = neighbourhood.surround[j];

          if (!r)
            continue;

          const rt = TYP(r);

          // Check if we can conduct heat
          if (!rt || sd.IsHeatInsulator(parts[ID(r)])
            || (t == PT_FILT && (rt == PT_BRAY || rt == PT_BIZR || rt == PT_BIZRG))
            || (rt == PT_FILT && (t == PT_BRAY || t == PT_PHOT || t == PT_BIZR || t == PT_BIZRG))
            || (t == PT_ELEC && rt == PT_DEUT)
            || (t == PT_DEUT && rt == PT_ELEC)
            || (t == PT_HSWC && rt == PT_FILT && parts[i].tmp == 1)
            || (t == PT_FILT && rt == PT_HSWC && parts[ID(r)].tmp == 1))
            continue;

          surround_hconduct[j] = ID(r);
          const hc = sd.HeatCapacityOf(parts[ID(r)]);
          c_heat = f(c_heat + f(parts[ID(r)].temp * hc));
          hc_total = f(hc_total + hc);
        }

        // Add the current particle
        const hc = sd.HeatCapacityOf(parts[i]);
        c_heat = f(c_heat + f(parts[i].temp * hc));
        hc_total = f(hc_total + hc);

        // Equilibrium temperature
        let pt = restrict_flt(f(c_heat / hc_total), MIN_TEMP, MAX_TEMP);

        parts[i].temp = pt;
        for (let j = 0; j < 8; j++) {
          parts[surround_hconduct[j]].temp = pt;
        }

        let ctemph = pt;
        let ctempl = pt;
        // change boiling point with pressure
        if (((elements[t].Properties & TYPE_LIQUID) && sd.IsElementOrNone(elements[t].HighTemperatureTransition) && (elements[elements[t].HighTemperatureTransition].Properties & TYPE_GAS))
          || t == PT_LNTG || t == PT_SLTW)
          ctemph = f(ctemph - f(2.0 * pv[cy][cx]));
        else if (((elements[t].Properties & TYPE_GAS) && sd.IsElementOrNone(elements[t].LowTemperatureTransition) && (elements[elements[t].LowTemperatureTransition].Properties & TYPE_LIQUID))
          || t == PT_WTRV)
          ctempl = f(ctempl - f(2.0 * pv[cy][cx]));
        let s = 1;

        //A fix for ice with ctype = 0
        if ((t == PT_ICEI || t == PT_SNOW) && (!sd.IsElement(parts[i].ctype) || parts[i].ctype == PT_ICEI || parts[i].ctype == PT_SNOW))
          parts[i].ctype = PT_WATR;

        if (elements[t].HighTemperatureTransition != NT && ctemph >= elements[t].HighTemperature) {
          // particle type change due to high temperature
          if (elements[t].HighTemperatureTransition != ST) {
            if (t == PT_FOG)
              parts[i].ctype = 0; // clear unnecessary ctype
            t = elements[t].HighTemperatureTransition;
          } else if (t == PT_ICEI || t == PT_SNOW) {
            if (parts[i].ctype > 0 && parts[i].ctype < PT_NUM && parts[i].ctype != t) {
              if (elements[parts[i].ctype].LowTemperatureTransition == PT_ICEI || elements[parts[i].ctype].LowTemperatureTransition == PT_SNOW) {
                if (pt < elements[parts[i].ctype].LowTemperature)
                  s = 0;
              } else if (pt < f(273.15))
                s = 0;

              if (s) {
                t = parts[i].ctype;
                parts[i].ctype = PT_NONE;
                parts[i].life = 0;
              }
            } else
              s = 0;
          } else if (t == PT_SLTW) {
            //@ SLTW -> SALT/WTRV
            t = this.rng.chance(1, 4) ? PT_SALT : PT_WTRV;
          } else if (t == PT_BRMT) {
            //@ BRMT(TUNG) -> LAVA(TUNG)
            if (parts[i].ctype == PT_TUNG) {
              if (ctemph < elements[parts[i].ctype].HighTemperature)
                s = 0;
              else {
                t = PT_LAVA;
                parts[i].type = PT_TUNG;
              }
            } else if (ctemph >= elements[t].HighTemperature)
              t = PT_LAVA;
            else
              s = 0;
          } else if (t == PT_CRMC) {
            const pres = stdmax(f(f(f(f(f(pv[cy][cx] + pv[((y - 2) / CELL) | 0][cx]) + pv[((y + 2) / CELL) | 0][cx]) + pv[cy][((x - 2) / CELL) | 0]) + pv[cy][((x + 2) / CELL) | 0]) * 2.0), 0.0);
            if (ctemph < f(pres + elements[PT_CRMC].HighTemperature))
              s = 0;
            else
              t = PT_LAVA;
          } else if (t == PT_RIME) {
            if (parts[i].tmp > 5) {
              //@ RIME -> ACID
              t = PT_ACID;
              parts[i].life = 25 + 5 * parts[i].tmp;
              parts[i].tmp = 0;
            } else {
              //@ RIME -> WATR
              t = parts[i].ctype == PT_DSTW ? PT_DSTW : PT_WATR;
              parts[i].ctype = 0;
            }
          } else
            s = 0;
        } else if (elements[t].LowTemperatureTransition != NT && ctempl < elements[t].LowTemperature) {
          // particle type change due to low temperature
          if (elements[t].LowTemperatureTransition != ST) {
            t = elements[t].LowTemperatureTransition;
          } else if (t == PT_WTRV) {
            //@ WTRV -> RIME/DSTW
            t = (pt < 273.0) ? PT_RIME : PT_DSTW;
          } else if (t == PT_LAVA) {
            if (parts[i].ctype > 0 && parts[i].ctype < PT_NUM && parts[i].ctype != PT_LAVA && elements[parts[i].ctype].Enabled) {
              if (parts[i].ctype == PT_THRM && pt >= elements[PT_BMTL].HighTemperature)
                s = 0;
              else if ((parts[i].ctype == PT_VIBR || parts[i].ctype == PT_BVBR) && pt >= f(273.15))
                s = 0;
              else if (parts[i].ctype == PT_TUNG) {
                // TUNG does its own melting in its update function, so HighTemperatureTransition is not LAVA so it won't be handled by the code for HighTemperatureTransition==PT_LAVA below
                // However, the threshold is stored in HighTemperature to allow it to be changed from Lua
                if (pt >= elements[parts[i].ctype].HighTemperature)
                  s = 0;
              } else if (parts[i].ctype == PT_CRMC) {
                const pres = stdmax(f(f(f(f(f(pv[cy][cx] + pv[((y - 2) / CELL) | 0][cx]) + pv[((y + 2) / CELL) | 0][cx]) + pv[cy][((x - 2) / CELL) | 0]) + pv[cy][((x + 2) / CELL) | 0]) * 2.0), 0.0);
                if (ctemph >= f(pres + elements[PT_CRMC].HighTemperature))
                  s = 0;
              } else if (elements[parts[i].ctype].HighTemperatureTransition == PT_LAVA || parts[i].ctype == PT_HEAC) {
                if (pt >= elements[parts[i].ctype].HighTemperature)
                  s = 0;
              } else if (pt >= 973.0)
                s = 0; // freezing point for lava with any other (not listed in ptransitions as turning into lava) ctype
              if (s) {
                t = parts[i].ctype;
                parts[i].ctype = PT_NONE;
                if (t == PT_THRM) {
                  //@ LAVA(THRM) -> BMTL
                  parts[i].tmp = 0;
                  t = PT_BMTL;
                }
                if (t == PT_PLUT) {
                  //@ LAVA(PLUT) -> LAVA
                  parts[i].tmp = 0;
                  t = PT_LAVA;
                }
              }
            } else if (pt < 973.0)
              t = PT_STNE; //@ LAVA -> STNE
            else
              s = 0;
          } else
            s = 0;
        } else
          s = 0;

        if (s) // particle type change occurred
        {
          if (t == PT_ICEI || t == PT_LAVA || t == PT_SNOW)
            parts[i].ctype = parts[i].type;
          if (t == PT_RIME)
            parts[i].ctype = PT_DSTW;
          if (!(t == PT_ICEI && parts[i].ctype == PT_FRZW) && t != PT_ACID)
            parts[i].life = 0;
          if (t == PT_FIRE) {
            //hackish, if tmp isn't 0 the FIRE might turn into DSTW later
            //idealy transitions should use create_part(i) but some elements rely on properties staying constant
            //and I don't feel like checking each one right now
            parts[i].tmp = 0;

            if (parts[i].type == PT_SEED) {
              parts[i].ctype = 0;
              parts[i].tmp2 = 0;
              parts[i].tmp3 = 0;
              parts[i].tmp4 = 0;
            }
          }
          if ((elements[t].Properties & TYPE_GAS) && !(elements[parts[i].type].Properties & TYPE_GAS))
            pv[cy][cx] = f(pv[cy][cx] + 0.50);

          if (t == PT_NONE) {
            this.kill_part(i);
            return true;
          }
          // part_change_type could refuse to change the type and kill the particle
          // for example, changing type to STKM but one already exists
          // we need to account for that to not cause simulation corruption issues
          if (this.part_change_type(i, x, y, t))
            return true;

          if (t == PT_FIRE || t == PT_PLSM || t == PT_CFLM)
            parts[i].life = this.rng.between(120, 169);
          if (t == PT_LAVA) {
            if (parts[i].ctype == PT_BRMT) parts[i].ctype = PT_BMTL;
            else if (parts[i].ctype == PT_SAND) parts[i].ctype = PT_GLAS;
            else if (parts[i].ctype == PT_BGLA) parts[i].ctype = PT_GLAS;
            else if (parts[i].ctype == PT_PQRT) parts[i].ctype = PT_QRTZ;
            else if (parts[i].ctype == PT_LITH && parts[i].tmp2 > 3) parts[i].ctype = PT_GLAS;
            parts[i].life = this.rng.between(240, 359);
          }
          transitionOccurred = true;
        }

        pt = parts[i].temp = restrict_flt(parts[i].temp, MIN_TEMP, MAX_TEMP);
        void pt;
        if (t == PT_LAVA) {
          parts[i].life = ci(restrict_flt(f(f(parts[i].temp - 700) / 7), 0, 400));
          if (parts[i].ctype == PT_THRM && parts[i].tmp > 0) {
            parts[i].tmp--;
            parts[i].temp = 3500;
          }
          if (parts[i].ctype == PT_PLUT && parts[i].tmp > 0) {
            parts[i].tmp--;
            parts[i].temp = MAX_TEMP;
          }
        }
      } else {
        if (!(this.air.bmap_blockairh[cy][cx] & 0x8))
          this.air.bmap_blockairh[cy][cx]++;
        parts[i].temp = restrict_flt(parts[i].temp, MIN_TEMP, MAX_TEMP);
      }
    }

    if (t == PT_LIFE) {
      parts[i].temp = restrict_flt(f(parts[i].temp - 50.0), MIN_TEMP, MAX_TEMP);
    }
    //spark updates from walls
    if ((elements[t].Properties & PROP_CONDUCTS) || t == PT_SPRK) {
      let nx = x % CELL;
      if (nx == 0)
        nx = ((x / CELL) | 0) - 1;
      else if (nx == CELL - 1)
        nx = ((x / CELL) | 0) + 1;
      else
        nx = (x / CELL) | 0;
      let ny = y % CELL;
      if (ny == 0)
        ny = ((y / CELL) | 0) - 1;
      else if (ny == CELL - 1)
        ny = ((y / CELL) | 0) + 1;
      else
        ny = (y / CELL) | 0;
      if (nx >= 0 && ny >= 0 && nx < XCELLS && ny < YCELLS) {
        if (t != PT_SPRK) {
          if (this.emap[ny][nx] == 12 && !parts[i].life && this.bmap[ny][nx] != WL_STASIS) {
            this.part_change_type(i, x, y, PT_SPRK);
            parts[i].life = 4;
            parts[i].ctype = t;
            t = PT_SPRK;
          }
        } else if (this.bmap[ny][nx] == WL_DETECT || this.bmap[ny][nx] == WL_EWALL || this.bmap[ny][nx] == WL_ALLOWLIQUID || this.bmap[ny][nx] == WL_WALLELEC || this.bmap[ny][nx] == WL_ALLOWALLELEC || this.bmap[ny][nx] == WL_EHOLE)
          this.set_emap(nx, ny);
      }
    }

    //the basic explosion, from the .explosive variable
    if ((elements[t].Explosive & 2) && pv[cy][cx] > 2.5) {
      parts[i].life = this.rng.between(180, 259);
      parts[i].temp = restrict_flt(f(elements[PT_FIRE].DefaultProperties.temp + ((elements[t].Flammable / 2) | 0)), MIN_TEMP, MAX_TEMP);
      t = PT_FIRE;
      this.part_change_type(i, x, y, t);
      pv[cy][cx] = f(pv[cy][cx] + f(0.25 * CFDS));
    }

    {
      let s = 1;
      const k = cy * XCELLS + cx;
      const gravtot = f(Math.abs(this.gravOut.forceX[k]) + Math.abs(this.gravOut.forceY[k]));
      if (elements[t].HighPressureTransition != NT && pv[cy][cx] > elements[t].HighPressure) {
        // particle type change due to high pressure
        if (elements[t].HighPressureTransition != ST)
          t = elements[t].HighPressureTransition;
        else if (t == PT_BMTL) {
          if (pv[cy][cx] > 2.5)
            t = PT_BRMT;
          else if (pv[cy][cx] > 1.0 && parts[i].tmp == 1)
            t = PT_BRMT;
          else s = 0;
        } else s = 0;
      } else if (elements[t].LowPressureTransition != NT && pv[cy][cx] < elements[t].LowPressure && gravtot <= f(elements[t].LowPressure / 4.0)) {
        // particle type change due to low pressure
        if (elements[t].LowPressureTransition != ST)
          t = elements[t].LowPressureTransition;
        else s = 0;
      } else if (elements[t].HighPressureTransition != NT && gravtot > f(elements[t].HighPressure / 4.0)) {
        // particle type change due to high gravity
        if (elements[t].HighPressureTransition != ST)
          t = elements[t].HighPressureTransition;
        else if (t == PT_BMTL) {
          if (gravtot > 0.625)
            t = PT_BRMT;
          else if (gravtot > 0.25 && parts[i].tmp == 1)
            t = PT_BRMT;
          else s = 0;
        } else s = 0;
      } else s = 0;

      // particle type change occurred
      if (s) {
        if (t == PT_NONE) {
          this.kill_part(i);
          return true;
        }
        parts[i].life = 0;

        // To prevent PIPE -> BRMT setting BRMT's ctype
        if (t == PT_BRMT) {
          parts[i].ctype = 0;
          parts[i].tmp = 0;
          parts[i].tmp2 = 0;
          parts[i].tmp3 = 0;
          parts[i].tmp4 = 0;
        }

        // part_change_type could refuse to change the type and kill the particle
        // for example, changing type to STKM but one already exists
        // we need to account for that to not cause simulation corruption issues
        if (this.part_change_type(i, x, y, t))
          return true;
        if (t == PT_FIRE)
          parts[i].life = this.rng.between(120, 169);
        transitionOccurred = true;
      }
    }
    return transitionOccurred;
  }

  MovementPhase(i: number, neighbourhood: Neighbourhood): void {
    const elements = sd.elements;
    const parts = this.parts, pmap = this.pmap, bmap = this.bmap;

    const t = parts[i].type;
    const x = ci(f(parts[i].x + 0.5));
    const y = ci(f(parts[i].y + 0.5));
    let fin_x: number, fin_y: number, clear_x: number, clear_y: number;
    let fin_xf: number, fin_yf: number, clear_xf: number, clear_yf: number;
    {
      const mr = this.PlanMove(true, i, x, y);
      fin_x = mr.fin_x;
      fin_y = mr.fin_y;
      clear_x = mr.clear_x;
      clear_y = mr.clear_y;
      fin_xf = mr.fin_xf;
      fin_yf = mr.fin_yf;
      clear_xf = mr.clear_xf;
      clear_yf = mr.clear_yf;
      parts[i].vx = mr.vx;
      parts[i].vy = mr.vy;
    }

    const stagnant = parts[i].flags & FLAG_STAGNANT;
    parts[i].flags &= ~FLAG_STAGNANT;

    if (t == PT_STKM || t == PT_STKM2 || t == PT_FIGH) {
      //head movement, let head pass through anything
      parts[i].x = f(parts[i].x + parts[i].vx);
      parts[i].y = f(parts[i].y + parts[i].vy);
      let nx = ci(f(parts[i].x + 0.5));
      let ny = ci(f(parts[i].y + 0.5));
      if (this.edgeMode == EDGE_LOOP) {
        const x_ok = (nx >= CELL && nx < XRES - CELL);
        const y_ok = (ny >= CELL && ny < YRES - CELL);
        const oldnx = nx, oldny = ny;
        if (!x_ok) {
          parts[i].x = f(f(remainder_p(f(f(parts[i].x - CELL) + 0.5), f(XRES - f(CELL * 2.0))) + CELL) - 0.5);
          nx = ci(f(parts[i].x + 0.5));
        }
        if (!y_ok) {
          parts[i].y = f(f(remainder_p(f(f(parts[i].y - CELL) + 0.5), f(YRES - f(CELL * 2.0))) + CELL) - 0.5);
          ny = ci(f(parts[i].y + 0.5));
        }

        if (!x_ok || !y_ok) //when moving from left to right stickmen might be able to fall through solid things, fix with "eval_move(t, nx+diffx, ny+diffy, NULL)" but then they die instead
        {
          //adjust stickmen legs
          let stickman: Playerst | null = null;
          const t = parts[i].type;
          if (t == PT_STKM)
            stickman = this.player;
          else if (t == PT_STKM2)
            stickman = this.player2;
          else if (t == PT_FIGH && parts[i].tmp >= 0 && parts[i].tmp < MAX_FIGHTERS)
            stickman = this.fighters[parts[i].tmp];

          if (stickman)
            for (let i = 0; i < 16; i += 2) {
              stickman.legs[i] = f(stickman.legs[i] + (nx - oldnx));
              stickman.legs[i + 1] = f(stickman.legs[i + 1] + (ny - oldny));
              stickman.accs[i / 2] = f(stickman.accs[i / 2] * f(0.95));
            }
          parts[i].vy = f(parts[i].vy * f(0.95));
          parts[i].vx = f(parts[i].vx * f(0.95));
        }
      }
      if (ny != y || nx != x) {
        if (pmap[y][x] && ID(pmap[y][x]) == i)
          pmap[y][x] = 0;
        else if (this.photons[y][x] && ID(this.photons[y][x]) == i)
          this.photons[y][x] = 0;
        if (nx < CELL || nx >= XRES - CELL || ny < CELL || ny >= YRES - CELL) {
          this.kill_part(i);
          return;
        }
        if (elements[t].Properties & TYPE_ENERGY)
          this.photons[ny][nx] = PMAP(i, t);
        else if (t)
          pmap[ny][nx] = PMAP(i, t);
      }
    } else if (elements[t].Properties & TYPE_ENERGY) {
      if (t == PT_PHOT) {
        if (parts[i].flags & FLAG_SKIPMOVE) {
          parts[i].flags &= ~FLAG_SKIPMOVE;
          return;
        }

        if (this.eval_move(PT_PHOT, fin_x, fin_y, null)) {
          const rt = TYP(pmap[fin_y][fin_x]);
          const lt = TYP(pmap[y][x]);
          const rt_glas = (rt == PT_GLAS) || (rt == PT_BGLA);
          const lt_glas = (lt == PT_GLAS) || (lt == PT_BGLA);
          if ((rt_glas && !lt_glas) || (lt_glas && !rt_glas)) {
            const gn = this.get_normal_interp(true, REFRACT | t, parts[i].x, parts[i].y, parts[i].vx, parts[i].vy);
            if (!gn.success) {
              this.kill_part(i);
              return;
            }
            let nrx = gn.nx;
            let nry = gn.ny;
            const wm: Ref = { v: parts[i].ctype };
            const r = this.get_wavelength_bin(wm);
            parts[i].ctype = wm.v;
            if (r == -1 || !(parts[i].ctype & 0x3FFFFFFF)) {
              this.kill_part(i);
              return;
            }
            let nn = f(GLASS_IOR - f(f(GLASS_DISP * (r - 30)) / f(30.0)));
            nn = f(nn * nn);

            const enter = rt_glas && !lt_glas;
            nrx = enter ? -nrx : nrx;
            nry = enter ? -nry : nry;
            nn = enter ? f(1.0 / nn) : nn;
            const ct1 = f(f(parts[i].vx * nrx) + f(parts[i].vy * nry));
            let ct2 = f(1.0 - f(f(nn * nn) * f(1.0 - f(ct1 * ct1))));
            if (ct2 < 0.0) {
              // total internal reflection
              parts[i].vx = f(parts[i].vx - f(f(2.0 * ct1) * nrx));
              parts[i].vy = f(parts[i].vy - f(f(2.0 * ct1) * nry));
              fin_xf = parts[i].x;
              fin_yf = parts[i].y;
              fin_x = x;
              fin_y = y;
            } else {
              // refraction
              ct2 = f(Math.sqrt(ct2));
              ct2 = f(ct2 - f(nn * ct1));
              parts[i].vx = f(f(nn * parts[i].vx) + f(ct2 * nrx));
              parts[i].vy = f(f(nn * parts[i].vy) + f(ct2 * nry));
            }
          }
        }
      }
      if (stagnant)//FLAG_STAGNANT set, was reflected on previous frame
      {
        // cast coords as int then back to float for compatibility with existing saves
        if (!this.do_move(i, x, y, fin_x, fin_y) && parts[i].type) {
          this.kill_part(i);
          return;
        }
      } else if (!this.do_move(i, x, y, fin_xf, fin_yf)) {
        if (parts[i].type == PT_NONE)
          return;
        // reflection
        parts[i].flags |= FLAG_STAGNANT;
        if (t == PT_NEUT && this.rng.chance(1, 10)) {
          this.kill_part(i);
          return;
        }
        const r = pmap[fin_y][fin_x];

        if ((TYP(r) == PT_PIPE || TYP(r) == PT_PPIP) && !TYP(parts[ID(r)].ctype)) {
          Element_PIPE_transfer_part_to_pipe(parts[i], parts[ID(r)]);
          return;
        }

        if (t == PT_PHOT) {
          let mask = elements[TYP(r)].PhotonReflectWavelengths;
          if (TYP(r) == PT_LITH) {
            let wl_bin = (parts[ID(r)].ctype / 4) | 0;
            if (wl_bin < 0) wl_bin = 0;
            if (wl_bin > 25) wl_bin = 25;
            mask = (0x1F << wl_bin);
          } else if (TYP(r) == PT_SEED) {
            // Reflect different wavelengths based on SEED's color genes
            const colour = (parts[ID(r)].ctype >> PLNT_COLOUR) & 0x3f;

            mask |= ((colour & 0b110000) != 0) ? 0 : (1 << 25); // Red
            mask |= ((colour & 0b001100) != 0) ? 0 : (1 << 15); // Green
            mask |= ((colour & 0b000011) != 0) ? 0 : (1 << 5); // Blue

          }
          parts[i].ctype &= mask;
        }

        const gn = this.get_normal_interp(true, t, parts[i].x, parts[i].y, parts[i].vx, parts[i].vy);
        if (gn.success) {
          const nrx = gn.nx;
          const nry = gn.ny;
          if (TYP(r) == PT_CRMC) {
            let r = f(this.rng.between(-50, 50) * f(0.01));
            r = f(f(r * r) * r);
            const rx = f(Math.cos(r)), ry = f(Math.sin(r));
            const anrx = f(f(rx * nrx) + f(ry * nry));
            const anry = f(f(rx * nry) - f(ry * nrx));
            const dp = f(f(anrx * parts[i].vx) + f(anry * parts[i].vy));
            parts[i].vx = f(parts[i].vx - f(f(2.0 * dp) * anrx));
            parts[i].vy = f(parts[i].vy - f(f(2.0 * dp) * anry));
          } else {
            const dp = f(f(nrx * parts[i].vx) + f(nry * parts[i].vy));
            parts[i].vx = f(parts[i].vx - f(f(2.0 * dp) * nrx));
            parts[i].vy = f(parts[i].vy - f(f(2.0 * dp) * nry));
          }
          // leave the actual movement until next frame so that reflection of fast particles and refraction happen correctly
        } else {
          if (t != PT_NEUT)
            this.kill_part(i);
          return;
        }
        if (!(parts[i].ctype & 0x3FFFFFFF) && t == PT_PHOT) {
          this.kill_part(i);
          return;
        }
      }
    } else if (elements[t].Falldown == 0) {
      // gasses and solids (but not powders)
      if (!this.do_move(i, x, y, fin_xf, fin_yf)) {
        if (parts[i].type == PT_NONE)
          return;
        // can't move there, so bounce off
        if (fin_x > x + ISTP) fin_x = x + ISTP;
        if (fin_x < x - ISTP) fin_x = x - ISTP;
        if (fin_y > y + ISTP) fin_y = y + ISTP;
        if (fin_y < y - ISTP) fin_y = y - ISTP;
        if (this.do_move(i, x, y, 2 * x - fin_x, fin_y)) {
          parts[i].vx = f(parts[i].vx * elements[t].Collision);
        } else if (this.do_move(i, x, y, fin_x, 2 * y - fin_y)) {
          parts[i].vy = f(parts[i].vy * elements[t].Collision);
        } else {
          parts[i].vx = f(parts[i].vx * elements[t].Collision);
          parts[i].vy = f(parts[i].vy * elements[t].Collision);
        }
      }
    } else {
      // Checking stagnant is cool, but then it doesn't update when you change it later.
      if (this.water_equal_test && elements[t].Falldown == 2 && this.rng.chance(1, 200)) {
        if (this.flood_water(x, y, i))
          return;
      }
      // liquids and powders
      if (!this.do_move(i, x, y, fin_xf, fin_yf)) {
        if (parts[i].type == PT_NONE)
          return;
        if (fin_x != x && this.do_move(i, x, y, fin_xf, clear_yf)) {
          parts[i].vx = f(parts[i].vx * elements[t].Collision);
          parts[i].vy = f(parts[i].vy * elements[t].Collision);
        } else if (fin_y != y && this.do_move(i, x, y, clear_xf, fin_yf)) {
          parts[i].vx = f(parts[i].vx * elements[t].Collision);
          parts[i].vy = f(parts[i].vy * elements[t].Collision);
        } else {
          let pGravX = neighbourhood.pGravX;
          let pGravY = neighbourhood.pGravY;
          let r = this.rng.between(0, 1) * 2 - 1;// position search direction (left/right first)
          if ((clear_x != x || clear_y != y || neighbourhood.nt || neighbourhood.surround_space) &&
            (Math.abs(parts[i].vx) > f(0.01) || Math.abs(parts[i].vy) > f(0.01))) {
            // allow diagonal movement if target position is blocked
            // but no point trying this if particle is stuck in a block of identical particles
            let dx = f(parts[i].vx - f(parts[i].vy * r));
            let dy = f(parts[i].vy + f(parts[i].vx * r));

            const mv = stdmax(Math.abs(dx), Math.abs(dy));
            dx = f(dx / mv);
            dy = f(dy / mv);
            if (this.do_move(i, x, y, f(clear_xf + dx), f(clear_yf + dy))) {
              parts[i].vx = f(parts[i].vx * elements[t].Collision);
              parts[i].vy = f(parts[i].vy * elements[t].Collision);
              return;
            }
            {
              const swappage = dx;
              dx = f(dy * r);
              dy = f(-swappage * r);
            }
            if (this.do_move(i, x, y, f(clear_xf + dx), f(clear_yf + dy))) {
              parts[i].vx = f(parts[i].vx * elements[t].Collision);
              parts[i].vy = f(parts[i].vy * elements[t].Collision);
              return;
            }
          }
          if (elements[t].Falldown > 1 && !this.grav && this.gravityMode == GRAV_VERTICAL && parts[i].vy > Math.abs(parts[i].vx)) {
            let s = 0;
            // stagnant is true if FLAG_STAGNANT was set for this particle in previous frame
            let rt: number;
            if (!stagnant || neighbourhood.nt) //nt is if there is an something else besides the current particle type, around the particle
              rt = 30;//slight less water lag, although it changes how it moves a lot
            else
              rt = 10;

            if (t == PT_GEL)
              rt = ci(f(f(parts[i].tmp * f(0.20)) + 5.0));

            let nx = -1, ny = -1;
            for (let j = clear_x + r; j >= 0 && j >= clear_x - rt && j < clear_x + rt && j < XRES; j += r) {
              if ((TYP(pmap[fin_y][j]) != t || bmap[(fin_y / CELL) | 0][(j / CELL) | 0])
                && (s = this.do_move(i, x, y, j, fin_yf))) {
                nx = ci(f(parts[i].x + 0.5));
                ny = ci(f(parts[i].y + 0.5));
                break;
              }
              if (fin_y != clear_y && (TYP(pmap[clear_y][j]) != t || bmap[(clear_y / CELL) | 0][(j / CELL) | 0])
                && (s = this.do_move(i, x, y, j, clear_yf))) {
                nx = ci(f(parts[i].x + 0.5));
                ny = ci(f(parts[i].y + 0.5));
                break;
              }
              if (TYP(pmap[clear_y][j]) != t || (bmap[(clear_y / CELL) | 0][(j / CELL) | 0] && bmap[(clear_y / CELL) | 0][(j / CELL) | 0] != WL_STREAM))
                break;
            }

            r = (parts[i].vy > 0) ? 1 : -1;

            if (s == 1)
              for (let j = ny + r; j >= 0 && j < YRES && j >= ny - rt && j < ny + rt; j += r) {
                if ((TYP(pmap[j][nx]) != t || bmap[(j / CELL) | 0][(nx / CELL) | 0]) && this.do_move(i, nx, ny, nx, j))
                  break;
                if (TYP(pmap[j][nx]) != t || (bmap[(j / CELL) | 0][(nx / CELL) | 0] && bmap[(j / CELL) | 0][(nx / CELL) | 0] != WL_STREAM))
                  break;
              }
            else if (s == -1) { /* particle is out of bounds */ }
            else if ((clear_x != x || clear_y != y) && this.do_move(i, x, y, clear_xf, clear_yf)) { /* empty */ }
            else parts[i].flags |= FLAG_STAGNANT;
            parts[i].vx = f(parts[i].vx * elements[t].Collision);
            parts[i].vy = f(parts[i].vy * elements[t].Collision);
          } else if (elements[t].Falldown > 1 && Math.abs(f(f(pGravX * parts[i].vx) + f(pGravY * parts[i].vy))) > Math.abs(f(f(pGravY * parts[i].vx) - f(pGravX * parts[i].vy)))) {
            let nxf: number, nyf: number, prev_pGravX = 0, prev_pGravY = 0;
            const ptGrav = elements[t].Gravity;
            let s = 0;
            // stagnant is true if FLAG_STAGNANT was set for this particle in previous frame
            // nt is if there is something else besides the current particle type around the particle
            // 30 gives slightly less water lag, although it changes how it moves a lot
            const rt = (!stagnant || neighbourhood.nt) ? 30 : 10;

            // clear_xf, clear_yf is the last known position that the particle should almost certainly be able to move to
            nxf = clear_xf;
            nyf = clear_yf;
            let nx = clear_x;
            let ny = clear_y;
            const g = { x: 0, y: 0 };
            // Look for spaces to move horizontally (perpendicular to gravity direction), keep going until a space is found or the number of positions examined = rt
            for (let j = 0; j < rt; j++) {
              // Calculate overall gravity direction
              this.GetGravityField(nx, ny, ptGrav, 1.0, g);
              pGravX = g.x; pGravY = g.y;
              // Scale gravity vector so that the largest component is 1 pixel
              const mv = stdmax(Math.abs(pGravX), Math.abs(pGravY));
              if (mv < f(0.0001)) break;
              pGravX = f(pGravX / mv);
              pGravY = f(pGravY / mv);
              // Move 1 pixel perpendicularly to gravity
              // r is +1/-1, to try moving left or right at random
              if (j) {
                // Not quite the gravity direction
                // Gravity direction + last change in gravity direction
                // This makes liquid movement a bit less frothy, particularly for balls of liquid in radial gravity. With radial gravity, instead of just moving along a tangent, the attempted movement will follow the curvature a bit better.
                nxf = f(nxf + f(r * f(f(pGravY * 2.0) - prev_pGravY)));
                nyf = f(nyf + f(-r * f(f(pGravX * 2.0) - prev_pGravX)));
              } else {
                nxf = f(nxf + f(r * pGravY));
                nyf = f(nyf + f(-r * pGravX));
              }
              prev_pGravX = pGravX;
              prev_pGravY = pGravY;
              // Check whether movement is allowed
              nx = ci(f(nxf + 0.5));
              ny = ci(f(nyf + 0.5));
              if (nx < 0 || ny < 0 || nx >= XRES || ny >= YRES)
                break;
              if (TYP(pmap[ny][nx]) != t || bmap[(ny / CELL) | 0][(nx / CELL) | 0]) {
                s = this.do_move(i, x, y, nxf, nyf);
                if (s) {
                  // Movement was successful
                  nx = ci(f(parts[i].x + 0.5));
                  ny = ci(f(parts[i].y + 0.5));
                  break;
                }
                // A particle of a different type, or a wall, was found. Stop trying to move any further horizontally unless the wall should be completely invisible to particles.
                if (TYP(pmap[ny][nx]) != t || bmap[(ny / CELL) | 0][(nx / CELL) | 0] != WL_STREAM)
                  break;
              }
            }
            if (s == 1) {
              // The particle managed to move horizontally, now try to move vertically (parallel to gravity direction)
              // Keep going until the particle is blocked (by something that isn't the same element) or the number of positions examined = rt
              clear_x = nx;
              clear_y = ny;
              for (let j = 0; j < rt; j++) {
                // Calculate overall gravity direction
                this.GetGravityField(nx, ny, ptGrav, 1.0, g);
                pGravX = g.x; pGravY = g.y;
                // Scale gravity vector so that the largest component is 1 pixel
                const mv = stdmax(Math.abs(pGravX), Math.abs(pGravY));
                if (mv < f(0.0001)) break;
                pGravX = f(pGravX / mv);
                pGravY = f(pGravY / mv);
                // Move 1 pixel in the direction of gravity
                nxf = f(nxf + pGravX);
                nyf = f(nyf + pGravY);
                nx = ci(f(nxf + 0.5));
                ny = ci(f(nyf + 0.5));
                if (nx < 0 || ny < 0 || nx >= XRES || ny >= YRES)
                  break;
                // If the space is anything except the same element (a wall, empty space, or occupied by a particle of a different element), try to move into it
                if (TYP(pmap[ny][nx]) != t || bmap[(ny / CELL) | 0][(nx / CELL) | 0]) {
                  s = this.do_move(i, clear_x, clear_y, nxf, nyf);
                  if (s || TYP(pmap[ny][nx]) != t || bmap[(ny / CELL) | 0][(nx / CELL) | 0] != WL_STREAM)
                    break; // found the edge of the liquid and movement into it succeeded, so stop moving down
                }
              }
            } else if (s == -1) { /* particle is out of bounds */ }
            else if ((clear_x != x || clear_y != y) && this.do_move(i, x, y, clear_xf, clear_yf)) { /* try moving to the last clear position */ }
            else parts[i].flags |= FLAG_STAGNANT;
            parts[i].vx = f(parts[i].vx * elements[t].Collision);
            parts[i].vy = f(parts[i].vy * elements[t].Collision);
          } else {
            // if interpolation was done, try moving to last clear position
            if ((clear_x != x || clear_y != y) && this.do_move(i, x, y, clear_xf, clear_yf)) { /* empty */ }
            else parts[i].flags |= FLAG_STAGNANT;
            parts[i].vx = f(parts[i].vx * elements[t].Collision);
            parts[i].vy = f(parts[i].vy * elements[t].Collision);
          }
        }
      }
    }
  }

  RecalcFreeParticles(do_life_dec: boolean): void {
    for (const r of this.pmap) r.fill(0);
    for (const r of this.pmap_count) r.fill(0);
    for (const r of this.photons) r.fill(0);

    this.NUM_PARTS = 0;
    const elements = sd.elements;
    const parts = this.parts, pmap = this.pmap, bmap = this.bmap, emap = this.emap;
    //the particle loop that resets the pmap/photon maps every frame, to update them.
    for (let i = 0; i < parts.active; i++) {
      if (!parts[i].type) {
        continue;
      }
      const t = parts[i].type;
      const x = ci(f(parts[i].x + 0.5));
      const y = ci(f(parts[i].y + 0.5));
      let inBounds = false;
      if (x >= 0 && y >= 0 && x < XRES && y < YRES) {
        if (elements[t].Properties & TYPE_ENERGY)
          this.photons[y][x] = PMAP(i, t);
        else {
          // Particles are sometimes allowed to go inside INVS and FILT
          // To make particles collide correctly when inside these elements, these elements must not overwrite an existing pmap entry from particles inside them
          if (!pmap[y][x] || (t != PT_INVIS && t != PT_FILT))
            pmap[y][x] = PMAP(i, t);
          // (there are a few exceptions, including energy particles - currently no limit on stacking those)
          if (t != PT_THDR && t != PT_EMBR && t != PT_FIGH && t != PT_PLSM)
            this.pmap_count[y][x]++;
        }
        inBounds = true;
      }
      this.NUM_PARTS++;

      if (this.elementRecount && t >= 0 && t < PT_NUM && elements[t].Enabled)
        this.elementCount[t]++;

      //decrease particle life
      if (do_life_dec) {
        if (t < 0 || t >= PT_NUM || !elements[t].Enabled) {
          this.kill_part(i);
          continue;
        }

        const elem_properties = elements[t].Properties;
        if (parts[i].life > 0 && (elem_properties & PROP_LIFE_DEC) && !(inBounds && bmap[(y / CELL) | 0][(x / CELL) | 0] == WL_STASIS && emap[(y / CELL) | 0][(x / CELL) | 0] < 8)) {
          // automatically decrease life
          parts[i].life--;
          if (parts[i].life <= 0 && (elem_properties & (PROP_LIFE_KILL_DEC | PROP_LIFE_KILL))) {
            // kill on change to no life
            this.kill_part(i);
            continue;
          }
        } else if (parts[i].life <= 0 && (elem_properties & PROP_LIFE_KILL) && !(inBounds && bmap[(y / CELL) | 0][(x / CELL) | 0] == WL_STASIS && emap[(y / CELL) | 0][(x / CELL) | 0] < 8)) {
          // kill if no life
          this.kill_part(i);
          continue;
        }
      }
    }
    parts.Flatten();
    if (this.elementRecount)
      this.elementRecount = false;
  }

  SimulateGoL(): void {
    const builtinGol = sd.builtinGol;
    const parts = this.parts, pmap = this.pmap, bmap = this.bmap, emap = this.emap, gol = this.gol;
    this.CGOL = 0;
    for (let i = 0; i < parts.active; ++i) {
      const part = parts[i];
      if (part.type != PT_LIFE) {
        continue;
      }
      const x = ci(f(part.x + 0.5));
      const y = ci(f(part.y + 0.5));
      if (x < CELL || y < CELL || x >= XRES - CELL || y >= YRES - CELL) {
        continue;
      }
      let golnum = part.ctype >>> 0;
      let ruleset = golnum;
      if (golnum < NGOL) {
        ruleset = builtinGol[golnum].ruleset;
        golnum += 1;
      }
      if (part.tmp2 == ((ruleset >>> 17) & 0xF) + 1) {
        for (let yy = -1; yy <= 1; ++yy) {
          for (let xx = -1; xx <= 1; ++xx) {
            if (xx || yy) {
              // * Calculate address of the neighbourList, taking wraparound
              //   into account. The fact that the GOL space is 2 CELL's worth
              //   narrower in both dimensions than the simulation area makes
              //   this a bit awkward.
              const ax = ((x + xx + XRES - 3 * CELL) % (XRES - 2 * CELL)) + CELL;
              const ay = ((y + yy + YRES - 3 * CELL) % (YRES - 2 * CELL)) + CELL;
              if (pmap[ay][ax] && TYP(pmap[ay][ax]) != PT_LIFE) {
                continue;
              }
              const nl = gol[ay];
              const b = ax * 5;
              // * Bump overall neighbour counter (bits 30..28) for the entire list.
              nl[b] = (nl[b] + (1 << 28)) >>> 0;
              for (let l = 0; l < 5; ++l) {
                const neighbourRuleset = nl[b + l] & 0x001FFFFF;
                if (neighbourRuleset == golnum) {
                  // * Bump population counter (bits 23..21) of the
                  //   same kind of cell.
                  nl[b + l] = (nl[b + l] + (1 << 21)) >>> 0;
                  break;
                }
                if (neighbourRuleset == 0) {
                  // * Add the new kind of cell to the population. Both counters
                  //   have a bias of -1, so they're intentionally initialised
                  //   to 0 instead of 1 here. This is all so they can both
                  //   fit in 3 bits.
                  nl[b + l] = (((yy & 3) << 26) | ((xx & 3) << 24) | golnum) >>> 0;
                  break;
                }
                // * If after 5 iterations the cell still hasn't contributed
                //   to a list entry, it's surely a 6th kind of cell, meaning
                //   there could be at most 3 of it in the neighbourhood,
                //   as there are already 5 other kinds of cells present in
                //   the list. This in turn means that it couldn't possibly
                //   win the population ratio-based contest later on.
              }
            }
          }
        }
      } else {
        if (!(bmap[(y / CELL) | 0][(x / CELL) | 0] == WL_STASIS && emap[(y / CELL) | 0][(x / CELL) | 0] < 8)) {
          part.tmp2 -= 1;
        }
      }
    }
    for (let y = CELL; y < YRES - CELL; ++y) {
      for (let x = CELL; x < XRES - CELL; ++x) {
        const r = pmap[y][x];
        if (r && TYP(r) != PT_LIFE) {
          continue;
        }
        const nl = gol[y];
        const b = x * 5;
        const nl0 = nl[b];
        if (r || nl0) {
          // * Get overall neighbour count (bits 30..28).
          const neighbours = nl0 ? ((nl0 >>> 28) & 7) + 1 : 0;
          if (!(bmap[(y / CELL) | 0][(x / CELL) | 0] == WL_STASIS && emap[(y / CELL) | 0][(x / CELL) | 0] < 8)) {
            if (r) {
              const part = parts[ID(r)];
              let ruleset = part.ctype >>> 0;
              if (ruleset < NGOL) {
                ruleset = builtinGol[ruleset].ruleset;
              }
              if (!((ruleset >>> neighbours) & 1) && part.tmp2 == ((ruleset >>> 17) | 0) + 1) {
                // * Start death sequence.
                part.tmp2 -= 1;
              }
            } else {
              let golnumToCreate = 0xFFFFFFFF;
              let createFromEntry = 0;
              const majority = ((neighbours / 2) | 0) + neighbours % 2;
              for (let l = 0; l < 5; ++l) {
                let golnum = nl[b + l] & 0x001FFFFF;
                if (!golnum) {
                  break;
                }
                let ruleset = golnum;
                if (golnum - 1 < NGOL) {
                  ruleset = builtinGol[golnum - 1].ruleset;
                  golnum -= 1;
                }
                if ((ruleset >>> (neighbours + 8)) & 1 && ((nl[b + l] >>> 21) & 7) + 1 >= majority && golnum < golnumToCreate) {
                  golnumToCreate = golnum;
                  createFromEntry = nl[b + l];
                }
              }
              if (golnumToCreate != 0xFFFFFFFF) {
                // * 0x200000: No need to look for colours, they'll be set later anyway.
                const i = this.create_part(-1, x, y, PT_LIFE, golnumToCreate | 0x200000);
                if (i >= 0) {
                  let xx = (createFromEntry >>> 24) & 3;
                  let yy = (createFromEntry >>> 26) & 3;
                  if (xx == 3) xx = -1;
                  if (yy == 3) yy = -1;
                  const ax = ((x - xx + XRES - 3 * CELL) % (XRES - 2 * CELL)) + CELL;
                  const ay = ((y - yy + YRES - 3 * CELL) % (YRES - 2 * CELL)) + CELL;
                  const sample = parts[ID(pmap[ay][ax])];
                  parts[i].dcolour = sample.dcolour;
                  parts[i].tmp = sample.tmp;
                }
              }
            }
          }
          for (let l = 0; l < 5 && nl[b + l]; ++l) {
            nl[b + l] = 0;
          }
        }
      }
    }
    for (let y = CELL; y < YRES - CELL; ++y) {
      for (let x = CELL; x < XRES - CELL; ++x) {
        const r = pmap[y][x];
        if (r && TYP(r) == PT_LIFE && parts[ID(r)].tmp2 <= 0) {
          this.kill_part(ID(r));
        }
      }
    }
  }

  CheckStacking(): void {
    const elements = sd.elements;
    const parts = this.parts, pmap_count = this.pmap_count;
    let excessive_stacking_found = false;
    this.force_stacking_check = false;
    for (let y = 0; y < YRES; y++) {
      for (let x = 0; x < XRES; x++) {
        // Use a threshold, since some particle stacking can be normal (e.g. BIZR + FILT)
        // Setting pmap_count[y][x] > NPART means BHOL will form in that spot
        if (pmap_count[y][x] > 5) {
          if (this.bmap[(y / CELL) | 0][(x / CELL) | 0] == WL_EHOLE) {
            // Allow more stacking in E-hole
            if (pmap_count[y][x] > 1500) {
              pmap_count[y][x] = pmap_count[y][x] + NPART;
              excessive_stacking_found = true;
            }
          } else if (pmap_count[y][x] > 1500 || (this.rng.between(0, 1599) >>> 0) <= (pmap_count[y][x] + 100)) {
            pmap_count[y][x] = pmap_count[y][x] + NPART;
            excessive_stacking_found = true;
          }
        }
      }
    }
    if (excessive_stacking_found) {
      for (let i = 0; i < parts.active; i++) {
        if (parts[i].type) {
          const t = parts[i].type;
          const x = ci(f(parts[i].x + 0.5));
          const y = ci(f(parts[i].y + 0.5));
          if (x >= 0 && y >= 0 && x < XRES && y < YRES && !(elements[t].Properties & TYPE_ENERGY)) {
            if (pmap_count[y][x] >= NPART) {
              if (pmap_count[y][x] > NPART) {
                //@ stacking -> NBHL
                this.create_part(i, x, y, PT_NBHL);
                parts[i].temp = MAX_TEMP;
                parts[i].tmp = pmap_count[y][x] - NPART;//strength of grav field
                if (parts[i].tmp > 51200) parts[i].tmp = 51200;
                pmap_count[y][x] = NPART;
              } else {
                this.kill_part(i);
              }
            }
          }
        }
      }
    }
  }

  UpdateGravityMask(): void {
    const mask = this.gravIn.mask;
    mask.fill(0);
    const toCheck: number[] = [];
    const check = (px: number, py: number): void => {
      const k = py * XCELLS + px;
      if (!(this.bmap[py][px] == WL_GRAV || mask[k])) {
        mask[k] = 0xFFFFFFFF;
        // RectSized<int>({ -1, -1 }, { 3, 3 }) in its iteration order (rows of X)
        for (let oy = -1; oy <= 1; oy++) {
          for (let ox = -1; ox <= 1; ox++) {
            if ((ox + oy) & 1) // i.e. immediate neighbours but not diagonal ones
            {
              const qx = px + ox, qy = py + oy;
              if (qx >= 0 && qy >= 0 && qx < XCELLS && qy < YCELLS) {
                toCheck.push(qx, qy);
              }
            }
          }
        }
      }
    };
    for (let x = 0; x < XCELLS; ++x) {
      check(x, 0);
      check(x, YCELLS - 1);
    }
    for (let y = 1; y < YCELLS - 1; ++y) // corners already checked in the previous loop
    {
      check(0, y);
      check(XCELLS - 1, y);
    }
    while (toCheck.length) {
      const py = toCheck.pop()!;
      const px = toCheck.pop()!;
      check(px, py);
    }
  }

  //updates pmap, gol, and some other simulation stuff (but not particles)
  BeforeSim(willUpdate: boolean): void {
    const parts = this.parts, pmap = this.pmap;
    if (willUpdate) {
      this.air.update_air();

      if (this.aheat_enable)
        this.air.update_airh();

      this.DispatchNewtonianGravity();
      // gravIn::mass is now potentially garbage, which is ok, we were going to clear it for the frame anyway
      this.gravIn.mass.fill(0);

      if (this.emp_decor > 0)
        this.emp_decor -= ((this.emp_decor / 25) | 0) + 2;
      if (this.emp_decor < 0)
        this.emp_decor = 0;
      this.etrd_count_valid = false;
      this.etrd_life0_count = 0;

      this.currentTick++;

      this.elementRecount = this.elementRecount || !(this.currentTick % 180);
      if (this.elementRecount)
        this.elementCount.fill(0);
    }
    // sin of a float promoted to double (::sin), 20.0f * double in double, then (int)
    this.sandcolour_interface = ci(20.0 * Math.sin(f(f(f(this.sandcolour_frame) * PI_F) / f(180.0))));
    this.sandcolour_frame = (this.sandcolour_frame + 1) % 360;
    this.sandcolour = ci(20.0 * Math.sin(f(f(f(this.frameCount) * PI_F) / f(180.0))));

    if (this.gravWallChanged) {
      this.UpdateGravityMask();
      this.gravWallChanged = false;
    }

    if (this.debug_nextToUpdate == 0)
      this.RecalcFreeParticles(willUpdate);

    if (willUpdate) {
      const bmap = this.bmap, emap = this.emap;
      // decrease wall conduction, make walls block air and ambient heat
      for (let y = 0; y < YCELLS; y++) {
        for (let x = 0; x < XCELLS; x++) {
          if (emap[y][x])
            emap[y][x]--;
          this.air.bmap_blockair[y][x] = (bmap[y][x] == WL_WALL || bmap[y][x] == WL_WALLELEC || bmap[y][x] == WL_BLOCKAIR || (bmap[y][x] == WL_EWALL && !emap[y][x])) ? 1 : 0;
          this.air.bmap_blockairh[y][x] = (this.air.bmap_blockair[y][x] || bmap[y][x] == WL_GRAV) ? 0x8 : 0;
        }
      }

      // check for stacking and create BHOL if found
      if (this.force_stacking_check || this.rng.chance(1, 10)) {
        this.CheckStacking();
      }

      // LOVE and LOLZ element handling
      if (this.elementCount[PT_LOVE] > 0 || this.elementCount[PT_LOLZ] > 0) {
        let nx: number, nnx: number, ny: number, nny: number, r: number, rt: number;
        const love = this.Element_LOVE_love, lolz = this.Element_LOLZ_lolz;
        for (ny = 0; ny < YRES - 4; ny++) {
          for (nx = 0; nx < XRES - 4; nx++) {
            r = pmap[ny][nx];
            if (!r) {
              continue;
            } else if ((ny < 9 || nx < 9 || ny > YRES - 7 || nx > XRES - 10) && (parts[ID(r)].type == PT_LOVE || parts[ID(r)].type == PT_LOLZ))
              this.kill_part(ID(r));
            else if (parts[ID(r)].type == PT_LOVE) {
              love[(nx / 9) | 0][(ny / 9) | 0] = 1;
            } else if (parts[ID(r)].type == PT_LOLZ) {
              lolz[(nx / 9) | 0][(ny / 9) | 0] = 1;
            }
          }
        }
        for (nx = 9; nx <= XRES - 18; nx++) {
          for (ny = 9; ny <= YRES - 7; ny++) {
            if (love[(nx / 9) | 0][(ny / 9) | 0] == 1) {
              for (nnx = 0; nnx < 9; nnx++)
                for (nny = 0; nny < 9; nny++) {
                  if (ny + nny > 0 && ny + nny < YRES && nx + nnx >= 0 && nx + nnx < XRES) {
                    rt = pmap[ny + nny][nx + nnx];
                    if (!rt && Element_LOVE_RuleTable[nnx][nny] == 1)
                      this.create_part(-1, nx + nnx, ny + nny, PT_LOVE);
                    else if (!rt)
                      continue;
                    else if (parts[ID(rt)].type == PT_LOVE && Element_LOVE_RuleTable[nnx][nny] == 0)
                      this.kill_part(ID(rt));
                  }
                }
            }
            love[(nx / 9) | 0][(ny / 9) | 0] = 0;
            if (lolz[(nx / 9) | 0][(ny / 9) | 0] == 1) {
              for (nnx = 0; nnx < 9; nnx++)
                for (nny = 0; nny < 9; nny++) {
                  if (ny + nny > 0 && ny + nny < YRES && nx + nnx >= 0 && nx + nnx < XRES) {
                    rt = pmap[ny + nny][nx + nnx];
                    if (!rt && Element_LOLZ_RuleTable[nny][nnx] == 1)
                      this.create_part(-1, nx + nnx, ny + nny, PT_LOLZ);
                    else if (!rt)
                      continue;
                    else if (parts[ID(rt)].type == PT_LOLZ && Element_LOLZ_RuleTable[nny][nnx] == 0)
                      this.kill_part(ID(rt));

                  }
                }
            }
            lolz[(nx / 9) | 0][(ny / 9) | 0] = 0;
          }
        }
      }

      // make WIRE work
      if (this.elementCount[PT_WIRE] > 0) {
        for (let nx = 0; nx < XRES; nx++) {
          for (let ny = 0; ny < YRES; ny++) {
            const r = pmap[ny][nx];
            if (!r)
              continue;
            if (parts[ID(r)].type == PT_WIRE)
              parts[ID(r)].tmp = parts[ID(r)].ctype;
          }
        }
      }

      // update PPIP tmp?
      if (this.Element_PPIP_ppip_changed) {
        for (let i = 0; i < parts.active; i++) {
          if (parts[i].type == PT_PPIP) {
            parts[i].tmp |= (parts[i].tmp & 0xE0000000) >>> 3;
            parts[i].tmp &= ~0xE0000000;
          }
        }
        this.Element_PPIP_ppip_changed = 0;
      }

      // Simulate GoL
      // GSPEED is frames per generation
      if (this.elementCount[PT_LIFE] > 0 && ++this.CGOL >= this.GSPEED) {
        this.SimulateGoL();
      }

      // wifi channel reseting
      if (this.ISWIRE > 0) {
        for (let q = 0; q < ((ci(f(MAX_TEMP - f(73.15))) / 100) | 0) + 2; q++) {
          this.wireless[q][0] = this.wireless[q][1];
          this.wireless[q][1] = 0;
        }
        this.ISWIRE--;
      }

      // spawn STKM and STK2
      if (!this.player.spwn && this.player.spawnID >= 0)
        this.create_part(-1, ci(parts[this.player.spawnID].x), ci(parts[this.player.spawnID].y), PT_STKM);
      if (!this.player2.spwn && this.player2.spawnID >= 0)
        this.create_part(-1, ci(parts[this.player2.spawnID].x), ci(parts[this.player2.spawnID].y), PT_STKM2);

      // particle update happens right after this function (called separately)
    }
  }

  AfterSim(): void {
    this.debug_mostRecentlyUpdated = -1;

    if (this.emp_trigger_count) {
      // pitiful attempt at trying to keep code relating to a given element in the same file
      Element_EMP_Trigger(this, this.emp_trigger_count);
      this.emp_trigger_count = 0;
    }

    this.frameCount += 1;
  }

  DispatchNewtonianGravity(): void {
    if (this.grav) {
      this.grav.Exchange(this.gravOut, this.gravIn, this.gravForceRecalc);
      this.gravForceRecalc = false;
    }
  }

  ResetNewtonianGravity(newGravIn: GravityInput, newGravOut: GravityOutput): void {
    this.gravIn = newGravIn.clone();
    this.DispatchNewtonianGravity();
    // gravIn is now potentially garbage, set it again
    this.gravIn = newGravIn.clone();
    if (this.grav) {
      this.gravOut = newGravOut.clone();
      this.gravForceRecalc = true; // gravOut changed outside DispatchNewtonianGravity
      this.gravWallChanged = true;
    }
  }

  EnableNewtonianGravity(enable: boolean): void {
    if (this.grav && !enable) {
      this.grav = null;
      this.gravOut = new GravityOutput(); // reset as per the invariant
      this.gravForceRecalc = true; // gravOut changed outside DispatchNewtonianGravity
    }
    if (!this.grav && enable) {
      this.grav = Gravity.Create();
      const oldGravIn = this.gravIn.clone();
      this.DispatchNewtonianGravity();
      // gravIn is now potentially garbage, set it again
      this.gravIn = oldGravIn;
    }
  }
}

// keep CELL imported for ported code that reads it from here
export { CELL };
