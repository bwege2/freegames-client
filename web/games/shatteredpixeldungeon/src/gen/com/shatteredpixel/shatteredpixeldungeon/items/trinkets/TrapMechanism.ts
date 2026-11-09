// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/items/trinkets/TrapMechanism.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { $J, ArrayList } from '../../../../../../jre/index.ts';
import { Trinket } from './Trinket.ts';

let Dungeon, Level$Feeling, Messages, ItemSpriteSheet, Random;

export class TrapMechanism extends Trinket {
  levelFeels: ArrayList<boolean> = null;
  shuffles: number = 0;
  static readonly FEELS: string = 'feels';
  static readonly SHUFFLES: string = 'shuffles';
  _TrapMechanism(): this {
    this._Trinket();
    this.image_ = ItemSpriteSheet.TRAP_MECHANISM;
    this.levelFeels = new ArrayList();
    this.shuffles = 0;
    return this;
  }
  upgradeEnergyCost(): number {
    return (6 + Math.imul(2, this.level$())) | 0;
  }
  statsDesc(): string {
    if (this.isIdentified()) {
      return Messages.get$Object$String$ObjectArr(this, 'stats_desc', [$J.d2i((Math.fround(100 * TrapMechanism.overrideNormalLevelChance$int(this.buffedLvl())))), $J.d2i((Math.fround(100 * TrapMechanism.revealHiddenTrapChance$int(this.buffedLvl()))))]);
    } else {
      return Messages.get$Object$String$ObjectArr(this, 'typical_stats_desc', [$J.d2i((Math.fround(100 * TrapMechanism.overrideNormalLevelChance$int(0)))), $J.d2i((Math.fround(100 * TrapMechanism.revealHiddenTrapChance$int(0))))]);
    }
  }
  static overrideNormalLevelChance$(): number {
    return TrapMechanism.overrideNormalLevelChance$int(Trinket.trinketLevel($J.cls(TrapMechanism)));
  }
  static overrideNormalLevelChance$int(level: number): number {
    if (level === -1) {
      return 0;
    } else {
      return Math.fround(0.25 + Math.fround(0.25 * level));
    }
  }
  static revealHiddenTrapChance$(): number {
    return TrapMechanism.revealHiddenTrapChance$int(Trinket.trinketLevel($J.cls(TrapMechanism)));
  }
  static revealHiddenTrapChance$int(level: number): number {
    if (level === -1) {
      return 0;
    } else {
      return Math.fround(Math.fround(0.1) + Math.fround(Math.fround(0.1) * level));
    }
  }
  static getNextFeeling(): Level$Feeling {
    let mech = Dungeon.hero.belongings.getItem($J.cls(TrapMechanism));
    if (mech == null) {
      return Level$Feeling.NONE;
    }
    if (mech.levelFeels.isEmpty()) {
      Random.pushGenerator$long(BigInt.asIntN(64, Dungeon.seed + 1n));
      mech.levelFeels.add(true);
      mech.levelFeels.add(true);
      mech.levelFeels.add(true);
      mech.levelFeels.add(false);
      mech.levelFeels.add(false);
      mech.levelFeels.add(false);
      for (let i = 0; i <= mech.shuffles; i++) {
        Random.shuffle$List(mech.levelFeels);
      }
      mech.shuffles++;
      Random.popGenerator();
    }
    return mech.levelFeels.removeAt(0) ? Level$Feeling.TRAPS : Level$Feeling.CHASM;
  }
  storeInBundle(bundle: Bundle): void {
    super.storeInBundle(bundle);
    if (!this.levelFeels.isEmpty()) {
      let storeFeels = $J.newArray(this.levelFeels.size(), false);
      for (let i = 0; i < storeFeels.length; i++) {
        storeFeels[i] = this.levelFeels.get(i);
      }
      bundle.put$String$booleanArr(TrapMechanism.FEELS, storeFeels);
    }
    bundle.put$String$int(TrapMechanism.SHUFFLES, this.shuffles);
  }
  restoreFromBundle(bundle: Bundle): void {
    super.restoreFromBundle(bundle);
    this.levelFeels.clear();
    if (bundle.contains(TrapMechanism.FEELS)) {
      for (let b of bundle.getBooleanArray(TrapMechanism.FEELS)) {
        this.levelFeels.add(b);
      }
    }
    this.shuffles = bundle.getInt(TrapMechanism.SHUFFLES);
  }
}

$J.define(TrapMechanism, 'com.shatteredpixel.shatteredpixeldungeon.items.trinkets.TrapMechanism', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.items.trinkets.Trinket', ctors: { '': '_TrapMechanism' }, meths: { 'revealHiddenTrapChance(int)': 'revealHiddenTrapChance$int', 'revealHiddenTrapChance()': 'revealHiddenTrapChance$', 'overrideNormalLevelChance(int)': 'overrideNormalLevelChance$int', 'overrideNormalLevelChance()': 'overrideNormalLevelChance$' } });
$J.module(() => {
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  Level$Feeling = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.Level$Feeling');
  Messages = $J.load('com.shatteredpixel.shatteredpixeldungeon.messages.Messages');
  ItemSpriteSheet = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.ItemSpriteSheet');
  Random = $J.load('com.watabou.utils.Random');
});
