// simulation/elements/PPIP.cpp (Element_PPIP_flood_trigger is declared in PIPE.h)
import type { Element } from '../sim/element.ts';
import type { Simulation } from '../sim/simulation.ts';
import { FIELD_CTYPE } from '../sim/particle.ts';
import { f } from '../sim/cpp.ts';
import {
  CELL, CFDS, IPH, IPL, ITH, ITL, NT, PROP_LIFE_DEC, SC_POWERED, TYPE_SOLID, XRES, YRES, TYP, ID,
} from '../sim/config.ts';
import { PT_HEAC, PT_INST, PT_NSCN, PT_PIPE, PT_PPIP, PT_PSCN } from '../sim/numbers.ts';
import { Element_PIPE_graphics, Element_PIPE_update, PFLAG_CAN_CONDUCT } from '../elements/PIPE.ts';

export function Element_PPIP(el: Element): void {
  el.Identifier = 'DEFAULT_PT_PPIP';
  el.Name = 'PPIP';
  el.Colour = 0x444466; // 0x444466_rgb
  el.MenuVisible = 1;
  el.MenuSection = SC_POWERED;
  el.Enabled = 1;

  el.Advection = 0.0;
  el.AirDrag = f(f(0.00) * CFDS);
  el.AirLoss = f(0.95);
  el.Loss = f(0.00);
  el.Collision = 0.0;
  el.Gravity = 0.0;
  el.Diffusion = f(0.00);
  el.HotAir = f(f(0.000) * CFDS);
  el.Falldown = 0;

  el.Flammable = 0;
  el.Explosive = 0;
  el.Meltable = 0;
  el.Hardness = 0;

  el.Weight = 100;

  el.DefaultProperties.temp = f(295.15);
  el.HeatConduct = 251;
  el.Description = 'Powered version of PIPE, use PSCN/NSCN to Activate/Deactivate.';

  el.Properties = TYPE_SOLID | PROP_LIFE_DEC;
  el.CarriesTypeIn = (1 << FIELD_CTYPE) >>> 0;

  el.LowPressure = IPL;
  el.LowPressureTransition = NT;
  el.HighPressure = IPH;
  el.HighPressureTransition = NT;
  el.LowTemperature = ITL;
  el.LowTemperatureTransition = NT;
  el.HighTemperature = ITH;
  el.HighTemperatureTransition = NT;

  el.DefaultProperties.life = 60;

  el.Update = Element_PIPE_update;
  el.Graphics = Element_PIPE_graphics;
}

// parts[].tmp flags
// trigger flags to be processed this frame (trigger flags for next frame are shifted 3 bits to the left):
const PPIP_TMPFLAG_TRIGGER_ON = 0x10000000;
const PPIP_TMPFLAG_TRIGGER_OFF = 0x08000000;
const PPIP_TMPFLAG_TRIGGER_REVERSE = 0x04000000;
// 0x000000FF element
// 0x00000100 is single pixel pipe
// 0x00000200 will transfer like a single pixel pipe when in forward mode
// 0x00001C00 forward single pixel pipe direction
// 0x00002000 will transfer like a single pixel pipe when in reverse mode
// 0x0001C000 reverse single pixel pipe direction

export function Element_PPIP_flood_trigger(sim: Simulation, x: number, y: number, sparkedBy: number): void {
  const coord_stack_limit = XRES * YRES;
  // unsigned short coord_stack[coord_stack_limit][2]: entry k is [2k], [2k + 1]
  let coord_stack: Uint16Array;
  let coord_stack_size = 0;
  let x1: number, x2: number;

  const parts = sim.parts;
  const pmap = sim.pmap;
  const t = TYP(pmap[y][x]);
  if (t !== PT_PIPE && t !== PT_PPIP)
    return;

  // Separate flags for on and off in case PPIP is sparked by PSCN and NSCN on the same frame
  // - then PSCN can override NSCN and behaviour is not dependent on particle order
  let prop = 0;
  if (sparkedBy === PT_PSCN) prop = PPIP_TMPFLAG_TRIGGER_ON << 3;
  else if (sparkedBy === PT_NSCN) prop = PPIP_TMPFLAG_TRIGGER_OFF << 3;
  else if (sparkedBy === PT_INST) prop = PPIP_TMPFLAG_TRIGGER_REVERSE << 3;
  else if (sparkedBy === PT_HEAC) prop = PFLAG_CAN_CONDUCT; // Special case for HEAC near pipe

  if (prop === 0 || (t !== PT_PPIP && sparkedBy !== PT_HEAC) || (parts[ID(pmap[y][x])].tmp & prop))
    return;

  coord_stack = new Uint16Array(coord_stack_limit * 2);
  coord_stack[coord_stack_size * 2 + 0] = x;
  coord_stack[coord_stack_size * 2 + 1] = y;
  coord_stack_size++;

  do {
    coord_stack_size--;
    x = coord_stack[coord_stack_size * 2 + 0];
    y = coord_stack[coord_stack_size * 2 + 1];
    x1 = x2 = x;
    // go left as far as possible
    while (x1 >= CELL) {
      if (TYP(pmap[y][x1 - 1]) !== t) {
        break;
      }
      x1--;
    }
    // go right as far as possible
    while (x2 < XRES - CELL) {
      if (TYP(pmap[y][x2 + 1]) !== t) {
        break;
      }
      x2++;
    }
    // fill span
    for (x = x1; x <= x2; x++) {
      if (!(parts[ID(pmap[y][x])].tmp & prop) && sparkedBy !== PT_HEAC)
        sim.Element_PPIP_ppip_changed = 1;
      parts[ID(pmap[y][x])].tmp |= prop;
    }

    // add adjacent pixels to stack
    // +-1 to x limits to include diagonally adjacent pixels
    // Don't need to check x bounds here, because already limited to [CELL, XRES-CELL]
    if (y >= CELL + 1)
      for (x = x1 - 1; x <= x2 + 1; x++)
        if (TYP(pmap[y - 1][x]) === t && !(parts[ID(pmap[y - 1][x])].tmp & prop)) {
          coord_stack[coord_stack_size * 2 + 0] = x;
          coord_stack[coord_stack_size * 2 + 1] = y - 1;
          coord_stack_size++;
          if (coord_stack_size >= coord_stack_limit) {
            return;
          }
        }
    if (y < YRES - CELL - 1)
      for (x = x1 - 1; x <= x2 + 1; x++)
        if (TYP(pmap[y + 1][x]) === t && !(parts[ID(pmap[y + 1][x])].tmp & prop)) {
          coord_stack[coord_stack_size * 2 + 0] = x;
          coord_stack[coord_stack_size * 2 + 1] = y + 1;
          coord_stack_size++;
          if (coord_stack_size >= coord_stack_limit) {
            return;
          }
        }
  } while (coord_stack_size > 0);
}
