// simulation/elements/IRON.cpp
import type { Element } from '../sim/element.ts';
import type { Simulation } from '../sim/simulation.ts';
import type { Particle } from '../sim/particle.ts';
import { f } from '../sim/cpp.ts';
import {
  CFDS, IPH, IPL, ITL, NT, PROP_CONDUCTS, PROP_HOT_GLOW, PROP_LIFE_DEC, SC_SOLIDS, TYP, TYPE_SOLID,
} from '../sim/config.ts';
import { PT_BMTL, PT_LAVA, PT_LO2, PT_O2, PT_SALT, PT_SLTW, PT_WATR } from '../sim/numbers.ts';

export function Element_IRON(el: Element): void {
  el.Identifier = 'DEFAULT_PT_IRON';
  el.Name = 'IRON';
  el.Colour = 0x707070;
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
  el.Hardness = 49;

  el.Weight = 100;

  el.HeatConduct = 251;
  el.Description = 'Rusts with salt, can be used for electrolysis of WATR.';

  el.Properties = TYPE_SOLID | PROP_CONDUCTS | PROP_LIFE_DEC | PROP_HOT_GLOW;

  el.LowPressure = IPL;
  el.LowPressureTransition = NT;
  el.HighPressure = IPH;
  el.HighPressureTransition = NT;
  el.LowTemperature = ITL;
  el.LowTemperatureTransition = NT;
  el.HighTemperature = 1687.0;
  el.HighTemperatureTransition = PT_LAVA; //@ IRON -> LAVA(IRON)

  el.Update = update;
}

function update(sim: Simulation, i: number, x: number, y: number, _surround_space: number, _nt: number,
  parts: Particle[], pmap: Int32Array[]): number {
  if (parts[i].life)
    return 0;
  const tryBreak = (): boolean => {
    for (let rx = -1; rx <= 1; rx++) {
      for (let ry = -1; ry <= 1; ry++) {
        if (rx || ry) {
          const r = pmap[y + ry][x + rx];
          switch (TYP(r)) {
            case PT_SALT:
              //@ IRON + SALT -> BMTL + SALT
              if (sim.rng.chance(1, 47))
                return true;
              break;
            case PT_SLTW:
              //@ IRON + SLTW -> BMTL + SLTW
              if (sim.rng.chance(1, 67))
                return true;
              break;
            case PT_WATR:
              //@ IRON + WATR -> BMTL + WATR
              if (sim.rng.chance(1, 1200))
                return true;
              break;
            case PT_O2:
              //@ IRON + O2 -> BMTL + O2
              if (sim.rng.chance(1, 250))
                return true;
              break;
            case PT_LO2:
              //@ IRON + LO2 -> BMTL + LO2
              return true;
            default:
              break;
          }
        }
      }
    }
    return false;
  };
  if (tryBreak()) {
    sim.part_change_type(i, x, y, PT_BMTL);
    parts[i].tmp = sim.rng.between(20, 29);
  }
  return 0;
}
