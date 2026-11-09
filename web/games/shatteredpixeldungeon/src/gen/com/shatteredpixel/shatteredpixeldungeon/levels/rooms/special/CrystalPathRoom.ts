// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/levels/rooms/special/CrystalPathRoom.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { $J, ArrayList, Collections } from '../../../../../../../jre/index.ts';
import { SpecialRoom } from './SpecialRoom.ts';

let Dungeon, Generator, Generator$Category, CrystalKey, PotionOfExperience, ExoticPotion, PotionOfDivineInspiration, ScrollOfTransmutation, ExoticScroll, ScrollOfMetamorphosis, ExoticCrystals, Terrain, Painter, Room$Door$Type, EmptyRoom, Point, Random;

export class CrystalPathRoom extends SpecialRoom {
  _CrystalPathRoom(): this {
    this._SpecialRoom();
    return this;
  }
  minWidth(): number {
    return 7;
  }
  minHeight(): number {
    return 7;
  }
  paint(level: Level): void {
    Painter.fill$Level$Rect$int(level, this, Terrain.WALL);
    let rooms = $J.newArray(6, null);
    for (let i = 0; i < rooms.length; i++) {
      rooms[i] = new EmptyRoom()._EmptyRoom();
    }
    let entry = new Point()._Point$Point(this.entrance());
    let prize1 = 0;
    let prize2 = 0;
    if (entry.x === this.left_ || entry.x === this.right_) {
      Painter.drawInside(level, this, entry, this.width() > 8 ? 5 : 3, Terrain.EMPTY);
      let roomW1 = this.width() >= 9 ? 2 : 1;
      let roomW2 = this.width() % 2 === 0 ? 2 : 1;
      let roomH = this.height() >= 9 ? 2 : 1;
      if (entry.x === this.left_) {
        rooms[0].setPos((this.left_ + 1) | 0, (entry.y - roomH - 1) | 0).resize((roomW1 - 1) | 0, (roomH - 1) | 0);
        Painter.set$Level$int$int$int(level, rooms[0].left_, (rooms[0].bottom_ + 1) | 0, Terrain.CRYSTAL_DOOR);
        rooms[1].setPos((this.left_ + 1) | 0, (entry.y + 2) | 0).resize((roomW1 - 1) | 0, (roomH - 1) | 0);
        Painter.set$Level$int$int$int(level, rooms[1].left_, (rooms[1].top_ - 1) | 0, Terrain.CRYSTAL_DOOR);
        rooms[2].setPos((rooms[1].right_ + 2) | 0, (entry.y - roomH - 1) | 0).resize((roomW1 - 1) | 0, (roomH - 1) | 0);
        Painter.set$Level$int$int$int(level, rooms[2].left_, (rooms[2].bottom_ + 1) | 0, Terrain.CRYSTAL_DOOR);
        rooms[3].setPos((rooms[1].right_ + 2) | 0, (entry.y + 2) | 0).resize((roomW1 - 1) | 0, (roomH - 1) | 0);
        Painter.set$Level$int$int$int(level, rooms[3].left_, (rooms[3].top_ - 1) | 0, Terrain.CRYSTAL_DOOR);
        rooms[4].setPos((rooms[3].right_ + 2) | 0, (entry.y - roomH - 1) | 0).resize((roomW2 - 1) | 0, roomH);
        Painter.set$Level$int$int$int(level, (rooms[4].left_ - 1) | 0, (rooms[4].bottom_ - 1) | 0, Terrain.CRYSTAL_DOOR);
        rooms[5].setPos((rooms[3].right_ + 2) | 0, (entry.y + 1) | 0).resize((roomW2 - 1) | 0, roomH);
        Painter.set$Level$int$int$int(level, (rooms[5].left_ - 1) | 0, (rooms[5].top_ + 1) | 0, Terrain.CRYSTAL_DOOR);
        prize1 = level.pointToCell(new Point()._Point$int$int(rooms[4].left_, rooms[4].bottom_));
        prize2 = level.pointToCell(new Point()._Point$int$int(rooms[5].left_, rooms[5].top_));
      } else {
        rooms[0].setPos((this.right_ - roomW1) | 0, (entry.y - roomH - 1) | 0).resize((roomW1 - 1) | 0, (roomH - 1) | 0);
        Painter.set$Level$int$int$int(level, rooms[0].right_, (rooms[0].bottom_ + 1) | 0, Terrain.CRYSTAL_DOOR);
        rooms[1].setPos((this.right_ - roomW1) | 0, (entry.y + 2) | 0).resize((roomW1 - 1) | 0, (roomH - 1) | 0);
        Painter.set$Level$int$int$int(level, rooms[1].right_, (rooms[1].top_ - 1) | 0, Terrain.CRYSTAL_DOOR);
        rooms[2].setPos((rooms[1].left_ - roomW1 - 1) | 0, (entry.y - roomH - 1) | 0).resize((roomW1 - 1) | 0, (roomH - 1) | 0);
        Painter.set$Level$int$int$int(level, rooms[2].right_, (rooms[2].bottom_ + 1) | 0, Terrain.CRYSTAL_DOOR);
        rooms[3].setPos((rooms[1].left_ - roomW1 - 1) | 0, (entry.y + 2) | 0).resize((roomW1 - 1) | 0, (roomH - 1) | 0);
        Painter.set$Level$int$int$int(level, rooms[3].right_, (rooms[3].top_ - 1) | 0, Terrain.CRYSTAL_DOOR);
        rooms[4].setPos((rooms[3].left_ - roomW2 - 1) | 0, (entry.y - roomH - 1) | 0).resize((roomW2 - 1) | 0, roomH);
        Painter.set$Level$int$int$int(level, (rooms[4].right_ + 1) | 0, (rooms[4].bottom_ - 1) | 0, Terrain.CRYSTAL_DOOR);
        rooms[5].setPos((rooms[3].left_ - roomW2 - 1) | 0, (entry.y + 1) | 0).resize((roomW2 - 1) | 0, roomH);
        Painter.set$Level$int$int$int(level, (rooms[5].right_ + 1) | 0, (rooms[5].top_ + 1) | 0, Terrain.CRYSTAL_DOOR);
        prize1 = level.pointToCell(new Point()._Point$int$int(rooms[4].right_, rooms[4].bottom_));
        prize2 = level.pointToCell(new Point()._Point$int$int(rooms[5].right_, rooms[5].top_));
      }
    } else {
      Painter.drawInside(level, this, entry, this.height() > 8 ? 5 : 3, Terrain.EMPTY);
      let roomW = this.width() >= 9 ? 2 : 1;
      let roomH1 = this.height() >= 9 ? 2 : 1;
      let roomH2 = this.height() % 2 === 0 ? 2 : 1;
      if (entry.y === this.top_) {
        rooms[0].setPos((entry.x - roomW - 1) | 0, (this.top_ + 1) | 0).resize((roomW - 1) | 0, (roomH1 - 1) | 0);
        Painter.set$Level$int$int$int(level, (rooms[0].right_ + 1) | 0, rooms[0].top_, Terrain.CRYSTAL_DOOR);
        rooms[1].setPos((entry.x + 2) | 0, (this.top_ + 1) | 0).resize((roomW - 1) | 0, (roomH1 - 1) | 0);
        Painter.set$Level$int$int$int(level, (rooms[1].left_ - 1) | 0, rooms[1].top_, Terrain.CRYSTAL_DOOR);
        rooms[2].setPos((entry.x - roomW - 1) | 0, (rooms[1].bottom_ + 2) | 0).resize((roomW - 1) | 0, (roomH1 - 1) | 0);
        Painter.set$Level$int$int$int(level, (rooms[2].right_ + 1) | 0, rooms[2].top_, Terrain.CRYSTAL_DOOR);
        rooms[3].setPos((entry.x + 2) | 0, (rooms[1].bottom_ + 2) | 0).resize((roomW - 1) | 0, (roomH1 - 1) | 0);
        Painter.set$Level$int$int$int(level, (rooms[3].left_ - 1) | 0, rooms[3].top_, Terrain.CRYSTAL_DOOR);
        rooms[4].setPos((entry.x - roomW - 1) | 0, (rooms[3].bottom_ + 2) | 0).resize(roomW, (roomH2 - 1) | 0);
        Painter.set$Level$int$int$int(level, (rooms[4].right_ - 1) | 0, (rooms[4].top_ - 1) | 0, Terrain.CRYSTAL_DOOR);
        rooms[5].setPos((entry.x + 1) | 0, (rooms[3].bottom_ + 2) | 0).resize(roomW, (roomH2 - 1) | 0);
        Painter.set$Level$int$int$int(level, (rooms[5].left_ + 1) | 0, (rooms[5].top_ - 1) | 0, Terrain.CRYSTAL_DOOR);
        prize1 = level.pointToCell(new Point()._Point$int$int(rooms[4].right_, rooms[4].top_));
        prize2 = level.pointToCell(new Point()._Point$int$int(rooms[5].left_, rooms[5].top_));
      } else {
        rooms[0].setPos((entry.x - roomW - 1) | 0, (this.bottom_ - roomH1) | 0).resize((roomW - 1) | 0, (roomH1 - 1) | 0);
        Painter.set$Level$int$int$int(level, (rooms[0].right_ + 1) | 0, rooms[0].bottom_, Terrain.CRYSTAL_DOOR);
        rooms[1].setPos((entry.x + 2) | 0, (this.bottom_ - roomH1) | 0).resize((roomW - 1) | 0, (roomH1 - 1) | 0);
        Painter.set$Level$int$int$int(level, (rooms[1].left_ - 1) | 0, rooms[1].bottom_, Terrain.CRYSTAL_DOOR);
        rooms[2].setPos((entry.x - roomW - 1) | 0, (rooms[1].top_ - roomH1 - 1) | 0).resize((roomW - 1) | 0, (roomH1 - 1) | 0);
        Painter.set$Level$int$int$int(level, (rooms[2].right_ + 1) | 0, rooms[2].bottom_, Terrain.CRYSTAL_DOOR);
        rooms[3].setPos((entry.x + 2) | 0, (rooms[1].top_ - roomH1 - 1) | 0).resize((roomW - 1) | 0, (roomH1 - 1) | 0);
        Painter.set$Level$int$int$int(level, (rooms[3].left_ - 1) | 0, rooms[3].bottom_, Terrain.CRYSTAL_DOOR);
        rooms[4].setPos((entry.x - roomW - 1) | 0, (rooms[3].top_ - roomH2 - 1) | 0).resize(roomW, (roomH2 - 1) | 0);
        Painter.set$Level$int$int$int(level, (rooms[4].right_ - 1) | 0, (rooms[4].bottom_ + 1) | 0, Terrain.CRYSTAL_DOOR);
        rooms[5].setPos((entry.x + 1) | 0, (rooms[3].top_ - roomH2 - 1) | 0).resize(roomW, (roomH2 - 1) | 0);
        Painter.set$Level$int$int$int(level, (rooms[5].left_ + 1) | 0, (rooms[5].bottom_ + 1) | 0, Terrain.CRYSTAL_DOOR);
        prize1 = level.pointToCell(new Point()._Point$int$int(rooms[4].right_, rooms[4].bottom_));
        prize2 = level.pointToCell(new Point()._Point$int$int(rooms[5].left_, rooms[5].bottom_));
      }
    }
    for (let room of rooms) {
      Painter.fill$Level$Rect$int(level, room, Terrain.EMPTY_SP);
    }
    Painter.set$Level$int$int(level, prize1, Terrain.PEDESTAL);
    Painter.set$Level$int$int(level, prize2, Terrain.PEDESTAL);
    let potions = new ArrayList();
    let scrolls = new ArrayList();
    let duplicates = new ArrayList();
    if (Random.Int$int(2) === 0) {
      this.addRewardItem(Generator$Category.POTION, potions, duplicates);
      scrolls.add(Random.Float$() < ExoticCrystals.consumableExoticChance$() ? new ScrollOfMetamorphosis()._ScrollOfMetamorphosis() : new ScrollOfTransmutation()._ScrollOfTransmutation());
    } else {
      potions.add(Random.Float$() < ExoticCrystals.consumableExoticChance$() ? new PotionOfDivineInspiration()._PotionOfDivineInspiration() : new PotionOfExperience()._PotionOfExperience());
      this.addRewardItem(Generator$Category.SCROLL, scrolls, duplicates);
    }
    this.addRewardItem(Generator$Category.POTION, potions, duplicates);
    this.addRewardItem(Generator$Category.SCROLL, scrolls, duplicates);
    this.addRewardItem(Generator$Category.POTION, potions, duplicates);
    this.addRewardItem(Generator$Category.SCROLL, scrolls, duplicates);
    for (const $it0 = duplicates.iterator(); $it0.hasNext(); ) {
      let i = $it0.next();
      if (i instanceof ExoticPotion) {
        Generator.undoDrop$Class(ExoticPotion.exoToReg.get(i.getClass()));
      } else if (i instanceof ExoticScroll) {
        Generator.undoDrop$Class(ExoticScroll.exoToReg.get(i.getClass()));
      } else {
        Generator.undoDrop$Item(i);
      }
    }
    Collections.sort(potions, (a, b) => {
      let aVal = 0;
      let bVal = 0;
      let aCls = a.getClass();
      let bCls = b.getClass();
      if (a instanceof ExoticPotion) {
        aCls = ExoticPotion.exoToReg.get(aCls);
      }
      if (b instanceof ExoticPotion) {
        bCls = ExoticPotion.exoToReg.get(bCls);
      }
      for (let i = 0; i < Generator$Category.POTION.classes.length; i++) {
        if (aCls === Generator$Category.POTION.classes[i]) {
          aVal = $J.d2i(Generator$Category.POTION.defaultProbsTotal[i]);
        }
        if (bCls === Generator$Category.POTION.classes[i]) {
          bVal = $J.d2i(Generator$Category.POTION.defaultProbsTotal[i]);
        }
      }
      return (bVal - aVal) | 0;
    });
    Collections.sort(scrolls, (a, b) => {
      let aVal = 0;
      let bVal = 0;
      let aCls = a.getClass();
      let bCls = b.getClass();
      if (a instanceof ExoticScroll) {
        aCls = ExoticScroll.exoToReg.get(aCls);
      }
      if (b instanceof ExoticScroll) {
        bCls = ExoticScroll.exoToReg.get(bCls);
      }
      for (let i = 0; i < Generator$Category.SCROLL.classes.length; i++) {
        if (aCls === Generator$Category.SCROLL.classes[i]) {
          aVal = $J.d2i(Generator$Category.SCROLL.defaultProbsTotal[i]);
        }
        if (bCls === Generator$Category.SCROLL.classes[i]) {
          bVal = $J.d2i(Generator$Category.SCROLL.defaultProbsTotal[i]);
        }
      }
      return (bVal - aVal) | 0;
    });
    let shuffle = Random.Int$int(2);
    level.drop(potions.removeAt(0), level.pointToCell((rooms[shuffle === 1 ? 2 : 3]).center()));
    level.drop(scrolls.removeAt(0), level.pointToCell((rooms[shuffle === 1 ? 3 : 2]).center()));
    level.drop(potions.removeAt(0), level.pointToCell((rooms[shuffle === 1 ? 0 : 1]).center()));
    level.drop(scrolls.removeAt(0), level.pointToCell((rooms[shuffle === 1 ? 1 : 0]).center()));
    level.drop(potions.removeAt(0), shuffle === 1 ? prize1 : prize2).autoExplored = true;
    level.drop(scrolls.removeAt(0), shuffle === 1 ? prize2 : prize1).autoExplored = true;
    level.addItemToSpawn(new CrystalKey()._CrystalKey$int(Dungeon.depth));
    level.addItemToSpawn(new CrystalKey()._CrystalKey$int(Dungeon.depth));
    level.addItemToSpawn(new CrystalKey()._CrystalKey$int(Dungeon.depth));
    this.entrance().set$Type(Room$Door$Type.REGULAR);
  }
  addRewardItem(cat: Generator$Category, items: ArrayList<Item>, dupes: ArrayList<Item>): void {
    while (true) {
      let reward = Generator.random$Category(cat);
      let rewardClass = reward.getClass();
      if (reward instanceof ExoticPotion) {
        rewardClass = ExoticPotion.exoToReg.get(rewardClass);
      } else if (reward instanceof ExoticScroll) {
        rewardClass = ExoticScroll.exoToReg.get(rewardClass);
      }
      let dupe = false;
      for (const $it1 = items.iterator(); $it1.hasNext(); ) {
        let i = $it1.next();
        let iClass = i.getClass();
        if (i instanceof ExoticPotion) {
          iClass = ExoticPotion.exoToReg.get(iClass);
        } else if (i instanceof ExoticScroll) {
          iClass = ExoticScroll.exoToReg.get(iClass);
        }
        if (iClass === rewardClass) {
          dupes.add(reward);
          dupe = true;
          break;
        }
      }
      if (!dupe) {
        items.add(reward);
        return;
      }
    }
  }
  canConnect$Point(p: Point): boolean {
    if (!super.canConnect$Point(p)) {
      return false;
    }
    if (Math.fround(Math.abs(Math.fround(p.x - (Math.fround(this.right_ - Math.fround(((this.width() - 1) | 0) / 2)))))) < 1) {
      return true;
    }
    if (Math.fround(Math.abs(Math.fround(p.y - (Math.fround(this.bottom_ - Math.fround(((this.height() - 1) | 0) / 2)))))) < 1) {
      return true;
    }
    return false;
  }
  canPlaceGrass(p: Point): boolean {
    return false;
  }
  canPlaceWater(p: Point): boolean {
    return false;
  }
  canPlaceTrap(p: Point): boolean {
    return false;
  }
}

$J.define(CrystalPathRoom, 'com.shatteredpixel.shatteredpixeldungeon.levels.rooms.special.CrystalPathRoom', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.levels.rooms.special.SpecialRoom', ctors: { '': '_CrystalPathRoom' }, meths: { 'canConnect(com.watabou.utils.Point)': 'canConnect$Point' } });
$J.module(() => {
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  Generator = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.Generator');
  Generator$Category = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.Generator$Category');
  CrystalKey = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.keys.CrystalKey');
  PotionOfExperience = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.potions.PotionOfExperience');
  ExoticPotion = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.potions.exotic.ExoticPotion');
  PotionOfDivineInspiration = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.potions.exotic.PotionOfDivineInspiration');
  ScrollOfTransmutation = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.scrolls.ScrollOfTransmutation');
  ExoticScroll = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.scrolls.exotic.ExoticScroll');
  ScrollOfMetamorphosis = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.scrolls.exotic.ScrollOfMetamorphosis');
  ExoticCrystals = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.trinkets.ExoticCrystals');
  Terrain = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.Terrain');
  Painter = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.painters.Painter');
  Room$Door$Type = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.rooms.Room$Door$Type');
  EmptyRoom = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.rooms.standard.EmptyRoom');
  Point = $J.load('com.watabou.utils.Point');
  Random = $J.load('com.watabou.utils.Random');
});
