// simulation/elements/ISOZ.cpp
import type { Element } from '../sim/element.ts';
import type { Simulation } from '../sim/simulation.ts';
import type { Particle } from '../sim/particle.ts';
import { f, itrunc } from '../sim/cpp.ts';
import {
  CELL, CFDS, IPH, IPL, ITH, NT, PROP_NEUTPENETRATE, PROP_PHOTPASS, R_TEMP, SC_NUCLEAR, TYPE_LIQUID,
} from '../sim/config.ts';
import { PT_ISZS, PT_PHOT } from '../sim/numbers.ts';

export function Element_ISOZ(el: Element): void {
  el.Identifier = 'DEFAULT_PT_ISOZ';
  el.Name = 'ISOZ';
  el.Colour = 0xAA30D0;
  el.MenuVisible = 1;
  el.MenuSection = SC_NUCLEAR;
  el.Enabled = 1;

  el.Advection = f(0.6);
  el.AirDrag = f(f(0.01) * CFDS);
  el.AirLoss = f(0.98);
  el.Loss = f(0.95);
  el.Collision = f(0.0);
  el.Gravity = f(0.1);
  el.Diffusion = f(0.00);
  el.HotAir = f(f(0.000) * CFDS);
  el.Falldown = 2;

  el.Flammable = 0;
  el.Explosive = 0;
  el.Meltable = 0;
  el.Hardness = 0;

  el.Weight = 24;

  el.DefaultProperties.temp = f(f(R_TEMP - f(2.0)) + f(273.15));
  el.HeatConduct = 29;
  el.Description = 'Isotope-Z. Radioactive liquid, decays into photons when touching PHOT or under negative pressure.';

  el.Properties = TYPE_LIQUID | PROP_NEUTPENETRATE | PROP_PHOTPASS;

  el.LowPressure = IPL;
  el.LowPressureTransition = NT;
  el.HighPressure = IPH;
  el.HighPressureTransition = NT;
  el.LowTemperature = f(160.0);
  el.LowTemperatureTransition = PT_ISZS; //@ ISOZ -> ISZS
  el.HighTemperature = ITH;
  el.HighTemperatureTransition = NT;

  el.Update = update;
}

function update(sim: Simulation, i: number, x: number, y: number, _surround_space: number, _nt: number,
  parts: Particle[], _pmap: Int32Array[]): number {
  let rr: number, rrr: number;
  if (sim.rng.chance(1, 200) && sim.rng.chance(itrunc(f(f(-4.0) * sim.pv[(y / CELL) | 0][(x / CELL) | 0])), 1000)) {
    //@ ISOZ -> PHOT
    sim.create_part(i, x, y, PT_PHOT);
    rr = f(sim.rng.between(128, 355) / f(127.0));
    rrr = f(f(sim.rng.between(0, 359) * f(Math.PI)) / f(180.0));
    parts[i].vx = f(rr * f(Math.cos(rrr)));
    parts[i].vy = f(rr * f(Math.sin(rrr)));
  }
  return 0;
}
