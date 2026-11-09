// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/actors/buffs/AscensionChallenge.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { $J, HashMap } from '../../../../../../jre/index.ts';
import { Buff } from './Buff.ts';

let Badges, Dungeon, Statistics, Actor, Char$Alignment, Healing, Hunger, Hero, Ratmogrify$TransmogRat, Bat, Brute, Crab, DM100, DM200, Elemental, Eye, Ghoul, Gnoll, Golem, Guard, Monk, Necromancer, Rat, RipperDemon, Scorpio, Shaman, Skeleton, Slime, Snake, Spinner, Succubus, Swarm, Thief, Warlock, Shopkeeper, Amulet, DriedRose$GhostHero, Level, Terrain, Messages, BuffIndicator, GLog;

export class AscensionChallenge extends Buff {
  static modifiers: HashMap<JClass<Mob>, number> = null;
  stacks: number = 0;
  damageInc: number = 0;
  stacksLowered: boolean = false;
  justAscended: boolean = false;
  static readonly STACKS: string = 'enemy_stacks';
  static readonly DAMAGE: string = 'damage_inc';
  static readonly STACKS_LOWERED: string = 'stacks_lowered';
  _AscensionChallenge(): this {
    this._Buff();
    this.revivePersists = true;
    this.stacks = 0;
    this.damageInc = 0;
    this.stacksLowered = false;
    this.justAscended = false;
    return this;
  }
  static statModifier(ch: Char): number {
    if (Dungeon.hero == null || Dungeon.hero.buff($J.cls(AscensionChallenge)) == null) {
      return 1;
    }
    if (ch instanceof Ratmogrify$TransmogRat) {
      ch = (ch).getOriginal();
    }
    if (ch.buff($J.cls(AscensionChallenge$AscensionBuffBlocker)) != null) {
      return 1;
    }
    for (const $it0 = AscensionChallenge.modifiers.keySet().iterator(); $it0.hasNext(); ) {
      let cls = $it0.next();
      if (cls.isAssignableFrom(ch.getClass())) {
        return +$J.boxF(AscensionChallenge.modifiers.get(cls));
      }
    }
    return 1;
  }
  static beckonEnemies(): void {
    if (Dungeon.hero.buff($J.cls(AscensionChallenge)) != null && Dungeon.hero.buff($J.cls(AscensionChallenge)).stacks >= 2) {
      for (const $it1 = Dungeon.level.mobs.iterator(); $it1.hasNext(); ) {
        let m = $it1.next();
        if (m.alignment === Char$Alignment.ENEMY && m.distance(Dungeon.hero) > 8) {
          m.beckon(Dungeon.hero.pos);
        }
      }
    }
  }
  static enemySpeedModifier(m: Mob): number {
    if (Dungeon.hero.buff($J.cls(AscensionChallenge)) != null && m.alignment === Char$Alignment.ENEMY && Dungeon.hero.buff($J.cls(AscensionChallenge)).stacks >= 4 && m.state_ !== m.HUNTING && m.state_ !== m.FLEEING) {
      return 2;
    }
    return 1;
  }
  static modifyHeroSpeed(speed: number): number {
    if (Dungeon.hero.buff($J.cls(AscensionChallenge)) != null && Dungeon.hero.buff($J.cls(AscensionChallenge)).stacks >= 6) {
      return Math.min(Math.fround(speed / 2), 1);
    }
    return speed;
  }
  static qualifiedForPacifist(): boolean {
    if (Dungeon.hero.buff($J.cls(AscensionChallenge)) != null) {
      return !Dungeon.hero.buff($J.cls(AscensionChallenge)).stacksLowered;
    }
    return false;
  }
  static processEnemyKill(enemy: Char): void {
    let chal = Dungeon.hero.buff($J.cls(AscensionChallenge));
    if (chal == null) {
      return;
    }
    if (enemy instanceof Ratmogrify$TransmogRat) {
      enemy = (enemy).getOriginal();
      if (enemy == null) {
        return;
      }
    }
    if (enemy.buff($J.cls(AscensionChallenge$AscensionBuffBlocker)) != null) {
      return;
    }
    let found = false;
    for (const $it2 = AscensionChallenge.modifiers.keySet().iterator(); $it2.hasNext(); ) {
      let cls = $it2.next();
      if (cls.isAssignableFrom(enemy.getClass())) {
        found = true;
        break;
      }
    }
    if (!found) {
      return;
    }
    let oldStacks = chal.stacks;
    if (enemy instanceof Ghoul || enemy instanceof RipperDemon) {
      chal.stacks = Math.fround(chal.stacks - 0.5);
    } else {
      chal.stacks = Math.fround(chal.stacks - 1);
    }
    chal.stacks = Math.max(0, chal.stacks);
    if (!chal.stacksLowered) {
      chal.stacksLowered = true;
      GLog.p(Messages.get$Class$String$ObjectArr($J.cls(AscensionChallenge), 'weaken', []), []);
    } else if (chal.stacks < 8 && $J.d2i((Math.fround(chal.stacks / 2))) !== $J.d2i((Math.fround(oldStacks / 2)))) {
      GLog.p(Messages.get$Class$String$ObjectArr($J.cls(AscensionChallenge), 'weaken', []), []);
    }
    if (oldStacks > chal.stacks && Dungeon.hero.lvl === Hero.MAX_LEVEL) {
      Dungeon.hero.earnExp($J.roundf(Math.fround(10 * (Math.fround(oldStacks - chal.stacks)))), chal.getClass());
    }
    BuffIndicator.refreshHero();
  }
  static AscensionCorruptResist(m: Mob): number {
    if (Dungeon.hero.buff($J.cls(AscensionChallenge)) == null) {
      return m.EXP;
    }
    if (m instanceof Ratmogrify$TransmogRat) {
      m = (m).getOriginal();
    }
    if (m.buff($J.cls(AscensionChallenge$AscensionBuffBlocker)) != null) {
      return m.EXP;
    }
    if (m instanceof RipperDemon) {
      return 10;
    } else if (m instanceof Ghoul) {
      return 7;
    } else {
      for (const $it3 = AscensionChallenge.modifiers.keySet().iterator(); $it3.hasNext(); ) {
        let cls = $it3.next();
        if (cls.isAssignableFrom(m.getClass())) {
          return Math.max(13, m.EXP);
        }
      }
    }
    return m.EXP;
  }
  onLevelSwitch(): void {
    if (Dungeon.depth < Statistics.highestAscent) {
      Statistics.highestAscent = Dungeon.depth;
      this.justAscended = true;
      if (Dungeon.bossLevel$()) {
        Dungeon.hero.buff($J.cls(Hunger)).satisfy(Hunger.STARVING);
        Buff.affect$Char$Class(Dungeon.hero, $J.cls(Healing)).setHeal$int$float$int(Dungeon.hero.HT, 0, 20);
      } else {
        this.stacks = Math.fround(this.stacks + 2);
        for (let i = 0; i < Dungeon.level.length(); i++) {
          if (Dungeon.level.map_[i] === Terrain.HERO_LKD_DR) {
            Level.set$int$int$Level(i, Terrain.DOOR, Dungeon.level);
          }
        }
        for (let mob of $J.toArrayInto(Dungeon.level.mobs.toArray(), $J.newArray(0, null))) {
          if (!mob.reset()) {
            Dungeon.level.mobs.remove(mob);
          }
        }
        Dungeon.level.spawnMob(12);
      }
    }
    if (Statistics.highestAscent < 20) {
      for (let m of $J.toArrayInto(Dungeon.level.mobs.toArray(), $J.newArray(0, null))) {
        if (m instanceof Shopkeeper) {
          (m).flee();
        }
      }
    }
  }
  saySwitch(): void {
    if (Dungeon.bossLevel$()) {
      if (this.justAscended) {
        GLog.p(Messages.get$Object$String$ObjectArr(this, 'break', []), []);
        for (const $it4 = Actor.chars().iterator(); $it4.hasNext(); ) {
          let ch = $it4.next();
          if (ch instanceof DriedRose$GhostHero) {
            (ch).sayAppeared();
          }
        }
      }
    } else {
      if (Dungeon.depth === 1) {
        GLog.n(Messages.get$Object$String$ObjectArr(this, 'almost', []), []);
      } else if (this.stacks >= 8) {
        GLog.n(Messages.get$Object$String$ObjectArr(this, 'damage', []), []);
      } else if (this.stacks >= 6) {
        GLog.n(Messages.get$Object$String$ObjectArr(this, 'slow', []), []);
      } else if (this.stacks >= 4) {
        GLog.n(Messages.get$Object$String$ObjectArr(this, 'haste', []), []);
      } else if (this.stacks >= 2) {
        GLog.n(Messages.get$Object$String$ObjectArr(this, 'beckon', []), []);
      }
      if (this.stacks > Math.fround(4) && !this.stacksLowered) {
        GLog.h(Messages.get$Object$String$ObjectArr(this, 'weaken_info_no_kills', []), []);
      } else if (this.stacks > Math.fround(8)) {
        GLog.h(Messages.get$Object$String$ObjectArr(this, 'weaken_info', []), []);
      }
    }
    this.justAscended = false;
  }
  act(): boolean {
    AscensionChallenge.beckonEnemies();
    if (this.stacks >= Math.fround(8) && !Dungeon.bossLevel$()) {
      this.damageInc = Math.fround(this.damageInc + Math.fround((Math.fround(this.stacks - 4)) / 4));
      if (this.damageInc >= Math.fround(1)) {
        this.target.damage($J.d2i(this.damageInc), this);
        this.damageInc = Math.fround(this.damageInc - $J.d2i(this.damageInc));
        if (this.target === Dungeon.hero && !this.target.isAlive()) {
          Badges.validateDeathFromFriendlyMagic();
          GLog.n(Messages.get$Object$String$ObjectArr(this, 'on_kill', []), []);
          Dungeon.fail($J.cls(Amulet));
        }
      }
    } else {
      this.damageInc = 0;
    }
    this.spend(Actor.TICK);
    return true;
  }
  icon(): number {
    return BuffIndicator.AMULET;
  }
  tintIcon(icon: Image): void {
    if (this.stacks < Math.fround(2)) {
      icon.hardlight$float$float$float(0.5, 1, 0);
    } else if (this.stacks < Math.fround(4)) {
      icon.hardlight$float$float$float(1, 1, 0);
    } else if (this.stacks < Math.fround(6)) {
      icon.hardlight$float$float$float(1, Math.fround(0.67), 0);
    } else if (this.stacks < Math.fround(8)) {
      icon.hardlight$float$float$float(1, Math.fround(0.33), 0);
    } else {
      icon.hardlight$float$float$float(1, 0, 0);
    }
  }
  desc(): string {
    let desc = Messages.get$Object$String$ObjectArr(this, 'desc', []);
    desc += '\n';
    if (this.stacks < Math.fround(2)) {
      desc += '\n' + Messages.get$Object$String$ObjectArr(this, 'desc_clear', []);
    } else {
      if (this.stacks >= Math.fround(2)) {
        desc += '\n' + Messages.get$Object$String$ObjectArr(this, 'desc_beckon', []);
      }
      if (this.stacks >= Math.fround(4)) {
        desc += '\n' + Messages.get$Object$String$ObjectArr(this, 'desc_haste', []);
      }
      if (this.stacks >= Math.fround(6)) {
        desc += '\n' + Messages.get$Object$String$ObjectArr(this, 'desc_slow', []);
      }
      if (this.stacks >= Math.fround(8)) {
        desc += '\n' + Messages.get$Object$String$ObjectArr(this, 'desc_damage', []);
      }
    }
    return desc;
  }
  storeInBundle(bundle: Bundle): void {
    super.storeInBundle(bundle);
    bundle.put$String$float(AscensionChallenge.STACKS, this.stacks);
    bundle.put$String$float(AscensionChallenge.DAMAGE, this.damageInc);
    bundle.put$String$boolean(AscensionChallenge.STACKS_LOWERED, this.stacksLowered);
  }
  restoreFromBundle(bundle: Bundle): void {
    super.restoreFromBundle(bundle);
    this.stacks = bundle.getFloat(AscensionChallenge.STACKS);
    this.damageInc = bundle.getFloat(AscensionChallenge.DAMAGE);
    this.stacksLowered = bundle.getBoolean(AscensionChallenge.STACKS_LOWERED);
  }
  static $clinit() {
    AscensionChallenge.modifiers = new HashMap();
    $J.boxF(AscensionChallenge.modifiers.put($J.cls(Rat), $J.boxF(10)));
    $J.boxF(AscensionChallenge.modifiers.put($J.cls(Snake), $J.boxF(9)));
    $J.boxF(AscensionChallenge.modifiers.put($J.cls(Gnoll), $J.boxF(9)));
    $J.boxF(AscensionChallenge.modifiers.put($J.cls(Swarm), $J.boxF(8.5)));
    $J.boxF(AscensionChallenge.modifiers.put($J.cls(Crab), $J.boxF(8)));
    $J.boxF(AscensionChallenge.modifiers.put($J.cls(Slime), $J.boxF(8)));
    $J.boxF(AscensionChallenge.modifiers.put($J.cls(Skeleton), $J.boxF(5)));
    $J.boxF(AscensionChallenge.modifiers.put($J.cls(Thief), $J.boxF(5)));
    $J.boxF(AscensionChallenge.modifiers.put($J.cls(DM100), $J.boxF(4.5)));
    $J.boxF(AscensionChallenge.modifiers.put($J.cls(Guard), $J.boxF(4)));
    $J.boxF(AscensionChallenge.modifiers.put($J.cls(Necromancer), $J.boxF(4)));
    $J.boxF(AscensionChallenge.modifiers.put($J.cls(Bat), $J.boxF(2.5)));
    $J.boxF(AscensionChallenge.modifiers.put($J.cls(Brute), $J.boxF(2.25)));
    $J.boxF(AscensionChallenge.modifiers.put($J.cls(Shaman), $J.boxF(2.25)));
    $J.boxF(AscensionChallenge.modifiers.put($J.cls(Spinner), $J.boxF(2)));
    $J.boxF(AscensionChallenge.modifiers.put($J.cls(DM200), $J.boxF(2)));
    $J.boxF(AscensionChallenge.modifiers.put($J.cls(Ghoul), $J.boxF(Math.fround(1.67))));
    $J.boxF(AscensionChallenge.modifiers.put($J.cls(Elemental), $J.boxF(Math.fround(1.67))));
    $J.boxF(AscensionChallenge.modifiers.put($J.cls(Warlock), $J.boxF(1.5)));
    $J.boxF(AscensionChallenge.modifiers.put($J.cls(Monk), $J.boxF(1.5)));
    $J.boxF(AscensionChallenge.modifiers.put($J.cls(Golem), $J.boxF(Math.fround(1.33))));
    $J.boxF(AscensionChallenge.modifiers.put($J.cls(RipperDemon), $J.boxF(Math.fround(1.2))));
    $J.boxF(AscensionChallenge.modifiers.put($J.cls(Succubus), $J.boxF(Math.fround(1.2))));
    $J.boxF(AscensionChallenge.modifiers.put($J.cls(Eye), $J.boxF(Math.fround(1.1))));
    $J.boxF(AscensionChallenge.modifiers.put($J.cls(Scorpio), $J.boxF(Math.fround(1.1))));
  }
}

export class AscensionChallenge$AscensionBuffBlocker extends Buff {
  _AscensionChallenge$AscensionBuffBlocker(): this {
    this._Buff();
    return this;
  }
}

$J.define(AscensionChallenge, 'com.shatteredpixel.shatteredpixeldungeon.actors.buffs.AscensionChallenge', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Buff', ctors: { '': '_AscensionChallenge' }, clinit: true, lazy: ['modifiers'] });
$J.define(AscensionChallenge$AscensionBuffBlocker, 'com.shatteredpixel.shatteredpixeldungeon.actors.buffs.AscensionChallenge$AscensionBuffBlocker', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Buff', ctors: { '': '_AscensionChallenge$AscensionBuffBlocker' } });
$J.module(() => {
  Badges = $J.load('com.shatteredpixel.shatteredpixeldungeon.Badges');
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  Statistics = $J.load('com.shatteredpixel.shatteredpixeldungeon.Statistics');
  Actor = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Actor');
  Char$Alignment = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Char$Alignment');
  Healing = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Healing');
  Hunger = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Hunger');
  Hero = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.Hero');
  Ratmogrify$TransmogRat = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.abilities.Ratmogrify$TransmogRat');
  Bat = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.Bat');
  Brute = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.Brute');
  Crab = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.Crab');
  DM100 = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.DM100');
  DM200 = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.DM200');
  Elemental = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.Elemental');
  Eye = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.Eye');
  Ghoul = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.Ghoul');
  Gnoll = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.Gnoll');
  Golem = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.Golem');
  Guard = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.Guard');
  Monk = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.Monk');
  Necromancer = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.Necromancer');
  Rat = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.Rat');
  RipperDemon = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.RipperDemon');
  Scorpio = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.Scorpio');
  Shaman = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.Shaman');
  Skeleton = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.Skeleton');
  Slime = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.Slime');
  Snake = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.Snake');
  Spinner = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.Spinner');
  Succubus = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.Succubus');
  Swarm = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.Swarm');
  Thief = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.Thief');
  Warlock = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.Warlock');
  Shopkeeper = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.npcs.Shopkeeper');
  Amulet = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.Amulet');
  DriedRose$GhostHero = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.artifacts.DriedRose$GhostHero');
  Level = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.Level');
  Terrain = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.Terrain');
  Messages = $J.load('com.shatteredpixel.shatteredpixeldungeon.messages.Messages');
  BuffIndicator = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.BuffIndicator');
  GLog = $J.load('com.shatteredpixel.shatteredpixeldungeon.utils.GLog');
});
