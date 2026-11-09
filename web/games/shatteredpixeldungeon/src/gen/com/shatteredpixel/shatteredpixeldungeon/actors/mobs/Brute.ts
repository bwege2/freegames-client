// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/actors/mobs/Brute.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { ShieldBuff } from '../buffs/ShieldBuff.ts';

let Dungeon, Actor, AscensionChallenge, Buff, Buff$buffType, FloatingText, SpellSprite, Gold, Chasm, Messages, BruteSprite, CharSprite, BuffIndicator, Random;

export class Brute extends Mob {
  hasRaged: boolean = false;
  rage: Brute$BruteRage = null;
  static readonly HAS_RAGED: string = 'has_raged';
  _Brute(): this {
    this._Mob();
    this.spriteClass = $J.cls(BruteSprite);
    this.HP = this.HT = 40;
    this.defenseSkill_ = 15;
    this.EXP = 8;
    this.maxLvl = 16;
    this.loot = $J.cls(Gold);
    this.lootChance_ = 0.5;
    this.hasRaged = false;
    return this;
  }
  damageRoll(): number {
    return this.buff($J.cls(Brute$BruteRage)) != null ? Random.NormalIntRange(15, 40) : Random.NormalIntRange(5, 25);
  }
  attackSkill(target: Char): number {
    return 20;
  }
  drRoll(): number {
    return (super.drRoll() + Random.NormalIntRange(0, 8)) | 0;
  }
  die(cause: any): void {
    super.die(cause);
    if (cause === $J.cls(Chasm)) {
      this.hasRaged = true;
    }
  }
  isAlive(): boolean {
    if (super.isAlive()) {
      return true;
    } else {
      if (!this.hasRaged) {
        this.triggerEnrage();
      }
      if (this.rage == null) {
        for (const $it0 = this.buffs$Class($J.cls(Brute$BruteRage)).iterator(); $it0.hasNext(); ) {
          let b = $it0.next();
          this.rage = b;
        }
      }
      return this.rage != null && this.rage.shielding() > 0;
    }
  }
  triggerEnrage(): void {
    this.rage = Buff.affect$Char$Class(this, $J.cls(Brute$BruteRage));
    this.rage.setShield(($J.idiv(this.HT, 2) + 4) | 0);
    this.sprite_.showStatusWithIcon(CharSprite.POSITIVE, String($J.idiv(this.HT, 2)), FloatingText.SHIELDING, []);
    if (Dungeon.level.heroFOV[this.pos]) {
      SpellSprite.show$Char$int(this, SpellSprite.BERSERK);
    }
    this.spend(Actor.TICK);
    this.hasRaged = true;
  }
  storeInBundle(bundle: Bundle): void {
    super.storeInBundle(bundle);
    bundle.put$String$boolean(Brute.HAS_RAGED, this.hasRaged);
  }
  restoreFromBundle(bundle: Bundle): void {
    super.restoreFromBundle(bundle);
    this.hasRaged = bundle.getBoolean(Brute.HAS_RAGED);
  }
}

export class Brute$BruteRage extends ShieldBuff {
  _Brute$BruteRage(): this {
    this._ShieldBuff();
    this.type_ = Buff$buffType.POSITIVE;
    return this;
  }
  act(): boolean {
    if (this.target.HP > 0) {
      this.detach();
      return true;
    }
    this.absorbDamage($J.roundf(Math.fround(4 * AscensionChallenge.statModifier(this.target))));
    if (this.shielding() <= 0) {
      this.target.die(null);
    }
    this.spend(Actor.TICK);
    return true;
  }
  detach(): void {
    super.detach();
    this.decShield$int(this.shielding());
  }
  icon(): number {
    return BuffIndicator.FURY;
  }
  desc(): string {
    return Messages.get$Object$String$ObjectArr(this, 'desc', [this.shielding()]);
  }
}

$J.define(Brute, 'com.shatteredpixel.shatteredpixeldungeon.actors.mobs.Brute', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.actors.mobs.Mob', ctors: { '': '_Brute' } });
$J.define(Brute$BruteRage, 'com.shatteredpixel.shatteredpixeldungeon.actors.mobs.Brute$BruteRage', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.actors.buffs.ShieldBuff', ctors: { '': '_Brute$BruteRage' } });
$J.module(() => {
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  Actor = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Actor');
  AscensionChallenge = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.AscensionChallenge');
  Buff = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Buff');
  Buff$buffType = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Buff$buffType');
  FloatingText = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.FloatingText');
  SpellSprite = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.SpellSprite');
  Gold = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.Gold');
  Chasm = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.features.Chasm');
  Messages = $J.load('com.shatteredpixel.shatteredpixeldungeon.messages.Messages');
  BruteSprite = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.BruteSprite');
  CharSprite = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.CharSprite');
  BuffIndicator = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.BuffIndicator');
  Random = $J.load('com.watabou.utils.Random');
});
