// simulation/elements/CAUS.cpp
import { sd } from '../sim/simulationData.ts';
import type { Element } from '../sim/element.ts';
import type { Simulation } from '../sim/simulation.ts';
import type { Particle } from '../sim/particle.ts';
import { f } from '../sim/cpp.ts';
import { CELL, CFDS, ID, IPH, IPL, ITH, ITL, NT, PROP_DEADLY, SC_GAS, TYP, TYPE_GAS } from '../sim/config.ts';
import {
  PT_ACID, PT_CAUS, PT_CLNE, PT_FOG, PT_GAS, PT_GLAS, PT_PCLN, PT_RFGL, PT_RFRG, PT_RIME,
} from '../sim/numbers.ts';

export function Element_CAUS(el: Element): void {
  el.Identifier = 'DEFAULT_PT_CAUS';
  el.Name = 'CAUS';
  el.Colour = 0x80FFA0;
  el.MenuVisible = 1;
  el.MenuSection = SC_GAS;
  el.Enabled = 1;

  el.Advection = 2.0;
  el.AirDrag = f(f(0.00) * CFDS);
  el.AirLoss = f(0.99);
  el.Loss = f(0.30);
  el.Collision = f(-0.1);
  el.Gravity = 0.0;
  el.Diffusion = f(1.50);
  el.HotAir = f(f(0.000) * CFDS);
  el.Falldown = 0;

  el.Flammable = 0;
  el.Explosive = 0;
  el.Meltable = 0;
  el.Hardness = 0;

  el.Weight = 1;

  el.HeatConduct = 70;
  el.Description = 'Caustic Gas, acts like ACID.';

  el.Properties = TYPE_GAS | PROP_DEADLY;

  el.LowPressure = IPL;
  el.LowPressureTransition = NT;
  el.HighPressure = IPH;
  el.HighPressureTransition = NT;
  el.LowTemperature = ITL;
  el.LowTemperatureTransition = NT;
  el.HighTemperature = ITH;
  el.HighTemperatureTransition = NT;

  el.DefaultProperties.life = 75;

  el.Update = update;
}

function update(sim: Simulation, i: number, x: number, y: number, _surround_space: number, _nt: number,
  parts: Particle[], pmap: Int32Array[]): number {
  const elements = sd.elements;
  let converted = false;
  for (let rx = -2; rx <= 2; rx++) {
    for (let ry = -2; ry <= 2; ry++) {
      if (rx || ry) {
        const r = pmap[y + ry][x + rx];
        if (!r)
          continue;
        if (TYP(r) === PT_GAS) {
          if (sim.pv[((y + ry) / CELL) | 0][((x + rx) / CELL) | 0] > 3) {
            //@ CAUS + GAS -> 2xRFRG
            sim.part_change_type(ID(r), x + rx, y + ry, PT_RFRG);
            sim.part_change_type(i, x, y, PT_RFRG);
            converted = true;
          }
        }
        else if (TYP(r) !== PT_ACID && TYP(r) !== PT_CAUS && TYP(r) !== PT_RFRG && TYP(r) !== PT_RFGL) {
          if ((TYP(r) !== PT_CLNE && TYP(r) !== PT_PCLN && ((TYP(r) !== PT_FOG && TYP(r) !== PT_RIME) || parts[ID(r)].tmp <= 5) && sim.rng.chance(elements[TYP(r)].Hardness, 1000)) && parts[i].life > 50) {
            // GLAS protects stuff from acid
            if (sim.parts_avg(i, ID(r), PT_GLAS) !== PT_GLAS) {
              let newtemp = f(f(60.0 - elements[TYP(r)].Hardness) * 7.0);
              if (newtemp < 0)
                newtemp = 0;
              parts[i].temp += newtemp;
              parts[i].life--;
              sim.kill_part(ID(r));
            }
          }
          else if (parts[i].life <= 50) {
            sim.kill_part(i);
            return 1;
          }
        }
      }
    }
  }
  return converted ? 1 : 0;
}
