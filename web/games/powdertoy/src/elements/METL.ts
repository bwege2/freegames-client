// simulation/elements/METL.cpp
import type { Element } from '../sim/element.ts';
import { f } from '../sim/cpp.ts';
import { CFDS, IPH, IPL, ITL, NT, PROP_CONDUCTS, PROP_HOT_GLOW, PROP_LIFE_DEC, SC_ELEC, TYPE_SOLID } from '../sim/config.ts';
import { PT_LAVA } from '../sim/numbers.ts';

export function Element_METL(el: Element): void {
  el.Identifier = "DEFAULT_PT_METL";
  el.Name = "METL";
  el.Colour = 0x404060;
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
  el.Description = "Metal, the basic conductor. Meltable.";

  el.Properties = TYPE_SOLID | PROP_CONDUCTS | PROP_LIFE_DEC | PROP_HOT_GLOW;

  el.LowPressure = IPL;
  el.LowPressureTransition = NT;
  el.HighPressure = IPH;
  el.HighPressureTransition = NT;
  el.LowTemperature = ITL;
  el.LowTemperatureTransition = NT;
  el.HighTemperature = 1273.0;
  el.HighTemperatureTransition = PT_LAVA; //@ METL -> LAVA(METL)
}
