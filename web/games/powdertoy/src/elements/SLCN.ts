// simulation/elements/SLCN.cpp
import type { Element, GraphicsFuncContext, Gfx } from '../sim/element.ts';
import type { Simulation } from '../sim/simulation.ts';
import type { Particle } from '../sim/particle.ts';
import { f } from '../sim/cpp.ts';
import { Blue, Green, Red, rgb } from '../sim/colour.ts';
import {
  CFDS, ID, IPH, IPL, ITL, NT, PMODE_FLARE, PMODE_GLOW, PMODE_SPARK, PROP_CONDUCTS, PROP_HOT_GLOW, PROP_LIFE_DEC,
  SC_POWDERS, TYP, TYPE_PART,
} from '../sim/config.ts';
import { PT_LAVA, PT_SLCN, PT_SPRK } from '../sim/numbers.ts';

export function Element_SLCN(el: Element): void {
  el.Identifier = 'DEFAULT_PT_SLCN';
  el.Name = 'SLCN';
  el.Colour = 0xBCCDDF;
  el.MenuVisible = 1;
  el.MenuSection = SC_POWDERS;
  el.Enabled = 1;

  el.Advection = f(0.4);
  el.AirDrag = f(f(0.04) * CFDS);
  el.AirLoss = f(0.94);
  el.Loss = f(0.95);
  el.Collision = f(-0.1);
  el.Gravity = f(0.27);
  el.Diffusion = 0.00;
  el.HotAir = f(0.000 * CFDS);
  el.Falldown = 1;

  el.Flammable = 0;
  el.Explosive = 0;
  el.Meltable = 0;
  el.Hardness = 0;

  el.Weight = 90;

  el.HeatConduct = 100;
  el.Description = 'Powdered Silicon. A key ingredient in producing multiple materials.';

  el.Properties = TYPE_PART | PROP_CONDUCTS | PROP_HOT_GLOW | PROP_LIFE_DEC;

  el.LowPressure = IPL;
  el.LowPressureTransition = NT;
  el.HighPressure = IPH;
  el.HighPressureTransition = NT;
  el.LowTemperature = ITL;
  el.LowTemperatureTransition = NT;
  el.HighTemperature = f(3538.15);
  el.HighTemperatureTransition = PT_LAVA; //@ SLCN -> LAVA(SLCN)

  el.Update = update;
  el.Graphics = graphics;
  el.Create = create;
}

const SLCN_COLOUR = [
  0x5A6679, 0x6878A1, 0xABBFDD, 0x838490,
  0xBCCDDF, 0x82A0D2, 0x5B6680, 0x232C3B,
  0x485067, 0x8B9AB6, 0xADB1C1, 0xC3C6D1,
  0x8594AD, 0x262F47, 0xA9AEBC, 0xC2E1F7,
];

function initSparkles(sim: Simulation, part: Particle): void {
  // bits 31-20: phase increment (randomised to a value between 1 and 9)
  // bits 19-16: next colour index
  // bits 15-12: current colour index
  // bits 11-00: phase
  part.tmp = sim.rng.between(0x100000, 0x9FFFFF);
}

const check_coords_x = [-4, 4, 0, 0];
const check_coords_y = [0, 0, -4, 4];

function update(sim: Simulation, i: number, x: number, y: number, _surround_space: number, _nt: number,
  parts: Particle[], pmap: Int32Array[]): number {
  if (!parts[i].tmp) {
    initSparkles(sim, parts[i]);
  }
  const phase = (parts[i].tmp & 0xFFF) + ((parts[i].tmp >> 20) & 0xFFF);
  if (phase & 0x1000) {
    // discard current, current <- next, next <- random, wrap phase
    parts[i].tmp = (parts[i].tmp & 0xFFF00000) | (phase & 0xFFF) | (sim.rng.between(0, 15) << 16) | ((parts[i].tmp >> 4) & 0xF000);
  } else {
    // update phase
    parts[i].tmp = (parts[i].tmp & 0xFFFFF000) | phase;
  }

  if (parts[i].life === 0 && parts[i].temp < f(373.15)) {
    for (let j = 0; j < 4; j++) {
      const n = pmap[y + check_coords_y[j]][x + check_coords_x[j]];
      if (n && TYP(n) === PT_SPRK) {
        const neighbour = parts[ID(n)];
        if (neighbour.life !== 0 && neighbour.life < 4) {
          sim.part_change_type(i, x, y, PT_SPRK);
          parts[i].life = 4;
          parts[i].ctype = PT_SLCN;
        }
      }
    }
  }

  return 0;
}

function graphics(_gfctx: GraphicsFuncContext, cpart: Particle, _nx: number, _ny: number, g: Gfx): number {
  let curr_colour = SLCN_COLOUR[(cpart.tmp >> 12) & 15];
  if (cpart.tmp & 0x800) { // mix with next colour if phase is at least halfway there
    const next_colour = SLCN_COLOUR[(cpart.tmp >> 16) & 15];
    curr_colour = rgb(
      ((Red(curr_colour) + Red(next_colour)) / 2) | 0,
      ((Green(curr_colour) + Green(next_colour)) / 2) | 0,
      ((Blue(curr_colour) + Blue(next_colour)) / 2) | 0,
    );
  }
  g.colr = Red(curr_colour);
  g.colg = Green(curr_colour);
  g.colb = Blue(curr_colour);

  const rnd = Math.imul(cpart.tmp & 0xFFFF, (cpart.tmp >> 16) & 0xFFFF);
  if (!(rnd % 887)) {
    g.pixel_mode |= PMODE_FLARE | PMODE_GLOW;
  }
  if (!(rnd % 593)) {
    g.pixel_mode |= PMODE_SPARK;
  }

  return 0;
}

function create(sim: Simulation, i: number, _x: number, _y: number, _t: number, _v: number): void {
  initSparkles(sim, sim.parts[i]);
}
