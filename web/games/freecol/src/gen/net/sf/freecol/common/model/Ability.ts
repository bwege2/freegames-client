// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/common/model/Ability.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { Feature } from './Feature.ts';

let FreeColObject;

/**
 * The {@code Ability} class encapsulates a bonus or penalty
 * that can be applied to any action within the game, most obviously
 * combat.
 */
export class Ability extends Feature {
  static readonly TAG: string = 'ability';
  static readonly HITPOINTS_COMBAT_MODEL: string = 'model.ability.hitpointsCombatModel';
  /**
   * The ability to add the current tax as a bonus to the production
   * of bells.  Provided by the {@link FoundingFather} Thomas Paine.
   */
  static readonly ADD_TAX_TO_BELLS: string = 'model.ability.addTaxToBells';
  /**
   * The ability to always receive a peace offer (Franklin).
   */
  static readonly ALWAYS_OFFERED_PEACE: string = 'model.ability.alwaysOfferedPeace';
  /**
   * The ability to ambush other units.
   */
  static readonly AMBUSH_BONUS: string = 'model.ability.ambushBonus';
  /**
   * The susceptibility to ambush from other units.
   */
  static readonly AMBUSH_PENALTY: string = 'model.ability.ambushPenalty';
  /**
   * Terrain in which an ambush may occur.
   */
  static readonly AMBUSH_TERRAIN: string = 'model.ability.ambushTerrain';
  /**
   * Equipment type ability denoting the holder is armed.
   */
  static readonly ARMED: string = 'model.ability.armed';
  /**
   * The ability of a colony to automatocally arm defenders (Revere).
   */
  static readonly AUTOMATIC_EQUIPMENT: string = 'model.ability.automaticEquipment';
  /**
   * The ability to automatically promote combat winners (Washington).
   */
  static readonly AUTOMATIC_PROMOTION: string = 'model.ability.automaticPromotion';
  /**
   * The ability of certain buildings (e.g. the stables) to produce
   * goods even if no units are present.
   */
  static readonly AUTO_PRODUCTION: string = 'model.ability.autoProduction';
  /**
   * The ability of certain buildings (e.g. the stables) to avoid
   * producing more goods than the colony can store, which would
   * normally go to waste.
   */
  static readonly AVOID_EXCESS_PRODUCTION: string = 'model.ability.avoidExcessProduction';
  /**
   * The ability for better foreign affairs reporting (deWitt).
   */
  static readonly BETTER_FOREIGN_AFFAIRS_REPORT: string = 'model.ability.betterForeignAffairsReport';
  /**
   * The ability of a unit to bombard other units.
   */
  static readonly BOMBARD: string = 'model.ability.bombard';
  /**
   * The ability of a colony to bombard ships.
   */
  static readonly BOMBARD_SHIPS: string = 'model.ability.bombardShips';
  /**
   * The ability to be born in a Colony.  Only Units with this
   * ability can be produced by a Colony.
   */
  static readonly BORN_IN_COLONY: string = 'model.ability.bornInColony';
  /**
   * The ability to be born in an IndianSettlement.  Only Units with
   * this ability can be produced by an IndianSettlement.
   */
  static readonly BORN_IN_INDIAN_SETTLEMENT: string = 'model.ability.bornInIndianSettlement';
  /**
   * The ability to build {@link BuildableType}s, such as units.  The
   * shipyard provides the ability to build ships, for example.
   */
  static readonly BUILD: string = 'model.ability.build';
  /**
   * The ability to build a customs house.  Yes this is misspelled.
   */
  static readonly BUILD_CUSTOM_HOUSE: string = 'model.ability.buildCustomHouse';
  /**
   * The ability to build a factories.
   */
  static readonly BUILD_FACTORY: string = 'model.ability.buildFactory';
  /**
   * The ability of certain unarmed units to be captured by another
   * player's units. Units lacking this ability (e.g. braves) will
   * be destroyed instead.
   */
  static readonly CAN_BE_CAPTURED: string = 'model.ability.canBeCaptured';
  /**
   * The ability of certain units to be equipped with tools, muskets, etc.
   */
  static readonly CAN_BE_EQUIPPED: string = 'model.ability.canBeEquipped';
  /**
   * The ability of certain REF units to surrender on defeat.
   */
  static readonly CAN_BE_SURRENDERED: string = 'model.ability.canBeSurrendered';
  /**
   * The ability of a player to recruit units.
   */
  static readonly CAN_RECRUIT_UNIT: string = 'model.ability.canRecruitUnit';
  /**
   * The ability of certain armed units to capture equipment.
   */
  static readonly CAPTURE_EQUIPMENT: string = 'model.ability.captureEquipment';
  /**
   * The ability of certain units (e.g. privateers) to capture goods
   * carried by another player's units.
   */
  static readonly CAPTURE_GOODS: string = 'model.ability.captureGoods';
  /**
   * The ability of certain armed units to capture another player's units.
   */
  static readonly CAPTURE_UNITS: string = 'model.ability.captureUnits';
  /**
   * The ability of certain units (e.g. wagon trains) to carry goods.
   */
  static readonly CARRY_GOODS: string = 'model.ability.carryGoods';
  /**
   * The ability of certain units (e.g. treasure trains) to carry
   * treasure.
   */
  static readonly CARRY_TREASURE: string = 'model.ability.carryTreasure';
  /**
   * The ability of certain units (e.g. ships) to carry other units.
   */
  static readonly CARRY_UNITS: string = 'model.ability.carryUnits';
  /**
   * Restrict some buildings to only be buildable on the coast.
   */
  static readonly COASTAL_ONLY: string = 'model.ability.coastalOnly';
  /**
   * The ability of customs houses to trade with other players.
   */
  static readonly CUSTOM_HOUSE_TRADES_WITH_FOREIGN_COUNTRIES: string = 'model.ability.customHouseTradesWithForeignCountries';
  /**
   * The ability to demand tribute even when unarmed.
   */
  static readonly DEMAND_TRIBUTE: string = 'model.ability.demandTribute';
  /**
   * Units with this ability are demoted on losing all equipment.
   */
  static readonly DEMOTE_ON_ALL_EQUIPMENT_LOST: string = 'model.ability.demoteOnAllEquipLost';
  /**
   * The ability to denounce heresy.
   */
  static readonly DENOUNCE_HERESY: string = 'model.ability.denounceHeresy';
  /**
   * Units with this ability die on losing all equipment.
   */
  static readonly DISPOSE_ON_ALL_EQUIPMENT_LOST: string = 'model.ability.disposeOnAllEquipLost';
  /**
   * Units with this ability die on losing a combat.
   */
  static readonly DISPOSE_ON_COMBAT_LOSS: string = 'model.ability.disposeOnCombatLoss';
  /**
   * The ability to bless a missionary.
   */
  static readonly DRESS_MISSIONARY: string = 'model.ability.dressMissionary';
  /**
   * The ability to elect founding fathers.
   */
  static readonly ELECT_FOUNDING_FATHER: string = 'model.ability.electFoundingFather';
  /**
   * The ability to establish a mission.
   */
  static readonly ESTABLISH_MISSION: string = 'model.ability.establishMission';
  /**
   * The ability to evade naval attack.
   */
  static readonly EVADE_ATTACK: string = 'model.ability.evadeAttack';
  /**
   * The ability of certain units to work as missionaries more
   * effectively.
   */
  static readonly EXPERT_MISSIONARY: string = 'model.ability.expertMissionary';
  /**
   * The ability of certain units to build TileImprovements faster.
   */
  static readonly EXPERT_PIONEER: string = 'model.ability.expertPioneer';
  /**
   * The ability of certain units to work as scouts more effectively.
   */
  static readonly EXPERT_SCOUT: string = 'model.ability.expertScout';
  /**
   * The ability of certain units to work as soldiers more effectively.
   */
  static readonly EXPERT_SOLDIER: string = 'model.ability.expertSoldier';
  /**
   * The somewhat controversial ability of expert units in factory
   * level buildings to produce a certain amount of goods even when
   * no raw materials are available.  Allegedly, this is a feature of
   * the original game.
   */
  static readonly EXPERTS_USE_CONNECTIONS: string = 'model.ability.expertsUseConnections';
  /**
   * The ability to export goods to Europe directly.
   */
  static readonly EXPORT: string = 'model.ability.export';
  /**
   * The ability of a unit to found a colony.
   */
  static readonly FOUND_COLONY: string = 'model.ability.foundColony';
  /**
   * The ability of a unit to be found in a lost city.
   */
  static readonly FOUND_IN_LOST_CITY: string = 'model.ability.foundInLostCity';
  /**
   * The ability of a player to found colonies.
   */
  static readonly FOUNDS_COLONIES: string = 'model.ability.foundsColonies';
  /**
   * The ability of a colony which is a port.
   */
  static readonly HAS_PORT: string = 'model.ability.hasPort';
  /**
   * The ability to ignore the monarchs wars.
   */
  static readonly IGNORE_EUROPEAN_WARS: string = 'model.ability.ignoreEuropeanWars';
  /**
   * The ability of a unit to make terrain improvements.
   */
  static readonly IMPROVE_TERRAIN: string = 'model.ability.improveTerrain';
  /**
   * The ability to incite the natives.
   */
  static readonly INCITE_NATIVES: string = 'model.ability.inciteNatives';
  /**
   * The ability denoting that a declaration of independence has
   * been made.
   */
  static readonly INDEPENDENCE_DECLARED: string = 'model.ability.independenceDeclared';
  /**
   * The ability denoting that this is an independent nation.
   * Note: this differs from INDEPENDENCE_DECLARED in that
   * the REF is also (representing) an independent nation.
   */
  static readonly INDEPENDENT_NATION: string = 'model.ability.independentNation';
  /**
   * Units with this ability can be chosen as mercenaries support units.
   */
  static readonly MERCENARY_UNIT: string = 'model.ability.mercenaryUnit';
  /**
   * Equipment type ability denoting the holder is mounted.
   */
  static readonly MOUNTED: string = 'model.ability.mounted';
  /**
   * The ability to move to Europe from a tile.
   */
  static readonly MOVE_TO_EUROPE: string = 'model.ability.moveToEurope';
  /**
   * The ability to attack multiple times.
   */
  static readonly MULTIPLE_ATTACKS: string = 'model.ability.multipleAttacks';
  /**
   * The ability of being a native unit.
   */
  static readonly NATIVE: string = 'model.ability.native';
  /**
   * The ability of ships to move across water tiles.
   */
  static readonly NAVAL_UNIT: string = 'model.ability.navalUnit';
  /**
   * The ability to engage in diplomatic negotiation.
   */
  static readonly NEGOTIATE: string = 'model.ability.negotiate';
  /**
   * Units with this property are persons, not a ship or wagon etc.
   */
  static readonly PERSON: string = 'model.ability.person';
  /**
   * The ability to pillage unprotected colonies.
   */
  static readonly PILLAGE_UNPROTECTED_COLONY: string = 'model.ability.pillageUnprotectedColony';
  /**
   * The ability of certain units (e.g. privateers) to attack and
   * plunder another player's units without causing war.
   */
  static readonly PIRACY: string = 'model.ability.piracy';
  /**
   * An ability that enhances the treasure plundered from native
   * settlements.
   */
  static readonly PLUNDER_NATIVES: string = 'model.ability.plunderNatives';
  /**
   * The ability to produce goods (e.g. fish) on water tiles.
   */
  static readonly PRODUCE_IN_WATER: string = 'model.ability.produceInWater';
  /**
   * Units with this ability can be added to the REF.
   */
  static readonly REF_UNIT: string = 'model.ability.refUnit';
  /**
   * The ability to repair certain units.
   */
  static readonly REPAIR_UNITS: string = 'model.ability.repairUnits';
  /**
   * A national ability required to generate a REF.
   */
  static readonly ROYAL_EXPEDITIONARY_FORCE: string = 'model.ability.royalExpeditionaryForce';
  /**
   * LCRs always yield positive results (deSoto).
   */
  static readonly RUMOURS_ALWAYS_POSITIVE: string = 'model.ability.rumoursAlwaysPositive';
  /**
   * The ability to see all colonies (Coronado).
   */
  static readonly SEE_ALL_COLONIES: string = 'model.ability.seeAllColonies';
  /**
   * The ability to select recruits (Brewster).
   */
  static readonly SELECT_RECRUIT: string = 'model.ability.selectRecruit';
  /**
   * The ability to speak to a native settlement chief.
   */
  static readonly SPEAK_WITH_CHIEF: string = 'model.ability.speakWithChief';
  /**
   * The ability to spy on a colony.
   */
  static readonly SPY_ON_COLONY: string = 'model.ability.spyOnColony';
  /**
   * Units with this ability can be chosen as support units from
   * the crown.
   */
  static readonly SUPPORT_UNIT: string = 'model.ability.supportUnit';
  /**
   * Buildings with this ability can be used to teach.
   */
  static readonly TEACH: string = 'model.ability.teach';
  /**
   * The ability to trade with foreign colonies (deWitt).
   */
  static readonly TRADE_WITH_FOREIGN_COLONIES: string = 'model.ability.tradeWithForeignColonies';
  /**
   * Undead units have this ability.
   */
  static readonly UNDEAD: string = 'model.ability.undead';
  /**
   * Upgrade converts to free colonist with Casas.
   */
  static readonly UPGRADE_CONVERT: string = 'model.ability.upgradeConvert';
  /**
   * The ability value.
   */
  value_: boolean = false;
  $init_Ability() {
    this.value_ = true;
  }
  /**
   * Deliberately trivial constructor.
   *
   * @param specification The {@code Specification} to use.
   */
  _Ability$Specification(specification: Specification): this {
    this._Feature(specification);
    this.$init_Ability();
    return this;
  }
  /**
   * Creates a new {@code Ability} instance.
   *
   * @param id The object identifier.
   * @param source The source {@code FreeColSpecObjectType}.
   * @param value The ability value.
   */
  _Ability$String$FreeColSpecObjectType$boolean(id: string, source: FreeColSpecObjectType, value: boolean): this {
    this._Ability$Specification((source == null) ? null : source.getSpecification());
    this.setId(id);
    this.setSource(source);
    this.value_ = value;
    return this;
  }
  /**
   * Creates a new {@code Ability} instance.
   *
   * @param id The object identifier.
   */
  _Ability$String(id: string): this {
    this._Ability$String$FreeColSpecObjectType$boolean(id, null, true);
    return this;
  }
  /**
   * Creates a new {@code Ability} instance.
   *
   * @param id The object identifier.
   * @param value The ability value.
   */
  _Ability$String$boolean(id: string, value: boolean): this {
    this._Ability$String$FreeColSpecObjectType$boolean(id, null, value);
    return this;
  }
  /**
   * Creates a new {@code Ability} instance.
   *
   * @param template An {@code Ability} to copy from.
   */
  _Ability$Ability(template: Ability): this {
    this._Ability$Specification(null);
    this.setId(template.getId());
    this.copyIn(template);
    return this;
  }
  /**
   * Creates a new {@code Ability} instance.
   *
   * @param xr The {@code FreeColXMLReader} to read from.
   * @param specification A {@code Specification} to refer to.
   * @exception XMLStreamException if an error occurs
   */
  _Ability$FreeColXMLReader$Specification(xr: FreeColXMLReader, specification: Specification): this {
    this._Ability$Specification(specification);
    this.readFromXML(xr);
    return this;
  }
  /**
   * Get the ability value.
   *
   * @return The ability value.
   */
  getValue(): boolean {
    return this.value_;
  }
  /**
   * Set the ability value.
   *
   * @param newValue The new ability value.
   */
  setValue(newValue: boolean): void {
    this.value_ = newValue;
  }
  /**
   * {@inheritDoc}
   */
  copyIn<T>(other: T): boolean {
    let o = this.copyInCast(other, $J.cls(Ability));
    if (o == null || !super.copyIn(o)) {
      return false;
    }
    this.value_ = o.getValue();
    return true;
  }
  /**
   * {@inheritDoc}
   */
  writeAttributes(xw: FreeColXMLWriter): void {
    super.writeAttributes(xw);
    xw.writeAttribute$String$boolean(FreeColObject.VALUE_TAG, this.value_);
  }
  /**
   * {@inheritDoc}
   */
  readAttributes(xr: FreeColXMLReader): void {
    super.readAttributes(xr);
    this.value_ = xr.getAttribute$String$boolean(FreeColObject.VALUE_TAG, true);
  }
  /**
   * {@inheritDoc}
   */
  getXMLTagName(): string {
    return Ability.TAG;
  }
  /**
   * {@inheritDoc}
   */
  equals(o: any): boolean {
    if (this === o) {
      return true;
    }
    if (o instanceof Ability) {
      let other = o;
      return this.value_ === other.value_ && super.equals(other);
    }
    return false;
  }
  /**
   * {@inheritDoc}
   */
  hashCode(): number {
    let hash = super.hashCode();
    hash = (hash + ((this.value_) ? 1 : 0)) | 0;
    return hash;
  }
  /**
   * {@inheritDoc}
   */
  toString(): string {
    let sb = new StringBuilder(32);
    sb.append('[ ').append(this.getId());
    if (this.getSource() != null) {
      sb.append(' (').append(this.getSource().getId()).append(String.fromCharCode(41 /* ')' */));
    }
    sb.append(' = ').append(String(this.value_)).append(' ]');
    return sb.toString();
  }
}

$J.define(Ability, 'net.sf.freecol.common.model.Ability', { kind: 'class', sup: 'net.sf.freecol.common.model.Feature', ctors: { 'net.sf.freecol.common.io.FreeColXMLReader,net.sf.freecol.common.model.Specification': '_Ability$FreeColXMLReader$Specification', 'net.sf.freecol.common.model.Ability': '_Ability$Ability', 'java.lang.String,boolean': '_Ability$String$boolean', 'java.lang.String': '_Ability$String', 'java.lang.String,net.sf.freecol.common.model.FreeColSpecObjectType,boolean': '_Ability$String$FreeColSpecObjectType$boolean', 'net.sf.freecol.common.model.Specification': '_Ability$Specification' }, returns: { 'hashCode': 'int', 'getXMLTagName': 'java.lang.String', 'getValue': 'boolean' } });
$J.module(() => {
  FreeColObject = $J.load('net.sf.freecol.common.model.FreeColObject');
});
