// simulation/elements/BIZR.cpp
import type { Element, GraphicsFuncContext, Gfx } from '../sim/element.ts';
import type { Simulation } from '../sim/simulation.ts';
import type { Particle } from '../sim/particle.ts';
import { f, itrunc } from '../sim/cpp.ts';
import { CFDS, FIRE_ADD, ID, IPH, IPL, NT, PMODE_BLUR, SC_LIQUID, TYP, TYPE_LIQUID } from '../sim/config.ts';
import { PT_BIZR, PT_BIZRG, PT_BIZRS } from '../sim/numbers.ts';

export function Element_BIZR(el: Element): void {
  el.Identifier = 'DEFAULT_PT_BIZR';
  el.Name = 'BIZR';
  el.Colour = 0x00FF77;
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
  el.Hardness = 20;

  el.Weight = 30;

  el.HeatConduct = 29;
  el.Description = 'Bizarre... contradicts the normal state changes. Paints other elements with its deco color.';

  el.Properties = TYPE_LIQUID;

  el.LowPressure = IPL;
  el.LowPressureTransition = NT;
  el.HighPressure = IPH;
  el.HighPressureTransition = NT;
  el.LowTemperature = f(100.0);
  el.LowTemperatureTransition = PT_BIZRG; //@ BIZR -> BIZRG
  el.HighTemperature = f(400.0);
  el.HighTemperatureTransition = PT_BIZRS; //@ BIZR -> BIZRS

  el.DefaultProperties.ctype = 0x47FFFF;

  el.Update = Element_BIZR_update;
  el.Graphics = Element_BIZR_graphics;
}

const BLEND = f(21.0);

/** std::round(float): half away from zero */
function roundf(v: number): number {
  return Math.sign(v) * Math.round(Math.abs(v));
}

export function Element_BIZR_update(_sim: Simulation, i: number, x: number, y: number, _surround_space: number, _nt: number,
  parts: Particle[], pmap: Int32Array[]): number {
  if (parts[i].dcolour) {
    for (let rx = -2; rx <= 2; rx++) {
      for (let ry = -2; ry <= 2; ry++) {
        if (rx || ry) {
          const r = pmap[y + ry][x + rx];
          if (!r)
            continue;
          if (TYP(r) !== PT_BIZR && TYP(r) !== PT_BIZRG && TYP(r) !== PT_BIZRS) {
            const tr = (parts[ID(r)].dcolour >>> 16) & 0xFF;
            const tg = (parts[ID(r)].dcolour >>> 8) & 0xFF;
            const tb = (parts[ID(r)].dcolour) & 0xFF;
            const ta = (parts[ID(r)].dcolour >>> 24) & 0xFF;

            const mr = (parts[i].dcolour >>> 16) & 0xFF;
            const mg = (parts[i].dcolour >>> 8) & 0xFF;
            const mb = (parts[i].dcolour) & 0xFF;
            const ma = (parts[i].dcolour >>> 24) & 0xFF;

            const nr = tr + ((mr > tr ? 1 : 0) - (mr < tr ? 1 : 0)) + itrunc(roundf(f((mr - tr) / BLEND)));
            const ng = tg + ((mg > tg ? 1 : 0) - (mg < tg ? 1 : 0)) + itrunc(roundf(f((mg - tg) / BLEND)));
            const nb = tb + ((mb > tb ? 1 : 0) - (mb < tb ? 1 : 0)) + itrunc(roundf(f((mb - tb) / BLEND)));
            const na = ta + ((ma > ta ? 1 : 0) - (ma < ta ? 1 : 0)) + itrunc(roundf(f((ma - ta) / BLEND)));

            parts[ID(r)].dcolour = nr << 16 | ng << 8 | nb | na << 24;
          }
        }
      }
    }
  }
  return 0;
}

export function Element_BIZR_graphics(_gfctx: GraphicsFuncContext, cpart: Particle, _nx: number, _ny: number, g: Gfx): number
//BIZR, BIZRG, BIZRS
{
  let x = 0;
  let brightness = f(Math.abs(cpart.vx) + Math.abs(cpart.vy));
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

  if (brightness > 0) {
    brightness = f(brightness / 5);
    g.firea = 255;
    g.fireg = itrunc(f(g.colg * brightness));
    g.fireb = itrunc(f(g.colb * brightness));
    g.firer = itrunc(f(g.colr * brightness));
    g.pixel_mode |= FIRE_ADD;
  }
  g.pixel_mode |= PMODE_BLUR;
  return 0;
}
