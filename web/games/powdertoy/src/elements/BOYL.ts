// simulation/elements/BOYL.cpp
import type { Element } from '../sim/element.ts';
import type { Simulation } from '../sim/simulation.ts';
import type { Particle } from '../sim/particle.ts';
import { f } from '../sim/cpp.ts';
import { CELL, CFDS, IPH, IPL, ITH, ITL, NT, R_TEMP, SC_GAS, TYPE_GAS, TYP, ID } from '../sim/config.ts';
import { PT_FOG, PT_O2, PT_WATR } from '../sim/numbers.ts';

export function Element_BOYL(el: Element): void {
  el.Identifier = 'DEFAULT_PT_BOYL';
  el.Name = 'BOYL';
  el.Colour = 0x0A3200; // 0x0A3200_rgb
  el.MenuVisible = 1;
  el.MenuSection = SC_GAS;
  el.Enabled = 1;

  el.Advection = 1.0;
  el.AirDrag = f(f(0.01) * CFDS);
  el.AirLoss = f(0.99);
  el.Loss = f(0.30);
  el.Collision = f(-0.1);
  el.Gravity = 0.0;
  el.Diffusion = f(0.18);
  el.HotAir = f(f(0.000) * CFDS);
  el.Falldown = 0;

  el.Flammable = 0;
  el.Explosive = 0;
  el.Meltable = 0;
  el.Hardness = 1;

  el.Weight = 1;

  el.DefaultProperties.temp = f(f(R_TEMP + 2.0) + f(273.15)); // R_TEMP + 2.0f + 273.15f
  el.HeatConduct = 42;
  el.Description = 'Boyle, variable pressure gas. Expands when heated.';

  el.Properties = TYPE_GAS;

  el.LowPressure = IPL;
  el.LowPressureTransition = NT;
  el.HighPressure = IPH;
  el.HighPressureTransition = NT;
  el.LowTemperature = ITL;
  el.LowTemperatureTransition = NT;
  el.HighTemperature = ITH;
  el.HighTemperatureTransition = NT;

  el.Update = update;
}

function update(sim: Simulation, i: number, x: number, y: number, _surround_space: number, _nt: number,
  parts: Particle[], pmap: Int32Array[]): number {
  const pv = sim.pv;
  const cy = (y / CELL) | 0, cx = (x / CELL) | 0;
  const limit = f(parts[i].temp / 100);
  if (pv[cy][cx] < limit)
    pv[cy][cx] = f(pv[cy][cx] + f(f(0.001) * f(limit - pv[cy][cx])));
  if (pv[cy + 1][cx] < limit)
    pv[cy + 1][cx] = f(pv[cy + 1][cx] + f(f(0.001) * f(limit - pv[cy + 1][cx])));
  if (pv[cy - 1][cx] < limit)
    pv[cy - 1][cx] = f(pv[cy - 1][cx] + f(f(0.001) * f(limit - pv[cy - 1][cx])));

  pv[cy][cx + 1] = f(pv[cy][cx + 1] + f(f(0.001) * f(limit - pv[cy][cx + 1])));
  pv[cy + 1][cx + 1] = f(pv[cy + 1][cx + 1] + f(f(0.001) * f(limit - pv[cy + 1][cx + 1])));
  pv[cy][cx - 1] = f(pv[cy][cx - 1] + f(f(0.001) * f(limit - pv[cy][cx - 1])));
  pv[cy - 1][cx - 1] = f(pv[cy - 1][cx - 1] + f(f(0.001) * f(limit - pv[cy - 1][cx - 1])));

  for (let rx = -1; rx <= 1; rx++) {
    for (let ry = -1; ry <= 1; ry++) {
      if (rx || ry) {
        const r = pmap[y + ry][x + rx];
        if (!r)
          continue;
        if (TYP(r) === PT_WATR) {
          //@ BOYL + WATR -> BOYL + FOG
          if (sim.rng.chance(1, 30))
            sim.part_change_type(ID(r), x + rx, y + ry, PT_FOG);
        }
        else if (TYP(r) === PT_O2) {
          //@ BOYL + O2 -> WATR
          if (sim.rng.chance(1, 9)) {
            sim.kill_part(ID(r));
            sim.part_change_type(i, x, y, PT_WATR);
            pv[cy][cx] = pv[cy][cx] + 4.0;
            return 1;
          }
        }
      }
    }
  }
  return 0;
}
