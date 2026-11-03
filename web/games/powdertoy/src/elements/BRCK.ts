// simulation/elements/BRCK.cpp
import type { Element, GraphicsFuncContext, Gfx } from '../sim/element.ts';
import type { Particle } from '../sim/particle.ts';
import { f } from '../sim/cpp.ts';
import { CFDS, FIRE_ADD, IPL, ITL, NT, PROP_HOT_GLOW, SC_SOLIDS, TYPE_SOLID } from '../sim/config.ts';
import { PT_LAVA, PT_STNE } from '../sim/numbers.ts';

export function Element_BRCK(el: Element): void {
  el.Identifier = 'DEFAULT_PT_BRCK';
  el.Name = 'BRCK';
  el.Colour = 0x808080;
  el.MenuVisible = 1;
  el.MenuSection = SC_SOLIDS;
  el.Enabled = 1;

  el.Advection = 0.0;
  el.AirDrag = f(f(0.00) * CFDS);
  el.AirLoss = f(0.90);
  el.Loss = f(0.00);
  el.Collision = 0.0;
  el.Gravity = 0.0;
  el.Diffusion = f(0.00);
  el.HotAir = f(f(0.000) * CFDS);
  el.Falldown = 0;

  el.Flammable = 0;
  el.Explosive = 0;
  el.Meltable = 0;
  el.Hardness = 1;

  el.Weight = 100;

  el.HeatConduct = 251;
  el.Description = 'Brick, breakable building material.';

  el.Properties = TYPE_SOLID | PROP_HOT_GLOW;

  el.LowPressure = IPL;
  el.LowPressureTransition = NT;
  el.HighPressure = f(8.8);
  el.HighPressureTransition = PT_STNE; //@ BRCK -> STNE
  el.LowTemperature = ITL;
  el.LowTemperatureTransition = NT;
  el.HighTemperature = 1223.0;
  el.HighTemperatureTransition = PT_LAVA; //@ BRCK -> LAVA(BRCK)

  el.Graphics = graphics;
}

function graphics(_gfctx: GraphicsFuncContext, cpart: Particle, _nx: number, _ny: number, g: Gfx): number {
  if (cpart.tmp === 1) {
    g.pixel_mode |= FIRE_ADD;
    g.colb += 100;
    g.firea = 40;
    g.firer = g.colr;
    g.fireg = g.colg;
    g.fireb = g.colb;
  }
  return 0;
}
