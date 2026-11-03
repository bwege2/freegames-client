// simulation/elements/VINE.cpp
import type { Element, GraphicsFuncContext, Gfx } from '../sim/element.ts';
import type { Simulation } from '../sim/simulation.ts';
import type { Particle } from '../sim/particle.ts';
import { f, itrunc, restrict_flt } from '../sim/cpp.ts';
import { CFDS, IPH, IPL, ITL, NT, SC_SOLIDS, TYPE_SOLID } from '../sim/config.ts';
import { PT_FIRE, PT_PLNT, PT_VINE } from '../sim/numbers.ts';

export function Element_VINE(el: Element): void {
  el.Identifier = 'DEFAULT_PT_VINE';
  el.Name = 'VINE';
  el.Colour = 0x079A00;
  el.MenuVisible = 1;
  el.MenuSection = SC_SOLIDS;
  el.Enabled = 1;

  el.Advection = f(0.0);
  el.AirDrag = f(f(0.00) * CFDS);
  el.AirLoss = f(0.95);
  el.Loss = f(0.00);
  el.Collision = f(0.0);
  el.Gravity = f(0.0);
  el.Diffusion = f(0.00);
  el.HotAir = f(f(0.000) * CFDS);
  el.Falldown = 0;

  el.Flammable = 20;
  el.Explosive = 0;
  el.Meltable = 0;
  el.Hardness = 10;

  el.Weight = 100;

  el.HeatConduct = 65;
  el.Description = 'Vine, can grow along WOOD.';

  el.Properties = TYPE_SOLID;

  el.LowPressure = IPL;
  el.LowPressureTransition = NT;
  el.HighPressure = IPH;
  el.HighPressureTransition = NT;
  el.LowTemperature = ITL;
  el.LowTemperatureTransition = NT;
  el.HighTemperature = f(573.0);
  el.HighTemperatureTransition = PT_FIRE; //@ VINE -> FIRE

  el.DefaultProperties.tmp = 1;

  el.Update = update;
  el.Graphics = graphics; // this used to be missing, maybe for a reason?
}

function update(sim: Simulation, i: number, x: number, y: number, _surround_space: number, _nt: number,
  parts: Particle[], pmap: Int32Array[]): number {
  let rndstore = sim.rng.gen();
  const rx = (rndstore % 3) - 1;
  rndstore >>= 2;
  const ry = (rndstore % 3) - 1;
  rndstore >>= 2;
  if (rx || ry) {
    const r = pmap[y + ry][x + rx];
    //@ VINE -> PLNT
    if (!(rndstore % 15))
      sim.part_change_type(i, x, y, PT_PLNT);
    else if (!r) {
      const np = sim.create_part(-1, x + rx, y + ry, PT_VINE);
      if (np < 0) return 0;
      parts[np].temp = parts[i].temp;
      sim.part_change_type(i, x, y, PT_PLNT);
    }
  }
  if (parts[i].temp > 350 && parts[i].temp > parts[i].tmp2)
    parts[i].tmp2 = itrunc(parts[i].temp);
  return 0;
}

function graphics(_gfctx: GraphicsFuncContext, cpart: Particle, _nx: number, _ny: number, g: Gfx): number {
  const a = f(cpart.tmp2), b = cpart.temp;
  const maxtemp = (a < b) ? b : a; // std::max((float)cpart->tmp2, cpart->temp)
  if (maxtemp > 300) {
    g.colr += itrunc(restrict_flt(f(f(maxtemp - 300) / 5), 0, 58));
    g.colg -= itrunc(restrict_flt(f(f(maxtemp - 300) / 2), 0, 102));
    g.colb += itrunc(restrict_flt(f(f(maxtemp - 300) / 5), 0, 70));
  }
  if (maxtemp < 273) {
    g.colg += itrunc(restrict_flt(f(f(273 - maxtemp) / 4), 0, 255));
    g.colb += itrunc(restrict_flt(f((f(273 - maxtemp)) / 1.5), 0, 255));
  }
  return 0;
}
