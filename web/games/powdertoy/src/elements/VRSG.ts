// simulation/elements/VRSG.cpp
import type { Element, GraphicsFuncContext, Gfx } from '../sim/element.ts';
import type { Particle } from '../sim/particle.ts';
import { FIELD_TMP2 } from '../sim/particle.ts';
import { f, idiv } from '../sim/cpp.ts';
import {
  CFDS, FIRE_BLEND, IPH, IPL, ITH, NO_DECO, NT, PMODE, PROP_DEADLY, SC_GAS, TYPE_GAS,
} from '../sim/config.ts';
import { PT_VIRS } from '../sim/numbers.ts';
import { Element_VIRS_update } from './VIRS.ts';

export function Element_VRSG(el: Element): void {
  el.Identifier = 'DEFAULT_PT_VRSG';
  el.Name = 'VRSG';
  el.Colour = 0xFE68FE;
  el.MenuVisible = 0;
  el.MenuSection = SC_GAS;
  el.Enabled = 1;

  el.Advection = 1.0;
  el.AirDrag = f(f(0.01) * CFDS);
  el.AirLoss = f(0.99);
  el.Loss = f(0.30);
  el.Collision = f(-0.1);
  el.Gravity = 0.0;
  el.Diffusion = f(0.75);
  el.HotAir = f(0.000 * CFDS);
  el.Falldown = 0;

  el.Flammable = 500;
  el.Explosive = 0;
  el.Meltable = 0;
  el.Hardness = 0;

  el.Weight = 1;

  el.DefaultProperties.temp = f(522.0 + f(273.15));
  el.HeatConduct = 251;
  el.Description = 'Gas Virus. Turns everything it touches into virus.';

  el.Properties = TYPE_GAS | PROP_DEADLY;
  el.CarriesTypeIn = (1 << FIELD_TMP2) >>> 0;

  el.LowPressure = IPL;
  el.LowPressureTransition = NT;
  el.HighPressure = IPH;
  el.HighPressureTransition = NT;
  el.LowTemperature = 673.0;
  el.LowTemperatureTransition = PT_VIRS; //@ VRSG -> VIRS
  el.HighTemperature = ITH;
  el.HighTemperatureTransition = NT;

  el.DefaultProperties.tmp4 = 250;

  el.Update = Element_VIRS_update;
  el.Graphics = graphics;
}

function graphics(_gfctx: GraphicsFuncContext, _cpart: Particle, _nx: number, _ny: number, g: Gfx): number {
  g.pixel_mode &= ~PMODE;
  g.pixel_mode |= FIRE_BLEND;
  g.firer = idiv(g.colr, 2);
  g.fireg = idiv(g.colg, 2);
  g.fireb = idiv(g.colb, 2);
  g.firea = 125;
  g.pixel_mode |= NO_DECO;
  return 1;
}
