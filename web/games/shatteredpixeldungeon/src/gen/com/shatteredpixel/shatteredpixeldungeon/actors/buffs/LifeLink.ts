// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/actors/buffs/LifeLink.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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

let Dungeon, Actor, Buff$buffType, Talent, BuffIndicator;

export class LifeLink extends FlavourBuff {
  object: number = 0;
  static readonly OBJECT: string = 'object';
  _LifeLink(): this {
    this._FlavourBuff();
    this.object = 0;
    this.type_ = Buff$buffType.POSITIVE;
    this.announced = true;
    return this;
  }
  detach(): void {
    super.detach();
    let ch = Actor.findById(this.object);
    if (!this.target.isActive() && ch != null) {
      for (const $it0 = ch.buffs$Class($J.cls(LifeLink)).iterator(); $it0.hasNext(); ) {
        let l = $it0.next();
        if (l.object === this.target.id()) {
          l.detach();
        }
      }
    }
  }
  storeInBundle(bundle: Bundle): void {
    super.storeInBundle(bundle);
    bundle.put$String$int(LifeLink.OBJECT, this.object);
  }
  restoreFromBundle(bundle: Bundle): void {
    super.restoreFromBundle(bundle);
    this.object = bundle.getInt(LifeLink.OBJECT);
  }
  icon(): number {
    return BuffIndicator.HERB_HEALING;
  }
  tintIcon(icon: Image): void {
    icon.hardlight$float$float$float(1, 0, 1);
  }
  iconFadePercent(): number {
    let duration = $J.roundf(Math.fround(Math.fround(6.67) + Math.fround(Math.fround(3.33) * Dungeon.hero.pointsInTalent(Talent.LIFE_LINK))));
    return Math.max(0, Math.fround((Math.fround(duration - this.visualcooldown())) / duration));
  }
}

$J.define(LifeLink, 'com.shatteredpixel.shatteredpixeldungeon.actors.buffs.LifeLink', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.actors.buffs.FlavourBuff', ctors: { '': '_LifeLink' } });
$J.module(() => {
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  Actor = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Actor');
  Buff$buffType = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Buff$buffType');
  Talent = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.Talent');
  BuffIndicator = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.BuffIndicator');
});
