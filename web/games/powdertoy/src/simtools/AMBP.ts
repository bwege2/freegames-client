// simulation/simtools/AMBP.cpp
import { CELL, MAX_TEMP, MIN_TEMP } from '../sim/config.ts';
import { f } from '../sim/cpp.ts';
import type { Particle } from '../sim/particle.ts';
import type { SimTool } from '../sim/simTool.ts';
import type { Simulation } from '../sim/simulation.ts';

export function Tool_AMBP(tool: SimTool): void {
  tool.Identifier = 'DEFAULT_TOOL_AMBP';
  tool.Name = 'AMBP';
  tool.Colour = 0xFFDD00;
  tool.Description = 'Increases ambient air temperature.';
  tool.Perform = perform;
}

function perform(_tool: SimTool, sim: Simulation, _cpart: Particle | null, x: number, y: number, _brushX: number, _brushY: number, strength: number): number {
  if (!sim.aheat_enable) {
    return 0;
  }

  const row = sim.hv[(y / CELL) | 0], cx = (x / CELL) | 0;
  row[cx] = f(row[cx] + f(strength * 2.0));
  if (row[cx] > MAX_TEMP) row[cx] = MAX_TEMP;
  if (row[cx] < MIN_TEMP) row[cx] = MIN_TEMP;
  return 1;
}
