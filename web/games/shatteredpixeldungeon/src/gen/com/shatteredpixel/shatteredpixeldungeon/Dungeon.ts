// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/Dungeon.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { $J, ArrayList, HashSet, IOException, JDate, JEnum, JObject, JString, Locale, SimpleDateFormat, TimeZone } from '../../../../jre/index.ts';

let Badges, GamesInProgress, QuickSlot, Rankings, SPDSettings, Statistics, Actor, Char, Char$Alignment, Char$Property, Amok, AscensionChallenge, Awareness, Dread, Light, MagicalSight, MindVision, RevealedArea, Terror, Hero, Talent, PowerOfMany$PowerBuff, SpiritHawk$HawkAlly, DivineSense$DivineSenseTracker, Mimic, Mob, Blacksmith$Quest, Ghost$Quest, Imp$Quest, Wandmaker$Quest, Amulet, Generator, TalismanOfForesight$CharAwareness, TalismanOfForesight$HeapAwareness, Potion, Ring, Scroll, WandOfRegrowth$Lotus, WandOfWarding$Ward, Notes, CavesBossLevel, CavesLevel, CityBossLevel, CityLevel, DeadEndLevel, HallsBossLevel, HallsLevel, LastLevel, MiningLevel, PrisonBossLevel, PrisonLevel, RegularLevel, SewerBossLevel, SewerLevel, VaultLevel, LevelTransition$Type, SecretRoom, SpecialRoom, Messages, GameScene, QuickSlotButton, Toolbar, DungeonSeed, WndResurrect, Game, BArray, Bundle, FileUtils, PathFinder, Random, SparseArray;

export class Dungeon extends JObject {
  static challenges: number = 0;
  static mobsToChampion: number = 0;
  static hero: Hero = null;
  static level: Level = null;
  static quickslot: QuickSlot = null;
  static depth: number = 0;
  static branch: number = 0;
  static generatedLevels: ArrayList<number> = null;
  static gold: number = 0;
  static energy: number = 0;
  static chapters: HashSet<number> = null;
  static droppedItems: SparseArray<ArrayList<Item>> = null;
  static initialVersion: number = 0;
  static version: number = 0;
  static daily: boolean = false;
  static dailyReplay: boolean = false;
  static customSeedText: string = null;
  static seed: bigint = 0n;
  static lastPlayed: bigint = 0n;
  static readonly INIT_VER: string = 'init_ver';
  static readonly VERSION: string = 'version';
  static readonly SEED: string = 'seed';
  static readonly CUSTOM_SEED: string = 'custom_seed';
  static readonly DAILY: string = 'daily';
  static readonly DAILY_REPLAY: string = 'daily_replay';
  static readonly LAST_PLAYED: string = 'last_played';
  static readonly CHALLENGES: string = 'challenges';
  static readonly MOBS_TO_CHAMPION: string = 'mobs_to_champion';
  static readonly HERO: string = 'hero';
  static readonly DEPTH: string = 'depth';
  static readonly BRANCH: string = 'branch';
  static readonly GENERATED_LEVELS: string = 'generated_levels';
  static readonly GOLD: string = 'gold';
  static readonly ENERGY: string = 'energy';
  static readonly DROPPED: string = 'dropped%d';
  static readonly PORTED: string = 'ported%d';
  static readonly LEVEL: string = 'level';
  static readonly LIMDROPS: string = 'limited_drops';
  static readonly CHAPTERS: string = 'chapters';
  static readonly QUESTS: string = 'quests';
  static readonly BADGES: string = 'badges';
  static passable: boolean[] = null;
  _Dungeon(): this {
    return this;
  }
  static initSeed(): void {
    if (Dungeon.daily) {
      Dungeon.seed = BigInt.asIntN(64, SPDSettings.lastDaily$() + DungeonSeed.TOTAL_SEEDS);
      let format = new SimpleDateFormat('yyyy-MM-dd', Locale.ROOT);
      format.setTimeZone(TimeZone.getTimeZone('UTC'));
      Dungeon.customSeedText = format.format(new JDate(SPDSettings.lastDaily$()));
    } else if (!(SPDSettings.customSeed$().length === 0)) {
      Dungeon.customSeedText = SPDSettings.customSeed$();
      Dungeon.seed = DungeonSeed.convertFromText(Dungeon.customSeedText);
    } else {
      Dungeon.customSeedText = '';
      Dungeon.seed = DungeonSeed.randomSeed();
    }
  }
  static init(): void {
    Dungeon.initialVersion = Dungeon.version = Game.versionCode;
    Dungeon.challenges = SPDSettings.challenges$();
    Dungeon.mobsToChampion = 1;
    Actor.clear();
    Actor.resetNextID();
    Random.pushGenerator$long(BigInt.asIntN(64, Dungeon.seed + 1n));
    Scroll.initLabels();
    Potion.initColors();
    Ring.initGems();
    SpecialRoom.initForRun();
    SecretRoom.initForRun();
    Generator.fullReset();
    Random.resetGenerators();
    Statistics.reset();
    Notes.reset();
    Dungeon.quickslot.reset();
    QuickSlotButton.reset();
    Toolbar.swappedQuickslots = false;
    Dungeon.depth = 1;
    Dungeon.branch = 0;
    Dungeon.generatedLevels.clear();
    Dungeon.gold = 0;
    Dungeon.energy = 0;
    Dungeon.droppedItems = new SparseArray()._SparseArray();
    Dungeon$LimitedDrops.reset();
    Dungeon.chapters = new HashSet();
    Ghost$Quest.reset();
    Wandmaker$Quest.reset();
    Blacksmith$Quest.reset();
    Imp$Quest.reset();
    Dungeon.hero = new Hero()._Hero();
    Dungeon.hero.live();
    Badges.reset();
    GamesInProgress.selectedClass.initHero(Dungeon.hero);
  }
  static isChallenged(mask: number): boolean {
    return (Dungeon.challenges & mask) !== 0;
  }
  static levelHasBeenGenerated(depth: number, branch: number): boolean {
    return Dungeon.generatedLevels.contains((depth + Math.imul(1000, branch)) | 0);
  }
  static newLevel(): Level {
    Dungeon.level = null;
    Actor.clear();
    let level: Level;
    if (Dungeon.branch === 0) {
      switch (Dungeon.depth) {
        case 1:
        case 2:
        case 3:
        case 4:
          level = new SewerLevel()._SewerLevel();
          break;
        case 5:
          level = new SewerBossLevel()._SewerBossLevel();
          break;
        case 6:
        case 7:
        case 8:
        case 9:
          level = new PrisonLevel()._PrisonLevel();
          break;
        case 10:
          level = new PrisonBossLevel()._PrisonBossLevel();
          break;
        case 11:
        case 12:
        case 13:
        case 14:
          level = new CavesLevel()._CavesLevel();
          break;
        case 15:
          level = new CavesBossLevel()._CavesBossLevel();
          break;
        case 16:
        case 17:
        case 18:
        case 19:
          level = new CityLevel()._CityLevel();
          break;
        case 20:
          level = new CityBossLevel()._CityBossLevel();
          break;
        case 21:
        case 22:
        case 23:
        case 24:
          level = new HallsLevel()._HallsLevel();
          break;
        case 25:
          level = new HallsBossLevel()._HallsBossLevel();
          break;
        case 26:
          level = new LastLevel()._LastLevel();
          break;
        default:
          level = new DeadEndLevel()._DeadEndLevel();
      }
    } else if (Dungeon.branch === 1) {
      switch (Dungeon.depth) {
        case 11:
        case 12:
        case 13:
        case 14:
          level = new MiningLevel()._MiningLevel();
          break;
        case 16:
        case 17:
        case 18:
        case 19:
          level = new VaultLevel()._VaultLevel();
          break;
        default:
          level = new DeadEndLevel()._DeadEndLevel();
      }
    } else {
      level = new DeadEndLevel()._DeadEndLevel();
    }
    if (!(level instanceof DeadEndLevel)) {
      if (!Dungeon.generatedLevels.contains((Dungeon.depth + Math.imul(1000, Dungeon.branch)) | 0)) {
        Dungeon.generatedLevels.add((Dungeon.depth + Math.imul(1000, Dungeon.branch)) | 0);
      }
      if (Dungeon.depth > Statistics.deepestFloor && Dungeon.branch === 0) {
        Statistics.deepestFloor = Dungeon.depth;
        if (Statistics.qualifiedForNoKilling) {
          Statistics.completedWithNoKilling = true;
        } else {
          Statistics.completedWithNoKilling = false;
        }
      }
    }
    Statistics.qualifiedForBossRemainsBadge = false;
    level.create();
    if (Dungeon.branch === 0) {
      Statistics.qualifiedForNoKilling = !Dungeon.bossLevel$();
    }
    Statistics.qualifiedForBossChallengeBadge = false;
    return level;
  }
  static resetLevel(): void {
    Actor.clear();
    Dungeon.level.reset();
    Dungeon.switchLevel(Dungeon.level, Dungeon.level.entrance());
  }
  static seedCurDepth(): bigint {
    return Dungeon.seedForDepth(Dungeon.depth, Dungeon.branch);
  }
  static seedForDepth(depth: number, branch: number): bigint {
    let lookAhead = depth;
    lookAhead = (lookAhead + Math.imul(30, branch)) | 0;
    Random.pushGenerator$long(Dungeon.seed);
    for (let i = 0; i < lookAhead; i++) {
      Random.Long$();
    }
    let result = Random.Long$();
    Random.popGenerator();
    return result;
  }
  static shopOnLevel(): boolean {
    return Dungeon.depth === 6 || Dungeon.depth === 11 || Dungeon.depth === 16;
  }
  static bossLevel$(): boolean {
    return Dungeon.bossLevel$int(Dungeon.depth);
  }
  static bossLevel$int(depth: number): boolean {
    return depth === 5 || depth === 10 || depth === 15 || depth === 20 || depth === 25;
  }
  static scalingDepth(): number {
    if (Dungeon.hero != null && Dungeon.hero.buff($J.cls(AscensionChallenge)) != null) {
      return 26;
    } else {
      return Dungeon.depth;
    }
  }
  static interfloorTeleportAllowed(): boolean {
    if (Dungeon.level.locked || Dungeon.level instanceof MiningLevel || Dungeon.level instanceof VaultLevel || (Dungeon.hero != null && Dungeon.hero.belongings.getItem($J.cls(Amulet)) != null)) {
      return false;
    }
    return true;
  }
  static switchLevel(level: Level, pos: number): void {
    if (pos === -2) {
      let t = level.getTransition$Type(LevelTransition$Type.REGULAR_EXIT);
      if (t != null) {
        pos = t.cell();
      }
    }
    if (pos < 0 || pos >= level.length() || level.invalidHeroPos(pos)) {
      pos = level.getTransition$Type(null).cell();
    }
    PathFinder.setMapSize(level.width(), level.height());
    Dungeon.level = level;
    Dungeon.hero.pos = pos;
    if (Dungeon.hero.buff($J.cls(AscensionChallenge)) != null) {
      Dungeon.hero.buff($J.cls(AscensionChallenge)).onLevelSwitch();
    }
    Mob.restoreAllies$Level$int(level, pos);
    Actor.init();
    level.addRespawner();
    for (const $it0 = level.mobs.iterator(); $it0.hasNext(); ) {
      let m = $it0.next();
      if (m.pos === Dungeon.hero.pos && !Char.hasProp(m, Char$Property.IMMOVABLE)) {
        for (let i of PathFinder.NEIGHBOURS8) {
          if ((Actor.findChar((m.pos + i) | 0)) == null && level.passable[(m.pos + i) | 0]) {
            m.pos = (m.pos + i) | 0;
            break;
          }
        }
      }
    }
    let light = Dungeon.hero.buff($J.cls(Light));
    Dungeon.hero.viewDistance = light == null ? level.viewDistance : Math.max(Light.DISTANCE, level.viewDistance);
    Dungeon.hero.curAction = Dungeon.hero.lastAction = null;
    Dungeon.observe$();
    try {
      Dungeon.saveAll();
    } catch ($e1) {
      if ($J.isa($e1, IOException)) {
        let e = $J.exc($e1);
        Game.reportException(e);
      } else {
        throw $e1;
      }
    }
  }
  static dropToChasm(item: Item): void {
    let depth = (Dungeon.depth + 1) | 0;
    let dropped = Dungeon.droppedItems.get(depth);
    if (dropped == null) {
      Dungeon.droppedItems.put(depth, dropped = new ArrayList());
    }
    dropped.add(item);
  }
  static posNeeded(): boolean {
    let posLeftThisSet = (2 - (Dungeon$LimitedDrops.STRENGTH_POTIONS.count_ - Math.imul(($J.idiv(Dungeon.depth, 5)), 2))) | 0;
    if (posLeftThisSet <= 0) {
      return false;
    }
    let floorThisSet = (Dungeon.depth % 5);
    let targetPOSLeft = (2 - $J.idiv(floorThisSet, 2)) | 0;
    if (floorThisSet % 2 === 1 && Random.Int$int(2) === 0) {
      targetPOSLeft--;
    }
    if (targetPOSLeft < posLeftThisSet) {
      return true;
    } else {
      return false;
    }
  }
  static souNeeded(): boolean {
    let souLeftThisSet: number;
    souLeftThisSet = (3 - (Dungeon$LimitedDrops.UPGRADE_SCROLLS.count_ - Math.imul(($J.idiv(Dungeon.depth, 5)), 3))) | 0;
    if (souLeftThisSet <= 0) {
      return false;
    }
    let floorThisSet = (Dungeon.depth % 5);
    return (Random.Int$int((5 - floorThisSet) | 0)) < souLeftThisSet;
  }
  static asNeeded(): boolean {
    let asLeftThisSet = (1 - (Dungeon$LimitedDrops.ARCANE_STYLI.count_ - ($J.idiv(Dungeon.depth, 5)))) | 0;
    if (asLeftThisSet <= 0) {
      return false;
    }
    let floorThisSet = (Dungeon.depth % 5);
    return (Random.Int$int((5 - floorThisSet) | 0)) < asLeftThisSet;
  }
  static enchStoneNeeded(): boolean {
    if (!Dungeon$LimitedDrops.ENCH_STONE.dropped()) {
      let region = (1 + $J.idiv(Dungeon.depth, 5)) | 0;
      if (region > 1) {
        let floorsVisited = (Dungeon.depth - 5) | 0;
        if (floorsVisited > 4) {
          floorsVisited--;
        }
        return (Random.Int$int((9 - floorsVisited) | 0)) === 0;
      }
    }
    return false;
  }
  static intStoneNeeded(): boolean {
    return Dungeon.depth < 5 && !Dungeon$LimitedDrops.INT_STONE.dropped() && (Random.Int$int((4 - Dungeon.depth) | 0)) === 0;
  }
  static trinketCataNeeded(): boolean {
    return Dungeon.depth < 5 && !Dungeon$LimitedDrops.TRINKET_CATA.dropped() && (Random.Int$int((4 - Dungeon.depth) | 0)) === 0;
  }
  static labRoomNeeded(): boolean {
    let region = (1 + $J.idiv(Dungeon.depth, 5)) | 0;
    if (region > Dungeon$LimitedDrops.LAB_ROOM.count_) {
      let floorThisRegion = Dungeon.depth % 5;
      if (floorThisRegion >= 4 || (floorThisRegion === 3 && Random.Int$int(2) === 0)) {
        return true;
      }
    }
    return false;
  }
  static saveGame(save: number): void {
    try {
      let bundle = new Bundle()._Bundle$();
      bundle.put$String$int(Dungeon.INIT_VER, Dungeon.initialVersion);
      bundle.put$String$int(Dungeon.VERSION, Dungeon.version = Game.versionCode);
      bundle.put$String$long(Dungeon.SEED, Dungeon.seed);
      bundle.put$String$String(Dungeon.CUSTOM_SEED, Dungeon.customSeedText);
      bundle.put$String$boolean(Dungeon.DAILY, Dungeon.daily);
      bundle.put$String$boolean(Dungeon.DAILY_REPLAY, Dungeon.dailyReplay);
      bundle.put$String$long(Dungeon.LAST_PLAYED, Dungeon.lastPlayed = Game.realTime);
      bundle.put$String$int(Dungeon.CHALLENGES, Dungeon.challenges);
      bundle.put$String$float(Dungeon.MOBS_TO_CHAMPION, Dungeon.mobsToChampion);
      bundle.put$String$Bundlable(Dungeon.HERO, Dungeon.hero);
      bundle.put$String$int(Dungeon.DEPTH, Dungeon.depth);
      bundle.put$String$int(Dungeon.BRANCH, Dungeon.branch);
      bundle.put$String$int(Dungeon.GOLD, Dungeon.gold);
      bundle.put$String$int(Dungeon.ENERGY, Dungeon.energy);
      for (let d of Dungeon.droppedItems.keyArray()) {
        bundle.put$String$Collection(Messages.format(Dungeon.DROPPED, [d]), Dungeon.droppedItems.get(d));
      }
      Dungeon.quickslot.storePlaceholders(bundle);
      let limDrops = new Bundle()._Bundle$();
      Dungeon$LimitedDrops.store(limDrops);
      bundle.put$String$Bundle(Dungeon.LIMDROPS, limDrops);
      let count = 0;
      let ids = $J.newArray(Dungeon.chapters.size(), 0);
      for (const $it2 = Dungeon.chapters.iterator(); $it2.hasNext(); ) {
        let id = $it2.next();
        ids[count++] = id;
      }
      bundle.put$String$intArr(Dungeon.CHAPTERS, ids);
      let quests = new Bundle()._Bundle$();
      Ghost$Quest.storeInBundle(quests);
      Wandmaker$Quest.storeInBundle(quests);
      Blacksmith$Quest.storeInBundle(quests);
      Imp$Quest.storeInBundle(quests);
      bundle.put$String$Bundle(Dungeon.QUESTS, quests);
      SpecialRoom.storeRoomsInBundle(bundle);
      SecretRoom.storeRoomsInBundle(bundle);
      Statistics.storeInBundle(bundle);
      Notes.storeInBundle(bundle);
      Generator.storeInBundle(bundle);
      let bundleArr = $J.newArray(Dungeon.generatedLevels.size(), 0);
      for (let i = 0; i < Dungeon.generatedLevels.size(); i++) {
        bundleArr[i] = Dungeon.generatedLevels.get(i);
      }
      bundle.put$String$intArr(Dungeon.GENERATED_LEVELS, bundleArr);
      Scroll.save(bundle);
      Potion.save(bundle);
      Ring.save(bundle);
      Actor.storeNextID(bundle);
      let badges = new Bundle()._Bundle$();
      Badges.saveLocal(badges);
      bundle.put$String$Bundle(Dungeon.BADGES, badges);
      FileUtils.bundleToFile(GamesInProgress.gameFile(save), bundle);
    } catch ($e3) {
      if ($J.isa($e3, IOException)) {
        let e = $J.exc($e3);
        GamesInProgress.setUnknown(save);
        Game.reportException(e);
      } else {
        throw $e3;
      }
    }
  }
  static saveLevel(save: number): void {
    let bundle = new Bundle()._Bundle$();
    bundle.put$String$Bundlable(Dungeon.LEVEL, Dungeon.level);
    FileUtils.bundleToFile(GamesInProgress.depthFile(save, Dungeon.depth, Dungeon.branch), bundle);
  }
  static saveAll(): void {
    if (Dungeon.hero != null && (Dungeon.hero.isAlive() || WndResurrect.instance != null)) {
      Actor.fixTime();
      Dungeon.updateLevelExplored();
      Dungeon.saveGame(GamesInProgress.curSlot);
      Dungeon.saveLevel(GamesInProgress.curSlot);
      GamesInProgress.set(GamesInProgress.curSlot);
    }
  }
  static loadGame$int(save: number): void {
    Dungeon.loadGame$int$boolean(save, true);
  }
  static loadGame$int$boolean(save: number, fullLoad: boolean): void {
    let bundle = FileUtils.bundleFromFile(GamesInProgress.gameFile(save));
    Dungeon.initialVersion = bundle.getInt(Dungeon.INIT_VER);
    Dungeon.version = bundle.getInt(Dungeon.VERSION);
    Dungeon.seed = bundle.contains(Dungeon.SEED) ? bundle.getLong(Dungeon.SEED) : DungeonSeed.randomSeed();
    Dungeon.customSeedText = bundle.getString(Dungeon.CUSTOM_SEED);
    Dungeon.daily = bundle.getBoolean(Dungeon.DAILY);
    Dungeon.dailyReplay = bundle.getBoolean(Dungeon.DAILY_REPLAY);
    Actor.clear();
    Actor.restoreNextID(bundle);
    Dungeon.quickslot.reset();
    QuickSlotButton.reset();
    Toolbar.swappedQuickslots = false;
    Dungeon.challenges = bundle.getInt(Dungeon.CHALLENGES);
    Dungeon.mobsToChampion = bundle.getFloat(Dungeon.MOBS_TO_CHAMPION);
    Dungeon.level = null;
    Dungeon.depth = -1;
    Scroll.restore(bundle);
    Potion.restore(bundle);
    Ring.restore(bundle);
    Dungeon.quickslot.restorePlaceholders(bundle);
    if (fullLoad) {
      Dungeon$LimitedDrops.restore(bundle.getBundle(Dungeon.LIMDROPS));
      Dungeon.chapters = new HashSet();
      let ids = bundle.getIntArray(Dungeon.CHAPTERS);
      if (ids != null) {
        for (let id of ids) {
          Dungeon.chapters.add(id);
        }
      }
      let quests = bundle.getBundle(Dungeon.QUESTS);
      if (!quests.isNull()) {
        Ghost$Quest.restoreFromBundle(quests);
        Wandmaker$Quest.restoreFromBundle(quests);
        Blacksmith$Quest.restoreFromBundle(quests);
        Imp$Quest.restoreFromBundle(quests);
      } else {
        Ghost$Quest.reset();
        Wandmaker$Quest.reset();
        Blacksmith$Quest.reset();
        Imp$Quest.reset();
      }
      SpecialRoom.restoreRoomsFromBundle(bundle);
      SecretRoom.restoreRoomsFromBundle(bundle);
      Dungeon.generatedLevels.clear();
      for (let i of bundle.getIntArray(Dungeon.GENERATED_LEVELS)) {
        Dungeon.generatedLevels.add(i);
      }
      Dungeon.droppedItems = new SparseArray()._SparseArray();
      for (let i = 1; i <= 26; i++) {
        let items = new ArrayList();
        if (bundle.contains(Messages.format(Dungeon.DROPPED, [i]))) {
          for (const $it4 = bundle.getCollection(Messages.format(Dungeon.DROPPED, [i])).iterator(); $it4.hasNext(); ) {
            let b = $it4.next();
            items.add(b);
          }
        }
        if (!items.isEmpty()) {
          Dungeon.droppedItems.put(i, items);
        }
      }
    }
    let badges = bundle.getBundle(Dungeon.BADGES);
    if (!badges.isNull()) {
      Badges.loadLocal(badges);
    } else {
      Badges.reset();
    }
    Notes.restoreFromBundle(bundle);
    Dungeon.hero = null;
    Dungeon.hero = bundle.get$String(Dungeon.HERO);
    Dungeon.depth = bundle.getInt(Dungeon.DEPTH);
    Dungeon.branch = bundle.getInt(Dungeon.BRANCH);
    Dungeon.gold = bundle.getInt(Dungeon.GOLD);
    Dungeon.energy = bundle.getInt(Dungeon.ENERGY);
    Statistics.restoreFromBundle(bundle);
    Generator.restoreFromBundle(bundle);
  }
  static loadLevel(save: number): Level {
    Dungeon.level = null;
    Actor.clear();
    let bundle = FileUtils.bundleFromFile(GamesInProgress.depthFile(save, Dungeon.depth, Dungeon.branch));
    let level = bundle.get$String(Dungeon.LEVEL);
    if (level == null) {
      throw new IOException();
    } else {
      return level;
    }
  }
  static deleteGame(save: number, deleteLevels: boolean): void {
    if (deleteLevels) {
      let folder = GamesInProgress.gameFolder(save);
      for (const $it5 = FileUtils.filesInDir(folder).iterator(); $it5.hasNext(); ) {
        let file = $it5.next();
        if (file.includes('depth')) {
          FileUtils.deleteFile(folder + '/' + file);
        }
      }
    }
    FileUtils.overwriteFile(GamesInProgress.gameFile(save), 1);
    GamesInProgress.delete(save);
  }
  static preview(info: GamesInProgress$Info, bundle: Bundle): void {
    info.depth_ = bundle.getInt(Dungeon.DEPTH);
    info.version = bundle.getInt(Dungeon.VERSION);
    info.challenges = bundle.getInt(Dungeon.CHALLENGES);
    info.seed_ = bundle.getLong(Dungeon.SEED);
    info.customSeed = bundle.getString(Dungeon.CUSTOM_SEED);
    info.daily = bundle.getBoolean(Dungeon.DAILY);
    info.dailyReplay = bundle.getBoolean(Dungeon.DAILY_REPLAY);
    info.lastPlayed = bundle.getLong(Dungeon.LAST_PLAYED);
    Hero.preview(info, bundle.getBundle(Dungeon.HERO));
    Statistics.preview(info, bundle);
  }
  static fail(cause: any): void {
    if (WndResurrect.instance == null) {
      Dungeon.updateLevelExplored();
      Statistics.gameWon = false;
      Rankings.INSTANCE.submit(false, cause);
    }
  }
  static win(cause: any): void {
    Dungeon.updateLevelExplored();
    Statistics.gameWon = true;
    Dungeon.hero.belongings.identify();
    Rankings.INSTANCE.submit(true, cause);
  }
  static updateLevelExplored(): void {
    if (Dungeon.branch === 0 && Dungeon.level instanceof RegularLevel && !Dungeon.bossLevel$()) {
      Statistics.floorsExplored.put(Dungeon.depth, $J.boxF(Dungeon.level.levelExplorePercent(Dungeon.depth)));
    }
  }
  static observe$(): void {
    let dist = Math.max(Dungeon.hero.viewDistance, 8);
    dist = $J.d2i(Math.fround(dist * Math.fround(1 + Math.fround(0.25 * Dungeon.hero.pointsInTalent(Talent.FARSIGHT)))));
    if (Dungeon.hero.buff($J.cls(MagicalSight)) != null) {
      dist = Math.max(dist, MagicalSight.DISTANCE);
    }
    Dungeon.observe$int((dist + 1) | 0);
  }
  static observe$int(dist: number): void {
    if (Dungeon.level == null) {
      return;
    }
    Dungeon.level.updateFieldOfView(Dungeon.hero, Dungeon.level.heroFOV);
    let x = Dungeon.hero.pos % Dungeon.level.width();
    let y = $J.idiv(Dungeon.hero.pos, Dungeon.level.width());
    let l = Math.max(0, (x - dist) | 0);
    let r = Math.min((x + dist) | 0, (Dungeon.level.width() - 1) | 0);
    let t = Math.max(0, (y - dist) | 0);
    let b = Math.min((y + dist) | 0, (Dungeon.level.height() - 1) | 0);
    let width = (r - l + 1) | 0;
    let height = (b - t + 1) | 0;
    let pos = (l + Math.imul(t, Dungeon.level.width())) | 0;
    for (let i = t; i <= b; i++) {
      BArray.or$booleanArr$booleanArr$int$int$booleanArr(Dungeon.level.visited, Dungeon.level.heroFOV, pos, width, Dungeon.level.visited);
      pos = (pos + Dungeon.level.width()) | 0;
    }
    for (let i of PathFinder.NEIGHBOURS9) {
      (Dungeon.level.visited[(Dungeon.hero.pos + i) | 0]) = true;
    }
    GameScene.updateFog$int$int$int$int(l, t, width, height);
    if (Dungeon.hero.buff($J.cls(MindVision)) != null || Dungeon.hero.buff($J.cls(DivineSense$DivineSenseTracker)) != null) {
      for (let m of $J.toArrayInto(Dungeon.level.mobs.toArray(), $J.newArray(0, null))) {
        if (m instanceof Mimic && m.alignment === Char$Alignment.NEUTRAL && (m).stealthy()) {
          continue;
        }
        if (Char.hasProp(m, Char$Property.OBJECT)) {
          continue;
        }
        BArray.or$booleanArr$booleanArr$int$int$booleanArr(Dungeon.level.visited, Dungeon.level.heroFOV, (m.pos - 1 - Dungeon.level.width()) | 0, 3, Dungeon.level.visited);
        BArray.or$booleanArr$booleanArr$int$int$booleanArr(Dungeon.level.visited, Dungeon.level.heroFOV, (m.pos - 1) | 0, 3, Dungeon.level.visited);
        BArray.or$booleanArr$booleanArr$int$int$booleanArr(Dungeon.level.visited, Dungeon.level.heroFOV, (m.pos - 1 + Dungeon.level.width()) | 0, 3, Dungeon.level.visited);
        GameScene.updateFog$int$int(m.pos, 2);
      }
    }
    if (Dungeon.hero.buff($J.cls(Awareness)) != null) {
      for (const $it6 = Dungeon.level.heaps.valueList().iterator(); $it6.hasNext(); ) {
        let h = $it6.next();
        BArray.or$booleanArr$booleanArr$int$int$booleanArr(Dungeon.level.visited, Dungeon.level.heroFOV, (h.pos - 1 - Dungeon.level.width()) | 0, 3, Dungeon.level.visited);
        BArray.or$booleanArr$booleanArr$int$int$booleanArr(Dungeon.level.visited, Dungeon.level.heroFOV, (h.pos - 1) | 0, 3, Dungeon.level.visited);
        BArray.or$booleanArr$booleanArr$int$int$booleanArr(Dungeon.level.visited, Dungeon.level.heroFOV, (h.pos - 1 + Dungeon.level.width()) | 0, 3, Dungeon.level.visited);
        GameScene.updateFog$int$int(h.pos, 2);
      }
    }
    for (const $it7 = Dungeon.hero.buffs$Class($J.cls(TalismanOfForesight$CharAwareness)).iterator(); $it7.hasNext(); ) {
      let c = $it7.next();
      let ch = Actor.findById(c.charID);
      if (ch == null || !ch.isAlive() || Char.hasProp(ch, Char$Property.OBJECT)) {
        continue;
      }
      BArray.or$booleanArr$booleanArr$int$int$booleanArr(Dungeon.level.visited, Dungeon.level.heroFOV, (ch.pos - 1 - Dungeon.level.width()) | 0, 3, Dungeon.level.visited);
      BArray.or$booleanArr$booleanArr$int$int$booleanArr(Dungeon.level.visited, Dungeon.level.heroFOV, (ch.pos - 1) | 0, 3, Dungeon.level.visited);
      BArray.or$booleanArr$booleanArr$int$int$booleanArr(Dungeon.level.visited, Dungeon.level.heroFOV, (ch.pos - 1 + Dungeon.level.width()) | 0, 3, Dungeon.level.visited);
      GameScene.updateFog$int$int(ch.pos, 2);
    }
    for (const $it8 = Dungeon.hero.buffs$Class($J.cls(TalismanOfForesight$HeapAwareness)).iterator(); $it8.hasNext(); ) {
      let h = $it8.next();
      if (Dungeon.depth !== h.depth_ || Dungeon.branch !== h.branch) {
        continue;
      }
      BArray.or$booleanArr$booleanArr$int$int$booleanArr(Dungeon.level.visited, Dungeon.level.heroFOV, (h.pos - 1 - Dungeon.level.width()) | 0, 3, Dungeon.level.visited);
      BArray.or$booleanArr$booleanArr$int$int$booleanArr(Dungeon.level.visited, Dungeon.level.heroFOV, (h.pos - 1) | 0, 3, Dungeon.level.visited);
      BArray.or$booleanArr$booleanArr$int$int$booleanArr(Dungeon.level.visited, Dungeon.level.heroFOV, (h.pos - 1 + Dungeon.level.width()) | 0, 3, Dungeon.level.visited);
      GameScene.updateFog$int$int(h.pos, 2);
    }
    for (const $it9 = Dungeon.hero.buffs$Class($J.cls(RevealedArea)).iterator(); $it9.hasNext(); ) {
      let a = $it9.next();
      if (Dungeon.depth !== a.depth_ || Dungeon.branch !== a.branch) {
        continue;
      }
      BArray.or$booleanArr$booleanArr$int$int$booleanArr(Dungeon.level.visited, Dungeon.level.heroFOV, (a.pos - 1 - Dungeon.level.width()) | 0, 3, Dungeon.level.visited);
      BArray.or$booleanArr$booleanArr$int$int$booleanArr(Dungeon.level.visited, Dungeon.level.heroFOV, (a.pos - 1) | 0, 3, Dungeon.level.visited);
      BArray.or$booleanArr$booleanArr$int$int$booleanArr(Dungeon.level.visited, Dungeon.level.heroFOV, (a.pos - 1 + Dungeon.level.width()) | 0, 3, Dungeon.level.visited);
      GameScene.updateFog$int$int(a.pos, 2);
    }
    for (const $it10 = Actor.chars().iterator(); $it10.hasNext(); ) {
      let ch = $it10.next();
      if (ch instanceof WandOfWarding$Ward || ch instanceof WandOfRegrowth$Lotus || ch instanceof SpiritHawk$HawkAlly || ch.buff($J.cls(PowerOfMany$PowerBuff)) != null) {
        x = ch.pos % Dungeon.level.width();
        y = $J.idiv(ch.pos, Dungeon.level.width());
        dist = (ch.viewDistance + 1) | 0;
        l = Math.max(0, (x - dist) | 0);
        r = Math.min((x + dist) | 0, (Dungeon.level.width() - 1) | 0);
        t = Math.max(0, (y - dist) | 0);
        b = Math.min((y + dist) | 0, (Dungeon.level.height() - 1) | 0);
        width = (r - l + 1) | 0;
        height = (b - t + 1) | 0;
        pos = (l + Math.imul(t, Dungeon.level.width())) | 0;
        for (let i = t; i <= b; i++) {
          BArray.or$booleanArr$booleanArr$int$int$booleanArr(Dungeon.level.visited, Dungeon.level.heroFOV, pos, width, Dungeon.level.visited);
          pos = (pos + Dungeon.level.width()) | 0;
        }
        GameScene.updateFog$int$int(ch.pos, dist);
      }
    }
    GameScene.afterObserve();
  }
  static setupPassable(): void {
    if (Dungeon.passable == null || Dungeon.passable.length !== Dungeon.level.length()) {
      Dungeon.passable = $J.newArray(Dungeon.level.length(), false);
    } else {
      BArray.setFalse(Dungeon.passable);
    }
  }
  static findPassable$Char$booleanArr$booleanArr$boolean(ch: Char, pass: boolean[], vis: boolean[], chars: boolean): boolean[] {
    return Dungeon.findPassable$Char$booleanArr$booleanArr$boolean$boolean(ch, pass, vis, chars, chars);
  }
  static findPassable$Char$booleanArr$booleanArr$boolean$boolean(ch: Char, pass: boolean[], vis: boolean[], chars: boolean, considerLarge: boolean): boolean[] {
    Dungeon.setupPassable();
    if (ch.flying || ch.buff($J.cls(Amok)) != null) {
      BArray.or$booleanArr$booleanArr$booleanArr(pass, Dungeon.level.avoid, Dungeon.passable);
    } else {
      $J.system_arraycopy(pass, 0, Dungeon.passable, 0, Dungeon.level.length());
    }
    if (considerLarge && Char.hasProp(ch, Char$Property.LARGE)) {
      BArray.and(Dungeon.passable, Dungeon.level.openSpace, Dungeon.passable);
    }
    ch.modifyPassable(Dungeon.passable);
    if (chars) {
      for (const $it11 = Actor.chars().iterator(); $it11.hasNext(); ) {
        let c = $it11.next();
        if (vis[c.pos]) {
          Dungeon.passable[c.pos] = false;
        }
      }
    }
    return Dungeon.passable;
  }
  static findPath(ch: Char, to: number, pass: boolean[], vis: boolean[], chars: boolean): PathFinder$Path {
    return PathFinder.find(ch.pos, to, Dungeon.findPassable$Char$booleanArr$booleanArr$boolean(ch, pass, vis, chars));
  }
  static findStep(ch: Char, to: number, pass: boolean[], visible: boolean[], chars: boolean): number {
    if (Dungeon.level.adjacent(ch.pos, to)) {
      return Actor.findChar(to) == null && pass[to] ? to : -1;
    }
    return PathFinder.getStep(ch.pos, to, Dungeon.findPassable$Char$booleanArr$booleanArr$boolean(ch, pass, visible, chars));
  }
  static flee(ch: Char, from: number, pass: boolean[], visible: boolean[], chars: boolean): number {
    let passable = Dungeon.findPassable$Char$booleanArr$booleanArr$boolean$boolean(ch, pass, visible, false, true);
    passable[ch.pos] = true;
    let canApproachFromPos = ch.buff($J.cls(Terror)) == null && ch.buff($J.cls(Dread)) == null;
    let step = PathFinder.getStepBack(ch.pos, from, canApproachFromPos ? 8 : 4, passable, canApproachFromPos);
    while (step !== -1 && Actor.findChar(step) != null && chars) {
      passable[step] = false;
      step = PathFinder.getStepBack(ch.pos, from, canApproachFromPos ? 8 : 4, passable, canApproachFromPos);
    }
    return step;
  }
  static $clinit() {
    Dungeon.quickslot = new QuickSlot()._QuickSlot();
    Dungeon.generatedLevels = new ArrayList();
    Dungeon.customSeedText = '';
  }
}

export class Dungeon$LimitedDrops extends JEnum {
  count_: number = 0;
  static STRENGTH_POTIONS: Dungeon$LimitedDrops = null;
  static UPGRADE_SCROLLS: Dungeon$LimitedDrops = null;
  static ARCANE_STYLI: Dungeon$LimitedDrops = null;
  static ENCH_STONE: Dungeon$LimitedDrops = null;
  static INT_STONE: Dungeon$LimitedDrops = null;
  static TRINKET_CATA: Dungeon$LimitedDrops = null;
  static LAB_ROOM: Dungeon$LimitedDrops = null;
  static SWARM_HP: Dungeon$LimitedDrops = null;
  static NECRO_HP: Dungeon$LimitedDrops = null;
  static BAT_HP: Dungeon$LimitedDrops = null;
  static WARLOCK_HP: Dungeon$LimitedDrops = null;
  static COOKING_HP: Dungeon$LimitedDrops = null;
  static BLANDFRUIT_SEED: Dungeon$LimitedDrops = null;
  static SLIME_WEP: Dungeon$LimitedDrops = null;
  static SKELE_WEP: Dungeon$LimitedDrops = null;
  static THEIF_MISC: Dungeon$LimitedDrops = null;
  static GUARD_ARM: Dungeon$LimitedDrops = null;
  static SHAMAN_WAND: Dungeon$LimitedDrops = null;
  static DM200_EQUIP: Dungeon$LimitedDrops = null;
  static GOLEM_EQUIP: Dungeon$LimitedDrops = null;
  static VELVET_POUCH: Dungeon$LimitedDrops = null;
  static SCROLL_HOLDER: Dungeon$LimitedDrops = null;
  static POTION_BANDOLIER: Dungeon$LimitedDrops = null;
  static MAGICAL_HOLSTER: Dungeon$LimitedDrops = null;
  static LORE_SEWERS: Dungeon$LimitedDrops = null;
  static LORE_PRISON: Dungeon$LimitedDrops = null;
  static LORE_CAVES: Dungeon$LimitedDrops = null;
  static LORE_CITY: Dungeon$LimitedDrops = null;
  static LORE_HALLS: Dungeon$LimitedDrops = null;
  static $VALUES: Dungeon$LimitedDrops[] = null;
  _Dungeon$LimitedDrops($name: string, $ordinal: number): this {
    this._JEnum($name, $ordinal);
    this.count_ = 0;
    return this;
  }
  dropped(): boolean {
    return this.count_ !== 0;
  }
  drop(): void {
    this.count_ = 1;
  }
  static reset(): void {
    for (let lim of Dungeon$LimitedDrops.values()) {
      lim.count_ = 0;
    }
  }
  static store(bundle: Bundle): void {
    for (let lim of Dungeon$LimitedDrops.values()) {
      bundle.put$String$int(lim.name(), lim.count_);
    }
  }
  static restore(bundle: Bundle): void {
    for (let lim of Dungeon$LimitedDrops.values()) {
      if (bundle.contains(lim.name())) {
        lim.count_ = bundle.getInt(lim.name());
      } else {
        lim.count_ = 0;
      }
    }
  }
  static values(): Dungeon$LimitedDrops[] { return Dungeon$LimitedDrops.$VALUES.slice(); }
  static valueOf(name: string): Dungeon$LimitedDrops { return $J.enumValueOf(Dungeon$LimitedDrops, name); }
  static $clinit() {
    Dungeon$LimitedDrops.STRENGTH_POTIONS = new Dungeon$LimitedDrops()._Dungeon$LimitedDrops('STRENGTH_POTIONS', 0);
    Dungeon$LimitedDrops.UPGRADE_SCROLLS = new Dungeon$LimitedDrops()._Dungeon$LimitedDrops('UPGRADE_SCROLLS', 1);
    Dungeon$LimitedDrops.ARCANE_STYLI = new Dungeon$LimitedDrops()._Dungeon$LimitedDrops('ARCANE_STYLI', 2);
    Dungeon$LimitedDrops.ENCH_STONE = new Dungeon$LimitedDrops()._Dungeon$LimitedDrops('ENCH_STONE', 3);
    Dungeon$LimitedDrops.INT_STONE = new Dungeon$LimitedDrops()._Dungeon$LimitedDrops('INT_STONE', 4);
    Dungeon$LimitedDrops.TRINKET_CATA = new Dungeon$LimitedDrops()._Dungeon$LimitedDrops('TRINKET_CATA', 5);
    Dungeon$LimitedDrops.LAB_ROOM = new Dungeon$LimitedDrops()._Dungeon$LimitedDrops('LAB_ROOM', 6);
    Dungeon$LimitedDrops.SWARM_HP = new Dungeon$LimitedDrops()._Dungeon$LimitedDrops('SWARM_HP', 7);
    Dungeon$LimitedDrops.NECRO_HP = new Dungeon$LimitedDrops()._Dungeon$LimitedDrops('NECRO_HP', 8);
    Dungeon$LimitedDrops.BAT_HP = new Dungeon$LimitedDrops()._Dungeon$LimitedDrops('BAT_HP', 9);
    Dungeon$LimitedDrops.WARLOCK_HP = new Dungeon$LimitedDrops()._Dungeon$LimitedDrops('WARLOCK_HP', 10);
    Dungeon$LimitedDrops.COOKING_HP = new Dungeon$LimitedDrops()._Dungeon$LimitedDrops('COOKING_HP', 11);
    Dungeon$LimitedDrops.BLANDFRUIT_SEED = new Dungeon$LimitedDrops()._Dungeon$LimitedDrops('BLANDFRUIT_SEED', 12);
    Dungeon$LimitedDrops.SLIME_WEP = new Dungeon$LimitedDrops()._Dungeon$LimitedDrops('SLIME_WEP', 13);
    Dungeon$LimitedDrops.SKELE_WEP = new Dungeon$LimitedDrops()._Dungeon$LimitedDrops('SKELE_WEP', 14);
    Dungeon$LimitedDrops.THEIF_MISC = new Dungeon$LimitedDrops()._Dungeon$LimitedDrops('THEIF_MISC', 15);
    Dungeon$LimitedDrops.GUARD_ARM = new Dungeon$LimitedDrops()._Dungeon$LimitedDrops('GUARD_ARM', 16);
    Dungeon$LimitedDrops.SHAMAN_WAND = new Dungeon$LimitedDrops()._Dungeon$LimitedDrops('SHAMAN_WAND', 17);
    Dungeon$LimitedDrops.DM200_EQUIP = new Dungeon$LimitedDrops()._Dungeon$LimitedDrops('DM200_EQUIP', 18);
    Dungeon$LimitedDrops.GOLEM_EQUIP = new Dungeon$LimitedDrops()._Dungeon$LimitedDrops('GOLEM_EQUIP', 19);
    Dungeon$LimitedDrops.VELVET_POUCH = new Dungeon$LimitedDrops()._Dungeon$LimitedDrops('VELVET_POUCH', 20);
    Dungeon$LimitedDrops.SCROLL_HOLDER = new Dungeon$LimitedDrops()._Dungeon$LimitedDrops('SCROLL_HOLDER', 21);
    Dungeon$LimitedDrops.POTION_BANDOLIER = new Dungeon$LimitedDrops()._Dungeon$LimitedDrops('POTION_BANDOLIER', 22);
    Dungeon$LimitedDrops.MAGICAL_HOLSTER = new Dungeon$LimitedDrops()._Dungeon$LimitedDrops('MAGICAL_HOLSTER', 23);
    Dungeon$LimitedDrops.LORE_SEWERS = new Dungeon$LimitedDrops()._Dungeon$LimitedDrops('LORE_SEWERS', 24);
    Dungeon$LimitedDrops.LORE_PRISON = new Dungeon$LimitedDrops()._Dungeon$LimitedDrops('LORE_PRISON', 25);
    Dungeon$LimitedDrops.LORE_CAVES = new Dungeon$LimitedDrops()._Dungeon$LimitedDrops('LORE_CAVES', 26);
    Dungeon$LimitedDrops.LORE_CITY = new Dungeon$LimitedDrops()._Dungeon$LimitedDrops('LORE_CITY', 27);
    Dungeon$LimitedDrops.LORE_HALLS = new Dungeon$LimitedDrops()._Dungeon$LimitedDrops('LORE_HALLS', 28);
    Dungeon$LimitedDrops.$VALUES = [Dungeon$LimitedDrops.STRENGTH_POTIONS, Dungeon$LimitedDrops.UPGRADE_SCROLLS, Dungeon$LimitedDrops.ARCANE_STYLI, Dungeon$LimitedDrops.ENCH_STONE, Dungeon$LimitedDrops.INT_STONE, Dungeon$LimitedDrops.TRINKET_CATA, Dungeon$LimitedDrops.LAB_ROOM, Dungeon$LimitedDrops.SWARM_HP, Dungeon$LimitedDrops.NECRO_HP, Dungeon$LimitedDrops.BAT_HP, Dungeon$LimitedDrops.WARLOCK_HP, Dungeon$LimitedDrops.COOKING_HP, Dungeon$LimitedDrops.BLANDFRUIT_SEED, Dungeon$LimitedDrops.SLIME_WEP, Dungeon$LimitedDrops.SKELE_WEP, Dungeon$LimitedDrops.THEIF_MISC, Dungeon$LimitedDrops.GUARD_ARM, Dungeon$LimitedDrops.SHAMAN_WAND, Dungeon$LimitedDrops.DM200_EQUIP, Dungeon$LimitedDrops.GOLEM_EQUIP, Dungeon$LimitedDrops.VELVET_POUCH, Dungeon$LimitedDrops.SCROLL_HOLDER, Dungeon$LimitedDrops.POTION_BANDOLIER, Dungeon$LimitedDrops.MAGICAL_HOLSTER, Dungeon$LimitedDrops.LORE_SEWERS, Dungeon$LimitedDrops.LORE_PRISON, Dungeon$LimitedDrops.LORE_CAVES, Dungeon$LimitedDrops.LORE_CITY, Dungeon$LimitedDrops.LORE_HALLS];
  }
}

$J.define(Dungeon, 'com.shatteredpixel.shatteredpixeldungeon.Dungeon', { kind: 'class', sup: 'java.lang.Object', ctors: { '': '_Dungeon' }, meths: { 'findPassable(com.shatteredpixel.shatteredpixeldungeon.actors.Char,boolean[],boolean[],boolean,boolean)': 'findPassable$Char$booleanArr$booleanArr$boolean$boolean', 'findPassable(com.shatteredpixel.shatteredpixeldungeon.actors.Char,boolean[],boolean[],boolean)': 'findPassable$Char$booleanArr$booleanArr$boolean', 'observe(int)': 'observe$int', 'observe()': 'observe$', 'loadGame(int,boolean)': 'loadGame$int$boolean', 'loadGame(int)': 'loadGame$int', 'bossLevel(int)': 'bossLevel$int', 'bossLevel()': 'bossLevel$' }, clinit: true, lazy: ['challenges', 'mobsToChampion', 'hero', 'level', 'quickslot', 'depth', 'branch', 'generatedLevels', 'gold', 'energy', 'chapters', 'droppedItems', 'initialVersion', 'version', 'daily', 'dailyReplay', 'customSeedText', 'seed', 'lastPlayed', 'passable'] });
$J.define(Dungeon$LimitedDrops, 'com.shatteredpixel.shatteredpixeldungeon.Dungeon$LimitedDrops', { kind: 'enum', sup: 'java.lang.Enum', ctors: { '': '_Dungeon$LimitedDrops' }, clinit: true, lazy: ['$VALUES', 'STRENGTH_POTIONS', 'UPGRADE_SCROLLS', 'ARCANE_STYLI', 'ENCH_STONE', 'INT_STONE', 'TRINKET_CATA', 'LAB_ROOM', 'SWARM_HP', 'NECRO_HP', 'BAT_HP', 'WARLOCK_HP', 'COOKING_HP', 'BLANDFRUIT_SEED', 'SLIME_WEP', 'SKELE_WEP', 'THEIF_MISC', 'GUARD_ARM', 'SHAMAN_WAND', 'DM200_EQUIP', 'GOLEM_EQUIP', 'VELVET_POUCH', 'SCROLL_HOLDER', 'POTION_BANDOLIER', 'MAGICAL_HOLSTER', 'LORE_SEWERS', 'LORE_PRISON', 'LORE_CAVES', 'LORE_CITY', 'LORE_HALLS'] });
$J.module(() => {
  Badges = $J.load('com.shatteredpixel.shatteredpixeldungeon.Badges');
  GamesInProgress = $J.load('com.shatteredpixel.shatteredpixeldungeon.GamesInProgress');
  QuickSlot = $J.load('com.shatteredpixel.shatteredpixeldungeon.QuickSlot');
  Rankings = $J.load('com.shatteredpixel.shatteredpixeldungeon.Rankings');
  SPDSettings = $J.load('com.shatteredpixel.shatteredpixeldungeon.SPDSettings');
  Statistics = $J.load('com.shatteredpixel.shatteredpixeldungeon.Statistics');
  Actor = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Actor');
  Char = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Char');
  Char$Alignment = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Char$Alignment');
  Char$Property = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Char$Property');
  Amok = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Amok');
  AscensionChallenge = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.AscensionChallenge');
  Awareness = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Awareness');
  Dread = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Dread');
  Light = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Light');
  MagicalSight = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.MagicalSight');
  MindVision = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.MindVision');
  RevealedArea = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.RevealedArea');
  Terror = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Terror');
  Hero = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.Hero');
  Talent = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.Talent');
  PowerOfMany$PowerBuff = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.abilities.cleric.PowerOfMany$PowerBuff');
  SpiritHawk$HawkAlly = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.abilities.huntress.SpiritHawk$HawkAlly');
  DivineSense$DivineSenseTracker = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.spells.DivineSense$DivineSenseTracker');
  Mimic = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.Mimic');
  Mob = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.Mob');
  Blacksmith$Quest = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.npcs.Blacksmith$Quest');
  Ghost$Quest = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.npcs.Ghost$Quest');
  Imp$Quest = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.npcs.Imp$Quest');
  Wandmaker$Quest = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.npcs.Wandmaker$Quest');
  Amulet = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.Amulet');
  Generator = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.Generator');
  TalismanOfForesight$CharAwareness = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.artifacts.TalismanOfForesight$CharAwareness');
  TalismanOfForesight$HeapAwareness = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.artifacts.TalismanOfForesight$HeapAwareness');
  Potion = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.potions.Potion');
  Ring = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.rings.Ring');
  Scroll = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.scrolls.Scroll');
  WandOfRegrowth$Lotus = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.wands.WandOfRegrowth$Lotus');
  WandOfWarding$Ward = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.wands.WandOfWarding$Ward');
  Notes = $J.load('com.shatteredpixel.shatteredpixeldungeon.journal.Notes');
  CavesBossLevel = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.CavesBossLevel');
  CavesLevel = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.CavesLevel');
  CityBossLevel = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.CityBossLevel');
  CityLevel = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.CityLevel');
  DeadEndLevel = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.DeadEndLevel');
  HallsBossLevel = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.HallsBossLevel');
  HallsLevel = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.HallsLevel');
  LastLevel = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.LastLevel');
  MiningLevel = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.MiningLevel');
  PrisonBossLevel = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.PrisonBossLevel');
  PrisonLevel = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.PrisonLevel');
  RegularLevel = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.RegularLevel');
  SewerBossLevel = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.SewerBossLevel');
  SewerLevel = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.SewerLevel');
  VaultLevel = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.VaultLevel');
  LevelTransition$Type = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.features.LevelTransition$Type');
  SecretRoom = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.rooms.secret.SecretRoom');
  SpecialRoom = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.rooms.special.SpecialRoom');
  Messages = $J.load('com.shatteredpixel.shatteredpixeldungeon.messages.Messages');
  GameScene = $J.load('com.shatteredpixel.shatteredpixeldungeon.scenes.GameScene');
  QuickSlotButton = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.QuickSlotButton');
  Toolbar = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.Toolbar');
  DungeonSeed = $J.load('com.shatteredpixel.shatteredpixeldungeon.utils.DungeonSeed');
  WndResurrect = $J.load('com.shatteredpixel.shatteredpixeldungeon.windows.WndResurrect');
  Game = $J.load('com.watabou.noosa.Game');
  BArray = $J.load('com.watabou.utils.BArray');
  Bundle = $J.load('com.watabou.utils.Bundle');
  FileUtils = $J.load('com.watabou.utils.FileUtils');
  PathFinder = $J.load('com.watabou.utils.PathFinder');
  Random = $J.load('com.watabou.utils.Random');
  SparseArray = $J.load('com.watabou.utils.SparseArray');
});
