// simulation/elements/BREC.cpp
import type { Element } from '../sim/element.ts';
import type { Simulation } from '../sim/simulation.ts';
import type { Particle } from '../sim/particle.ts';
import { f } from '../sim/cpp.ts';
import {
  CELL, CFDS, IPH, IPL, ITH, ITL, NT, PROP_CONDUCTS, PROP_HOT_GLOW, PROP_LIFE_DEC, SC_POWDERS, TYPE_PART,
} from '../sim/config.ts';
import { PT_EXOT } from '../sim/numbers.ts';

export function Element_BREC(el: Element): void {
  el.Identifier = 'DEFAULT_PT_BREC';
  el.Name = 'BREL';
  el.Colour = 0x707060; // 0x707060_rgb
  el.MenuVisible = 1;
  el.MenuSection = SC_POWDERS;
  el.Enabled = 1;

  el.Advection = f(0.4);
  el.AirDrag = f(f(0.04) * CFDS);
  el.AirLoss = f(0.94);
  el.Loss = f(0.95);
  el.Collision = f(-0.1);
  el.Gravity = f(0.18);
  el.Diffusion = f(0.00);
  el.HotAir = f(f(0.000) * CFDS);
  el.Falldown = 1;

  el.Flammable = 0;
  el.Explosive = 0;
  el.Meltable = 2;
  el.Hardness = 2;

  el.Weight = 90;

  el.HeatConduct = 211;
  el.Description = 'Broken electronics. Formed from EMP blasts, and when constantly sparked while under pressure, turns to EXOT.';

  el.Properties = TYPE_PART | PROP_CONDUCTS | PROP_LIFE_DEC | PROP_HOT_GLOW;

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
  parts: Particle[], _pmap: Int32Array[]): number {
  if (parts[i].life) {
    if (sim.pv[(y / CELL) | 0][(x / CELL) | 0] > 10.0) {
      if (parts[i].temp > 9000 && sim.pv[(y / CELL) | 0][(x / CELL) | 0] > 30.0 && sim.rng.chance(1, 200)) {
        //@ BREC -> EXOT
        sim.part_change_type(i, x, y, PT_EXOT);
        parts[i].life = 1000;
      }
      parts[i].temp = f(parts[i].temp + f((sim.pv[(y / CELL) | 0][(x / CELL) | 0]) / 8));
    }

  }
  return 0;
}
