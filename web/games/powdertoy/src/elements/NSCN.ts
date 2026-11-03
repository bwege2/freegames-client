// simulation/elements/NSCN.cpp
import type { Element } from '../sim/element.ts';
import { f } from '../sim/cpp.ts';
import { CFDS, IPH, IPL, ITL, NT, PROP_CONDUCTS, PROP_LIFE_DEC, SC_ELEC, TYPE_SOLID } from '../sim/config.ts';
import { PT_LAVA } from '../sim/numbers.ts';

export function Element_NSCN(el: Element): void {
  el.Identifier = "DEFAULT_PT_NSCN";
  el.Name = "NSCN";
  el.Colour = 0x505080;
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
  el.PhotonReflectWavelengths = 0x00000000;

  el.Weight = 100;

  el.HeatConduct = 251;
  el.Description = "N-Type Silicon, Will not transfer current to P-Type Silicon. Disables powered materials.";

  el.Properties = TYPE_SOLID | PROP_CONDUCTS | PROP_LIFE_DEC;

  el.LowPressure = IPL;
  el.LowPressureTransition = NT;
  el.HighPressure = IPH;
  el.HighPressureTransition = NT;
  el.LowTemperature = ITL;
  el.LowTemperatureTransition = NT;
  el.HighTemperature = 1687.0;
  el.HighTemperatureTransition = PT_LAVA; //@ NSCN -> LAVA(NSCN)
}
