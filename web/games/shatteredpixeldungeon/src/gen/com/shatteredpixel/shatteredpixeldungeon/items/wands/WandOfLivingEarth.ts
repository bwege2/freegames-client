// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/items/wands/WandOfLivingEarth.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { DamageWand } from './DamageWand.ts';
import { Buff } from '../../actors/buffs/Buff.ts';
import { NPC } from '../../actors/mobs/npcs/NPC.ts';
import { Mob$Wandering } from '../../actors/mobs/Mob.ts';

let Assets$Sounds, Challenges, Dungeon, Actor, Char$Alignment, Char$Property, AllyBuff, Amok, Buff$buffType, PowerOfMany$PowerBuff, Stasis, Mimic, Mob, FloatingText, MagicMissile, MagicMissile$EarthParticle, Item, Wand, Messages, GameScene, CharSprite, EarthGuardianSprite, ItemSpriteSheet, BuffIndicator, Sample, ColorMath, PathFinder, Random;

export class WandOfLivingEarth extends DamageWand {
  _WandOfLivingEarth(): this {
    this._DamageWand();
    this.image_ = ItemSpriteSheet.WAND_LIVING_EARTH;
    return this;
  }
  min$int(lvl: number): number {
    return 4;
  }
  max$int(lvl: number): number {
    return (6 + Math.imul(2, lvl)) | 0;
  }
  onZap(bolt: Ballistica): void {
    let ch = Actor.findChar(bolt.collisionPos);
    let damage = this.damageRoll$();
    let armorToAdd = damage;
    let guardian = null;
    for (const $it0 = Dungeon.level.mobs.iterator(); $it0.hasNext(); ) {
      let m = $it0.next();
      if (m instanceof WandOfLivingEarth$EarthGuardian) {
        guardian = m;
        break;
      }
    }
    if (Stasis.getStasisAlly() instanceof WandOfLivingEarth$EarthGuardian) {
      guardian = Stasis.getStasisAlly();
    }
    let buff = Item.curUser.buff($J.cls(WandOfLivingEarth$RockArmor));
    if ((guardian == null || ch !== guardian) && (ch == null || ch.alignment === Char$Alignment.ALLY || ch.alignment === Char$Alignment.NEUTRAL && !(ch instanceof Mimic))) {
      armorToAdd = 0;
    } else {
      if (buff == null && guardian == null) {
        buff = Buff.affect$Char$Class(Item.curUser, $J.cls(WandOfLivingEarth$RockArmor));
      }
      if (buff != null) {
        buff.addArmor(this.buffedLvl(), armorToAdd);
      }
    }
    if (guardian != null && guardian === ch) {
      guardian.sprite_.centerEmitter().burst(MagicMissile$EarthParticle.ATTRACT, (8 + $J.idiv(this.buffedLvl(), 2)) | 0);
      guardian.setInfo(Item.curUser, this.buffedLvl(), armorToAdd);
      this.wandProc(guardian, this.chargesPerCast());
      Sample.INSTANCE.play$Object$float$float(Assets$Sounds.HIT_MAGIC, 1, Math.fround(Math.fround(0.9) * Random.Float$float$float(Math.fround(0.87), Math.fround(1.15))));
    } else if (guardian == null && buff != null && buff.armor_ >= buff.armorToGuardian()) {
      guardian = new WandOfLivingEarth$EarthGuardian()._WandOfLivingEarth$EarthGuardian();
      guardian.setInfo(Item.curUser, this.buffedLvl(), buff.armor_);
      if (buff.powerOfManyTurns > Math.fround(0)) {
        Buff.affect$Char$Class$float(guardian, $J.cls(PowerOfMany$PowerBuff), buff.powerOfManyTurns);
      }
      if (ch != null) {
        ch.sprite_.centerEmitter().burst(MagicMissile$EarthParticle.BURST, (5 + $J.idiv(this.buffedLvl(), 2)) | 0);
        this.wandProc(ch, this.chargesPerCast());
        ch.damage(damage, this);
        let closest = -1;
        let passable = Dungeon.level.passable;
        for (let n of PathFinder.NEIGHBOURS9) {
          let c = (bolt.collisionPos + n) | 0;
          if (passable[c] && Actor.findChar(c) == null && (closest === -1 || (Dungeon.level.trueDistance(c, Item.curUser.pos) < (Dungeon.level.trueDistance(closest, Item.curUser.pos))))) {
            closest = c;
          }
        }
        if (closest === -1) {
          if (armorToAdd > 0) {
            Item.curUser.sprite_.centerEmitter().burst(MagicMissile$EarthParticle.ATTRACT, (8 + $J.idiv(this.buffedLvl(), 2)) | 0);
          }
          return;
        } else {
          guardian.pos = closest;
          GameScene.add$Mob$float(guardian, 1);
          Dungeon.level.occupyCell(guardian);
        }
        if (ch.alignment === Char$Alignment.ENEMY || ch.buff($J.cls(Amok)) != null) {
          guardian.aggro(ch);
        }
      } else {
        guardian.pos = bolt.collisionPos;
        GameScene.add$Mob$float(guardian, 1);
        Dungeon.level.occupyCell(guardian);
      }
      guardian.sprite_.centerEmitter().burst(MagicMissile$EarthParticle.ATTRACT, (8 + $J.idiv(this.buffedLvl(), 2)) | 0);
      buff.detach();
      Sample.INSTANCE.play$Object$float$float(Assets$Sounds.HIT_MAGIC, 1, Math.fround(Math.fround(0.9) * Random.Float$float$float(Math.fround(0.87), Math.fround(1.15))));
    } else {
      if (ch != null) {
        ch.sprite_.centerEmitter().burst(MagicMissile$EarthParticle.BURST, (5 + $J.idiv(this.buffedLvl(), 2)) | 0);
        this.wandProc(ch, this.chargesPerCast());
        ch.damage(damage, this);
        Sample.INSTANCE.play$Object$float$float(Assets$Sounds.HIT_MAGIC, 1, Math.fround(Math.fround(0.8) * Random.Float$float$float(Math.fround(0.87), Math.fround(1.15))));
        if (guardian == null) {
          if (armorToAdd > 0) {
            Item.curUser.sprite_.centerEmitter().burst(MagicMissile$EarthParticle.ATTRACT, (8 + $J.idiv(this.buffedLvl(), 2)) | 0);
          }
        } else {
          if (guardian.sprite_ != null) {
            guardian.sprite_.centerEmitter().burst(MagicMissile$EarthParticle.ATTRACT, (8 + $J.idiv(this.buffedLvl(), 2)) | 0);
          }
          guardian.setInfo(Item.curUser, this.buffedLvl(), armorToAdd);
          if (ch.alignment === Char$Alignment.ENEMY || ch.buff($J.cls(Amok)) != null) {
            guardian.aggro(ch);
          }
        }
      } else {
        Dungeon.level.pressCell$int(bolt.collisionPos);
      }
    }
  }
  upgradeStat2(level: number): string {
    return String((16 + Math.imul(8, level)) | 0);
  }
  upgradeStat3(level: number): string {
    if (Dungeon.isChallenged(Challenges.NO_ARMOR)) {
      return level + '-' + ((2 + level) | 0);
    } else {
      return level + '-' + ((3 + (Math.imul(3, level))) | 0);
    }
  }
  fx(bolt: Ballistica, callback: Callback): void {
    MagicMissile.boltFromChar(Item.curUser.sprite_.parent, MagicMissile.EARTH, Item.curUser.sprite_, bolt.collisionPos, callback);
    Sample.INSTANCE.play$Object(Assets$Sounds.ZAP);
  }
  onHit(staff: MagesStaff, attacker: Char, defender: Char, damage: number): void {
    let guardian = null;
    for (const $it1 = Dungeon.level.mobs.iterator(); $it1.hasNext(); ) {
      let m = $it1.next();
      if (m instanceof WandOfLivingEarth$EarthGuardian) {
        guardian = m;
        break;
      }
    }
    let armor = $J.roundf(Math.fround(Math.fround(damage * Math.fround(0.33)) * Wand.procChanceMultiplier(attacker)));
    if (guardian != null) {
      guardian.sprite_.centerEmitter().burst(MagicMissile$EarthParticle.ATTRACT, (8 + $J.idiv(this.buffedLvl(), 2)) | 0);
      guardian.setInfo(Dungeon.hero, this.buffedLvl(), armor);
    } else {
      attacker.sprite_.centerEmitter().burst(MagicMissile$EarthParticle.ATTRACT, (8 + $J.idiv(this.buffedLvl(), 2)) | 0);
      Buff.affect$Char$Class(attacker, $J.cls(WandOfLivingEarth$RockArmor)).addArmor(this.buffedLvl(), armor);
    }
  }
  staffFx(particle: MagesStaff$StaffParticle): void {
    if (Random.Int$int(10) === 0) {
      particle.color$int(ColorMath.random(16774504, 8419610));
    } else {
      particle.color$int(ColorMath.random(8410368, 3351808));
    }
    particle.am = 1;
    particle.setLifespan(2);
    particle.setSize(1, 2);
    particle.shuffleXY(0.5);
    let dst = Random.Float$float(11);
    particle.x = Math.fround(particle.x - dst);
    particle.y = Math.fround(particle.y + dst);
  }
}

export class WandOfLivingEarth$RockArmor extends Buff {
  wandLevel: number = 0;
  armor_: number = 0;
  powerOfManyTurns: number = 0;
  static readonly WAND_LEVEL: string = 'wand_level';
  static readonly ARMOR: string = 'armor';
  static readonly POWER_TURNS: string = 'power_turns';
  _WandOfLivingEarth$RockArmor(): this {
    this._Buff();
    this.type_ = Buff$buffType.POSITIVE;
    this.powerOfManyTurns = 0;
    return this;
  }
  act(): boolean {
    if (this.powerOfManyTurns > Math.fround(0)) {
      this.powerOfManyTurns--;
      if (this.powerOfManyTurns <= Math.fround(0)) {
        this.powerOfManyTurns = 0;
        BuffIndicator.refreshHero();
      }
    }
    this.spend(Actor.TICK);
    return true;
  }
  addArmor(wandLevel: number, toAdd: number): void {
    this.wandLevel = Math.max(this.wandLevel, wandLevel);
    this.armor_ = (this.armor_ + toAdd) | 0;
    this.armor_ = Math.min(this.armor_, Math.imul(2, this.armorToGuardian()));
  }
  armorToGuardian(): number {
    return (8 + Math.imul(this.wandLevel, 4)) | 0;
  }
  absorb(damage: number): number {
    let block = (damage - $J.idiv(damage, 2)) | 0;
    if (this.armor_ <= block) {
      this.detach();
      return (damage - this.armor_) | 0;
    } else {
      this.armor_ = (this.armor_ - block) | 0;
      return (damage - block) | 0;
    }
  }
  isEmpowered(): boolean {
    return this.powerOfManyTurns > Math.fround(0);
  }
  icon(): number {
    return BuffIndicator.ARMOR;
  }
  tintIcon(icon: Image): void {
    if (this.isEmpowered()) {
      icon.hardlight$float$float$float(Math.fround(1.8), Math.fround(1.8), Math.fround(0.6));
    } else {
      icon.brightness(Math.fround(0.6));
    }
  }
  iconFadePercent(): number {
    return Math.max(0, Math.fround(((this.armorToGuardian() - this.armor_) | 0) / Math.fround(this.armorToGuardian())));
  }
  iconTextDisplay(): string {
    return String(this.armor_);
  }
  desc(): string {
    let desc = Messages.get$Object$String$ObjectArr(this, 'desc', [this.armor_, this.armorToGuardian()]);
    if (this.isEmpowered()) {
      desc += '\n\n' + Messages.get$Object$String$ObjectArr(this, 'desc_many', [$J.d2i(this.powerOfManyTurns)]);
    }
    return desc;
  }
  storeInBundle(bundle: Bundle): void {
    super.storeInBundle(bundle);
    bundle.put$String$int(WandOfLivingEarth$RockArmor.WAND_LEVEL, this.wandLevel);
    bundle.put$String$int(WandOfLivingEarth$RockArmor.ARMOR, this.armor_);
    bundle.put$String$float(WandOfLivingEarth$RockArmor.POWER_TURNS, this.powerOfManyTurns);
  }
  restoreFromBundle(bundle: Bundle): void {
    super.restoreFromBundle(bundle);
    this.wandLevel = bundle.getInt(WandOfLivingEarth$RockArmor.WAND_LEVEL);
    this.armor_ = bundle.getInt(WandOfLivingEarth$RockArmor.ARMOR);
    this.powerOfManyTurns = bundle.getFloat(WandOfLivingEarth$RockArmor.POWER_TURNS);
  }
}

export class WandOfLivingEarth$EarthGuardian extends NPC {
  wandLevel: number = 0;
  static readonly DEFENSE: string = 'defense';
  static readonly WAND_LEVEL: string = 'wand_level';
  _WandOfLivingEarth$EarthGuardian(): this {
    this._NPC();
    this.spriteClass = $J.cls(EarthGuardianSprite);
    this.alignment = Char$Alignment.ALLY;
    this.state_ = this.HUNTING;
    this.intelligentAlly = true;
    this.properties_.add(Char$Property.INORGANIC);
    this.WANDERING = new WandOfLivingEarth$EarthGuardian$Wandering().$o(this)._WandOfLivingEarth$EarthGuardian$Wandering();
    this.actPriority = (Actor.MOB_PRIO + 1) | 0;
    this.HP = this.HT = 0;
    this.wandLevel = -1;
    this.immunities_.add($J.cls(AllyBuff));
    return this;
  }
  setInfo(hero: Hero, wandLevel: number, healthToAdd: number): void {
    if (wandLevel > this.wandLevel) {
      this.wandLevel = wandLevel;
      this.HT = (16 + Math.imul(8, wandLevel)) | 0;
    }
    if (this.HP !== 0 && this.sprite_ != null) {
      this.sprite_.showStatusWithIcon(CharSprite.POSITIVE, String(healthToAdd), FloatingText.HEALING, []);
    }
    this.HP = Math.min(this.HT, (this.HP + healthToAdd) | 0);
    this.defenseSkill_ = $J.idiv(((hero.lvl + 4) | 0), 2);
  }
  attackSkill(target: Char): number {
    return (Math.imul(2, this.defenseSkill_) + 5) | 0;
  }
  attackProc(enemy: Char, damage: number): number {
    if (enemy instanceof Mob) {
      (enemy).aggro(this);
    }
    return super.attackProc(enemy, damage);
  }
  damageRoll(): number {
    return Random.NormalIntRange(2, (4 + $J.idiv(Dungeon.scalingDepth(), 2)) | 0);
  }
  drRoll(): number {
    let dr = super.drRoll();
    if (Dungeon.isChallenged(Challenges.NO_ARMOR)) {
      return (dr + (Random.NormalIntRange(this.wandLevel, (2 + this.wandLevel) | 0))) | 0;
    } else {
      return (dr + (Random.NormalIntRange(this.wandLevel, (3 + Math.imul(3, this.wandLevel)) | 0))) | 0;
    }
  }
  description(): string {
    let desc = Messages.get$Object$String$ObjectArr(this, 'desc', []);
    if (Actor.chars().contains(this)) {
      if (Dungeon.isChallenged(Challenges.NO_ARMOR)) {
        desc += '\n\n' + (Messages.get$Object$String$ObjectArr(this, 'wand_info', [this.wandLevel, (2 + this.wandLevel) | 0]));
      } else {
        desc += '\n\n' + (Messages.get$Object$String$ObjectArr(this, 'wand_info', [this.wandLevel, (3 + Math.imul(3, this.wandLevel)) | 0]));
      }
    }
    return desc;
  }
  storeInBundle(bundle: Bundle): void {
    super.storeInBundle(bundle);
    bundle.put$String$int(WandOfLivingEarth$EarthGuardian.DEFENSE, this.defenseSkill_);
    bundle.put$String$int(WandOfLivingEarth$EarthGuardian.WAND_LEVEL, this.wandLevel);
  }
  restoreFromBundle(bundle: Bundle): void {
    super.restoreFromBundle(bundle);
    this.defenseSkill_ = bundle.getInt(WandOfLivingEarth$EarthGuardian.DEFENSE);
    this.wandLevel = bundle.getInt(WandOfLivingEarth$EarthGuardian.WAND_LEVEL);
  }
}

export class WandOfLivingEarth$EarthGuardian$Wandering extends Mob$Wandering {
  _WandOfLivingEarth$EarthGuardian$Wandering(): this {
    this._Mob$Wandering();
    return this;
  }
  act(enemyInFOV: boolean, justAlerted: boolean): boolean {
    if (!enemyInFOV) {
      Buff.affect$Char$Class(Dungeon.hero, $J.cls(WandOfLivingEarth$RockArmor)).addArmor(this.$outer.wandLevel, this.$outer.HP);
      if (this.$outer.buff($J.cls(PowerOfMany$PowerBuff)) != null) {
        Buff.affect$Char$Class(Dungeon.hero, $J.cls(WandOfLivingEarth$RockArmor)).powerOfManyTurns = Math.fround(this.$outer.buff($J.cls(PowerOfMany$PowerBuff)).cooldown() + 1);
      }
      Dungeon.hero.sprite_.centerEmitter().burst(MagicMissile$EarthParticle.ATTRACT, (8 + $J.idiv(this.$outer.wandLevel, 2)) | 0);
      this.$outer.destroy();
      this.$outer.sprite_.die();
      return true;
    } else {
      return super.act(enemyInFOV, justAlerted);
    }
  }
}

$J.define(WandOfLivingEarth, 'com.shatteredpixel.shatteredpixeldungeon.items.wands.WandOfLivingEarth', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.items.wands.DamageWand', ctors: { '': '_WandOfLivingEarth' }, meths: { 'max(int)': 'max$int', 'min(int)': 'min$int' } });
$J.define(WandOfLivingEarth$RockArmor, 'com.shatteredpixel.shatteredpixeldungeon.items.wands.WandOfLivingEarth$RockArmor', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Buff', ctors: { '': '_WandOfLivingEarth$RockArmor' } });
$J.define(WandOfLivingEarth$EarthGuardian, 'com.shatteredpixel.shatteredpixeldungeon.items.wands.WandOfLivingEarth$EarthGuardian', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.actors.mobs.npcs.NPC', ctors: { '': '_WandOfLivingEarth$EarthGuardian' } });
$J.define(WandOfLivingEarth$EarthGuardian$Wandering, 'com.shatteredpixel.shatteredpixeldungeon.items.wands.WandOfLivingEarth$EarthGuardian$Wandering', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.actors.mobs.Mob$Wandering', ctors: { '': '_WandOfLivingEarth$EarthGuardian$Wandering' }, inner: true });
$J.module(() => {
  Assets$Sounds = $J.load('com.shatteredpixel.shatteredpixeldungeon.Assets$Sounds');
  Challenges = $J.load('com.shatteredpixel.shatteredpixeldungeon.Challenges');
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  Actor = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Actor');
  Char$Alignment = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Char$Alignment');
  Char$Property = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Char$Property');
  AllyBuff = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.AllyBuff');
  Amok = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Amok');
  Buff$buffType = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Buff$buffType');
  PowerOfMany$PowerBuff = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.abilities.cleric.PowerOfMany$PowerBuff');
  Stasis = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.spells.Stasis');
  Mimic = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.Mimic');
  Mob = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.Mob');
  FloatingText = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.FloatingText');
  MagicMissile = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.MagicMissile');
  MagicMissile$EarthParticle = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.MagicMissile$EarthParticle');
  Item = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.Item');
  Wand = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.wands.Wand');
  Messages = $J.load('com.shatteredpixel.shatteredpixeldungeon.messages.Messages');
  GameScene = $J.load('com.shatteredpixel.shatteredpixeldungeon.scenes.GameScene');
  CharSprite = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.CharSprite');
  EarthGuardianSprite = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.EarthGuardianSprite');
  ItemSpriteSheet = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.ItemSpriteSheet');
  BuffIndicator = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.BuffIndicator');
  Sample = $J.load('com.watabou.noosa.audio.Sample');
  ColorMath = $J.load('com.watabou.utils.ColorMath');
  PathFinder = $J.load('com.watabou.utils.PathFinder');
  Random = $J.load('com.watabou.utils.Random');
});
