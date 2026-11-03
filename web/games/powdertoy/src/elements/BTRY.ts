// simulation/elements/BTRY.cpp
import { sd } from '../sim/simulationData.ts';
import type { Element } from '../sim/element.ts';
import type { Simulation } from '../sim/simulation.ts';
import type { Particle } from '../sim/particle.ts';
import { f } from '../sim/cpp.ts';
import { CFDS, ID, IPH, IPL, ITL, NT, PROP_CONDUCTS, SC_ELEC, TYP, TYPE_SOLID } from '../sim/config.ts';
import { PT_INSL, PT_INWR, PT_NTCT, PT_PLSM, PT_PTCT, PT_RSSS, PT_SLTW, PT_SPRK, PT_WATR } from '../sim/numbers.ts';

export function Element_BTRY(el: Element): void {
  el.Identifier = 'DEFAULT_PT_BTRY';
  el.Name = 'BTRY';
  el.Colour = 0x858505;
  el.MenuVisible = 1;
  el.MenuSection = SC_ELEC;
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

  el.HeatConduct = 251;
  el.Description = 'Battery. Generates infinite electricity.';

  el.Properties = TYPE_SOLID;

  el.LowPressure = IPL;
  el.LowPressureTransition = NT;
  el.HighPressure = IPH;
  el.HighPressureTransition = NT;
  el.LowTemperature = ITL;
  el.LowTemperatureTransition = NT;
  el.HighTemperature = 2273.0;
  el.HighTemperatureTransition = PT_PLSM; //@ BTRY -> PLSM

  el.Update = update;
}

function update(sim: Simulation, i: number, x: number, y: number, _surround_space: number, _nt: number,
  parts: Particle[], pmap: Int32Array[]): number {
  const elements = sd.elements;
  for (let rx = -2; rx <= 2; rx++) {
    for (let ry = -2; ry <= 2; ry++) {
      if ((rx || ry) && Math.abs(rx) + Math.abs(ry) < 4) {
        const r = pmap[y + ry][x + rx];
        if (!r)
          continue;
        const rt = TYP(r);
        const pavg = sim.parts_avg(i, ID(r), PT_INSL);
        if (pavg !== PT_INSL && pavg !== PT_RSSS) {
          if ((elements[rt].Properties & PROP_CONDUCTS) && !(rt === PT_WATR || rt === PT_SLTW || rt === PT_NTCT || rt === PT_PTCT || rt === PT_INWR) && parts[ID(r)].life === 0) {
            parts[ID(r)].life = 4;
            parts[ID(r)].ctype = rt;
            sim.part_change_type(ID(r), x + rx, y + ry, PT_SPRK);
          }
        }
      }
    }
  }
  return 0;
}
