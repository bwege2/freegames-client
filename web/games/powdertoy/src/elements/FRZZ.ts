// simulation/elements/FRZZ.cpp
import type { Element } from '../sim/element.ts';
import type { Simulation } from '../sim/simulation.ts';
import type { Particle } from '../sim/particle.ts';
import { f } from '../sim/cpp.ts';
import { CFDS, ID, IPL, NT, SC_POWDERS, TYP, TYPE_PART } from '../sim/config.ts';
import { PT_FRZW, PT_ICEI, PT_SNOW, PT_WATR } from '../sim/numbers.ts';

export function Element_FRZZ(el: Element): void {
  el.Identifier = 'DEFAULT_PT_FRZZ';
  el.Name = 'FRZZ';
  el.Colour = 0xC0E0FF;
  el.MenuVisible = 1;
  el.MenuSection = SC_POWDERS;
  el.Enabled = 1;

  el.Advection = f(0.7);
  el.AirDrag = f(f(0.01) * CFDS);
  el.AirLoss = f(0.96);
  el.Loss = f(0.90);
  el.Collision = f(-0.1);
  el.Gravity = f(0.05);
  el.Diffusion = f(0.01);
  el.HotAir = f(f(-0.00005) * CFDS);
  el.Falldown = 1;

  el.Flammable = 0;
  el.Explosive = 0;
  el.Meltable = 0;
  el.Hardness = 20;

  el.Weight = 50;

  el.DefaultProperties.temp = f(253.15);
  el.HeatConduct = 46;
  el.Description = 'Freeze powder. When melted, forms ice that always cools. Spreads with regular water.';

  el.Properties = TYPE_PART;

  el.LowPressure = IPL;
  el.LowPressureTransition = NT;
  el.HighPressure = f(1.8);
  el.HighPressureTransition = PT_SNOW; //@ FRZZ -> SNOW
  el.LowTemperature = f(50.0);
  el.LowTemperatureTransition = PT_ICEI;
  el.HighTemperature = f(273.15);
  el.HighTemperatureTransition = PT_FRZW;

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
        if (TYP(r) === PT_WATR && sim.rng.chance(1, 20)) {
          //@ FRZZ + WATR -> FRZW
          sim.part_change_type(ID(r), x + rx, y + ry, PT_FRZW);
          parts[ID(r)].life = 100;
          sim.kill_part(i);
          return 1;
        }
      }
    }
  }
  return 0;
}
