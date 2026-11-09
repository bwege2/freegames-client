// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/actors/mobs/CrystalGuardian.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { Mob$Sleeping } from './Mob.ts';

let Assets$Sounds, Dungeon, Statistics, Actor, Char, Char$Property, Cripple, Doom, PinCushion, Hero, CrystalSpire, FloatingText, Splash, Bestiary, Level, Terrain, GameScene, CharSprite, CrystalGuardianSprite, CrystalGuardianSprite$Blue, CrystalGuardianSprite$Green, CrystalGuardianSprite$Red, Sample, PathFinder, Random;

export class CrystalGuardian extends Mob {
  recovering_: boolean = false;
  static readonly SPRITE: string = 'sprite';
  static readonly RECOVERING: string = 'recovering';
  _CrystalGuardian(): this {
    this._Mob();
    this.spriteClass = $J.cls(CrystalGuardianSprite);
    this.HP = this.HT = 100;
    this.defenseSkill_ = 14;
    this.EXP = 10;
    this.maxLvl = -2;
    this.SLEEPING = new CrystalGuardian$Sleeping().$o(this)._CrystalGuardian$Sleeping();
    this.state_ = this.SLEEPING;
    this.properties_.add(Char$Property.INORGANIC);
    this.properties_.add(Char$Property.MINIBOSS);
    this.recovering_ = false;
    switch (Random.Int$int(3)) {
      case 0:
      default:
        this.spriteClass = $J.cls(CrystalGuardianSprite$Blue);
        break;
      case 1:
        this.spriteClass = $J.cls(CrystalGuardianSprite$Green);
        break;
      case 2:
        this.spriteClass = $J.cls(CrystalGuardianSprite$Red);
        break;
    }
    return this;
  }
  recovering(): boolean {
    return this.recovering_;
  }
  act(): boolean {
    if (this.recovering_) {
      if (this.buff($J.cls(PinCushion)) != null) {
        this.buff($J.cls(PinCushion)).detach();
      }
      this.processSwarmIntel(false);
      this.throwItems();
      this.HP = Math.min(this.HT, (this.HP + 5) | 0);
      if (Dungeon.level.heroFOV[this.pos]) {
        this.sprite_.showStatusWithIcon(CharSprite.POSITIVE, '5', FloatingText.HEALING, []);
      }
      if (this.HP === this.HT) {
        this.recovering_ = false;
        if (this.sprite_ instanceof CrystalGuardianSprite) {
          (this.sprite_).endCrumple();
        }
      }
      this.spend(Actor.TICK);
      return true;
    }
    return super.act();
  }
  damageRoll(): number {
    return Random.NormalIntRange(10, 16);
  }
  attackSkill(target: Char): number {
    return 20;
  }
  defenseSkill(enemy: Char): number {
    if (this.recovering_) {
      return 0;
    } else {
      return super.defenseSkill(enemy);
    }
  }
  surprisedBy$Char$boolean(enemy: Char, attacking: boolean): boolean {
    if (this.recovering_) {
      return false;
    } else {
      return super.surprisedBy$Char$boolean(enemy, attacking);
    }
  }
  drRoll(): number {
    return (super.drRoll() + Random.NormalIntRange(0, 10)) | 0;
  }
  reset(): boolean {
    return true;
  }
  attack$Char$float$float$float(enemy: Char, dmgMulti: number, dmgBonus: number, accMulti: number): boolean {
    if (enemy === Dungeon.hero) {
      let spireNear = false;
      for (let m of $J.toArrayInto(Dungeon.level.mobs.toArray(), $J.newArray(0, null))) {
        if (m instanceof CrystalSpire && m.HP !== m.HT && Dungeon.level.distance(this.pos, m.pos) <= 8) {
          spireNear = true;
        }
      }
      if (!spireNear) {
        Statistics.questScores[2] = (Statistics.questScores[2] - 100) | 0;
      }
    }
    return super.attack$Char$float$float$float(enemy, dmgMulti, dmgBonus, accMulti);
  }
  defenseProc(enemy: Char, damage: number): number {
    if (this.recovering_) {
      this.sprite_.showStatusWithIcon(CharSprite.NEGATIVE, String(damage), FloatingText.PHYS_DMG_NO_BLOCK, []);
      this.HP = Math.max(1, (this.HP - damage) | 0);
      damage = -1;
    }
    return super.defenseProc(enemy, damage);
  }
  isAlive(): boolean {
    if (this.HP <= 0) {
      this.HP = 1;
      for (const $it0 = this.buffs$().iterator(); $it0.hasNext(); ) {
        let b = $it0.next();
        if (!(b instanceof Doom || b instanceof Cripple)) {
          b.detach();
        }
      }
      if (!this.recovering_) {
        this.recovering_ = true;
        Bestiary.setSeen($J.getClass(this));
        Bestiary.countEncounter($J.getClass(this));
        if (this.sprite_ != null) {
          (this.sprite_).crumple();
        }
      }
    }
    return super.isAlive();
  }
  isInvulnerable(effect: JClass): boolean {
    if (this.recovering_) {
      return super.isInvulnerable(effect) || ($J.cls(Char).isAssignableFrom(effect) && !$J.cls(Hero).isAssignableFrom(effect) && !$J.cls(CrystalSpire).isAssignableFrom(effect));
    }
    return super.isInvulnerable(effect);
  }
  spawningWeight(): number {
    return 0;
  }
  speed(): number {
    if (!Dungeon.level.openSpace[this.pos]) {
      return Math.max(0.25, Math.fround(super.speed() / 4));
    }
    return super.speed();
  }
  move$int$boolean(step: number, travelling: boolean): void {
    super.move$int$boolean(step, travelling);
    if (Dungeon.level.map_[this.pos] === Terrain.MINE_CRYSTAL) {
      Level.set$int$int(this.pos, Terrain.EMPTY);
      GameScene.updateMap$int(this.pos);
      if (Dungeon.level.heroFOV[this.pos]) {
        Splash.at$int$int$int(this.pos, 16777215, 5);
        Sample.INSTANCE.play$Object(Assets$Sounds.SHATTER);
      }
      this.spend(Math.fround(1 / super.speed()));
    }
  }
  modifyPassable(passable: boolean[]): boolean[] {
    if (this.state_ === this.HUNTING && this.target !== -1) {
      PathFinder.buildDistanceMap$int$booleanArr(this.target, passable);
      if (PathFinder.distance[this.pos] > Math.imul(2, Dungeon.level.distance(this.pos, this.target))) {
        for (let i = 0; i < Dungeon.level.length(); i++) {
          passable[i] = passable[i] || Dungeon.level.map_[i] === Terrain.MINE_CRYSTAL;
        }
      }
    }
    return passable;
  }
  beckon(cell: number): void {
    if (this.state_ === this.SLEEPING) {
    } else {
      super.beckon(cell);
    }
  }
  storeInBundle(bundle: Bundle): void {
    super.storeInBundle(bundle);
    bundle.put$String$Class(CrystalGuardian.SPRITE, this.spriteClass);
    bundle.put$String$boolean(CrystalGuardian.RECOVERING, this.recovering_);
  }
  restoreFromBundle(bundle: Bundle): void {
    super.restoreFromBundle(bundle);
    this.spriteClass = bundle.getClass$String(CrystalGuardian.SPRITE);
    this.recovering_ = bundle.getBoolean(CrystalGuardian.RECOVERING);
  }
}

export class CrystalGuardian$Sleeping extends Mob$Sleeping {
  _CrystalGuardian$Sleeping(): this {
    this._Mob$Sleeping();
    return this;
  }
  awaken(enemyInFOV: boolean): void {
    if (enemyInFOV) {
      PathFinder.buildDistanceMap$int$booleanArr(this.$outer.enemy.pos, Dungeon.level.passable);
      if (PathFinder.distance[this.$outer.pos] === 2147483647) {
        return;
      }
    }
    super.awaken(enemyInFOV);
  }
}

$J.define(CrystalGuardian, 'com.shatteredpixel.shatteredpixeldungeon.actors.mobs.CrystalGuardian', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.actors.mobs.Mob', ctors: { '': '_CrystalGuardian' }, meths: { 'move(int,boolean)': 'move$int$boolean', 'attack(com.shatteredpixel.shatteredpixeldungeon.actors.Char,float,float,float)': 'attack$Char$float$float$float', 'surprisedBy(com.shatteredpixel.shatteredpixeldungeon.actors.Char,boolean)': 'surprisedBy$Char$boolean' } });
$J.define(CrystalGuardian$Sleeping, 'com.shatteredpixel.shatteredpixeldungeon.actors.mobs.CrystalGuardian$Sleeping', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.actors.mobs.Mob$Sleeping', ctors: { '': '_CrystalGuardian$Sleeping' }, inner: true });
$J.module(() => {
  Assets$Sounds = $J.load('com.shatteredpixel.shatteredpixeldungeon.Assets$Sounds');
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  Statistics = $J.load('com.shatteredpixel.shatteredpixeldungeon.Statistics');
  Actor = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Actor');
  Char = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Char');
  Char$Property = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Char$Property');
  Cripple = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Cripple');
  Doom = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Doom');
  PinCushion = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.PinCushion');
  Hero = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.Hero');
  CrystalSpire = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.CrystalSpire');
  FloatingText = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.FloatingText');
  Splash = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.Splash');
  Bestiary = $J.load('com.shatteredpixel.shatteredpixeldungeon.journal.Bestiary');
  Level = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.Level');
  Terrain = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.Terrain');
  GameScene = $J.load('com.shatteredpixel.shatteredpixeldungeon.scenes.GameScene');
  CharSprite = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.CharSprite');
  CrystalGuardianSprite = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.CrystalGuardianSprite');
  CrystalGuardianSprite$Blue = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.CrystalGuardianSprite$Blue');
  CrystalGuardianSprite$Green = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.CrystalGuardianSprite$Green');
  CrystalGuardianSprite$Red = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.CrystalGuardianSprite$Red');
  Sample = $J.load('com.watabou.noosa.audio.Sample');
  PathFinder = $J.load('com.watabou.utils.PathFinder');
  Random = $J.load('com.watabou.utils.Random');
});
