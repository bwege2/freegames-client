// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/common/model/CombatModel.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J, JEnum, JObject, Objects } from '../../../../../../jre/index.ts';

let Location, Ownable, Settlement, Unit;

/**
 * A abstract requirements for a FreeCol combat model.
 */
export class CombatModel extends JObject {
  /**
   * Empty constructor is sufficient.
   */
  _CombatModel(): this {
    return this;
  }
  /**
   * Is this just a measurement of offence power?
   *
   * @param attacker The attacker.
   * @param defender The defender.
   * @return True if no defender is provided.
   */
  combatIsAttackMeasurement(attacker: FreeColGameObject, defender: FreeColGameObject): boolean {
    return attacker instanceof Unit && defender == null;
  }
  /**
   * Is this just a measurement of defence power?
   *
   * @param attacker The attacker.
   * @param defender The defender.
   * @return True if no attacker is provided.
   */
  combatIsDefenceMeasurement(attacker: FreeColGameObject, defender: FreeColGameObject): boolean {
    return attacker == null && defender instanceof Unit;
  }
  /**
   * Is this combat a normal attack?
   *
   * @param attacker The attacker.
   * @param defender The defender.
   * @return True if the combat is a normal attack.
   */
  combatIsAttack(attacker: FreeColGameObject, defender: FreeColGameObject): boolean {
    return attacker instanceof Unit && defender instanceof Unit;
  }
  /**
   * Is this combat a attack on a settlement?  These happen on the client
   * side only, for the purposes of the pre-combat display.  In these cases
   * the actual defender unit is hidden from the attacker player, so
   * the defender is shown as the settlement itself.
   *
   * @param attacker The attacker.
   * @param defender The defender.
   * @return True if the combat is a client-side attack on a settlement.
   */
  combatIsSettlementAttack(attacker: FreeColGameObject, defender: FreeColGameObject): boolean {
    return attacker instanceof Unit && defender instanceof Settlement;
  }
  /**
   * Is this combat a bombardment?
   *
   * @param attacker The attacker.
   * @param defender The defender.
   * @return True if the combat is a bombardment.
   */
  combatIsBombard(attacker: FreeColGameObject, defender: FreeColGameObject): boolean {
    return attacker instanceof Settlement && defender instanceof Unit && (defender).isNaval();
  }
  /**
   * Could this attack be an amphibious operation?
   *
   * @param attacker The attacker.
   * @param defender The defender.
   * @return True if the attack is amphibious.
   */
  combatIsAmphibious(attacker: FreeColGameObject, defender: FreeColGameObject): boolean {
    return attacker instanceof Unit && (attacker).hasTile() && !(attacker).getTile$().isLand() && $J.isa(defender, Location) && (defender).getTile$() != null && (defender).getTile$().isLand();
  }
  /**
   * Is this a combat between a rebel player and the REF at a colony?
   *
   * @param attacker The attacker object.
   * @param defender The defender object.
   * @return True if the attack is a war of independence battle for a colony.
   */
  combatIsWarOfIndependence(attacker: FreeColGameObject, defender: FreeColGameObject): boolean {
    if (attacker instanceof Unit && $J.isa(defender, Ownable)) {
      let aPlayer = (attacker).getOwner();
      let dPlayer = (defender).getOwner();
      return (aPlayer.isRebel() && aPlayer.getREFPlayer() === dPlayer) || (dPlayer.isRebel() && dPlayer.getREFPlayer() === aPlayer);
    }
    return false;
  }
  /**
   * Get a comparator to order units by relative military strength
   * with respect to this combat model.
   *
   * @return A suitable unit {@code Comparator}.
   */
  getMilitaryStrengthComparator(): Comparator<Unit> {
    return (u1, u2) => $J.dcmp(this.calculateCombatOdds$FreeColGameObject$FreeColGameObject(u1, u2).win, this.calculateCombatOdds$FreeColGameObject$FreeColGameObject(u2, u1).win);
  }
}

export class CombatModel$CombatEffectType extends JEnum {
  static NO_RESULT: CombatModel$CombatEffectType = null;
  static LOSE: CombatModel$CombatEffectType = null;
  static WIN: CombatModel$CombatEffectType = null;
  static AUTOEQUIP_UNIT: CombatModel$CombatEffectType = null;
  static BURN_MISSIONS: CombatModel$CombatEffectType = null;
  static CAPTURE_AUTOEQUIP: CombatModel$CombatEffectType = null;
  static CAPTURE_COLONY: CombatModel$CombatEffectType = null;
  static CAPTURE_CONVERT: CombatModel$CombatEffectType = null;
  static CAPTURE_EQUIP: CombatModel$CombatEffectType = null;
  static CAPTURE_UNIT: CombatModel$CombatEffectType = null;
  static DAMAGE_COLONY_SHIPS: CombatModel$CombatEffectType = null;
  static DAMAGE_SHIP_ATTACK: CombatModel$CombatEffectType = null;
  static DAMAGE_SHIP_BOMBARD: CombatModel$CombatEffectType = null;
  static DEMOTE_UNIT: CombatModel$CombatEffectType = null;
  static DESTROY_COLONY: CombatModel$CombatEffectType = null;
  static DESTROY_SETTLEMENT: CombatModel$CombatEffectType = null;
  static EVADE_ATTACK: CombatModel$CombatEffectType = null;
  static EVADE_BOMBARD: CombatModel$CombatEffectType = null;
  static LOOT_SHIP: CombatModel$CombatEffectType = null;
  static LOSE_AUTOEQUIP: CombatModel$CombatEffectType = null;
  static LOSE_EQUIP: CombatModel$CombatEffectType = null;
  static PILLAGE_COLONY: CombatModel$CombatEffectType = null;
  static PROMOTE_UNIT: CombatModel$CombatEffectType = null;
  static SINK_COLONY_SHIPS: CombatModel$CombatEffectType = null;
  static SINK_SHIP_ATTACK: CombatModel$CombatEffectType = null;
  static SINK_SHIP_BOMBARD: CombatModel$CombatEffectType = null;
  static SLAUGHTER_UNIT: CombatModel$CombatEffectType = null;
  static $VALUES: CombatModel$CombatEffectType[] = null;
  _CombatModel$CombatEffectType($name: string, $ordinal: number): this {
    this._JEnum($name, $ordinal);
    return this;
  }
  static values(): CombatModel$CombatEffectType[] { return CombatModel$CombatEffectType.$VALUES.slice(); }
  static valueOf(name: string): CombatModel$CombatEffectType { return $J.enumValueOf(CombatModel$CombatEffectType, name); }
  static $clinit() {
    CombatModel$CombatEffectType.NO_RESULT = new CombatModel$CombatEffectType()._CombatModel$CombatEffectType('NO_RESULT', 0);
    CombatModel$CombatEffectType.LOSE = new CombatModel$CombatEffectType()._CombatModel$CombatEffectType('LOSE', 1);
    CombatModel$CombatEffectType.WIN = new CombatModel$CombatEffectType()._CombatModel$CombatEffectType('WIN', 2);
    CombatModel$CombatEffectType.AUTOEQUIP_UNIT = new CombatModel$CombatEffectType()._CombatModel$CombatEffectType('AUTOEQUIP_UNIT', 3);
    CombatModel$CombatEffectType.BURN_MISSIONS = new CombatModel$CombatEffectType()._CombatModel$CombatEffectType('BURN_MISSIONS', 4);
    CombatModel$CombatEffectType.CAPTURE_AUTOEQUIP = new CombatModel$CombatEffectType()._CombatModel$CombatEffectType('CAPTURE_AUTOEQUIP', 5);
    CombatModel$CombatEffectType.CAPTURE_COLONY = new CombatModel$CombatEffectType()._CombatModel$CombatEffectType('CAPTURE_COLONY', 6);
    CombatModel$CombatEffectType.CAPTURE_CONVERT = new CombatModel$CombatEffectType()._CombatModel$CombatEffectType('CAPTURE_CONVERT', 7);
    CombatModel$CombatEffectType.CAPTURE_EQUIP = new CombatModel$CombatEffectType()._CombatModel$CombatEffectType('CAPTURE_EQUIP', 8);
    CombatModel$CombatEffectType.CAPTURE_UNIT = new CombatModel$CombatEffectType()._CombatModel$CombatEffectType('CAPTURE_UNIT', 9);
    CombatModel$CombatEffectType.DAMAGE_COLONY_SHIPS = new CombatModel$CombatEffectType()._CombatModel$CombatEffectType('DAMAGE_COLONY_SHIPS', 10);
    CombatModel$CombatEffectType.DAMAGE_SHIP_ATTACK = new CombatModel$CombatEffectType()._CombatModel$CombatEffectType('DAMAGE_SHIP_ATTACK', 11);
    CombatModel$CombatEffectType.DAMAGE_SHIP_BOMBARD = new CombatModel$CombatEffectType()._CombatModel$CombatEffectType('DAMAGE_SHIP_BOMBARD', 12);
    CombatModel$CombatEffectType.DEMOTE_UNIT = new CombatModel$CombatEffectType()._CombatModel$CombatEffectType('DEMOTE_UNIT', 13);
    CombatModel$CombatEffectType.DESTROY_COLONY = new CombatModel$CombatEffectType()._CombatModel$CombatEffectType('DESTROY_COLONY', 14);
    CombatModel$CombatEffectType.DESTROY_SETTLEMENT = new CombatModel$CombatEffectType()._CombatModel$CombatEffectType('DESTROY_SETTLEMENT', 15);
    CombatModel$CombatEffectType.EVADE_ATTACK = new CombatModel$CombatEffectType()._CombatModel$CombatEffectType('EVADE_ATTACK', 16);
    CombatModel$CombatEffectType.EVADE_BOMBARD = new CombatModel$CombatEffectType()._CombatModel$CombatEffectType('EVADE_BOMBARD', 17);
    CombatModel$CombatEffectType.LOOT_SHIP = new CombatModel$CombatEffectType()._CombatModel$CombatEffectType('LOOT_SHIP', 18);
    CombatModel$CombatEffectType.LOSE_AUTOEQUIP = new CombatModel$CombatEffectType()._CombatModel$CombatEffectType('LOSE_AUTOEQUIP', 19);
    CombatModel$CombatEffectType.LOSE_EQUIP = new CombatModel$CombatEffectType()._CombatModel$CombatEffectType('LOSE_EQUIP', 20);
    CombatModel$CombatEffectType.PILLAGE_COLONY = new CombatModel$CombatEffectType()._CombatModel$CombatEffectType('PILLAGE_COLONY', 21);
    CombatModel$CombatEffectType.PROMOTE_UNIT = new CombatModel$CombatEffectType()._CombatModel$CombatEffectType('PROMOTE_UNIT', 22);
    CombatModel$CombatEffectType.SINK_COLONY_SHIPS = new CombatModel$CombatEffectType()._CombatModel$CombatEffectType('SINK_COLONY_SHIPS', 23);
    CombatModel$CombatEffectType.SINK_SHIP_ATTACK = new CombatModel$CombatEffectType()._CombatModel$CombatEffectType('SINK_SHIP_ATTACK', 24);
    CombatModel$CombatEffectType.SINK_SHIP_BOMBARD = new CombatModel$CombatEffectType()._CombatModel$CombatEffectType('SINK_SHIP_BOMBARD', 25);
    CombatModel$CombatEffectType.SLAUGHTER_UNIT = new CombatModel$CombatEffectType()._CombatModel$CombatEffectType('SLAUGHTER_UNIT', 26);
    CombatModel$CombatEffectType.$VALUES = [CombatModel$CombatEffectType.NO_RESULT, CombatModel$CombatEffectType.LOSE, CombatModel$CombatEffectType.WIN, CombatModel$CombatEffectType.AUTOEQUIP_UNIT, CombatModel$CombatEffectType.BURN_MISSIONS, CombatModel$CombatEffectType.CAPTURE_AUTOEQUIP, CombatModel$CombatEffectType.CAPTURE_COLONY, CombatModel$CombatEffectType.CAPTURE_CONVERT, CombatModel$CombatEffectType.CAPTURE_EQUIP, CombatModel$CombatEffectType.CAPTURE_UNIT, CombatModel$CombatEffectType.DAMAGE_COLONY_SHIPS, CombatModel$CombatEffectType.DAMAGE_SHIP_ATTACK, CombatModel$CombatEffectType.DAMAGE_SHIP_BOMBARD, CombatModel$CombatEffectType.DEMOTE_UNIT, CombatModel$CombatEffectType.DESTROY_COLONY, CombatModel$CombatEffectType.DESTROY_SETTLEMENT, CombatModel$CombatEffectType.EVADE_ATTACK, CombatModel$CombatEffectType.EVADE_BOMBARD, CombatModel$CombatEffectType.LOOT_SHIP, CombatModel$CombatEffectType.LOSE_AUTOEQUIP, CombatModel$CombatEffectType.LOSE_EQUIP, CombatModel$CombatEffectType.PILLAGE_COLONY, CombatModel$CombatEffectType.PROMOTE_UNIT, CombatModel$CombatEffectType.SINK_COLONY_SHIPS, CombatModel$CombatEffectType.SINK_SHIP_ATTACK, CombatModel$CombatEffectType.SINK_SHIP_BOMBARD, CombatModel$CombatEffectType.SLAUGHTER_UNIT];
  }
}

export class CombatModel$CombatResult extends JObject {
  effects: List<CombatModel$CombatEffectType> = null;
  attackerHitpointsAfter: number = 0;
  defenderHitpointsAfter: number = 0;
  _CombatModel$CombatResult$List(effects: List<CombatModel$CombatEffectType>): this {
    this.effects = Objects.requireNonNull(effects);
    this.attackerHitpointsAfter = -1;
    this.defenderHitpointsAfter = -1;
    return this;
  }
  _CombatModel$CombatResult$List$int$int(effects: List<CombatModel$CombatEffectType>, attackerHitpointsAfter: number, defenderHitpointsAfter: number): this {
    this.effects = Objects.requireNonNull(effects);
    this.attackerHitpointsAfter = attackerHitpointsAfter;
    this.defenderHitpointsAfter = defenderHitpointsAfter;
    return this;
  }
  getEffects(): List<CombatModel$CombatEffectType> {
    return this.effects;
  }
  isAttackerHitpointsAffected(): boolean {
    return this.attackerHitpointsAfter >= 0;
  }
  isDefenderHitpointsAffected(): boolean {
    return this.defenderHitpointsAfter >= 0;
  }
  getAttackerHitpointsAfter(): number {
    return this.attackerHitpointsAfter;
  }
  getDefenderHitpointsAfter(): number {
    return this.defenderHitpointsAfter;
  }
}

/**
 * Odds a particular outcome will occur in combat.
 */
export class CombatModel$CombatOdds extends JObject {
  static readonly UNKNOWN_ODDS: number = -1;
  win: number = 0;
  _CombatModel$CombatOdds(win: number): this {
    this.win = win;
    return this;
  }
}

$J.define(CombatModel, 'net.sf.freecol.common.model.CombatModel', { kind: 'class', sup: 'java.lang.Object', ctors: { '': '_CombatModel' }, returns: { 'getMilitaryStrengthComparator': 'java.util.Comparator' }, meths: { 'getDefencePower(net.sf.freecol.common.model.FreeColGameObject,net.sf.freecol.common.model.FreeColGameObject)': 'getDefencePower$FreeColGameObject$FreeColGameObject', 'getOffencePower(net.sf.freecol.common.model.FreeColGameObject,net.sf.freecol.common.model.FreeColGameObject)': 'getOffencePower$FreeColGameObject$FreeColGameObject', 'calculateCombatOdds(net.sf.freecol.common.model.FreeColGameObject,net.sf.freecol.common.model.FreeColGameObject)': 'calculateCombatOdds$FreeColGameObject$FreeColGameObject' } });
$J.define(CombatModel$CombatEffectType, 'net.sf.freecol.common.model.CombatModel$CombatEffectType', { kind: 'enum', sup: 'java.lang.Enum', ctors: { '': '_CombatModel$CombatEffectType' }, clinit: true, lazy: ['$VALUES', 'NO_RESULT', 'LOSE', 'WIN', 'AUTOEQUIP_UNIT', 'BURN_MISSIONS', 'CAPTURE_AUTOEQUIP', 'CAPTURE_COLONY', 'CAPTURE_CONVERT', 'CAPTURE_EQUIP', 'CAPTURE_UNIT', 'DAMAGE_COLONY_SHIPS', 'DAMAGE_SHIP_ATTACK', 'DAMAGE_SHIP_BOMBARD', 'DEMOTE_UNIT', 'DESTROY_COLONY', 'DESTROY_SETTLEMENT', 'EVADE_ATTACK', 'EVADE_BOMBARD', 'LOOT_SHIP', 'LOSE_AUTOEQUIP', 'LOSE_EQUIP', 'PILLAGE_COLONY', 'PROMOTE_UNIT', 'SINK_COLONY_SHIPS', 'SINK_SHIP_ATTACK', 'SINK_SHIP_BOMBARD', 'SLAUGHTER_UNIT'] });
$J.define(CombatModel$CombatResult, 'net.sf.freecol.common.model.CombatModel$CombatResult', { kind: 'class', sup: 'java.lang.Object', ctors: { 'java.util.List,int,int': '_CombatModel$CombatResult$List$int$int', 'java.util.List': '_CombatModel$CombatResult$List' }, returns: { 'getDefenderHitpointsAfter': 'int', 'getAttackerHitpointsAfter': 'int', 'isDefenderHitpointsAffected': 'boolean', 'isAttackerHitpointsAffected': 'boolean', 'getEffects': 'java.util.List' } });
$J.define(CombatModel$CombatOdds, 'net.sf.freecol.common.model.CombatModel$CombatOdds', { kind: 'class', sup: 'java.lang.Object', ctors: { 'double': '_CombatModel$CombatOdds' } });
$J.module(() => {
  Location = $J.load('net.sf.freecol.common.model.Location');
  Ownable = $J.load('net.sf.freecol.common.model.Ownable');
  Settlement = $J.load('net.sf.freecol.common.model.Settlement');
  Unit = $J.load('net.sf.freecol.common.model.Unit');
});
