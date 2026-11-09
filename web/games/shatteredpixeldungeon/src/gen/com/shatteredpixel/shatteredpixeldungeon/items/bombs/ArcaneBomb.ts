// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/items/bombs/ArcaneBomb.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { Bomb$Fuse } from './Bomb.ts';

let Badges, Dungeon, Actor, CellEmitter, ElmoParticle, GooSprite$GooParticle, ItemSpriteSheet, BArray, PathFinder, Random;

export class ArcaneBomb extends Bomb {
  _ArcaneBomb(): this {
    this._Bomb();
    this.image_ = ItemSpriteSheet.ARCANE_BOMB;
    return this;
  }
  explodesDestructively(): boolean {
    return false;
  }
  explosionRange(): number {
    return 2;
  }
  createFuse(): Bomb$Fuse {
    return new ArcaneBomb$ArcaneBombFuse()._ArcaneBomb$ArcaneBombFuse();
  }
  explode(cell: number): void {
    super.explode(cell);
    let affected = new ArrayList();
    PathFinder.buildDistanceMap$int$booleanArr$int(cell, BArray.not(Dungeon.level.solid, null), this.explosionRange());
    for (let i = 0; i < PathFinder.distance.length; i++) {
      if (PathFinder.distance[i] < 2147483647) {
        CellEmitter.get(i).burst(ElmoParticle.FACTORY, 10);
        let ch = Actor.findChar(i);
        if (ch != null) {
          affected.add(ch);
        }
      }
    }
    for (const $it0 = affected.iterator(); $it0.hasNext(); ) {
      let ch = $it0.next();
      let damage = $J.roundf(Math.fround(Random.NormalIntRange((4 + Dungeon.scalingDepth()) | 0, (12 + Math.imul(3, Dungeon.scalingDepth())) | 0)));
      ch.damage(damage, this);
      if (ch === Dungeon.hero && !ch.isAlive()) {
        Badges.validateDeathFromFriendlyMagic();
        Dungeon.fail(this);
      }
    }
  }
  value(): number {
    return Math.imul(this.quantity, ((20 + 30) | 0));
  }
}

export class ArcaneBomb$ArcaneBombFuse extends Bomb$Fuse {
  gooWarnEmitters: ArrayList<Emitter> = null;
  _ArcaneBomb$ArcaneBombFuse(): this {
    this._Bomb$Fuse();
    this.gooWarnEmitters = new ArrayList();
    return this;
  }
  ignite(bomb: Bomb): Bomb$Fuse {
    super.ignite(bomb);
    Actor.add$Actor(new (ArcaneBomb$ArcaneBombFuse$1())().$o(this).$c(bomb)._Actor().$init_anon());
    return this;
  }
  snuff(): void {
    super.snuff();
    for (const $it2 = this.gooWarnEmitters.iterator(); $it2.hasNext(); ) {
      let e = $it2.next();
      e.on = false;
    }
    this.gooWarnEmitters.clear();
  }
}

let $ArcaneBomb$ArcaneBombFuse$1: any = null;
/** An anonymous class (ArcaneBomb.java:104). */
function ArcaneBomb$ArcaneBombFuse$1(): any {
  return $ArcaneBomb$ArcaneBombFuse$1 ??= $J.local(class extends Actor {
    $init_anon() {
      this.actPriority = Actor.VFX_PRIO;
      return this;
    }
    act(): boolean {
      let bombPos = -1;
      for (const $it1 = Dungeon.level.heaps.valueList().iterator(); $it1.hasNext(); ) {
        let heap = $it1.next();
        if (heap.items_.contains(this.$cv_bomb)) {
          bombPos = heap.pos;
        }
      }
      if (bombPos !== -1) {
        PathFinder.buildDistanceMap$int$booleanArr$int(bombPos, BArray.not(Dungeon.level.solid, null), this.$cv_bomb.explosionRange());
        for (let i = 0; i < PathFinder.distance.length; i++) {
          if (PathFinder.distance[i] < 2147483647) {
            let e = CellEmitter.get(i);
            if (e != null) {
              e.pour(GooSprite$GooParticle.FACTORY, Math.fround(0.03));
              this.$outer.gooWarnEmitters.add(e);
            }
          }
        }
      }
      Actor.remove(this);
      return true;
    }
    $c($bomb): this {
      this.$cv_bomb = $bomb;
      return this;
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.items.bombs.ArcaneBomb$ArcaneBombFuse$1', []);
}

$J.define(ArcaneBomb, 'com.shatteredpixel.shatteredpixeldungeon.items.bombs.ArcaneBomb', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.items.bombs.Bomb', ctors: { '': '_ArcaneBomb' } });
$J.define(ArcaneBomb$ArcaneBombFuse, 'com.shatteredpixel.shatteredpixeldungeon.items.bombs.ArcaneBomb$ArcaneBombFuse', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.items.bombs.Bomb$Fuse', ctors: { '': '_ArcaneBomb$ArcaneBombFuse' } });
$J.module(() => {
  Badges = $J.load('com.shatteredpixel.shatteredpixeldungeon.Badges');
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  Actor = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Actor');
  CellEmitter = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.CellEmitter');
  ElmoParticle = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.particles.ElmoParticle');
  GooSprite$GooParticle = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.GooSprite$GooParticle');
  ItemSpriteSheet = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.ItemSpriteSheet');
  BArray = $J.load('com.watabou.utils.BArray');
  PathFinder = $J.load('com.watabou.utils.PathFinder');
  Random = $J.load('com.watabou.utils.Random');
});
