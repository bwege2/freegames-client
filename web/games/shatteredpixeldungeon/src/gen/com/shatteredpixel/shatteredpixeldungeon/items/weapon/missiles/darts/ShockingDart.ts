// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/items/weapon/missiles/darts/ShockingDart.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { $J, ArrayList } from '../../../../../../../../jre/index.ts';
import { TippedDart } from './TippedDart.ts';

let Assets$Sounds, Dungeon, Electricity, Lightning, Lightning$Arc, ItemSpriteSheet, Sample, PointF, Random;

export class ShockingDart extends TippedDart {
  _ShockingDart(): this {
    this._TippedDart();
    this.image_ = ItemSpriteSheet.SHOCKING_DART;
    return this;
  }
  proc(attacker: Char, defender: Char, damage: number): number {
    if (!this.processingChargedShot || attacker.alignment !== defender.alignment) {
      defender.damage(Random.NormalIntRange((5 + $J.idiv(Dungeon.scalingDepth(), 4)) | 0, (10 + $J.idiv(Dungeon.scalingDepth(), 4)) | 0), new Electricity()._Electricity());
      let s = defender.sprite_;
      if (s != null && s.parent != null) {
        let arcs = new ArrayList();
        arcs.add(new Lightning$Arc()._Lightning$Arc$PointF$PointF(new PointF()._PointF$float$float(s.x, Math.fround(s.y + Math.fround(s.height_ / 2))), new PointF()._PointF$float$float(Math.fround(s.x + s.width_), Math.fround(s.y + Math.fround(s.height_ / 2)))));
        arcs.add(new Lightning$Arc()._Lightning$Arc$PointF$PointF(new PointF()._PointF$float$float(Math.fround(s.x + Math.fround(s.width_ / 2)), s.y), new PointF()._PointF$float$float(Math.fround(s.x + Math.fround(s.width_ / 2)), Math.fround(s.y + s.height_))));
        s.parent.add$Gizmo(new Lightning()._Lightning$List$Callback(arcs, null));
        Sample.INSTANCE.play$Object(Assets$Sounds.LIGHTNING);
      }
    }
    return super.proc(attacker, defender, damage);
  }
}

$J.define(ShockingDart, 'com.shatteredpixel.shatteredpixeldungeon.items.weapon.missiles.darts.ShockingDart', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.items.weapon.missiles.darts.TippedDart', ctors: { '': '_ShockingDart' } });
$J.module(() => {
  Assets$Sounds = $J.load('com.shatteredpixel.shatteredpixeldungeon.Assets$Sounds');
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  Electricity = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.blobs.Electricity');
  Lightning = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.Lightning');
  Lightning$Arc = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.Lightning$Arc');
  ItemSpriteSheet = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.ItemSpriteSheet');
  Sample = $J.load('com.watabou.noosa.audio.Sample');
  PointF = $J.load('com.watabou.utils.PointF');
  Random = $J.load('com.watabou.utils.Random');
});
