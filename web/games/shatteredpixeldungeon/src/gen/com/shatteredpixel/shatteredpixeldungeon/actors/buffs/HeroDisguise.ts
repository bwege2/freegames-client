// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/actors/buffs/HeroDisguise.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { $J } from '../../../../../../jre/index.ts';
import { FlavourBuff } from './FlavourBuff.ts';

let Hero, HeroClass, GameScene, HeroSprite, BuffIndicator, Random;

export class HeroDisguise extends FlavourBuff {
  cls: HeroClass = null;
  static DURATION: number = 0;
  static readonly CLASS: string = 'class';
  _HeroDisguise(): this {
    this._FlavourBuff();
    this.announced = true;
    this.cls = null;
    return this;
  }
  getDisguise(): HeroClass {
    return this.cls;
  }
  icon(): number {
    return BuffIndicator.DISGUISE;
  }
  iconFadePercent(): number {
    return Math.max(0, Math.fround((Math.fround(HeroDisguise.DURATION - this.visualcooldown())) / HeroDisguise.DURATION));
  }
  fx(on: boolean): void {
    if (this.target instanceof Hero && this.target.sprite_ instanceof HeroSprite) {
      if (this.cls == null) {
        do {
          this.cls = Random.oneOf(HeroClass.values());
        } while (this.cls === (this.target).heroClass);
      }
      if (on) {
        (this.target.sprite_).disguise(this.cls);
      } else {
        (this.target.sprite_).disguise((this.target).heroClass);
      }
      GameScene.updateAvatar();
    }
  }
  storeInBundle(bundle: Bundle): void {
    super.storeInBundle(bundle);
    bundle.put$String$Enum(HeroDisguise.CLASS, this.cls);
  }
  restoreFromBundle(bundle: Bundle): void {
    super.restoreFromBundle(bundle);
    this.cls = bundle.getEnum(HeroDisguise.CLASS, $J.cls(HeroClass));
  }
  static $clinit() {
    HeroDisguise.DURATION = 1000;
  }
}

$J.define(HeroDisguise, 'com.shatteredpixel.shatteredpixeldungeon.actors.buffs.HeroDisguise', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.actors.buffs.FlavourBuff', ctors: { '': '_HeroDisguise' }, clinit: true, lazy: ['DURATION'] });
$J.module(() => {
  Hero = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.Hero');
  HeroClass = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.HeroClass');
  GameScene = $J.load('com.shatteredpixel.shatteredpixeldungeon.scenes.GameScene');
  HeroSprite = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.HeroSprite');
  BuffIndicator = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.BuffIndicator');
  Random = $J.load('com.watabou.utils.Random');
});
