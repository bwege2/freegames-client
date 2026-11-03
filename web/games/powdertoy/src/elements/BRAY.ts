// simulation/elements/BRAY.cpp
import type { Element, GraphicsFuncContext, Gfx } from '../sim/element.ts';
import type { Particle } from '../sim/particle.ts';
import { f } from '../sim/cpp.ts';
import {
  CFDS, IPH, IPL, ITH, ITL, NT, PMODE, PMODE_BLEND, PMODE_GLOW, PROP_LIFE_DEC, PROP_LIFE_KILL, SC_ELEC, TYPE_SOLID,
} from '../sim/config.ts';

export function Element_BRAY(el: Element): void {
  el.Identifier = 'DEFAULT_PT_BRAY';
  el.Name = 'BRAY';
  el.Colour = 0xFFFFFF;
  el.MenuVisible = 0;
  el.MenuSection = SC_ELEC;
  el.Enabled = 1;

  el.Advection = f(0.0);
  el.AirDrag = f(f(0.00) * CFDS);
  el.AirLoss = f(0.90);
  el.Loss = f(0.00);
  el.Collision = f(0.0);
  el.Gravity = f(0.0);
  el.Diffusion = f(0.00);
  el.HotAir = f(f(0.000) * CFDS);
  el.Falldown = 0;

  el.Flammable = 0;
  el.Explosive = 0;
  el.Meltable = 0;
  el.Hardness = 1;

  el.Weight = 100;

  el.HeatConduct = 251;
  el.Description = 'Ray Point. Rays create points when they collide.';

  el.Properties = TYPE_SOLID|PROP_LIFE_DEC|PROP_LIFE_KILL;

  el.LowPressure = IPL;
  el.LowPressureTransition = NT;
  el.HighPressure = IPH;
  el.HighPressureTransition = NT;
  el.LowTemperature = ITL;
  el.LowTemperatureTransition = NT;
  el.HighTemperature = ITH;
  el.HighTemperatureTransition = NT;

  el.DefaultProperties.life = 30;

  el.Graphics = graphics;
}

function graphics(_gfctx: GraphicsFuncContext, cpart: Particle, _nx: number, _ny: number, g: Gfx): number {
  let x: number, trans = 255;
  if (cpart.tmp === 0) {
    trans = cpart.life * 7;
    if (trans > 255) trans = 255;
    if (cpart.ctype & 0x3FFFFFFF) {
      g.colg = 0;
      g.colb = 0;
      g.colr = 0;
      for (x = 0; x < 12; x++) {
        g.colr += (cpart.ctype >> (x + 18)) & 1;
        g.colb += (cpart.ctype >> x) & 1;
      }
      for (x = 0; x < 12; x++)
        g.colg += (cpart.ctype >> (x + 9)) & 1;
      x = (624 / (g.colr + g.colg + g.colb + 1)) | 0;
      g.colr *= x;
      g.colg *= x;
      g.colb *= x;
    }
  }
  else if (cpart.tmp === 1) {
    trans = (cpart.life / 4) | 0;
    if (trans > 255) trans = 255;
    if (cpart.ctype & 0x3FFFFFFF) {
      g.colg = 0;
      g.colb = 0;
      g.colr = 0;
      for (x = 0; x < 12; x++) {
        g.colr += (cpart.ctype >> (x + 18)) & 1;
        g.colb += (cpart.ctype >> x) & 1;
      }
      for (x = 0; x < 12; x++)
        g.colg += (cpart.ctype >> (x + 9)) & 1;
      x = (624 / (g.colr + g.colg + g.colb + 1)) | 0;
      g.colr *= x;
      g.colg *= x;
      g.colb *= x;
    }
  }
  else if (cpart.tmp === 2) {
    trans = cpart.life * 100;
    if (trans > 255) trans = 255;
    g.colr = 255;
    g.colg = 150;
    g.colb = 50;
  }
  g.cola = trans;
  g.pixel_mode &= ~PMODE;
  g.pixel_mode |= PMODE_BLEND | PMODE_GLOW;
  return 0;
}
