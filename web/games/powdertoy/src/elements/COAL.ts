// simulation/elements/COAL.cpp (+ COAL.h)
import type { Element, GraphicsFuncContext, Gfx } from '../sim/element.ts';
import type { Simulation } from '../sim/simulation.ts';
import type { Particle } from '../sim/particle.ts';
import { f, itrunc } from '../sim/cpp.ts';
import { CELL, CFDS, IPH, IPL, ITH, ITL, NT, SC_SOLIDS, TYPE_SOLID } from '../sim/config.ts';
import { PT_BCOL, PT_COAL, PT_FIRE } from '../sim/numbers.ts';

export function Element_COAL(el: Element): void {
  el.Identifier = 'DEFAULT_PT_COAL';
  el.Name = 'COAL';
  el.Colour = 0x222222;
  el.MenuVisible = 1;
  el.MenuSection = SC_SOLIDS;
  el.Enabled = 1;

  el.Advection = 0.0;
  el.AirDrag = f(f(0.00) * CFDS);
  el.AirLoss = f(0.90);
  el.Loss = f(0.00);
  el.Collision = 0.0;
  el.Gravity = 0.0;
  el.Diffusion = 0.0;
  el.HotAir = f(0.0 * CFDS);
  el.Falldown = 0;

  el.Flammable = 0;
  el.Explosive = 0;
  el.Meltable = 0;
  el.Hardness = 18;
  el.PhotonReflectWavelengths = 0x00000000;

  el.Weight = 100;

  el.HeatConduct = 200;
  el.Description = 'Coal, Burns very slowly. Gets red when hot.';

  el.Properties = TYPE_SOLID;

  el.LowPressure = IPL;
  el.LowPressureTransition = NT;
  el.HighPressure = IPH;
  el.HighPressureTransition = NT;
  el.LowTemperature = ITL;
  el.LowTemperatureTransition = NT;
  el.HighTemperature = ITH;
  el.HighTemperatureTransition = NT;

  el.DefaultProperties.life = 110;
  el.DefaultProperties.tmp = 50;

  el.Update = Element_COAL_update;
  el.Graphics = Element_COAL_graphics;
}

export function Element_COAL_update(sim: Simulation, i: number, x: number, y: number, _surround_space: number, _nt: number,
  parts: Particle[], _pmap: Int32Array[]): number {
  if (parts[i].life <= 0) {
    sim.create_part(i, x, y, PT_FIRE);
    return 1;
  } else if (parts[i].life < 100) {
    parts[i].life--;
    // g++ evaluates the arguments right to left: the y offset is drawn first
    const ry_ = sim.rng.between(-1, 1);
    const rx_ = sim.rng.between(-1, 1);
    sim.create_part(-1, x + rx_, y + ry_, PT_FIRE);
  }
  if (parts[i].type === PT_COAL) {
    if ((sim.pv[(y / CELL) | 0][(x / CELL) | 0] > f(4.3)) && parts[i].tmp > 40)
      parts[i].tmp = 39;
    else if (parts[i].tmp < 40 && parts[i].tmp > 0)
      parts[i].tmp--;
    else if (parts[i].tmp <= 0) {
      //@ COAL -> BCOL
      sim.part_change_type(i, x, y, PT_BCOL);
      return 1;
    }
  }
  if (parts[i].temp > parts[i].tmp2)
    parts[i].tmp2 = itrunc(parts[i].temp);
  return 0;
}

// std::numbers::pi_v<float>/(2*300.0f-(300.0f-200.0f))
const FREQUENCY = f(f(Math.PI) / f(f(2 * 300.0) - f(300.0 - 200.0)));

export function Element_COAL_graphics(_gfctx: GraphicsFuncContext, cpart: Particle, _nx: number, _ny: number, g: Gfx): number // Both COAL and Broken Coal
{
  g.colr += itrunc(f(f(f(cpart.tmp2) - f(295.15)) / 3));

  if (g.colr > 170)
    g.colr = 170;
  if (g.colr < g.colg)
    g.colr = g.colg;

  g.colg = g.colb = g.colr;

  // ((cpart->temp-295.15f) > 300.0f-200.0f)
  if (cpart.temp > f(395.15)) {
    //  q = ((cpart->temp-295.15f)>300.0f)?300.0f-(300.0f-200.0f):(cpart->temp-295.15f)-(300.0f-200.0f);
    const q = itrunc((cpart.temp > f(595.15)) ? 200.0 : f(cpart.temp - f(395.15)));

    // sin(float) is ::sin(double): computed in double
    g.colr += itrunc(Math.sin(f(FREQUENCY * q)) * 226);
    g.colg += itrunc(-Math.sin(f(FREQUENCY * q) * 4.55) * 34);
    g.colb += itrunc(-Math.sin(f(FREQUENCY * q) * 2.22) * 64);
  }
  return 0;
}
