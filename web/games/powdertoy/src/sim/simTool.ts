// simulation/SimTool.h / SimTool.cpp and ToolClasses.cpp: the simulation tools (HEAT, COOL, AIR, ...). Each tool's
// properties are set by Tool_XXX(tool) in src/simtools/XXX.ts, as SimTool::Tool_XXX() does in C++.
import { ID, XRES, YRES } from './config.ts';
import { f } from './cpp.ts';
import type { Particle } from './particle.ts';
import type { Simulation } from './simulation.ts';
import type { Brush } from './brush.ts';
import { Tool } from './tools.ts';
import { RectBetween, rectPoints, type Vec2 } from './vec2.ts';
import { Tool_AIR } from '../simtools/AIR.ts';
import { Tool_AMBM } from '../simtools/AMBM.ts';
import { Tool_AMBP } from '../simtools/AMBP.ts';
import { Tool_COOL } from '../simtools/COOL.ts';
import { Tool_CYCL } from '../simtools/CYCL.ts';
import { Tool_HEAT } from '../simtools/HEAT.ts';
import { Tool_MIX } from '../simtools/MIX.ts';
import { Tool_NGRV } from '../simtools/NGRV.ts';
import { Tool_PGRV } from '../simtools/PGRV.ts';
import { Tool_VAC } from '../simtools/VAC.ts';
import { Tool_WIND } from '../simtools/WIND.ts';

export type PerformFunc = (tool: SimTool, sim: Simulation, cpart: Particle | null, x: number, y: number, brushX: number, brushY: number, strength: number) => number;
export type PerformClickFunc = (tool: SimTool, sim: Simulation, brush: Brush, position: Vec2) => void;
export type PerformDragFunc = (tool: SimTool, sim: Simulation, brush: Brush, position1: Vec2, position2: Vec2) => void;
export type PerformDrawFunc = (tool: SimTool, sim: Simulation, brush: Brush, position: Vec2) => void;
export type PerformDrawLineFunc = (tool: SimTool, sim: Simulation, brush: Brush, position1: Vec2, position2: Vec2, dragging: boolean) => void;
export type PerformDrawRectFunc = (tool: SimTool, sim: Simulation, brush: Brush, position1: Vec2, position2: Vec2) => void;
export type PerformDrawFillFunc = (tool: SimTool, sim: Simulation, brush: Brush, position: Vec2) => void;
export type PerformSelectFunc = (tool: SimTool, toolSelection: number) => void;

function defaultPerformDraw(tool: SimTool, sim: Simulation, brush: Brush, position: Vec2): void {
  for (const off of brush) {
    const coords = { X: position.X + off.X, Y: position.Y + off.Y };
    if (coords.X >= 0 && coords.Y >= 0 && coords.X < XRES && coords.Y < YRES) {
      tool.CallPerform(sim, coords, position);
    }
  }
}

function defaultPerformDrawLine(tool: SimTool, sim: Simulation, brush: Brush, position1: Vec2, position2: Vec2, _dragging: boolean): void {
  let x1 = position1.X;
  let y1 = position1.Y;
  let x2 = position2.X;
  let y2 = position2.Y;
  const reverseXY = Math.abs(y2 - y1) > Math.abs(x2 - x1);
  let x: number, y: number;
  const rx = brush.GetRadius().X, ry = brush.GetRadius().Y;
  let e = 0.0;
  if (reverseXY) {
    y = x1;
    x1 = y1;
    y1 = y;
    y = x2;
    x2 = y2;
    y2 = y;
  }
  if (x1 > x2) {
    y = x1;
    x1 = x2;
    x2 = y;
    y = y1;
    y1 = y2;
    y2 = y;
  }
  const dx = x2 - x1;
  const dy = Math.abs(y2 - y1);
  const de = dx ? f(dy / dx) : 0.0;
  y = y1;
  const sy = (y1 < y2) ? 1 : -1;
  for (x = x1; x <= x2; x++) {
    if (reverseXY)
      defaultPerformDraw(tool, sim, brush, { X: y, Y: x });
    else
      defaultPerformDraw(tool, sim, brush, { X: x, Y: y });
    e = f(e + de);
    if (e >= 0.5) {
      y += sy;
      if (!(rx + ry) && ((y1 < y2) ? (y <= y2) : (y >= y2))) {
        if (reverseXY)
          defaultPerformDraw(tool, sim, brush, { X: y, Y: x });
        else
          defaultPerformDraw(tool, sim, brush, { X: x, Y: y });
      }
      e = f(e - 1.0);
    }
  }
}

function defaultPerformDrawRect(tool: SimTool, sim: Simulation, _brush: Brush, position1: Vec2, position2: Vec2): void {
  const brushX = ((position1.X + position2.X) / 2) | 0;
  const brushY = ((position1.Y + position2.Y) / 2) | 0;
  const tl = { X: Math.min(position1.X, position2.X), Y: Math.min(position1.Y, position2.Y) };
  const br = { X: Math.max(position1.X, position2.X), Y: Math.max(position1.Y, position2.Y) };
  for (const p of rectPoints(RectBetween(tl, br))) {
    tool.CallPerform(sim, p, { X: brushX, Y: brushY });
  }
}

export class SimTool extends Tool {
  Perform: PerformFunc | null = null;
  PerformClick: PerformClickFunc | null = null;
  PerformDrag: PerformDragFunc | null = null;
  PerformDraw: PerformDrawFunc | null = defaultPerformDraw;
  PerformDrawLine: PerformDrawLineFunc | null = defaultPerformDrawLine;
  PerformDrawRect: PerformDrawRectFunc | null = defaultPerformDrawRect;
  PerformDrawFill: PerformDrawFillFunc | null = null;
  PerformSelect: PerformSelectFunc | null = null;

  CallPerform(sim: Simulation, position: Vec2, brushOffset: Vec2): void {
    let cpart: Particle | null = null;
    let r: number;
    if ((r = sim.pmap[position.Y][position.X]))
      cpart = sim.parts[ID(r)];
    else if ((r = sim.photons[position.Y][position.X]))
      cpart = sim.parts[ID(r)];
    if (this.Perform) {
      // TODO: maybe do something with the result
      this.Perform(this, sim, cpart, position.X, position.Y, brushOffset.X, brushOffset.Y, this.Strength);
    }
  }

  override Click(sim: Simulation, brush: Brush, position: Vec2): void {
    if (this.PerformClick) {
      this.PerformClick(this, sim, brush, position);
    }
  }

  override Drag(sim: Simulation, brush: Brush, position1: Vec2, position2: Vec2): void {
    if (this.PerformDrag) {
      this.PerformDrag(this, sim, brush, position1, position2);
    }
  }

  override Draw(sim: Simulation, brush: Brush, position: Vec2): void {
    if (this.PerformDraw) {
      this.PerformDraw(this, sim, brush, position);
    }
  }

  override DrawLine(sim: Simulation, brush: Brush, position1: Vec2, position2: Vec2, dragging: boolean): void {
    if (this.PerformDrawLine) {
      this.PerformDrawLine(this, sim, brush, position1, position2, dragging);
    }
  }

  override DrawRect(sim: Simulation, brush: Brush, position1: Vec2, position2: Vec2): void {
    if (this.PerformDrawRect) {
      this.PerformDrawRect(this, sim, brush, position1, position2);
    }
  }

  override DrawFill(sim: Simulation, brush: Brush, position: Vec2): void {
    if (this.PerformDrawFill) {
      this.PerformDrawFill(this, sim, brush, position);
    }
  }

  override Select(toolSelection: number): void {
    if (this.PerformSelect) {
      this.PerformSelect(this, toolSelection);
    }
  }

  /** the copy GameModel::InitTools makes of each tool (std::make_unique<SimTool>(tool)) */
  clone(): SimTool {
    return Object.assign(new SimTool(), this);
  }
}

/** ToolClasses.cpp GetTools(): one SimTool per TOOL_* id, in id order (numbers.ts TOOL_NAMES) */
const toolInits: ((tool: SimTool) => void)[] = [
  Tool_HEAT, Tool_COOL, Tool_AIR, Tool_VAC, Tool_PGRV, Tool_NGRV, Tool_MIX, Tool_CYCL, Tool_AMBM, Tool_AMBP, Tool_WIND,
];
let tools: SimTool[] | null = null;
export function GetTools(): readonly SimTool[] {
  if (!tools) {
    tools = [];
    for (const init of toolInits) {
      const tool = new SimTool();
      tools.push(tool);
      init(tool);
    }
  }
  return tools;
}
