// simulation/elements/SHLD3.cpp
import type { Element } from '../sim/element.ts';
import type { Simulation } from '../sim/simulation.ts';
import type { Particle } from '../sim/particle.ts';
import { f } from '../sim/cpp.ts';
import { CFDS, ID, IPL, ITH, ITL, NT, PROP_LIFE_DEC, SC_SOLIDS, TYP, TYPE_SOLID } from '../sim/config.ts';
import { PT_NONE, PT_SHLD1, PT_SHLD2, PT_SHLD4, PT_SPRK } from '../sim/numbers.ts';

export function Element_SHLD3(el: Element): void {
  el.Identifier = 'DEFAULT_PT_SHLD3';
  el.Name = 'SHD3';
  el.Colour = 0x444444;
  el.MenuVisible = 0;
  el.MenuSection = SC_SOLIDS;
  el.Enabled = 1;

  el.Advection = f(0.0);
  el.AirDrag = f(f(0.00) * CFDS);
  el.AirLoss = f(1.00);
  el.Loss = f(0.00);
  el.Collision = f(0.0);
  el.Gravity = f(0.0);
  el.Diffusion = f(0.00);
  el.HotAir = f(f(0.000) * CFDS);
  el.Falldown = 0;

  el.Flammable = 0;
  el.Explosive = 0;
  el.Meltable = 0;
  el.Hardness = 1;

  el.Weight = 100;

  el.HeatConduct = 0;
  el.Description = 'Shield lvl 3.';

  el.Properties = TYPE_SOLID|PROP_LIFE_DEC;

  el.LowPressure = IPL;
  el.LowPressureTransition = NT;
  el.HighPressure = f(25.0);
  el.HighPressureTransition = PT_NONE;
  el.LowTemperature = ITL;
  el.LowTemperatureTransition = NT;
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
          if (sim.rng.chance(1, 2500)) {
            const np = sim.create_part(-1, x + rx, y + ry, PT_SHLD1);
            if (np < 0) continue;
            parts[np].life = 7;
            sim.part_change_type(i, x, y, PT_SHLD2);
          }
          continue;
        }
        if (TYP(r) === PT_SHLD1 && parts[i].life > 3) {
          sim.part_change_type(ID(r), x + rx, y + ry, PT_SHLD2);
          parts[ID(r)].life = 7;
        }
        else if (TYP(r) === PT_SPRK && parts[i].life === 0) {
          if (sim.rng.chance(3, 500)) {
            sim.part_change_type(i, x, y, PT_SHLD4);
            parts[i].life = 7;
          }
          for (let nnx = -1; nnx <= 1; nnx++) {
            for (let nny = -1; nny <= 1; nny++) {

              if (!pmap[y + ry + nny][x + rx + nnx]) {
                const np = sim.create_part(-1, x + rx + nnx, y + ry + nny, PT_SHLD1);
                if (np < 0) continue;
                parts[np].life = 7;
              }
            }
          }
        }
      }
    }
  }
  return 0;
}
