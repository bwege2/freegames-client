// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/plants/Sorrowmoss.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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

let Dungeon, Buff, Poison, ToxicImbue, Hero, HeroSubClass, Mob, CellEmitter, PoisonParticle, Trap$HazardAssistTracker, ItemSpriteSheet;

export class Sorrowmoss extends Plant {
  _Sorrowmoss(): this {
    this._Plant();
    this.image_ = 6;
    this.seedClass = $J.cls(Sorrowmoss$Seed);
    return this;
  }
  activate(ch: Char): void {
    if (ch instanceof Hero && (ch).subClass === HeroSubClass.WARDEN) {
      Buff.affect$Char$Class(ch, $J.cls(ToxicImbue)).set(Math.fround(ToxicImbue.DURATION * Math.fround(0.3)));
    }
    if (ch != null) {
      if (ch instanceof Mob) {
        Buff.prolong(ch, $J.cls(Trap$HazardAssistTracker), Trap$HazardAssistTracker.DURATION);
      }
      Buff.affect$Char$Class(ch, $J.cls(Poison)).set(Math.fround((5 + $J.roundf(Math.fround(Math.imul(2, Dungeon.scalingDepth()) / 3))) | 0));
    }
    if (Dungeon.level.heroFOV[this.pos]) {
      CellEmitter.center(this.pos).burst(PoisonParticle.SPLASH, 3);
    }
  }
}

export class Sorrowmoss$Seed extends Plant$Seed {
  _Sorrowmoss$Seed(): this {
    this._Plant$Seed();
    this.image_ = ItemSpriteSheet.SEED_SORROWMOSS;
    this.plantClass = $J.cls(Sorrowmoss);
    return this;
  }
}

$J.define(Sorrowmoss, 'com.shatteredpixel.shatteredpixeldungeon.plants.Sorrowmoss', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.plants.Plant', ctors: { '': '_Sorrowmoss' } });
$J.define(Sorrowmoss$Seed, 'com.shatteredpixel.shatteredpixeldungeon.plants.Sorrowmoss$Seed', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.plants.Plant$Seed', ctors: { '': '_Sorrowmoss$Seed' } });
$J.module(() => {
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  Buff = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Buff');
  Poison = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Poison');
  ToxicImbue = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.ToxicImbue');
  Hero = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.Hero');
  HeroSubClass = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.HeroSubClass');
  Mob = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.Mob');
  CellEmitter = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.CellEmitter');
  PoisonParticle = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.particles.PoisonParticle');
  Trap$HazardAssistTracker = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.traps.Trap$HazardAssistTracker');
  ItemSpriteSheet = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.ItemSpriteSheet');
});
