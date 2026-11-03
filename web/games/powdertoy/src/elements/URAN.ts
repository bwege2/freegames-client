// simulation/elements/URAN.cpp
import type { Element } from '../sim/element.ts';
import type { Simulation } from '../sim/simulation.ts';
import type { Particle } from '../sim/particle.ts';
import { f, restrict_flt } from '../sim/cpp.ts';
import { CELL, CFDS, IPH, IPL, ITH, ITL, MAX_TEMP, MIN_TEMP, NT, PROP_RADIOACTIVE, R_TEMP, SC_NUCLEAR, TYPE_PART } from '../sim/config.ts';

export function Element_URAN(el: Element): void {
  el.Identifier = "DEFAULT_PT_URAN";
  el.Name = "URAN";
  el.Colour = 0x707020;
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
  el.PhotonReflectWavelengths = 0x003FC000;

  el.Weight = 90;

  el.DefaultProperties.temp = f(f(R_TEMP + 30.0) + f(273.15));
  el.HeatConduct = 251;
  el.Description = "Uranium. Heavy particles. Generates heat under pressure.";

  el.Properties = TYPE_PART | PROP_RADIOACTIVE;

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
  if (!sim.legacy_enable && sim.pv[(y/CELL) | 0][(x/CELL) | 0]>0.0)
  {
    if (parts[i].temp == MIN_TEMP)
    {
      parts[i].temp += f(0.01);
    }
    else
    {
      parts[i].temp = restrict_flt(f(f(parts[i].temp*f(1 + f(sim.pv[(y / CELL) | 0][(x / CELL) | 0] / 2000))) + MIN_TEMP), MIN_TEMP, MAX_TEMP);
    }
  }
  return 0;
}
