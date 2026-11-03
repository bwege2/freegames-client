// simulation/elements/PLSM.cpp
import type { Element, Gfx, GraphicsFuncContext } from '../sim/element.ts';
import type { Simulation } from '../sim/simulation.ts';
import { FIELD_CTYPE } from '../sim/particle.ts';
import type { Particle } from '../sim/particle.ts';
import { f } from '../sim/cpp.ts';
import { Blue, Green, Red, plasmaTableAt } from '../sim/colour.ts';
import { CFDS, FIRE_ADD, IPH, IPL, ITH, ITL, MAX_TEMP, NT, PMODE_ADD, PMODE_GLOW, PROP_LIFE_DEC, PROP_LIFE_KILL, SC_GAS, TYPE_GAS } from '../sim/config.ts';
import { Element_FIRE_update } from '../elements/FIRE.ts';

export function Element_PLSM(el: Element): void {
  el.Identifier = "DEFAULT_PT_PLSM";
  el.Name = "PLSM";
  el.Colour = 0xBB99FF;
  el.MenuVisible = 1;
  el.MenuSection = SC_GAS;
  el.Enabled = 1;

  el.Advection = f(0.9);
  el.AirDrag = f(f(0.04) * CFDS);
  el.AirLoss = f(0.97);
  el.Loss = f(0.20);
  el.Collision = 0.0;
  el.Gravity = f(-0.1);
  el.Diffusion = f(0.30);
  el.HotAir = f(f(0.001) * CFDS);
  el.Falldown = 0;

  el.Flammable = 0;
  el.Explosive = 0;
  el.Meltable = 0;
  el.Hardness = 0;

  el.Weight = 1;

  el.DefaultProperties.temp = MAX_TEMP;
  el.HeatConduct = 5;
  el.Description = "Plasma, extremely hot.";

  el.Properties = TYPE_GAS | PROP_LIFE_DEC | PROP_LIFE_KILL;
  el.CarriesTypeIn = 1 << FIELD_CTYPE;

  el.LowPressure = IPL;
  el.LowPressureTransition = NT;
  el.HighPressure = IPH;
  el.HighPressureTransition = NT;
  el.LowTemperature = ITL;
  el.LowTemperatureTransition = NT;
  el.HighTemperature = ITH;
  el.HighTemperatureTransition = NT;

  el.Update = Element_FIRE_update;
  el.Graphics = graphics;
  el.Create = create;
}

function graphics(_gfctx: GraphicsFuncContext, cpart: Particle, _nx: number, _ny: number, g: Gfx): number {
  const color = plasmaTableAt(cpart.life);
  g.colr = Red(color);
  g.colg = Green(color);
  g.colb = Blue(color);

  g.firea = 255;
  g.firer = g.colr;
  g.fireg = g.colg;
  g.fireb = g.colb;

  g.pixel_mode = PMODE_GLOW | PMODE_ADD; //Clear default, don't draw pixel
  g.pixel_mode |= FIRE_ADD;
  //Returning 0 means dynamic, do not cache
  return 0;
}

function create(sim: Simulation, i: number, _x: number, _y: number, _t: number, _v: number): void {
  sim.parts[i].life = sim.rng.between(50, 199);
}
