// gui/game/GameModel.h / GameModel.cpp, and the GameModel parts of gui/game/tool/SampleTool.cpp and
// DecorationTool::GetIcon. Online parts (SaveInfo, votes, the user) are reduced to what the offline game needs.
import {
  AIR_ON, AIRC_BOUSSINESQ, DECOSPACE_SRGB, DECO_ADD, DECO_CLEAR, DECO_DIVIDE, DECO_DRAW, DECO_MULTIPLY, DECO_SMUDGE,
  DECO_SUBTRACT, EDGE_VOID, GRAV_VERTICAL, MAX_PRESSURE, MAX_TEMP, MAX_VELOCITY, MIN_PRESSURE, MIN_TEMP, NGOL,
  NPART, NUM_CONVMODES, NUM_DECOSPACES, NUM_EDGEMODES, NUM_TEMPSCALES, PMAP, PT_NUM, R_TEMP, RENDER_BASC,
  RENDER_EFFE, RENDER_FIRE, SC_DECO, SC_FAVORITES, SC_LIFE, SC_WALL, TEMPSCALE_CELSIUS, UI_WALLCOUNT, ID,
} from '../../sim/config.ts';
import { PT_FIGH, PT_LIFE, PT_LIGH, PT_STKM, PT_STKM2, PT_TESC } from '../../sim/numbers.ts';
import { Simulation } from '../../sim/simulation.ts';
import { sd, ParseGOLString, SerialiseGOLRule, ValidateGOLName, type CustomGOLData } from '../../sim/simulationData.ts';
import { EllipseBrush, RectangleBrush, TriangleBrush, type Brush } from '../../sim/brush.ts';
import {
  Tool, ElementTool, Element_LIGH_Tool, Element_TESC_Tool, PlopTool, WallTool, DecorationTool, PropertyTool, SignTool,
  SampleTool, GOLTool,
} from '../../sim/tools.ts';
import { GetTools } from '../../sim/simTool.ts';
import { CreateSnapshot, SetDecoSpace, type Snapshot } from '../../sim/editing.ts';
import { decorationDisabled, decorationEnabled } from '../../sim/element.ts';
import { RNG } from '../../sim/cpp.ts';
import { Renderer, RendererSettings } from '../../graphics/renderer.ts';
import { VideoBuffer, RGB, WithAlpha } from '../../graphics/raster.ts';
import type { GameSave } from "../../save/gameSave.ts";
import { Load } from '../../save/load.ts';
import { Client, Clipboard, GlobalPrefs, SaveFile } from '../../game/Client.ts';
import { deepClone } from '../../game/clone.ts';
import { Colour, Red, Green, Blue, Alpha, type Point } from '../interface/Point.ts';
import { Menu, Favorite, Notification, QuickOption, SandEffectOption, DrawGravOption, DecorationsOption, NGravityOption, AHeatOption, ConsoleShowOption } from './Menu.ts';
import type { GameView } from './GameView.ts';
import type { GameController } from './GameController.ts';

export const NUM_TOOLINDICES = 4;
export const ToolPrimary = 0, ToolSecondary = 1, ToolTertiary = 2;

/** a decoration tool's icon (DecorationTool::GetIcon), for the deco menu, whose icons follow its colour */
export function DecorationToolGetIcon(tool: DecorationTool, ToolID: number, w: number, h: number): VideoBuffer {
  const Colour_ = tool.DecoColour;
  const texture = new VideoBuffer(w, h);
  if (ToolID === DECO_SMUDGE) {
    for (let y = 0; y < h; y++)
      for (let x = 0; x < w; x++)
        texture.DrawPixel(x, y, RGB(0, 0xFF - 5 * x, 5 * x));
  } else if (ToolID === DECO_DRAW || ToolID === DECO_CLEAR) {
    texture.BlendFilledRect(0, 0, w, h, Colour_);
  } else {
    texture.DrawFilledRect(0, 0, w, h, 0x323232);
  }
  if (ToolID === DECO_CLEAR) {
    const reverse = WithAlpha(RGB(Red(Colour_) + 127, Green(Colour_) + 127, Blue(Colour_) + 127), 0xFF);
    texture.BlendChar(((w / 2) | 0) - 4, ((h / 2) | 0) - 2, 0xE06C, reverse);
  } else {
    const colour = WithAlpha(Colour_ & 0xFFFFFF, 0xFF);
    if (ToolID === DECO_ADD) texture.AddChar(11, 4, '+'.charCodeAt(0), colour);
    else if (ToolID === DECO_SUBTRACT) texture.AddChar(11, 4, '-'.charCodeAt(0), colour);
    else if (ToolID === DECO_MULTIPLY) texture.AddChar(11, 3, 'x'.charCodeAt(0), colour);
    else if (ToolID === DECO_DIVIDE) texture.AddChar(11, 4, '/'.charCodeAt(0), colour);
  }
  return texture;
}

/** SampleTool::GetIcon */
function SampleToolGetIcon(_toolID: number, w: number, h: number): VideoBuffer {
  const texture = new VideoBuffer(w, h);
  texture.DrawRect(0, 0, w, h, 0xA0A0A0);
  texture.BlendChar(((w / 2) | 0) - 5, ((h / 2) | 0) - 5, 0xE066, WithAlpha(0xFFFFFF, 0xFF));
  texture.BlendChar(((w / 2) | 0) - 5, ((h / 2) | 0) - 5, 0xE06B, WithAlpha(0x64B4FF, 0xFF));
  return texture;
}

/** NONE's IconGenerator (simulation/elements/NONE.cpp iconGen) */
function NoneIconGen(_id: number, w: number, h: number): VideoBuffer {
  const texture = new VideoBuffer(w, h);
  texture.BlendChar(((w / 2) | 0) - 4, ((h / 2) | 0) - 2, 0xE06C, WithAlpha(0xFF0000, 0xFF));
  return texture;
}

type TextureGen = Tool['textureGen'];
const asGen = (f: (id: number, w: number, h: number) => VideoBuffer | null): TextureGen => f as unknown as TextureGen;

/** hooks the tool windows install (src/gui/game/tool/ToolWindows.ts) */
export interface ToolWindowHooks {
  OpenPropertyWindow(sim: Simulation | null, takePropertyFrom: number | null): void;
  OpenGOLWindow(toolSelection: number, rule: number, colour1: number, colour2: number): void;
}

export class GameModel {
  private notifications: Notification[] = [];
  private placeSave: GameSave | null = null;
  private transformedPlaceSave: GameSave | null = null;
  private consoleLog: string[] = [];
  private observers: GameView[] = [];
  private tools: (Tool | null)[] = [];
  private sim: Simulation;
  private paused = false;
  private queuedFrames = 0;
  private ren: Renderer;
  private rendererSettings = new RendererSettings();
  private menuList: Menu[] = [];
  private quickOptions: QuickOption[] = [];
  private activeMenu = 0;
  private currentBrush = 0;
  private brushList: Brush[] = [];
  private currentFile: SaveFile | null = null;
  private lastTool: Tool | null = null;
  private decoToolset: (Tool | null)[] = [null, null, null, null];
  private regularToolset: (Tool | null)[] = [null, null, null, null];
  private activeTools: (Tool | null)[];
  private toolStrength = 1.0;
  /** history of Snapshots (the original keeps SnapshotDeltas for all but the newest; the port keeps Snapshots) */
  private history: Snapshot[] = [];
  private historyCurrent: Snapshot | null = null;
  private historyPosition = 0;
  private undoHistoryLimit = 5;
  private mouseClickRequired = false;
  private includePressure = true;
  private perfectCircle = true;
  private temperatureScale = TEMPSCALE_CELSIUS;
  private activeColourPreset = 0;
  private colourPresets: number[] = [];
  private colourSelector = false;
  private colour = Colour(255, 0, 0, 255);
  private edgeMode = EDGE_VOID;
  private ambientAirTemp = Math.fround(R_TEMP + 273.15);
  private edgePressure = 0;
  private edgeVelocityX = 0;
  private edgeVelocityY = 0;
  private vorticityCoeff = Math.fround(0.1);
  private convectionMode = AIRC_BOUSSINESQ;
  private decoSpace = DECOSPACE_SRGB;
  private infoTip = '';
  private toolTip = '';
  private threadedRendering = false;
  private view: GameView;
  logSink: ((message: string) => void) | null = null;
  SelectNextIdentifier = '';
  SelectNextTool = 0;
  frameTime: unknown = null;
  toolWindows: ToolWindowHooks | null = null;
  /** the GameController, for the tools' SetToolIndex calls (Lua only) */
  controller: GameController | null = null;

  constructor(newView: GameView) {
    this.activeMenu = 8; // SC_POWDERS
    this.view = newView;
    this.sim = Simulation.Factory();
    this.sim.useLuaCallbacks = true;
    this.ren = new Renderer();
    this.activeTools = this.regularToolset;
    //Load config into renderer
    const prefs = GlobalPrefs();
    const handleOldModes = (prefName: string, oldPrefName: string, defaultValue: number, setFunc: (v: number) => void) => {
      let pref = prefs.GetOpt<number>(prefName);
      if (typeof pref !== 'number') {
        const modes = prefs.Get(oldPrefName, [] as number[]);
        if (modes.length) {
          let mode = 0;
          for (const partial of modes) mode |= partial;
          pref = mode >>> 0;
        } else {
          pref = defaultValue;
        }
      }
      setFunc(pref >>> 0);
    };
    handleOldModes('Renderer.RenderMode', 'Renderer.RenderModes', (RENDER_FIRE | RENDER_EFFE | RENDER_BASC) >>> 0, (v) => { this.rendererSettings.renderMode = v; });
    handleOldModes('Renderer.DisplayMode', 'Renderer.DisplayModes', 0, (v) => { this.rendererSettings.displayMode = v; });
    this.rendererSettings.colorMode = prefs.Get('Renderer.ColourMode', 0) >>> 0;
    this.rendererSettings.gravityFieldEnabled = prefs.Get('Renderer.GravityField', false);
    this.rendererSettings.decorationLevel = prefs.Get('Renderer.Decorations', true) ? decorationEnabled : decorationDisabled;
    this.rendererSettings.gridCheckerboard = prefs.Get('Renderer.GridCheckerboard', false);
    this.threadedRendering = prefs.Get('Renderer.SeparateThread', true);
    //Load config into simulation
    this.edgeMode = prefs.GetEnum('Simulation.EdgeMode', NUM_EDGEMODES, EDGE_VOID);
    this.sim.SetEdgeMode(this.edgeMode);
    this.ambientAirTemp = Math.fround(R_TEMP + Math.fround(273.15));
    {
      const temp = prefs.Get('Simulation.AmbientAirTemp', this.ambientAirTemp);
      if (MIN_TEMP <= temp && MAX_TEMP >= temp) this.ambientAirTemp = Math.fround(temp);
    }
    this.edgePressure = 0;
    {
      const pres = prefs.Get('Simulation.EdgePressure', this.edgePressure);
      if (MIN_PRESSURE <= pres && MAX_PRESSURE >= pres) this.edgePressure = Math.fround(pres);
    }
    this.edgeVelocityX = 0;
    {
      const vel = prefs.Get('Simulation.EdgeVelocityX', this.edgeVelocityX);
      if (-MAX_VELOCITY <= vel && MAX_VELOCITY >= vel) this.edgeVelocityX = Math.fround(vel);
    }
    this.edgeVelocityY = 0;
    {
      const vel = prefs.Get('Simulation.EdgeVelocityY', this.edgeVelocityY);
      if (-MAX_VELOCITY <= vel && MAX_VELOCITY >= vel) this.edgeVelocityY = Math.fround(vel);
    }
    this.sim.air.ambientAirTemp = this.ambientAirTemp;
    this.sim.air.edgePressure = this.edgePressure;
    this.sim.air.edgeVelocityX = this.edgeVelocityX;
    this.sim.air.edgeVelocityY = this.edgeVelocityY;
    this.vorticityCoeff = Math.fround(0.1); // The default for old saves is 0, but use 0.1 for old configs
    {
      const vort = prefs.Get('Simulation.VorticityCoeff', this.vorticityCoeff);
      if (0.0 <= vort && vort <= 1.0) this.vorticityCoeff = Math.fround(vort);
    }
    this.sim.air.vorticityCoeff = this.vorticityCoeff;
    this.convectionMode = prefs.GetEnum('Simulation.ConvectionMode', NUM_CONVMODES, AIRC_BOUSSINESQ);
    this.sim.air.convectionMode = this.convectionMode;
    this.decoSpace = prefs.GetEnum('Simulation.DecoSpace', NUM_DECOSPACES, DECOSPACE_SRGB);
    SetDecoSpace(this.sim, this.decoSpace);
    if (prefs.Get('Simulation.NewtonianGravity', false)) this.sim.EnableNewtonianGravity(true);
    this.sim.aheat_enable = prefs.Get('Simulation.AmbientHeat', 0) | 0;
    this.sim.pretty_powder = prefs.Get('Simulation.PrettyPowder', 0) | 0;
    Favorite.Ref().LoadFavoritesFromPrefs();
    this.perfectCircle = prefs.Get('PerfectCircleBrush', true);
    this.BuildBrushList();
    this.InitTools();
    //Set default decoration colour
    const clamp = (v: number) => Math.max(Math.min(v, 255), 0);
    const colourR = clamp(prefs.Get('Decoration.Red', 200));
    const colourG = clamp(prefs.Get('Decoration.Green', 100));
    const colourB = clamp(prefs.Get('Decoration.Blue', 50));
    const colourA = clamp(prefs.Get('Decoration.Alpha', 255));
    this.SetColourSelectorColour(Colour(colourR, colourG, colourB, colourA));
    this.colourPresets.push(Colour(255, 255, 255));
    this.colourPresets.push(Colour(0, 255, 255));
    this.colourPresets.push(Colour(255, 0, 255));
    this.colourPresets.push(Colour(255, 255, 0));
    this.colourPresets.push(Colour(255, 0, 0));
    this.colourPresets.push(Colour(0, 255, 0));
    this.colourPresets.push(Colour(0, 0, 255));
    this.colourPresets.push(Colour(0, 0, 0));
    this.undoHistoryLimit = prefs.Get('Simulation.UndoHistoryLimit', 5) >>> 0;
    // cap due to memory usage (this is about 3.4GB of RAM)
    if (this.undoHistoryLimit > 200) this.SetUndoHistoryLimit(200);
    this.mouseClickRequired = prefs.Get('MouseClickRequired', false);
    this.includePressure = prefs.Get('Simulation.IncludePressure', true);
    this.temperatureScale = prefs.GetEnum('Renderer.TemperatureScale', NUM_TEMPSCALES, TEMPSCALE_CELSIUS);
    this.ClearSimulation();
  }

  /** ~GameModel: save to config */
  SaveToPrefs(): void {
    const prefs = GlobalPrefs();
    prefs.DeferWrite(() => {
      prefs.Set('Renderer.ColourMode', this.rendererSettings.colorMode);
      prefs.Set('Renderer.DisplayMode', this.rendererSettings.displayMode);
      prefs.Set('Renderer.RenderMode', this.rendererSettings.renderMode);
      prefs.Set('Renderer.GravityField', this.rendererSettings.gravityFieldEnabled);
      prefs.Set('Renderer.GridCheckerboard', this.rendererSettings.gridCheckerboard);
      prefs.Set('Renderer.Decorations', this.GetDecoration());
      prefs.Set('Renderer.DebugMode', this.rendererSettings.debugLines); //These two should always be equivalent, even though they are different things
      prefs.Set('Simulation.NewtonianGravity', !!this.sim.grav);
      prefs.Set('Simulation.AmbientHeat', this.sim.aheat_enable);
      prefs.Set('Simulation.PrettyPowder', this.sim.pretty_powder);
      prefs.Set('Decoration.Red', Red(this.colour));
      prefs.Set('Decoration.Green', Green(this.colour));
      prefs.Set('Decoration.Blue', Blue(this.colour));
      prefs.Set('Decoration.Alpha', Alpha(this.colour));
    });
  }

  UpdateQuickOptions(): void {
    for (const option of this.quickOptions) option.Update();
  }
  BuildQuickOptionMenu(controller: GameController): void {
    this.quickOptions = [];
    this.quickOptions.push(new SandEffectOption(this));
    this.quickOptions.push(new DrawGravOption(this));
    this.quickOptions.push(new DecorationsOption(this));
    this.quickOptions.push(new NGravityOption(this));
    this.quickOptions.push(new AHeatOption(this));
    this.quickOptions.push(new ConsoleShowOption(this, controller));
    this.notifyQuickOptionsChanged();
    this.UpdateQuickOptions();
  }
  BuildBrushList(): void {
    let radius: Point = { X: 4, Y: 4 };
    if (this.brushList.length) radius = this.brushList[this.currentBrush].GetRadius();
    this.brushList = [];
    this.brushList.push(new EllipseBrush(this.perfectCircle));
    this.brushList.push(new RectangleBrush());
    this.brushList.push(new TriangleBrush());
    // The original also loads bitmap brushes (*.ptb) from its brushes folder; the port has no such folder.
    this.brushList[this.currentBrush].SetRadius(radius);
    this.notifyBrushChanged();
  }
  GetToolFromIdentifier(identifier: string): Tool | null {
    for (const ptr of this.tools) {
      if (!ptr) continue;
      if (ptr.Identifier === identifier) return ptr;
    }
    return null;
  }
  SetEdgeMode(edgeMode: number): void {
    this.edgeMode = edgeMode;
    this.sim.SetEdgeMode(edgeMode);
  }
  GetEdgeMode(): number { return this.edgeMode; }
  SetTemperatureScale(temperatureScale: number): void { this.temperatureScale = temperatureScale; }
  GetTemperatureScale(): number { return this.temperatureScale; }
  SetThreadedRendering(newThreadedRendering: boolean): void { this.threadedRendering = newThreadedRendering; }
  GetThreadedRendering(): boolean { return this.threadedRendering; }
  SetAmbientAirTemperature(ambientAirTemp: number): void {
    this.ambientAirTemp = Math.fround(ambientAirTemp);
    this.sim.air.ambientAirTemp = this.ambientAirTemp;
  }
  GetAmbientAirTemperature(): number { return this.ambientAirTemp; }
  SetEdgePressure(edgePressure: number): void {
    this.edgePressure = Math.fround(edgePressure);
    this.sim.air.edgePressure = this.edgePressure;
  }
  GetEdgePressure(): number { return this.edgePressure; }
  SetEdgeVelocityX(edgeVelocityX: number): void {
    this.edgeVelocityX = Math.fround(edgeVelocityX);
    this.sim.air.edgeVelocityX = this.edgeVelocityX;
  }
  GetEdgeVelocityX(): number { return this.edgeVelocityX; }
  SetEdgeVelocityY(edgeVelocityY: number): void {
    this.edgeVelocityY = Math.fround(edgeVelocityY);
    this.sim.air.edgeVelocityY = this.edgeVelocityY;
  }
  GetEdgeVelocityY(): number { return this.edgeVelocityY; }
  SetVorticityCoeff(vorticityCoeff: number): void {
    this.vorticityCoeff = Math.fround(vorticityCoeff);
    this.sim.air.vorticityCoeff = this.vorticityCoeff;
  }
  GetVorticityCoeff(): number { return this.vorticityCoeff; }
  SetConvectionMode(convMode: number): void {
    this.convectionMode = convMode;
    this.sim.air.convectionMode = convMode;
  }
  GetConvectionMode(): number { return this.convectionMode; }
  SetDecoSpace(decoSpace: number): void {
    SetDecoSpace(this.sim, decoSpace);
    this.decoSpace = this.sim.deco_space;
  }
  GetDecoSpace(): number { return this.decoSpace; }

  // ---- history (see GameModel.cpp for the SnapshotDelta scheme the original uses to save memory) ----

  HistoryCurrent(): Snapshot | null { return this.historyCurrent; }
  HistoryCanRestore(): boolean { return this.historyPosition > 0; }
  HistoryRestore(): void {
    if (!this.HistoryCanRestore()) return;
    this.historyPosition -= 1;
    this.historyCurrent = this.history[this.historyPosition];
  }
  HistoryCanForward(): boolean { return this.historyPosition < this.history.length; }
  HistoryForward(): void {
    if (!this.HistoryCanForward()) return;
    this.historyPosition += 1;
    if (this.historyPosition === this.history.length) this.historyCurrent = null;
    else this.historyCurrent = this.history[this.historyPosition];
  }
  HistoryPush(last: Snapshot): void {
    while (this.historyPosition < this.history.length) this.history.pop();
    this.history.push(last);
    this.historyPosition += 1;
    this.historyCurrent = null;
    while (this.undoHistoryLimit < this.history.length) {
      this.history.shift();
      this.historyPosition -= 1;
    }
  }
  GetUndoHistoryLimit(): number { return this.undoHistoryLimit; }
  SetUndoHistoryLimit(undoHistoryLimit_: number): void {
    this.undoHistoryLimit = undoHistoryLimit_;
    GlobalPrefs().Set('Simulation.UndoHistoryLimit', this.undoHistoryLimit);
  }

  SetVote(_direction: number): void {}
  Tick(): void {}

  GetBrush(): Brush { return this.brushList[this.currentBrush]; }
  GetBrushByID(i: number): Brush | null {
    if (i >= 0 && i < this.brushList.length) return this.brushList[i];
    return null;
  }
  GetBrushIndex(brush: Brush): number {
    const i = this.brushList.indexOf(brush);
    return i === -1 ? this.brushList.length : i;
  }
  GetBrushID(): number { return this.currentBrush; }
  BrushListSize(): number { return this.brushList.length; }
  SetBrushID(i: number): void {
    const prevRadius = this.brushList[this.currentBrush].GetRadius();
    this.currentBrush = i % this.brushList.length;
    this.brushList[this.currentBrush].SetRadius(prevRadius);
    this.notifyBrushChanged();
  }

  AddObserver(observer: GameView): void {
    this.observers.push(observer);
    observer.NotifySimulationChanged(this);
    observer.NotifyRendererChanged(this);
    observer.NotifyPausedChanged(this);
    observer.NotifySaveChanged(this);
    observer.NotifyBrushChanged(this);
    observer.NotifyMenuListChanged(this);
    observer.NotifyActiveMenuToolListChanged(this);
    observer.NotifyUserChanged(this);
    observer.NotifyZoomChanged(this);
    observer.NotifyColourSelectorVisibilityChanged(this);
    observer.NotifyColourSelectorColourChanged(this);
    observer.NotifyColourPresetsChanged(this);
    observer.NotifyColourActivePresetChanged(this);
    observer.NotifyQuickOptionsChanged(this);
    observer.NotifyLastToolChanged(this);
    this.UpdateQuickOptions();
  }
  SetToolStrength(value: number): void { this.toolStrength = Math.fround(value); }
  GetToolStrength(): number { return this.toolStrength; }
  SetActiveMenu(menuID: number): void {
    this.activeMenu = menuID;
    this.notifyActiveMenuToolListChanged();
    if (menuID === SC_DECO) {
      if (this.activeTools !== this.decoToolset) {
        this.activeTools = this.decoToolset;
        this.notifyActiveToolsChanged();
      }
    } else {
      if (this.activeTools !== this.regularToolset) {
        this.activeTools = this.regularToolset;
        this.notifyActiveToolsChanged();
      }
    }
  }
  GetActiveMenuToolList(): Tool[] {
    if (this.activeMenu >= 0 && this.activeMenu < this.menuList.length) return this.menuList[this.activeMenu].GetToolList();
    return [];
  }
  GetActiveMenu(): number { return this.activeMenu; }
  GetActiveTool(selection: number): Tool {
    return this.activeTools[selection]!;
  }
  SetActiveTool(selection: number, tool: Tool | null): void {
    this.activeTools[selection] = tool;
    this.notifyActiveToolsChanged();
  }
  GetQuickOptions(): QuickOption[] { return this.quickOptions; }
  GetMenuList(): Menu[] { return this.menuList.slice(); }

  /** SaveInfo (online saves) is not ported: there is never one */
  GetSave(): null { return null; }

  private SaveToSimParameters(saveData: GameSave): void {
    this.SetPaused(saveData.paused || this.GetPaused());
    const sim = this.sim;
    sim.gravityMode = saveData.gravityMode;
    sim.customGravityX = saveData.customGravityX;
    sim.customGravityY = saveData.customGravityY;
    sim.air.airMode = saveData.airMode;
    sim.air.ambientAirTemp = saveData.ambientAirTemp;
    sim.air.edgePressure = saveData.edgePressure;
    sim.air.edgeVelocityX = saveData.edgeVelocityX;
    sim.air.edgeVelocityY = saveData.edgeVelocityY;
    sim.air.vorticityCoeff = saveData.vorticityCoeff;
    sim.air.convectionMode = saveData.convectionMode;
    sim.edgeMode = saveData.edgeMode;
    sim.legacy_enable = saveData.legacyEnable ? 1 : 0;
    sim.water_equal_test = saveData.waterEEnabled ? 1 : 0;
    sim.aheat_enable = saveData.aheatEnable ? 1 : 0;
    sim.EnableNewtonianGravity(saveData.gravityEnable);
    sim.frameCount = saveData.frameCount;
    if (saveData.hasRngState) sim.rng.setState(saveData.rngState);
    else sim.rng = new RNG();
    sim.ensureDeterminism = saveData.ensureDeterminism;
  }

  GetSaveFile(): SaveFile | null { return this.currentFile; }
  TakeSaveFile(): SaveFile | null {
    const f = this.currentFile;
    this.currentFile = null;
    return f;
  }
  SetSaveFile(newSave: SaveFile | null, invertIncludePressure: boolean): void {
    this.currentFile = newSave;
    if (this.currentFile && this.currentFile.GetGameSave()) {
      const saveData = this.currentFile.GetGameSave()!;
      this.SaveToSimParameters(saveData);
      this.sim.clear_sim();
      this.ren.ClearAccumulation();
      Load(this.sim, saveData, !invertIncludePressure, { X: 0, Y: 0 });
      Client.Ref().OverwriteAuthorInfo(saveData.authors);
    }
    this.notifySaveChanged();
    this.UpdateQuickOptions();
  }

  GetSimulation(): Simulation { return this.sim; }
  GetRenderer(): Renderer { return this.ren; }
  GetRendererSettings(): RendererSettings { return this.rendererSettings; }
  GetUser(): null { return null; }
  SetUser(_user: null): void { this.notifyUserChanged(); }
  GetLastTool(): Tool | null { return this.lastTool; }
  SetLastTool(newTool: Tool | null): void {
    if (this.lastTool !== newTool) {
      this.lastTool = newTool;
      this.notifyLastToolChanged();
    }
  }

  // ---- zoom (kept in the window's Graphics as in the original) ----

  SetZoomEnabled(enabled: boolean): void {
    this.view.GetGraphics().zoomEnabled = enabled;
    this.notifyZoomChanged();
  }
  GetZoomEnabled(): boolean { return this.view.GetGraphics().zoomEnabled; }
  SetZoomPosition(position: Point): void {
    this.view.GetGraphics().zoomScopePosition = { X: position.X, Y: position.Y };
    this.notifyZoomChanged();
  }
  GetZoomPosition(): Point { return this.view.GetGraphics().zoomScopePosition; }
  MouseInZoom(position: Point): boolean {
    if (!this.GetZoomEnabled()) return false;
    const zoomFactor = this.GetZoomFactor();
    const zw = this.GetZoomWindowPosition();
    const zs = this.GetZoomSize() * zoomFactor;
    return position.X >= zw.X && position.Y >= zw.Y && position.X < zw.X + zs && position.Y < zw.Y + zs;
  }
  AdjustZoomCoords(position: Point): Point {
    if (!this.GetZoomEnabled()) return position;
    const zoomFactor = this.GetZoomFactor();
    const zw = this.GetZoomWindowPosition();
    const zs = this.GetZoomSize() * zoomFactor;
    if (position.X >= zw.X && position.Y >= zw.Y && position.X < zw.X + zs && position.Y < zw.Y + zs) {
      const zp = this.GetZoomPosition();
      return { X: (((position.X - zw.X) / zoomFactor) | 0) + zp.X, Y: (((position.Y - zw.Y) / zoomFactor) | 0) + zp.Y };
    }
    return position;
  }
  SetZoomWindowPosition(position: Point): void {
    this.view.GetGraphics().zoomWindowPosition = { X: position.X, Y: position.Y };
    this.notifyZoomChanged();
  }
  GetZoomWindowPosition(): Point { return this.view.GetGraphics().zoomWindowPosition; }
  SetZoomSize(size: number): void {
    this.view.GetGraphics().zoomScopeSize = size;
    this.notifyZoomChanged();
  }
  GetZoomSize(): number { return this.view.GetGraphics().zoomScopeSize; }
  SetZoomFactor(factor: number): void {
    this.view.GetGraphics().ZFACTOR = factor;
    this.notifyZoomChanged();
  }
  GetZoomFactor(): number { return this.view.GetGraphics().ZFACTOR; }

  // ---- decoration colours ----

  SetActiveColourPreset(preset: number): void {
    // size_t arithmetic: preset -1 is SIZE_MAX, activeColourPreset-1 likewise when it is 0
    if (this.activeColourPreset - 1 !== preset) {
      this.activeColourPreset = preset + 1;
    } else {
      this.activeTools[0] = this.GetToolFromIdentifier('DEFAULT_DECOR_SET');
      this.notifyActiveToolsChanged();
    }
    this.notifyColourActivePresetChanged();
  }
  GetActiveColourPreset(): number { return this.activeColourPreset - 1; }
  SetPresetColour(colour: number): void {
    if (this.activeColourPreset > 0 && this.activeColourPreset <= this.colourPresets.length) {
      this.colourPresets[this.activeColourPreset - 1] = colour;
      this.notifyColourPresetsChanged();
    }
  }
  GetColourPresets(): number[] { return this.colourPresets.slice(); }
  SetColourSelectorVisibility(visibility: boolean): void {
    if (this.colourSelector !== visibility) {
      this.colourSelector = visibility;
      this.notifyColourSelectorVisibilityChanged();
    }
  }
  GetColourSelectorVisibility(): boolean { return this.colourSelector; }
  SetColourSelectorColour(colour_: number): void {
    this.colour = colour_ >>> 0;
    const tools = this.GetMenuList()[SC_DECO]?.GetToolList() ?? [];
    for (const tool of tools) (tool as DecorationTool).DecoColour = this.colour;
    this.notifyColourSelectorColourChanged();
  }
  GetColourSelectorColour(): number { return this.colour; }

  SetPaused(pauseState: boolean): void {
    if (!pauseState && this.sim.debug_nextToUpdate > 0) {
      const logmessage = 'Updated particles from #' + this.sim.debug_nextToUpdate + ' to end due to unpause';
      this.UpdateUpTo(NPART);
      this.Log(logmessage, false);
    }
    this.paused = pauseState;
    this.notifyPausedChanged();
  }
  GetPaused(): boolean { return this.paused; }
  SetDecoration(decorationState: boolean): void {
    const desiredLevel = decorationState ? decorationEnabled : decorationDisabled;
    if (this.rendererSettings.decorationLevel !== desiredLevel) {
      this.rendererSettings.decorationLevel = desiredLevel;
      this.UpdateQuickOptions();
      if (decorationState) this.SetInfoTip('Decorations Layer: On');
      else this.SetInfoTip('Decorations Layer: Off');
    }
  }
  GetDecoration(): boolean { return this.rendererSettings.decorationLevel !== decorationDisabled; }
  SetAHeatEnable(aHeat: boolean): void {
    this.sim.aheat_enable = aHeat ? 1 : 0;
    this.UpdateQuickOptions();
    if (aHeat) this.SetInfoTip('Ambient Heat: On');
    else this.SetInfoTip('Ambient Heat: Off');
  }
  GetAHeatEnable(): boolean { return !!this.sim.aheat_enable; }
  ResetAHeat(): void { this.sim.air.ClearAirH(); }
  SetNewtonianGravity(newtonainGravity: boolean): void {
    this.sim.EnableNewtonianGravity(newtonainGravity);
    if (newtonainGravity) this.SetInfoTip('Newtonian Gravity: On');
    else this.SetInfoTip('Newtonian Gravity: Off');
    this.UpdateQuickOptions();
  }
  GetNewtonianGrvity(): boolean { return !!this.sim.grav; }
  ShowGravityGrid(showGrid: boolean): void {
    this.rendererSettings.gravityFieldEnabled = showGrid;
    if (showGrid) this.SetInfoTip('Gravity Grid: On');
    else this.SetInfoTip('Gravity Grid: Off');
  }
  GetGravityGrid(): boolean { return this.rendererSettings.gravityFieldEnabled; }
  ShowGridCheckerboard(enableCheckerboard: boolean): void { this.rendererSettings.gridCheckerboard = enableCheckerboard; }
  GetGridCheckerboard(): boolean { return this.rendererSettings.gridCheckerboard; }
  FrameStep(frames: number): void { this.queuedFrames += frames; }
  GetQueuedFrames(): number { return this.queuedFrames; }
  SetQueuedFrames(n: number): void { this.queuedFrames = n; }
  IsSimRunning(): boolean { return !this.paused || !!this.queuedFrames; }

  ClearSimulation(): void {
    const sim = this.sim;
    //Load defaults
    sim.gravityMode = GRAV_VERTICAL;
    sim.customGravityX = 0;
    sim.customGravityY = 0;
    sim.air.airMode = AIR_ON;
    sim.legacy_enable = 0;
    sim.water_equal_test = 0;
    sim.SetEdgeMode(this.edgeMode);
    sim.air.ambientAirTemp = this.ambientAirTemp;
    sim.air.edgePressure = this.edgePressure;
    sim.air.edgeVelocityX = this.edgeVelocityX;
    sim.air.edgeVelocityY = this.edgeVelocityY;
    sim.air.vorticityCoeff = this.vorticityCoeff;
    sim.air.convectionMode = this.convectionMode;
    sim.clear_sim();
    this.ren.ClearAccumulation();
    Client.Ref().ClearAuthorInfo();
    this.notifySaveChanged();
    this.UpdateQuickOptions();
  }

  SetPlaceSave(save: GameSave | null): void {
    this.transformedPlaceSave = null;
    this.placeSave = save;
    this.notifyPlaceSaveChanged();
    if (this.placeSave && this.placeSave.missingElements && (this.placeSave.missingElements as unknown as { hasData?: () => boolean }).hasData?.())
      this.Log('Paste content has missing custom elements', false);
  }
  TransformPlaceSave(transform: readonly [number, number, number, number], nudge: Point): void {
    if (this.placeSave) {
      this.transformedPlaceSave = deepClone(this.placeSave);
      this.transformedPlaceSave.Transform(transform, nudge);
    }
    this.notifyTransformedPlaceSaveChanged();
  }
  SetClipboard(save: GameSave | null): void { Clipboard.SetClipboardData(save); }
  GetClipboard(): GameSave | null { return Clipboard.GetClipboardData(); }
  GetPlaceSave(): GameSave | null { return this.placeSave; }
  GetTransformedPlaceSave(): GameSave | null { return this.transformedPlaceSave; }

  Log(message: string, printToFile: boolean): void {
    if (this.logSink) {
      this.logSink(message);
    } else {
      this.consoleLog.unshift(message);
      if (this.consoleLog.length > 100) this.consoleLog.pop();
      this.notifyLogChanged(message);
    }
    if (printToFile) console.log(message);
  }
  GetLog(): string[] { return this.consoleLog.slice(); }
  GetNotifications(): Notification[] { return this.notifications.slice(); }
  AddNotification(notification: Notification): void {
    this.notifications.push(notification);
    this.notifyNotificationsChanged();
  }
  RemoveNotification(notification: Notification): void {
    const i = this.notifications.indexOf(notification);
    if (i !== -1) this.notifications.splice(i, 1);
    this.notifyNotificationsChanged();
  }
  SetToolTip(text: string): void {
    this.toolTip = text;
    this.notifyToolTipChanged();
  }
  SetInfoTip(text: string): void {
    this.infoTip = text;
    this.notifyInfoTipChanged();
  }
  GetToolTip(): string { return this.toolTip; }
  GetInfoTip(): string { return this.infoTip; }

  private notifyNotificationsChanged(): void { for (const o of this.observers) o.NotifyNotificationsChanged(this); }
  private notifyColourPresetsChanged(): void { for (const o of this.observers) o.NotifyColourPresetsChanged(this); }
  private notifyColourActivePresetChanged(): void { for (const o of this.observers) o.NotifyColourActivePresetChanged(this); }
  private notifyColourSelectorColourChanged(): void { for (const o of this.observers) o.NotifyColourSelectorColourChanged(this); }
  private notifyColourSelectorVisibilityChanged(): void { for (const o of this.observers) o.NotifyColourSelectorVisibilityChanged(this); }
  private notifySaveChanged(): void { for (const o of this.observers) o.NotifySaveChanged(this); }
  private notifyPausedChanged(): void { for (const o of this.observers) o.NotifyPausedChanged(this); }
  private notifyBrushChanged(): void { for (const o of this.observers) o.NotifyBrushChanged(this); }
  private notifyMenuListChanged(): void { for (const o of this.observers) o.NotifyMenuListChanged(this); }
  private notifyActiveMenuToolListChanged(): void { for (const o of this.observers) o.NotifyActiveMenuToolListChanged(this); }
  private notifyActiveToolsChanged(): void { for (const o of this.observers) o.NotifyActiveToolsChanged(this); }
  private notifyUserChanged(): void { for (const o of this.observers) o.NotifyUserChanged(this); }
  private notifyZoomChanged(): void { for (const o of this.observers) o.NotifyZoomChanged(this); }
  private notifyPlaceSaveChanged(): void { for (const o of this.observers) o.NotifyPlaceSaveChanged(this); }
  private notifyTransformedPlaceSaveChanged(): void { for (const o of this.observers) o.NotifyTransformedPlaceSaveChanged(this); }
  private notifyLogChanged(entry: string): void { for (const o of this.observers) o.NotifyLogChanged(this, entry); }
  private notifyInfoTipChanged(): void { for (const o of this.observers) o.NotifyInfoTipChanged(this); }
  private notifyToolTipChanged(): void { for (const o of this.observers) o.NotifyToolTipChanged(this); }
  private notifyQuickOptionsChanged(): void { for (const o of this.observers) o.NotifyQuickOptionsChanged(this); }
  private notifyLastToolChanged(): void { for (const o of this.observers) o.NotifyLastToolChanged(this); }

  GetMouseClickRequired(): boolean { return this.mouseClickRequired; }
  SetMouseClickRequired(mouseClickRequired: boolean): void { this.mouseClickRequired = mouseClickRequired; }
  GetIncludePressure(): boolean { return this.includePressure; }
  SetIncludePressure(includePressure: boolean): void { this.includePressure = includePressure; }
  SetPerfectCircle(perfectCircle: boolean): void {
    if (perfectCircle !== this.perfectCircle) {
      this.perfectCircle = perfectCircle;
      this.BuildBrushList();
    }
  }
  GetPerfectCircle(): boolean { return this.perfectCircle; }

  // ---- custom Game of Life types ----

  AddCustomGol(ruleString: string, nameString: string, color1: number, color2: number): boolean {
    const gd = this.CheckCustomGol(ruleString, nameString, color1, color2);
    if (gd) {
      const newCustomGol = sd.GetCustomGol().slice();
      newCustomGol.push(gd);
      sd.SetCustomGOL(newCustomGol);
      this.AllocCustomGolTool(gd);
      this.SaveCustomGol();
      this.BuildMenus();
      return true;
    }
    return false;
  }
  RemoveCustomGol(identifier: string): boolean {
    let removedAny = false;
    const newCustomGol: CustomGOLData[] = [];
    for (const gol of sd.GetCustomGol()) {
      if ('DEFAULT_PT_LIFECUST_' + gol.nameString === identifier) removedAny = true;
      else newCustomGol.push(gol);
    }
    if (removedAny) {
      sd.SetCustomGOL(newCustomGol);
      this.FreeTool(this.GetToolFromIdentifier(identifier));
      this.BuildMenus();
      this.SaveCustomGol();
    }
    return removedAny;
  }
  LoadCustomGol(): void {
    const prefs = GlobalPrefs();
    const customGOLTypes = prefs.Get('CustomGOL.Types', [] as string[]);
    let removedAny = false;
    const newCustomGol: CustomGOLData[] = [];
    for (const gol of customGOLTypes) {
      const parts = String(gol).split(' ');
      if (parts.length !== 4) {
        removedAny = true;
        continue;
      }
      const [nameString, ruleString, colour1String, colour2String] = parts;
      if (!/^[+-]?\d+$/.test(colour1String) || !/^[+-]?\d+$/.test(colour2String)) {
        removedAny = true;
        continue;
      }
      const color1 = Number(colour1String) & 0xFFFFFF;
      const color2 = Number(colour2String) & 0xFFFFFF;
      const gd = this.CheckCustomGol(ruleString, nameString, color1, color2, newCustomGol);
      if (gd) {
        newCustomGol.push(gd);
        this.AllocCustomGolTool(gd);
      } else {
        removedAny = true;
      }
    }
    sd.SetCustomGOL(newCustomGol);
    if (removedAny) this.SaveCustomGol();
  }
  SaveCustomGol(): void {
    const newCustomGOLTypes: string[] = [];
    for (const gd of sd.GetCustomGol())
      newCustomGOLTypes.push(gd.nameString + ' ' + SerialiseGOLRule(gd.rule) + ' ' + gd.colour1 + ' ' + gd.colour2);
    GlobalPrefs().Set('CustomGOL.Types', newCustomGOLTypes);
  }
  /** CheckCustomGol; `existing` stands in for sd.GetCustomGol() while LoadCustomGol builds the list */
  CheckCustomGol(ruleString: string, nameString: string, color1: number, color2: number, existing?: readonly CustomGOLData[]): CustomGOLData | null {
    if (!ValidateGOLName(nameString)) return null;
    const rule = ParseGOLString(ruleString);
    if (rule === -1) return null;
    for (const gd of existing ?? sd.GetCustomGol()) {
      if (gd.nameString === nameString) return null;
    }
    return { rule, colour1: color1 & 0xFFFFFF, colour2: color2 & 0xFFFFFF, nameString };
  }

  UpdateUpTo(upTo: number): void {
    if (upTo < this.sim.debug_nextToUpdate) upTo = NPART;
    if (this.sim.debug_nextToUpdate === 0) this.BeforeSim();
    this.sim.UpdateParticles(this.sim.debug_nextToUpdate, upTo);
    if (this.queuedFrames) this.queuedFrames--;
    if (upTo < NPART) {
      this.sim.debug_nextToUpdate = upTo;
    } else {
      this.AfterSim();
      this.sim.debug_nextToUpdate = 0;
    }
  }
  BeforeSim(): void {
    const willUpdate = this.IsSimRunning();
    this.sim.BeforeSim(willUpdate);
  }
  AfterSim(): void {
    this.sim.AfterSim();
  }

  // ---- tools ----

  GetToolByIndex(index: number): Tool | null {
    if (index < 0 || index >= this.tools.length) return null;
    return this.tools[index];
  }
  GetTools(): (Tool | null)[] { return this.tools; }
  private SanitizeToolsets(): void {
    const d = this.decoToolset, r = this.regularToolset;
    if (!d[0]) d[0] = this.GetToolFromIdentifier('DEFAULT_DECOR_SET');
    if (!d[1]) d[1] = this.GetToolFromIdentifier('DEFAULT_DECOR_CLR');
    if (!d[2]) d[2] = this.GetToolFromIdentifier('DEFAULT_UI_SAMPLE');
    if (!d[3]) d[3] = this.GetToolFromIdentifier('DEFAULT_PT_NONE');
    if (!r[0]) r[0] = this.GetToolFromIdentifier('DEFAULT_PT_DUST');
    if (!r[1]) r[1] = this.GetToolFromIdentifier('DEFAULT_PT_NONE');
    if (!r[2]) r[2] = this.GetToolFromIdentifier('DEFAULT_UI_SAMPLE');
    if (!r[3]) r[3] = this.GetToolFromIdentifier('DEFAULT_PT_NONE');
    if (!this.lastTool) this.lastTool = this.activeTools[0];
  }
  private DeselectTool(identifier: string): void {
    const tool = this.GetToolFromIdentifier(identifier);
    for (let i = 0; i < NUM_TOOLINDICES; i++) {
      if (this.decoToolset[i] === tool) this.decoToolset[i] = null;
      if (this.regularToolset[i] === tool) this.regularToolset[i] = null;
    }
    if (this.lastTool === tool) this.lastTool = null;
    this.SanitizeToolsets();
  }
  AllocTool(tool: Tool): void {
    let index = this.tools.indexOf(null);
    if (index === -1) {
      index = this.tools.length;
      this.tools.push(null);
    }
    this.tools[index] = tool;
  }
  FreeTool(tool: Tool | null): void {
    const index = this.GetToolIndex(tool);
    if (index === null) return;
    this.DeselectTool(this.tools[index]!.Identifier);
    this.tools[index] = null;
  }
  GetToolIndex(tool: Tool | null): number | null {
    if (tool) {
      const i = this.tools.indexOf(tool);
      if (i !== -1) return i;
    }
    return null;
  }
  AllocCustomGolTool(gd: CustomGOLData): void {
    const tool = new ElementTool(PMAP(gd.rule, PT_LIFE), gd.nameString, 'Custom GOL type: ' + SerialiseGOLRule(gd.rule), gd.colour1, 'DEFAULT_PT_LIFECUST_' + gd.nameString, null);
    tool.MenuSection = SC_LIFE;
    this.AllocTool(tool);
  }
  UpdateElementTool(element: number): void {
    const elem = sd.elements[element];
    const tool = this.GetToolFromIdentifier(elem.Identifier)!;
    tool.Name = elem.Name;
    tool.Description = elem.Description;
    tool.Colour = elem.Colour;
    tool.textureGen = elem.Identifier === 'DEFAULT_PT_NONE' ? asGen(NoneIconGen) : elem.IconGenerator;
    tool.MenuSection = elem.MenuSection;
    tool.MenuVisible = !!elem.MenuVisible;
    tool.MenuSort = elem.MenuSort;
  }
  AllocElementTool(element: number): void {
    const elem = sd.elements[element];
    switch (element) {
      case PT_LIGH:
        this.AllocTool(Element_LIGH_Tool.withId(element, elem.Identifier));
        break;
      case PT_TESC:
        this.AllocTool(Element_TESC_Tool.withId(element, elem.Identifier));
        break;
      case PT_STKM:
      case PT_FIGH:
      case PT_STKM2:
        this.AllocTool(PlopTool.withId(element, elem.Identifier));
        break;
      default:
        this.AllocTool(ElementTool.withId(element, elem.Identifier));
        break;
    }
    this.UpdateElementTool(element);
  }
  private InitTools(): void {
    const elements = sd.elements;
    const builtinGol = sd.builtinGol;
    for (let i = 0; i < PT_NUM; ++i) {
      if (elements[i] && elements[i].Enabled) this.AllocElementTool(i);
    }
    for (let i = 0; i < NGOL; ++i) {
      const tool = new ElementTool(PMAP(i, PT_LIFE), builtinGol[i].name, builtinGol[i].description, builtinGol[i].colour, 'DEFAULT_PT_LIFE_' + builtinGol[i].name);
      tool.MenuSection = SC_LIFE;
      this.AllocTool(tool);
    }
    for (let i = 0; i < UI_WALLCOUNT; ++i) {
      const wt = sd.wtypes[i];
      const tool = new WallTool(i, wt.descs, wt.colour, wt.identifier, wt.textureGen ? asGen((id, w, h) => Renderer.WallIcon(id, w, h)) : null);
      tool.MenuSection = SC_WALL;
      this.AllocTool(tool);
    }
    for (const tool of GetTools()) this.AllocTool(tool.clone());
    const frame = () => this.view.GetRendererFrameOrNull();
    const deco = (mode: number, name: string, desc: string, id: string) => {
      const t = new DecorationTool(frame, mode, name, desc, 0x000000, id);
      t.textureGen = asGen((toolID, w, h) => DecorationToolGetIcon(t, toolID, w, h));
      this.AllocTool(t);
    };
    deco(DECO_ADD, 'ADD', 'Colour blending: Add.', 'DEFAULT_DECOR_ADD');
    deco(DECO_SUBTRACT, 'SUB', 'Colour blending: Subtract.', 'DEFAULT_DECOR_SUB');
    deco(DECO_MULTIPLY, 'MUL', 'Colour blending: Multiply.', 'DEFAULT_DECOR_MUL');
    deco(DECO_DIVIDE, 'DIV', 'Colour blending: Divide.', 'DEFAULT_DECOR_DIV');
    deco(DECO_SMUDGE, 'SMDG', 'Smudge tool, blends surrounding deco together.', 'DEFAULT_DECOR_SMDG');
    deco(DECO_CLEAR, 'CLR', 'Erase any set decoration.', 'DEFAULT_DECOR_CLR');
    deco(DECO_DRAW, 'SET', 'Draw decoration (No blending).', 'DEFAULT_DECOR_SET');
    const propTool = new PropertyTool();
    propTool.openWindow = (sim, takePropertyFrom) => this.toolWindows?.OpenPropertyWindow(sim, takePropertyFrom);
    this.AllocTool(propTool);
    this.AllocTool(new SignTool());
    const sampleTool = new SampleTool();
    sampleTool.textureGen = asGen(SampleToolGetIcon);
    sampleTool.onSample = (sim, i) => this.SampleToolDraw(sampleTool, sim, i);
    this.AllocTool(sampleTool);
    const golTool = new GOLTool();
    golTool.openWindow = (toolSelection) => this.toolWindows?.OpenGOLWindow(toolSelection, 0, 0, 0);
    this.AllocTool(golTool);
    this.LoadCustomGol();
    this.SanitizeToolsets();
    this.lastTool = this.activeTools[0];
    this.BuildMenus();
  }

  /** SampleTool::Draw after the particle lookup (sim/tools.ts SampleTool calls this with the particle id or -1) */
  private SampleToolDraw(tool: SampleTool, _sim: Simulation, i: number): void {
    if (this.GetColourSelectorVisibility()) {
      const colour = this.view.GetPixelUnderMouse();
      this.SetColourSelectorColour(WithAlpha(colour & 0xFFFFFF, 0xFF));
    } else if (i !== -1) {
      const part = this.sim.parts[i];
      if (tool.shiftBehaviour) {
        const propTool = this.GetToolFromIdentifier('DEFAULT_UI_PROPERTY');
        this.SetActiveTool(0, propTool);
        this.toolWindows?.OpenPropertyWindow(this.GetSimulation(), i);
      } else if (part.type === PT_LIFE) {
        let found = false;
        for (const elementTool of this.GetMenuList()[SC_LIFE].GetToolList()) {
          if (elementTool && ID(elementTool.ToolID) === part.ctype) {
            this.SetActiveTool(0, elementTool);
            found = true;
            break;
          }
        }
        if (!found) this.toolWindows?.OpenGOLWindow(0, part.ctype, part.dcolour & 0xFFFFFF, part.tmp & 0xFFFFFF);
      } else {
        this.SetActiveTool(0, this.GetToolFromIdentifier(sd.elements[part.type].Identifier));
      }
    }
  }

  BuildMenus(): void {
    this.menuList = [];
    for (const section of sd.msections) this.menuList.push(new Menu(section.icon, section.name, section.doshow));
    for (const tool of this.tools) {
      if (!tool) continue;
      if (tool.MenuSection >= 0 && tool.MenuSection < sd.msections.length && tool.MenuVisible)
        this.menuList[tool.MenuSection].AddTool(tool);
    }
    for (const fav of Favorite.Ref().GetFavoritesList()) {
      const tool = this.GetToolFromIdentifier(fav);
      if (tool) this.menuList[SC_FAVORITES].AddTool(tool);
    }
    this.notifyMenuListChanged();
    this.notifyActiveMenuToolListChanged();
    this.notifyActiveToolsChanged();
    this.notifyLastToolChanged();
  }

  GetView(): GameView { return this.view; }
}

/** a GameSave built from the simulation (CreateSnapshot is used by the history) */
export { CreateSnapshot };
