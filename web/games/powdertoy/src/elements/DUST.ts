// simulation/elements/DUST.cpp
import type { Element } from '../sim/element.ts';
import { f } from '../sim/cpp.ts';
import { CFDS, IPH, IPL, ITH, ITL, NT, SC_POWDERS, TYPE_PART } from '../sim/config.ts';

export function Element_DUST(el: Element): void {
  el.Identifier = "DEFAULT_PT_DUST";
  el.Name = "DUST";
  el.Colour = 0xFFE0A0;
  el.MenuVisible = 1;
  el.MenuSection = SC_POWDERS;
  el.Enabled = 1;

  el.Advection = f(0.7);
  el.AirDrag = f(f(0.02) * CFDS);
  el.AirLoss = f(0.96);
  el.Loss = f(0.80);
  el.Collision = 0.0;
  el.Gravity = f(0.1);
  el.Diffusion = 0.00;
  el.HotAir = f(0.000 * CFDS);
  el.Falldown = 1;

  el.Flammable = 10;
  el.Explosive = 0;
  el.Meltable = 0;
  el.Hardness = 30;
  el.PhotonReflectWavelengths = 0x3FFFFFC0;

  el.Weight = 85;

  el.HeatConduct = 70;
  el.Description = "Very light dust. Flammable.";

  el.Properties = TYPE_PART;

  el.LowPressure = IPL;
  el.LowPressureTransition = NT;
  el.HighPressure = IPH;
  el.HighPressureTransition = NT;
  el.LowTemperature = ITL;
  el.LowTemperatureTransition = NT;
  el.HighTemperature = ITH;
  el.HighTemperatureTransition = NT;

  el.Graphics = null; // it this needed?
}
