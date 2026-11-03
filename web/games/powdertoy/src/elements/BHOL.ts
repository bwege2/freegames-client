// simulation/elements/BHOL.cpp
import type { Element } from '../sim/element.ts';
import { f } from '../sim/cpp.ts';
import { CFDS, IPH, IPL, ITH, ITL, NT, R_TEMP, SC_SPECIAL, TYPE_SOLID } from '../sim/config.ts';

export function Element_BHOL(el: Element): void {
  el.Identifier = "DEFAULT_PT_BHOL";
  el.Name = "VACU";
  el.Colour = 0x303030;
  el.MenuVisible = 1;
  el.MenuSection = SC_SPECIAL;
  el.Enabled = 1;

  el.Advection = 0.0;
  el.AirDrag = f(0.00 * CFDS);
  el.AirLoss = f(0.95);
  el.Loss = 0.00;
  el.Collision = 0.0;
  el.Gravity = 0.0;
  el.Diffusion = 0.00;
  el.HotAir = f(f(-0.01) * CFDS);
  el.Falldown = 0;

  el.Flammable = 0;
  el.Explosive = 0;
  el.Meltable = 0;
  el.Hardness = 0;

  el.Weight = 100;

  el.DefaultProperties.temp = f(f(R_TEMP + 70.0) + f(273.15));
  el.HeatConduct = 255;
  el.Description = "Vacuum, sucks in other particles and heats up.";

  el.Properties = TYPE_SOLID;

  el.LowPressure = IPL;
  el.LowPressureTransition = NT;
  el.HighPressure = IPH;
  el.HighPressureTransition = NT;
  el.LowTemperature = ITL;
  el.LowTemperatureTransition = NT;
  el.HighTemperature = ITH;
  el.HighTemperatureTransition = NT;
}
