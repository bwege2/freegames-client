// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/Rankings.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { $J, ArrayList, Collections, IOException, JClass, JDate, JEnum, JObject, JString, LinkedHashMap, Locale, Pattern, SimpleDateFormat, UUID } from '../../../../jre/index.ts';

let Badges, Challenges, Dungeon, SPDSettings, ShatteredPixelDungeon, Statistics, Actor, Belongings, HeroClass, Generator, Bag, Potion, CorpseDust, EscapeCrystal, Ring, Scroll, Trinket, MeleeWeapon$Charger, Notes, Messages, QuickSlotButton, Toolbar, DungeonSeed, Game, Bundle, FileUtils;

export class Rankings extends JEnum {
  static readonly TABLE_SIZE: number = 11;
  static readonly RANKINGS_FILE: string = 'rankings.dat';
  records: ArrayList<Rankings$Record> = null;
  lastRecord: number = 0;
  totalNumber: number = 0;
  wonNumber: number = 0;
  localTotal: number = 0;
  localWon: number = 0;
  latestDaily: Rankings$Record = null;
  latestDailyReplay: Rankings$Record = null;
  dailyScoreHistory: LinkedHashMap<bigint, number> = null;
  static readonly HERO: string = 'hero';
  static readonly STATS: string = 'stats';
  static readonly BADGES: string = 'badges';
  static readonly HANDLERS: string = 'handlers';
  static readonly CHALLENGES: string = 'challenges';
  static readonly GAME_VERSION: string = 'game_version';
  static readonly SEED: string = 'seed';
  static readonly CUSTOM_SEED: string = 'custom_seed';
  static readonly DAILY: string = 'daily';
  static readonly DAILY_REPLAY: string = 'daily_replay';
  static readonly RECORDS: string = 'records';
  static readonly LATEST: string = 'latest';
  static readonly TOTAL: string = 'total';
  static readonly WON: string = 'won';
  static readonly LATEST_DAILY: string = 'latest_daily';
  static readonly DAILY_HISTORY_DATES: string = 'daily_history_dates';
  static readonly DAILY_HISTORY_SCORES: string = 'daily_history_scores';
  static scoreComparator: Comparator<Rankings$Record> = null;
  static INSTANCE: Rankings = null;
  static $VALUES: Rankings[] = null;
  _Rankings($name: string, $ordinal: number): this {
    this._JEnum($name, $ordinal);
    this.latestDailyReplay = null;
    this.dailyScoreHistory = new LinkedHashMap();
    return this;
  }
  submit(win: boolean, cause: any): void {
    this.load();
    let rec = new Rankings$Record()._Rankings$Record();
    let p = Pattern.compile('\\d+\\.\\d+\\.\\d+');
    let m = p.matcher(Game.version);
    if (m.find()) {
      rec.version = 'v' + m.group();
    } else {
      rec.version = '';
    }
    let crystal = Dungeon.hero.belongings.getItem($J.cls(EscapeCrystal));
    let tempStore = new EscapeCrystal()._EscapeCrystal();
    if (crystal != null) {
      crystal.detachAll(Dungeon.hero.belongings.backpack);
      tempStore.storeHeroBelongings(Dungeon.hero);
      crystal.restoreHeroBelongings(Dungeon.hero, null);
      tempStore.collect$();
    }
    let format = new SimpleDateFormat('yyyy-MM-dd', Locale.ROOT);
    rec.date = format.format(new JDate(Game.realTime));
    rec.cause = $J.isa(cause, JClass) ? cause : $J.getClass(cause);
    rec.win = win;
    rec.heroClass = Dungeon.hero.heroClass;
    rec.armorTier = Dungeon.hero.tier();
    rec.herolevel = Dungeon.hero.lvl;
    if (Statistics.highestAscent === 0) {
      rec.depth_ = Statistics.deepestFloor;
      rec.ascending = false;
    } else {
      rec.depth_ = Statistics.highestAscent;
      rec.ascending = true;
    }
    rec.score_ = this.calculateScore();
    rec.customSeed = Dungeon.customSeedText;
    rec.daily = Dungeon.daily;
    Badges.validateHighScore(rec.score_);
    Rankings.INSTANCE.saveGameData(rec);
    rec.gameID = UUID.randomUUID().toString();
    if (rec.daily) {
      if (Dungeon.dailyReplay) {
        this.latestDailyReplay = rec;
        return;
      }
      this.latestDaily = rec;
      if (Dungeon.seed <= DungeonSeed.TOTAL_SEEDS) {
        this.dailyScoreHistory.put(Dungeon.seed, rec.score_);
      } else {
        this.dailyScoreHistory.put(BigInt.asIntN(64, Dungeon.seed - DungeonSeed.TOTAL_SEEDS), rec.score_);
      }
      this.save();
      return;
    }
    this.records.add(rec);
    Collections.sort(this.records, Rankings.scoreComparator);
    this.lastRecord = this.records.indexOf(rec);
    let size = this.records.size();
    while (size > Rankings.TABLE_SIZE) {
      if (this.lastRecord === ((size - 1) | 0)) {
        this.records.removeAt((size - 2) | 0);
        this.lastRecord--;
      } else {
        this.records.removeAt((size - 1) | 0);
      }
      size = this.records.size();
    }
    if ((rec.customSeed.length === 0)) {
      this.totalNumber++;
      if (win) {
        this.wonNumber++;
      }
    }
    Badges.validateGamesPlayed();
    this.save();
    if (crystal != null) {
      tempStore.restoreHeroBelongings(Dungeon.hero, null);
    }
  }
  score(win: boolean): number {
    return Math.imul(((Statistics.goldCollected + Math.imul(Math.imul(Dungeon.hero.lvl, (win ? 26 : Dungeon.depth)), 100)) | 0), (win ? 2 : 1));
  }
  calculateScore(): number {
    if (Dungeon.initialVersion > ShatteredPixelDungeon.v1_2_3) {
      Statistics.progressScore = Math.imul(Math.imul(Dungeon.hero.lvl, Statistics.deepestFloor), 65);
      Statistics.progressScore = Math.min(Statistics.progressScore, 50000);
      if (Statistics.heldItemValue === 0) {
        let crystal = Dungeon.hero.belongings.getItem($J.cls(EscapeCrystal));
        if (crystal != null && crystal.storedItems != null) {
          let stored = new Belongings()._Belongings(Dungeon.hero);
          stored.restoreFromBundle(crystal.storedItems.getBundle(EscapeCrystal.BELONGINGS));
          for (const $it0 = stored.iterator(); $it0.hasNext(); ) {
            let i = $it0.next();
          }
        }
        for (const $it1 = Dungeon.hero.belongings.iterator(); $it1.hasNext(); ) {
          let i = $it1.next();
          Statistics.heldItemValue = (Statistics.heldItemValue + i.value()) | 0;
          if (i instanceof CorpseDust && Statistics.deepestFloor >= 10) {
            Statistics.questScores[1] = 2000;
          }
        }
      }
      Statistics.treasureScore = (Statistics.goldCollected + Statistics.heldItemValue) | 0;
      Statistics.treasureScore = Math.min(Statistics.treasureScore, 20000);
      Statistics.exploreScore = 0;
      let scorePerFloor = Math.imul(Statistics.floorsExplored.size, 50);
      for (const $it2 = Statistics.floorsExplored.valueList().iterator(); $it2.hasNext(); ) {
        let percentExplored = $it2.next();
        Statistics.exploreScore = (Statistics.exploreScore + $J.roundf(Math.fround(percentExplored * scorePerFloor))) | 0;
      }
      Statistics.totalBossScore = 0;
      for (let i of Statistics.bossScores) {
        if (i > 0) {
          Statistics.totalBossScore = (Statistics.totalBossScore + i) | 0;
        }
      }
      Statistics.totalQuestScore = 0;
      for (let i of Statistics.questScores) {
        if (i > 0) {
          Statistics.totalQuestScore = (Statistics.totalQuestScore + i) | 0;
        }
      }
      Statistics.winMultiplier = 1;
      if (Statistics.gameWon) {
        Statistics.winMultiplier = Math.fround(Statistics.winMultiplier + 1);
      }
      if (Statistics.ascended) {
        Statistics.winMultiplier = Math.fround(Statistics.winMultiplier + 0.5);
      }
    } else {
      Statistics.progressScore = Math.imul(Math.imul(Dungeon.hero.lvl, Statistics.deepestFloor), 100);
      Statistics.treasureScore = Math.min(Statistics.goldCollected, 30000);
      Statistics.exploreScore = Statistics.totalBossScore = Statistics.totalQuestScore = 0;
      Statistics.winMultiplier = Math.fround(Statistics.gameWon ? 2 : 1);
    }
    Statistics.chalMultiplier = Math.fround($J.pow(1.25, Challenges.activeChallenges$()));
    Statistics.chalMultiplier = Math.fround($J.roundf(Math.fround(Statistics.chalMultiplier * 20)) / 20);
    Statistics.totalScore = (Statistics.progressScore + Statistics.treasureScore + Statistics.exploreScore + Statistics.totalBossScore + Statistics.totalQuestScore) | 0;
    Statistics.totalScore = $J.d2i(Math.fround(Statistics.totalScore * Math.fround(Statistics.winMultiplier * Statistics.chalMultiplier)));
    return Statistics.totalScore;
  }
  saveGameData(rec: Rankings$Record): void {
    if (Dungeon.hero == null) {
      rec.gameData = null;
      return;
    }
    rec.gameData = new Bundle()._Bundle$();
    let belongings = Dungeon.hero.belongings;
    let allItems = belongings.backpack.items_.clone();
    for (let item of $J.toArrayInto(belongings.backpack.items_.toArray(), $J.newArray(0, null))) {
      if (item instanceof Bag) {
        for (let bagItem of $J.toArrayInto((item).items_.toArray(), $J.newArray(0, null))) {
          if (Dungeon.quickslot.contains(bagItem) && !Dungeon.quickslot.contains(item)) {
            belongings.backpack.items_.add(bagItem);
          }
        }
      }
      if (!(item instanceof Trinket) && !(item instanceof EscapeCrystal) && !Dungeon.quickslot.contains(item)) {
        belongings.backpack.items_.remove(item);
      }
    }
    for (const $it3 = Dungeon.hero.buffs$().iterator(); $it3.hasNext(); ) {
      let b = $it3.next();
      if (!(b instanceof MeleeWeapon$Charger)) {
        Dungeon.hero.remove$Buff(b);
      }
    }
    rec.gameData.put$String$Bundlable(Rankings.HERO, Dungeon.hero);
    let stats = new Bundle()._Bundle$();
    Statistics.storeInBundle(stats);
    rec.gameData.put$String$Bundle(Rankings.STATS, stats);
    let badges = new Bundle()._Bundle$();
    Badges.saveLocal(badges);
    rec.gameData.put$String$Bundle(Rankings.BADGES, badges);
    let handler = new Bundle()._Bundle$();
    Scroll.saveSelectively(handler, belongings.backpack.items_);
    Potion.saveSelectively(handler, belongings.backpack.items_);
    if (belongings.misc_ != null) {
      belongings.backpack.items_.add(belongings.misc_);
    }
    if (belongings.ring_ != null) {
      belongings.backpack.items_.add(belongings.ring_);
    }
    Ring.saveSelectively(handler, belongings.backpack.items_);
    rec.gameData.put$String$Bundle(Rankings.HANDLERS, handler);
    belongings.backpack.items_ = allItems;
    rec.gameData.put$String$int(Rankings.CHALLENGES, Dungeon.challenges);
    rec.gameData.put$String$int(Rankings.GAME_VERSION, Dungeon.initialVersion);
    rec.gameData.put$String$long(Rankings.SEED, Dungeon.seed);
    rec.gameData.put$String$String(Rankings.CUSTOM_SEED, Dungeon.customSeedText);
    rec.gameData.put$String$boolean(Rankings.DAILY, Dungeon.daily);
    rec.gameData.put$String$boolean(Rankings.DAILY_REPLAY, Dungeon.dailyReplay);
  }
  loadGameData(rec: Rankings$Record): void {
    let data = rec.gameData;
    Actor.clear();
    Dungeon.hero = null;
    Dungeon.level = null;
    Generator.fullReset();
    Notes.reset();
    Dungeon.quickslot.reset();
    QuickSlotButton.reset();
    Toolbar.swappedQuickslots = false;
    if (data == null) {
      return;
    }
    let handler = data.getBundle(Rankings.HANDLERS);
    Scroll.restore(handler);
    Potion.restore(handler);
    Ring.restore(handler);
    Badges.loadLocal(data.getBundle(Rankings.BADGES));
    Dungeon.hero = data.get$String(Rankings.HERO);
    Dungeon.hero.belongings.identify();
    Statistics.restoreFromBundle(data.getBundle(Rankings.STATS));
    Dungeon.challenges = data.getInt(Rankings.CHALLENGES);
    Dungeon.initialVersion = data.getInt(Rankings.GAME_VERSION);
    if (Dungeon.initialVersion <= ShatteredPixelDungeon.v1_2_3) {
      Statistics.gameWon = rec.win;
    }
    rec.score_ = this.calculateScore();
    if (rec.gameData.contains(Rankings.SEED)) {
      Dungeon.seed = rec.gameData.getLong(Rankings.SEED);
      Dungeon.customSeedText = rec.gameData.getString(Rankings.CUSTOM_SEED);
      Dungeon.daily = rec.gameData.getBoolean(Rankings.DAILY);
      Dungeon.dailyReplay = rec.gameData.getBoolean(Rankings.DAILY_REPLAY);
    } else {
      Dungeon.seed = -1n;
      Dungeon.customSeedText = '';
      Dungeon.daily = Dungeon.dailyReplay = false;
    }
  }
  save(): void {
    let bundle = new Bundle()._Bundle$();
    bundle.put$String$Collection(Rankings.RECORDS, this.records);
    bundle.put$String$int(Rankings.LATEST, this.lastRecord);
    bundle.put$String$int(Rankings.TOTAL, this.totalNumber);
    bundle.put$String$int(Rankings.WON, this.wonNumber);
    bundle.put$String$Bundlable(Rankings.LATEST_DAILY, this.latestDaily);
    let dates = $J.newArray(this.dailyScoreHistory.size(), 0n);
    let scores = $J.newArray(this.dailyScoreHistory.size(), 0);
    let i = 0;
    for (const $it4 = this.dailyScoreHistory.keySet().iterator(); $it4.hasNext(); ) {
      let l = $it4.next();
      dates[i] = l;
      scores[i] = this.dailyScoreHistory.get(l);
      i++;
    }
    bundle.put$String$longArr(Rankings.DAILY_HISTORY_DATES, dates);
    bundle.put$String$intArr(Rankings.DAILY_HISTORY_SCORES, scores);
    try {
      FileUtils.bundleToFile(Rankings.RANKINGS_FILE, bundle);
    } catch ($e5) {
      if ($J.isa($e5, IOException)) {
        let e = $J.exc($e5);
        Game.reportException(e);
      } else {
        throw $e5;
      }
    }
  }
  load(): void {
    if (this.records != null) {
      return;
    }
    this.records = new ArrayList();
    try {
      let bundle = FileUtils.bundleFromFile(Rankings.RANKINGS_FILE);
      for (const $it6 = bundle.getCollection(Rankings.RECORDS).iterator(); $it6.hasNext(); ) {
        let record = $it6.next();
        this.records.add(record);
      }
      this.lastRecord = bundle.getInt(Rankings.LATEST);
      this.totalNumber = bundle.getInt(Rankings.TOTAL);
      if (this.totalNumber === 0) {
        this.totalNumber = this.records.size();
      }
      this.wonNumber = bundle.getInt(Rankings.WON);
      if (this.wonNumber === 0) {
        for (const $it7 = this.records.iterator(); $it7.hasNext(); ) {
          let rec = $it7.next();
          if (rec.win) {
            this.wonNumber++;
          }
        }
      }
      if (bundle.contains(Rankings.LATEST_DAILY)) {
        this.latestDaily = bundle.get$String(Rankings.LATEST_DAILY);
        this.dailyScoreHistory.clear();
        let scores = bundle.getIntArray(Rankings.DAILY_HISTORY_SCORES);
        let i = 0;
        let latestDate = 0n;
        for (let date of bundle.getLongArray(Rankings.DAILY_HISTORY_DATES)) {
          this.dailyScoreHistory.put(date, scores[i]);
          if (date > latestDate) {
            latestDate = date;
          }
          i++;
        }
        if (latestDate > SPDSettings.lastDaily$()) {
          SPDSettings.lastDaily$long(latestDate);
        }
      }
    } catch ($e8) {
      if ($J.isa($e8, IOException)) {
        let e = $J.exc($e8);
      } else {
        throw $e8;
      }
    }
  }
  static values(): Rankings[] { return Rankings.$VALUES.slice(); }
  static valueOf(name: string): Rankings { return $J.enumValueOf(Rankings, name); }
  static $clinit() {
    Rankings.INSTANCE = new Rankings()._Rankings('INSTANCE', 0);
    Rankings.$VALUES = [Rankings.INSTANCE];
    Rankings.scoreComparator = (lhs, rhs) => {
      if ((rhs.customSeed.length === 0) && !(lhs.customSeed.length === 0)) {
        return +1;
      } else if ((lhs.customSeed.length === 0) && !(rhs.customSeed.length === 0)) {
        return -1;
      }
      let result = $J.d2i(Math.fround(Math.sign(Math.fround((rhs.score_ - lhs.score_) | 0))));
      if (result === 0) {
        return $J.d2i(Math.fround(Math.sign(Math.fround(($J.hashCode(rhs.gameID) - $J.hashCode(lhs.gameID)) | 0))));
      } else {
        return result;
      }
    };
  }
}

export class Rankings$Record extends JObject {
  static readonly CAUSE: string = 'cause';
  static readonly WIN: string = 'win';
  static readonly SCORE: string = 'score';
  static readonly CLASS: string = 'class';
  static readonly TIER: string = 'tier';
  static readonly LEVEL: string = 'level';
  static readonly DEPTH: string = 'depth';
  static readonly ASCEND: string = 'ascending';
  static readonly DATA: string = 'gameData';
  static readonly ID: string = 'gameID';
  static readonly SEED: string = 'custom_seed';
  static readonly DAILY: string = 'daily';
  static readonly DATE: string = 'date';
  static readonly VERSION: string = 'version';
  cause: JClass = null;
  win: boolean = false;
  heroClass: HeroClass = null;
  armorTier: number = 0;
  herolevel: number = 0;
  depth_: number = 0;
  ascending: boolean = false;
  gameData: Bundle = null;
  gameID: string = null;
  score_: number = 0;
  customSeed: string = null;
  daily: boolean = false;
  date: string = null;
  version: string = null;
  _Rankings$Record(): this {
    return this;
  }
  desc(): string {
    if (this.win) {
      if (this.ascending) {
        return Messages.get$Object$String$ObjectArr(this, 'ascended', []);
      } else {
        return Messages.get$Object$String$ObjectArr(this, 'won', []);
      }
    } else if (this.cause == null) {
      return Messages.get$Object$String$ObjectArr(this, 'something', []);
    } else {
      let result = Messages.get$Class$String$ObjectArr(this.cause, 'rankings_desc', [(Messages.get$Class$String$ObjectArr(this.cause, 'name', []))]);
      if (result.includes(Messages.NO_TEXT_FOUND)) {
        return Messages.get$Object$String$ObjectArr(this, 'something', []);
      } else {
        return result;
      }
    }
  }
  restoreFromBundle(bundle: Bundle): void {
    if (bundle.contains(Rankings$Record.CAUSE)) {
      this.cause = bundle.getClass$String(Rankings$Record.CAUSE);
    } else {
      this.cause = null;
    }
    this.win = bundle.getBoolean(Rankings$Record.WIN);
    this.score_ = bundle.getInt(Rankings$Record.SCORE);
    this.customSeed = bundle.getString(Rankings$Record.SEED);
    this.daily = bundle.getBoolean(Rankings$Record.DAILY);
    this.heroClass = bundle.getEnum(Rankings$Record.CLASS, $J.cls(HeroClass));
    this.armorTier = bundle.getInt(Rankings$Record.TIER);
    this.herolevel = bundle.getInt(Rankings$Record.LEVEL);
    this.depth_ = bundle.getInt(Rankings$Record.DEPTH);
    this.ascending = bundle.getBoolean(Rankings$Record.ASCEND);
    if (bundle.contains(Rankings$Record.DATE)) {
      this.date = bundle.getString(Rankings$Record.DATE);
      this.version = bundle.getString(Rankings$Record.VERSION);
    } else {
      this.date = this.version = null;
    }
    if (bundle.contains(Rankings$Record.DATA)) {
      this.gameData = bundle.getBundle(Rankings$Record.DATA);
    }
    if (bundle.contains(Rankings$Record.ID)) {
      this.gameID = bundle.getString(Rankings$Record.ID);
    }
    if (this.gameID == null) {
      this.gameID = UUID.randomUUID().toString();
    }
  }
  storeInBundle(bundle: Bundle): void {
    if (this.cause != null) {
      bundle.put$String$Class(Rankings$Record.CAUSE, this.cause);
    }
    bundle.put$String$boolean(Rankings$Record.WIN, this.win);
    bundle.put$String$int(Rankings$Record.SCORE, this.score_);
    bundle.put$String$String(Rankings$Record.SEED, this.customSeed);
    bundle.put$String$boolean(Rankings$Record.DAILY, this.daily);
    bundle.put$String$Enum(Rankings$Record.CLASS, this.heroClass);
    bundle.put$String$int(Rankings$Record.TIER, this.armorTier);
    bundle.put$String$int(Rankings$Record.LEVEL, this.herolevel);
    bundle.put$String$int(Rankings$Record.DEPTH, this.depth_);
    bundle.put$String$boolean(Rankings$Record.ASCEND, this.ascending);
    bundle.put$String$String(Rankings$Record.DATE, this.date);
    bundle.put$String$String(Rankings$Record.VERSION, this.version);
    if (this.gameData != null) {
      bundle.put$String$Bundle(Rankings$Record.DATA, this.gameData);
    }
    bundle.put$String$String(Rankings$Record.ID, this.gameID);
  }
}

$J.define(Rankings, 'com.shatteredpixel.shatteredpixeldungeon.Rankings', { kind: 'enum', sup: 'java.lang.Enum', ctors: { '': '_Rankings' }, clinit: true, lazy: ['$VALUES', 'INSTANCE', 'scoreComparator'] });
$J.define(Rankings$Record, 'com.shatteredpixel.shatteredpixeldungeon.Rankings$Record', { kind: 'class', ifaces: ['com.watabou.utils.Bundlable'], sup: 'java.lang.Object', ctors: { '': '_Rankings$Record' } });
$J.module(() => {
  Badges = $J.load('com.shatteredpixel.shatteredpixeldungeon.Badges');
  Challenges = $J.load('com.shatteredpixel.shatteredpixeldungeon.Challenges');
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  SPDSettings = $J.load('com.shatteredpixel.shatteredpixeldungeon.SPDSettings');
  ShatteredPixelDungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.ShatteredPixelDungeon');
  Statistics = $J.load('com.shatteredpixel.shatteredpixeldungeon.Statistics');
  Actor = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Actor');
  Belongings = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.Belongings');
  HeroClass = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.HeroClass');
  Generator = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.Generator');
  Bag = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.bags.Bag');
  Potion = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.potions.Potion');
  CorpseDust = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.quest.CorpseDust');
  EscapeCrystal = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.quest.EscapeCrystal');
  Ring = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.rings.Ring');
  Scroll = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.scrolls.Scroll');
  Trinket = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.trinkets.Trinket');
  MeleeWeapon$Charger = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.weapon.melee.MeleeWeapon$Charger');
  Notes = $J.load('com.shatteredpixel.shatteredpixeldungeon.journal.Notes');
  Messages = $J.load('com.shatteredpixel.shatteredpixeldungeon.messages.Messages');
  QuickSlotButton = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.QuickSlotButton');
  Toolbar = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.Toolbar');
  DungeonSeed = $J.load('com.shatteredpixel.shatteredpixeldungeon.utils.DungeonSeed');
  Game = $J.load('com.watabou.noosa.Game');
  Bundle = $J.load('com.watabou.utils.Bundle');
  FileUtils = $J.load('com.watabou.utils.FileUtils');
});
