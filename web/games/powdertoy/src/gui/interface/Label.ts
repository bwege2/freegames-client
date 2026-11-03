// gui/interface/Label.h / Label.cpp, Textbox.h / Textbox.cpp, RichLabel.h / RichLabel.cpp
import { Component, Engine } from './Engine.ts';
import { ContextMenu, ContextMenuItem } from './ContextMenu.ts';
import { TextWrapper, type Index } from './TextWrapper.ts';
import { FONT_H } from '../../graphics/font.ts';
import { WithAlpha, NoAlpha, rectAnd, RectSized, Colour, type Point } from './Point.ts';
import {
  SDL_BUTTON_RIGHT, SDL_SCANCODE_A, SDL_SCANCODE_C, SDL_SCANCODE_V, SDL_SCANCODE_X, SDLK_HOME, SDLK_END, SDLK_LEFT,
  SDLK_RIGHT, SDLK_DELETE, SDLK_BACKSPACE, SDLK_RETURN, ClipboardPush, ClipboardPull, OpenURI, GetTicks,
} from './Keys.ts';
import { CleanString } from '../Format.ts';

export class Label extends Component {
  protected textFragments = '';
  protected displayTextWithSelection = '';
  protected text = '';
  protected textWrapper = new TextWrapper();
  protected displayText = '';
  protected displayTextWrapper = new TextWrapper();
  protected textColour = Colour(255, 255, 255);
  protected selectionIndex0: Index = { raw_index: 0, wrapped_index: 0, clear_index: 0 };
  protected selectionIndex1: Index = { raw_index: 0, wrapped_index: 0, clear_index: 0 };
  protected selectionIndexL: Index;
  protected selectionIndexH: Index;
  protected multiline = false;
  protected selecting = false;
  protected autoHeight: boolean;
  protected scrollX = 0;

  constructor(position: Point, size: Point, labelText: string) {
    super(position, size);
    this.selectionIndexL = this.textWrapper.IndexBegin();
    this.selectionIndexH = this.textWrapper.IndexBegin();
    this.autoHeight = size.Y === -1;
    if (labelText.length) this.SetText(labelText);
    this.menu = new ContextMenu(this);
    this.menu.AddItem(new ContextMenuItem('Copy', 0, true));
  }

  SetMultiline(status: boolean): void {
    this.multiline = status;
    this.updateTextWrapper();
    this.updateSelection();
    this.TextPosition(this.displayTextWrapper.WrappedText());
  }
  SetText(newText: string): void {
    this.text = newText;
    this.updateTextWrapper();
    this.updateSelection();
    this.TextPosition(this.displayTextWrapper.WrappedText());
  }
  AutoHeight(): void {
    const oldAH = this.autoHeight;
    this.autoHeight = true;
    this.updateTextWrapper();
    this.autoHeight = oldAH;
  }
  protected updateTextWrapper(): void {
    const lines = this.textWrapper.Update(this.text, this.multiline, this.Size.X - this.Appearance.Margin.Left - this.Appearance.Margin.Right);
    this.displayTextWrapper.Update(this.displayText.length ? this.displayText : this.text, this.multiline,
      this.Size.X - this.Appearance.Margin.Left - this.Appearance.Margin.Right);
    if (this.autoHeight) this.Size.Y = lines * FONT_H + 3;
  }
  GetText(): string { return this.text; }
  SetTextColour(textColour: number): void { this.textColour = textColour; }

  override OnContextMenuAction(item: number): void {
    switch (item) {
      case 0: this.copySelection(); break;
    }
  }
  override OnMouseDown(x: number, y: number, button: number): void {
    if (this.MouseDownInside) {
      if (button === SDL_BUTTON_RIGHT) {
        if (this.menu) {
          const c = this.GetContainerPos();
          this.menu.Show({ X: c.X + x, Y: c.Y + y });
        }
      } else {
        this.selecting = true;
        const tpX = this.textPosition.X - this.scrollX, tpY = this.textPosition.Y;
        this.selectionIndex0 = this.textWrapper.Point2Index(x - this.Position.X - tpX, y - this.Position.Y - tpY);
        this.selectionIndexL = this.selectionIndex0;
        this.selectionIndexH = this.selectionIndex0;
        this.updateSelection();
      }
    }
  }
  protected copySelection(): void {
    if (this.HasSelection())
      ClipboardPush(CleanString(this.text.slice(this.selectionIndexL.raw_index, this.selectionIndexH.raw_index), false, true, false));
    else
      ClipboardPush(CleanString(this.text, false, true, false));
  }
  override OnMouseUp(_x: number, _y: number, _button: number): void {
    this.selecting = false;
  }
  override OnKeyPress(_key: number, scan: number, repeat: boolean, _shift: boolean, ctrl: boolean, _alt: boolean): void {
    if (repeat) return;
    if (ctrl && scan === SDL_SCANCODE_C) this.copySelection();
    if (ctrl && scan === SDL_SCANCODE_A) {
      this.selectAll();
      return;
    }
  }
  override OnMouseMoved(localx: number, localy: number): void {
    if (this.selecting) {
      const tpX = this.textPosition.X - this.scrollX, tpY = this.textPosition.Y;
      this.selectionIndex1 = this.textWrapper.Point2Index(localx - tpX, localy - tpY);
      if (this.selectionIndex1.raw_index < this.selectionIndex0.raw_index) {
        this.selectionIndexL = this.selectionIndex1;
        this.selectionIndexH = this.selectionIndex0;
      } else {
        this.selectionIndexL = this.selectionIndex0;
        this.selectionIndexH = this.selectionIndex1;
      }
      this.updateSelection();
    }
  }
  override Tick(): void {
    if (this.multiline) this.scrollX = 0;
    if (!this.IsFocused() && (this.HasSelection() || this.selecting)) this.ClearSelection();
  }
  protected getLowerSelectionBound(): number { return this.selectionIndexL.raw_index; }
  protected getHigherSelectionBound(): number { return this.selectionIndexH.raw_index; }
  HasSelection(): boolean { return this.selectionIndexH.raw_index > this.selectionIndexL.raw_index; }
  ClearSelection(): void {
    this.selecting = false;
    this.selectionIndexL = this.textWrapper.IndexBegin();
    this.selectionIndexH = this.textWrapper.IndexBegin();
    this.updateSelection();
  }
  selectAll(): void {
    this.selectionIndexL = this.textWrapper.IndexBegin();
    this.selectionIndexH = this.textWrapper.IndexEnd();
    this.updateSelection();
  }
  protected updateSelection(): void {
    if (this.selectionIndexL.raw_index < 0) this.selectionIndexL = this.textWrapper.IndexBegin();
    if (this.selectionIndexL.raw_index > this.text.length) this.selectionIndexL = this.textWrapper.IndexEnd();
    if (this.selectionIndexH.raw_index < 0) this.selectionIndexH = this.textWrapper.IndexBegin();
    if (this.selectionIndexH.raw_index > this.text.length) this.selectionIndexH = this.textWrapper.IndexEnd();
    this.displayTextWithSelection = this.displayTextWrapper.WrappedText();
    if (this.HasSelection()) {
      const indexL = this.displayTextWrapper.Clear2Index(this.selectionIndexL.clear_index);
      const indexH = this.displayTextWrapper.Clear2Index(this.selectionIndexH.clear_index);
      let s = this.displayTextWithSelection;
      s = s.slice(0, indexL.wrapped_index) + '\x01' + s.slice(indexL.wrapped_index);
      s = s.slice(0, indexH.wrapped_index + 1) + '\x01' + s.slice(indexH.wrapped_index + 1);
      this.displayTextWithSelection = s;
    }
  }
  SetDisplayText(newText: string): void {
    this.displayText = newText;
    this.ClearSelection();
    this.updateTextWrapper();
    this.updateSelection();
    this.TextPosition(this.displayTextWrapper.WrappedText());
  }

  override Draw(screenPos: Point): void {
    if (!this.drawn) {
      this.TextPosition(this.displayTextWrapper.WrappedText());
      this.updateTextWrapper();
      this.updateSelection();
      this.drawn = true;
    }
    const g = this.GetGraphics();
    const indexL = this.displayTextWrapper.Clear2Index(this.selectionIndexL.clear_index);
    const indexH = this.displayTextWrapper.Clear2Index(this.selectionIndexH.clear_index);
    const [selectionLineL, selectionXL, selectionYL] = this.displayTextWrapper.Index2Point(indexL);
    const [selectionLineH, selectionXH, selectionYH] = this.displayTextWrapper.Index2Point(indexH);
    const clip = rectAnd(RectSized({ X: screenPos.X + 1, Y: screenPos.Y + 1 }, { X: this.Size.X - 2, Y: this.Size.Y - 2 }), g.GetClipRect());
    const old = g.SwapClipRect(clip.pos.X, clip.pos.Y, clip.size.X, clip.size.Y);
    const tpX = screenPos.X + this.textPosition.X - this.scrollX, tpY = screenPos.Y + this.textPosition.Y;
    if (this.HasSelection()) {
      if (selectionLineH === selectionLineL) {
        g.DrawFilledRect(tpX + selectionXL - 1, tpY + selectionYL - 2, selectionXH - selectionXL + 1, FONT_H, 0xFFFFFF);
      } else {
        g.DrawFilledRect(tpX + selectionXL - 1, tpY + selectionYL - 2, this.textSize.X - selectionXL + 1, FONT_H, 0xFFFFFF);
        for (let i = 1; i < selectionLineH - selectionLineL; ++i)
          g.DrawFilledRect(tpX - 1, tpY + selectionYL - 2 + i * FONT_H, this.textSize.X + 1, FONT_H, 0xFFFFFF);
        g.DrawFilledRect(tpX - 1, tpY + selectionYH - 2, selectionXH + 1, FONT_H, 0xFFFFFF);
      }
    }
    g.BlendText(tpX, tpY, this.displayTextWithSelection, WithAlpha(NoAlpha(this.textColour), 255));
    g.SwapClipRect(old.pos.X, old.pos.Y, old.size.X, old.size.Y);
  }
}

// ---------------------------------------------------------------------------------------------------------------
// Textbox

export const ValidInput = { All: 0, Multiline: 1, Numeric: 2, Number: 3 } as const;
const npos = Number.MAX_SAFE_INTEGER;
const MASK_CHAR = String.fromCharCode(0xE00D);

export class Textbox extends Label {
  ReadOnly = false;
  protected inputType: number = ValidInput.All;
  protected limit = npos;
  protected repeatTime = 0;
  protected keyDown = 0;
  protected characterDown = 0;
  protected mouseDown = false;
  protected masked = false;
  protected border = true;
  protected cursor = 0;
  protected cursorPositionX = 0;
  protected cursorPositionY = 0;
  protected actionCallback: { change?: () => void } = {};
  protected defocusCallback: { callback?: () => void } = {};
  protected backingText = '';
  protected placeHolder = '';
  protected selectionIndexLSave1 = 0;
  protected selectionIndexHSave1 = 0;
  protected backingTextSave1 = '';
  protected cursorSave1 = 0;
  protected selectionIndexLSave2 = 0;
  protected selectionIndexHSave2 = 0;
  protected backingTextSave2 = '';
  protected cursorSave2 = 0;
  protected inputRectPosition: Point = { X: 0, Y: 0 };
  protected textEditing = false;

  constructor(position: Point, size: Point, textboxText = '', textboxPlaceholder = '') {
    super(position, size, '');
    this.DoesTextInput = true;
    this.placeHolder = textboxPlaceholder;
    this.SetText(textboxText);
    this.cursor = this.text.length;
    this.menu!.RemoveItem(0);
    this.menu!.AddItem(new ContextMenuItem('Cut', 1, true));
    this.menu!.AddItem(new ContextMenuItem('Copy', 0, true));
    this.menu!.AddItem(new ContextMenuItem('Paste', 2, true));
  }

  SetHidden(hidden: boolean): void {
    this.menu!.RemoveItem(0);
    this.menu!.RemoveItem(1);
    this.menu!.RemoveItem(2);
    this.menu!.AddItem(new ContextMenuItem('Cut', 1, !hidden));
    this.menu!.AddItem(new ContextMenuItem('Copy', 0, !hidden));
    this.menu!.AddItem(new ContextMenuItem('Paste', 2, true));
    this.masked = hidden;
  }
  GetHidden(): boolean { return this.masked; }
  SetPlaceholder(text: string): void { this.placeHolder = text; }
  SetBorder(border: boolean): void { this.border = border; }
  SetActionCallback(action: { change?: () => void }): void { this.actionCallback = action; }
  SetDefocusCallback(action: { callback?: () => void }): void { this.defocusCallback = action; }
  SetLimit(limit: number): void { this.limit = limit; }
  GetLimit(): number { return this.limit; }
  GetInputType(): number { return this.inputType; }
  SetInputType(input: number): void { this.inputType = input; }

  override SetText(newText: string): void {
    this.StopTextEditing();
    this.backingText = newText;
    if (this.masked) super.SetText(MASK_CHAR.repeat(newText.length));
    else super.SetText(newText);
    this.cursor = newText.length;
    this.resetCursorPosition();
  }
  override GetText(): string { return this.backingText; }

  override OnContextMenuAction(item: number): void {
    this.StopTextEditing();
    switch (item) {
      case 0: this.copySelection(); break;
      case 1: this.cutSelection(); break;
      case 2: this.pasteIntoSelection(); break;
    }
  }
  resetCursorPosition(): void {
    if (this.cursor) {
      const [, x, y] = this.textWrapper.Index2Point(this.textWrapper.Clear2Index(this.cursor));
      this.cursorPositionX = x;
      this.cursorPositionY = y;
    } else {
      this.cursorPositionY = this.cursorPositionX = 0;
    }
  }
  TabFocus(): void {
    this.GetParentWindow()!.FocusComponent(this);
    this.selectAll();
  }
  private setMaskedOrText(): void {
    if (this.masked) super.SetText(MASK_CHAR.repeat(this.backingText.length));
    else this.text = this.backingText;
  }
  protected cutSelection(): void {
    this.StopTextEditing();
    if (this.HasSelection()) {
      if (this.getLowerSelectionBound() < 0 || this.getHigherSelectionBound() > this.backingText.length) return;
      const toCopy = this.backingText.slice(this.getLowerSelectionBound(), this.getHigherSelectionBound());
      ClipboardPush(CleanString(toCopy, false, true, false));
      this.backingText = this.backingText.slice(0, this.getLowerSelectionBound()) + this.backingText.slice(this.getHigherSelectionBound());
      this.cursor = this.getLowerSelectionBound();
    } else {
      if (!this.backingText.length) return;
      ClipboardPush(CleanString(this.backingText, false, true, false));
      this.backingText = '';
      this.cursor = 0;
    }
    this.ClearSelection();
    this.setMaskedOrText();
    this.updateTextWrapper();
    this.updateSelection();
    this.TextPosition(this.displayTextWrapper.WrappedText());
    this.resetCursorPosition();
    if (this.actionCallback.change) this.actionCallback.change();
  }
  protected pasteIntoSelection(): void {
    this.StopTextEditing();
    let newText = CleanString(ClipboardPull(), false, true, this.inputType !== ValidInput.Multiline,
      this.inputType === ValidInput.Number || this.inputType === ValidInput.Numeric);
    if (this.HasSelection()) {
      if (this.getLowerSelectionBound() < 0 || this.getHigherSelectionBound() > this.backingText.length) return;
      this.backingText = this.backingText.slice(0, this.getLowerSelectionBound()) + this.backingText.slice(this.getHigherSelectionBound());
      this.cursor = this.getLowerSelectionBound();
    }
    if (this.limit !== npos) newText = newText.slice(0, Math.max(0, this.limit - this.backingText.length));
    this.backingText = this.backingText.slice(0, this.cursor) + newText + this.backingText.slice(this.cursor);
    this.cursor = this.cursor + newText.length;
    this.ClearSelection();
    this.setMaskedOrText();
    this.updateTextWrapper();
    this.updateSelection();
    this.TextPosition(this.displayTextWrapper.WrappedText());
    this.resetCursorPosition();
    if (this.actionCallback.change) this.actionCallback.change();
  }
  CharacterValid(character: number): boolean {
    switch (this.inputType) {
      case ValidInput.Numeric:
        if (character === 0x2D && this.cursor === 0 && this.backingText[0] !== '-') return true;
      // fallthrough
      case ValidInput.Number:
        return character >= 0x30 && character <= 0x39;
      case ValidInput.Multiline:
        if (character === 0x0A) return true;
      // fallthrough
      default:
        return character >= 0x20 && character <= 0x10FFFF && !(character >= 0xD800 && character <= 0xDFFF) &&
          !(character >= 0xFDD0 && character <= 0xFDEF) && !((character & 0xFFFF) >= 0xFFFE);
    }
  }
  StringValid(text: string): boolean {
    for (const c of text) if (!this.CharacterValid(c.codePointAt(0)!)) return false;
    return true;
  }
  override Tick(): void {
    super.Tick();
    if (!this.IsFocused()) {
      this.keyDown = 0;
      this.characterDown = 0;
    }
    const time_pls = GetTicks();
    if ((this.keyDown || this.characterDown) && this.repeatTime <= time_pls) this.repeatTime = GetTicks() + 30;
    if (!this.multiline) {
      let regionWidth = this.Size.X;
      if (this.Appearance.icon) regionWidth -= 13;
      regionWidth -= this.Appearance.Margin.Left;
      regionWidth -= this.Appearance.Margin.Right;
      if (this.scrollX > this.displayTextWrapper.WrappedWidth() - regionWidth) this.scrollX = this.displayTextWrapper.WrappedWidth() - regionWidth;
      if (this.scrollX < this.cursorPositionX - regionWidth) this.scrollX = this.cursorPositionX - regionWidth;
      if (this.scrollX > this.cursorPositionX) this.scrollX = this.cursorPositionX;
      if (this.scrollX < 0) this.scrollX = 0;
    }
  }
  override OnKeyRelease(): void {
    this.keyDown = 0;
    this.characterDown = 0;
  }
  override OnKeyPress(key: number, scan: number, repeat: boolean, shift: boolean, ctrl: boolean, alt: boolean): void {
    this.characterDown = scan;
    this.keyDown = key;
    this.repeatTime = GetTicks() + 300;
    this.OnVKeyPress(key, scan, repeat, shift, ctrl, alt);
  }
  OnVKeyPress(key: number, scan: number, repeat: boolean, _shift: boolean, ctrl: boolean, _alt: boolean): void {
    let changed = false;
    if (ctrl && scan === SDL_SCANCODE_C && !this.masked && !repeat) {
      this.copySelection();
      return;
    }
    if (ctrl && scan === SDL_SCANCODE_V && !this.ReadOnly) {
      this.pasteIntoSelection();
      return;
    }
    if (ctrl && scan === SDL_SCANCODE_X && !this.masked && !repeat && !this.ReadOnly) {
      this.cutSelection();
      return;
    }
    if (ctrl && scan === SDL_SCANCODE_A) {
      this.selectAll();
      return;
    }
    const seps = ' .,!?\n';
    switch (key) {
      case SDLK_HOME:
        this.StopTextEditing();
        this.cursor = 0;
        this.ClearSelection();
        break;
      case SDLK_END:
        this.StopTextEditing();
        this.cursor = this.backingText.length;
        this.ClearSelection();
        break;
      case SDLK_LEFT:
        this.StopTextEditing();
        if (this.cursor > 0) this.cursor--;
        this.ClearSelection();
        break;
      case SDLK_RIGHT:
        this.StopTextEditing();
        if (this.cursor < this.backingText.length) this.cursor++;
        this.ClearSelection();
        break;
      case SDLK_DELETE:
        if (this.ReadOnly) break;
        this.StopTextEditing();
        if (this.HasSelection()) {
          const lowerBound = this.getLowerSelectionBound(), higherBound = this.getHigherSelectionBound();
          if (lowerBound < 0 || higherBound > this.backingText.length) return;
          this.backingText = this.backingText.slice(0, lowerBound) + this.backingText.slice(higherBound);
          this.cursor = lowerBound;
          changed = true;
        } else if (this.backingText.length && this.cursor < this.backingText.length) {
          if (ctrl) {
            let stopChar = this.cursor;
            while (stopChar < this.backingText.length && seps.includes(this.backingText[stopChar])) stopChar++;
            while (stopChar < this.backingText.length && !seps.includes(this.backingText[stopChar])) stopChar++;
            this.backingText = this.backingText.slice(0, this.cursor) + this.backingText.slice(stopChar);
          } else {
            this.backingText = this.backingText.slice(0, this.cursor) + this.backingText.slice(this.cursor + 1);
          }
          changed = true;
        }
        this.ClearSelection();
        break;
      case SDLK_BACKSPACE:
        if (this.ReadOnly) break;
        this.StopTextEditing();
        if (this.HasSelection()) {
          const lowerBound = this.getLowerSelectionBound(), higherBound = this.getHigherSelectionBound();
          if (lowerBound < 0 || higherBound > this.backingText.length) return;
          this.backingText = this.backingText.slice(0, lowerBound) + this.backingText.slice(higherBound);
          this.cursor = lowerBound;
          changed = true;
        } else if (this.backingText.length && this.cursor > 0) {
          if (ctrl) {
            let stopChar = this.cursor - 1;
            while (stopChar >= 0 && seps.includes(this.backingText[stopChar])) stopChar--;
            while (stopChar >= 0 && !seps.includes(this.backingText[stopChar])) stopChar--;
            this.backingText = this.backingText.slice(0, stopChar + 1) + this.backingText.slice(this.cursor);
            this.cursor = stopChar + 1;
          } else {
            this.backingText = this.backingText.slice(0, this.cursor - 1) + this.backingText.slice(this.cursor);
            this.cursor--;
          }
          changed = true;
        }
        this.ClearSelection();
        break;
      case SDLK_RETURN:
        this.OnTextInput('\n');
        break;
    }
    this.AfterTextChange(changed);
  }
  private AfterTextChange(changed: boolean): void {
    if (this.cursor > this.backingText.length) this.cursor = this.backingText.length;
    if (changed) {
      if (this.inputType === ValidInput.Number) {
        while (this.backingText[0] === '0' && this.backingText.length > 1) this.backingText = this.backingText.slice(1);
      }
      this.setMaskedOrText();
    }
    this.updateTextWrapper();
    this.updateSelection();
    this.TextPosition(this.displayTextWrapper.WrappedText());
    this.resetCursorPosition();
    if (changed && this.actionCallback.change) this.actionCallback.change();
  }
  override OnTextInput(text: string): void {
    this.StopTextEditing();
    this.InsertText(text);
  }
  private InsertText(text: string): void {
    if (this.StringValid(text) && !this.ReadOnly) {
      if (this.HasSelection()) {
        if (this.getLowerSelectionBound() < 0 || this.getHigherSelectionBound() > this.backingText.length) return;
        this.backingText = this.backingText.slice(0, this.getLowerSelectionBound()) + this.backingText.slice(this.getHigherSelectionBound());
        this.cursor = this.getLowerSelectionBound();
      }
      if (this.limit === npos || this.backingText.length < this.limit) {
        this.backingText = this.backingText.slice(0, this.cursor) + text + this.backingText.slice(this.cursor);
        this.cursor += text.length;
      }
      this.ClearSelection();
      this.AfterTextChange(true);
    }
  }
  private StopTextEditing(): void {
    if (this.ReadOnly || !this.textEditing) return;
    this.textEditing = false;
    this.backingText = this.backingTextSave1;
    this.AfterTextChange(true);
    this.selectionIndexL = this.textWrapper.Clear2Index(this.selectionIndexLSave1);
    this.selectionIndexH = this.textWrapper.Clear2Index(this.selectionIndexHSave1);
    this.selectionIndex0 = this.selectionIndexL;
    this.selectionIndex1 = this.selectionIndexH;
    this.cursor = this.cursorSave1;
    this.updateSelection();
  }
  override OnMouseDown(x: number, y: number, button: number): void {
    if (this.MouseDownInside) {
      if (button !== SDL_BUTTON_RIGHT) {
        this.StopTextEditing();
        this.mouseDown = true;
        const tpX = this.textPosition.X - this.scrollX, tpY = this.textPosition.Y;
        const index = this.textWrapper.Point2Index(x - this.Position.X - tpX, y - this.Position.Y - tpY);
        this.cursor = index.raw_index;
        this.resetCursorPosition();
      }
    }
    super.OnMouseDown(x, y, button);
  }
  override OnMouseUp(x: number, y: number, button: number): void {
    this.mouseDown = false;
    super.OnMouseUp(x, y, button);
  }
  override OnMouseMoved(localx: number, localy: number): void {
    if (this.mouseDown) {
      const tpX = this.textPosition.X - this.scrollX, tpY = this.textPosition.Y;
      const index = this.textWrapper.Point2Index(localx - tpX, localy - tpY);
      this.cursor = index.raw_index;
      this.resetCursorPosition();
    }
    super.OnMouseMoved(localx, localy);
  }
  override OnDefocus(): void {
    if (this.defocusCallback.callback) this.defocusCallback.callback();
  }
  override Draw(screenPos: Point): void {
    super.Draw(screenPos);
    const g = this.GetGraphics();
    const clip = rectAnd(RectSized({ X: screenPos.X + 1, Y: screenPos.Y + 1 }, { X: this.Size.X - 2, Y: this.Size.Y - 2 }), g.GetClipRect());
    const old = g.SwapClipRect(clip.pos.X, clip.pos.Y, clip.size.X, clip.size.Y);
    const tpX = screenPos.X + this.textPosition.X - this.scrollX, tpY = screenPos.Y + this.textPosition.Y;
    if (this.IsFocused()) {
      // the original's cursor is always drawn; it blinks nowhere
      g.DrawLine(tpX + this.cursorPositionX, tpY + this.cursorPositionY - 2, tpX + this.cursorPositionX, tpY + this.cursorPositionY + 9, 0xFFFFFF);
    }
    if (!this.text.length) g.BlendText(tpX + 3, tpY, this.placeHolder, WithAlpha(NoAlpha(this.textColour), 170));
    if (this.Appearance.icon) g.draw_icon(screenPos.X + this.iconPosition.X, screenPos.Y + this.iconPosition.Y, this.Appearance.icon);
    g.SwapClipRect(old.pos.X, old.pos.Y, old.size.X, old.size.Y);
    if (this.border) g.DrawRect(screenPos.X, screenPos.Y, this.Size.X, this.Size.Y, this.IsFocused() ? 0xFFFFFF : 0xA0A0A0);
  }
}

// ---------------------------------------------------------------------------------------------------------------
// RichLabel

interface RichTextRegion {
  begin: number;
  end: number;
  uri: string;
}

export class RichLabel extends Label {
  private regions: RichTextRegion[] = [];

  constructor(position: Point, size: Point, text: string) {
    super(position, size, '');
    this.SetText(text);
  }
  override SetText(newText: string): void {
    super.SetText(newText);
    const newRegions: RichTextRegion[] = [];
    let sb = '';
    let it = 0;
    const find = (from: number, ch: string) => {
      const i = newText.indexOf(ch, from);
      return i === -1 ? newText.length : i;
    };
    while (it !== newText.length) {
      const beginRegionIt = find(it, '{');
      const beginDataIt = find(beginRegionIt, ':');
      const beginTextIt = find(beginDataIt, '|');
      const endRegionIt = find(beginTextIt, '}');
      if (endRegionIt === newText.length) break;
      const action = newText.slice(beginRegionIt + 1, beginDataIt);
      const data = newText.slice(beginDataIt + 1, beginTextIt);
      const text = newText.slice(beginTextIt + 1, endRegionIt);
      sb += newText.slice(it, beginRegionIt);
      let good = false;
      if (action === 'a' && data.length && text.length) {
        const begin = sb.length;
        sb += text;
        newRegions.push({ begin, end: sb.length, uri: data });
        good = true;
      }
      if (!good) sb += newText.slice(beginRegionIt, endRegionIt + 1);
      it = endRegionIt + 1;
    }
    sb += newText.slice(it);
    super.SetText(CleanString(sb, false, true, false));
    this.SetDisplayText(sb);
    this.regions = newRegions;
  }
  override OnMouseDown(x: number, y: number, button: number): void {
    if (this.MouseDownInside) {
      const cursorPosition = this.displayTextWrapper.Point2Index(x - this.Position.X - this.textPosition.X, y - this.Position.Y - this.textPosition.Y).raw_index;
      for (const region of this.regions) {
        if (region.begin <= cursorPosition && region.end > cursorPosition) {
          OpenURI(region.uri);
          return;
        }
      }
    }
    super.OnMouseDown(x, y, button);
  }
}

export { Engine };
