// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/windows/WndChooseAbility.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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

let Dungeon, Statistics, KingsCrown, Messages, GameScene, PixelScene, ItemSprite, HeroIcon, IconButton, Icons, RedButton, IconTitle, WndInfoArmorAbility, WndOptions, Game, Random;

export class WndChooseAbility extends Window {
  static readonly WIDTH: number = 130;
  static readonly GAP: number = 2;
  _WndChooseAbility(crown: KingsCrown, armor: Armor, hero: Hero): this {
    this._Window$();
    let titlebar = new IconTitle()._IconTitle$();
    titlebar.icon(new ItemSprite()._ItemSprite$int$Glowing(crown == null ? armor.image() : crown.image(), null));
    titlebar.label$String(Messages.titleCase(crown == null ? armor.name() : crown.name()));
    titlebar.setRect(0, 0, Math.fround(WndChooseAbility.WIDTH), 0);
    this.add$Gizmo(titlebar);
    let random = new (WndChooseAbility$1())().$o(this).$c(hero, crown, armor)._IconButton$Image(Icons.SHUFFLE.get());
    random.setRect(Math.fround((WndChooseAbility.WIDTH - 16) | 0), 0, 16, 16);
    if (crown != null) {
      this.add$Gizmo(random);
    }
    let body = PixelScene.renderTextBlock$int(6);
    if (crown != null) {
      body.text$String$int(Messages.get$Object$String$ObjectArr(this, 'message', []), WndChooseAbility.WIDTH);
    } else {
      body.text$String$int(Messages.get$Object$String$ObjectArr(this, 'message_no_crown', []), WndChooseAbility.WIDTH);
    }
    body.setPos(titlebar.left(), Math.fround(titlebar.bottom() + WndChooseAbility.GAP));
    this.add$Gizmo(body);
    let pos = Math.fround(body.bottom() + Math.fround(3 * WndChooseAbility.GAP));
    for (let ability of hero.heroClass.armorAbilities()) {
      let abilityButton = new (WndChooseAbility$2())().$o(this).$c(ability, crown, hero, armor)._RedButton$String$int(ability.shortDesc(), 6);
      abilityButton.leftJustify = true;
      abilityButton.multiline = true;
      abilityButton.setSize(Math.fround((WndChooseAbility.WIDTH - 20) | 0), Math.fround(abilityButton.reqHeight() + 2));
      abilityButton.setRect(0, pos, Math.fround((WndChooseAbility.WIDTH - 20) | 0), Math.fround(abilityButton.reqHeight() + 2));
      this.add$Gizmo(abilityButton);
      let abilityInfo = new (WndChooseAbility$3())().$o(this).$c(ability)._IconButton$Image(Icons.get$Icons(Icons.INFO));
      abilityInfo.setRect(Math.fround((WndChooseAbility.WIDTH - 20) | 0), Math.fround(abilityButton.top() + Math.fround((Math.fround(abilityButton.height() - 20)) / 2)), 20, 20);
      this.add$Gizmo(abilityInfo);
      pos = Math.fround(abilityButton.bottom() + WndChooseAbility.GAP);
    }
    let cancelButton = new (WndChooseAbility$4())().$o(this)._RedButton$String(Messages.get$Object$String$ObjectArr(this, 'cancel', []));
    cancelButton.setRect(0, pos, Math.fround(WndChooseAbility.WIDTH), 18);
    this.add$Gizmo(cancelButton);
    pos = Math.fround(cancelButton.bottom() + WndChooseAbility.GAP);
    this.resize(WndChooseAbility.WIDTH, $J.d2i(pos));
    return this;
  }
}

let $WndChooseAbility$1$1: any = null;
/** An anonymous class (WndChooseAbility.java:67). */
function WndChooseAbility$1$1(): any {
  return $WndChooseAbility$1$1 ??= $J.local(class extends WndOptions {
    onSelect(index: number): void {
      super.onSelect(index);
      if (index === 0) {
        this.$outer.$outer.hide();
        let abil = Random.oneOf(this.$cv_hero.heroClass.armorAbilities());
        this.$cv_crown.upgradeArmor(this.$cv_hero, this.$cv_armor, abil);
        GameScene.show(new WndInfoArmorAbility()._WndInfoArmorAbility(this.$cv_hero.heroClass, abil));
      }
    }
    $c($hero, $crown, $armor): this {
      this.$cv_hero = $hero; this.$cv_crown = $crown; this.$cv_armor = $armor;
      return this;
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.windows.WndChooseAbility$1$1', []);
}

let $WndChooseAbility$1: any = null;
/** An anonymous class (WndChooseAbility.java:59). */
function WndChooseAbility$1(): any {
  return $WndChooseAbility$1 ??= $J.local(class extends IconButton {
    onClick(): void {
      super.onClick();
      GameScene.show(new (WndChooseAbility$1$1())().$o(this).$c(this.$cv_hero, this.$cv_crown, this.$cv_armor)._WndOptions$Image$String$String$StringArr(Icons.SHUFFLE.get(), Messages.get$Class$String$ObjectArr($J.cls(WndChooseAbility), 'random_title', []), Messages.get$Class$String$ObjectArr($J.cls(WndChooseAbility), 'random_sure', []), [Messages.get$Class$String$ObjectArr($J.cls(WndChooseAbility), 'yes', []), Messages.get$Class$String$ObjectArr($J.cls(WndChooseAbility), 'no', [])]));
    }
    update(): void {
      if (Statistics.qualifiedForRandomVictoryBadge) {
        this.icon_.tint$float$float$float$float(1, 1, 1, Math.fround(Math.abs(Math.cos(1.5 * 3.141592653589793 * Game.timeTotal) / 2)));
      }
      super.update();
    }
    hoverText(): string {
      return Messages.get$Class$String$ObjectArr($J.cls(WndChooseAbility), 'random_title', []);
    }
    $c($hero, $crown, $armor): this {
      this.$cv_hero = $hero; this.$cv_crown = $crown; this.$cv_armor = $armor;
      return this;
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.windows.WndChooseAbility$1', []);
}

let $WndChooseAbility$2$1: any = null;
/** An anonymous class (WndChooseAbility.java:116). */
function WndChooseAbility$2$1(): any {
  return $WndChooseAbility$2$1 ??= $J.local(class extends WndOptions {
    onSelect(index: number): void {
      this.hide();
      if (index === 0 && this.$outer.$outer.parent != null) {
        this.$outer.$outer.hide();
        if (this.$cv_crown != null) {
          this.$cv_crown.upgradeArmor(this.$cv_hero, this.$cv_armor, this.$cv_ability);
        } else {
          new KingsCrown()._KingsCrown().upgradeArmor(this.$cv_hero, null, this.$cv_ability);
        }
        Statistics.qualifiedForRandomVictoryBadge = false;
      }
    }
    $c($crown, $hero, $armor, $ability): this {
      this.$cv_crown = $crown; this.$cv_hero = $hero; this.$cv_armor = $armor; this.$cv_ability = $ability;
      return this;
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.windows.WndChooseAbility$2$1', []);
}

let $WndChooseAbility$2: any = null;
/** An anonymous class (WndChooseAbility.java:109). */
function WndChooseAbility$2(): any {
  return $WndChooseAbility$2 ??= $J.local(class extends RedButton {
    onClick(): void {
      GameScene.show(new (WndChooseAbility$2$1())().$o(this).$c(this.$cv_crown, this.$cv_hero, this.$cv_armor, this.$cv_ability)._WndOptions$Image$String$String$StringArr(new HeroIcon()._HeroIcon$ArmorAbility(this.$cv_ability), Messages.titleCase(this.$cv_ability.name()), Messages.get$Object$String$ObjectArr(this.$outer, 'are_you_sure', []), [Messages.get$Object$String$ObjectArr(this.$outer, 'yes', []), Messages.get$Object$String$ObjectArr(this.$outer, 'no', [])]));
    }
    $c($ability, $crown, $hero, $armor): this {
      this.$cv_ability = $ability; this.$cv_crown = $crown; this.$cv_hero = $hero; this.$cv_armor = $armor;
      return this;
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.windows.WndChooseAbility$2', []);
}

let $WndChooseAbility$3: any = null;
/** An anonymous class (WndChooseAbility.java:140). */
function WndChooseAbility$3(): any {
  return $WndChooseAbility$3 ??= $J.local(class extends IconButton {
    onClick(): void {
      GameScene.show(new WndInfoArmorAbility()._WndInfoArmorAbility(Dungeon.hero.heroClass, this.$cv_ability));
    }
    $c($ability): this {
      this.$cv_ability = $ability;
      return this;
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.windows.WndChooseAbility$3', []);
}

let $WndChooseAbility$4: any = null;
/** An anonymous class (WndChooseAbility.java:152). */
function WndChooseAbility$4(): any {
  return $WndChooseAbility$4 ??= $J.local(class extends RedButton {
    onClick(): void {
      this.$outer.hide();
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.windows.WndChooseAbility$4', []);
}

$J.define(WndChooseAbility, 'com.shatteredpixel.shatteredpixeldungeon.windows.WndChooseAbility', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.ui.Window', ctors: { 'com.shatteredpixel.shatteredpixeldungeon.items.KingsCrown,com.shatteredpixel.shatteredpixeldungeon.items.armor.Armor,com.shatteredpixel.shatteredpixeldungeon.actors.hero.Hero': '_WndChooseAbility' } });
$J.module(() => {
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  Statistics = $J.load('com.shatteredpixel.shatteredpixeldungeon.Statistics');
  KingsCrown = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.KingsCrown');
  Messages = $J.load('com.shatteredpixel.shatteredpixeldungeon.messages.Messages');
  GameScene = $J.load('com.shatteredpixel.shatteredpixeldungeon.scenes.GameScene');
  PixelScene = $J.load('com.shatteredpixel.shatteredpixeldungeon.scenes.PixelScene');
  ItemSprite = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.ItemSprite');
  HeroIcon = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.HeroIcon');
  IconButton = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.IconButton');
  Icons = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.Icons');
  RedButton = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.RedButton');
  IconTitle = $J.load('com.shatteredpixel.shatteredpixeldungeon.windows.IconTitle');
  WndInfoArmorAbility = $J.load('com.shatteredpixel.shatteredpixeldungeon.windows.WndInfoArmorAbility');
  WndOptions = $J.load('com.shatteredpixel.shatteredpixeldungeon.windows.WndOptions');
  Game = $J.load('com.watabou.noosa.Game');
  Random = $J.load('com.watabou.utils.Random');
});
