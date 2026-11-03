// simulation/elements/SAND.cpp
import type { Element } from '../sim/element.ts';
import { f } from '../sim/cpp.ts';
import { CFDS, IPH, IPL, ITL, NT, SC_POWDERS, TYPE_PART } from '../sim/config.ts';
import { PT_LAVA } from '../sim/numbers.ts';

export function Element_SAND(el: Element): void {
  el.Identifier = "DEFAULT_PT_SAND";
  el.Name = "SAND";
  el.Colour = 0xFFD090;
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
  el.Meltable = 5;
  el.Hardness = 1;

  el.Weight = 90;

  el.HeatConduct = 150;
  el.Description = "Sand, Heavy particles. Melts into glass.";

  el.Properties = TYPE_PART;

  el.LowPressure = IPL;
  el.LowPressureTransition = NT;
  el.HighPressure = IPH;
  el.HighPressureTransition = NT;
  el.LowTemperature = ITL;
  el.LowTemperatureTransition = NT;
  el.HighTemperature = 1973.0;
  el.HighTemperatureTransition = PT_LAVA; //@ SAND -> LAVA(GLAS)
}
