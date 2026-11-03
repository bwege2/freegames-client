// simulation/elements/SWCH.cpp
import type { Element, GraphicsFuncContext, Gfx } from '../sim/element.ts';
import type { Simulation } from '../sim/simulation.ts';
import type { Particle } from '../sim/particle.ts';
import { f } from '../sim/cpp.ts';
import { CFDS, ID, IPH, IPL, ITH, ITL, NT, PMODE_GLOW, SC_ELEC, TYP, TYPE_SOLID } from '../sim/config.ts';
import { PT_BRAY, PT_INSL, PT_NSCN, PT_PSCN, PT_RSSS, PT_SPRK, PT_SWCH } from '../sim/numbers.ts';

export function Element_SWCH(el: Element): void {
  el.Identifier = 'DEFAULT_PT_SWCH';
  el.Name = 'SWCH';
  el.Colour = 0x103B11;
  el.MenuVisible = 1;
  el.MenuSection = SC_ELEC;
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
  el.Description = 'Switch. Only conducts when switched on. (PSCN switches on, NSCN switches off)';

  el.Properties = TYPE_SOLID;

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

/** static bool isRedBRAY(UPDATE_FUNC_ARGS, int xc, int yc) (static in SWCH.cpp; exported for reuse) */
export function isRedBRAY(_sim: Simulation, _i: number, _x: number, _y: number, _surround_space: number, _nt: number,
  parts: Particle[], pmap: Int32Array[], xc: number, yc: number): boolean {
  return TYP(pmap[yc][xc]) === PT_BRAY && parts[ID(pmap[yc][xc])].tmp === 2;
}

function update(sim: Simulation, i: number, x: number, y: number, surround_space: number, nt: number,
  parts: Particle[], pmap: Int32Array[]): number {
  if (parts[i].life > 0 && parts[i].life !== 10)
    parts[i].life--;
  for (let rx = -2; rx <= 2; rx++) {
    for (let ry = -2; ry <= 2; ry++) {
      if (rx || ry) {
        const r = pmap[y + ry][x + rx];
        if (!r)
          continue;
        const pavg = sim.parts_avg(i, ID(r), PT_INSL);
        if (pavg !== PT_INSL && pavg !== PT_RSSS) {
          const rt = TYP(r);
          if (rt === PT_SWCH) {
            if (parts[i].life >= 10 && parts[ID(r)].life < 10 && parts[ID(r)].life > 0)
              parts[i].life = 9;
            else if (parts[i].life === 0 && parts[ID(r)].life >= 10) {
              //Set to other particle's life instead of 10, otherwise spark loops form when SWCH is sparked while turning on
              parts[i].life = parts[ID(r)].life;
            }
          }
          else if (rt === PT_SPRK && parts[i].life === 10 && parts[ID(r)].life > 0 && parts[ID(r)].ctype !== PT_PSCN && parts[ID(r)].ctype !== PT_NSCN) {
            sim.part_change_type(i, x, y, PT_SPRK);
            parts[i].ctype = PT_SWCH;
            parts[i].life = 4;
          }
        }
      }
    }
  }
  //turn SWCH on/off from two red BRAYS. There must be one either above or below, and one either left or right to work, and it can't come from the side, it must be a diagonal beam
  if (!TYP(pmap[y - 1][x - 1]) && !TYP(pmap[y - 1][x + 1]) && (isRedBRAY(sim, i, x, y, surround_space, nt, parts, pmap, x, y - 1) || isRedBRAY(sim, i, x, y, surround_space, nt, parts, pmap, x, y + 1)) && (isRedBRAY(sim, i, x, y, surround_space, nt, parts, pmap, x + 1, y) || isRedBRAY(sim, i, x, y, surround_space, nt, parts, pmap, x - 1, y))) {
    if (parts[i].life === 10)
      parts[i].life = 9;
    else if (parts[i].life <= 5)
      parts[i].life = 14;
  }
  return 0;
}

function graphics(_gfctx: GraphicsFuncContext, cpart: Particle, _nx: number, _ny: number, g: Gfx): number {
  if (cpart.life >= 10) {
    g.colr = 17;
    g.colg = 217;
    g.colb = 24;
    g.pixel_mode |= PMODE_GLOW;
  }
  return 0;
}
