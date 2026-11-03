// simulation/elements/NITR.cpp
import type { Element } from '../sim/element.ts';
import { f } from '../sim/cpp.ts';
import { CFDS, IPH, IPL, ITL, NT, SC_EXPLOSIVE, TYPE_LIQUID } from '../sim/config.ts';
import { PT_FIRE } from '../sim/numbers.ts';

export function Element_NITR(el: Element): void {
  el.Identifier = "DEFAULT_PT_NITR";
  el.Name = "NITR";
  el.Colour = 0x20E010;
  el.MenuVisible = 1;
  el.MenuSection = SC_EXPLOSIVE;
  el.Enabled = 1;

  el.Advection = 0.5;
  el.AirDrag = f(f(0.02) * CFDS);
  el.AirLoss = f(0.92);
  el.Loss = f(0.97);
  el.Collision = 0.0;
  el.Gravity = f(0.2);
  el.Diffusion = 0.00;
  el.HotAir = f(0.000 * CFDS);
  el.Falldown = 2;

  el.Flammable = 1000;
  el.Explosive = 2;
  el.Meltable = 0;
  el.Hardness = 3;
  el.PhotonReflectWavelengths = 0x0007C000;

  el.Weight = 23;

  el.HeatConduct = 50;
  el.Description = "Nitroglycerin. Pressure sensitive explosive. Mix with CLST to make TNT.";

  el.Properties = TYPE_LIQUID;

  el.LowPressure = IPL;
  el.LowPressureTransition = NT;
  el.HighPressure = IPH;
  el.HighPressureTransition = NT;
  el.LowTemperature = ITL;
  el.LowTemperatureTransition = NT;
  el.HighTemperature = 673.0;
  el.HighTemperatureTransition = PT_FIRE; //@ NITR -> FIRE
}
