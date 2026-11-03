// gui/game/ToolButton.h / ToolButton.cpp
import { Button } from '../interface/Button.ts';
import { Component } from '../interface/Engine.ts';
import { Favorite } from './Menu.ts';
import { Colour, Red, Green, Blue, WithAlpha, type Point, type Rect } from '../interface/Point.ts';
import { SDL_BUTTON_LEFT, SDL_BUTTON_MIDDLE, SDL_BUTTON_RIGHT } from '../interface/Keys.ts';
import type { Tool } from '../../sim/tools.ts';

export class ToolButton extends Button {
  private currentSelection = -1;
  private toolIdentifier: string;
  tool: Tool | null = null;
  ClipRect: Rect = { pos: { X: 0, Y: 0 }, size: { X: 0, Y: 0 } };

  constructor(position: Point, size: Point, text: string, toolIdentifier: string, toolTip = '') {
    super(position, size, text, toolTip);
    this.toolIdentifier = toolIdentifier;
    this.SetSelectionState(-1);
    this.Appearance.BorderActive = Colour(255, 0, 0);
    this.Appearance.BorderFavorite = Colour(255, 255, 0);
    //don't use "..." on elements that have long names
    this.buttonDisplayText = this.ButtonText.slice(0, 7);
    Component.prototype.TextPosition.call(this, this.buttonDisplayText);
  }

  override OnMouseDown(_x: number, _y: number, _button: number): void {
    if (this.MouseDownInside) this.isButtonDown = true;
  }
  override OnMouseClick(_x: number, _y: number, button: number): void {
    if (this.isButtonDown) {
      this.isButtonDown = false;
      if (button === SDL_BUTTON_LEFT) this.SetSelectionState(0);
      if (button === SDL_BUTTON_RIGHT) this.SetSelectionState(1);
      if (button === SDL_BUTTON_MIDDLE) this.SetSelectionState(2);
      this.DoAction();
    }
  }
  override OnMouseUp(_x: number, _y: number, _button: number): void {
    this.isButtonDown = false;
  }
  override Draw(screenPos: Point): void {
    const g = this.GetGraphics();
    const clip = this.ClipRect;
    let old: { pos: Point; size: Point } | null = null;
    if (clip.size.X && clip.size.Y) old = g.SwapClipRect(clip.pos.X, clip.pos.Y, clip.size.X, clip.size.Y);
    const bg = this.Appearance.BackgroundInactive;
    const totalColour = Blue(bg) + (3 * Green(bg)) + (2 * Red(bg));
    const tex = this.Appearance.GetTexture();
    if (tex) {
      const s = tex.Size();
      g.BlendImage(tex.Data(), 255, screenPos.X + 2, screenPos.Y + 2, s.X, s.Y);
    } else {
      g.BlendFilledRect(screenPos.X + 2, screenPos.Y + 2, this.Size.X - 4, this.Size.Y - 4, bg);
    }
    if (this.isMouseInside && this.currentSelection === -1)
      g.BlendRect(screenPos.X, screenPos.Y, this.Size.X, this.Size.Y, this.Appearance.BorderActive);
    else
      g.BlendRect(screenPos.X, screenPos.Y, this.Size.X, this.Size.Y, this.Appearance.BorderInactive);
    if (Favorite.Ref().IsFavorite(this.toolIdentifier))
      g.BlendText(screenPos.X, screenPos.Y, String.fromCharCode(0xE068), this.Appearance.BorderFavorite);
    if (totalColour < 544)
      g.BlendText(screenPos.X + this.textPosition.X, screenPos.Y + this.textPosition.Y, this.buttonDisplayText, WithAlpha(0xFFFFFF, 255));
    else
      g.BlendText(screenPos.X + this.textPosition.X, screenPos.Y + this.textPosition.Y, this.buttonDisplayText, WithAlpha(0x000000, 255));
    if (old) g.SwapClipRect(old.pos.X, old.pos.Y, old.size.X, old.size.Y);
  }
  SetSelectionState(state: number): void {
    this.currentSelection = state;
    switch (state) {
      case 0: this.Appearance.BorderInactive = Colour(255, 0, 0); break;
      case 1: this.Appearance.BorderInactive = Colour(0, 0, 255); break;
      case 2: this.Appearance.BorderInactive = Colour(0, 255, 0); break;
      case 3: this.Appearance.BorderInactive = Colour(0, 255, 255); break;
      default: this.Appearance.BorderInactive = Colour(0, 0, 0); break;
    }
  }
  GetSelectionState(): number { return this.currentSelection; }
}
