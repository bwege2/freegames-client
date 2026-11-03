// simulation/elements/C5.cpp
import { sd } from '../sim/simulationData.ts';
import type { Element, GraphicsFuncContext, Gfx } from '../sim/element.ts';
import type { Simulation } from '../sim/simulation.ts';
import type { Particle } from '../sim/particle.ts';
import { f } from '../sim/cpp.ts';
import {
  CELL, CFDS, FIRE_ADD, ID, IPH, IPL, ITH, ITL, NO_DECO, NT, PMODE_ADD, PMODE_FLAT, PROP_LIFE_DEC,
  PROP_NEUTPENETRATE, PROP_PHOTPASS, SC_EXPLOSIVE, TYP, TYPE_SOLID,
} from '../sim/config.ts';
import { PT_C5, PT_CFLM, PT_PHOT } from '../sim/numbers.ts';

export function Element_C5(el: Element): void {
  el.Identifier = 'DEFAULT_PT_C5';
  el.Name = 'C-5';
  el.Colour = 0x2050E0;
  el.MenuVisible = 1;
  el.MenuSection = SC_EXPLOSIVE;
  el.Enabled = 1;

  el.Advection = f(0.0);
  el.AirDrag = f(f(0.00) * CFDS);
  el.AirLoss = f(0.90);
  el.Loss = f(0.00);
  el.Collision = f(0.0);
  el.Gravity = f(0.0);
  el.Diffusion = f(0.00);
  el.HotAir = f(f(0.000) * CFDS);
  el.Falldown = 0;

  el.Flammable = 0;
  el.Explosive = 0;
  el.Meltable = 0;
  el.Hardness = 1;

  el.Weight = 100;

  el.HeatConduct = 88;
  el.Description = 'Cold explosive, set off by anything cold.';

  el.Properties = TYPE_SOLID | PROP_NEUTPENETRATE | PROP_PHOTPASS | PROP_LIFE_DEC;

  el.LowPressure = IPL;
  el.LowPressureTransition = NT;
  el.HighPressure = IPH;
  el.HighPressureTransition = NT;
  el.LowTemperature = ITL;
  el.LowTemperatureTransition = NT;
  el.HighTemperature = ITH;
  el.HighTemperatureTransition = NT;

  el.Update = update;
  el.Graphics = graphics;
}

function update(sim: Simulation, i: number, x: number, y: number, _surround_space: number, _nt: number,
  parts: Particle[], pmap: Int32Array[]): number {
  for (let rx = -2; rx <= 2; rx++) {
    for (let ry = -2; ry <= 2; ry++) {
      if (rx || ry) {
        const r = pmap[y + ry][x + rx];
        if (!r)
          continue;
        if ((TYP(r) !== PT_C5 && parts[ID(r)].temp < 100 && !sd.IsHeatInsulator(parts[ID(r)])) || TYP(r) === PT_CFLM) {
          if (sim.rng.chance(1, 6)) {
            //@ C5 -> CFLM
            sim.part_change_type(i, x, y, PT_CFLM);
            parts[ID(r)].temp = parts[i].temp = 0;
            parts[i].life = sim.rng.between(50, 199);
            // float += double: computed in double, stored as float
            sim.pv[(y / CELL) | 0][(x / CELL) | 0] = sim.pv[(y / CELL) | 0][(x / CELL) | 0] + 1.5;
          }
        }
      }
    }
  }
  if (parts[i].ctype && !parts[i].life) {
    const vx = f(((parts[i].tmp << 16) >> 16) / f(255.0));
    const vy = f((parts[i].tmp >> 16) / f(255.0));
    const dx = f(((parts[i].tmp2 << 16) >> 16) / f(255.0));
    const dy = f((parts[i].tmp2 >> 16) / f(255.0));
    const r = sim.create_part(-3, x, y, PT_PHOT);
    if (r !== -1) {
      parts[r].ctype = parts[i].ctype;
      parts[r].x = f(parts[r].x + dx);
      parts[r].y = f(parts[r].y + dy);
      parts[r].vx = vx;
      parts[r].vy = vy;
      parts[r].temp = parts[i].temp;
    }
    parts[i].ctype = 0;
    parts[i].tmp = 0;
    parts[i].tmp2 = 0;
  }
  return 0;
}

function graphics(_gfctx: GraphicsFuncContext, cpart: Particle, _nx: number, _ny: number, g: Gfx): number {
  if (!cpart.ctype)
    return 0;

  let x = 0;
  g.colr = g.colg = g.colb = 0;
  for (x = 0; x < 12; x++) {
    g.colr += (cpart.ctype >> (x + 18)) & 1;
    g.colb += (cpart.ctype >> x) & 1;
  }
  for (x = 0; x < 12; x++)
    g.colg += (cpart.ctype >> (x + 9)) & 1;
  x = (624 / (g.colr + g.colg + g.colb + 1)) | 0;
  g.colr *= x;
  g.colg *= x;
  g.colb *= x;

  g.firea = 100;
  g.firer = g.colr;
  g.fireg = g.colg;
  g.fireb = g.colb;

  g.pixel_mode &= ~PMODE_FLAT;
  g.pixel_mode |= FIRE_ADD | PMODE_ADD | NO_DECO;
  return 0;
}
