// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/ui/RenderedTextBlock.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { $J, ArrayList, StringBuilder } from '../../../../../jre/index.ts';
import { Component } from '../../../watabou/noosa/ui/Component.ts';

let Languages, Messages, PixelScene, Window, Game, RenderedText;

export class RenderedTextBlock extends Component {
  maxWidth_: number = 0;
  nLines: number = 0;
  static SPACE: RenderedText = null;
  static NEWLINE: RenderedText = null;
  text_: string = null;
  tokens_: string[] = null;
  words: ArrayList<RenderedText> = null;
  multiline: boolean = false;
  size_: number = 0;
  zoom_: number = 0;
  color_: number = 0;
  hightlightColor: number = 0;
  highlightingEnabled: boolean = false;
  static readonly LEFT_ALIGN: number = 1;
  static readonly CENTER_ALIGN: number = 2;
  static readonly RIGHT_ALIGN: number = 3;
  alignment: number = 0;
  $init_RenderedTextBlock() {
    this.maxWidth_ = 2147483647;
    this.tokens_ = null;
    this.words = new ArrayList();
    this.multiline = false;
    this.color_ = -1;
    this.hightlightColor = Window.TITLE_COLOR;
    this.highlightingEnabled = true;
    this.alignment = RenderedTextBlock.LEFT_ALIGN;
  }
  _RenderedTextBlock$int(size: number): this {
    this._Component();
    this.$init_RenderedTextBlock();
    this.size_ = size;
    return this;
  }
  _RenderedTextBlock$String$int(text: string, size: number): this {
    this._Component();
    this.$init_RenderedTextBlock();
    this.size_ = size;
    this.text$String(text);
    return this;
  }
  text$String(text: string): void {
    this.text_ = text;
    if (text != null && !$J.equals(text, '')) {
      this.tokens_ = Game.platform.splitforTextBlock(text, this.multiline);
      this.build();
    }
  }
  tokens(words: string[]): void {
    let fullText = new StringBuilder();
    for (let word of words) {
      fullText.append(word);
    }
    this.text_ = fullText.toString();
    this.tokens_ = words;
    this.build();
  }
  text$String$int(text: string, maxWidth: number): void {
    this.maxWidth_ = maxWidth;
    this.multiline = true;
    this.text$String(text);
  }
  text$(): string {
    return this.text_;
  }
  maxWidth$int(maxWidth: number): void {
    if (this.maxWidth_ !== maxWidth) {
      this.maxWidth_ = maxWidth;
      this.multiline = true;
      this.text$String(this.text_);
    }
  }
  maxWidth$(): number {
    return this.maxWidth_;
  }
  build(): void {
    if (this.tokens_ == null) {
      return;
    }
    this.clear();
    this.words = new ArrayList();
    let highlighting = false;
    for (let str of this.tokens_) {
      if (($J.equals(str, '_') || $J.equals(str, '**')) && this.highlightingEnabled) {
        highlighting = !highlighting;
      } else if ($J.equals(str, '\n')) {
        this.words.add(RenderedTextBlock.NEWLINE);
      } else if ($J.equals(str, ' ')) {
        this.words.add(RenderedTextBlock.SPACE);
      } else {
        let word = new RenderedText()._RenderedText$String$int(str, this.size_);
        if (highlighting) {
          word.hardlight$int(this.hightlightColor);
        } else if (this.color_ !== -1) {
          word.hardlight$int(this.color_);
        }
        word.scale_.set$float(this.zoom_);
        this.words.add(word);
        this.add$Gizmo(word);
        if (this.height_ < word.height()) {
          this.height_ = word.height();
        }
      }
    }
    this.layout();
  }
  zoom(zoom: number): void {
    this.zoom_ = zoom;
    for (const $it0 = this.words.iterator(); $it0.hasNext(); ) {
      let word = $it0.next();
      if (word != null) {
        word.scale_.set$float(zoom);
      }
    }
    this.layout();
  }
  hardlight(color: number): void {
    this.color_ = color;
    for (const $it1 = this.words.iterator(); $it1.hasNext(); ) {
      let word = $it1.next();
      if (word != null) {
        word.hardlight$int(color);
      }
    }
  }
  resetColor(): void {
    this.color_ = -1;
    for (const $it2 = this.words.iterator(); $it2.hasNext(); ) {
      let word = $it2.next();
      if (word != null) {
        word.resetColor();
      }
    }
  }
  alpha(value: number): void {
    for (const $it3 = this.words.iterator(); $it3.hasNext(); ) {
      let word = $it3.next();
      if (word != null) {
        word.alpha$float(value);
      }
    }
  }
  setHightlighting$boolean(enabled: boolean): void {
    this.setHightlighting$boolean$int(enabled, Window.TITLE_COLOR);
  }
  setHightlighting$boolean$int(enabled: boolean, color: number): void {
    if (enabled !== this.highlightingEnabled || color !== this.hightlightColor) {
      this.hightlightColor = color;
      this.highlightingEnabled = enabled;
      this.build();
    }
  }
  invert(): void {
    if (this.words != null) {
      for (const $it4 = this.words.iterator(); $it4.hasNext(); ) {
        let word = $it4.next();
        if (word != null) {
          word.ra = Math.fround(0.77);
          word.ga = Math.fround(0.73);
          word.ba = Math.fround(0.62);
          word.rm = Math.fround(-Math.fround(0.77));
          word.gm = Math.fround(-Math.fround(0.73));
          word.bm = Math.fround(-Math.fround(0.62));
        }
      }
    }
  }
  align(align: number): void {
    this.alignment = align;
    this.layout();
  }
  layout(): void {
    super.layout();
    let x = this.x;
    let y = this.y;
    let height = 0;
    this.nLines = 1;
    let lines = new ArrayList();
    let curLine = new ArrayList();
    lines.add(curLine);
    this.width_ = 0;
    for (let i = 0; i < this.words.size(); i++) {
      let word = this.words.get(i);
      if (word === RenderedTextBlock.SPACE) {
        x = Math.fround(x + Math.fround(1.667));
      } else if (word === RenderedTextBlock.NEWLINE) {
        y = Math.fround(y + Math.fround(height + 2));
        x = this.x;
        this.nLines++;
        curLine = new ArrayList();
        lines.add(curLine);
      } else {
        if (word.height() > height) {
          height = word.height();
        }
        let fullWidth = word.width();
        let j = (i + 1) | 0;
        while (Messages.lang() !== Languages.CHI_SMPL && Messages.lang() !== Languages.CHI_TRAD && Messages.lang() !== Languages.JAPANESE && j < this.words.size() && this.words.get(j) !== RenderedTextBlock.SPACE && this.words.get(j) !== RenderedTextBlock.NEWLINE) {
          fullWidth = Math.fround(fullWidth + Math.fround(this.words.get(j).width() - Math.fround(0.667)));
          j++;
        }
        if (Math.fround(Math.fround((Math.fround(x - this.x)) + fullWidth) - Math.fround(0.001)) > Math.fround(this.maxWidth_) && !curLine.isEmpty()) {
          y = Math.fround(y + Math.fround(height + 2));
          x = this.x;
          this.nLines++;
          curLine = new ArrayList();
          lines.add(curLine);
        }
        word.x = x;
        word.y = y;
        PixelScene.align$Visual(word);
        x = Math.fround(x + word.width());
        curLine.add(word);
        if ((Math.fround(x - this.x)) > this.width_) {
          this.width_ = (Math.fround(x - this.x));
        }
        x = Math.fround(x - Math.fround(0.667));
      }
    }
    this.height_ = Math.fround((Math.fround(y - this.y)) + height);
    if (this.alignment !== RenderedTextBlock.LEFT_ALIGN) {
      for (const $it5 = lines.iterator(); $it5.hasNext(); ) {
        let line = $it5.next();
        if (line.size() === 0) {
          continue;
        }
        let lineWidth = Math.fround(Math.fround(line.get((line.size() - 1) | 0).width() + line.get((line.size() - 1) | 0).x) - this.x);
        if (this.alignment === RenderedTextBlock.CENTER_ALIGN) {
          for (const $it6 = line.iterator(); $it6.hasNext(); ) {
            let text = $it6.next();
            text.x = Math.fround(text.x + Math.fround((Math.fround(this.width() - lineWidth)) / 2));
            PixelScene.align$Visual(text);
          }
        } else if (this.alignment === RenderedTextBlock.RIGHT_ALIGN) {
          for (const $it7 = line.iterator(); $it7.hasNext(); ) {
            let text = $it7.next();
            text.x = Math.fround(text.x + Math.fround(this.width() - lineWidth));
            PixelScene.align$Visual(text);
          }
        }
      }
    }
  }
  static $clinit() {
    RenderedTextBlock.SPACE = new RenderedText()._RenderedText$();
    RenderedTextBlock.NEWLINE = new RenderedText()._RenderedText$();
  }
}

$J.define(RenderedTextBlock, 'com.shatteredpixel.shatteredpixeldungeon.ui.RenderedTextBlock', { kind: 'class', sup: 'com.watabou.noosa.ui.Component', ctors: { 'java.lang.String,int': '_RenderedTextBlock$String$int', 'int': '_RenderedTextBlock$int' }, meths: { 'setHightlighting(boolean,int)': 'setHightlighting$boolean$int', 'setHightlighting(boolean)': 'setHightlighting$boolean', 'maxWidth()': 'maxWidth$', 'maxWidth(int)': 'maxWidth$int', 'text()': 'text$', 'text(java.lang.String,int)': 'text$String$int', 'text(java.lang.String)': 'text$String' }, clinit: true, lazy: ['SPACE', 'NEWLINE'] });
$J.module(() => {
  Languages = $J.load('com.shatteredpixel.shatteredpixeldungeon.messages.Languages');
  Messages = $J.load('com.shatteredpixel.shatteredpixeldungeon.messages.Messages');
  PixelScene = $J.load('com.shatteredpixel.shatteredpixeldungeon.scenes.PixelScene');
  Window = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.Window');
  Game = $J.load('com.watabou.noosa.Game');
  RenderedText = $J.load('com.watabou.noosa.RenderedText');
});
