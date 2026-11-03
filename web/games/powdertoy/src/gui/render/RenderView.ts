// gui/render/RenderView.h/.cpp, RenderController.h/.cpp, RenderModel.h/.cpp in one file.
//
// Deviation: RenderView::OnDraw renders through GameView (PauseRendererThread, RenderSimulation, AfterSimDraw).
// Here the same steps of GameView::RenderSimulation are done on the renderer directly (ren.sim = sim; Clear;
// RenderBackground; RenderSimulation; ren.sim = null). The script hooks (BeforeSimDraw / AfterSimDraw of the
// Lua console) and the renderer thread do not exist in the port.
import { Window } from '../interface/Engine.ts';
import { Button } from '../interface/Button.ts';
import { Checkbox } from '../interface/Controls.ts';
import { Fade } from '../interface/Fade.ts';
import { WithAlpha, type Point } from '../interface/Point.ts';
import { TextSize } from '../../graphics/raster.ts';
import {
  IconVelocity, IconPressure, IconPersistant, IconFire, IconBlob, IconHeat, IconBlur, IconBasic, IconGradient,
  IconAltAir, IconLife, IconEffect, IconGlow, IconVort, IconWarp,
} from '../../graphics/icons.ts';
import {
  XRES, YRES, WINDOWW, WINDOWH, MENUSIZE, RENDER_EFFE, RENDER_FIRE, RENDER_GLOW, RENDER_BLUR, RENDER_BLOB,
  RENDER_BASC, RENDER_SPRK, DISPLAY_AIR, DISPLAY_AIRC, DISPLAY_AIRP, DISPLAY_AIRV, DISPLAY_AIRH, DISPLAY_AIRW,
  DISPLAY_WARP, DISPLAY_EFFE, DISPLAY_PERS, COLOUR_HEAT, COLOUR_LIFE, COLOUR_GRAD, COLOUR_BASC,
} from '../../sim/config.ts';
import { Renderer } from '../../graphics/renderer.ts';
import type { RendererSettings } from '../../graphics/renderer.ts';
import type { Simulation } from '../../sim/simulation.ts';

class ModeCheckbox extends Checkbox {
  mode = 0;
}

// ---------------------------------------------------------------------------------------------------------------
// RenderModel

class RenderModel {
  private observers: RenderView[] = [];
  private renderer: Renderer | null = null;
  private rendererSettings: RendererSettings | null = null;
  private sim: Simulation | null = null;

  AddObserver(observer: RenderView): void {
    this.observers.push(observer);
    observer.NotifyRendererChanged(this);
    observer.NotifyRenderChanged(this);
    observer.NotifyDisplayChanged(this);
    observer.NotifyColourChanged(this);
  }
  SetRenderMode(newRenderMode: number): void {
    this.rendererSettings!.renderMode = newRenderMode >>> 0;
    this.notifyRenderChanged();
  }
  GetRenderMode(): number {
    return this.rendererSettings!.renderMode;
  }
  SetDisplayMode(newDisplayMode: number): void {
    this.rendererSettings!.displayMode = newDisplayMode >>> 0;
    this.notifyDisplayChanged();
  }
  GetDisplayMode(): number {
    return this.rendererSettings!.displayMode;
  }
  SetColorMode(newColorMode: number): void {
    this.rendererSettings!.colorMode = newColorMode >>> 0;
    this.notifyColourChanged();
  }
  GetColorMode(): number {
    return this.rendererSettings!.colorMode;
  }
  LoadRenderPreset(presetNum: number): void {
    const preset = Renderer.renderModePresets[presetNum];
    this.SetRenderMode(preset.renderMode);
    this.SetDisplayMode(preset.displayMode);
    this.SetColorMode(preset.colorMode);
    this.rendererSettings!.wantHdispLimitMin = preset.wantHdispLimitMin;
    this.rendererSettings!.wantHdispLimitMax = preset.wantHdispLimitMax;
  }
  SetRenderer(ren: Renderer, newRendererSettings: RendererSettings): void {
    this.renderer = ren;
    this.rendererSettings = newRendererSettings;
    this.notifyRendererChanged();
    this.notifyRenderChanged();
    this.notifyDisplayChanged();
    this.notifyColourChanged();
  }
  SetSimulation(newSim: Simulation): void {
    this.sim = newSim;
    this.notifySimulationChanged();
    this.notifyRenderChanged();
    this.notifyDisplayChanged();
    this.notifyColourChanged();
  }
  GetRenderer(): Renderer | null { return this.renderer; }
  GetRendererSettings(): RendererSettings | null { return this.rendererSettings; }
  GetSimulation(): Simulation | null { return this.sim; }

  private notifyRendererChanged(): void {
    for (const o of this.observers) o.NotifyRendererChanged(this);
  }
  private notifySimulationChanged(): void {
    for (const o of this.observers) o.NotifySimulationChanged(this);
  }
  private notifyRenderChanged(): void {
    for (const o of this.observers) o.NotifyRenderChanged(this);
  }
  private notifyDisplayChanged(): void {
    for (const o of this.observers) o.NotifyDisplayChanged(this);
  }
  private notifyColourChanged(): void {
    for (const o of this.observers) o.NotifyColourChanged(this);
  }
}

// ---------------------------------------------------------------------------------------------------------------
// RenderView

export class RenderView extends Window {
  private c: RenderController | null = null;
  private ren: Renderer | null = null;
  private rendererSettings: RendererSettings | null = null;
  private sim: Simulation | null = null;
  private renderModes: ModeCheckbox[] = [];
  private displayModes: ModeCheckbox[] = [];
  private colourModes: ModeCheckbox[] = [];
  private toolTip = '';
  private toolTipPresence = new Fade(Fade.LinearProfile(120, 60), 0, 0);
  private isToolTipFadingIn = false;
  private line1: number;
  private line2: number;
  private line3: number;
  private line4: number;

  constructor() {
    super({ X: 0, Y: 0 }, { X: XRES, Y: WINDOWH });

    const addPresetButton = (index: number, icon: number, offset: Point, tooltip: string) => {
      const presetButton = new Button({ X: XRES + offset.X, Y: YRES + offset.Y }, { X: 30, Y: 13 }, '', tooltip);
      presetButton.SetIcon(icon);
      presetButton.SetActionCallback({ action: () => { this.c!.LoadRenderPreset(index); } });
      this.AddComponent(presetButton);
    };
    addPresetButton( 1, IconVelocity  , { X:  -37, Y:  6 }, 'Velocity display mode preset');
    addPresetButton( 2, IconPressure  , { X:  -37, Y: 24 }, 'Pressure display mode preset');
    addPresetButton( 3, IconPersistant, { X:  -76, Y:  6 }, 'Persistent display mode preset');
    addPresetButton( 4, IconFire      , { X:  -76, Y: 24 }, 'Fire display mode preset');
    addPresetButton( 5, IconBlob      , { X: -115, Y:  6 }, 'Blob display mode preset');
    addPresetButton( 6, IconHeat      , { X: -115, Y: 24 }, 'Heat display mode preset');
    addPresetButton( 7, IconBlur      , { X: -154, Y:  6 }, 'Fancy display mode preset');
    addPresetButton( 8, IconBasic     , { X: -154, Y: 24 }, 'Nothing display mode preset');
    addPresetButton( 9, IconGradient  , { X: -193, Y:  6 }, 'Heat gradient display mode preset');
    addPresetButton( 0, IconAltAir    , { X: -193, Y: 24 }, 'Alternative Velocity display mode preset');
    addPresetButton(10, IconLife      , { X: -232, Y:  6 }, 'Life display mode preset');

    const addRenderModeCheckbox = (mode: number, icon: number, offset: Point, tooltip: string) => {
      const renderModeCheckbox = new ModeCheckbox({ X: offset.X, Y: YRES + offset.Y }, { X: 30, Y: 16 }, '', tooltip);
      this.renderModes.push(renderModeCheckbox);
      renderModeCheckbox.mode = mode >>> 0;
      renderModeCheckbox.SetIcon(icon);
      renderModeCheckbox.SetActionCallback({ action: () => {
        const renderMode = this.CalculateRenderMode();
        this.c!.SetRenderMode(renderMode);
      } });
      this.AddComponent(renderModeCheckbox);
    };
    addRenderModeCheckbox(RENDER_EFFE, IconEffect, { X:  1, Y:  4 }, 'Adds Special flare effects to some elements');
    addRenderModeCheckbox(RENDER_FIRE, IconFire  , { X:  1, Y: 22 }, 'Fire effect for gasses');
    addRenderModeCheckbox(RENDER_GLOW, IconGlow  , { X: 33, Y:  4 }, 'Glow effect on some elements');
    addRenderModeCheckbox(RENDER_BLUR, IconBlur  , { X: 33, Y: 22 }, 'Blur effect for liquids');
    addRenderModeCheckbox(RENDER_BLOB, IconBlob  , { X: 65, Y:  4 }, 'Makes everything be drawn like a blob');
    addRenderModeCheckbox(RENDER_BASC, IconBasic , { X: 65, Y: 22 }, 'Basic rendering, without this, most things will be invisible');
    addRenderModeCheckbox(RENDER_SPRK, IconEffect, { X: 97, Y:  4 }, 'Glow effect on sparks');

    const addDisplayModeCheckbox = (mode: number, icon: number, offset: Point, tooltip: string) => {
      const displayModeCheckbox = new ModeCheckbox({ X: offset.X, Y: YRES + offset.Y }, { X: 30, Y: 16 }, '', tooltip);
      this.displayModes.push(displayModeCheckbox);
      displayModeCheckbox.mode = mode >>> 0;
      displayModeCheckbox.SetIcon(icon);
      displayModeCheckbox.SetActionCallback({ action: () => {
        let displayMode = this.c!.GetDisplayMode();
        // Air display modes are mutually exclusive
        if (displayModeCheckbox.mode & DISPLAY_AIR) {
          displayMode &= ~DISPLAY_AIR;
        }
        if (displayModeCheckbox.GetChecked()) {
          displayMode |= displayModeCheckbox.mode;
        } else {
          displayMode &= ~displayModeCheckbox.mode;
        }
        this.c!.SetDisplayMode(displayMode >>> 0);
      } });
      this.AddComponent(displayModeCheckbox);
    };
    this.line1 = 130;
    addDisplayModeCheckbox(DISPLAY_AIRC, IconAltAir    , { X: 135, Y:  4 }, 'Displays pressure as red and blue, and velocity as white');
    addDisplayModeCheckbox(DISPLAY_AIRP, IconPressure  , { X: 135, Y: 22 }, 'Displays pressure, red is positive and blue is negative');
    addDisplayModeCheckbox(DISPLAY_AIRV, IconVelocity  , { X: 167, Y:  4 }, 'Displays velocity and positive pressure: up/down adds blue, right/left adds red, still pressure adds green');
    addDisplayModeCheckbox(DISPLAY_AIRH, IconHeat      , { X: 167, Y: 22 }, 'Displays the temperature of the air like heat display does');
    addDisplayModeCheckbox(DISPLAY_AIRW, IconVort      , { X: 199, Y:  4 }, 'Displays vorticity, red is clockwise and blue is anticlockwise');
    this.line2 = 232;
    addDisplayModeCheckbox(DISPLAY_WARP, IconWarp      , { X: 237, Y: 22 }, 'Gravity lensing, Newtonian Gravity bends light with this on');
    addDisplayModeCheckbox(DISPLAY_EFFE, IconEffect    , { X: 237, Y:  4 }, 'Enables moving solids, stickmen guns, and premium(tm) graphics');
    addDisplayModeCheckbox(DISPLAY_PERS, IconPersistant, { X: 269, Y:  4 }, 'Element paths persist on the screen for a while');
    this.line3 = 302;

    const addColourModeCheckbox = (mode: number, icon: number, offset: Point, tooltip: string) => {
      const colourModeCheckbox = new ModeCheckbox({ X: offset.X, Y: YRES + offset.Y }, { X: 30, Y: 16 }, '', tooltip);
      this.colourModes.push(colourModeCheckbox);
      colourModeCheckbox.mode = mode >>> 0;
      colourModeCheckbox.SetIcon(icon);
      colourModeCheckbox.SetActionCallback({ action: () => {
        let colorMode = this.c!.GetColorMode();
        // exception: looks like an independent set of settings but behaves more like an index
        if (colourModeCheckbox.GetChecked()) {
          colorMode = colourModeCheckbox.mode;
        } else {
          colorMode = 0;
        }
        this.c!.SetColorMode(colorMode);
      } });
      this.AddComponent(colourModeCheckbox);
    };
    addColourModeCheckbox(COLOUR_HEAT, IconHeat    , { X: 307, Y:  4 }, 'Displays temperatures of the elements, dark blue is coldest, pink is hottest');
    addColourModeCheckbox(COLOUR_LIFE, IconLife    , { X: 307, Y: 22 }, 'Displays the life value of elements in greyscale gradients');
    addColourModeCheckbox(COLOUR_GRAD, IconGradient, { X: 339, Y: 22 }, 'Changes colors of elements slightly to show heat diffusing through them');
    addColourModeCheckbox(COLOUR_BASC, IconBasic   , { X: 339, Y:  4 }, 'No special effects at all for anything, overrides all other options and deco');
    this.line4 = 372;
  }

  AttachController(c_: RenderController): void { this.c = c_; }

  private CalculateRenderMode(): number {
    let renderMode = 0;
    for (const checkbox of this.renderModes) {
      if (checkbox.GetChecked())
        renderMode |= checkbox.mode;
    }
    return renderMode >>> 0;
  }

  protected override OnMouseDown(x: number, y: number, _button: number): void {
    if (x > XRES || y < YRES)
      this.c!.Exit();
  }

  protected override OnTryExit(_method: number): void {
    this.c!.Exit();
  }

  NotifyRendererChanged(sender: RenderModel): void {
    this.ren = sender.GetRenderer();
    this.rendererSettings = sender.GetRendererSettings();
  }

  NotifySimulationChanged(sender: RenderModel): void {
    this.sim = sender.GetSimulation();
  }

  NotifyRenderChanged(sender: RenderModel): void {
    for (let i = 0; i < this.renderModes.length; i++) {
      //Compares bitmasks at the moment, this means that "Point" is always on when other options that depend on it are, this might confuse some users, TODO: get the full list and compare that?
      const renderMode = this.renderModes[i].mode;
      this.renderModes[i].SetChecked(renderMode === ((sender.GetRenderMode() & renderMode) >>> 0));
    }
  }

  NotifyDisplayChanged(sender: RenderModel): void {
    for (let i = 0; i < this.displayModes.length; i++) {
      const displayMode = this.displayModes[i].mode;
      this.displayModes[i].SetChecked(displayMode === ((sender.GetDisplayMode() & displayMode) >>> 0));
    }
  }

  NotifyColourChanged(sender: RenderModel): void {
    for (let i = 0; i < this.colourModes.length; i++) {
      const colorMode = this.colourModes[i].mode;
      this.colourModes[i].SetChecked(colorMode === sender.GetColorMode());
    }
  }

  protected override OnDraw(): void {
    const g = this.GetGraphics();
    g.DrawFilledRect(0, 0, WINDOWW, WINDOWH, 0x000000);
    const ren = this.ren!, sim = this.sim!;
    ren.ApplySettings(this.rendererSettings!);
    // GameView::RenderSimulation(*sim, true) (see the header)
    ren.sim = sim;
    ren.Clear();
    ren.RenderBackground();
    ren.RenderSimulation();
    ren.sim = null;
    const video = ren.GetVideo();
    const gData = g.Data();
    const gW = g.Size().X;
    for (let y = 0; y < YRES; ++y) {
      gData.set(video.subarray(WINDOWW * y, WINDOWW * y + WINDOWW), gW * y);
    }
    g.DrawLine(0, YRES, XRES - 1, YRES, 0xC8C8C8);
    g.DrawLine(this.line1, YRES, this.line1, WINDOWH, 0xC8C8C8);
    g.DrawLine(this.line2, YRES, this.line2, WINDOWH, 0xC8C8C8);
    g.DrawLine(this.line3, YRES, this.line3, WINDOWH, 0xC8C8C8);
    g.DrawLine(this.line4, YRES, this.line4, WINDOWH, 0xC8C8C8);
    g.DrawLine(XRES, 0, XRES, WINDOWH, 0xFFFFFF);
    const presence = this.toolTipPresence.Int();
    if (presence && this.toolTip.length) {
      const alpha = presence > 51 ? 255 : presence * 5;
      const textPosition = { X: 6, Y: this.Size.Y - MENUSIZE - 12 };
      const textWidth = TextSize(this.toolTip).X;

      g.BlendFilledRect(textPosition.X - 4, textPosition.Y - 4, textWidth + 8, 15, WithAlpha(0x000000, (alpha / 2) | 0));
      g.BlendText(textPosition.X, textPosition.Y, this.toolTip, WithAlpha(0xFFFFFF, alpha));
    }
  }

  protected override OnTick(): void {
    if (this.isToolTipFadingIn) {
      this.isToolTipFadingIn = false;
      this.toolTipPresence.SetTarget(120);
    } else {
      this.toolTipPresence.SetTarget(0);
    }
  }

  protected override OnKeyPress(key: number, _scan: number, repeat: boolean, shift: boolean, _ctrl: boolean, _alt: boolean): void {
    if (repeat)
      return;
    if (shift && key === 0x31 /* '1' */)
      this.c!.LoadRenderPreset(10);
    else if (key >= 0x30 && key <= 0x39) {
      this.c!.LoadRenderPreset(key - 0x30);
    }
  }

  override ToolTip(_senderPosition: Point, toolTip: string): void {
    this.toolTip = toolTip;
    this.isToolTipFadingIn = true;
  }
}

// ---------------------------------------------------------------------------------------------------------------
// RenderController

export class RenderController {
  private renderView: RenderView;
  private renderModel: RenderModel;
  private onDone: (() => void) | null;
  HasExited = false;

  constructor(sim: Simulation, ren: Renderer, rendererSettings: RendererSettings, onDone_: (() => void) | null = null) {
    this.renderView = new RenderView();
    this.renderModel = new RenderModel();

    this.renderModel.SetRenderer(ren, rendererSettings);

    this.renderView.AttachController(this);
    this.renderModel.AddObserver(this.renderView);

    this.renderModel.SetSimulation(sim);

    this.onDone = onDone_;
  }

  GetView(): RenderView { return this.renderView; }

  SetRenderMode(newRenderMode: number): void {
    this.renderModel.SetRenderMode(newRenderMode);
  }
  GetRenderMode(): number {
    return this.renderModel.GetRenderMode();
  }
  SetDisplayMode(newDisplayMode: number): void {
    this.renderModel.SetDisplayMode(newDisplayMode);
  }
  GetDisplayMode(): number {
    return this.renderModel.GetDisplayMode();
  }
  SetColorMode(newColorMode: number): void {
    this.renderModel.SetColorMode(newColorMode);
  }
  GetColorMode(): number {
    return this.renderModel.GetColorMode();
  }
  LoadRenderPreset(presetNum: number): void {
    this.renderModel.LoadRenderPreset(presetNum);
  }

  Exit(): void {
    this.renderView.CloseActiveWindow();
    if (this.onDone)
      this.onDone();
    this.HasExited = true;
  }

  /** ~RenderController */
  Destroy(): void {
    this.renderView.CloseActiveWindow();
  }
}
