// simulation/elements/INSL.cpp
import type { Element } from '../sim/element.ts';
import { f } from '../sim/cpp.ts';
import { CFDS, IPH, IPL, ITH, ITL, NT, SC_ELEC, TYPE_SOLID } from '../sim/config.ts';

export function Element_INSL(el: Element): void {
  el.Identifier = "DEFAULT_PT_INSL";
  el.Name = "INSL";
  el.Colour = 0x9EA3B6;
  el.MenuVisible = 1;
  el.MenuSection = SC_ELEC;
  el.Enabled = 1;

  el.Advection = 0.0;
  el.AirDrag = f(0.00 * CFDS);
  el.AirLoss = f(0.95);
  el.Loss = 0.00;
  el.Collision = 0.0;
  el.Gravity = 0.0;
  el.Diffusion = 0.00;
  el.HotAir = f(0.000 * CFDS);
  el.Falldown = 0;

  el.Flammable = 7;
  el.Explosive = 0;
  el.Meltable = 0;
  el.Hardness = 10;

  el.Weight = 100;

  el.HeatConduct = 0;
  el.Description = "Insulator. Blocks heat, electricity, and radiation.";

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
