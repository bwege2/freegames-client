// @ts-nocheck
// re/shatteredpixeldungeon/oracle/src/freegames/spd/WebPlatformSupport.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { $J, Gdx, HashMap, Pattern, Pixmap_Format } from '../../../jre/index.ts';
import { PlatformSupport } from '../../com/watabou/utils/PlatformSupport.ts';

let PixmapPacker, FreeTypeFontGenerator, SPDSettings, ControllerHandler;

/**
 * The port's platform support: the original's DesktopPlatformSupport (desktop/src/main/java/.../desktop/
 * DesktopPlatformSupport.java, 4.0.2), unchanged but for full screen and the window size, which the browser
 * decides (the page's full screen mode; the window is the player's area of the page). Translated with the game;
 * the headless oracle uses it too.
 */
export class WebPlatformSupport extends PlatformSupport {
  static basicFontGenerator: FreeTypeFontGenerator = null;
  static asianFontGenerator: FreeTypeFontGenerator = null;
  static asianMatcher: Matcher = null;
  regularsplitter: Pattern = null;
  regularsplitterMultiline: Pattern = null;
  _WebPlatformSupport(): this {
    this._PlatformSupport();
    this.regularsplitter = Pattern.compile('(?<=\n)|(?=\n)|(?<=_)|(?=_)|(?<=\\*\\*)|(?=\\*\\*)|(?<=\\p{InHiragana})|(?=\\p{InHiragana})|(?<=\\p{InKatakana})|(?=\\p{InKatakana})|(?<=\\p{InCJK_Unified_Ideographs})|(?=\\p{InCJK_Unified_Ideographs})|(?<=\\p{InCJK_Symbols_and_Punctuation})|(?=\\p{InCJK_Symbols_and_Punctuation})');
    this.regularsplitterMultiline = Pattern.compile('(?<= )|(?= )|(?<=\n)|(?=\n)|(?<=_)|(?=_)|(?<=\\*\\*)|(?=\\*\\*)|(?<=\\p{InHiragana})|(?=\\p{InHiragana})|(?<=\\p{InKatakana})|(?=\\p{InKatakana})|(?<=\\p{InCJK_Unified_Ideographs})|(?=\\p{InCJK_Unified_Ideographs})|(?<=\\p{InCJK_Symbols_and_Punctuation})|(?=\\p{InCJK_Symbols_and_Punctuation})');
    return this;
  }
  updateDisplaySize(): void {
  }
  updateSystemUI(): void {
    Gdx.app.postRunnable(() => {
      if (SPDSettings.fullscreen$()) {
        Gdx.graphics.setFullscreenMode(Gdx.graphics.getDisplayMode());
      } else {
        Gdx.graphics.setWindowedMode(Gdx.graphics.getWidth(), Gdx.graphics.getHeight());
      }
    });
  }
  supportsFullScreen(): boolean {
    return Gdx.graphics.supportsDisplayModeChange();
  }
  connectedToUnmeteredNetwork(): boolean {
    return true;
  }
  supportsVibration(): boolean {
    return ControllerHandler.vibrationSupported();
  }
  setupFontGenerators(pageSize: number, systemfont: boolean): void {
    if (PlatformSupport.fonts != null && this.pageSize === pageSize && this.systemfont === systemfont) {
      return;
    }
    this.pageSize = pageSize;
    this.systemfont = systemfont;
    this.resetGenerators$boolean(false);
    PlatformSupport.fonts = new HashMap();
    if (systemfont) {
      WebPlatformSupport.basicFontGenerator = WebPlatformSupport.asianFontGenerator = new FreeTypeFontGenerator()._FreeTypeFontGenerator$FileHandle(Gdx.files.internal('fonts/droid_sans.ttf'));
    } else {
      WebPlatformSupport.basicFontGenerator = new FreeTypeFontGenerator()._FreeTypeFontGenerator$FileHandle(Gdx.files.internal('fonts/pixel_font.ttf'));
      WebPlatformSupport.asianFontGenerator = new FreeTypeFontGenerator()._FreeTypeFontGenerator$FileHandle(Gdx.files.internal('fonts/droid_sans.ttf'));
    }
    PlatformSupport.fonts.put(WebPlatformSupport.basicFontGenerator, new HashMap());
    PlatformSupport.fonts.put(WebPlatformSupport.asianFontGenerator, new HashMap());
    this.packer = new PixmapPacker()._PixmapPacker$int$int$Format$int$boolean(pageSize, pageSize, Pixmap_Format.RGBA8888, 1, false);
  }
  getGeneratorForString(input: string): FreeTypeFontGenerator {
    if (WebPlatformSupport.asianMatcher.reset(input).find()) {
      return WebPlatformSupport.asianFontGenerator;
    } else {
      return WebPlatformSupport.basicFontGenerator;
    }
  }
  splitforTextBlock(text: string, multiline: boolean): string[] {
    if (multiline) {
      return this.regularsplitterMultiline.split(text);
    } else {
      return this.regularsplitter.split(text);
    }
  }
  static $clinit() {
    WebPlatformSupport.asianMatcher = Pattern.compile('\\p{InHangul_Syllables}|\\p{InCJK_Unified_Ideographs}|\\p{InCJK_Symbols_and_Punctuation}|\\p{InHalfwidth_and_Fullwidth_Forms}|\\p{InHiragana}|\\p{InKatakana}').matcher('');
  }
}

$J.define(WebPlatformSupport, 'freegames.spd.WebPlatformSupport', { kind: 'class', sup: 'com.watabou.utils.PlatformSupport', ctors: { '': '_WebPlatformSupport' }, clinit: true, lazy: ['basicFontGenerator', 'asianFontGenerator', 'asianMatcher'] });
$J.module(() => {
  PixmapPacker = $J.load('com.badlogic.gdx.graphics.g2d.PixmapPacker');
  FreeTypeFontGenerator = $J.load('com.badlogic.gdx.graphics.g2d.freetype.FreeTypeFontGenerator');
  SPDSettings = $J.load('com.shatteredpixel.shatteredpixeldungeon.SPDSettings');
  ControllerHandler = $J.load('com.watabou.input.ControllerHandler');
});
