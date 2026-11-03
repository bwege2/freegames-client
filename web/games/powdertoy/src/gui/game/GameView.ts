// gui/game/GameView.h / GameView.cpp (with SplitButton), and the brush outline drawing of gui/game/Brush.cpp
// (RenderRect/RenderLine/RenderPoint/RenderFill).
import { Window, Engine, type Component, type FpsLimit, type SimFpsLimit } from '../interface/Engine.ts';
import { Button } from '../interface/Button.ts';
import { Fade } from '../interface/Fade.ts';
import { AlignCentre, AlignLeft, AlignMiddle, style } from '../interface/Appearance.ts';
import { Border, Colour, Point, RGBA, WithAlpha, type Rect } from '../interface/Point.ts';
import {
  SDL_BUTTON_LEFT, SDL_BUTTON_MIDDLE, SDL_BUTTON_RIGHT, SDLK_AC_BACK, SDLK_DELETE, SDLK_DOWN, SDLK_INSERT, SDLK_LEFT,
  SDLK_RIGHT, SDLK_TAB, SDLK_UP, SDL_SCANCODE_B, SDL_SCANCODE_C, SDL_SCANCODE_E, SDL_SCANCODE_EQUALS,
  SDL_SCANCODE_ESCAPE, SDL_SCANCODE_F, SDL_SCANCODE_F1, SDL_SCANCODE_F11, SDL_SCANCODE_F2, SDL_SCANCODE_F3,
  SDL_SCANCODE_F5, SDL_SCANCODE_G, SDL_SCANCODE_GRAVE, SDL_SCANCODE_H, SDL_SCANCODE_I, SDL_SCANCODE_K,
  SDL_SCANCODE_L, SDL_SCANCODE_LEFTBRACKET, SDL_SCANCODE_N, SDL_SCANCODE_P, SDL_SCANCODE_Q, SDL_SCANCODE_R,
  SDL_SCANCODE_RIGHTBRACKET, SDL_SCANCODE_SEMICOLON, SDL_SCANCODE_SPACE, SDL_SCANCODE_U, SDL_SCANCODE_V,
  SDL_SCANCODE_X, SDL_SCANCODE_Y, SDL_SCANCODE_Z,
} from '../interface/Keys.ts';
import { TextSize, type Graphics, type VideoBuffer } from '../../graphics/raster.ts';
import { FONT_H } from '../../graphics/font.ts';
import {
  IconLogin, IconNew, IconOpen, IconPause, IconReload, IconRenderSettings, IconSave, IconSimulationSettings, IconTag,
  IconVoteDown, IconVoteUp,
} from '../../graphics/icons.ts';
import {
  StructProperty_Float, StructProperty_Integer, StructProperty_ParticleType, StructProperty_UInteger,
  type FindingElement, type Renderer, type RendererSettings, type RendererStats,
} from '../../graphics/renderer.ts';
import { SIGN_Save, SIGN_Search, SIGN_Thread } from '../../graphics/sign.ts';
import {
  BARSIZE, CELL, MENUSIZE, REPLACE_MODE, SC_DECO, SC_FAVORITES, SPECIFIC_DELETE, TYP, ID, WINDOWH, WINDOWW, XRES,
  YRES,
} from '../../sim/config.ts';
import {
  PT_BCLN, PT_BIZR, PT_BIZRG, PT_BIZRS, PT_BRAY, PT_C5, PT_CBNW, PT_CLNE, PT_CONV, PT_CRAY, PT_DRAY, PT_DTEC, PT_EMBR,
  PT_ETRD, PT_EXOT, PT_FILT, PT_GLOW, PT_LAVA, PT_LCRY, PT_LDTC, PT_LIFE, PT_LIGH, PT_LITH, PT_LSNS, PT_PBCN,
  PT_PCLN, PT_PHOT, PT_PIPE, PT_PLNT, PT_PPIP, PT_PRTI, PT_PRTO, PT_PSTN, PT_RFGL, PT_RFRG, PT_SEED, PT_SOAP, PT_TRON,
  PT_TSNS, PT_VIBR, PT_VIRS, PT_VSNS, PT_WARP, PT_WIRE,
} from '../../sim/numbers.ts';
import { FIELD_TYPE, PARTICLE_PROPERTIES } from '../../sim/particle.ts';
import { floorDiv } from '../../sim/cpp.ts';
import type { Simulation } from '../../sim/simulation.ts';
import type { Brush } from '../../sim/brush.ts';
import { SimulationSample } from '../../sim/editing.ts';
import type { PropertyTool, Tool } from '../../sim/tools.ts';
import { PLNT_COLOUR, PLNT_DIR, PLNT_LIFE } from '../../elements/PLNT.ts';
import { fmtFixed, RenderTemperature } from '../Format.ts';
import { ConfirmPrompt, ErrorMessage } from '../dialogues/Dialogues.ts';
import { Client, SaveFile as SaveFileCtor } from '../../game/Client.ts';
import { GameSave } from '../../save/gameSave.ts';
import { SaveRenderer } from '../SaveRenderer.ts';
import { Favorite, GetTexture, MenuButton, QuickOption_Toggle, type QuickOption, type Notification } from './Menu.ts';
import { ToolButton } from './ToolButton.ts';
import { IntroText } from './IntroText.ts';
import { DecorationToolGetIcon, type GameModel } from './GameModel.ts';
import { mouseUpDrawEnd, mouseUpNormal, type GameController } from './GameController.ts';
import type { DecorationTool } from '../../sim/tools.ts';

export const DrawPoints = 0, DrawLine = 1, DrawRect = 2, DrawFill = 3;
export const SelectNone = 0, SelectStamp = 1, SelectCopy = 2, SelectCut = 3, PlaceSave = 4;

/** Mat2<int> as [A, B, C, D] */
export type Mat2 = readonly [number, number, number, number];
export const Mat2Identity: Mat2 = [1, 0, 0, 1];
export const Mat2MirrorX: Mat2 = [-1, 0, 0, 1];
export const Mat2MirrorY: Mat2 = [1, 0, 0, -1];
export const Mat2CCW: Mat2 = [0, 1, -1, 0]; // reminder: the Y axis points down
export function Mat2Mul(a: Mat2, m: Mat2): Mat2 {
  return [a[0] * m[0] + a[1] * m[2], a[0] * m[1] + a[1] * m[3], a[2] * m[0] + a[3] * m[2], a[2] * m[1] + a[3] * m[3]];
}

// ---------------------------------------------------------------------------------------------------------------
// Brush.cpp drawing

export function BrushRenderRect(g: Graphics, position1: Point, position2: Point): void {
  let width = position2.X - position1.X;
  let height = position2.Y - position1.Y;
  const p1 = { X: position1.X, Y: position1.Y };
  if (height < 0) {
    p1.Y += height;
    height *= -1;
  }
  if (width < 0) {
    p1.X += width;
    width *= -1;
  }
  g.XorLine(p1.X, p1.Y, p1.X + width, p1.Y);
  if (height > 0) {
    g.XorLine(p1.X, p1.Y + height, p1.X + width, p1.Y + height);
    if (height > 1) {
      g.XorLine(p1.X + width, p1.Y + 1, p1.X + width, p1.Y + height - 1);
      if (width > 0) g.XorLine(p1.X, p1.Y + 1, p1.X, p1.Y + height - 1);
    }
  }
}
export function BrushRenderLine(g: Graphics, position1: Point, position2: Point): void {
  g.XorLine(position1.X, position1.Y, position2.X, position2.Y);
}
export function BrushRenderPoint(brush: Brush, g: Graphics, position: Point): void {
  const radius = brush.GetRadius();
  const outline = brush.outline;
  g.XorImage(outline.data, position.X - radius.X, position.Y - radius.Y, radius.X * 2 + 1, radius.Y * 2 + 1);
}
export function BrushRenderFill(g: Graphics, position: Point): void {
  g.XorLine(position.X - 5, position.Y, position.X - 1, position.Y);
  g.XorLine(position.X + 5, position.Y, position.X + 1, position.Y);
  g.XorLine(position.X, position.Y - 5, position.X, position.Y - 1);
  g.XorLine(position.X, position.Y + 5, position.X, position.Y + 1);
}

// ---------------------------------------------------------------------------------------------------------------
// SplitButton

class SplitButton extends Button {
  private rightDown = false;
  private leftDown = false;
  private showSplit = true;
  private splitPosition: number;
  private toolTip2: string;
  private splitActionCallback: { left?: () => void; right?: () => void } = {};

  constructor(position: Point, size: Point, buttonText: string, toolTip: string, toolTip2: string, split: number) {
    super(position, size, buttonText, toolTip);
    this.splitPosition = split;
    this.toolTip2 = toolTip2;
  }
  SetRightToolTip(tooltip: string): void { this.toolTip2 = tooltip; }
  GetShowSplit(): boolean { return this.showSplit; }
  SetShowSplit(split: boolean): void { this.showSplit = split; }
  SetSplitActionCallback(action: { left?: () => void; right?: () => void }): void { this.splitActionCallback = action; }
  private SetToolTipAt(x: number): void {
    if (x >= this.splitPosition || !this.showSplit) {
      if (this.toolTip2.length > 0 && this.GetParentWindow()) this.GetParentWindow()!.ToolTip(this.Position, this.toolTip2);
    } else if (x < this.splitPosition) {
      if (this.toolTip.length > 0 && this.GetParentWindow()) this.GetParentWindow()!.ToolTip(this.Position, this.toolTip);
    }
  }
  override OnMouseClick(x: number, y: number, button: number): void {
    if (this.isButtonDown) {
      if (this.leftDown) this.DoLeftAction();
      else if (this.rightDown) this.DoRightAction();
    }
    super.OnMouseClick(x, y, button);
  }
  override OnMouseHover(x: number, _y: number): void {
    this.SetToolTipAt(x);
  }
  override OnMouseEnter(x: number, _y: number): void {
    this.isMouseInside = true;
    if (!this.Enabled) return;
    this.SetToolTipAt(x);
  }
  override TextPosition(ButtonText: string): void {
    super.TextPosition(ButtonText);
    this.textPosition.X += 3;
  }
  SetToolTips(newToolTip1: string, newToolTip2: string): void {
    this.toolTip = newToolTip1;
    this.toolTip2 = newToolTip2;
  }
  override OnMouseDown(x: number, y: number, button: number): void {
    super.OnMouseDown(x, y, button);
    if (this.MouseDownInside) {
      this.rightDown = false;
      this.leftDown = false;
      if (x - this.Position.X >= this.splitPosition) this.rightDown = true;
      else if (x - this.Position.X < this.splitPosition) this.leftDown = true;
    }
  }
  DoRightAction(): void {
    if (!this.Enabled) return;
    if (this.splitActionCallback.right) this.splitActionCallback.right();
  }
  DoLeftAction(): void {
    if (!this.Enabled) return;
    if (this.splitActionCallback.left) this.splitActionCallback.left();
  }
  override Draw(screenPos: Point): void {
    super.Draw(screenPos);
    const g = this.GetGraphics();
    this.drawn = true;
    if (this.showSplit) g.DrawLine(screenPos.X + this.splitPosition, screenPos.Y + 1, screenPos.X + this.splitPosition, screenPos.Y + this.Size.Y - 2, 0xB4B4B4);
  }
}

class OptionListener {
  private button: Button;
  constructor(button: Button) { this.button = button; }
  OnValueChanged(option: QuickOption): void {
    switch (option.GetType()) {
      case QuickOption_Toggle:
        this.button.SetTogglable(true);
        this.button.SetToggleState(option.GetToggle());
        break;
      default:
        break;
    }
  }
}

function findingEqual(a: FindingElement | null, b: FindingElement | null): boolean {
  if (!a || !b) return a === b;
  return a.property.Name === b.property.Name && a.property.Type === b.property.Type && a.value === b.value;
}

const filtModes = ['set colour', 'AND', 'OR', 'AND-NOT', 'red shift', 'blue shift', 'no effect', 'XOR', 'NOT', 'old QRTZ scattering', 'variable red shift', 'variable blue shift'];
const directions = ['N', 'NW', 'W', 'SW', 'S', 'SE', 'E', 'NE'];
const plntColours = [['cc', 'cC', 'Cc', 'CC'], ['mm', 'mM', 'Mm', 'MM'], ['yy', 'yY', 'Yy', 'YY']];

export class GameView extends Window {
  private isMouseDown = false;
  private skipDraw = false;
  private zoomEnabled = false;
  private zoomCursorFixed = false;
  private mouseInZoom = false;
  private drawSnap = false;
  private shiftBehaviour = false;
  private ctrlBehaviour = false;
  private altBehaviour = false;
  private showHud = true;
  private showBrush = true;
  private showDebug = false;
  private delayedActiveMenu = -1;
  private wallBrush = false;
  private toolBrush = false;
  private decoBrush = false;
  private toolIndex = 0;
  private currentSaveType = 0;
  private lastMenu = -1;
  private toolTipPresence = new Fade(Fade.LinearProfile(120, 60), 0, 0);
  private toolTip = '';
  private isToolTipFadingIn = false;
  private toolTipPosition: Point = { X: -1, Y: -1 };
  private infoTipPresence = new Fade(Fade.LinearProfile(60, 60), 0, 0);
  private infoTip = '';
  private buttonTipShow = new Fade(Fade.LinearProfile(120, 60), 0, 0);
  private buttonTip = '';
  private isButtonTipFadingIn = false;
  private introText = new Fade(Fade.LinearProfile(60, 60), 0, 2048);
  private introTextMessage = IntroText();
  private doScreenshot = false;
  private currentPoint: Point = { X: 0, Y: 0 };
  private lastPoint: Point = { X: 0, Y: 0 };
  private c!: GameController;
  private ren: Renderer | null = null;
  private rendererSettings: RendererSettings | null = null;
  private wantFrame = false;
  private sim: Simulation | null = null;
  private activeBrush: Brush | null = null;
  private quickOptionButtons: Button[] = [];
  private menuButtons: MenuButton[] = [];
  private toolButtons: ToolButton[] = [];
  private notificationComponents: Component[] = [];
  private logEntries: [string, number][] = [];
  private scrollBar: Button;
  private searchButton: Button;
  private reloadButton: Button;
  private saveSimulationButton: SplitButton;
  private saveSimulationButtonEnabled = false;
  private saveReuploadAllowed = true;
  private downVoteButton: Button;
  private upVoteButton: Button;
  private tagSimulationButton: Button;
  private clearSimButton: Button;
  private loginButton: SplitButton;
  private simulationOptionButton: Button;
  private displayModeButton: Button;
  private pauseButton: Button;
  private colourPicker: Button;
  private colourPresets: ToolButton[] = [];
  private drawMode = DrawPoints;
  private drawPoint1: Point = { X: 0, Y: 0 };
  private drawPoint2: Point = { X: 0, Y: 0 };
  private selectMode = SelectNone;
  private selectPoint1: Point = { X: 0, Y: 0 };
  private selectPoint2: Point = { X: 0, Y: 0 };
  private currentMouse: Point = { X: 0, Y: 0 };
  private mousePosition: Point = { X: 0, Y: 0 };
  private placeSaveThumb: VideoBuffer | null = null;
  private placeSaveTransform: Mat2 = Mat2Identity;
  private placeSaveTranslate: Point = { X: 0, Y: 0 };
  private sample = new SimulationSample();
  private rendererStats: RendererStats = { foundParticles: 0, hdispLimitMin: 0, hdispLimitMax: 0, hdispLimitValid: false };
  private rendererFrame: Uint32Array | null = null;
  private simFpsLimit: SimFpsLimit = { kind: 'explicit', value: 60 };
  /** the browser port's screenshot: index.ts saves the PNG (set by index.ts) */
  screenshotHook: ((pixels: Uint32Array, width: number, height: number) => void) | null = null;

  constructor() {
    super({ X: 0, Y: 0 }, { X: WINDOWW, Y: WINDOWH });
    this.contributesToFps = true;
    let currentX = 1;
    //Set up UI
    this.scrollBar = new Button({ X: 0, Y: YRES + 21 }, { X: XRES, Y: 2 }, '');
    this.scrollBar.Appearance.BorderHover = Colour(200, 200, 200);
    this.scrollBar.Appearance.BorderActive = Colour(200, 200, 200);
    this.scrollBar.Appearance.HorizontalAlign = AlignCentre;
    this.scrollBar.Appearance.VerticalAlign = AlignMiddle;
    this.AddComponent(this.scrollBar);
    // The online save browser is not ported: this button opens the local saves (the original's Ctrl+click)
    this.searchButton = new Button({ X: currentX, Y: this.Size.Y - 16 }, { X: 17, Y: 15 }, '', 'Open a simulation from your hard drive.'); //Open
    this.searchButton.SetIcon(IconOpen);
    currentX += 18;
    this.searchButton.SetTogglable(false);
    this.searchButton.SetActionCallback({ action: () => {
      this.c.OpenLocalBrowse();
    } });
    this.AddComponent(this.searchButton);
    this.reloadButton = new Button({ X: currentX, Y: this.Size.Y - 16 }, { X: 17, Y: 15 }, '', 'Reload the simulation');
    this.reloadButton.SetIcon(IconReload);
    this.reloadButton.Appearance.Margin.Left += 2;
    currentX += 18;
    this.reloadButton.SetActionCallback({ action: () => this.c.ReloadSim(), altAction: () => this.c.OpenSavePreview() });
    this.AddComponent(this.reloadButton);
    this.saveSimulationButton = new SplitButton({ X: currentX, Y: this.Size.Y - 16 }, { X: 150, Y: 15 }, '[untitled simulation]', '', '', 19);
    this.saveSimulationButton.Appearance.HorizontalAlign = AlignLeft;
    this.saveSimulationButton.SetIcon(IconSave);
    currentX += 151;
    // without a signed-in user the original saves locally (Client::Ref().GetAuthUser() is always empty here)
    this.saveSimulationButton.SetSplitActionCallback({
      left: () => this.c.OpenLocalSaveWindow(true),
      right: () => this.c.OpenLocalSaveWindow(false),
    });
    this.SetSaveButtonTooltips();
    this.AddComponent(this.saveSimulationButton);
    this.upVoteButton = new Button({ X: currentX, Y: this.Size.Y - 16 }, { X: 39, Y: 15 }, '', '');
    this.upVoteButton.SetIcon(IconVoteUp);
    this.upVoteButton.Appearance.Margin.Top += 2;
    this.upVoteButton.Appearance.Margin.Left += 2;
    currentX += 38;
    this.AddComponent(this.upVoteButton);
    this.downVoteButton = new Button({ X: currentX, Y: this.Size.Y - 16 }, { X: 15, Y: 15 }, '', '');
    this.downVoteButton.SetIcon(IconVoteDown);
    this.downVoteButton.Appearance.Margin.Bottom += 2;
    this.downVoteButton.Appearance.Margin.Left += 2;
    currentX += 16;
    this.AddComponent(this.downVoteButton);
    this.ResetVoteButtons();
    this.tagSimulationButton = new Button({ X: currentX, Y: this.Size.Y - 16 }, { X: WINDOWW - 402, Y: 15 }, '[no tags set]', 'Add simulation tags');
    this.tagSimulationButton.Appearance.HorizontalAlign = AlignLeft;
    this.tagSimulationButton.SetIcon(IconTag);
    this.tagSimulationButton.SetActionCallback({ action: () => this.c.OpenTags() });
    this.AddComponent(this.tagSimulationButton);
    this.clearSimButton = new Button({ X: this.Size.X - 159, Y: this.Size.Y - 16 }, { X: 17, Y: 15 }, '', 'Erase everything');
    this.clearSimButton.SetIcon(IconNew);
    this.clearSimButton.Appearance.Margin.Left += 2;
    this.clearSimButton.SetActionCallback({ action: () => this.c.ClearSim() });
    this.AddComponent(this.clearSimButton);
    this.loginButton = new SplitButton({ X: this.Size.X - 141, Y: this.Size.Y - 16 }, { X: 92, Y: 15 }, '[sign in]', 'Sign into simulation server', 'Edit Profile', 19);
    this.loginButton.Appearance.HorizontalAlign = AlignLeft;
    this.loginButton.SetIcon(IconLogin);
    this.loginButton.SetSplitActionCallback({ left: () => this.c.OpenLogin(), right: () => this.c.OpenProfile() });
    // signing in is not ported: the button stays, greyed out
    this.loginButton.Enabled = false;
    this.AddComponent(this.loginButton);
    this.simulationOptionButton = new Button({ X: this.Size.X - 48, Y: this.Size.Y - 16 }, { X: 15, Y: 15 }, '', 'Settings');
    this.simulationOptionButton.SetIcon(IconSimulationSettings);
    this.simulationOptionButton.Appearance.Margin.Left += 2;
    this.simulationOptionButton.SetActionCallback({ action: () => this.c.OpenOptions() });
    this.AddComponent(this.simulationOptionButton);
    this.displayModeButton = new Button({ X: this.Size.X - 32, Y: this.Size.Y - 16 }, { X: 15, Y: 15 }, '', 'Renderer options');
    this.displayModeButton.SetIcon(IconRenderSettings);
    this.displayModeButton.Appearance.Margin.Left += 2;
    this.displayModeButton.SetActionCallback({ action: () => this.c.OpenRenderOptions() });
    this.AddComponent(this.displayModeButton);
    this.pauseButton = new Button({ X: this.Size.X - 16, Y: this.Size.Y - 16 }, { X: 15, Y: 15 }, '', 'Pause/Resume the simulation'); //Pause
    this.pauseButton.SetIcon(IconPause);
    this.pauseButton.SetTogglable(true);
    this.pauseButton.SetActionCallback({ action: () => this.c.SetPaused(this.pauseButton.GetToggleState()) });
    this.AddComponent(this.pauseButton);
    const tempButton = new Button({ X: WINDOWW - 16, Y: WINDOWH - 32 }, { X: 15, Y: 15 }, 0xE065, 'Search for elements');
    tempButton.Appearance.Margin = new Border(0, 2, 3, 2);
    tempButton.SetActionCallback({ action: () => this.c.OpenElementSearch() });
    this.AddComponent(tempButton);
    this.colourPicker = new Button({ X: ((XRES / 2) | 0) - 8, Y: YRES + 1 }, { X: 16, Y: 16 }, '', 'Pick Colour');
    this.colourPicker.SetActionCallback({ action: () => this.c.OpenColourPicker() });
  }

  NotifyQuickOptionsChanged(sender: GameModel): void {
    for (const b of this.quickOptionButtons) this.RemoveComponent(b);
    this.quickOptionButtons = [];
    let currentY = 1;
    for (const option of sender.GetQuickOptions()) {
      const tempButton = new Button({ X: WINDOWW - 16, Y: currentY }, { X: 15, Y: 15 }, option.GetIcon(), option.GetDescription());
      tempButton.SetTogglable(true);
      tempButton.SetActionCallback({ action: () => option.Perform() });
      option.AddListener(new OptionListener(tempButton));
      this.AddComponent(tempButton);
      this.quickOptionButtons.push(tempButton);
      currentY += 16;
    }
  }

  NotifyMenuListChanged(sender: GameModel): void {
    let currentY = WINDOWH - 48;
    for (const b of this.menuButtons) this.RemoveComponent(b);
    this.menuButtons = [];
    for (const b of this.toolButtons) this.RemoveComponent(b);
    this.toolButtons = [];
    const menuList = sender.GetMenuList();
    for (let i = menuList.length - 1; i >= 0; i--) {
      if (menuList[i].GetVisible()) {
        const tempString = String.fromCodePoint(menuList[i].GetIcon());
        let description = menuList[i].GetDescription();
        if (i === SC_FAVORITES && !Favorite.Ref().AnyFavorites())
          description += ' (Use ctrl+shift+click to toggle the favorite status of an element)';
        const tempButton = new MenuButton({ X: WINDOWW - 16, Y: currentY }, { X: 15, Y: 15 }, tempString, description);
        tempButton.Appearance.Margin = new Border(0, 2, 3, 2);
        tempButton.menuID = i;
        tempButton.needsClick = i === SC_DECO;
        tempButton.SetTogglable(true);
        const mouseEnterCallback = () => {
          // don't immediately change the active menu, the actual set is done inside GameView::OnMouseMove
          // if we change it here it causes components to be removed, which causes the window to stop sending events
          // and then the previous menusection button never gets sent the OnMouseLeave event and is never unhighlighted
          if (!(tempButton.needsClick || this.c.GetMouseClickRequired()) && !this.GetMouseDown())
            this.SetActiveMenuDelayed(tempButton.menuID);
        };
        const actionCallback = () => {
          if (tempButton.needsClick || this.c.GetMouseClickRequired()) this.c.SetActiveMenu(tempButton.menuID);
          else mouseEnterCallback();
        };
        tempButton.SetActionCallback({ action: actionCallback, altAction: null, mouseEnter: mouseEnterCallback });
        currentY -= 16;
        this.AddComponent(tempButton);
        this.menuButtons.push(tempButton);
      }
    }
  }

  SetSample(sample: SimulationSample): void { this.sample = sample; }
  SetHudEnable(hudState: boolean): void {
    this.showHud = hudState;
    if (!this.showHud) this.introText.Set(0);
  }
  GetHudEnable(): boolean { return this.showHud; }
  SetBrushEnable(brushState: boolean): void { this.showBrush = brushState; }
  GetBrushEnable(): boolean { return this.showBrush; }
  SetDebugHUD(mode: boolean): void {
    this.showDebug = mode;
    if (this.rendererSettings) this.rendererSettings.debugLines = this.showDebug;
  }
  GetDebugHUD(): boolean { return this.showDebug; }
  GetMousePosition(): Point { return this.currentMouse; }
  GetPlacingSave(): boolean { return this.selectMode !== SelectNone; }
  GetPlacingZoom(): boolean { return this.zoomEnabled && !this.zoomCursorFixed; }
  SetActiveMenuDelayed(activeMenu: number): void { this.delayedActiveMenu = activeMenu; }
  CtrlBehaviour(): boolean { return this.ctrlBehaviour; }
  ShiftBehaviour(): boolean { return this.shiftBehaviour; }
  AltBehaviour(): boolean { return this.altBehaviour; }
  GetSelectMode(): number { return this.selectMode; }
  GetMouseDown(): boolean { return this.isMouseDown; }
  GetDrawingLine(): boolean { return this.drawMode === DrawLine && this.isMouseDown && this.selectMode === SelectNone; }
  GetDrawSnap(): boolean { return this.drawSnap; }
  GetLineStartCoords(): Point { return this.drawPoint1; }
  GetLineFinishCoords(): Point { return this.currentMouse; }
  GetCurrentMouse(): Point { return this.currentMouse; }
  AttachController(_c: GameController): void { this.c = _c; }

  NotifyActiveToolsChanged(sender: GameModel): void {
    for (const b of this.toolButtons) {
      const tool = b.tool;
      if (sender.GetActiveTool(0) === tool) b.SetSelectionState(0); // Primary
      else if (sender.GetActiveTool(1) === tool) b.SetSelectionState(1); // Secondary
      else if (sender.GetActiveTool(2) === tool) b.SetSelectionState(2); // Tertiary
      else if (sender.GetActiveTool(3) === tool) b.SetSelectionState(3); // Replace Mode
      else b.SetSelectionState(-1); // Not selected at all
    }
    this.decoBrush = sender.GetActiveTool(0).Identifier.startsWith('DEFAULT_DECOR_');
    const settings = sender.GetRendererSettings();
    if (settings.findingElement) settings.findingElement = this.FindingElementCandidate();
  }
  NotifyLastToolChanged(sender: GameModel): void {
    const last = sender.GetLastTool();
    if (last) {
      this.wallBrush = last.Blocky;
      this.toolBrush = last.Identifier.startsWith('DEFAULT_TOOL_');
    }
  }
  NotifyActiveMenuToolListChanged(sender: GameModel): void {
    for (const b of this.menuButtons) b.SetToggleState(b.menuID === sender.GetActiveMenu());
    for (const b of this.toolButtons) this.RemoveComponent(b);
    this.toolButtons = [];
    const toolList = sender.GetActiveMenuToolList();
    let currentX = 0;
    for (const tool of toolList) {
      let tempTexture = GetTexture(tool, 26, 14);
      //get decotool texture manually, since it changes depending on it's own color
      if (sender.GetActiveMenu() === SC_DECO) tempTexture = DecorationToolGetIcon(tool as DecorationTool, tool.ToolID, 26, 14);
      let tempButton: ToolButton;
      if (tempTexture) tempButton = new ToolButton({ X: currentX, Y: YRES + 1 }, { X: 30, Y: 18 }, '', tool.Identifier, tool.Description);
      else tempButton = new ToolButton({ X: currentX, Y: YRES + 1 }, { X: 30, Y: 18 }, tool.Name, tool.Identifier, tool.Description);
      tempButton.ClipRect = { pos: { X: 1, Y: YRES + 1 }, size: { X: XRES - 1, Y: 18 } };
      currentX -= 31;
      tempButton.tool = tool;
      tempButton.SetActionCallback({ action: () => {
        const tool = tempButton.tool!;
        if (this.ShiftBehaviour() && this.CtrlBehaviour() && !this.AltBehaviour()) {
          if (tempButton.GetSelectionState() === 0) {
            if (Favorite.Ref().IsFavorite(tool.Identifier)) Favorite.Ref().RemoveFavorite(tool.Identifier);
            else Favorite.Ref().AddFavorite(tool.Identifier);
            this.c.RebuildFavoritesMenu();
          } else if (tempButton.GetSelectionState() === 1) {
            const identifier = tool.Identifier;
            if (Favorite.Ref().IsFavorite(identifier)) {
              Favorite.Ref().RemoveFavorite(identifier);
              this.c.RebuildFavoritesMenu();
            } else if (identifier.startsWith('DEFAULT_PT_LIFECUST_')) {
              new ConfirmPrompt('Remove custom GOL type', 'Are you sure you want to remove ' + identifier.slice(20) + '?', { okay: () => {
                this.c.RemoveCustomGol(identifier);
              } });
            }
          }
        } else {
          if (this.CtrlBehaviour() && this.AltBehaviour() && !this.ShiftBehaviour()) {
            if (tool.Identifier.includes('_PT_')) tempButton.SetSelectionState(3);
          }
          if (tempButton.GetSelectionState() >= 0 && tempButton.GetSelectionState() <= 3)
            this.c.SetActiveTool(tempButton.GetSelectionState(), tool);
        }
      } });
      tempButton.Appearance.SetTexture(tempTexture);
      tempButton.Appearance.BackgroundInactive = WithAlpha(tool.Colour, 0xFF);
      if (sender.GetActiveTool(0) === tool) tempButton.SetSelectionState(0); //Primary
      else if (sender.GetActiveTool(1) === tool) tempButton.SetSelectionState(1); //Secondary
      else if (sender.GetActiveTool(2) === tool) tempButton.SetSelectionState(2); //Tertiary
      else if (sender.GetActiveTool(3) === tool) tempButton.SetSelectionState(3); //Replace mode
      tempButton.Appearance.HorizontalAlign = AlignCentre;
      tempButton.Appearance.VerticalAlign = AlignMiddle;
      this.AddComponent(tempButton);
      this.toolButtons.push(tempButton);
    }
    if (sender.GetActiveMenu() !== SC_DECO) this.lastMenu = sender.GetActiveMenu();
    this.updateToolButtonScroll();
  }
  NotifyColourSelectorVisibilityChanged(sender: GameModel): void {
    for (const button of this.colourPresets) {
      this.RemoveComponent(button);
      button.SetParentWindow(null);
    }
    this.RemoveComponent(this.colourPicker);
    this.colourPicker.SetParentWindow(null);
    if (sender.GetColourSelectorVisibility()) {
      for (const button of this.colourPresets) this.AddComponent(button);
      this.AddComponent(this.colourPicker);
      this.c.SetActiveColourPreset(-1);
    }
  }
  NotifyColourPresetsChanged(sender: GameModel): void {
    for (const button of this.colourPresets) this.RemoveComponent(button);
    this.colourPresets = [];
    let currentX = 5;
    const colours = sender.GetColourPresets();
    let i = 0;
    for (const colour of colours) {
      const tempButton = new ToolButton({ X: currentX, Y: YRES + 1 }, { X: 30, Y: 18 }, '', '', 'Decoration Presets.');
      tempButton.Appearance.BackgroundInactive = colour;
      const index = i;
      tempButton.SetActionCallback({ action: () => {
        this.c.SetActiveColourPreset(index);
        this.c.SetColour(tempButton.Appearance.BackgroundInactive);
      } });
      currentX += 31;
      if (sender.GetColourSelectorVisibility()) this.AddComponent(tempButton);
      this.colourPresets.push(tempButton);
      i++;
    }
    this.NotifyColourActivePresetChanged(sender);
  }
  NotifyColourActivePresetChanged(sender: GameModel): void {
    for (let i = 0; i < this.colourPresets.length; i++) {
      if (sender.GetActiveColourPreset() === i) this.colourPresets[i].SetSelectionState(0); //Primary
      else this.colourPresets[i].SetSelectionState(-1);
    }
  }
  NotifyColourSelectorColourChanged(sender: GameModel): void {
    this.colourPicker.Appearance.BackgroundInactive = sender.GetColourSelectorColour();
    this.colourPicker.Appearance.BackgroundHover = sender.GetColourSelectorColour();
    this.NotifyActiveMenuToolListChanged(sender);
  }
  NotifyRendererChanged(sender: GameModel): void {
    this.ren = sender.GetRenderer();
    this.rendererFrame = this.ren.GetVideo();
    this.rendererSettings = sender.GetRendererSettings();
  }
  NotifySimulationChanged(sender: GameModel): void {
    this.sim = sender.GetSimulation();
  }
  NotifyUserChanged(sender: GameModel): void {
    this.loginButton.SetText('[sign in]');
    this.loginButton.SetShowSplit(false);
    this.loginButton.SetRightToolTip('Sign in to simulation server');
    this.saveSimulationButtonEnabled = true;
    this.NotifySaveChanged(sender);
  }
  NotifyPausedChanged(sender: GameModel): void {
    this.pauseButton.SetToggleState(sender.GetPaused());
    this.ApplySimFpsLimit();
  }
  NotifyToolTipChanged(sender: GameModel): void {
    this.toolTip = sender.GetToolTip();
  }
  NotifyInfoTipChanged(sender: GameModel): void {
    this.infoTip = sender.GetInfoTip();
    this.infoTipPresence.Set(120);
  }
  private ResetVoteButtons(): void {
    this.upVoteButton.SetToolTip('Like this save');
    this.downVoteButton.SetToolTip('Dislike this save');
    this.upVoteButton.Appearance.BackgroundPulse = false;
    this.downVoteButton.Appearance.BackgroundPulse = false;
  }
  NotifySaveChanged(sender: GameModel): void {
    this.saveReuploadAllowed = true;
    this.ResetVoteButtons();
    const file = sender.GetSaveFile();
    if (file) {
      if (this.ctrlBehaviour) this.saveSimulationButton.SetShowSplit(true);
      else this.saveSimulationButton.SetShowSplit(false);
      this.saveSimulationButton.SetText(file.GetDisplayName());
      this.reloadButton.Enabled = true;
      this.upVoteButton.Enabled = false;
      this.upVoteButton.Appearance.BackgroundDisabled = Colour(0, 0, 0);
      this.upVoteButton.Appearance.BorderDisabled = Colour(100, 100, 100);
      this.downVoteButton.Enabled = false;
      this.downVoteButton.Appearance.BackgroundDisabled = Colour(0, 0, 0);
      this.downVoteButton.Appearance.BorderDisabled = Colour(100, 100, 100);
      this.tagSimulationButton.Enabled = false;
      this.tagSimulationButton.SetText('[no tags set]');
      this.currentSaveType = 2;
    } else {
      this.saveSimulationButton.SetShowSplit(false);
      this.saveSimulationButton.SetText('[untitled simulation]');
      this.reloadButton.Enabled = false;
      this.upVoteButton.Enabled = false;
      this.upVoteButton.Appearance.BackgroundDisabled = Colour(0, 0, 0);
      this.upVoteButton.Appearance.BorderDisabled = Colour(100, 100, 100);
      this.downVoteButton.Enabled = false;
      this.downVoteButton.Appearance.BackgroundDisabled = Colour(0, 0, 0);
      this.downVoteButton.Appearance.BorderDisabled = Colour(100, 100, 100);
      this.tagSimulationButton.Enabled = false;
      this.tagSimulationButton.SetText('[no tags set]');
      this.currentSaveType = 0;
    }
    this.saveSimulationButton.Enabled = (this.saveSimulationButtonEnabled && this.saveReuploadAllowed) || this.ctrlBehaviour;
    this.SetSaveButtonTooltips();
  }
  NotifyBrushChanged(sender: GameModel): void {
    this.activeBrush = sender.GetBrush();
  }

  /** TakeScreenshot(captureUI, fileType): the browser port hands the pixels to index.ts, which offers a PNG */
  TakeScreenshot(captureUI: number, _fileType: number): string {
    if (!this.screenshotHook) return '';
    if (captureUI) {
      const g = Engine.Ref().g;
      this.screenshotHook(g.Data().slice(), g.Size().X, g.Size().Y);
    } else if (this.rendererFrame) {
      const out = new Uint32Array(XRES * YRES);
      for (let y = 0; y < YRES; y++) out.set(this.rendererFrame.subarray(y * WINDOWW, y * WINDOWW + XRES), y * XRES);
      this.screenshotHook(out, XRES, YRES);
    }
    return 'screenshot';
  }
  Record(_record: boolean): number { return 0; }

  private updateToolButtonScroll(): void {
    if (this.toolButtons.length) {
      const x = this.currentMouse.X;
      const y = this.currentMouse.Y;
      let newInitialX = WINDOWW - 56;
      const totalWidth = (this.toolButtons[0].Size.X + 1) * this.toolButtons.length;
      let scrollSize = Math.trunc(Math.fround(Math.fround(Math.fround(XRES - BARSIZE) / Math.fround(totalWidth)) * Math.fround(XRES - BARSIZE)));
      if (scrollSize > XRES - 1) scrollSize = XRES - 1;
      if (totalWidth > XRES - 15) {
        let mouseX = x;
        if (mouseX > XRES) mouseX = XRES;
        this.scrollBar.Visible = true;
        this.scrollBar.Position.X = Math.trunc(Math.fround(Math.fround(mouseX / XRES) * Math.fround(XRES - scrollSize))) + 1;
        const overflow = Math.fround(totalWidth - (XRES - BARSIZE));
        const mouseLocation = Math.fround(Math.fround(XRES - 3) / Math.fround((XRES - 2) - mouseX)); // mouseLocation adjusted slightly in case you have 200 elements in one menu
        newInitialX += Math.trunc(Math.fround(overflow / mouseLocation));
      } else {
        this.scrollBar.Visible = false;
      }
      this.scrollBar.Size.X = scrollSize - 1;
      const offsetDelta = this.toolButtons[0].Position.X - newInitialX;
      for (const button of this.toolButtons) button.Position.X -= offsetDelta;
      // Ensure that mouseLeave events are make their way to the buttons should they move from underneath the mouse pointer
      if (this.toolButtons[0].Position.Y < y && this.toolButtons[0].Position.Y + this.toolButtons[0].Size.Y > y) {
        for (const button of this.toolButtons) {
          const inside = button.Position.X < x && button.Position.X + button.Size.X > x;
          if (inside && !button.MouseInside) {
            button.MouseInside = true;
            button.OnMouseEnter(x, y);
          }
          if (!inside && button.MouseInside) {
            button.MouseInside = false;
            button.OnMouseLeave(x, y);
          }
        }
      }
    }
  }

  protected override OnMouseMove(x: number, y: number, _dx: number, _dy: number): void {
    const newMouseInZoom = this.c.MouseInZoom({ X: x, Y: y });
    this.mousePosition = this.c.PointTranslate({ X: x, Y: y });
    this.currentMouse = { X: x, Y: y };
    if (this.selectMode !== SelectNone) {
      if (this.selectMode === PlaceSave) this.selectPoint1 = this.c.PointTranslate({ X: x, Y: y });
      if (this.selectPoint1.X !== -1) this.selectPoint2 = this.c.PointTranslate({ X: x, Y: y });
    } else if (this.isMouseDown) {
      if (newMouseInZoom === this.mouseInZoom) {
        if (this.drawMode === DrawPoints) {
          this.currentPoint = this.mousePosition;
          this.c.DrawPoints(this.toolIndex, this.lastPoint, this.currentPoint, true);
          this.lastPoint = this.currentPoint;
          this.skipDraw = true;
        } else if (this.drawMode === DrawFill) {
          this.c.DrawFill(this.toolIndex, this.mousePosition);
          this.skipDraw = true;
        }
      } else if (this.drawMode === DrawPoints || this.drawMode === DrawFill) {
        this.isMouseDown = false;
        this.drawMode = DrawPoints;
        this.c.MouseUp(x, y, 0, mouseUpDrawEnd);
      }
    }
    this.mouseInZoom = newMouseInZoom;
    // set active menu (delayed)
    if (this.delayedActiveMenu !== -1) {
      this.c.SetActiveMenu(this.delayedActiveMenu);
      this.delayedActiveMenu = -1;
    }
    this.updateToolButtonScroll();
  }

  protected override OnMouseDown(x: number, y: number, button: number): void {
    this.currentMouse = { X: x, Y: y };
    if (this.altBehaviour && !this.shiftBehaviour && !this.ctrlBehaviour) button = SDL_BUTTON_MIDDLE;
    if (!(this.zoomEnabled && !this.zoomCursorFixed)) {
      if (this.selectMode !== SelectNone) {
        this.isMouseDown = true;
        if (button === SDL_BUTTON_LEFT && this.selectPoint1.X === -1) {
          this.selectPoint1 = this.c.PointTranslate(this.currentMouse);
          this.selectPoint2 = this.selectPoint1;
        }
        return;
      }
      if (this.currentMouse.X >= 0 && this.currentMouse.X < XRES && this.currentMouse.Y >= 0 && this.currentMouse.Y < YRES) {
        // update tool index, set new "last" tool so GameView can detect certain tools properly
        if (button === SDL_BUTTON_LEFT) this.toolIndex = 0;
        else if (button === SDL_BUTTON_RIGHT) this.toolIndex = 1;
        else if (button === SDL_BUTTON_MIDDLE) this.toolIndex = 2;
        else return;
        const lastTool = this.c.GetActiveTool(this.toolIndex);
        this.c.SetLastTool(lastTool);
        this.decoBrush = lastTool.Identifier.startsWith('DEFAULT_DECOR_');
        this.UpdateDrawMode();
        this.isMouseDown = true;
        this.c.HistorySnapshot();
        if (this.drawMode === DrawRect || this.drawMode === DrawLine) {
          this.drawPoint1 = this.c.PointTranslate(this.currentMouse);
        } else if (this.drawMode === DrawPoints) {
          this.lastPoint = this.currentPoint = this.c.PointTranslate(this.currentMouse);
          this.c.DrawPoints(this.toolIndex, this.lastPoint, this.currentPoint, false);
        } else if (this.drawMode === DrawFill) {
          this.c.DrawFill(this.toolIndex, this.c.PointTranslate(this.currentMouse));
        }
      }
    }
  }

  private PlaceSavePos(): Point {
    const [trQuoX, trRemX] = floorDiv(this.placeSaveTranslate.X, CELL);
    const [trQuoY, trRemY] = floorDiv(this.placeSaveTranslate.Y, CELL);
    const usefulSize = this.placeSaveThumb!.Size();
    let ux = usefulSize.X, uy = usefulSize.Y;
    if (trRemX) ux -= CELL;
    if (trRemY) uy -= CELL;
    const cursorCellX = (((ux - CELL) / 2) | 0) - trQuoX * CELL; // stamp coordinates
    const cursorCellY = (((uy - CELL) / 2) | 0) - trQuoY * CELL;
    const quoX = floorDiv(this.selectPoint2.X - cursorCellX, CELL)[0];
    const quoY = floorDiv(this.selectPoint2.Y - cursorCellY, CELL)[0];
    return { X: quoX, Y: quoY };
  }

  protected override OnMouseUp(x: number, y: number, button: number): void {
    this.currentMouse = { X: x, Y: y };
    if (this.zoomEnabled && !this.zoomCursorFixed) {
      this.zoomCursorFixed = true;
      this.drawMode = DrawPoints;
      this.isMouseDown = false;
    } else if (this.isMouseDown) {
      this.isMouseDown = false;
      if (this.selectMode !== SelectNone) {
        if (button === SDL_BUTTON_LEFT && this.selectPoint1.X !== -1 && this.selectPoint1.Y !== -1 && this.selectPoint2.X !== -1 && this.selectPoint2.Y !== -1) {
          if (this.selectMode === PlaceSave) {
            if (this.placeSaveThumb && y <= WINDOWH - BARSIZE) this.c.PlaceSave(this.PlaceSavePos());
          } else {
            const x2 = Math.max(this.selectPoint1.X, this.selectPoint2.X);
            const y2 = Math.max(this.selectPoint1.Y, this.selectPoint2.Y);
            const x1 = Math.min(this.selectPoint2.X, this.selectPoint1.X);
            const y1 = Math.min(this.selectPoint2.Y, this.selectPoint1.Y);
            if (this.selectMode === SelectCopy) this.c.CopyRegion({ X: x1, Y: y1 }, { X: x2, Y: y2 });
            else if (this.selectMode === SelectCut) this.c.CutRegion({ X: x1, Y: y1 }, { X: x2, Y: y2 });
            else if (this.selectMode === SelectStamp) this.c.StampRegion({ X: x1, Y: y1 }, { X: x2, Y: y2 });
          }
        }
        this.selectMode = SelectNone;
        return;
      }
      let finalDrawPoint2 = this.c.PointTranslate(this.currentMouse);
      if (this.drawMode === DrawRect || this.drawMode === DrawLine) {
        this.drawPoint2 = finalDrawPoint2;
        if (this.drawSnap && this.drawMode === DrawLine) finalDrawPoint2 = this.lineSnapCoords(this.c.PointTranslate(this.drawPoint1), this.drawPoint2);
        if (this.drawSnap && this.drawMode === DrawRect) finalDrawPoint2 = this.rectSnapCoords(this.c.PointTranslate(this.drawPoint1), this.drawPoint2);
        if (this.drawMode === DrawRect) this.c.DrawRect(this.toolIndex, this.c.PointTranslate(this.drawPoint1), finalDrawPoint2);
        if (this.drawMode === DrawLine) this.c.DrawLine(this.toolIndex, this.c.PointTranslate(this.drawPoint1), finalDrawPoint2);
      } else if (this.drawMode === DrawPoints) {
        // draw final line
        this.c.DrawPoints(this.toolIndex, this.lastPoint, finalDrawPoint2, true);
        // plop tool stuff (like STKM)
        this.c.ToolClick(this.toolIndex, finalDrawPoint2);
      } else if (this.drawMode === DrawFill) {
        this.c.DrawFill(this.toolIndex, finalDrawPoint2);
      }
    }
    // this shouldn't happen, but do this just in case
    else if (this.selectMode !== SelectNone && button !== SDL_BUTTON_LEFT) {
      this.selectMode = SelectNone;
    }
    // update the drawing mode for the next line
    // since ctrl/shift state may have changed since we started drawing
    this.UpdateDrawMode();
  }

  override ToolTip(senderPosition: Point, toolTip: string): void {
    // buttom button tooltips
    if (senderPosition.Y > this.Size.Y - 17) {
      if (this.selectMode === PlaceSave || this.selectMode === SelectNone) {
        this.buttonTip = toolTip;
        this.isButtonTipFadingIn = true;
      }
    }
    // quickoption and menu tooltips
    else if (senderPosition.X > this.Size.X - BARSIZE) {
      this.toolTip = toolTip;
      this.toolTipPosition = { X: this.Size.X - 27 - (TextSize(toolTip).X - 1), Y: senderPosition.Y + 3 };
      if (this.toolTipPosition.Y + 10 > this.Size.Y - MENUSIZE)
        this.toolTipPosition = { X: this.Size.X - 27 - (TextSize(toolTip).X - 1), Y: this.Size.Y - MENUSIZE - 10 };
      this.isToolTipFadingIn = true;
    }
    // element tooltips
    else {
      this.toolTip = toolTip;
      this.toolTipPosition = { X: this.Size.X - 27 - (TextSize(toolTip).X - 1), Y: this.Size.Y - MENUSIZE - 10 };
      this.isToolTipFadingIn = true;
    }
  }

  protected override OnMouseWheel(_x: number, _y: number, d: number): void {
    if (!d) return;
    if (this.selectMode !== SelectNone) return;
    if (this.zoomEnabled && !this.zoomCursorFixed) this.c.AdjustZoomSize(d);
    else this.c.AdjustBrushSize(d, false, this.ctrlBehaviour, this.shiftBehaviour);
  }

  BeginStampSelection(): void {
    this.selectMode = SelectStamp;
    this.selectPoint1 = this.selectPoint2 = { X: -1, Y: -1 };
    this.isMouseDown = false;
    this.buttonTip = '\x0F\xEF\xEF\x10Click-and-drag to specify an area to create a stamp (right click = cancel)';
    this.buttonTipShow.Set(120);
  }

  protected override OnKeyPress(key: number, scan: number, repeat: boolean, shift: boolean, ctrl: boolean, alt: boolean): void {
    if (this.introText.GetValue() > 50) this.introText.Set(50);
    if (this.selectMode !== SelectNone) {
      if (this.selectMode === PlaceSave) {
        switch (key) {
          case SDLK_RIGHT: this.TranslateSave({ X: 1, Y: 0 }); return;
          case SDLK_LEFT: this.TranslateSave({ X: -1, Y: 0 }); return;
          case SDLK_UP: this.TranslateSave({ X: 0, Y: -1 }); return;
          case SDLK_DOWN: this.TranslateSave({ X: 0, Y: 1 }); return;
        }
        if (scan === SDL_SCANCODE_R && !repeat) {
          if (ctrl && shift) this.TransformSave(Mat2MirrorY); //Vertical flip
          else if (!ctrl && shift) this.TransformSave(Mat2MirrorX); //Horizontal flip
          else this.TransformSave(Mat2CCW); //Rotate 90deg
          return;
        }
      }
    }
    if (repeat) return;
    let didKeyShortcut = true;
    switch (scan) {
      case SDL_SCANCODE_GRAVE:
        this.c.ShowConsole();
        break;
      case SDL_SCANCODE_SPACE: //Space
        this.c.SetPaused();
        break;
      case SDL_SCANCODE_Z:
        if (this.selectMode !== SelectNone && this.isMouseDown) break;
        if (ctrl && !this.isMouseDown) {
          if (shift) this.c.HistoryForward();
          else this.c.HistoryRestore();
        } else {
          this.isMouseDown = false;
          this.zoomCursorFixed = false;
          this.c.SetZoomEnabled(true);
        }
        break;
      case SDL_SCANCODE_P:
      case SDL_SCANCODE_F2:
        if (ctrl) {
          if (shift) this.c.SetActiveTool(1, 'DEFAULT_UI_PROPERTY');
          else this.c.SetActiveTool(0, 'DEFAULT_UI_PROPERTY');
        } else {
          this.doScreenshot = true;
        }
        break;
      case SDL_SCANCODE_F3:
        this.SetDebugHUD(!this.GetDebugHUD());
        break;
      case SDL_SCANCODE_F5:
        this.c.ReloadSim();
        break;
      case SDL_SCANCODE_R:
        if (ctrl) this.c.ReloadSim();
        break;
      case SDL_SCANCODE_E:
        if (ctrl) this.c.SetEdgeMode(this.c.GetEdgeMode() + 1);
        else this.c.OpenElementSearch();
        break;
      case SDL_SCANCODE_F:
        if (ctrl) {
          const findingElementCandidate = this.FindingElementCandidate();
          if (findingEqual(this.rendererSettings!.findingElement, findingElementCandidate)) this.rendererSettings!.findingElement = null;
          else this.rendererSettings!.findingElement = findingElementCandidate;
        } else {
          this.c.FrameStep();
        }
        break;
      case SDL_SCANCODE_G:
        if (ctrl) this.c.ShowGravityGrid();
        else if (shift) this.c.AdjustGridSize(-1);
        else this.c.AdjustGridSize(1);
        break;
      case SDL_SCANCODE_F1:
        if (!this.introText.Int()) this.introText.Set(8047);
        else this.introText.Set(0);
        break;
      case SDL_SCANCODE_F11:
        // full screen is the website's (the browser keeps F11)
        break;
      case SDL_SCANCODE_H:
        if (ctrl) {
          if (!this.introText.Int()) this.introText.Set(8047);
          else this.introText.Set(0);
        } else {
          this.showHud = !this.showHud;
        }
        break;
      case SDL_SCANCODE_B:
        if (ctrl) {
          this.c.SetDecoration();
        } else if (this.colourPicker.GetParentWindow()) {
          this.c.SetActiveMenu(this.lastMenu);
        } else {
          this.c.SetDecoration(true);
          this.c.SetPaused(true);
          this.c.SetActiveMenu(SC_DECO);
        }
        break;
      case SDL_SCANCODE_Y:
        if (ctrl) this.c.HistoryForward();
        else this.c.SwitchAir();
        break;
      case SDL_SCANCODE_ESCAPE:
      case SDL_SCANCODE_Q:
        Engine.Ref().ConfirmExit();
        break;
      case SDL_SCANCODE_U:
        if (ctrl) this.c.ResetAHeat();
        else this.c.ToggleAHeat();
        break;
      case SDL_SCANCODE_N:
        this.c.ToggleNewtonianGravity();
        break;
      case SDL_SCANCODE_EQUALS:
        if (ctrl) this.c.ResetSpark();
        else this.c.ResetAir();
        break;
      case SDL_SCANCODE_C:
        if (ctrl) {
          this.selectMode = SelectCopy;
          this.selectPoint1 = this.selectPoint2 = { X: -1, Y: -1 };
          this.isMouseDown = false;
          this.buttonTip = '\x0F\xEF\xEF\x10Click-and-drag to specify an area to copy (right click = cancel)';
          this.buttonTipShow.Set(120);
        }
        break;
      case SDL_SCANCODE_X:
        if (ctrl) {
          this.selectMode = SelectCut;
          this.selectPoint1 = this.selectPoint2 = { X: -1, Y: -1 };
          this.isMouseDown = false;
          this.buttonTip = '\x0F\xEF\xEF\x10Click-and-drag to specify an area to copy then cut (right click = cancel)';
          this.buttonTipShow.Set(120);
        }
        break;
      case SDL_SCANCODE_V:
        if (ctrl) {
          if (this.c.LoadClipboard()) {
            this.selectPoint1 = this.selectPoint2 = this.mousePosition;
            this.isMouseDown = false;
          }
        }
        break;
      case SDL_SCANCODE_L: {
        const stampIDs = Client.Ref().GetStamps();
        if (stampIDs.length) {
          const saveFile = Client.Ref().GetStamp(stampIDs[0]);
          if (!saveFile || !saveFile.GetGameSave()) break;
          this.c.LoadStamp(saveFile.TakeGameSave());
          this.selectPoint1 = this.selectPoint2 = this.mousePosition;
          this.isMouseDown = false;
          break;
        }
      }
      // fallthrough
      case SDL_SCANCODE_K:
        this.selectMode = SelectNone;
        this.selectPoint1 = this.selectPoint2 = { X: -1, Y: -1 };
        this.c.OpenStamps();
        break;
      case SDL_SCANCODE_RIGHTBRACKET:
        if (this.zoomEnabled && !this.zoomCursorFixed) this.c.AdjustZoomSize(1, !alt);
        else this.c.AdjustBrushSize(1, !alt, this.ctrlBehaviour, this.shiftBehaviour);
        break;
      case SDL_SCANCODE_LEFTBRACKET:
        if (this.zoomEnabled && !this.zoomCursorFixed) this.c.AdjustZoomSize(-1, !alt);
        else this.c.AdjustBrushSize(-1, !alt, this.ctrlBehaviour, this.shiftBehaviour);
        break;
      case SDL_SCANCODE_I:
        if (ctrl) this.c.Install();
        else this.c.InvertAirSim();
        break;
      case SDL_SCANCODE_SEMICOLON:
        if (ctrl) this.c.SetReplaceModeFlags(this.c.GetReplaceModeFlags() ^ SPECIFIC_DELETE);
        else this.c.SetReplaceModeFlags(this.c.GetReplaceModeFlags() ^ REPLACE_MODE);
        break;
      default:
        didKeyShortcut = false;
    }
    if (!didKeyShortcut) {
      switch (key) {
        case SDLK_AC_BACK:
          Engine.Ref().ConfirmExit();
          break;
        case SDLK_TAB: //Tab
          this.c.ChangeBrush();
          break;
        case SDLK_INSERT:
          if (ctrl) this.c.SetReplaceModeFlags(this.c.GetReplaceModeFlags() ^ SPECIFIC_DELETE);
          else this.c.SetReplaceModeFlags(this.c.GetReplaceModeFlags() ^ REPLACE_MODE);
          break;
        case SDLK_DELETE:
          this.c.SetReplaceModeFlags(this.c.GetReplaceModeFlags() ^ SPECIFIC_DELETE);
          break;
      }
    }
    if (shift && this.showDebug && key === 0x31) this.c.LoadRenderPreset(10);
    else if (shift && key === 0x36) this.c.LoadRenderPreset(11);
    else if (shift && key === 0x30) this.c.LoadRenderPreset(12);
    else if (key >= 0x30 && key <= 0x39) this.c.LoadRenderPreset(key - 0x30);
  }

  protected override OnKeyRelease(_key: number, scan: number, repeat: boolean, _shift: boolean, _ctrl: boolean, alt: boolean): void {
    if (repeat) return;
    if (scan === SDL_SCANCODE_Z) {
      if (!this.zoomCursorFixed && !alt) this.c.SetZoomEnabled(false);
      return;
    }
  }

  protected override OnBlur(): void {
    this.disableAltBehaviour();
    this.disableCtrlBehaviour();
    this.disableShiftBehaviour();
    this.isMouseDown = false;
    this.drawMode = DrawPoints;
    this.c.Blur();
  }

  /** OnFileDrop: a .cps or .stm file dropped onto the page (index.ts reads it) */
  DropFile(filename: string, data: Uint8Array): void {
    if (!(filename.endsWith('.cps') || filename.endsWith('.stm'))) {
      new ErrorMessage('Error loading save', 'Dropped file is not a TPT save file (.cps or .stm format)');
      return;
    }
    let save: GameSave;
    try {
      save = new GameSave(data);
    } catch (e) {
      new ErrorMessage(filename.endsWith('.stm') ? 'Error loading stamp' : 'Error loading save',
        (filename.endsWith('.stm') ? 'Dropped stamp could not be loaded: ' : 'Dropped save file could not be loaded: ') + String((e as Error)?.message ?? e));
      return;
    }
    if (filename.endsWith('.stm')) {
      this.c.LoadStamp(save);
    } else {
      this.c.HistorySnapshot();
      const sf = new SaveFileCtor(filename.replace(/^.*[\\/]/, ''));
      sf.SetGameSave(save);
      this.c.LoadSaveFile(sf);
    }
    // hide the info text if it's not already hidden
    this.SkipIntroText();
  }
  SkipIntroText(): void {
    this.introText.Set(0);
  }

  protected override OnTick(): void {
    if (this.selectMode === PlaceSave && !this.placeSaveThumb) this.selectMode = SelectNone;
    if (this.zoomEnabled && !this.zoomCursorFixed) this.c.SetZoomPosition(this.currentMouse);
    if (this.skipDraw) {
      this.skipDraw = false;
    } else if (this.selectMode === SelectNone && this.isMouseDown) {
      if (this.drawMode === DrawPoints) {
        this.c.DrawPoints(this.toolIndex, this.lastPoint, this.currentPoint, true);
        this.lastPoint = this.currentPoint;
      } else if (this.drawMode === DrawFill) {
        this.c.DrawFill(this.toolIndex, this.c.PointTranslate(this.currentMouse));
      } else if (this.drawMode === DrawLine) {
        let drawPoint2 = this.currentMouse;
        if (this.altBehaviour) drawPoint2 = this.lineSnapCoords(this.c.PointTranslate(this.drawPoint1), this.currentMouse);
        this.c.ToolDrag(this.toolIndex, this.c.PointTranslate(this.drawPoint1), this.c.PointTranslate(drawPoint2));
      }
    }
    const foundSignID = this.c.GetSignAt(this.mousePosition.X, this.mousePosition.Y);
    if (foundSignID !== -1) {
      const str = this.c.GetSignText(foundSignID);
      const si = this.c.GetSignSplit(foundSignID);
      let tooltip = '';
      switch (si[1]) {
        case SIGN_Save: tooltip = 'Go to save ID:' + str.slice(3, si[0]); break;
        case SIGN_Thread: tooltip = 'Open forum thread ' + str.slice(3, si[0]) + ' in browser'; break;
        case SIGN_Search: tooltip = 'Search for ' + str.slice(3, si[0]); break;
        default: break;
      }
      if (tooltip.length) this.ToolTip({ X: 0, Y: this.Size.Y }, tooltip);
    }
    if (this.isButtonTipFadingIn || (this.selectMode !== PlaceSave && this.selectMode !== SelectNone)) {
      this.isButtonTipFadingIn = false;
      this.buttonTipShow.SetTarget(120);
    } else {
      this.buttonTipShow.SetTarget(0);
    }
    if (this.isToolTipFadingIn) {
      this.isToolTipFadingIn = false;
      this.toolTipPresence.SetTarget(120);
    } else {
      this.toolTipPresence.SetTarget(0);
    }
  }

  protected override OnSimTick(): void {
    this.c.Update();
    this.wantFrame = true;
  }

  override DoMouseMove(x: number, y: number, dx: number, dy: number): void {
    if (this.c.MouseMove(x, y, dx, dy)) super.DoMouseMove(x, y, dx, dy);
  }
  override DoMouseDown(x: number, y: number, button: number): void {
    if (this.introText.GetValue() > 50) this.introText.Set(50);
    if (this.c.MouseDown(x, y, button)) super.DoMouseDown(x, y, button);
  }
  override DoMouseUp(x: number, y: number, button: number): void {
    if (this.c.MouseUp(x, y, button, mouseUpNormal)) super.DoMouseUp(x, y, button);
  }
  override DoMouseWheel(x: number, y: number, d: number): void {
    if (this.c.MouseWheel(x, y, d)) super.DoMouseWheel(x, y, d);
  }
  override DoTextInput(text: string): void {
    if (this.c.TextInput(text)) super.DoTextInput(text);
  }
  override DoTextEditing(text: string): void {
    if (this.c.TextEditing(text)) super.DoTextEditing(text);
  }
  override DoKeyPress(key: number, scan: number, repeat: boolean, shift: boolean, ctrl: boolean, alt: boolean): void {
    if (shift && !this.shiftBehaviour) this.enableShiftBehaviour();
    if (ctrl && !this.ctrlBehaviour) this.enableCtrlBehaviour();
    if (alt && !this.altBehaviour) this.enableAltBehaviour();
    if (this.c.KeyPress(key, scan, repeat, shift, ctrl, alt)) super.DoKeyPress(key, scan, repeat, shift, ctrl, alt);
  }
  override DoKeyRelease(key: number, scan: number, repeat: boolean, shift: boolean, ctrl: boolean, alt: boolean): void {
    if (!shift && this.shiftBehaviour) this.disableShiftBehaviour();
    if (!ctrl && this.ctrlBehaviour) this.disableCtrlBehaviour();
    if (!alt && this.altBehaviour) this.disableAltBehaviour();
    if (this.c.KeyRelease(key, scan, repeat, shift, ctrl, alt)) super.DoKeyRelease(key, scan, repeat, shift, ctrl, alt);
  }
  override DoExit(): void {
    super.DoExit();
    this.c.Exit();
  }
  override DoDraw(): void {
    super.DoDraw();
    const fadeout = [255, 195, 145, 103, 69, 42, 23, 10, 3]; // * Gamma-corrected.
    const g = this.GetGraphics();
    for (let x = 0; x < fadeout.length; ++x) {
      g.BlendLine(x, YRES + 1, x, YRES + 18, WithAlpha(0x000000, fadeout[x]));
      g.BlendLine(XRES - x, YRES + 1, XRES - x, YRES + 18, WithAlpha(0x000000, fadeout[x]));
    }
    this.c.Tick();
    {
      const s = g.Size();
      g.SwapClipRect(0, 0, s.X, s.Y); // reset any nonsense cliprect Lua left configured
    }
  }

  NotifyNotificationsChanged(sender: GameModel): void {
    for (const nc of this.notificationComponents) this.RemoveComponent(nc);
    this.notificationComponents = [];
    let currentY = YRES - 23;
    for (const notification of sender.GetNotifications()) {
      const width = TextSize(notification.Message).X + 7;
      let tempButton = new Button({ X: XRES - width - 22, Y: currentY }, { X: width, Y: 15 }, notification.Message);
      tempButton.SetActionCallback({ action: () => notification.Action() });
      tempButton.Appearance.BorderInactive = style.Colour.WarningTitle;
      tempButton.Appearance.TextInactive = style.Colour.WarningTitle;
      tempButton.Appearance.BorderHover = Colour(255, 175, 0);
      tempButton.Appearance.TextHover = Colour(255, 175, 0);
      this.AddComponent(tempButton);
      this.notificationComponents.push(tempButton);
      tempButton = new Button({ X: XRES - 20, Y: currentY }, { X: 15, Y: 15 }, 0xE02A);
      const closeNotification = () => this.c.RemoveNotification(notification as Notification);
      tempButton.SetActionCallback({ action: closeNotification, altAction: closeNotification });
      tempButton.Appearance.Margin.Left -= 1;
      tempButton.Appearance.Margin.Top -= 1;
      tempButton.Appearance.BorderInactive = style.Colour.WarningTitle;
      tempButton.Appearance.TextInactive = style.Colour.WarningTitle;
      tempButton.Appearance.BorderHover = Colour(255, 175, 0);
      tempButton.Appearance.TextHover = Colour(255, 175, 0);
      this.AddComponent(tempButton);
      this.notificationComponents.push(tempButton);
      currentY -= 17;
    }
  }
  NotifyZoomChanged(sender: GameModel): void {
    this.zoomEnabled = sender.GetZoomEnabled();
  }
  NotifyLogChanged(_sender: GameModel, entry: string): void {
    this.logEntries.unshift([entry, 600]);
    if (this.logEntries.length > 20) this.logEntries.pop();
  }
  NotifyPlaceSaveChanged(_sender: GameModel): void {
    this.placeSaveTransform = Mat2Identity;
    this.placeSaveTranslate = { X: 0, Y: 0 };
    this.ApplyTransformPlaceSave();
  }
  private TranslateSave(addToTranslate: Point): void {
    this.placeSaveTranslate = { X: this.placeSaveTranslate.X + addToTranslate.X, Y: this.placeSaveTranslate.Y + addToTranslate.Y };
    this.ApplyTransformPlaceSave();
  }
  private TransformSave(mulToTransform: Mat2): void {
    this.placeSaveTranslate = { X: 0, Y: 0 }; // reset offset
    this.placeSaveTransform = Mat2Mul(mulToTransform, this.placeSaveTransform);
    this.ApplyTransformPlaceSave();
  }
  private ApplyTransformPlaceSave(): void {
    const remX = floorDiv(this.placeSaveTranslate.X, CELL)[1];
    const remY = floorDiv(this.placeSaveTranslate.Y, CELL)[1];
    this.c.TransformPlaceSave(this.placeSaveTransform, { X: remX, Y: remY });
  }
  NotifyTransformedPlaceSaveChanged(sender: GameModel): void {
    const t = sender.GetTransformedPlaceSave();
    if (t) {
      this.placeSaveThumb = SaveRenderer.Ref().Render(t, true, sender.GetRendererSettings());
      this.selectMode = PlaceSave;
      this.selectPoint2 = this.mousePosition;
    } else {
      this.placeSaveThumb = null;
      this.selectMode = SelectNone;
    }
  }

  private enableShiftBehaviour(): void {
    if (!this.shiftBehaviour) {
      this.shiftBehaviour = true;
      if (!this.isMouseDown || this.selectMode !== SelectNone) this.UpdateDrawMode();
      this.UpdateToolStrength();
    }
  }
  private disableShiftBehaviour(): void {
    if (this.shiftBehaviour) {
      this.shiftBehaviour = false;
      if (!this.isMouseDown || this.selectMode !== SelectNone) this.UpdateDrawMode();
      this.UpdateToolStrength();
    }
  }
  private enableAltBehaviour(): void {
    if (!this.altBehaviour) {
      this.altBehaviour = true;
      this.drawSnap = true;
    }
  }
  private disableAltBehaviour(): void {
    if (this.altBehaviour) {
      this.altBehaviour = false;
      this.drawSnap = false;
    }
  }
  private enableCtrlBehaviour(): void {
    if (!this.ctrlBehaviour) {
      this.ctrlBehaviour = true;
      if (!this.isMouseDown || this.selectMode !== SelectNone) this.UpdateDrawMode();
      this.UpdateToolStrength();
      //Show HDD save & load buttons
      this.saveSimulationButton.Appearance.BackgroundInactive = this.saveSimulationButton.Appearance.BackgroundHover = Colour(255, 255, 255);
      this.saveSimulationButton.Appearance.TextInactive = this.saveSimulationButton.Appearance.TextHover = Colour(0, 0, 0);
      this.saveSimulationButton.Enabled = true;
      this.SetSaveButtonTooltips();
      this.searchButton.Appearance.BackgroundInactive = this.searchButton.Appearance.BackgroundHover = Colour(255, 255, 255);
      this.searchButton.Appearance.TextInactive = this.searchButton.Appearance.TextHover = Colour(0, 0, 0);
      this.searchButton.SetToolTip('Open a simulation from your hard drive.');
      if (this.currentSaveType === 2) this.saveSimulationButton.SetShowSplit(true);
    }
  }
  private disableCtrlBehaviour(): void {
    if (this.ctrlBehaviour) {
      this.ctrlBehaviour = false;
      if (!this.isMouseDown || this.selectMode !== SelectNone) this.UpdateDrawMode();
      this.UpdateToolStrength();
      //Hide HDD save & load buttons
      this.saveSimulationButton.Appearance.BackgroundInactive = Colour(0, 0, 0);
      this.saveSimulationButton.Appearance.BackgroundHover = Colour(20, 20, 20);
      this.saveSimulationButton.Appearance.TextInactive = this.saveSimulationButton.Appearance.TextHover = Colour(255, 255, 255);
      this.saveSimulationButton.Enabled = this.saveSimulationButtonEnabled && this.saveReuploadAllowed;
      this.SetSaveButtonTooltips();
      this.searchButton.Appearance.BackgroundInactive = Colour(0, 0, 0);
      this.searchButton.Appearance.BackgroundHover = Colour(20, 20, 20);
      this.searchButton.Appearance.TextInactive = this.searchButton.Appearance.TextHover = Colour(255, 255, 255);
      this.searchButton.SetToolTip('Open a simulation from your hard drive.');
      if (this.currentSaveType === 2) this.saveSimulationButton.SetShowSplit(false);
    }
  }
  private UpdateDrawMode(): void {
    if (this.ctrlBehaviour && this.shiftBehaviour) {
      if (this.toolBrush) this.drawMode = DrawPoints;
      else this.drawMode = DrawFill;
    } else if (this.ctrlBehaviour) {
      this.drawMode = DrawRect;
    } else if (this.shiftBehaviour) {
      this.drawMode = DrawLine;
    } else {
      this.drawMode = DrawPoints;
    }
    // TODO: have tools decide on draw mode
    const last = this.c.GetLastTool();
    if (last && last.Identifier === 'DEFAULT_UI_SAMPLE') this.drawMode = DrawPoints;
  }
  private UpdateToolStrength(): void {
    if (this.shiftBehaviour) this.c.SetToolStrength(10.0);
    else if (this.ctrlBehaviour) this.c.SetToolStrength(0.1);
    else this.c.SetToolStrength(1.0);
  }
  private SetSaveButtonTooltips(): void {
    // Client::Ref().GetAuthUser() is always empty in the port
    this.saveSimulationButton.SetToolTips('Overwrite the open simulation on your hard drive.', 'Save the simulation to your hard drive. Login to save online.');
  }

  private RenderSimulation(sim: Simulation): void {
    const ren = this.ren!;
    ren.sim = sim;
    ren.Clear();
    ren.RenderBackground();
    this.c.BeforeSimDraw();
    ren.RenderSimulation();
    ren.sim = null;
  }

  protected override OnDraw(): void {
    const g = this.GetGraphics();
    const ren = this.ren!;
    if (this.wantFrame) {
      this.wantFrame = false;
      ren.ApplySettings(this.rendererSettings!);
      this.RenderSimulation(this.sim!);
      this.c.AfterSimDraw();
      this.rendererStats = ren.GetStats();
      this.rendererFrame = ren.GetVideo();
      this.xresFrame = null;
    }
    g.Data().set(this.rendererFrame!.subarray(0, WINDOWW * YRES));
    const currentMouse = this.currentMouse;
    const activeBrush = this.activeBrush;
    if (this.showBrush && this.selectMode === SelectNone && (!this.zoomEnabled || this.zoomCursorFixed) && activeBrush &&
      (this.isMouseDown || (currentMouse.X >= 0 && currentMouse.X < XRES && currentMouse.Y >= 0 && currentMouse.Y < YRES))) {
      let finalCurrentMouse = this.c.PointTranslate(currentMouse);
      let initialDrawPoint = this.drawPoint1;
      if (this.wallBrush) {
        finalCurrentMouse = this.c.NormaliseBlockCoord(finalCurrentMouse);
        initialDrawPoint = this.c.NormaliseBlockCoord(initialDrawPoint);
      }
      if (this.drawMode === DrawRect && this.isMouseDown) {
        if (this.drawSnap) finalCurrentMouse = this.rectSnapCoords(this.c.PointTranslate(initialDrawPoint), finalCurrentMouse);
        if (this.wallBrush) {
          finalCurrentMouse = { X: finalCurrentMouse.X, Y: finalCurrentMouse.Y };
          initialDrawPoint = { X: initialDrawPoint.X, Y: initialDrawPoint.Y };
          if (finalCurrentMouse.X > initialDrawPoint.X) finalCurrentMouse.X += CELL - 1;
          else initialDrawPoint.X += CELL - 1;
          if (finalCurrentMouse.Y > initialDrawPoint.Y) finalCurrentMouse.Y += CELL - 1;
          else initialDrawPoint.Y += CELL - 1;
        }
        BrushRenderRect(g, this.c.PointTranslate(initialDrawPoint), finalCurrentMouse);
      } else if (this.drawMode === DrawLine && this.isMouseDown) {
        if (this.drawSnap) finalCurrentMouse = this.lineSnapCoords(this.c.PointTranslate(initialDrawPoint), finalCurrentMouse);
        BrushRenderLine(g, this.c.PointTranslate(initialDrawPoint), finalCurrentMouse);
      } else if (this.drawMode === DrawFill) {
        if (!this.decoBrush) BrushRenderFill(g, finalCurrentMouse);
      }
      if (this.drawMode === DrawPoints || this.drawMode === DrawLine || (this.drawMode === DrawRect && !this.isMouseDown)) {
        if (this.wallBrush) {
          const finalBrushRadius = this.c.NormaliseBlockCoord(activeBrush.GetRadius());
          const tlX = finalCurrentMouse.X - finalBrushRadius.X, tlY = finalCurrentMouse.Y - finalBrushRadius.Y;
          const brX = finalCurrentMouse.X + finalBrushRadius.X + CELL - 1, brY = finalCurrentMouse.Y + finalBrushRadius.Y + CELL - 1;
          g.XorLine(tlX, tlY, brX, tlY);
          g.XorLine(tlX, brY, brX, brY);
          g.XorLine(tlX, tlY + 1, tlX, brY - 1); // offset by 1 so the corners don't get xor'd twice
          g.XorLine(brX, tlY + 1, brX, brY - 1); // offset by 1 so the corners don't get xor'd twice
        } else {
          BrushRenderPoint(activeBrush, g, finalCurrentMouse);
        }
      }
    }
    if (this.selectMode !== SelectNone) {
      if (this.selectMode === PlaceSave) {
        if (this.placeSaveThumb && this.selectPoint2.X !== -1) {
          const p = this.PlaceSavePos();
          const s = this.placeSaveThumb.Size();
          g.BlendImage(this.placeSaveThumb.Data(), 0x80, p.X * CELL, p.Y * CELL, s.X, s.Y);
          g.XorDottedRect(p.X * CELL, p.Y * CELL, s.X, s.Y);
        }
      } else {
        if (this.selectPoint1.X === -1) {
          g.BlendFilledRect(0, 0, XRES, YRES, WithAlpha(0x000000, 100));
        } else {
          let x2 = Math.max(this.selectPoint1.X, this.selectPoint2.X);
          let y2 = Math.max(this.selectPoint1.Y, this.selectPoint2.Y);
          const x1 = Math.min(this.selectPoint2.X, this.selectPoint1.X);
          const y1 = Math.min(this.selectPoint2.Y, this.selectPoint1.Y);
          if (x2 > XRES - 1) x2 = XRES - 1;
          if (y2 > YRES - 1) y2 = YRES - 1;
          g.BlendFilledRect(0, 0, XRES, y1, WithAlpha(0x000000, 100));
          g.BlendFilledRect(0, y2 + 1, XRES, YRES - y2 - 1, WithAlpha(0x000000, 100));
          g.BlendFilledRect(0, y1, x1, (y2 - y1) + 1, WithAlpha(0x000000, 100));
          g.BlendFilledRect(x2 + 1, y1, XRES - x2 - 1, (y2 - y1) + 1, WithAlpha(0x000000, 100));
          g.XorDottedRect(x1, y1, x2 - x1 + 1, y2 - y1 + 1);
        }
      }
    }
    g.RenderZoom();
    if (this.doScreenshot) {
      this.doScreenshot = false;
      this.TakeScreenshot(0, 0);
    }
    if (this.logEntries.length) {
      const startX = 20;
      let startY = YRES - 20;
      for (let i = 0; i < this.logEntries.length; i++) {
        const entry = this.logEntries[i];
        const message = entry[0];
        const alpha = Math.min(entry[1], 255);
        if (alpha <= 0) { //erase this and everything older
          this.logEntries.length = i;
          break;
        }
        startY -= 14;
        g.BlendFilledRect(startX - 3, startY - 3, TextSize(message).X + 5, 14, WithAlpha(0x000000, Math.min(100, alpha)));
        g.BlendText(startX, startY, message, WithAlpha(0xFFFFFF, alpha));
        entry[1] -= 3;
      }
    }
    const introText = this.introText.Int();
    const f2 = (v: number) => fmtFixed(v, 2);
    const scale = this.c.GetTemperatureScale();
    if (this.showHud) {
      //Draw info about simulation under cursor
      let wavelengthGfx = 0;
      let alpha = 255 - introText * 5;
      if (this.toolTipPosition.Y < 120) alpha -= this.toolTipPresence.Int() * 3;
      if (alpha < 0) alpha = 0;
      let sampleInfo = '';
      const sample = this.sample;
      const type = sample.particle.type;
      if (type) {
        const ctype = sample.particle.ctype;
        if (type === PT_PHOT || type === PT_BIZR || type === PT_BIZRG || type === PT_BIZRS || type === PT_FILT || type === PT_BRAY || type === PT_C5)
          wavelengthGfx = (ctype & 0x3FFFFFFF);
        if (this.showDebug) {
          if (type === PT_LAVA && this.c.IsValidElement(ctype)) {
            sampleInfo += 'Molten ' + this.c.ElementResolve(ctype, 0);
          } else if ((type === PT_PIPE || type === PT_PPIP) && this.c.IsValidElement(ctype)) {
            if (ctype === PT_LAVA && this.c.IsValidElement(sample.particle.tmp4))
              sampleInfo += this.c.ElementResolve(type, 0) + ' with molten ' + this.c.ElementResolve(sample.particle.tmp4, -1);
            else
              sampleInfo += this.c.ElementResolve(type, 0) + ' with ' + this.c.ElementResolve(ctype, sample.particle.tmp4);
          } else if (type === PT_LIFE) {
            sampleInfo += this.c.ElementResolve(type, ctype);
          } else if (type === PT_FILT) {
            sampleInfo += this.c.ElementResolve(type, ctype);
            if (sample.particle.tmp >= 0 && sample.particle.tmp <= 11) sampleInfo += ' (' + filtModes[sample.particle.tmp] + ')';
            else sampleInfo += ' (unknown mode)';
          } else if (type === PT_SEED || (type === PT_PLNT && ctype)) {
            sampleInfo += this.c.ElementResolve(type, ctype);
            const water = (ctype >> PLNT_LIFE) & 0xFF;
            const colour = (ctype >> PLNT_COLOUR) & 0x3F;
            const dir = (ctype >> PLNT_DIR) & 7;
            const active = ctype & 1;
            const cyan = (colour >> 4) & 3;
            const magenta = (colour >> 2) & 3;
            const yellow = colour & 3;
            sampleInfo += ' (' + water + ' ' + plntColours[0][cyan] + plntColours[1][magenta] + plntColours[2][yellow] + ' ' + directions[dir] + ' ' + active + ')';
          } else {
            sampleInfo += this.c.ElementResolve(type, ctype);
            if (wavelengthGfx || type === PT_EMBR || type === PT_PRTI || type === PT_PRTO) {
              // Do nothing, ctype is meaningless for these elements
            }
            // Some elements store extra LIFE info in upper bits of ctype, instead of tmp/tmp2
            else if (type === PT_CRAY || type === PT_DRAY || type === PT_CONV || type === PT_LDTC)
              sampleInfo += ' (' + this.c.ElementResolve(TYP(ctype), ID(ctype)) + ')';
            else if (type === PT_CLNE || type === PT_BCLN || type === PT_PCLN || type === PT_PBCN || type === PT_DTEC)
              sampleInfo += ' (' + this.c.ElementResolve(ctype, sample.particle.tmp) + ')';
            else if (this.c.IsValidElement(ctype) && type !== PT_GLOW && type !== PT_WIRE && type !== PT_SOAP && type !== PT_LITH)
              sampleInfo += ' (' + this.c.ElementResolve(ctype, 0) + ')';
            else if (ctype)
              sampleInfo += ' (' + ctype + ')';
          }
          sampleInfo += ', Temp: ' + RenderTemperature(sample.particle.temp, scale, 2);
          sampleInfo += ', Life: ' + sample.particle.life;
          if (sample.particle.type !== PT_RFRG && sample.particle.type !== PT_RFGL && sample.particle.type !== PT_LIFE) {
            if (sample.particle.type === PT_CONV) {
              const elemName = this.c.ElementResolve(TYP(sample.particle.tmp), ID(sample.particle.tmp));
              if (elemName === '') sampleInfo += ', Tmp: ' + sample.particle.tmp;
              else sampleInfo += ', Tmp: ' + elemName;
            } else {
              sampleInfo += ', Tmp: ' + sample.particle.tmp;
            }
          }
          // only elements that use .tmp2 show it in the debug HUD
          if (type === PT_CRAY || type === PT_DRAY || type === PT_EXOT || type === PT_LIGH || type === PT_SOAP || type === PT_TRON ||
            type === PT_VIBR || type === PT_VIRS || type === PT_WARP || type === PT_LCRY || type === PT_CBNW || type === PT_TSNS ||
            type === PT_DTEC || type === PT_LSNS || type === PT_PSTN || type === PT_LDTC || type === PT_VSNS || type === PT_LITH ||
            type === PT_CONV || type === PT_ETRD)
            sampleInfo += ', Tmp2: ' + sample.particle.tmp2;
          sampleInfo += ', Pressure: ' + f2(sample.AirPressure);
        } else {
          sampleInfo += this.c.BasicParticleInfo(sample.particle);
          sampleInfo += ', Temp: ' + RenderTemperature(sample.particle.temp, scale, 2);
          sampleInfo += ', Pressure: ' + f2(sample.AirPressure);
        }
      } else if (sample.WallType) {
        sampleInfo += this.c.WallName(sample.WallType);
        sampleInfo += ', Pressure: ' + f2(sample.AirPressure);
      } else if (sample.isMouseInSim) {
        sampleInfo += 'Empty, Pressure: ' + f2(sample.AirPressure);
      } else {
        sampleInfo += 'Empty';
      }
      const textWidth = TextSize(sampleInfo).X - 1;
      g.BlendFilledRect(XRES - 20 - textWidth, 12, textWidth + 8, 15, WithAlpha(0x000000, Math.trunc(alpha * 0.5)));
      g.BlendText(XRES - 16 - textWidth, 16, sampleInfo, WithAlpha(0xFFFFFF, Math.trunc(alpha * 0.75)));
      if (wavelengthGfx) {
        const h = 3, x = XRES - 19 - textWidth, y = 10;
        g.BlendFilledRect(x, y, 30, h, WithAlpha(0x404040, alpha));
        for (let i = 0; i < 30; i++) {
          if ((wavelengthGfx >> i) & 1) {
            // Need a spread of wavelengths to get a smooth spectrum, 5 bits seems to work reasonably well
            let tmp: number;
            if (i > 2) tmp = 0x1F << (i - 2);
            else tmp = 0x1F >> (2 - i);
            let cg = 0, cb = 0, cr = 0;
            for (let j = 0; j < 12; j++) {
              cr += (tmp >> (j + 18)) & 1;
              cb += (tmp >> j) & 1;
            }
            for (let j = 0; j < 13; j++) cg += (tmp >> (j + 9)) & 1;
            tmp = (624 / (cr + cg + cb + 1)) | 0;
            cr *= tmp;
            cg *= tmp;
            cb *= tmp;
            for (let j = 0; j < h; j++) g.BlendPixel(x + 29 - i, y + j, RGBA(cr > 255 ? 255 : cr, cg > 255 ? 255 : cg, cb > 255 ? 255 : cb, alpha));
          }
        }
      }
      if (this.showDebug) {
        let sampleInfo2 = '';
        if (type) sampleInfo2 += '#' + sample.ParticleID + ', ';
        sampleInfo2 += 'X:' + sample.PositionX + ' Y:' + sample.PositionY;
        const gravtot = Math.fround(Math.abs(sample.GravityVelocityX) + Math.abs(sample.GravityVelocityY));
        if (gravtot) sampleInfo2 += ', GX: ' + f2(sample.GravityVelocityX) + ' GY: ' + f2(sample.GravityVelocityY);
        if (this.c.GetAHeatEnable() && sample.isMouseInSim) sampleInfo2 += ', AHeat: ' + RenderTemperature(sample.AirTemperature, scale, 2);
        const textWidth2 = TextSize(sampleInfo2).X - 1;
        g.BlendFilledRect(XRES - 20 - textWidth2, 27, textWidth2 + 8, 14, WithAlpha(0x000000, Math.trunc(alpha * 0.5)));
        g.BlendText(XRES - 16 - textWidth2, 30, sampleInfo2, WithAlpha(0xFFFFFF, Math.trunc(alpha * 0.75)));
      }
    }
    if (this.showHud && introText < 51) {
      //FPS and some version info
      let fpsInfo = 'FPS: ' + f2(Engine.Ref().GetFps());
      const rs = this.rendererSettings!;
      if (this.showDebug) {
        if (rs.findingElement) fpsInfo += ' Parts: ' + this.rendererStats.foundParticles + '/' + this.sample.NumParts;
        else fpsInfo += ' Parts: ' + this.sample.NumParts;
      }
      if ((rs.wantHdispLimitMin.auto || rs.wantHdispLimitMax.auto) && this.rendererStats.hdispLimitValid) {
        fpsInfo += ' [TEMP L:' + RenderTemperature(this.rendererStats.hdispLimitMin, scale, 2);
        fpsInfo += ' H:' + RenderTemperature(this.rendererStats.hdispLimitMax, scale, 2);
        fpsInfo += ']';
      }
      if (this.c.GetReplaceModeFlags() & REPLACE_MODE) fpsInfo += ' [REPLACE MODE]';
      if (this.c.GetReplaceModeFlags() & SPECIFIC_DELETE) fpsInfo += ' [SPECIFIC DELETE]';
      if (rs.gridSize) fpsInfo += ' [GRID: ' + rs.gridSize + ']';
      if (rs.findingElement) fpsInfo += ' [FIND]';
      const textSize = TextSize(fpsInfo);
      const textWidth = textSize.X - 1;
      const alpha = 255 - introText * 5;
      g.BlendFilledRect(12, 12, textWidth + 8, textSize.Y + 5, WithAlpha(0x000000, Math.trunc(alpha * 0.5)));
      g.BlendText(16, 16, fpsInfo, WithAlpha(0x20D8FF, Math.trunc(alpha * 0.75)));
    }
    //Tooltips
    const infoTipPresence = this.infoTipPresence.Int();
    if (infoTipPresence) {
      const infoTipAlpha = (infoTipPresence > 50 ? 50 : infoTipPresence) * 5;
      g.BlendTextOutline(((XRES - (TextSize(this.infoTip).X - 1)) / 2) | 0, ((YRES / 2) | 0) - 2, this.infoTip, WithAlpha(0xFFFFFF, infoTipAlpha));
    }
    const toolTipPresence = this.toolTipPresence.Int();
    if (toolTipPresence && this.toolTipPosition.X !== -1 && this.toolTipPosition.Y !== -1 && this.toolTip.length) {
      if (this.toolTipPosition.Y === this.Size.Y - MENUSIZE - 10)
        g.BlendTextOutline(this.toolTipPosition.X, this.toolTipPosition.Y, this.toolTip, WithAlpha(0xFFFFFF, toolTipPresence > 51 ? 255 : toolTipPresence * 5));
      else
        g.BlendText(this.toolTipPosition.X, this.toolTipPosition.Y, this.toolTip, WithAlpha(0xFFFFFF, toolTipPresence > 51 ? 255 : toolTipPresence * 5));
    }
    const buttonTipShow = this.buttonTipShow.Int();
    if (buttonTipShow > 0)
      g.BlendText(16, this.Size.Y - MENUSIZE - 24, this.buttonTip, WithAlpha(0xFFFFFF, buttonTipShow > 51 ? 255 : buttonTipShow * 5));
    //Introduction text
    if (introText && this.showHud) {
      g.BlendFilledRect(0, 0, WINDOWW, WINDOWH, WithAlpha(0x000000, introText > 51 ? 102 : introText * 2));
      g.BlendText(16, 16, this.introTextMessage, WithAlpha(0xFFFFFF, introText > 51 ? 255 : introText * 5));
    }
    void FONT_H;
  }

  lineSnapCoords(point1: Point, point2: Point): Point {
    const diffX = point2.X - point1.X, diffY = point2.Y - point1.Y;
    if (Math.abs((diffX / 2) | 0) > Math.abs(diffY)) // vertical
      return { X: point1.X + diffX, Y: point1.Y };
    if (Math.abs(diffX) < Math.abs((diffY / 2) | 0)) // horizontal
      return { X: point1.X, Y: point1.Y + diffY };
    if (diffX * diffY > 0) // NW-SE
      return { X: point1.X + (((diffX + diffY) / 2) | 0), Y: point1.Y + (((diffX + diffY) / 2) | 0) };
    // SW-NE
    return { X: point1.X + (((diffX - diffY) / 2) | 0), Y: point1.Y + (((diffY - diffX) / 2) | 0) };
  }
  rectSnapCoords(point1: Point, point2: Point): Point {
    const diffX = point2.X - point1.X, diffY = point2.Y - point1.Y;
    if (diffX * diffY > 0) // NW-SE
      return { X: point1.X + (((diffX + diffY) / 2) | 0), Y: point1.Y + (((diffX + diffY) / 2) | 0) };
    // SW-NE
    return { X: point1.X + (((diffX - diffY) / 2) | 0), Y: point1.Y + (((diffY - diffX) / 2) | 0) };
  }

  private FindingElementCandidate(): FindingElement | null {
    const active: Tool = this.c.GetActiveTool(0);
    if (active.Identifier.includes('_PT_')) {
      return { property: { Name: PARTICLE_PROPERTIES[FIELD_TYPE].name, Type: StructProperty_ParticleType }, value: active.ToolID };
    } else if (active.Identifier === 'DEFAULT_UI_PROPERTY') {
      const configuration = (active as PropertyTool).GetConfiguration();
      if (configuration) {
        const prop = PARTICLE_PROPERTIES[configuration.changeProperty.propertyIndex];
        const Type = prop.kind === 'float' ? StructProperty_Float : prop.kind === 'uint' ? StructProperty_UInteger :
          prop.kind === 'type' ? StructProperty_ParticleType : StructProperty_Integer;
        return { property: { Name: prop.name, Type }, value: configuration.changeProperty.value };
      }
    }
    return null;
  }

  GetPixelUnderMouse(): number {
    const point = this.c.PointTranslate(this.currentMouse);
    if (!this.rendererFrame || !(point.X >= 0 && point.Y >= 0 && point.X < WINDOWW && point.Y < YRES)) return 0;
    return this.rendererFrame[point.X + point.Y * WINDOWW];
  }

  private xresFrame: Uint32Array | null = null;
  /** GetRendererFrame() as the XRES-wide frame sim/editing.ts takes (DecorationTool's fill) */
  GetRendererFrameOrNull(): Uint32Array | null {
    if (!this.rendererFrame) return null;
    if (!this.xresFrame) {
      const out = new Uint32Array(XRES * YRES);
      for (let y = 0; y < YRES; y++) out.set(this.rendererFrame.subarray(y * WINDOWW, y * WINDOWW + XRES), y * XRES);
      this.xresFrame = out;
    }
    return this.xresFrame;
  }

  PauseRendererThread(): void {}

  private ApplySimFpsLimit(): void {
    const l = this.simFpsLimit;
    let fl: FpsLimit;
    if (l.kind === 'none') fl = this.c && this.c.GetPaused() ? { kind: 'followDraw' } : { kind: 'none' };
    else fl = { kind: 'explicit', value: l.value };
    this.SetFpsLimit(fl);
  }
  SetSimFpsLimit(newSimFpsLimit: SimFpsLimit): void {
    this.simFpsLimit = newSimFpsLimit;
    this.ApplySimFpsLimit();
  }
  GetSimFpsLimit(): SimFpsLimit { return this.simFpsLimit; }

  /** the Graphics the window draws into (as the model reads the zoom state from it) */
  override GetGraphics(): Graphics {
    return super.GetGraphics();
  }
  /** unused C++ parts kept for reference */
  protected unusedRect(): Rect { return { pos: Point(0, 0), size: Point(0, 0) }; }
}

