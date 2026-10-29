// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/common/i18n/Relation.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J, JObject, RuntimeException, StringBuilder } from '../../../../../../jre/index.ts';

/**
 * A grammatical relationship.
 */
export class Relation extends JObject {
  low: number = 0;
  high: number = 0;
  mod: number = 0;
  negated: boolean = false;
  integer: boolean = false;
  $init_Relation() {
    this.mod = 1;
    this.negated = false;
    this.integer = true;
  }
  _Relation$List(tokens: List<string>): this {
    this.$init_Relation();
    this.parse(tokens);
    return this;
  }
  _Relation$int$int(low: number, high: number): this {
    this.$init_Relation();
    this.low = low;
    this.high = high;
    return this;
  }
  /**
   * Sets the divisor for a modulo operation (defaults to 1).
   *
   * @param mod an {@code int} value
   */
  setMod(mod: number): void {
    this.mod = mod;
  }
  /**
   * Negates the return value of the relation (defaults to false).
   *
   * @param value a {@code boolean} value
   */
  setNegated(value: boolean): void {
    this.negated = value;
  }
  /**
   * Determines whether this relation only matches integers
   * (defaults to true).
   *
   * @param value a {@code boolean} value
   */
  setInteger(value: boolean): void {
    this.integer = value;
  }
  /**
   * Returns true if the given number matches this relation.
   *
   * @param number a {@code double} value
   * @return a {@code boolean} value
   */
  matches(number$: number): boolean {
    let value = (this.mod === 1) ? number$ : number$ % this.mod;
    if (this.integer && $J.dcmp(value, $J.rint(value)) !== 0) {
      return false;
    }
    return (this.low <= value && value <= this.high) !== this.negated;
  }
  /**
   * Parses a list of string tokens.
   *
   * @param input a list of string tokens
   */
  parse(input: List<string>): void {
    let token = input.removeAt(0);
    if ($J.equals('n', token)) {
      token = input.removeAt(0);
    } else {
      throw new RuntimeException('Relation must start with \'n\': ' + token);
    }
    if ($J.equals('mod', token)) {
      this.mod = $J.parseInt(input.removeAt(0));
      token = input.removeAt(0);
    }
    if ($J.equals('not', token)) {
      this.negated = true;
      token = input.removeAt(0);
    }
    if ($J.equals('is', token)) {
      token = input.removeAt(0);
      if ($J.equals('not', token)) {
        this.negated = true;
        token = input.removeAt(0);
      }
      this.low = this.high = $J.parseInt(token);
    } else {
      if ($J.equals('within', token)) {
        this.integer = false;
      }
      this.low = $J.parseInt(input.removeAt(0));
      this.high = $J.parseInt(input.removeAt(0));
    }
  }
  /**
   * {@inheritDoc}
   */
  equals(o: any): boolean {
    if (this === o) {
      return true;
    }
    if (o instanceof Relation) {
      let other = o;
      return this.low === other.low && this.high === other.high && this.mod === other.mod && this.negated === other.negated && this.integer === other.integer;
    }
    return false;
  }
  /**
   * {@inheritDoc}
   */
  hashCode(): number {
    let hash = super.hashCode();
    hash = (Math.imul(31, hash) + this.low) | 0;
    hash = (Math.imul(31, hash) + this.high) | 0;
    hash = (Math.imul(31, hash) + this.mod) | 0;
    hash = (Math.imul(31, hash) + ((this.negated) ? 1 : 0) + ((this.integer) ? 2 : 0)) | 0;
    return hash;
  }
  /**
   * {@inheritDoc}
   */
  toString(): string {
    let sb = new StringBuilder(32);
    sb.append('n ');
    if (this.mod !== 1) {
      sb.append('mod ').append(String(this.mod)).append(String.fromCharCode(32 /* ' ' */));
    }
    if (this.low === this.high) {
      sb.append('is ');
      if (this.negated) {
        sb.append('not ');
      }
      sb.append(String(this.low));
    } else {
      if (this.negated) {
        sb.append('not ');
      }
      if (!this.integer) {
        sb.append('with');
      }
      sb.append('in ').append(String(this.low)).append('..').append(String(this.high));
    }
    return sb.toString();
  }
}

$J.define(Relation, 'net.sf.freecol.common.i18n.Relation', { kind: 'class', sup: 'java.lang.Object', ctors: { 'int,int': '_Relation$int$int', 'java.util.List': '_Relation$List' }, returns: { 'hashCode': 'int' } });
