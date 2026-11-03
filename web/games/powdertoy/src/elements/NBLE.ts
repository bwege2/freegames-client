// simulation/elements/NBLE.cpp
import { sd } from '../sim/simulationData.ts';
import type { Element } from '../sim/element.ts';
import type { Simulation } from '../sim/simulation.ts';
import type { Particle } from '../sim/particle.ts';
import { f } from '../sim/cpp.ts';
import {
  CELL, CFDS, IPH, IPL, ITH, ITL, NT, PROP_CONDUCTS, PROP_LIFE_DEC, R_TEMP, SC_GAS, TYP, TYPE_GAS,
} from '../sim/config.ts';
import { PT_CO2, PT_ELEC, PT_NBLE, PT_NEUT, PT_PHOT, PT_PLSM } from '../sim/numbers.ts';

export function Element_NBLE(el: Element): void {
  el.Identifier = 'DEFAULT_PT_NBLE';
  el.Name = 'NBLE';
  el.Colour = 0xEB4917;
  el.MenuVisible = 1;
  el.MenuSection = SC_GAS;
  el.Enabled = 1;

  el.Advection = 1.0;
  el.AirDrag = f(f(0.01) * CFDS);
  el.AirLoss = f(0.99);
  el.Loss = f(0.30);
  el.Collision = f(-0.1);
  el.Gravity = 0.0;
  el.Diffusion = f(0.75);
  el.HotAir = f(f(0.001) * CFDS);
  el.Falldown = 0;

  el.Flammable = 0;
  el.Explosive = 0;
  el.Meltable = 0;
  el.Hardness = 1;
  el.PhotonReflectWavelengths = 0x3FFF8000;

  el.Weight = 1;

  el.DefaultProperties.temp = f(f(R_TEMP + 2.0) + f(273.15));
  el.HeatConduct = 106;
  el.Description = 'Noble Gas. Ionizes into plasma when sparked. Diffuses.';

  el.Properties = TYPE_GAS | PROP_CONDUCTS | PROP_LIFE_DEC;

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
  if (parts[i].temp > 5273.15 && sim.pv[(y / CELL) | 0][(x / CELL) | 0] > 100.0) {
    parts[i].tmp |= 0x1;
    //@ NBLE -> CO2 + NEUT + PHOT + sometimes ELEC + PLSM
    if (sim.rng.chance(1, 5)) {
      let j: number;
      const temp = parts[i].temp;
      sim.create_part(i, x, y, PT_CO2);

      j = sim.create_part(-3, x, y, PT_NEUT);
      if (j !== -1)
        parts[j].temp = temp;
      if (sim.rng.chance(1, 25)) {
        j = sim.create_part(-3, x, y, PT_ELEC);
        if (j !== -1)
          parts[j].temp = temp;
      }
      j = sim.create_part(-3, x, y, PT_PHOT);
      if (j !== -1) {
        parts[j].ctype = 0xF800000;
        parts[j].temp = temp;
        parts[j].tmp = 0x1;
      }
      const rx = x + sim.rng.between(-1, 1), ry = y + sim.rng.between(-1, 1), rt = TYP(pmap[ry][rx]);
      if (can_move[PT_PLSM][rt] || rt === PT_NBLE) {
        j = sim.create_part(-3, rx, ry, PT_PLSM);
        if (j !== -1) {
          parts[j].temp = temp;
          parts[j].tmp |= 4;
        }
      }
      parts[i].temp = f(f(temp + 1750) + sim.rng.between(0, 499));
      sim.pv[(y / CELL) | 0][(x / CELL) | 0] += 50;
    }
  }
  return 0;
}
