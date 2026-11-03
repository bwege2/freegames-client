// simulation/elements/HEAC.cpp
import { sd } from '../sim/simulationData.ts';
import type { Element } from '../sim/element.ts';
import type { Simulation } from '../sim/simulation.ts';
import type { Particle } from '../sim/particle.ts';
import { f, restrict_flt } from '../sim/cpp.ts';
import {
  CFDS, ID, IPH, IPL, ITL, MAX_TEMP, MIN_TEMP, NT, SC_SOLIDS, TYPE_SOLID, XRES, YRES,
} from '../sim/config.ts';

export function Element_HEAC(el: Element): void {
  el.Identifier = 'DEFAULT_PT_HEAC';
  el.Name = 'HEAC';
  el.Colour = 0xCB6351;
  el.MenuVisible = 1;
  el.MenuSection = SC_SOLIDS;
  el.Enabled = 1;

  el.Advection = 0.0;
  el.AirDrag = f(0.00 * CFDS);
  el.AirLoss = f(0.90);
  el.Loss = 0.00;
  el.Collision = 0.0;
  el.Gravity = 0.0;
  el.Diffusion = 0.00;
  el.HotAir = f(0.000 * CFDS);
  el.Falldown = 0;

  el.Flammable = 0;
  el.Explosive = 0;
  el.Meltable = 1;
  el.Hardness = 0;

  el.Weight = 100;

  el.HeatConduct = 251;
  el.Description = 'Rapid heat conductor.';

  el.Properties = TYPE_SOLID;

  el.LowPressure = IPL;
  el.LowPressureTransition = NT;
  el.HighPressure = IPH;
  el.HighPressureTransition = NT;
  el.LowTemperature = ITL;
  el.LowTemperatureTransition = NT;
  // can't melt by normal heat conduction, this is used by other elements for special melting behavior
  el.HighTemperature = f(1887.15);
  el.HighTemperatureTransition = NT;

  el.Update = update;
}

// If this is used elsewhere (GOLD), it should be moved into Simulation.h
function CheckLine(sim: Simulation, x1: number, y1: number, x2: number, y2: number, func: (sim: Simulation, p: number) => boolean): boolean {
  const reverseXY = Math.abs(y2 - y1) > Math.abs(x2 - x1);
  let x: number, y: number;
  let e: number, de: number;
  if (reverseXY) {
    y = x1;
    x1 = y1;
    y1 = y;
    y = x2;
    x2 = y2;
    y2 = y;
  }
  if (x1 > x2) {
    y = x1;
    x1 = x2;
    x2 = y;
    y = y1;
    y1 = y2;
    y2 = y;
  }
  const dx = x2 - x1;
  const dy = Math.abs(y2 - y1);
  e = 0.0;
  if (dx)
    de = f(dy / dx);
  else
    de = 0.0;
  y = y1;
  const sy = (y1 < y2) ? 1 : -1;
  for (x = x1; x <= x2; x++) {
    if (reverseXY) {
      if (func(sim, sim.pmap[x][y])) return true;
    } else {
      if (func(sim, sim.pmap[y][x])) return true;
    }
    e = f(e + de);
    if (e >= 0.5) {
      y += sy;
      if ((y1 < y2) ? (y <= y2) : (y >= y2)) {
        if (reverseXY) {
          if (func(sim, sim.pmap[x][y])) return true;
        } else {
          if (func(sim, sim.pmap[y][x])) return true;
        }
      }
      e = f(e - 1.0);
    }
  }
  return false;
}

function update(sim: Simulation, i: number, x: number, y: number, _surround_space: number, _nt: number,
  parts: Particle[], pmap: Int32Array[]): number {
  const rad = 4;
  let rry: number, rrx: number, r: number;
  let c_heat = 0.0;
  let hc_total = 0.0;
  // the lambda [&sd](Simulation* sim, int p) { return p && sd.IsHeatInsulator(sim->parts[ID(p)]); }
  const insulatorOnLine = (sim: Simulation, p: number): boolean => {
    return !!p && sd.IsHeatInsulator(sim.parts[ID(p)]);
  };

  for (let rx = -1; rx <= 1; rx++) {
    for (let ry = -1; ry <= 1; ry++) {
      rry = ry * rad;
      rrx = rx * rad;
      if (x + rrx >= 0 && x + rrx < XRES && y + rry >= 0 && y + rry < YRES && !CheckLine(sim, x, y, x + rrx, y + rry, insulatorOnLine)) {
        r = pmap[y + rry][x + rrx];
        if (r && !sd.IsHeatInsulator(parts[ID(r)])) {
          const hc = f(sd.HeatCapacityOf(parts[ID(r)]));
          c_heat = f(c_heat + f(parts[ID(r)].temp * hc));
          hc_total = f(hc_total + hc);
        }

        r = sim.photons[y + rry][x + rrx];
        if (r && !sd.IsHeatInsulator(parts[ID(r)])) {
          const hc = f(sd.HeatCapacityOf(parts[ID(r)]));
          c_heat = f(c_heat + f(parts[ID(r)].temp * hc));
          hc_total = f(hc_total + hc);
        }
      }
    }
  }

  if (hc_total > 0.0) {
    const pt = restrict_flt(f(c_heat / hc_total), MIN_TEMP, MAX_TEMP);
    parts[i].temp = pt;

    for (let rx = -1; rx <= 1; rx++) {
      for (let ry = -1; ry <= 1; ry++) {
        rry = ry * rad;
        rrx = rx * rad;
        if (x + rrx >= 0 && x + rrx < XRES && y + rry >= 0 && y + rry < YRES && !CheckLine(sim, x, y, x + rrx, y + rry, insulatorOnLine)) {
          r = pmap[y + rry][x + rrx];
          if (r && !sd.IsHeatInsulator(parts[ID(r)]))
            parts[ID(r)].temp = pt;

          r = sim.photons[y + rry][x + rrx];
          if (r && !sd.IsHeatInsulator(parts[ID(r)]))
            parts[ID(r)].temp = pt;
        }
      }
    }
  }

  return 0;
}
