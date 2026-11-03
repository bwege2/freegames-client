// gui/interface/Engine.h/.cpp, Window.h/.cpp, Component.h/.cpp, Panel.h/.cpp and the main loop of
// PowderToySDL.cpp (EngineProcess, FrameSchedule.h, FpsLimit.h). One file because the four classes call each
// other; the names are the original's.
import { Graphics, TextSize, WithAlpha } from '../../graphics/raster.ts';
import { RectSized, rectAnd, type Point } from './Point.ts';
import { Appearance, AlignTop, AlignMiddle, AlignBottom, AlignLeft, AlignCentre, AlignRight } from './Appearance.ts';
import { GetTicks, SDLK_ESCAPE, SDLK_AC_BACK, SDLK_KP_ENTER, SDLK_RETURN } from './Keys.ts';

// ---------------------------------------------------------------------------------------------------------------
// FpsLimit.h

export type FpsLimit = { kind: 'none' } | { kind: 'explicit'; value: number } | { kind: 'followDraw' };
export type SimFpsLimit = { kind: 'none' } | { kind: 'explicit'; value: number };
export type DrawLimit = { kind: 'display' } | { kind: 'explicit'; value: number };
export const FpsLimitExplicit_minSane = 3, FpsLimitExplicit_maxSane = 1000;
export const DrawLimitExplicit_minSane = 1, DrawLimitExplicit_maxSane = 1000;
export const DefaultFpsLimit: SimFpsLimit = { kind: 'explicit', value: 60 };
export const DefaultDrawLimit: DrawLimit = { kind: 'explicit', value: 60 };

/** FrameSchedule.h (nanoseconds as doubles) */
export class FrameSchedule {
  private startNs = 0;
  private oldStartNs = 0;
  SetNow(nowNs: number): void {
    this.oldStartNs = this.startNs;
    this.startNs = nowNs;
  }
  GetNow(): number { return this.startNs; }
  GetFrameTime(): number { return this.startNs - this.oldStartNs; }
  Arm(fps: number): number {
    const oldNowNs = this.startNs;
    const timeBlockDurationNs = Math.floor(Math.min(Math.max(1e9 / fps, 1), 1e9));
    const oldStartTimeBlock = Math.floor(this.oldStartNs / timeBlockDurationNs);
    const startTimeBlock = oldStartTimeBlock + 1;
    this.startNs = Math.max(this.startNs, startTimeBlock * timeBlockDurationNs);
    return this.startNs - oldNowNs;
  }
  HasElapsed(nowNs: number): boolean {
    return nowNs >= this.startNs;
  }
}

// ---------------------------------------------------------------------------------------------------------------
// Component

export class Component {
  private parentstate_: Window | null = null;
  private _parent: Panel | null = null;
  protected drawn = false;
  protected textPosition: Point = { X: 0, Y: 0 };
  protected textSize: Point = { X: 0, Y: 0 };
  protected iconPosition: Point = { X: 0, Y: 0 };
  menu: ContextMenuLike | null = null;
  UserData: unknown = null;
  Position: Point;
  Size: Point;
  Enabled = true;
  Visible = true;
  DoesTextInput = false;
  MouseInside = false;
  MouseDownInside = false;
  Appearance = new Appearance();

  constructor(position: Point, size: Point) {
    this.Position = { X: position.X, Y: position.Y };
    this.Size = { X: size.X, Y: size.Y };
  }

  protected GetGraphics(): Graphics {
    return Engine.Ref().g;
  }
  GetParentWindow(): Window | null { return this.parentstate_; }
  IsFocused(): boolean {
    if (this.parentstate_) return this.parentstate_.IsFocused(this);
    return false;
  }
  Invalidate(): void { this.drawn = false; }
  Refresh(): void { this.drawn = false; }

  TextPosition(displayText: string): void {
    this.textPosition = { X: 0, Y: 0 };
    this.textSize = TextSize(displayText);
    let textWidth = this.textSize.X, textHeight = this.textSize.Y;
    textHeight -= 3;
    textWidth -= 1;
    if (this.Appearance.icon) textWidth += 13;
    const ap = this.Appearance;
    const textAreaWidth = this.Size.X - (ap.Margin.Right + ap.Margin.Left);
    const textAreaHeight = this.Size.Y - (ap.Margin.Top + ap.Margin.Bottom);
    switch (ap.VerticalAlign) {
      case AlignTop: this.textPosition.Y = ap.Margin.Top + 2; break;
      case AlignMiddle: this.textPosition.Y = ap.Margin.Top + (((textAreaHeight - textHeight) / 2) | 0); break;
      case AlignBottom: this.textPosition.Y = this.Size.Y - (textHeight + ap.Margin.Bottom); break;
    }
    switch (ap.HorizontalAlign) {
      case AlignLeft: this.textPosition.X = ap.Margin.Left; break;
      case AlignCentre: this.textPosition.X = ap.Margin.Left + (((textAreaWidth - textWidth) / 2) | 0); break;
      case AlignRight: this.textPosition.X = this.Size.X - (textWidth + ap.Margin.Right); break;
    }
    if (ap.icon) {
      this.iconPosition = { X: this.textPosition.X, Y: this.textPosition.Y - 1 };
      this.textPosition.X += 15;
    }
  }

  GetContainerPos(): Point {
    const newPos = { X: 0, Y: 0 };
    const w = this.GetParentWindow();
    if (w) { newPos.X += w.Position.X; newPos.Y += w.Position.Y; }
    const p = this.GetParent();
    if (p) { newPos.X += p.Position.X + p.ViewportPosition.X; newPos.Y += p.Position.Y + p.ViewportPosition.Y; }
    return newPos;
  }
  GetScreenPos(): Point {
    const c = this.GetContainerPos();
    return { X: c.X + this.Position.X, Y: c.Y + this.Position.Y };
  }

  SetParentWindow(window: Window | null): void {
    this.parentstate_ = window;
  }
  SetParent(new_parent: Panel | null): void {
    if (new_parent === null) {
      if (this._parent !== null) {
        for (let i = 0; i < this._parent.GetChildCount(); ++i) {
          if (this._parent.GetChild(i) === this) {
            this._parent.RemoveChild(i, false);
            this.GetParentWindow()!.AddComponent(this);
            break;
          }
        }
      }
    } else {
      if (this.GetParentWindow()) this.GetParentWindow()!.RemoveComponent(this);
      new_parent.children.push(this);
    }
    this._parent = new_parent;
  }
  GetParent(): Panel | null { return this._parent; }

  OnContextMenuAction(_item: number): void {}
  Tick(): void {}
  Draw(_screenPos: Point): void { this.drawn = true; }
  OnMouseHover(_localx: number, _localy: number): void {}
  OnMouseMoved(_localx: number, _localy: number): void {}
  OnMouseEnter(_localx: number, _localy: number): void {}
  OnMouseLeave(_localx: number, _localy: number): void {}
  OnMouseDown(_x: number, _y: number, _button: number): void {}
  OnMouseUp(_x: number, _y: number, _button: number): void {}
  OnMouseClick(_localx: number, _localy: number, _button: number): void {}
  OnMouseWheel(_localx: number, _localy: number, _d: number): void {}
  OnMouseWheelInside(_localx: number, _localy: number, _d: number): void {}
  OnKeyPress(_key: number, _scan: number, _repeat: boolean, _shift: boolean, _ctrl: boolean, _alt: boolean): void {}
  OnKeyRelease(_key: number, _scan: number, _repeat: boolean, _shift: boolean, _ctrl: boolean, _alt: boolean): void {}
  OnTextInput(_text: string): void {}
  OnTextEditing(_text: string): void {}
  OnFocus(): void {}
  OnDefocus(): void {}
}

/** what Component needs of ContextMenu (ContextMenu.ts) */
export interface ContextMenuLike {
  Show(position: Point): void;
  AddItem(item: { ID: number; Text: string; Enabled: boolean }): void;
  RemoveItem(id: number): void;
  SetItem(id: number, text: string): void;
}

// ---------------------------------------------------------------------------------------------------------------
// Panel

export class Panel extends Component {
  InnerSize: Point;
  ViewportPosition: Point = { X: 0, Y: 0 };
  children: Component[] = [];

  constructor(position: Point, size: Point) {
    super(position, size);
    this.InnerSize = { X: size.X, Y: size.Y };
  }

  AddChild(c: Component): void {
    c.SetParent(this);
    c.SetParentWindow(this.GetParentWindow());
    c.MouseInside = false;
    c.MouseDownInside = false;
  }
  GetChildCount(): number { return this.children.length; }
  GetChild(idx: number): Component { return this.children[idx]; }
  /** RemoveChild(Component *c) and RemoveChild(unsigned idx, bool freeMem) */
  RemoveChild(c: Component | number, _freeMem = true): void {
    if (typeof c === 'number') {
      this.children.splice(c, 1);
      return;
    }
    for (let i = 0; i < this.children.length; ++i) {
      if (this.children[i] === c) {
        this.children.splice(i, 1);
        if (this.GetParentWindow()?.IsFocused(c)) this.GetParentWindow()!.FocusComponent(null);
        break;
      }
    }
  }
  override SetParentWindow(window: Window | null): void {
    super.SetParentWindow(window);
    for (const child of this.children) child.SetParentWindow(window);
  }

  override Draw(screenPos: Point): void {
    this.XDraw(screenPos);
    const g = this.GetGraphics();
    const old = g.SwapClipRect(screenPos.X, screenPos.Y, this.Size.X, this.Size.Y);
    for (const child of this.children) {
      if (child.Visible) {
        const rect = RectSized({ X: child.Position.X + this.ViewportPosition.X, Y: child.Position.Y + this.ViewportPosition.Y }, child.Size);
        const inter = rectAnd(rect, RectSized({ X: 0, Y: 0 }, this.Size));
        if (inter.size.X > 0 && inter.size.Y > 0)
          child.Draw({ X: screenPos.X + rect.pos.X, Y: screenPos.Y + rect.pos.Y });
      }
    }
    g.SwapClipRect(old.pos.X, old.pos.Y, old.size.X, old.size.Y);
  }
  override Tick(): void {
    this.XTick();
    for (let i = 0; i < this.children.length; ++i) this.children[i].Tick();
  }
  override OnKeyPress(key: number, scan: number, repeat: boolean, shift: boolean, ctrl: boolean, alt: boolean): void {
    this.XOnKeyPress(key, scan, repeat, shift, ctrl, alt);
  }
  override OnKeyRelease(key: number, scan: number, repeat: boolean, shift: boolean, ctrl: boolean, alt: boolean): void {
    this.XOnKeyRelease(key, scan, repeat, shift, ctrl, alt);
  }
  override OnMouseClick(localx: number, localy: number, button: number): void {
    this.XOnMouseClick(localx, localy, button);
  }
  private inside(c: Component, lx: number, ly: number): boolean {
    const px = c.Position.X + this.ViewportPosition.X, py = c.Position.Y + this.ViewportPosition.Y;
    return lx >= px && ly >= py && lx < px + c.Size.X && ly < py + c.Size.Y;
  }
  override OnMouseDown(x: number, y: number, button: number): void {
    if (this.MouseDownInside) {
      const localx = x - this.Position.X, localy = y - this.Position.Y;
      for (let i = this.children.length - 1; i >= 0; --i) {
        if (this.children[i].Enabled && this.inside(this.children[i], localx, localy)) {
          this.GetParentWindow()!.FocusComponent(this.children[i]);
          this.children[i].MouseDownInside = true;
          break;
        }
      }
      this.XOnMouseDown(x, y, button);
      for (let i = 0; i < this.children.length; ++i) {
        if (this.children[i].Enabled)
          this.children[i].OnMouseDown(x - this.Position.X - this.ViewportPosition.X, y - this.Position.Y - this.ViewportPosition.Y, button);
      }
    }
  }
  override OnMouseHover(localx: number, localy: number): void {
    for (let i = this.children.length - 1; i >= 0; --i) {
      const c = this.children[i];
      if (c.Enabled && this.inside(c, localx, localy)) {
        c.OnMouseHover(localx - c.Position.X - this.ViewportPosition.X, localy - c.Position.Y - this.ViewportPosition.Y);
        break;
      }
    }
    this.XOnMouseHover(localx, localy);
  }
  override OnMouseMoved(localx: number, localy: number): void {
    this.PropagateMouseMove();
    this.XOnMouseMoved(localx, localy);
    for (let i = 0; i < this.children.length; ++i) {
      const c = this.children[i];
      if (c.Enabled) c.OnMouseMoved(localx - c.Position.X - this.ViewportPosition.X, localy - c.Position.Y - this.ViewportPosition.Y);
    }
  }
  protected PropagateMouseMove(): void {
    const sp = this.GetScreenPos();
    const localx = Engine.Ref().GetMouseX() - sp.X;
    const localy = Engine.Ref().GetMouseY() - sp.Y;
    for (let i = 0; i < this.children.length; ++i) {
      const c = this.children[i];
      if (c.Enabled) {
        const lx = localx - c.Position.X - this.ViewportPosition.X, ly = localy - c.Position.Y - this.ViewportPosition.Y;
        if (lx >= 0 && ly >= 0 && lx < c.Size.X && ly < c.Size.Y) {
          c.OnMouseMoved(lx, ly);
          if (!c.MouseInside) {
            c.MouseInside = true;
            c.OnMouseEnter(lx, ly);
          }
        } else if (c.MouseInside) {
          c.MouseInside = false;
          c.OnMouseLeave(lx, ly);
        }
      }
    }
  }
  override OnMouseEnter(localx: number, localy: number): void { this.XOnMouseEnter(localx, localy); }
  override OnMouseLeave(localx: number, localy: number): void { this.XOnMouseLeave(localx, localy); }
  override OnMouseUp(x: number, y: number, button: number): void {
    const localx = x - this.Position.X, localy = y - this.Position.Y;
    for (let i = this.children.length - 1; i >= 0; --i) {
      const c = this.children[i];
      if (c.Enabled && c.MouseDownInside && this.inside(c, localx, localy)) {
        c.OnMouseClick(localx - c.Position.X - this.ViewportPosition.X, localy - c.Position.Y - this.ViewportPosition.Y, button);
        break;
      }
    }
    for (const child of this.children) child.MouseDownInside = false;
    this.XOnMouseUp(x, y, button);
    for (let i = 0; i < this.children.length; ++i) {
      if (this.children[i].Enabled)
        this.children[i].OnMouseUp(x - this.Position.X - this.ViewportPosition.X, y - this.Position.Y - this.ViewportPosition.Y, button);
    }
  }
  override OnMouseWheel(localx: number, localy: number, d: number): void {
    this.XOnMouseWheel(localx, localy, d);
    for (let i = 0; i < this.children.length; ++i) {
      const c = this.children[i];
      if (c.Enabled) c.OnMouseWheel(localx - c.Position.X - this.ViewportPosition.X, localy - c.Position.Y - this.ViewportPosition.Y, d);
    }
  }
  override OnMouseWheelInside(localx: number, localy: number, d: number): void {
    this.XOnMouseWheelInside(localx, localy, d);
    for (let i = this.children.length - 1; i >= 0; --i) {
      const c = this.children[i];
      if (c.Enabled && this.inside(c, localx, localy)) {
        c.OnMouseWheelInside(localx - c.Position.X - this.ViewportPosition.X, localy - c.Position.Y - this.ViewportPosition.Y, d);
        break;
      }
    }
  }
  protected XDraw(_screenPos: Point): void {}
  protected XTick(): void {}
  protected XOnKeyPress(_key: number, _scan: number, _repeat: boolean, _shift: boolean, _ctrl: boolean, _alt: boolean): void {}
  protected XOnKeyRelease(_key: number, _scan: number, _repeat: boolean, _shift: boolean, _ctrl: boolean, _alt: boolean): void {}
  protected XOnMouseClick(_localx: number, _localy: number, _button: number): void {}
  protected XOnMouseDown(_x: number, _y: number, _button: number): void {}
  protected XOnMouseHover(_localx: number, _localy: number): void {}
  protected XOnMouseMoved(_localx: number, _localy: number): void {}
  protected XOnMouseEnter(_localx: number, _localy: number): void {}
  protected XOnMouseLeave(_localx: number, _localy: number): void {}
  protected XOnMouseUp(_x: number, _y: number, _button: number): void {}
  protected XOnMouseWheel(_localx: number, _localy: number, _d: number): void {}
  protected XOnMouseWheelInside(_localx: number, _localy: number, _d: number): void {}
}

// ---------------------------------------------------------------------------------------------------------------
// Window

export const ExitMethod = { MouseOutside: 0, Escape: 1, ExitButton: 2 } as const;
export const OkayMethod = { Enter: 0, OkayButton: 1 } as const;

/** what Window needs of Button (Button.ts) */
export interface ButtonLike {
  DoAction(): void;
}

export class Window {
  contributesToFps = false;
  Position: Point;
  Size: Point;
  AllowExclusiveDrawing = true;
  DoesTextInput = false;
  UserData: unknown = null;
  protected okayButton: ButtonLike | null = null;
  protected cancelButton: ButtonLike | null = null;
  protected Components: Component[] = [];
  protected focusedComponent_: Component | null = null;
  protected hoverComponent: Component | null = null;
  protected debugMode = false;
  protected halt = false;
  protected destruct = false;
  protected stop = false;
  protected fps = 1;
  protected fpsLimit: FpsLimit = { kind: 'followDraw' };

  constructor(position: Point, size: Point) {
    this.Position = { X: position.X, Y: position.Y };
    this.Size = { X: size.X, Y: size.Y };
    this.SetFps(1);
  }

  SetOkayButton(button: ButtonLike | null): void { this.okayButton = button; }
  SetCancelButton(button: ButtonLike | null): void { this.cancelButton = button; }

  AddComponent(c: Component): void {
    if (c.GetParentWindow() === null) {
      c.SetParentWindow(this);
      c.MouseInside = false;
      c.MouseDownInside = false;
      this.Components.push(c);
      const e = Engine.Ref();
      if (e.GetMouseX() > this.Position.X + c.Position.X && e.GetMouseX() < this.Position.X + c.Position.X + c.Size.X &&
        e.GetMouseY() > this.Position.Y + c.Position.Y && e.GetMouseY() < this.Position.Y + c.Position.Y + c.Size.Y) {
        c.MouseInside = true;
        c.OnMouseEnter(e.GetMouseX() - (this.Position.X + c.Position.X), e.GetMouseY() - (this.Position.Y + c.Position.Y));
      }
    }
  }
  GetComponentCount(): number { return this.Components.length; }
  GetComponent(idx: number): Component { return this.Components[idx]; }
  /** RemoveComponent(Component *c) (keeps it) and RemoveComponent(unsigned idx) (frees it) */
  RemoveComponent(c: Component | number): void {
    if (typeof c === 'number') {
      this.halt = true;
      if (this.Components[c] === this.focusedComponent_) this.focusedComponent_ = null;
      if (this.Components[c] === this.hoverComponent) this.hoverComponent = null;
      this.Components.splice(c, 1);
      return;
    }
    for (let i = 0; i < this.Components.length; ++i) {
      if (this.Components[i] === c) {
        this.halt = true;
        if (this.Components[i] === this.focusedComponent_) this.focusedComponent_ = null;
        if (this.Components[i] === this.hoverComponent) this.hoverComponent = null;
        this.Components.splice(i, 1);
        c.SetParentWindow(null);
        return;
      }
    }
  }

  ToolTip(_senderPosition: Point, _toolTip: string): void {}

  DoInitialized(): void { this.OnInitialized(); }
  DoExit(): void { this.OnExit(); }
  DoBlur(): void { this.OnBlur(); }
  DoFocus(): void { this.OnFocus(); }
  DoFileDrop(filename: string): void { this.OnFileDrop(filename); }

  DoDraw(): void {
    this.OnDraw();
    const g = this.GetGraphics();
    const drawChild = (child: Component) => {
      if (child.Visible) {
        const x = this.Position.X + child.Position.X, y = this.Position.Y + child.Position.Y;
        const inter = rectAnd(RectSized({ X: x, Y: y }, child.Size), RectSized({ X: 0, Y: 0 }, g.Size()));
        if (this.AllowExclusiveDrawing || (inter.size.X > 0 && inter.size.Y > 0)) child.Draw({ X: x, Y: y });
      }
    };
    for (const child of this.Components.slice()) {
      if ((child !== this.focusedComponent_ && child !== this.hoverComponent) || child.GetParent()) {
        drawChild(child);
        if (this.debugMode)
          g.BlendFilledRect(this.Position.X + child.Position.X, this.Position.Y + child.Position.Y, child.Size.X, child.Size.Y,
            WithAlpha(this.focusedComponent_ === child ? 0x00FF00 : 0xFF0000, 0x5A));
      }
    }
    if (this.hoverComponent && this.hoverComponent.GetParent() === null) drawChild(this.hoverComponent);
    if (this.focusedComponent_ && this.focusedComponent_ !== this.hoverComponent && this.focusedComponent_.GetParent() === null)
      drawChild(this.focusedComponent_);
  }

  DoTick(): void {
    if (this.debugMode) return;
    const e = Engine.Ref();
    if (this.DoesTextInput || (this.focusedComponent_ && this.focusedComponent_.Visible && this.focusedComponent_.Enabled && this.focusedComponent_.DoesTextInput))
      e.StartTextInput();
    else
      e.StopTextInput();
    for (let i = this.Components.length - 1; i >= 0 && !this.halt; --i) {
      const c = this.Components[i];
      if (c.Enabled &&
        e.GetMouseX() >= c.Position.X + this.Position.X && e.GetMouseY() >= c.Position.Y + this.Position.Y &&
        e.GetMouseX() < c.Position.X + this.Position.X + c.Size.X && e.GetMouseY() < c.Position.Y + this.Position.Y + c.Size.Y) {
        c.OnMouseHover(e.GetMouseX() - (c.Position.X + this.Position.X), e.GetMouseY() - (c.Position.Y + this.Position.Y));
        break;
      }
    }
    for (let i = 0, sz = this.Components.length; i < sz && !this.halt; ++i) this.Components[i]?.Tick();
    this.halt = false;
    this.stop = false;
    this.OnTick();
    if (this.destruct) this.finalise();
  }

  DoSimTick(): void { this.OnSimTick(); }

  DoKeyPress(key: number, scan: number, repeat: boolean, shift: boolean, ctrl: boolean, alt: boolean): void {
    if (this.focusedComponent_ !== null) {
      if (this.focusedComponent_.Enabled && this.focusedComponent_.Visible)
        this.focusedComponent_.OnKeyPress(key, scan, repeat, shift, ctrl, alt);
    }
    if (!this.stop) this.OnKeyPress(key, scan, repeat, shift, ctrl, alt);
    if (key === SDLK_ESCAPE || key === SDLK_AC_BACK) this.OnTryExit(ExitMethod.Escape);
    if (key === SDLK_KP_ENTER || key === SDLK_RETURN) this.OnTryOkay(OkayMethod.Enter);
    if (this.destruct) this.finalise();
  }
  DoKeyRelease(key: number, scan: number, repeat: boolean, shift: boolean, ctrl: boolean, alt: boolean): void {
    if (this.focusedComponent_ !== null) {
      if (this.focusedComponent_.Enabled && this.focusedComponent_.Visible)
        this.focusedComponent_.OnKeyRelease(key, scan, repeat, shift, ctrl, alt);
    }
    if (!this.stop) this.OnKeyRelease(key, scan, repeat, shift, ctrl, alt);
    if (this.destruct) this.finalise();
  }
  DoTextInput(text: string): void {
    if (this.focusedComponent_ !== null) {
      if (this.focusedComponent_.Enabled && this.focusedComponent_.Visible) this.focusedComponent_.OnTextInput(text);
    }
    if (!this.stop) this.OnTextInput(text);
    if (this.destruct) this.finalise();
  }
  DoTextEditing(text: string): void {
    if (this.focusedComponent_ !== null) {
      if (this.focusedComponent_.Enabled && this.focusedComponent_.Visible) this.focusedComponent_.OnTextEditing(text);
    }
    if (!this.stop) this.OnTextEditing(text);
    if (this.destruct) this.finalise();
  }

  DoMouseDown(x_: number, y_: number, button: number): void {
    const x = x_ - this.Position.X, y = y_ - this.Position.Y;
    let clickState = false;
    for (let i = this.Components.length - 1; i > -1 && !this.halt; --i) {
      const c = this.Components[i];
      if (c.Enabled && c.Visible) {
        if (x >= c.Position.X && y >= c.Position.Y && x < c.Position.X + c.Size.X && y < c.Position.Y + c.Size.Y) {
          this.FocusComponent(c);
          c.MouseDownInside = true;
          clickState = true;
          break;
        }
      }
    }
    if (!clickState) this.FocusComponent(null);
    for (let i = this.Components.length - 1; i > -1 && !this.halt; --i) {
      const c = this.Components[i];
      if (c && c.Enabled && c.Visible) c.OnMouseDown(x, y, button);
    }
    if (!this.stop) this.OnMouseDown(x_, y_, button);
    if (!clickState && (x_ < this.Position.X || y_ < this.Position.Y || x_ > this.Position.X + this.Size.X || y_ > this.Position.Y + this.Size.Y))
      this.OnTryExit(ExitMethod.MouseOutside);
    if (this.destruct) this.finalise();
  }

  DoMouseMove(x_: number, y_: number, dx: number, dy: number): void {
    const x = x_ - this.Position.X, y = y_ - this.Position.Y;
    for (let i = this.Components.length - 1; i > -1 && !this.halt; --i) {
      const c = this.Components[i];
      if (c && c.Enabled && c.Visible) {
        const lx = x - c.Position.X, ly = y - c.Position.Y;
        c.OnMouseMoved(lx, ly);
        if (lx >= 0 && ly >= 0 && lx < c.Size.X && ly < c.Size.Y && !this.halt) {
          if (!c.MouseInside) {
            c.MouseInside = true;
            c.OnMouseEnter(lx, ly);
          }
          if (c.Enabled) this.hoverComponent = c;
        } else if (!this.halt) {
          if (c.MouseInside) {
            c.MouseInside = false;
            c.OnMouseLeave(lx, ly);
          }
        }
      }
    }
    void dx; void dy;
    if (!this.stop) this.OnMouseMove(x_, y_, dx, dy);
    if (this.destruct) this.finalise();
  }

  DoMouseUp(x_: number, y_: number, button: number): void {
    const x = x_ - this.Position.X, y = y_ - this.Position.Y;
    for (let i = this.Components.length - 1; i >= 0 && !this.halt; --i) {
      const c = this.Components[i];
      if (c.Enabled && c.Visible) {
        if (c.MouseDownInside && x >= c.Position.X && y >= c.Position.Y && x < c.Position.X + c.Size.X && y < c.Position.Y + c.Size.Y) {
          c.OnMouseClick(x - c.Position.X, y - c.Position.Y, button);
          break;
        }
      }
    }
    for (const component of this.Components) component.MouseDownInside = false;
    for (let i = this.Components.length - 1; i >= 0 && !this.halt; --i) {
      const c = this.Components[i];
      if (c && c.Enabled && c.Visible) c.OnMouseUp(x, y, button);
    }
    if (!this.stop) this.OnMouseUp(x_, y_, button);
    if (this.destruct) this.finalise();
  }

  DoMouseWheel(x_: number, y_: number, d: number): void {
    const x = x_ - this.Position.X, y = y_ - this.Position.Y;
    for (let i = this.Components.length - 1; i >= 0 && !this.halt; --i) {
      const c = this.Components[i];
      if (x >= c.Position.X && y >= c.Position.Y && x < c.Position.X + c.Size.X && y < c.Position.Y + c.Size.Y) {
        if (c.Enabled && c.Visible) c.OnMouseWheelInside(x - c.Position.X, y - c.Position.Y, d);
        break;
      }
    }
    for (let i = this.Components.length - 1; i >= 0 && !this.halt; --i) {
      const c = this.Components[i];
      if (c && c.Enabled && c.Visible) c.OnMouseWheel(x - c.Position.X, y - c.Position.Y, d);
    }
    if (!this.stop) this.OnMouseWheel(x_, y_, d);
    if (this.destruct) this.finalise();
  }

  /** `delete this`: nothing to free in JavaScript; Destroy() is the destructor's hook */
  protected finalise(): void {
    this.destruct = false;
    this.Destroy();
  }
  protected Destroy(): void {}
  SelfDestruct(): void {
    this.destruct = true;
    this.halt = true;
    this.stop = true;
  }
  Halt(): void {
    this.stop = true;
    this.halt = true;
  }
  IsFocused(c: Component): boolean { return c === this.focusedComponent_; }
  FocusComponent(c: Component | null): void {
    if (this.focusedComponent_ !== c) {
      if (this.focusedComponent_) this.focusedComponent_.OnDefocus();
      this.focusedComponent_ = c;
      if (c) c.OnFocus();
    }
  }
  MakeActiveWindow(): void {
    if (Engine.Ref().GetWindow() !== this) Engine.Ref().ShowWindow(this);
  }
  CloseActiveWindow(): void {
    Engine.Ref().CloseWindowAndEverythingAbove(this);
  }
  GetGraphics(): Graphics {
    return Engine.Ref().g;
  }
  SetFps(newFps: number): void { this.fps = newFps; }
  GetFps(): number { return this.fps; }
  SetFpsLimit(newFpsLimit: FpsLimit): void { this.fpsLimit = newFpsLimit; }
  GetFpsLimit(): FpsLimit { return this.fpsLimit; }

  protected OnInitialized(): void {}
  protected OnExit(): void {}
  protected OnTick(): void {}
  protected OnSimTick(): void {}
  protected OnDraw(): void {}
  protected OnFocus(): void {}
  protected OnBlur(): void {}
  protected OnFileDrop(_filename: string): void {}
  protected OnTryExit(method: number): void {
    if (this.cancelButton && method !== ExitMethod.MouseOutside) this.cancelButton.DoAction();
  }
  protected OnTryOkay(_method: number): void {
    if (this.okayButton) this.okayButton.DoAction();
  }
  protected OnMouseMove(_x: number, _y: number, _dx: number, _dy: number): void {}
  protected OnMouseDown(_x: number, _y: number, _button: number): void {}
  protected OnMouseUp(_x: number, _y: number, _button: number): void {}
  protected OnMouseWheel(_x: number, _y: number, _d: number): void {}
  protected OnKeyPress(_key: number, _scan: number, _repeat: boolean, _shift: boolean, _ctrl: boolean, _alt: boolean): void {}
  protected OnKeyRelease(_key: number, _scan: number, _repeat: boolean, _shift: boolean, _ctrl: boolean, _alt: boolean): void {}
  protected OnTextInput(_text: string): void {}
  protected OnTextEditing(_text: string): void {}
}

// ---------------------------------------------------------------------------------------------------------------
// Engine

interface FrozenGraphics {
  fadeTicks: number;
  screen: Uint32Array;
}

export class Engine {
  private static instance: Engine | null = null;
  static Ref(): Engine {
    if (!Engine.instance) throw new Error('ui::Engine not created');
    return Engine.instance;
  }
  static Exists(): boolean { return Engine.instance !== null; }
  static Create(g: Graphics): Engine {
    Engine.instance = new Engine(g);
    return Engine.instance;
  }
  static Destroy(): void { Engine.instance = null; }

  drawingFrequencyLimit: DrawLimit = { kind: 'explicit', value: 60 };
  g: Graphics;
  confirmingExit = false;
  GraveExitsConsole = true;
  FrameIndex = 0;
  MomentumScroll = true;
  ShowAvatars = true;
  TouchUI = false;
  /** the browser port's quit: set by index.ts (ctx.exit) */
  onQuit: (() => void) | null = null;
  /** the browser port's text input switch (shows a phone keyboard), set by index.ts */
  onTextInputChange: ((on: boolean) => void) | null = null;

  private textInput = false;
  private windows: Window[] = [];
  private mousePositions: Point[] = [];
  private state_: Window | null = null;
  private ignoreEvents = false;
  private frozenGraphics: FrozenGraphics[] = [];
  private static readonly maxFadeTicks = 20;
  private running_ = false;
  private FastQuit = true;
  private GlobalQuit = true;
  private lastTick = GetTicks();
  private mouseb_ = 0;
  private mousex_ = 0;
  private mousey_ = 0;
  private mousexp_ = 0;
  private mouseyp_ = 0;
  refreshRate = { value: 60, queried: false };

  private constructor(g: Graphics) {
    this.g = g;
  }

  Begin(): void { this.running_ = true; }
  Running(): boolean { return this.running_; }
  LastTick(): number { return this.lastTick; }
  Exit(): void {
    this.onClose();
    this.running_ = false;
    if (this.onQuit) this.onQuit();
  }
  ConfirmExit(): void {
    if (!this.confirmingExit) {
      this.confirmingExit = true;
      // ConfirmPrompt is created through a hook to avoid an import cycle (dialogues import the interface)
      Engine.confirmPrompt?.('You are about to quit', 'Are you sure you want to exit the game?', () => {
        Engine.Ref().Exit();
      }, () => {
        this.confirmingExit = false;
      });
    }
  }
  static confirmPrompt: ((title: string, message: string, okay: () => void, cancel: () => void) => void) | null = null;

  ShowWindow(window: Window): void {
    this.CloseWindowAndEverythingAbove(window);
    if (this.state_) this.ignoreEvents = true;
    const size = this.g.Size();
    if (window.Position.X === -1) window.Position.X = ((size.X - window.Size.X) / 2) | 0;
    if (window.Position.Y === -1) window.Position.Y = ((size.Y - window.Size.Y) / 2) | 0;
    window.Size = { X: Math.min(window.Size.X, size.X), Y: Math.min(window.Size.Y, size.Y) };
    window.Position = { X: Math.min(Math.max(window.Position.X, 0), size.X), Y: Math.min(Math.max(window.Position.Y, 0), size.Y) };
    if (this.state_) {
      this.frozenGraphics.push({ fadeTicks: 0, screen: this.g.Data().slice() });
      this.windows.push(this.state_);
      this.mousePositions.push({ X: this.mousex_, Y: this.mousey_ });
    }
    if (this.state_) this.state_.DoBlur();
    this.state_ = window;
  }

  CloseWindowAndEverythingAbove(window: Window): void {
    if (window === this.state_) {
      this.CloseWindow();
      return;
    }
    const it = this.windows.indexOf(window);
    if (it !== -1) {
      const toPop = this.windows.length - it + 1;
      for (let i = 0; i < toPop; ++i) this.CloseWindow();
    }
  }

  CloseWindow(): number {
    if (this.windows.length) {
      this.frozenGraphics.pop();
      this.state_ = this.windows.pop()!;
      if (this.state_) this.state_.DoFocus();
      const mouseState = this.mousePositions.pop()!;
      if (this.state_) {
        this.mousexp_ = mouseState.X;
        this.mouseyp_ = mouseState.Y;
        this.state_.DoMouseMove(this.mousex_, this.mousey_, this.mousex_ - this.mousexp_, this.mousey_ - this.mouseyp_);
        this.mousexp_ = this.mousex_;
        this.mouseyp_ = this.mousey_;
      }
      this.ignoreEvents = true;
      return 0;
    } else {
      this.state_ = null;
      return 1;
    }
  }

  Tick(): void {
    if (this.state_ !== null) this.state_.DoTick();
    this.lastTick = GetTicks();
    this.ignoreEvents = false;
  }
  SimTick(): void {
    if (this.state_) this.state_.DoSimTick();
  }
  Draw(): void {
    const g = this.g;
    const size = g.Size();
    const st = this.state_;
    if (this.frozenGraphics.length && !(st && st.Position.X === 0 && st.Position.Y === 0 && st.Size.X === size.X && st.Size.Y === size.Y)) {
      const frozen = this.frozenGraphics[this.frozenGraphics.length - 1];
      g.Data().set(frozen.screen);
      if (frozen.fadeTicks <= Engine.maxFadeTicks) {
        // from 0x00 at 0 to about 0x54 at 20
        const alpha = Math.trunc((1 - Math.pow(0.98, frozen.fadeTicks)) * 0xFF) & 0xFF;
        g.BlendFilledRect(0, 0, size.X, size.Y, WithAlpha(0x000000, alpha));
      }
      if (frozen.fadeTicks === Engine.maxFadeTicks) frozen.screen.set(g.Data());
      if (frozen.fadeTicks <= Engine.maxFadeTicks) frozen.fadeTicks++;
    } else {
      g.Clear();
    }
    if (this.state_) this.state_.DoDraw();
    g.Finalise();
    this.FrameIndex++;
    this.FrameIndex %= 7200;
  }

  onKeyPress(key: number, scan: number, repeat: boolean, shift: boolean, ctrl: boolean, alt: boolean): void {
    if (this.state_ && !this.ignoreEvents) this.state_.DoKeyPress(key, scan, repeat, shift, ctrl, alt);
  }
  onKeyRelease(key: number, scan: number, repeat: boolean, shift: boolean, ctrl: boolean, alt: boolean): void {
    if (this.state_ && !this.ignoreEvents) this.state_.DoKeyRelease(key, scan, repeat, shift, ctrl, alt);
  }
  onTextInput(text: string): void {
    if (this.textInput) {
      if (this.state_ && !this.ignoreEvents) this.state_.DoTextInput(text);
    }
  }
  onMouseDown(x: number, y: number, button: number): void {
    this.mouseb_ |= button;
    if (this.state_ && !this.ignoreEvents) this.state_.DoMouseDown(x, y, button);
  }
  onMouseUp(x: number, y: number, button: number): void {
    this.mouseb_ &= ~button;
    if (this.state_ && !this.ignoreEvents) this.state_.DoMouseUp(x, y, button);
  }
  initialMouse(x: number, y: number): void {
    this.mousexp_ = x;
    this.mouseyp_ = y;
  }
  onMouseMove(x: number, y: number): void {
    this.mousex_ = x;
    this.mousey_ = y;
    if (this.state_ && !this.ignoreEvents) this.state_.DoMouseMove(x, y, this.mousex_ - this.mousexp_, this.mousey_ - this.mouseyp_);
    this.mousexp_ = x;
    this.mouseyp_ = y;
  }
  onMouseWheel(x: number, y: number, delta: number): void {
    if (this.state_ && !this.ignoreEvents) this.state_.DoMouseWheel(x, y, delta);
  }
  onClose(): void {
    if (this.state_) this.state_.DoExit();
  }
  onFileDrop(filename: string): void {
    if (this.state_) this.state_.DoFileDrop(filename);
  }
  StartTextInput(): void {
    if (this.textInput) return;
    this.textInput = true;
    this.onTextInputChange?.(true);
  }
  StopTextInput(): void {
    if (!this.textInput) return;
    this.onTextInputChange?.(false);
    this.textInput = false;
  }
  TextInputRect(_position: Point, _size: Point): void {}
  IsTextInput(): boolean { return this.textInput; }

  SetDrawingFrequencyLimit(limit: DrawLimit): void { this.drawingFrequencyLimit = limit; }
  GetDrawingFrequencyLimit(): DrawLimit { return this.drawingFrequencyLimit; }
  GetEffectiveDrawCap(): number | null {
    const drawLimit = this.GetDrawingFrequencyLimit();
    if (drawLimit.kind === 'explicit') return drawLimit.value;
    return this.refreshRate.value;
  }
  SetFastQuit(fastquit: boolean): void { this.FastQuit = fastquit; }
  GetFastQuit(): boolean { return this.FastQuit; }
  SetGlobalQuit(v: boolean): void { this.GlobalQuit = v; }
  GetGlobalQuit(): boolean { return this.GlobalQuit; }
  SetFps(newFps: number): void {
    if (this.state_) this.state_.SetFps(newFps);
  }
  GetFps(): number {
    if (this.state_) return this.state_.GetFps();
    return 1;
  }
  GetMouseButton(): number { return this.mouseb_; }
  GetMouseX(): number { return this.mousex_; }
  GetMouseY(): number { return this.mousey_; }
  GetWindow(): Window | null { return this.state_; }
  GetFpsLimit(): FpsLimit {
    if (this.state_) return this.state_.GetFpsLimit();
    return { kind: 'none' };
  }
  GetContributesToFps(): boolean {
    if (this.state_) return this.state_.contributesToFps;
    return false;
  }

  // ---- PowderToySDL.cpp EngineProcess ----
  private tickSchedule = new FrameSchedule();
  private drawSchedule = new FrameSchedule();
  private fpsUpdateSchedule = new FrameSchedule();
  private correctedFrameTimeAvg = 0;
  private prevContributesToFps = false;

  /**
   * One pass of EngineProcess: called on every animation frame with the time in ns. The schedules decide
   * whether to tick, simulate and draw, so a 120 Hz display still runs at the 60 fps cap. Returns true if the
   * window was drawn (the caller then blits g).
   */
  Process(nowNs: number): boolean {
    if (this.fpsUpdateSchedule.HasElapsed(nowNs)) {
      if (this.correctedFrameTimeAvg > 0) this.SetFps(1e9 / this.correctedFrameTimeAvg);
      this.fpsUpdateSchedule.SetNow(nowNs);
    }
    this.fpsUpdateSchedule.Arm(5);
    const effectiveDrawLimit = this.GetEffectiveDrawCap();
    // a little slack (1 ms) so that a 60 Hz display's frames, which arrive within jitter of 16.67 ms, are not skipped
    const slackNs = 1e6;
    const doDraw = effectiveDrawLimit === null || this.drawSchedule.HasElapsed(nowNs + slackNs);
    const fpsLimit = this.GetFpsLimit();
    let doSimTick = true;
    if (fpsLimit.kind === 'explicit') doSimTick = this.tickSchedule.HasElapsed(nowNs + slackNs);
    else if (fpsLimit.kind === 'followDraw') doSimTick = doDraw;
    if (doDraw) this.Tick();
    if (doSimTick) {
      const thisContributesToFps = this.GetContributesToFps();
      if (this.prevContributesToFps && thisContributesToFps) {
        const correctedFrameTime = this.tickSchedule.GetFrameTime();
        this.correctedFrameTimeAvg = this.correctedFrameTimeAvg + (correctedFrameTime - this.correctedFrameTimeAvg) * 0.05;
      }
      this.prevContributesToFps = thisContributesToFps;
      this.SimTick();
      this.tickSchedule.SetNow(nowNs);
    }
    if (doDraw) {
      this.Draw();
      this.drawSchedule.SetNow(nowNs);
    }
    if (effectiveDrawLimit !== null) this.drawSchedule.Arm(effectiveDrawLimit);
    if (fpsLimit.kind === 'explicit') this.tickSchedule.Arm(fpsLimit.value);
    return doDraw;
  }
}
