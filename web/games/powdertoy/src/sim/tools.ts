// gui/game/tool/*: the menu's tools, as far as their effect on the simulation goes (Draw / DrawLine / DrawRect /
// DrawFill / Click calling the Editing functions). Their windows (PropertyWindow, SignWindow, the GOL window),
// icons (textureGen / GetIcon) and the GameModel/GameView plumbing are UI and left to the game's front end: a
// tool that needs the UI takes a callback instead.
// Also simulation/AccessProperty.cpp (Set/Get; Parse is the property window's and left out).
import { CELL, DECO_CLEAR, ID, PMAPID, SC_DECO, SC_LIFE, SC_TOOL, TYP, WL_FAN, WL_FLOODHELPER, WL_STREAM, XCELLS, XRES, YCELLS, YRES } from './config.ts';
import { f, itrunc } from './cpp.ts';
import { PT_LIGH } from './numbers.ts';
import { FIELD_TYPE, PARTICLE_PROPERTIES } from './particle.ts';
import type { Simulation } from './simulation.ts';
import type { Brush } from './brush.ts';
import {
  ApplyDecorationBox, ApplyDecorationFill, ApplyDecorationLine, ApplyDecorationPoint, CreateBox, CreateLine, CreateParts,
  CreatePartsRect, CreateWallBox, CreateWallLine, CreateWalls, FloodParts, FloodWalls, type RendererFrame,
} from './editing.ts';
import type { Vec2 } from './vec2.ts';

/** gui/game/tool/Tool.h */
export class Tool {
  /** std::unique_ptr<VideoBuffer> (*textureGen)(int, Vec2<int>): drawn by the front end */
  textureGen: ((id: number, w: number, h: number) => ImageData | null) | null = null;

  ToolID = 0;
  Name = 'NULL';
  Description = 'NULL Tool, does NOTHING';
  Identifier = 'DEFAULT_TOOL_INVALID';
  /** RGB, 0xRRGGBB */
  Colour = 0xFFFFFF;
  Blocky = false;
  /** float */
  Strength = 1.0;
  shiftBehaviour = false;
  ctrlBehaviour = false;
  altBehaviour = false;
  MenuSection = SC_TOOL;
  MenuVisible = true;
  MenuSort = 0;

  /**
   * Tool(int id, String name, String description, RGB colour, ByteString identifier, textureGen = nullptr, bool blocky = false),
   * or with no arguments Tool() = default.
   */
  constructor(id = 0, name?: string, description?: string, colour?: number, identifier?: string,
    textureGen: Tool['textureGen'] = null, blocky = false) {
    this.ToolID = id;
    if (name !== undefined) this.Name = name;
    if (description !== undefined) this.Description = description;
    if (identifier !== undefined) this.Identifier = identifier;
    if (colour !== undefined) this.Colour = colour;
    this.textureGen = textureGen;
    this.Blocky = blocky;
  }

  Click(_sim: Simulation, _brush: Brush, _position: Vec2): void { }
  Draw(_sim: Simulation, _brush: Brush, _position: Vec2): void { }
  DrawLine(_sim: Simulation, _brush: Brush, _position1: Vec2, _position2: Vec2, _dragging: boolean): void { }
  DrawRect(_sim: Simulation, _brush: Brush, _position1: Vec2, _position2: Vec2): void { }
  DrawFill(_sim: Simulation, _brush: Brush, _position: Vec2): void { }
  Drag(_sim: Simulation, _brush: Brush, _position1: Vec2, _position2: Vec2): void { }
  Select(_toolSelection: number): void { }
}

/** gui/game/tool/ElementTool.h / .cpp. Tool(int id, ByteString identifier) is `new ElementTool(id, undefined, undefined, undefined, identifier)` or ElementTool.withId */
export class ElementTool extends Tool {
  static withId<T extends ElementTool>(this: new (id: number) => T, id: number, identifier: string): T {
    const t = new this(id);
    t.Identifier = identifier;
    return t;
  }

  override Draw(sim: Simulation, brush: Brush, position: Vec2): void {
    CreateParts(sim, -2, position.X, position.Y, this.ToolID, brush, -1);
  }
  override DrawLine(sim: Simulation, brush: Brush, position1: Vec2, position2: Vec2, _dragging: boolean): void {
    CreateLine(sim, position1.X, position1.Y, position2.X, position2.Y, this.ToolID, brush, -1);
  }
  override DrawRect(sim: Simulation, _brush: Brush, position1: Vec2, position2: Vec2): void {
    CreateBox(sim, -2, position1.X, position1.Y, position2.X, position2.Y, this.ToolID, -1);
  }
  override DrawFill(sim: Simulation, _brush: Brush, position: Vec2): void {
    FloodParts(sim, position.X, position.Y, this.ToolID, -1, -1);
  }
}

export class Element_LIGH_Tool extends ElementTool {
  override Click(_sim: Simulation, _brush: Brush, _position: Vec2): void { }
  override DrawLine(sim: Simulation, brush: Brush, position1: Vec2, _position2: Vec2, dragging: boolean): void {
    if (dragging)
      CreatePartsRect(sim, -2, position1.X, position1.Y, brush.GetRadius().X, brush.GetRadius().Y, PT_LIGH, -1);
  }
  override DrawRect(_sim: Simulation, _brush: Brush, _position1: Vec2, _position2: Vec2): void { }
  override DrawFill(_sim: Simulation, _brush: Brush, _position: Vec2): void { }
}

export class Element_TESC_Tool extends ElementTool {
  override DrawRect(sim: Simulation, brush: Brush, position1: Vec2, position2: Vec2): void {
    const radiusInfo = brush.GetRadius().X * 4 + brush.GetRadius().Y * 4 + 7;
    CreateBox(sim, -2, position1.X, position1.Y, position2.X, position2.Y, this.ToolID | PMAPID(radiusInfo), -1);
  }
  override DrawFill(sim: Simulation, brush: Brush, position: Vec2): void {
    const radiusInfo = brush.GetRadius().X * 4 + brush.GetRadius().Y * 4 + 7;
    FloodParts(sim, position.X, position.Y, this.ToolID | PMAPID(radiusInfo), -1, -1);
  }
}

export class PlopTool extends ElementTool {
  override Draw(_sim: Simulation, _brush: Brush, _position: Vec2): void { }
  override Click(sim: Simulation, _brush: Brush, position: Vec2): void {
    sim.create_part(-2, position.X, position.Y, TYP(this.ToolID), ID(this.ToolID));
  }
  override DrawLine(_sim: Simulation, _brush: Brush, _position1: Vec2, _position2: Vec2, _dragging: boolean): void { }
  override DrawRect(_sim: Simulation, _brush: Brush, _position1: Vec2, _position2: Vec2): void { }
  override DrawFill(_sim: Simulation, _brush: Brush, _position: Vec2): void { }
}

/** gui/game/tool/WallTool.h / .cpp */
export class WallTool extends Tool {
  constructor(id: number, description: string, colour: number, identifier: string, textureGen: Tool['textureGen'] = null) {
    super(id, '', description, colour, identifier, textureGen, true);
  }

  override Draw(sim: Simulation, brush: Brush, position: Vec2): void {
    CreateWalls(sim, position.X, position.Y, 1, 1, this.ToolID, brush);
  }
  override DrawLine(sim: Simulation, brush: Brush, position1: Vec2, position2: Vec2, dragging: boolean): void {
    const wallX = (position1.X / CELL) | 0;
    const wallY = (position1.Y / CELL) | 0;
    if (dragging == false && this.ToolID == WL_FAN && sim.bmap[wallY][wallX] == WL_FAN) {
      let newFanVelX = f((position2.X - position1.X) * f(0.005));
      newFanVelX = f(newFanVelX * this.Strength);
      let newFanVelY = f((position2.Y - position1.Y) * f(0.005));
      newFanVelY = f(newFanVelY * this.Strength);
      FloodWalls(sim, position1.X, position1.Y, WL_FLOODHELPER, WL_FAN);
      for (let j = 0; j < YCELLS; j++)
        for (let i = 0; i < XCELLS; i++)
          if (sim.bmap[j][i] == WL_FLOODHELPER) {
            sim.fvx[j][i] = newFanVelX;
            sim.fvy[j][i] = newFanVelY;
            sim.bmap[j][i] = WL_FAN;
          }
    }
    else {
      CreateWallLine(sim, position1.X, position1.Y, position2.X, position2.Y, 1, 1, this.ToolID, brush);
    }
  }
  override DrawRect(sim: Simulation, _brush: Brush, position1: Vec2, position2: Vec2): void {
    CreateWallBox(sim, position1.X, position1.Y, position2.X, position2.Y, this.ToolID);
  }
  override DrawFill(sim: Simulation, _brush: Brush, position: Vec2): void {
    if (this.ToolID != WL_STREAM)
      FloodWalls(sim, position.X, position.Y, this.ToolID, -1);
  }
}

/**
 * gui/game/tool/DecorationTool.h / .cpp. `RGBA Colour` (which hides Tool::Colour in C++) is DecoColour here,
 * packed 0xAARRGGBB; GameView::GetRendererFrame() is the getRendererFrame callback.
 */
export class DecorationTool extends Tool {
  DecoColour = 0x00000000;
  getRendererFrame: () => RendererFrame | null;

  constructor(getRendererFrame: () => RendererFrame | null, decoMode: number, name: string, description: string, colour: number, identifier: string) {
    super(decoMode, name, description, colour, identifier);
    this.getRendererFrame = getRendererFrame;
    this.MenuSection = SC_DECO;
  }

  private get r(): number { return (this.DecoColour >>> 16) & 0xFF; }
  private get g(): number { return (this.DecoColour >>> 8) & 0xFF; }
  private get b(): number { return this.DecoColour & 0xFF; }
  private get a(): number { return (this.DecoColour >>> 24) & 0xFF; }

  override Draw(sim: Simulation, brush: Brush, position: Vec2): void {
    ApplyDecorationPoint(sim, position.X, position.Y, this.r, this.g, this.b, this.a, this.ToolID, brush);
  }
  override DrawLine(sim: Simulation, brush: Brush, position1: Vec2, position2: Vec2, _dragging: boolean): void {
    ApplyDecorationLine(sim, position1.X, position1.Y, position2.X, position2.Y, this.r, this.g, this.b, this.a, this.ToolID, brush);
  }
  override DrawRect(sim: Simulation, _brush: Brush, position1: Vec2, position2: Vec2): void {
    ApplyDecorationBox(sim, position1.X, position1.Y, position2.X, position2.Y, this.r, this.g, this.b, this.a, this.ToolID);
  }
  override DrawFill(sim: Simulation, _brush: Brush, position: Vec2): void {
    const rendererFrame = this.getRendererFrame();
    if (!rendererFrame || !(position.X >= 0 && position.Y >= 0 && position.X < XRES && position.Y < YRES)) {
      return;
    }
    const loc = rendererFrame[position.X + position.Y * XRES] & 0xFFFFFF;
    const lr = (loc >>> 16) & 0xFF, lg = (loc >>> 8) & 0xFF, lb = loc & 0xFF;
    if (this.ToolID == DECO_CLEAR)
      ApplyDecorationFill(sim, rendererFrame, position.X, position.Y, 0, 0, 0, 0, lr, lg, lb);
    else
      ApplyDecorationFill(sim, rendererFrame, position.X, position.Y, this.r, this.g, this.b, this.a, lr, lg, lb);
  }
}

/**
 * simulation/AccessProperty.h / .cpp: a particle property index (Particle::GetProperties order, particle.ts
 * PARTICLE_PROPERTIES) and its value. `value` is the C++ propertyValue (a number of the property's kind); the
 * name matches what Simulation::flood_prop takes in simulation.ts.
 */
export class AccessProperty {
  propertyIndex: number;
  value: number;
  constructor(propertyIndex: number, value: number) {
    this.propertyIndex = propertyIndex;
    this.value = value;
  }

  Set(sim: Simulation, i: number): void {
    const part = sim.parts[i];
    const prop = PARTICLE_PROPERTIES[this.propertyIndex];
    if (this.propertyIndex == FIELD_TYPE) {
      sim.part_change_type(i, itrunc(f(part.x + 0.5)), itrunc(f(part.y + 0.5)), this.value | 0);
      return;
    }
    switch (prop.kind) {
      case 'float':
        (part as unknown as Record<string, number>)[prop.name] = f(this.value);
        break;
      case 'type':
      case 'int':
        (part as unknown as Record<string, number>)[prop.name] = this.value | 0;
        break;
      case 'uint':
        (part as unknown as Record<string, number>)[prop.name] = this.value >>> 0;
        break;
    }
  }

  Get(sim: Simulation, i: number): number {
    const prop = PARTICLE_PROPERTIES[this.propertyIndex];
    return (sim.parts[i] as unknown as Record<string, number>)[prop.name];
  }
}

/** gui/game/tool/PropertyTool.h / .cpp: the window that builds the configuration is the front end's */
export class PropertyTool extends Tool {
  configuration: { changeProperty: AccessProperty; propertyValueStr: string } | null = null;
  /** PropertyTool::Select opens the property window */
  openWindow: ((sim: Simulation | null, takePropertyFrom: number | null) => void) | null = null;

  constructor() {
    super(0, 'PROP', 'Property Drawing Tool. Use to alter the properties of elements in the field.', 0xFEA900, 'DEFAULT_UI_PROPERTY', null);
  }

  GetConfiguration(): { changeProperty: AccessProperty; propertyValueStr: string } | null {
    return this.configuration;
  }

  SetConfiguration(newConfiguration: { changeProperty: AccessProperty; propertyValueStr: string } | null): void {
    this.configuration = newConfiguration;
  }

  private SetProperty(sim: Simulation, position: Vec2): void {
    // (sic) position.X == XRES / position.Y == YRES pass this check in the original
    if (position.X < 0 || position.X > XRES || position.Y < 0 || position.Y > YRES || !this.configuration)
      return;
    let i = sim.pmap[position.Y]?.[position.X] ?? 0;
    if (!i)
      i = sim.photons[position.Y]?.[position.X] ?? 0;
    if (!i)
      return;
    this.configuration.changeProperty.Set(sim, ID(i));
  }

  override Click(_sim: Simulation, _brush: Brush, _position: Vec2): void { }

  override Draw(sim: Simulation, cBrush: Brush, position: Vec2): void {
    for (const off of cBrush) {
      const cx = position.X + off.X, cy = position.Y + off.Y;
      if (cx >= 0 && cy >= 0 && cx < XRES && cy < YRES)
        this.SetProperty(sim, { X: cx, Y: cy });
    }
  }

  override DrawLine(sim: Simulation, cBrush: Brush, position: Vec2, position2: Vec2, _dragging: boolean): void {
    let x1 = position.X, y1 = position.Y, x2 = position2.X, y2 = position2.Y;
    const reverseXY = Math.abs(y2 - y1) > Math.abs(x2 - x1);
    let x: number, y: number;
    const rx = cBrush.GetRadius().X, ry = cBrush.GetRadius().Y;
    let e = 0.0, de: number;
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
    if (dx)
      de = f(dy / dx);
    else
      de = 0.0;
    y = y1;
    const sy = (y1 < y2) ? 1 : -1;
    for (x = x1; x <= x2; x++) {
      if (reverseXY)
        this.Draw(sim, cBrush, { X: y, Y: x });
      else
        this.Draw(sim, cBrush, { X: x, Y: y });
      e = f(e + de);
      if (e >= 0.5) {
        y += sy;
        if (!(rx + ry) && ((y1 < y2) ? (y <= y2) : (y >= y2))) {
          if (reverseXY)
            this.Draw(sim, cBrush, { X: y, Y: x });
          else
            this.Draw(sim, cBrush, { X: x, Y: y });
        }
        e = f(e - 1.0);
      }
    }
  }

  override DrawRect(sim: Simulation, _cBrush: Brush, position: Vec2, position2: Vec2): void {
    let x1 = position.X, y1 = position.Y, x2 = position2.X, y2 = position2.Y;
    let i: number, j: number;
    if (x1 > x2) {
      i = x2;
      x2 = x1;
      x1 = i;
    }
    if (y1 > y2) {
      j = y2;
      y2 = y1;
      y1 = j;
    }
    for (j = y1; j <= y2; j++)
      for (i = x1; i <= x2; i++)
        this.SetProperty(sim, { X: i, Y: j });
  }

  override DrawFill(sim: Simulation, _cBrush: Brush, position: Vec2): void {
    if (this.configuration)
      sim.flood_prop(position.X, position.Y, this.configuration.changeProperty);
  }

  override Select(_toolSelection: number): void {
    if (this.openWindow) this.openWindow(null, null);
  }
}

/** gui/game/tool/SignTool.h: Click opens the sign window (front end), which edits sim.signs */
export class SignTool extends Tool {
  onClick: ((sim: Simulation, position: Vec2) => void) | null = null;
  constructor() {
    super(0, 'SIGN', 'Sign. Displays text. Click on a sign to edit it or anywhere else to place a new one.', 0x000000, 'DEFAULT_UI_SIGN', null);
  }
  override Click(sim: Simulation, _brush: Brush, position: Vec2): void {
    if (this.onClick) this.onClick(sim, position);
  }
}

/**
 * gui/game/tool/SampleTool.h / .cpp: Draw picks the particle under the cursor; what to do with it (select its
 * element tool, open the property or GOL window, sample a colour) is GameModel's, passed in as onSample with the
 * particle id (or -1).
 */
export class SampleTool extends Tool {
  onSample: ((sim: Simulation, i: number, position: Vec2) => void) | null = null;
  constructor() {
    super(0, 'SMPL', 'Sample an element on the screen.', 0x000000, 'DEFAULT_UI_SAMPLE', null);
  }
  override Click(_sim: Simulation, _brush: Brush, _position: Vec2): void { }
  override Draw(sim: Simulation, _brush: Brush, position: Vec2): void {
    let i = -1;
    if (sim.photons[position.Y][position.X]) {
      i = ID(sim.photons[position.Y][position.X]);
    }
    else if (sim.pmap[position.Y][position.X]) {
      i = ID(sim.pmap[position.Y][position.X]);
    }
    if (this.onSample) this.onSample(sim, i, position);
  }
}

/** gui/game/tool/GOLTool.h: only opens the custom GOL window (front end) */
export class GOLTool extends Tool {
  openWindow: ((toolSelection: number) => void) | null = null;
  constructor() {
    super(0, 'CUST', 'Add a new custom GOL type. (Use ctrl+shift+rightclick to remove them)', 0xFEA900, 'DEFAULT_UI_ADDLIFE', null);
    this.MenuSection = SC_LIFE;
  }
  override Select(toolSelection: number): void {
    if (this.openWindow) this.openWindow(toolSelection);
  }
}
