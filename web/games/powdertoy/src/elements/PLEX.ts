// simulation/elements/PLEX.cpp
import type { Element } from '../sim/element.ts';
import { f } from '../sim/cpp.ts';
import { CFDS, IPH, IPL, ITL, NT, PROP_NEUTPENETRATE, SC_EXPLOSIVE, TYPE_SOLID } from '../sim/config.ts';
import { PT_FIRE } from '../sim/numbers.ts';

export function Element_PLEX(el: Element): void {
  el.Identifier = "DEFAULT_PT_PLEX";
  el.Name = "C-4";
  el.Colour = 0xD080E0;
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
  el.Explosive = 2;
  el.Meltable = 50;
  el.Hardness = 1;
  el.PhotonReflectWavelengths = 0x1F00003E;

  el.Weight = 100;

  el.HeatConduct = 88;
  el.Description = "Solid pressure sensitive explosive.";

  el.Properties = TYPE_SOLID | PROP_NEUTPENETRATE;

  el.LowPressure = IPL;
  el.LowPressureTransition = NT;
  el.HighPressure = IPH;
  el.HighPressureTransition = NT;
  el.LowTemperature = ITL;
  el.LowTemperatureTransition = NT;
  el.HighTemperature = 673.0;
  el.HighTemperatureTransition = PT_FIRE; //@ PLEX -> FIRE
}
