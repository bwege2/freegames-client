// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/items/bombs/FlashBangBomb.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { Bomb } from './Bomb.ts';

let Assets$Sounds, Badges, Dungeon, Actor, Electricity, Buff, Paralysis, CellEmitter, Lightning, Lightning$Arc, SparkParticle, Messages, GameScene, ItemSpriteSheet, DungeonTilemap, GLog, Sample, BArray, PathFinder, Random;

export class FlashBangBomb extends Bomb {
  _FlashBangBomb(): this {
    this._Bomb();
    this.image_ = ItemSpriteSheet.FLASHBANG;
    return this;
  }
  explosionRange(): number {
    return 2;
  }
  explode(cell: number): void {
    super.explode(cell);
    let affected = new ArrayList();
    PathFinder.buildDistanceMap$int$booleanArr$int(cell, BArray.not(Dungeon.level.solid, null), this.explosionRange());
    for (let i = 0; i < PathFinder.distance.length; i++) {
      if (PathFinder.distance[i] < 2147483647 && Actor.findChar(i) != null) {
        affected.add(Actor.findChar(i));
      }
    }
    let arcs = new ArrayList();
    for (const $it0 = affected.iterator(); $it0.hasNext(); ) {
      let ch = $it0.next();
      let damage = $J.roundf(Math.fround((Random.NormalIntRange((4 + Dungeon.scalingDepth()) | 0, (12 + Math.imul(3, Dungeon.scalingDepth())) | 0)) / 4));
      ch.damage(damage, new Electricity()._Electricity());
      if (ch.isAlive()) {
        Buff.prolong(ch, $J.cls(Paralysis), Paralysis.DURATION);
      }
      arcs.add(new Lightning$Arc()._Lightning$Arc$PointF$PointF(DungeonTilemap.tileCenterToWorld(cell), ch.sprite_.center$()));
      if (ch === Dungeon.hero) {
        GameScene.flash$int(-2130706433);
      }
      if (ch === Dungeon.hero && !ch.isAlive()) {
        Badges.validateDeathFromFriendlyMagic();
        GLog.n(Messages.get$Object$String$ObjectArr(this, 'ondeath', []), []);
        Dungeon.fail(this);
      }
    }
    CellEmitter.center(cell).burst(SparkParticle.FACTORY, 20);
    Dungeon.hero.sprite_.parent.addToFront(new Lightning()._Lightning$List$Callback(arcs, null));
    Sample.INSTANCE.play$Object(Assets$Sounds.LIGHTNING);
  }
  value(): number {
    return Math.imul(this.quantity, ((20 + 30) | 0));
  }
}

$J.define(FlashBangBomb, 'com.shatteredpixel.shatteredpixeldungeon.items.bombs.FlashBangBomb', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.items.bombs.Bomb', ctors: { '': '_FlashBangBomb' } });
$J.module(() => {
  Assets$Sounds = $J.load('com.shatteredpixel.shatteredpixeldungeon.Assets$Sounds');
  Badges = $J.load('com.shatteredpixel.shatteredpixeldungeon.Badges');
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  Actor = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Actor');
  Electricity = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.blobs.Electricity');
  Buff = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Buff');
  Paralysis = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Paralysis');
  CellEmitter = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.CellEmitter');
  Lightning = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.Lightning');
  Lightning$Arc = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.Lightning$Arc');
  SparkParticle = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.particles.SparkParticle');
  Messages = $J.load('com.shatteredpixel.shatteredpixeldungeon.messages.Messages');
  GameScene = $J.load('com.shatteredpixel.shatteredpixeldungeon.scenes.GameScene');
  ItemSpriteSheet = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.ItemSpriteSheet');
  DungeonTilemap = $J.load('com.shatteredpixel.shatteredpixeldungeon.tiles.DungeonTilemap');
  GLog = $J.load('com.shatteredpixel.shatteredpixeldungeon.utils.GLog');
  Sample = $J.load('com.watabou.noosa.audio.Sample');
  BArray = $J.load('com.watabou.utils.BArray');
  PathFinder = $J.load('com.watabou.utils.PathFinder');
  Random = $J.load('com.watabou.utils.Random');
});
