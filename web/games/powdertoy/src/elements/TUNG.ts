// simulation/elements/TUNG.cpp
import { sd } from '../sim/simulationData.ts';
import type { Element, GraphicsFuncContext, Gfx } from '../sim/element.ts';
import type { Simulation } from '../sim/simulation.ts';
import type { Particle } from '../sim/particle.ts';
import { f, itrunc, restrict_flt } from '../sim/cpp.ts';
import {
  CELL, CFDS, FIRE_ADD, IPH, IPL, ITL, MAX_TEMP, MIN_TEMP, NT, PROP_CONDUCTS, PROP_LIFE_DEC, SC_ELEC, TYP, TYPE_SOLID,
} from '../sim/config.ts';
import { PT_BRMT, PT_FIRE, PT_LAVA, PT_O2, PT_TUNG } from '../sim/numbers.ts';

export function Element_TUNG(el: Element): void {
  el.Identifier = 'DEFAULT_PT_TUNG';
  el.Name = 'TUNG';
  el.Colour = 0x505050;
  el.MenuVisible = 1;
  el.MenuSection = SC_ELEC;
  el.Enabled = 1;

  el.Advection = 0.0;
  el.AirDrag = f(0.00 * CFDS);
  el.AirLoss = f(0.90);
  el.Loss = 0.00;
  el.Collision = 0.0;
  el.Gravity = 0.0;
  el.Diffusion = 0.00;
  el.HotAir = f(0.000 * CFDS);
  el.Falldown = 0;

  el.Flammable = 0;
  el.Explosive = 0;
  el.Meltable = 1;
  el.Hardness = 1;

  el.Weight = 100;

  el.HeatConduct = 251;
  el.Description = 'Tungsten. Brittle metal with a very high melting point.';

  el.Properties = TYPE_SOLID | PROP_CONDUCTS | PROP_LIFE_DEC;

  el.LowPressure = IPL;
  el.LowPressureTransition = NT;
  el.HighPressure = IPH;
  el.HighPressureTransition = NT;
  el.LowTemperature = ITL;
  el.LowTemperatureTransition = NT;
  el.HighTemperature = 3695.0;// TUNG melts in its update function instead of in the normal way, but store the threshold here so that it can be changed from Lua
  el.HighTemperatureTransition = NT;

  el.Update = update;
  el.Graphics = graphics;
  el.Create = create;
}

function update(sim: Simulation, i: number, x: number, y: number, _surround_space: number, _nt: number,
  parts: Particle[], pmap: Int32Array[]): number {
  const elements = sd.elements;
  let splode = false;
  const MELTING_POINT = f(elements[PT_TUNG].HighTemperature);

  if (parts[i].temp > 2400.0) {
    for (let rx = -1; rx <= 1; rx++) {
      for (let ry = -1; ry <= 1; ry++) {
        if (rx || ry) {
          const r = pmap[y + ry][x + rx];
          if (TYP(r) === PT_O2) {
            splode = true;
          }
        }
      }
    }
  }
  if ((parts[i].temp > MELTING_POINT && sim.rng.chance(1, 20)) || splode) {
    if (sim.rng.chance(1, 50)) {
      sim.pv[(y / CELL) | 0][(x / CELL) | 0] += 50.0;
    } else if (sim.rng.chance(1, 100)) {
      //@ TUNG -> FIRE
      sim.part_change_type(i, x, y, PT_FIRE);
      parts[i].life = sim.rng.between(0, 499);
      return 1;
    } else {
      //@ TUNG -> LAVA(TUNG)
      sim.part_change_type(i, x, y, PT_LAVA);
      parts[i].ctype = PT_TUNG;
      return 1;
    }
    if (splode) {
      parts[i].temp = restrict_flt(f(MELTING_POINT + sim.rng.between(200, 799)), MIN_TEMP, MAX_TEMP);
    }
    parts[i].vx = f(parts[i].vx + sim.rng.between(-50, 50));
    parts[i].vy = f(parts[i].vy + sim.rng.between(-50, 50));
    return 1;
  }
  const press = itrunc(f(sim.pv[(y / CELL) | 0][(x / CELL) | 0] * 64));
  const diff = press - parts[i].tmp3;
  if (diff > 32 || diff < -32) {
    //@ TUNG -> BRMT(TUNG)
    sim.part_change_type(i, x, y, PT_BRMT);
    parts[i].ctype = PT_TUNG;
    return 1;
  }
  parts[i].tmp3 = press;
  return 0;
}

function graphics(_gfctx: GraphicsFuncContext, cpart: Particle, _nx: number, _ny: number, g: Gfx): number {
  const elements = sd.elements;
  const MELTING_POINT = f(elements[PT_TUNG].HighTemperature);
  const startTemp = (MELTING_POINT - 1500.0);
  let tempOver = (((cpart.temp - startTemp) / 1500.0) * Math.PI) - (Math.PI / 2.0);
  if (tempOver > -(Math.PI / 2.0)) {
    if (tempOver > Math.PI / 2.0)
      tempOver = Math.PI / 2.0;
    const gradv = Math.sin(tempOver) + 1.0;
    g.firer = itrunc(gradv * 258.0);
    g.fireg = itrunc(gradv * 156.0);
    g.fireb = itrunc(gradv * 112.0);
    g.firea = 30;

    g.colr += g.firer;
    g.colg += g.fireg;
    g.colb += g.fireb;
    g.pixel_mode |= FIRE_ADD;
  }
  return 0;
}

function create(sim: Simulation, i: number, x: number, y: number, _t: number, _v: number): void {
  sim.parts[i].tmp3 = itrunc(f(sim.pv[(y / CELL) | 0][(x / CELL) | 0] * 64));
}
