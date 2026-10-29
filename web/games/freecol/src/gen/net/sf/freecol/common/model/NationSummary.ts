// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/common/model/NationSummary.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { FreeColObject } from './FreeColObject.ts';

let Ability, Stance;

/**
 * A container class summarizing an enemy nation.
 */
export class NationSummary extends FreeColObject {
  static readonly TAG: string = 'nationSummary';
  /**
   * The stance of the player toward the requesting player.
   */
  stance: Stance = null;
  /**
   * The number of settlements this player has.
   */
  numberOfSettlements: number = 0;
  /**
   * The number of units this (European) player has.
   */
  numberOfUnits: number = 0;
  /**
   * The military strength of this (European) player.
   */
  militaryStrength: number = 0;
  /**
   * The naval strength of this (European) player.
   */
  navalStrength: number = 0;
  /**
   * The gold this (European) player has.
   */
  gold: number = 0;
  /**
   * The (European) player SoL.
   */
  soL: number = 0;
  /**
   * The number of founding fathers this (European) player has.
   */
  foundingFathers: number = 0;
  /**
   * The tax rate of this (European) player.
   */
  tax: number = 0;
  static readonly FOUNDING_FATHERS_TAG: string = 'foundingFathers';
  static readonly GOLD_TAG: string = 'gold';
  static readonly MILITARY_STRENGTH_TAG: string = 'militaryStrength';
  static readonly NAVAL_STRENGTH_TAG: string = 'navalStrength';
  static readonly NUMBER_OF_SETTLEMENTS_TAG: string = 'numberOfSettlements';
  static readonly NUMBER_OF_UNITS_TAG: string = 'numberOfUnits';
  static readonly SOL_TAG: string = 'SoL';
  static readonly STANCE_TAG: string = 'stance';
  static readonly TAX_TAG: string = 'tax';
  /**
   * Trivial constructor allowing creation by Game.newInstance().
   */
  _NationSummary$(): this {
    this._FreeColObject();
    this.setId('');
    return this;
  }
  /**
   * Creates a nation summary for the specified player.
   *
   * @param player The {@code Player} to create the summary for.
   * @param requester The {@code Player} making the request.
   */
  _NationSummary$Player$Player(player: Player, requester: Player): this {
    this._NationSummary$();
    this.stance = player.getStance(requester);
    if (this.stance === Stance.UNCONTACTED) {
      this.stance = Stance.PEACE;
    }
    this.numberOfSettlements = player.getSettlementCount();
    if (player.isEuropean()) {
      this.numberOfUnits = player.getUnitCount$();
      this.militaryStrength = player.calculateStrength(false);
      this.navalStrength = player.calculateStrength(true);
      this.gold = player.getGold();
      if (player === requester || requester.hasAbility$String(Ability.BETTER_FOREIGN_AFFAIRS_REPORT)) {
        this.soL = player.getSoL();
        this.foundingFathers = player.getFatherCount();
        this.tax = player.getTax();
      } else {
        this.soL = this.foundingFathers = this.tax = -1;
      }
    } else {
      this.numberOfUnits = this.militaryStrength = this.navalStrength = this.gold = this.soL = this.foundingFathers = this.tax = -1;
    }
    return this;
  }
  getStance(): Stance {
    return this.stance;
  }
  getNumberOfSettlements(): number {
    return this.numberOfSettlements;
  }
  getNumberOfUnits(): number {
    return this.numberOfUnits;
  }
  getMilitaryStrength(): number {
    return this.militaryStrength;
  }
  getNavalStrength(): number {
    return this.navalStrength;
  }
  getGold(): number {
    return this.gold;
  }
  getFoundingFathers(): number {
    return this.foundingFathers;
  }
  getSoL(): number {
    return this.soL;
  }
  getTax(): number {
    return this.tax;
  }
  /**
   * {@inheritDoc}
   */
  copyIn<T>(other: T): boolean {
    let o = this.copyInCast(other, $J.cls(NationSummary));
    if (o == null || !super.copyIn(o)) {
      return false;
    }
    this.stance = o.getStance();
    this.numberOfSettlements = o.getNumberOfSettlements();
    this.numberOfUnits = o.getNumberOfUnits();
    this.militaryStrength = o.getMilitaryStrength();
    this.navalStrength = o.getNavalStrength();
    this.gold = o.getGold();
    this.soL = o.getSoL();
    this.foundingFathers = o.getFoundingFathers();
    this.tax = o.getTax();
    return true;
  }
  /**
   * {@inheritDoc}
   */
  writeAttributes(xw: FreeColXMLWriter): void {
    super.writeAttributes(xw);
    xw.writeAttribute$String$int(NationSummary.NUMBER_OF_SETTLEMENTS_TAG, this.numberOfSettlements);
    xw.writeAttribute$String$int(NationSummary.NUMBER_OF_UNITS_TAG, this.numberOfUnits);
    xw.writeAttribute$String$int(NationSummary.MILITARY_STRENGTH_TAG, this.militaryStrength);
    xw.writeAttribute$String$int(NationSummary.NAVAL_STRENGTH_TAG, this.navalStrength);
    xw.writeAttribute$String$Enum(NationSummary.STANCE_TAG, this.stance);
    xw.writeAttribute$String$int(NationSummary.GOLD_TAG, this.gold);
    if (this.soL >= 0) {
      xw.writeAttribute$String$int(NationSummary.SOL_TAG, this.soL);
    }
    if (this.foundingFathers >= 0) {
      xw.writeAttribute$String$int(NationSummary.FOUNDING_FATHERS_TAG, this.foundingFathers);
    }
    if (this.tax >= 0) {
      xw.writeAttribute$String$int(NationSummary.TAX_TAG, this.tax);
    }
  }
  /**
   * {@inheritDoc}
   */
  readAttributes(xr: FreeColXMLReader): void {
    super.readAttributes(xr);
    this.stance = xr.getAttribute$String$Class$Enum(NationSummary.STANCE_TAG, $J.cls(Stance), Stance.PEACE);
    this.numberOfSettlements = xr.getAttribute$String$int(NationSummary.NUMBER_OF_SETTLEMENTS_TAG, -1);
    this.numberOfUnits = xr.getAttribute$String$int(NationSummary.NUMBER_OF_UNITS_TAG, -1);
    this.militaryStrength = xr.getAttribute$String$int(NationSummary.MILITARY_STRENGTH_TAG, -1);
    this.navalStrength = xr.getAttribute$String$int(NationSummary.NAVAL_STRENGTH_TAG, -1);
    this.gold = xr.getAttribute$String$int(NationSummary.GOLD_TAG, -1);
    this.soL = xr.getAttribute$String$int(NationSummary.SOL_TAG, -1);
    this.foundingFathers = xr.getAttribute$String$int(NationSummary.FOUNDING_FATHERS_TAG, -1);
    this.tax = xr.getAttribute$String$int(NationSummary.TAX_TAG, -1);
  }
  /**
   * {@inheritDoc}
   */
  getXMLTagName(): string {
    return NationSummary.TAG;
  }
}

$J.define(NationSummary, 'net.sf.freecol.common.model.NationSummary', { kind: 'class', sup: 'net.sf.freecol.common.model.FreeColObject', ctors: { 'net.sf.freecol.common.model.Player,net.sf.freecol.common.model.Player': '_NationSummary$Player$Player', '': '_NationSummary$' }, returns: { 'getXMLTagName': 'java.lang.String', 'getTax': 'int', 'getSoL': 'int', 'getFoundingFathers': 'int', 'getGold': 'int', 'getNavalStrength': 'int', 'getMilitaryStrength': 'int', 'getNumberOfUnits': 'int', 'getNumberOfSettlements': 'int', 'getStance': 'net.sf.freecol.common.model.Stance' } });
$J.module(() => {
  Ability = $J.load('net.sf.freecol.common.model.Ability');
  Stance = $J.load('net.sf.freecol.common.model.Stance');
});
