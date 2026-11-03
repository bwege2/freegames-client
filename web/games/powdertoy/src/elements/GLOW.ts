// simulation/elements/GLOW.cpp
import type { Element, GraphicsFuncContext, Gfx } from '../sim/element.ts';
import type { Simulation } from '../sim/simulation.ts';
import type { Particle } from '../sim/particle.ts';
import { f, itrunc, restrict_flt } from '../sim/cpp.ts';
import {
  CELL, CFDS, FIRE_ADD, ID, IPH, IPL, ITH, ITL, NT, PMODE_ADD, PMODE_BLUR, PMODE_FLAT, PMODE_GLOW, PROP_LIFE_DEC,
  PROP_PHOTPASS, R_TEMP, SC_LIQUID, TYP, TYPE_LIQUID,
} from '../sim/config.ts';
import { PT_DEUT, PT_GEL, PT_RSST, PT_WATR } from '../sim/numbers.ts';

export function Element_GLOW(el: Element): void {
  el.Identifier = 'DEFAULT_PT_GLOW';
  el.Name = 'GLOW';
  el.Colour = 0x445464;
  el.MenuVisible = 1;
  el.MenuSection = SC_LIQUID;
  el.Enabled = 1;

  el.Advection = f(0.3);
  el.AirDrag = f(f(0.02) * CFDS);
  el.AirLoss = f(0.98);
  el.Loss = f(0.80);
  el.Collision = 0.0;
  el.Gravity = f(0.15);
  el.Diffusion = f(0.00);
  el.HotAir = f(f(0.000) * CFDS);
  el.Falldown = 2;

  el.Flammable = 0;
  el.Explosive = 0;
  el.Meltable = 0;
  el.Hardness = 2;

  el.Weight = 40;

  el.DefaultProperties.temp = f(f(R_TEMP + 20.0) + f(273.15));
  el.HeatConduct = 44;
  el.Description = 'Glow, Glows under pressure.';

  el.Properties = TYPE_LIQUID | PROP_PHOTPASS | PROP_LIFE_DEC;

  el.LowPressure = IPL;
  el.LowPressureTransition = NT;
  el.HighPressure = IPH;
  el.HighPressureTransition = NT;
  el.LowTemperature = ITL;
  el.LowTemperatureTransition = NT;
  el.HighTemperature = ITH;
  el.HighTemperatureTransition = NT;

  el.Update = update;
  el.Graphics = graphics;
}

function update(sim: Simulation, i: number, x: number, y: number, _surround_space: number, _nt: number,
  parts: Particle[], pmap: Int32Array[]): number {
  for (let rx = -1; rx <= 1; rx++) {
    for (let ry = -1; ry <= 1; ry++) {
      if (rx || ry) {
        const r = pmap[y + ry][x + rx];
        if (!r)
          continue;
        if (TYP(r) === PT_WATR && sim.rng.chance(1, 400)) {
          //@ GLOW + WATR -> DEUT
          sim.kill_part(i);
          sim.part_change_type(ID(r), x + rx, y + ry, PT_DEUT);
          parts[ID(r)].life = 10;
          return 1;
        }
        else if (TYP(r) === PT_GEL) {
          //@ GLOW + GEL -> RSST
          sim.kill_part(i);
          sim.part_change_type(ID(r), x + rx, y + ry, PT_RSST);
          parts[ID(r)].tmp = 0;
          return 1;
        }
      }
    }
  }
  const cx = (x / CELL) | 0, cy = (y / CELL) | 0;
  let ctype = itrunc(f(sim.pv[cy][cx] * 16));
  if (ctype < 0)
    ctype = 0;
  parts[i].ctype = ctype;
  parts[i].tmp = Math.abs(itrunc(f(f(sim.vx[cy][cx] + sim.vy[cy][cx]) * 16.0))) + Math.abs(itrunc(f(f(parts[i].vx + parts[i].vy) * 64.0)));
  return 0;
}

function graphics(gfctx: GraphicsFuncContext, cpart: Particle, _nx: number, _ny: number, g: Gfx): number {
  g.firer = 16 + itrunc(f(restrict_flt(f(cpart.temp - f(f(273.15) + 34.0)), 0, 128) / 2.0));
  g.fireg = 16 + itrunc(f(restrict_flt(f(cpart.ctype), 0, 128) / 2.0));
  g.fireb = 16 + itrunc(f(restrict_flt(f(cpart.tmp), 0, 128) / 2.0));
  g.firea = 64;
  g.colr = itrunc(restrict_flt(f(f(64.0 + cpart.temp) - f(f(273.15) + 34.0)), 0, 255));
  g.colg = itrunc(restrict_flt(f(64.0 + f(cpart.ctype)), 0, 255));
  g.colb = itrunc(restrict_flt(f(64.0 + f(cpart.tmp)), 0, 255));
  const rng = gfctx.rng.between(1, 32); //
  if (((g.colr) + (g.colg) + (g.colb)) > (256 + rng)) {
    g.colr -= 54;
    g.colg -= 54;
    g.colb -= 54;
    g.pixel_mode |= FIRE_ADD;
    g.pixel_mode |= PMODE_GLOW | PMODE_ADD;
    g.pixel_mode &= ~PMODE_FLAT;
  } else {
    g.pixel_mode |= PMODE_BLUR;
  }
  return 0;
}
