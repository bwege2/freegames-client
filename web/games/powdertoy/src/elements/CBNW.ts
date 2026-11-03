// simulation/elements/CBNW.cpp
import { sd } from '../sim/simulationData.ts';
import type { Element, GraphicsFuncContext, Gfx } from '../sim/element.ts';
import type { Simulation } from '../sim/simulation.ts';
import type { Particle } from '../sim/particle.ts';
import { f, itrunc } from '../sim/cpp.ts';
import {
  CELL, CFDS, ID, IPH, IPL, NT, PROP_CONDUCTS, PROP_LIFE_DEC, PROP_NEUTPENETRATE, R_TEMP, SC_LIQUID, TYP,
  TYPE_LIQUID, TYPE_PART, TYPE_SOLID,
} from '../sim/config.ts';
import {
  PT_CBNW, PT_CO2, PT_DMND, PT_FIRE, PT_GLAS, PT_ICEI, PT_LRBD, PT_RBDM, PT_WATR, PT_WTRV,
} from '../sim/numbers.ts';

export function Element_CBNW(el: Element): void {
  el.Identifier = 'DEFAULT_PT_CBNW';
  el.Name = 'BUBW';
  el.Colour = 0x2030D0;
  el.MenuVisible = 1;
  el.MenuSection = SC_LIQUID;
  el.Enabled = 1;

  el.Advection = f(0.6);
  el.AirDrag = f(f(0.01) * CFDS);
  el.AirLoss = f(0.98);
  el.Loss = f(0.95);
  el.Collision = 0.0;
  el.Gravity = f(0.1);
  el.Diffusion = f(0.00);
  el.HotAir = f(f(0.000) * CFDS);
  el.Falldown = 2;

  el.Flammable = 0;
  el.Explosive = 0;
  el.Meltable = 0;
  el.Hardness = 20;

  el.Weight = 30;

  el.DefaultProperties.temp = f(f(R_TEMP - 2.0) + f(273.15));
  el.HeatConduct = 29;
  el.Description = 'Carbonated water. Slowly releases CO2.';

  el.Properties = TYPE_LIQUID | PROP_CONDUCTS | PROP_LIFE_DEC | PROP_NEUTPENETRATE;

  el.LowPressure = IPL;
  el.LowPressureTransition = NT;
  el.HighPressure = IPH;
  el.HighPressureTransition = NT;
  el.LowTemperature = f(273.15);
  el.LowTemperatureTransition = PT_ICEI; //@ CBNW -> ICEI(CBNW)
  el.HighTemperature = 373.0;
  el.HighTemperatureTransition = PT_WTRV; //@ CBNW -> WTRV

  el.Update = update;
  el.Graphics = graphics;
}

function update(sim: Simulation, i: number, x: number, y: number, _surround_space: number, _nt: number,
  parts: Particle[], pmap: Int32Array[]): number {
  const elements = sd.elements;
  const cx = (x / CELL) | 0, cy = (y / CELL) | 0;
  if (sim.pv[cy][cx] <= 3) {
    if (sim.pv[cy][cx] <= -0.5 || sim.rng.chance(1, 4000)) {
      //@ CBNW -> CO2
      sim.part_change_type(i, x, y, PT_CO2);
      parts[i].ctype = 5;
      sim.pv[cy][cx] += 0.5;
    }
  }
  if (parts[i].tmp2 !== 20) {
    parts[i].tmp2 -= (parts[i].tmp2 > 20) ? 1 : -1;
  }
  else if (sim.rng.chance(1, 200)) {
    parts[i].tmp2 = sim.rng.between(0, 39);
  }

  if (parts[i].tmp > 0) {
    //Explode
    if (parts[i].tmp === 1 && sim.rng.chance(3, 4)) {
      //@ CBNW -> CO2
      sim.part_change_type(i, x, y, PT_CO2);
      parts[i].ctype = 5;
      sim.pv[cy][cx] += f(0.2);
    }
    parts[i].tmp--;
  }
  for (let rx = -1; rx <= 1; rx++) {
    for (let ry = -1; ry <= 1; ry++) {
      if (rx || ry) {
        const r = pmap[y + ry][x + rx];
        if (!r)
          continue;
        if ((elements[TYP(r)].Properties & TYPE_PART) && parts[i].tmp === 0 && sim.rng.chance(1, 83)) {
          //Start explode
          parts[i].tmp = sim.rng.between(0, 24);
        }
        else if ((elements[TYP(r)].Properties & TYPE_SOLID) && TYP(r) !== PT_DMND && TYP(r) !== PT_GLAS && parts[i].tmp === 0 && sim.rng.chance(itrunc(f(2 - sim.pv[cy][cx])), 6667)) {
          //@ CBNW -> CO2
          sim.part_change_type(i, x, y, PT_CO2);
          parts[i].ctype = 5;
          sim.pv[cy][cx] += f(0.2);
        }
        if (TYP(r) === PT_CBNW) {
          if (!parts[i].tmp) {
            if (parts[ID(r)].tmp) {
              parts[i].tmp = parts[ID(r)].tmp;
              if ((ID(r)) > i) //If the other particle hasn't been life updated
                parts[i].tmp--;
            }
          }
          else if (!parts[ID(r)].tmp) {
            parts[ID(r)].tmp = parts[i].tmp;
            if ((ID(r)) > i) //If the other particle hasn't been life updated
              parts[ID(r)].tmp++;
          }
        }
        else if (TYP(r) === PT_RBDM || TYP(r) === PT_LRBD) {
          if ((sim.legacy_enable || parts[i].temp > f(f(273.15) + 12.0)) && sim.rng.chance(1, 166)) {
            //@ CBNW + RBDM/LRBD -> CBNW + FIRE
            sim.part_change_type(i, x, y, PT_FIRE);
            parts[i].life = 4;
            parts[i].ctype = PT_WATR;
          }
        }
        else if (TYP(r) === PT_FIRE && parts[ID(r)].ctype !== PT_WATR) {
          sim.kill_part(ID(r));
          if (sim.rng.chance(1, 50)) {
            sim.kill_part(i);
            return 1;
          }
        }
      }
    }
  }
  return 0;
}

function graphics(_gfctx: GraphicsFuncContext, cpart: Particle, _nx: number, _ny: number, g: Gfx): number {
  const z = cpart.tmp2 - 20;//speckles!
  g.colr += z * 1;
  g.colg += z * 2;
  g.colb += z * 8;
  return 0;
}
