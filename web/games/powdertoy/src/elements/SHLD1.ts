// simulation/elements/SHLD1.cpp
import type { Element } from '../sim/element.ts';
import type { Simulation } from '../sim/simulation.ts';
import type { Particle } from '../sim/particle.ts';
import { f } from '../sim/cpp.ts';
import { CFDS, IPL, ITH, ITL, NT, PROP_LIFE_DEC, SC_SOLIDS, TYP, TYPE_SOLID } from '../sim/config.ts';
import { PT_NONE, PT_SHLD1, PT_SHLD2, PT_SHLD3, PT_SPRK } from '../sim/numbers.ts';

export function Element_SHLD1(el: Element): void {
  el.Identifier = 'DEFAULT_PT_SHLD1';
  el.Name = 'SHLD';
  el.Colour = 0xAAAAAA;
  el.MenuVisible = 1;
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
  el.Description = 'Shield. Grows around spark, broken by pressure.';

  el.Properties = TYPE_SOLID|PROP_LIFE_DEC;

  el.LowPressure = IPL;
  el.LowPressureTransition = NT;
  el.HighPressure = f(7.0);
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
        if (!r)
          continue;
        else if (TYP(r) === PT_SPRK && parts[i].life === 0) {
          if (sim.rng.chance(11, 40)) {
            sim.part_change_type(i, x, y, PT_SHLD2);
            parts[i].life = 7;
          }
          for (let nnx = -1; nnx <= 1; nnx++) {
            for (let nny = -1; nny <= 1; nny++) {
              if (!pmap[y + ry + nny][x + rx + nnx]) {
                sim.create_part(-1, x + rx + nnx, y + ry + nny, PT_SHLD1);
                //parts[ID(pmap[y+ny+nny][x+nx+nnx])].life=7;
              }
            }
          }
        }
        else if (TYP(r) === PT_SHLD3 && sim.rng.chance(2, 5)) {
          sim.part_change_type(i, x, y, PT_SHLD2);
          parts[i].life = 7;
        }
      }
    }
  }
  return 0;
}
