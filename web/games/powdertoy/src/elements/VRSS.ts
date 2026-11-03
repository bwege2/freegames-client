// simulation/elements/VRSS.cpp
import type { Element, GraphicsFuncContext, Gfx } from '../sim/element.ts';
import type { Particle } from '../sim/particle.ts';
import { FIELD_TMP2 } from '../sim/particle.ts';
import { f } from '../sim/cpp.ts';
import {
  CFDS, IPH, IPL, ITL, NO_DECO, NT, PROP_DEADLY, R_TEMP, SC_SOLIDS, TYPE_SOLID,
} from '../sim/config.ts';
import { PT_VIRS } from '../sim/numbers.ts';
import { Element_VIRS_update } from './VIRS.ts';

export function Element_VRSS(el: Element): void {
  el.Identifier = 'DEFAULT_PT_VRSS';
  el.Name = 'VRSS';
  el.Colour = 0xD408CD;
  el.MenuVisible = 0;
  el.MenuSection = SC_SOLIDS;
  el.Enabled = 1;

  el.Advection = 0.0;
  el.AirDrag = f(0.00 * CFDS);
  el.AirLoss = f(0.90);
  el.Loss = 0.00;
  el.Collision = 0.0;
  el.Gravity = 0.0;
  el.Diffusion = 0.00;
  el.HotAir = f(0.000 * CFDS);
  el.Falldown = 0;

  el.Flammable = 0;
  el.Explosive = 0;
  el.Meltable = 0;
  el.Hardness = 1;

  el.Weight = 100;

  el.DefaultProperties.temp = f(R_TEMP + f(273.15));
  el.HeatConduct = 251;
  el.Description = 'Solid Virus. Turns everything it touches into virus.';

  el.Properties = TYPE_SOLID | PROP_DEADLY;
  el.CarriesTypeIn = (1 << FIELD_TMP2) >>> 0;

  el.LowPressure = IPL;
  el.LowPressureTransition = NT;
  el.HighPressure = IPH;
  el.HighPressureTransition = NT;
  el.LowTemperature = ITL;
  el.LowTemperatureTransition = NT;
  el.HighTemperature = 305.0;
  el.HighTemperatureTransition = PT_VIRS; //@ VRSS -> VIRS

  el.DefaultProperties.tmp4 = 250;

  el.Update = Element_VIRS_update;
  el.Graphics = graphics;
}

function graphics(_gfctx: GraphicsFuncContext, _cpart: Particle, _nx: number, _ny: number, g: Gfx): number {
  g.pixel_mode |= NO_DECO;
  return 1;
}
