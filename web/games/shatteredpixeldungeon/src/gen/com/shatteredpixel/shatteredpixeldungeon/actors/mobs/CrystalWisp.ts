// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/actors/mobs/CrystalWisp.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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

let Badges, Dungeon, Char, Char$Property, Invisibility, Terrain, Ballistica, Messages, CharSprite, CrystalWispSprite, CrystalWispSprite$Blue, CrystalWispSprite$Green, CrystalWispSprite$Red, GLog, Random;

export class CrystalWisp extends Mob {
  static readonly SPRITE: string = 'sprite';
  _CrystalWisp(): this {
    this._Mob();
    this.spriteClass = $J.cls(CrystalWispSprite);
    this.HP = this.HT = 30;
    this.defenseSkill_ = 16;
    this.EXP = 7;
    this.maxLvl = -2;
    this.flying = true;
    this.properties_.add(Char$Property.INORGANIC);
    switch (Random.Int$int(3)) {
      case 0:
      default:
        this.spriteClass = $J.cls(CrystalWispSprite$Blue);
        break;
      case 1:
        this.spriteClass = $J.cls(CrystalWispSprite$Green);
        break;
      case 2:
        this.spriteClass = $J.cls(CrystalWispSprite$Red);
        break;
    }
    return this;
  }
  modifyPassable(passable: boolean[]): boolean[] {
    for (let i = 0; i < Dungeon.level.length(); i++) {
      passable[i] = passable[i] || Dungeon.level.map_[i] === Terrain.MINE_CRYSTAL;
    }
    return passable;
  }
  damageRoll(): number {
    return Random.NormalIntRange(5, 10);
  }
  attackSkill(target: Char): number {
    return 18;
  }
  drRoll(): number {
    return (super.drRoll() + Random.NormalIntRange(0, 5)) | 0;
  }
  canAttack(enemy: Char): boolean {
    return super.canAttack(enemy) || new Ballistica()._Ballistica(this.pos, enemy.pos, Ballistica.MAGIC_BOLT).collisionPos === enemy.pos;
  }
  doAttack(enemy: Char): boolean {
    if (Dungeon.level.adjacent(this.pos, enemy.pos) || new Ballistica()._Ballistica(this.pos, enemy.pos, Ballistica.MAGIC_BOLT).collisionPos !== enemy.pos) {
      return super.doAttack(enemy);
    } else {
      if (this.sprite_ != null && (this.sprite_.visible_ || enemy.sprite_.visible_)) {
        this.sprite_.zap$int(enemy.pos);
        return false;
      } else {
        this.zap();
        return true;
      }
    }
  }
  die(cause: any): void {
    this.flying = false;
    super.die(cause);
  }
  zap(): void {
    this.spend(1);
    Invisibility.dispel$Char(this);
    let enemy = this.enemy;
    if (Char.hit$Char$Char$boolean(this, enemy, true)) {
      let dmg = Random.NormalIntRange(5, 10);
      enemy.damage(dmg, new CrystalWisp$LightBeam()._CrystalWisp$LightBeam());
      if (!enemy.isAlive() && enemy === Dungeon.hero) {
        Badges.validateDeathFromEnemyMagic();
        Dungeon.fail(this);
        GLog.n(Messages.get$Object$String$ObjectArr(this, 'beam_kill', []), []);
      }
    } else {
      enemy.sprite_.showStatus(CharSprite.NEUTRAL, enemy.defenseVerb(), []);
    }
  }
  onZapComplete(): void {
    this.zap();
    this.next();
  }
  storeInBundle(bundle: Bundle): void {
    super.storeInBundle(bundle);
    bundle.put$String$Class(CrystalWisp.SPRITE, this.spriteClass);
  }
  restoreFromBundle(bundle: Bundle): void {
    super.restoreFromBundle(bundle);
    this.spriteClass = bundle.getClass$String(CrystalWisp.SPRITE);
  }
}

export class CrystalWisp$LightBeam extends JObject {
  _CrystalWisp$LightBeam(): this {
    return this;
  }
}

$J.define(CrystalWisp, 'com.shatteredpixel.shatteredpixeldungeon.actors.mobs.CrystalWisp', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.actors.mobs.Mob', ctors: { '': '_CrystalWisp' } });
$J.define(CrystalWisp$LightBeam, 'com.shatteredpixel.shatteredpixeldungeon.actors.mobs.CrystalWisp$LightBeam', { kind: 'class', sup: 'java.lang.Object', ctors: { '': '_CrystalWisp$LightBeam' } });
$J.module(() => {
  Badges = $J.load('com.shatteredpixel.shatteredpixeldungeon.Badges');
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  Char = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Char');
  Char$Property = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Char$Property');
  Invisibility = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Invisibility');
  Terrain = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.Terrain');
  Ballistica = $J.load('com.shatteredpixel.shatteredpixeldungeon.mechanics.Ballistica');
  Messages = $J.load('com.shatteredpixel.shatteredpixeldungeon.messages.Messages');
  CharSprite = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.CharSprite');
  CrystalWispSprite = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.CrystalWispSprite');
  CrystalWispSprite$Blue = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.CrystalWispSprite$Blue');
  CrystalWispSprite$Green = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.CrystalWispSprite$Green');
  CrystalWispSprite$Red = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.CrystalWispSprite$Red');
  GLog = $J.load('com.shatteredpixel.shatteredpixeldungeon.utils.GLog');
  Random = $J.load('com.watabou.utils.Random');
});
