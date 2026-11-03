// simulation/elements/RBDM.cpp
import type { Element } from '../sim/element.ts';
import { f } from '../sim/cpp.ts';
import { CFDS, IPH, IPL, ITL, NT, PROP_CONDUCTS, PROP_LIFE_DEC, SC_EXPLOSIVE, TYPE_SOLID } from '../sim/config.ts';
import { PT_LRBD } from '../sim/numbers.ts';

export function Element_RBDM(el: Element): void {
  el.Identifier = "DEFAULT_PT_RBDM";
  el.Name = "RBDM";
  el.Colour = 0xCCCCCC;
  el.MenuVisible = 1;
  el.MenuSection = SC_EXPLOSIVE;
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

  el.Flammable = 1000;
  el.Explosive = 1;
  el.Meltable = 50;
  el.Hardness = 1;

  el.Weight = 100;

  el.HeatConduct = 240;
  el.Description = "Rubidium. Explosive, especially on contact with water. Low melting point.";

  el.Properties = TYPE_SOLID | PROP_CONDUCTS | PROP_LIFE_DEC;

  el.LowPressure = IPL;
  el.LowPressureTransition = NT;
  el.HighPressure = IPH;
  el.HighPressureTransition = NT;
  el.LowTemperature = ITL;
  el.LowTemperatureTransition = NT;
  el.HighTemperature = 312.0;
  el.HighTemperatureTransition = PT_LRBD; //@ RBDM -> LRBD
}
