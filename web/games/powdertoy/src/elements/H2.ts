// simulation/elements/H2.cpp
import { sd } from '../sim/simulationData.ts';
import type { Element } from '../sim/element.ts';
import type { Simulation } from '../sim/simulation.ts';
import type { Particle } from '../sim/particle.ts';
import { f } from '../sim/cpp.ts';
import { CELL, CFDS, IPH, IPL, ITH, ITL, NT, PROP_PHOTPASS, SC_GAS, TYPE_GAS, TYP, ID } from '../sim/config.ts';
import {
  PT_BMTL, PT_DESL, PT_ELEC, PT_FIRE, PT_H2, PT_LAVA, PT_NBLE, PT_NEUT, PT_OIL, PT_PHOT, PT_PLSM, PT_WATR,
} from '../sim/numbers.ts';

export function Element_H2(el: Element): void {
  el.Identifier = 'DEFAULT_PT_H2';
  el.Name = 'HYGN';
  el.Colour = 0x5070FF; // 0x5070FF_rgb
  el.MenuVisible = 1;
  el.MenuSection = SC_GAS;
  el.Enabled = 1;

  el.Advection = 2.0;
  el.AirDrag = f(f(0.00) * CFDS);
  el.AirLoss = f(0.99);
  el.Loss = f(0.30);
  el.Collision = f(-0.10);
  el.Gravity = f(0.00);
  el.Diffusion = 3.00;
  el.HotAir = f(f(0.000) * CFDS);
  el.Falldown = 0;

  el.Flammable = 0;
  el.Explosive = 0;
  el.Meltable = 0;
  el.Hardness = 0;

  el.Weight = 1;

  el.HeatConduct = 251;
  el.Description = 'Hydrogen. Combusts with OXYG to make WATR. Undergoes fusion at high temperature and pressure.';

  el.Properties = TYPE_GAS | PROP_PHOTPASS;

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
  const can_move = sd.can_move;
  for (let rx = -2; rx <= 2; rx++) {
    for (let ry = -2; ry <= 2; ry++) {
      if (rx || ry) {
        const r = pmap[y + ry][x + rx];
        if (!r)
          continue;
        const rt = TYP(r);
        if (sim.pv[(y / CELL) | 0][(x / CELL) | 0] > 8.0 && rt === PT_DESL) {
          //@ H2 + DESL -> OIL + WATR
          sim.part_change_type(ID(r), x + rx, y + ry, PT_WATR);
          sim.part_change_type(i, x, y, PT_OIL);
          return 1;
        }
        if (sim.pv[(y / CELL) | 0][(x / CELL) | 0] > 45.0) {
          if (parts[ID(r)].temp > 2273.15)
            continue;
        }
        else {
          if (rt === PT_FIRE) {
            if (parts[ID(r)].tmp & 0x02)
              parts[ID(r)].temp = 3473.0;
            else
              parts[ID(r)].temp = f(2473.15);
            parts[ID(r)].tmp |= 1;
            //@ H2 + FIRE -> 2xFIRE
            sim.create_part(i, x, y, PT_FIRE);
            parts[i].temp = f(parts[i].temp + sim.rng.between(0, 99));
            parts[i].tmp |= 1;
            return 1;
          }
          else if ((rt === PT_PLSM && !(parts[ID(r)].tmp & 4)) || (rt === PT_LAVA && parts[ID(r)].ctype !== PT_BMTL)) {
            //@ H2 + PLSM/LAVA -> FIRE + PLSM/LAVA
            sim.create_part(i, x, y, PT_FIRE);
            parts[i].temp = f(parts[i].temp + sim.rng.between(0, 99));
            parts[i].tmp |= 1;
            return 1;
          }
        }
      }
    }
  }
  if (parts[i].temp > 2273.15 && sim.pv[(y / CELL) | 0][(x / CELL) | 0] > 50.0) {
    if (sim.rng.chance(1, 5)) {
      let j: number;
      const temp = parts[i].temp;
      sim.create_part(i, x, y, PT_NBLE);
      parts[i].tmp = 0x1;

      //@ H2 -> NBLE + NEUT + PHOT
      j = sim.create_part(-3, x, y, PT_NEUT);
      if (j > -1)
        parts[j].temp = temp;
      if (sim.rng.chance(1, 10)) {
        //@ H2 -> NBLE + NEUT + PHOT + ELEC
        j = sim.create_part(-3, x, y, PT_ELEC);
        if (j > -1)
          parts[j].temp = temp;
      }
      j = sim.create_part(-3, x, y, PT_PHOT);
      if (j > -1) {
        parts[j].ctype = 0x7C0000;
        parts[j].temp = temp;
        parts[j].tmp = 0x1;
      }
      const rx = x + sim.rng.between(-1, 1), ry = y + sim.rng.between(-1, 1), rt = TYP(pmap[ry][rx]);
      if (can_move[PT_PLSM][rt] || rt === PT_H2) {
        //@ H2 -> NBLE + NEUT + PHOT + ELEC + PLSM
        j = sim.create_part(-3, rx, ry, PT_PLSM);
        if (j > -1) {
          parts[j].temp = temp;
          parts[j].tmp |= 4;
        }
      }
      parts[i].temp = f(temp + sim.rng.between(750, 1249));
      sim.pv[(y / CELL) | 0][(x / CELL) | 0] = f(sim.pv[(y / CELL) | 0][(x / CELL) | 0] + 30);
      return 1;
    }
  }
  return 0;
}
