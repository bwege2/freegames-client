// gui/interface/ContextMenu.h / ContextMenu.cpp
import { Window, type Component } from './Engine.ts';
import { Button } from './Button.ts';
import type { Point } from './Point.ts';
import { WINDOWW, YRES, MENUSIZE } from '../../sim/config.ts';

export class ContextMenuItem {
  ID: number;
  Text: string;
  Enabled: boolean;
  constructor(text: string, id: number, enabled: boolean) {
    this.ID = id;
    this.Text = text;
    this.Enabled = enabled;
  }
}

export class ContextMenu extends Window {
  private buttons: Button[] = [];
  private items: ContextMenuItem[] = [];
  private source: Component;
  Appearance;

  constructor(source: Component) {
    super({ X: 0, Y: 0 }, { X: 0, Y: 0 });
    this.source = source;
    this.Appearance = source.Appearance.clone();
  }

  Show(position: Point): void {
    position = { X: position.X, Y: position.Y };
    for (const b of this.buttons) this.RemoveComponent(b);
    this.buttons = [];
    this.Size.X = 100;
    this.Size.Y = this.items.length * 16 - 1;
    if (position.X + this.Size.X > WINDOWW) position.X -= Math.min(position.X, this.Size.X);
    if (position.Y + this.Size.Y > YRES + MENUSIZE) position.Y -= Math.min(position.Y, this.Size.Y);
    this.Position = position;
    let currentY = 1;
    for (const it of this.items) {
      const tempButton = new Button({ X: 1, Y: currentY }, { X: this.Size.X - 2, Y: 16 }, it.Text);
      tempButton.Appearance = this.Appearance.clone();
      tempButton.Enabled = it.Enabled;
      const item = it.ID;
      tempButton.SetActionCallback({ action: () => this.ActionCallbackItem(tempButton, item) });
      this.buttons.push(tempButton);
      this.AddComponent(tempButton);
      currentY += 15;
    }
    this.MakeActiveWindow();
  }
  ActionCallbackItem(_sender: Button, item: number): void {
    this.CloseActiveWindow();
    this.Halt();
    this.source.OnContextMenuAction(item);
  }
  protected override OnMouseDown(x: number, y: number, _button: number): void {
    // Clicked outside window
    if (!(x > this.Position.X && y > this.Position.Y && y < this.Position.Y + this.Size.Y && x < this.Position.X + this.Size.X))
      this.CloseActiveWindow();
  }
  SetItem(id: number, text: string): void {
    for (const it of this.items) {
      if (it.ID === id) {
        it.Text = text;
        break;
      }
    }
  }
  RemoveItem(id: number): void {
    const i = this.items.findIndex((it) => it.ID === id);
    if (i !== -1) this.items.splice(i, 1);
  }
  AddItem(item: ContextMenuItem | { ID: number; Text: string; Enabled: boolean }): void {
    this.items.push(item);
  }
  protected override OnDraw(): void {
    const g = this.GetGraphics();
    g.DrawFilledRect(this.Position.X, this.Position.Y, this.Size.X, this.Size.Y, 0x646464);
    g.BlendRect(this.Position.X, this.Position.Y, this.Size.X, this.Size.Y, this.Appearance.BackgroundInactive);
  }
}
