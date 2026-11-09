// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/actors/hero/abilities/ArmorAbility.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { $J, JObject } from '../../../../../../../jre/index.ts';

let Talent, Ballistica, Messages, CellSelector$Listener, GameScene, HeroIcon;

export class ArmorAbility extends JObject {
  baseChargeUse_: number = 0;
  _ArmorAbility(): this {
    this.baseChargeUse_ = 35;
    return this;
  }
  use(armor: ClassArmor, hero: Hero): void {
    if (this.targetingPrompt() == null) {
      this.activate(armor, hero, hero.pos);
    } else {
      GameScene.selectCell(new (ArmorAbility$1())().$o(this).$c(armor, hero)._CellSelector$Listener());
    }
  }
  targetingPrompt(): string {
    return null;
  }
  useTargeting(): boolean {
    return this.targetingPrompt() != null;
  }
  targetedPos(user: Char, dst: number): number {
    return new Ballistica()._Ballistica(user.pos, dst, Ballistica.PROJECTILE).collisionPos;
  }
  chargeUse(hero: Hero): number {
    let chargeUse = this.baseChargeUse_;
    if (hero.hasTalent(Talent.HEROIC_ENERGY)) {
      switch (hero.pointsInTalent(Talent.HEROIC_ENERGY)) {
        case 1:
        default:
          chargeUse = Math.fround(chargeUse * Math.fround(0.88));
          break;
        case 2:
          chargeUse = Math.fround(chargeUse * Math.fround(0.77));
          break;
        case 3:
          chargeUse = Math.fround(chargeUse * Math.fround(0.68));
          break;
        case 4:
          chargeUse = Math.fround(chargeUse * Math.fround(0.6));
          break;
      }
    }
    return chargeUse;
  }
  name(): string {
    return Messages.get$Object$String$ObjectArr(this, 'name', []);
  }
  shortDesc(): string {
    return Messages.get$Object$String$ObjectArr(this, 'short_desc', []);
  }
  desc(): string {
    return Messages.get$Object$String$ObjectArr(this, 'desc', []) + '\n\n' + Messages.get$Object$String$ObjectArr(this, 'cost', [$J.d2i(this.baseChargeUse_)]);
  }
  icon(): number {
    return HeroIcon.NONE;
  }
  storeInBundle(bundle: Bundle): void {
  }
  restoreFromBundle(bundle: Bundle): void {
  }
}

let $ArmorAbility$1: any = null;
/** An anonymous class (ArmorAbility.java:44). */
function ArmorAbility$1(): any {
  return $ArmorAbility$1 ??= $J.local(class extends CellSelector$Listener {
    onSelect(cell: number): void {
      this.$outer.activate(this.$cv_armor, this.$cv_hero, cell);
    }
    prompt(): string {
      return this.$outer.targetingPrompt();
    }
    $c($armor, $hero): this {
      this.$cv_armor = $armor; this.$cv_hero = $hero;
      return this;
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.actors.hero.abilities.ArmorAbility$1', []);
}

$J.define(ArmorAbility, 'com.shatteredpixel.shatteredpixeldungeon.actors.hero.abilities.ArmorAbility', { kind: 'class', ifaces: ['com.watabou.utils.Bundlable'], sup: 'java.lang.Object', ctors: { '': '_ArmorAbility' } });
$J.module(() => {
  Talent = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.Talent');
  Ballistica = $J.load('com.shatteredpixel.shatteredpixeldungeon.mechanics.Ballistica');
  Messages = $J.load('com.shatteredpixel.shatteredpixeldungeon.messages.Messages');
  CellSelector$Listener = $J.load('com.shatteredpixel.shatteredpixeldungeon.scenes.CellSelector$Listener');
  GameScene = $J.load('com.shatteredpixel.shatteredpixeldungeon.scenes.GameScene');
  HeroIcon = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.HeroIcon');
});
