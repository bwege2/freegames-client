// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/Challenges.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { $J, JObject } from '../../../../jre/index.ts';

let Dungeon, Dewdrop;

export class Challenges extends JObject {
  static readonly NO_FOOD: number = 1;
  static readonly NO_ARMOR: number = 2;
  static readonly NO_HEALING: number = 4;
  static readonly NO_HERBALISM: number = 8;
  static readonly SWARM_INTELLIGENCE: number = 16;
  static readonly DARKNESS: number = 32;
  static readonly NO_SCROLLS: number = 64;
  static readonly CHAMPION_ENEMIES: number = 128;
  static readonly STRONGER_BOSSES: number = 256;
  static readonly MAX_VALUE: number = 511;
  static readonly MAX_CHALS: number = 9;
  static NAME_IDS: string[] = null;
  static MASKS: number[] = null;
  _Challenges(): this {
    return this;
  }
  static activeChallenges$(): number {
    return Challenges.activeChallenges$int(Dungeon.challenges);
  }
  static activeChallenges$int(mask: number): number {
    let chCount = 0;
    for (let ch of Challenges.MASKS) {
      if ((mask & ch) !== 0) {
        chCount++;
      }
    }
    return chCount;
  }
  static isItemBlocked(item: Item): boolean {
    if (Dungeon.isChallenged(Challenges.NO_HERBALISM) && item instanceof Dewdrop) {
      return true;
    }
    return false;
  }
  static $clinit() {
    Challenges.NAME_IDS = ['champion_enemies', 'stronger_bosses', 'no_food', 'no_armor', 'no_healing', 'no_herbalism', 'swarm_intelligence', 'darkness', 'no_scrolls'];
    Challenges.MASKS = [Challenges.CHAMPION_ENEMIES, Challenges.STRONGER_BOSSES, Challenges.NO_FOOD, Challenges.NO_ARMOR, Challenges.NO_HEALING, Challenges.NO_HERBALISM, Challenges.SWARM_INTELLIGENCE, Challenges.DARKNESS, Challenges.NO_SCROLLS];
  }
}

$J.define(Challenges, 'com.shatteredpixel.shatteredpixeldungeon.Challenges', { kind: 'class', sup: 'java.lang.Object', ctors: { '': '_Challenges' }, meths: { 'activeChallenges(int)': 'activeChallenges$int', 'activeChallenges()': 'activeChallenges$' }, clinit: true, lazy: ['NAME_IDS', 'MASKS'] });
$J.module(() => {
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  Dewdrop = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.Dewdrop');
});
