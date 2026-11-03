// simulation/elements/FRAY.cpp
import { sd } from '../sim/simulationData.ts';
import type { Element } from '../sim/element.ts';
import type { Simulation } from '../sim/simulation.ts';
import type { Particle } from '../sim/particle.ts';
import { f, restrict_flt } from '../sim/cpp.ts';
import {
  CFDS, IPH, IPL, ITH, ITL, MAX_VELOCITY, NT, SC_FORCE, TYPE_SOLID, XRES, YRES, TYP, ID,
} from '../sim/config.ts';
import { PT_SPRK } from '../sim/numbers.ts';

export function Element_FRAY(el: Element): void {
  el.Identifier = 'DEFAULT_PT_FRAY';
  el.Name = 'FRAY';
  el.Colour = 0x00BBFF; // 0x00BBFF_rgb
  el.MenuVisible = 1;
  el.MenuSection = SC_FORCE;
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

  el.DefaultProperties.temp = f(20.0 + f(273.15)); // 20.0f + 273.15f
  el.HeatConduct = 0;
  el.Description = 'Force Emitter. Pushes or pulls objects based on its temperature. Use like ARAY.';

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
  let curlen: number;
  if (parts[i].tmp > 0)
    curlen = parts[i].tmp;
  else
    curlen = 10;
  for (let rx = -1; rx <= 1; rx++) {
    for (let ry = -1; ry <= 1; ry++) {
      if (rx || ry) {
        let r = pmap[y + ry][x + rx];
        if (!r)
          continue;
        if (TYP(r) === PT_SPRK) {
          for (let nxx = 0, nyy = 0, nxi = rx * -1, nyi = ry * -1, len = 0; ; nyy += nyi, nxx += nxi, len++) {
            if (!(x + nxi + nxx < XRES && y + nyi + nyy < YRES && x + nxi + nxx >= 0 && y + nyi + nyy >= 0) || len > curlen) {
              break;
            }
            r = pmap[y + nyi + nyy][x + nxi + nxx];
            if (!r)
              r = sim.photons[y + nyi + nyy][x + nxi + nxx];
            if (r && !(elements[TYP(r)].Properties & TYPE_SOLID)) {
              const coef = f(f(parts[i].temp - f(273.15)) / f(10.0));
              parts[ID(r)].vx = restrict_flt(f(parts[ID(r)].vx + f(nxi * coef)), -MAX_VELOCITY, MAX_VELOCITY);
              parts[ID(r)].vy = restrict_flt(f(parts[ID(r)].vy + f(nyi * coef)), -MAX_VELOCITY, MAX_VELOCITY);
            }
          }
        }
      }
    }
  }
  return 0;
}
