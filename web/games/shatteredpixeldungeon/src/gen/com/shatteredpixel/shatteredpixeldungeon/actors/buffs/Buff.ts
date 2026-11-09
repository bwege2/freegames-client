// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/actors/buffs/Buff.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { $J, HashSet, JEnum, JString } from '../../../../../../jre/index.ts';
import { Actor } from '../Actor.ts';

let Messages, BuffIndicator, Reflection;

export class Buff extends Actor {
  target: Char = null;
  mnemonicExtended: boolean = false;
  type_: Buff$buffType = null;
  announced: boolean = false;
  revivePersists: boolean = false;
  resistances_: HashSet<JClass> = null;
  immunities_: HashSet<JClass> = null;
  static readonly MNEMONIC_EXTENDED: string = 'mnemonic_extended';
  _Buff(): this {
    this._Actor();
    this.mnemonicExtended = false;
    this.actPriority = Actor.BUFF_PRIO;
    this.type_ = Buff$buffType.NEUTRAL;
    this.announced = false;
    this.revivePersists = false;
    this.resistances_ = new HashSet();
    this.immunities_ = new HashSet();
    return this;
  }
  resistances(): HashSet<JClass> {
    return new HashSet(this.resistances_);
  }
  immunities(): HashSet<JClass> {
    return new HashSet(this.immunities_);
  }
  attachTo(target: Char): boolean {
    if (target.isImmune($J.getClass(this))) {
      return false;
    }
    this.target = target;
    if (target.add(this)) {
      if (target.sprite_ != null) {
        this.fx(true);
      }
      return true;
    } else {
      this.target = null;
      return false;
    }
  }
  detach(): void {
    if (this.target.remove$Buff(this) && this.target.sprite_ != null) {
      this.fx(false);
    }
  }
  act(): boolean {
    this.diactivate();
    return true;
  }
  icon(): number {
    return BuffIndicator.NONE;
  }
  tintIcon(icon: Image): void {
  }
  iconFadePercent(): number {
    return 0;
  }
  iconTextDisplay(): string {
    return '';
  }
  fx(on: boolean): void {
  }
  heroMessage(): string {
    let msg = Messages.get$Object$String$ObjectArr(this, 'heromsg', []);
    if ((msg.length === 0)) {
      return null;
    } else {
      return msg;
    }
  }
  name(): string {
    return Messages.get$Object$String$ObjectArr(this, 'name', []);
  }
  desc(): string {
    return Messages.get$Object$String$ObjectArr(this, 'desc', []);
  }
  dispTurns$float(input: number): string {
    return Messages.decimalFormat('#.##', input);
  }
  visualcooldown(): number {
    return Math.fround(this.cooldown() + 1);
  }
  storeInBundle(bundle: Bundle): void {
    super.storeInBundle(bundle);
    if (this.mnemonicExtended) {
      bundle.put$String$boolean(Buff.MNEMONIC_EXTENDED, this.mnemonicExtended);
    }
  }
  restoreFromBundle(bundle: Bundle): void {
    super.restoreFromBundle(bundle);
    if (bundle.contains(Buff.MNEMONIC_EXTENDED)) {
      this.mnemonicExtended = bundle.getBoolean(Buff.MNEMONIC_EXTENDED);
    }
  }
  static append$Char$Class<T>(target: Char, buffClass: JClass<T>): T {
    let buff = Reflection.newInstance(buffClass);
    buff.attachTo(target);
    return buff;
  }
  static append$Char$Class$float<T>(target: Char, buffClass: JClass<T>, duration: number): T {
    let buff = Buff.append$Char$Class(target, buffClass);
    buff.spend(Math.fround(duration * target.resist(buffClass)));
    return buff;
  }
  static affect$Char$Class<T>(target: Char, buffClass: JClass<T>): T {
    let buff = target.buff(buffClass);
    if (buff != null) {
      return buff;
    } else {
      return Buff.append$Char$Class(target, buffClass);
    }
  }
  static affect$Char$Class$float<T>(target: Char, buffClass: JClass<T>, duration: number): T {
    let buff = Buff.affect$Char$Class(target, buffClass);
    buff.spend(Math.fround(duration * target.resist(buffClass)));
    return buff;
  }
  static prolong<T>(target: Char, buffClass: JClass<T>, duration: number): T {
    let buff = Buff.affect$Char$Class(target, buffClass);
    buff.postpone(Math.fround(duration * target.resist(buffClass)));
    return buff;
  }
  static count<T>(target: Char, buffclass: JClass<T>, count: number): T {
    let buff = Buff.affect$Char$Class(target, buffclass);
    buff.countUp(count);
    return buff;
  }
  static detach(target: Char, cl: JClass<Buff>): void {
    for (const $it0 = target.buffs$Class(cl).iterator(); $it0.hasNext(); ) {
      let b = $it0.next();
      b.detach();
    }
  }
}

export class Buff$buffType extends JEnum {
  static POSITIVE: Buff$buffType = null;
  static NEGATIVE: Buff$buffType = null;
  static NEUTRAL: Buff$buffType = null;
  static $VALUES: Buff$buffType[] = null;
  _Buff$buffType($name: string, $ordinal: number): this {
    this._JEnum($name, $ordinal);
    return this;
  }
  static values(): Buff$buffType[] { return Buff$buffType.$VALUES.slice(); }
  static valueOf(name: string): Buff$buffType { return $J.enumValueOf(Buff$buffType, name); }
  static $clinit() {
    Buff$buffType.POSITIVE = new Buff$buffType()._Buff$buffType('POSITIVE', 0);
    Buff$buffType.NEGATIVE = new Buff$buffType()._Buff$buffType('NEGATIVE', 1);
    Buff$buffType.NEUTRAL = new Buff$buffType()._Buff$buffType('NEUTRAL', 2);
    Buff$buffType.$VALUES = [Buff$buffType.POSITIVE, Buff$buffType.NEGATIVE, Buff$buffType.NEUTRAL];
  }
}

export class Buff$DOTbuff {
}

$J.define(Buff, 'com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Buff', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.actors.Actor', ctors: { '': '_Buff' }, meths: { 'affect(com.shatteredpixel.shatteredpixeldungeon.actors.Char,java.lang.Class,float)': 'affect$Char$Class$float', 'affect(com.shatteredpixel.shatteredpixeldungeon.actors.Char,java.lang.Class)': 'affect$Char$Class', 'append(com.shatteredpixel.shatteredpixeldungeon.actors.Char,java.lang.Class,float)': 'append$Char$Class$float', 'append(com.shatteredpixel.shatteredpixeldungeon.actors.Char,java.lang.Class)': 'append$Char$Class', 'dispTurns(float)': 'dispTurns$float' } });
$J.define(Buff$buffType, 'com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Buff$buffType', { kind: 'enum', sup: 'java.lang.Enum', ctors: { '': '_Buff$buffType' }, clinit: true, lazy: ['$VALUES', 'POSITIVE', 'NEGATIVE', 'NEUTRAL'] });
$J.define(Buff$DOTbuff, 'com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Buff$DOTbuff', { kind: 'interface' });
$J.module(() => {
  Messages = $J.load('com.shatteredpixel.shatteredpixeldungeon.messages.Messages');
  BuffIndicator = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.BuffIndicator');
  Reflection = $J.load('com.watabou.utils.Reflection');
});
