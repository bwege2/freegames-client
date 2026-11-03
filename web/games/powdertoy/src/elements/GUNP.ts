// simulation/elements/GUNP.cpp
import type { Element } from '../sim/element.ts';
import { f } from '../sim/cpp.ts';
import { CFDS, IPH, IPL, ITL, NT, SC_EXPLOSIVE, TYPE_PART } from '../sim/config.ts';
import { PT_FIRE } from '../sim/numbers.ts';

export function Element_GUNP(el: Element): void {
  el.Identifier = "DEFAULT_PT_GUNP";
  el.Name = "GUN";
  el.Colour = 0xC0C0D0;
  el.MenuVisible = 1;
  el.MenuSection = SC_EXPLOSIVE;
  el.Enabled = 1;

  el.Advection = f(0.7);
  el.AirDrag = f(f(0.02) * CFDS);
  el.AirLoss = f(0.94);
  el.Loss = f(0.80);
  el.Collision = f(-0.1);
  el.Gravity = f(0.1);
  el.Diffusion = 0.00;
  el.HotAir = f(0.000 * CFDS);
  el.Falldown = 1;

  el.Flammable = 600;
  el.Explosive = 1;
  el.Meltable = 0;
  el.Hardness = 10;

  el.Weight = 85;

  el.HeatConduct = 97;
  el.Description = "Gunpowder. Light dust, explodes on contact with fire or spark.";

  el.Properties = TYPE_PART;

  el.LowPressure = IPL;
  el.LowPressureTransition = NT;
  el.HighPressure = IPH;
  el.HighPressureTransition = NT;
  el.LowTemperature = ITL;
  el.LowTemperatureTransition = NT;
  el.HighTemperature = 673.0;
  el.HighTemperatureTransition = PT_FIRE; //@ GUNP -> FIRE
}
