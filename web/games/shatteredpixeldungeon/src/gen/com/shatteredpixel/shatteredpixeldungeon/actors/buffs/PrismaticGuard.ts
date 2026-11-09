// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/actors/buffs/PrismaticGuard.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { $J } from '../../../../../../jre/index.ts';
import { Buff } from './Buff.ts';

let Dungeon, Actor, Buff$buffType, Regeneration, PowerOfMany$PowerBuff, PrismaticImage, ScrollOfTeleportation, Messages, GameScene, BuffIndicator, PathFinder;

export class PrismaticGuard extends Buff {
  HP: number = 0;
  powerOfManyTurns: number = 0;
  static readonly HEALTH: string = 'hp';
  static readonly POWER_TURNS: string = 'power_turns';
  _PrismaticGuard(): this {
    this._Buff();
    this.type_ = Buff$buffType.POSITIVE;
    this.powerOfManyTurns = 0;
    return this;
  }
  act(): boolean {
    let hero = this.target;
    let closest = null;
    let v = hero.visibleEnemies();
    for (let i = 0; i < v; i++) {
      let mob = hero.visibleEnemy(i);
      if (mob.isAlive() && !mob.isInvulnerable($J.cls(PrismaticImage)) && mob.state_ !== mob.PASSIVE && mob.state_ !== mob.WANDERING && mob.state_ !== mob.SLEEPING && !hero.mindVisionEnemies.contains(mob) && (closest == null || Dungeon.level.distance(hero.pos, mob.pos) < Dungeon.level.distance(hero.pos, closest.pos))) {
        closest = mob;
      }
    }
    if (closest != null && Dungeon.level.distance(hero.pos, closest.pos) < 5) {
      let bestPos = -1;
      for (let i = 0; i < PathFinder.NEIGHBOURS8.length; i++) {
        let p = (hero.pos + PathFinder.NEIGHBOURS8[i]) | 0;
        if (Actor.findChar(p) == null && Dungeon.level.passable[p]) {
          if (bestPos === -1 || Dungeon.level.trueDistance(p, closest.pos) < Dungeon.level.trueDistance(bestPos, closest.pos)) {
            bestPos = p;
          }
        }
      }
      if (bestPos !== -1) {
        let pris = new PrismaticImage()._PrismaticImage();
        pris.duplicate(hero, $J.d2i(Math.floor(this.HP)));
        if (this.powerOfManyTurns > Math.fround(0)) {
          Buff.affect$Char$Class$float(pris, $J.cls(PowerOfMany$PowerBuff), this.powerOfManyTurns);
        }
        pris.state_ = pris.HUNTING;
        GameScene.add$Mob$float(pris, 1);
        ScrollOfTeleportation.appear(pris, bestPos);
        this.detach();
      } else {
        this.spend(Actor.TICK);
      }
    } else {
      this.spend(Actor.TICK);
    }
    if (this.HP < Math.fround(this.maxHP()) && Regeneration.regenOn()) {
      this.HP = Math.fround(this.HP + Math.fround(0.1));
    }
    if (this.powerOfManyTurns > Math.fround(0)) {
      this.powerOfManyTurns--;
      if (this.powerOfManyTurns <= Math.fround(0)) {
        this.powerOfManyTurns = 0;
        BuffIndicator.refreshHero();
      }
    }
    return true;
  }
  set$int(HP: number): void {
    this.HP = Math.fround(HP);
    this.powerOfManyTurns = 0;
  }
  set$PrismaticImage(img: PrismaticImage): void {
    this.HP = Math.fround(img.HP);
    if (img.buff($J.cls(PowerOfMany$PowerBuff)) != null) {
      this.powerOfManyTurns = Math.fround(img.buff($J.cls(PowerOfMany$PowerBuff)).cooldown() + 1);
    } else {
      this.powerOfManyTurns = 0;
    }
  }
  maxHP(): number {
    return PrismaticGuard.maxHP(this.target);
  }
  static maxHP(hero: Hero): number {
    return (10 + $J.d2i(Math.floor(Math.fround(hero.lvl * 2.5)))) | 0;
  }
  isEmpowered(): boolean {
    return this.powerOfManyTurns > Math.fround(0);
  }
  icon(): number {
    return BuffIndicator.ARMOR;
  }
  tintIcon(icon: Image): void {
    if (this.isEmpowered()) {
      icon.hardlight$float$float$float(3, 3, 2);
    } else {
      icon.hardlight$float$float$float(1, 1, 2);
    }
  }
  iconFadePercent(): number {
    return Math.fround(1 - Math.fround(this.HP / Math.fround(this.maxHP())));
  }
  iconTextDisplay(): string {
    return String($J.d2i(this.HP));
  }
  desc(): string {
    let desc = Messages.get$Object$String$ObjectArr(this, 'desc', [$J.d2i(this.HP), this.maxHP()]);
    if (this.isEmpowered()) {
      desc += '\n\n' + Messages.get$Object$String$ObjectArr(this, 'desc_many', [$J.d2i(this.powerOfManyTurns)]);
    }
    return desc;
  }
  storeInBundle(bundle: Bundle): void {
    super.storeInBundle(bundle);
    bundle.put$String$float(PrismaticGuard.HEALTH, this.HP);
    bundle.put$String$float(PrismaticGuard.POWER_TURNS, this.powerOfManyTurns);
  }
  restoreFromBundle(bundle: Bundle): void {
    super.restoreFromBundle(bundle);
    this.HP = bundle.getFloat(PrismaticGuard.HEALTH);
    this.powerOfManyTurns = bundle.getFloat(PrismaticGuard.POWER_TURNS);
  }
}

$J.define(PrismaticGuard, 'com.shatteredpixel.shatteredpixeldungeon.actors.buffs.PrismaticGuard', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Buff', ctors: { '': '_PrismaticGuard' }, meths: { 'set(com.shatteredpixel.shatteredpixeldungeon.actors.mobs.npcs.PrismaticImage)': 'set$PrismaticImage', 'set(int)': 'set$int' } });
$J.module(() => {
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  Actor = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Actor');
  Buff$buffType = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Buff$buffType');
  Regeneration = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Regeneration');
  PowerOfMany$PowerBuff = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.abilities.cleric.PowerOfMany$PowerBuff');
  PrismaticImage = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.npcs.PrismaticImage');
  ScrollOfTeleportation = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.scrolls.ScrollOfTeleportation');
  Messages = $J.load('com.shatteredpixel.shatteredpixeldungeon.messages.Messages');
  GameScene = $J.load('com.shatteredpixel.shatteredpixeldungeon.scenes.GameScene');
  BuffIndicator = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.BuffIndicator');
  PathFinder = $J.load('com.watabou.utils.PathFinder');
});
