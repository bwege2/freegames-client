// simulation/elements/GPMP.cpp
import type { Element, GraphicsFuncContext, Gfx } from '../sim/element.ts';
import type { Simulation } from '../sim/simulation.ts';
import type { Particle } from '../sim/particle.ts';
import { f } from '../sim/cpp.ts';
import { CELL, CFDS, IPH, IPL, ITH, ITL, NT, SC_POWERED, TYPE_SOLID, XCELLS, TYP, ID } from '../sim/config.ts';
import { PT_GPMP } from '../sim/numbers.ts';

export function Element_GPMP(el: Element): void {
  el.Identifier = 'DEFAULT_PT_GPMP';
  el.Name = 'GPMP';
  el.Colour = 0x0A3B3B; // 0x0A3B3B_rgb
  el.MenuVisible = 1;
  el.MenuSection = SC_POWERED;
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

  el.HeatConduct = 0;
  el.Description = 'Gravity pump. Changes gravity to its temp when activated. (use HEAT/COOL)';

  el.Properties = TYPE_SOLID;

  el.LowPressure = IPL;
  el.LowPressureTransition = NT;
  el.HighPressure = IPH;
  el.HighPressureTransition = NT;
  el.LowTemperature = ITL;
  el.LowTemperatureTransition = NT;
  el.HighTemperature = ITH;
  el.HighTemperatureTransition = NT;

  el.DefaultProperties.life = 10;

  el.Update = update;
  el.Graphics = graphics;
}

function update(sim: Simulation, i: number, x: number, y: number, _surround_space: number, _nt: number,
  parts: Particle[], pmap: Int32Array[]): number {
  if (parts[i].life !== 10) {
    if (parts[i].life > 0)
      parts[i].life--;
  }
  else {
    if (parts[i].temp >= f(256.0 + f(273.15)))
      parts[i].temp = f(256.0 + f(273.15));
    if (parts[i].temp <= f(-256.0 + f(273.15)))
      parts[i].temp = f(-256.0 + f(273.15));

    // 0.2f * (temp - 273.15) is computed in double
    sim.gravIn.mass[((y / CELL) | 0) * XCELLS + ((x / CELL) | 0)] = f(0.2) * (parts[i].temp - 273.15);
    for (let rx = -2; rx <= 2; rx++) {
      for (let ry = -2; ry <= 2; ry++) {
        if (rx || ry) {
          const r = pmap[y + ry][x + rx];
          if (!r)
            continue;
          if (TYP(r) === PT_GPMP) {
            if (parts[ID(r)].life < 10 && parts[ID(r)].life > 0)
              parts[i].life = 9;
            else if (parts[ID(r)].life === 0)
              parts[ID(r)].life = 10;
          }
        }
      }
    }
  }
  return 0;
}

function graphics(_gfctx: GraphicsFuncContext, cpart: Particle, _nx: number, _ny: number, g: Gfx): number {
  const lifemod = ((cpart.life > 10 ? 10 : cpart.life) * 19);
  g.colg += lifemod;
  g.colb += lifemod;
  return 0;
}
