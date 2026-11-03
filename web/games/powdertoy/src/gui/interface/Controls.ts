// gui/interface/Checkbox, DropDown, Slider, ScrollPanel, Separator, Spinner, ProgressBar (.h/.cpp)
import { Component, Panel, Window, Engine } from './Engine.ts';
import { Button } from './Button.ts';
import { Fade } from './Fade.ts';
import { Border, WithAlpha, NoAlpha, Alpha, RGB, type Point } from './Point.ts';
import { style } from './Appearance.ts';
import { TextSize } from '../../graphics/raster.ts';
import { Gradient } from '../../sim/colour.ts';
import { GetTicks } from './Keys.ts';

// ---------------------------------------------------------------------------------------------------------------
// Checkbox

export class Checkbox extends Component {
  private text: string;
  private toolTip: string;
  private checked = false;
  private isMouseOver = false;
  private actionCallback: { action?: () => void } = {};

  constructor(position: Point, size: Point, text: string, toolTip: string) {
    super(position, size);
    this.text = text;
    this.toolTip = toolTip;
  }
  SetText(text: string): void { this.text = text; }
  GetText(): string { return this.text; }
  SetIcon(icon: number): void {
    this.Appearance.icon = icon;
    this.iconPosition.X = 16;
    this.iconPosition.Y = 3;
  }
  SetActionCallback(action: { action?: () => void }): void { this.actionCallback = action; }
  GetActionCallback(): { action?: () => void } { return this.actionCallback; }
  GetChecked(): boolean { return this.checked; }
  SetChecked(checked: boolean): void { this.checked = checked; }
  override OnMouseClick(): void {
    this.checked = !this.checked;
    if (this.actionCallback.action) this.actionCallback.action();
  }
  override OnMouseEnter(): void { this.isMouseOver = true; }
  override OnMouseHover(): void {
    if (this.toolTip.length > 0 && this.GetParentWindow()) this.GetParentWindow()!.ToolTip(this.Position, this.toolTip);
  }
  override OnMouseLeave(): void { this.isMouseOver = false; }
  override Draw(screenPos: Point): void {
    const g = this.GetGraphics();
    const x = screenPos.X, y = screenPos.Y;
    if (this.checked) g.DrawFilledRect(x + 5, y + 5, 6, 6, 0xFFFFFF);
    if (this.isMouseOver) {
      g.DrawRect(x + 2, y + 2, 12, 12, 0xFFFFFF);
      g.BlendFilledRect(x + 5, y + 5, 6, 6, WithAlpha(0xFFFFFF, 170));
      if (!this.Appearance.icon) g.BlendText(x + 18, y + 4, this.text, WithAlpha(0xFFFFFF, 255));
      else g.draw_icon(x + this.iconPosition.X, y + this.iconPosition.Y, this.Appearance.icon, 255);
    } else {
      g.BlendRect(x + 2, y + 2, 12, 12, WithAlpha(0xFFFFFF, 200));
      if (!this.Appearance.icon) g.BlendText(x + 18, y + 4, this.text, WithAlpha(0xFFFFFF, 200));
      else g.draw_icon(x + this.iconPosition.X, y + this.iconPosition.Y, this.Appearance.icon, 200);
    }
  }
}

// ---------------------------------------------------------------------------------------------------------------
// DropDown

class DropDownWindow extends Window {
  private dropDown: DropDown;
  constructor(dropDown: DropDown) {
    const sp = dropDown.GetScreenPos();
    super({ X: sp.X - 1, Y: sp.Y - 1 - (dropDown.optionIndex * 16 < sp.Y ? dropDown.optionIndex * 16 : 0) },
      { X: dropDown.Size.X + 2, Y: 2 + dropDown.options.length * 16 });
    this.dropDown = dropDown;
    const appearance = dropDown.Appearance;
    let currentY = 1;
    for (let i = 0; i < dropDown.options.length; i++) {
      const tempButton = new Button({ X: 1, Y: currentY }, { X: this.Size.X - 2, Y: 16 }, dropDown.options[i][0]);
      tempButton.Appearance = appearance.clone();
      if (i) tempButton.Appearance.Border = new Border(0, 1, 1, 1);
      const option = dropDown.options[i][0];
      tempButton.SetActionCallback({ action: () => {
        this.CloseActiveWindow();
        this.setOption(option);
        this.SelfDestruct();
      } });
      this.AddComponent(tempButton);
      currentY += 16;
    }
  }
  protected override OnDraw(): void {
    this.GetGraphics().DrawFilledRect(this.Position.X, this.Position.Y, this.Size.X, this.Size.Y, 0x000000);
  }
  private setOption(option: string): void {
    this.dropDown.SetOption(option);
    if (this.dropDown.actionCallback.change) this.dropDown.actionCallback.change();
  }
  protected override OnTryExit(): void {
    this.CloseActiveWindow();
    this.SelfDestruct();
  }
}

export class DropDown extends Component {
  private isMouseInside = false;
  optionIndex = -1;
  actionCallback: { change?: () => void } = {};
  options: [string, number][] = [];

  constructor(position: Point, size: Point) {
    super(position, size);
  }
  SetActionCallback(action: { change?: () => void }): void { this.actionCallback = action; }
  override OnMouseClick(): void {
    const newWindow = new DropDownWindow(this);
    newWindow.MakeActiveWindow();
  }
  override Draw(screenPos: Point): void {
    if (!this.drawn) {
      if (this.optionIndex !== -1) this.TextPosition(this.options[this.optionIndex][0]);
      this.drawn = true;
    }
    const g = this.GetGraphics();
    const ap = this.Appearance;
    const textColour = this.isMouseInside ? ap.TextHover : ap.TextInactive;
    const borderColour = this.isMouseInside ? ap.BorderHover : ap.BorderInactive;
    const backgroundColour = this.isMouseInside ? ap.BackgroundHover : ap.BackgroundInactive;
    g.BlendFilledRect(screenPos.X - 1, screenPos.Y - 1, this.Size.X + 2, this.Size.Y + 2, backgroundColour);
    g.BlendRect(screenPos.X, screenPos.Y, this.Size.X, this.Size.Y, borderColour);
    if (this.optionIndex !== -1)
      g.BlendText(screenPos.X + this.textPosition.X, screenPos.Y + this.textPosition.Y, this.options[this.optionIndex][0], textColour);
  }
  override OnMouseEnter(): void { this.isMouseInside = true; }
  override OnMouseLeave(): void { this.isMouseInside = false; }
  GetOption(): [string, number] {
    if (this.optionIndex !== -1) return this.options[this.optionIndex];
    return ['', -1];
  }
  /** SetOption(String) or SetOption(int) */
  SetOption(option: string | number): void {
    for (let i = 0; i < this.options.length; i++) {
      if ((typeof option === 'string' && this.options[i][0] === option) || (typeof option === 'number' && this.options[i][1] === option)) {
        this.optionIndex = i;
        this.TextPosition(this.options[this.optionIndex][0]);
        return;
      }
    }
  }
  AddOption(option: [string, number]): void {
    for (const o of this.options) if (o[0] === option[0] && o[1] === option[1]) return;
    this.options.push(option);
  }
  SetOptions(options: [string, number][]): void {
    this.options = options;
  }
}

// ---------------------------------------------------------------------------------------------------------------
// Slider

export class Slider extends Component {
  private sliderSteps: number;
  private sliderPosition = 0;
  private isMouseDown = false;
  private bgGradient: number[] = [];
  private actionCallback: { change?: () => void } = {};
  private col1 = 0;
  private col2 = 0;

  constructor(position: Point, size: Point, steps: number) {
    super(position, size);
    this.sliderSteps = steps;
  }
  private updatePosition(position: number): void {
    if (position < 3) position = 3;
    if (position > this.Size.X - 3) position = this.Size.X - 3;
    const fPosition = Math.fround(position - 3);
    const fSize = Math.fround(this.Size.X - 6);
    const fSliderPosition = Math.fround(Math.fround(fPosition / fSize) * this.sliderSteps);
    const newSliderPosition = Math.trunc(fSliderPosition);
    if (newSliderPosition === this.sliderPosition) return;
    this.sliderPosition = newSliderPosition;
    if (this.actionCallback.change) this.actionCallback.change();
  }
  override OnMouseMoved(x: number): void {
    if (this.isMouseDown) this.updatePosition(x);
  }
  override OnMouseDown(x: number): void {
    if (this.MouseDownInside) {
      this.isMouseDown = true;
      this.updatePosition(x - this.Position.X);
    }
  }
  override OnMouseUp(): void {
    if (this.isMouseDown) this.isMouseDown = false;
  }
  SetActionCallback(action: { change?: () => void }): void { this.actionCallback = action; }
  SetColour(col1: number, col2: number): void {
    this.col1 = col1;
    this.col2 = col2;
    this.bgGradient = Gradient([[NoAlpha(col1), 0], [NoAlpha(col2), 1]], this.Size.X - 7);
  }
  GetValue(): number { return this.sliderPosition; }
  SetValue(value: number): void {
    if (value < 0) value = 0;
    if (value > this.sliderSteps) value = this.sliderSteps;
    this.sliderPosition = value;
  }
  GetSteps(): number { return this.sliderSteps; }
  SetSteps(steps: number): void {
    if (steps < 0) steps = 0;
    if (steps < this.sliderPosition) this.sliderPosition = steps;
    this.sliderSteps = steps;
  }
  override Draw(screenPos: Point): void {
    const g = this.GetGraphics();
    void this.col1; void this.col2;
    if (this.bgGradient.length) {
      for (let j = 3; j < this.Size.Y - 7; j++)
        for (let i = 3; i < this.Size.X - 7; i++)
          g.DrawPixel(screenPos.X + i + 2, screenPos.Y + j + 2, this.bgGradient[i - 3]);
    }
    g.DrawRect(screenPos.X + 3, screenPos.Y + 3, this.Size.X - 6, this.Size.Y - 6, 0xFFFFFF);
    const fPosition = Math.fround(this.sliderPosition);
    const fSize = Math.fround(this.Size.X - 6);
    const fSteps = Math.fround(this.sliderSteps);
    const fSliderX = Math.fround(Math.fround(fSize / fSteps) * fPosition);
    let sliderX = Math.trunc(fSliderX);
    sliderX += 3;
    g.DrawFilledRect(screenPos.X + sliderX - 2, screenPos.Y + 1, 4, this.Size.Y - 2, 0x141414);
    g.DrawRect(screenPos.X + sliderX - 2, screenPos.Y + 1, 4, this.Size.Y - 2, 0xC8C8C8);
  }
}

// ---------------------------------------------------------------------------------------------------------------
// ScrollPanel

const PanOffsetThreshold = 10;
const PanHistorySize = 5;

export class ScrollPanel extends Panel {
  protected scrollBarWidth = 0;
  protected maxOffset: Point = { X: 0, Y: 0 };
  protected offsetX = 0;
  protected offsetY = 0;
  protected yScrollVel = new Fade(Fade.ExponentialProfile(Math.fround(0.297553), 0.5), 0, 0);
  protected xScrollVel = new Fade(Fade.ExponentialProfile(Math.fround(0.297553), 0.5), 0, 0);
  protected isMouseInsideScrollbar = false;
  protected isMouseInsideScrollbarArea = false;
  protected scrollbarSelected = false;
  protected scrollbarInitialYOffset = 0;
  protected scrollbarInitialYClick = 0;
  protected scrollbarClickLocation = 0;
  protected scrollLastTick: number;
  protected initialOffsetY = 0;
  protected panning = false;
  protected panHistory: ({ offsetY: number; ticks: number } | null)[] = new Array(PanHistorySize).fill(null);

  constructor(position: Point, size: Point) {
    super(position, size);
    this.scrollLastTick = Engine.Ref().LastTick();
  }
  GetScrollLimit(): number {
    if (this.ViewportPosition.Y === 0) return -1;
    else if (this.maxOffset.Y === -this.ViewportPosition.Y) return 1;
    return 0;
  }
  SetScrollPosition(position: number): void {
    this.offsetY = position;
    this.ViewportPosition.Y = -position;
  }
  protected override XOnMouseWheelInside(_localx: number, _localy: number, d: number): void {
    if (!d) return;
    if (Engine.Ref().MomentumScroll) this.yScrollVel.SetValue(this.yScrollVel.GetValue() - d * 2);
    else this.yScrollVel.SetValue(this.yScrollVel.GetValue() - d * 20);
  }
  private scrollBar(): [number, number] {
    const scrollHeight = Math.fround(this.Size.Y * Math.fround(this.Size.Y / this.InnerSize.Y));
    let scrollPos = 0;
    if (-this.ViewportPosition.Y > 0) scrollPos = Math.fround(Math.fround(this.Size.Y - scrollHeight) * Math.fround(this.offsetY / this.maxOffset.Y));
    return [scrollHeight, scrollPos];
  }
  override Draw(screenPos: Point): void {
    super.Draw(screenPos);
    const g = this.GetGraphics();
    if (this.maxOffset.Y > 0 && this.InnerSize.Y > 0) {
      const [scrollHeight, scrollPos] = this.scrollBar();
      g.BlendFilledRect(screenPos.X + this.Size.X - this.scrollBarWidth, screenPos.Y, this.scrollBarWidth, this.Size.Y, WithAlpha(0x7D7D7D, 100));
      g.DrawFilledRect(screenPos.X + this.Size.X - this.scrollBarWidth, screenPos.Y + Math.trunc(scrollPos), this.scrollBarWidth, Math.trunc(scrollHeight) + 1, 0xFFFFFF);
    }
  }
  protected override XOnMouseDown(_x: number, y: number): void {
    if (this.MouseDownInside) {
      this.CancelPanning();
      if (this.isMouseInsideScrollbar) {
        this.scrollbarSelected = true;
        this.scrollbarInitialYOffset = Math.trunc(this.offsetY);
      }
      this.initialOffsetY = Math.trunc(this.offsetY);
      this.scrollbarInitialYClick = y - this.Position.Y;
      this.scrollbarClickLocation = 100;
    }
  }
  private CancelPanning(): void {
    this.panning = false;
    this.panHistory = new Array(PanHistorySize).fill(null);
    this.yScrollVel.Set(0);
  }
  protected override XOnMouseUp(): void {
    this.scrollbarSelected = false;
    const oldPanHistory = this.panHistory;
    this.CancelPanning();
    let it = oldPanHistory.length;
    while (it !== 0 && oldPanHistory[it - 1]) --it;
    if (it < oldPanHistory.length) {
      const offsetYDiff = oldPanHistory[oldPanHistory.length - 1]!.offsetY - oldPanHistory[it]!.offsetY;
      const tickDiff = oldPanHistory[oldPanHistory.length - 1]!.ticks - oldPanHistory[it]!.ticks;
      if (tickDiff) this.yScrollVel.SetValue(this.yScrollVel.GetValue() + offsetYDiff / tickDiff * (1000 / Engine.Ref().GetFps()));
    }
    this.isMouseInsideScrollbarArea = false;
    this.scrollbarClickLocation = 0;
  }
  protected override XOnMouseMoved(x: number, y: number): void {
    if (this.maxOffset.Y > 0 && this.InnerSize.Y > 0) {
      const oldViewportPositionY = this.ViewportPosition.Y;
      const [scrollHeight, scrollPos] = this.scrollBar();
      if (this.scrollbarSelected) {
        if (x > 0) {
          const scrollY = Math.trunc((y - this.scrollbarInitialYClick) / this.Size.Y * this.InnerSize.Y + this.scrollbarInitialYOffset);
          this.ViewportPosition.Y = -scrollY;
          this.offsetY = scrollY;
        } else {
          this.ViewportPosition.Y = -this.scrollbarInitialYOffset;
          this.offsetY = this.scrollbarInitialYOffset;
        }
      } else if (this.MouseDownInside) {
        if (Engine.Ref().TouchUI && Math.abs(this.scrollbarInitialYClick - y) > PanOffsetThreshold) {
          this.panning = true;
          for (const child of this.children) child.MouseDownInside = false;
          this.GetParentWindow()!.FocusComponent(null);
        }
      }
      if (x > (this.Size.X - this.scrollBarWidth) && x < this.Size.X) {
        this.isMouseInsideScrollbar = y > scrollPos && y < scrollPos + scrollHeight;
        this.isMouseInsideScrollbarArea = true;
      } else {
        this.isMouseInsideScrollbar = this.isMouseInsideScrollbarArea = false;
      }
      if (oldViewportPositionY !== this.ViewportPosition.Y) this.PropagateMouseMove();
    }
  }
  protected override XTick(): void {
    const oldViewportPositionY = this.ViewportPosition.Y;
    if (this.panning) {
      const scrollY = this.initialOffsetY + this.scrollbarInitialYClick - (Engine.Ref().GetMouseY() - this.GetScreenPos().Y);
      this.ViewportPosition.Y = -scrollY;
      this.offsetY = scrollY;
      const p = { offsetY: this.offsetY, ticks: GetTicks() };
      const last = this.panHistory[this.panHistory.length - 1];
      if (!(last && last.ticks === p.ticks)) {
        this.panHistory.shift();
        this.panHistory.push(p);
      }
    }
    if (this.xScrollVel.GetValue() > 7) this.xScrollVel.SetValue(7);
    if (this.xScrollVel.GetValue() < -7) this.xScrollVel.SetValue(-7);
    if (this.xScrollVel.GetValue() > -0.5 && this.xScrollVel.GetValue() < 0.5) this.xScrollVel.SetValue(0);
    this.maxOffset = { X: Math.max(0, this.InnerSize.X - this.Size.X), Y: Math.max(0, this.InnerSize.Y - this.Size.Y) };
    const oldOffsetY = Math.trunc(this.offsetY);
    {
      const now = Engine.Ref().LastTick();
      const diff = now - this.scrollLastTick;
      this.scrollLastTick = now;
      this.offsetY = Math.fround(this.offsetY + Math.fround(this.yScrollVel.Int() * diff * Math.fround(0.06)));
      this.offsetX = Math.fround(this.offsetX + Math.fround(this.xScrollVel.Int() * diff * Math.fround(0.06)));
    }
    if (!Engine.Ref().MomentumScroll) {
      this.yScrollVel.SetValue(0);
      this.xScrollVel.SetValue(0);
    }
    if (oldOffsetY !== Math.trunc(this.offsetY)) {
      if (this.offsetY < 0) {
        this.offsetY = 0;
        this.yScrollVel.Set(0);
      } else if (this.offsetY > this.maxOffset.Y) {
        this.offsetY = this.maxOffset.Y;
        this.yScrollVel.Set(0);
      }
      this.ViewportPosition.Y = -Math.trunc(this.offsetY);
    } else {
      if (this.offsetY < 0) {
        this.offsetY = 0;
        this.yScrollVel.Set(0);
        this.ViewportPosition.Y = -Math.trunc(this.offsetY);
      } else if (this.offsetY > this.maxOffset.Y) {
        this.offsetY = this.maxOffset.Y;
        this.ViewportPosition.Y = -Math.trunc(this.offsetY);
      }
    }
    if (this.MouseInside && this.scrollBarWidth < 6) this.scrollBarWidth++;
    else if (!this.MouseInside && this.scrollBarWidth > 0 && !this.scrollbarSelected) this.scrollBarWidth--;
    if (this.isMouseInsideScrollbarArea && this.scrollbarClickLocation && !this.scrollbarSelected) {
      const [scrollHeight, scrollPos] = this.scrollBar();
      if (this.scrollbarInitialYClick <= scrollPos) this.scrollbarClickLocation = -1;
      else if (this.scrollbarInitialYClick >= scrollPos + scrollHeight) this.scrollbarClickLocation = 1;
      else this.scrollbarClickLocation = 0;
      this.offsetY += this.scrollbarClickLocation * scrollHeight / 10;
      this.ViewportPosition.Y -= Math.trunc(this.scrollbarClickLocation * scrollHeight / 10);
    }
    if (oldViewportPositionY !== this.ViewportPosition.Y) this.PropagateMouseMove();
  }
}

// ---------------------------------------------------------------------------------------------------------------
// Separator, Spinner, ProgressBar

export class Separator extends Component {
  override Draw(screenPos: Point): void {
    this.GetGraphics().BlendRect(screenPos.X, screenPos.Y, this.Size.X, this.Size.Y, WithAlpha(0xFFFFFF, 180));
  }
}

export class Spinner extends Component {
  override Draw(screenPos: Point): void {
    const g = this.GetGraphics();
    const baseX = screenPos.X + ((this.Size.X / 2) | 0);
    const baseY = screenPos.Y + ((this.Size.Y / 2) | 0);
    const lineInner = (this.Size.X / 2) | 0;
    const lineOuter = ((this.Size.X / 2) | 0) + 3;
    const cValue = Math.floor(Engine.Ref().LastTick() * 0.015) * 0.25;
    for (let t = 0.0; t < 6.0; t += 0.25) {
      const c = Math.trunc((t / 6) * 255);
      g.DrawLine(Math.trunc(baseX + Math.sin(cValue + t) * lineInner), Math.trunc(baseY + Math.cos(cValue + t) * lineInner),
        Math.trunc(baseX + Math.sin(cValue + t) * lineOuter), Math.trunc(baseY + Math.cos(cValue + t) * lineOuter), RGB(c, c, c));
    }
  }
}

export class ProgressBar extends Component {
  private progress = 0;
  private intermediatePos = 0;
  private progressStatus = '';
  constructor(position: Point, size: Point, startProgress: number, startStatus: string) {
    super(position, size);
    this.SetStatus(startStatus);
    this.SetProgress(startProgress);
  }
  SetProgress(progress: number): void {
    this.progress = Math.min(progress, 100);
  }
  GetProgress(): number { return this.progress; }
  SetStatus(status: string): void { this.progressStatus = status; }
  GetStatus(): string { return this.progressStatus; }
  override Draw(screenPos: Point): void {
    const g = this.GetGraphics();
    g.DrawRect(screenPos.X, screenPos.Y, this.Size.X, this.Size.Y, 0xFFFFFF);
    const ix = screenPos.X + 2, iy = screenPos.Y + 2, iw = this.Size.X - 4, ih = this.Size.Y - 4;
    const drawContent = (beginX: number, endX: number, bgColour: number, textColour: number) => {
      const cr = g.GetClipRect();
      const x0 = Math.max(ix + beginX, cr.pos.X), x1 = Math.min(ix + endX, cr.pos.X + cr.size.X);
      const y0 = Math.max(iy, cr.pos.Y), y1 = Math.min(iy + ih, cr.pos.Y + cr.size.Y);
      const old = g.SwapClipRect(x0, y0, Math.max(0, x1 - x0), Math.max(0, y1 - y0));
      if (Alpha(bgColour)) g.DrawFilledRect(ix, iy, iw, ih, NoAlpha(bgColour));
      g.BlendText(screenPos.X + (((this.Size.X - (TextSize(this.progressStatus).X - 1)) / 2) | 0), screenPos.Y + (((this.Size.Y - 8) / 2) | 0), this.progressStatus, textColour);
      g.SwapClipRect(old.pos.X, old.pos.Y, old.size.X, old.size.Y);
    };
    drawContent(0, iw, WithAlpha(0, 0), WithAlpha(0xFFFFFF, 255));
    if (this.progress === -1) {
      const size = 40;
      let pos = Math.trunc(iw * this.intermediatePos / 100);
      drawContent(pos, pos + size, style.Colour.WarningTitle, WithAlpha(0, 255));
      pos -= iw;
      drawContent(pos, pos + size, style.Colour.WarningTitle, WithAlpha(0, 255));
    } else {
      drawContent(0, (iw * this.progress / 100) | 0, style.Colour.WarningTitle, WithAlpha(0, 255));
    }
  }
  override Tick(): void {
    this.intermediatePos = Math.fround((Engine.Ref().LastTick() * 0.06) % 100.0);
  }
}
