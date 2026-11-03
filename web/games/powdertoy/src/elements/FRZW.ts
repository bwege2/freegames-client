// simulation/elements/FRZW.cpp
import type { Element } from '../sim/element.ts';
import type { Simulation } from '../sim/simulation.ts';
import type { Particle } from '../sim/particle.ts';
import { f, restrict_flt } from '../sim/cpp.ts';
import {
  CFDS, ID, IPH, IPL, ITH, MAX_TEMP, MIN_TEMP, NT, PROP_LIFE_DEC, SC_LIQUID, TYP, TYPE_LIQUID,
} from '../sim/config.ts';
import { PT_FRZW, PT_ICEI, PT_WATR } from '../sim/numbers.ts';

export function Element_FRZW(el: Element): void {
  el.Identifier = 'DEFAULT_PT_FRZW';
  el.Name = 'FRZW';
  el.Colour = 0x1020C0;
  el.MenuVisible = 0;
  el.MenuSection = SC_LIQUID;
  el.Enabled = 1;

  el.Advection = f(0.6);
  el.AirDrag = f(f(0.01) * CFDS);
  el.AirLoss = f(0.98);
  el.Loss = f(0.95);
  el.Collision = f(0.0);
  el.Gravity = f(0.1);
  el.Diffusion = f(0.00);
  el.HotAir = f(f(0.000) * CFDS);
  el.Falldown = 2;

  el.Flammable = 0;
  el.Explosive = 0;
  el.Meltable = 0;
  el.Hardness = 20;

  el.Weight = 30;

  el.DefaultProperties.temp = f(120.0);
  el.HeatConduct = 29;
  el.Description = 'Freeze water. Hybrid liquid formed when Freeze powder melts.';

  el.Properties = TYPE_LIQUID | PROP_LIFE_DEC;

  el.LowPressure = IPL;
  el.LowPressureTransition = NT;
  el.HighPressure = IPH;
  el.HighPressureTransition = NT;
  el.LowTemperature = f(53.0);
  el.LowTemperatureTransition = PT_ICEI; //@ FRZW -> ICEI(FRZW)
  el.HighTemperature = ITH;
  el.HighTemperatureTransition = NT;

  el.DefaultProperties.life = 100;

  el.Update = update;
}

function update(sim: Simulation, i: number, x: number, y: number, _surround_space: number, _nt: number,
  parts: Particle[], pmap: Int32Array[]): number {
  for (let rx = -1; rx <= 1; rx++) {
    for (let ry = -1; ry <= 1; ry++) {
      if (rx || ry) {
        const r = pmap[y + ry][x + rx];
        if (!r)
          continue;
        if (TYP(r) === PT_WATR && sim.rng.chance(1, 14)) {
          //@ FRZW + WATR -> 2xFRZW
          sim.part_change_type(ID(r), x + rx, y + ry, PT_FRZW);
        }
      }
    }
  }
  if ((parts[i].life === 0 && sim.rng.chance(1, 192)) || sim.rng.chance(100 - parts[i].life, 50000)) {
    //@ FRZW -> ICEI(FRZW)
    sim.part_change_type(i, x, y, PT_ICEI);
    parts[i].ctype = PT_FRZW;
    parts[i].temp = restrict_flt(f(parts[i].temp - f(200.0)), MIN_TEMP, MAX_TEMP);
  }
  return 0;
}
