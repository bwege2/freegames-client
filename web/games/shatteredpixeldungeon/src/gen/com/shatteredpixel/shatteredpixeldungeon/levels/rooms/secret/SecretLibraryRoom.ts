// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/levels/rooms/secret/SecretLibraryRoom.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { $J, HashMap } from '../../../../../../../jre/index.ts';
import { SecretRoom } from './SecretRoom.ts';

let ScrollOfIdentify, ScrollOfLullaby, ScrollOfMagicMapping, ScrollOfMirrorImage, ScrollOfRage, ScrollOfRecharging, ScrollOfRemoveCurse, ScrollOfRetribution, ScrollOfTeleportation, ScrollOfTerror, ScrollOfTransmutation, ExoticScroll, ExoticCrystals, Terrain, Painter, Room$Door$Type, Random, Reflection;

export class SecretLibraryRoom extends SecretRoom {
  static scrollChances: HashMap<JClass<Scroll>, number> = null;
  _SecretLibraryRoom(): this {
    this._SecretRoom();
    return this;
  }
  minWidth(): number {
    return Math.max(7, super.minWidth());
  }
  minHeight(): number {
    return Math.max(7, super.minHeight());
  }
  paint(level: Level): void {
    Painter.fill$Level$Rect$int(level, this, Terrain.WALL);
    Painter.fill$Level$Rect$int$int(level, this, 1, Terrain.BOOKSHELF);
    Painter.fillEllipse$Level$Rect$int$int(level, this, 2, Terrain.EMPTY_SP);
    let entrance = this.entrance();
    if (entrance.x === this.left_ || entrance.x === this.right_) {
      Painter.drawInside(level, this, entrance, $J.idiv(((this.width() - 3) | 0), 2), Terrain.EMPTY_SP);
    } else {
      Painter.drawInside(level, this, entrance, $J.idiv(((this.height() - 3) | 0), 2), Terrain.EMPTY_SP);
    }
    entrance.set$Type(Room$Door$Type.HIDDEN);
    let n = Random.IntRange(2, 3);
    let chances = new HashMap(SecretLibraryRoom.scrollChances);
    for (let i = 0; i < n; i++) {
      let pos: number;
      do {
        pos = level.pointToCell(this.random$());
      } while (level.map_[pos] !== Terrain.EMPTY_SP || level.heaps.get(pos) != null);
      let scrollCls = Random.chances$HashMap(chances);
      $J.boxF(chances.put(scrollCls, $J.boxF(0)));
      if (ExoticScroll.regToExo.containsKey(scrollCls)) {
        if (Random.Float$() < ExoticCrystals.consumableExoticChance$()) {
          scrollCls = ExoticScroll.regToExo.get(scrollCls);
        }
      }
      level.drop(Reflection.newInstance(scrollCls), pos);
    }
  }
  static $clinit() {
    SecretLibraryRoom.scrollChances = new HashMap();
    $J.boxF(SecretLibraryRoom.scrollChances.put($J.cls(ScrollOfIdentify), $J.boxF(1)));
    $J.boxF(SecretLibraryRoom.scrollChances.put($J.cls(ScrollOfRemoveCurse), $J.boxF(2)));
    $J.boxF(SecretLibraryRoom.scrollChances.put($J.cls(ScrollOfMirrorImage), $J.boxF(3)));
    $J.boxF(SecretLibraryRoom.scrollChances.put($J.cls(ScrollOfRecharging), $J.boxF(3)));
    $J.boxF(SecretLibraryRoom.scrollChances.put($J.cls(ScrollOfTeleportation), $J.boxF(3)));
    $J.boxF(SecretLibraryRoom.scrollChances.put($J.cls(ScrollOfLullaby), $J.boxF(4)));
    $J.boxF(SecretLibraryRoom.scrollChances.put($J.cls(ScrollOfMagicMapping), $J.boxF(4)));
    $J.boxF(SecretLibraryRoom.scrollChances.put($J.cls(ScrollOfRage), $J.boxF(4)));
    $J.boxF(SecretLibraryRoom.scrollChances.put($J.cls(ScrollOfRetribution), $J.boxF(4)));
    $J.boxF(SecretLibraryRoom.scrollChances.put($J.cls(ScrollOfTerror), $J.boxF(4)));
    $J.boxF(SecretLibraryRoom.scrollChances.put($J.cls(ScrollOfTransmutation), $J.boxF(6)));
  }
}

$J.define(SecretLibraryRoom, 'com.shatteredpixel.shatteredpixeldungeon.levels.rooms.secret.SecretLibraryRoom', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.levels.rooms.secret.SecretRoom', ctors: { '': '_SecretLibraryRoom' }, clinit: true, lazy: ['scrollChances'] });
$J.module(() => {
  ScrollOfIdentify = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.scrolls.ScrollOfIdentify');
  ScrollOfLullaby = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.scrolls.ScrollOfLullaby');
  ScrollOfMagicMapping = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.scrolls.ScrollOfMagicMapping');
  ScrollOfMirrorImage = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.scrolls.ScrollOfMirrorImage');
  ScrollOfRage = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.scrolls.ScrollOfRage');
  ScrollOfRecharging = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.scrolls.ScrollOfRecharging');
  ScrollOfRemoveCurse = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.scrolls.ScrollOfRemoveCurse');
  ScrollOfRetribution = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.scrolls.ScrollOfRetribution');
  ScrollOfTeleportation = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.scrolls.ScrollOfTeleportation');
  ScrollOfTerror = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.scrolls.ScrollOfTerror');
  ScrollOfTransmutation = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.scrolls.ScrollOfTransmutation');
  ExoticScroll = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.scrolls.exotic.ExoticScroll');
  ExoticCrystals = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.trinkets.ExoticCrystals');
  Terrain = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.Terrain');
  Painter = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.painters.Painter');
  Room$Door$Type = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.rooms.Room$Door$Type');
  Random = $J.load('com.watabou.utils.Random');
  Reflection = $J.load('com.watabou.utils.Reflection');
});
