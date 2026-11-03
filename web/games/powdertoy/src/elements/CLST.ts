// simulation/elements/CLST.cpp
import type { Element, GraphicsFuncContext, Gfx } from '../sim/element.ts';
import type { Simulation } from '../sim/simulation.ts';
import type { Particle } from '../sim/particle.ts';
import { f } from '../sim/cpp.ts';
import { CFDS, IPH, IPL, ITL, NT, SC_POWDERS, TYPE_PART, TYP, ID } from '../sim/config.ts';
import { PT_BANG, PT_CLST, PT_LAVA, PT_NITR, PT_PSTS, PT_WATR } from '../sim/numbers.ts';

export function Element_CLST(el: Element): void {
  el.Identifier = 'DEFAULT_PT_CLST';
  el.Name = 'CLST';
  el.Colour = 0xE4A4A4; // 0xE4A4A4_rgb
  el.MenuVisible = 1;
  el.MenuSection = SC_POWDERS;
  el.Enabled = 1;

  el.Advection = f(0.7);
  el.AirDrag = f(f(0.02) * CFDS);
  el.AirLoss = f(0.94);
  el.Loss = f(0.95);
  el.Collision = 0.0;
  el.Gravity = f(0.2);
  el.Diffusion = f(0.00);
  el.HotAir = f(f(0.000) * CFDS);
  el.Falldown = 1;

  el.Flammable = 0;
  el.Explosive = 0;
  el.Meltable = 2;
  el.Hardness = 2;

  el.Weight = 55;

  el.HeatConduct = 70;
  el.Description = 'Clay dust. Produces paste when mixed with water.';

  el.Properties = TYPE_PART;

  el.LowPressure = IPL;
  el.LowPressureTransition = NT;
  el.HighPressure = IPH;
  el.HighPressureTransition = NT;
  el.LowTemperature = ITL;
  el.LowTemperatureTransition = NT;
  el.HighTemperature = 1256.0;
  el.HighTemperatureTransition = PT_LAVA; //@ CLST -> LAVA(CLST)

  el.Update = update;
  el.Graphics = graphics;
  el.Create = create;
}

function update(sim: Simulation, i: number, x: number, y: number, _surround_space: number, _nt: number,
  parts: Particle[], pmap: Int32Array[]): number {
  for (let rx = -2; rx <= 2; rx++) {
    for (let ry = -2; ry <= 2; ry++) {
      if (rx || ry) {
        const r = pmap[y + ry][x + rx];
        if (!r)
          continue;
        if (TYP(r) === PT_WATR) {
          if (sim.rng.chance(1, 1500)) {
            //@ CLST + WATR -> PSTS
            sim.create_part(i, x, y, PT_PSTS);
            sim.kill_part(ID(r));
          }
        }
        else if (TYP(r) === PT_NITR) {
          //@ CLST + NITR -> 2xBANG
          sim.create_part(i, x, y, PT_BANG);
          sim.create_part(ID(r), x + rx, y + ry, PT_BANG);
        }
        else if (TYP(r) === PT_CLST) {
          let cxy: number;
          if (parts[i].temp < 195)
            cxy = f(0.05);
          else if (parts[i].temp < 295)
            cxy = f(0.015);
          else if (parts[i].temp < 350)
            cxy = f(0.01);
          else
            cxy = f(0.005);
          parts[i].vx = f(parts[i].vx + f(cxy * rx));
          parts[i].vy = f(parts[i].vy + f(cxy * ry));//These two can be set not to calculate over 350 later. They do virtually nothing over 0.005.
        }
      }
    }
  }
  return 0;
}

function graphics(_gfctx: GraphicsFuncContext, cpart: Particle, _nx: number, _ny: number, g: Gfx): number {
  const z = (cpart.tmp - 5) * 16;//speckles!
  g.colr += z;
  g.colg += z;
  g.colb += z;
  return 0;
}

function create(sim: Simulation, i: number, _x: number, _y: number, _t: number, _v: number): void {
  sim.parts[i].tmp = sim.rng.between(0, 6);
}
