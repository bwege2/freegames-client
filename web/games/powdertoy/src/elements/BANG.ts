// simulation/elements/BANG.cpp
import type { Element } from '../sim/element.ts';
import type { Simulation } from '../sim/simulation.ts';
import { FIELD_TMP, type Particle } from '../sim/particle.ts';
import { f, restrict_flt } from '../sim/cpp.ts';
import {
  CELL, CFDS, IPH, IPL, ITH, ITL, MAX_TEMP, MIN_TEMP, NT, PROP_NEUTPENETRATE, SC_EXPLOSIVE, TYPE_SOLID, TYP, ID,
} from '../sim/config.ts';
import { PT_EMBR, PT_FIRE, PT_LIGH, PT_PLSM, PT_SMKE, PT_SPRK } from '../sim/numbers.ts';

export function Element_BANG(el: Element): void {
  el.Identifier = 'DEFAULT_PT_BANG';
  el.Name = 'TNT';
  el.Colour = 0xC05050; // 0xC05050_rgb
  el.MenuVisible = 1;
  el.MenuSection = SC_EXPLOSIVE;
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

  el.HeatConduct = 88;
  el.Description = 'TNT, explodes all at once.';

  el.Properties = TYPE_SOLID | PROP_NEUTPENETRATE;

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
  if (parts[i].tmp === 0) {
    if (parts[i].temp >= 673.0)
      parts[i].tmp = 1;
    else {
      for (let rx = -1; rx <= 1; rx++) {
        for (let ry = -1; ry <= 1; ry++) {
          if (rx || ry) {
            const r = pmap[y + ry][x + rx];
            if (!r)
              continue;
            if (TYP(r) === PT_FIRE || TYP(r) === PT_PLSM || TYP(r) === PT_SPRK || TYP(r) === PT_LIGH) {
              parts[i].tmp = 1;
            }
          }
        }
      }
    }
  }
  else if (parts[i].tmp === 1) {
    if (pmap[y][x] && ID(pmap[y][x]) === i) {
      sim.flood_prop(x, y, { propertyIndex: FIELD_TMP, value: 2 });
    }
    parts[i].tmp = 2;
  }
  else if (parts[i].tmp === 2) {
    parts[i].tmp = 3;
  }
  else {
    const otemp = f(parts[i].temp - f(273.15));
    //Explode!!
    sim.pv[(y / CELL) | 0][(x / CELL) | 0] = f(sim.pv[(y / CELL) | 0][(x / CELL) | 0] + 0.5);
    parts[i].tmp = 0;
    if (sim.rng.chance(1, 3)) {
      if (sim.rng.chance(1, 2)) {
        //@ BANG -> FIRE
        sim.create_part(i, x, y, PT_FIRE);
      }
      else {
        //@ BANG -> SMKE
        sim.create_part(i, x, y, PT_SMKE);
        parts[i].life = sim.rng.between(500, 549);
      }
      parts[i].temp = restrict_flt(f(f(MAX_TEMP / 4) + otemp), MIN_TEMP, MAX_TEMP);
    }
    else {
      if (sim.rng.chance(1, 15)) {
        //@ BANG -> EMBR
        sim.create_part(i, x, y, PT_EMBR);
        parts[i].tmp = 0;
        parts[i].life = 50;
        parts[i].temp = restrict_flt(f(f(MAX_TEMP / 3) + otemp), MIN_TEMP, MAX_TEMP);
        parts[i].vx = sim.rng.between(-10, 10);
        parts[i].vy = sim.rng.between(-10, 10);
      }
      else {
        sim.kill_part(i);
      }
    }
    return 1;
  }
  return 0;
}
