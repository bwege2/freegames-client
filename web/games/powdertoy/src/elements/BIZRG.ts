// simulation/elements/BIZRG.cpp
import type { Element } from '../sim/element.ts';
import { f } from '../sim/cpp.ts';
import { CFDS, IPH, IPL, ITL, NT, R_TEMP, SC_GAS, TYPE_GAS } from '../sim/config.ts';
import { PT_BIZR } from '../sim/numbers.ts';
import { Element_BIZR_graphics, Element_BIZR_update } from './BIZR.ts';

export function Element_BIZRG(el: Element): void {
  el.Identifier = 'DEFAULT_PT_BIZRG';
  el.Name = 'BIZG';
  el.Colour = 0x00FFBB;
  el.MenuVisible = 0;
  el.MenuSection = SC_GAS;
  el.Enabled = 1;

  el.Advection = f(1.0);
  el.AirDrag = f(f(0.01) * CFDS);
  el.AirLoss = f(0.99);
  el.Loss = f(0.30);
  el.Collision = f(-0.1);
  el.Gravity = f(0.0);
  el.Diffusion = f(2.75);
  el.HotAir = f(f(0.000) * CFDS);
  el.Falldown = 0;

  el.Flammable = 0;
  el.Explosive = 0;
  el.Meltable = 0;
  el.Hardness = 1;

  el.Weight = 1;

  el.DefaultProperties.temp = f(f(R_TEMP - f(200.0)) + f(273.15));
  el.HeatConduct = 42;
  el.Description = 'Bizarre gas.';

  el.Properties = TYPE_GAS;

  el.LowPressure = IPL;
  el.LowPressureTransition = NT;
  el.HighPressure = IPH;
  el.HighPressureTransition = NT;
  el.LowTemperature = ITL;
  el.LowTemperatureTransition = NT;
  el.HighTemperature = f(100.0);
  el.HighTemperatureTransition = PT_BIZR; //@ BIZRG -> BIZR

  el.DefaultProperties.ctype = 0x47FFFF;

  el.Update = Element_BIZR_update;
  el.Graphics = Element_BIZR_graphics;
}
