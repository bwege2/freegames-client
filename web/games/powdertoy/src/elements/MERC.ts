// simulation/elements/MERC.cpp
import type { Element } from '../sim/element.ts';
import type { Simulation } from '../sim/simulation.ts';
import type { Particle } from '../sim/particle.ts';
import { f, idiv, itrunc, restrict_flt } from '../sim/cpp.ts';
import {
  CFDS, IPH, IPL, ITH, ITL, MAX_TEMP, MIN_TEMP, NT, PROP_CONDUCTS, PROP_LIFE_DEC, PROP_NEUTABSORB, SC_LIQUID,
  TYPE_LIQUID, TYP, ID,
} from '../sim/config.ts';
import { PT_MERC } from '../sim/numbers.ts';

export function Element_MERC(el: Element): void {
  el.Identifier = 'DEFAULT_PT_MERC';
  el.Name = 'MERC';
  el.Colour = 0x736B6D; // 0x736B6D_rgb
  el.MenuVisible = 1;
  el.MenuSection = SC_LIQUID;
  el.Enabled = 1;

  el.Advection = f(0.4);
  el.AirDrag = f(f(0.04) * CFDS);
  el.AirLoss = f(0.94);
  el.Loss = f(0.80);
  el.Collision = 0.0;
  el.Gravity = f(0.3);
  el.Diffusion = f(0.00);
  el.HotAir = f(f(0.000) * CFDS);
  el.Falldown = 2;

  el.Flammable = 0;
  el.Explosive = 0;
  el.Meltable = 0;
  el.Hardness = 18;

  el.Weight = 91;

  el.HeatConduct = 251;
  el.Description = 'Mercury. Volume changes with temperature, Conductive.';

  el.Properties = TYPE_LIQUID | PROP_CONDUCTS | PROP_NEUTABSORB | PROP_LIFE_DEC;

  el.LowPressure = IPL;
  el.LowPressureTransition = NT;
  el.HighPressure = IPH;
  el.HighPressureTransition = NT;
  el.LowTemperature = ITL;
  el.LowTemperatureTransition = NT;
  el.HighTemperature = ITH;
  el.HighTemperatureTransition = NT;

  el.DefaultProperties.tmp = 10;

  el.Update = update;
}

function update(sim: Simulation, i: number, x: number, y: number, _surround_space: number, _nt: number,
  parts: Particle[], pmap: Int32Array[]): number {
  // Max number of particles that can be condensed into one
  const absorbScale = 10000;

  parts[i].temp = restrict_flt(parts[i].temp, MIN_TEMP, MAX_TEMP);
  let maxtmp = itrunc(f(absorbScale / f(parts[i].temp + 1))) - 1;
  let it1 = itrunc(parts[i].temp) + 1;
  if (it1 < 1)
    it1 = 1;

  if (sim.rng.chance(absorbScale % it1, it1))
    maxtmp++;

  if (parts[i].tmp < 0) {
    parts[i].tmp = 0;
  }
  if (parts[i].tmp > absorbScale) {
    parts[i].tmp = absorbScale;
  }

  if (parts[i].tmp < maxtmp) {
    for (let rx = -1; rx <= 1; rx++) {
      for (let ry = -1; ry <= 1; ry++) {
        if (rx || ry) {
          const r = pmap[y + ry][x + rx];
          if (!r || (parts[i].tmp >= maxtmp))
            continue;
          if (TYP(r) === PT_MERC && sim.rng.chance(1, 3)) {
            if ((parts[i].tmp + parts[ID(r)].tmp + 1) <= maxtmp) {
              parts[i].tmp += parts[ID(r)].tmp + 1;
              sim.kill_part(ID(r));
            }
          }
        }
      }
    }
  }
  else {
    for (let rx = -1; rx <= 1; rx++) {
      for (let ry = -1; ry <= 1; ry++) {
        if (rx || ry) {
          const r = pmap[y + ry][x + rx];
          if (parts[i].tmp <= maxtmp)
            continue;
          if ((!r) && parts[i].tmp >= 1)//if nothing then create MERC
          {
            const np = sim.create_part(-1, x + rx, y + ry, PT_MERC);
            if (np < 0) continue;
            parts[i].tmp--;
            parts[np].temp = parts[i].temp;
            parts[np].tmp = 0;
            parts[np].dcolour = parts[i].dcolour;
          }
        }
      }
    }
  }
  for (let trade = 0; trade < 4; trade++) {
    const rx = sim.rng.between(-2, 2);
    const ry = sim.rng.between(-2, 2);
    if (rx || ry) {
      const r = pmap[y + ry][x + rx];
      if (!r)
        continue;
      if (TYP(r) === PT_MERC && (parts[i].tmp > parts[ID(r)].tmp) && parts[i].tmp > 0)//diffusion
      {
        const temp = parts[i].tmp - parts[ID(r)].tmp;
        if (temp === 1) {
          parts[ID(r)].tmp++;
          parts[i].tmp--;
        }
        else if (temp > 0) {
          parts[ID(r)].tmp += idiv(temp, 2);
          parts[i].tmp -= idiv(temp, 2);
        }
      }
    }
  }
  return 0;
}
