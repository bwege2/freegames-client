// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/items/bombs/Noisemaker.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { $J } from '../../../../../../jre/index.ts';
import { Bomb } from './Bomb.ts';
import { Bomb$Fuse } from './Bomb.ts';

let Assets$Sounds, Dungeon, Actor, CellEmitter, Speck, ItemSpriteSheet, Sample;

export class Noisemaker extends Bomb {
  _Noisemaker(): this {
    this._Bomb();
    this.image_ = ItemSpriteSheet.NOISEMAKER;
    return this;
  }
  explosionRange(): number {
    return 2;
  }
  createFuse(): Bomb$Fuse {
    return new Noisemaker$NoisemakerFuse()._Noisemaker$NoisemakerFuse();
  }
  doPickUp$Hero$int(hero: Hero, pos: number): boolean {
    if (this.fuse instanceof Noisemaker$NoisemakerFuse && (this.fuse).triggered) {
      return false;
    }
    return super.doPickUp$Hero$int(hero, pos);
  }
  value(): number {
    return Math.imul(this.quantity, ((20 + 40) | 0));
  }
}

export class Noisemaker$NoisemakerFuse extends Bomb$Fuse {
  triggered: boolean = false;
  left_: number = 0;
  static readonly LEFT: string = 'left';
  static readonly TRIGGERED: string = 'triggered';
  _Noisemaker$NoisemakerFuse(): this {
    this._Bomb$Fuse();
    this.triggered = false;
    return this;
  }
  act(): boolean {
    if (!this.triggered) {
      return super.act();
    } else {
      for (const $it0 = Dungeon.level.heaps.valueList().iterator(); $it0.hasNext(); ) {
        let heap = $it0.next();
        if (heap.items_.contains(this.bomb)) {
          if (this.bomb.fuse !== this) {
            this.trigger(heap);
          } else if (Actor.findChar(heap.pos) != null) {
            heap.items_.remove(this.bomb);
            if (heap.items_.isEmpty()) {
              heap.destroy();
            }
            this.trigger(heap);
          } else {
            this.spend(Actor.TICK);
            this.left_--;
            if (this.left_ <= 0) {
              CellEmitter.center(heap.pos).start(Speck.factory$int(Speck.SCREAM), Math.fround(0.3), 3);
              Sample.INSTANCE.play$Object(Assets$Sounds.ALERT);
              for (let mob of $J.toArrayInto(Dungeon.level.mobs.toArray(), $J.newArray(0, null))) {
                mob.beckon(heap.pos);
              }
              this.left_ = 6;
            }
          }
          return true;
        }
      }
      this.bomb.fuse = null;
      Actor.remove(this);
      return true;
    }
  }
  trigger(heap: Heap): void {
    if (!this.triggered) {
      this.triggered = true;
    } else {
      super.trigger(heap);
    }
  }
  freeze(): boolean {
    if (!this.triggered) {
      return super.freeze();
    } else {
      return false;
    }
  }
  storeInBundle(bundle: Bundle): void {
    super.storeInBundle(bundle);
    bundle.put$String$int(Noisemaker$NoisemakerFuse.LEFT, this.left_);
    bundle.put$String$boolean(Noisemaker$NoisemakerFuse.TRIGGERED, this.triggered);
  }
  restoreFromBundle(bundle: Bundle): void {
    super.restoreFromBundle(bundle);
    this.left_ = bundle.getInt(Noisemaker$NoisemakerFuse.LEFT);
    this.triggered = bundle.getBoolean(Noisemaker$NoisemakerFuse.TRIGGERED);
  }
}

$J.define(Noisemaker, 'com.shatteredpixel.shatteredpixeldungeon.items.bombs.Noisemaker', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.items.bombs.Bomb', ctors: { '': '_Noisemaker' }, meths: { 'doPickUp(com.shatteredpixel.shatteredpixeldungeon.actors.hero.Hero,int)': 'doPickUp$Hero$int' } });
$J.define(Noisemaker$NoisemakerFuse, 'com.shatteredpixel.shatteredpixeldungeon.items.bombs.Noisemaker$NoisemakerFuse', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.items.bombs.Bomb$Fuse', ctors: { '': '_Noisemaker$NoisemakerFuse' } });
$J.module(() => {
  Assets$Sounds = $J.load('com.shatteredpixel.shatteredpixeldungeon.Assets$Sounds');
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  Actor = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Actor');
  CellEmitter = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.CellEmitter');
  Speck = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.Speck');
  ItemSpriteSheet = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.ItemSpriteSheet');
  Sample = $J.load('com.watabou.noosa.audio.Sample');
});
