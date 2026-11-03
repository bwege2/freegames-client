// gui/options/OptionsView.h/.cpp, OptionsController.h/.cpp, OptionsModel.h/.cpp, plus gui/interface/
// DirectionSelector.h/.cpp (ui::DirectionSelector, here UiDirectionSelector) which only the options use.
//
// Skipped (desktop only, or parts the browser port does not have); the rows below them move up:
// - "Window scale factor for larger screens", "Resizable", "Fullscreen", "Set optimal screen resolution",
//   "Force integer scaling", "Blurry scaling": window handling belongs to the browser page.
// - "Use platform clipboard": the port always offers copies to the browser's clipboard (Keys.ts).
// - "Separate rendering thread": the port has no renderer thread.
// - "Open data folder", "Migrate to shared data directory": no data folder (storage goes to the server).
// - "Fetch the message of the day and notifications", "Fetch them now" and its status line: the port does not
//   talk to the TPT servers (OptionsView::OnTick only updated that status line, so it is gone too).
// - "Save errors and other messages to a file" (redirect stdout).
// - "Credits": the Credits window is not ported.
// Kept as in the desktop build (ALLOW_QUIT): "Fast quit" and "Global quit shortcut" (Engine has both).
import { Window, Engine, Component, DefaultFpsLimit, DefaultDrawLimit, FpsLimitExplicit_minSane,
  FpsLimitExplicit_maxSane, DrawLimitExplicit_minSane, DrawLimitExplicit_maxSane } from '../interface/Engine.ts';
import type { SimFpsLimit, DrawLimit } from '../interface/Engine.ts';
import { Button } from '../interface/Button.ts';
import { Label, Textbox } from '../interface/Label.ts';
import { Checkbox, DropDown, ScrollPanel, Separator } from '../interface/Controls.ts';
import { AlignLeft, AlignCentre, AlignMiddle, style } from '../interface/Appearance.ts';
import { Colour, WithAlpha, NoAlpha, Alpha, type Point } from '../interface/Point.ts';
import { fmtG, fmtFixed, RenderTemperature, StringToTemperature, ToNumberFloat, ToNumberInt } from '../Format.ts';
import { GlobalPrefs } from '../../game/Client.ts';
import { HeatToColour, PressureToColour } from '../../graphics/renderer.ts';
import { f } from '../../sim/cpp.ts';
import {
  AIR_ON, AIR_PRESSUREOFF, AIR_VELOCITYOFF, AIR_OFF, AIR_NOUPDATE, AIRC_NONE, AIRC_LEGACY, AIRC_BOUSSINESQ,
  GRAV_VERTICAL, GRAV_OFF, GRAV_RADIAL, GRAV_CUSTOM, EDGE_VOID, EDGE_SOLID, EDGE_LOOP, TEMPSCALE_KELVIN,
  TEMPSCALE_CELSIUS, TEMPSCALE_FAHRENHEIT, DECOSPACE_SRGB, DECOSPACE_LINEAR, DECOSPACE_GAMMA22, DECOSPACE_GAMMA18,
  MIN_TEMP, MAX_TEMP, R_TEMP, MIN_PRESSURE, MAX_PRESSURE,
} from '../../sim/config.ts';
import type { Simulation } from '../../sim/simulation.ts';
import type { GameModel } from '../game/GameModel.ts';

/** ui::Engine::GraveExitsConsole (the console's setting; read loosely in case Engine does not declare it) */
type EngineWithGrave = Engine & { GraveExitsConsole?: boolean };

// ---------------------------------------------------------------------------------------------------------------
// gui/interface/DirectionSelector

interface DirValue {
  offset: Point;
  xValue: number;
  yValue: number;
}

class UiDirectionSelector extends Component {
  private readonly scale: number;
  private readonly radius: number;
  private readonly handleRadius: number;
  private useSnapPoints = false;
  private snapPointRadius: number;
  private snapPointEffectRadius: number;
  private snapPoints: DirValue[] = [];
  private autoReturn = false;
  private backgroundColor = Colour(0, 0, 0, 63);
  private foregroundColor = Colour(63, 63, 63, 127);
  private borderColor = Colour(255, 255, 255);
  private snapPointColor = Colour(63, 63, 63, 127);
  private updateCallback: ((x: number, y: number) => void) | null = null;
  private changeCallback: ((x: number, y: number) => void) | null = null;
  private mouseDown = false;
  private mouseHover = false;
  private altDown = false;
  private value: DirValue = { offset: { X: 0, Y: 0 }, xValue: 0, yValue: 0 };

  constructor(position: Point, scale: number, radius: number, handleRadius: number, snapPointRadius: number, snapPointEffectRadius: number) {
    super(position, { X: (radius * 5 / 2) | 0, Y: (radius * 5 / 2) | 0 });
    this.scale = f(scale);
    this.radius = radius;
    this.handleRadius = handleRadius;
    this.snapPointRadius = snapPointRadius;
    this.snapPointEffectRadius = snapPointEffectRadius;
  }

  private CheckHovering(x: number, y: number): void {
    this.mouseHover = Math.hypot((this.value.offset.X + this.radius) - x, (this.value.offset.Y + this.radius) - y) < this.handleRadius;
  }
  private GravityValueToValue(x: number, y: number): DirValue {
    return { offset: { X: Math.trunc(f(x / this.scale)), Y: Math.trunc(f(y / this.scale)) }, xValue: x, yValue: y };
  }
  private PositionToValue(position: Point): DirValue {
    position = { X: position.X, Y: position.Y };
    const length = f(Math.hypot(f(position.X), f(position.Y)));
    if (length > this.radius) {
      position.X = Math.trunc(f(f(position.X / length) * this.radius));
      position.Y = Math.trunc(f(f(position.Y / length) * this.radius));
    }
    return { offset: position, xValue: f(position.X * this.scale), yValue: f(position.Y * this.scale) };
  }
  SetSnapPoints(newSnapPointEffectRadius: number, points: number, maxMagnitude: number): void {
    this.snapPointEffectRadius = newSnapPointEffectRadius;
    this.snapPoints = [];
    this.snapPoints.push(this.GravityValueToValue(0, 0));
    for (let i = 1; i < points; i++) {
      const dist = f(f(i / f(points - 1)) * f(maxMagnitude));
      this.snapPoints.push(this.GravityValueToValue(dist, 0));
      this.snapPoints.push(this.GravityValueToValue(0, dist));
      this.snapPoints.push(this.GravityValueToValue(-dist, 0));
      this.snapPoints.push(this.GravityValueToValue(0, -dist));
    }
    this.useSnapPoints = true;
  }
  ClearSnapPoints(): void {
    this.useSnapPoints = false;
    this.snapPoints = [];
  }
  EnableAutoReturn(): void { this.autoReturn = true; }
  DisableAutoReturn(): void { this.autoReturn = false; }
  GetXValue(): number { return this.value.xValue; }
  GetYValue(): number { return this.value.yValue; }
  SetPositionAbs(position: Point): void {
    this.SetPosition({ X: position.X - (this.radius + this.handleRadius), Y: position.Y - (this.radius + this.handleRadius) });
  }
  SetPosition(position: Point): void {
    this.value = this.PositionToValue(position);
    if (this.useSnapPoints && !this.altDown) {
      for (const point of this.snapPoints) {
        if (Math.hypot(point.offset.X - position.X, point.offset.Y - position.Y) <= this.snapPointEffectRadius) {
          this.value = point;
        }
      }
    }
    if (this.updateCallback) {
      this.updateCallback(this.GetXValue(), this.GetYValue());
    }
  }
  SetValues(x: number, y: number): void {
    this.value.xValue = x;
    this.value.yValue = y;
    this.SetPosition(this.GravityValueToValue(x, y).offset);
  }
  SetUpdateCallback(callback: (x: number, y: number) => void): void { this.updateCallback = callback; }
  SetChangeCallback(callback: (x: number, y: number) => void): void { this.changeCallback = callback; }

  override Draw(screenPos: Point): void {
    const g = this.GetGraphics();
    const handleTrackRadius = this.radius + this.handleRadius;
    const center = { X: screenPos.X + handleTrackRadius, Y: screenPos.Y + handleTrackRadius };

    g.BlendFilledEllipse(center.X, center.Y, handleTrackRadius, handleTrackRadius, this.backgroundColor);
    g.BlendEllipse(center.X, center.Y, handleTrackRadius, handleTrackRadius, this.borderColor);

    for (const point of this.snapPoints) {
      // RectBetween(a, b) with both corners inclusive
      const ax = center.X + point.offset.X - this.snapPointRadius, ay = center.Y + point.offset.Y - this.snapPointRadius;
      const bx = center.X + point.offset.X + this.snapPointRadius, by = center.Y + point.offset.Y + this.snapPointRadius;
      g.BlendFilledRect(ax, ay, bx - ax + 1, by - ay + 1,
        WithAlpha(NoAlpha(this.snapPointColor), this.altDown ? Math.trunc(Alpha(this.snapPointColor) / 2) : Alpha(this.snapPointColor)));
    }

    const fa = Alpha(this.foregroundColor);
    g.BlendFilledEllipse(center.X + this.value.offset.X, center.Y + this.value.offset.Y, this.handleRadius, this.handleRadius,
      WithAlpha(NoAlpha(this.foregroundColor), (this.mouseHover || this.mouseDown) ? Math.min(Math.trunc(f(fa * f(1.5))), 255) : fa));
    g.BlendEllipse(center.X + this.value.offset.X, center.Y + this.value.offset.Y, this.handleRadius, this.handleRadius, this.borderColor);
  }
  override OnMouseMoved(x: number, y: number): void {
    if (this.mouseDown) {
      this.SetPositionAbs({ X: x, Y: y });
    }
    this.CheckHovering(x, y);
  }
  override OnMouseDown(x: number, y: number, _button: number): void {
    if (this.MouseDownInside) {
      this.mouseDown = true;
      this.SetPositionAbs({ X: x - this.Position.X, Y: y - this.Position.Y });
      this.CheckHovering(x - this.Position.X, y - this.Position.Y);
    }
  }
  override OnMouseUp(x: number, y: number, _button: number): void {
    this.mouseDown = false;
    if (this.autoReturn) {
      this.SetPosition({ X: 0, Y: 0 });
    }
    this.CheckHovering(x - this.Position.X, y - this.Position.Y);
    if (this.changeCallback) {
      this.changeCallback(this.GetXValue(), this.GetYValue());
    }
  }
  override OnKeyPress(_key: number, _scan: number, _repeat: boolean, _shift: boolean, _ctrl: boolean, alt: boolean): void { this.altDown = alt; }
  override OnKeyRelease(_key: number, _scan: number, _repeat: boolean, _shift: boolean, _ctrl: boolean, alt: boolean): void { this.altDown = alt; }
}

function directionText(x: number, y: number): string {
  // String::Build(Format::Precision(1), "X:", x, " Y:", y, " Total:", std::hypot(x, y))
  return 'X:' + fmtFixed(x, 1) + ' Y:' + fmtFixed(y, 1) + ' Total:' + fmtFixed(f(Math.hypot(x, y)), 1);
}

/** OptionsView.cpp's DirectionSelector window; constructing it shows it */
class DirectionSelector extends Window {
  private done: (x: number, y: number) => void;
  private direction: UiDirectionSelector;
  private labelValues: Label;

  protected override OnTryExit(_method: number): void {
    this.CloseActiveWindow();
    this.SelfDestruct();
  }

  protected override OnDraw(): void {
    const g = this.GetGraphics();
    g.DrawFilledRect(this.Position.X - 1, this.Position.Y - 1, this.Size.X + 2, this.Size.Y + 2, 0x000000);
    g.DrawRect(this.Position.X, this.Position.Y, this.Size.X, this.Size.Y, 0xC8C8C8);
  }

  constructor(position: Point, scale: number, radius: number, x: number, y: number, label: string, newDone: (x: number, y: number) => void) {
    super(position, { X: ((radius * 5 / 2) | 0) + 20, Y: ((radius * 5 / 2) | 0) + 75 });
    this.done = newDone;
    this.direction = new UiDirectionSelector({ X: 10, Y: 32 }, scale, radius, (radius / 4) | 0, 2, 5);

    const tempLabel = new Label({ X: 4, Y: 1 }, { X: this.Size.X - 8, Y: 22 }, label);
    tempLabel.SetTextColour(style.Colour.InformationTitle);
    tempLabel.Appearance.HorizontalAlign = AlignLeft;
    tempLabel.Appearance.VerticalAlign = AlignMiddle;
    this.AddComponent(tempLabel);

    const tempSeparator = new Separator({ X: 0, Y: 22 }, { X: this.Size.X, Y: 1 });
    this.AddComponent(tempSeparator);

    this.labelValues = new Label({ X: 0, Y: ((radius * 5 / 2) | 0) + 37 }, { X: this.Size.X, Y: 16 }, directionText(x, y));
    this.labelValues.Appearance.HorizontalAlign = AlignCentre;
    this.labelValues.Appearance.VerticalAlign = AlignMiddle;
    this.AddComponent(this.labelValues);

    this.direction.SetValues(x, y);
    this.direction.SetUpdateCallback((x: number, y: number) => {
      this.labelValues.SetText(directionText(x, y));
    });
    this.direction.SetSnapPoints(5, 5, 2);
    this.AddComponent(this.direction);

    const okayButton = new Button({ X: 0, Y: this.Size.Y - 17 }, { X: this.Size.X, Y: 17 }, 'OK');
    okayButton.Appearance.HorizontalAlign = AlignCentre;
    okayButton.Appearance.VerticalAlign = AlignMiddle;
    okayButton.Appearance.BorderInactive = Colour(200, 200, 200);
    okayButton.SetActionCallback({ action: () => {
      this.done(this.direction.GetXValue(), this.direction.GetYValue());
      this.CloseActiveWindow();
      this.SelfDestruct();
    } });
    this.AddComponent(okayButton);
    this.SetOkayButton(okayButton);

    this.MakeActiveWindow();
  }
}

const fpsLimitDropdownExact = 0, fpsLimitDropdownUncapped = 1;
const drawLimitDropdownExact = 0, drawLimitDropdownFollowDisplay = 1;

// ---------------------------------------------------------------------------------------------------------------
// OptionsView

export class OptionsView extends Window {
  private c: OptionsController | null = null;
  private heatSimulation: Checkbox;
  private ambientHeatSimulation: Checkbox;
  private newtonianGravity: Checkbox;
  private waterEqualisation: Checkbox;
  private airMode: DropDown;
  private ambientAirTemp!: Textbox;
  private ambientAirTempPreview!: Button;
  private edgePressure!: Textbox;
  private edgePressurePreview!: Button;
  private edgeVelocityChange: Button;
  private vorticityCoeff: Textbox;
  private convectionMode: DropDown;
  private gravityMode: DropDown;
  private edgeMode: DropDown;
  private temperatureScale: DropDown;
  private fpsLimitDropDown!: DropDown;
  private fpsLimitText!: Textbox;
  private drawLimit!: DropDown;
  private drawLimitText!: Textbox;
  private fastquit: Checkbox | null = null;
  private globalQuit: Checkbox | null = null;
  private decoSpace: DropDown;
  private showAvatars: Checkbox;
  private momentumScroll: Checkbox;
  private mouseClickRequired: Checkbox;
  private includePressure: Checkbox;
  private perfectCircle: Checkbox;
  private graveExitsConsole: Checkbox;
  private scrollPanel: ScrollPanel;
  private customGravityX = 0;
  private customGravityY = 0;
  private edgeVelocityX = 0;
  private edgeVelocityY = 0;

  constructor() {
    super({ X: -1, Y: -1 }, { X: 320, Y: 340 });
    const autoWidth = (c: Component, extra: number) => {
      c.Size.X = this.Size.X - c.Position.X - 12 - extra;
    };

    {
      const label = new Label({ X: 4, Y: 1 }, { X: this.Size.X - 8, Y: 22 }, 'Settings');
      label.SetTextColour(style.Colour.InformationTitle);
      label.Appearance.HorizontalAlign = AlignLeft;
      label.Appearance.VerticalAlign = AlignMiddle;
      autoWidth(label, 0);
      this.AddComponent(label);
    }

    const tmpSeparator = new Separator({ X: 0, Y: 22 }, { X: this.Size.X, Y: 1 });
    this.AddComponent(tmpSeparator);

    this.scrollPanel = new ScrollPanel({ X: 1, Y: 23 }, { X: this.Size.X - 2, Y: this.Size.Y - 39 });

    this.AddComponent(this.scrollPanel);
    const scrollPanel = this.scrollPanel;

    let currentY = 8;
    const addLabel = (indent: number, text: string) => {
      const label = new Label({ X: 22 + indent * 15, Y: currentY }, { X: 1, Y: 16 }, '');
      autoWidth(label, 0);
      label.Appearance.HorizontalAlign = AlignLeft;
      label.Appearance.VerticalAlign = AlignMiddle;
      label.SetMultiline(true);
      label.SetText('\bg' + text); // stupid hack because autoWidth just changes Size.X and that doesn't update the text wrapper
      label.AutoHeight();
      scrollPanel.AddChild(label);
      currentY += label.Size.Y - 1;
      return label;
    };
    const addCheckbox = (indent: number, text: string, info: string, action: () => void) => {
      const checkbox = new Checkbox({ X: 8 + indent * 15, Y: currentY }, { X: 1, Y: 16 }, text, '');
      autoWidth(checkbox, 0);
      checkbox.SetActionCallback({ action });
      currentY += 14;
      if (info.length) {
        addLabel(indent, info);
      }
      currentY += 4;
      scrollPanel.AddChild(checkbox);
      return checkbox;
    };
    const addDropDown = (info: string, options: [string, number][], action: () => void) => {
      const dropDown = new DropDown({ X: this.Size.X - 95, Y: currentY }, { X: 80, Y: 16 });
      scrollPanel.AddChild(dropDown);
      for (const option of options) {
        dropDown.AddOption(option);
      }
      dropDown.SetActionCallback({ change: action });
      const label = new Label({ X: 8, Y: currentY }, { X: this.Size.X - 96, Y: 16 }, info);
      label.Appearance.HorizontalAlign = AlignLeft;
      label.Appearance.VerticalAlign = AlignMiddle;
      scrollPanel.AddChild(label);
      autoWidth(label, 85);
      currentY += 20;
      return dropDown;
    };
    const addButtonWithLabel = (buttonText: string, labelText: string, action: () => void) => {
      const button = new Button({ X: 10, Y: currentY }, { X: 90, Y: 16 }, buttonText);
      button.SetActionCallback({ action });
      scrollPanel.AddChild(button);
      const label = addLabel(5, labelText);
      currentY += 13;
      return label;
    };
    const addLimitDropDown = (info: string, options: [string, number][], action: (defocus: boolean) => void): [DropDown, Textbox] => {
      const dropDown = new DropDown({ X: this.Size.X - 155, Y: currentY }, { X: 100, Y: 16 });
      scrollPanel.AddChild(dropDown);
      for (const option of options) {
        dropDown.AddOption(option);
      }
      dropDown.SetActionCallback({ change: () => {
        action(true);
      } });
      const textbox = new Textbox({ X: this.Size.X - 51, Y: currentY }, { X: 36, Y: 16 });
      textbox.SetActionCallback({ change: () => {
        action(false);
      } });
      textbox.SetDefocusCallback({ callback: () => {
        action(true);
      } });
      textbox.SetLimit(4);
      scrollPanel.AddChild(textbox);
      const label = new Label({ X: 8, Y: currentY }, { X: this.Size.X - 96, Y: 16 }, info);
      label.Appearance.HorizontalAlign = AlignLeft;
      label.Appearance.VerticalAlign = AlignMiddle;
      scrollPanel.AddChild(label);
      autoWidth(label, 105);
      currentY += 20;
      return [dropDown, textbox];
    };
    const addSeparator = () => {
      currentY += 6;
      const separator = new Separator({ X: 0, Y: currentY }, { X: this.Size.X, Y: 1 });
      scrollPanel.AddChild(separator);
      currentY += 11;
    };
    const addTextboxWithPreview = (info: string, addPreview: boolean, updateFunc: (value: string, defocus: boolean) => void): [Textbox, Button | null] => {
      const textbox = new Textbox({ X: this.Size.X - 95, Y: currentY }, { X: 80, Y: 16 });
      textbox.SetActionCallback({ change: () => {
        updateFunc(textbox.GetText(), false);
      } });
      textbox.SetDefocusCallback({ callback: () => {
        updateFunc(textbox.GetText(), true);
      } });
      textbox.SetLimit(9);
      scrollPanel.AddChild(textbox);
      let preview: Button | null = null;
      if (addPreview) {
        textbox.Size.X -= 20;
        preview = new Button({ X: this.Size.X - 31, Y: currentY }, { X: 16, Y: 16 }, '', 'Preview');
        scrollPanel.AddChild(preview);
      }
      const label = new Label({ X: 8, Y: currentY }, { X: this.Size.X - 105, Y: 16 }, info);
      label.Appearance.HorizontalAlign = AlignLeft;
      label.Appearance.VerticalAlign = AlignMiddle;
      scrollPanel.AddChild(label);
      currentY += 20;
      return [textbox, preview];
    };

    this.heatSimulation = addCheckbox(0, 'Heat simulation \bgIntroduced in version 34', 'Can cause odd behaviour when disabled', () => {
      this.c!.SetHeatSimulation(this.heatSimulation.GetChecked());
    });
    this.newtonianGravity = addCheckbox(0, 'Newtonian gravity \bgIntroduced in version 48', 'May cause poor performance on older computers', () => {
      this.c!.SetNewtonianGravity(this.newtonianGravity.GetChecked());
    });
    this.ambientHeatSimulation = addCheckbox(0, 'Ambient heat simulation \bgIntroduced in version 50', 'Can cause odd / broken behaviour with many saves', () => {
      this.c!.SetAmbientHeatSimulation(this.ambientHeatSimulation.GetChecked());
    });
    this.waterEqualisation = addCheckbox(0, 'Water equalisation \bgIntroduced in version 61', 'May cause poor performance with a lot of water', () => {
      this.c!.SetWaterEqualisation(this.waterEqualisation.GetChecked());
    });
    this.airMode = addDropDown('Air simulation mode', [
      ['On', AIR_ON],
      ['Pressure off', AIR_PRESSUREOFF],
      ['Velocity off', AIR_VELOCITYOFF],
      ['Off', AIR_OFF],
      ['No update', AIR_NOUPDATE],
    ], () => {
      this.c!.SetAirMode(this.airMode.GetOption()[1]);
    });
    [this.ambientAirTemp, this.ambientAirTempPreview] = addTextboxWithPreview('Ambient air temperature', true, (value, defocus) => {
      this.UpdateAirTemp(value, defocus);
    }) as [Textbox, Button];
    [this.edgePressure, this.edgePressurePreview] = addTextboxWithPreview('Ambient air pressure', true, (value, defocus) => {
      this.UpdateEdgePressure(value, defocus);
    }) as [Textbox, Button];
    {
      this.edgeVelocityChange = new Button({ X: this.Size.X - 95, Y: currentY }, { X: 80, Y: 16 }, 'Change');
      scrollPanel.AddChild(this.edgeVelocityChange);
      this.edgeVelocityChange.SetActionCallback({ action: () => {
        new DirectionSelector({ X: -1, Y: -1 }, f(0.05), 40, this.edgeVelocityX, this.edgeVelocityY, 'Ambient air velocity', (x, y) => {
          this.c!.SetEdgeVelocityX(x);
          this.c!.SetEdgeVelocityY(y);
        });
      } });
      const label = new Label({ X: 8, Y: currentY }, { X: this.Size.X - 96, Y: 16 }, 'Ambient air velocity');
      label.Appearance.HorizontalAlign = AlignLeft;
      label.Appearance.VerticalAlign = AlignMiddle;
      scrollPanel.AddChild(label);
      currentY += 20;
    }
    this.vorticityCoeff = addTextboxWithPreview('Vorticity confinement', false, (value, defocus) => {
      this.UpdateVorticityCoeff(value, defocus);
    })[0];
    this.convectionMode = addDropDown('Air heat convection mode', [
      ['None', AIRC_NONE],
      ['Legacy', AIRC_LEGACY],
      ['Boussinesq', AIRC_BOUSSINESQ],
    ], () => {
      this.c!.SetConvectionMode(this.convectionMode.GetOption()[1]);
    });
    this.gravityMode = addDropDown('Gravity simulation mode', [
      ['Vertical', GRAV_VERTICAL],
      ['Off', GRAV_OFF],
      ['Radial', GRAV_RADIAL],
      ['Custom', GRAV_CUSTOM],
    ], () => {
      this.c!.SetGravityMode(this.gravityMode.GetOption()[1]);
      if (this.gravityMode.GetOption()[1] === 3) {
        new DirectionSelector({ X: -1, Y: -1 }, f(0.05), 40, this.customGravityX, this.customGravityY, 'Custom Gravity', (x, y) => {
          this.c!.SetCustomGravityX(x);
          this.c!.SetCustomGravityY(y);
        });
      }
    });
    this.edgeMode = addDropDown('Edge mode', [
      ['Void', EDGE_VOID],
      ['Solid', EDGE_SOLID],
      ['Loop', EDGE_LOOP],
    ], () => {
      this.c!.SetEdgeMode(this.edgeMode.GetOption()[1]);
    });
    this.temperatureScale = addDropDown('Temperature scale', [
      ['Kelvin', TEMPSCALE_KELVIN],
      ['Celsius', TEMPSCALE_CELSIUS],
      ['Fahrenheit', TEMPSCALE_FAHRENHEIT],
    ], () => {
      this.c!.SetTemperatureScale(this.temperatureScale.GetOption()[1]);
    });
    addSeparator();
    [this.fpsLimitDropDown, this.fpsLimitText] = addLimitDropDown('Simulation framerate cap', [
      ['Exact', fpsLimitDropdownExact],
      ['Uncapped', fpsLimitDropdownUncapped],
    ], (defocus) => {
      this.UpdateFpsLimit(defocus);
    });
    [this.drawLimit, this.drawLimitText] = addLimitDropDown('Rendering framerate cap', [
      ['Exact', drawLimitDropdownExact],
      ['Follow display', drawLimitDropdownFollowDisplay],
    ], (defocus) => {
      this.UpdateDrawLimit(defocus);
    });
    addButtonWithLabel('Reset', ' - Set both limits to sane defaults', () => {
      this.c!.SetFpsLimit(DefaultFpsLimit);
      this.c!.SetDrawLimit(DefaultDrawLimit);
    });
    currentY -= 6;
    addSeparator();
    // (window scale, resizable, fullscreen, optimal resolution, integer scaling, blurry scaling: skipped, see the
    // header; with them gone, the separator that followed them would double the one above, so it is left out)
    {
      // ALLOW_QUIT
      this.fastquit = addCheckbox(0, 'Fast quit', 'Always exit completely when hitting close', () => {
        this.c!.SetFastQuit(this.fastquit!.GetChecked());
      });
      this.globalQuit = addCheckbox(0, 'Global quit shortcut', 'Ctrl+q works everywhere', () => {
        this.c!.SetGlobalQuit(this.globalQuit!.GetChecked());
      });
    }
    this.showAvatars = addCheckbox(0, 'Show avatars', 'Disable if you have a slow connection', () => {
      this.c!.SetShowAvatars(this.showAvatars.GetChecked());
    });
    this.momentumScroll = addCheckbox(0, 'Momentum (old) scrolling', 'Accelerating instead of step scroll', () => {
      this.c!.SetMomentumScroll(this.momentumScroll.GetChecked());
    });
    this.mouseClickRequired = addCheckbox(0, 'Sticky categories', 'Switch between categories by clicking', () => {
      this.c!.SetMouseClickrequired(this.mouseClickRequired.GetChecked());
    });
    this.includePressure = addCheckbox(0, 'Include pressure', 'When saving, copying, stamping, etc.', () => {
      this.c!.SetIncludePressure(this.includePressure.GetChecked());
    });
    this.perfectCircle = addCheckbox(0, 'Perfect circle brush', 'Better circle brush, without incorrect points on edges', () => {
      this.c!.SetPerfectCircle(this.perfectCircle.GetChecked());
    });
    this.graveExitsConsole = addCheckbox(0, 'Key under Esc exits console', 'Disable if that key is 0 on your keyboard', () => {
      this.c!.SetGraveExitsConsole(this.graveExitsConsole.GetChecked());
    });
    // (platform clipboard, separate rendering thread: skipped)
    this.decoSpace = addDropDown('Colour space used by decoration tools', [
      ['sRGB', DECOSPACE_SRGB],
      ['Linear', DECOSPACE_LINEAR],
      ['Gamma 2.2', DECOSPACE_GAMMA22],
      ['Gamma 1.8', DECOSPACE_GAMMA18],
    ], () => {
      this.c!.SetDecoSpace(this.decoSpace.GetOption()[1]);
    });

    currentY += 4;
    // (data folder, startup request, redirect stdout, credits: skipped; the separator before credits is gone too)

    {
      const ok = new Button({ X: 0, Y: this.Size.Y - 16 }, { X: this.Size.X, Y: 16 }, 'OK');
      ok.SetActionCallback({ action: () => {
        this.c!.Exit();
      } });
      this.AddComponent(ok);
      this.SetCancelButton(ok);
      this.SetOkayButton(ok);
    }
    scrollPanel.InnerSize = { X: this.Size.X, Y: currentY };
  }

  private UpdateAmbientAirTempPreview(airTemp: number, isValid: boolean): void {
    const p = this.ambientAirTempPreview;
    if (isValid) {
      p.Appearance.BackgroundInactive = WithAlpha(HeatToColour(airTemp, MIN_TEMP, MAX_TEMP), 0xFF);
      p.SetText('');
    } else {
      p.Appearance.BackgroundInactive = Colour(0, 0, 0);
      p.SetText('?');
    }
    p.Appearance.BackgroundHover = p.Appearance.BackgroundInactive;
  }

  private AmbientAirTempToTextBox(airTemp: number): void {
    this.ambientAirTemp.SetText(RenderTemperature(airTemp, this.temperatureScale.GetOption()[1], 2));
  }

  private UpdateEdgePressurePreview(edgePres: number, isValid: boolean): void {
    const p = this.edgePressurePreview;
    if (isValid) {
      p.Appearance.BackgroundInactive = WithAlpha(PressureToColour(edgePres), 0xFF);
      p.SetText('');
    } else {
      p.Appearance.BackgroundInactive = Colour(0, 0, 0);
      p.SetText('?');
    }
    p.Appearance.BackgroundHover = p.Appearance.BackgroundInactive;
  }

  private EdgePressureToTextBox(edgePres: number): void {
    this.edgePressure.SetText(fmtFixed(edgePres, 2));
  }

  private VorticityCoeffToTextBox(vorticity: number): void {
    this.vorticityCoeff.SetText(fmtFixed(vorticity, 2));
  }

  private UpdateFpsLimit(isDefocus: boolean): void {
    if (this.fpsLimitDropDown.GetOption()[1] === fpsLimitDropdownExact) {
      UpdateSettingFromString(this.fpsLimitText.GetText(), isDefocus, FpsLimitExplicit_minSane, FpsLimitExplicit_maxSane,
        (DefaultFpsLimit as { value: number }).value, (s) => {
          return ToNumberFloat(s);
        }, (value) => {
          this.FpsLimitToInterface({ kind: 'explicit', value });
        }, (value, isValid) => {
          if (isValid) {
            this.c!.SetFpsLimit({ kind: 'explicit', value });
          }
        });
    } else {
      this.fpsLimitText.Enabled = false;
      this.fpsLimitText.SetText('');
      this.c!.SetFpsLimit({ kind: 'none' });
    }
  }

  private FpsLimitToInterface(limit: SimFpsLimit): void {
    if (limit.kind === 'explicit') {
      this.fpsLimitText.Enabled = true;
      this.fpsLimitText.SetText(fmtG(limit.value));
      this.fpsLimitDropDown.SetOption(fpsLimitDropdownExact);
    } else {
      this.fpsLimitText.Enabled = false;
      this.fpsLimitText.SetText('');
      this.fpsLimitDropDown.SetOption(fpsLimitDropdownUncapped);
    }
  }

  private UpdateDrawLimit(isDefocus: boolean): void {
    if (this.drawLimit.GetOption()[1] === drawLimitDropdownExact) {
      UpdateSettingFromString(this.drawLimitText.GetText(), isDefocus, DrawLimitExplicit_minSane, DrawLimitExplicit_maxSane,
        (DefaultDrawLimit as { value: number }).value, (s) => {
          return ToNumberInt(s);
        }, (value) => {
          this.DrawLimitToInterface({ kind: 'explicit', value });
        }, (value, isValid) => {
          if (isValid) {
            this.c!.SetDrawLimit({ kind: 'explicit', value });
          }
        });
    } else {
      this.drawLimitText.Enabled = false;
      this.drawLimitText.SetText('');
      this.c!.SetDrawLimit({ kind: 'display' });
    }
  }

  private DrawLimitToInterface(limit: DrawLimit): void {
    if (limit.kind === 'explicit') {
      this.drawLimitText.Enabled = true;
      this.drawLimitText.SetText(String(limit.value));
      this.drawLimit.SetOption(drawLimitDropdownExact);
    } else {
      this.drawLimitText.Enabled = false;
      this.drawLimitText.SetText('');
      this.drawLimit.SetOption(drawLimitDropdownFollowDisplay);
    }
  }

  private UpdateAirTemp(temp: string, isDefocus: boolean): void {
    UpdateSettingFromString(temp, isDefocus, MIN_TEMP, MAX_TEMP, f(f(R_TEMP) + f(273.15)), (temp) => {
      return StringToTemperature(temp, this.temperatureScale.GetOption()[1]);
    }, (airTemp) => {
      this.AmbientAirTempToTextBox(airTemp);
    }, (airTemp, isValid) => {
      if (isValid) {
        this.c!.SetAmbientAirTemperature(airTemp);
      }
      this.UpdateAmbientAirTempPreview(airTemp, isValid);
    });
  }

  private UpdateEdgePressure(pres: string, isDefocus: boolean): void {
    UpdateSettingFromString(pres, isDefocus, MIN_PRESSURE, MAX_PRESSURE, 0, (pres) => {
      return ToNumberFloat(pres);
    }, (edgePres) => {
      this.EdgePressureToTextBox(edgePres);
    }, (edgePres, isValid) => {
      if (isValid) {
        this.c!.SetEdgePressure(edgePres);
      }
      this.UpdateEdgePressurePreview(edgePres, isValid);
    });
  }

  private UpdateVorticityCoeff(vort: string, isDefocus: boolean): void {
    UpdateSettingFromString(vort, isDefocus, 0, 1, f(0.1), (vort) => {
      return ToNumberFloat(vort);
    }, (vorticity) => {
      this.VorticityCoeffToTextBox(vorticity);
    }, (vorticity, isValid) => {
      if (isValid) {
        this.c!.SetVorticityCoeff(vorticity);
      }
    });
  }

  NotifySettingsChanged(sender: OptionsModel): void {
    this.temperatureScale.SetOption(sender.GetTemperatureScale()); // has to happen before AmbientAirTempToTextBox is called
    this.heatSimulation.SetChecked(sender.GetHeatSimulation());
    this.ambientHeatSimulation.SetChecked(sender.GetAmbientHeatSimulation());
    this.newtonianGravity.SetChecked(sender.GetNewtonianGravity());
    this.waterEqualisation.SetChecked(sender.GetWaterEqualisation());
    this.airMode.SetOption(sender.GetAirMode());
    // Initialize air temp and preview only when the options menu is opened, and not when user is actively editing the textbox
    if (!this.ambientAirTemp.IsFocused()) {
      const airTemp = sender.GetAmbientAirTemperature();
      this.UpdateAmbientAirTempPreview(airTemp, true);
      this.AmbientAirTempToTextBox(airTemp);
    }
    if (!this.edgePressure.IsFocused()) {
      const pres = sender.GetEdgePressure();
      this.UpdateEdgePressurePreview(pres, true);
      this.EdgePressureToTextBox(pres);
    }
    if (!this.fpsLimitText.IsFocused()) {
      this.FpsLimitToInterface(sender.GetFpsLimit());
    }
    if (!this.drawLimitText.IsFocused()) {
      this.DrawLimitToInterface(sender.GetDrawLimit());
    }
    // Same for vorticity
    if (!this.vorticityCoeff.IsFocused()) {
      this.VorticityCoeffToTextBox(sender.GetVorticityCoeff());
    }
    this.convectionMode.SetOption(sender.GetConvectionMode());
    this.edgeVelocityX = sender.GetEdgeVelocityX();
    this.edgeVelocityY = sender.GetEdgeVelocityY();
    this.gravityMode.SetOption(sender.GetGravityMode());
    this.customGravityX = sender.GetCustomGravityX();
    this.customGravityY = sender.GetCustomGravityY();
    this.decoSpace.SetOption(sender.GetDecoSpace());
    this.edgeMode.SetOption(sender.GetEdgeMode());
    if (this.fastquit) {
      this.fastquit.SetChecked(sender.GetFastQuit());
    }
    if (this.globalQuit) {
      this.globalQuit.SetChecked(sender.GetGlobalQuit());
    }
    this.showAvatars.SetChecked(sender.GetShowAvatars());
    this.mouseClickRequired.SetChecked(sender.GetMouseClickRequired());
    this.includePressure.SetChecked(sender.GetIncludePressure());
    this.perfectCircle.SetChecked(sender.GetPerfectCircle());
    this.graveExitsConsole.SetChecked(sender.GetGraveExitsConsole());
    this.momentumScroll.SetChecked(sender.GetMomentumScroll());
  }

  AttachController(c_: OptionsController): void {
    this.c = c_;
  }

  protected override OnDraw(): void {
    const g = this.GetGraphics();
    g.DrawFilledRect(this.Position.X - 1, this.Position.Y - 1, this.Size.X + 2, this.Size.Y + 2, 0x000000);
    g.DrawRect(this.Position.X, this.Position.Y, this.Size.X, this.Size.Y, 0xFFFFFF);
  }

  protected override OnTryExit(_method: number): void {
    this.c!.Exit();
  }
}

function UpdateSettingFromString(pres: string, isDefocus: boolean, minVale: number, maxValue: number, defaultValue: number,
  parse: (s: string) => number, toTextbox: (v: number) => void, apply: (v: number, isValid: boolean) => void): void {
  // Parse value and determine validity
  let value = 0;
  let isValid: boolean;
  try {
    value = parse(pres);
    isValid = true;
  } catch {
    isValid = false;
  }

  // While defocusing, correct out of range values and empty textboxes
  if (isDefocus) {
    if (!pres.length) {
      isValid = true;
      value = defaultValue;
    } else if (!isValid)
      return;
    else if (value < minVale)
      value = minVale;
    else if (value > maxValue)
      value = maxValue;

    toTextbox(value);
  }
  // Out of range values are invalid, preview should go away
  else if (isValid && (value < minVale || value > maxValue))
    isValid = false;

  // If valid, apply
  apply(value, isValid);
}

// ---------------------------------------------------------------------------------------------------------------
// OptionsModel

class OptionsModel {
  private gModel: GameModel;
  private sim: Simulation;
  private observers: OptionsView[] = [];

  constructor(gModel_: GameModel) {
    this.gModel = gModel_;
    this.sim = this.gModel.GetSimulation();
  }

  AddObserver(view: OptionsView): void {
    this.observers.push(view);
    view.NotifySettingsChanged(this);
  }

  GetHeatSimulation(): boolean {
    return this.sim.legacy_enable ? false : true;
  }
  SetHeatSimulation(state: boolean): void {
    this.sim.legacy_enable = state ? 0 : 1;
    this.notifySettingsChanged();
  }
  GetAmbientHeatSimulation(): boolean {
    return this.sim.aheat_enable ? true : false;
  }
  SetAmbientHeatSimulation(state: boolean): void {
    this.sim.aheat_enable = state ? 1 : 0;
    this.notifySettingsChanged();
  }
  GetNewtonianGravity(): boolean {
    return !!this.sim.grav;
  }
  SetNewtonianGravity(state: boolean): void {
    this.sim.EnableNewtonianGravity(state);
    this.notifySettingsChanged();
  }
  GetWaterEqualisation(): boolean {
    return this.sim.water_equal_test ? true : false;
  }
  SetWaterEqualisation(state: boolean): void {
    this.sim.water_equal_test = state ? 1 : 0;
    this.notifySettingsChanged();
  }
  GetAirMode(): number {
    return this.sim.air.airMode;
  }
  SetAirMode(airMode: number): void {
    this.sim.air.airMode = airMode;
    this.notifySettingsChanged();
  }
  GetEdgeMode(): number {
    return this.gModel.GetSimulation().edgeMode;
  }
  SetEdgeMode(edgeMode: number): void {
    GlobalPrefs().Set('Simulation.EdgeMode', edgeMode);
    this.gModel.SetEdgeMode(edgeMode);
    this.notifySettingsChanged();
  }
  GetTemperatureScale(): number {
    return this.gModel.GetTemperatureScale();
  }
  SetTemperatureScale(temperatureScale: number): void {
    GlobalPrefs().Set('Renderer.TemperatureScale', temperatureScale | 0);
    this.gModel.SetTemperatureScale(temperatureScale);
    this.notifySettingsChanged();
  }
  GetAmbientAirTemperature(): number {
    return this.gModel.GetSimulation().air.ambientAirTemp;
  }
  SetAmbientAirTemperature(ambientAirTemp: number): void {
    GlobalPrefs().Set('Simulation.AmbientAirTemp', ambientAirTemp);
    this.gModel.SetAmbientAirTemperature(ambientAirTemp);
    this.notifySettingsChanged();
  }
  GetEdgePressure(): number {
    return this.gModel.GetSimulation().air.edgePressure;
  }
  SetEdgePressure(edgePressure: number): void {
    GlobalPrefs().Set('Simulation.EdgePressure', edgePressure);
    this.gModel.SetEdgePressure(edgePressure);
    this.notifySettingsChanged();
  }
  GetEdgeVelocityX(): number {
    return this.gModel.GetSimulation().air.edgeVelocityX;
  }
  SetEdgeVelocityX(edgeVelocityX: number): void {
    GlobalPrefs().Set('Simulation.EdgeVelocityX', edgeVelocityX);
    this.gModel.SetEdgeVelocityX(edgeVelocityX);
    this.notifySettingsChanged();
  }
  GetEdgeVelocityY(): number {
    return this.gModel.GetSimulation().air.edgeVelocityY;
  }
  SetEdgeVelocityY(edgeVelocityY: number): void {
    GlobalPrefs().Set('Simulation.EdgeVelocityY', edgeVelocityY);
    this.gModel.SetEdgeVelocityY(edgeVelocityY);
    this.notifySettingsChanged();
  }
  GetVorticityCoeff(): number {
    return this.gModel.GetSimulation().air.vorticityCoeff;
  }
  SetVorticityCoeff(vorticityCoeff: number): void {
    GlobalPrefs().Set('Simulation.VorticityCoeff', vorticityCoeff);
    this.gModel.SetVorticityCoeff(vorticityCoeff);
    this.notifySettingsChanged();
  }
  GetConvectionMode(): number {
    return this.gModel.GetSimulation().air.convectionMode;
  }
  SetConvectionMode(convMode: number): void {
    GlobalPrefs().Set('Simulation.ConvectionMode', convMode);
    this.gModel.SetConvectionMode(convMode);
    this.notifySettingsChanged();
  }
  GetGravityMode(): number {
    return this.sim.gravityMode;
  }
  SetGravityMode(gravityMode: number): void {
    this.sim.gravityMode = gravityMode;
    this.notifySettingsChanged();
  }
  GetCustomGravityX(): number {
    return this.sim.customGravityX;
  }
  SetCustomGravityX(x: number): void {
    this.sim.customGravityX = x;
    this.notifySettingsChanged();
  }
  GetCustomGravityY(): number {
    return this.sim.customGravityY;
  }
  SetCustomGravityY(y: number): void {
    this.sim.customGravityY = y;
    this.notifySettingsChanged();
  }
  GetGraveExitsConsole(): boolean {
    return !!(Engine.Ref() as EngineWithGrave).GraveExitsConsole;
  }
  SetGraveExitsConsole(graveExitsConsole: boolean): void {
    (Engine.Ref() as EngineWithGrave).GraveExitsConsole = graveExitsConsole;
    GlobalPrefs().Set('GraveExitsConsole', graveExitsConsole);
    this.notifySettingsChanged();
  }
  GetFastQuit(): boolean {
    return Engine.Ref().GetFastQuit();
  }
  SetFastQuit(fastquit: boolean): void {
    Engine.Ref().SetFastQuit(fastquit);
    GlobalPrefs().Set('FastQuit', !!fastquit);
    this.notifySettingsChanged();
  }
  GetGlobalQuit(): boolean {
    return Engine.Ref().GetGlobalQuit();
  }
  SetGlobalQuit(newGlobalQuit: boolean): void {
    Engine.Ref().SetGlobalQuit(newGlobalQuit);
    GlobalPrefs().Set('GlobalQuit', newGlobalQuit);
    this.notifySettingsChanged();
  }
  GetDecoSpace(): number {
    return this.gModel.GetDecoSpace();
  }
  SetDecoSpace(decoSpace: number): void {
    GlobalPrefs().Set('Simulation.DecoSpace', decoSpace);
    this.gModel.SetDecoSpace(decoSpace);
    this.notifySettingsChanged();
  }
  GetShowAvatars(): boolean {
    return Engine.Ref().ShowAvatars;
  }
  SetShowAvatars(state: boolean): void {
    Engine.Ref().ShowAvatars = state;
    GlobalPrefs().Set('ShowAvatars', state);
    this.notifySettingsChanged();
  }
  GetMouseClickRequired(): boolean {
    return this.gModel.GetMouseClickRequired();
  }
  SetMouseClickRequired(mouseClickRequired: boolean): void {
    GlobalPrefs().Set('MouseClickRequired', mouseClickRequired);
    this.gModel.SetMouseClickRequired(mouseClickRequired);
    this.notifySettingsChanged();
  }
  GetIncludePressure(): boolean {
    return this.gModel.GetIncludePressure();
  }
  SetIncludePressure(includePressure: boolean): void {
    GlobalPrefs().Set('Simulation.IncludePressure', includePressure);
    this.gModel.SetIncludePressure(includePressure);
    this.notifySettingsChanged();
  }
  GetPerfectCircle(): boolean {
    return this.gModel.GetPerfectCircle();
  }
  SetPerfectCircle(perfectCircle: boolean): void {
    GlobalPrefs().Set('PerfectCircleBrush', perfectCircle);
    this.gModel.SetPerfectCircle(perfectCircle);
    this.notifySettingsChanged();
  }
  GetMomentumScroll(): boolean {
    return Engine.Ref().MomentumScroll;
  }
  SetMomentumScroll(state: boolean): void {
    GlobalPrefs().Set('MomentumScroll', state);
    Engine.Ref().MomentumScroll = state;
    this.notifySettingsChanged();
  }
  GetFpsLimit(): SimFpsLimit {
    return this.gModel.GetView().GetSimFpsLimit();
  }
  SetFpsLimit(newFpsLimit: SimFpsLimit): void {
    let saved = 2;
    if (newFpsLimit.kind === 'explicit') {
      saved = newFpsLimit.value;
    }
    GlobalPrefs().Set('FpsLimit', saved);
    return this.gModel.GetView().SetSimFpsLimit(newFpsLimit);
    // (the original's notifySettingsChanged() after this return is unreachable)
  }
  GetDrawLimit(): DrawLimit {
    return Engine.Ref().GetDrawingFrequencyLimit();
  }
  SetDrawLimit(newDrawLimit: DrawLimit): void {
    let saved = 0;
    if (newDrawLimit.kind === 'display') {
      saved = -1;
    }
    if (newDrawLimit.kind === 'explicit') {
      saved = newDrawLimit.value;
    }
    GlobalPrefs().Set('DrawLimit', saved);
    Engine.Ref().SetDrawingFrequencyLimit(newDrawLimit);
    this.notifySettingsChanged();
  }

  private notifySettingsChanged(): void {
    for (const o of this.observers) o.NotifySettingsChanged(this);
  }
}

// ---------------------------------------------------------------------------------------------------------------
// OptionsController

export class OptionsController {
  private gModel: GameModel;
  private view: OptionsView;
  private model: OptionsModel;
  private onDone: (() => void) | null;
  HasExited = false;

  constructor(gModel_: GameModel, onDone_: (() => void) | null = null) {
    this.gModel = gModel_;
    this.onDone = onDone_;
    this.view = new OptionsView();
    this.model = new OptionsModel(this.gModel);
    this.model.AddObserver(this.view);

    this.view.AttachController(this);
  }

  SetHeatSimulation(state: boolean): void { this.model.SetHeatSimulation(state); }
  SetAmbientHeatSimulation(state: boolean): void { this.model.SetAmbientHeatSimulation(state); }
  SetNewtonianGravity(state: boolean): void { this.model.SetNewtonianGravity(state); }
  SetWaterEqualisation(state: boolean): void { this.model.SetWaterEqualisation(state); }
  SetGravityMode(gravityMode: number): void { this.model.SetGravityMode(gravityMode); }
  SetCustomGravityX(x: number): void { this.model.SetCustomGravityX(x); }
  SetCustomGravityY(y: number): void { this.model.SetCustomGravityY(y); }
  SetAirMode(airMode: number): void { this.model.SetAirMode(airMode); }
  SetAmbientAirTemperature(ambientAirTemp: number): void { this.model.SetAmbientAirTemperature(ambientAirTemp); }
  SetEdgePressure(edgePressure: number): void { this.model.SetEdgePressure(edgePressure); }
  SetEdgeVelocityX(edgeVelocityX: number): void { this.model.SetEdgeVelocityX(edgeVelocityX); }
  SetEdgeVelocityY(edgeVelocityY: number): void { this.model.SetEdgeVelocityY(edgeVelocityY); }
  SetVorticityCoeff(vorticityCoeff: number): void { this.model.SetVorticityCoeff(vorticityCoeff); }
  SetConvectionMode(convMode: number): void { this.model.SetConvectionMode(convMode); }
  SetEdgeMode(edgeMode: number): void { this.model.SetEdgeMode(edgeMode); }
  SetTemperatureScale(temperatureScale: number): void { this.model.SetTemperatureScale(temperatureScale); }
  SetShowAvatars(showAvatars: boolean): void { this.model.SetShowAvatars(showAvatars); }
  SetGraveExitsConsole(graveExitsConsole: boolean): void { this.model.SetGraveExitsConsole(graveExitsConsole); }
  SetFastQuit(fastquit: boolean): void { this.model.SetFastQuit(fastquit); }
  SetGlobalQuit(newGlobalQuit: boolean): void { this.model.SetGlobalQuit(newGlobalQuit); }
  SetDecoSpace(decoSpace: number): void { this.model.SetDecoSpace(decoSpace); }
  GetView(): OptionsView { return this.view; }
  SetMouseClickrequired(mouseClickRequired: boolean): void { this.model.SetMouseClickRequired(mouseClickRequired); }
  SetIncludePressure(includePressure: boolean): void { this.model.SetIncludePressure(includePressure); }
  SetPerfectCircle(perfectCircle: boolean): void { this.model.SetPerfectCircle(perfectCircle); }
  SetMomentumScroll(momentumScroll: boolean): void { this.model.SetMomentumScroll(momentumScroll); }
  SetFpsLimit(newFpsLimit: SimFpsLimit): void { this.model.SetFpsLimit(newFpsLimit); }
  SetDrawLimit(newDrawLimit: DrawLimit): void { this.model.SetDrawLimit(newDrawLimit); }

  Exit(): void {
    this.view.CloseActiveWindow();

    if (this.onDone)
      this.onDone();
    this.HasExited = true;
  }

  /** ~OptionsController */
  Destroy(): void {
    this.view.CloseActiveWindow();
  }
}
