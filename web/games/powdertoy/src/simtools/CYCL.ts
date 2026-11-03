// simulation/simtools/CYCL.cpp
import { CELL, MAX_PRESSURE, MIN_PRESSURE } from '../sim/config.ts';
import { f } from '../sim/cpp.ts';
import type { Particle } from '../sim/particle.ts';
import type { SimTool } from '../sim/simTool.ts';
import type { Simulation } from '../sim/simulation.ts';

export function Tool_CYCL(tool: SimTool): void {
  tool.Identifier = 'DEFAULT_TOOL_CYCL';
  tool.Name = 'CYCL';
  tool.Colour = 0x132f5b;
  tool.Description = 'Cyclone, produces swirling air currents';
  tool.Perform = perform;
}

function perform(_tool: SimTool, sim: Simulation, _cpart: Particle | null, x: number, y: number, brushX: number, brushY: number, strength: number): number {
  /*
    Air velocity calculation.
    (x, y) -- turn 90 deg -> (-y, x)
  */
  // only trigger once per cell (less laggy)
  if ((x % CELL) == 0 && (y % CELL) == 0) {
    if (brushX == x && brushY == y)
      return 1;

    // float *vx = &sim->vx[y / CELL][x / CELL]; likewise vy
    const vxRow = sim.vx[(y / CELL) | 0], vyRow = sim.vy[(y / CELL) | 0], cx = (x / CELL) | 0;

    const dvx = brushX - x;
    const dvy = brushY - y;
    const invsqr = f(1 / f(Math.sqrt(f(f(dvx * dvx) + f(dvy * dvy)))));

    vxRow[cx] = f(vxRow[cx] - f(f(f(strength / 16) * -dvy) * invsqr));
    vyRow[cx] = f(vyRow[cx] - f(f(f(strength / 16) * dvx) * invsqr));

    // Clamp velocities
    if (vxRow[cx] > MAX_PRESSURE)
      vxRow[cx] = MAX_PRESSURE;
    else if (vxRow[cx] < MIN_PRESSURE)
      vxRow[cx] = MIN_PRESSURE;
    if (vyRow[cx] > MAX_PRESSURE)
      vyRow[cx] = MAX_PRESSURE;
    else if (vyRow[cx] < MIN_PRESSURE)
      vyRow[cx] = MIN_PRESSURE;

  }

  return 1;
}
