// simulation/simtools/MIX.cpp
import { ID, STATE_FLAGS, TYP, TYPE_GAS, TYPE_LIQUID, TYPE_PART, XRES, YRES } from '../sim/config.ts';
import { f, itrunc } from '../sim/cpp.ts';
import type { Particle } from '../sim/particle.ts';
import type { SimTool } from '../sim/simTool.ts';
import type { Simulation } from '../sim/simulation.ts';
import { sd } from '../sim/simulationData.ts';

export function Tool_MIX(tool: SimTool): void {
  tool.Identifier = 'DEFAULT_TOOL_MIX';
  tool.Name = 'MIX';
  tool.Colour = 0xFFD090;
  tool.Description = 'Mixes particles.';
  tool.Perform = perform;
}

function perform(_tool: SimTool, sim: Simulation, _cpart: Particle | null, x: number, y: number, _brushX: number, _brushY: number, strength: number): number {
  const elements = sd.elements;
  const thisPart = sim.pmap[y][x];
  if (!thisPart)
    return 0;

  if (sim.rng.call() % 100 != 0)
    return 0;

  // std::pow(float, float) is powf
  const distance = itrunc(f(f(Math.pow(strength, 0.5)) * 10));

  if (distance <= 0)
    return 0;

  if (!(elements[TYP(thisPart)].Properties & (TYPE_PART | TYPE_LIQUID | TYPE_GAS)))
    return 0;

  // unsigned arithmetic (rng() % distance is unsigned) converted back to int: the same as the signed result
  const newX = (x + (sim.rng.call() % distance) - ((distance / 2) | 0)) | 0;
  const newY = (y + (sim.rng.call() % distance) - ((distance / 2) | 0)) | 0;

  if (newX < 0 || newY < 0 || newX >= XRES || newY >= YRES)
    return 0;

  const thatPart = sim.pmap[newY][newX];
  if (!thatPart)
    return 0;

  if ((elements[TYP(thisPart)].Properties & STATE_FLAGS) != (elements[TYP(thatPart)].Properties & STATE_FLAGS))
    return 0;

  sim.pmap[y][x] = thatPart;
  sim.parts[ID(thatPart)].x = x;
  sim.parts[ID(thatPart)].y = y;

  sim.pmap[newY][newX] = thisPart;
  sim.parts[ID(thisPart)].x = newX;
  sim.parts[ID(thisPart)].y = newY;

  return 1;
}
