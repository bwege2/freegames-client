// simulation/elements/STKM2.cpp
import type { Element } from '../sim/element.ts';
import type { Simulation } from '../sim/simulation.ts';
import type { Particle } from '../sim/particle.ts';
import { FIELD_CTYPE } from '../sim/particle.ts';
import { f } from '../sim/cpp.ts';
import { CFDS, IPH, IPL, ITL, NT, PROP_NOCTYPEDRAW, R_TEMP, SC_SPECIAL } from '../sim/config.ts';
import { PT_FIRE, PT_SPAWN2, PT_STKM2 } from '../sim/numbers.ts';
import { Element_STKM_graphics, Element_STKM_init_legs, Element_STKM_run_stickman } from './STKM.ts';

export function Element_STKM2(el: Element): void {
  el.Identifier = 'DEFAULT_PT_STKM2';
  el.Name = 'STK2';
  el.Colour = 0x6464FF;
  el.MenuVisible = 1;
  el.MenuSection = SC_SPECIAL;
  el.Enabled = 1;

  el.Advection = f(0.5);
  el.AirDrag = f(f(0.00) * CFDS);
  el.AirLoss = f(0.2);
  el.Loss = f(1.0);
  el.Collision = f(0.0);
  el.Gravity = f(0.0);
  el.NewtonianGravity = f(0.0);
  el.Diffusion = f(0.0);
  el.HotAir = f(f(0.00) * CFDS);
  el.Falldown = 0;

  el.Flammable = 0;
  el.Explosive = 0;
  el.Meltable = 0;
  el.Hardness = 0;

  el.Weight = 50;

  el.DefaultProperties.temp = f(f(R_TEMP + f(14.6)) + f(273.15));
  el.HeatConduct = 0;
  el.Description = 'Second stickman. Don\'t kill him! Control with wasd.';

  el.Properties = PROP_NOCTYPEDRAW;
  el.CarriesTypeIn = ((1 << FIELD_CTYPE)) >>> 0;

  el.LowPressure = IPL;
  el.LowPressureTransition = NT;
  el.HighPressure = IPH;
  el.HighPressureTransition = NT;
  el.LowTemperature = ITL;
  el.LowTemperatureTransition = NT;
  el.HighTemperature = f(620.0);
  el.HighTemperatureTransition = PT_FIRE; //@ STKM2 -> FIRE

  el.DefaultProperties.life = 100;

  el.Update = update;
  el.Graphics = Element_STKM_graphics;
  el.Create = create;
  el.CreateAllowed = createAllowed;
  el.ChangeType = changeType;
}

function update(sim: Simulation, i: number, x: number, y: number, surround_space: number, nt: number,
  parts: Particle[], pmap: Int32Array[]): number {
  Element_STKM_run_stickman(sim.player2, sim, i, x, y, surround_space, nt, parts, pmap);
  return 0;
}

function create(sim: Simulation, _i: number, x: number, y: number, _t: number, _v: number): void {
  const spawnID = sim.create_part(-3, x, y, PT_SPAWN2);
  if (spawnID >= 0)
    sim.player2.spawnID = spawnID;
}

function createAllowed(sim: Simulation, _i: number, _x: number, _y: number, _t: number): boolean {
  return sim.elementCount[PT_STKM2] <= 0 && !sim.player2.spwn;
}

function changeType(sim: Simulation, i: number, _x: number, _y: number, _from: number, to: number): void {
  if (to === PT_STKM2) {
    Element_STKM_init_legs(sim, sim.player2, i);
    sim.player2.spwn = 1;
  }
  else
    sim.player2.spwn = 0;
}
