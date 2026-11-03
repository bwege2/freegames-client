// simulation/elements/RPEL.cpp
import { sd } from '../sim/simulationData.ts';
import { Element } from '../sim/element.ts';
import type { Simulation } from '../sim/simulation.ts';
import type { Particle } from '../sim/particle.ts';
import { f, isign, restrict_flt } from '../sim/cpp.ts';
import {
  CFDS, IPH, IPL, ITH, ITL, MAX_VELOCITY, NT, SC_FORCE, TYPE_SOLID, XRES, YRES, TYP, ID,
} from '../sim/config.ts';

export function Element_RPEL(el: Element): void {
  el.Identifier = 'DEFAULT_PT_RPEL';
  el.Name = 'RPEL';
  el.Colour = 0x99CC00; // 0x99CC00_rgb
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
  el.Description = 'Repels or attracts particles based on its temperature.';

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
  el.CtypeDraw = Element.basicCtypeDraw;
}

function update(sim: Simulation, i: number, x: number, y: number, _surround_space: number, _nt: number,
  parts: Particle[], pmap: Int32Array[]): number {
  const elements = sd.elements;
  let r: number, rx: number, ry: number, ri: number;
  for (ri = 0; ri <= 10; ri++) {
    rx = sim.rng.between(-10, 10);
    ry = sim.rng.between(-10, 10);
    if (x + rx >= 0 && x + rx < XRES && y + ry >= 0 && y + ry < YRES && (rx || ry)) {
      r = pmap[y + ry][x + rx];
      if (!r)
        r = sim.photons[y + ry][x + rx];

      if (r && !(elements[TYP(r)].Properties & TYPE_SOLID)) {
        if (!parts[i].ctype || parts[i].ctype === parts[ID(r)].type) {
          // (temp-273.15)/10.0f is double; the sum is rounded to float by restrict_flt's parameter
          parts[ID(r)].vx = restrict_flt(f(parts[ID(r)].vx + isign(rx) * ((parts[i].temp - 273.15) / 10.0)), -MAX_VELOCITY, MAX_VELOCITY);
          parts[ID(r)].vy = restrict_flt(f(parts[ID(r)].vy + isign(ry) * ((parts[i].temp - 273.15) / 10.0)), -MAX_VELOCITY, MAX_VELOCITY);
        }
      }
    }
  }
  return 0;
}
