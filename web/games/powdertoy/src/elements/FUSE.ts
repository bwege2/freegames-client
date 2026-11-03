// simulation/elements/FUSE.cpp
import type { Element } from '../sim/element.ts';
import type { Simulation } from '../sim/simulation.ts';
import type { Particle } from '../sim/particle.ts';
import { f } from '../sim/cpp.ts';
import { CELL, CFDS, IPH, IPL, ITH, ITL, NT, SC_EXPLOSIVE, TYP, TYPE_SOLID } from '../sim/config.ts';
import { PT_FSEP, PT_PLSM, PT_SPRK } from '../sim/numbers.ts';

export function Element_FUSE(el: Element): void {
  el.Identifier = 'DEFAULT_PT_FUSE';
  el.Name = 'FUSE';
  el.Colour = 0x0A5706;
  el.MenuVisible = 1;
  el.MenuSection = SC_EXPLOSIVE;
  el.Enabled = 1;

  el.Advection = 0.0;
  el.AirDrag = f(f(0.00) * CFDS);
  el.AirLoss = f(0.90);
  el.Loss = f(0.00);
  el.Collision = 0.0;
  el.Gravity = 0.0;
  el.Diffusion = 0.0;
  el.HotAir = f(0.0 * CFDS);
  el.Falldown = 0;

  el.Flammable = 0;
  el.Explosive = 0;
  el.Meltable = 0;
  el.Hardness = 19;

  el.Weight = 100;

  el.HeatConduct = 200;
  el.Description = 'Burns slowly. Ignites at very high temperatures or when sparked.';

  el.Properties = TYPE_SOLID;

  el.LowPressure = IPL;
  el.LowPressureTransition = NT;
  el.HighPressure = IPH;
  el.HighPressureTransition = NT;
  el.LowTemperature = ITL;
  el.LowTemperatureTransition = NT;
  el.HighTemperature = ITH;
  el.HighTemperatureTransition = NT;

  el.DefaultProperties.life = 50;
  el.DefaultProperties.tmp = 50;

  el.Update = update;
}

function update(sim: Simulation, i: number, x: number, y: number, _surround_space: number, _nt: number,
  parts: Particle[], pmap: Int32Array[]): number {
  //@ FUSE -> FUSE + PLSM
  if (parts[i].life <= 0) {
    const r = sim.create_part(i, x, y, PT_PLSM);
    if (r > -1)
      parts[r].life = 50;
    return 1;
  }
  else if (parts[i].life < 40) {
    parts[i].life--;
    if (sim.rng.chance(1, 100)) {
      // g++ evaluates the arguments right to left: the y offset is drawn first
      const ry_ = sim.rng.between(-1, 1);
      const rx_ = sim.rng.between(-1, 1);
      const r = sim.create_part(-1, x + rx_, y + ry_, PT_PLSM);
      if (r > -1)
        parts[r].life = 50;
    }
  }
  if ((sim.pv[(y / CELL) | 0][(x / CELL) | 0] > f(2.7)) && parts[i].tmp > 40)
    parts[i].tmp = 39;
  else if (parts[i].tmp <= 0) {
    //@ FUSE -> FSEP
    sim.create_part(i, x, y, PT_FSEP);
    return 1;
  }
  else if (parts[i].tmp < 40)
    parts[i].tmp--;
  for (let rx = -2; rx <= 2; rx++) {
    for (let ry = -2; ry <= 2; ry++) {
      if (rx || ry) {
        const r = pmap[y + ry][x + rx];
        if (!r)
          continue;
        if (TYP(r) === PT_SPRK || (parts[i].temp >= (273.15 + f(700.0)) && sim.rng.chance(1, 20))) {
          if (parts[i].life > 40)
            parts[i].life = 39;
        }
      }
    }
  }
  return 0;
}
