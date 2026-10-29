// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/common/model/Tension.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
/**
 *  Copyright (C) 2002-2022   The FreeCol Team
 *
 *  This file is part of FreeCol.
 *
 *  FreeCol is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation, either version 2 of the License, or
 *  (at your option) any later version.
 *
 *  FreeCol is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU General Public License for more details.
 *
 *  You should have received a copy of the GNU General Public License
 *  along with FreeCol.  If not, see <http://www.gnu.org/licenses/>.
 */
import { $J, JEnum, JObject } from '../../../../../../jre/index.ts';

let Messages, CollectionUtils, StringUtils;

/**
 * A measure of the tension between nations.
 */
export class Tension extends JObject {
  static readonly TENSION_MIN: number = 0;
  static TENSION_MAX: number = 0;
  static readonly DELTA: number = 10;
  static readonly TENSION_ADD_MINOR: number = 100;
  static readonly TENSION_ADD_NORMAL: number = 200;
  static readonly TENSION_ADD_MAJOR: number = 300;
  static readonly TENSION_ADD_LAND_TAKEN: number = 200;
  static readonly TENSION_ADD_UNIT_DESTROYED: number = 400;
  static readonly TENSION_ADD_SETTLEMENT_ATTACKED: number = 500;
  static readonly TENSION_ADD_CAPITAL_ATTACKED: number = 600;
  static readonly TENSION_ADD_WAR_INCITER: number = 250;
  static readonly CONTACT_MODIFIER: number = 0;
  static readonly ALLIANCE_MODIFIER: number = -500;
  static readonly DROP_ALLIANCE_MODIFIER: number = 200;
  static readonly PEACE_TREATY_MODIFIER: number = -250;
  static readonly CEASE_FIRE_MODIFIER: number = -250;
  static WAR_MODIFIER: number = 0;
  static readonly RESUME_WAR_MODIFIER: number = 750;
  /**
   * Tension level to set when surrendering.
   */
  static SURRENDERED: number = 0;
  value_: number = 0;
  /**
   * Create the default tension.
   */
  _Tension$(): this {
    this.setValue(Tension$Level.HAPPY.getLimit());
    return this;
  }
  /**
   * Create tension at a specified level.
   *
   * @param newTension The level of tension.
   */
  _Tension$int(newTension: number): this {
    this.setValue(newTension);
    return this;
  }
  /**
   * Get the current tension value.
   *
   * @return The value of this {@code Tension}.
   */
  getValue(): number {
    return this.value_;
  }
  /**
   * Sets the current tension value.
   *
   * @param newValue The new value of the tension.
   */
  setValue(newValue: number): void {
    if (newValue < Tension.TENSION_MIN) {
      this.value_ = Tension.TENSION_MIN;
    } else if (newValue > Tension.TENSION_MAX) {
      this.value_ = Tension.TENSION_MAX;
    } else {
      this.value_ = newValue;
    }
  }
  /**
   * Get the current tension level.
   *
   * @return The current level.
   */
  getLevel(): Tension$Level {
    return CollectionUtils.find$ObjectArr$Predicate$Object(Tension$Level.values(), (level) => this.value_ <= level.getLimit(), Tension$Level.HATEFUL);
  }
  /**
   * Modify the tension by the given amount.
   *
   * @param newTension The amount to modify tension by.
   */
  modify(newTension: number): void {
    this.setValue((this.value_ + newTension) | 0);
  }
  /**
   * Get the stem key.
   *
   * @return The tension stem key.
   */
  getKey(): string {
    return 'tension.' + this.getLevel().getKey();
  }
  /**
   * {@inheritDoc}
   */
  getNameKey(): string {
    return Messages.nameKey$String('model.' + this.getKey());
  }
  /**
   * {@inheritDoc}
   */
  equals(o: any): boolean {
    if (this === o) {
      return true;
    }
    if (o instanceof Tension) {
      let other = o;
      return this.value_ === other.value_;
    }
    return false;
  }
  /**
   * {@inheritDoc}
   */
  hashCode(): number {
    let hash = super.hashCode();
    hash = (Math.imul(31, hash) + this.value_) | 0;
    return hash;
  }
  /**
   * {@inheritDoc}
   */
  toString(): string {
    return this.getLevel().toString();
  }
  static $clinit() {
    Tension.TENSION_MAX = (Tension$Level.HATEFUL.limit_ + 100) | 0;
    Tension.WAR_MODIFIER = Tension$Level.HATEFUL.limit_;
    Tension.SURRENDERED = $J.idiv(((Tension$Level.CONTENT.limit_ + Tension$Level.HAPPY.limit_) | 0), 2);
  }
}

/**
 * Constants for describing alarm levels.
 */
export class Tension$Level extends JEnum {
  limit_: number = 0;
  static HAPPY: Tension$Level = null;
  static CONTENT: Tension$Level = null;
  static DISPLEASED: Tension$Level = null;
  static ANGRY: Tension$Level = null;
  static HATEFUL: Tension$Level = null;
  static $VALUES: Tension$Level[] = null;
  _Tension$Level($name: string, $ordinal: number, limit: number): this {
    this._JEnum($name, $ordinal);
    this.limit_ = limit;
    return this;
  }
  getLimit(): number {
    return this.limit_;
  }
  /**
   * Get a message key for the level.
   *
   * @return A message key.
   */
  getKey(): string {
    return StringUtils.getEnumKey(this);
  }
  static values(): Tension$Level[] { return Tension$Level.$VALUES.slice(); }
  static valueOf(name: string): Tension$Level { return $J.enumValueOf(Tension$Level, name); }
  static $clinit() {
    Tension$Level.HAPPY = new Tension$Level()._Tension$Level('HAPPY', 0, 100);
    Tension$Level.CONTENT = new Tension$Level()._Tension$Level('CONTENT', 1, 600);
    Tension$Level.DISPLEASED = new Tension$Level()._Tension$Level('DISPLEASED', 2, 700);
    Tension$Level.ANGRY = new Tension$Level()._Tension$Level('ANGRY', 3, 800);
    Tension$Level.HATEFUL = new Tension$Level()._Tension$Level('HATEFUL', 4, 1000);
    Tension$Level.$VALUES = [Tension$Level.HAPPY, Tension$Level.CONTENT, Tension$Level.DISPLEASED, Tension$Level.ANGRY, Tension$Level.HATEFUL];
  }
}

$J.define(Tension, 'net.sf.freecol.common.model.Tension', { kind: 'class', ifaces: ['net.sf.freecol.common.model.Named'], sup: 'java.lang.Object', ctors: { 'int': '_Tension$int', '': '_Tension$' }, returns: { 'hashCode': 'int', 'getNameKey': 'java.lang.String', 'getKey': 'java.lang.String', 'getLevel': 'net.sf.freecol.common.model.Tension$Level', 'getValue': 'int' }, clinit: true, lazy: ['TENSION_MAX', 'WAR_MODIFIER', 'SURRENDERED'] });
$J.define(Tension$Level, 'net.sf.freecol.common.model.Tension$Level', { kind: 'enum', sup: 'java.lang.Enum', ctors: { 'int': '_Tension$Level' }, returns: { 'getKey': 'java.lang.String', 'getLimit': 'int' }, clinit: true, lazy: ['$VALUES', 'HAPPY', 'CONTENT', 'DISPLEASED', 'ANGRY', 'HATEFUL'] });
$J.module(() => {
  Messages = $J.load('net.sf.freecol.common.i18n.Messages');
  CollectionUtils = $J.load('net.sf.freecol.common.util.CollectionUtils');
  StringUtils = $J.load('net.sf.freecol.common.util.StringUtils');
});
