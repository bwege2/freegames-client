// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/common/model/Feature.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J } from '../../../../../../jre/index.ts';
import { FreeColSpecObject } from './FreeColSpecObject.ts';

let Messages, BuildingType, Constants, FoundingFather, NationType, Scope, ScopeContainer, SettlementType, Turn, CollectionUtils, Utils;

/**
 * The {@code Feature} class encapsulates a bonus or penalty
 * that can be applied to any action within the game, most obviously
 * combat.
 *
 * Do not make this a FCSOT because that has a FeatureContainer.  Lumping
 * features onto features would be incoherent.
 */
export class Feature extends FreeColSpecObject {
  /**
   * The source of this Feature, e.g. a UnitType.
   */
  source: FreeColObject = null;
  /**
   * The first Turn in which this Feature applies.
   */
  firstTurn: Turn = null;
  /**
   * The last Turn in which this Feature applies.
   */
  lastTurn: Turn = null;
  /**
   * The duration of this Feature. By default, the duration is unlimited.
   */
  duration: number = 0;
  /**
   * Transient features are provided by events such as disasters and
   * goods parties, and need to be serialized by the
   * FreeColGameObject they apply to.
   */
  temporary: boolean = false;
  /**
   * The scopes limiting the applicability of this Feature.
   */
  scopeContainer: ScopeContainer = null;
  static readonly DURATION_TAG: string = 'duration';
  static readonly FIRST_TURN_TAG: string = 'firstTurn';
  static readonly LAST_TURN_TAG: string = 'lastTurn';
  static readonly SOURCE_TAG: string = 'source';
  static readonly TEMPORARY_TAG: string = 'temporary';
  /**
   * Deliberately trivial constructor.
   *
   * @param specification The {@code Specification} to use.
   */
  _Feature(specification: Specification): this {
    this._FreeColSpecObject(specification);
    this.duration = 0;
    return this;
  }
  /**
   * Does this feature have a time limit?
   *
   * @return True if the feature is time limited.
   */
  hasTimeLimit(): boolean {
    return (this.firstTurn != null || this.lastTurn != null);
  }
  /**
   * Get the first turn of a time limit.
   *
   * @return The first turn, or null if none.
   */
  getFirstTurn(): Turn {
    return this.firstTurn;
  }
  /**
   * Set the first turn of a time limit.
   *
   * @param newFirstTurn The new first turn value.
   */
  setFirstTurn(newFirstTurn: Turn): void {
    this.firstTurn = newFirstTurn;
  }
  /**
   * Get the last turn of a time limit.
   *
   * @return The last turn, or null if none.
   */
  getLastTurn(): Turn {
    return this.lastTurn;
  }
  /**
   * Set the last turn of a time limit.
   *
   * @param newLastTurn The new last turn value.
   */
  setLastTurn(newLastTurn: Turn): void {
    this.lastTurn = newLastTurn;
  }
  /**
   * Get the source of this feature.
   *
   * @return The source object.
   */
  getSource(): FreeColObject {
    return this.source;
  }
  /**
   * Set the source of this feature.
   *
   * @param newSource The new source.
   */
  setSource(newSource: FreeColObject): void {
    this.source = newSource;
  }
  /**
   * Get the duration of this feature.
   *
   * @return The number of turns this feature lasts.
   */
  getDuration(): number {
    return this.duration;
  }
  /**
   * Set the duration of this feature.
   *
   * @param newDuration The new duration.
   */
  setDuration(newDuration: number): void {
    this.duration = newDuration;
  }
  /**
   * Is this a temporary feature?
   *
   * @return True if this is a temporary feature.
   */
  isTemporary(): boolean {
    return this.temporary;
  }
  /**
   * Set the temporary status.
   *
   * @param newTemporary The new temporary status.
   */
  setTemporary(newTemporary: boolean): void {
    this.temporary = newTemporary;
  }
  /**
   * Does this feature apply to a given turn?
   *
   * @param turn The {@code Turn} to test.
   * @return True if the turn is null or not outside a valid time limit.
   */
  appliesTo$Turn(turn: Turn): boolean {
    return !(turn != null && (this.firstTurn != null && turn.getNumber() < this.firstTurn.getNumber() || this.lastTurn != null && turn.getNumber() > this.lastTurn.getNumber()));
  }
  /**
   * Does this feature apply to a given object type and turn.
   *
   * @param objectType The {@code FreeColSpecObjectType} to test.
   * @param turn The {@code Turn} to test.
   * @return True if the feature applies.
   */
  appliesTo$FreeColSpecObjectType$Turn(objectType: FreeColSpecObjectType, turn: Turn): boolean {
    return this.appliesTo$Turn(turn) && this.appliesTo$FreeColObject(objectType);
  }
  /**
   * Is this feature out of date with respect to a given turn?
   *
   * @param turn The {@code Turn} to compare to.
   * @return True if the Feature has an lastTurn turn smaller than the
   *     given turn.
   */
  isOutOfDate(turn: Turn): boolean {
    return turn != null && this.lastTurn != null && turn.getNumber() > this.lastTurn.getNumber();
  }
  /**
   * Is this feature an independent stand-alone one, or is it
   * derived from some other entity such as a founding father.  This
   * is important for player and colony serialization, where we do
   * *not* want to read or write derived features because they are
   * added to the player by the source.
   *
   * @return True if the feature is independent.
   */
  isIndependent(): boolean {
    if (this.source instanceof BuildingType || this.source instanceof FoundingFather || this.source instanceof NationType || this.source instanceof SettlementType) {
      return false;
    }
    return true;
  }
  /**
   * {@inheritDoc}
   */
  getNameKey(): string {
    return Messages.nameKey$String(this.getId());
  }
  hasScope(): boolean {
    return !ScopeContainer.isScopeContainerEmpty(this.scopeContainer);
  }
  getScopeList(): List<Scope> {
    return ScopeContainer.getScopeList(this.scopeContainer);
  }
  getScopes(): Stream<Scope> {
    return ScopeContainer.getScopes(this.scopeContainer);
  }
  copyScopes(scopes: Collection<Scope>): void {
    this.scopeContainer = ScopeContainer.setScopes(this.scopeContainer, scopes);
  }
  addScope(scope: Scope): void {
    this.scopeContainer = ScopeContainer.addScope(this.scopeContainer, scope);
  }
  appliesTo$FreeColObject(fco: FreeColObject): boolean {
    return ScopeContainer.scopeContainerAppliesTo(this.scopeContainer, fco);
  }
  /**
   * {@inheritDoc}
   */
  copyIn<T>(other: T): boolean {
    let o = this.copyInCast(other, $J.cls(Feature));
    if (o == null || !super.copyIn(o)) {
      return false;
    }
    this.source = o.getSource();
    this.firstTurn = o.getFirstTurn();
    this.lastTurn = o.getLastTurn();
    this.duration = o.getDuration();
    this.temporary = o.isTemporary();
    this.copyScopes(o.getScopeList());
    return true;
  }
  /**
   * {@inheritDoc}
   */
  writeAttributes(xw: FreeColXMLWriter): void {
    super.writeAttributes(xw);
    if (this.getSource() != null) {
      xw.writeAttribute$String$FreeColObject(Feature.SOURCE_TAG, this.getSource());
    }
    if (this.getFirstTurn() != null) {
      xw.writeAttribute$String$int(Feature.FIRST_TURN_TAG, this.getFirstTurn().getNumber());
    }
    if (this.getLastTurn() != null) {
      xw.writeAttribute$String$int(Feature.LAST_TURN_TAG, this.getLastTurn().getNumber());
    }
    if (this.duration !== 0) {
      xw.writeAttribute$String$int(Feature.DURATION_TAG, this.duration);
    }
    if (this.temporary) {
      xw.writeAttribute$String$boolean(Feature.TEMPORARY_TAG, this.temporary);
    }
  }
  /**
   * {@inheritDoc}
   */
  writeChildren(xw: FreeColXMLWriter): void {
    super.writeChildren(xw);
    for (const $it0 = this.getScopeList().iterator(); $it0.hasNext(); ) {
      let scope = $it0.next();
      scope.toXML$FreeColXMLWriter(xw);
    }
  }
  /**
   * {@inheritDoc}
   */
  readAttributes(xr: FreeColXMLReader): void {
    super.readAttributes(xr);
    let spec = this.getSpecification();
    let str = xr.getAttribute$String$String(Feature.SOURCE_TAG, null);
    if (str == null) {
      this.setSource(null);
    } else if (spec != null) {
      this.setSource(spec.getType(str));
    }
    let firstTurn = xr.getAttribute$String$int(Feature.FIRST_TURN_TAG, Constants.UNDEFINED);
    if (firstTurn !== Constants.UNDEFINED) {
      this.setFirstTurn(new Turn()._Turn(firstTurn));
    }
    let lastTurn = xr.getAttribute$String$int(Feature.LAST_TURN_TAG, Constants.UNDEFINED);
    if (lastTurn !== Constants.UNDEFINED) {
      this.setLastTurn(new Turn()._Turn(lastTurn));
    }
    this.duration = xr.getAttribute$String$int(Feature.DURATION_TAG, 0);
    this.temporary = xr.getAttribute$String$boolean(Feature.TEMPORARY_TAG, false);
  }
  /**
   * {@inheritDoc}
   */
  readChildren(xr: FreeColXMLReader): void {
    ScopeContainer.clearScopes(this.scopeContainer);
    super.readChildren(xr);
  }
  /**
   * {@inheritDoc}
   */
  readChild(xr: FreeColXMLReader): void {
    let tag = xr.getLocalName();
    if ($J.equals(Scope.TAG, tag)) {
      this.addScope(new Scope()._Scope$FreeColXMLReader(xr));
    } else {
      super.readChild(xr);
    }
  }
  /**
   * {@inheritDoc}
   */
  equals(o: any): boolean {
    if (o === this) {
      return true;
    }
    if (o instanceof Feature) {
      let other = o;
      if (this.source !== other.source || this.duration !== other.duration || this.temporary !== other.temporary) {
        return false;
      }
      if (this.firstTurn == null) {
        if (other.firstTurn != null) {
          return false;
        }
      } else if (other.firstTurn == null) {
        return false;
      } else if (this.firstTurn.getNumber() !== other.firstTurn.getNumber()) {
        return false;
      }
      if (this.lastTurn == null) {
        if (other.lastTurn != null) {
          return false;
        }
      } else if (other.lastTurn == null) {
        return false;
      } else if (this.lastTurn.getNumber() !== other.lastTurn.getNumber()) {
        return false;
      }
      return ScopeContainer.equalScopes(this.scopeContainer, other.scopeContainer) && super.equals(other);
    }
    return false;
  }
  /**
   * {@inheritDoc}
   */
  hashCode(): number {
    let hash = super.hashCode();
    hash = (hash + (Math.imul(31, hash) + Utils.hashCode(this.source))) | 0;
    hash = (hash + (Math.imul(31, hash) + ((this.firstTurn == null) ? 0 : this.firstTurn.getNumber()))) | 0;
    hash = (hash + (Math.imul(31, hash) + ((this.lastTurn == null) ? 0 : this.lastTurn.getNumber()))) | 0;
    hash = (hash + (Math.imul(31, hash) + this.duration)) | 0;
    hash = (hash + Math.imul(31, ((this.temporary) ? 1 : 0))) | 0;
    hash = (hash + (CollectionUtils.sum$Collection$ToIntFunction(this.getScopeList(), (s) => Utils.hashCode(s)))) | 0;
    return hash;
  }
}

$J.define(Feature, 'net.sf.freecol.common.model.Feature', { kind: 'class', ifaces: ['net.sf.freecol.common.model.Named'], sup: 'net.sf.freecol.common.model.FreeColSpecObject', ctors: { 'net.sf.freecol.common.model.Specification': '_Feature' }, returns: { 'hashCode': 'int', 'getScopes': 'java.util.stream.Stream', 'getScopeList': 'java.util.List', 'hasScope': 'boolean', 'getNameKey': 'java.lang.String', 'isIndependent': 'boolean', 'isTemporary': 'boolean', 'getDuration': 'int', 'getSource': 'net.sf.freecol.common.model.FreeColObject', 'getLastTurn': 'net.sf.freecol.common.model.Turn', 'getFirstTurn': 'net.sf.freecol.common.model.Turn', 'hasTimeLimit': 'boolean' }, meths: { 'appliesTo(net.sf.freecol.common.model.FreeColObject)': 'appliesTo$FreeColObject', 'appliesTo(net.sf.freecol.common.model.FreeColSpecObjectType,net.sf.freecol.common.model.Turn)': 'appliesTo$FreeColSpecObjectType$Turn', 'appliesTo(net.sf.freecol.common.model.Turn)': 'appliesTo$Turn' } });
$J.module(() => {
  Messages = $J.load('net.sf.freecol.common.i18n.Messages');
  BuildingType = $J.load('net.sf.freecol.common.model.BuildingType');
  Constants = $J.load('net.sf.freecol.common.model.Constants');
  FoundingFather = $J.load('net.sf.freecol.common.model.FoundingFather');
  NationType = $J.load('net.sf.freecol.common.model.NationType');
  Scope = $J.load('net.sf.freecol.common.model.Scope');
  ScopeContainer = $J.load('net.sf.freecol.common.model.ScopeContainer');
  SettlementType = $J.load('net.sf.freecol.common.model.SettlementType');
  Turn = $J.load('net.sf.freecol.common.model.Turn');
  CollectionUtils = $J.load('net.sf.freecol.common.util.CollectionUtils');
  Utils = $J.load('net.sf.freecol.common.util.Utils');
});
