// simulation/elements/CNCT.cpp
import type { Element } from '../sim/element.ts';
import { f } from '../sim/cpp.ts';
import { CFDS, IPH, IPL, ITL, NT, PROP_HOT_GLOW, SC_POWDERS, TYPE_PART } from '../sim/config.ts';
import { PT_LAVA } from '../sim/numbers.ts';

export function Element_CNCT(el: Element): void {
  el.Identifier = "DEFAULT_PT_CNCT";
  el.Name = "CNCT";
  el.Colour = 0xC0C0C0;
  el.MenuVisible = 1;
  el.MenuSection = SC_POWDERS;
  el.Enabled = 1;

  el.Advection = f(0.4);
  el.AirDrag = f(f(0.04) * CFDS);
  el.AirLoss = f(0.94);
  el.Loss = f(0.95);
  el.Collision = f(-0.1);
  el.Gravity = f(0.3);
  el.Diffusion = 0.00;
  el.HotAir = f(0.000 * CFDS);
  el.Falldown = 1;

  el.Flammable = 0;
  el.Explosive = 0;
  el.Meltable = 2;
  el.Hardness = 2;

  el.Weight = 55;

  el.HeatConduct = 100;
  el.Description = "Concrete. Can stack on itself or ROCK, collapses with pressure.";

  el.Properties = TYPE_PART | PROP_HOT_GLOW;

  el.LowPressure = IPL;
  el.LowPressureTransition = NT;
  el.HighPressure = IPH;
  el.HighPressureTransition = NT;
  el.LowTemperature = ITL;
  el.LowTemperatureTransition = NT;
  el.HighTemperature = 1123.0;
  el.HighTemperatureTransition = PT_LAVA; //@ CNCT -> LAVA(CNCT)
}
