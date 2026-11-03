// gui/game/GameController.h / GameController.cpp. The online parts (search, preview, login, profile, tags,
// upload, vote, update, console/Lua) are not ported: their entry points show what the original shows when it
// cannot reach the server, or nothing (see README).
import {
  CELL, EDGE_LOOP, EDGE_SOLID, EDGE_VOID, GRAV_CUSTOM, GRAV_OFF, GRAV_RADIAL, GRAV_VERTICAL, NPART, NUM_AIRMODES,
  NUM_EDGEMODES, NUM_GRAVMODES, PT_NUM, REPLACE_MODE, SPECIFIC_DELETE, UI_WALLCOUNT, XRES, YRES, AIR_ON,
  AIR_PRESSUREOFF, AIR_VELOCITYOFF, AIR_OFF, AIR_NOUPDATE, SC_DECO,
} from '../../sim/config.ts';
import { PT_DUST, PT_SPRK, PT_WIRE, PT_STKM2 } from '../../sim/numbers.ts';
import { sd } from '../../sim/simulationData.ts';
import { CreateSnapshot, Restore, clear_area, GetSample, type Snapshot } from '../../sim/editing.ts';
import type { Tool } from '../../sim/tools.ts';
import type { Particle } from '../../sim/particle.ts';
import { Element_STKM_set_element } from '../../elements/STKM.ts';
import { sign_getDisplayText, sign_split, SIGN_Button } from '../../graphics/sign.ts';
import { Renderer } from '../../graphics/renderer.ts';
import { GameSave } from '../../save/gameSave.ts';
import { Load, Save } from '../../save/load.ts';
import { Client, SaveFile, LOCAL_SAVE_DIR } from '../../game/Client.ts';
import { deepClone } from '../../game/clone.ts';
import { Engine } from '../interface/Engine.ts';
import { SDL_BUTTON_LEFT, SDLK_DOWN, SDLK_LEFT, SDLK_RIGHT, SDLK_UP, SDL_SCANCODE_A, SDL_SCANCODE_D, SDL_SCANCODE_S, SDL_SCANCODE_W } from '../interface/Keys.ts';
import type { Point, Rect } from '../interface/Point.ts';
import { ConfirmPrompt, ErrorMessage, InformationMessage } from '../dialogues/Dialogues.ts';
import { GameView } from './GameView.ts';
import { GameModel } from './GameModel.ts';
import type { Menu, Notification } from './Menu.ts';
import { ElementSearchActivity } from '../elementsearch/ElementSearchActivity.ts';
import { ColourPickerActivity } from '../colourpicker/ColourPickerActivity.ts';
import { RenderController } from '../render/RenderView.ts';
import { OptionsController } from '../options/OptionsView.ts';
import { LocalSaveActivity } from '../save/LocalSaveActivity.ts';
import { FileBrowserActivity } from '../filebrowser/FileBrowserActivity.ts';
import { LocalBrowserController } from '../localbrowser/LocalBrowser.ts';
import { InstallToolWindows, OpenPropertyWindow, OpenGOLWindow, ToolWindowHooks } from './tool/ToolWindows.ts';

export const DEBUG_PARTS = 0x0001, DEBUG_ELEMENTPOP = 0x0002, DEBUG_LINES = 0x0004, DEBUG_PARTICLE = 0x0008,
  DEBUG_SURFNORM = 0x0010, DEBUG_SIMHUD = 0x0020, DEBUG_RENHUD = 0x0040, DEBUG_AIRVEL = 0x0080, DEBUG_FRAMETIME = 0x0100;

export const mouseUpNormal = 0, mouseUpBlur = 1, mouseUpDrawEnd = 2;

/** what the online features say in the port */
const OFFLINE_TITLE = 'Not available';
const OFFLINE_TEXT = 'The online features of The Powder Toy (the save browser, signing in, voting, tags, uploading) are not part of this version.';

function SaneSaveRect(point1: Point, point2: Point): Rect {
  const c = (p: Point) => ({ X: Math.min(Math.max(p.X, 0), XRES - 1), Y: Math.min(Math.max(p.Y, 0), YRES - 1) });
  point1 = c(point1);
  point2 = c(point2);
  const tlx = Math.min(point1.X, point2.X), tly = Math.min(point1.Y, point2.Y);
  const brx = Math.max(point1.X, point2.X), bry = Math.max(point1.Y, point2.Y);
  return { pos: { X: tlx, Y: tly }, size: { X: brx - tlx + 1, Y: bry - tly + 1 } };
}

export class GameController {
  private static instance: GameController | null = null;
  static Ref(): GameController { return GameController.instance!; }

  private firstTick = true;
  private foundSignID = -1;
  private gameView: GameView;
  private gameModel: GameModel;
  private renderOptions: RenderController | null = null;
  private localBrowser: LocalBrowserController | null = null;
  private options: OptionsController | null = null;
  private beforeRestore: Snapshot | null = null;
  private debugFlags = 0;
  HasDone = false;

  constructor() {
    GameController.instance = this;
    this.gameView = new GameView();
    this.gameModel = new GameModel(this.gameView); // mvc is a joke
    this.gameModel.controller = this;
    this.gameModel.BuildQuickOptionMenu(this);
    this.gameView.AttachController(this);
    this.gameModel.AddObserver(this.gameView);
    InstallToolWindows(this.gameModel);
    this.gameModel.toolWindows = {
      OpenPropertyWindow: (sim, takePropertyFrom) => OpenPropertyWindow(this.gameModel, sim ?? this.gameModel.GetSimulation(), takePropertyFrom),
      OpenGOLWindow: (toolSelection, rule, colour1, colour2) => OpenGOLWindow(this.gameModel, toolSelection, rule, colour1, colour2),
    };
    ToolWindowHooks.ColourPickerActivity = (initialColour, onPicked) => {
      new ColourPickerActivity(initialColour, onPicked);
    };
    const prefs = Client.Ref().prefs;
    this.gameView.SetDebugHUD(prefs.Get('Renderer.DebugMode', false));
    const fpsLimit = prefs.GetOpt<number>('FpsLimit');
    if (typeof fpsLimit === 'number' && fpsLimit === 2) this.gameView.SetSimFpsLimit({ kind: 'none' });
    else if (typeof fpsLimit === 'number' && fpsLimit >= 3 && fpsLimit <= 1000) this.gameView.SetSimFpsLimit({ kind: 'explicit', value: fpsLimit });
    else this.gameView.SetSimFpsLimit({ kind: 'explicit', value: 60 });
  }

  /** ~GameController: the parts that matter in a browser (the prefs) */
  Destroy(): void {
    this.gameModel.SaveToPrefs();
  }

  HistoryRestore(): boolean {
    if (!this.gameModel.HistoryCanRestore()) return false;
    // * When undoing for the first time since the last call to HistorySnapshot, save the current state.
    //   Ctrl+Y needs this in order to bring you back to the point right before your last Ctrl+Z, because
    //   the last history entry is what this Ctrl+Z brings you back to, not the current state.
    if (!this.beforeRestore) {
      this.beforeRestore = CreateSnapshot(this.gameModel.GetSimulation());
      (this.beforeRestore as Snapshot & { Authors?: unknown }).Authors = Client.Ref().GetAuthorInfo();
    }
    this.gameModel.HistoryRestore();
    const current = this.gameModel.HistoryCurrent()!;
    Restore(this.gameModel.GetSimulation(), current);
    Client.Ref().OverwriteAuthorInfo(((current as Snapshot & { Authors?: unknown }).Authors ?? {}) as never);
    return true;
  }
  HistorySnapshot(): void {
    // * Calling HistorySnapshot means the user decided to use the current state and
    //   forfeit the option to go back to whatever they Ctrl+Z'd their way back from.
    this.beforeRestore = null;
    const snap = CreateSnapshot(this.gameModel.GetSimulation());
    (snap as Snapshot & { Authors?: unknown }).Authors = Client.Ref().GetAuthorInfo();
    this.gameModel.HistoryPush(snap);
  }
  HistoryForward(): boolean {
    if (!this.gameModel.HistoryCanForward()) return false;
    this.gameModel.HistoryForward();
    // * If gameModel has nothing more to give, we've Ctrl+Y'd our way back to the original
    //   state; restore this instead, then get rid of it.
    const current = this.gameModel.HistoryCurrent() ?? this.beforeRestore!;
    Restore(this.gameModel.GetSimulation(), current);
    Client.Ref().OverwriteAuthorInfo(((current as Snapshot & { Authors?: unknown }).Authors ?? {}) as never);
    if (current === this.beforeRestore) this.beforeRestore = null;
    return true;
  }

  GetView(): GameView { return this.gameView; }
  GetModel(): GameModel { return this.gameModel; }

  GetSignAt(x: number, y: number): number {
    const sim = this.gameModel.GetSimulation();
    for (let i = sim.signs.length - 1; i >= 0; i--) {
      const d = sign_getDisplayText(sim.signs[i], sim);
      if (x >= d.x && x <= d.x + d.w && y >= d.y && y <= d.y + d.h) return i;
    }
    return -1;
  }
  // assumed to already be a valid sign
  GetSignText(signID: number): string {
    return this.gameModel.GetSimulation().signs[signID].text;
  }
  GetSignSplit(signID: number): [number, number] {
    return sign_split(this.gameModel.GetSimulation().signs[signID].text);
  }

  PlaceSave(position: Point): void {
    const placeSave = this.gameModel.GetTransformedPlaceSave();
    if (placeSave) {
      this.HistorySnapshot();
      LoadInto(this.gameModel, placeSave, !this.gameView.ShiftBehaviour(), position);
      this.gameModel.SetPaused(placeSave.paused || this.gameModel.GetPaused());
      Client.Ref().MergeStampAuthorInfo(placeSave.authors);
    }
    this.gameModel.SetPlaceSave(null);
  }

  Install(): void {
    new InformationMessage('No installation necessary', "You don't need to install The Powder Toy on this platform", false);
  }

  AdjustGridSize(direction: number): void {
    const s = this.gameModel.GetRendererSettings();
    if (direction > 0) s.gridSize = (s.gridSize + 1) % 10;
    else s.gridSize = (s.gridSize + 9) % 10;
  }
  InvertAirSim(): void {
    this.gameModel.GetSimulation().air.Invert();
  }
  AdjustBrushSize(delta: number, logarithmic = false, keepX = false, keepY = false): void {
    this.gameModel.GetBrush().AdjustSize(delta, logarithmic, keepX, keepY);
  }
  SetBrushSize(newSize: Point): void {
    this.gameModel.GetBrush().SetRadius(newSize);
  }
  AdjustZoomSize(delta: number, logarithmic = false): void {
    let newSize: number;
    if (logarithmic) newSize = this.gameModel.GetZoomSize() + Math.max((this.gameModel.GetZoomSize() / 10) | 0, 1) * delta;
    else newSize = this.gameModel.GetZoomSize() + delta;
    if (newSize < 5) newSize = 5;
    if (newSize > 64) newSize = 64;
    this.gameModel.SetZoomSize(newSize);
    let newZoomFactor = (256 / newSize) | 0;
    if (newZoomFactor < 3) newZoomFactor = 3;
    this.gameModel.SetZoomFactor(newZoomFactor);
  }
  MouseInZoom(position: Point): boolean {
    const p = { X: position.X, Y: position.Y };
    if (p.X >= XRES) p.X = XRES - 1;
    if (p.Y >= YRES) p.Y = YRES - 1;
    if (p.Y < 0) p.Y = 0;
    if (p.X < 0) p.X = 0;
    return this.gameModel.MouseInZoom(p);
  }
  PointTranslate(point: Point): Point {
    const p = { X: point.X, Y: point.Y };
    if (p.X >= XRES) p.X = XRES - 1;
    if (p.Y >= YRES) p.Y = YRES - 1;
    if (p.Y < 0) p.Y = 0;
    if (p.X < 0) p.X = 0;
    return this.gameModel.AdjustZoomCoords(p);
  }
  NormaliseBlockCoord(point: Point): Point {
    return { X: ((point.X / CELL) | 0) * CELL, Y: ((point.Y / CELL) | 0) * CELL };
  }

  DrawRect(toolSelection: number, point1: Point, point2: Point): void {
    const sim = this.gameModel.GetSimulation();
    const activeTool = this.gameModel.GetActiveTool(toolSelection);
    this.gameModel.SetLastTool(activeTool);
    const cBrush = this.gameModel.GetBrush();
    if (!activeTool) return;
    activeTool.Strength = 1.0;
    activeTool.DrawRect(sim, cBrush, point1, point2);
  }
  DrawLine(toolSelection: number, point1: Point, point2: Point): void {
    const sim = this.gameModel.GetSimulation();
    const activeTool = this.gameModel.GetActiveTool(toolSelection);
    this.gameModel.SetLastTool(activeTool);
    const cBrush = this.gameModel.GetBrush();
    if (!activeTool) return;
    activeTool.Strength = 1.0;
    activeTool.DrawLine(sim, cBrush, point1, point2, false);
  }
  DrawFill(toolSelection: number, point: Point): void {
    const sim = this.gameModel.GetSimulation();
    const activeTool = this.gameModel.GetActiveTool(toolSelection);
    this.gameModel.SetLastTool(activeTool);
    const cBrush = this.gameModel.GetBrush();
    if (!activeTool) return;
    activeTool.Strength = 1.0;
    activeTool.DrawFill(sim, cBrush, point);
  }
  DrawPoints(toolSelection: number, oldPos: Point, newPos: Point, held: boolean): void {
    const sim = this.gameModel.GetSimulation();
    const activeTool = this.gameModel.GetActiveTool(toolSelection);
    this.gameModel.SetLastTool(activeTool);
    const cBrush = this.gameModel.GetBrush();
    if (!activeTool) return;
    activeTool.Strength = this.gameModel.GetToolStrength();
    // This is a joke, the game mvc has to go >_>
    activeTool.shiftBehaviour = this.gameView.ShiftBehaviour();
    activeTool.ctrlBehaviour = this.gameView.CtrlBehaviour();
    activeTool.altBehaviour = this.gameView.AltBehaviour();
    if (!held) activeTool.Draw(sim, cBrush, newPos);
    else activeTool.DrawLine(sim, cBrush, oldPos, newPos, true);
  }
  LoadClipboard(): boolean {
    const clip = this.gameModel.GetClipboard();
    if (!clip) return false;
    this.gameModel.SetPlaceSave(deepClone(clip));
    return true;
  }
  LoadStamp(stamp: GameSave | null): void {
    this.gameModel.SetPlaceSave(stamp);
  }
  TransformPlaceSave(transform: readonly [number, number, number, number], nudge: Point): void {
    this.gameModel.TransformPlaceSave(transform, nudge);
  }
  ToolClick(toolSelection: number, point: Point): void {
    const sim = this.gameModel.GetSimulation();
    const activeTool = this.gameModel.GetActiveTool(toolSelection);
    const cBrush = this.gameModel.GetBrush();
    if (!activeTool) return;
    activeTool.Click(sim, cBrush, point);
  }
  ToolDrag(toolSelection: number, point1: Point, point2: Point): void {
    const sim = this.gameModel.GetSimulation();
    const activeTool = this.gameModel.GetActiveTool(toolSelection);
    const cBrush = this.gameModel.GetBrush();
    if (!activeTool) return;
    activeTool.Drag(sim, cBrush, point1, point2);
  }

  /** StampRegion(point1, point2[, includePressure]) */
  StampRegion(point1: Point, point2: Point, includePressure?: boolean): string {
    if (includePressure === undefined) includePressure = this.gameModel.GetIncludePressure() !== this.gameView.ShiftBehaviour();
    let newSave: GameSave | null = null;
    try {
      newSave = Save(this.gameModel.GetSimulation(), includePressure, SaneSaveRect(point1, point2));
    } catch (e) {
      console.warn(e);
    }
    if (newSave) {
      newSave.paused = this.gameModel.GetPaused();
      const stampName = Client.Ref().AddStamp(newSave);
      if (stampName.length === 0) new ErrorMessage('Could not create stamp', 'Error serializing save file');
      return stampName;
    } else {
      new ErrorMessage('Could not create stamp', 'Error generating save file');
      return '';
    }
  }
  CopyRegion(point1: Point, point2: Point): void {
    let newSave: GameSave | null = null;
    try {
      newSave = Save(this.gameModel.GetSimulation(), this.gameModel.GetIncludePressure() !== this.gameView.ShiftBehaviour(), SaneSaveRect(point1, point2));
    } catch (e) {
      console.warn(e);
    }
    if (newSave) {
      const clipboardInfo: Record<string, never> & Record<string, unknown> = { type: 'clipboard', username: '', date: Math.floor(Date.now() / 1000) } as never;
      Client.Ref().SaveAuthorInfo(clipboardInfo as never);
      newSave.authors = clipboardInfo as never;
      newSave.paused = this.gameModel.GetPaused();
      this.gameModel.SetClipboard(newSave);
    }
  }
  CutRegion(point1: Point, point2: Point): void {
    this.CopyRegion(point1, point2);
    this.HistorySnapshot();
    clear_area(this.gameModel.GetSimulation(), point1.X, point1.Y, point2.X - point1.X, point2.Y - point1.Y);
  }

  // ---- events (CommandInterface::HandleEvent always lets them through: there is no Lua) ----

  MouseMove(_x: number, _y: number, _dx: number, _dy: number): boolean {
    return true;
  }
  MouseDown(x: number, y: number, button: number): boolean {
    const ret = true;
    if (ret && y < YRES && x < XRES && !this.gameView.GetPlacingSave() && !this.gameView.GetPlacingZoom()) {
      const point = this.gameModel.AdjustZoomCoords({ X: x, Y: y });
      x = point.X;
      y = point.Y;
      const t0 = this.gameModel.GetActiveTool(0);
      if (!t0 || t0.Identifier !== 'DEFAULT_UI_SIGN' || button !== SDL_BUTTON_LEFT) { //If it's not a sign tool or you are right/middle clicking
        this.foundSignID = this.GetSignAt(x, y);
        if (this.foundSignID !== -1) {
          if (sign_split(this.gameModel.GetSimulation().signs[this.foundSignID].text)[0]) return false;
        }
      }
    }
    return ret;
  }
  MouseUp(x: number, y: number, button: number, reason: number): boolean {
    let ret = true;
    if (reason !== mouseUpNormal) return ret;
    if (ret && this.foundSignID !== -1 && y < YRES && x < XRES && !this.gameView.GetPlacingSave()) {
      const point = this.gameModel.AdjustZoomCoords({ X: x, Y: y });
      x = point.X;
      y = point.Y;
      const t0 = this.gameModel.GetActiveTool(0);
      if (!t0 || t0.Identifier !== 'DEFAULT_UI_SIGN' || button !== SDL_BUTTON_LEFT) { //If it's not a sign tool or you are right/middle clicking
        const foundSignID = this.GetSignAt(x, y);
        if (foundSignID !== -1) {
          const foundSign = this.gameModel.GetSimulation().signs[foundSignID];
          const si = sign_split(foundSign.text);
          if (si[0]) {
            ret = false;
            switch (si[1]) {
              case SIGN_Button:
                this.gameModel.GetSimulation().create_part(-1, foundSign.x, foundSign.y, PT_SPRK);
                break;
              default:
                // save, thread and search links lead to the online save browser, which is not ported
                new InformationMessage(OFFLINE_TITLE, OFFLINE_TEXT, false);
                break;
            }
          }
        }
      }
    }
    this.foundSignID = -1;
    return ret;
  }
  MouseWheel(_x: number, _y: number, _d: number): boolean { return true; }
  TextInput(_text: string): boolean { return true; }
  TextEditing(_text: string): boolean { return true; }
  KeyPress(key: number, scan: number, repeat: boolean, _shift: boolean, ctrl: boolean, _alt: boolean): boolean {
    const ret = true;
    if (repeat) return ret;
    const sim = this.gameModel.GetSimulation();
    if (!this.gameView.GetPlacingSave()) {
      // Go right command
      if (key === SDLK_RIGHT) sim.player.comm = sim.player.comm | 0x02;
      // Go left command
      else if (key === SDLK_LEFT) sim.player.comm = sim.player.comm | 0x01;
      // Use element command
      else if (key === SDLK_DOWN && (sim.player.comm & 0x08) !== 0x08) sim.player.comm = sim.player.comm | 0x08;
      // Jump command
      else if (key === SDLK_UP && (sim.player.comm & 0x04) !== 0x04) sim.player.comm = sim.player.comm | 0x04;
    }
    // Go right command
    if (scan === SDL_SCANCODE_D) sim.player2.comm = sim.player2.comm | 0x02;
    // Go left command
    else if (scan === SDL_SCANCODE_A) sim.player2.comm = sim.player2.comm | 0x01;
    // Use element command
    else if (scan === SDL_SCANCODE_S && (sim.player2.comm & 0x08) !== 0x08) sim.player2.comm = sim.player2.comm | 0x08;
    // Jump command
    else if (scan === SDL_SCANCODE_W && (sim.player2.comm & 0x04) !== 0x04) sim.player2.comm = sim.player2.comm | 0x04;
    if (!sim.elementCount[PT_STKM2] || ctrl) {
      switch (scan) {
        case SDL_SCANCODE_W:
          this.SwitchGravity();
          break;
        case SDL_SCANCODE_D:
          this.gameView.SetDebugHUD(!this.gameView.GetDebugHUD());
          break;
        case SDL_SCANCODE_S:
          this.gameView.BeginStampSelection();
          break;
      }
    }
    return ret;
  }
  KeyRelease(key: number, scan: number, repeat: boolean, _shift: boolean, _ctrl: boolean, _alt: boolean): boolean {
    const ret = true;
    if (repeat) return ret;
    const sim = this.gameModel.GetSimulation();
    if (key === SDLK_RIGHT || key === SDLK_LEFT) {
      sim.player.pcomm = sim.player.comm; //Saving last movement
      sim.player.comm = sim.player.comm & 12; //Stop command
    } else if (key === SDLK_UP) {
      sim.player.comm = sim.player.comm & 11;
    } else if (key === SDLK_DOWN) {
      sim.player.comm = sim.player.comm & 7;
    }
    if (scan === SDL_SCANCODE_D || scan === SDL_SCANCODE_A) {
      sim.player2.pcomm = sim.player2.comm; //Saving last movement
      sim.player2.comm = sim.player2.comm & 12; //Stop command
    } else if (scan === SDL_SCANCODE_W) {
      sim.player2.comm = sim.player2.comm & 11;
    } else if (scan === SDL_SCANCODE_S) {
      sim.player2.comm = sim.player2.comm & 7;
    }
    return ret;
  }

  Tick(): void {
    this.gameModel.Tick();
    if (this.firstTick) this.firstTick = false;
    if (this.gameModel.SelectNextIdentifier.length) {
      this.gameModel.BuildMenus();
      this.gameModel.SetActiveTool(this.gameModel.SelectNextTool, this.gameModel.GetToolFromIdentifier(this.gameModel.SelectNextIdentifier));
      this.gameModel.SelectNextIdentifier = '';
    }
  }
  Blur(): void {
    // Tell lua that mouse is up (even if it really isn't)
    this.MouseUp(0, 0, 0, mouseUpBlur);
    this.gameModel.frameTime = null;
  }
  Exit(): void {
    this.gameView.CloseActiveWindow();
    this.HasDone = true;
  }
  ResetAir(): void {
    const sim = this.gameModel.GetSimulation();
    sim.air.Clear();
    for (let i = 0; i < NPART; i++) {
      if (GameSave.PressureInTmp3(sim.parts[i].type)) sim.parts[i].tmp3 = 0;
    }
  }
  ResetSpark(): void {
    const sim = this.gameModel.GetSimulation();
    for (let i = 0; i < NPART; i++) {
      const p = sim.parts[i];
      if (p.type === PT_SPRK) {
        if (p.ctype >= 0 && p.ctype < PT_NUM && sd.elements[p.ctype].Enabled) {
          p.type = p.ctype;
          p.ctype = p.life = 0;
        } else {
          sim.kill_part(i);
        }
      } else if (p.type === PT_WIRE) {
        p.ctype = p.tmp = 0;
      }
    }
    for (const w of sim.wireless) w.fill(0);
  }
  SwitchGravity(): void {
    const sim = this.gameModel.GetSimulation();
    sim.gravityMode = (sim.gravityMode + 1) % NUM_GRAVMODES;
    switch (sim.gravityMode) {
      case GRAV_VERTICAL: this.gameModel.SetInfoTip('Gravity: Vertical'); break;
      case GRAV_OFF: this.gameModel.SetInfoTip('Gravity: Off'); break;
      case GRAV_RADIAL: this.gameModel.SetInfoTip('Gravity: Radial'); break;
      case GRAV_CUSTOM: this.gameModel.SetInfoTip('Gravity: Custom'); break;
    }
  }
  SwitchAir(): void {
    const air = this.gameModel.GetSimulation().air;
    air.airMode = (air.airMode + 1) % NUM_AIRMODES;
    switch (air.airMode) {
      case AIR_ON: this.gameModel.SetInfoTip('Air: On'); break;
      case AIR_PRESSUREOFF: this.gameModel.SetInfoTip('Air: Pressure Off'); break;
      case AIR_VELOCITYOFF: this.gameModel.SetInfoTip('Air: Velocity Off'); break;
      case AIR_OFF: this.gameModel.SetInfoTip('Air: Off'); break;
      case AIR_NOUPDATE: this.gameModel.SetInfoTip('Air: No Update'); break;
    }
  }
  ToggleAHeat(): void { this.gameModel.SetAHeatEnable(!this.gameModel.GetAHeatEnable()); }
  GetAHeatEnable(): boolean { return this.gameModel.GetAHeatEnable(); }
  ResetAHeat(): void { this.gameModel.ResetAHeat(); }
  ToggleNewtonianGravity(): void { this.gameModel.SetNewtonianGravity(!this.gameModel.GetNewtonianGrvity()); }
  LoadRenderPreset(presetNum: number): void {
    const settings = this.gameModel.GetRendererSettings();
    const preset = Renderer.renderModePresets[presetNum];
    this.gameModel.SetInfoTip(preset.Name);
    settings.renderMode = preset.renderMode;
    settings.displayMode = preset.displayMode;
    settings.colorMode = preset.colorMode;
    settings.wantHdispLimitMin = preset.wantHdispLimitMin;
    settings.wantHdispLimitMax = preset.wantHdispLimitMax;
  }

  Update(): void {
    const pos = this.gameView.GetMousePosition();
    this.gameModel.GetRendererSettings().mousePos = this.PointTranslate(pos);
    const sim = this.gameModel.GetSimulation();
    if (pos.X < XRES && pos.Y < YRES) {
      const p = this.PointTranslate(pos);
      this.gameView.SetSample(GetSample(sim, p.X, p.Y));
    } else {
      this.gameView.SetSample(GetSample(sim, pos.X, pos.Y));
    }
    if (this.gameModel.IsSimRunning()) this.gameModel.UpdateUpTo(NPART);
    else this.gameModel.BeforeSim();
    //if either STKM or STK2 isn't out, reset it's selected element. Defaults to PT_DUST unless right selected is something else
    //This won't run if the stickmen dies in a frame, since it respawns instantly
    if (!sim.player.spwn || !sim.player2.spwn) {
      let rightSelected = PT_DUST;
      const activeTool = this.gameModel.GetActiveTool(1);
      if (activeTool && activeTool.Identifier.startsWith('DEFAULT_PT_')) {
        const sr = activeTool.ToolID;
        if (sr && sd.IsElementOrNone(sr)) rightSelected = sr;
      }
      if (!sim.player.spwn) Element_STKM_set_element(sim, sim.player, rightSelected);
      if (!sim.player2.spwn) Element_STKM_set_element(sim, sim.player2, rightSelected);
    }
    if (this.renderOptions && this.renderOptions.HasExited) this.renderOptions = null;
    if (this.localBrowser && this.localBrowser.HasDone) this.localBrowser = null;
  }

  SetZoomEnabled(zoomEnabled: boolean): void { this.gameModel.SetZoomEnabled(zoomEnabled); }
  SetToolStrength(value: number): void { this.gameModel.SetToolStrength(value); }
  SetZoomPosition(position: Point): void {
    const zoomhalf = (this.gameModel.GetZoomSize() / 2) | 0;
    const zoomPosition = { X: position.X - zoomhalf, Y: position.Y - zoomhalf };
    if (zoomPosition.X < 0) zoomPosition.X = 0;
    if (zoomPosition.Y < 0) zoomPosition.Y = 0;
    if (zoomPosition.X >= XRES - this.gameModel.GetZoomSize()) zoomPosition.X = XRES - this.gameModel.GetZoomSize();
    if (zoomPosition.Y >= YRES - this.gameModel.GetZoomSize()) zoomPosition.Y = YRES - this.gameModel.GetZoomSize();
    const zoomWindowPosition = { X: 0, Y: 0 };
    if (position.X < XRES / 2) zoomWindowPosition.X = XRES - (this.gameModel.GetZoomSize() * this.gameModel.GetZoomFactor());
    this.gameModel.SetZoomPosition(zoomPosition);
    this.gameModel.SetZoomWindowPosition(zoomWindowPosition);
  }
  GetPaused(): boolean { return this.gameModel.GetPaused(); }
  /** SetPaused(bool) and SetPaused() (toggle) */
  SetPaused(pauseState?: boolean): void {
    this.gameModel.SetPaused(pauseState === undefined ? !this.gameModel.GetPaused() : pauseState);
  }
  /** SetDecoration(bool) and SetDecoration() (toggle) */
  SetDecoration(decorationState?: boolean): void {
    this.gameModel.SetDecoration(decorationState === undefined ? !this.gameModel.GetDecoration() : decorationState);
  }
  ShowGravityGrid(): void {
    this.gameModel.ShowGravityGrid(!this.gameModel.GetGravityGrid());
    this.gameModel.UpdateQuickOptions();
  }
  SetHudEnable(hudState: boolean): void { this.gameView.SetHudEnable(hudState); }
  GetHudEnable(): boolean { return this.gameView.GetHudEnable(); }
  SetBrushEnable(brushState: boolean): void { this.gameView.SetBrushEnable(brushState); }
  GetBrushEnable(): boolean { return this.gameView.GetBrushEnable(); }
  SetDebugHUD(hudState: boolean): void { this.gameView.SetDebugHUD(hudState); }
  GetDebugHUD(): boolean { return this.gameView.GetDebugHUD(); }
  SetTemperatureScale(temperatureScale: number): void { this.gameModel.SetTemperatureScale(temperatureScale); }
  GetTemperatureScale(): number { return this.gameModel.GetTemperatureScale(); }
  GetEdgeMode(): number { return this.gameModel.GetEdgeMode(); }
  SetEdgeMode(edgeMode: number): void {
    if (edgeMode < 0 || edgeMode >= NUM_EDGEMODES) edgeMode = 0;
    this.gameModel.SetEdgeMode(edgeMode);
    switch (edgeMode) {
      case EDGE_VOID: this.gameModel.SetInfoTip('Edge Mode: Void'); break;
      case EDGE_SOLID: this.gameModel.SetInfoTip('Edge Mode: Solid'); break;
      case EDGE_LOOP: this.gameModel.SetInfoTip('Edge Mode: Loop'); break;
    }
  }
  SetDebugFlags(flags: number): void { this.debugFlags = flags; }
  GetDebugFlags(): number { return this.debugFlags; }
  SetActiveColourPreset(preset: number): void { this.gameModel.SetActiveColourPreset(preset); }
  SetColour(colour: number): void {
    this.gameModel.SetColourSelectorColour(colour);
    this.gameModel.SetPresetColour(colour);
  }
  SetActiveMenu(menuID: number): void {
    this.gameModel.SetActiveMenu(menuID);
    if (menuID === SC_DECO) this.gameModel.SetColourSelectorVisibility(true);
    else this.gameModel.SetColourSelectorVisibility(false);
  }
  GetMenuList(): Menu[] { return this.gameModel.GetMenuList(); }
  GetNumMenus(onlyEnabled: boolean): number {
    if (onlyEnabled) return this.gameModel.GetMenuList().filter((m) => m.GetVisible()).length;
    return this.gameModel.GetMenuList().length;
  }
  RebuildFavoritesMenu(): void { this.gameModel.BuildMenus(); }
  GetActiveTool(selection: number): Tool { return this.gameModel.GetActiveTool(selection); }
  /** SetActiveTool(int, Tool *) and SetActiveTool(int, ByteString identifier) */
  SetActiveTool(toolSelection: number, tool: Tool | string | null): void {
    if (typeof tool === 'string') {
      const t = this.gameModel.GetToolFromIdentifier(tool);
      if (!t) return;
      tool = t;
    }
    if (!tool) return;
    if (this.gameModel.GetActiveMenu() === SC_DECO && toolSelection === 2) toolSelection = 0;
    this.gameModel.SetActiveTool(toolSelection, tool);
    this.gameModel.GetRendererSettings().gravityZonesEnabled = false;
    if (toolSelection === 3) this.gameModel.GetSimulation().replaceModeSelected = tool.ToolID;
    this.gameModel.SetLastTool(tool);
    for (let i = 0; i < 3; i++) {
      const activeTool = this.gameModel.GetActiveTool(i);
      if (activeTool && activeTool.Identifier === 'DEFAULT_WL_GRVTY') this.gameModel.GetRendererSettings().gravityZonesEnabled = true;
    }
    tool.Select(toolSelection);
  }
  SetLastTool(tool: Tool | null): void { this.gameModel.SetLastTool(tool); }
  GetLastTool(): Tool | null { return this.gameModel.GetLastTool(); }
  GetReplaceModeFlags(): number { return this.gameModel.GetSimulation().replaceModeFlags; }
  SetReplaceModeFlags(flags: number): void {
    const old_flags = this.gameModel.GetSimulation().replaceModeFlags;
    if (!(old_flags & REPLACE_MODE) && (flags & REPLACE_MODE)) {
      // if replace mode has just been enabled, disable specific delete
      flags &= ~SPECIFIC_DELETE;
    }
    if (!(old_flags & SPECIFIC_DELETE) && (flags & SPECIFIC_DELETE)) {
      // if specific delete has just been enabled, disable replace mode
      flags &= ~REPLACE_MODE;
    }
    if ((flags & SPECIFIC_DELETE) && (flags & REPLACE_MODE)) {
      // if both have just been enabled, arbitrarily disable one of them
      flags &= ~SPECIFIC_DELETE;
    }
    this.gameModel.GetSimulation().replaceModeFlags = flags;
  }

  // ---- windows ----

  OpenSearch(_searchText: string): void {
    new InformationMessage(OFFLINE_TITLE, OFFLINE_TEXT, false);
  }
  OpenLocalSaveWindow(asCurrent: boolean): void {
    const sim = this.gameModel.GetSimulation();
    let gameSave: GameSave | null = null;
    try {
      gameSave = Save(sim, this.gameModel.GetIncludePressure() !== this.gameView.ShiftBehaviour(), { pos: { X: 0, Y: 0 }, size: { X: XRES, Y: YRES } });
    } catch (e) {
      console.warn(e);
    }
    if (!gameSave) {
      new ErrorMessage('Error', 'Unable to build save.');
    } else {
      gameSave.paused = this.gameModel.GetPaused();
      const tempSave = new SaveFile('');
      const current = this.gameModel.GetSaveFile();
      if (current) {
        tempSave.SetFileName(current.GetName());
        tempSave.SetDisplayName(current.GetDisplayName());
      }
      if (!asCurrent || !current) {
        tempSave.SetGameSave(gameSave);
        new LocalSaveActivity(tempSave, (file: SaveFile) => {
          this.gameModel.SetSaveFile(file, this.gameView.ShiftBehaviour());
        });
      } else {
        const localSaveInfo: Record<string, unknown> = { type: 'localsave', username: '', title: current.GetName(), date: Math.floor(Date.now() / 1000) };
        Client.Ref().SaveAuthorInfo(localSaveInfo as never);
        gameSave.authors = localSaveInfo as never;
        void LOCAL_SAVE_DIR;
        let saveData: Uint8Array = new Uint8Array(0);
        try {
          [, saveData] = gameSave.Serialise();
        } catch (e) {
          console.warn(e);
        }
        tempSave.SetGameSave(gameSave);
        this.gameModel.SetSaveFile(tempSave, this.gameView.ShiftBehaviour());
        if (saveData.length === 0) new ErrorMessage('Error', 'Unable to serialize game data.');
        else if (!Client.Ref().WriteFile(this.gameModel.GetSaveFile()!.GetName(), saveData)) new ErrorMessage('Error', 'Unable to write save file.');
        else this.gameModel.SetInfoTip('Saved Successfully');
      }
    }
  }
  LoadSaveFile(file: SaveFile | null): void {
    this.gameModel.SetSaveFile(file, this.gameView.ShiftBehaviour());
  }
  OpenSavePreview(): void {}
  OpenLocalBrowse(): void {
    new FileBrowserActivity(LOCAL_SAVE_DIR + '/', (file: SaveFile) => {
      this.HistorySnapshot();
      this.LoadSaveFile(file);
    });
  }
  OpenLogin(): void { new InformationMessage(OFFLINE_TITLE, OFFLINE_TEXT, false); }
  OpenProfile(): void { new InformationMessage(OFFLINE_TITLE, OFFLINE_TEXT, false); }
  OpenElementSearch(): void {
    const toolList: Tool[] = [];
    for (const ptr of this.gameModel.GetTools()) {
      if (!ptr) continue;
      toolList.push(ptr);
    }
    new ElementSearchActivity(this, toolList);
  }
  OpenColourPicker(): void {
    new ColourPickerActivity(this.gameModel.GetColourSelectorColour(), (colour: number) => {
      this.SetColour(colour);
    });
  }
  OpenTags(): void {
    new ErrorMessage('Error', 'No save open');
  }
  OpenStamps(): void {
    const lb = new LocalBrowserController(() => {
      const file = lb.TakeSave();
      if (file) {
        if (file.GetError().length) new ErrorMessage('Error loading stamp', file.GetError());
        else if (lb.GetMoveToFront()) Client.Ref().MoveStampToFront(file.GetDisplayName());
        this.LoadStamp(file.TakeGameSave());
      }
    });
    this.localBrowser = lb;
    Engine.Ref().ShowWindow(lb.GetView());
  }
  OpenOptions(): void {
    this.options = new OptionsController(this.gameModel, () => {
      this.gameModel.UpdateQuickOptions();
    });
    Engine.Ref().ShowWindow(this.options.GetView());
  }
  /** the Lua console is not ported */
  ShowConsole(): void {}
  HideConsole(): void {}
  OpenRenderOptions(): void {
    this.renderOptions = new RenderController(this.gameModel.GetSimulation(), this.gameModel.GetRenderer(), this.gameModel.GetRendererSettings(), null);
    Engine.Ref().ShowWindow(this.renderOptions.GetView());
  }
  OpenSaveWindow(): void {
    new ErrorMessage('Error', 'You need to login to upload saves.');
  }
  SaveAsCurrent(): void {
    new ErrorMessage('Error', 'You need to login to upload saves.');
  }
  FrameStep(): void {
    this.gameModel.FrameStep(1);
    this.gameModel.SetPaused(true);
  }
  Vote(_direction: number): void {}
  ChangeBrush(): void {
    this.gameModel.SetBrushID(this.gameModel.GetBrushID() + 1);
  }
  ClearSim(): void {
    this.HistorySnapshot();
    this.gameModel.SetSaveFile(null, false);
    this.gameModel.ClearSimulation();
  }
  ElementResolve(type: number, ctype: number): string {
    // "NONE" should never be displayed in the HUD
    if (!type) return '';
    return sd.ElementResolve(type, ctype);
  }
  BasicParticleInfo(sample_part: Particle): string {
    return sd.BasicParticleInfo(sample_part);
  }
  ReloadSim(): void {
    const f = this.gameModel.GetSaveFile();
    if (f && f.GetGameSave()) {
      this.HistorySnapshot();
      this.gameModel.SetSaveFile(this.gameModel.TakeSaveFile(), this.gameView.ShiftBehaviour());
    }
  }
  IsValidElement(type: number): boolean {
    return !!type && sd.IsElement(type);
  }
  WallName(type: number): string {
    if (type >= 0 && type < UI_WALLCOUNT) return sd.wtypes[type].name;
    return '';
  }
  RemoveNotification(notification: Notification): void {
    this.gameModel.RemoveNotification(notification);
  }
  GetMouseClickRequired(): boolean { return this.gameModel.GetMouseClickRequired(); }
  GetThreadedRendering(): boolean { return this.gameModel.GetThreadedRendering(); }
  RemoveCustomGol(identifier: string): void { this.gameModel.RemoveCustomGol(identifier); }
  BeforeSimDraw(): void {}
  AfterSimDraw(): void {}
  /** the port renders on the main thread */
  ThreadedRenderingAllowed(): boolean { return false; }
  SetToolIndex(_identifier: string, _index: number | null): void {}
  GetFrameTime(): null { return null; }

  /** the quit confirmation of Engine::ConfirmExit */
  ConfirmQuit(): void {
    Engine.Ref().ConfirmExit();
  }
}

/** sim->Load(save, includePressure, blockP) for a place save (position in cells) */
function LoadInto(model: GameModel, save: GameSave, includePressure: boolean, position: Point): void {
  Load(model.GetSimulation(), save, includePressure, position);
}

export { ConfirmPrompt };
