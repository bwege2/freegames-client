// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/actors/mobs/npcs/Blacksmith.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { $J, ArrayList, JObject } from '../../../../../../../jre/index.ts';
import { NPC } from './NPC.ts';

let Dungeon, Statistics, Char, Char$Property, AscensionChallenge, HeroClass, Generator, Armor, Armor$Glyph, DarkGold, Pickaxe, ParchmentScrap, Weapon, Weapon$Enchantment, Notes, Notes$Landmark, BlacksmithRoom, Messages, GameScene, BlacksmithSprite, GLog, WndBlacksmith, WndBlacksmith$WndSmith, WndQuest, Game, Bundle, Random;

export class Blacksmith extends NPC {
  _Blacksmith(): this {
    this._NPC();
    this.spriteClass = $J.cls(BlacksmithSprite);
    this.properties_.add(Char$Property.IMMOVABLE);
    return this;
  }
  landmark(): Notes$Landmark {
    return (!Blacksmith$Quest.completed() || Blacksmith$Quest.rewardsAvailable()) ? Notes$Landmark.TROLL : null;
  }
  act(): boolean {
    if (Dungeon.hero.buff($J.cls(AscensionChallenge)) != null) {
      this.die(null);
      Notes.remove$Landmark(this.landmark());
      return true;
    } else if (!Blacksmith$Quest.rewardsAvailable() && Blacksmith$Quest.completed()) {
      Notes.remove$Landmark(this.landmark());
    }
    return super.act();
  }
  interact(c: Char): boolean {
    this.sprite_.turnTo(this.pos, c.pos);
    if (c !== Dungeon.hero) {
      return true;
    }
    if (!Blacksmith$Quest.given_) {
      let msg1 = '';
      let msg2 = '';
      switch (Dungeon.hero.heroClass) {
        case HeroClass.WARRIOR:
          msg1 += Messages.get$Object$String$ObjectArr(this, 'intro_quest_warrior', []);
          break;
        case HeroClass.MAGE:
          msg1 += Messages.get$Object$String$ObjectArr(this, 'intro_quest_mage', []);
          break;
        case HeroClass.ROGUE:
          msg1 += Messages.get$Object$String$ObjectArr(this, 'intro_quest_rogue', []);
          break;
        case HeroClass.HUNTRESS:
          msg1 += Messages.get$Object$String$ObjectArr(this, 'intro_quest_huntress', []);
          break;
        case HeroClass.DUELIST:
          msg1 += Messages.get$Object$String$ObjectArr(this, 'intro_quest_duelist', []);
          break;
        case HeroClass.CLERIC:
          msg1 += Messages.get$Object$String$ObjectArr(this, 'intro_quest_cleric', []);
          break;
      }
      msg1 += '\n\n' + Messages.get$Object$String$ObjectArr(this, 'intro_quest_start', []);
      switch (Blacksmith$Quest.type) {
        case Blacksmith$Quest.CRYSTAL:
          msg2 += Messages.get$Object$String$ObjectArr(this, 'intro_quest_crystal', []);
          break;
        case Blacksmith$Quest.GNOLL:
          msg2 += Messages.get$Object$String$ObjectArr(this, 'intro_quest_gnoll', []);
          break;
        case Blacksmith$Quest.FUNGI:
          msg2 += Messages.get$Object$String$ObjectArr(this, 'intro_quest_fungi', []);
          break;
      }
      let msg1Final = msg1;
      let msg2Final = msg2;
      Game.runOnRenderThread(new (Blacksmith$1())().$o(this).$c(msg1Final, msg2Final));
    } else if (!Blacksmith$Quest.completed_) {
      let msg = Messages.get$Object$String$ObjectArr(this, 'reminder', []) + '\n\n';
      switch (Blacksmith$Quest.type) {
        case Blacksmith$Quest.CRYSTAL:
          msg += Messages.get$Object$String$ObjectArr(this, 'reminder_crystal', []);
          break;
        case Blacksmith$Quest.GNOLL:
          msg += Messages.get$Object$String$ObjectArr(this, 'reminder_gnoll', []);
          break;
        case Blacksmith$Quest.FUNGI:
          msg += Messages.get$Object$String$ObjectArr(this, 'reminder_fungi', []);
          break;
      }
      this.tell(msg);
    } else if (Blacksmith$Quest.rewardsAvailable()) {
      Game.runOnRenderThread(new (Blacksmith$2())().$o(this));
    } else {
      this.tell(Messages.get$Object$String$ObjectArr(this, 'get_lost', []));
    }
    return true;
  }
  tell(text: string): void {
    Game.runOnRenderThread(new (Blacksmith$3())().$o(this).$c(text));
  }
  defenseSkill(enemy: Char): number {
    return Char.INFINITE_EVASION;
  }
  damage(dmg: number, src: any): void {
  }
  add(buff: Buff): boolean {
    return false;
  }
  reset(): boolean {
    return true;
  }
}

export class Blacksmith$Quest extends JObject {
  static type: number = 0;
  static readonly CRYSTAL: number = 1;
  static readonly GNOLL: number = 2;
  static readonly FUNGI: number = 3;
  static spawned: boolean = false;
  static given_: boolean = false;
  static started_: boolean = false;
  static bossBeaten_: boolean = false;
  static completed_: boolean = false;
  static favor: number = 0;
  static pickaxe: Item = null;
  static freePickaxe: boolean = false;
  static reforges: number = 0;
  static hardens: number = 0;
  static upgrades: number = 0;
  static smiths: number = 0;
  static smithRewards: ArrayList<Item> = null;
  static smithEnchant: Weapon$Enchantment = null;
  static smithGlyph: Armor$Glyph = null;
  static readonly NODE: string = 'blacksmith';
  static readonly TYPE: string = 'type';
  static readonly ALTERNATIVE: string = 'alternative';
  static readonly SPAWNED: string = 'spawned';
  static readonly GIVEN: string = 'given';
  static readonly STARTED: string = 'started';
  static readonly BOSS_BEATEN: string = 'boss_beaten';
  static readonly COMPLETED: string = 'completed';
  static readonly FAVOR: string = 'favor';
  static readonly PICKAXE: string = 'pickaxe';
  static readonly FREE_PICKAXE: string = 'free_pickaxe';
  static readonly REFORGES: string = 'reforges';
  static readonly HARDENS: string = 'hardens';
  static readonly UPGRADES: string = 'upgrades';
  static readonly SMITHS: string = 'smiths';
  static readonly SMITH_REWARDS: string = 'smith_rewards';
  static readonly ENCHANT: string = 'enchant';
  static readonly GLYPH: string = 'glyph';
  _Blacksmith$Quest(): this {
    return this;
  }
  static reset(): void {
    Blacksmith$Quest.type = 0;
    Blacksmith$Quest.spawned = false;
    Blacksmith$Quest.given_ = false;
    Blacksmith$Quest.started_ = false;
    Blacksmith$Quest.bossBeaten_ = false;
    Blacksmith$Quest.completed_ = false;
    Blacksmith$Quest.favor = 0;
    Blacksmith$Quest.pickaxe = new Pickaxe()._Pickaxe().identify$boolean(false);
    Blacksmith$Quest.freePickaxe = false;
    Blacksmith$Quest.reforges = 0;
    Blacksmith$Quest.hardens = 0;
    Blacksmith$Quest.upgrades = 0;
    Blacksmith$Quest.smiths = 0;
    Blacksmith$Quest.smithRewards = null;
    Blacksmith$Quest.smithEnchant = null;
    Blacksmith$Quest.smithGlyph = null;
  }
  static storeInBundle(bundle: Bundle): void {
    let node = new Bundle()._Bundle$();
    node.put$String$boolean(Blacksmith$Quest.SPAWNED, Blacksmith$Quest.spawned);
    if (Blacksmith$Quest.spawned) {
      node.put$String$int(Blacksmith$Quest.TYPE, Blacksmith$Quest.type);
      node.put$String$boolean(Blacksmith$Quest.GIVEN, Blacksmith$Quest.given_);
      node.put$String$boolean(Blacksmith$Quest.STARTED, Blacksmith$Quest.started_);
      node.put$String$boolean(Blacksmith$Quest.BOSS_BEATEN, Blacksmith$Quest.bossBeaten_);
      node.put$String$boolean(Blacksmith$Quest.COMPLETED, Blacksmith$Quest.completed_);
      node.put$String$int(Blacksmith$Quest.FAVOR, Blacksmith$Quest.favor);
      if (Blacksmith$Quest.pickaxe != null) {
        node.put$String$Bundlable(Blacksmith$Quest.PICKAXE, Blacksmith$Quest.pickaxe);
      }
      node.put$String$boolean(Blacksmith$Quest.FREE_PICKAXE, Blacksmith$Quest.freePickaxe);
      node.put$String$int(Blacksmith$Quest.REFORGES, Blacksmith$Quest.reforges);
      node.put$String$int(Blacksmith$Quest.HARDENS, Blacksmith$Quest.hardens);
      node.put$String$int(Blacksmith$Quest.UPGRADES, Blacksmith$Quest.upgrades);
      node.put$String$int(Blacksmith$Quest.SMITHS, Blacksmith$Quest.smiths);
      if (Blacksmith$Quest.smithRewards != null) {
        node.put$String$Collection(Blacksmith$Quest.SMITH_REWARDS, Blacksmith$Quest.smithRewards);
        if (Blacksmith$Quest.smithEnchant != null) {
          node.put$String$Bundlable(Blacksmith$Quest.ENCHANT, Blacksmith$Quest.smithEnchant);
          node.put$String$Bundlable(Blacksmith$Quest.GLYPH, Blacksmith$Quest.smithGlyph);
        }
      }
    }
    bundle.put$String$Bundle(Blacksmith$Quest.NODE, node);
  }
  static restoreFromBundle(bundle: Bundle): void {
    let node = bundle.getBundle(Blacksmith$Quest.NODE);
    if (!node.isNull() && (Blacksmith$Quest.spawned = node.getBoolean(Blacksmith$Quest.SPAWNED))) {
      Blacksmith$Quest.type = node.getInt(Blacksmith$Quest.TYPE);
      Blacksmith$Quest.given_ = node.getBoolean(Blacksmith$Quest.GIVEN);
      Blacksmith$Quest.started_ = node.getBoolean(Blacksmith$Quest.STARTED);
      Blacksmith$Quest.bossBeaten_ = node.getBoolean(Blacksmith$Quest.BOSS_BEATEN);
      Blacksmith$Quest.completed_ = node.getBoolean(Blacksmith$Quest.COMPLETED);
      Blacksmith$Quest.favor = node.getInt(Blacksmith$Quest.FAVOR);
      if (node.contains(Blacksmith$Quest.PICKAXE)) {
        Blacksmith$Quest.pickaxe = node.get$String(Blacksmith$Quest.PICKAXE);
      } else {
        Blacksmith$Quest.pickaxe = null;
      }
      if (node.contains(Blacksmith$Quest.FREE_PICKAXE)) {
        Blacksmith$Quest.freePickaxe = node.getBoolean(Blacksmith$Quest.FREE_PICKAXE);
      }
      Blacksmith$Quest.reforges = node.getInt(Blacksmith$Quest.REFORGES);
      Blacksmith$Quest.hardens = node.getInt(Blacksmith$Quest.HARDENS);
      Blacksmith$Quest.upgrades = node.getInt(Blacksmith$Quest.UPGRADES);
      Blacksmith$Quest.smiths = node.getInt(Blacksmith$Quest.SMITHS);
      if (node.contains(Blacksmith$Quest.SMITH_REWARDS)) {
        Blacksmith$Quest.smithRewards = new ArrayList((node.getCollection(Blacksmith$Quest.SMITH_REWARDS)));
        if (node.contains(Blacksmith$Quest.ENCHANT)) {
          Blacksmith$Quest.smithEnchant = node.get$String(Blacksmith$Quest.ENCHANT);
          Blacksmith$Quest.smithGlyph = node.get$String(Blacksmith$Quest.GLYPH);
        }
      } else {
        Blacksmith$Quest.smithRewards = null;
      }
    } else {
      Blacksmith$Quest.reset();
    }
  }
  static spawn(rooms: ArrayList<Room>): ArrayList<Room> {
    if (!Blacksmith$Quest.spawned && Dungeon.depth > 11 && (Random.Int$int((15 - Dungeon.depth) | 0)) === 0) {
      rooms.add(new BlacksmithRoom()._BlacksmithRoom());
      Blacksmith$Quest.spawned = true;
      Blacksmith$Quest.type = Random.IntRange(1, 2);
      Blacksmith$Quest.given_ = false;
      Blacksmith$Quest.generateRewards(true);
    }
    return rooms;
  }
  static generateRewards(useDecks: boolean): void {
    Blacksmith$Quest.smithRewards = new ArrayList();
    Blacksmith$Quest.smithRewards.add(Generator.randomWeapon$int$boolean(3, useDecks));
    Blacksmith$Quest.smithRewards.add(Generator.randomWeapon$int$boolean(3, useDecks));
    let toUndo = new ArrayList();
    while (Blacksmith$Quest.smithRewards.get(0).getClass() === Blacksmith$Quest.smithRewards.get(1).getClass()) {
      if (useDecks) {
        toUndo.add(Blacksmith$Quest.smithRewards.get(1));
      }
      Blacksmith$Quest.smithRewards.removeAt(1);
      Blacksmith$Quest.smithRewards.add(Generator.randomWeapon$int$boolean(3, useDecks));
    }
    for (const $it0 = toUndo.iterator(); $it0.hasNext(); ) {
      let i = $it0.next();
      Generator.undoDrop$Item(i);
    }
    Blacksmith$Quest.smithRewards.add(Generator.randomMissile$int$boolean(3, useDecks));
    Blacksmith$Quest.smithRewards.add(Generator.randomArmor$int(3));
    let rewardLevel: number;
    let itemLevelRoll = Random.Float$();
    if (itemLevelRoll < Math.fround(0.3)) {
      rewardLevel = 0;
    } else if (itemLevelRoll < 0.75) {
      rewardLevel = 1;
    } else if (itemLevelRoll < Math.fround(0.95)) {
      rewardLevel = 2;
    } else {
      rewardLevel = 3;
    }
    for (const $it1 = Blacksmith$Quest.smithRewards.iterator(); $it1.hasNext(); ) {
      let i = $it1.next();
      i.level$int(rewardLevel);
      if (i instanceof Weapon) {
        (i).enchant$Enchantment(null);
      } else if (i instanceof Armor) {
        (i).inscribe$Glyph(null);
      }
      i.cursed = false;
    }
    Blacksmith$Quest.smithEnchant = Weapon$Enchantment.random([]);
    Blacksmith$Quest.smithGlyph = Armor$Glyph.random([]);
    let enchantRoll = Random.Float$();
    if (enchantRoll > Math.fround(Math.fround(0.3) * ParchmentScrap.enchantChanceMultiplier$())) {
      Blacksmith$Quest.smithEnchant = null;
      Blacksmith$Quest.smithGlyph = null;
    }
  }
  static Type(): number {
    return Blacksmith$Quest.type;
  }
  static given(): boolean {
    return Blacksmith$Quest.given_;
  }
  static started(): boolean {
    return Blacksmith$Quest.started_;
  }
  static start(): void {
    Blacksmith$Quest.started_ = true;
  }
  static beatBoss(): boolean {
    return Blacksmith$Quest.bossBeaten_ = true;
  }
  static bossBeaten(): boolean {
    return Blacksmith$Quest.bossBeaten_;
  }
  static completed(): boolean {
    return Blacksmith$Quest.given_ && Blacksmith$Quest.completed_;
  }
  static complete(): void {
    Blacksmith$Quest.completed_ = true;
    Blacksmith$Quest.favor = 0;
    let gold = Dungeon.hero.belongings.getItem($J.cls(DarkGold));
    if (gold != null) {
      Blacksmith$Quest.favor = (Blacksmith$Quest.favor + Math.min(2000, Math.imul(gold.quantity$(), 50))) | 0;
      gold.detachAll(Dungeon.hero.belongings.backpack);
    }
    let pick = Dungeon.hero.belongings.getItem($J.cls(Pickaxe));
    if (pick.isEquipped(Dungeon.hero)) {
      let wasCursed = pick.cursed;
      pick.cursed = false;
      pick.doUnequip$Hero$boolean(Dungeon.hero, false);
      pick.cursed = wasCursed;
    }
    pick.detach(Dungeon.hero.belongings.backpack);
    Blacksmith$Quest.pickaxe = pick;
    if (Blacksmith$Quest.bossBeaten_) {
      Blacksmith$Quest.favor = (Blacksmith$Quest.favor + 1000) | 0;
    }
    Statistics.questScores[2] = (Statistics.questScores[2] + Blacksmith$Quest.favor) | 0;
    if (Blacksmith$Quest.favor >= 2500) {
      Blacksmith$Quest.freePickaxe = true;
    }
  }
  static rewardsAvailable(): boolean {
    return Blacksmith$Quest.favor > 0 || (Blacksmith$Quest.smithRewards != null && Blacksmith$Quest.smiths > 0) || (Blacksmith$Quest.pickaxe != null && Blacksmith$Quest.freePickaxe);
  }
  static $clinit() {
    Blacksmith$Quest.type = 0;
  }
}

let $Blacksmith$1$1: any = null;
/** An anonymous class (Blacksmith.java:114). */
function Blacksmith$1$1(): any {
  return $Blacksmith$1$1 ??= $J.local(class extends WndQuest {
    hide(): void {
      super.hide();
      Blacksmith$Quest.given_ = true;
      Blacksmith$Quest.completed_ = false;
      let pick = Blacksmith$Quest.pickaxe != null ? Blacksmith$Quest.pickaxe : new Pickaxe()._Pickaxe();
      if (pick.doPickUp$Hero(Dungeon.hero)) {
        GLog.i(Messages.capitalize(Messages.get$Object$String$ObjectArr(Dungeon.hero, 'you_now_have', [pick.name()])), []);
      } else {
        Dungeon.level.drop(pick, Dungeon.hero.pos).sprite_.drop$();
      }
      Blacksmith$Quest.pickaxe = null;
      if (this.$cv_msg2Final !== '') {
        GameScene.show(new WndQuest()._WndQuest(this.$outer.$outer, this.$cv_msg2Final));
      }
    }
    $c($msg2Final): this {
      this.$cv_msg2Final = $msg2Final;
      return this;
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.actors.mobs.npcs.Blacksmith$1$1', []);
}

let $Blacksmith$1: any = null;
/** An anonymous class (Blacksmith.java:111). */
function Blacksmith$1(): any {
  return $Blacksmith$1 ??= $J.local(class extends JObject {
    call(): void {
      GameScene.show(new (Blacksmith$1$1())().$o(this).$c(this.$cv_msg2Final)._WndQuest(this.$outer, this.$cv_msg1Final));
    }
    $c($msg1Final, $msg2Final): this {
      this.$cv_msg1Final = $msg1Final; this.$cv_msg2Final = $msg2Final;
      return this;
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.actors.mobs.npcs.Blacksmith$1', ['com.watabou.utils.Callback']);
}

let $Blacksmith$2: any = null;
/** An anonymous class (Blacksmith.java:150). */
function Blacksmith$2(): any {
  return $Blacksmith$2 ??= $J.local(class extends JObject {
    call(): void {
      if (Blacksmith$Quest.smithRewards != null && Blacksmith$Quest.smiths > 0) {
        GameScene.show(new WndBlacksmith$WndSmith()._WndBlacksmith$WndSmith(this.$outer, Dungeon.hero));
      } else {
        GameScene.show(new WndBlacksmith()._WndBlacksmith(this.$outer, Dungeon.hero));
      }
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.actors.mobs.npcs.Blacksmith$2', ['com.watabou.utils.Callback']);
}

let $Blacksmith$3: any = null;
/** An anonymous class (Blacksmith.java:172). */
function Blacksmith$3(): any {
  return $Blacksmith$3 ??= $J.local(class extends JObject {
    call(): void {
      GameScene.show(new WndQuest()._WndQuest(this.$outer, this.$cv_text));
    }
    $c($text): this {
      this.$cv_text = $text;
      return this;
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.actors.mobs.npcs.Blacksmith$3', ['com.watabou.utils.Callback']);
}

$J.define(Blacksmith, 'com.shatteredpixel.shatteredpixeldungeon.actors.mobs.npcs.Blacksmith', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.actors.mobs.npcs.NPC', ctors: { '': '_Blacksmith' } });
$J.define(Blacksmith$Quest, 'com.shatteredpixel.shatteredpixeldungeon.actors.mobs.npcs.Blacksmith$Quest', { kind: 'class', sup: 'java.lang.Object', ctors: { '': '_Blacksmith$Quest' }, clinit: true, lazy: ['type', 'spawned', 'given_', 'started_', 'bossBeaten_', 'completed_', 'favor', 'pickaxe', 'freePickaxe', 'reforges', 'hardens', 'upgrades', 'smiths', 'smithRewards', 'smithEnchant', 'smithGlyph'] });
$J.module(() => {
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  Statistics = $J.load('com.shatteredpixel.shatteredpixeldungeon.Statistics');
  Char = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Char');
  Char$Property = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Char$Property');
  AscensionChallenge = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.AscensionChallenge');
  HeroClass = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.HeroClass');
  Generator = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.Generator');
  Armor = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.armor.Armor');
  Armor$Glyph = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.armor.Armor$Glyph');
  DarkGold = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.quest.DarkGold');
  Pickaxe = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.quest.Pickaxe');
  ParchmentScrap = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.trinkets.ParchmentScrap');
  Weapon = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.weapon.Weapon');
  Weapon$Enchantment = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.weapon.Weapon$Enchantment');
  Notes = $J.load('com.shatteredpixel.shatteredpixeldungeon.journal.Notes');
  Notes$Landmark = $J.load('com.shatteredpixel.shatteredpixeldungeon.journal.Notes$Landmark');
  BlacksmithRoom = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.rooms.quest.BlacksmithRoom');
  Messages = $J.load('com.shatteredpixel.shatteredpixeldungeon.messages.Messages');
  GameScene = $J.load('com.shatteredpixel.shatteredpixeldungeon.scenes.GameScene');
  BlacksmithSprite = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.BlacksmithSprite');
  GLog = $J.load('com.shatteredpixel.shatteredpixeldungeon.utils.GLog');
  WndBlacksmith = $J.load('com.shatteredpixel.shatteredpixeldungeon.windows.WndBlacksmith');
  WndBlacksmith$WndSmith = $J.load('com.shatteredpixel.shatteredpixeldungeon.windows.WndBlacksmith$WndSmith');
  WndQuest = $J.load('com.shatteredpixel.shatteredpixeldungeon.windows.WndQuest');
  Game = $J.load('com.watabou.noosa.Game');
  Bundle = $J.load('com.watabou.utils.Bundle');
  Random = $J.load('com.watabou.utils.Random');
});
