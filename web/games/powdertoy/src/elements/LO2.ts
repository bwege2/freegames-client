// simulation/elements/LO2.cpp
import type { Element } from '../sim/element.ts';
import { f } from '../sim/cpp.ts';
import { CFDS, IPH, IPL, ITL, NT, SC_LIQUID, TYPE_LIQUID } from '../sim/config.ts';
import { PT_O2 } from '../sim/numbers.ts';

export function Element_LO2(el: Element): void {
  el.Identifier = 'DEFAULT_PT_LO2';
  el.Name = 'LOXY';
  el.Colour = 0x80A0EF;
  el.MenuVisible = 1;
  el.MenuSection = SC_LIQUID;
  el.Enabled = 1;

  el.Advection = f(0.6);
  el.AirDrag = f(f(0.01) * CFDS);
  el.AirLoss = f(0.98);
  el.Loss = f(0.95);
  el.Collision = 0.0;
  el.Gravity = f(0.1);
  el.Diffusion = f(0.00);
  el.HotAir = f(f(0.000) * CFDS);
  el.Falldown = 2;

  el.Flammable = 5000;
  el.Explosive = 0;
  el.Meltable = 0;
  el.Hardness = 0;

  el.Weight = 30;

  el.DefaultProperties.temp = 80.0;
  el.HeatConduct = 70;
  el.Description = 'Liquid Oxygen. Very cold. Reacts with fire.';

  el.Properties = TYPE_LIQUID;

  el.LowPressure = IPL;
  el.LowPressureTransition = NT;
  el.HighPressure = IPH;
  el.HighPressureTransition = NT;
  el.LowTemperature = ITL;
  el.LowTemperatureTransition = NT;
  el.HighTemperature = f(90.1);
  el.HighTemperatureTransition = PT_O2; //@ LO2 -> O2
}
