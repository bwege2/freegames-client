// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/items/weapon/melee/Sai.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { $J, JObject } from '../../../../../../../jre/index.ts';
import { MeleeWeapon } from './MeleeWeapon.ts';
import { Buff } from '../../../actors/buffs/Buff.ts';

let Assets$Sounds, Dungeon, Actor, Char, Buff$buffType, Combo, Corruption, Invisibility, Gauntlet, Gloves, Messages, ItemSpriteSheet, AttackIndicator, BuffIndicator, GLog, Sample;

export class Sai extends MeleeWeapon {
  _Sai(): this {
    this._MeleeWeapon();
    this.image_ = ItemSpriteSheet.SAI;
    this.hitSound_ = Assets$Sounds.HIT_STAB;
    this.hitSoundPitch = Math.fround(1.3);
    this.tier_ = 3;
    this.DLY = 0.5;
    return this;
  }
  max$int(lvl: number): number {
    return ($J.roundf(Math.fround(2.5 * ((this.tier_ + 1) | 0))) + Math.imul(lvl, $J.roundf(Math.fround(0.5 * ((this.tier_ + 1) | 0))))) | 0;
  }
  targetingPrompt(): string {
    return Messages.get$Object$String$ObjectArr(this, 'prompt', []);
  }
  duelistAbility(hero: Hero, target: number): void {
    let dmgBoost = this.augment.damageFactor$int((4 + this.buffedLvl()) | 0);
    Sai.comboStrikeAbility(hero, target, 0, dmgBoost, this);
  }
  abilityInfo(): string {
    let dmgBoost = this.levelKnown ? (4 + this.buffedLvl()) | 0 : 4;
    if (this.levelKnown) {
      return Messages.get$Object$String$ObjectArr(this, 'ability_desc', [this.augment.damageFactor$int(dmgBoost)]);
    } else {
      return Messages.get$Object$String$ObjectArr(this, 'typical_ability_desc', [this.augment.damageFactor$int(dmgBoost)]);
    }
  }
  upgradeAbilityStat(level: number): string {
    return '+' + this.augment.damageFactor$int((4 + level) | 0);
  }
  static comboStrikeAbility(hero: Hero, target: number, multiPerHit: number, boostPerHit: number, wep: MeleeWeapon): void {
    if (target == null) {
      return;
    }
    let enemy = Actor.findChar(target);
    if (enemy == null || enemy === hero || hero.isCharmedBy(enemy) || !Dungeon.level.heroFOV[target]) {
      GLog.w(Messages.get$Object$String$ObjectArr(wep, 'ability_no_target', []), []);
      return;
    }
    hero.belongings.abilityWeapon = wep;
    if (!hero.canAttack(enemy)) {
      GLog.w(Messages.get$Object$String$ObjectArr(wep, 'ability_target_range', []), []);
      hero.belongings.abilityWeapon = null;
      return;
    }
    hero.belongings.abilityWeapon = null;
    hero.sprite_.attack$int$Callback(enemy.pos, new (Sai$1())().$c(wep, hero, enemy, multiPerHit, boostPerHit));
  }
}

export class Sai$ComboStrikeTracker extends Buff {
  static DURATION: number = 0;
  comboTime: number = 0;
  initialTime: number = 0;
  hits: number = 0;
  static readonly TIME: string = 'combo_time';
  static readonly INITIAL_TIME: string = 'initial_time';
  static RECENT_HITS: string = null;
  _Sai$ComboStrikeTracker(): this {
    this._Buff();
    this.type_ = Buff$buffType.POSITIVE;
    this.comboTime = 0;
    this.initialTime = 5;
    this.hits = 0;
    return this;
  }
  icon(): number {
    if (Dungeon.hero.belongings.weapon() instanceof Gloves || Dungeon.hero.belongings.weapon() instanceof Sai || Dungeon.hero.belongings.weapon() instanceof Gauntlet || Dungeon.hero.belongings.secondWep() instanceof Gloves || Dungeon.hero.belongings.secondWep() instanceof Sai || Dungeon.hero.belongings.secondWep() instanceof Gauntlet) {
      return BuffIndicator.DUEL_COMBO;
    } else {
      return BuffIndicator.NONE;
    }
  }
  act(): boolean {
    this.comboTime = Math.fround(this.comboTime - Actor.TICK);
    this.spend(Actor.TICK);
    if (this.comboTime <= Math.fround(0)) {
      this.detach();
    }
    return true;
  }
  addHit(enemy: Char): void {
    this.hits++;
    if (this.comboTime <= 5) {
      this.comboTime = 5;
      this.initialTime = 5;
    }
    if (!enemy.isAlive() || (enemy.buff($J.cls(Corruption)) != null && enemy.HP === enemy.HT)) {
      this.comboTime = 15;
      this.initialTime = 15;
    }
    if (this.hits >= 2 && this.icon() !== BuffIndicator.NONE) {
      GLog.p(Messages.get$Class$String$ObjectArr($J.cls(Combo), 'combo', [this.hits]), []);
    }
  }
  iconFadePercent(): number {
    return Math.max(0, Math.fround((Math.fround(this.initialTime - this.comboTime)) / this.initialTime));
  }
  iconTextDisplay(): string {
    return String($J.d2i(this.comboTime));
  }
  desc(): string {
    return Messages.get$Object$String$ObjectArr(this, 'desc', [this.hits, this.dispTurns$float(this.comboTime)]);
  }
  storeInBundle(bundle: Bundle): void {
    super.storeInBundle(bundle);
    bundle.put$String$float(Sai$ComboStrikeTracker.TIME, this.comboTime);
    bundle.put$String$float(Sai$ComboStrikeTracker.INITIAL_TIME, this.initialTime);
    bundle.put$String$int(Sai$ComboStrikeTracker.RECENT_HITS, this.hits);
  }
  restoreFromBundle(bundle: Bundle): void {
    super.restoreFromBundle(bundle);
    this.comboTime = Math.fround(bundle.getInt(Sai$ComboStrikeTracker.TIME));
    this.initialTime = Math.fround(bundle.getInt(Sai$ComboStrikeTracker.INITIAL_TIME));
    this.hits = bundle.getInt(Sai$ComboStrikeTracker.RECENT_HITS);
  }
  static $clinit() {
    Sai$ComboStrikeTracker.DURATION = 5;
    Sai$ComboStrikeTracker.RECENT_HITS = 'recent_hits';
  }
}

let $Sai$1: any = null;
/** An anonymous class (Sai.java:104). */
function Sai$1(): any {
  return $Sai$1 ??= $J.local(class extends JObject {
    call(): void {
      this.$cv_wep.beforeAbilityUsed(this.$cv_hero, this.$cv_enemy);
      AttackIndicator.target(this.$cv_enemy);
      let recentHits = 0;
      let buff = this.$cv_hero.buff($J.cls(Sai$ComboStrikeTracker));
      if (buff != null) {
        recentHits = buff.hits;
        buff.detach();
      }
      let hit = this.$cv_hero.attack$Char$float$float$float(this.$cv_enemy, Math.fround(1 + Math.fround(this.$cv_multiPerHit * recentHits)), Math.fround(Math.imul(this.$cv_boostPerHit, recentHits)), Math.fround(Char.INFINITE_ACCURACY));
      if (hit && !this.$cv_enemy.isAlive()) {
        MeleeWeapon.onAbilityKill(this.$cv_hero, this.$cv_enemy);
      }
      Invisibility.dispel$();
      this.$cv_hero.spendAndNext(this.$cv_hero.attackDelay());
      if (recentHits >= 2 && hit) {
        Sample.INSTANCE.play$Object(Assets$Sounds.HIT_STRONG);
      }
      this.$cv_wep.afterAbilityUsed(this.$cv_hero);
    }
    $c($wep, $hero, $enemy, $multiPerHit, $boostPerHit): this {
      this.$cv_wep = $wep; this.$cv_hero = $hero; this.$cv_enemy = $enemy; this.$cv_multiPerHit = $multiPerHit; this.$cv_boostPerHit = $boostPerHit;
      return this;
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.items.weapon.melee.Sai$1', ['com.watabou.utils.Callback']);
}

$J.define(Sai, 'com.shatteredpixel.shatteredpixeldungeon.items.weapon.melee.Sai', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.items.weapon.melee.MeleeWeapon', ctors: { '': '_Sai' }, meths: { 'max(int)': 'max$int' } });
$J.define(Sai$ComboStrikeTracker, 'com.shatteredpixel.shatteredpixeldungeon.items.weapon.melee.Sai$ComboStrikeTracker', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Buff', ctors: { '': '_Sai$ComboStrikeTracker' }, clinit: true, lazy: ['DURATION', 'RECENT_HITS'] });
$J.module(() => {
  Assets$Sounds = $J.load('com.shatteredpixel.shatteredpixeldungeon.Assets$Sounds');
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  Actor = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Actor');
  Char = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Char');
  Buff$buffType = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Buff$buffType');
  Combo = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Combo');
  Corruption = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Corruption');
  Invisibility = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Invisibility');
  Gauntlet = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.weapon.melee.Gauntlet');
  Gloves = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.weapon.melee.Gloves');
  Messages = $J.load('com.shatteredpixel.shatteredpixeldungeon.messages.Messages');
  ItemSpriteSheet = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.ItemSpriteSheet');
  AttackIndicator = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.AttackIndicator');
  BuffIndicator = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.BuffIndicator');
  GLog = $J.load('com.shatteredpixel.shatteredpixeldungeon.utils.GLog');
  Sample = $J.load('com.watabou.noosa.audio.Sample');
});
