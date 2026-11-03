// simulation/elements/GOO.cpp
import type { Element } from '../sim/element.ts';
import type { Simulation } from '../sim/simulation.ts';
import type { Particle } from '../sim/particle.ts';
import { f } from '../sim/cpp.ts';
import { CELL, CFDS, IPH, IPL, ITH, ITL, NT, PROP_LIFE_DEC, PROP_LIFE_KILL_DEC, PROP_NEUTPENETRATE, SC_SOLIDS, TYPE_SOLID } from '../sim/config.ts';

export function Element_GOO(el: Element): void {
  el.Identifier = "DEFAULT_PT_GOO";
  el.Name = "GOO";
  el.Colour = 0x804000;
  el.MenuVisible = 1;
  el.MenuSection = SC_SOLIDS;
  el.Enabled = 1;

  el.Advection = 0.0;
  el.AirDrag = f(0.00 * CFDS);
  el.AirLoss = f(0.97);
  el.Loss = 0.50;
  el.Collision = 0.0;
  el.Gravity = 0.0;
  el.Diffusion = 0.00;
  el.HotAir = f(0.000 * CFDS);
  el.Falldown = 0;

  el.Flammable = 0;
  el.Explosive = 0;
  el.Meltable = 0;
  el.Hardness = 12;
  el.PhotonReflectWavelengths = 0x3FFAAA00;

  el.Weight = 100;

  el.HeatConduct = 75;
  el.Description = "Deforms and disappears under pressure.";

  el.Properties = TYPE_SOLID | PROP_NEUTPENETRATE | PROP_LIFE_DEC | PROP_LIFE_KILL_DEC;

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

const ADVECTION = f(0.1);

function update(sim: Simulation, i: number, x: number, y: number, _surround_space: number, _nt: number,
  parts: Particle[], _pmap: Int32Array[]): number {
  if (!parts[i].life && sim.pv[(y/CELL) | 0][(x/CELL) | 0]>1.0)
    parts[i].life = sim.rng.between(300, 379);
  if (parts[i].life)
  {
    parts[i].vx += f(ADVECTION*sim.vx[(y/CELL) | 0][(x/CELL) | 0]);
    parts[i].vy += f(ADVECTION*sim.vy[(y/CELL) | 0][(x/CELL) | 0]);
  }
  return 0;
}
