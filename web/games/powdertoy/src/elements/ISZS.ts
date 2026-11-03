// simulation/elements/ISZS.cpp
import type { Element } from '../sim/element.ts';
import type { Simulation } from '../sim/simulation.ts';
import type { Particle } from '../sim/particle.ts';
import { f, itrunc } from '../sim/cpp.ts';
import { CELL, CFDS, IPH, IPL, ITL, NT, PROP_PHOTPASS, SC_NUCLEAR, TYPE_SOLID } from '../sim/config.ts';
import { PT_ISOZ, PT_PHOT } from '../sim/numbers.ts';

export function Element_ISZS(el: Element): void {
  el.Identifier = 'DEFAULT_PT_ISZS';
  el.Name = 'ISZS';
  el.Colour = 0x662089;
  el.MenuVisible = 1;
  el.MenuSection = SC_NUCLEAR;
  el.Enabled = 1;

  el.Advection = f(0.0);
  el.AirDrag = f(f(0.00) * CFDS);
  el.AirLoss = f(0.90);
  el.Loss = f(0.00);
  el.Collision = f(0.0);
  el.Gravity = f(0.0);
  el.Diffusion = f(0.00);
  el.HotAir = f(f(-0.0007) * CFDS);
  el.Falldown = 0;

  el.Flammable = 0;
  el.Explosive = 0;
  el.Meltable = 1;
  el.Hardness = 1;

  el.Weight = 100;

  el.DefaultProperties.temp = f(140.00);
  el.HeatConduct = 251;
  el.Description = 'Solid form of ISOZ, slowly decays into PHOT.';

  el.Properties = TYPE_SOLID | PROP_PHOTPASS;

  el.LowPressure = IPL;
  el.LowPressureTransition = NT;
  el.HighPressure = IPH;
  el.HighPressureTransition = NT;
  el.LowTemperature = ITL;
  el.LowTemperatureTransition = NT;
  el.HighTemperature = f(300.0);
  el.HighTemperatureTransition = PT_ISOZ; //@ ISZS -> ISOZ

  el.Update = update;
}

function update(sim: Simulation, i: number, x: number, y: number, _surround_space: number, _nt: number,
  parts: Particle[], _pmap: Int32Array[]): number {
  let rr: number, rrr: number;
  if (sim.rng.chance(1, 200) && sim.rng.chance(itrunc(f(f(-4.0) * sim.pv[(y / CELL) | 0][(x / CELL) | 0])), 1000)) {
    //@ ISZS -> PHOT
    sim.create_part(i, x, y, PT_PHOT);
    rr = f(sim.rng.between(128, 355) / f(127.0));
    rrr = f(f(sim.rng.between(0, 359) * f(Math.PI)) / f(180.0));
    parts[i].vx = f(rr * f(Math.cos(rrr)));
    parts[i].vy = f(rr * f(Math.sin(rrr)));
  }
  return 0;
}
