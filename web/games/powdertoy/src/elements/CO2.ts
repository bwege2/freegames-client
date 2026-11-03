// simulation/elements/CO2.cpp
import type { Element } from '../sim/element.ts';
import type { Simulation } from '../sim/simulation.ts';
import type { Particle } from '../sim/particle.ts';
import { f } from '../sim/cpp.ts';
import { CELL, CFDS, ID, IPH, IPL, ITH, MAX_TEMP, NT, SC_GAS, TYP, TYPE_GAS } from '../sim/config.ts';
import { PT_CBNW, PT_DRIC, PT_DSTW, PT_ELEC, PT_FIRE, PT_NEUT, PT_O2, PT_WATR } from '../sim/numbers.ts';

export function Element_CO2(el: Element): void {
  el.Identifier = 'DEFAULT_PT_CO2';
  el.Name = 'CO2';
  el.Colour = 0x666666;
  el.MenuVisible = 1;
  el.MenuSection = SC_GAS;
  el.Enabled = 1;

  el.Advection = 2.0;
  el.AirDrag = f(f(0.00) * CFDS);
  el.AirLoss = f(0.99);
  el.Loss = f(0.30);
  el.Collision = f(-0.1);
  el.Gravity = f(0.1);
  el.Diffusion = 1.0;
  el.HotAir = f(f(0.000) * CFDS);
  el.Falldown = 1;

  el.Flammable = 0;
  el.Explosive = 0;
  el.Meltable = 0;
  el.Hardness = 0;

  el.Weight = 1;

  el.HeatConduct = 88;
  el.Description = 'Carbon Dioxide. Heavy gas, drifts downwards. Carbonates water and turns to dry ice when cold.';

  el.Properties = TYPE_GAS;

  el.LowPressure = IPL;
  el.LowPressureTransition = NT;
  el.HighPressure = IPH;
  el.HighPressureTransition = NT;
  el.LowTemperature = f(194.65);
  el.LowTemperatureTransition = PT_DRIC; //@ CO2 -> DRIC
  el.HighTemperature = ITH;
  el.HighTemperatureTransition = NT;

  el.Update = update;
}

function update(sim: Simulation, i: number, x: number, y: number, _surround_space: number, _nt: number,
  parts: Particle[], pmap: Int32Array[]): number {
  for (let rx = -1; rx <= 1; rx++) {
    for (let ry = -1; ry <= 1; ry++) {
      if (rx || ry) {
        const r = pmap[y + ry][x + rx];
        if (!r) {
          if (parts[i].ctype === 5 && sim.rng.chance(1, 2000)) {
            //@ CO2 -> WATR
            if (sim.create_part(-1, x + rx, y + ry, PT_WATR) >= 0)
              parts[i].ctype = 0;
          }
          continue;
        }
        if (TYP(r) === PT_FIRE) {
          sim.kill_part(ID(r));
          if (sim.rng.chance(1, 30)) {
            sim.kill_part(i);
            return 1;
          }
        }
        else if ((TYP(r) === PT_WATR || TYP(r) === PT_DSTW) && sim.rng.chance(1, 50)) {
          sim.part_change_type(ID(r), x + rx, y + ry, PT_CBNW);
          if (parts[i].ctype === 5) //conserve number of water particles - ctype=5 means this CO2 hasn't released the water particle from BUBW yet
          {
            //@ CO2 + WATR/DSTW -> WATR + CBNW
            sim.create_part(i, x, y, PT_WATR);
            return 0;
          }
          else {
            //@ CO2 + WATR/DSTW -> CBNW
            sim.kill_part(i);
            return 1;
          }
        }
      }
    }
  }
  if (parts[i].temp > 9773.15 && sim.pv[(y / CELL) | 0][(x / CELL) | 0] > 200.0) {
    if (sim.rng.chance(1, 5)) {
      let j: number;
      //@ CO2 -> O2 + NEUT
      sim.create_part(i, x, y, PT_O2);
      j = sim.create_part(-3, x, y, PT_NEUT);
      if (j !== -1)
        parts[j].temp = MAX_TEMP;
      if (sim.rng.chance(1, 50)) {
        //@ CO2 -> O2 + NEUT + ELEC
        j = sim.create_part(-3, x, y, PT_ELEC);
        if (j !== -1)
          parts[j].temp = MAX_TEMP;
      }
      parts[i].temp = MAX_TEMP;
      sim.pv[(y / CELL) | 0][(x / CELL) | 0] += 100;
    }
  }
  return 0;
}
