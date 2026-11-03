// simulation/elements/LSNS.cpp
import { sd } from '../sim/simulationData.ts';
import type { Element } from '../sim/element.ts';
import type { Simulation } from '../sim/simulation.ts';
import type { Particle } from '../sim/particle.ts';
import { f } from '../sim/cpp.ts';
import {
  CFDS, ID, IPH, IPL, ITH, ITL, NT, PROP_CONDUCTS, SC_SENSOR, TYP, TYPE_SOLID, XRES, YRES,
} from '../sim/config.ts';
import {
  PT_FILT, PT_INSL, PT_INWR, PT_LSNS, PT_METL, PT_NTCT, PT_PTCT, PT_RSSS, PT_SLTW, PT_SPRK, PT_WATR,
} from '../sim/numbers.ts';

export function Element_LSNS(el: Element): void {
  el.Identifier = 'DEFAULT_PT_LSNS';
  el.Name = 'LSNS';
  el.Colour = 0x336699;
  el.MenuVisible = 1;
  el.MenuSection = SC_SENSOR;
  el.Enabled = 1;

  el.Advection = 0.0;
  el.AirDrag = f(0.00 * CFDS);
  el.AirLoss = f(0.96);
  el.Loss = 0.00;
  el.Collision = 0.0;
  el.Gravity = 0.0;
  el.Diffusion = 0.00;
  el.HotAir = f(0.000 * CFDS);
  el.Falldown = 0;

  el.Flammable = 0;
  el.Explosive = 0;
  el.Meltable = 0;
  el.Hardness = 1;

  el.Weight = 100;

  el.DefaultProperties.temp = f(4.0 + f(273.15));
  el.HeatConduct = 0;
  el.Description = "Life sensor, creates a spark when there's a nearby particle with a life higher than its temperature.";

  el.Properties = TYPE_SOLID;

  el.LowPressure = IPL;
  el.LowPressureTransition = NT;
  el.HighPressure = IPH;
  el.HighPressureTransition = NT;
  el.LowTemperature = ITL;
  el.LowTemperatureTransition = NT;
  el.HighTemperature = ITH;
  el.HighTemperatureTransition = NT;

  el.DefaultProperties.tmp2 = 2;

  el.Update = update;
}

function update(sim: Simulation, i: number, x: number, y: number, _surround_space: number, _nt: number,
  parts: Particle[], pmap: Int32Array[]): number {
  const elements = sd.elements;
  let rd = parts[i].tmp2;
  if (rd > 25) parts[i].tmp2 = rd = 25;
  if (parts[i].life) {
    parts[i].life = 0;
    for (let rx = -2; rx <= 2; rx++) {
      for (let ry = -2; ry <= 2; ry++) {
        if (rx || ry) {
          let r = pmap[y + ry][x + rx];
          if (!r)
            r = sim.photons[y + ry][x + rx];
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
  }
  let doSerialization = false;
  let doDeserialization = false;
  let life = 0;
  for (let rx = -rd; rx < rd + 1; rx++) {
    for (let ry = -rd; ry < rd + 1; ry++) {
      if (x + rx >= 0 && y + ry >= 0 && x + rx < XRES && y + ry < YRES && (rx || ry)) {
        let r = pmap[y + ry][x + rx];
        if (!r)
          r = sim.photons[y + ry][x + rx];
        if (!r)
          continue;

        switch (parts[i].tmp) {
          case 1:
            // .life serialization into FILT
            if (TYP(r) !== PT_LSNS && TYP(r) !== PT_FILT && parts[ID(r)].life >= 0) {
              doSerialization = true;
              life = parts[ID(r)].life;
            }
            break;
          case 3:
            // .life deserialization
            if (TYP(r) === PT_FILT) {
              doDeserialization = true;
              life = parts[ID(r)].ctype;
            }
            break;
          case 2:
            // Invert mode
            if (TYP(r) !== PT_METL && parts[ID(r)].life <= parts[i].temp - 273.15)
              parts[i].life = 1;
            break;
          default:
            // Normal mode
            if (TYP(r) !== PT_METL && parts[ID(r)].life > parts[i].temp - 273.15)
              parts[i].life = 1;
            break;
        }
      }
    }
  }

  for (let rx = -1; rx <= 1; rx++) {
    for (let ry = -1; ry <= 1; ry++) {
      if (rx || ry) {
        let r = pmap[y + ry][x + rx];
        if (!r)
          r = sim.photons[y + ry][x + rx];
        if (!r)
          continue;
        let nx = x + rx;
        let ny = y + ry;
        // .life serialization.
        if (doSerialization) {
          while (TYP(r) === PT_FILT) {
            parts[ID(r)].ctype = 0x10000000 + life;
            nx += rx;
            ny += ry;
            if (nx < 0 || ny < 0 || nx >= XRES || ny >= YRES)
              break;
            r = pmap[ny][nx];
          }
        }
        // .life deserialization.
        else if (doDeserialization) {
          if (TYP(r) !== PT_FILT)
            parts[ID(r)].life = life - 0x10000000;
        }
      }
    }
  }

  return 0;
}
