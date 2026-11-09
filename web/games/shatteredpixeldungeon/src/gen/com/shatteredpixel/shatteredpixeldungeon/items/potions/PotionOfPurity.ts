// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/items/potions/PotionOfPurity.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { Potion } from './Potion.ts';

let Assets$Sounds, Dungeon, BlobImmunity, Buff, CellEmitter, Speck, SpellSprite, Messages, ItemSpriteSheet$Icons, GLog, Sample, BArray, PathFinder;

export class PotionOfPurity extends Potion {
  static readonly DISTANCE: number = 3;
  static affectedBlobs: ArrayList<JClass> = null;
  _PotionOfPurity(): this {
    this._Potion();
    this.icon_ = ItemSpriteSheet$Icons.POTION_PURITY;
    PotionOfPurity.affectedBlobs = new ArrayList(new BlobImmunity()._BlobImmunity().immunities());
    return this;
  }
  shatter(cell: number): void {
    PathFinder.buildDistanceMap$int$booleanArr$int(cell, BArray.not(Dungeon.level.solid, null), PotionOfPurity.DISTANCE);
    let blobs = new ArrayList();
    for (const $it0 = PotionOfPurity.affectedBlobs.iterator(); $it0.hasNext(); ) {
      let c = $it0.next();
      let b = Dungeon.level.blobs.get(c);
      if (b != null && b.volume_ > 0) {
        blobs.add(b);
      }
    }
    for (let i = 0; i < Dungeon.level.length(); i++) {
      if (PathFinder.distance[i] < 2147483647) {
        for (const $it1 = blobs.iterator(); $it1.hasNext(); ) {
          let blob = $it1.next();
          blob.clear(i);
        }
        if (Dungeon.level.heroFOV[i]) {
          CellEmitter.get(i).burst(Speck.factory$int(Speck.DISCOVER), 2);
        }
      }
    }
    this.splash(cell);
    if (Dungeon.level.heroFOV[cell]) {
      Sample.INSTANCE.play$Object(Assets$Sounds.SHATTER);
      this.identify$();
      GLog.i(Messages.get$Object$String$ObjectArr(this, 'freshness', []), []);
    }
  }
  apply(hero: Hero): void {
    GLog.w(Messages.get$Object$String$ObjectArr(this, 'protected', []), []);
    Buff.prolong(hero, $J.cls(BlobImmunity), BlobImmunity.DURATION);
    SpellSprite.show$Char$int(hero, SpellSprite.PURITY);
    this.identify$();
  }
  value(): number {
    return this.isKnown() ? Math.imul(40, this.quantity) : super.value();
  }
}

$J.define(PotionOfPurity, 'com.shatteredpixel.shatteredpixeldungeon.items.potions.PotionOfPurity', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.items.potions.Potion', ctors: { '': '_PotionOfPurity' } });
$J.module(() => {
  Assets$Sounds = $J.load('com.shatteredpixel.shatteredpixeldungeon.Assets$Sounds');
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  BlobImmunity = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.BlobImmunity');
  Buff = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Buff');
  CellEmitter = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.CellEmitter');
  Speck = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.Speck');
  SpellSprite = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.SpellSprite');
  Messages = $J.load('com.shatteredpixel.shatteredpixeldungeon.messages.Messages');
  ItemSpriteSheet$Icons = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.ItemSpriteSheet$Icons');
  GLog = $J.load('com.shatteredpixel.shatteredpixeldungeon.utils.GLog');
  Sample = $J.load('com.watabou.noosa.audio.Sample');
  BArray = $J.load('com.watabou.utils.BArray');
  PathFinder = $J.load('com.watabou.utils.PathFinder');
});
