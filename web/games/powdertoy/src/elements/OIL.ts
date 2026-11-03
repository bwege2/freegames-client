// simulation/elements/OIL.cpp
import type { Element } from '../sim/element.ts';
import { f } from '../sim/cpp.ts';
import { CFDS, IPH, IPL, ITL, NT, PROP_NEUTPASS, SC_LIQUID, TYPE_LIQUID } from '../sim/config.ts';
import { PT_GAS } from '../sim/numbers.ts';

export function Element_OIL(el: Element): void {
  el.Identifier = "DEFAULT_PT_OIL";
  el.Name = "OIL";
  el.Colour = 0x404010;
  el.MenuVisible = 1;
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

  el.Flammable = 20;
  el.Explosive = 0;
  el.Meltable = 0;
  el.Hardness = 5;

  el.Weight = 20;

  el.HeatConduct = 42;
  el.Description = "Flammable, turns into GAS at low pressure or high temperature.";

  el.Properties = TYPE_LIQUID | PROP_NEUTPASS;

  el.LowPressure = IPL;
  el.LowPressureTransition = NT;
  el.HighPressure = IPH;
  el.HighPressureTransition = NT;
  el.LowTemperature = ITL;
  el.LowTemperatureTransition = NT;
  el.HighTemperature = 333.0;
  el.HighTemperatureTransition = PT_GAS; //@ OIL -> GAS
}
