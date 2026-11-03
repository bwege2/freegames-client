// simulation/elements/FIRW.cpp
import { sd } from '../sim/simulationData.ts';
import type { Element, GraphicsFuncContext, Gfx } from '../sim/element.ts';
import type { Simulation } from '../sim/simulation.ts';
import type { Particle } from '../sim/particle.ts';
import { f } from '../sim/cpp.ts';
import { firwTableAt } from '../sim/colour.ts';
import {
  CELL, CFDS, FLAG_STAGNANT, IPH, IPL, ITH, ITL, NT, PMODE_GLOW, PROP_LIFE_DEC, SC_EXPLOSIVE, TYP, TYPE_PART,
} from '../sim/config.ts';
import { PT_EMBR, PT_FIRE, PT_FIRW, PT_PLSM, PT_THDR } from '../sim/numbers.ts';

export function Element_FIRW(el: Element): void {
  el.Identifier = 'DEFAULT_PT_FIRW';
  el.Name = 'FIRW';
  el.Colour = 0xFFA040;
  el.MenuVisible = 1;
  el.MenuSection = SC_EXPLOSIVE;
  el.Enabled = 1;

  el.Advection = f(0.2);
  el.AirDrag = f(f(0.01) * CFDS);
  el.AirLoss = f(0.96);
  el.Loss = f(0.95);
  el.Collision = f(-0.1);
  el.Gravity = f(0.1);
  el.Diffusion = f(0.00);
  el.HotAir = f(f(0.000) * CFDS);
  el.Falldown = 1;

  el.Flammable = 0;
  el.Explosive = 0;
  el.Meltable = 0;
  el.Hardness = 28;

  el.Weight = 55;

  el.HeatConduct = 70;
  el.Description = 'Fireworks! Colorful, set off by fire.';

  el.Properties = TYPE_PART | PROP_LIFE_DEC;

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
  const elements = sd.elements;
  if (parts[i].tmp <= 0) {
    for (let rx = -1; rx <= 1; rx++) {
      for (let ry = -1; ry <= 1; ry++) {
        if (rx || ry) {
          const r = pmap[y + ry][x + rx];
          if (!r)
            continue;
          const rt = TYP(r);
          if (rt === PT_FIRE || rt === PT_PLSM || rt === PT_THDR) {
            const grav = { x: 0, y: 0 };
            sim.GetGravityField(x, y, elements[PT_FIRW].Gravity, 1.0, grav);
            let gx = f(grav.x), gy = f(grav.y);
            if (f(f(gx * gx) + f(gy * gy)) < f(0.001)) {
              const angle = f(sim.rng.between(0, 6283) * f(0.001));//(in radians, between 0 and 2*pi)
              gx = f(gx + f(f(f(Math.sin(angle)) * elements[PT_FIRW].Gravity) * 0.5));
              gy = f(gy + f(f(f(Math.cos(angle)) * elements[PT_FIRW].Gravity) * 0.5));
            }
            parts[i].tmp = 1;
            parts[i].life = sim.rng.between(20, 29);
            const multiplier = f(f((parts[i].life + 20) * f(0.2)) / f(Math.sqrt(f(f(gx * gx) + f(gy * gy)))));
            parts[i].vx -= f(gx * multiplier);
            parts[i].vy -= f(gy * multiplier);
            return 0;
          }
        }
      }
    }
  }
  else if (parts[i].tmp === 1) {
    if (parts[i].life <= 0) {
      parts[i].tmp = 2;
    } else {
      parts[i].flags &= ~FLAG_STAGNANT;
    }
  }
  else //if (parts[i].tmp>=2)
  {
    const col = firwTableAt(sim.rng.between(0, 199)) >>> 0;
    for (let n = 0; n < 40; n++) {
      //@ FIRW -> EMBR
      const np = sim.create_part(-3, x, y, PT_EMBR);
      if (np > -1) {
        const magnitude = f(sim.rng.between(40, 99) * f(0.05));
        const angle = f(sim.rng.between(0, 6283) * f(0.001));//(in radians, between 0 and 2*pi)
        parts[np].vx = f(parts[i].vx * 0.5) + f(f(Math.cos(angle)) * magnitude);
        parts[np].vy = f(parts[i].vy * 0.5) + f(f(Math.sin(angle)) * magnitude);
        parts[np].ctype = col;
        parts[np].tmp = 1;
        parts[np].life = sim.rng.between(70, 109);
        parts[np].temp = sim.rng.between(5750, 6249);
        parts[np].dcolour = parts[i].dcolour;
      }
    }
    sim.pv[(y / CELL) | 0][(x / CELL) | 0] += 8.0;
    sim.kill_part(i);
    return 1;
  }
  return 0;
}

function graphics(_gfctx: GraphicsFuncContext, cpart: Particle, _nx: number, _ny: number, g: Gfx): number {
  if (cpart.tmp > 0) {
    g.pixel_mode |= PMODE_GLOW;
  }
  return 0;
}
