// simulation/elements/GAS.cpp
import type { Element } from '../sim/element.ts';
import { f } from '../sim/cpp.ts';
import { CFDS, IPL, ITL, NT, PROP_NEUTPASS, R_TEMP, SC_GAS, TYPE_GAS } from '../sim/config.ts';
import { PT_FIRE, PT_OIL } from '../sim/numbers.ts';

export function Element_GAS(el: Element): void {
  el.Identifier = "DEFAULT_PT_GAS";
  el.Name = "GAS";
  el.Colour = 0xE0FF20;
  el.MenuVisible = 1;
  el.MenuSection = SC_GAS;
  el.Enabled = 1;

  el.Advection = 1.0;
  el.AirDrag = f(f(0.01) * CFDS);
  el.AirLoss = f(0.99);
  el.Loss = f(0.30);
  el.Collision = f(-0.1);
  el.Gravity = 0.0;
  el.Diffusion = 0.75;
  el.HotAir = f(f(0.001) * CFDS);
  el.Falldown = 0;

  el.Flammable = 600;
  el.Explosive = 0;
  el.Meltable = 0;
  el.Hardness = 1;

  el.Weight = 1;

  el.DefaultProperties.temp = f(f(R_TEMP + 2.0) + f(273.15));
  el.HeatConduct = 42;
  el.Description = "Diffuses quickly and is flammable. Liquefies into OIL under pressure.";

  el.Properties = TYPE_GAS | PROP_NEUTPASS;

  el.LowPressure = IPL;
  el.LowPressureTransition = NT;
  el.HighPressure = 6.0;
  el.HighPressureTransition = PT_OIL; //@ GAS -> OIL
  el.LowTemperature = ITL;
  el.LowTemperatureTransition = NT;
  el.HighTemperature = 573.0;
  el.HighTemperatureTransition = PT_FIRE; //@ GAS -> FIRE
}
