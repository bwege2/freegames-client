// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/levels/rooms/special/SentryRoom.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { SpecialRoom } from './SpecialRoom.ts';
import { NPC } from '../../../actors/mobs/npcs/NPC.ts';

let Badges, Dungeon, Char, Char$Property, Eye$DeathGaze, Generator, Heap$Type, PotionOfHaste, Bestiary, Terrain, Painter, Room$Door$Type, EmptyRoom, Messages, CharSprite, SentrySprite$Red, GLog, Point, Random;

export class SentryRoom extends SpecialRoom {
  _SentryRoom(): this {
    this._SpecialRoom();
    return this;
  }
  minWidth(): number {
    return 7;
  }
  minHeight(): number {
    return 7;
  }
  paint(level: Level): void {
    Painter.fill$Level$Rect$int(level, this, Terrain.WALL);
    Painter.fill$Level$Rect$int$int(level, this, 1, Terrain.EMPTY_SP);
    let entrance = this.entrance();
    let center: Point;
    do {
      center = this.center();
    } while (center.x === entrance.x || center.y === entrance.y);
    let sentryPos = new Point()._Point$();
    let treasurePos = new Point()._Point$();
    let dangerDist = 0;
    if (entrance.x === this.left_) {
      sentryPos.set$int$int((this.right_ - 1) | 0, center.y);
      Painter.fill$Level$int$int$int$int$int(level, (this.left_ + 1) | 0, (this.top_ + 1) | 0, 1, (this.height() - 2) | 0, Terrain.EMPTY);
      if (entrance.y > center.y) {
        treasurePos.set$int$int((this.left_ + 1) | 0, $J.idiv(((this.top_ + 1 + center.y) | 0), 2));
        Painter.fill$Level$int$int$int$int$int(level, (this.left_ + 1) | 0, (this.top_ + 1) | 0, 2, (center.y - this.top_ - 1) | 0, Terrain.EMPTY);
      } else {
        treasurePos.set$int$int((this.left_ + 1) | 0, $J.idiv(((this.bottom_ + center.y) | 0), 2));
        Painter.fill$Level$int$int$int$int$int(level, (this.left_ + 1) | 0, (center.y + 1) | 0, 2, (this.bottom_ - center.y - 1) | 0, Terrain.EMPTY);
      }
      for (let x = (this.right_ - 3) | 0; x > this.left_; x--) {
        if ((level.map_[(x + (Math.imul(center.y, level.width()))) | 0]) === Terrain.EMPTY_SP) {
          Painter.set$Level$int$int$int(level, x, center.y, Terrain.STATUE_SP);
        } else {
          Painter.set$Level$int$int$int(level, x, center.y, Terrain.STATUE);
        }
      }
      dangerDist = Math.imul(2, ((this.width() - 5) | 0));
    } else if (entrance.x === this.right_) {
      sentryPos.set$int$int((this.left_ + 1) | 0, center.y);
      Painter.fill$Level$int$int$int$int$int(level, (this.right_ - 1) | 0, (this.top_ + 1) | 0, 1, (this.height() - 2) | 0, Terrain.EMPTY);
      if (entrance.y > center.y) {
        treasurePos.set$int$int((this.right_ - 1) | 0, $J.idiv(((this.top_ + 1 + center.y) | 0), 2));
        Painter.fill$Level$int$int$int$int$int(level, (this.right_ - 2) | 0, (this.top_ + 1) | 0, 2, (center.y - this.top_ - 1) | 0, Terrain.EMPTY);
      } else {
        treasurePos.set$int$int((this.right_ - 1) | 0, $J.idiv(((this.bottom_ + 1 + center.y) | 0), 2));
        Painter.fill$Level$int$int$int$int$int(level, (this.right_ - 2) | 0, (center.y + 1) | 0, 2, (this.bottom_ - center.y - 1) | 0, Terrain.EMPTY);
      }
      for (let x = (this.left_ + 3) | 0; x < this.right_; x++) {
        if ((level.map_[(x + (Math.imul(center.y, level.width()))) | 0]) === Terrain.EMPTY_SP) {
          Painter.set$Level$int$int$int(level, x, center.y, Terrain.STATUE_SP);
        } else {
          Painter.set$Level$int$int$int(level, x, center.y, Terrain.STATUE);
        }
      }
      dangerDist = Math.imul(2, ((this.width() - 5) | 0));
    } else if (entrance.y === this.top_) {
      sentryPos.set$int$int(center.x, (this.bottom_ - 1) | 0);
      Painter.fill$Level$int$int$int$int$int(level, (this.left_ + 1) | 0, (this.top_ + 1) | 0, (this.width() - 2) | 0, 1, Terrain.EMPTY);
      if (entrance.x > center.x) {
        treasurePos.set$int$int($J.idiv(((this.left_ + 1 + center.x) | 0), 2), (this.top_ + 1) | 0);
        Painter.fill$Level$int$int$int$int$int(level, (this.left_ + 1) | 0, (this.top_ + 1) | 0, (center.x - this.left_ - 1) | 0, 2, Terrain.EMPTY);
      } else {
        treasurePos.set$int$int($J.idiv(((this.right_ + center.x) | 0), 2), (this.top_ + 1) | 0);
        Painter.fill$Level$int$int$int$int$int(level, (center.x + 1) | 0, (this.top_ + 1) | 0, (this.right_ - center.x - 1) | 0, 2, Terrain.EMPTY);
      }
      for (let y = (this.bottom_ - 3) | 0; y > this.top_; y--) {
        if ((level.map_[(center.x + (Math.imul(y, level.width()))) | 0]) === Terrain.EMPTY_SP) {
          Painter.set$Level$int$int$int(level, center.x, y, Terrain.STATUE_SP);
        } else {
          Painter.set$Level$int$int$int(level, center.x, y, Terrain.STATUE);
        }
      }
      dangerDist = Math.imul(2, ((this.height() - 5) | 0));
    } else if (entrance.y === this.bottom_) {
      sentryPos.set$int$int(center.x, (this.top_ + 1) | 0);
      Painter.fill$Level$int$int$int$int$int(level, (this.left_ + 1) | 0, (this.bottom_ - 1) | 0, (this.width() - 2) | 0, 1, Terrain.EMPTY);
      if (entrance.x > center.x) {
        treasurePos.set$int$int($J.idiv(((this.left_ + 1 + center.x) | 0), 2), (this.bottom_ - 1) | 0);
        Painter.fill$Level$int$int$int$int$int(level, (this.left_ + 1) | 0, (this.bottom_ - 2) | 0, (center.x - this.left_ - 1) | 0, 2, Terrain.EMPTY);
      } else {
        treasurePos.set$int$int($J.idiv(((this.right_ + center.x) | 0), 2), (this.bottom_ - 1) | 0);
        Painter.fill$Level$int$int$int$int$int(level, (center.x + 1) | 0, (this.bottom_ - 2) | 0, (this.right_ - center.x - 1) | 0, 2, Terrain.EMPTY);
      }
      for (let y = (this.top_ + 3) | 0; y < this.bottom_; y++) {
        if ((level.map_[(center.x + (Math.imul(y, level.width()))) | 0]) === Terrain.EMPTY_SP) {
          Painter.set$Level$int$int$int(level, center.x, y, Terrain.STATUE_SP);
        } else {
          Painter.set$Level$int$int$int(level, center.x, y, Terrain.STATUE);
        }
      }
      dangerDist = Math.imul(2, ((this.height() - 5) | 0));
    }
    Painter.set$Level$Point$int(level, sentryPos, Terrain.PEDESTAL);
    let sentry = new SentryRoom$Sentry()._SentryRoom$Sentry();
    sentry.pos = level.pointToCell(sentryPos);
    sentry.room = new EmptyRoom()._EmptyRoom();
    sentry.room.set$Rect(this);
    sentry.initialChargeDelay = sentry.curChargeDelay = Math.fround(Math.fround(dangerDist / 3) + Math.fround(0.1));
    level.mobs.add(sentry);
    Painter.set$Level$Point$int(level, treasurePos, Terrain.PEDESTAL);
    level.drop(SentryRoom.prize(level), level.pointToCell(treasurePos)).type_ = Heap$Type.CHEST;
    level.addItemToSpawn(new PotionOfHaste()._PotionOfHaste());
    entrance.set$Type(Room$Door$Type.REGULAR);
  }
  static prize(level: Level): Item {
    let prize: Item;
    if (Random.Int$int(2) === 0) {
      prize = level.findPrizeItem$();
      if (prize != null) {
        return prize;
      }
    }
    switch (Random.Int$int(5)) {
      case 0:
      case 1:
      default:
        prize = Generator.randomWeapon$int((($J.idiv(Dungeon.depth, 5)) + 1) | 0);
        if ((prize).hasCurseEnchant()) {
          (prize).enchant$Enchantment(null);
        }
        break;
      case 2:
        prize = Generator.randomMissile$int((($J.idiv(Dungeon.depth, 5)) + 1) | 0);
        if ((prize).hasCurseEnchant()) {
          (prize).enchant$Enchantment(null);
        }
        break;
      case 3:
      case 4:
        prize = Generator.randomArmor$int((($J.idiv(Dungeon.depth, 5)) + 1) | 0);
        if ((prize).hasCurseGlyph()) {
          (prize).inscribe$Glyph(null);
        }
        break;
    }
    prize.cursed = false;
    prize.cursedKnown = true;
    if (Random.Int$int(3) === 0) {
      prize.upgrade$();
    }
    return prize;
  }
  canConnect$Point(p: Point): boolean {
    if (!super.canConnect$Point(p)) {
      return false;
    }
    if (this.width() % 2 === 1 && p.x === this.center().x) {
      return false;
    }
    if (this.height() % 2 === 1 && p.y === this.center().y) {
      return false;
    }
    return true;
  }
}

export class SentryRoom$Sentry extends NPC {
  initialChargeDelay: number = 0;
  curChargeDelay: number = 0;
  room: EmptyRoom = null;
  static readonly INITIAL_DELAY: string = 'initial_delay';
  static readonly CUR_DELAY: string = 'cur_delay';
  static readonly ROOM: string = 'room';
  _SentryRoom$Sentry(): this {
    this._NPC();
    this.spriteClass = $J.cls(SentrySprite$Red);
    this.properties_.add(Char$Property.IMMOVABLE);
    return this;
  }
  act(): boolean {
    if (Dungeon.level.heroFOV[this.pos]) {
      Bestiary.setSeen($J.getClass(this));
    }
    if (this.fieldOfView == null || this.fieldOfView.length !== Dungeon.level.length()) {
      this.fieldOfView = $J.newArray(Dungeon.level.length(), false);
    }
    Dungeon.level.updateFieldOfView(this, this.fieldOfView);
    if (this.properties().contains(Char$Property.IMMOVABLE)) {
      this.throwItems();
    }
    if (Dungeon.hero != null) {
      if (this.fieldOfView[Dungeon.hero.pos] && Dungeon.level.map_[Dungeon.hero.pos] === Terrain.EMPTY_SP && this.room.inside$Point(Dungeon.level.cellToPoint(Dungeon.hero.pos)) && !Dungeon.hero.belongings.lostInventory$()) {
        if (this.curChargeDelay > Math.fround(0.001)) {
          if (this.curChargeDelay === this.initialChargeDelay) {
            (this.sprite_).charge();
          }
          this.curChargeDelay = Math.fround(this.curChargeDelay - Dungeon.hero.cooldown());
          if (Dungeon.hero.cooldown() >= Math.fround(0.34)) {
            Dungeon.hero.interrupt();
          }
        }
        if (this.curChargeDelay <= Math.fround(0.001)) {
          this.curChargeDelay = 1;
          this.sprite_.zap$int(Dungeon.hero.pos);
          (this.sprite_).charge();
        }
        this.spend(Dungeon.hero.cooldown());
        return true;
      } else {
        this.curChargeDelay = this.initialChargeDelay;
        this.sprite_.idle();
      }
      this.spend(Dungeon.hero.cooldown());
    } else {
      this.spend(1);
    }
    return true;
  }
  onZapComplete(): void {
    if (Char.hit$Char$Char$boolean(this, Dungeon.hero, true)) {
      Dungeon.hero.damage(Random.NormalIntRange((2 + $J.idiv(Dungeon.depth, 2)) | 0, (4 + Dungeon.depth) | 0), new Eye$DeathGaze()._Eye$DeathGaze());
      if (!Dungeon.hero.isAlive()) {
        Badges.validateDeathFromEnemyMagic();
        Dungeon.fail(this);
        GLog.n(Messages.capitalize(Messages.get$Class$String$ObjectArr($J.cls(Char), 'kill', [this.name()])), []);
      }
    } else {
      Dungeon.hero.sprite_.showStatus(CharSprite.NEUTRAL, Dungeon.hero.defenseVerb(), []);
    }
  }
  sprite(): CharSprite {
    let sprite = super.sprite();
    if (this.curChargeDelay !== this.initialChargeDelay) {
      sprite.charge();
    }
    return sprite;
  }
  attackSkill(target: Char): number {
    return (20 + Math.imul(Dungeon.depth, 2)) | 0;
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
    return true;
  }
  storeInBundle(bundle: Bundle): void {
    super.storeInBundle(bundle);
    bundle.put$String$float(SentryRoom$Sentry.INITIAL_DELAY, this.initialChargeDelay);
    bundle.put$String$float(SentryRoom$Sentry.CUR_DELAY, this.curChargeDelay);
    bundle.put$String$Bundlable(SentryRoom$Sentry.ROOM, this.room);
  }
  restoreFromBundle(bundle: Bundle): void {
    super.restoreFromBundle(bundle);
    this.initialChargeDelay = bundle.getFloat(SentryRoom$Sentry.INITIAL_DELAY);
    this.curChargeDelay = bundle.getFloat(SentryRoom$Sentry.CUR_DELAY);
    this.room = bundle.get$String(SentryRoom$Sentry.ROOM);
  }
}

$J.define(SentryRoom, 'com.shatteredpixel.shatteredpixeldungeon.levels.rooms.special.SentryRoom', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.levels.rooms.special.SpecialRoom', ctors: { '': '_SentryRoom' }, meths: { 'canConnect(com.watabou.utils.Point)': 'canConnect$Point' } });
$J.define(SentryRoom$Sentry, 'com.shatteredpixel.shatteredpixeldungeon.levels.rooms.special.SentryRoom$Sentry', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.actors.mobs.npcs.NPC', ctors: { '': '_SentryRoom$Sentry' } });
$J.module(() => {
  Badges = $J.load('com.shatteredpixel.shatteredpixeldungeon.Badges');
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  Char = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Char');
  Char$Property = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Char$Property');
  Eye$DeathGaze = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.Eye$DeathGaze');
  Generator = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.Generator');
  Heap$Type = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.Heap$Type');
  PotionOfHaste = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.potions.PotionOfHaste');
  Bestiary = $J.load('com.shatteredpixel.shatteredpixeldungeon.journal.Bestiary');
  Terrain = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.Terrain');
  Painter = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.painters.Painter');
  Room$Door$Type = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.rooms.Room$Door$Type');
  EmptyRoom = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.rooms.standard.EmptyRoom');
  Messages = $J.load('com.shatteredpixel.shatteredpixeldungeon.messages.Messages');
  CharSprite = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.CharSprite');
  SentrySprite$Red = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.SentrySprite$Red');
  GLog = $J.load('com.shatteredpixel.shatteredpixeldungeon.utils.GLog');
  Point = $J.load('com.watabou.utils.Point');
  Random = $J.load('com.watabou.utils.Random');
});
