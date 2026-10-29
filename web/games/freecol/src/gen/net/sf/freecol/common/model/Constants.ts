// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/common/model/Constants.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J, JEnum } from '../../../../../../jre/index.ts';

/**
 * Contains the constants.  These constants are used by the
 * controllers and input handlers when they are communicating.
 */
export class Constants {
  /**
   * Generic "huge" value.
   */
  static readonly INFINITY: number = 2147483647;
  /**
   * Generic "unsure" value.
   */
  static readonly UNDEFINED: number = -2147483648;
  /**
   * Price used to denote claiming land by stealing it.
   */
  static readonly STEAL_LAND: number = -1;
}

/**
 * The result of checkIntegrity.
 */
export class Constants$IntegrityType extends JEnum {
  /**
   * The magic value.
   */
  val: number = 0;
  static INTEGRITY_FAIL: Constants$IntegrityType = null;
  static INTEGRITY_FIXED: Constants$IntegrityType = null;
  static INTEGRITY_GOOD: Constants$IntegrityType = null;
  static $VALUES: Constants$IntegrityType[] = null;
  /**
   * Build an integrity type with the given value.
   *
   * @param val The value.
   */
  _Constants$IntegrityType($name: string, $ordinal: number, val: number): this {
    this._JEnum($name, $ordinal);
    this.val = val;
    return this;
  }
  /**
   * Is this integrity safe (i.e. non-failed).
   *
   * @return True if the integrity is safe.
   */
  safe(): boolean {
    return this !== Constants$IntegrityType.INTEGRITY_FAIL;
  }
  /**
   * Combine this integrity with another.
   *
   * @param it The other {@code IntegrityType}.
   * @return The combined integrity.
   */
  combine(it: Constants$IntegrityType): Constants$IntegrityType {
    return Constants$IntegrityType.values()[(1 + Math.min(this.val, it.val)) | 0];
  }
  /**
   * Get the fixed version of this integrity.
   *
   * If the integrity is broken, nothing can happen.
   *
   * @return The fixed {@code IntegrityType}.
   */
  fix(): Constants$IntegrityType {
    return this.combine(Constants$IntegrityType.INTEGRITY_FIXED);
  }
  /**
   * Get the failed version of this integrity.
   *
   * @return INTEGRITY_FAIL.
   */
  fail(): Constants$IntegrityType {
    return Constants$IntegrityType.INTEGRITY_FAIL;
  }
  static values(): Constants$IntegrityType[] { return Constants$IntegrityType.$VALUES.slice(); }
  static valueOf(name: string): Constants$IntegrityType { return $J.enumValueOf(Constants$IntegrityType, name); }
  static $clinit() {
    Constants$IntegrityType.INTEGRITY_FAIL = new Constants$IntegrityType()._Constants$IntegrityType('INTEGRITY_FAIL', 0, -1);
    Constants$IntegrityType.INTEGRITY_FIXED = new Constants$IntegrityType()._Constants$IntegrityType('INTEGRITY_FIXED', 1, 0);
    Constants$IntegrityType.INTEGRITY_GOOD = new Constants$IntegrityType()._Constants$IntegrityType('INTEGRITY_GOOD', 2, 1);
    Constants$IntegrityType.$VALUES = [Constants$IntegrityType.INTEGRITY_FAIL, Constants$IntegrityType.INTEGRITY_FIXED, Constants$IntegrityType.INTEGRITY_GOOD];
  }
}

/**
 * Actions when an armed unit contacts a settlement.
 */
export class Constants$ArmedUnitSettlementAction extends JEnum {
  static SETTLEMENT_ATTACK: Constants$ArmedUnitSettlementAction = null;
  static SETTLEMENT_TRIBUTE: Constants$ArmedUnitSettlementAction = null;
  static $VALUES: Constants$ArmedUnitSettlementAction[] = null;
  _Constants$ArmedUnitSettlementAction($name: string, $ordinal: number): this {
    this._JEnum($name, $ordinal);
    return this;
  }
  static values(): Constants$ArmedUnitSettlementAction[] { return Constants$ArmedUnitSettlementAction.$VALUES.slice(); }
  static valueOf(name: string): Constants$ArmedUnitSettlementAction { return $J.enumValueOf(Constants$ArmedUnitSettlementAction, name); }
  static $clinit() {
    Constants$ArmedUnitSettlementAction.SETTLEMENT_ATTACK = new Constants$ArmedUnitSettlementAction()._Constants$ArmedUnitSettlementAction('SETTLEMENT_ATTACK', 0);
    Constants$ArmedUnitSettlementAction.SETTLEMENT_TRIBUTE = new Constants$ArmedUnitSettlementAction()._Constants$ArmedUnitSettlementAction('SETTLEMENT_TRIBUTE', 1);
    Constants$ArmedUnitSettlementAction.$VALUES = [Constants$ArmedUnitSettlementAction.SETTLEMENT_ATTACK, Constants$ArmedUnitSettlementAction.SETTLEMENT_TRIBUTE];
  }
}

/**
 * Actions when dealing with a boycott.
 */
export class Constants$BoycottAction extends JEnum {
  static BOYCOTT_PAY_ARREARS: Constants$BoycottAction = null;
  static BOYCOTT_DUMP_CARGO: Constants$BoycottAction = null;
  static $VALUES: Constants$BoycottAction[] = null;
  _Constants$BoycottAction($name: string, $ordinal: number): this {
    this._JEnum($name, $ordinal);
    return this;
  }
  static values(): Constants$BoycottAction[] { return Constants$BoycottAction.$VALUES.slice(); }
  static valueOf(name: string): Constants$BoycottAction { return $J.enumValueOf(Constants$BoycottAction, name); }
  static $clinit() {
    Constants$BoycottAction.BOYCOTT_PAY_ARREARS = new Constants$BoycottAction()._Constants$BoycottAction('BOYCOTT_PAY_ARREARS', 0);
    Constants$BoycottAction.BOYCOTT_DUMP_CARGO = new Constants$BoycottAction()._Constants$BoycottAction('BOYCOTT_DUMP_CARGO', 1);
    Constants$BoycottAction.$VALUES = [Constants$BoycottAction.BOYCOTT_PAY_ARREARS, Constants$BoycottAction.BOYCOTT_DUMP_CARGO];
  }
}

/**
 * Actions when claiming land.
 */
export class Constants$ClaimAction extends JEnum {
  static CLAIM_ACCEPT: Constants$ClaimAction = null;
  static CLAIM_STEAL: Constants$ClaimAction = null;
  static $VALUES: Constants$ClaimAction[] = null;
  _Constants$ClaimAction($name: string, $ordinal: number): this {
    this._JEnum($name, $ordinal);
    return this;
  }
  static values(): Constants$ClaimAction[] { return Constants$ClaimAction.$VALUES.slice(); }
  static valueOf(name: string): Constants$ClaimAction { return $J.enumValueOf(Constants$ClaimAction, name); }
  static $clinit() {
    Constants$ClaimAction.CLAIM_ACCEPT = new Constants$ClaimAction()._Constants$ClaimAction('CLAIM_ACCEPT', 0);
    Constants$ClaimAction.CLAIM_STEAL = new Constants$ClaimAction()._Constants$ClaimAction('CLAIM_STEAL', 1);
    Constants$ClaimAction.$VALUES = [Constants$ClaimAction.CLAIM_ACCEPT, Constants$ClaimAction.CLAIM_STEAL];
  }
}

/**
 * Actions surrounding native demands at colonies.
 */
export class Constants$IndianDemandAction extends JEnum {
  static INDIAN_DEMAND_ACCEPT: Constants$IndianDemandAction = null;
  static INDIAN_DEMAND_REJECT: Constants$IndianDemandAction = null;
  static INDIAN_DEMAND_DONE: Constants$IndianDemandAction = null;
  static $VALUES: Constants$IndianDemandAction[] = null;
  _Constants$IndianDemandAction($name: string, $ordinal: number): this {
    this._JEnum($name, $ordinal);
    return this;
  }
  static values(): Constants$IndianDemandAction[] { return Constants$IndianDemandAction.$VALUES.slice(); }
  static valueOf(name: string): Constants$IndianDemandAction { return $J.enumValueOf(Constants$IndianDemandAction, name); }
  static $clinit() {
    Constants$IndianDemandAction.INDIAN_DEMAND_ACCEPT = new Constants$IndianDemandAction()._Constants$IndianDemandAction('INDIAN_DEMAND_ACCEPT', 0);
    Constants$IndianDemandAction.INDIAN_DEMAND_REJECT = new Constants$IndianDemandAction()._Constants$IndianDemandAction('INDIAN_DEMAND_REJECT', 1);
    Constants$IndianDemandAction.INDIAN_DEMAND_DONE = new Constants$IndianDemandAction()._Constants$IndianDemandAction('INDIAN_DEMAND_DONE', 2);
    Constants$IndianDemandAction.$VALUES = [Constants$IndianDemandAction.INDIAN_DEMAND_ACCEPT, Constants$IndianDemandAction.INDIAN_DEMAND_REJECT, Constants$IndianDemandAction.INDIAN_DEMAND_DONE];
  }
}

/**
 * Actions with a missionary at a native settlement.
 */
export class Constants$MissionaryAction extends JEnum {
  static MISSIONARY_ESTABLISH_MISSION: Constants$MissionaryAction = null;
  static MISSIONARY_DENOUNCE_HERESY: Constants$MissionaryAction = null;
  static MISSIONARY_INCITE_INDIANS: Constants$MissionaryAction = null;
  static $VALUES: Constants$MissionaryAction[] = null;
  _Constants$MissionaryAction($name: string, $ordinal: number): this {
    this._JEnum($name, $ordinal);
    return this;
  }
  static values(): Constants$MissionaryAction[] { return Constants$MissionaryAction.$VALUES.slice(); }
  static valueOf(name: string): Constants$MissionaryAction { return $J.enumValueOf(Constants$MissionaryAction, name); }
  static $clinit() {
    Constants$MissionaryAction.MISSIONARY_ESTABLISH_MISSION = new Constants$MissionaryAction()._Constants$MissionaryAction('MISSIONARY_ESTABLISH_MISSION', 0);
    Constants$MissionaryAction.MISSIONARY_DENOUNCE_HERESY = new Constants$MissionaryAction()._Constants$MissionaryAction('MISSIONARY_DENOUNCE_HERESY', 1);
    Constants$MissionaryAction.MISSIONARY_INCITE_INDIANS = new Constants$MissionaryAction()._Constants$MissionaryAction('MISSIONARY_INCITE_INDIANS', 2);
    Constants$MissionaryAction.$VALUES = [Constants$MissionaryAction.MISSIONARY_ESTABLISH_MISSION, Constants$MissionaryAction.MISSIONARY_DENOUNCE_HERESY, Constants$MissionaryAction.MISSIONARY_INCITE_INDIANS];
  }
}

/**
 * Actions in scouting a colony.
 */
export class Constants$ScoutColonyAction extends JEnum {
  static SCOUT_COLONY_NEGOTIATE: Constants$ScoutColonyAction = null;
  static SCOUT_COLONY_SPY: Constants$ScoutColonyAction = null;
  static SCOUT_COLONY_ATTACK: Constants$ScoutColonyAction = null;
  static $VALUES: Constants$ScoutColonyAction[] = null;
  _Constants$ScoutColonyAction($name: string, $ordinal: number): this {
    this._JEnum($name, $ordinal);
    return this;
  }
  static values(): Constants$ScoutColonyAction[] { return Constants$ScoutColonyAction.$VALUES.slice(); }
  static valueOf(name: string): Constants$ScoutColonyAction { return $J.enumValueOf(Constants$ScoutColonyAction, name); }
  static $clinit() {
    Constants$ScoutColonyAction.SCOUT_COLONY_NEGOTIATE = new Constants$ScoutColonyAction()._Constants$ScoutColonyAction('SCOUT_COLONY_NEGOTIATE', 0);
    Constants$ScoutColonyAction.SCOUT_COLONY_SPY = new Constants$ScoutColonyAction()._Constants$ScoutColonyAction('SCOUT_COLONY_SPY', 1);
    Constants$ScoutColonyAction.SCOUT_COLONY_ATTACK = new Constants$ScoutColonyAction()._Constants$ScoutColonyAction('SCOUT_COLONY_ATTACK', 2);
    Constants$ScoutColonyAction.$VALUES = [Constants$ScoutColonyAction.SCOUT_COLONY_NEGOTIATE, Constants$ScoutColonyAction.SCOUT_COLONY_SPY, Constants$ScoutColonyAction.SCOUT_COLONY_ATTACK];
  }
}

/**
 * Actions in scouting a native settlement.
 */
export class Constants$ScoutIndianSettlementAction extends JEnum {
  static SCOUT_SETTLEMENT_SPEAK: Constants$ScoutIndianSettlementAction = null;
  static SCOUT_SETTLEMENT_TRIBUTE: Constants$ScoutIndianSettlementAction = null;
  static SCOUT_SETTLEMENT_ATTACK: Constants$ScoutIndianSettlementAction = null;
  static $VALUES: Constants$ScoutIndianSettlementAction[] = null;
  _Constants$ScoutIndianSettlementAction($name: string, $ordinal: number): this {
    this._JEnum($name, $ordinal);
    return this;
  }
  static values(): Constants$ScoutIndianSettlementAction[] { return Constants$ScoutIndianSettlementAction.$VALUES.slice(); }
  static valueOf(name: string): Constants$ScoutIndianSettlementAction { return $J.enumValueOf(Constants$ScoutIndianSettlementAction, name); }
  static $clinit() {
    Constants$ScoutIndianSettlementAction.SCOUT_SETTLEMENT_SPEAK = new Constants$ScoutIndianSettlementAction()._Constants$ScoutIndianSettlementAction('SCOUT_SETTLEMENT_SPEAK', 0);
    Constants$ScoutIndianSettlementAction.SCOUT_SETTLEMENT_TRIBUTE = new Constants$ScoutIndianSettlementAction()._Constants$ScoutIndianSettlementAction('SCOUT_SETTLEMENT_TRIBUTE', 1);
    Constants$ScoutIndianSettlementAction.SCOUT_SETTLEMENT_ATTACK = new Constants$ScoutIndianSettlementAction()._Constants$ScoutIndianSettlementAction('SCOUT_SETTLEMENT_ATTACK', 2);
    Constants$ScoutIndianSettlementAction.$VALUES = [Constants$ScoutIndianSettlementAction.SCOUT_SETTLEMENT_SPEAK, Constants$ScoutIndianSettlementAction.SCOUT_SETTLEMENT_TRIBUTE, Constants$ScoutIndianSettlementAction.SCOUT_SETTLEMENT_ATTACK];
  }
}

/**
 * Choice of sales action at a native settlement.
 */
export class Constants$TradeAction extends JEnum {
  static BUY: Constants$TradeAction = null;
  static SELL: Constants$TradeAction = null;
  static GIFT: Constants$TradeAction = null;
  static $VALUES: Constants$TradeAction[] = null;
  _Constants$TradeAction($name: string, $ordinal: number): this {
    this._JEnum($name, $ordinal);
    return this;
  }
  static values(): Constants$TradeAction[] { return Constants$TradeAction.$VALUES.slice(); }
  static valueOf(name: string): Constants$TradeAction { return $J.enumValueOf(Constants$TradeAction, name); }
  static $clinit() {
    Constants$TradeAction.BUY = new Constants$TradeAction()._Constants$TradeAction('BUY', 0);
    Constants$TradeAction.SELL = new Constants$TradeAction()._Constants$TradeAction('SELL', 1);
    Constants$TradeAction.GIFT = new Constants$TradeAction()._Constants$TradeAction('GIFT', 2);
    Constants$TradeAction.$VALUES = [Constants$TradeAction.BUY, Constants$TradeAction.SELL, Constants$TradeAction.GIFT];
  }
}

/**
 * Actions when buying from the natives.
 */
export class Constants$TradeBuyAction extends JEnum {
  static BUY: Constants$TradeBuyAction = null;
  static HAGGLE: Constants$TradeBuyAction = null;
  static $VALUES: Constants$TradeBuyAction[] = null;
  _Constants$TradeBuyAction($name: string, $ordinal: number): this {
    this._JEnum($name, $ordinal);
    return this;
  }
  static values(): Constants$TradeBuyAction[] { return Constants$TradeBuyAction.$VALUES.slice(); }
  static valueOf(name: string): Constants$TradeBuyAction { return $J.enumValueOf(Constants$TradeBuyAction, name); }
  static $clinit() {
    Constants$TradeBuyAction.BUY = new Constants$TradeBuyAction()._Constants$TradeBuyAction('BUY', 0);
    Constants$TradeBuyAction.HAGGLE = new Constants$TradeBuyAction()._Constants$TradeBuyAction('HAGGLE', 1);
    Constants$TradeBuyAction.$VALUES = [Constants$TradeBuyAction.BUY, Constants$TradeBuyAction.HAGGLE];
  }
}

/**
 * Actions when selling to the natives.
 */
export class Constants$TradeSellAction extends JEnum {
  static SELL: Constants$TradeSellAction = null;
  static HAGGLE: Constants$TradeSellAction = null;
  static GIFT: Constants$TradeSellAction = null;
  static $VALUES: Constants$TradeSellAction[] = null;
  _Constants$TradeSellAction($name: string, $ordinal: number): this {
    this._JEnum($name, $ordinal);
    return this;
  }
  static values(): Constants$TradeSellAction[] { return Constants$TradeSellAction.$VALUES.slice(); }
  static valueOf(name: string): Constants$TradeSellAction { return $J.enumValueOf(Constants$TradeSellAction, name); }
  static $clinit() {
    Constants$TradeSellAction.SELL = new Constants$TradeSellAction()._Constants$TradeSellAction('SELL', 0);
    Constants$TradeSellAction.HAGGLE = new Constants$TradeSellAction()._Constants$TradeSellAction('HAGGLE', 1);
    Constants$TradeSellAction.GIFT = new Constants$TradeSellAction()._Constants$TradeSellAction('GIFT', 2);
    Constants$TradeSellAction.$VALUES = [Constants$TradeSellAction.SELL, Constants$TradeSellAction.HAGGLE, Constants$TradeSellAction.GIFT];
  }
}

$J.define(Constants, 'net.sf.freecol.common.model.Constants', { kind: 'interface' });
$J.define(Constants$IntegrityType, 'net.sf.freecol.common.model.Constants$IntegrityType', { kind: 'enum', sup: 'java.lang.Enum', ctors: { 'int': '_Constants$IntegrityType' }, clinit: true, lazy: ['$VALUES', 'INTEGRITY_FAIL', 'INTEGRITY_FIXED', 'INTEGRITY_GOOD'] });
$J.define(Constants$ArmedUnitSettlementAction, 'net.sf.freecol.common.model.Constants$ArmedUnitSettlementAction', { kind: 'enum', sup: 'java.lang.Enum', ctors: { '': '_Constants$ArmedUnitSettlementAction' }, clinit: true, lazy: ['$VALUES', 'SETTLEMENT_ATTACK', 'SETTLEMENT_TRIBUTE'] });
$J.define(Constants$BoycottAction, 'net.sf.freecol.common.model.Constants$BoycottAction', { kind: 'enum', sup: 'java.lang.Enum', ctors: { '': '_Constants$BoycottAction' }, clinit: true, lazy: ['$VALUES', 'BOYCOTT_PAY_ARREARS', 'BOYCOTT_DUMP_CARGO'] });
$J.define(Constants$ClaimAction, 'net.sf.freecol.common.model.Constants$ClaimAction', { kind: 'enum', sup: 'java.lang.Enum', ctors: { '': '_Constants$ClaimAction' }, clinit: true, lazy: ['$VALUES', 'CLAIM_ACCEPT', 'CLAIM_STEAL'] });
$J.define(Constants$IndianDemandAction, 'net.sf.freecol.common.model.Constants$IndianDemandAction', { kind: 'enum', sup: 'java.lang.Enum', ctors: { '': '_Constants$IndianDemandAction' }, clinit: true, lazy: ['$VALUES', 'INDIAN_DEMAND_ACCEPT', 'INDIAN_DEMAND_REJECT', 'INDIAN_DEMAND_DONE'] });
$J.define(Constants$MissionaryAction, 'net.sf.freecol.common.model.Constants$MissionaryAction', { kind: 'enum', sup: 'java.lang.Enum', ctors: { '': '_Constants$MissionaryAction' }, clinit: true, lazy: ['$VALUES', 'MISSIONARY_ESTABLISH_MISSION', 'MISSIONARY_DENOUNCE_HERESY', 'MISSIONARY_INCITE_INDIANS'] });
$J.define(Constants$ScoutColonyAction, 'net.sf.freecol.common.model.Constants$ScoutColonyAction', { kind: 'enum', sup: 'java.lang.Enum', ctors: { '': '_Constants$ScoutColonyAction' }, clinit: true, lazy: ['$VALUES', 'SCOUT_COLONY_NEGOTIATE', 'SCOUT_COLONY_SPY', 'SCOUT_COLONY_ATTACK'] });
$J.define(Constants$ScoutIndianSettlementAction, 'net.sf.freecol.common.model.Constants$ScoutIndianSettlementAction', { kind: 'enum', sup: 'java.lang.Enum', ctors: { '': '_Constants$ScoutIndianSettlementAction' }, clinit: true, lazy: ['$VALUES', 'SCOUT_SETTLEMENT_SPEAK', 'SCOUT_SETTLEMENT_TRIBUTE', 'SCOUT_SETTLEMENT_ATTACK'] });
$J.define(Constants$TradeAction, 'net.sf.freecol.common.model.Constants$TradeAction', { kind: 'enum', sup: 'java.lang.Enum', ctors: { '': '_Constants$TradeAction' }, clinit: true, lazy: ['$VALUES', 'BUY', 'SELL', 'GIFT'] });
$J.define(Constants$TradeBuyAction, 'net.sf.freecol.common.model.Constants$TradeBuyAction', { kind: 'enum', sup: 'java.lang.Enum', ctors: { '': '_Constants$TradeBuyAction' }, clinit: true, lazy: ['$VALUES', 'BUY', 'HAGGLE'] });
$J.define(Constants$TradeSellAction, 'net.sf.freecol.common.model.Constants$TradeSellAction', { kind: 'enum', sup: 'java.lang.Enum', ctors: { '': '_Constants$TradeSellAction' }, clinit: true, lazy: ['$VALUES', 'SELL', 'HAGGLE', 'GIFT'] });
