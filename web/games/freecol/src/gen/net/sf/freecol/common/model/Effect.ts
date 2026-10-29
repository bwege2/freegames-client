// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/common/model/Effect.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J, StringBuilder } from '../../../../../../jre/index.ts';
import { FreeColSpecObjectType } from './FreeColSpecObjectType.ts';

/**
 * The effect of a natural disaster or other event. How the
 * probability of the effect is interpreted depends on the number of
 * effects value of the disaster or event. If the number of effects is
 * ALL, the probability is ignored. If it is ONE, then the probability
 * may be an arbitrary integer, and is used only for comparison with
 * other effects. If the number of effects is SEVERAL, however, the
 * probability must be a percentage.
 *
 * @see Disaster
 */
export class Effect extends FreeColSpecObjectType {
  static readonly TAG: string = 'effect';
  static readonly DAMAGED_UNIT: string = 'model.disaster.effect.damagedUnit';
  static readonly LOSS_OF_UNIT: string = 'model.disaster.effect.lossOfUnit';
  static readonly LOSS_OF_MONEY: string = 'model.disaster.effect.lossOfMoney';
  static readonly LOSS_OF_GOODS: string = 'model.disaster.effect.lossOfGoods';
  static readonly LOSS_OF_TILE_PRODUCTION: string = 'model.disaster.effect.lossOfTileProduction';
  static readonly LOSS_OF_BUILDING: string = 'model.disaster.effect.lossOfBuilding';
  static readonly LOSS_OF_BUILDING_PRODUCTION: string = 'model.disaster.effect.lossOfBuildingProduction';
  /**
   * The probability of this effect.
   */
  probability: number = 0;
  static readonly PROBABILITY_TAG: string = 'probability';
  /**
   * Deliberately empty constructor.
   */
  _Effect$(): this {
    this._FreeColSpecObjectType$();
    return this;
  }
  /**
   * Creates a new {@code Effect} instance.
   *
   * @param xr The {@code FreeColXMLReader} to read from.
   * @param specification The {@code Specification} to refer to.
   * @exception XMLStreamException if an error occurs
   */
  _Effect$FreeColXMLReader$Specification(xr: FreeColXMLReader, specification: Specification): this {
    this._FreeColSpecObjectType$();
    this.setSpecification(specification);
    this.readFromXML(xr);
    return this;
  }
  /**
   * Create a new effect from an existing one.
   *
   * @param template The {@code Effect} to copy from.
   */
  _Effect$Effect(template: Effect): this {
    this._FreeColSpecObjectType$();
    this.setId(template.getId());
    this.setSpecification(template.getSpecification());
    this.probability = template.probability;
    this.copyScopes(template.getScopeList());
    this.addFeatures(template);
    return this;
  }
  /**
   * Get the probability of this effect.
   *
   * @return The probability.
   */
  getProbability(): number {
    return this.probability;
  }
  /**
   * {@inheritDoc}
   */
  copyIn<T>(other: T): boolean {
    let o = this.copyInCast(other, $J.cls(Effect));
    if (o == null || !super.copyIn(o)) {
      return false;
    }
    this.probability = o.getProbability();
    return true;
  }
  /**
   * {@inheritDoc}
   */
  writeAttributes(xw: FreeColXMLWriter): void {
    super.writeAttributes(xw);
    xw.writeAttribute$String$int(Effect.PROBABILITY_TAG, this.probability);
  }
  /**
   * {@inheritDoc}
   */
  readAttributes(xr: FreeColXMLReader): void {
    super.readAttributes(xr);
    this.probability = xr.getAttribute$String$int(Effect.PROBABILITY_TAG, 0);
  }
  /**
   * {@inheritDoc}
   */
  getXMLTagName(): string {
    return Effect.TAG;
  }
  /**
   * {@inheritDoc}
   */
  toString(): string {
    let sb = new StringBuilder(32);
    sb.append(String.fromCharCode(91 /* '[' */)).append(this.getId()).append(' probability=').append(String(this.probability)).append(String.fromCharCode(37 /* '%' */));
    for (const $it0 = this.getScopeList().iterator(); $it0.hasNext(); ) {
      let scope = $it0.next();
      sb.append(String.fromCharCode(32 /* ' ' */)).append($J.str(scope));
    }
    sb.append(String.fromCharCode(93 /* ']' */));
    return sb.toString();
  }
}

$J.define(Effect, 'net.sf.freecol.common.model.Effect', { kind: 'class', sup: 'net.sf.freecol.common.model.FreeColSpecObjectType', ctors: { 'net.sf.freecol.common.model.Effect': '_Effect$Effect', 'net.sf.freecol.common.io.FreeColXMLReader,net.sf.freecol.common.model.Specification': '_Effect$FreeColXMLReader$Specification', '': '_Effect$' }, returns: { 'getXMLTagName': 'java.lang.String', 'getProbability': 'int' } });
