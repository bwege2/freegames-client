// simulation/elements/GRVT.cpp
import type { Element, GraphicsFuncContext, Gfx } from '../sim/element.ts';
import type { Simulation } from '../sim/simulation.ts';
import type { Particle } from '../sim/particle.ts';
import { f } from '../sim/cpp.ts';
import {
  CELL, CFDS, FIRE_BLEND, IPH, IPL, ITH, ITL, NT, PROP_LIFE_DEC, PROP_LIFE_KILL_DEC, SC_NUCLEAR, TYP, TYPE_ENERGY,
  XCELLS,
} from '../sim/config.ts';
import { PT_RSSS } from '../sim/numbers.ts';

export function Element_GRVT(el: Element): void {
  el.Identifier = 'DEFAULT_PT_GRVT';
  el.Name = 'GRVT';
  el.Colour = 0x00EE76;
  el.MenuVisible = 1;
  el.MenuSection = SC_NUCLEAR;
  el.Enabled = 1;

  el.Advection = 0.0;
  el.AirDrag = f(0.00 * CFDS);
  el.AirLoss = 1.00;
  el.Loss = 1.00;
  el.Collision = f(-.99);
  el.Gravity = 0.0;
  el.Diffusion = 0.00;
  el.HotAir = f(0.000 * CFDS);
  el.Falldown = 0;

  el.Flammable = 0;
  el.Explosive = 0;
  el.Meltable = 0;
  el.Hardness = 1;

  el.Weight = -1;

  el.HeatConduct = 61;
  el.Description = 'Gravitons. Create Newtonian Gravity.';

  el.Properties = TYPE_ENERGY | PROP_LIFE_DEC | PROP_LIFE_KILL_DEC;

  el.LowPressure = IPL;
  el.LowPressureTransition = NT;
  el.HighPressure = IPH;
  el.HighPressureTransition = NT;
  el.LowTemperature = ITL;
  el.LowTemperatureTransition = NT;
  el.HighTemperature = ITH;
  el.HighTemperatureTransition = NT;

  el.DefaultProperties.tmp = 7;

  el.Update = update;
  el.Graphics = graphics;
  el.Create = create;
}

function update(sim: Simulation, i: number, x: number, y: number, _surround_space: number, _nt: number,
  parts: Particle[], pmap: Int32Array[]): number {
  //at higher tmps they just go completely insane
  if (parts[i].tmp >= 100)
    parts[i].tmp = 100;
  if (parts[i].tmp <= -100)
    parts[i].tmp = -100;

  const under = pmap[y][x];
  const utype = TYP(under);

  //Randomly kill GRVT inside RSSS
  if ((utype === PT_RSSS) && sim.rng.chance(1, 5)) {

    sim.kill_part(i);
    return 1;
  }
  sim.gravIn.mass[((y / CELL) | 0) * XCELLS + ((x / CELL) | 0)] = f(f(0.2) * parts[i].tmp);
  return 0;
}

function graphics(_gfctx: GraphicsFuncContext, _cpart: Particle, _nx: number, _ny: number, g: Gfx): number {
  g.firea = 5;
  g.firer = 0;
  g.fireg = 250;
  g.fireb = 170;

  g.pixel_mode |= FIRE_BLEND;
  return 1;
}

function create(sim: Simulation, i: number, _x: number, _y: number, _t: number, _v: number): void {
  const a = f(f(sim.rng.between(0, 359) * f(Math.PI)) / 180.0);
  sim.parts[i].life = 250 + sim.rng.between(0, 199);
  sim.parts[i].vx = f(2.0 * f(Math.cos(a)));
  sim.parts[i].vy = f(2.0 * f(Math.sin(a)));
}
