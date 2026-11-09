// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/actors/mobs/npcs/Ghost.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { $J, JObject } from '../../../../../../../jre/index.ts';
import { NPC } from './NPC.ts';
import { Mob$Wandering } from '../Mob.ts';

let Assets$Sounds, Dungeon, Statistics, Char, Char$Property, AscensionChallenge, FetidRat, GnollTrickster, GreatCrab, Generator, Armor$Glyph, LeatherArmor, MailArmor, PlateArmor, ScaleArmor, ParchmentScrap, Weapon$Enchantment, Notes, Notes$Landmark, Messages, GameScene, GhostSprite, GLog, WndQuest, WndSadGhost, Game, Music, Sample, Bundle, Random;

export class Ghost extends NPC {
  _Ghost(): this {
    this._NPC();
    this.spriteClass = $J.cls(GhostSprite);
    this.flying = true;
    this.WANDERING = new Ghost$Wandering().$o(this)._Ghost$Wandering();
    this.state_ = this.WANDERING;
    this.properties_.add(Char$Property.LARGE);
    return this;
  }
  landmark(): Notes$Landmark {
    return Notes$Landmark.GHOST;
  }
  act(): boolean {
    if (Dungeon.hero.buff($J.cls(AscensionChallenge)) != null) {
      this.die(null);
      Notes.remove$Landmark(this.landmark());
      return true;
    }
    return super.act();
  }
  defenseSkill(enemy: Char): number {
    return Char.INFINITE_EVASION;
  }
  speed(): number {
    return 0.5;
  }
  chooseEnemy(): Char {
    return null;
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
    this.sprite_.turnTo(this.pos, c.pos);
    Sample.INSTANCE.play$Object(Assets$Sounds.GHOST);
    if (c !== Dungeon.hero) {
      return super.interact(c);
    }
    if (Ghost$Quest.given) {
      if (Ghost$Quest.weapon != null) {
        if (Ghost$Quest.processed_) {
          Game.runOnRenderThread(new (Ghost$1())().$o(this));
        } else {
          Game.runOnRenderThread(new (Ghost$2())().$o(this));
        }
      }
    } else {
      let questBoss: Mob;
      let txt_quest: string;
      switch (Ghost$Quest.type) {
        case 1:
        default:
          questBoss = new FetidRat()._FetidRat();
          txt_quest = Messages.get$Object$String$ObjectArr(this, 'rat_1', [Messages.titleCase(Dungeon.hero.name())]);
          break;
        case 2:
          questBoss = new GnollTrickster()._GnollTrickster();
          txt_quest = Messages.get$Object$String$ObjectArr(this, 'gnoll_1', [Messages.titleCase(Dungeon.hero.name())]);
          break;
        case 3:
          questBoss = new GreatCrab()._GreatCrab();
          txt_quest = Messages.get$Object$String$ObjectArr(this, 'crab_1', [Messages.titleCase(Dungeon.hero.name())]);
          break;
      }
      questBoss.pos = Dungeon.level.randomRespawnCell(this);
      if (questBoss.pos !== -1) {
        GameScene.add$Mob(questBoss);
        Ghost$Quest.given = true;
        Game.runOnRenderThread(new (Ghost$3())().$o(this).$c(txt_quest));
      }
    }
    return true;
  }
}

export class Ghost$Wandering extends Mob$Wandering {
  _Ghost$Wandering(): this {
    this._Mob$Wandering();
    return this;
  }
  randomDestination(): number {
    let pos = super.randomDestination();
    if (Dungeon.level.heaps.get(pos) != null || pos === Dungeon.level.exit()) {
      return -1;
    }
    return pos;
  }
}

export class Ghost$Quest extends JObject {
  static spawned: boolean = false;
  static type: number = 0;
  static given: boolean = false;
  static processed_: boolean = false;
  static depth: number = 0;
  static weapon: Weapon = null;
  static armor: Armor = null;
  static enchant: Weapon$Enchantment = null;
  static glyph: Armor$Glyph = null;
  static readonly NODE: string = 'sadGhost';
  static readonly SPAWNED: string = 'spawned';
  static readonly TYPE: string = 'type';
  static readonly GIVEN: string = 'given';
  static readonly PROCESSED: string = 'processed';
  static readonly DEPTH: string = 'depth';
  static readonly WEAPON: string = 'weapon';
  static readonly ARMOR: string = 'armor';
  static readonly ENCHANT: string = 'enchant';
  static readonly GLYPH: string = 'glyph';
  _Ghost$Quest(): this {
    return this;
  }
  static reset(): void {
    Ghost$Quest.spawned = false;
    Ghost$Quest.weapon = null;
    Ghost$Quest.armor = null;
    Ghost$Quest.enchant = null;
    Ghost$Quest.glyph = null;
  }
  static storeInBundle(bundle: Bundle): void {
    let node = new Bundle()._Bundle$();
    node.put$String$boolean(Ghost$Quest.SPAWNED, Ghost$Quest.spawned);
    if (Ghost$Quest.spawned) {
      node.put$String$int(Ghost$Quest.TYPE, Ghost$Quest.type);
      node.put$String$boolean(Ghost$Quest.GIVEN, Ghost$Quest.given);
      node.put$String$int(Ghost$Quest.DEPTH, Ghost$Quest.depth);
      node.put$String$boolean(Ghost$Quest.PROCESSED, Ghost$Quest.processed_);
      node.put$String$Bundlable(Ghost$Quest.WEAPON, Ghost$Quest.weapon);
      node.put$String$Bundlable(Ghost$Quest.ARMOR, Ghost$Quest.armor);
      if (Ghost$Quest.enchant != null) {
        node.put$String$Bundlable(Ghost$Quest.ENCHANT, Ghost$Quest.enchant);
        node.put$String$Bundlable(Ghost$Quest.GLYPH, Ghost$Quest.glyph);
      }
    }
    bundle.put$String$Bundle(Ghost$Quest.NODE, node);
  }
  static restoreFromBundle(bundle: Bundle): void {
    let node = bundle.getBundle(Ghost$Quest.NODE);
    if (!node.isNull() && (Ghost$Quest.spawned = node.getBoolean(Ghost$Quest.SPAWNED))) {
      Ghost$Quest.type = node.getInt(Ghost$Quest.TYPE);
      Ghost$Quest.given = node.getBoolean(Ghost$Quest.GIVEN);
      Ghost$Quest.processed_ = node.getBoolean(Ghost$Quest.PROCESSED);
      Ghost$Quest.depth = node.getInt(Ghost$Quest.DEPTH);
      Ghost$Quest.weapon = node.get$String(Ghost$Quest.WEAPON);
      Ghost$Quest.armor = node.get$String(Ghost$Quest.ARMOR);
      if (node.contains(Ghost$Quest.ENCHANT)) {
        Ghost$Quest.enchant = node.get$String(Ghost$Quest.ENCHANT);
        Ghost$Quest.glyph = node.get$String(Ghost$Quest.GLYPH);
      }
    } else {
      Ghost$Quest.reset();
    }
  }
  static spawn(level: SewerLevel, room: Room): void {
    if (!Ghost$Quest.spawned && Dungeon.depth > 1 && (Random.Int$int((5 - Dungeon.depth) | 0)) === 0) {
      let ghost = new Ghost()._Ghost();
      do {
        ghost.pos = level.pointToCell(room.random$());
      } while (ghost.pos === -1 || level.solid[ghost.pos] || !level.openSpace[ghost.pos] || ghost.pos === level.exit());
      level.mobs.add(ghost);
      Ghost$Quest.spawned = true;
      Ghost$Quest.type = (Dungeon.depth - 1) | 0;
      Ghost$Quest.given = false;
      Ghost$Quest.processed_ = false;
      Ghost$Quest.depth = Dungeon.depth;
      switch (Random.chances$floatArr([0, 0, 10, 6, 3, 1])) {
        default:
        case 2:
          Ghost$Quest.armor = new LeatherArmor()._LeatherArmor();
          break;
        case 3:
          Ghost$Quest.armor = new MailArmor()._MailArmor();
          break;
        case 4:
          Ghost$Quest.armor = new ScaleArmor()._ScaleArmor();
          break;
        case 5:
          Ghost$Quest.armor = new PlateArmor()._PlateArmor();
          break;
      }
      let wepTier = Random.chances$floatArr([0, 0, 10, 6, 3, 1]);
      Ghost$Quest.weapon = Generator.random$Category(Generator.wepTiers[(wepTier - 1) | 0]);
      Ghost$Quest.weapon.level$int(0);
      Ghost$Quest.weapon.enchant$Enchantment(null);
      Ghost$Quest.weapon.cursed = false;
      let itemLevelRoll = Random.Float$();
      let itemLevel: number;
      if (itemLevelRoll < 0.5) {
        itemLevel = 0;
      } else if (itemLevelRoll < Math.fround(0.8)) {
        itemLevel = 1;
      } else if (itemLevelRoll < Math.fround(0.95)) {
        itemLevel = 2;
      } else {
        itemLevel = 3;
      }
      Ghost$Quest.weapon.upgrade$int(itemLevel);
      Ghost$Quest.armor.upgrade$int(itemLevel);
      Ghost$Quest.enchant = Weapon$Enchantment.random([]);
      Ghost$Quest.glyph = Armor$Glyph.random([]);
      let enchantRoll = Random.Float$();
      if (enchantRoll > Math.fround(Math.fround(0.2) * ParchmentScrap.enchantChanceMultiplier$())) {
        Ghost$Quest.enchant = null;
        Ghost$Quest.glyph = null;
      }
    }
  }
  static process(): void {
    if (Ghost$Quest.spawned && Ghost$Quest.given && !Ghost$Quest.processed_ && (Ghost$Quest.depth === Dungeon.depth)) {
      GLog.n(Messages.get$Class$String$ObjectArr($J.cls(Ghost), 'find_me', []), []);
      Sample.INSTANCE.play$Object(Assets$Sounds.GHOST);
      Ghost$Quest.processed_ = true;
      Statistics.questScores[0] = (Statistics.questScores[0] + 1000) | 0;
      Game.runOnRenderThread(new (Ghost$Quest$1())());
    }
  }
  static active(): boolean {
    return Ghost$Quest.spawned && Ghost$Quest.given && !Ghost$Quest.processed_ && Ghost$Quest.depth === Dungeon.depth;
  }
  static complete(): void {
    Ghost$Quest.weapon = null;
    Ghost$Quest.armor = null;
    Notes.remove$Landmark(Notes$Landmark.GHOST);
  }
  static processed(): boolean {
    return Ghost$Quest.spawned && Ghost$Quest.processed_;
  }
  static completed(): boolean {
    return Ghost$Quest.processed() && Ghost$Quest.weapon == null && Ghost$Quest.armor == null;
  }
}

let $Ghost$1: any = null;
/** An anonymous class (Ghost.java:142). */
function Ghost$1(): any {
  return $Ghost$1 ??= $J.local(class extends JObject {
    call(): void {
      GameScene.show(new WndSadGhost()._WndSadGhost(this.$outer, Ghost$Quest.type));
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.actors.mobs.npcs.Ghost$1', ['com.watabou.utils.Callback']);
}

let $Ghost$2: any = null;
/** An anonymous class (Ghost.java:149). */
function Ghost$2(): any {
  return $Ghost$2 ??= $J.local(class extends JObject {
    call(): void {
      switch (Ghost$Quest.type) {
        case 1:
        default:
          GameScene.show(new WndQuest()._WndQuest(this.$outer, Messages.get$Object$String$ObjectArr(this.$outer, 'rat_2', [])));
          break;
        case 2:
          GameScene.show(new WndQuest()._WndQuest(this.$outer, Messages.get$Object$String$ObjectArr(this.$outer, 'gnoll_2', [])));
          break;
        case 3:
          GameScene.show(new WndQuest()._WndQuest(this.$outer, Messages.get$Object$String$ObjectArr(this.$outer, 'crab_2', [])));
          break;
      }
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.actors.mobs.npcs.Ghost$2', ['com.watabou.utils.Callback']);
}

let $Ghost$3$1$1: any = null;
/** An anonymous class (Ghost.java:197). */
function Ghost$3$1$1(): any {
  return $Ghost$3$1$1 ??= $J.local(class extends JObject {
    call(): void {
      if (Dungeon.level != null) {
        Dungeon.level.playLevelMusic();
      }
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.actors.mobs.npcs.Ghost$3$1$1', ['com.watabou.utils.Callback']);
}

let $Ghost$3$1: any = null;
/** An anonymous class (Ghost.java:193). */
function Ghost$3$1(): any {
  return $Ghost$3$1 ??= $J.local(class extends WndQuest {
    hide(): void {
      super.hide();
      Music.INSTANCE.fadeOut(1, new (Ghost$3$1$1())().$o(this));
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.actors.mobs.npcs.Ghost$3$1', []);
}

let $Ghost$3: any = null;
/** An anonymous class (Ghost.java:190). */
function Ghost$3(): any {
  return $Ghost$3 ??= $J.local(class extends JObject {
    call(): void {
      GameScene.show(new (Ghost$3$1())().$o(this)._WndQuest(this.$outer, this.$cv_txt_quest));
    }
    $c($txt_quest): this {
      this.$cv_txt_quest = $txt_quest;
      return this;
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.actors.mobs.npcs.Ghost$3', ['com.watabou.utils.Callback']);
}

let $Ghost$Quest$1$1: any = null;
/** An anonymous class (Ghost.java:377). */
function Ghost$Quest$1$1(): any {
  return $Ghost$Quest$1$1 ??= $J.local(class extends JObject {
    call(): void {
      if (Dungeon.level != null) {
        Dungeon.level.playLevelMusic();
      }
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.actors.mobs.npcs.Ghost$Quest$1$1', ['com.watabou.utils.Callback']);
}

let $Ghost$Quest$1: any = null;
/** An anonymous class (Ghost.java:374). */
function Ghost$Quest$1(): any {
  return $Ghost$Quest$1 ??= $J.local(class extends JObject {
    call(): void {
      Music.INSTANCE.fadeOut(1, new (Ghost$Quest$1$1())().$o(this));
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.actors.mobs.npcs.Ghost$Quest$1', ['com.watabou.utils.Callback']);
}

$J.define(Ghost, 'com.shatteredpixel.shatteredpixeldungeon.actors.mobs.npcs.Ghost', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.actors.mobs.npcs.NPC', ctors: { '': '_Ghost' } });
$J.define(Ghost$Wandering, 'com.shatteredpixel.shatteredpixeldungeon.actors.mobs.npcs.Ghost$Wandering', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.actors.mobs.Mob$Wandering', ctors: { '': '_Ghost$Wandering' }, inner: true });
$J.define(Ghost$Quest, 'com.shatteredpixel.shatteredpixeldungeon.actors.mobs.npcs.Ghost$Quest', { kind: 'class', sup: 'java.lang.Object', ctors: { '': '_Ghost$Quest' } });
$J.module(() => {
  Assets$Sounds = $J.load('com.shatteredpixel.shatteredpixeldungeon.Assets$Sounds');
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  Statistics = $J.load('com.shatteredpixel.shatteredpixeldungeon.Statistics');
  Char = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Char');
  Char$Property = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Char$Property');
  AscensionChallenge = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.AscensionChallenge');
  FetidRat = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.FetidRat');
  GnollTrickster = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.GnollTrickster');
  GreatCrab = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.GreatCrab');
  Generator = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.Generator');
  Armor$Glyph = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.armor.Armor$Glyph');
  LeatherArmor = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.armor.LeatherArmor');
  MailArmor = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.armor.MailArmor');
  PlateArmor = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.armor.PlateArmor');
  ScaleArmor = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.armor.ScaleArmor');
  ParchmentScrap = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.trinkets.ParchmentScrap');
  Weapon$Enchantment = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.weapon.Weapon$Enchantment');
  Notes = $J.load('com.shatteredpixel.shatteredpixeldungeon.journal.Notes');
  Notes$Landmark = $J.load('com.shatteredpixel.shatteredpixeldungeon.journal.Notes$Landmark');
  Messages = $J.load('com.shatteredpixel.shatteredpixeldungeon.messages.Messages');
  GameScene = $J.load('com.shatteredpixel.shatteredpixeldungeon.scenes.GameScene');
  GhostSprite = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.GhostSprite');
  GLog = $J.load('com.shatteredpixel.shatteredpixeldungeon.utils.GLog');
  WndQuest = $J.load('com.shatteredpixel.shatteredpixeldungeon.windows.WndQuest');
  WndSadGhost = $J.load('com.shatteredpixel.shatteredpixeldungeon.windows.WndSadGhost');
  Game = $J.load('com.watabou.noosa.Game');
  Music = $J.load('com.watabou.noosa.audio.Music');
  Sample = $J.load('com.watabou.noosa.audio.Sample');
  Bundle = $J.load('com.watabou.utils.Bundle');
  Random = $J.load('com.watabou.utils.Random');
});
