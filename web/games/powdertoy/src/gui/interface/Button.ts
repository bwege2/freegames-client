// gui/interface/Button.h / Button.cpp
import { Component, Engine } from './Engine.ts';
import { TextSize, TextFit } from '../../graphics/raster.ts';
import { Alpha, Red, Green, Blue, SetAlpha, type Point } from './Point.ts';

export interface ButtonAction {
  action?: (() => void) | null;
  altAction?: (() => void) | null;
  mouseEnter?: (() => void) | null;
}

export class Button extends Component {
  protected ButtonText: string;
  protected toolTip: string;
  protected buttonDisplayText = '';
  protected isButtonDown = false;
  protected isAltButtonDown = false;
  protected state = false;
  protected isMouseInside = false;
  protected isTogglable = false;
  protected toggle = false;
  protected actionCallback: ButtonAction = {};

  /** Button(Point position, Point size, String buttonText, String toolTip); a number text is one character */
  constructor(position: Point = { X: 0, Y: 0 }, size: Point = { X: 0, Y: 0 }, buttonText: string | number = '', toolTip = '') {
    super(position, size);
    this.ButtonText = typeof buttonText === 'number' ? String.fromCodePoint(buttonText) : buttonText;
    this.toolTip = toolTip;
    this.TextPosition(this.ButtonText);
  }

  override TextPosition(ButtonText: string): void {
    this.buttonDisplayText = ButtonText;
    if (this.buttonDisplayText.length) {
      if (TextSize(this.buttonDisplayText).X - 1 > this.Size.X - (this.Appearance.icon ? 22 : 0)) {
        const it = TextFit(this.buttonDisplayText, this.Size.X - (this.Appearance.icon ? 38 : 22));
        this.buttonDisplayText = this.buttonDisplayText.slice(0, it) + '...';
      }
    }
    super.TextPosition(this.buttonDisplayText);
  }
  SetIcon(icon: number): void {
    this.Appearance.icon = icon;
    this.TextPosition(this.ButtonText);
  }
  SetText(buttonText: string): void {
    this.ButtonText = buttonText;
    this.TextPosition(this.ButtonText);
  }
  GetText(): string { return this.ButtonText; }
  SetToolTip(newToolTip: string): void { this.toolTip = newToolTip; }
  GetState(): boolean { return this.state; }
  SetTogglable(togglable: boolean): void {
    this.toggle = false;
    this.isTogglable = togglable;
  }
  GetTogglable(): boolean { return this.isTogglable; }
  GetToggleState(): boolean { return this.toggle; }
  SetToggleState(state: boolean): void { this.toggle = state; }
  SetActionCallback(action: ButtonAction): void { this.actionCallback = action; }

  override Draw(screenPos: Point): void {
    if (!this.drawn) {
      this.TextPosition(this.ButtonText);
      this.drawn = true;
    }
    const g = this.GetGraphics();
    const Position = screenPos;
    const ap = this.Appearance;
    let textColour = ap.TextInactive;
    let borderColour = ap.BorderInactive;
    let backgroundColour = ap.BackgroundInactive;
    if (this.Enabled) {
      if ((this.isButtonDown && this.MouseDownInside) || (this.isTogglable && this.toggle)) {
        textColour = ap.TextActive;
        borderColour = ap.BorderActive;
        backgroundColour = ap.BackgroundActive;
      } else if (this.isMouseInside) {
        textColour = ap.TextHover;
        borderColour = ap.BorderHover;
        backgroundColour = ap.BackgroundHover;
      } else {
        textColour = ap.TextInactive;
        borderColour = ap.BorderInactive;
        backgroundColour = ap.BackgroundInactive;
      }
    } else {
      textColour = ap.TextDisabled;
      borderColour = ap.BorderDisabled;
      backgroundColour = ap.BackgroundDisabled;
    }
    if (ap.BackgroundPulse) {
      backgroundColour = SetAlpha(backgroundColour, Math.trunc(Alpha(backgroundColour) * ((Math.sin(Engine.Ref().LastTick() * Math.PI * 2 / 1000) + 1) / 2)));
    }
    g.BlendFilledRect(Position.X + 1, Position.Y + 1, this.Size.X - 2, this.Size.Y - 2, backgroundColour);
    if (ap.Border.isAll(1)) {
      g.BlendRect(Position.X, Position.Y, this.Size.X, this.Size.Y, borderColour);
    } else {
      const sx = this.Size.X, sy = this.Size.Y;
      if (ap.Border.Top) g.BlendLine(Position.X, Position.Y, Position.X + sx - 1, Position.Y, borderColour);
      if (ap.Border.Bottom) g.BlendLine(Position.X, Position.Y + sy - 1, Position.X + sx - 1, Position.Y + sy - 1, borderColour);
      if (ap.Border.Left) g.BlendLine(Position.X, Position.Y, Position.X, Position.Y + sy - 1, borderColour);
      if (ap.Border.Right) g.BlendLine(Position.X + sx - 1, Position.Y, Position.X + sx - 1, Position.Y + sy - 1, borderColour);
    }
    g.BlendText(Position.X + this.textPosition.X, Position.Y + this.textPosition.Y, this.buttonDisplayText, textColour);
    const iconInvert = (Blue(backgroundColour) + (3 * Green(backgroundColour)) + (2 * Red(backgroundColour))) > 544;
    if (ap.icon) {
      if (this.Enabled) g.draw_icon(Position.X + this.iconPosition.X, Position.Y + this.iconPosition.Y, ap.icon, 255, iconInvert);
      else g.draw_icon(Position.X + this.iconPosition.X, Position.Y + this.iconPosition.Y, ap.icon, 180, iconInvert);
    }
  }

  override OnMouseClick(_x: number, _y: number, button: number): void {
    if (button === 1) {
      if (this.isButtonDown) {
        if (this.isTogglable) this.toggle = !this.toggle;
        this.isButtonDown = false;
        this.DoAction();
      }
    } else if (button === 3) {
      if (this.isAltButtonDown) {
        this.isAltButtonDown = false;
        this.DoAltAction();
      }
    }
  }
  override OnMouseUp(_x: number, _y: number, _button: number): void {
    this.isButtonDown = false;
    this.isAltButtonDown = false;
  }
  override OnMouseDown(_x: number, _y: number, button: number): void {
    if (this.MouseDownInside) {
      if (!this.Enabled) return;
      if (button === 1) this.isButtonDown = true;
      else if (button === 3) this.isAltButtonDown = true;
    }
  }
  override OnMouseEnter(_x: number, _y: number): void {
    this.isMouseInside = true;
    if (!this.Enabled) return;
    if (this.actionCallback.mouseEnter) this.actionCallback.mouseEnter();
  }
  override OnMouseHover(_x: number, _y: number): void {
    if (this.Enabled && this.toolTip.length > 0 && this.GetParentWindow())
      this.GetParentWindow()!.ToolTip(this.Position, this.toolTip);
  }
  override OnMouseLeave(_x: number, _y: number): void {
    this.isMouseInside = false;
    this.isButtonDown = false;
  }
  DoAction(): void {
    if (!this.Enabled) return;
    if (this.actionCallback.action) this.actionCallback.action();
  }
  DoAltAction(): void {
    if (!this.Enabled) return;
    if (this.actionCallback.altAction) this.actionCallback.altAction();
  }
}
