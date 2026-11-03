// simulation/simtools/NGRV.cpp
import { CELL, XCELLS } from '../sim/config.ts';
import { f } from '../sim/cpp.ts';
import type { Particle } from '../sim/particle.ts';
import type { SimTool } from '../sim/simTool.ts';
import type { Simulation } from '../sim/simulation.ts';

export function Tool_NGRV(tool: SimTool): void {
  tool.Identifier = 'DEFAULT_TOOL_NGRV';
  tool.Name = 'NGRV';
  tool.Colour = 0xAACCFF;
  tool.Description = 'Creates a short-lasting negative gravity well.';
  tool.Perform = perform;
}

function perform(_tool: SimTool, sim: Simulation, _cpart: Particle | null, x: number, y: number, _brushX: number, _brushYy: number, strength: number): number {
  sim.gravIn.mass[((y / CELL) | 0) * XCELLS + ((x / CELL) | 0)] = f(strength * -5.0);
  return 1;
}
