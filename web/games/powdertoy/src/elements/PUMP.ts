// simulation/elements/PUMP.cpp
import type { Element, GraphicsFuncContext, Gfx } from '../sim/element.ts';
import type { Simulation } from '../sim/simulation.ts';
import type { Particle } from '../sim/particle.ts';
import { f } from '../sim/cpp.ts';
import {
  CELL, CFDS, ID, IPH, IPL, ITH, ITL, MAX_PRESSURE, MIN_PRESSURE, NT, SC_POWERED, TYP, TYPE_SOLID,
} from '../sim/config.ts';
import { PT_FILT, PT_PUMP } from '../sim/numbers.ts';

export function Element_PUMP(el: Element): void {
  el.Identifier = 'DEFAULT_PT_PUMP';
  el.Name = 'PUMP';
  el.Colour = 0x0A0A3B;
  el.MenuVisible = 1;
  el.MenuSection = SC_POWERED;
  el.Enabled = 1;

  el.Advection = f(0.0);
  el.AirDrag = f(f(0.00) * CFDS);
  el.AirLoss = f(0.95);
  el.Loss = f(0.00);
  el.Collision = f(0.0);
  el.Gravity = f(0.0);
  el.Diffusion = f(0.00);
  el.HotAir = f(f(0.000) * CFDS);
  el.Falldown = 0;

  el.Flammable = 0;
  el.Explosive = 0;
  el.Meltable = 0;
  el.Hardness = 9;

  el.Weight = 100;

  el.DefaultProperties.temp = f(273.15);
  el.HeatConduct = 0;
  el.Description = 'Pressure pump. Changes pressure to its temp when activated. (use HEAT/COOL).';

  el.Properties = TYPE_SOLID;

  el.LowPressure = IPL;
  el.LowPressureTransition = NT;
  el.HighPressure = IPH;
  el.HighPressureTransition = NT;
  el.LowTemperature = ITL;
  el.LowTemperatureTransition = NT;
  el.HighTemperature = ITH;
  el.HighTemperatureTransition = NT;

  el.DefaultProperties.life = 10;

  el.Update = update;
  el.Graphics = graphics;
}

function update(sim: Simulation, i: number, x: number, y: number, _surround_space: number, _nt: number,
  parts: Particle[], pmap: Int32Array[]): number {
  if (parts[i].life !== 10) {
    if (parts[i].life > 0)
      parts[i].life--;
  }
  else {
    if (parts[i].temp >= f(MAX_PRESSURE + f(273.15)))
      parts[i].temp = f(MAX_PRESSURE + f(273.15));
    if (parts[i].temp <= f(MIN_PRESSURE + f(273.15)))
      parts[i].temp = f(MIN_PRESSURE + f(273.15));

    for (let rx = -1; rx <= 1; rx++) {
      for (let ry = -1; ry <= 1; ry++) {
        if (parts[i].tmp !== 1) {
          if (!(rx && ry)) {
            // float += float * double: computed in double, stored as float
            const row = sim.pv[((y / CELL) | 0) + ry];
            const cx = ((x / CELL) | 0) + rx;
            row[cx] = row[cx] + f(0.1) * ((parts[i].temp - 273.15) - row[cx]);
          }
        }
        else {
          const r = pmap[y + ry][x + rx];
          if (TYP(r) === PT_FILT) {
            const newPressure = parts[ID(r)].ctype - 0x10000000 | 0;
            if (newPressure >= 0 && newPressure <= f(MAX_PRESSURE - MIN_PRESSURE)) {
              sim.pv[((y + ry) / CELL) | 0][((x + rx) / CELL) | 0] = f(f(newPressure) + MIN_PRESSURE);
            }
          }
        }
      }
    }
    for (let rx = -2; rx <= 2; rx++) {
      for (let ry = -2; ry <= 2; ry++) {
        if (rx || ry) {
          const r = pmap[y + ry][x + rx];
          if (!r)
            continue;
          if (TYP(r) === PT_PUMP) {
            if (parts[ID(r)].life < 10 && parts[ID(r)].life > 0)
              parts[i].life = 9;
            else if (parts[ID(r)].life === 0)
              parts[ID(r)].life = 10;
          }
        }
      }
    }
  }
  return 0;
}

function graphics(_gfctx: GraphicsFuncContext, cpart: Particle, _nx: number, _ny: number, g: Gfx): number {
  const lifemod = ((cpart.life > 10 ? 10 : cpart.life) * 19);
  g.colb += lifemod;
  return 0;
}
