// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/actors/mobs/npcs/Wandmaker.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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

let Dungeon, Statistics, Char, Char$Property, AscensionChallenge, HeroClass, Elemental$NewbornFireElemental, RotHeart, Generator, Generator$Category, CeremonialCandle, CorpseDust, CorpseDust$DustGhostSpawner, Embers, Notes, Notes$Landmark, RegularLevel, Terrain, MassGraveRoom, RitualSiteRoom, RotGardenRoom, Messages, Rotberry$Seed, GameScene, WandmakerSprite, WndQuest, WndWandmaker, Game, Bundle, PathFinder, Random;

export class Wandmaker extends NPC {
  _Wandmaker(): this {
    this._NPC();
    this.spriteClass = $J.cls(WandmakerSprite);
    this.properties_.add(Char$Property.IMMOVABLE);
    return this;
  }
  landmark(): Notes$Landmark {
    return Notes$Landmark.WANDMAKER;
  }
  act(): boolean {
    if (Dungeon.hero.buff($J.cls(AscensionChallenge)) != null) {
      this.die(null);
      return true;
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
    if (Wandmaker$Quest.given) {
      let item: Item;
      switch (Wandmaker$Quest.type) {
        case 1:
        default:
          item = Dungeon.hero.belongings.getItem($J.cls(CorpseDust));
          break;
        case 2:
          item = Dungeon.hero.belongings.getItem($J.cls(Embers));
          break;
        case 3:
          item = Dungeon.hero.belongings.getItem($J.cls(Rotberry$Seed));
          break;
      }
      if (item != null) {
        Game.runOnRenderThread(new (Wandmaker$1())().$o(this).$c(item));
      } else {
        let msg: string;
        switch (Wandmaker$Quest.type) {
          case 1:
          default:
            msg = Messages.get$Object$String$ObjectArr(this, 'reminder_dust', [Messages.titleCase(Dungeon.hero.name())]);
            break;
          case 2:
            msg = Messages.get$Object$String$ObjectArr(this, 'reminder_ember', [Messages.titleCase(Dungeon.hero.name())]);
            break;
          case 3:
            msg = Messages.get$Object$String$ObjectArr(this, 'reminder_berry', [Messages.titleCase(Dungeon.hero.name())]);
            break;
        }
        Game.runOnRenderThread(new (Wandmaker$2())().$o(this).$c(msg));
      }
    } else {
      let msg1 = '';
      let msg2 = '';
      switch (Dungeon.hero.heroClass) {
        case HeroClass.WARRIOR:
          msg1 += Messages.get$Object$String$ObjectArr(this, 'intro_warrior', []);
          break;
        case HeroClass.ROGUE:
          msg1 += Messages.get$Object$String$ObjectArr(this, 'intro_rogue', []);
          break;
        case HeroClass.MAGE:
          msg1 += Messages.get$Object$String$ObjectArr(this, 'intro_mage', [Messages.titleCase(Dungeon.hero.name())]);
          break;
        case HeroClass.HUNTRESS:
          msg1 += Messages.get$Object$String$ObjectArr(this, 'intro_huntress', []);
          break;
        case HeroClass.DUELIST:
          msg1 += Messages.get$Object$String$ObjectArr(this, 'intro_duelist', []);
          break;
        case HeroClass.CLERIC:
          msg1 += Messages.get$Object$String$ObjectArr(this, 'intro_cleric', []);
          break;
      }
      msg1 += Messages.get$Object$String$ObjectArr(this, 'intro_1', []);
      switch (Wandmaker$Quest.type) {
        case 1:
          msg2 += Messages.get$Object$String$ObjectArr(this, 'intro_dust', []);
          break;
        case 2:
          msg2 += Messages.get$Object$String$ObjectArr(this, 'intro_ember', []);
          break;
        case 3:
          msg2 += Messages.get$Object$String$ObjectArr(this, 'intro_berry', []);
          break;
      }
      msg2 += Messages.get$Object$String$ObjectArr(this, 'intro_2', []);
      let msg1Final = msg1;
      let msg2Final = msg2;
      Game.runOnRenderThread(new (Wandmaker$3())().$o(this).$c(msg1Final, msg2Final));
      Wandmaker$Quest.given = true;
    }
    return true;
  }
}

export class Wandmaker$Quest extends JObject {
  static type: number = 0;
  static spawned: boolean = false;
  static given: boolean = false;
  static wand1: Wand = null;
  static wand2: Wand = null;
  static readonly NODE: string = 'wandmaker';
  static readonly SPAWNED: string = 'spawned';
  static readonly TYPE: string = 'type';
  static readonly GIVEN: string = 'given';
  static readonly WAND1: string = 'wand1';
  static readonly WAND2: string = 'wand2';
  static readonly RITUALPOS: string = 'ritualpos';
  static questRoomSpawned: boolean = false;
  _Wandmaker$Quest(): this {
    return this;
  }
  static reset(): void {
    Wandmaker$Quest.spawned = false;
    Wandmaker$Quest.type = 0;
    Wandmaker$Quest.wand1 = null;
    Wandmaker$Quest.wand2 = null;
  }
  static storeInBundle(bundle: Bundle): void {
    let node = new Bundle()._Bundle$();
    node.put$String$boolean(Wandmaker$Quest.SPAWNED, Wandmaker$Quest.spawned);
    if (Wandmaker$Quest.spawned) {
      node.put$String$int(Wandmaker$Quest.TYPE, Wandmaker$Quest.type);
      node.put$String$boolean(Wandmaker$Quest.GIVEN, Wandmaker$Quest.given);
      node.put$String$Bundlable(Wandmaker$Quest.WAND1, Wandmaker$Quest.wand1);
      node.put$String$Bundlable(Wandmaker$Quest.WAND2, Wandmaker$Quest.wand2);
      if (Wandmaker$Quest.type === 2) {
        node.put$String$int(Wandmaker$Quest.RITUALPOS, CeremonialCandle.ritualPos);
      }
    }
    bundle.put$String$Bundle(Wandmaker$Quest.NODE, node);
  }
  static restoreFromBundle(bundle: Bundle): void {
    let node = bundle.getBundle(Wandmaker$Quest.NODE);
    if (!node.isNull() && (Wandmaker$Quest.spawned = node.getBoolean(Wandmaker$Quest.SPAWNED))) {
      Wandmaker$Quest.type = node.getInt(Wandmaker$Quest.TYPE);
      Wandmaker$Quest.given = node.getBoolean(Wandmaker$Quest.GIVEN);
      Wandmaker$Quest.wand1 = node.get$String(Wandmaker$Quest.WAND1);
      Wandmaker$Quest.wand2 = node.get$String(Wandmaker$Quest.WAND2);
      if (Wandmaker$Quest.type === 2) {
        CeremonialCandle.ritualPos = node.getInt(Wandmaker$Quest.RITUALPOS);
      }
    } else {
      Wandmaker$Quest.reset();
    }
  }
  static spawnWandmaker(level: Level, room: Room): void {
    if (Wandmaker$Quest.questRoomSpawned) {
      Wandmaker$Quest.questRoomSpawned = false;
      let npc = new Wandmaker()._Wandmaker();
      let validPos: boolean;
      let tries = 0;
      let dist = 2;
      do {
        validPos = true;
        if (tries > 30 && dist > 0) {
          tries = 0;
          dist--;
        }
        npc.pos = level.pointToCell(room.random$int(dist));
        if (npc.pos === level.entrance() || level.solid[npc.pos]) {
          validPos = false;
        }
        for (let i of PathFinder.NEIGHBOURS4) {
          if ((level.map_[(npc.pos + i) | 0]) === Terrain.DOOR) {
            validPos = false;
          }
        }
        if (level.traps.get(npc.pos) != null || !level.passable[npc.pos] || level.map_[npc.pos] === Terrain.EMPTY_SP) {
          validPos = false;
        }
        tries++;
      } while (!validPos);
      level.mobs.add(npc);
      Wandmaker$Quest.spawned = true;
      Wandmaker$Quest.given = false;
      Wandmaker$Quest.wand1 = Generator.random$Category(Generator$Category.WAND);
      Wandmaker$Quest.wand1.cursed = false;
      Wandmaker$Quest.wand1.upgrade$();
      Wandmaker$Quest.wand2 = Generator.random$Category(Generator$Category.WAND);
      let toUndo = new ArrayList();
      while (Wandmaker$Quest.wand2.getClass() === Wandmaker$Quest.wand1.getClass()) {
        toUndo.add(Wandmaker$Quest.wand2);
        Wandmaker$Quest.wand2 = Generator.random$Category(Generator$Category.WAND);
      }
      for (const $it0 = toUndo.iterator(); $it0.hasNext(); ) {
        let i = $it0.next();
        Generator.undoDrop$Item(i);
      }
      Wandmaker$Quest.wand2.cursed = false;
      Wandmaker$Quest.wand2.upgrade$();
    }
  }
  static spawnRoom(rooms: ArrayList<Room>): ArrayList<Room> {
    Wandmaker$Quest.questRoomSpawned = false;
    if (!Wandmaker$Quest.spawned && (Wandmaker$Quest.type !== 0 || (Dungeon.depth > 6 && (Random.Int$int((10 - Dungeon.depth) | 0)) === 0))) {
      if (Wandmaker$Quest.type === 0) {
        Wandmaker$Quest.type = (Random.Int$int(3) + 1) | 0;
      }
      switch (Wandmaker$Quest.type) {
        case 1:
        default:
          rooms.add(new MassGraveRoom()._MassGraveRoom());
          break;
        case 2:
          rooms.add(new RitualSiteRoom()._RitualSiteRoom());
          break;
        case 3:
          rooms.add(new RotGardenRoom()._RotGardenRoom());
          break;
      }
      Wandmaker$Quest.questRoomSpawned = true;
    }
    return rooms;
  }
  static active(): boolean {
    if (Wandmaker$Quest.wand1 == null || Wandmaker$Quest.wand2 == null || !(Dungeon.level instanceof RegularLevel) || Dungeon.hero == null) {
      return false;
    }
    if (Wandmaker$Quest.type === 1) {
      if ((Dungeon.level).room$int(Dungeon.hero.pos) instanceof MassGraveRoom) {
        return true;
      }
      for (const $it1 = Dungeon.hero.buffs$().iterator(); $it1.hasNext(); ) {
        let b = $it1.next();
        if (b instanceof CorpseDust$DustGhostSpawner) {
          return true;
        }
      }
      return false;
    } else if (Wandmaker$Quest.type === 2) {
      for (const $it2 = Dungeon.level.mobs.iterator(); $it2.hasNext(); ) {
        let m = $it2.next();
        if (m instanceof Elemental$NewbornFireElemental) {
          return true;
        }
      }
      if ((Dungeon.level).room$int(Dungeon.hero.pos) instanceof RitualSiteRoom) {
        let candles = 0;
        if (Dungeon.hero.belongings.getItem($J.cls(CeremonialCandle)) != null) {
          candles = (candles + Dungeon.hero.belongings.getItem($J.cls(CeremonialCandle)).quantity$()) | 0;
        }
        if (candles >= 4) {
          return true;
        }
        for (const $it3 = Dungeon.level.heaps.valueList().iterator(); $it3.hasNext(); ) {
          let h = $it3.next();
          if ((Dungeon.level).room$int(h.pos) instanceof RitualSiteRoom) {
            for (const $it4 = h.items_.iterator(); $it4.hasNext(); ) {
              let i = $it4.next();
              if (i instanceof CeremonialCandle) {
                candles = (candles + i.quantity$()) | 0;
              }
            }
          }
        }
        if (candles >= 4) {
          return true;
        }
      }
      return false;
    } else {
      if ((Dungeon.level).room$int(Dungeon.hero.pos) instanceof RotGardenRoom) {
        for (const $it5 = Dungeon.level.mobs.iterator(); $it5.hasNext(); ) {
          let m = $it5.next();
          if (m instanceof RotHeart) {
            return true;
          }
        }
      }
      return false;
    }
  }
  static complete(): void {
    Wandmaker$Quest.wand1 = null;
    Wandmaker$Quest.wand2 = null;
    Notes.remove$Landmark(Notes$Landmark.WANDMAKER);
    if (Wandmaker$Quest.type === 1) {
      Statistics.questScores[1] = (Statistics.questScores[1] + 2000) | 0;
    }
  }
}

let $Wandmaker$1: any = null;
/** An anonymous class (Wandmaker.java:128). */
function Wandmaker$1(): any {
  return $Wandmaker$1 ??= $J.local(class extends JObject {
    call(): void {
      GameScene.show(new WndWandmaker()._WndWandmaker(this.$outer, this.$cv_item));
    }
    $c($item): this {
      this.$cv_item = $item;
      return this;
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.actors.mobs.npcs.Wandmaker$1', ['com.watabou.utils.Callback']);
}

let $Wandmaker$2: any = null;
/** An anonymous class (Wandmaker.java:147). */
function Wandmaker$2(): any {
  return $Wandmaker$2 ??= $J.local(class extends JObject {
    call(): void {
      GameScene.show(new WndQuest()._WndQuest(this.$outer, this.$cv_msg));
    }
    $c($msg): this {
      this.$cv_msg = $msg;
      return this;
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.actors.mobs.npcs.Wandmaker$2', ['com.watabou.utils.Callback']);
}

let $Wandmaker$3$1: any = null;
/** An anonymous class (Wandmaker.java:201). */
function Wandmaker$3$1(): any {
  return $Wandmaker$3$1 ??= $J.local(class extends WndQuest {
    hide(): void {
      super.hide();
      GameScene.show(new WndQuest()._WndQuest(this.$outer.$outer, this.$cv_msg2Final));
    }
    $c($msg2Final): this {
      this.$cv_msg2Final = $msg2Final;
      return this;
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.actors.mobs.npcs.Wandmaker$3$1', []);
}

let $Wandmaker$3: any = null;
/** An anonymous class (Wandmaker.java:198). */
function Wandmaker$3(): any {
  return $Wandmaker$3 ??= $J.local(class extends JObject {
    call(): void {
      GameScene.show(new (Wandmaker$3$1())().$o(this).$c(this.$cv_msg2Final)._WndQuest(this.$outer, this.$cv_msg1Final));
    }
    $c($msg1Final, $msg2Final): this {
      this.$cv_msg1Final = $msg1Final; this.$cv_msg2Final = $msg2Final;
      return this;
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.actors.mobs.npcs.Wandmaker$3', ['com.watabou.utils.Callback']);
}

$J.define(Wandmaker, 'com.shatteredpixel.shatteredpixeldungeon.actors.mobs.npcs.Wandmaker', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.actors.mobs.npcs.NPC', ctors: { '': '_Wandmaker' } });
$J.define(Wandmaker$Quest, 'com.shatteredpixel.shatteredpixeldungeon.actors.mobs.npcs.Wandmaker$Quest', { kind: 'class', sup: 'java.lang.Object', ctors: { '': '_Wandmaker$Quest' } });
$J.module(() => {
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  Statistics = $J.load('com.shatteredpixel.shatteredpixeldungeon.Statistics');
  Char = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Char');
  Char$Property = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Char$Property');
  AscensionChallenge = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.AscensionChallenge');
  HeroClass = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.HeroClass');
  Elemental$NewbornFireElemental = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.Elemental$NewbornFireElemental');
  RotHeart = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.RotHeart');
  Generator = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.Generator');
  Generator$Category = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.Generator$Category');
  CeremonialCandle = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.quest.CeremonialCandle');
  CorpseDust = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.quest.CorpseDust');
  CorpseDust$DustGhostSpawner = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.quest.CorpseDust$DustGhostSpawner');
  Embers = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.quest.Embers');
  Notes = $J.load('com.shatteredpixel.shatteredpixeldungeon.journal.Notes');
  Notes$Landmark = $J.load('com.shatteredpixel.shatteredpixeldungeon.journal.Notes$Landmark');
  RegularLevel = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.RegularLevel');
  Terrain = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.Terrain');
  MassGraveRoom = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.rooms.quest.MassGraveRoom');
  RitualSiteRoom = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.rooms.quest.RitualSiteRoom');
  RotGardenRoom = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.rooms.quest.RotGardenRoom');
  Messages = $J.load('com.shatteredpixel.shatteredpixeldungeon.messages.Messages');
  Rotberry$Seed = $J.load('com.shatteredpixel.shatteredpixeldungeon.plants.Rotberry$Seed');
  GameScene = $J.load('com.shatteredpixel.shatteredpixeldungeon.scenes.GameScene');
  WandmakerSprite = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.WandmakerSprite');
  WndQuest = $J.load('com.shatteredpixel.shatteredpixeldungeon.windows.WndQuest');
  WndWandmaker = $J.load('com.shatteredpixel.shatteredpixeldungeon.windows.WndWandmaker');
  Game = $J.load('com.watabou.noosa.Game');
  Bundle = $J.load('com.watabou.utils.Bundle');
  PathFinder = $J.load('com.watabou.utils.PathFinder');
  Random = $J.load('com.watabou.utils.Random');
});
