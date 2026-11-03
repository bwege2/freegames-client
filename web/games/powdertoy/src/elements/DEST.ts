// simulation/elements/DEST.cpp
import { sd } from '../sim/simulationData.ts';
import type { Element, GraphicsFuncContext, Gfx } from '../sim/element.ts';
import type { Simulation } from '../sim/simulation.ts';
import type { Particle } from '../sim/particle.ts';
import { f, restrict_flt } from '../sim/cpp.ts';
import {
  CELL, CFDS, ID, IPH, IPL, ITH, ITL, MAX_PRESSURE, MAX_TEMP, MIN_PRESSURE, NT, PMODE_LFLARE, PMODE_SPARK,
  PROP_LIFE_DEC, PROP_LIFE_KILL_DEC, SC_EXPLOSIVE, TYP, TYPE_PART, TYPE_SOLID,
} from '../sim/config.ts';
import {
  PT_BCLN, PT_CLNE, PT_DEST, PT_DEUT, PT_DMND, PT_INSL, PT_NEUT, PT_PBCN, PT_PCLN, PT_PLSM, PT_PLUT,
} from '../sim/numbers.ts';

export function Element_DEST(el: Element): void {
  el.Identifier = 'DEFAULT_PT_DEST';
  el.Name = 'DEST';
  el.Colour = 0xFF3311;
  el.MenuVisible = 1;
  el.MenuSection = SC_EXPLOSIVE;
  el.Enabled = 1;

  el.Advection = f(-0.05);
  el.AirDrag = f(f(0.00) * CFDS);
  el.AirLoss = f(0.95);
  el.Loss = f(0.95);
  el.Collision = f(-0.1);
  el.Gravity = f(0.4);
  el.Diffusion = f(0.00);
  el.HotAir = f(f(0.000) * CFDS);
  el.Falldown = 1;

  el.Flammable = 0;
  el.Explosive = 0;
  el.Meltable = 0;
  el.Hardness = 0;

  el.Weight = 101;

  el.HeatConduct = 150;
  el.Description = 'More destructive Bomb, can break through virtually anything.';

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
  const elements = sd.elements;
  const rx = sim.rng.between(-2, 2);
  const ry = sim.rng.between(-2, 2);
  const r = pmap[y + ry][x + rx];
  if (!r)
    return 0;
  const rt = TYP(r);
  if (rt === PT_DEST || rt === PT_DMND || rt === PT_BCLN || rt === PT_CLNE || rt === PT_PCLN || rt === PT_PBCN)
    return 0;

  const cx = (x / CELL) | 0, cy = (y / CELL) | 0;
  if (parts[i].life <= 0 || parts[i].life > 37) {
    parts[i].life = sim.rng.between(30, 49);
    sim.pv[cy][cx] += 60.0;
  }
  if (rt === PT_PLUT || rt === PT_DEUT) {
    sim.pv[cy][cx] += 20.0;
    if (sim.rng.chance(1, 2)) {
      //@ DEST + PLUT/DEUT -> DEST + NEUT
      sim.create_part(ID(r), x + rx, y + ry, PT_NEUT);
      parts[ID(r)].temp = MAX_TEMP;
      sim.pv[cy][cx] += 10.0;
      parts[i].life -= 4;
    }
  }
  else if (rt === PT_INSL) {
    //@ DEST + INSL -> DEST + PLSM
    sim.create_part(ID(r), x + rx, y + ry, PT_PLSM);
  }
  else if (sim.rng.chance(1, 3)) {
    sim.kill_part(ID(r));
    parts[i].life -= 4 * ((elements[rt].Properties & TYPE_SOLID) ? 3 : 1);
    if (parts[i].life <= 0)
      parts[i].life = 1;
  }
  else if (!sd.IsHeatInsulator(parts[ID(r)]))
    parts[ID(r)].temp = MAX_TEMP;
  parts[i].temp = MAX_TEMP;
  sim.pv[cy][cx] = restrict_flt(f(sim.pv[cy][cx] + 80.0), MIN_PRESSURE, MAX_PRESSURE);
  return 0;
}

function graphics(_gfctx: GraphicsFuncContext, cpart: Particle, _nx: number, _ny: number, g: Gfx): number {
  if (cpart.life) {
    g.pixel_mode |= PMODE_LFLARE;
  }
  else {
    g.pixel_mode |= PMODE_SPARK;
  }
  return 0;
}
