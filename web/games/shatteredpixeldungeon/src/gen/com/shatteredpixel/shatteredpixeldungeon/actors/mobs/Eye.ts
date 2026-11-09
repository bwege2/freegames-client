// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/actors/mobs/Eye.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { $J, JObject } from '../../../../../../jre/index.ts';
import { Mob } from './Mob.ts';
import { Mob$Hunting } from './Mob.ts';

let Badges, Dungeon, Actor, Char, Char$Property, AscensionChallenge, Invisibility, Light, CellEmitter, PurpleParticle, Dewdrop, Generator, Generator$Category, WandOfDisintegration, DisintegrationTrap, Ballistica, Messages, GameScene, CharSprite, EyeSprite, GLog, PathFinder, Random;

export class Eye extends Mob {
  beam: Ballistica = null;
  beamTarget: number = 0;
  beamCooldown: number = 0;
  beamCharged: boolean = false;
  static readonly BEAM_TARGET: string = 'beamTarget';
  static readonly BEAM_COOLDOWN: string = 'beamCooldown';
  static readonly BEAM_CHARGED: string = 'beamCharged';
  _Eye(): this {
    this._Mob();
    this.spriteClass = $J.cls(EyeSprite);
    this.HP = this.HT = 100;
    this.defenseSkill_ = 20;
    this.viewDistance = Light.DISTANCE;
    this.EXP = 13;
    this.maxLvl = 26;
    this.flying = true;
    this.HUNTING = new Eye$Hunting().$o(this)._Eye$Hunting();
    this.loot = new Dewdrop()._Dewdrop();
    this.lootChance_ = 1;
    this.properties_.add(Char$Property.DEMONIC);
    this.beamTarget = -1;
    this.resistances_.add($J.cls(WandOfDisintegration));
    this.resistances_.add($J.cls(Eye$DeathGaze));
    this.resistances_.add($J.cls(DisintegrationTrap));
    return this;
  }
  damageRoll(): number {
    return Random.NormalIntRange(20, 30);
  }
  attackSkill(target: Char): number {
    return 30;
  }
  drRoll(): number {
    return (super.drRoll() + Random.NormalIntRange(0, 10)) | 0;
  }
  canAttack(enemy: Char): boolean {
    if (this.beamCooldown === 0) {
      let aim = new Ballistica()._Ballistica(this.pos, enemy.pos, Ballistica.STOP_SOLID);
      if (enemy.invisible === 0 && !this.isCharmedBy(enemy) && this.fieldOfView[enemy.pos] && (super.canAttack(enemy) || aim.subPath(1, aim.dist).contains(enemy.pos))) {
        this.beam = aim;
        this.beamTarget = enemy.pos;
        return true;
      } else {
        return this.beamCharged;
      }
    } else {
      return super.canAttack(enemy);
    }
  }
  act(): boolean {
    if (this.beamCharged && this.state_ !== this.HUNTING) {
      this.beamCharged = false;
      this.sprite_.idle();
    }
    if (this.beam == null && this.beamTarget !== -1) {
      this.beam = new Ballistica()._Ballistica(this.pos, this.beamTarget, Ballistica.STOP_SOLID);
      this.sprite_.turnTo(this.pos, this.beamTarget);
    }
    if (this.beamCooldown > 0) {
      this.beamCooldown--;
    }
    return super.act();
  }
  doAttack(enemy: Char): boolean {
    this.beam = new Ballistica()._Ballistica(this.pos, this.beamTarget, Ballistica.STOP_SOLID);
    if (this.beamCooldown > 0 || (!this.beamCharged && !this.beam.subPath(1, this.beam.dist).contains(enemy.pos))) {
      return super.doAttack(enemy);
    } else if (!this.beamCharged) {
      (this.sprite_).charge(enemy.pos);
      this.spend(Math.fround(this.attackDelay() * 2));
      this.beamCharged = true;
      return true;
    } else {
      this.spend(this.attackDelay());
      if (Dungeon.level.heroFOV[this.pos] || Dungeon.level.heroFOV[this.beam.collisionPos]) {
        this.sprite_.zap$int(this.beam.collisionPos);
        return false;
      } else {
        this.sprite_.idle();
        this.deathGaze();
        return true;
      }
    }
  }
  damage(dmg: number, src: any): void {
    if (this.beamCharged) {
      dmg = $J.idiv(dmg, 4);
    }
    super.damage(dmg, src);
  }
  die(cause: any): void {
    this.flying = false;
    super.die(cause);
  }
  deathGaze(): void {
    if (!this.beamCharged || this.beamCooldown > 0 || this.beam == null) {
      return;
    }
    this.beamCharged = false;
    this.beamCooldown = Random.IntRange(4, 6);
    let terrainAffected = false;
    Invisibility.dispel$Char(this);
    for (const $it0 = this.beam.subPath(1, this.beam.dist).iterator(); $it0.hasNext(); ) {
      let pos = $it0.next();
      if (Dungeon.level.flamable[pos]) {
        Dungeon.level.destroy(pos);
        GameScene.updateMap$int(pos);
        terrainAffected = true;
      }
      let ch = Actor.findChar(pos);
      if (ch == null) {
        continue;
      }
      if (Char.hit$Char$Char$boolean(this, ch, true)) {
        let dmg = Random.NormalIntRange(30, 50);
        dmg = $J.roundf(Math.fround(dmg * AscensionChallenge.statModifier(this)));
        ch.damage(dmg, new Eye$DeathGaze()._Eye$DeathGaze());
        if (Dungeon.level.heroFOV[pos]) {
          ch.sprite_.flash();
          CellEmitter.center(pos).burst(PurpleParticle.BURST, Random.IntRange(1, 2));
        }
        if (!ch.isAlive() && ch === Dungeon.hero) {
          Badges.validateDeathFromEnemyMagic();
          Dungeon.fail(this);
          GLog.n(Messages.get$Object$String$ObjectArr(this, 'deathgaze_kill', []), []);
        }
      } else {
        ch.sprite_.showStatus(CharSprite.NEUTRAL, ch.defenseVerb(), []);
      }
    }
    if (terrainAffected) {
      Dungeon.observe$();
    }
    this.beam = null;
    this.beamTarget = -1;
  }
  createLoot(): Item {
    let loot: Item;
    {
      let ofs: number;
      switch (Random.Int$int(4)) {
        case 0:
        case 1:
        default:
          loot = new Dewdrop()._Dewdrop();
          do {
            ofs = PathFinder.NEIGHBOURS8[Random.Int$int(8)];
          } while (Dungeon.level.solid[(this.pos + ofs) | 0] && !(Dungeon.level.passable[(this.pos + ofs) | 0]));
          if (Dungeon.level.heaps.get((this.pos + ofs) | 0) == null) {
            Dungeon.level.drop(new Dewdrop()._Dewdrop(), (this.pos + ofs) | 0).sprite_.drop$int(this.pos);
          } else {
            Dungeon.level.drop(new Dewdrop()._Dewdrop(), (this.pos + ofs) | 0).sprite_.drop$int((this.pos + ofs) | 0);
          }
          break;
        case 2:
          loot = Generator.randomUsingDefaults$Category(Generator$Category.SEED);
          break;
        case 3:
          loot = Generator.randomUsingDefaults$Category(Generator$Category.STONE);
          break;
      }
    }
    return loot;
  }
  storeInBundle(bundle: Bundle): void {
    super.storeInBundle(bundle);
    bundle.put$String$int(Eye.BEAM_TARGET, this.beamTarget);
    bundle.put$String$int(Eye.BEAM_COOLDOWN, this.beamCooldown);
    bundle.put$String$boolean(Eye.BEAM_CHARGED, this.beamCharged);
  }
  restoreFromBundle(bundle: Bundle): void {
    super.restoreFromBundle(bundle);
    if (bundle.contains(Eye.BEAM_TARGET)) {
      this.beamTarget = bundle.getInt(Eye.BEAM_TARGET);
    }
    this.beamCooldown = bundle.getInt(Eye.BEAM_COOLDOWN);
    this.beamCharged = bundle.getBoolean(Eye.BEAM_CHARGED);
  }
}

export class Eye$DeathGaze extends JObject {
  _Eye$DeathGaze(): this {
    return this;
  }
}

export class Eye$Hunting extends Mob$Hunting {
  _Eye$Hunting(): this {
    this._Mob$Hunting();
    return this;
  }
  act(enemyInFOV: boolean, justAlerted: boolean): boolean {
    if (this.$outer.beamCharged && this.$outer.enemy != null && this.$outer.canAttack(this.$outer.enemy)) {
      this.$outer.enemySeen = enemyInFOV;
      return this.$outer.doAttack(this.$outer.enemy);
    }
    return super.act(enemyInFOV, justAlerted);
  }
}

$J.define(Eye, 'com.shatteredpixel.shatteredpixeldungeon.actors.mobs.Eye', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.actors.mobs.Mob', ctors: { '': '_Eye' } });
$J.define(Eye$DeathGaze, 'com.shatteredpixel.shatteredpixeldungeon.actors.mobs.Eye$DeathGaze', { kind: 'class', sup: 'java.lang.Object', ctors: { '': '_Eye$DeathGaze' } });
$J.define(Eye$Hunting, 'com.shatteredpixel.shatteredpixeldungeon.actors.mobs.Eye$Hunting', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.actors.mobs.Mob$Hunting', ctors: { '': '_Eye$Hunting' }, inner: true });
$J.module(() => {
  Badges = $J.load('com.shatteredpixel.shatteredpixeldungeon.Badges');
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  Actor = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Actor');
  Char = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Char');
  Char$Property = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Char$Property');
  AscensionChallenge = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.AscensionChallenge');
  Invisibility = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Invisibility');
  Light = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Light');
  CellEmitter = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.CellEmitter');
  PurpleParticle = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.particles.PurpleParticle');
  Dewdrop = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.Dewdrop');
  Generator = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.Generator');
  Generator$Category = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.Generator$Category');
  WandOfDisintegration = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.wands.WandOfDisintegration');
  DisintegrationTrap = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.traps.DisintegrationTrap');
  Ballistica = $J.load('com.shatteredpixel.shatteredpixeldungeon.mechanics.Ballistica');
  Messages = $J.load('com.shatteredpixel.shatteredpixeldungeon.messages.Messages');
  GameScene = $J.load('com.shatteredpixel.shatteredpixeldungeon.scenes.GameScene');
  CharSprite = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.CharSprite');
  EyeSprite = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.EyeSprite');
  GLog = $J.load('com.shatteredpixel.shatteredpixeldungeon.utils.GLog');
  PathFinder = $J.load('com.watabou.utils.PathFinder');
  Random = $J.load('com.watabou.utils.Random');
});
