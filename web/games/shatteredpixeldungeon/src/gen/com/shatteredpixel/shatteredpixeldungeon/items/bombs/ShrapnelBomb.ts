// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/items/bombs/ShrapnelBomb.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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

let Dungeon, Actor, CellEmitter, BlastParticle, ShadowCaster, ItemSpriteSheet, Random;

export class ShrapnelBomb extends Bomb {
  _ShrapnelBomb(): this {
    this._Bomb();
    this.image_ = ItemSpriteSheet.SHRAPNEL_BOMB;
    return this;
  }
  explodesDestructively(): boolean {
    return false;
  }
  explosionRange(): number {
    return 8;
  }
  explode(cell: number): void {
    super.explode(cell);
    let FOV = $J.newArray(Dungeon.level.length(), false);
    let c = Dungeon.level.cellToPoint(cell);
    ShadowCaster.castShadow(c.x, c.y, Dungeon.level.width(), FOV, Dungeon.level.losBlocking, this.explosionRange());
    let affected = new ArrayList();
    for (let i = 0; i < FOV.length; i++) {
      if (FOV[i]) {
        if (Dungeon.level.heroFOV[i] && !Dungeon.level.solid[i]) {
          CellEmitter.center(i).burst(BlastParticle.FACTORY, 5);
        }
        let ch = Actor.findChar(i);
        if (ch != null) {
          affected.add(ch);
        }
      }
    }
    for (const $it0 = affected.iterator(); $it0.hasNext(); ) {
      let ch = $it0.next();
      let damage = Random.NormalIntRange((4 + Dungeon.scalingDepth()) | 0, (12 + Math.imul(3, Dungeon.scalingDepth())) | 0);
      damage = (damage - ch.drRoll()) | 0;
      ch.damage(damage, this);
      if (ch === Dungeon.hero && !ch.isAlive()) {
        Dungeon.fail(this);
      }
    }
  }
  value(): number {
    return Math.imul(this.quantity, ((20 + 50) | 0));
  }
}

$J.define(ShrapnelBomb, 'com.shatteredpixel.shatteredpixeldungeon.items.bombs.ShrapnelBomb', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.items.bombs.Bomb', ctors: { '': '_ShrapnelBomb' } });
$J.module(() => {
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  Actor = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Actor');
  CellEmitter = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.CellEmitter');
  BlastParticle = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.particles.BlastParticle');
  ShadowCaster = $J.load('com.shatteredpixel.shatteredpixeldungeon.mechanics.ShadowCaster');
  ItemSpriteSheet = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.ItemSpriteSheet');
  Random = $J.load('com.watabou.utils.Random');
});
