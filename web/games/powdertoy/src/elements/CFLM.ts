// simulation/elements/CFLM.cpp
import type { Element, GraphicsFuncContext, Gfx } from '../sim/element.ts';
import type { Simulation } from '../sim/simulation.ts';
import type { Particle } from '../sim/particle.ts';
import { f } from '../sim/cpp.ts';
import { Blue, clfmTableAt, Green, Red } from '../sim/colour.ts';
import {
  CFDS, FIRE_ADD, IPH, IPL, ITH, ITL, NT, PMODE_NONE, PROP_LIFE_DEC, PROP_LIFE_KILL, SC_EXPLOSIVE, TYPE_GAS,
} from '../sim/config.ts';

export function Element_CFLM(el: Element): void {
  el.Identifier = 'DEFAULT_PT_HFLM';
  el.Name = 'CFLM';
  el.Colour = 0x8080FF;
  el.MenuVisible = 1;
  el.MenuSection = SC_EXPLOSIVE;
  el.Enabled = 1;

  el.Advection = f(0.9);
  el.AirDrag = f(f(0.04) * CFDS);
  el.AirLoss = f(0.97);
  el.Loss = f(0.20);
  el.Collision = 0.0;
  el.Gravity = f(-0.1);
  el.Diffusion = f(0.00);
  el.HotAir = f(f(0.0005) * CFDS);
  el.Falldown = 0;

  el.Flammable = 0;
  el.Explosive = 0;
  el.Meltable = 0;
  el.Hardness = 1;

  el.Weight = 2;

  el.DefaultProperties.temp = 0.0;
  el.HeatConduct = 88;
  el.Description = 'Sub-zero flame.';

  el.Properties = TYPE_GAS | PROP_LIFE_DEC | PROP_LIFE_KILL;

  el.LowPressure = IPL;
  el.LowPressureTransition = NT;
  el.HighPressure = IPH;
  el.HighPressureTransition = NT;
  el.LowTemperature = ITL;
  el.LowTemperatureTransition = NT;
  el.HighTemperature = ITH;
  el.HighTemperatureTransition = NT;

  el.Graphics = graphics;
  el.Create = create;
}

function graphics(_gfctx: GraphicsFuncContext, cpart: Particle, _nx: number, _ny: number, g: Gfx): number {
  const color = clfmTableAt((cpart.life / 2) | 0);
  g.colr = Red(color);
  g.colg = Green(color);
  g.colb = Blue(color);

  g.firea = 255;
  g.firer = g.colr;
  g.fireg = g.colg;
  g.fireb = g.colb;

  g.pixel_mode = PMODE_NONE; //Clear default, don't draw pixel
  g.pixel_mode |= FIRE_ADD;
  //Returning 0 means dynamic, do not cache
  return 0;
}

function create(sim: Simulation, i: number, _x: number, _y: number, _t: number, _v: number): void {
  sim.parts[i].life = sim.rng.between(50, 199);
}
