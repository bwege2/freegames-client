// simulation/elements/MORT.cpp
import type { Element } from '../sim/element.ts';
import type { Simulation } from '../sim/simulation.ts';
import type { Particle } from '../sim/particle.ts';
import { f } from '../sim/cpp.ts';
import { CFDS, IPH, IPL, ITH, ITL, NT, R_TEMP, SC_SPECIAL, TYPE_GAS } from '../sim/config.ts';
import { PT_SMKE } from '../sim/numbers.ts';

export function Element_MORT(el: Element): void {
  el.Identifier = 'DEFAULT_PT_MORT';
  el.Name = 'MORT';
  el.Colour = 0xE0E0E0;
  el.MenuVisible = 0;
  el.MenuSection = SC_SPECIAL;
  el.Enabled = 1;

  el.Advection = 0.0;
  el.AirDrag = f(f(0.00) * CFDS);
  el.AirLoss = 1.00;
  el.Loss = 1.00;
  el.Collision = f(-0.99);
  el.Gravity = 0.0;
  el.Diffusion = f(0.01);
  el.HotAir = f(f(0.002) * CFDS);
  el.Falldown = 0;

  el.Flammable = 0;
  el.Explosive = 0;
  el.Meltable = 0;
  el.Hardness = 0;

  el.Weight = -1;

  el.DefaultProperties.temp = f(f(R_TEMP + 4.0) + f(273.15));
  el.HeatConduct = 60;
  el.Description = 'Steam Train.';

  el.Properties = TYPE_GAS;

  el.LowPressure = IPL;
  el.LowPressureTransition = NT;
  el.HighPressure = IPH;
  el.HighPressureTransition = NT;
  el.LowTemperature = ITL;
  el.LowTemperatureTransition = NT;
  el.HighTemperature = ITH;
  el.HighTemperatureTransition = NT;

  // CHOO CHOO
  el.DefaultProperties.vx = 2.0;

  el.Update = update;
}

function update(sim: Simulation, _i: number, x: number, y: number, _surround_space: number, _nt: number,
  _parts: Particle[], _pmap: Int32Array[]): number {
  sim.create_part(-1, x, y - 1, PT_SMKE);
  return 0;
}
