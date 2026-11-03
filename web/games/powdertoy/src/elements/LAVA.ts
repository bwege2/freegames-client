// simulation/elements/LAVA.cpp
import type { Element, Gfx, GraphicsFuncContext } from '../sim/element.ts';
import type { Simulation } from '../sim/simulation.ts';
import { FIELD_CTYPE } from '../sim/particle.ts';
import type { Particle } from '../sim/particle.ts';
import { f, idiv } from '../sim/cpp.ts';
import { CFDS, FIRE_ADD, IPH, IPL, ITH, MAX_TEMP, NT, PMODE_BLUR, PROP_LIFE_DEC, R_TEMP, SC_LIQUID, ST, TYPE_LIQUID } from '../sim/config.ts';
import { Element_FIRE_update } from '../elements/FIRE.ts';

export function Element_LAVA(el: Element): void {
  el.Identifier = "DEFAULT_PT_LAVA";
  el.Name = "LAVA";
  el.Colour = 0xE05010;
  el.MenuVisible = 1;
  el.MenuSection = SC_LIQUID;
  el.Enabled = 1;

  el.Advection = f(0.3);
  el.AirDrag = f(f(0.02) * CFDS);
  el.AirLoss = f(0.95);
  el.Loss = f(0.80);
  el.Collision = 0.0;
  el.Gravity = f(0.15);
  el.Diffusion = 0.00;
  el.HotAir = f(f(0.0003) * CFDS);
  el.Falldown = 2;

  el.Flammable = 0;
  el.Explosive = 0;
  el.Meltable = 0;
  el.Hardness = 2;
  el.PhotonReflectWavelengths = 0x3FF00000;

  el.Weight = 45;

  el.DefaultProperties.temp = f(f(R_TEMP + 1500.0) + f(273.15));
  el.HeatConduct = 60;
  el.Description = "Molten lava. Ignites flammable materials. Generated when metals and other materials melt, solidifies when cold.";

  el.Properties = TYPE_LIQUID | PROP_LIFE_DEC;
  el.CarriesTypeIn = 1 << FIELD_CTYPE;

  el.LowPressure = IPL;
  el.LowPressureTransition = NT;
  el.HighPressure = IPH;
  el.HighPressureTransition = NT;
  el.LowTemperature = MAX_TEMP; // check for lava solidification at all temperatures
  el.LowTemperatureTransition = ST;
  el.HighTemperature = ITH;
  el.HighTemperatureTransition = NT;

  el.Update = Element_FIRE_update;
  el.Graphics = graphics;
  el.Create = create;
}

function graphics(_gfctx: GraphicsFuncContext, cpart: Particle, _nx: number, _ny: number, g: Gfx): number {
  g.colr = cpart.life * 2 + 0xE0;
  g.colg = cpart.life * 1 + 0x50;
  g.colb = idiv(cpart.life, 2) + 0x10;
  if (g.colr>255) g.colr = 255;
  if (g.colg>192) g.colg = 192;
  if (g.colb>128) g.colb = 128;
  g.firea = 40;
  g.firer = g.colr;
  g.fireg = g.colg;
  g.fireb = g.colb;
  g.pixel_mode |= FIRE_ADD;
  g.pixel_mode |= PMODE_BLUR;
  //Returning 0 means dynamic, do not cache
  return 0;
}

function create(sim: Simulation, i: number, _x: number, _y: number, _t: number, _v: number): void {
  sim.parts[i].life = sim.rng.between(240, 359);
}
