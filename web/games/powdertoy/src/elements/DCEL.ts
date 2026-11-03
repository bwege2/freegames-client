// simulation/elements/DCEL.cpp
import { sd } from '../sim/simulationData.ts';
import type { Element, GraphicsFuncContext, Gfx } from '../sim/element.ts';
import type { Simulation } from '../sim/simulation.ts';
import type { Particle } from '../sim/particle.ts';
import { f } from '../sim/cpp.ts';
import {
  CFDS, IPH, IPL, ITH, ITL, NT, PMODE_GLOW, SC_FORCE, TYPE_ENERGY, TYPE_GAS, TYPE_LIQUID, TYPE_PART, TYPE_SOLID,
  TYP, ID,
} from '../sim/config.ts';

export function Element_DCEL(el: Element): void {
  el.Identifier = 'DEFAULT_PT_DCEL';
  el.Name = 'DCEL';
  el.Colour = 0x99CC00; // 0x99CC00_rgb
  el.MenuVisible = 1;
  el.MenuSection = SC_FORCE;
  el.Enabled = 1;

  el.Advection = 0.0;
  el.AirDrag = f(f(0.00) * CFDS);
  el.AirLoss = f(0.90);
  el.Loss = f(0.00);
  el.Collision = 0.0;
  el.Gravity = 0.0;
  el.Diffusion = f(0.00);
  el.HotAir = f(f(0.000) * CFDS);
  el.Falldown = 0;

  el.Flammable = 0;
  el.Explosive = 0;
  el.Meltable = 0;
  el.Hardness = 1;

  el.Weight = 100;

  el.HeatConduct = 251;
  el.Description = 'Decelerator, slows down nearby elements.';

  el.Properties = TYPE_SOLID;

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
  let multiplier = f(1.0 / f(1.1));
  if (parts[i].life !== 0) {
    multiplier = f(1.0 - f((parts[i].life > 100 ? 100 : (parts[i].life < 0 ? 0 : parts[i].life)) / 100.0));
  }
  parts[i].tmp = 0;
  for (let rx = -1; rx <= 1; rx++) {
    for (let ry = -1; ry <= 1; ry++) {
      if ((rx || ry) && !(rx && ry)) {
        let r = pmap[y + ry][x + rx];
        if (!r)
          r = sim.photons[y + ry][x + rx];
        if (!r)
          continue;
        if (elements[TYP(r)].Properties & (TYPE_PART | TYPE_LIQUID | TYPE_GAS | TYPE_ENERGY)) {
          parts[ID(r)].vx = f(parts[ID(r)].vx * multiplier);
          parts[ID(r)].vy = f(parts[ID(r)].vy * multiplier);
          parts[i].tmp = 1;
        }
      }
    }
  }
  return 0;
}

function graphics(_gfctx: GraphicsFuncContext, cpart: Particle, _nx: number, _ny: number, g: Gfx): number {
  if (cpart.tmp)
    g.pixel_mode |= PMODE_GLOW;
  return 0;
}
