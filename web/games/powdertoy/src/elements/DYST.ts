// simulation/elements/DYST.cpp
import type { Element } from '../sim/element.ts';
import { f } from '../sim/cpp.ts';
import { CFDS, IPH, IPL, ITL, NT, SC_POWDERS, TYPE_PART } from '../sim/config.ts';
import { PT_DUST } from '../sim/numbers.ts';

export function Element_DYST(el: Element): void {
  el.Identifier = 'DEFAULT_PT_DYST';
  el.Name = 'DYST';
  el.Colour = 0xBBB0A0;
  el.MenuVisible = 0;
  el.MenuSection = SC_POWDERS;
  el.Enabled = 1;

  el.Advection = f(0.7);
  el.AirDrag = f(f(0.02) * CFDS);
  el.AirLoss = f(0.96);
  el.Loss = f(0.80);
  el.Collision = 0.0;
  el.Gravity = f(0.1);
  el.Diffusion = f(0.00);
  el.HotAir = f(f(0.000) * CFDS);
  el.Falldown = 1;

  el.Flammable = 20;
  el.Explosive = 0;
  el.Meltable = 0;
  el.Hardness = 30;

  el.Weight = 80;

  el.HeatConduct = 70;
  el.Description = 'Dead Yeast.';

  el.Properties = TYPE_PART;

  el.LowPressure = IPL;
  el.LowPressureTransition = NT;
  el.HighPressure = IPH;
  el.HighPressureTransition = NT;
  el.LowTemperature = ITL;
  el.LowTemperatureTransition = NT;
  el.HighTemperature = 473.0;
  el.HighTemperatureTransition = PT_DUST; //@ DYST -> DUST
}
