// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/plants/Rotberry.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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

let Dungeon, Blob, ToxicGas, AdrenalineSurge, Buff, Hero, HeroSubClass, CellEmitter, LeafParticle, GameScene, ItemSpriteSheet;

export class Rotberry extends Plant {
  _Rotberry(): this {
    this._Plant();
    this.image_ = 0;
    this.seedClass = $J.cls(Rotberry$Seed);
    return this;
  }
  activate(ch: Char): void {
    if (ch instanceof Hero && (ch).subClass === HeroSubClass.WARDEN) {
      Buff.affect$Char$Class(ch, $J.cls(AdrenalineSurge)).reset(1, AdrenalineSurge.DURATION);
    } else {
      GameScene.add$Blob(Blob.seed$int$int$Class(this.pos, 100, $J.cls(ToxicGas)));
    }
  }
  wither(): void {
    Dungeon.level.uproot(this.pos);
    if (Dungeon.level.heroFOV[this.pos]) {
      CellEmitter.get(this.pos).burst(LeafParticle.GENERAL, 6);
    }
    Dungeon.level.drop(new Rotberry$Seed()._Rotberry$Seed(), this.pos).sprite_.drop$();
  }
}

export class Rotberry$Seed extends Plant$Seed {
  _Rotberry$Seed(): this {
    this._Plant$Seed();
    this.image_ = ItemSpriteSheet.SEED_ROTBERRY;
    this.plantClass = $J.cls(Rotberry);
    this.unique = true;
    return this;
  }
  value(): number {
    return Math.imul(30, this.quantity);
  }
  energyVal(): number {
    return Math.imul(3, this.quantity);
  }
}

$J.define(Rotberry, 'com.shatteredpixel.shatteredpixeldungeon.plants.Rotberry', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.plants.Plant', ctors: { '': '_Rotberry' } });
$J.define(Rotberry$Seed, 'com.shatteredpixel.shatteredpixeldungeon.plants.Rotberry$Seed', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.plants.Plant$Seed', ctors: { '': '_Rotberry$Seed' } });
$J.module(() => {
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  Blob = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.blobs.Blob');
  ToxicGas = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.blobs.ToxicGas');
  AdrenalineSurge = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.AdrenalineSurge');
  Buff = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Buff');
  Hero = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.Hero');
  HeroSubClass = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.HeroSubClass');
  CellEmitter = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.CellEmitter');
  LeafParticle = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.particles.LeafParticle');
  GameScene = $J.load('com.shatteredpixel.shatteredpixeldungeon.scenes.GameScene');
  ItemSpriteSheet = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.ItemSpriteSheet');
});
