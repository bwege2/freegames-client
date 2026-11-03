// simulation/elements/WOOD.cpp
import type { Element, Gfx, GraphicsFuncContext } from '../sim/element.ts';
import type { Simulation } from '../sim/simulation.ts';
import type { Particle } from '../sim/particle.ts';
import { f, itrunc, restrict_flt } from '../sim/cpp.ts';
import { CELL, CFDS, IPH, IPL, ITL, NT, PROP_NEUTPENETRATE, SC_SOLIDS, TYPE_SOLID } from '../sim/config.ts';
import { PT_BCOL, PT_FIRE } from '../sim/numbers.ts';

export function Element_WOOD(el: Element): void {
  el.Identifier = "DEFAULT_PT_WOOD";
  el.Name = "WOOD";
  el.Colour = 0xC0A040;
  el.MenuVisible = 1;
  el.MenuSection = SC_SOLIDS;
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

  el.Flammable = 20;
  el.Explosive = 0;
  el.Meltable = 0;
  el.Hardness = 16;

  el.Weight = 100;

  el.HeatConduct = 164;
  el.Description = "Wood, flammable.";

  el.Properties = TYPE_SOLID | PROP_NEUTPENETRATE;

  el.LowPressure = IPL;
  el.LowPressureTransition = NT;
  el.HighPressure = IPH;
  el.HighPressureTransition = NT;
  el.LowTemperature = ITL;
  el.LowTemperatureTransition = NT;
  el.HighTemperature = 873.0;
  el.HighTemperatureTransition = PT_FIRE; //@ WOOD -> FIRE

  el.Update = update;
  el.Graphics = graphics;
}

function update(sim: Simulation, i: number, x: number, y: number, _surround_space: number, _nt: number,
  parts: Particle[], _pmap: Int32Array[]): number {
  if (parts[i].temp > 450 && parts[i].temp > parts[i].tmp)
    parts[i].tmp = itrunc(parts[i].temp);

  if (parts[i].temp > 773.0 && sim.pv[(y/CELL) | 0][(x/CELL) | 0] <= -10.0)
  {
    const temp = parts[i].temp;
    //@ WOOD -> BCOL
    sim.create_part(i, x, y, PT_BCOL);
    parts[i].temp = temp;
  }

  return 0;
}

function graphics(_gfctx: GraphicsFuncContext, cpart: Particle, _nx: number, _ny: number, g: Gfx): number {
  // std::max((float)cpart->tmp, cpart->temp): (a < b) ? b : a
  const tmpf = f(cpart.tmp);
  const maxtemp = (tmpf < cpart.temp) ? cpart.temp : tmpf;
  if (maxtemp > 400)
  {
    g.colr -= itrunc(restrict_flt(f(f(maxtemp-400)/3),0,172));
    g.colg -= itrunc(restrict_flt(f(f(maxtemp-400)/4),0,140));
    g.colb -= itrunc(restrict_flt(f(f(maxtemp-400)/20),0,44));
  }
  if (maxtemp < 273)
  {
    g.colr -= itrunc(restrict_flt(f(f(273-maxtemp)/5),0,40));
    g.colg += itrunc(restrict_flt(f(f(273-maxtemp)/4),0,40));
    g.colb += itrunc(restrict_flt(f(f(273-maxtemp)/1.5),0,150));
  }
  return 0;
}
