// simulation/elements/GBMB.cpp
import type { Element, GraphicsFuncContext, Gfx } from '../sim/element.ts';
import type { Simulation } from '../sim/simulation.ts';
import type { Particle } from '../sim/particle.ts';
import { f } from '../sim/cpp.ts';
import {
  CELL, CFDS, IPH, IPL, ITH, ITL, NT, PMODE_FLARE, PMODE_SPARK, PROP_LIFE_DEC, PROP_LIFE_KILL_DEC, R_TEMP, SC_FORCE,
  TYPE_PART, XCELLS, TYP,
} from '../sim/config.ts';
import { PT_BOMB, PT_CLNE, PT_DMND, PT_GBMB, PT_PCLN } from '../sim/numbers.ts';

export function Element_GBMB(el: Element): void {
  el.Identifier = 'DEFAULT_PT_GBMB';
  el.Name = 'GBMB';
  el.Colour = 0x1144BB; // 0x1144BB_rgb
  el.MenuVisible = 1;
  el.MenuSection = SC_FORCE;
  el.Enabled = 1;

  el.Advection = f(0.6);
  el.AirDrag = f(f(0.01) * CFDS);
  el.AirLoss = f(0.98);
  el.Loss = f(0.95);
  el.Collision = 0.0;
  el.Gravity = f(0.1);
  el.Diffusion = f(0.00);
  el.HotAir = f(f(0.000) * CFDS);
  el.Falldown = 1;

  el.Flammable = 0;
  el.Explosive = 0;
  el.Meltable = 0;
  el.Hardness = 20;

  el.Weight = 30;

  el.DefaultProperties.temp = f(f(R_TEMP - 2.0) + f(273.15)); // R_TEMP - 2.0f + 273.15f
  el.HeatConduct = 29;
  el.Description = 'Gravity bomb. Sticks to the first object it touches then produces a strong gravity push.';

  el.Properties = TYPE_PART | PROP_LIFE_DEC | PROP_LIFE_KILL_DEC;

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
  if (parts[i].life <= 0) {
    for (let rx = -1; rx <= 1; rx++) {
      for (let ry = -1; ry <= 1; ry++) {
        const r = pmap[y + ry][x + rx];
        if (!r)
          continue;
        if (TYP(r) !== PT_BOMB && TYP(r) !== PT_GBMB &&
          TYP(r) !== PT_CLNE && TYP(r) !== PT_PCLN &&
          TYP(r) !== PT_DMND) {
          parts[i].life = 60;
          break;
        }
      }
    }
  }
  if (parts[i].life > 20) {
    sim.gravIn.mass[((y / CELL) | 0) * XCELLS + ((x / CELL) | 0)] = 20;
  }
  else if (parts[i].life >= 1) {
    sim.gravIn.mass[((y / CELL) | 0) * XCELLS + ((x / CELL) | 0)] = -80;
  }
  return 0;
}

function graphics(_gfctx: GraphicsFuncContext, cpart: Particle, _nx: number, _ny: number, g: Gfx): number {
  if (cpart.life <= 0) {
    g.pixel_mode |= PMODE_FLARE;
  }
  else {
    g.pixel_mode |= PMODE_SPARK;
  }
  return 0;
}
