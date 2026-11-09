// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/actors/mobs/npcs/Imp.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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

let Dungeon, Statistics, Char, Char$Property, AscensionChallenge, Golem, Monk, Generator, Generator$Category, PlateArmor, DwarfToken, Notes, Notes$Landmark, AmbitiousImpRoom, Messages, GameScene, ImpSprite, WndImpOld, WndQuest, Game, Bundle, Random;

export class Imp extends NPC {
  seenBefore: boolean = false;
  _Imp(): this {
    this._NPC();
    this.spriteClass = $J.cls(ImpSprite);
    this.properties_.add(Char$Property.IMMOVABLE);
    this.seenBefore = false;
    return this;
  }
  landmark(): Notes$Landmark {
    return Imp$Quest.isCompleted() ? null : Notes$Landmark.IMP;
  }
  act(): boolean {
    if (Dungeon.hero.buff($J.cls(AscensionChallenge)) != null) {
      this.die(null);
      return true;
    }
    if (Imp$Quest.isCompleted() && Imp$Quest.reward != null) {
      Dungeon.level.drop(Imp$Quest.reward, this.pos);
      this.throwItems();
      Imp$Quest.reward = null;
    }
    if (Imp$Quest.isCompleted() && Imp$Quest.score > 2000 && this.fieldOfView != null && !this.fieldOfView[Dungeon.hero.pos]) {
      this.flee();
    } else if (!Imp$Quest.given_ && Dungeon.level.visited[this.pos]) {
      if (!this.seenBefore && Dungeon.level.heroFOV[this.pos]) {
        this.yell(Messages.get$Object$String$ObjectArr(this, 'hey', [Messages.titleCase(Dungeon.hero.name())]));
        this.seenBefore = true;
      }
    } else {
      this.seenBefore = false;
    }
    return super.act();
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
  interact(c: Char): boolean {
    this.sprite_.turnTo(this.pos, Dungeon.hero.pos);
    if (c !== Dungeon.hero) {
      return true;
    }
    if (Imp$Quest.oldQuest) {
      if (Imp$Quest.given_) {
        let tokens = Dungeon.hero.belongings.getItem($J.cls(DwarfToken));
        if (tokens != null && (tokens.quantity$() >= 5 || (!Imp$Quest.alternative && tokens.quantity$() >= 4))) {
          Game.runOnRenderThread(new (Imp$1())().$o(this).$c(tokens));
        } else {
          this.tell(Imp$Quest.alternative ? Messages.get$Object$String$ObjectArr(this, 'old_monks_2', [Messages.titleCase(Dungeon.hero.name())]) : Messages.get$Object$String$ObjectArr(this, 'old_golems_2', [Messages.titleCase(Dungeon.hero.name())]));
        }
      } else {
        this.tell(Messages.get$Object$String$ObjectArr(this, 'old_intro', []) + '\n\n' + (Imp$Quest.alternative ? Messages.get$Object$String$ObjectArr(this, 'old_monks_1', [Messages.titleCase(Dungeon.hero.name())]) : Messages.get$Object$String$ObjectArr(this, 'old_golems_1', [Messages.titleCase(Dungeon.hero.name())])));
        Imp$Quest.given_ = true;
        Imp$Quest.completed = false;
      }
    } else {
      if (!Imp$Quest.given()) {
        Game.runOnRenderThread(new (Imp$2())().$o(this));
      } else if (!Imp$Quest.isCompleted()) {
        this.tell(Messages.get$Object$String$ObjectArr(this, 'quest_in_progress', []));
      } else {
        if (Imp$Quest.score <= 2000) {
          this.tell(Messages.get$Object$String$ObjectArr(this, 'quest_completed_bad', []));
        } else if (Imp$Quest.score < 4000) {
          this.tell(Messages.get$Object$String$ObjectArr(this, 'quest_completed_good', []));
        } else {
          this.tell(Messages.get$Object$String$ObjectArr(this, 'quest_completed_great', []));
        }
      }
    }
    return true;
  }
  tell(text: string): void {
    Game.runOnRenderThread(new (Imp$3())().$o(this).$c(text));
  }
  flee(): void {
    this.yell(Messages.get$Object$String$ObjectArr(this, 'cya', [Messages.titleCase(Dungeon.hero.name())]));
    this.destroy();
    this.sprite_.die();
  }
}

export class Imp$Quest extends JObject {
  static spawned: boolean = false;
  static oldQuest: boolean = false;
  static alternative: boolean = false;
  static given_: boolean = false;
  static completed: boolean = false;
  static reward: Item = null;
  static rewardOptions: ArrayList<Item> = null;
  static hazardFreebies: number = 0;
  static mirrorUsed: boolean = false;
  static score: number = 0;
  static readonly NODE: string = 'demon';
  static readonly SPAWNED: string = 'spawned';
  static readonly OLD_QUEST: string = 'old_quest';
  static readonly ALTERNATIVE: string = 'alternative';
  static readonly REWARD: string = 'reward';
  static readonly GIVEN: string = 'given';
  static readonly COMPLETED: string = 'completed';
  static readonly HAZRD_FREEBIES: string = 'hazard_freebies';
  static readonly SCORE: string = 'score';
  static readonly REWARD_OPTIONS: string = 'reward_options';
  static readonly MIRROR_USED: string = 'mirror_used';
  _Imp$Quest(): this {
    return this;
  }
  static reset(): void {
    Imp$Quest.spawned = false;
    Imp$Quest.given_ = false;
    Imp$Quest.completed = false;
    Imp$Quest.reward = null;
    Imp$Quest.hazardFreebies = 2;
    Imp$Quest.mirrorUsed = false;
    Imp$Quest.score = 0;
  }
  static storeInBundle(bundle: Bundle): void {
    let node = new Bundle()._Bundle$();
    node.put$String$boolean(Imp$Quest.SPAWNED, Imp$Quest.spawned);
    if (Imp$Quest.spawned) {
      node.put$String$boolean(Imp$Quest.OLD_QUEST, Imp$Quest.oldQuest);
      node.put$String$boolean(Imp$Quest.ALTERNATIVE, Imp$Quest.alternative);
      node.put$String$boolean(Imp$Quest.GIVEN, Imp$Quest.given_);
      node.put$String$boolean(Imp$Quest.COMPLETED, Imp$Quest.completed);
      node.put$String$Bundlable(Imp$Quest.REWARD, Imp$Quest.reward);
      node.put$String$int(Imp$Quest.HAZRD_FREEBIES, Imp$Quest.hazardFreebies);
      node.put$String$int(Imp$Quest.SCORE, Imp$Quest.score);
      node.put$String$Collection(Imp$Quest.REWARD_OPTIONS, Imp$Quest.rewardOptions);
      node.put$String$boolean(Imp$Quest.MIRROR_USED, Imp$Quest.mirrorUsed);
    }
    bundle.put$String$Bundle(Imp$Quest.NODE, node);
  }
  static restoreFromBundle(bundle: Bundle): void {
    let node = bundle.getBundle(Imp$Quest.NODE);
    if (!node.isNull() && (Imp$Quest.spawned = node.getBoolean(Imp$Quest.SPAWNED))) {
      if (node.contains(Imp$Quest.OLD_QUEST)) {
        Imp$Quest.oldQuest = node.getBoolean(Imp$Quest.OLD_QUEST);
      } else {
        Imp$Quest.oldQuest = true;
      }
      if (Imp$Quest.oldQuest) {
        Imp$Quest.alternative = node.getBoolean(Imp$Quest.ALTERNATIVE);
        Imp$Quest.score = 0;
        Imp$Quest.rewardOptions.clear();
        Imp$Quest.mirrorUsed = false;
      } else {
        Imp$Quest.alternative = false;
        Imp$Quest.hazardFreebies = node.getInt(Imp$Quest.HAZRD_FREEBIES);
        Imp$Quest.mirrorUsed = node.getBoolean(Imp$Quest.MIRROR_USED);
        Imp$Quest.score = node.getInt(Imp$Quest.SCORE);
        Imp$Quest.rewardOptions = new ArrayList(node.getCollection(Imp$Quest.REWARD_OPTIONS));
      }
      Imp$Quest.reward = node.get$String(Imp$Quest.REWARD);
      Imp$Quest.given_ = node.getBoolean(Imp$Quest.GIVEN);
      Imp$Quest.completed = node.getBoolean(Imp$Quest.COMPLETED);
    }
  }
  static spawn(rooms: ArrayList<Room>): ArrayList<Room> {
    if (!Imp$Quest.spawned && Dungeon.depth > 16 && (Random.Int$int((20 - Dungeon.depth) | 0)) === 0) {
      rooms.add(new AmbitiousImpRoom()._AmbitiousImpRoom());
      Imp$Quest.spawned = true;
      Imp$Quest.oldQuest = false;
      Imp$Quest.reward = null;
      Imp$Quest.score = 0;
      Imp$Quest.given_ = false;
      Imp$Quest.mirrorUsed = false;
      Imp$Quest.rewardOptions.clear();
      let artif = Generator.randomArtifact();
      if (artif != null) {
        (artif.identify$boolean(false)).transferUpgrade(5);
      } else {
        artif = Generator.random$Category(Generator$Category.RING);
        artif.level$int(Random.IntRange(2, 4));
      }
      Imp$Quest.rewardOptions.add(artif);
      let ring: Item;
      do {
        ring = Generator.random$Category(Generator$Category.RING);
      } while (ring.getClass() === artif.getClass());
      ring.level$int(Random.IntRange(2, 4));
      Imp$Quest.rewardOptions.add(ring);
      if (Random.Int$int(2) === 0) {
        Imp$Quest.rewardOptions.add((Generator.random$Category(Generator$Category.WEP_T5)).enchant$().identify$boolean(false).level$int(Random.IntRange(2, 4)));
        Imp$Quest.rewardOptions.add((Generator.random$Category(Generator$Category.MIS_T4)).enchant$().identify$boolean(false).level$int(Random.IntRange(3, 5)));
      } else {
        Imp$Quest.rewardOptions.add((Generator.random$Category(Generator$Category.MIS_T5)).enchant$().identify$boolean(false).level$int(Random.IntRange(2, 4)));
        Imp$Quest.rewardOptions.add((Generator.random$Category(Generator$Category.WEP_T4)).enchant$().identify$boolean(false).level$int(Random.IntRange(3, 5)));
      }
      Imp$Quest.rewardOptions.add(new PlateArmor()._PlateArmor().inscribe$().identify$boolean(false).level$int(Random.IntRange(2, 4)));
      let w = Generator.random$Category(Generator$Category.WAND);
      w.identify$boolean(false).level$int(Random.IntRange(2, 4));
      w.curCharges = w.maxCharges;
      Imp$Quest.rewardOptions.add(w);
      for (const $it0 = Imp$Quest.rewardOptions.iterator(); $it0.hasNext(); ) {
        let i = $it0.next();
        i.cursed = false;
      }
    }
    return rooms;
  }
  static given(): boolean {
    return Imp$Quest.given_;
  }
  static isOld(): boolean {
    return Imp$Quest.oldQuest;
  }
  static oldProcess(mob: Mob): void {
    if (Imp$Quest.spawned && Imp$Quest.oldQuest && Imp$Quest.given_ && !Imp$Quest.completed && Dungeon.depth !== 20) {
      if ((Imp$Quest.alternative && mob instanceof Monk) || (!Imp$Quest.alternative && mob instanceof Golem)) {
        Dungeon.level.drop(new DwarfToken()._DwarfToken(), mob.pos).sprite_.drop$();
      }
    }
  }
  static oldComplete(): void {
    Imp$Quest.reward = null;
    Imp$Quest.completed = true;
    Statistics.questScores[3] = 4000;
    Notes.remove$Landmark(Notes$Landmark.IMP);
  }
  static complete(score: number): void {
    Imp$Quest.completed = true;
    Imp$Quest.score = score;
    Statistics.questScores[3] = (Statistics.questScores[3] + score) | 0;
    Notes.remove$Landmark(Notes$Landmark.IMP);
  }
  static isCompleted(): boolean {
    return Imp$Quest.spawned && Imp$Quest.completed;
  }
  static earnedShop(): boolean {
    return Imp$Quest.completed && (Imp$Quest.oldQuest || Imp$Quest.score > 2000);
  }
  static $clinit() {
    Imp$Quest.oldQuest = false;
    Imp$Quest.rewardOptions = new ArrayList();
    Imp$Quest.mirrorUsed = false;
  }
}

let $Imp$1: any = null;
/** An anonymous class (Imp.java:134). */
function Imp$1(): any {
  return $Imp$1 ??= $J.local(class extends JObject {
    call(): void {
      GameScene.show(new WndImpOld()._WndImpOld(this.$outer, this.$cv_tokens));
    }
    $c($tokens): this {
      this.$cv_tokens = $tokens;
      return this;
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.actors.mobs.npcs.Imp$1', ['com.watabou.utils.Callback']);
}

let $Imp$2$1: any = null;
/** An anonymous class (Imp.java:158). */
function Imp$2$1(): any {
  return $Imp$2$1 ??= $J.local(class extends WndQuest {
    hide(): void {
      super.hide();
      Imp$Quest.given_ = true;
      Imp$Quest.completed = false;
      this.$outer.$outer.tell(Messages.get$Object$String$ObjectArr(this.$outer.$outer, 'quest_intro_2', []));
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.actors.mobs.npcs.Imp$2$1', []);
}

let $Imp$2: any = null;
/** An anonymous class (Imp.java:155). */
function Imp$2(): any {
  return $Imp$2 ??= $J.local(class extends JObject {
    call(): void {
      GameScene.show(new (Imp$2$1())().$o(this)._WndQuest(this.$outer, Messages.get$Object$String$ObjectArr(this.$outer, 'quest_intro_1', [])));
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.actors.mobs.npcs.Imp$2', ['com.watabou.utils.Callback']);
}

let $Imp$3: any = null;
/** An anonymous class (Imp.java:188). */
function Imp$3(): any {
  return $Imp$3 ??= $J.local(class extends JObject {
    call(): void {
      GameScene.show(new WndQuest()._WndQuest(this.$outer, this.$cv_text));
    }
    $c($text): this {
      this.$cv_text = $text;
      return this;
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.actors.mobs.npcs.Imp$3', ['com.watabou.utils.Callback']);
}

$J.define(Imp, 'com.shatteredpixel.shatteredpixeldungeon.actors.mobs.npcs.Imp', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.actors.mobs.npcs.NPC', ctors: { '': '_Imp' } });
$J.define(Imp$Quest, 'com.shatteredpixel.shatteredpixeldungeon.actors.mobs.npcs.Imp$Quest', { kind: 'class', sup: 'java.lang.Object', ctors: { '': '_Imp$Quest' }, clinit: true, lazy: ['spawned', 'oldQuest', 'alternative', 'given_', 'completed', 'reward', 'rewardOptions', 'hazardFreebies', 'mirrorUsed', 'score'] });
$J.module(() => {
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  Statistics = $J.load('com.shatteredpixel.shatteredpixeldungeon.Statistics');
  Char = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Char');
  Char$Property = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Char$Property');
  AscensionChallenge = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.AscensionChallenge');
  Golem = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.Golem');
  Monk = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.Monk');
  Generator = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.Generator');
  Generator$Category = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.Generator$Category');
  PlateArmor = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.armor.PlateArmor');
  DwarfToken = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.quest.DwarfToken');
  Notes = $J.load('com.shatteredpixel.shatteredpixeldungeon.journal.Notes');
  Notes$Landmark = $J.load('com.shatteredpixel.shatteredpixeldungeon.journal.Notes$Landmark');
  AmbitiousImpRoom = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.rooms.quest.AmbitiousImpRoom');
  Messages = $J.load('com.shatteredpixel.shatteredpixeldungeon.messages.Messages');
  GameScene = $J.load('com.shatteredpixel.shatteredpixeldungeon.scenes.GameScene');
  ImpSprite = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.ImpSprite');
  WndImpOld = $J.load('com.shatteredpixel.shatteredpixeldungeon.windows.WndImpOld');
  WndQuest = $J.load('com.shatteredpixel.shatteredpixeldungeon.windows.WndQuest');
  Game = $J.load('com.watabou.noosa.Game');
  Bundle = $J.load('com.watabou.utils.Bundle');
  Random = $J.load('com.watabou.utils.Random');
});
