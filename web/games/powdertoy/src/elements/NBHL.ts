// simulation/elements/NBHL.cpp
import type { Element } from '../sim/element.ts';
import type { Simulation } from '../sim/simulation.ts';
import type { Particle } from '../sim/particle.ts';
import { f, restrict_flt } from '../sim/cpp.ts';
import { CELL, CFDS, IPH, IPL, ITH, ITL, NT, SC_SPECIAL, TYPE_SOLID, XCELLS } from '../sim/config.ts';

export function Element_NBHL(el: Element): void {
  el.Identifier = 'DEFAULT_PT_NBHL';
  el.Name = 'BHOL';
  el.Colour = 0x202020; // 0x202020_rgb
  el.MenuVisible = 1;
  el.MenuSection = SC_SPECIAL;
  el.Enabled = 1;

  el.Advection = 0.0;
  el.AirDrag = f(f(0.00) * CFDS);
  el.AirLoss = f(0.90);
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

  el.HeatConduct = 186;
  el.Description = 'Black hole, sucks in particles using gravity. (Requires Newtonian gravity)';

  el.Properties = TYPE_SOLID;

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
  parts: Particle[], _pmap: Int32Array[]): number {
  const k = ((y / CELL) | 0) * XCELLS + ((x / CELL) | 0); // Vec2{ x, y } / CELL
  if (parts[i].tmp) {
    sim.gravIn.mass[k] = f(sim.gravIn.mass[k] + restrict_flt(f(f(0.001) * parts[i].tmp), f(0.1), f(51.2)));
  }
  else {
    sim.gravIn.mass[k] = f(sim.gravIn.mass[k] + f(0.1));
  }
  return 0;
}
