// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/items/bombs/HolyBomb.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { $J, ArrayList, JObject } from '../../../../../../jre/index.ts';
import { Bomb } from './Bomb.ts';

let Assets$Sounds, Dungeon, Actor, Char$Property, Flare, ShadowParticle, ItemSpriteSheet, DungeonTilemap, Sample, BArray, PathFinder, Random;

export class HolyBomb extends Bomb {
  _HolyBomb(): this {
    this._Bomb();
    this.image_ = ItemSpriteSheet.HOLY_BOMB;
    return this;
  }
  explosionRange(): number {
    return 2;
  }
  explode(cell: number): void {
    super.explode(cell);
    if (Dungeon.level.heroFOV[cell]) {
      new Flare()._Flare(10, 64).show$Group$PointF$float(Dungeon.hero.sprite_.parent, DungeonTilemap.tileCenterToWorld(cell), 2);
    }
    let affected = new ArrayList();
    PathFinder.buildDistanceMap$int$booleanArr$int(cell, BArray.not(Dungeon.level.solid, null), this.explosionRange());
    for (let i = 0; i < PathFinder.distance.length; i++) {
      if (PathFinder.distance[i] < 2147483647) {
        let ch = Actor.findChar(i);
        if (ch != null) {
          affected.add(ch);
        }
      }
    }
    for (const $it0 = affected.iterator(); $it0.hasNext(); ) {
      let ch = $it0.next();
      if (ch.properties().contains(Char$Property.UNDEAD) || ch.properties().contains(Char$Property.DEMONIC)) {
        ch.sprite_.emitter().start(ShadowParticle.UP, Math.fround(0.05), 10);
        let damage = $J.roundf(Math.fround((Random.NormalIntRange((Dungeon.scalingDepth() + 4) | 0, (12 + Math.imul(3, Dungeon.scalingDepth())) | 0)) * 0.5));
        ch.damage(damage, new HolyBomb$HolyDamage()._HolyBomb$HolyDamage());
      }
    }
    Sample.INSTANCE.play$Object(Assets$Sounds.READ);
  }
  value(): number {
    return Math.imul(this.quantity, ((20 + 30) | 0));
  }
}

export class HolyBomb$HolyDamage extends JObject {
  _HolyBomb$HolyDamage(): this {
    return this;
  }
}

$J.define(HolyBomb, 'com.shatteredpixel.shatteredpixeldungeon.items.bombs.HolyBomb', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.items.bombs.Bomb', ctors: { '': '_HolyBomb' } });
$J.define(HolyBomb$HolyDamage, 'com.shatteredpixel.shatteredpixeldungeon.items.bombs.HolyBomb$HolyDamage', { kind: 'class', sup: 'java.lang.Object', ctors: { '': '_HolyBomb$HolyDamage' } });
$J.module(() => {
  Assets$Sounds = $J.load('com.shatteredpixel.shatteredpixeldungeon.Assets$Sounds');
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  Actor = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Actor');
  Char$Property = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Char$Property');
  Flare = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.Flare');
  ShadowParticle = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.particles.ShadowParticle');
  ItemSpriteSheet = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.ItemSpriteSheet');
  DungeonTilemap = $J.load('com.shatteredpixel.shatteredpixeldungeon.tiles.DungeonTilemap');
  Sample = $J.load('com.watabou.noosa.audio.Sample');
  BArray = $J.load('com.watabou.utils.BArray');
  PathFinder = $J.load('com.watabou.utils.PathFinder');
  Random = $J.load('com.watabou.utils.Random');
});
