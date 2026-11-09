// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/levels/rooms/quest/MineSecretRoom.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { $J } from '../../../../../../../jre/index.ts';
import { SecretRoom } from '../secret/SecretRoom.ts';

let Blacksmith$Quest, Heap$Type, DarkGold, Terrain, Painter, Room$Door$Type, Random;

export class MineSecretRoom extends SecretRoom {
  _MineSecretRoom(): this {
    this._SecretRoom();
    return this;
  }
  maxWidth(): number {
    return 7;
  }
  maxHeight(): number {
    return 7;
  }
  paint(level: Level): void {
    Painter.fill$Level$Rect$int(level, this, Terrain.WALL);
    this.entrance().set$Type(Room$Door$Type.HIDDEN);
    if (Blacksmith$Quest.Type() === Blacksmith$Quest.CRYSTAL) {
      Painter.fill$Level$Rect$int$int(level, this, 1, Terrain.MINE_CRYSTAL);
    } else if (Blacksmith$Quest.Type() === Blacksmith$Quest.GNOLL) {
      Painter.fill$Level$Rect$int$int(level, this, 1, Terrain.EMPTY_SP);
      level.drop(new DarkGold()._DarkGold().quantity$int(Random.NormalIntRange(4, 5)), level.pointToCell(this.center())).type_ = Heap$Type.CHEST;
      return;
    } else if (Blacksmith$Quest.Type() === Blacksmith$Quest.FUNGI) {
      Painter.fill$Level$Rect$int$int(level, this, 1, Terrain.HIGH_GRASS);
    } else {
      Painter.fill$Level$Rect$int$int(level, this, 1, Terrain.EMPTY);
    }
    let goldAmount = Random.NormalIntRange(4, 5);
    for (let i = 0; i < goldAmount; i++) {
      let cell: number;
      do {
        cell = level.pointToCell(this.random$int(1));
      } while (level.map_[cell] === Terrain.WALL_DECO);
      Painter.set$Level$Point$int(level, this.random$int(1), Terrain.WALL_DECO);
    }
  }
}

$J.define(MineSecretRoom, 'com.shatteredpixel.shatteredpixeldungeon.levels.rooms.quest.MineSecretRoom', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.levels.rooms.secret.SecretRoom', ctors: { '': '_MineSecretRoom' } });
$J.module(() => {
  Blacksmith$Quest = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.npcs.Blacksmith$Quest');
  Heap$Type = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.Heap$Type');
  DarkGold = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.quest.DarkGold');
  Terrain = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.Terrain');
  Painter = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.painters.Painter');
  Room$Door$Type = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.rooms.Room$Door$Type');
  Random = $J.load('com.watabou.utils.Random');
});
