// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/actors/buffs/PinCushion.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { Buff } from './Buff.ts';

let Dungeon, Dart, TippedDart, Messages, BuffIndicator;

export class PinCushion extends Buff {
  items_: ArrayList<MissileWeapon> = null;
  static readonly ITEMS: string = 'items';
  _PinCushion(): this {
    this._Buff();
    this.items_ = new ArrayList();
    return this;
  }
  stick(projectile: MissileWeapon): void {
    for (let i = 0; i < this.items_.size(); i++) {
      if (projectile.isSimilar(this.items_.get(i))) {
        projectile.merge(this.items_.get(i));
        this.items_.set(i, projectile);
        if (TippedDart.lostDarts > 0) {
          let d = new Dart()._Dart();
          d.quantity$int(TippedDart.lostDarts);
          TippedDart.lostDarts = 0;
          this.stick(d);
        }
        return;
      }
    }
    this.items_.add(projectile);
  }
  grabOne(): Item {
    let item = this.items_.removeAt(0);
    if (this.items_.isEmpty()) {
      this.detach();
    }
    return item;
  }
  getStuckItems(): ArrayList<MissileWeapon> {
    return new ArrayList(this.items_);
  }
  detach(): void {
    for (const $it0 = this.items_.iterator(); $it0.hasNext(); ) {
      let item = $it0.next();
      Dungeon.level.drop(item, this.target.pos).sprite_.drop$();
    }
    super.detach();
  }
  storeInBundle(bundle: Bundle): void {
    bundle.put$String$Collection(PinCushion.ITEMS, this.items_);
    super.storeInBundle(bundle);
  }
  restoreFromBundle(bundle: Bundle): void {
    this.items_ = new ArrayList((bundle.getCollection(PinCushion.ITEMS)));
    super.restoreFromBundle(bundle);
  }
  icon(): number {
    return BuffIndicator.PINCUSHION;
  }
  desc(): string {
    let desc = Messages.get$Object$String$ObjectArr(this, 'desc', []);
    for (const $it1 = this.items_.iterator(); $it1.hasNext(); ) {
      let i = $it1.next();
      desc += '\n' + i.title();
    }
    return desc;
  }
}

$J.define(PinCushion, 'com.shatteredpixel.shatteredpixeldungeon.actors.buffs.PinCushion', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Buff', ctors: { '': '_PinCushion' } });
$J.module(() => {
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  Dart = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.weapon.missiles.darts.Dart');
  TippedDart = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.weapon.missiles.darts.TippedDart');
  Messages = $J.load('com.shatteredpixel.shatteredpixeldungeon.messages.Messages');
  BuffIndicator = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.BuffIndicator');
});
