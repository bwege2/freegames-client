// simulation/elements/O2.cpp
import { sd } from '../sim/simulationData.ts';
import type { Element } from '../sim/element.ts';
import type { Simulation } from '../sim/simulation.ts';
import type { Particle } from '../sim/particle.ts';
import { f } from '../sim/cpp.ts';
import {
  CELL, CFDS, ID, IPH, IPL, ITH, MAX_PRESSURE, MAX_TEMP, NT, SC_GAS, TYP, TYPE_GAS, XCELLS,
} from '../sim/config.ts';
import { PT_BRMT, PT_FIRE, PT_GRVT, PT_LO2, PT_NEUT, PT_O2, PT_PHOT, PT_PLSM } from '../sim/numbers.ts';

export function Element_O2(el: Element): void {
  el.Identifier = 'DEFAULT_PT_O2';
  el.Name = 'OXYG';
  el.Colour = 0x80A0FF;
  el.MenuVisible = 1;
  el.MenuSection = SC_GAS;
  el.Enabled = 1;

  el.Advection = 2.0;
  el.AirDrag = f(f(0.00) * CFDS);
  el.AirLoss = f(0.99);
  el.Loss = f(0.30);
  el.Collision = f(-0.1);
  el.Gravity = 0.0;
  el.Diffusion = 3.0;
  el.HotAir = f(f(0.000) * CFDS);
  el.Falldown = 0;

  el.Flammable = 0;
  el.Explosive = 0;
  el.Meltable = 0;
  el.Hardness = 0;

  el.Weight = 1;

  el.HeatConduct = 70;
  el.Description = 'Oxygen gas. Ignites easily.';

  el.Properties = TYPE_GAS;

  el.LowPressure = IPL;
  el.LowPressureTransition = NT;
  el.HighPressure = IPH;
  el.HighPressureTransition = NT;
  el.LowTemperature = 90.0;
  el.LowTemperatureTransition = PT_LO2; //@ O2 -> LO2
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
        if (TYP(r) === PT_FIRE) {
          parts[ID(r)].temp += sim.rng.between(0, 99);
          if (parts[ID(r)].tmp & 0x01)
            parts[ID(r)].temp = 3473;
          parts[ID(r)].tmp |= 2;
          //@ O2 + FIRE -> 2xFIRE
          sim.create_part(i, x, y, PT_FIRE);
          parts[i].temp += sim.rng.between(0, 99);
          parts[i].tmp |= 2;
        }
        else if (TYP(r) === PT_PLSM && !(parts[ID(r)].tmp & 4)) {
          //@ O2 + PLSM -> FIRE + PLSM
          sim.create_part(i, x, y, PT_FIRE);
          parts[i].temp += sim.rng.between(0, 99);
          parts[i].tmp |= 2;
        }
      }
    }
  }
  if (parts[i].temp > 9973.15 && sim.pv[(y / CELL) | 0][(x / CELL) | 0] > 250.0) {
    const gravx = sim.gravOut.forceX[((y / CELL) | 0) * XCELLS + ((x / CELL) | 0)];
    const gravy = sim.gravOut.forceY[((y / CELL) | 0) * XCELLS + ((x / CELL) | 0)];
    //@ O2 -> BRMT + NEUT + PHOT + GRVT + sometimes PLSM
    if (f(f(gravx * gravx) + f(gravy * gravy)) > 400) {
      if (sim.rng.chance(1, 5)) {
        let j: number;
        sim.create_part(i, x, y, PT_BRMT);
        j = sim.create_part(-3, x, y, PT_NEUT);
        if (j !== -1)
          parts[j].temp = MAX_TEMP;
        j = sim.create_part(-3, x, y, PT_PHOT);
        if (j !== -1) {
          parts[j].temp = MAX_TEMP;
          parts[j].tmp = 0x1;
        }
        const rx = x + sim.rng.between(-1, 1), ry = y + sim.rng.between(-1, 1), r = TYP(pmap[ry][rx]);
        if (can_move[PT_PLSM][r] || r === PT_O2) {
          j = sim.create_part(-3, rx, ry, PT_PLSM);
          if (j > -1) {
            parts[j].temp = MAX_TEMP;
            parts[j].tmp |= 4;
          }
        }
        j = sim.create_part(-3, x, y, PT_GRVT);
        if (j !== -1)
          parts[j].temp = MAX_TEMP;
        parts[i].temp = MAX_TEMP;
        sim.pv[(y / CELL) | 0][(x / CELL) | 0] = MAX_PRESSURE;
      }
    }
  }
  return 0;
}
