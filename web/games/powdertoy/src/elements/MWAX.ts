// simulation/elements/MWAX.cpp
import type { Element } from '../sim/element.ts';
import { f } from '../sim/cpp.ts';
import { CFDS, IPH, IPL, NT, R_TEMP, SC_LIQUID, TYPE_LIQUID } from '../sim/config.ts';
import { PT_FIRE, PT_WAX } from '../sim/numbers.ts';

export function Element_MWAX(el: Element): void {
  el.Identifier = "DEFAULT_PT_MWAX";
  el.Name = "MWAX";
  el.Colour = 0xE0E0AA;
  el.MenuVisible = 1;
  el.MenuSection = SC_LIQUID;
  el.Enabled = 1;

  el.Advection = f(0.3);
  el.AirDrag = f(f(0.02) * CFDS);
  el.AirLoss = f(0.95);
  el.Loss = f(0.80);
  el.Collision = 0.0;
  el.Gravity = f(0.15);
  el.Diffusion = 0.00;
  el.HotAir = f(f(0.000001) * CFDS);
  el.Falldown = 2;

  el.Flammable = 5;
  el.Explosive = 0;
  el.Meltable = 0;
  el.Hardness = 2;

  el.Weight = 25;

  el.DefaultProperties.temp = f(f(R_TEMP + 28.0) + f(273.15));
  el.HeatConduct = 44;
  el.Description = "Liquid Wax. Hardens into WAX at 45 degrees.";

  el.Properties = TYPE_LIQUID;

  el.LowPressure = IPL;
  el.LowPressureTransition = NT;
  el.HighPressure = IPH;
  el.HighPressureTransition = NT;
  el.LowTemperature = 318.0;
  el.LowTemperatureTransition = PT_WAX; //@ MWAX -> WAX
  el.HighTemperature = 673.0;
  el.HighTemperatureTransition = PT_FIRE; //@ MWAX -> FIRE
}
