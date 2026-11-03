// simulation/elements/ANAR.cpp
import type { Element } from '../sim/element.ts';
import type { Simulation } from '../sim/simulation.ts';
import type { Particle } from '../sim/particle.ts';
import { f } from '../sim/cpp.ts';
import { CELL, CFDS, ID, IPH, IPL, ITH, ITL, NT, SC_POWDERS, TYP, TYPE_PART } from '../sim/config.ts';
import { PT_CFLM } from '../sim/numbers.ts';

export function Element_ANAR(el: Element): void {
  el.Identifier = 'DEFAULT_PT_ANAR';
  el.Name = 'ANAR';
  el.Colour = 0xFFFFEE;
  el.MenuVisible = 1;
  el.MenuSection = SC_POWDERS;
  el.Enabled = 1;

  el.Advection = f(-0.7);
  el.AirDrag = f(f(-0.02) * CFDS);
  el.AirLoss = f(0.96);
  el.Loss = f(0.80);
  el.Collision = f(0.1);
  el.Gravity = f(-0.1);
  el.NewtonianGravity = f(-1.);
  el.Diffusion = f(0.00);
  el.HotAir = f(f(0.000) * CFDS);
  el.Falldown = 1;

  el.Flammable = 0;
  el.Explosive = 0;
  el.Meltable = 0;
  el.Hardness = 29;

  el.Weight = 85;

  el.HeatConduct = 70;
  el.Description = 'Anti-air. Very light gravity-defying dust. Burns cold instead of hot.';

  el.Properties = TYPE_PART;

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
  for (let rx = -1; rx <= 1; rx++) {
    for (let ry = -1; ry <= 1; ry++) {
      if (rx || ry) {
        const r = pmap[y + ry][x + rx];
        if (!r)
          continue;
        if (TYP(r) === PT_CFLM && sim.rng.chance(1, 4)) {
          //@ ANAR + CFLM -> 2xCFLM
          sim.part_change_type(i, x, y, PT_CFLM);
          parts[i].life = sim.rng.between(50, 199);
          parts[ID(r)].temp = parts[i].temp = 0;
          // float -= double: computed in double, stored as float
          sim.pv[(y / CELL) | 0][(x / CELL) | 0] = sim.pv[(y / CELL) | 0][(x / CELL) | 0] - 0.5;
        }
      }
    }
  }
  return 0;
}
