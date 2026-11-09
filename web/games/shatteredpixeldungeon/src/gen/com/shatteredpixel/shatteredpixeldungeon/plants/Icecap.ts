// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/plants/Icecap.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { Plant } from './Plant.ts';
import { Plant$Seed } from './Plant.ts';

let Dungeon, Actor, Freezing, Buff, FrostImbue, Hero, HeroSubClass, Mob, Trap$HazardAssistTracker, ItemSpriteSheet, PathFinder;

export class Icecap extends Plant {
  _Icecap(): this {
    this._Plant();
    this.image_ = 4;
    this.seedClass = $J.cls(Icecap$Seed);
    return this;
  }
  activate(ch: Char): void {
    if (ch instanceof Hero && (ch).subClass === HeroSubClass.WARDEN) {
      Buff.affect$Char$Class$float(ch, $J.cls(FrostImbue), Math.fround(FrostImbue.DURATION * Math.fround(0.3)));
    }
    for (let i of PathFinder.NEIGHBOURS9) {
      if (!(Dungeon.level.solid[(this.pos + i) | 0])) {
        Freezing.affect((this.pos + i) | 0);
        if ((Actor.findChar((this.pos + i) | 0)) instanceof Mob) {
          Buff.prolong(Actor.findChar((this.pos + i) | 0), $J.cls(Trap$HazardAssistTracker), Trap$HazardAssistTracker.DURATION);
        }
      }
    }
  }
}

export class Icecap$Seed extends Plant$Seed {
  _Icecap$Seed(): this {
    this._Plant$Seed();
    this.image_ = ItemSpriteSheet.SEED_ICECAP;
    this.plantClass = $J.cls(Icecap);
    return this;
  }
}

$J.define(Icecap, 'com.shatteredpixel.shatteredpixeldungeon.plants.Icecap', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.plants.Plant', ctors: { '': '_Icecap' } });
$J.define(Icecap$Seed, 'com.shatteredpixel.shatteredpixeldungeon.plants.Icecap$Seed', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.plants.Plant$Seed', ctors: { '': '_Icecap$Seed' } });
$J.module(() => {
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  Actor = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Actor');
  Freezing = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.blobs.Freezing');
  Buff = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Buff');
  FrostImbue = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.FrostImbue');
  Hero = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.Hero');
  HeroSubClass = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.HeroSubClass');
  Mob = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.Mob');
  Trap$HazardAssistTracker = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.traps.Trap$HazardAssistTracker');
  ItemSpriteSheet = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.ItemSpriteSheet');
  PathFinder = $J.load('com.watabou.utils.PathFinder');
});
