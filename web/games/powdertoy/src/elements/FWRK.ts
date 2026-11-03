// simulation/elements/FWRK.cpp
import { sd } from '../sim/simulationData.ts';
import type { Element } from '../sim/element.ts';
import type { Simulation } from '../sim/simulation.ts';
import type { Particle } from '../sim/particle.ts';
import { FIELD_CTYPE } from '../sim/particle.ts';
import { f, itrunc } from '../sim/cpp.ts';
import { CELL, CFDS, IPH, IPL, ITH, ITL, NT, PROP_LIFE_DEC, SC_EXPLOSIVE, TYPE_PART } from '../sim/config.ts';
import { PT_DUST, PT_EMBR, PT_FWRK } from '../sim/numbers.ts';

export function Element_FWRK(el: Element): void {
  el.Identifier = 'DEFAULT_PT_FWRK';
  el.Name = 'FWRK';
  el.Colour = 0x666666;
  el.MenuVisible = 1;
  el.MenuSection = SC_EXPLOSIVE;
  el.Enabled = 1;

  el.Advection = f(0.4);
  el.AirDrag = f(f(0.01) * CFDS);
  el.AirLoss = f(0.99);
  el.Loss = f(0.95);
  el.Collision = f(0.0);
  el.Gravity = f(0.4);
  el.Diffusion = f(0.00);
  el.HotAir = f(f(0.000) * CFDS);
  el.Falldown = 1;

  el.Flammable = 0;
  el.Explosive = 0;
  el.Meltable = 0;
  el.Hardness = 1;

  el.Weight = 97;

  el.HeatConduct = 100;
  el.Description = 'Original version of fireworks, activated by heat/neutrons.';

  el.Properties = TYPE_PART|PROP_LIFE_DEC;
  el.CarriesTypeIn = ((1 << FIELD_CTYPE)) >>> 0;

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

function update(sim: Simulation, i: number, x: number, y: number, surround_space: number, _nt: number,
  parts: Particle[], _pmap: Int32Array[]): number {
  const elements = sd.elements;
  if (parts[i].life === 0 && ((surround_space && parts[i].temp > 400 && sim.rng.chance(itrunc(f(9 + f(parts[i].temp / 40))), 100000)) || parts[i].ctype === PT_DUST)) {
    let gx: number, gy: number;
    let randTmp: number;
    const g = { x: 0, y: 0 };
    sim.GetGravityField(x, y, elements[PT_FWRK].Gravity, 1.0, g);
    gx = f(g.x); gy = f(g.y);
    if (f(f(gx * gx) + f(gy * gy)) < f(0.001)) {
      const angle = f(sim.rng.between(0, 6283) * f(0.001));//(in radians, between 0 and 2*pi)
      gx = f(gx + f(f(f(Math.sin(angle)) * elements[PT_FWRK].Gravity) * f(0.5)));
      gy = f(gy + f(f(f(Math.cos(angle)) * elements[PT_FWRK].Gravity) * f(0.5)));
    }
    const gmax = Math.max(Math.abs(gx), Math.abs(gy));
    if (sim.eval_move(PT_FWRK, itrunc(f(f(x - f(gx / gmax)) + f(0.5))), itrunc(f(f(y - f(gy / gmax)) + f(0.5))), null)) {
      const multiplier = f(f(15.0) / f(Math.sqrt(f(f(gx * gx) + f(gy * gy)))));

      //Some variation in speed parallel to gravity direction
      randTmp = sim.rng.between(-100, 100);
      gx = f(gx + f(f(gx * randTmp) * f(0.002)));
      gy = f(gy + f(f(gy * randTmp) * f(0.002)));
      //and a bit more variation in speed perpendicular to gravity direction
      randTmp = sim.rng.between(-100, 100);
      gx = f(gx + f(f(-gy * randTmp) * f(0.005)));
      gy = f(gy + f(f(gx * randTmp) * f(0.005)));

      parts[i].life = sim.rng.between(18, 27);
      parts[i].ctype = 0;
      parts[i].vx = f(parts[i].vx - f(gx * multiplier));
      parts[i].vy = f(parts[i].vy - f(gy * multiplier));
      return 0;
    }
  }
  if (parts[i].life < 3 && parts[i].life > 0) {
    const r = sim.rng.between(11, 255);
    const g = sim.rng.between(11, 255);
    const b = sim.rng.between(11, 255);
    let n: number;
    let angle: number, magnitude: number;
    const col = ((r << 16) | (g << 8) | b) >>> 0;
    for (n = 0; n < 40; n++) {
      //@ FWRK -> EMBR
      const np = sim.create_part(-3, x, y, PT_EMBR);
      if (np > -1) {
        magnitude = f(sim.rng.between(40, 99) * f(0.05));
        angle = f(sim.rng.between(0, 6283) * f(0.001));//(in radians, between 0 and 2*pi)
        parts[np].vx = f(f(parts[i].vx * f(0.5)) + f(f(Math.cos(angle)) * magnitude));
        parts[np].vy = f(f(parts[i].vy * f(0.5)) + f(f(Math.sin(angle)) * magnitude));
        parts[np].ctype = col;
        parts[np].tmp = 1;
        parts[np].life = sim.rng.between(70, 109);
        parts[np].temp = sim.rng.between(5750, 6249);
        parts[np].dcolour = parts[i].dcolour;
      }
    }
    sim.pv[(y / CELL) | 0][(x / CELL) | 0] = f(sim.pv[(y / CELL) | 0][(x / CELL) | 0] + f(8.0));
    sim.kill_part(i);
    return 1;
  }
  if (parts[i].life >= 45)
    parts[i].life = 0;
  return 0;
}
