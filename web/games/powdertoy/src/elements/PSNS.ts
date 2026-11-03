// simulation/elements/PSNS.cpp
import { sd } from '../sim/simulationData.ts';
import type { Element } from '../sim/element.ts';
import type { Simulation } from '../sim/simulation.ts';
import type { Particle } from '../sim/particle.ts';
import { f, itrunc } from '../sim/cpp.ts';
import {
  CELL, CFDS, ID, IPH, IPL, ITH, ITL, MIN_PRESSURE, NT, PROP_CONDUCTS, SC_SENSOR, TYP, TYPE_SOLID, XRES, YRES,
} from '../sim/config.ts';
import { PT_FILT, PT_INSL, PT_INWR, PT_NTCT, PT_PTCT, PT_RSSS, PT_SLTW, PT_SPRK, PT_WATR } from '../sim/numbers.ts';

export function Element_PSNS(el: Element): void {
  el.Identifier = 'DEFAULT_PT_PSNS';
  el.Name = 'PSNS';
  el.Colour = 0xDB2020;
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
  el.Description = 'Pressure sensor, creates a spark when the pressure is greater than its temperature.';

  el.Properties = TYPE_SOLID;

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
  const elements = sd.elements;
  if ((parts[i].tmp === 0 && sim.pv[(y / CELL) | 0][(x / CELL) | 0] > f(parts[i].temp - f(273.15))) || (parts[i].tmp === 2 && sim.pv[(y / CELL) | 0][(x / CELL) | 0] < f(parts[i].temp - f(273.15)))) {
    for (let rx = -2; rx <= 2; rx++) {
      for (let ry = -2; ry <= 2; ry++) {
        if (rx || ry) {
          const r = pmap[y + ry][x + rx];
          if (!r)
            continue;
          const pavg = sim.parts_avg(i, ID(r), PT_INSL);
          if (pavg !== PT_INSL && pavg !== PT_RSSS) {
            const rt = TYP(r);
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
  if (parts[i].tmp === 1) {
    const setFilt = true;
    const photonWl = sim.pv[(y / CELL) | 0][(x / CELL) | 0];
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
              // round(float) rounds halves away from zero; minus MIN_PRESSURE is a float operation
              parts[ID(r)].ctype = 0x10000000 + itrunc(f(Math.sign(photonWl) * Math.round(Math.abs(photonWl)) - MIN_PRESSURE));
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
  }
  return 0;
}
