// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/watabou/utils/PlatformSupport.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { $J, Exception, Gdx, Input_OnscreenKeyboardType, JObject, Pixmap_Format } from '../../../../jre/index.ts';

let PixmapPacker, FreeTypeFontGenerator$FreeTypeFontParameter, FreeTypeFontGenerator$Hinting, ControllerHandler, Game, RectF;

export class PlatformSupport extends JObject {
  static readonly INSET_ALL: number = 3;
  static readonly INSET_LRG: number = 2;
  static readonly INSET_BLK: number = 1;
  static fonts: HashMap<FreeTypeFontGenerator, HashMap<number, BitmapFont>> = null;
  pageSize: number = 0;
  packer: PixmapPacker = null;
  systemfont: boolean = false;
  _PlatformSupport(): this {
    return this;
  }
  supportsFullScreen(): boolean {
    return true;
  }
  getSafeInsets(level: number): RectF {
    return new RectF()._RectF$float$float$float$float(Math.fround(Gdx.graphics.getSafeInsetLeft()), Math.fround(Gdx.graphics.getSafeInsetTop()), Math.fround(Gdx.graphics.getSafeInsetRight()), Math.fround(Gdx.graphics.getSafeInsetBottom()));
  }
  getDisplayCutout(): RectF {
    return new RectF()._RectF$();
  }
  vibrate(millis: number): void {
    if (ControllerHandler.isControllerConnected()) {
      ControllerHandler.vibrate(millis);
    } else {
      Gdx.input.vibrate(millis);
    }
  }
  setHonorSilentSwitch(value: boolean): void {
  }
  openURI(uri: string): boolean {
    return Gdx.net.openURI(uri);
  }
  setOnscreenKeyboardVisible(value: boolean, multiline: boolean): void {
    Gdx.input.setOnscreenKeyboardVisible(value, Input_OnscreenKeyboardType.Default);
  }
  resetGenerators$(): void {
    this.resetGenerators$boolean(true);
  }
  resetGenerators$boolean(setupAfter: boolean): void {
    if (PlatformSupport.fonts != null) {
      for (const $it0 = PlatformSupport.fonts.keySet().iterator(); $it0.hasNext(); ) {
        let generator = $it0.next();
        for (const $it1 = PlatformSupport.fonts.get(generator).values().iterator(); $it1.hasNext(); ) {
          let f = $it1.next();
          f.dispose();
        }
        PlatformSupport.fonts.get(generator).clear();
        generator.dispose();
      }
      PlatformSupport.fonts.clear();
      if (this.packer != null) {
        for (const $it2 = this.packer.getPages().iterator(); $it2.hasNext(); ) {
          let p = $it2.next();
          p.getTexture().dispose();
        }
        this.packer.dispose();
      }
      PlatformSupport.fonts = null;
    }
    if (setupAfter) {
      this.setupFontGenerators(this.pageSize, this.systemfont);
    }
  }
  reloadGenerators(): void {
    if (this.packer != null) {
      for (const $it3 = PlatformSupport.fonts.keySet().iterator(); $it3.hasNext(); ) {
        let generator = $it3.next();
        for (const $it4 = PlatformSupport.fonts.get(generator).values().iterator(); $it4.hasNext(); ) {
          let f = $it4.next();
          f.dispose();
        }
        PlatformSupport.fonts.get(generator).clear();
      }
      if (this.packer != null) {
        for (const $it5 = this.packer.getPages().iterator(); $it5.hasNext(); ) {
          let p = $it5.next();
          p.getTexture().dispose();
        }
        this.packer.dispose();
      }
      this.packer = new PixmapPacker()._PixmapPacker$int$int$Format$int$boolean(this.pageSize, this.pageSize, Pixmap_Format.RGBA8888, 1, false);
    }
  }
  getFont(size: number, text: string, flipped: boolean, border: boolean): BitmapFont {
    let generator = this.getGeneratorForString(text);
    if (generator == null) {
      return null;
    }
    let key = size;
    if (border) {
      key = (key + 32767) | 0;
    }
    if (flipped) {
      key = -key;
    }
    if (!PlatformSupport.fonts.get(generator).containsKey(key)) {
      let parameters = new FreeTypeFontGenerator$FreeTypeFontParameter()._FreeTypeFontGenerator$FreeTypeFontParameter();
      parameters.size_ = size;
      parameters.flip_ = flipped;
      if (border) {
        parameters.borderWidth = Math.fround(parameters.size_ / 10);
      }
      if (size >= 20) {
        parameters.renderCount = 2;
      } else {
        parameters.renderCount = 3;
      }
      parameters.hinting = FreeTypeFontGenerator$Hinting.None;
      parameters.spaceX = -$J.d2i(parameters.borderWidth);
      parameters.incremental = true;
      parameters.characters = '�';
      parameters.packer = this.packer;
      try {
        let font = generator.generateFont$FreeTypeFontParameter(parameters);
        font.getData().missingGlyph = font.getData().getGlyph(65533 /* \ufffd */);
        PlatformSupport.fonts.get(generator).put(key, font);
      } catch ($e6) {
        if ($J.isa($e6, Exception)) {
          let e = $J.exc($e6);
          Game.reportException(e);
          return null;
        } else {
          throw $e6;
        }
      }
    }
    return PlatformSupport.fonts.get(generator).get(key);
  }
}

$J.define(PlatformSupport, 'com.watabou.utils.PlatformSupport', { kind: 'class', sup: 'java.lang.Object', ctors: { '': '_PlatformSupport' }, meths: { 'resetGenerators(boolean)': 'resetGenerators$boolean', 'resetGenerators()': 'resetGenerators$' } });
$J.module(() => {
  PixmapPacker = $J.load('com.badlogic.gdx.graphics.g2d.PixmapPacker');
  FreeTypeFontGenerator$FreeTypeFontParameter = $J.load('com.badlogic.gdx.graphics.g2d.freetype.FreeTypeFontGenerator$FreeTypeFontParameter');
  FreeTypeFontGenerator$Hinting = $J.load('com.badlogic.gdx.graphics.g2d.freetype.FreeTypeFontGenerator$Hinting');
  ControllerHandler = $J.load('com.watabou.input.ControllerHandler');
  Game = $J.load('com.watabou.noosa.Game');
  RectF = $J.load('com.watabou.utils.RectF');
});
