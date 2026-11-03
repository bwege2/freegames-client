// simulation/elements/ROCK.cpp
import type { Element, GraphicsFuncContext, Gfx } from '../sim/element.ts';
import type { Simulation } from '../sim/simulation.ts';
import type { Particle } from '../sim/particle.ts';
import { f, itrunc } from '../sim/cpp.ts';
import { CFDS, FIRE_ADD, IPL, ITL, NT, PROP_HOT_GLOW, SC_SOLIDS, TYPE_SOLID } from '../sim/config.ts';
import { PT_LAVA, PT_STNE } from '../sim/numbers.ts';

export function Element_ROCK(el: Element): void {
  el.Identifier = 'DEFAULT_PT_ROCK';
  el.Name = 'ROCK';
  el.Colour = 0x727272;
  el.MenuVisible = 1;
  el.MenuSection = SC_SOLIDS;
  el.Enabled = 1;

  el.Advection = 0.0;
  el.AirDrag = f(0.00 * CFDS);
  el.AirLoss = f(0.94);
  el.Loss = 0.00;
  el.Collision = 0.0;
  el.Gravity = 0.0;
  el.Diffusion = 0.00;
  el.HotAir = f(0.000 * CFDS);
  el.Falldown = 0;

  el.Flammable = 0;
  el.Explosive = 0;
  el.Meltable = 5;
  el.Hardness = 1;

  el.Weight = 100;

  el.HeatConduct = 200;
  el.Description = 'Solid, melts into various elements.';

  el.Properties = TYPE_SOLID | PROP_HOT_GLOW;

  el.LowPressure = IPL;
  el.LowPressureTransition = NT;
  el.HighPressure = 120;
  el.HighPressureTransition = PT_STNE; //@ ROCK -> STNE
  el.LowTemperature = ITL;
  el.LowTemperatureTransition = NT;
  el.HighTemperature = f(1943.15);
  el.HighTemperatureTransition = PT_LAVA; //@ ROCK -> LAVA(ROCK)

  el.Graphics = graphics;
  el.Create = create;
}


function graphics(_gfctx: GraphicsFuncContext, cpart: Particle, _nx: number, _ny: number, g: Gfx): number {
  const z = (cpart.tmp2 - 7) * 6; // Randomized color noise based on tmp2
  g.colr += z;
  g.colg += z;
  g.colb += z;

  if (cpart.temp >= 810.15) { // Glows when hot, right before melting becomes bright
    g.pixel_mode |= FIRE_ADD;

    g.firea = itrunc(((cpart.temp) - 810.15) / 45);
    g.firer = g.colr;
    g.fireg = g.colg;
    g.fireb = g.colb;
  }
  return 0;
}

function create(sim: Simulation, i: number, _x: number, _y: number, _t: number, _v: number): void {
  sim.parts[i].tmp2 = sim.rng.between(0, 10);
}
