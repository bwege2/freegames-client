// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/actors/mobs/GnollGuard.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { Mob } from './Mob.ts';
import { Mob$Wandering } from './Mob.ts';

let Dungeon, Actor, GnollSapper, Spear, Ballistica, Messages, GnollGuardSprite, GLog, Random;

export class GnollGuard extends Mob {
  sapperID: number = 0;
  static readonly SAPPER_ID: string = 'sapper_id';
  _GnollGuard(): this {
    this._Mob();
    this.spriteClass = $J.cls(GnollGuardSprite);
    this.HP = this.HT = 35;
    this.defenseSkill_ = 15;
    this.EXP = 7;
    this.maxLvl = -2;
    this.loot = $J.cls(Spear);
    this.lootChance_ = Math.fround(0.1);
    this.WANDERING = new GnollGuard$Wandering().$o(this)._GnollGuard$Wandering();
    this.sapperID = -1;
    return this;
  }
  linkSapper(sapper: GnollSapper): void {
    this.sapperID = sapper.id();
    if (this.sprite_ instanceof GnollGuardSprite) {
      (this.sprite_).setupArmor();
    }
  }
  hasSapper(): boolean {
    return this.sapperID !== -1 && Actor.findById(this.sapperID) instanceof GnollSapper && (Actor.findById(this.sapperID)).isAlive();
  }
  loseSapper(): void {
    if (this.sapperID !== -1) {
      this.sapperID = -1;
      if (this.sprite_ instanceof GnollGuardSprite) {
        (this.sprite_).loseArmor();
      }
    }
  }
  damage(dmg: number, src: any): void {
    if (this.hasSapper()) {
      dmg = $J.idiv(dmg, 4);
    }
    super.damage(dmg, src);
  }
  incomingDOT(): number {
    if (!this.needsIncomingDOTUpdate) {
      return this.cachedIncomingDOT;
    } else {
      let DOT = super.incomingDOT();
      if (this.hasSapper()) {
        DOT = $J.idiv(DOT, 4);
      }
      this.cachedIncomingDOT = DOT;
      return this.cachedIncomingDOT;
    }
  }
  damageRoll(): number {
    if (this.enemy != null && !Dungeon.level.adjacent(this.pos, this.enemy.pos)) {
      return Random.NormalIntRange(16, 22);
    } else {
      return Random.NormalIntRange(6, 12);
    }
  }
  attackProc(enemy: Char, damage: number): number {
    let dmg = super.attackProc(enemy, damage);
    if (enemy === Dungeon.hero && !Dungeon.level.adjacent(this.pos, enemy.pos) && dmg > 12) {
      GLog.n(Messages.get$Object$String$ObjectArr(this, 'spear_warn', []), []);
    }
    return dmg;
  }
  attackSkill(target: Char): number {
    return 20;
  }
  drRoll(): number {
    return (super.drRoll() + Random.NormalIntRange(0, 6)) | 0;
  }
  canAttack(enemy: Char): boolean {
    return Dungeon.level.distance(enemy.pos, this.pos) <= 2 && new Ballistica()._Ballistica(this.pos, enemy.pos, Ballistica.PROJECTILE).collisionPos === enemy.pos && new Ballistica()._Ballistica(enemy.pos, this.pos, Ballistica.PROJECTILE).collisionPos === this.pos;
  }
  description(): string {
    if (this.hasSapper()) {
      return super.description() + '\n\n' + Messages.get$Object$String$ObjectArr(this, 'desc_armor', []);
    } else {
      return super.description();
    }
  }
  storeInBundle(bundle: Bundle): void {
    super.storeInBundle(bundle);
    bundle.put$String$int(GnollGuard.SAPPER_ID, this.sapperID);
  }
  restoreFromBundle(bundle: Bundle): void {
    super.restoreFromBundle(bundle);
    this.sapperID = bundle.getInt(GnollGuard.SAPPER_ID);
  }
}

export class GnollGuard$Wandering extends Mob$Wandering {
  _GnollGuard$Wandering(): this {
    this._Mob$Wandering();
    return this;
  }
  randomDestination(): number {
    if (this.$outer.hasSapper()) {
      return (Actor.findById(this.$outer.sapperID)).pos;
    } else {
      return super.randomDestination();
    }
  }
}

$J.define(GnollGuard, 'com.shatteredpixel.shatteredpixeldungeon.actors.mobs.GnollGuard', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.actors.mobs.Mob', ctors: { '': '_GnollGuard' } });
$J.define(GnollGuard$Wandering, 'com.shatteredpixel.shatteredpixeldungeon.actors.mobs.GnollGuard$Wandering', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.actors.mobs.Mob$Wandering', ctors: { '': '_GnollGuard$Wandering' }, inner: true });
$J.module(() => {
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  Actor = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Actor');
  GnollSapper = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.GnollSapper');
  Spear = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.weapon.melee.Spear');
  Ballistica = $J.load('com.shatteredpixel.shatteredpixeldungeon.mechanics.Ballistica');
  Messages = $J.load('com.shatteredpixel.shatteredpixeldungeon.messages.Messages');
  GnollGuardSprite = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.GnollGuardSprite');
  GLog = $J.load('com.shatteredpixel.shatteredpixeldungeon.utils.GLog');
  Random = $J.load('com.watabou.utils.Random');
});
