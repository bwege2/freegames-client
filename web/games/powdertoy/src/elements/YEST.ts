// simulation/elements/YEST.cpp
import type { Element } from '../sim/element.ts';
import type { Simulation } from '../sim/simulation.ts';
import type { Particle } from '../sim/particle.ts';
import { f } from '../sim/cpp.ts';
import { CFDS, IPH, IPL, ITL, NT, SC_POWDERS, TYP, TYPE_PART } from '../sim/config.ts';
import { PT_DYST, PT_YEST } from '../sim/numbers.ts';

export function Element_YEST(el: Element): void {
  el.Identifier = 'DEFAULT_PT_YEST';
  el.Name = 'YEST';
  el.Colour = 0xEEE0C0;
  el.MenuVisible = 1;
  el.MenuSection = SC_POWDERS;
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

  el.Flammable = 15;
  el.Explosive = 0;
  el.Meltable = 0;
  el.Hardness = 31;

  el.Weight = 80;

  el.HeatConduct = 70;
  el.Description = 'Yeast, grows when warm (~37C).';

  el.Properties = TYPE_PART;

  el.LowPressure = IPL;
  el.LowPressureTransition = NT;
  el.HighPressure = IPH;
  el.HighPressureTransition = NT;
  el.LowTemperature = ITL;
  el.LowTemperatureTransition = NT;
  el.HighTemperature = 373.0;
  el.HighTemperatureTransition = PT_DYST; //@ YEST -> DYST

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
        if (TYP(r) === PT_DYST && sim.rng.chance(1, 6) && !sim.legacy_enable) {
          //@ YEST -> DYST
          sim.part_change_type(i, x, y, PT_DYST);
        }
      }
    }
  }
  if (parts[i].temp > 303 && parts[i].temp < 317) {
    // g++ evaluates the arguments right to left: the y offset is drawn first
    const ry_ = sim.rng.between(-1, 1);
    const rx_ = sim.rng.between(-1, 1);
    sim.create_part(-1, x + rx_, y + ry_, PT_YEST);
  }
  return 0;
}
