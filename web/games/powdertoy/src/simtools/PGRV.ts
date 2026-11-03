// simulation/simtools/PGRV.cpp
import { CELL, XCELLS } from '../sim/config.ts';
import { f } from '../sim/cpp.ts';
import type { Particle } from '../sim/particle.ts';
import type { SimTool } from '../sim/simTool.ts';
import type { Simulation } from '../sim/simulation.ts';

export function Tool_PGRV(tool: SimTool): void {
  tool.Identifier = 'DEFAULT_TOOL_PGRV';
  tool.Name = 'PGRV';
  tool.Colour = 0xCCCCFF;
  tool.Description = 'Creates a short-lasting gravity well.';
  tool.Perform = perform;
}

function perform(_tool: SimTool, sim: Simulation, _cpart: Particle | null, x: number, y: number, _brushX: number, _brushY: number, strength: number): number {
  sim.gravIn.mass[((y / CELL) | 0) * XCELLS + ((x / CELL) | 0)] = f(strength * 5.0);
  return 1;
}
