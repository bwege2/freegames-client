// simulation/elements/CRMC.cpp
import type { Element, GraphicsFuncContext, Gfx } from '../sim/element.ts';
import type { Simulation } from '../sim/simulation.ts';
import type { Particle } from '../sim/particle.ts';
import { f } from '../sim/cpp.ts';
import { CELL, CFDS, IPH, IPL, ITL, NT, PROP_NEUTPASS, SC_SOLIDS, ST, TYPE_SOLID } from '../sim/config.ts';
import { PT_CLST } from '../sim/numbers.ts';

export function Element_CRMC(el: Element): void {
  el.Identifier = 'DEFAULT_PT_CRMC';
  el.Name = 'CRMC';
  el.Colour = 0xD6D1D4;
  el.MenuVisible = 1;
  el.MenuSection = SC_SOLIDS;
  el.Enabled = 1;

  el.Advection = 0.0;
  el.AirDrag = f(0.00 * CFDS);
  el.AirLoss = 0.00;
  el.Loss = 0.00;
  el.Collision = 0.0;
  el.Gravity = 0.0;
  el.Diffusion = 0.00;
  el.HotAir = f(0.000 * CFDS);
  el.Falldown = 0;

  el.Flammable = 0;
  el.Explosive = 0;
  el.Meltable = 0;
  el.Hardness = 0;

  el.Weight = 100;

  el.HeatConduct = 35;
  el.Description = 'Ceramic. Gets stronger under pressure.';

  el.Properties = TYPE_SOLID | PROP_NEUTPASS;

  el.LowPressure = IPL;
  el.LowPressureTransition = NT;
  el.HighPressure = IPH;
  el.HighPressureTransition = NT;
  el.LowTemperature = ITL;
  el.LowTemperatureTransition = NT;
  el.HighTemperature = f(2887.15);
  el.HighTemperatureTransition = ST; //@ CRMC -> LAVA(CRMC)

  el.Update = update;
  el.Graphics = graphics;
  el.Create = create;
}

function update(sim: Simulation, i: number, x: number, y: number, _surround_space: number, _nt: number,
  parts: Particle[], _pmap: Int32Array[]): number {
  const origTemp = parts[i].temp;
  //@ CRMC -> CLST
  if (sim.pv[(y / CELL) | 0][(x / CELL) | 0] < -30.0)
    sim.create_part(i, x, y, PT_CLST);
  parts[i].temp = origTemp;
  return 0;
}

function graphics(_gfctx: GraphicsFuncContext, cpart: Particle, _nx: number, _ny: number, g: Gfx): number {
  const z = (cpart.tmp2 - 2) * 8;
  g.colr += z;
  g.colg += z;
  g.colb += z;
  return 0;
}

function create(sim: Simulation, i: number, _x: number, _y: number, _t: number, _v: number): void {
  sim.parts[i].tmp2 = sim.rng.between(0, 4);
}
