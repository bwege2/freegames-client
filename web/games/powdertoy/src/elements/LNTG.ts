// simulation/elements/LNTG.cpp
import type { Element } from '../sim/element.ts';
import { f } from '../sim/cpp.ts';
import { CFDS, IPH, IPL, NT, SC_LIQUID, TYPE_LIQUID } from '../sim/config.ts';
import { PT_NICE, PT_NONE } from '../sim/numbers.ts';

export function Element_LNTG(el: Element): void {
  el.Identifier = "DEFAULT_PT_LNTG";
  el.Name = "LN2";
  el.Colour = 0x80A0DF;
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

  el.Flammable = 0;
  el.Explosive = 0;
  el.Meltable = 0;
  el.Hardness = 0;

  el.Weight = 30;

  el.DefaultProperties.temp = f(70.15);
  el.HeatConduct = 70;
  el.Description = "Liquid Nitrogen. Very cold, disappears whenever it touches anything warmer.";

  el.Properties = TYPE_LIQUID;

  el.LowPressure = IPL;
  el.LowPressureTransition = NT;
  el.HighPressure = IPH;
  el.HighPressureTransition = NT;
  el.LowTemperature = 63.0;
  el.LowTemperatureTransition = PT_NICE; //@ LNTG -> NICE
  el.HighTemperature = 77.0;
  el.HighTemperatureTransition = PT_NONE;
}
