// simulation/elements/IGNT.cpp
import type { Element } from '../sim/element.ts';
import type { Simulation } from '../sim/simulation.ts';
import type { Particle } from '../sim/particle.ts';
import { f, restrict_flt } from '../sim/cpp.ts';
import {
  CFDS, IPH, IPL, ITL, MAX_TEMP, MIN_TEMP, NT, PROP_LIFE_KILL, PROP_NEUTPENETRATE, PROP_SPARKSETTLE, SC_EXPLOSIVE,
  TYPE_SOLID, TYP, ID,
} from '../sim/config.ts';
import { PT_EMBR, PT_FIRE, PT_IGNT, PT_LIGH, PT_PLSM, PT_SPRK } from '../sim/numbers.ts';

export function Element_IGNT(el: Element): void {
  el.Identifier = 'DEFAULT_PT_IGNT';
  el.Name = 'IGNC';
  el.Colour = 0xC0B050; // 0xC0B050_rgb
  el.MenuVisible = 1;
  el.MenuSection = SC_EXPLOSIVE;
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
  el.Meltable = 0;
  el.Hardness = 1;

  el.Weight = 100;

  el.HeatConduct = 88;
  el.Description = 'Ignition cord. Burns slowly with fire and sparks.';

  el.Properties = TYPE_SOLID | PROP_NEUTPENETRATE | PROP_SPARKSETTLE | PROP_LIFE_KILL;

  el.LowPressure = IPL;
  el.LowPressureTransition = NT;
  el.HighPressure = IPH;
  el.HighPressureTransition = NT;
  el.LowTemperature = ITL;
  el.LowTemperatureTransition = NT;
  el.HighTemperature = 673.0;
  el.HighTemperatureTransition = PT_FIRE; //@ IGNT -> FIRE

  el.DefaultProperties.life = 3;

  el.Update = update;
}

function update(sim: Simulation, i: number, x: number, y: number, _surround_space: number, _nt: number,
  parts: Particle[], pmap: Int32Array[]): number {
  if (parts[i].tmp === 0) {
    for (let rx = -1; rx <= 1; rx++) {
      for (let ry = -1; ry <= 1; ry++) {
        if (rx || ry) {
          const r = pmap[y + ry][x + rx];
          if (!r)
            continue;
          const rt = TYP(r);
          if (rt === PT_FIRE || rt === PT_PLSM || rt === PT_SPRK || rt === PT_LIGH || (rt === PT_IGNT && parts[ID(r)].life === 1)) {
            parts[i].tmp = 1;
          }
        }
      }
    }
  }
  else if (parts[i].life > 0) {
    if (sim.rng.chance(2, 3)) {
      //@ IGNT -> IGNT + EMBR
      // the call's arguments: GCC evaluates them right to left (y offset first)
      const dy = sim.rng.between(-1, 1);
      const dx = sim.rng.between(-1, 1);
      const nb = sim.create_part(-1, x + dx, y + dy, PT_EMBR);
      if (nb !== -1) {
        parts[nb].tmp = 0;
        parts[nb].life = 30;
        parts[nb].vx = sim.rng.between(-10, 10);
        parts[nb].vy = sim.rng.between(-10, 10);
        parts[nb].temp = restrict_flt(f(f(parts[i].temp - f(273.15)) + 400.0), MIN_TEMP, MAX_TEMP);
      }
    }
    else {
      //@ IGNT -> IGNT + FIRE
      // the call's arguments: GCC evaluates them right to left (y offset first)
      const dy = sim.rng.between(-1, 1);
      const dx = sim.rng.between(-1, 1);
      sim.create_part(-1, x + dx, y + dy, PT_FIRE);
    }
    parts[i].life--;
  }
  return 0;
}
