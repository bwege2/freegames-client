// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/levels/rooms/standard/ImpShopRoom.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { $J, ArrayList } from '../../../../../../../jre/index.ts';
import { ShopRoom } from '../special/ShopRoom.ts';

let Imp$Quest, ImpShopkeeper, Terrain, Room$Door, GameScene, Game, Point, Random;

export class ImpShopRoom extends ShopRoom {
  impSpawned: boolean = false;
  static readonly IMP: string = 'imp_spawned';
  static readonly ITEMS: string = 'items';
  _ImpShopRoom(): this {
    this._ShopRoom();
    this.impSpawned = false;
    return this;
  }
  minWidth(): number {
    return 9;
  }
  minHeight(): number {
    return 9;
  }
  maxWidth(): number {
    return 9;
  }
  maxHeight(): number {
    return 9;
  }
  maxConnections(direction: number): number {
    return 2;
  }
  paint(level: Level): void {
    if (this.itemsToSpawn == null) {
      this.itemsToSpawn = ShopRoom.generateItems();
    }
  }
  placeShopkeeper(level: Level): void {
    let pos = level.pointToCell(this.center());
    for (const $it0 = this.getPoints().iterator(); $it0.hasNext(); ) {
      let p = $it0.next();
      if (level.map_[level.pointToCell(p)] === Terrain.PEDESTAL) {
        pos = level.pointToCell(p);
        break;
      }
    }
    let shopkeeper = new ImpShopkeeper()._ImpShopkeeper();
    shopkeeper.pos = pos;
    if (Game.scene() instanceof GameScene) {
      GameScene.add$Mob(shopkeeper);
    } else {
      level.mobs.add(shopkeeper);
    }
  }
  entrance(): Room$Door {
    return this.connected_.isEmpty() ? new Room$Door()._Room$Door$int$int(($J.idiv(((this.left_ + this.right_) | 0), 2) + 1) | 0, (this.bottom_ - 1) | 0) : super.entrance();
  }
  spawnShop(level: Level): void {
    this.impSpawned = true;
    this.placeShopkeeper(level);
    this.placeItems(level);
  }
  placeItems(level: Level): void {
    let existing = new ArrayList();
    for (const $it1 = level.heaps.valueList().iterator(); $it1.hasNext(); ) {
      let h = $it1.next();
      if (this.inside$Point(level.cellToPoint(h.pos))) {
        existing.addAll(h.items_);
        level.heaps.remove(h.pos);
        if (h.sprite_ != null) {
          h.sprite_.kill();
        }
      }
    }
    super.placeItems(level);
    if (!existing.isEmpty()) {
      let pos = level.pointToCell(new Point()._Point$int$int((this.left_ + 2) | 0, (this.bottom_ + 2) | 0));
      for (const $it2 = existing.iterator(); $it2.hasNext(); ) {
        let i = $it2.next();
        level.drop(i, (pos + Random.Int$int(5)) | 0);
      }
    }
  }
  shopSpawned(): boolean {
    return this.impSpawned;
  }
  storeInBundle(bundle: Bundle): void {
    super.storeInBundle(bundle);
    bundle.put$String$boolean(ImpShopRoom.IMP, this.impSpawned);
    if (this.itemsToSpawn != null) {
      bundle.put$String$Collection(ImpShopRoom.ITEMS, this.itemsToSpawn);
    }
  }
  restoreFromBundle(bundle: Bundle): void {
    super.restoreFromBundle(bundle);
    this.impSpawned = bundle.getBoolean(ImpShopRoom.IMP);
    if (bundle.contains(ImpShopRoom.ITEMS)) {
      this.itemsToSpawn = new ArrayList((bundle.getCollection(ImpShopRoom.ITEMS)));
    }
  }
  onLevelLoad(level: Level): void {
    super.onLevelLoad(level);
    if (Imp$Quest.isCompleted() && Imp$Quest.earnedShop() && !this.impSpawned) {
      this.spawnShop(level);
    }
  }
}

$J.define(ImpShopRoom, 'com.shatteredpixel.shatteredpixeldungeon.levels.rooms.standard.ImpShopRoom', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.levels.rooms.special.ShopRoom', ctors: { '': '_ImpShopRoom' } });
$J.module(() => {
  Imp$Quest = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.npcs.Imp$Quest');
  ImpShopkeeper = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.npcs.ImpShopkeeper');
  Terrain = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.Terrain');
  Room$Door = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.rooms.Room$Door');
  GameScene = $J.load('com.shatteredpixel.shatteredpixeldungeon.scenes.GameScene');
  Game = $J.load('com.watabou.noosa.Game');
  Point = $J.load('com.watabou.utils.Point');
  Random = $J.load('com.watabou.utils.Random');
});
