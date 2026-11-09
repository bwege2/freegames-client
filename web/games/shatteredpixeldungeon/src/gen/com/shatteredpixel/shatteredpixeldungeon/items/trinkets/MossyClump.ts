// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/items/trinkets/MossyClump.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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

export class MossyClump extends Trinket {
  levelFeels: ArrayList<boolean> = null;
  shuffles: number = 0;
  static readonly FEELS: string = 'feels';
  static readonly SHUFFLES: string = 'shuffles';
  _MossyClump(): this {
    this._Trinket();
    this.image_ = ItemSpriteSheet.MOSSY_CLUMP;
    this.levelFeels = new ArrayList();
    this.shuffles = 0;
    return this;
  }
  upgradeEnergyCost(): number {
    return (10 + Math.imul(5, this.level$())) | 0;
  }
  statsDesc(): string {
    if (this.isIdentified()) {
      return Messages.get$Object$String$ObjectArr(this, 'stats_desc', [$J.d2i((Math.fround(100 * MossyClump.overrideNormalLevelChance$int(this.buffedLvl()))))]);
    } else {
      return Messages.get$Object$String$ObjectArr(this, 'typical_stats_desc', [$J.d2i((Math.fround(100 * MossyClump.overrideNormalLevelChance$int(0))))]);
    }
  }
  static overrideNormalLevelChance$(): number {
    return MossyClump.overrideNormalLevelChance$int(Trinket.trinketLevel($J.cls(MossyClump)));
  }
  static overrideNormalLevelChance$int(level: number): number {
    if (level === -1) {
      return 0;
    } else {
      return Math.fround(0.25 + Math.fround(0.25 * level));
    }
  }
  static getNextFeeling(): Level$Feeling {
    let clump = Dungeon.hero.belongings.getItem($J.cls(MossyClump));
    if (clump == null) {
      return Level$Feeling.NONE;
    }
    if (clump.levelFeels.isEmpty()) {
      Random.pushGenerator$long(BigInt.asIntN(64, Dungeon.seed + 1n));
      clump.levelFeels.add(true);
      clump.levelFeels.add(true);
      clump.levelFeels.add(false);
      clump.levelFeels.add(false);
      clump.levelFeels.add(false);
      clump.levelFeels.add(false);
      for (let i = 0; i <= clump.shuffles; i++) {
        Random.shuffle$List(clump.levelFeels);
      }
      clump.shuffles++;
      Random.popGenerator();
    }
    return clump.levelFeels.removeAt(0) ? Level$Feeling.GRASS : Level$Feeling.WATER;
  }
  storeInBundle(bundle: Bundle): void {
    super.storeInBundle(bundle);
    if (!this.levelFeels.isEmpty()) {
      let storeFeels = $J.newArray(this.levelFeels.size(), false);
      for (let i = 0; i < storeFeels.length; i++) {
        storeFeels[i] = this.levelFeels.get(i);
      }
      bundle.put$String$booleanArr(MossyClump.FEELS, storeFeels);
    }
    bundle.put$String$int(MossyClump.SHUFFLES, this.shuffles);
  }
  restoreFromBundle(bundle: Bundle): void {
    super.restoreFromBundle(bundle);
    this.levelFeels.clear();
    if (bundle.contains(MossyClump.FEELS)) {
      for (let b of bundle.getBooleanArray(MossyClump.FEELS)) {
        this.levelFeels.add(b);
      }
    }
    this.shuffles = bundle.getInt(MossyClump.SHUFFLES);
  }
}

$J.define(MossyClump, 'com.shatteredpixel.shatteredpixeldungeon.items.trinkets.MossyClump', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.items.trinkets.Trinket', ctors: { '': '_MossyClump' }, meths: { 'overrideNormalLevelChance(int)': 'overrideNormalLevelChance$int', 'overrideNormalLevelChance()': 'overrideNormalLevelChance$' } });
$J.module(() => {
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  Level$Feeling = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.Level$Feeling');
  Messages = $J.load('com.shatteredpixel.shatteredpixeldungeon.messages.Messages');
  ItemSpriteSheet = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.ItemSpriteSheet');
  Random = $J.load('com.watabou.utils.Random');
});
