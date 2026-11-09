// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/actors/buffs/Berserk.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { $J, JEnum } from '../../../../../../jre/index.ts';
import { ShieldBuff } from './ShieldBuff.ts';

let Assets$Sounds, Dungeon, Actor, Buff$buffType, HoldFast, Regeneration, Hero, Talent, FloatingText, SpellSprite, BrokenSeal$WarriorShield, Messages, GameScene, PixelScene, CharSprite, ActionIndicator, BuffIndicator, HeroIcon, GLog, BitmapText, Sample, GameMath, Random;

export class Berserk extends ShieldBuff {
  state_: Berserk$State = null;
  static readonly LEVEL_RECOVER_START: number = 4;
  levelRecovery: number = 0;
  static readonly TURN_RECOVERY_START: number = 100;
  turnRecovery: number = 0;
  powerLossBuffer: number = 0;
  power: number = 0;
  static readonly STATE: string = 'state';
  static readonly LEVEL_RECOVERY: string = 'levelrecovery';
  static readonly TURN_RECOVERY: string = 'turn_recovery';
  static readonly POWER: string = 'power';
  static readonly POWER_BUFFER: string = 'power_buffer';
  _Berserk(): this {
    this._ShieldBuff();
    this.type_ = Buff$buffType.POSITIVE;
    this.detachesAtZero = false;
    this.shieldUsePriority = -1;
    this.state_ = Berserk$State.NORMAL;
    this.powerLossBuffer = 0;
    this.power = 0;
    return this;
  }
  storeInBundle(bundle: Bundle): void {
    super.storeInBundle(bundle);
    bundle.put$String$Enum(Berserk.STATE, this.state_);
    bundle.put$String$float(Berserk.POWER, this.power);
    bundle.put$String$int(Berserk.POWER_BUFFER, this.powerLossBuffer);
    bundle.put$String$float(Berserk.LEVEL_RECOVERY, this.levelRecovery);
    bundle.put$String$int(Berserk.TURN_RECOVERY, this.turnRecovery);
  }
  restoreFromBundle(bundle: Bundle): void {
    super.restoreFromBundle(bundle);
    this.state_ = bundle.getEnum(Berserk.STATE, $J.cls(Berserk$State));
    this.power = bundle.getFloat(Berserk.POWER);
    this.powerLossBuffer = bundle.getInt(Berserk.POWER_BUFFER);
    this.levelRecovery = bundle.getFloat(Berserk.LEVEL_RECOVERY);
    this.turnRecovery = bundle.getInt(Berserk.TURN_RECOVERY);
    if (this.power >= 1 && this.state_ === Berserk$State.NORMAL) {
      ActionIndicator.setAction(this);
    }
  }
  act(): boolean {
    if (this.state_ === Berserk$State.BERSERK) {
      if (this.target.shielding() > 0) {
        let dmg = Math.fround(Math.fround(Math.ceil(Math.fround(this.target.shielding() * Math.fround(0.025)))) * HoldFast.buffDecayFactor(this.target));
        if (Random.Float$() < Math.fround(dmg % 1)) {
          dmg++;
        }
        ShieldBuff.processDamage(this.target, $J.d2i(dmg), this);
        if (this.target.shielding() <= 0) {
          this.state_ = Berserk$State.RECOVERING;
          this.power = 0;
          BuffIndicator.refreshHero();
          if (!this.target.isAlive()) {
            this.target.die(this);
            if (!this.target.isAlive()) {
              Dungeon.fail(this);
            }
          }
        }
      } else {
        this.state_ = Berserk$State.RECOVERING;
        this.power = 0;
        if (!this.target.isAlive()) {
          this.target.die(this);
          if (!this.target.isAlive()) {
            Dungeon.fail(this);
          }
        }
      }
    } else if (this.state_ === Berserk$State.NORMAL) {
      if (this.powerLossBuffer > 0) {
        this.powerLossBuffer--;
      } else {
        this.power = Math.fround(this.power - Math.fround(GameMath.gate(Math.fround(0.1), this.power, 1) * Math.fround(0.05)) * $J.pow((Math.fround(this.target.HP / Math.fround(this.target.HT))), 2));
        if (this.power < 1) {
          ActionIndicator.clearAction$Action(this);
        } else {
          ActionIndicator.refresh();
        }
        if (this.power <= Math.fround(0)) {
          this.detach();
        }
      }
    } else if (this.state_ === Berserk$State.RECOVERING && this.levelRecovery === Math.fround(0) && Regeneration.regenOn()) {
      this.turnRecovery--;
      if (this.turnRecovery <= 0) {
        this.turnRecovery = 0;
        this.state_ = Berserk$State.NORMAL;
      }
    }
    this.spend(Actor.TICK);
    return true;
  }
  detach(): void {
    super.detach();
    if (this.state_ === Berserk$State.BERSERK) {
      this.state_ = Berserk$State.RECOVERING;
    }
    ActionIndicator.clearAction$Action(this);
  }
  enchantFactor(chance: number): number {
    return Math.fround(chance + (Math.fround((Math.fround(Math.min(1, this.power) * Math.fround(0.15))) * (this.target).pointsInTalent(Talent.ENRAGED_CATALYST))));
  }
  damageFactor(dmg: number): number {
    return Math.fround(dmg * Math.min(1.5, Math.fround(1 + (Math.fround(this.power / 2)))));
  }
  berserking(): boolean {
    if (this.target.HP === 0 && this.state_ === Berserk$State.NORMAL && this.power >= 1 && (this.target).hasTalent(Talent.DEATHLESS_FURY)) {
      this.startBerserking();
      ActionIndicator.clearAction$Action(this);
    }
    return this.state_ === Berserk$State.BERSERK && this.target.shielding() > 0;
  }
  startBerserking(): void {
    this.state_ = Berserk$State.BERSERK;
    SpellSprite.show$Char$int(this.target, SpellSprite.BERSERK);
    Sample.INSTANCE.play$Object(Assets$Sounds.CHALLENGE);
    GameScene.flash$int(16711680);
    if (this.target.HP > 0) {
      this.turnRecovery = Berserk.TURN_RECOVERY_START;
      this.levelRecovery = 0;
    } else {
      this.levelRecovery = Math.fround(Berserk.LEVEL_RECOVER_START - (this.target).pointsInTalent(Talent.DEATHLESS_FURY));
      this.turnRecovery = 0;
    }
    let shieldAmount = this.currentShieldBoost();
    this.setShield(shieldAmount);
    this.target.sprite_.showStatusWithIcon(CharSprite.POSITIVE, String(shieldAmount), FloatingText.SHIELDING, []);
    BuffIndicator.refreshHero();
  }
  currentShieldBoost(): number {
    let shieldMultiplier = Math.fround(1 + Math.fround(2 * Math.fround($J.pow((Math.fround(1 - (Math.fround(this.target.HP / Math.fround(this.target.HT))))), 3))));
    if (this.power > 1) {
      shieldMultiplier = Math.fround(shieldMultiplier * this.power);
      this.levelRecovery = Math.fround(this.levelRecovery * Math.fround(2 - this.power));
      this.turnRecovery = $J.d2i(Math.fround(this.turnRecovery * Math.fround(2 - this.power)));
    }
    let baseShield = 8;
    if (this.target instanceof Hero && (this.target).belongings.armor() != null) {
      baseShield = (baseShield + Math.imul(2, (this.target).belongings.armor().buffedLvl())) | 0;
    }
    return $J.roundf(Math.fround(baseShield * shieldMultiplier));
  }
  maxShieldBoost(): number {
    let baseShield = 8;
    if (this.target instanceof Hero && (this.target).belongings.armor() != null) {
      baseShield = (baseShield + Math.imul(2, (this.target).belongings.armor().buffedLvl())) | 0;
    }
    return Math.imul(baseShield, 3);
  }
  damage(damage: number): void {
    if (this.state_ !== Berserk$State.NORMAL) {
      return;
    }
    let maxPower = Math.fround(1 + Math.fround(Math.fround(0.1667) * (this.target).pointsInTalent(Talent.ENDLESS_RAGE)));
    this.power = Math.min(maxPower, Math.fround(this.power + Math.fround((Math.fround(damage / Math.fround(this.target.HT))) / 4)));
    BuffIndicator.refreshHero();
    this.powerLossBuffer = 3;
    if (this.power >= 1) {
      ActionIndicator.setAction(this);
    }
  }
  recover(percent: number): void {
    if (this.state_ === Berserk$State.RECOVERING && this.levelRecovery > Math.fround(0)) {
      this.levelRecovery = Math.fround(this.levelRecovery - percent);
      if (this.levelRecovery <= Math.fround(0)) {
        this.levelRecovery = 0;
        if (this.turnRecovery === 0) {
          this.state_ = Berserk$State.NORMAL;
        }
      }
    }
  }
  actionName(): string {
    return Messages.get$Object$String$ObjectArr(this, 'action_name', []);
  }
  actionIcon(): number {
    return HeroIcon.BERSERK;
  }
  secondaryVisual(): Visual {
    let txt = new BitmapText()._BitmapText$Font(PixelScene.pixelFont);
    txt.text$String($J.d2i((Math.fround(this.power * 100))) + '%');
    txt.hardlight$int(CharSprite.POSITIVE);
    txt.measure();
    return txt;
  }
  indicatorColor(): number {
    return 6684672;
  }
  doAction(): void {
    let shield = this.target.buff($J.cls(BrokenSeal$WarriorShield));
    if (shield != null && shield.maxShield() > 0) {
      this.startBerserking();
      ActionIndicator.clearAction$Action(this);
    } else {
      GLog.w(Messages.get$Object$String$ObjectArr(this, 'no_seal', []), []);
    }
  }
  icon(): number {
    return BuffIndicator.BERSERK;
  }
  tintIcon(icon: Image): void {
    switch (this.state_) {
      case Berserk$State.NORMAL:
      default:
        if (this.power < 1) {
          icon.hardlight$float$float$float(1, 0.5, 0);
        } else {
          icon.hardlight$float$float$float(1, 0, 0);
        }
        break;
      case Berserk$State.BERSERK:
        icon.hardlight$float$float$float(1, 0, 0);
        break;
      case Berserk$State.RECOVERING:
        icon.hardlight$float$float$float(0, 0, 1);
        break;
    }
  }
  iconFadePercent(): number {
    {
      let maxPower: number;
      switch (this.state_) {
        case Berserk$State.NORMAL:
        default:
          maxPower = Math.fround(1 + Math.fround(Math.fround(0.1667) * (this.target).pointsInTalent(Talent.ENDLESS_RAGE)));
          return Math.fround((Math.fround(maxPower - this.power)) / maxPower);
        case Berserk$State.BERSERK:
          return Math.fround(1 - Math.fround(this.shielding() / Math.fround(this.maxShieldBoost())));
        case Berserk$State.RECOVERING:
          if (this.levelRecovery > Math.fround(0)) {
            return Math.fround(this.levelRecovery / (Math.fround(Berserk.LEVEL_RECOVER_START - Dungeon.hero.pointsInTalent(Talent.DEATHLESS_FURY))));
          } else {
            return Math.fround(this.turnRecovery / Math.fround(Berserk.TURN_RECOVERY_START));
          }
      }
    }
  }
  iconTextDisplay(): string {
    switch (this.state_) {
      case Berserk$State.NORMAL:
      default:
        return $J.d2i((Math.fround(this.power * 100))) + '%';
      case Berserk$State.BERSERK:
        return String(this.shielding());
      case Berserk$State.RECOVERING:
        if (this.levelRecovery > Math.fround(0)) {
          return Messages.decimalFormat('#.##', this.levelRecovery);
        } else {
          return String(this.turnRecovery);
        }
    }
  }
  name(): string {
    switch (this.state_) {
      case Berserk$State.NORMAL:
      default:
        return Messages.get$Object$String$ObjectArr(this, 'angered', []);
      case Berserk$State.BERSERK:
        return Messages.get$Object$String$ObjectArr(this, 'berserk', []);
      case Berserk$State.RECOVERING:
        return Messages.get$Object$String$ObjectArr(this, 'recovering', []);
    }
  }
  desc(): string {
    let dispDamage = Math.fround((Math.fround($J.d2i(this.damageFactor(10000)) / 100)) - 100);
    switch (this.state_) {
      case Berserk$State.NORMAL:
      default:
        return Messages.get$Object$String$ObjectArr(this, 'angered_desc', [$J.boxD(Math.floor(Math.fround(this.power * 100))), $J.boxF(dispDamage), this.currentShieldBoost()]);
      case Berserk$State.BERSERK:
        return Messages.get$Object$String$ObjectArr(this, 'berserk_desc', [this.shielding()]);
      case Berserk$State.RECOVERING:
        if (this.levelRecovery > Math.fround(0)) {
          return Messages.get$Object$String$ObjectArr(this, 'recovering_desc', []) + '\n\n' + Messages.get$Object$String$ObjectArr(this, 'recovering_desc_levels', [$J.boxF(this.levelRecovery)]);
        } else {
          return Messages.get$Object$String$ObjectArr(this, 'recovering_desc', []) + '\n\n' + Messages.get$Object$String$ObjectArr(this, 'recovering_desc_turns', [this.turnRecovery]);
        }
    }
  }
}

export class Berserk$State extends JEnum {
  static NORMAL: Berserk$State = null;
  static BERSERK: Berserk$State = null;
  static RECOVERING: Berserk$State = null;
  static $VALUES: Berserk$State[] = null;
  _Berserk$State($name: string, $ordinal: number): this {
    this._JEnum($name, $ordinal);
    return this;
  }
  static values(): Berserk$State[] { return Berserk$State.$VALUES.slice(); }
  static valueOf(name: string): Berserk$State { return $J.enumValueOf(Berserk$State, name); }
  static $clinit() {
    Berserk$State.NORMAL = new Berserk$State()._Berserk$State('NORMAL', 0);
    Berserk$State.BERSERK = new Berserk$State()._Berserk$State('BERSERK', 1);
    Berserk$State.RECOVERING = new Berserk$State()._Berserk$State('RECOVERING', 2);
    Berserk$State.$VALUES = [Berserk$State.NORMAL, Berserk$State.BERSERK, Berserk$State.RECOVERING];
  }
}

$J.define(Berserk, 'com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Berserk', { kind: 'class', ifaces: ['com.shatteredpixel.shatteredpixeldungeon.ui.ActionIndicator$Action'], sup: 'com.shatteredpixel.shatteredpixeldungeon.actors.buffs.ShieldBuff', ctors: { '': '_Berserk' } });
$J.define(Berserk$State, 'com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Berserk$State', { kind: 'enum', sup: 'java.lang.Enum', ctors: { '': '_Berserk$State' }, clinit: true, lazy: ['$VALUES', 'NORMAL', 'BERSERK', 'RECOVERING'] });
$J.module(() => {
  Assets$Sounds = $J.load('com.shatteredpixel.shatteredpixeldungeon.Assets$Sounds');
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  Actor = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Actor');
  Buff$buffType = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Buff$buffType');
  HoldFast = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.HoldFast');
  Regeneration = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Regeneration');
  Hero = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.Hero');
  Talent = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.Talent');
  FloatingText = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.FloatingText');
  SpellSprite = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.SpellSprite');
  BrokenSeal$WarriorShield = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.BrokenSeal$WarriorShield');
  Messages = $J.load('com.shatteredpixel.shatteredpixeldungeon.messages.Messages');
  GameScene = $J.load('com.shatteredpixel.shatteredpixeldungeon.scenes.GameScene');
  PixelScene = $J.load('com.shatteredpixel.shatteredpixeldungeon.scenes.PixelScene');
  CharSprite = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.CharSprite');
  ActionIndicator = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.ActionIndicator');
  BuffIndicator = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.BuffIndicator');
  HeroIcon = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.HeroIcon');
  GLog = $J.load('com.shatteredpixel.shatteredpixeldungeon.utils.GLog');
  BitmapText = $J.load('com.watabou.noosa.BitmapText');
  Sample = $J.load('com.watabou.noosa.audio.Sample');
  GameMath = $J.load('com.watabou.utils.GameMath');
  Random = $J.load('com.watabou.utils.Random');
});
