// simulation/simtools/COOL.cpp
import { MAX_TEMP } from '../sim/config.ts';
import { f } from '../sim/cpp.ts';
import { PT_GPMP, PT_PUMP } from '../sim/numbers.ts';
import type { Particle } from '../sim/particle.ts';
import type { SimTool } from '../sim/simTool.ts';
import type { Simulation } from '../sim/simulation.ts';

export function Tool_COOL(tool: SimTool): void {
  tool.Identifier = 'DEFAULT_TOOL_COOL';
  tool.Name = 'COOL';
  tool.Colour = 0x00DDFF;
  tool.Description = 'Cools the targeted element.';
  tool.Perform = perform;
}

function perform(_tool: SimTool, _sim: Simulation, cpart: Particle | null, _x: number, _y: number, _brushX: number, _brushY: number, strength: number): number {
  if (!cpart)
    return 0;
  if (cpart.type == PT_PUMP || cpart.type == PT_GPMP)
    cpart.temp = f(cpart.temp - f(strength * f(0.1)));
  else
    cpart.temp = f(cpart.temp - f(strength * 2.0));

  if (cpart.temp > MAX_TEMP)
    cpart.temp = MAX_TEMP;
  else if (cpart.temp < 0)
    cpart.temp = 0;
  return 1;
}
