// simulation/elements/WARP.cpp
import type { Element, GraphicsFuncContext, Gfx } from '../sim/element.ts';
import type { Simulation } from '../sim/simulation.ts';
import type { Particle } from '../sim/particle.ts';
import { f, restrict_flt } from '../sim/cpp.ts';
import {
  CELL, CFDS, ID, IPH, IPL, ITH, ITL, MAX_PRESSURE, MIN_PRESSURE, NO_DECO, NT, PMAP, PROP_LIFE_DEC, PROP_LIFE_KILL,
  SC_NUCLEAR, TYP, TYPE_GAS,
} from '../sim/config.ts';
import { PT_BCLN, PT_CLNE, PT_DMND, PT_ELEC, PT_PCLN, PT_STKM, PT_STKM2, PT_WARP } from '../sim/numbers.ts';

export function Element_WARP(el: Element): void {
  el.Identifier = 'DEFAULT_PT_WARP';
  el.Name = 'WARP';
  el.Colour = 0x101010;
  el.MenuVisible = 1;
  el.MenuSection = SC_NUCLEAR;
  el.Enabled = 1;

  el.Advection = f(0.8);
  el.AirDrag = f(f(0.00) * CFDS);
  el.AirLoss = f(0.9);
  el.Loss = f(0.70);
  el.Collision = f(-0.1);
  el.Gravity = f(0.0);
  el.Diffusion = f(3.00);
  el.HotAir = f(f(0.000) * CFDS);
  el.Falldown = 0;

  el.Flammable = 0;
  el.Explosive = 0;
  el.Meltable = 0;
  el.Hardness = 30;

  el.Weight = 1;

  el.HeatConduct = 100;
  el.Description = 'Displaces other elements.';

  el.Properties = TYPE_GAS|PROP_LIFE_DEC|PROP_LIFE_KILL;

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
  el.Create = create;
}

function update(sim: Simulation, i: number, x: number, y: number, _surround_space: number, _nt: number,
  parts: Particle[], pmap: Int32Array[]): number {
  if (parts[i].tmp2 > 2000) {
    parts[i].temp = 10000;
    sim.pv[(y / CELL) | 0][(x / CELL) | 0] = restrict_flt(f(sim.pv[(y / CELL) | 0][(x / CELL) | 0] + f(((parts[i].tmp2 / 5000) | 0) * CFDS)), MIN_PRESSURE, MAX_PRESSURE);
    //@ WARP -> WARP + ELEC
    if (sim.rng.chance(1, 50))
      sim.create_part(-3, x, y, PT_ELEC);
  }
  for (let trade = 0; trade < 5; trade++) {
    const rx = sim.rng.between(-1, 1);
    const ry = sim.rng.between(-1, 1);
    if (rx || ry) {
      const r = pmap[y + ry][x + rx];
      if (!r)
        continue;
      if (TYP(r) !== PT_WARP && TYP(r) !== PT_STKM && TYP(r) !== PT_STKM2 && TYP(r) !== PT_DMND && TYP(r) !== PT_CLNE && TYP(r) !== PT_BCLN && TYP(r) !== PT_PCLN) {
        parts[i].x = parts[ID(r)].x;
        parts[i].y = parts[ID(r)].y;
        parts[ID(r)].x = x;
        parts[ID(r)].y = y;
        parts[ID(r)].vx = f(sim.rng.between(-2, 1) + f(0.5));
        parts[ID(r)].vy = sim.rng.between(-2, 1);
        parts[i].life += 4;
        pmap[y][x] = r;
        pmap[y + ry][x + rx] = PMAP(i, parts[i].type);
        trade = 5;
      }
    }
  }
  return 0;
}

function graphics(_gfctx: GraphicsFuncContext, _cpart: Particle, _nx: number, _ny: number, g: Gfx): number {
  g.colr = g.colg = g.colb = g.cola = 0;
  g.pixel_mode |= NO_DECO;
  return 0;
}

function create(sim: Simulation, i: number, _x: number, _y: number, _t: number, _v: number): void {
  sim.parts[i].life = sim.rng.between(70, 164);
}
