// simulation/elements/NTCT.cpp (+ NTCT.h)
import type { Element } from '../sim/element.ts';
import type { Simulation } from '../sim/simulation.ts';
import type { Particle } from '../sim/particle.ts';
import { f } from '../sim/cpp.ts';
import { CFDS, IPH, IPL, ITL, NT, PROP_CONDUCTS, PROP_LIFE_DEC, SC_ELEC, TYPE_SOLID } from '../sim/config.ts';
import { PT_LAVA } from '../sim/numbers.ts';

export function Element_NTCT(el: Element): void {
  el.Identifier = "DEFAULT_PT_NTCT";
  el.Name = "NTCT";
  el.Colour = 0x505040;
  el.MenuVisible = 1;
  el.MenuSection = SC_ELEC;
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
  el.Meltable = 1;
  el.Hardness = 1;

  el.Weight = 100;

  el.HeatConduct = 251;
  el.Description = "NTC Thermistor. Conducts with PSCN and NSCN, but only when heated above 100C.";

  el.Properties = TYPE_SOLID | PROP_CONDUCTS | PROP_LIFE_DEC;

  el.LowPressure = IPL;
  el.LowPressureTransition = NT;
  el.HighPressure = IPH;
  el.HighPressureTransition = NT;
  el.LowTemperature = ITL;
  el.LowTemperatureTransition = NT;
  el.HighTemperature = 1687.0;
  el.HighTemperatureTransition = PT_LAVA; //@ NTCT -> LAVA(NTCT)

  el.Update = Element_NTCT_update;
}

// NTCT.h
export function Element_NTCT_update(_sim: Simulation, i: number, _x: number, _y: number, _surround_space: number, _nt: number,
  parts: Particle[], _pmap: Int32Array[]): number {
  if (parts[i].temp>295.0)
    parts[i].temp -= 2.5;
  return 0;
}
