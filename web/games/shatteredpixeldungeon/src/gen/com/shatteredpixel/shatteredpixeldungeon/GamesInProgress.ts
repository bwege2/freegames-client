// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/GamesInProgress.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { $J, ArrayList, Collections, Exception, HashMap, IOException, JObject } from '../../../../jre/index.ts';

let Dungeon, SPDSettings, ShatteredPixelDungeon, Statistics, HeroClass, Messages, Game, FileUtils;

export class GamesInProgress extends JObject {
  static MAX_SLOTS: number = 0;
  static slotStates: HashMap<number, GamesInProgress$Info> = null;
  static curSlot: number = 0;
  static selectedClass: HeroClass = null;
  static randomizedClass: boolean = false;
  static readonly GAME_FOLDER: string = 'game%d';
  static readonly GAME_FILE: string = 'game.dat';
  static readonly DEPTH_FILE: string = 'depth%d.dat';
  static readonly DEPTH_BRANCH_FILE: string = 'depth%d-branch%d.dat';
  static levelComparator: Comparator<GamesInProgress$Info> = null;
  static lastPlayedComparator: Comparator<GamesInProgress$Info> = null;
  _GamesInProgress(): this {
    return this;
  }
  static gameExists(slot: number): boolean {
    return FileUtils.dirExists(GamesInProgress.gameFolder(slot)) && FileUtils.fileLength(GamesInProgress.gameFile(slot)) > 1n;
  }
  static gameFolder(slot: number): string {
    return Messages.format(GamesInProgress.GAME_FOLDER, [slot]);
  }
  static gameFile(slot: number): string {
    return GamesInProgress.gameFolder(slot) + '/' + GamesInProgress.GAME_FILE;
  }
  static depthFile(slot: number, depth: number, branch: number): string {
    if (branch === 0) {
      return GamesInProgress.gameFolder(slot) + '/' + Messages.format(GamesInProgress.DEPTH_FILE, [depth]);
    } else {
      return GamesInProgress.gameFolder(slot) + '/' + Messages.format(GamesInProgress.DEPTH_BRANCH_FILE, [depth, branch]);
    }
  }
  static firstEmpty(): number {
    for (let i = 1; i <= GamesInProgress.MAX_SLOTS; i++) {
      if (GamesInProgress.check(i) == null) {
        return i;
      }
    }
    return -1;
  }
  static checkAll(): ArrayList<GamesInProgress$Info> {
    let result = new ArrayList();
    for (let i = 1; i <= GamesInProgress.MAX_SLOTS; i++) {
      let curr = GamesInProgress.check(i);
      if (curr != null) {
        result.add(curr);
      }
    }
    switch (SPDSettings.gamesInProgressSort$()) {
      case 'level':
      default:
        Collections.sort(result, GamesInProgress.levelComparator);
        break;
      case 'last_played':
        Collections.sort(result, GamesInProgress.lastPlayedComparator);
        break;
    }
    return result;
  }
  static check(slot: number): GamesInProgress$Info {
    if (GamesInProgress.slotStates.containsKey(slot)) {
      return GamesInProgress.slotStates.get(slot);
    } else if (!GamesInProgress.gameExists(slot)) {
      GamesInProgress.slotStates.put(slot, null);
      return null;
    } else {
      let info: GamesInProgress$Info;
      try {
        let bundle = FileUtils.bundleFromFile(GamesInProgress.gameFile(slot));
        if (bundle.getInt('version') < ShatteredPixelDungeon.v3_1_1) {
          info = null;
        } else {
          info = new GamesInProgress$Info()._GamesInProgress$Info();
          info.slot_ = slot;
          Dungeon.preview(info, bundle);
        }
      } catch ($e0) {
        if ($J.isa($e0, IOException)) {
          let e = $J.exc($e0);
          info = null;
        } else if ($J.isa($e0, Exception)) {
          let e = $J.exc($e0);
          Game.reportException(e);
          info = null;
        } else {
          throw $e0;
        }
      }
      GamesInProgress.slotStates.put(slot, info);
      return info;
    }
  }
  static set(slot: number): void {
    let info = new GamesInProgress$Info()._GamesInProgress$Info();
    info.slot_ = slot;
    info.lastPlayed = Dungeon.lastPlayed;
    info.depth_ = Dungeon.depth;
    info.challenges = Dungeon.challenges;
    info.seed_ = Dungeon.seed;
    info.customSeed = Dungeon.customSeedText;
    info.daily = Dungeon.daily;
    info.dailyReplay = Dungeon.dailyReplay;
    info.level_ = Dungeon.hero.lvl;
    info.str = Dungeon.hero.STR_;
    info.strBonus = (Dungeon.hero.STR() - Dungeon.hero.STR_) | 0;
    info.exp = Dungeon.hero.exp;
    info.hp = Dungeon.hero.HP;
    info.ht = Dungeon.hero.HT;
    info.shld = Dungeon.hero.shielding();
    info.heroClass = Dungeon.hero.heroClass;
    info.subClass = Dungeon.hero.subClass;
    info.armorTier = Dungeon.hero.tier();
    info.goldCollected = Statistics.goldCollected;
    info.maxDepth = Statistics.deepestFloor;
    GamesInProgress.slotStates.put(slot, info);
  }
  static setUnknown(slot: number): void {
    GamesInProgress.slotStates.remove(slot);
  }
  static delete(slot: number): void {
    GamesInProgress.slotStates.put(slot, null);
  }
  static $clinit() {
    GamesInProgress.MAX_SLOTS = HeroClass.values().length;
    GamesInProgress.slotStates = new HashMap();
    GamesInProgress.randomizedClass = false;
    GamesInProgress.levelComparator = (lhs, rhs) => {
      if (rhs.level_ !== lhs.level_) {
        return $J.d2i(Math.fround(Math.sign(Math.fround((rhs.level_ - lhs.level_) | 0))));
      } else {
        return GamesInProgress.lastPlayedComparator(lhs, rhs);
      }
    };
    GamesInProgress.lastPlayedComparator = (lhs, rhs) => {
      return $J.d2i(Math.fround(Math.sign($J.l2f(BigInt.asIntN(64, rhs.lastPlayed - lhs.lastPlayed)))));
    };
  }
}

export class GamesInProgress$Info extends JObject {
  slot_: number = 0;
  depth_: number = 0;
  version: number = 0;
  challenges: number = 0;
  seed_: bigint = 0n;
  customSeed: string = null;
  daily: boolean = false;
  dailyReplay: boolean = false;
  lastPlayed: bigint = 0n;
  level_: number = 0;
  str: number = 0;
  strBonus: number = 0;
  exp: number = 0;
  hp: number = 0;
  ht: number = 0;
  shld: number = 0;
  heroClass: HeroClass = null;
  subClass: HeroSubClass = null;
  armorTier: number = 0;
  goldCollected: number = 0;
  maxDepth: number = 0;
  _GamesInProgress$Info(): this {
    return this;
  }
}

$J.define(GamesInProgress, 'com.shatteredpixel.shatteredpixeldungeon.GamesInProgress', { kind: 'class', sup: 'java.lang.Object', ctors: { '': '_GamesInProgress' }, clinit: true, lazy: ['MAX_SLOTS', 'slotStates', 'curSlot', 'selectedClass', 'randomizedClass', 'levelComparator', 'lastPlayedComparator'] });
$J.define(GamesInProgress$Info, 'com.shatteredpixel.shatteredpixeldungeon.GamesInProgress$Info', { kind: 'class', sup: 'java.lang.Object', ctors: { '': '_GamesInProgress$Info' } });
$J.module(() => {
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  SPDSettings = $J.load('com.shatteredpixel.shatteredpixeldungeon.SPDSettings');
  ShatteredPixelDungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.ShatteredPixelDungeon');
  Statistics = $J.load('com.shatteredpixel.shatteredpixeldungeon.Statistics');
  HeroClass = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.HeroClass');
  Messages = $J.load('com.shatteredpixel.shatteredpixeldungeon.messages.Messages');
  Game = $J.load('com.watabou.noosa.Game');
  FileUtils = $J.load('com.watabou.utils.FileUtils');
});
