// simulation/elements/FOG.cpp
import { sd } from '../sim/simulationData.ts';
import type { Element } from '../sim/element.ts';
import type { Simulation } from '../sim/simulation.ts';
import type { Particle } from '../sim/particle.ts';
import { FIELD_CTYPE } from '../sim/particle.ts';
import { f } from '../sim/cpp.ts';
import { CFDS, ID, IPH, IPL, ITL, NT, PROP_LIFE_DEC, SC_GAS, TYP, TYPE_GAS, TYPE_SOLID } from '../sim/config.ts';
import { PT_BCLN, PT_CLNE, PT_DSTW, PT_GAS, PT_PBCN, PT_PCLN, PT_RIME, PT_SPRK, PT_WTRV } from '../sim/numbers.ts';

export function Element_FOG(el: Element): void {
  el.Identifier = 'DEFAULT_PT_FOG';
  el.Name = 'FOG';
  el.Colour = 0xAAAAAA;
  el.MenuVisible = 1;
  el.MenuSection = SC_GAS;
  el.Enabled = 1;

  el.Advection = f(0.8);
  el.AirDrag = f(f(0.00) * CFDS);
  el.AirLoss = f(0.4);
  el.Loss = f(0.70);
  el.Collision = f(-0.1);
  el.Gravity = f(0.0);
  el.Diffusion = f(0.99);
  el.HotAir = f(f(0.000) * CFDS);
  el.Falldown = 0;

  el.Flammable = 0;
  el.Explosive = 0;
  el.Meltable = 0;
  el.Hardness = 30;

  el.Weight = 1;

  el.DefaultProperties.temp = f(243.15);
  el.HeatConduct = 100;
  el.Description = 'Fog, created when an electric current is passed through RIME.';

  el.Properties = TYPE_GAS | PROP_LIFE_DEC;
  el.CarriesTypeIn = (1 << FIELD_CTYPE) >>> 0;

  el.LowPressure = IPL;
  el.LowPressureTransition = NT;
  el.HighPressure = IPH;
  el.HighPressureTransition = NT;
  el.LowTemperature = ITL;
  el.LowTemperatureTransition = NT;
  el.HighTemperature = f(373.15);
  el.HighTemperatureTransition = PT_WTRV; //@ FOG -> WTRV

  el.Update = update;
}

function update(sim: Simulation, i: number, x: number, y: number, _surround_space: number, _nt: number,
  parts: Particle[], pmap: Int32Array[]): number {
  const elements = sd.elements;
  for (let rx = -1; rx <= 1; rx++) {
    for (let ry = -1; ry <= 1; ry++) {
      if (rx || ry) {
        const r = pmap[y + ry][x + rx];
        if (!r)
          continue;
        if ((elements[TYP(r)].Properties & TYPE_SOLID) && sim.rng.chance(1, 10) && parts[i].life === 0 && !(TYP(r) === PT_CLNE || TYP(r) === PT_PCLN || TYP(r) === PT_BCLN || TYP(r) === PT_PBCN)) {
          //@ FOG -> RIME
          sim.part_change_type(i, x, y, PT_RIME);
        }
        if (TYP(r) === PT_SPRK) {
          parts[i].life += sim.rng.between(0, 19);
        }
        // GAS increases acidity
        if (TYP(r) === PT_GAS && parts[i].tmp < 10) {
          sim.kill_part(ID(r));
          if (parts[i].ctype === PT_DSTW)
            parts[i].ctype = 0;
          else
            parts[i].tmp++;
        }
      }
    }
  }
  return 0;
}
