// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/levels/rooms/special/LaboratoryRoom.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { SpecialRoom } from './SpecialRoom.ts';

let Dungeon, Alchemy, Blob, EnergyCrystal, Generator, Generator$Category, AlchemyPage, IronKey, PotionOfStrength, TrinketCatalyst, Document, Terrain, Painter, Room$Door$Type, Point, Random;

export class LaboratoryRoom extends SpecialRoom {
  _LaboratoryRoom(): this {
    this._SpecialRoom();
    return this;
  }
  paint(level: Level): void {
    Painter.fill$Level$Rect$int(level, this, Terrain.WALL);
    Painter.fill$Level$Rect$int$int(level, this, 1, Terrain.EMPTY_SP);
    let entrance = this.entrance();
    let pot = null;
    if (entrance.x === this.left_) {
      pot = new Point()._Point$int$int((this.right_ - 1) | 0, Random.Int$int(2) === 0 ? (this.top_ + 1) | 0 : (this.bottom_ - 1) | 0);
    } else if (entrance.x === this.right_) {
      pot = new Point()._Point$int$int((this.left_ + 1) | 0, Random.Int$int(2) === 0 ? (this.top_ + 1) | 0 : (this.bottom_ - 1) | 0);
    } else if (entrance.y === this.top_) {
      pot = new Point()._Point$int$int(Random.Int$int(2) === 0 ? (this.left_ + 1) | 0 : (this.right_ - 1) | 0, (this.bottom_ - 1) | 0);
    } else if (entrance.y === this.bottom_) {
      pot = new Point()._Point$int$int(Random.Int$int(2) === 0 ? (this.left_ + 1) | 0 : (this.right_ - 1) | 0, (this.top_ + 1) | 0);
    }
    Painter.set$Level$Point$int(level, pot, Terrain.ALCHEMY);
    let chapter = (1 + $J.idiv(Dungeon.depth, 5)) | 0;
    Blob.seed$int$int$Class$Level((pot.x + Math.imul(level.width(), pot.y)) | 0, 1, $J.cls(Alchemy), level);
    let pos: number;
    do {
      pos = level.pointToCell(this.random$());
    } while (level.map_[pos] !== Terrain.EMPTY_SP || level.heaps.get(pos) != null);
    level.drop(new EnergyCrystal()._EnergyCrystal$().quantity$int(5), pos);
    let n = Random.NormalIntRange(1, 2);
    for (let i = 0; i < n; i++) {
      do {
        pos = level.pointToCell(this.random$());
      } while (level.map_[pos] !== Terrain.EMPTY_SP || level.heaps.get(pos) != null);
      level.drop(LaboratoryRoom.prize(level), pos);
    }
    let allPages = Document.ALCHEMY_GUIDE.pageNames();
    let missingPages = new ArrayList();
    for (const $it0 = allPages.iterator(); $it0.hasNext(); ) {
      let page = $it0.next();
      if (!Document.ALCHEMY_GUIDE.isPageFound$String(page)) {
        missingPages.add(page);
      }
    }
    let chapterTarget: number;
    if (missingPages.size() <= 5) {
      chapterTarget = 2;
    } else {
      chapterTarget = 1;
    }
    if (!missingPages.isEmpty() && chapter >= chapterTarget) {
      let pagesToDrop = Math.min(missingPages.size(), (chapter - chapterTarget + 1) | 0);
      for (let i = 0; i < pagesToDrop; i++) {
        let p = new AlchemyPage()._AlchemyPage();
        p.page$String(missingPages.removeAt(0));
        do {
          pos = level.pointToCell(this.random$());
        } while (level.map_[pos] !== Terrain.EMPTY_SP || level.heaps.get(pos) != null);
        level.drop(p, pos);
      }
    }
    entrance.set$Type(Room$Door$Type.LOCKED);
    level.addItemToSpawn(new IronKey()._IronKey$int(Dungeon.depth));
  }
  static prize(level: Level): Item {
    let prize = level.findPrizeItem$Class($J.cls(TrinketCatalyst));
    if (prize == null) {
      prize = level.findPrizeItem$Class($J.cls(PotionOfStrength));
      if (prize == null) {
        prize = Generator.random$Category(Random.oneOf([Generator$Category.POTION, Generator$Category.STONE]));
      }
    }
    return prize;
  }
}

$J.define(LaboratoryRoom, 'com.shatteredpixel.shatteredpixeldungeon.levels.rooms.special.LaboratoryRoom', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.levels.rooms.special.SpecialRoom', ctors: { '': '_LaboratoryRoom' } });
$J.module(() => {
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  Alchemy = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.blobs.Alchemy');
  Blob = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.blobs.Blob');
  EnergyCrystal = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.EnergyCrystal');
  Generator = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.Generator');
  Generator$Category = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.Generator$Category');
  AlchemyPage = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.journal.AlchemyPage');
  IronKey = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.keys.IronKey');
  PotionOfStrength = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.potions.PotionOfStrength');
  TrinketCatalyst = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.trinkets.TrinketCatalyst');
  Document = $J.load('com.shatteredpixel.shatteredpixeldungeon.journal.Document');
  Terrain = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.Terrain');
  Painter = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.painters.Painter');
  Room$Door$Type = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.rooms.Room$Door$Type');
  Point = $J.load('com.watabou.utils.Point');
  Random = $J.load('com.watabou.utils.Random');
});
