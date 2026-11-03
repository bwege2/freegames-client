// simulation/elements/RSST.cpp
import type { Element } from '../sim/element.ts';
import type { Simulation } from '../sim/simulation.ts';
import type { Particle } from '../sim/particle.ts';
import { FIELD_CTYPE, FIELD_TMP } from '../sim/particle.ts';
import { f } from '../sim/cpp.ts';
import {
  CFDS, ID, IPH, IPL, ITH, ITL, NT, PROP_CONDUCTS, PROP_LIFE_DEC, PROP_NEUTPASS, PROP_PHOTPASS, R_TEMP, SC_LIQUID, TYP,
  TYPE_LIQUID,
} from '../sim/config.ts';
import { PT_BCLN, PT_BCOL, PT_CLNE, PT_FIRW, PT_FSEP, PT_GUNP, PT_PBCN, PT_PCLN, PT_RSST } from '../sim/numbers.ts';

export function Element_RSST(el: Element): void {
  el.Identifier = 'DEFAULT_PT_RSST';
  el.Name = 'RSST';
  el.Colour = 0xF95B49;
  el.MenuVisible = 1;
  el.MenuSection = SC_LIQUID;
  el.Enabled = 1;

  el.Advection = f(0.3);
  el.AirDrag = f(f(0.02) * CFDS);
  el.AirLoss = f(0.98);
  el.Loss = f(0.80);
  el.Collision = 0.0;
  el.Gravity = f(0.15);
  el.Diffusion = 0.00;
  el.HotAir = f(0.000 * CFDS);
  el.Falldown = 2;

  el.Flammable = 0;
  el.Explosive = 0;
  el.Meltable = 0;
  el.Hardness = 50;

  el.Weight = 33;

  el.DefaultProperties.temp = f(f(R_TEMP + 20.0) + f(273.15));
  el.HeatConduct = 55;
  el.Description = 'Resist. Solidifies on contact with photons, is destroyed by electrons and spark.';

  el.Properties = TYPE_LIQUID | PROP_CONDUCTS | PROP_LIFE_DEC | PROP_NEUTPASS | PROP_PHOTPASS;
  el.CarriesTypeIn = ((1 << FIELD_CTYPE) | (1 << FIELD_TMP)) >>> 0;

  el.LowPressure = IPL;
  el.LowPressureTransition = NT;
  el.HighPressure = IPH;
  el.HighPressureTransition = NT;
  el.LowTemperature = ITL;
  el.LowTemperatureTransition = NT;
  el.HighTemperature = ITH;
  el.HighTemperatureTransition = NT;

  el.Update = update;
}

function update(sim: Simulation, i: number, x: number, y: number, _surround_space: number, _nt: number,
  parts: Particle[], pmap: Int32Array[]): number {
  for (let rx = -1; rx < 2; rx++) {
    for (let ry = -1; ry < 2; ry++) {
      const r = pmap[y + ry][x + rx];

      if (!r)
        continue;

      //@ RSST + GUNP -> FIRW
      if (TYP(r) === PT_GUNP) {
        sim.create_part(i, x, y, PT_FIRW);
        sim.kill_part(ID(r));
        return 1;
      }

      //@ RSST + BCOL -> FSEP
      if (TYP(r) === PT_BCOL) {
        sim.create_part(i, x, y, PT_FSEP);
        parts[i].life = 50;
        sim.kill_part(ID(r));
        return 1;
      }

      // Set RSST ctype from nearby clone
      if ((TYP(r) === PT_CLNE) || (TYP(r) === PT_PCLN)) {
        if (parts[ID(r)].ctype !== PT_RSST)
          parts[i].ctype = parts[ID(r)].ctype;
      }

      // Set RSST tmp from nearby breakable clone
      if ((TYP(r) === PT_BCLN) || (TYP(r) === PT_PBCN)) {
        if (parts[ID(r)].ctype !== PT_RSST)
          parts[i].tmp = parts[ID(r)].ctype;
      }
    }
  }

  return 0;
}
