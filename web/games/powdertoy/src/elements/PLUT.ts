// simulation/elements/PLUT.cpp
import type { Element } from '../sim/element.ts';
import type { Simulation } from '../sim/simulation.ts';
import type { Particle } from '../sim/particle.ts';
import { f, itrunc } from '../sim/cpp.ts';
import { CELL, CFDS, IPH, IPL, ITH, ITL, NT, PROP_NEUTPASS, PROP_RADIOACTIVE, R_TEMP, SC_NUCLEAR, TYPE_PART } from '../sim/config.ts';
import { PT_NEUT } from '../sim/numbers.ts';

export function Element_PLUT(el: Element): void {
  el.Identifier = "DEFAULT_PT_PLUT";
  el.Name = "PLUT";
  el.Colour = 0x407020;
  el.MenuVisible = 1;
  el.MenuSection = SC_NUCLEAR;
  el.Enabled = 1;

  el.Advection = f(0.4);
  el.AirDrag = f(f(0.01) * CFDS);
  el.AirLoss = f(0.99);
  el.Loss = f(0.95);
  el.Collision = 0.0;
  el.Gravity = f(0.4);
  el.Diffusion = 0.00;
  el.HotAir = f(0.000 * CFDS);
  el.Falldown = 1;

  el.Flammable = 0;
  el.Explosive = 0;
  el.Meltable = 0;
  el.Hardness = 0;
  el.PhotonReflectWavelengths = 0x001FCE00;

  el.Weight = 90;

  el.DefaultProperties.temp = f(f(R_TEMP + 4.0) + f(273.15));
  el.HeatConduct = 251;
  el.Description = "Plutonium. Heavy, fissile particles. Generates neutrons under pressure.";

  el.Properties = TYPE_PART | PROP_NEUTPASS | PROP_RADIOACTIVE;

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
  _parts: Particle[], _pmap: Int32Array[]): number {
  if (sim.rng.chance(1, 100) && sim.rng.chance(itrunc(f(5.0*sim.pv[(y/CELL) | 0][(x/CELL) | 0])), 1000))
  {
    //@ PLUT -> NEUT
    sim.create_part(i, x, y, PT_NEUT);
  }
  return 0;
}
