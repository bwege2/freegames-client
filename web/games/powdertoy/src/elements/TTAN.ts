// simulation/elements/TTAN.cpp
import type { Element } from '../sim/element.ts';
import type { Simulation } from '../sim/simulation.ts';
import type { Particle } from '../sim/particle.ts';
import { f } from '../sim/cpp.ts';
import {
  CELL, CFDS, IPH, IPL, ITL, NT, PROP_CONDUCTS, PROP_HOT_GLOW, PROP_LIFE_DEC, SC_SOLIDS, TYPE_SOLID, TYP,
} from '../sim/config.ts';
import { PT_LAVA, PT_TTAN } from '../sim/numbers.ts';

export function Element_TTAN(el: Element): void {
  el.Identifier = 'DEFAULT_PT_TTAN';
  el.Name = 'TTAN';
  el.Colour = 0x909090; // 0x909090_rgb
  el.MenuVisible = 1;
  el.MenuSection = SC_SOLIDS;
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
  el.Meltable = 1;
  el.Hardness = 48;

  el.Weight = 100;

  el.HeatConduct = 251;
  el.Description = 'Titanium. Higher melting temperature than most other metals, blocks all air pressure.';

  el.Properties = TYPE_SOLID | PROP_CONDUCTS | PROP_HOT_GLOW | PROP_LIFE_DEC;

  el.LowPressure = IPL;
  el.LowPressureTransition = NT;
  el.HighPressure = IPH;
  el.HighPressureTransition = NT;
  el.LowTemperature = ITL;
  el.LowTemperatureTransition = NT;
  el.HighTemperature = 1941.0;
  el.HighTemperatureTransition = PT_LAVA; //@ TTAN -> LAVA(TTAN)

  el.Update = update;
}

function update(sim: Simulation, i: number, x: number, y: number, _surround_space: number, nt: number,
  parts: Particle[], pmap: Int32Array[]): number {
  let ttan = 0;
  if (nt <= 2)
    ttan = 2;
  else if (parts[i].tmp)
    ttan = 2;
  else if (nt <= 6) {
    for (let rx = -1; rx <= 1; rx++) {
      for (let ry = -1; ry <= 1; ry++) {
        if (!rx !== !ry) {
          if (TYP(pmap[y + ry][x + rx]) === PT_TTAN)
            ttan++;
        }
      }
    }
  }

  if (ttan >= 2) {
    sim.air.bmap_blockair[(y / CELL) | 0][(x / CELL) | 0] = 1;
    sim.air.bmap_blockairh[(y / CELL) | 0][(x / CELL) | 0] = 0x8;
  }
  return 0;
}
