// simulation/elements/GRAV.cpp
import type { Element, GraphicsFuncContext, Gfx } from '../sim/element.ts';
import type { Simulation } from '../sim/simulation.ts';
import type { Particle } from '../sim/particle.ts';
import { f, itrunc } from '../sim/cpp.ts';
import {
  CFDS, FIRE_ADD, IPH, IPL, ITH, ITL, NT, PMODE_ADD, PMODE_FLARE, PMODE_GLOW, PROP_LIFE_DEC, SC_POWDERS, TYPE_PART,
} from '../sim/config.ts';

export function Element_GRAV(el: Element): void {
  el.Identifier = 'DEFAULT_PT_GRAV';
  el.Name = 'GRAV';
  el.Colour = 0x202020;
  el.MenuVisible = 1;
  el.MenuSection = SC_POWDERS;
  el.Enabled = 1;

  el.Advection = f(0.7);
  el.AirDrag = f(f(0.00) * CFDS);
  el.AirLoss = f(1.00);
  el.Loss = f(1.00);
  el.Collision = f(0.0);
  el.Gravity = f(0.0);
  el.Diffusion = f(0.00);
  el.HotAir = f(f(0.000) * CFDS);
  el.Falldown = 1;

  el.Flammable = 10;
  el.Explosive = 0;
  el.Meltable = 0;
  el.Hardness = 30;

  el.Weight = 85;

  el.HeatConduct = 70;
  el.Description = 'Very light dust. Changes colour based on velocity.';

  el.Properties = TYPE_PART | PROP_LIFE_DEC;

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

function update(sim: Simulation, i: number, _x: number, _y: number, _surround_space: number, _nt: number,
  parts: Particle[], _pmap: Int32Array[]): number {
  if (f(f(parts[i].vx * parts[i].vx) + f(parts[i].vy * parts[i].vy)) >= f(0.1) && sim.rng.chance(1, 512)) {
    if (!parts[i].life)
      parts[i].life = 48;
  }

  return 0;
}

function graphics(gfctx: GraphicsFuncContext, cpart: Particle, _nx: number, _ny: number, g: Gfx): number {
  let GRAV_R: number, GRAV_B: number, GRAV_G: number, GRAV_R2: number, GRAV_B2: number, GRAV_G2: number;

  GRAV_R = Math.abs((gfctx.sim.currentTick % 120) - 60);
  GRAV_G = Math.abs(((gfctx.sim.currentTick + 60) % 120) - 60);
  GRAV_B = Math.abs(((gfctx.sim.currentTick + 120) % 120) - 60);
  GRAV_R2 = Math.abs((gfctx.sim.currentTick % 60) - 30);
  GRAV_G2 = Math.abs(((gfctx.sim.currentTick + 30) % 60) - 30);
  GRAV_B2 = Math.abs(((gfctx.sim.currentTick + 60) % 60) - 30);


  g.colr = 20;
  g.colg = 20;
  g.colb = 20;
  if (cpart.vx > 0) {
    g.colr += itrunc(f((cpart.vx) * GRAV_R));
    g.colg += itrunc(f((cpart.vx) * GRAV_G));
    g.colb += itrunc(f((cpart.vx) * GRAV_B));
  }
  if (cpart.vy > 0) {
    g.colr += itrunc(f((cpart.vy) * GRAV_G));
    g.colg += itrunc(f((cpart.vy) * GRAV_B));
    g.colb += itrunc(f((cpart.vy) * GRAV_R));

  }
  if (cpart.vx < 0) {
    g.colr -= itrunc(f((cpart.vx) * GRAV_B));
    g.colg -= itrunc(f((cpart.vx) * GRAV_R));
    g.colb -= itrunc(f((cpart.vx) * GRAV_G));

  }
  if (cpart.vy < 0) {
    g.colr -= itrunc(f((cpart.vy) * GRAV_R2));
    g.colg -= itrunc(f((cpart.vy) * GRAV_G2));
    g.colb -= itrunc(f((cpart.vy) * GRAV_B2));
  }

  if (cpart.life) {
    g.pixel_mode = FIRE_ADD | PMODE_ADD | PMODE_GLOW | PMODE_FLARE;
    g.firer = Math.min(g.colr * 3, 255);
    g.fireg = Math.min(g.colg * 3, 255);
    g.fireb = Math.min(g.colb * 3, 255);
    g.firea = (cpart.life + 15) * 4;
    g.cola = (cpart.life + 15) * 4;
  }
  else
    g.pixel_mode = PMODE_ADD;

  return 0;
}
