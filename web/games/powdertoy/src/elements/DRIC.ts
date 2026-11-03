// simulation/elements/DRIC.cpp
import type { Element } from '../sim/element.ts';
import { f } from '../sim/cpp.ts';
import { CFDS, IPH, IPL, ITL, NT, SC_SOLIDS, TYPE_SOLID } from '../sim/config.ts';
import { PT_CO2 } from '../sim/numbers.ts';

export function Element_DRIC(el: Element): void {
  el.Identifier = 'DEFAULT_PT_DRIC';
  el.Name = 'DRIC';
  el.Colour = 0xE0E0E0;
  el.MenuVisible = 1;
  el.MenuSection = SC_SOLIDS;
  el.Enabled = 1;

  el.Advection = 0.0;
  el.AirDrag = f(f(0.00) * CFDS);
  el.AirLoss = f(0.90);
  el.Loss = f(0.00);
  el.Collision = 0.0;
  el.Gravity = 0.0;
  el.Diffusion = f(0.00);
  el.HotAir = f(f(-0.0005) * CFDS);
  el.Falldown = 0;

  el.Flammable = 0;
  el.Explosive = 0;
  el.Meltable = 0;
  el.Hardness = 20;

  el.Weight = 100;

  el.DefaultProperties.temp = f(172.65);
  el.HeatConduct = 2;
  el.Description = 'Dry Ice, formed when CO2 is cooled.';

  el.Properties = TYPE_SOLID;

  el.LowPressure = IPL;
  el.LowPressureTransition = NT;
  el.HighPressure = IPH;
  el.HighPressureTransition = NT;
  el.LowTemperature = ITL;
  el.LowTemperatureTransition = NT;
  el.HighTemperature = f(195.65);
  el.HighTemperatureTransition = PT_CO2; //@ DRIC -> CO2
}
