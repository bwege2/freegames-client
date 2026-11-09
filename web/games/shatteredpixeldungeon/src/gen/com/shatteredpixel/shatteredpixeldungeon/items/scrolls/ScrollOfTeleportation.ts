// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/items/scrolls/ScrollOfTeleportation.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { $J, ArrayList } from '../../../../../../jre/index.ts';
import { Scroll } from './Scroll.ts';

let Assets$Sounds, Dungeon, Actor, Char, Char$Property, Buff, Roots, CellEmitter, Speck, Item, ScrollOfMagicMapping, RegularLevel, Terrain, VaultTreasureRoom, SecretRoom, SpecialRoom, Messages, GameScene, ItemSpriteSheet$Icons, GLog, Camera, Sample, AlphaTweener, BArray, PathFinder, Random;

export class ScrollOfTeleportation extends Scroll {
  _ScrollOfTeleportation(): this {
    this._Scroll();
    this.icon_ = ItemSpriteSheet$Icons.SCROLL_TELEPORT;
    return this;
  }
  doRead(): void {
    this.detach(Item.curUser.belongings.backpack);
    Sample.INSTANCE.play$Object(Assets$Sounds.READ);
    if (ScrollOfTeleportation.teleportPreferringUnseen(Item.curUser)) {
      this.readAnimation();
    }
    this.identify$();
  }
  static teleportToLocation(ch: Char, pos: number): boolean {
    PathFinder.buildDistanceMap$int$booleanArr(pos, BArray.or$booleanArr$booleanArr$booleanArr(Dungeon.level.passable, Dungeon.level.avoid, null));
    if (PathFinder.distance[ch.pos] === 2147483647 || (!Dungeon.level.passable[pos] && !Dungeon.level.avoid[pos]) || (Actor.findChar(pos) != null && Actor.findChar(pos) !== ch)) {
      if (ch === Dungeon.hero) {
        GLog.w(Messages.get$Class$String$ObjectArr($J.cls(ScrollOfTeleportation), 'cant_reach', []), []);
      }
      return false;
    }
    ScrollOfTeleportation.appear(ch, pos);
    Dungeon.level.occupyCell(ch);
    Buff.detach(ch, $J.cls(Roots));
    if (ch === Dungeon.hero) {
      Dungeon.observe$();
      GameScene.updateFog$();
    }
    return true;
  }
  static teleportChar$Char(ch: Char): boolean {
    return ScrollOfTeleportation.teleportChar$Char$Class(ch, $J.cls(ScrollOfTeleportation));
  }
  static teleportChar$Char$Class(ch: Char, source: JClass): boolean {
    if (!(Dungeon.level instanceof RegularLevel) || Dungeon.level.locked) {
      return ScrollOfTeleportation.teleportInNonRegularLevel(ch, false);
    }
    if (Char.hasProp(ch, Char$Property.IMMOVABLE) || ch.isImmune(source)) {
      GLog.w(Messages.get$Class$String$ObjectArr($J.cls(ScrollOfTeleportation), 'no_tele', []), []);
      return false;
    }
    let count = 20;
    let pos: number;
    do {
      pos = Dungeon.level.randomRespawnCell(ch);
      if (count-- <= 0) {
        break;
      }
    } while (pos === -1 || Dungeon.level.secret[pos]);
    if (pos === -1) {
      GLog.w(Messages.get$Class$String$ObjectArr($J.cls(ScrollOfTeleportation), 'no_tele', []), []);
      return false;
    } else {
      ScrollOfTeleportation.appear(ch, pos);
      Dungeon.level.occupyCell(ch);
      Buff.detach(ch, $J.cls(Roots));
      if (ch === Dungeon.hero) {
        GLog.i(Messages.get$Class$String$ObjectArr($J.cls(ScrollOfTeleportation), 'tele', []), []);
        Dungeon.observe$();
        GameScene.updateFog$();
        Dungeon.hero.interrupt();
      }
      return true;
    }
  }
  static teleportPreferringUnseen(hero: Hero): boolean {
    if (!(Dungeon.level instanceof RegularLevel) || Dungeon.level.locked) {
      return ScrollOfTeleportation.teleportInNonRegularLevel(hero, true);
    }
    let level = Dungeon.level;
    let candidates = new ArrayList();
    for (const $it0 = level.rooms().iterator(); $it0.hasNext(); ) {
      let r = $it0.next();
      if (r instanceof SpecialRoom || r instanceof VaultTreasureRoom) {
        let terr: number;
        let locked = false;
        for (const $it1 = r.getPoints().iterator(); $it1.hasNext(); ) {
          let p = $it1.next();
          terr = level.map_[level.pointToCell(p)];
          if (terr === Terrain.LOCKED_DOOR || terr === Terrain.CRYSTAL_DOOR || terr === Terrain.BARRICADE) {
            locked = true;
            break;
          }
        }
        if (locked) {
          continue;
        }
      }
      let cell: number;
      for (const $it2 = r.charPlaceablePoints(level).iterator(); $it2.hasNext(); ) {
        let p = $it2.next();
        cell = level.pointToCell(p);
        if (level.passable[cell] && !level.visited[cell] && !level.secret[cell] && Actor.findChar(cell) == null) {
          candidates.add(cell);
        }
      }
    }
    if (candidates.isEmpty()) {
      return ScrollOfTeleportation.teleportChar$Char(hero);
    } else {
      let pos = Random.element$Collection(candidates);
      let secretDoor = false;
      let doorPos = -1;
      let room = level.room$int(pos);
      if (room instanceof SpecialRoom || room instanceof VaultTreasureRoom) {
        let entrance = null;
        if (room instanceof SpecialRoom) {
          entrance = (room).entrance();
        }
        if (room instanceof VaultTreasureRoom) {
          entrance = (room).entrance();
        }
        if (entrance != null) {
          doorPos = level.pointToCell(entrance);
          for (let i of PathFinder.NEIGHBOURS8) {
            if (!room.inside$Point(level.cellToPoint((doorPos + i) | 0)) && level.passable[(doorPos + i) | 0] && (Actor.findChar((doorPos + i) | 0)) == null) {
              secretDoor = room instanceof SecretRoom;
              pos = (doorPos + i) | 0;
              break;
            }
          }
        }
      }
      GLog.i(Messages.get$Class$String$ObjectArr($J.cls(ScrollOfTeleportation), 'tele', []), []);
      ScrollOfTeleportation.appear(hero, pos);
      Dungeon.level.occupyCell(hero);
      Buff.detach(hero, $J.cls(Roots));
      if (secretDoor && level.map_[doorPos] === Terrain.SECRET_DOOR) {
        Sample.INSTANCE.play$Object(Assets$Sounds.SECRET);
        let oldValue = Dungeon.level.map_[doorPos];
        GameScene.discoverTile(doorPos, oldValue);
        Dungeon.level.discover(doorPos);
        ScrollOfMagicMapping.discover(doorPos);
      }
      Dungeon.observe$();
      GameScene.updateFog$();
      return true;
    }
  }
  static teleportInNonRegularLevel(ch: Char, preferNotSeen: boolean): boolean {
    if (Char.hasProp(ch, Char$Property.IMMOVABLE)) {
      GLog.w(Messages.get$Class$String$ObjectArr($J.cls(ScrollOfTeleportation), 'no_tele', []), []);
      return false;
    }
    let visibleValid = new ArrayList();
    let notVisibleValid = new ArrayList();
    let notSeenValid = new ArrayList();
    let passable = Dungeon.level.passable;
    if (Char.hasProp(ch, Char$Property.LARGE)) {
      passable = BArray.and(passable, Dungeon.level.openSpace, null);
    }
    PathFinder.buildDistanceMap$int$booleanArr(ch.pos, passable);
    for (let i = 0; i < Dungeon.level.length(); i++) {
      if (PathFinder.distance[i] < 2147483647 && !Dungeon.level.secret[i] && Actor.findChar(i) == null) {
        if (preferNotSeen && !Dungeon.level.visited[i]) {
          notSeenValid.add(i);
        } else if (Dungeon.level.heroFOV[i]) {
          visibleValid.add(i);
        } else {
          notVisibleValid.add(i);
        }
      }
    }
    let pos: number;
    if (!notSeenValid.isEmpty()) {
      pos = Random.element$Collection(notSeenValid);
    } else if (!notVisibleValid.isEmpty()) {
      pos = Random.element$Collection(notVisibleValid);
    } else if (!visibleValid.isEmpty()) {
      pos = Random.element$Collection(visibleValid);
    } else {
      GLog.w(Messages.get$Class$String$ObjectArr($J.cls(ScrollOfTeleportation), 'no_tele', []), []);
      return false;
    }
    ScrollOfTeleportation.appear(ch, pos);
    Dungeon.level.occupyCell(ch);
    Buff.detach(ch, $J.cls(Roots));
    if (ch === Dungeon.hero) {
      GLog.i(Messages.get$Class$String$ObjectArr($J.cls(ScrollOfTeleportation), 'tele', []), []);
      Dungeon.observe$();
      GameScene.updateFog$();
      Dungeon.hero.interrupt();
    }
    return true;
  }
  static appear(ch: Char, pos: number): void {
    ch.sprite_.interruptMotion();
    if (Dungeon.level.heroFOV[pos] || Dungeon.level.heroFOV[ch.pos]) {
      Sample.INSTANCE.play$Object(Assets$Sounds.TELEPORT);
    }
    if (Dungeon.level.heroFOV[ch.pos] && ch !== Dungeon.hero) {
      CellEmitter.get(ch.pos).start(Speck.factory$int(Speck.LIGHT), Math.fround(0.2), 3);
    }
    ch.move$int$boolean(pos, false);
    if (ch.pos === pos) {
      ch.sprite_.interruptMotion();
      ch.sprite_.place(pos);
    }
    if (ch.invisible === 0) {
      ch.sprite_.alpha$float(0);
      ch.sprite_.parent.add$Gizmo(new AlphaTweener()._AlphaTweener(ch.sprite_, 1, Math.fround(0.4)));
    }
    if (Dungeon.level.heroFOV[pos] || ch === Dungeon.hero) {
      ch.sprite_.emitter().start(Speck.factory$int(Speck.LIGHT), Math.fround(0.2), 3);
    } else {
      if (Camera.main.followTarget() === ch.sprite_) {
        Camera.main.panFollow(null, 5);
      }
    }
  }
  static appearVFX(ch: Char): void {
    if (Dungeon.level.heroFOV[ch.pos]) {
      Sample.INSTANCE.play$Object(Assets$Sounds.TELEPORT);
    }
    Dungeon.level.occupyCell(ch);
    if (ch.invisible === 0) {
      ch.sprite_.alpha$float(0);
      ch.sprite_.parent.add$Gizmo(new AlphaTweener()._AlphaTweener(ch.sprite_, 1, Math.fround(0.4)));
    }
    if (Dungeon.level.heroFOV[ch.pos]) {
      ch.sprite_.emitter().start(Speck.factory$int(Speck.LIGHT), Math.fround(0.2), 3);
    }
  }
  value(): number {
    return this.isKnown() ? Math.imul(30, this.quantity) : super.value();
  }
}

$J.define(ScrollOfTeleportation, 'com.shatteredpixel.shatteredpixeldungeon.items.scrolls.ScrollOfTeleportation', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.items.scrolls.Scroll', ctors: { '': '_ScrollOfTeleportation' }, meths: { 'teleportChar(com.shatteredpixel.shatteredpixeldungeon.actors.Char,java.lang.Class)': 'teleportChar$Char$Class', 'teleportChar(com.shatteredpixel.shatteredpixeldungeon.actors.Char)': 'teleportChar$Char' } });
$J.module(() => {
  Assets$Sounds = $J.load('com.shatteredpixel.shatteredpixeldungeon.Assets$Sounds');
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  Actor = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Actor');
  Char = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Char');
  Char$Property = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Char$Property');
  Buff = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Buff');
  Roots = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Roots');
  CellEmitter = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.CellEmitter');
  Speck = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.Speck');
  Item = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.Item');
  ScrollOfMagicMapping = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.scrolls.ScrollOfMagicMapping');
  RegularLevel = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.RegularLevel');
  Terrain = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.Terrain');
  VaultTreasureRoom = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.rooms.quest.vault.treasure.VaultTreasureRoom');
  SecretRoom = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.rooms.secret.SecretRoom');
  SpecialRoom = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.rooms.special.SpecialRoom');
  Messages = $J.load('com.shatteredpixel.shatteredpixeldungeon.messages.Messages');
  GameScene = $J.load('com.shatteredpixel.shatteredpixeldungeon.scenes.GameScene');
  ItemSpriteSheet$Icons = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.ItemSpriteSheet$Icons');
  GLog = $J.load('com.shatteredpixel.shatteredpixeldungeon.utils.GLog');
  Camera = $J.load('com.watabou.noosa.Camera');
  Sample = $J.load('com.watabou.noosa.audio.Sample');
  AlphaTweener = $J.load('com.watabou.noosa.tweeners.AlphaTweener');
  BArray = $J.load('com.watabou.utils.BArray');
  PathFinder = $J.load('com.watabou.utils.PathFinder');
  Random = $J.load('com.watabou.utils.Random');
});
