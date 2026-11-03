// simulation/elements/LOLZ.cpp
import type { Element } from '../sim/element.ts';
import { f } from '../sim/cpp.ts';
import { CFDS, IPH, IPL, ITH, ITL, NT, SC_SPECIAL, TYPE_SOLID } from '../sim/config.ts';
import { Element_LOVE_RuleTable } from './LOVE.ts';

// LOLZ.h declares both rule tables
export { Element_LOVE_RuleTable };

export function Element_LOLZ(el: Element): void {
  el.Identifier = 'DEFAULT_PT_LOLZ';
  el.Name = 'LOLZ';
  el.Colour = 0x569212;
  el.MenuVisible = 0;
  el.MenuSection = SC_SPECIAL;
  el.Enabled = 1;

  el.Advection = f(0.0);
  el.AirDrag = f(f(0.00) * CFDS);
  el.AirLoss = f(0.00);
  el.Loss = f(0.00);
  el.Collision = f(0.0);
  el.Gravity = f(0.0);
  el.Diffusion = f(0.0);
  el.HotAir = f(f(0.000) * CFDS);
  el.Falldown = 0;

  el.Flammable = 0;
  el.Explosive = 0;
  el.Meltable = 0;
  el.Hardness = 0;

  el.Weight = 100;

  el.DefaultProperties.temp = f(373.0);
  el.HeatConduct = 40;
  el.Description = 'Lolz';

  el.Properties = TYPE_SOLID;

  el.LowPressure = IPL;
  el.LowPressureTransition = NT;
  el.HighPressure = IPH;
  el.HighPressureTransition = NT;
  el.LowTemperature = ITL;
  el.LowTemperatureTransition = NT;
  el.HighTemperature = ITH;
  el.HighTemperatureTransition = NT;
}

export const Element_LOLZ_RuleTable: readonly (readonly number[])[] = [
  [0, 0, 0, 0, 0, 0, 0, 0, 0],
  [1, 0, 0, 0, 0, 0, 1, 0, 0],
  [1, 0, 0, 0, 0, 0, 1, 0, 0],
  [1, 0, 0, 1, 1, 0, 0, 1, 0],
  [1, 0, 1, 0, 0, 1, 0, 1, 0],
  [1, 0, 1, 0, 0, 1, 0, 1, 0],
  [0, 1, 0, 1, 1, 0, 0, 1, 0],
  [0, 1, 0, 0, 0, 0, 0, 1, 0],
  [0, 1, 0, 0, 0, 0, 0, 1, 0],
];
