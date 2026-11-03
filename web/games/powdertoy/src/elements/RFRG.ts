// simulation/elements/RFRG.cpp (+ RFRG.h)
import type { Element } from '../sim/element.ts';
import type { Simulation } from '../sim/simulation.ts';
import type { Particle } from '../sim/particle.ts';
import { f, restrict_flt } from '../sim/cpp.ts';
import { CELL, CFDS, IPL, ITH, ITL, MAX_TEMP, NT, PROP_DEADLY, SC_GAS, TYPE_GAS } from '../sim/config.ts';
import { PT_RFGL } from '../sim/numbers.ts';

export function Element_RFRG(el: Element): void {
  el.Identifier = 'DEFAULT_PT_RFRG';
  el.Name = 'RFRG';
  el.Colour = 0x72D2D4;
  el.MenuVisible = 1;
  el.MenuSection = SC_GAS;
  el.Enabled = 1;

  el.Advection = f(1.2);
  el.AirDrag = f(0.00 * CFDS);
  el.AirLoss = f(0.99);
  el.Loss = f(0.30);
  el.Collision = f(-0.1);
  el.Gravity = 0.0;
  el.Diffusion = f(1.3);
  el.HotAir = f(f(0.0001) * CFDS);
  el.Falldown = 0;

  el.Flammable = 0;
  el.Explosive = 0;
  el.Meltable = 0;
  el.Hardness = 21;

  el.Weight = 1;

  el.HeatConduct = 3;
  el.Description = 'Refrigerant. Heats up and liquefies under pressure.';

  el.Properties = TYPE_GAS | PROP_DEADLY;

  el.LowPressure = IPL;
  el.LowPressureTransition = NT;
  el.HighPressure = 2;
  el.HighPressureTransition = PT_RFGL; //@ RFRG -> RFGL
  el.LowTemperature = ITL;
  el.LowTemperatureTransition = NT;
  el.HighTemperature = ITH;
  el.HighTemperatureTransition = NT;

  el.Update = Element_RFRG_update;
}

// `float *old_pressure = (float *)&parts[i].tmp`: tmp's 32 bits read and written as a float
const punF32 = new Float32Array(1);
const punI32 = new Int32Array(punF32.buffer);
function intBitsToFloat(v: number): number { punI32[0] = v; return punF32[0]; }
function floatToIntBits(v: number): number { punF32[0] = v; return punI32[0]; }

export function Element_RFRG_update(sim: Simulation, i: number, x: number, y: number, _surround_space: number, _nt: number,
  parts: Particle[], _pmap: Int32Array[]): number {
  const new_pressure = sim.pv[(y / CELL) | 0][(x / CELL) | 0];
  const old_pressure = intBitsToFloat(parts[i].tmp);
  if (Number.isNaN(old_pressure)) {
    parts[i].tmp = floatToIntBits(new_pressure);
    return 0;
  }

  // * 0 bar seems to be pressure value -256 in TPT, see Air.cpp. Also, 1 bar seems to be pressure value 0.
  //   With those two values we can set up our pressure scale which states that ... the highest pressure
  //   we can achieve in TPT is 2 bar. That's not particularly realistic, but good enough for TPT.

  parts[i].temp = restrict_flt(f(parts[i].temp * f(f(new_pressure + 257.0) / f(old_pressure + 257.0))), 0, MAX_TEMP);
  parts[i].tmp = floatToIntBits(new_pressure);
  return 0;
}
