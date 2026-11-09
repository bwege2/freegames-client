// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/plants/Stormvine.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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

let Buff, Levitation, Vertigo, Hero, HeroSubClass, Mob, Trap$HazardAssistTracker, ItemSpriteSheet;

export class Stormvine extends Plant {
  _Stormvine(): this {
    this._Plant();
    this.image_ = 5;
    this.seedClass = $J.cls(Stormvine$Seed);
    return this;
  }
  activate(ch: Char): void {
    if (ch != null) {
      if (ch instanceof Hero && (ch).subClass === HeroSubClass.WARDEN) {
        Buff.affect$Char$Class$float(ch, $J.cls(Levitation), Math.fround(Levitation.DURATION / 2));
      } else {
        if (ch instanceof Mob) {
          Buff.prolong(ch, $J.cls(Trap$HazardAssistTracker), Trap$HazardAssistTracker.DURATION);
        }
        Buff.affect$Char$Class$float(ch, $J.cls(Vertigo), Vertigo.DURATION);
      }
    }
  }
}

export class Stormvine$Seed extends Plant$Seed {
  _Stormvine$Seed(): this {
    this._Plant$Seed();
    this.image_ = ItemSpriteSheet.SEED_STORMVINE;
    this.plantClass = $J.cls(Stormvine);
    return this;
  }
}

$J.define(Stormvine, 'com.shatteredpixel.shatteredpixeldungeon.plants.Stormvine', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.plants.Plant', ctors: { '': '_Stormvine' } });
$J.define(Stormvine$Seed, 'com.shatteredpixel.shatteredpixeldungeon.plants.Stormvine$Seed', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.plants.Plant$Seed', ctors: { '': '_Stormvine$Seed' } });
$J.module(() => {
  Buff = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Buff');
  Levitation = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Levitation');
  Vertigo = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Vertigo');
  Hero = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.Hero');
  HeroSubClass = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.HeroSubClass');
  Mob = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.Mob');
  Trap$HazardAssistTracker = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.traps.Trap$HazardAssistTracker');
  ItemSpriteSheet = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.ItemSpriteSheet');
});
