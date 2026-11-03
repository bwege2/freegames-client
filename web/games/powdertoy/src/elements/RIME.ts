// simulation/elements/RIME.cpp
import type { Element } from '../sim/element.ts';
import type { Simulation } from '../sim/simulation.ts';
import type { Particle } from '../sim/particle.ts';
import { FIELD_CTYPE } from '../sim/particle.ts';
import { f } from '../sim/cpp.ts';
import { CFDS, ID, IPH, IPL, ITL, NT, SC_SOLIDS, ST, TYP, TYPE_SOLID } from '../sim/config.ts';
import { PT_DSTW, PT_FOG, PT_GAS, PT_SPRK } from '../sim/numbers.ts';

export function Element_RIME(el: Element): void {
  el.Identifier = 'DEFAULT_PT_RIME';
  el.Name = 'RIME';
  el.Colour = 0xCCCCCC;
  el.MenuVisible = 1;
  el.MenuSection = SC_SOLIDS;
  el.Enabled = 1;

  el.Advection = f(0.00);
  el.AirDrag = f(f(0.00) * CFDS);
  el.AirLoss = f(0.00);
  el.Loss = f(0.00);
  el.Collision = f(0.00);
  el.Gravity = f(0.0);
  el.Diffusion = f(0.00);
  el.HotAir = f(f(0.000) * CFDS);
  el.Falldown = 0;

  el.Flammable = 0;
  el.Explosive = 0;
  el.Meltable = 0;
  el.Hardness = 32;

  el.Weight = 100;

  el.DefaultProperties.temp = f(f(-30.0) + f(273.15));
  el.HeatConduct = 100;
  el.Description = 'Solid, created when steam cools rapidly and goes through deposition, skipping the liquid phase.';

  el.Properties = TYPE_SOLID;
  el.CarriesTypeIn = (1 << FIELD_CTYPE) >>> 0;

  el.LowPressure = IPL;
  el.LowPressureTransition = NT;
  el.HighPressure = IPH;
  el.HighPressureTransition = NT;
  el.LowTemperature = ITL;
  el.LowTemperatureTransition = NT;
  el.HighTemperature = f(273.15);
  el.HighTemperatureTransition = ST;

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
        if (TYP(r) === PT_SPRK) {
          //@ RIME -> FOG
          sim.part_change_type(i, x, y, PT_FOG);
          parts[i].life = sim.rng.between(60, 119);
        }
        // GAS increases acidity
        else if (TYP(r) === PT_GAS && parts[i].tmp < 10) {
          sim.kill_part(ID(r));
          if (parts[i].ctype === PT_DSTW)
            parts[i].ctype = 0;
          else
            parts[i].tmp++;
        }
        else if (TYP(r) === PT_FOG && parts[ID(r)].life > 0) {
          //@ RIME + FOG -> 2xFOG
          sim.part_change_type(i, x, y, PT_FOG);
          parts[i].life = parts[ID(r)].life;
        }
      }
    }
  }
  return 0;
}
