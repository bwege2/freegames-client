// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/items/wands/DamageWand.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { Wand } from './Wand.ts';

let Assets$Sounds, Dungeon, WandEmpower, Hero, Messages, Sample;

export class DamageWand extends Wand {
  _DamageWand(): this {
    this._Wand();
    return this;
  }
  min$(): number {
    return this.min$int(this.buffedLvl());
  }
  max$(): number {
    return this.max$int(this.buffedLvl());
  }
  damageRoll$(): number {
    return this.damageRoll$int(this.buffedLvl());
  }
  damageRoll$int(lvl: number): number {
    let dmg = Hero.heroDamageIntRange(this.min$int(lvl), this.max$int(lvl));
    let emp = Dungeon.hero.buff($J.cls(WandEmpower));
    if (emp != null) {
      dmg = (dmg + emp.dmgBoost) | 0;
      emp.left_--;
      if (emp.left_ <= 0) {
        emp.detach();
      }
      Sample.INSTANCE.play$Object$float$float(Assets$Sounds.HIT_STRONG, 0.75, Math.fround(1.2));
    }
    return dmg;
  }
  statsDesc(): string {
    if (this.levelKnown) {
      return Messages.get$Object$String$ObjectArr(this, 'stats_desc', [this.min$(), this.max$()]);
    } else {
      return Messages.get$Object$String$ObjectArr(this, 'stats_desc', [this.min$int(0), this.max$int(0)]);
    }
  }
  upgradeStat1(level: number): string {
    return this.min$int(level) + '-' + this.max$int(level);
  }
}

$J.define(DamageWand, 'com.shatteredpixel.shatteredpixeldungeon.items.wands.DamageWand', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.items.wands.Wand', ctors: { '': '_DamageWand' }, meths: { 'damageRoll(int)': 'damageRoll$int', 'damageRoll()': 'damageRoll$', 'max(int)': 'max$int', 'max()': 'max$', 'min(int)': 'min$int', 'min()': 'min$' } });
$J.module(() => {
  Assets$Sounds = $J.load('com.shatteredpixel.shatteredpixeldungeon.Assets$Sounds');
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  WandEmpower = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.WandEmpower');
  Hero = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.Hero');
  Messages = $J.load('com.shatteredpixel.shatteredpixeldungeon.messages.Messages');
  Sample = $J.load('com.watabou.noosa.audio.Sample');
});
