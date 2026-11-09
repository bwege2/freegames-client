// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/items/weapon/missiles/darts/IncendiaryDart.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { $J } from '../../../../../../../../jre/index.ts';
import { TippedDart } from './TippedDart.ts';

let Dungeon, Actor, Blob, Fire, Buff, Burning, Item, Dart, GameScene, ItemSpriteSheet;

export class IncendiaryDart extends TippedDart {
  _IncendiaryDart(): this {
    this._TippedDart();
    this.image_ = ItemSpriteSheet.INCENDIARY_DART;
    return this;
  }
  onThrow(cell: number): void {
    let enemy = Actor.findChar(cell);
    if ((enemy == null || enemy === Item.curUser) && Dungeon.level.flamable[cell]) {
      GameScene.add$Blob(Blob.seed$int$int$Class(cell, 4, $J.cls(Fire)));
      this.decrementDurability();
      if (this.durability > Math.fround(0) || this.spawnedForEffect) {
        super.onThrow(cell);
      } else {
        Dungeon.level.drop(new Dart()._Dart().quantity$int(1), cell).sprite_.drop$();
      }
    } else {
      super.onThrow(cell);
    }
  }
  proc(attacker: Char, defender: Char, damage: number): number {
    if (!this.processingChargedShot || attacker.alignment !== defender.alignment) {
      Buff.affect$Char$Class(defender, $J.cls(Burning)).reignite$Char(defender);
    }
    return super.proc(attacker, defender, damage);
  }
}

$J.define(IncendiaryDart, 'com.shatteredpixel.shatteredpixeldungeon.items.weapon.missiles.darts.IncendiaryDart', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.items.weapon.missiles.darts.TippedDart', ctors: { '': '_IncendiaryDart' } });
$J.module(() => {
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  Actor = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Actor');
  Blob = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.blobs.Blob');
  Fire = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.blobs.Fire');
  Buff = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Buff');
  Burning = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Burning');
  Item = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.Item');
  Dart = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.weapon.missiles.darts.Dart');
  GameScene = $J.load('com.shatteredpixel.shatteredpixeldungeon.scenes.GameScene');
  ItemSpriteSheet = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.ItemSpriteSheet');
});
