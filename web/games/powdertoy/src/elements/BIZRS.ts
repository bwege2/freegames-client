// simulation/elements/BIZRS.cpp
import type { Element } from '../sim/element.ts';
import { f } from '../sim/cpp.ts';
import { CFDS, IPH, IPL, ITH, NT, R_TEMP, SC_SOLIDS, TYPE_SOLID } from '../sim/config.ts';
import { PT_BIZR } from '../sim/numbers.ts';
import { Element_BIZR_graphics, Element_BIZR_update } from './BIZR.ts';

export function Element_BIZRS(el: Element): void {
  el.Identifier = 'DEFAULT_PT_BIZRS';
  el.Name = 'BIZS';
  el.Colour = 0x00E455;
  el.MenuVisible = 0;
  el.MenuSection = SC_SOLIDS;
  el.Enabled = 1;

  el.Advection = f(0.0);
  el.AirDrag = f(f(0.00) * CFDS);
  el.AirLoss = f(0.90);
  el.Loss = f(0.00);
  el.Collision = f(0.0);
  el.Gravity = f(0.0);
  el.Diffusion = f(0.00);
  el.HotAir = f(f(0.000) * CFDS);
  el.Falldown = 0;

  el.Flammable = 0;
  el.Explosive = 0;
  el.Meltable = 0;
  el.Hardness = 1;

  el.Weight = 100;

  el.DefaultProperties.temp = f(f(R_TEMP + f(300.0)) + f(273.15));
  el.HeatConduct = 251;
  el.Description = 'Bizarre solid.';

  el.Properties = TYPE_SOLID;

  el.LowPressure = IPL;
  el.LowPressureTransition = NT;
  el.HighPressure = IPH;
  el.HighPressureTransition = NT;
  el.LowTemperature = f(400.0);
  el.LowTemperatureTransition = PT_BIZR; //@ BIZRS -> BIZR
  el.HighTemperature = ITH;
  el.HighTemperatureTransition = NT;

  el.DefaultProperties.ctype = 0x47FFFF;

  el.Update = Element_BIZR_update;
  el.Graphics = Element_BIZR_graphics;
}
