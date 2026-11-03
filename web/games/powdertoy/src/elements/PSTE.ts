// simulation/elements/PSTE.cpp
import type { Element } from '../sim/element.ts';
import { f } from '../sim/cpp.ts';
import { CFDS, IPL, ITL, NT, R_TEMP, SC_LIQUID, TYPE_LIQUID } from '../sim/config.ts';
import { PT_BRCK, PT_PSTS } from '../sim/numbers.ts';

export function Element_PSTE(el: Element): void {
  el.Identifier = 'DEFAULT_PT_PSTE';
  el.Name = 'PSTE';
  el.Colour = 0xAA99AA;
  el.MenuVisible = 1;
  el.MenuSection = SC_LIQUID;
  el.Enabled = 1;

  el.Advection = f(0.6);
  el.AirDrag = f(f(0.01) * CFDS);
  el.AirLoss = f(0.98);
  el.Loss = f(0.95);
  el.Collision = f(0.0);
  el.Gravity = f(0.1);
  el.Diffusion = f(0.00);
  el.HotAir = f(f(0.000) * CFDS);
  el.Falldown = 2;

  el.Flammable = 0;
  el.Explosive = 0;
  el.Meltable = 0;
  el.Hardness = 18;

  el.Weight = 31;

  el.DefaultProperties.temp = f(f(R_TEMP - f(2.0)) + f(273.15));
  el.HeatConduct = 29;
  el.Description = 'Colloid, Hardens under pressure.';

  el.Properties = TYPE_LIQUID;

  el.LowPressure = IPL;
  el.LowPressureTransition = NT;
  el.HighPressure = f(0.5);
  el.HighPressureTransition = PT_PSTS; //@ PSTE -> PSTS
  el.LowTemperature = ITL;
  el.LowTemperatureTransition = NT;
  el.HighTemperature = f(747.0);
  el.HighTemperatureTransition = PT_BRCK; //@ PSTE -> BRCK
}
