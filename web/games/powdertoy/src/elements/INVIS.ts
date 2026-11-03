// simulation/elements/INVIS.cpp
import type { Element, GraphicsFuncContext, Gfx } from '../sim/element.ts';
import type { Simulation } from '../sim/simulation.ts';
import type { Particle } from '../sim/particle.ts';
import { f } from '../sim/cpp.ts';
import {
  CELL, CFDS, IPH, IPL, ITH, ITL, NT, PMODE_BLEND, PROP_NEUTPASS, PROP_PHOTPASS, SC_SENSOR, TYPE_SOLID,
} from '../sim/config.ts';

export function Element_INVIS(el: Element): void {
  el.Identifier = 'DEFAULT_PT_INVIS';
  el.Name = 'INVS';
  el.Colour = 0x00CCCC;
  el.MenuVisible = 1;
  el.MenuSection = SC_SENSOR;
  el.Enabled = 1;

  el.Advection = f(0.0);
  el.AirDrag = f(f(0.00) * CFDS);
  el.AirLoss = f(0.90);
  el.Loss = f(0.00);
  el.Collision = f(0.0);
  el.Gravity = f(0.0);
  el.Diffusion = f(0.00);
  el.HotAir = f(f(0.000) * CFDS);
  el.Falldown = 0;

  el.Flammable = 0;
  el.Explosive = 0;
  el.Meltable = 0;
  el.Hardness = 15;

  el.Weight = 100;

  el.HeatConduct = 164;
  el.Description = 'Invisible under pressure, allowing particles through.';

  el.Properties = TYPE_SOLID | PROP_NEUTPASS | PROP_PHOTPASS;

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
  parts: Particle[], _pmap: Int32Array[]): number {
  let pressureResistance = f(0.0);
  if (parts[i].tmp > 0)
    pressureResistance = f(parts[i].tmp);
  else
    pressureResistance = f(4.0);

  if (sim.pv[(y / CELL) | 0][(x / CELL) | 0] < -pressureResistance || sim.pv[(y / CELL) | 0][(x / CELL) | 0] > pressureResistance)
    parts[i].tmp2 = 1;
  else
    parts[i].tmp2 = 0;
  return 0;
}

function graphics(_gfctx: GraphicsFuncContext, cpart: Particle, _nx: number, _ny: number, g: Gfx): number {
  //pv[ny/CELL][nx/CELL]>4.0f || pv[ny/CELL][nx/CELL]<-4.0f
  if (cpart.tmp2) {
    g.cola = 100;
    g.colr = 15;
    g.colg = 0;
    g.colb = 150;
    g.pixel_mode = PMODE_BLEND;
  }
  return 0;
}
