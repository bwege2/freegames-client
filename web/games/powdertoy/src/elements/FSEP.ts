// simulation/elements/FSEP.cpp
import type { Element } from '../sim/element.ts';
import type { Simulation } from '../sim/simulation.ts';
import type { Particle } from '../sim/particle.ts';
import { f } from '../sim/cpp.ts';
import { CFDS, IPH, IPL, ITH, ITL, NT, SC_EXPLOSIVE, TYP, TYPE_PART } from '../sim/config.ts';
import { PT_PLSM, PT_SPRK } from '../sim/numbers.ts';

export function Element_FSEP(el: Element): void {
  el.Identifier = 'DEFAULT_PT_FSEP';
  el.Name = 'FSEP';
  el.Colour = 0x63AD5F;
  el.MenuVisible = 1;
  el.MenuSection = SC_EXPLOSIVE;
  el.Enabled = 1;

  el.Advection = f(0.7);
  el.AirDrag = f(f(0.02) * CFDS);
  el.AirLoss = f(0.96);
  el.Loss = f(0.80);
  el.Collision = 0.0;
  el.Gravity = f(0.1);
  el.Diffusion = f(0.00);
  el.HotAir = f(f(0.000) * CFDS);
  el.Falldown = 1;

  el.Flammable = 0;
  el.Explosive = 0;
  el.Meltable = 0;
  el.Hardness = 27;

  el.Weight = 70;

  el.HeatConduct = 70;
  el.Description = 'Fuse Powder. Burns slowly like FUSE.';

  el.Properties = TYPE_PART;

  el.LowPressure = IPL;
  el.LowPressureTransition = NT;
  el.HighPressure = IPH;
  el.HighPressureTransition = NT;
  el.LowTemperature = ITL;
  el.LowTemperatureTransition = NT;
  el.HighTemperature = ITH;
  el.HighTemperatureTransition = NT;

  el.DefaultProperties.life = 50;

  el.Update = update;
}

function update(sim: Simulation, i: number, x: number, y: number, _surround_space: number, _nt: number,
  parts: Particle[], pmap: Int32Array[]): number {
  //@ FSEP -> FSEP + PLSM
  if (parts[i].life <= 0) {
    const r = sim.create_part(i, x, y, PT_PLSM);
    if (r !== -1)
      parts[r].life = 50;
    return 1;
  }
  else if (parts[i].life < 40) {
    parts[i].life--;
    if (sim.rng.chance(1, 10)) {
      // g++ evaluates the arguments right to left: the y offset is drawn first
      const ry_ = sim.rng.between(-1, 1);
      const rx_ = sim.rng.between(-1, 1);
      const r = sim.create_part(-1, x + rx_, y + ry_, PT_PLSM);
      if (r > -1)
        parts[r].life = 50;
    }
  }
  else {
    for (let rx = -2; rx <= 2; rx++) {
      for (let ry = -2; ry <= 2; ry++) {
        if (rx || ry) {
          const r = pmap[y + ry][x + rx];
          if (!r)
            continue;
          if ((TYP(r) === PT_SPRK || (parts[i].temp >= (273.15 + f(400.0)))) && parts[i].life > 40 && sim.rng.chance(1, 15)) {
            parts[i].life = 39;
          }
        }
      }
    }
  }
  return 0;
}
