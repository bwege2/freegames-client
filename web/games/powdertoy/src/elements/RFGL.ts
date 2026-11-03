// simulation/elements/RFGL.cpp
import type { Element } from '../sim/element.ts';
import { f } from '../sim/cpp.ts';
import { CFDS, IPH, ITH, ITL, NT, PROP_DEADLY, SC_LIQUID, TYPE_LIQUID } from '../sim/config.ts';
import { PT_RFRG } from '../sim/numbers.ts';
import { Element_RFRG_update } from './RFRG.ts';

export function Element_RFGL(el: Element): void {
  el.Identifier = 'DEFAULT_PT_RFGL';
  el.Name = 'RFGL';
  el.Colour = 0x84C2CF;
  el.MenuVisible = 0;
  el.MenuSection = SC_LIQUID;
  el.Enabled = 1;

  el.Advection = f(0.6);
  el.AirDrag = f(f(0.01) * CFDS);
  el.AirLoss = f(0.98);
  el.Loss = f(0.95);
  el.Collision = 0.0;
  el.Gravity = f(0.1);
  el.Diffusion = 0.00;
  el.HotAir = f(0.000 * CFDS);
  el.Falldown = 2;

  el.Flammable = 0;
  el.Explosive = 0;
  el.Meltable = 0;
  el.Hardness = 21;

  el.Weight = 10;

  el.HeatConduct = 3;
  el.Description = 'Liquid refrigerant.';

  el.Properties = TYPE_LIQUID | PROP_DEADLY;

  el.LowPressure = 2;
  el.LowPressureTransition = PT_RFRG; //@ RFGL -> RFRG
  el.HighPressure = IPH;
  el.HighPressureTransition = NT;
  el.LowTemperature = ITL;
  el.LowTemperatureTransition = NT;
  el.HighTemperature = ITH;
  el.HighTemperatureTransition = NT;

  el.Update = Element_RFRG_update;
}
