// simulation/elements/TSNS.cpp
import { sd } from '../sim/simulationData.ts';
import type { Element } from '../sim/element.ts';
import type { Simulation } from '../sim/simulation.ts';
import type { Particle } from '../sim/particle.ts';
import { f, itrunc } from '../sim/cpp.ts';
import {
  CFDS, IPH, IPL, ITH, ITL, NT, PROP_CONDUCTS, SC_SENSOR, TYPE_SOLID, XRES, YRES, TYP, ID,
} from '../sim/config.ts';
import {
  PT_FILT, PT_INSL, PT_INWR, PT_METL, PT_NTCT, PT_PTCT, PT_RSSS, PT_SLTW, PT_SPRK, PT_TSNS, PT_WATR,
} from '../sim/numbers.ts';

export function Element_TSNS(el: Element): void {
  el.Identifier = 'DEFAULT_PT_TSNS';
  el.Name = 'TSNS';
  el.Colour = 0xFD00D5; // 0xFD00D5_rgb
  el.MenuVisible = 1;
  el.MenuSection = SC_SENSOR;
  el.Enabled = 1;

  el.Advection = 0.0;
  el.AirDrag = f(f(0.00) * CFDS);
  el.AirLoss = f(0.96);
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

  el.HeatConduct = 0;
  el.Description = "Temperature sensor, creates a spark when there's a nearby particle with a greater temperature.";

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
  if (rd > 25)
    parts[i].tmp2 = rd = 25;
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
  let setFilt = false;
  let photonWl = 0;
  for (let rx = -rd; rx <= rd; rx++)
    for (let ry = -rd; ry <= rd; ry++)
      if (x + rx >= 0 && y + ry >= 0 && x + rx < XRES && y + ry < YRES && (rx || ry)) {
        let r = pmap[y + ry][x + rx];
        if (!r)
          r = sim.photons[y + ry][x + rx];
        if (!r)
          continue;
        if (parts[i].tmp === 0 && TYP(r) !== PT_TSNS && TYP(r) !== PT_METL && parts[ID(r)].temp > parts[i].temp)
          parts[i].life = 1;
        if (parts[i].tmp === 2 && TYP(r) !== PT_TSNS && TYP(r) !== PT_METL && parts[ID(r)].temp < parts[i].temp)
          parts[i].life = 1;
        if (parts[i].tmp === 1 && TYP(r) !== PT_TSNS && TYP(r) !== PT_FILT) {
          setFilt = true;
          photonWl = itrunc(parts[ID(r)].temp);
        }
      }
  if (setFilt) {
    for (let rx = -1; rx <= 1; rx++) {
      for (let ry = -1; ry <= 1; ry++) {
        if (rx || ry) {
          let r = pmap[y + ry][x + rx];
          if (!r)
            continue;
          let nx = x + rx;
          let ny = y + ry;
          while (TYP(r) === PT_FILT) {
            parts[ID(r)].ctype = 0x10000000 + photonWl;
            nx += rx;
            ny += ry;
            if (nx < 0 || ny < 0 || nx >= XRES || ny >= YRES)
              break;
            r = pmap[ny][nx];
          }
        }
      }
    }
  }
  return 0;
}
