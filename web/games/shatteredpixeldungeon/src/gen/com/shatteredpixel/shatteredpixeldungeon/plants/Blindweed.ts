// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/plants/Blindweed.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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

let Dungeon, Blindness, Buff, Cripple, Invisibility, Hero, HeroSubClass, Mob, CellEmitter, Speck, Trap$HazardAssistTracker, ItemSpriteSheet;

export class Blindweed extends Plant {
  _Blindweed(): this {
    this._Plant();
    this.image_ = 11;
    this.seedClass = $J.cls(Blindweed$Seed);
    return this;
  }
  activate(ch: Char): void {
    if (ch != null) {
      if (ch instanceof Hero && (ch).subClass === HeroSubClass.WARDEN) {
        Buff.affect$Char$Class$float(ch, $J.cls(Invisibility), Math.fround(Invisibility.DURATION / 2));
      } else {
        Buff.prolong(ch, $J.cls(Blindness), Blindness.DURATION);
        Buff.prolong(ch, $J.cls(Cripple), Cripple.DURATION);
        if (ch instanceof Mob) {
          Buff.prolong(ch, $J.cls(Trap$HazardAssistTracker), Trap$HazardAssistTracker.DURATION);
          if ((ch).state_ === (ch).HUNTING) {
            (ch).state_ = (ch).WANDERING;
          }
          (ch).beckon(Dungeon.level.randomDestination(ch));
        }
      }
    }
    if (Dungeon.level.heroFOV[this.pos]) {
      CellEmitter.get(this.pos).burst(Speck.factory$int(Speck.LIGHT), 4);
    }
  }
}

export class Blindweed$Seed extends Plant$Seed {
  _Blindweed$Seed(): this {
    this._Plant$Seed();
    this.image_ = ItemSpriteSheet.SEED_BLINDWEED;
    this.plantClass = $J.cls(Blindweed);
    return this;
  }
}

$J.define(Blindweed, 'com.shatteredpixel.shatteredpixeldungeon.plants.Blindweed', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.plants.Plant', ctors: { '': '_Blindweed' } });
$J.define(Blindweed$Seed, 'com.shatteredpixel.shatteredpixeldungeon.plants.Blindweed$Seed', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.plants.Plant$Seed', ctors: { '': '_Blindweed$Seed' } });
$J.module(() => {
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  Blindness = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Blindness');
  Buff = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Buff');
  Cripple = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Cripple');
  Invisibility = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Invisibility');
  Hero = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.Hero');
  HeroSubClass = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.HeroSubClass');
  Mob = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.Mob');
  CellEmitter = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.CellEmitter');
  Speck = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.Speck');
  Trap$HazardAssistTracker = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.traps.Trap$HazardAssistTracker');
  ItemSpriteSheet = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.ItemSpriteSheet');
});
