// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/windows/WndChooseSubclass.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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

let Dungeon, Statistics, Messages, GameScene, PixelScene, ItemSprite, HeroIcon, IconButton, Icons, RedButton, IconTitle, WndInfoSubclass, WndOptions, Game, Random;

export class WndChooseSubclass extends Window {
  static readonly WIDTH: number = 130;
  static readonly GAP: number = 2;
  _WndChooseSubclass(tome: TengusMask, hero: Hero): this {
    this._Window$();
    let titlebar = new IconTitle()._IconTitle$();
    titlebar.icon(new ItemSprite()._ItemSprite$int$Glowing(tome.image(), null));
    titlebar.label$String(tome.name());
    titlebar.setRect(0, 0, Math.fround((WndChooseSubclass.WIDTH - 16) | 0), 0);
    this.add$Gizmo(titlebar);
    let random = new (WndChooseSubclass$1())().$o(this).$c(hero, tome)._IconButton$Image(Icons.SHUFFLE.get());
    random.setRect(Math.fround((WndChooseSubclass.WIDTH - 16) | 0), 0, 16, 16);
    this.add$Gizmo(random);
    let message = PixelScene.renderTextBlock$int(6);
    message.text$String$int(Messages.get$Object$String$ObjectArr(this, 'message', []), WndChooseSubclass.WIDTH);
    message.setPos(titlebar.left(), Math.fround(titlebar.bottom() + WndChooseSubclass.GAP));
    this.add$Gizmo(message);
    let pos = Math.fround(message.bottom() + Math.fround(3 * WndChooseSubclass.GAP));
    for (let subCls of hero.heroClass.subClasses()) {
      let btnCls = new (WndChooseSubclass$2())().$o(this).$c(subCls, tome)._RedButton$String$int(subCls.shortDesc(), 6);
      btnCls.leftJustify = true;
      btnCls.multiline = true;
      btnCls.setSize(Math.fround((WndChooseSubclass.WIDTH - 20) | 0), Math.fround(btnCls.reqHeight() + 2));
      btnCls.setRect(0, pos, Math.fround((WndChooseSubclass.WIDTH - 20) | 0), Math.fround(btnCls.reqHeight() + 2));
      this.add$Gizmo(btnCls);
      let clsInfo = new (WndChooseSubclass$3())().$o(this).$c(subCls)._IconButton$Image(Icons.get$Icons(Icons.INFO));
      clsInfo.setRect(Math.fround((WndChooseSubclass.WIDTH - 20) | 0), Math.fround(btnCls.top() + Math.fround((Math.fround(btnCls.height() - 20)) / 2)), 20, 20);
      this.add$Gizmo(clsInfo);
      pos = Math.fround(btnCls.bottom() + WndChooseSubclass.GAP);
    }
    let btnCancel = new (WndChooseSubclass$4())().$o(this)._RedButton$String(Messages.get$Object$String$ObjectArr(this, 'cancel', []));
    btnCancel.setRect(0, pos, Math.fround(WndChooseSubclass.WIDTH), 18);
    this.add$Gizmo(btnCancel);
    this.resize(WndChooseSubclass.WIDTH, $J.d2i(btnCancel.bottom()));
    return this;
  }
}

let $WndChooseSubclass$1$1: any = null;
/** An anonymous class (WndChooseSubclass.java:65). */
function WndChooseSubclass$1$1(): any {
  return $WndChooseSubclass$1$1 ??= $J.local(class extends WndOptions {
    onSelect(index: number): void {
      super.onSelect(index);
      if (index === 0) {
        this.$outer.$outer.hide();
        let cls = Random.oneOf(this.$cv_hero.heroClass.subClasses());
        this.$cv_tome.choose(cls);
        GameScene.show(new WndInfoSubclass()._WndInfoSubclass(this.$cv_hero.heroClass, cls));
      }
    }
    $c($hero, $tome): this {
      this.$cv_hero = $hero; this.$cv_tome = $tome;
      return this;
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.windows.WndChooseSubclass$1$1', []);
}

let $WndChooseSubclass$1: any = null;
/** An anonymous class (WndChooseSubclass.java:57). */
function WndChooseSubclass$1(): any {
  return $WndChooseSubclass$1 ??= $J.local(class extends IconButton {
    onClick(): void {
      super.onClick();
      GameScene.show(new (WndChooseSubclass$1$1())().$o(this).$c(this.$cv_hero, this.$cv_tome)._WndOptions$Image$String$String$StringArr(Icons.SHUFFLE.get(), Messages.get$Class$String$ObjectArr($J.cls(WndChooseSubclass), 'random_title', []), Messages.get$Class$String$ObjectArr($J.cls(WndChooseSubclass), 'random_sure', []), [Messages.get$Class$String$ObjectArr($J.cls(WndChooseSubclass), 'yes', []), Messages.get$Class$String$ObjectArr($J.cls(WndChooseSubclass), 'no', [])]));
    }
    update(): void {
      if (Statistics.qualifiedForRandomVictoryBadge) {
        this.icon_.tint$float$float$float$float(1, 1, 1, Math.fround(Math.abs(Math.cos(1.5 * 3.141592653589793 * Game.timeTotal) / 2)));
      }
      super.update();
    }
    hoverText(): string {
      return Messages.get$Class$String$ObjectArr($J.cls(WndChooseSubclass), 'random_title', []);
    }
    $c($hero, $tome): this {
      this.$cv_hero = $hero; this.$cv_tome = $tome;
      return this;
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.windows.WndChooseSubclass$1', []);
}

let $WndChooseSubclass$2$1: any = null;
/** An anonymous class (WndChooseSubclass.java:110). */
function WndChooseSubclass$2$1(): any {
  return $WndChooseSubclass$2$1 ??= $J.local(class extends WndOptions {
    onSelect(index: number): void {
      this.hide();
      if (index === 0 && this.$outer.$outer.parent != null) {
        this.$outer.$outer.hide();
        this.$cv_tome.choose(this.$cv_subCls);
        Statistics.qualifiedForRandomVictoryBadge = false;
      }
    }
    $c($tome, $subCls): this {
      this.$cv_tome = $tome; this.$cv_subCls = $subCls;
      return this;
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.windows.WndChooseSubclass$2$1', []);
}

let $WndChooseSubclass$2: any = null;
/** An anonymous class (WndChooseSubclass.java:103). */
function WndChooseSubclass$2(): any {
  return $WndChooseSubclass$2 ??= $J.local(class extends RedButton {
    onClick(): void {
      GameScene.show(new (WndChooseSubclass$2$1())().$o(this).$c(this.$cv_tome, this.$cv_subCls)._WndOptions$Image$String$String$StringArr(new HeroIcon()._HeroIcon$HeroSubClass(this.$cv_subCls), Messages.titleCase(this.$cv_subCls.title()), Messages.get$Object$String$ObjectArr(this.$outer, 'are_you_sure', []), [Messages.get$Object$String$ObjectArr(this.$outer, 'yes', []), Messages.get$Object$String$ObjectArr(this.$outer, 'no', [])]));
    }
    $c($subCls, $tome): this {
      this.$cv_subCls = $subCls; this.$cv_tome = $tome;
      return this;
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.windows.WndChooseSubclass$2', []);
}

let $WndChooseSubclass$3: any = null;
/** An anonymous class (WndChooseSubclass.java:129). */
function WndChooseSubclass$3(): any {
  return $WndChooseSubclass$3 ??= $J.local(class extends IconButton {
    onClick(): void {
      GameScene.show(new WndInfoSubclass()._WndInfoSubclass(Dungeon.hero.heroClass, this.$cv_subCls));
    }
    $c($subCls): this {
      this.$cv_subCls = $subCls;
      return this;
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.windows.WndChooseSubclass$3', []);
}

let $WndChooseSubclass$4: any = null;
/** An anonymous class (WndChooseSubclass.java:141). */
function WndChooseSubclass$4(): any {
  return $WndChooseSubclass$4 ??= $J.local(class extends RedButton {
    onClick(): void {
      this.$outer.hide();
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.windows.WndChooseSubclass$4', []);
}

$J.define(WndChooseSubclass, 'com.shatteredpixel.shatteredpixeldungeon.windows.WndChooseSubclass', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.ui.Window', ctors: { 'com.shatteredpixel.shatteredpixeldungeon.items.TengusMask,com.shatteredpixel.shatteredpixeldungeon.actors.hero.Hero': '_WndChooseSubclass' } });
$J.module(() => {
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  Statistics = $J.load('com.shatteredpixel.shatteredpixeldungeon.Statistics');
  Messages = $J.load('com.shatteredpixel.shatteredpixeldungeon.messages.Messages');
  GameScene = $J.load('com.shatteredpixel.shatteredpixeldungeon.scenes.GameScene');
  PixelScene = $J.load('com.shatteredpixel.shatteredpixeldungeon.scenes.PixelScene');
  ItemSprite = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.ItemSprite');
  HeroIcon = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.HeroIcon');
  IconButton = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.IconButton');
  Icons = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.Icons');
  RedButton = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.RedButton');
  IconTitle = $J.load('com.shatteredpixel.shatteredpixeldungeon.windows.IconTitle');
  WndInfoSubclass = $J.load('com.shatteredpixel.shatteredpixeldungeon.windows.WndInfoSubclass');
  WndOptions = $J.load('com.shatteredpixel.shatteredpixeldungeon.windows.WndOptions');
  Game = $J.load('com.watabou.noosa.Game');
  Random = $J.load('com.watabou.utils.Random');
});
