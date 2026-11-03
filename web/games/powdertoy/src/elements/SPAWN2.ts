// simulation/elements/SPAWN2.cpp
import type { Element } from '../sim/element.ts';
import type { Simulation } from '../sim/simulation.ts';
import { f } from '../sim/cpp.ts';
import { CFDS, IPH, IPL, ITH, ITL, NT, SC_SOLIDS, TYPE_SOLID } from '../sim/config.ts';
import { PT_SPAWN2 } from '../sim/numbers.ts';

export function Element_SPAWN2(el: Element): void {
  el.Identifier = 'DEFAULT_PT_SPAWN2';
  el.Name = 'SPWN2';
  el.Colour = 0xAAAAAA;
  el.MenuVisible = 0;
  el.MenuSection = SC_SOLIDS;
  el.Enabled = 1;

  el.Advection = f(0.0);
  el.AirDrag = f(f(0.00) * CFDS);
  el.AirLoss = f(1.00);
  el.Loss = f(0.00);
  el.Collision = f(0.0);
  el.Gravity = f(0.0);
  el.Diffusion = f(0.00);
  el.HotAir = f(f(0.000) * CFDS);
  el.Falldown = 0;

  el.Flammable = 0;
  el.Explosive = 0;
  el.Meltable = 0;
  el.Hardness = 1;

  el.Weight = 100;

  el.HeatConduct = 0;
  el.Description = 'STK2 spawn point.';

  el.Properties = TYPE_SOLID;

  el.LowPressure = IPL;
  el.LowPressureTransition = NT;
  el.HighPressure = IPH;
  el.HighPressureTransition = NT;
  el.LowTemperature = ITL;
  el.LowTemperatureTransition = NT;
  el.HighTemperature = ITH;
  el.HighTemperatureTransition = NT;

  el.CreateAllowed = createAllowed;
  el.ChangeType = changeType;
}

function createAllowed(sim: Simulation, _i: number, _x: number, _y: number, _t: number): boolean {
  return sim.player2.spawnID === -1;
}

function changeType(sim: Simulation, i: number, _x: number, _y: number, _from: number, to: number): void {
  if (to === PT_SPAWN2) {
    if (sim.player2.spawnID === -1)
      sim.player2.spawnID = i;
  }
  else {
    if (sim.player2.spawnID === i)
      sim.player2.spawnID = -1;
  }
}
