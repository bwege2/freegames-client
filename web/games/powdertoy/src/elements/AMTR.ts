// simulation/elements/AMTR.cpp
import type { Element, GraphicsFuncContext, Gfx } from '../sim/element.ts';
import type { Simulation } from '../sim/simulation.ts';
import type { Particle } from '../sim/particle.ts';
import { f } from '../sim/cpp.ts';
import { CELL, CFDS, ID, IPH, IPL, ITH, ITL, NT, SC_NUCLEAR, TYP, TYPE_GAS } from '../sim/config.ts';
import {
  PT_AMTR, PT_BHOL, PT_CLNE, PT_DMND, PT_NBHL, PT_PCLN, PT_PHOT, PT_PRTI, PT_PRTO, PT_VOID,
} from '../sim/numbers.ts';

export function Element_AMTR(el: Element): void {
  el.Identifier = 'DEFAULT_PT_AMTR';
  el.Name = 'AMTR';
  el.Colour = 0x808080;
  el.MenuVisible = 1;
  el.MenuSection = SC_NUCLEAR;
  el.Enabled = 1;

  el.Advection = f(0.7);
  el.AirDrag = f(f(0.02) * CFDS);
  el.AirLoss = f(0.96);
  el.Loss = f(0.80);
  el.Collision = f(0.00);
  el.Gravity = f(0.10);
  el.Diffusion = f(1.00);
  el.HotAir = f(f(0.0000) * CFDS);
  el.Falldown = 0;

  el.Flammable = 0;
  el.Explosive = 0;
  el.Meltable = 0;
  el.Hardness = 0;

  el.Weight = 100;

  el.HeatConduct = 70;
  el.Description = 'Anti-Matter, destroys a majority of particles.';

  el.Properties = TYPE_GAS;

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
        const rt = TYP(r);
        if (rt !== PT_AMTR && rt !== PT_DMND && rt !== PT_CLNE && rt !== PT_PCLN && rt !== PT_VOID && rt !== PT_BHOL && rt !== PT_NBHL && rt !== PT_PRTI && rt !== PT_PRTO) {
          parts[i].life++;
          if (parts[i].life === 4) {
            sim.kill_part(i);
            return 1;
          }
          //@ AMTR + anything -> AMTR + PHOT
          if (sim.rng.chance(1, 10))
            sim.create_part(ID(r), x + rx, y + ry, PT_PHOT);
          else
            sim.kill_part(ID(r));
          sim.pv[(y / CELL) | 0][(x / CELL) | 0] -= 2.0;
        }
      }
    }
  }
  return 0;
}

function graphics(_gfctx: GraphicsFuncContext, _cpart: Particle, _nx: number, _ny: number, _g: Gfx): number {
  // don't render AMTR as a gas
  // this function just overrides the default graphics
  return 1;
}
