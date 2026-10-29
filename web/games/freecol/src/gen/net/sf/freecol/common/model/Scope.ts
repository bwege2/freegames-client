// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/common/model/Scope.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J, JObject, JString, StringBuilder } from '../../../../../../jre/index.ts';
import { FreeColObject } from './FreeColObject.ts';

let Messages, FreeColSpecObjectType, Utils;

/**
 * The {@code Scope} class determines whether a given
 * {@code FreeColSpecObjectType} fulfills certain requirements.
 */
export class Scope extends FreeColObject {
  static readonly TAG: string = 'scope';
  /**
   * The identifier of a {@code FreeColSpecObjectType}, or
   * {@code Option}.
   */
  type: string = null;
  /**
   * The object identifier of an {@code Ability}.
   */
  abilityId: string = null;
  /**
   * The value of an {@code Ability}.
   */
  abilityValue: boolean = false;
  /**
   * The name of an {@code Method}.
   */
  methodName: string = null;
  /**
   * The {@code String} representation of the value of an
   * {@code Method}.
   */
  methodValue: string = null;
  /**
   * True if the scope applies to a null object.
   */
  matchesNull: boolean = false;
  /**
   * Whether the match is negated.
   */
  matchNegated: boolean = false;
  static readonly ABILITY_ID_TAG: string = 'ability-id';
  static readonly ABILITY_VALUE_TAG: string = 'ability-value';
  static readonly MATCH_NEGATED_TAG: string = 'match-negated';
  static readonly MATCHES_NULL_TAG: string = 'matches-null';
  static readonly METHOD_NAME_TAG: string = 'method-name';
  static readonly METHOD_VALUE_TAG: string = 'method-value';
  static readonly TYPE_TAG: string = 'type';
  static readonly OLD_MATCH_NEGATED_TAG: string = 'matchNegated';
  static readonly OLD_MATCHES_NULL_TAG: string = 'matchesNull';
  static readonly OLD_METHOD_NAME_TAG: string = 'methodName';
  static readonly OLD_METHOD_VALUE_TAG: string = 'methodValue';
  $init_Scope() {
    this.type = null;
    this.abilityId = null;
    this.abilityValue = true;
    this.methodName = null;
    this.methodValue = null;
    this.matchesNull = true;
    this.matchNegated = false;
  }
  /**
   * Deliberately empty constructor.
   */
  _Scope$(): this {
    this._FreeColObject();
    this.$init_Scope();
    return this;
  }
  /**
   * Creates a new {@code Scope} instance from a stream.
   *
   * @param xr The {@code FreeColXMLReader} to read from.
   * @exception XMLStreamException if there is an error reading the stream.
   */
  _Scope$FreeColXMLReader(xr: FreeColXMLReader): this {
    this._FreeColObject();
    this.$init_Scope();
    this.readFromXML(xr);
    return this;
  }
  /**
   * Get a key to display this scope with.
   *
   * @return A suitable key, or null if none found.
   */
  getKey(): string {
    return (this.getType() != null) ? this.getType() : (this.getAbilityId() != null) ? this.getAbilityId() : (this.getMethodName() != null) ? 'scope.method.' + this.getMethodName() : null;
  }
  /**
   * Get a string describing this scope for display within a feature.
   *
   * @return A suitable string.
   */
  getFeatureString(): string {
    let k = this.getKey();
    if (k == null) {
      k = '';
    } else {
      k = Messages.getName$String(k);
      if (this.getMatchNegated()) {
        k = '!' + k;
      }
    }
    return k;
  }
  /**
   * Does this scope match null?
   *
   * @return True if this scope matches null.
   */
  getMatchesNull(): boolean {
    return this.matchesNull;
  }
  /**
   * Set the match-null value.
   *
   * Public for the test suite.
   *
   * @param newMatchesNull The new match-null value.
   */
  setMatchesNull(newMatchesNull: boolean): void {
    this.matchesNull = newMatchesNull;
  }
  /**
   * Is the match negated for this scope?
   *
   * @return True if this match is negated.
   */
  getMatchNegated(): boolean {
    return this.matchNegated;
  }
  setMatchNegated(newMatchNegated: boolean): void {
    this.matchNegated = newMatchNegated;
  }
  getType(): string {
    return this.type;
  }
  setType(newType: string): void {
    this.type = newType;
  }
  /**
   * Gets the ability identifier.
   *
   * @return The ability id.
   */
  getAbilityId(): string {
    return this.abilityId;
  }
  /**
   * Sets the ability identifier.
   *
   * @param newAbilityId The new ability id.
   */
  setAbilityId(newAbilityId: string): void {
    this.abilityId = newAbilityId;
  }
  getAbilityValue(): boolean {
    return this.abilityValue;
  }
  setAbilityValue(newAbilityValue: boolean): void {
    this.abilityValue = newAbilityValue;
  }
  getMethodName(): string {
    return this.methodName;
  }
  setMethodName(newMethodName: string): void {
    this.methodName = newMethodName;
  }
  getMethodValue(): string {
    return this.methodValue;
  }
  setMethodValue(newMethodValue: string): void {
    this.methodValue = newMethodValue;
  }
  /**
   * Does this scope apply to a given object?
   *
   * @param object The {@code FreeColSpecObjectType} to test.
   * @return True if the scope is applicable.
   */
  appliesTo(object$: FreeColObject): boolean {
    if (object$ == null) {
      return this.matchesNull;
    }
    if (this.type != null) {
      if (object$ instanceof FreeColSpecObjectType) {
        if (!$J.equals(this.type, object$.getId())) {
          return this.matchNegated;
        }
      } else {
        let fcgot = object$.invokeMethod('getType', $J.cls(FreeColSpecObjectType), null);
        if (fcgot == null || !$J.equals(this.type, fcgot.getId())) {
          return this.matchNegated;
        }
      }
    }
    if (this.abilityId != null && object$.hasAbility$String(this.abilityId) !== this.abilityValue) {
      return this.matchNegated;
    }
    if (this.methodName != null) {
      let ret = object$.invokeMethod(this.methodName, $J.cls(JObject), null);
      if (!$J.equals($J.str(ret), this.methodValue)) {
        return this.matchNegated;
      }
    }
    return !this.matchNegated;
  }
  /**
   * {@inheritDoc}
   */
  copyIn<T>(other: T): boolean {
    let o = this.copyInCast(other, $J.cls(Scope));
    if (o == null || !super.copyIn(o)) {
      return false;
    }
    this.type = o.getType();
    this.abilityId = o.getAbilityId();
    this.abilityValue = o.getAbilityValue();
    this.methodName = o.getMethodName();
    this.methodValue = o.getMethodValue();
    this.matchesNull = o.getMatchesNull();
    this.matchNegated = o.getMatchNegated();
    return true;
  }
  /**
   * {@inheritDoc}
   */
  writeAttributes(xw: FreeColXMLWriter): void {
    xw.writeAttribute$String$boolean(Scope.MATCH_NEGATED_TAG, this.matchNegated);
    xw.writeAttribute$String$boolean(Scope.MATCHES_NULL_TAG, this.matchesNull);
    if (this.type != null) {
      xw.writeAttribute(Scope.TYPE_TAG, this.type);
    }
    if (this.abilityId != null) {
      xw.writeAttribute(Scope.ABILITY_ID_TAG, this.abilityId);
      xw.writeAttribute$String$boolean(Scope.ABILITY_VALUE_TAG, this.abilityValue);
    }
    if (this.methodName != null) {
      xw.writeAttribute(Scope.METHOD_NAME_TAG, this.methodName);
      if (this.methodValue != null) {
        xw.writeAttribute(Scope.METHOD_VALUE_TAG, this.methodValue);
      }
    }
  }
  /**
   * {@inheritDoc}
   */
  readAttributes(xr: FreeColXMLReader): void {
    if (xr.hasAttribute(Scope.OLD_MATCH_NEGATED_TAG)) {
      this.matchNegated = xr.getAttribute$String$boolean(Scope.OLD_MATCH_NEGATED_TAG, false);
    } else {
      this.matchNegated = xr.getAttribute$String$boolean(Scope.MATCH_NEGATED_TAG, false);
    }
    if (xr.hasAttribute(Scope.OLD_MATCHES_NULL_TAG)) {
      this.matchesNull = xr.getAttribute$String$boolean(Scope.OLD_MATCHES_NULL_TAG, true);
    } else {
      this.matchesNull = xr.getAttribute$String$boolean(Scope.MATCHES_NULL_TAG, true);
    }
    this.type = xr.getAttribute$String$String(Scope.TYPE_TAG, null);
    this.abilityId = xr.getAttribute$String$String(Scope.ABILITY_ID_TAG, null);
    this.abilityValue = xr.getAttribute$String$boolean(Scope.ABILITY_VALUE_TAG, true);
    if (xr.hasAttribute(Scope.OLD_METHOD_NAME_TAG)) {
      this.methodName = xr.getAttribute$String$String(Scope.OLD_METHOD_NAME_TAG, null);
    } else {
      this.methodName = xr.getAttribute$String$String(Scope.METHOD_NAME_TAG, null);
    }
    if (xr.hasAttribute(Scope.OLD_METHOD_VALUE_TAG)) {
      this.methodValue = xr.getAttribute$String$String(Scope.OLD_METHOD_VALUE_TAG, null);
    } else {
      this.methodValue = xr.getAttribute$String$String(Scope.METHOD_VALUE_TAG, null);
    }
  }
  /**
   * {@inheritDoc}
   */
  getXMLTagName(): string {
    return Scope.TAG;
  }
  /**
   * {@inheritDoc}
   */
  equals(o: any): boolean {
    if (o === this) {
      return true;
    }
    if (o instanceof Scope) {
      let other = o;
      if (this.matchNegated !== other.matchNegated) {
        return false;
      }
      if (this.matchesNull !== other.matchesNull) {
        return false;
      }
      if (this.type == null) {
        if (other.getType() != null) {
          return false;
        }
      } else if (!$J.equals(this.type, other.getType())) {
        return false;
      }
      if (this.abilityId == null) {
        if (!Utils.equals(other.getAbilityId(), this.abilityId)) {
          return false;
        }
      } else if (!$J.equals(this.abilityId, other.getAbilityId())) {
        return false;
      }
      if (this.abilityValue !== other.getAbilityValue()) {
        return false;
      }
      if (this.methodName == null) {
        if (!Utils.equals(other.getMethodName(), this.methodName)) {
          return false;
        }
      } else if (!$J.equals(this.methodName, other.getMethodName())) {
        return false;
      }
      if (this.methodValue == null) {
        if (!Utils.equals(other.getMethodValue(), this.methodValue)) {
          return false;
        }
      } else if (!$J.equals(this.methodValue, other.getMethodValue())) {
        return false;
      }
      return super.equals(other);
    }
    return false;
  }
  /**
   * {@inheritDoc}
   */
  hashCode(): number {
    let hash = super.hashCode();
    hash = (Math.imul(31, hash) + (this.type == null ? 0 : $J.hashCode(this.type))) | 0;
    hash = (Math.imul(31, hash) + (this.abilityId == null ? 0 : $J.hashCode(this.abilityId))) | 0;
    hash = (Math.imul(31, hash) + (this.abilityValue ? 1 : 0)) | 0;
    hash = (Math.imul(31, hash) + (this.methodName == null ? 0 : $J.hashCode(this.methodName))) | 0;
    hash = (Math.imul(31, hash) + (this.methodValue == null ? 0 : $J.hashCode(this.methodValue))) | 0;
    hash = (Math.imul(31, hash) + (this.matchesNull ? 1 : 0)) | 0;
    return (Math.imul(31, hash) + (this.matchNegated ? 1 : 0)) | 0;
  }
  /**
   * {@inheritDoc}
   */
  toString(): string {
    let sb = new StringBuilder(64);
    sb.append('[Scope ').append(this.type);
    if (this.abilityId != null) {
      sb.append(String.fromCharCode(32 /* ' ' */)).append(this.abilityId).append(String.fromCharCode(61 /* '=' */)).append(String(this.abilityValue));
    }
    if (this.methodName != null) {
      sb.append(String.fromCharCode(32 /* ' ' */)).append(this.methodName).append(String.fromCharCode(61 /* '=' */)).append(this.methodValue);
    }
    if (this.matchesNull) {
      sb.append(' matches-null');
    }
    if (this.matchNegated) {
      sb.append(' match-negated');
    }
    sb.append(String.fromCharCode(93 /* ']' */));
    return sb.toString();
  }
}

$J.define(Scope, 'net.sf.freecol.common.model.Scope', { kind: 'class', sup: 'net.sf.freecol.common.model.FreeColObject', ctors: { 'net.sf.freecol.common.io.FreeColXMLReader': '_Scope$FreeColXMLReader', '': '_Scope$' }, returns: { 'hashCode': 'int', 'getXMLTagName': 'java.lang.String', 'getMethodValue': 'java.lang.String', 'getMethodName': 'java.lang.String', 'getAbilityValue': 'boolean', 'getAbilityId': 'java.lang.String', 'getType': 'java.lang.String', 'getMatchNegated': 'boolean', 'getMatchesNull': 'boolean', 'getFeatureString': 'java.lang.String', 'getKey': 'java.lang.String' } });
$J.module(() => {
  Messages = $J.load('net.sf.freecol.common.i18n.Messages');
  FreeColSpecObjectType = $J.load('net.sf.freecol.common.model.FreeColSpecObjectType');
  Utils = $J.load('net.sf.freecol.common.util.Utils');
});
