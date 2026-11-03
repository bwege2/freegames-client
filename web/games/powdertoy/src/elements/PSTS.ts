// simulation/elements/PSTS.cpp
import type { Element } from '../sim/element.ts';
import { f } from '../sim/cpp.ts';
import { CFDS, IPH, ITH, ITL, NT, R_TEMP, SC_SOLIDS, TYPE_SOLID } from '../sim/config.ts';
import { PT_PSTE } from '../sim/numbers.ts';

export function Element_PSTS(el: Element): void {
  el.Identifier = 'DEFAULT_PT_PSTS';
  el.Name = 'PSTS';
  el.Colour = 0x776677;
  el.MenuVisible = 0;
  el.MenuSection = SC_SOLIDS;
  el.Enabled = 1;

  el.Advection = f(0.0);
  el.AirDrag = f(f(0.00) * CFDS);
  el.AirLoss = f(0.00);
  el.Loss = f(0.00);
  el.Collision = f(0.0);
  el.Gravity = f(0.0);
  el.Diffusion = f(0.00);
  el.HotAir = f(f(0.000) * CFDS);
  el.Falldown = 0;

  el.Flammable = 0;
  el.Explosive = 0;
  el.Meltable = 0;
  el.Hardness = 18;

  el.Weight = 100;

  el.DefaultProperties.temp = f(f(R_TEMP - f(2.0)) + f(273.15));
  el.HeatConduct = 29;
  el.Description = 'Solid form of PSTE.';

  el.Properties = TYPE_SOLID;

  el.LowPressure = f(0.5);
  el.LowPressureTransition = PT_PSTE; //@ PSTS -> PSTE
  el.HighPressure = IPH;
  el.HighPressureTransition = NT;
  el.LowTemperature = ITL;
  el.LowTemperatureTransition = NT;
  el.HighTemperature = ITH;
  el.HighTemperatureTransition = NT;
}
