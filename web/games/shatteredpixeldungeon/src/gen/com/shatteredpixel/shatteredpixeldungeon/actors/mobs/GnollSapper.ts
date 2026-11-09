// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/actors/mobs/GnollSapper.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { Mob$Hunting } from './Mob.ts';
import { Mob$Wandering } from './Mob.ts';

let Dungeon, Actor, Char$Property, GnollGeomancer, GnollGuard, Terrain, Ballistica, GameScene, GnollSapperSprite, GameMath, PathFinder, Random;

export class GnollSapper extends Mob {
  spawnPos: number = 0;
  partnerID: number = 0;
  abilityCooldown: number = 0;
  lastAbilityWasRockfall: boolean = false;
  throwingRockFromPos: number = 0;
  throwingRockToPos: number = 0;
  static readonly SPAWN_POS: string = 'spawn_pos';
  static readonly PARTNER_ID: string = 'partner_id';
  static readonly ABILITY_COOLDOWN: string = 'ability_cooldown';
  static readonly LAST_ABILITY_WAS_ROCKFALL: string = 'last_ability_was_rockfall';
  static readonly ROCK_FROM_POS: string = 'rock_from_pos';
  static readonly ROCK_TO_POS: string = 'rock_to_pos';
  _GnollSapper(): this {
    this._Mob();
    this.actPriority = (Actor.MOB_PRIO - 1) | 0;
    this.spriteClass = $J.cls(GnollSapperSprite);
    this.HP = this.HT = 45;
    this.defenseSkill_ = 15;
    this.EXP = 10;
    this.maxLvl = -2;
    this.properties_.add(Char$Property.MINIBOSS);
    this.HUNTING = new GnollSapper$Hunting().$o(this)._GnollSapper$Hunting();
    this.WANDERING = new GnollSapper$Wandering().$o(this)._GnollSapper$Wandering();
    this.state_ = this.SLEEPING;
    this.partnerID = -1;
    this.abilityCooldown = Random.NormalIntRange(4, 6);
    this.lastAbilityWasRockfall = false;
    this.throwingRockFromPos = -1;
    this.throwingRockToPos = -1;
    return this;
  }
  linkPartner(c: Char): void {
    this.losePartner();
    this.partnerID = c.id();
    if (c instanceof GnollGuard) {
      (c).linkSapper(this);
    } else if (c instanceof GnollGeomancer) {
      (c).linkSapper(this);
    }
  }
  losePartner(): void {
    if (this.partnerID !== -1) {
      if (Actor.findById(this.partnerID) instanceof GnollGuard) {
        (Actor.findById(this.partnerID)).loseSapper();
      } else if (Actor.findById(this.partnerID) instanceof GnollGeomancer) {
        (Actor.findById(this.partnerID)).loseSapper();
      }
      this.partnerID = -1;
    }
  }
  getPartner(): Actor {
    return Actor.findById(this.partnerID);
  }
  die(cause: any): void {
    super.die(cause);
    this.losePartner();
  }
  damageRoll(): number {
    return Random.NormalIntRange(1, 6);
  }
  attackSkill(target: Char): number {
    return 18;
  }
  damage(dmg: number, src: any): void {
    super.damage(dmg, src);
    this.abilityCooldown = $J.d2i(Math.fround(this.abilityCooldown - Math.fround(dmg / 10)));
  }
  drRoll(): number {
    return (super.drRoll() + Random.NormalIntRange(0, 6)) | 0;
  }
  reset(): boolean {
    return true;
  }
  spawningWeight(): number {
    return 0;
  }
  act(): boolean {
    if (this.throwingRockFromPos !== -1) {
      let attacked = Dungeon.level.map_[this.throwingRockFromPos] === Terrain.MINE_BOULDER;
      if (attacked) {
        GnollGeomancer.doRockThrowAttack(this, this.throwingRockFromPos, this.throwingRockToPos);
      }
      this.throwingRockFromPos = -1;
      this.throwingRockToPos = -1;
      this.spend(Actor.TICK);
      return !attacked;
    } else {
      return super.act();
    }
  }
  storeInBundle(bundle: Bundle): void {
    super.storeInBundle(bundle);
    bundle.put$String$int(GnollSapper.PARTNER_ID, this.partnerID);
    bundle.put$String$int(GnollSapper.SPAWN_POS, this.spawnPos);
    bundle.put$String$int(GnollSapper.ABILITY_COOLDOWN, this.abilityCooldown);
    bundle.put$String$boolean(GnollSapper.LAST_ABILITY_WAS_ROCKFALL, this.lastAbilityWasRockfall);
    bundle.put$String$int(GnollSapper.ROCK_FROM_POS, this.throwingRockFromPos);
    bundle.put$String$int(GnollSapper.ROCK_TO_POS, this.throwingRockToPos);
  }
  restoreFromBundle(bundle: Bundle): void {
    super.restoreFromBundle(bundle);
    this.partnerID = bundle.getInt(GnollSapper.PARTNER_ID);
    this.spawnPos = bundle.getInt(GnollSapper.SPAWN_POS);
    this.abilityCooldown = bundle.getInt(GnollSapper.ABILITY_COOLDOWN);
    this.lastAbilityWasRockfall = bundle.getBoolean(GnollSapper.LAST_ABILITY_WAS_ROCKFALL);
    this.throwingRockFromPos = bundle.getInt(GnollSapper.ROCK_FROM_POS);
    this.throwingRockToPos = bundle.getInt(GnollSapper.ROCK_TO_POS);
  }
}

export class GnollSapper$Hunting extends Mob$Hunting {
  _GnollSapper$Hunting(): this {
    this._Mob$Hunting();
    return this;
  }
  act(enemyInFOV: boolean, justAlerted: boolean): boolean {
    if (!enemyInFOV) {
      if (Dungeon.level.distance(this.$outer.spawnPos, this.$outer.target) > 3) {
        this.$outer.target = this.$outer.pos;
      }
      return super.act(enemyInFOV, justAlerted);
    } else {
      this.$outer.enemySeen = true;
      if (this.$outer.getPartner() != null && this.$outer.getPartner() instanceof Mob && (this.$outer.getPartner()).alignment !== this.$outer.alignment) {
        this.$outer.losePartner();
      }
      if (Actor.findById(this.$outer.partnerID) != null && Dungeon.level.distance(this.$outer.pos, this.$outer.enemy.pos) <= 3) {
        let partner = Actor.findById(this.$outer.partnerID);
        if (partner.state_ === partner.SLEEPING) {
          partner.notice();
        }
        if (this.$outer.enemy !== partner) {
          partner.target = this.$outer.enemy.pos;
          partner.aggro(this.$outer.enemy);
        }
      }
      if (this.$outer.abilityCooldown-- <= 0) {
        let targetNextToBarricade = false;
        for (let i of PathFinder.NEIGHBOURS8) {
          if ((Dungeon.level.map_[(this.$outer.enemy.pos + i) | 0]) === Terrain.BARRICADE || (Dungeon.level.map_[(this.$outer.enemy.pos + i) | 0]) === Terrain.ENTRANCE) {
            targetNextToBarricade = true;
            break;
          }
        }
        let aim = GnollGeomancer.prepRockThrowAttack(this.$outer.enemy, this.$outer);
        if (aim != null && (targetNextToBarricade || this.$outer.lastAbilityWasRockfall || Random.Int$int(2) === 0)) {
          this.$outer.lastAbilityWasRockfall = false;
          this.$outer.throwingRockFromPos = aim.sourcePos;
          this.$outer.throwingRockToPos = aim.collisionPos;
          let delay = GameMath.gate(Actor.TICK, Math.fround($J.d2i(Math.ceil(this.$outer.enemy.cooldown()))), Math.fround(3 * Actor.TICK));
          let warnPath = new Ballistica()._Ballistica(aim.sourcePos, aim.collisionPos, Ballistica.STOP_SOLID);
          for (const $it0 = warnPath.subPath(0, warnPath.dist).iterator(); $it0.hasNext(); ) {
            let i = $it0.next();
            GameScene.targetedCell$int$float(i, delay);
          }
          Dungeon.hero.interrupt();
          this.$outer.abilityCooldown = Random.NormalIntRange(4, 6);
          this.$outer.spend(delay);
          return true;
        } else if (GnollGeomancer.prepRockFallAttack(this.$outer.enemy, this.$outer, 2, true)) {
          this.$outer.lastAbilityWasRockfall = true;
          Dungeon.hero.interrupt();
          this.$outer.spend(GameMath.gate(Actor.TICK, Math.fround($J.d2i(Math.ceil(this.$outer.enemy.cooldown()))), Math.fround(3 * Actor.TICK)));
          this.$outer.abilityCooldown = Random.NormalIntRange(4, 6);
          return true;
        }
      }
      if (this.$outer.canAttack(this.$outer.enemy)) {
        return super.act(enemyInFOV, justAlerted);
      } else {
        this.$outer.spend(Actor.TICK);
        return true;
      }
    }
  }
}

export class GnollSapper$Wandering extends Mob$Wandering {
  _GnollSapper$Wandering(): this {
    this._Mob$Wandering();
    return this;
  }
  randomDestination(): number {
    return this.$outer.spawnPos;
  }
}

$J.define(GnollSapper, 'com.shatteredpixel.shatteredpixeldungeon.actors.mobs.GnollSapper', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.actors.mobs.Mob', ctors: { '': '_GnollSapper' } });
$J.define(GnollSapper$Hunting, 'com.shatteredpixel.shatteredpixeldungeon.actors.mobs.GnollSapper$Hunting', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.actors.mobs.Mob$Hunting', ctors: { '': '_GnollSapper$Hunting' }, inner: true });
$J.define(GnollSapper$Wandering, 'com.shatteredpixel.shatteredpixeldungeon.actors.mobs.GnollSapper$Wandering', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.actors.mobs.Mob$Wandering', ctors: { '': '_GnollSapper$Wandering' }, inner: true });
$J.module(() => {
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  Actor = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Actor');
  Char$Property = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Char$Property');
  GnollGeomancer = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.GnollGeomancer');
  GnollGuard = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.GnollGuard');
  Terrain = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.Terrain');
  Ballistica = $J.load('com.shatteredpixel.shatteredpixeldungeon.mechanics.Ballistica');
  GameScene = $J.load('com.shatteredpixel.shatteredpixeldungeon.scenes.GameScene');
  GnollSapperSprite = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.GnollSapperSprite');
  GameMath = $J.load('com.watabou.utils.GameMath');
  PathFinder = $J.load('com.watabou.utils.PathFinder');
  Random = $J.load('com.watabou.utils.Random');
});
