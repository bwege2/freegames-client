// simulation/elements/DESL.cpp
import type { Element } from '../sim/element.ts';
import { f } from '../sim/cpp.ts';
import { CFDS, IPL, ITL, NT, SC_LIQUID, TYPE_LIQUID } from '../sim/config.ts';
import { PT_FIRE } from '../sim/numbers.ts';

export function Element_DESL(el: Element): void {
  el.Identifier = 'DEFAULT_PT_DESL';
  el.Name = 'DESL';
  el.Colour = 0x440000;
  el.MenuVisible = 1;
  el.MenuSection = SC_LIQUID;
  el.Enabled = 1;

  el.Advection = 1.0;
  el.AirDrag = f(f(0.01) * CFDS);
  el.AirLoss = f(0.98);
  el.Loss = f(0.95);
  el.Collision = 0.0;
  el.Gravity = f(0.1);
  el.Diffusion = 0.0;
  el.HotAir = f(0.0 * CFDS);
  el.Falldown = 2;

  el.Flammable = 2;
  el.Explosive = 0;
  el.Meltable = 0;
  el.Hardness = 5;

  el.Weight = 15;

  el.HeatConduct = 42;
  el.Description = 'Liquid diesel. Explodes under high pressure and temperatures.';

  el.Properties = TYPE_LIQUID;

  el.LowPressure = IPL;
  el.LowPressureTransition = NT;
  el.HighPressure = 5.0;
  el.HighPressureTransition = PT_FIRE; //@ DESL -> FIRE
  el.LowTemperature = ITL;
  el.LowTemperatureTransition = NT;
  el.HighTemperature = 335.0;
  el.HighTemperatureTransition = PT_FIRE; //@ DESL -> FIRE
}
