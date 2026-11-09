// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/windows/WndTextInput.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
/*
 * Pixel Dungeon
 * Copyright (C) 2012-2015 Oleg Dolya
 *
 * Shattered Pixel Dungeon
 * Copyright (C) 2014-2026 Evan Debenham
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>
 */
import { $J, Gdx, JString } from '../../../../../jre/index.ts';
import { Window } from '../ui/Window.ts';

let Chrome, Chrome$Type, PixelScene, Icons, RedButton, PointerEvent, Game, TextInput, DeviceCompat;

export class WndTextInput extends Window {
  static readonly WIDTH: number = 135;
  static readonly W_LAND_EXTRA: number = 220;
  static readonly MARGIN: number = 1;
  static readonly BUTTON_HEIGHT: number = 16;
  textBox: TextInput = null;
  btnCopy: RedButton = null;
  btnPaste: RedButton = null;
  _WndTextInput(title: string, body: string, initialValue: string, maxLength: number, multiLine: boolean, posTxt: string, negTxt: string): this {
    this._Window$();
    let width: number;
    if (PixelScene.landscape() && (multiLine || body != null)) {
      width = WndTextInput.W_LAND_EXTRA;
    } else {
      width = WndTextInput.WIDTH;
    }
    let pos = 2;
    if (title != null) {
      let txtTitle = PixelScene.renderTextBlock$String$int(title, 9);
      txtTitle.maxWidth$int(width);
      txtTitle.hardlight(Window.TITLE_COLOR);
      txtTitle.setPos(Math.fround((Math.fround(width - txtTitle.width())) / 2), 2);
      this.add$Gizmo(txtTitle);
      pos = Math.fround(txtTitle.bottom() + Math.imul(4, WndTextInput.MARGIN));
    }
    if (body != null) {
      let txtBody = PixelScene.renderTextBlock$String$int(body, 6);
      txtBody.maxWidth$int(width);
      txtBody.setPos(0, pos);
      this.add$Gizmo(txtBody);
      pos = Math.fround(txtBody.bottom() + Math.imul(2, WndTextInput.MARGIN));
    }
    let textSize = Math.imul($J.d2i(PixelScene.uiCamera.zoom_), (multiLine ? 6 : 9));
    this.textBox = new (WndTextInput$1())().$o(this)._TextInput(Chrome.get(Chrome$Type.TOAST_WHITE), multiLine, textSize);
    if (initialValue != null) {
      this.textBox.setText(initialValue);
    }
    this.textBox.setMaxLength(maxLength);
    let inputHeight: number;
    if (multiLine) {
      inputHeight = 64;
    } else {
      inputHeight = 16;
    }
    let textBoxWidth = Math.fround((width - Math.imul(3, WndTextInput.MARGIN) - WndTextInput.BUTTON_HEIGHT) | 0);
    this.add$Gizmo(this.textBox);
    this.textBox.setRect(Math.fround(WndTextInput.MARGIN), pos, textBoxWidth, inputHeight);
    this.btnCopy = new (WndTextInput$2())().$o(this)._RedButton$String('');
    this.btnCopy.icon$Image(Icons.COPY.get());
    this.btnCopy.enable(!(this.textBox.getText().length === 0));
    this.add$Gizmo(this.btnCopy);
    this.btnPaste = new (WndTextInput$3())().$o(this)._RedButton$String('');
    this.btnPaste.icon$Image(Icons.PASTE.get());
    this.btnPaste.enable(Gdx.app.getClipboard().hasContents());
    this.add$Gizmo(this.btnPaste);
    this.btnCopy.setRect(Math.fround(textBoxWidth + Math.imul(2, WndTextInput.MARGIN)), pos, Math.fround(WndTextInput.BUTTON_HEIGHT), Math.fround(WndTextInput.BUTTON_HEIGHT));
    this.btnPaste.setRect(Math.fround(textBoxWidth + Math.imul(2, WndTextInput.MARGIN)), Math.fround(this.btnCopy.bottom() + WndTextInput.MARGIN), Math.fround(WndTextInput.BUTTON_HEIGHT), Math.fround(WndTextInput.BUTTON_HEIGHT));
    pos = Math.fround(pos + Math.fround(inputHeight + WndTextInput.MARGIN));
    let positiveBtn = new (WndTextInput$4())().$o(this)._RedButton$String(posTxt);
    let negativeBtn: RedButton;
    if (negTxt != null) {
      negativeBtn = new (WndTextInput$5())().$o(this)._RedButton$String(negTxt);
    } else {
      negativeBtn = null;
    }
    let btnWidth = multiLine ? Math.fround((width - Math.imul(2, WndTextInput.MARGIN)) | 0) : textBoxWidth;
    if (negTxt != null) {
      positiveBtn.setRect(Math.fround(WndTextInput.MARGIN), pos, Math.fround((Math.fround(btnWidth - WndTextInput.MARGIN)) / 2), Math.fround(WndTextInput.BUTTON_HEIGHT));
      this.add$Gizmo(positiveBtn);
      negativeBtn.setRect(Math.fround(positiveBtn.right() + WndTextInput.MARGIN), pos, Math.fround((Math.fround(btnWidth - WndTextInput.MARGIN)) / 2), Math.fround(WndTextInput.BUTTON_HEIGHT));
      this.add$Gizmo(negativeBtn);
    } else {
      positiveBtn.setRect(Math.fround(WndTextInput.MARGIN), pos, btnWidth, Math.fround(WndTextInput.BUTTON_HEIGHT));
      this.add$Gizmo(positiveBtn);
    }
    pos = Math.fround(pos + WndTextInput.BUTTON_HEIGHT);
    this.resize(width, $J.d2i(pos));
    if (!DeviceCompat.hasHardKeyboard()) {
      this.offset$int$int(0, -$J.d2i((Math.fround(Game.height / (Math.fround(4 * this.camera_.zoom_))))));
      this.boundOffsetWithMargin(0);
    }
    this.textBox.setRect(Math.fround(WndTextInput.MARGIN), this.textBox.top(), textBoxWidth, inputHeight);
    PointerEvent.clearKeyboardThisPress = false;
    return this;
  }
  offset$int$int(xOffset: number, yOffset: number): void {
    super.offset$int$int(xOffset, yOffset);
    if (this.textBox != null) {
      this.textBox.setRect(this.textBox.left(), this.textBox.top(), this.textBox.width(), this.textBox.height());
    }
  }
  onSelect(positive: boolean, text: string): void {
  }
  onBackPressed(): void {
  }
}

let $WndTextInput$1: any = null;
/** An anonymous class (WndTextInput.java:81). */
function WndTextInput$1(): any {
  return $WndTextInput$1 ??= $J.local(class extends TextInput {
    enterPressed(): void {
      this.$outer.onSelect(true, this.getText());
      this.$outer.hide();
    }
    onChanged(): void {
      super.onChanged();
      if (this.$outer.btnCopy != null) {
        this.$outer.btnCopy.enable(!(this.getText().length === 0));
      }
    }
    onClipBoardUpdate(): void {
      super.onClipBoardUpdate();
      this.$outer.btnPaste.enable(Gdx.app.getClipboard().hasContents());
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.windows.WndTextInput$1', []);
}

let $WndTextInput$2: any = null;
/** An anonymous class (WndTextInput.java:117). */
function WndTextInput$2(): any {
  return $WndTextInput$2 ??= $J.local(class extends RedButton {
    onPointerDown(): void {
      super.onPointerDown();
      PointerEvent.clearKeyboardThisPress = false;
    }
    onPointerUp(): void {
      super.onPointerUp();
      PointerEvent.clearKeyboardThisPress = false;
    }
    onClick(): void {
      super.onClick();
      this.$outer.textBox.copyToClipboard();
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.windows.WndTextInput$2', []);
}

let $WndTextInput$3: any = null;
/** An anonymous class (WndTextInput.java:140). */
function WndTextInput$3(): any {
  return $WndTextInput$3 ??= $J.local(class extends RedButton {
    onPointerDown(): void {
      super.onPointerDown();
      PointerEvent.clearKeyboardThisPress = false;
    }
    onPointerUp(): void {
      super.onPointerUp();
      PointerEvent.clearKeyboardThisPress = false;
    }
    onClick(): void {
      super.onClick();
      if (Gdx.app.getClipboard().hasContents()) {
        this.$outer.textBox.pasteFromClipboard();
      } else {
        this.enable(false);
      }
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.windows.WndTextInput$3', []);
}

let $WndTextInput$4: any = null;
/** An anonymous class (WndTextInput.java:173). */
function WndTextInput$4(): any {
  return $WndTextInput$4 ??= $J.local(class extends RedButton {
    onClick(): void {
      this.$outer.onSelect(true, this.$outer.textBox.getText());
      this.$outer.hide();
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.windows.WndTextInput$4', []);
}

let $WndTextInput$5: any = null;
/** An anonymous class (WndTextInput.java:183). */
function WndTextInput$5(): any {
  return $WndTextInput$5 ??= $J.local(class extends RedButton {
    onClick(): void {
      this.$outer.onSelect(false, this.$outer.textBox.getText());
      this.$outer.hide();
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.windows.WndTextInput$5', []);
}

$J.define(WndTextInput, 'com.shatteredpixel.shatteredpixeldungeon.windows.WndTextInput', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.ui.Window', ctors: { 'java.lang.String,java.lang.String,java.lang.String,int,boolean,java.lang.String,java.lang.String': '_WndTextInput' }, meths: { 'offset(int,int)': 'offset$int$int' } });
$J.module(() => {
  Chrome = $J.load('com.shatteredpixel.shatteredpixeldungeon.Chrome');
  Chrome$Type = $J.load('com.shatteredpixel.shatteredpixeldungeon.Chrome$Type');
  PixelScene = $J.load('com.shatteredpixel.shatteredpixeldungeon.scenes.PixelScene');
  Icons = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.Icons');
  RedButton = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.RedButton');
  PointerEvent = $J.load('com.watabou.input.PointerEvent');
  Game = $J.load('com.watabou.noosa.Game');
  TextInput = $J.load('com.watabou.noosa.TextInput');
  DeviceCompat = $J.load('com.watabou.utils.DeviceCompat');
});
