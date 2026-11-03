// simulation/simtools/WIND.cpp
import { CELL, XRES, YRES } from '../sim/config.ts';
import { f } from '../sim/cpp.ts';
import type { Brush } from '../sim/brush.ts';
import type { SimTool } from '../sim/simTool.ts';
import type { Simulation } from '../sim/simulation.ts';
import type { Vec2 } from '../sim/vec2.ts';

export function Tool_WIND(tool: SimTool): void {
  tool.Identifier = 'DEFAULT_TOOL_WIND';
  tool.Name = 'WIND';
  tool.Colour = 0x404040;
  tool.Description = 'Creates air movement.';
  tool.PerformDrawLine = performDrawLine;
  tool.PerformDrag = performDrag;
}

function performDrawLine(tool: SimTool, sim: Simulation, brush: Brush, position1: Vec2, position2: Vec2, dragging: boolean): void {
  let strength = dragging ? f(0.01) : f(0.002);
  strength = f(strength * tool.Strength);

  const dX = position2.X - position1.X, dY = position2.Y - position1.Y;
  for (const off of brush) {
    const cx = position1.X + off.X, cy = position1.Y + off.Y;
    if (cx >= 0 && cy >= 0 && cx < XRES && cy < YRES) {
      const vx = sim.vx[(cy / CELL) | 0], vy = sim.vy[(cy / CELL) | 0], c = (cx / CELL) | 0;
      vx[c] = f(vx[c] + f(dX * strength));
      vy[c] = f(vy[c] + f(dY * strength));
    }
  }
}

function performDrag(tool: SimTool, sim: Simulation, brush: Brush, position1: Vec2, position2: Vec2): void {
  performDrawLine(tool, sim, brush, position1, position2, false);
}
