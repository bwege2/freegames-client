// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/windows/WndVictoryCongrats.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { $J } from '../../../../../jre/index.ts';
import { Window } from '../ui/Window.ts';

let Messages, PixelScene, SupporterScene, ItemSprite, ItemSpriteSheet, Icons, RedButton, IconTitle, Game;

export class WndVictoryCongrats extends Window {
  _WndVictoryCongrats(): this {
    this._Window$();
    let width = PixelScene.landscape() ? 180 : 120;
    let height = 0;
    let title = new IconTitle()._IconTitle$Image$String(new ItemSprite()._ItemSprite$int(ItemSpriteSheet.AMULET), Messages.get$Object$String$ObjectArr(this, 'title', []));
    title.setRect(0, 0, Math.fround(width), 0);
    this.add$Gizmo(title);
    let text = PixelScene.renderTextBlock$String$int(Messages.get$Object$String$ObjectArr(this, 'start_text', []), 6);
    text.maxWidth$int(width);
    text.setPos(0, Math.fround(title.bottom() + 4));
    this.add$Gizmo(text);
    height = ($J.d2i(text.bottom()) + 6) | 0;
    let chalImg = Icons.CHALLENGE_COLOR.get();
    chalImg.y = Math.fround(height);
    chalImg.x = Math.fround((Math.fround(16 - chalImg.width())) / 2);
    PixelScene.align$Visual(chalImg);
    this.add$Gizmo(chalImg);
    let chalTxt = PixelScene.renderTextBlock$String$int(Messages.get$Object$String$ObjectArr(this, 'challenges', []), 6);
    chalTxt.maxWidth$int((width - 16) | 0);
    chalTxt.setPos(16, Math.fround(height));
    this.add$Gizmo(chalTxt);
    if (chalTxt.height() > chalImg.height()) {
      chalImg.y = Math.fround(chalImg.y + Math.fround((Math.fround(chalTxt.height() - chalImg.height())) / 2));
      PixelScene.align$Visual(chalImg);
    }
    height = $J.d2i(Math.fround(height + Math.fround(Math.max(chalImg.height(), chalTxt.height()) + 6)));
    let seedImg = new ItemSprite()._ItemSprite$int(ItemSpriteSheet.SEED_SUNGRASS);
    seedImg.y = Math.fround(height);
    seedImg.x = Math.fround((Math.fround(16 - seedImg.width())) / 2);
    PixelScene.align$Visual(seedImg);
    this.add$Gizmo(seedImg);
    let seedTxt = PixelScene.renderTextBlock$String$int(Messages.get$Object$String$ObjectArr(this, 'custom_seeds', []), 6);
    seedTxt.maxWidth$int((width - 16) | 0);
    seedTxt.setPos(16, Math.fround(height));
    this.add$Gizmo(seedTxt);
    if (seedTxt.height() > seedImg.height()) {
      seedImg.y = Math.fround(seedImg.y + Math.fround((Math.fround(seedTxt.height() - seedImg.height())) / 2));
      PixelScene.align$Visual(seedImg);
    }
    height = $J.d2i(Math.fround(height + Math.fround(Math.max(seedImg.height(), seedTxt.height()) + 6)));
    let dailyImg = Icons.CALENDAR.get();
    dailyImg.hardlight$float$float$float(0.5, 1, 2);
    dailyImg.y = Math.fround(height);
    dailyImg.x = Math.fround((Math.fround(16 - dailyImg.width())) / 2);
    PixelScene.align$Visual(dailyImg);
    this.add$Gizmo(dailyImg);
    let dailyTxt = PixelScene.renderTextBlock$String$int(Messages.get$Object$String$ObjectArr(this, 'dailies', []), 6);
    dailyTxt.maxWidth$int((width - 16) | 0);
    dailyTxt.setPos(16, Math.fround(height));
    this.add$Gizmo(dailyTxt);
    if (dailyTxt.height() > dailyImg.height()) {
      dailyImg.y = Math.fround(dailyImg.y + Math.fround((Math.fround(dailyTxt.height() - dailyImg.height())) / 2));
      PixelScene.align$Visual(dailyImg);
    }
    height = $J.d2i(Math.fround(height + Math.fround(Math.max(dailyImg.height(), dailyTxt.height()) + 6)));
    let finalTxt = PixelScene.renderTextBlock$String$int(Messages.get$Object$String$ObjectArr(this, 'thank_you', []) + ' ' + Messages.get$Object$String$ObjectArr(this, 'support_prompt', []), 6);
    finalTxt.maxWidth$int(width);
    finalTxt.setPos(0, Math.fround(height));
    this.add$Gizmo(finalTxt);
    height = ($J.d2i(finalTxt.bottom()) + 4) | 0;
    let btnSupport = new (WndVictoryCongrats$1())().$o(this)._RedButton$String(Messages.get$Object$String$ObjectArr(this, 'support', []));
    btnSupport.icon$Image(Icons.GOLD.get());
    btnSupport.setRect(0, Math.fround(height), Math.fround($J.idiv(width, 2)), 18);
    this.add$Gizmo(btnSupport);
    let btnClose = new (WndVictoryCongrats$2())().$o(this)._RedButton$String(Messages.get$Object$String$ObjectArr(this, 'close', []));
    btnClose.icon$Image(Icons.EXIT.get());
    btnClose.setRect(Math.fround(btnSupport.right() + 1), Math.fround(height), Math.fround(($J.idiv(width, 2) - 1) | 0), 18);
    this.add$Gizmo(btnClose);
    this.resize(width, $J.d2i(btnClose.bottom()));
    return this;
  }
  onBackPressed(): void {
  }
}

let $WndVictoryCongrats$1: any = null;
/** An anonymous class (WndVictoryCongrats.java:115). */
function WndVictoryCongrats$1(): any {
  return $WndVictoryCongrats$1 ??= $J.local(class extends RedButton {
    onClick(): void {
      Game.switchScene$Class($J.cls(SupporterScene));
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.windows.WndVictoryCongrats$1', []);
}

let $WndVictoryCongrats$2: any = null;
/** An anonymous class (WndVictoryCongrats.java:125). */
function WndVictoryCongrats$2(): any {
  return $WndVictoryCongrats$2 ??= $J.local(class extends RedButton {
    onClick(): void {
      this.$outer.hide();
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.windows.WndVictoryCongrats$2', []);
}

$J.define(WndVictoryCongrats, 'com.shatteredpixel.shatteredpixeldungeon.windows.WndVictoryCongrats', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.ui.Window', ctors: { '': '_WndVictoryCongrats' } });
$J.module(() => {
  Messages = $J.load('com.shatteredpixel.shatteredpixeldungeon.messages.Messages');
  PixelScene = $J.load('com.shatteredpixel.shatteredpixeldungeon.scenes.PixelScene');
  SupporterScene = $J.load('com.shatteredpixel.shatteredpixeldungeon.scenes.SupporterScene');
  ItemSprite = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.ItemSprite');
  ItemSpriteSheet = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.ItemSpriteSheet');
  Icons = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.Icons');
  RedButton = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.RedButton');
  IconTitle = $J.load('com.shatteredpixel.shatteredpixeldungeon.windows.IconTitle');
  Game = $J.load('com.watabou.noosa.Game');
});
