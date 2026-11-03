// simulation/simtools/VAC.cpp
import { CELL, MAX_PRESSURE, MIN_PRESSURE } from '../sim/config.ts';
import { f } from '../sim/cpp.ts';
import type { Particle } from '../sim/particle.ts';
import type { SimTool } from '../sim/simTool.ts';
import type { Simulation } from '../sim/simulation.ts';

export function Tool_VAC(tool: SimTool): void {
  tool.Identifier = 'DEFAULT_TOOL_VAC';
  tool.Name = 'VAC';
  tool.Colour = 0x303030;
  tool.Description = 'Vacuum, reduces air pressure.';
  tool.Perform = perform;
}

function perform(_tool: SimTool, sim: Simulation, _cpart: Particle | null, x: number, y: number, _brushX: number, _brushY: number, strength: number): number {
  const row = sim.pv[(y / CELL) | 0], cx = (x / CELL) | 0;
  row[cx] = f(row[cx] - f(strength * f(0.05)));

  if (row[cx] > MAX_PRESSURE)
    row[cx] = MAX_PRESSURE;
  else if (row[cx] < MIN_PRESSURE)
    row[cx] = MIN_PRESSURE;
  return 1;
}
