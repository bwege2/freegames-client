// simulation/elements/VSNS.cpp
import { sd } from '../sim/simulationData.ts';
import type { Element } from '../sim/element.ts';
import type { Simulation } from '../sim/simulation.ts';
import type { Particle } from '../sim/particle.ts';
import { f, itrunc } from '../sim/cpp.ts';
import {
  CFDS, ID, IPH, IPL, ITH, ITL, MAX_VELOCITY, NT, PROP_CONDUCTS, SC_SENSOR, TYP, TYPE_SOLID, XRES, YRES,
} from '../sim/config.ts';
import {
  PT_FILT, PT_INSL, PT_INWR, PT_NTCT, PT_PTCT, PT_RSSS, PT_SLTW, PT_SPRK, PT_VSNS, PT_WATR,
} from '../sim/numbers.ts';

export function Element_VSNS(el: Element): void {
  el.Identifier = 'DEFAULT_PT_VSNS';
  el.Name = 'VSNS';
  el.Colour = 0x7C9C00;
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
  el.Description = "Velocity sensor, creates a spark when there's a nearby particle with velocity higher than its temperature.";

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
  }
  let doSerialization = false;
  let doDeserialization = false;
  let Vs = 0;
  for (let rx = -rd; rx < rd + 1; rx++)
    for (let ry = -rd; ry < rd + 1; ry++)
      if (x + rx >= 0 && y + ry >= 0 && x + rx < XRES && y + ry < YRES && (rx || ry)) {
        let r = pmap[y + ry][x + rx];
        if (!r)
          r = sim.photons[y + ry][x + rx];
        if (!r)
          continue;
        const Vx = parts[ID(r)].vx;
        const Vy = parts[ID(r)].vy;
        // sqrt of a float sum: correctly rounded either way (sqrtf or sqrt(double) stored to float)
        const Vm = f(Math.sqrt(f(f(Vx * Vx) + f(Vy * Vy))));

        switch (parts[i].tmp) {
          case 1:
            // serialization
            if (TYP(r) !== PT_VSNS && TYP(r) !== PT_FILT && !(elements[TYP(r)].Properties & TYPE_SOLID)) {
              doSerialization = true;
              Vs = Vm;
            }
            break;
          case 3:
            // deserialization
            if (TYP(r) === PT_FILT) {
              const vel = (parts[ID(r)].ctype - 0x10000000) | 0;
              if (vel >= 0 && vel < MAX_VELOCITY) {
                doDeserialization = true;
                Vs = f(vel);
              }
            }
            break;
          case 2:
            // Invert mode
            if (!(elements[TYP(r)].Properties & TYPE_SOLID) && Vm <= parts[i].temp - 273.15)
              parts[i].life = 1;
            break;
          default:
            // Normal mode
            if (!(elements[TYP(r)].Properties & TYPE_SOLID) && Vm > parts[i].temp - 273.15)
              parts[i].life = 1;
            break;
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
        //Serialization.
        if (doSerialization) {
          while (TYP(r) === PT_FILT) {
            parts[ID(r)].ctype = 0x10000000 + itrunc(f(Vs + 0.5));
            nx += rx;
            ny += ry;
            if (nx < 0 || ny < 0 || nx >= XRES || ny >= YRES)
              break;
            r = pmap[ny][nx];
          }
        }
        //Deserialization.
        if (doDeserialization) {
          if (TYP(r) !== PT_FILT && !(elements[TYP(r)].Properties & TYPE_SOLID)) {
            const Vx = parts[ID(r)].vx;
            const Vy = parts[ID(r)].vy;
            const Vm = f(Math.sqrt(f(f(Vx * Vx) + f(Vy * Vy))));
            if (Vm > 0) {
              parts[ID(r)].vx = f(parts[ID(r)].vx * f(Vs / Vm));
              parts[ID(r)].vy = f(parts[ID(r)].vy * f(Vs / Vm));
            }
            break;
          }
        }
      }
    }
  }

  return 0;
}
