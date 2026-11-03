// simulation/elements/SMKE.cpp
import type { Element, GraphicsFuncContext, Gfx } from '../sim/element.ts';
import type { Particle } from '../sim/particle.ts';
import { f } from '../sim/cpp.ts';
import {
  CFDS, FIRE_BLEND, IPH, IPL, ITL, NT, PMODE_NONE, PROP_LIFE_DEC, PROP_LIFE_KILL_DEC, R_TEMP, SC_GAS, TYPE_GAS,
} from '../sim/config.ts';
import { PT_FIRE } from '../sim/numbers.ts';

export function Element_SMKE(el: Element): void {
  el.Identifier = 'DEFAULT_PT_SMKE';
  el.Name = 'SMKE';
  el.Colour = 0x222222;
  el.MenuVisible = 1;
  el.MenuSection = SC_GAS;
  el.Enabled = 1;

  el.Advection = f(0.9);
  el.AirDrag = f(f(0.04) * CFDS);
  el.AirLoss = f(0.97);
  el.Loss = f(0.20);
  el.Collision = 0.0;
  el.Gravity = f(-0.1);
  el.Diffusion = f(0.00);
  el.HotAir = f(f(0.001) * CFDS);
  el.Falldown = 1;

  el.Flammable = 0;
  el.Explosive = 0;
  el.Meltable = 0;
  el.Hardness = 1;

  el.Weight = 1;

  el.DefaultProperties.temp = f(f(R_TEMP + 320.0) + f(273.15));
  el.HeatConduct = 88;
  el.Description = 'Smoke, created by fire.';

  el.Properties = TYPE_GAS | PROP_LIFE_DEC | PROP_LIFE_KILL_DEC;

  el.LowPressure = IPL;
  el.LowPressureTransition = NT;
  el.HighPressure = IPH;
  el.HighPressureTransition = NT;
  el.LowTemperature = ITL;
  el.LowTemperatureTransition = NT;
  el.HighTemperature = 625.0;
  el.HighTemperatureTransition = PT_FIRE; //@ SMKE -> FIRE

  el.Graphics = graphics;
}

function graphics(_gfctx: GraphicsFuncContext, _cpart: Particle, _nx: number, _ny: number, g: Gfx): number {
  g.colr = 55;
  g.colg = 55;
  g.colb = 55;

  g.firea = 75;
  g.firer = 55;
  g.fireg = 55;
  g.fireb = 55;

  g.pixel_mode = PMODE_NONE; //Clear default, don't draw pixel
  g.pixel_mode |= FIRE_BLEND;
  //Returning 1 means static, cache as we please
  return 1;
}
