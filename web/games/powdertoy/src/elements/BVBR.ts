// simulation/elements/BVBR.cpp
import type { Element } from '../sim/element.ts';
import { f } from '../sim/cpp.ts';
import { CFDS, IPH, IPL, ITH, ITL, NT, PROP_LIFE_DEC, SC_NUCLEAR, TYPE_PART } from '../sim/config.ts';
import { Element_VIBR_graphics, Element_VIBR_update } from './VIBR.ts';

export function Element_BVBR(el: Element): void {
  el.Identifier = 'DEFAULT_PT_BVBR';
  el.Name = 'BVBR';
  el.Colour = 0x005000;
  el.MenuVisible = 1;
  el.MenuSection = SC_NUCLEAR;
  el.Enabled = 1;

  el.Advection = f(0.3);
  el.AirDrag = f(f(0.02) * CFDS);
  el.AirLoss = f(0.95);
  el.Loss = f(0.80);
  el.Collision = 0.0;
  el.Gravity = f(0.15);
  el.Diffusion = 0.00;
  el.HotAir = f(0.0000 * CFDS);
  el.Falldown = 1;

  el.Flammable = 0;
  el.Explosive = 0;
  el.Meltable = 0;
  el.Hardness = 0;

  el.Weight = 67;

  el.DefaultProperties.temp = f(273.15);
  el.HeatConduct = 164;
  el.Description = 'Broken vibranium.';

  el.Properties = TYPE_PART | PROP_LIFE_DEC;

  el.LowPressure = IPL;
  el.LowPressureTransition = NT;
  el.HighPressure = IPH;
  el.HighPressureTransition = NT;
  el.LowTemperature = ITL;
  el.LowTemperatureTransition = NT;
  el.HighTemperature = ITH;
  el.HighTemperatureTransition = NT;

  el.Update = Element_VIBR_update;
  el.Graphics = Element_VIBR_graphics;
}
