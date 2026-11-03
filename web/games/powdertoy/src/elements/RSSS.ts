// simulation/elements/RSSS.cpp
import type { Element } from '../sim/element.ts';
import type { Simulation } from '../sim/simulation.ts';
import type { Particle } from '../sim/particle.ts';
import { FIELD_CTYPE, FIELD_TMP } from '../sim/particle.ts';
import { f } from '../sim/cpp.ts';
import { CELL, CFDS, ID, IPH, IPL, ITH, ITL, NT, PROP_NEUTPASS, SC_SOLIDS, TYP, TYPE_SOLID } from '../sim/config.ts';
import { PT_BCLN, PT_CLNE, PT_PBCN, PT_PCLN, PT_RSSS } from '../sim/numbers.ts';

export function Element_RSSS(el: Element): void {
  el.Identifier = 'DEFAULT_PT_RSSS';
  el.Name = 'RSSS';
  el.Colour = 0xC43626;
  el.MenuVisible = 1;
  el.MenuSection = SC_SOLIDS;
  el.Enabled = 1;

  el.Advection = 0.0;
  el.AirDrag = f(0.00 * CFDS);
  el.AirLoss = f(0.90);
  el.Loss = 0.00;
  el.Collision = 0.0;
  el.Gravity = 0.0;
  el.Diffusion = 0.00;
  el.HotAir = f(0.000 * CFDS);
  el.Falldown = 0;

  el.Flammable = 0;
  el.Explosive = 0;
  el.Meltable = 0;
  el.Hardness = 0;

  el.Weight = 100;

  el.HeatConduct = 130;
  el.Description = 'Solidified resist. Blocks pressure and insulates electricity. Liquefies on contact with neutrons.';

  el.Properties = TYPE_SOLID | PROP_NEUTPASS;
  el.CarriesTypeIn = ((1 << FIELD_CTYPE) | (1 << FIELD_TMP)) >>> 0;

  el.LowPressure = IPL;
  el.LowPressureTransition = NT;
  el.HighPressure = IPH;
  el.HighPressureTransition = NT;
  el.LowTemperature = ITL;
  el.LowTemperatureTransition = NT;
  el.HighTemperature = ITH;
  el.HighTemperatureTransition = NT;

  el.Update = update;
}

function update(sim: Simulation, i: number, x: number, y: number, _surround_space: number, _nt: number,
  parts: Particle[], pmap: Int32Array[]): number {
  for (let rx = -1; rx < 2; rx++) {
    for (let ry = -1; ry < 2; ry++) {
      const r = pmap[y + ry][x + rx];

      if (!r)
        continue;

      // Set RSSS ctype from nearby clone
      if ((TYP(r) === PT_CLNE) || (TYP(r) === PT_PCLN)) {
        if (parts[ID(r)].ctype !== PT_RSSS)
          parts[i].ctype = parts[ID(r)].ctype;
      }

      // Set RSSS tmp from nearby breakable clone
      if ((TYP(r) === PT_BCLN) || (TYP(r) === PT_PBCN)) {
        if (parts[ID(r)].ctype !== PT_RSSS)
          parts[i].tmp = parts[ID(r)].ctype;
      }
    }
  }

  //Block air like TTAN
  sim.air.bmap_blockair[(y / CELL) | 0][(x / CELL) | 0] = 1;
  sim.air.bmap_blockairh[(y / CELL) | 0][(x / CELL) | 0] = 0x8;

  return 0;
}
