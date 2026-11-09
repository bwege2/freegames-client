// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/actors/mobs/npcs/MirrorImage.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { NPC } from './NPC.ts';
import { Invisibility } from '../../buffs/Invisibility.ts';

let Dungeon, Actor, Char, Char$Alignment, CorrosiveGas, ToxicGas, AllyBuff, Buff, Burning, HeroSubClass, BodyForm$BodyFormBuff, HolyWeapon, HolyWeapon$HolyWepBuff, Mob, RingOfAccuracy, RingOfEvasion, Weapon$Enchantment, WornShortsword, Messages, MirrorSprite, BuffIndicator, GLog, Random;

export class MirrorImage extends NPC {
  hero: Hero = null;
  heroID: number = 0;
  armTier: number = 0;
  static readonly HEROID: string = 'hero_id';
  _MirrorImage(): this {
    this._NPC();
    this.spriteClass = $J.cls(MirrorSprite);
    this.HP = this.HT = 1;
    this.defenseSkill_ = 1;
    this.alignment = Char$Alignment.ALLY;
    this.state_ = this.HUNTING;
    this.actPriority = (Actor.MOB_PRIO + 1) | 0;
    this.immunities_.add($J.cls(ToxicGas));
    this.immunities_.add($J.cls(CorrosiveGas));
    this.immunities_.add($J.cls(Burning));
    this.immunities_.add($J.cls(AllyBuff));
    return this;
  }
  act(): boolean {
    if (this.hero == null) {
      this.hero = Actor.findById(this.heroID);
      if (this.hero == null) {
        this.die(null);
        this.sprite_.killAndErase();
        return true;
      }
    }
    if (this.hero.tier() !== this.armTier) {
      this.armTier = this.hero.tier();
      (this.sprite_).updateArmor$int(this.armTier);
    }
    return super.act();
  }
  storeInBundle(bundle: Bundle): void {
    super.storeInBundle(bundle);
    bundle.put$String$int(MirrorImage.HEROID, this.heroID);
  }
  restoreFromBundle(bundle: Bundle): void {
    super.restoreFromBundle(bundle);
    this.heroID = bundle.getInt(MirrorImage.HEROID);
  }
  duplicate(hero: Hero): void {
    this.hero = hero;
    this.heroID = this.hero.id();
    Buff.affect$Char$Class$float(this, $J.cls(MirrorImage$MirrorInvis), Math.fround(32767));
  }
  damageRoll(): number {
    let damage: number;
    if (this.hero.belongings.weapon() != null) {
      damage = this.hero.belongings.weapon().damageRoll(this);
    } else {
      damage = this.hero.damageRoll();
    }
    return $J.idiv(((damage + 1) | 0), 2);
  }
  attackSkill(target: Char): number {
    let attackSkill = (9 + this.hero.lvl) | 0;
    attackSkill = $J.d2i(Math.fround(attackSkill * RingOfAccuracy.accuracyMultiplier(this.hero)));
    if (this.hero.belongings.attackingWeapon() != null) {
      attackSkill = $J.d2i(Math.fround(attackSkill * this.hero.belongings.attackingWeapon().accuracyFactor(this, target)));
    }
    return attackSkill;
  }
  defenseSkill(enemy: Char): number {
    if (this.hero != null) {
      let baseEvasion = (4 + this.hero.lvl) | 0;
      let heroEvasion = $J.d2i((Math.fround(((4 + this.hero.lvl) | 0) * RingOfEvasion.evasionMultiplier(this.hero))));
      return $J.idiv(Math.imul(super.defenseSkill(enemy), ((baseEvasion + heroEvasion) | 0)), 2);
    } else {
      return 0;
    }
  }
  attackDelay(): number {
    return this.hero.attackDelay();
  }
  canAttack(enemy: Char): boolean {
    return super.canAttack(enemy) || (this.hero.belongings.weapon() != null && this.hero.belongings.weapon().canReach(this, enemy.pos));
  }
  drRoll(): number {
    let dr = super.drRoll();
    if (this.hero != null && this.hero.belongings.weapon() != null) {
      return (dr + Random.NormalIntRange(0, $J.idiv(this.hero.belongings.weapon().defenseFactor(this), 2))) | 0;
    } else {
      return dr;
    }
  }
  attackProc(enemy: Char, damage: number): number {
    damage = super.attackProc(enemy, damage);
    let buff = this.buff($J.cls(MirrorImage$MirrorInvis));
    if (buff != null) {
      buff.detach();
    }
    if (enemy instanceof Mob) {
      (enemy).aggro(this);
    }
    if (this.hero.belongings.weapon() != null) {
      damage = this.hero.belongings.weapon().proc(this, enemy, damage);
      if (!enemy.isAlive() && enemy === Dungeon.hero) {
        Dungeon.fail(this);
        GLog.n(Messages.capitalize(Messages.get$Class$String$ObjectArr($J.cls(Char), 'kill', [this.name()])), []);
      }
      return damage;
    } else {
      let wasEnemy = enemy.alignment === Char$Alignment.ENEMY;
      if (this.hero.buff($J.cls(BodyForm$BodyFormBuff)) != null && this.hero.buff($J.cls(BodyForm$BodyFormBuff)).enchant() != null) {
        damage = this.hero.buff($J.cls(BodyForm$BodyFormBuff)).enchant().proc(new WornShortsword()._WornShortsword(), this, enemy, damage);
      }
      if (!wasEnemy || enemy.alignment === Char$Alignment.ENEMY) {
        if (this.hero.buff($J.cls(HolyWeapon$HolyWepBuff)) != null) {
          let dmg = this.hero.subClass === HeroSubClass.PALADIN ? 6 : 2;
          enemy.damage($J.roundf(Math.fround(dmg * Weapon$Enchantment.genericProcChanceMultiplier(this))), HolyWeapon.INSTANCE);
        }
      }
      return damage;
    }
  }
  sprite(): CharSprite {
    let s = super.sprite();
    this.hero = Actor.findById(this.heroID);
    if (this.hero != null) {
      this.armTier = this.hero.tier();
    } else {
      this.armTier = 1;
    }
    (s).updateArmor$int(this.armTier);
    return s;
  }
}

export class MirrorImage$MirrorInvis extends Invisibility {
  _MirrorImage$MirrorInvis(): this {
    this._Invisibility();
    this.announced = false;
    return this;
  }
  icon(): number {
    return BuffIndicator.NONE;
  }
}

$J.define(MirrorImage, 'com.shatteredpixel.shatteredpixeldungeon.actors.mobs.npcs.MirrorImage', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.actors.mobs.npcs.NPC', ctors: { '': '_MirrorImage' } });
$J.define(MirrorImage$MirrorInvis, 'com.shatteredpixel.shatteredpixeldungeon.actors.mobs.npcs.MirrorImage$MirrorInvis', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Invisibility', ctors: { '': '_MirrorImage$MirrorInvis' } });
$J.module(() => {
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  Actor = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Actor');
  Char = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Char');
  Char$Alignment = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Char$Alignment');
  CorrosiveGas = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.blobs.CorrosiveGas');
  ToxicGas = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.blobs.ToxicGas');
  AllyBuff = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.AllyBuff');
  Buff = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Buff');
  Burning = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Burning');
  HeroSubClass = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.HeroSubClass');
  BodyForm$BodyFormBuff = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.spells.BodyForm$BodyFormBuff');
  HolyWeapon = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.spells.HolyWeapon');
  HolyWeapon$HolyWepBuff = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.spells.HolyWeapon$HolyWepBuff');
  Mob = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.Mob');
  RingOfAccuracy = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.rings.RingOfAccuracy');
  RingOfEvasion = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.rings.RingOfEvasion');
  Weapon$Enchantment = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.weapon.Weapon$Enchantment');
  WornShortsword = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.weapon.melee.WornShortsword');
  Messages = $J.load('com.shatteredpixel.shatteredpixeldungeon.messages.Messages');
  MirrorSprite = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.MirrorSprite');
  BuffIndicator = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.BuffIndicator');
  GLog = $J.load('com.shatteredpixel.shatteredpixeldungeon.utils.GLog');
  Random = $J.load('com.watabou.utils.Random');
});
