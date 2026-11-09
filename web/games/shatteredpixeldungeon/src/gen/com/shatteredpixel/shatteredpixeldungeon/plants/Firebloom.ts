// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/plants/Firebloom.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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

let Dungeon, Blob, Fire, Buff, FireImbue, Hero, HeroSubClass, Mob, CellEmitter, FlameParticle, Trap$HazardAssistTracker, GameScene, ItemSpriteSheet;

export class Firebloom extends Plant {
  _Firebloom(): this {
    this._Plant();
    this.image_ = 1;
    this.seedClass = $J.cls(Firebloom$Seed);
    return this;
  }
  activate(ch: Char): void {
    if (ch instanceof Hero && (ch).subClass === HeroSubClass.WARDEN) {
      Buff.affect$Char$Class(ch, $J.cls(FireImbue)).set(Math.fround(FireImbue.DURATION * Math.fround(0.3)));
    }
    if (ch instanceof Mob) {
      Buff.prolong(ch, $J.cls(Trap$HazardAssistTracker), Trap$HazardAssistTracker.DURATION);
    }
    GameScene.add$Blob(Blob.seed$int$int$Class(this.pos, 2, $J.cls(Fire)));
    if (Dungeon.level.heroFOV[this.pos]) {
      CellEmitter.get(this.pos).burst(FlameParticle.FACTORY, 5);
    }
  }
}

export class Firebloom$Seed extends Plant$Seed {
  _Firebloom$Seed(): this {
    this._Plant$Seed();
    this.image_ = ItemSpriteSheet.SEED_FIREBLOOM;
    this.plantClass = $J.cls(Firebloom);
    return this;
  }
}

$J.define(Firebloom, 'com.shatteredpixel.shatteredpixeldungeon.plants.Firebloom', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.plants.Plant', ctors: { '': '_Firebloom' } });
$J.define(Firebloom$Seed, 'com.shatteredpixel.shatteredpixeldungeon.plants.Firebloom$Seed', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.plants.Plant$Seed', ctors: { '': '_Firebloom$Seed' } });
$J.module(() => {
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  Blob = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.blobs.Blob');
  Fire = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.blobs.Fire');
  Buff = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Buff');
  FireImbue = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.FireImbue');
  Hero = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.Hero');
  HeroSubClass = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.HeroSubClass');
  Mob = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.Mob');
  CellEmitter = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.CellEmitter');
  FlameParticle = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.particles.FlameParticle');
  Trap$HazardAssistTracker = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.traps.Trap$HazardAssistTracker');
  GameScene = $J.load('com.shatteredpixel.shatteredpixeldungeon.scenes.GameScene');
  ItemSpriteSheet = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.ItemSpriteSheet');
});
