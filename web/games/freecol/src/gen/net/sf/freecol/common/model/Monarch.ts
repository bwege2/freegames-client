// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/common/model/Monarch.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J, ArrayList, Collections, IllegalArgumentException, JEnum, Logger, RuntimeException } from '../../../../../../jre/index.ts';
import { FreeColGameObject } from './FreeColGameObject.ts';

let Ability, AbstractUnit, Constants, Force, Player, Player$PlayerType, Specification, GameOptions, CollectionUtils, RandomChoice, RandomUtils, StringUtils;

/**
 * This class implements the player's monarch, whose functions prior
 * to the revolution include raising taxes, declaring war on other
 * European countries, and occasionally providing military support.
 */
export class Monarch extends FreeColGameObject {
  static logger: Logger = null;
  static readonly TAG: string = 'monarch';
  /**
   * The minimum price for a monarch offer of mercenaries.
   */
  static readonly MONARCH_MINIMUM_PRICE: number = 200;
  /**
   * The minimum price for a Hessian offer of mercenaries.
   */
  static readonly HESSIAN_MINIMUM_PRICE: number = 5000;
  /**
   * The minimum tax rate (given in percentage) from where it
   * can be lowered.
   */
  static readonly MINIMUM_TAX_RATE: number = 20;
  /**
   * The player of this monarch.
   */
  player: Player = null;
  /**
   * Whether a frigate has been provided.
   */
  supportSea: boolean = false;
  /**
   * Whether displeasure has been incurred.
   */
  displeasure: boolean = false;
  /**
   * The Royal Expeditionary Force, which the Monarch will send to
   * crush the player's rebellion.
   */
  expeditionaryForce: Force = null;
  /**
   * The Foreign Intervention Force, which some random country will
   * send to support the player's rebellion.
   */
  interventionForce: Force = null;
  /**
   * The naval unit types suitable for support actions.
   */
  navalTypes: List<UnitType> = null;
  /**
   * The bombard unit types suitable for support actions.
   */
  bombardTypes: List<UnitType> = null;
  /**
   * The land unit types suitable for support actions.
   */
  landTypes: List<UnitType> = null;
  /**
   * The roles identifiers suitable for land units with support actions.
   */
  mountedRole: Role = null;
  /**
   * The roles identifiers suitable for land units with support actions.
   */
  armedRole: Role = null;
  /**
   * The roles identifiers suitable for land units with support actions.
   */
  refMountedRole: Role = null;
  /**
   * The roles identifiers suitable for land units with support actions.
   */
  refArmedRole: Role = null;
  /**
   * The land unit types suitable for mercenary support.
   */
  mercenaryTypes: List<UnitType> = null;
  /**
   * The naval unit types suitable for the REF.
   */
  navalREFUnitTypes: List<UnitType> = null;
  /**
   * The land unit types suitable for the REF.
   */
  landREFUnitTypes: List<UnitType> = null;
  static readonly DISPLEASURE_TAG: string = 'displeasure';
  static readonly EXPEDITIONARY_FORCE_TAG: string = 'expeditionaryForce';
  static readonly INTERVENTION_FORCE_TAG: string = 'interventionForce';
  static readonly PLAYER_TAG: string = 'player';
  static readonly SUPPORT_SEA_TAG: string = 'supportSea';
  static readonly NAME_TAG: string = 'name';
  static readonly MERCENARY_FORCE_TAG: string = 'mercenaryForce';
  $init_Monarch() {
    this.supportSea = false;
    this.displeasure = false;
    this.navalTypes = null;
    this.bombardTypes = null;
    this.landTypes = null;
    this.mountedRole = null;
    this.armedRole = null;
    this.mercenaryTypes = null;
    this.navalREFUnitTypes = null;
    this.landREFUnitTypes = null;
  }
  /**
   * Constructor.
   *
   * @param game The enclosing {@code Game}.
   * @param player The {@code Player} to create the
   *     {@code Monarch} for.
   */
  _Monarch$Game$Player(game: Game, player: Player): this {
    this._FreeColGameObject$Game(game);
    this.$init_Monarch();
    if (player == null) {
      throw new RuntimeException('player == null: ' + $J.str(this));
    }
    this.player = player;
    return this;
  }
  /**
   * Initiates a new {@code Monarch} with the given identifier.
   * The object should later be initialized by calling
   * {@link #readFromXML(FreeColXMLReader)}.
   *
   * @param game The enclosing {@code Game}.
   * @param id The object identifier.
   */
  _Monarch$Game$String(game: Game, id: string): this {
    this._FreeColGameObject$Game$String(game, id);
    this.$init_Monarch();
    return this;
  }
  /**
   * Get the owning player.
   *
   * Note: Monarchs are not and should not be Ownable.
   *
   * @return The {@code Player} associated with this monarch.
   */
  getPlayer(): Player {
    return this.player;
  }
  /**
   * Get the force describing the REF.
   *
   * @return The REF {@code Force}.
   */
  getExpeditionaryForce(): Force {
    if (this.expeditionaryForce == null) {
      let spec = this.getSpecification();
      this.expeditionaryForce = new Force()._Force$Specification$List$String(spec, spec.getUnitList(GameOptions.REF_FORCE), null);
    }
    return this.expeditionaryForce;
  }
  /**
   * Get the force describing the Intervention Force.
   *
   * @return The intervention {@code Force}.
   */
  getInterventionForce(): Force {
    if (this.interventionForce == null) {
      let spec = this.getSpecification();
      this.interventionForce = new Force()._Force$Specification$List$String(spec, spec.getUnitList(GameOptions.INTERVENTION_FORCE), null);
    }
    return this.interventionForce;
  }
  /**
   * Gets the force describing the Mercenary Force.
   *
   * This is never updated, and directly derived from the spec.
   *
   * @return The mercenary {@code Force}.
   */
  getMercenaryForce(): Force {
    let spec = this.getSpecification();
    return new Force()._Force$Specification$List$String(spec, spec.getUnitList(GameOptions.MERCENARY_FORCE), null);
  }
  /**
   * Get the war support force.
   *
   * This is never updated, and directly derived from the spec.
   *
   * @return The war support {@code Force}.
   */
  getWarSupportForce(): Force {
    let spec = this.getSpecification();
    return new Force()._Force$Specification$List$String(spec, spec.getUnitList(GameOptions.WAR_SUPPORT_FORCE), null);
  }
  /**
   * Gets the sea support status.
   *
   * @return Gets the sea support status.
   */
  getSupportSea(): boolean {
    return this.supportSea;
  }
  /**
   * Sets the sea support status.
   *
   * @param supportSea The new sea support status.
   */
  setSupportSea(supportSea: boolean): void {
    this.supportSea = supportSea;
  }
  /**
   * Gets the displeasure status.
   *
   * @return Gets the displeasure status.
   */
  getDispleasure(): boolean {
    return this.displeasure;
  }
  /**
   * Sets the displeasure status.
   *
   * @param displeasure The new displeasure status.
   */
  setDispleasure(displeasure: boolean): void {
    this.displeasure = displeasure;
  }
  /**
   * Gets the maximum tax rate in this game.
   *
   * @return The maximum tax rate in the game.
   */
  taxMaximum(): number {
    return this.getSpecification().getInteger(GameOptions.MAXIMUM_TAX);
  }
  /**
   * Cache the unit types and roles for support and mercenary offers.
   */
  initializeCaches(): void {
    if (this.navalTypes != null) {
      return;
    }
    let spec = this.getSpecification();
    this.navalTypes = new ArrayList();
    this.bombardTypes = new ArrayList();
    this.landTypes = new ArrayList();
    this.mercenaryTypes = new ArrayList();
    this.navalREFUnitTypes = spec.getREFUnitTypes(true);
    this.landREFUnitTypes = spec.getREFUnitTypes(false);
    for (const $it0 = spec.getUnitTypeList().iterator(); $it0.hasNext(); ) {
      let unitType = $it0.next();
      if (unitType.hasAbility$String(Ability.SUPPORT_UNIT)) {
        if (unitType.hasAbility$String(Ability.NAVAL_UNIT)) {
          this.navalTypes.add(unitType);
        } else if (unitType.hasAbility$String(Ability.BOMBARD)) {
          this.bombardTypes.add(unitType);
        } else if (unitType.hasAbility$String(Ability.CAN_BE_EQUIPPED)) {
          this.landTypes.add(unitType);
        }
      }
      if (unitType.hasAbility$String(Ability.MERCENARY_UNIT)) {
        this.mercenaryTypes.add(unitType);
      }
    }
    for (const $it1 = spec.getMilitaryRolesList().iterator(); $it1.hasNext(); ) {
      let r = $it1.next();
      let ok = r.isAvailableTo([this.player, CollectionUtils.first$Collection(this.landTypes)]);
      let armed = r.hasAbility$String(Ability.ARMED);
      let mounted = r.hasAbility$String(Ability.MOUNTED);
      let ref = r.requiresAbility(Ability.REF_UNIT);
      if (armed && mounted) {
        if (ok && !ref && this.mountedRole == null) {
          this.mountedRole = r;
        } else if (!ok && ref && this.refMountedRole == null) {
          this.refMountedRole = r;
        }
      } else if (armed && !mounted) {
        if (ok && !ref && this.armedRole == null) {
          this.armedRole = r;
        } else if (!ok && ref && this.refArmedRole == null) {
          this.refArmedRole = r;
        }
      }
    }
  }
  /**
   * Collects a list of potential enemies for this player.
   *
   * @return A list of potential enemy {@code Player}s.
   */
  collectPotentialEnemies(): List<Player> {
    return (this.player.hasAbility$String(Ability.IGNORE_EUROPEAN_WARS)) ? Collections.emptyList() : CollectionUtils.transform$Stream$Predicate(this.getGame().getLiveEuropeanPlayers([this.player]), (p) => p.isPotentialEnemy(this.player));
  }
  /**
   * Collects a list of potential friends for this player.
   *
   * Do not apply Franklin, he stops wars, not peace.
   *
   * @return A list of potential friendly {@code Player}s.
   */
  collectPotentialFriends(): List<Player> {
    return CollectionUtils.transform$Stream$Predicate(this.getGame().getLiveEuropeanPlayers([this.player]), (p) => p.isPotentialFriend(this.player));
  }
  /**
   * Checks if a specified action is valid at present.
   *
   * @param action The {@code MonarchAction} to check.
   * @return True if the action is valid.
   */
  actionIsValid(action: Monarch$MonarchAction): boolean {
    this.initializeCaches();
    switch (action) {
      case Monarch$MonarchAction.NO_ACTION:
        return true;
      case Monarch$MonarchAction.RAISE_TAX_ACT:
      case Monarch$MonarchAction.RAISE_TAX_WAR:
        return this.player.getTax() < this.taxMaximum();
      case Monarch$MonarchAction.FORCE_TAX:
        return false;
      case Monarch$MonarchAction.LOWER_TAX_WAR:
      case Monarch$MonarchAction.LOWER_TAX_OTHER:
        return this.player.getTax() > ((Monarch.MINIMUM_TAX_RATE + 10) | 0);
      case Monarch$MonarchAction.WAIVE_TAX:
        return true;
      case Monarch$MonarchAction.ADD_TO_REF:
        return !this.navalREFUnitTypes.isEmpty() && !this.landREFUnitTypes.isEmpty();
      case Monarch$MonarchAction.DECLARE_PEACE:
        return !this.collectPotentialFriends().isEmpty();
      case Monarch$MonarchAction.DECLARE_WAR:
        return !this.collectPotentialEnemies().isEmpty();
      case Monarch$MonarchAction.SUPPORT_SEA:
        return this.player.getAttackedByPrivateers() && !this.getSupportSea() && !this.getDispleasure();
      case Monarch$MonarchAction.SUPPORT_LAND:
      case Monarch$MonarchAction.MONARCH_MERCENARIES:
        return this.player.isAtWar() && !this.getDispleasure() && this.player.hasSettlements();
      case Monarch$MonarchAction.HESSIAN_MERCENARIES:
        return this.player.checkGold(Monarch.HESSIAN_MINIMUM_PRICE) && this.player.hasSettlements();
      case Monarch$MonarchAction.DISPLEASURE:
        return false;
      default:
        throw new IllegalArgumentException('Bogus monarch action: ' + $J.str(action));
    }
  }
  /**
   * Builds a weighted list of monarch actions.
   *
   * @return A weighted list of monarch actions.
   */
  getActionChoices(): List<RandomChoice<Monarch$MonarchAction>> {
    let spec = this.getSpecification();
    let choices = new ArrayList();
    let dx = (1 + spec.getInteger(GameOptions.MONARCH_MEDDLING)) | 0;
    let turn = this.getGame().getTurn().getNumber();
    let grace = Math.imul(((6 - dx) | 0), 10);
    if (turn < grace || !this.player.hasSettlements() || this.player.getPlayerType() !== Player$PlayerType.COLONIAL) {
      return choices;
    }
    this.addIfValid(choices, Monarch$MonarchAction.NO_ACTION, Math.max((200 - turn) | 0, 100));
    this.addIfValid(choices, Monarch$MonarchAction.RAISE_TAX_ACT, (5 + dx) | 0);
    this.addIfValid(choices, Monarch$MonarchAction.RAISE_TAX_WAR, (5 + dx) | 0);
    this.addIfValid(choices, Monarch$MonarchAction.LOWER_TAX_WAR, (5 - dx) | 0);
    this.addIfValid(choices, Monarch$MonarchAction.LOWER_TAX_OTHER, (5 - dx) | 0);
    this.addIfValid(choices, Monarch$MonarchAction.ADD_TO_REF, (10 + dx) | 0);
    this.addIfValid(choices, Monarch$MonarchAction.DECLARE_PEACE, (6 - dx) | 0);
    this.addIfValid(choices, Monarch$MonarchAction.DECLARE_WAR, (5 + dx) | 0);
    if (this.player.checkGold(Monarch.MONARCH_MINIMUM_PRICE)) {
      this.addIfValid(choices, Monarch$MonarchAction.MONARCH_MERCENARIES, (6 - dx) | 0);
    } else if (dx < 3) {
      this.addIfValid(choices, Monarch$MonarchAction.SUPPORT_LAND, (3 - dx) | 0);
    }
    this.addIfValid(choices, Monarch$MonarchAction.SUPPORT_SEA, (6 - dx) | 0);
    this.addIfValid(choices, Monarch$MonarchAction.HESSIAN_MERCENARIES, (6 - dx) | 0);
    return choices;
  }
  /**
   * Convenience hack to check if an action is valid, and if so add
   * it to a choice list with a given weight.
   *
   * @param choices The list of choices.
   * @param action The {@code MonarchAction} to check.
   * @param weight The weight to add the action with if valid.
   */
  addIfValid(choices: List<RandomChoice<Monarch$MonarchAction>>, action: Monarch$MonarchAction, weight: number): void {
    if (this.actionIsValid(action)) {
      choices.add(new RandomChoice()._RandomChoice(action, weight));
    }
  }
  /**
   * Calculates a tax raise.
   *
   * @param random The {@code Random} number source to use.
   * @return The new tax rate.
   */
  raiseTax(random: Random): number {
    let spec = this.getSpecification();
    let taxAdjustment = spec.getInteger(GameOptions.TAX_ADJUSTMENT);
    let turn = this.getGame().getTurn().getNumber();
    let oldTax = this.player.getTax();
    let adjust = Math.max(1, Math.imul(((6 - taxAdjustment) | 0), 10));
    adjust = (1 + (RandomUtils.randomInt(Monarch.logger, 'Tax rise', random, (3 + $J.idiv(turn, adjust)) | 0))) | 0;
    return Math.min((oldTax + adjust) | 0, this.taxMaximum());
  }
  /**
   * Calculates a tax reduction.
   *
   * @param random The {@code Random} number source to use.
   * @return The new tax rate.
   */
  lowerTax(random: Random): number {
    let spec = this.getSpecification();
    let taxAdjustment = spec.getInteger(GameOptions.TAX_ADJUSTMENT);
    let oldTax = this.player.getTax();
    let adjust = Math.max(1, (10 - taxAdjustment) | 0);
    adjust = (1 + RandomUtils.randomInt(Monarch.logger, 'Tax reduction', random, adjust)) | 0;
    return Math.max((oldTax - adjust) | 0, Monarch.MINIMUM_TAX_RATE);
  }
  /**
   * Get a unit type for the REF navy.
   *
   * @return A naval REF unit type.
   */
  getNavalREFUnitType(): UnitType {
    this.initializeCaches();
    return CollectionUtils.first$Collection(this.navalREFUnitTypes);
  }
  /**
   * Should we add a naval unit to the REF next?
   *
   * Expand royal navy to +10% of required size to transport the land units.
   *
   * @return True if a naval unit should be added next.
   */
  shouldAddNavalUnit(): boolean {
    let ref = this.getExpeditionaryForce();
    return ref.getCapacity() < ref.getSpaceRequired() * 1.1;
  }
  /**
   * Add units to the Royal Expeditionary Force.
   *
   * @param random The {@code Random} number source to use.
   * @return An addition to the Royal Expeditionary Force.
   */
  addToREF(random: Random): AbstractUnit {
    this.initializeCaches();
    let spec = this.getSpecification();
    let result: AbstractUnit;
    if (this.shouldAddNavalUnit()) {
      let types = this.navalREFUnitTypes;
      if (types.isEmpty()) {
        return null;
      }
      result = new AbstractUnit()._AbstractUnit$UnitType$String$int(RandomUtils.getRandomMember$Logger$String$List$Random(Monarch.logger, 'Naval REF unit', types, random), Specification.DEFAULT_ROLE_ID, 1);
    } else {
      let types = this.landREFUnitTypes;
      if (types.isEmpty()) {
        return null;
      }
      let unitType = RandomUtils.getRandomMember$Logger$String$List$Random(Monarch.logger, 'Land REF unit', types, random);
      let role = (!unitType.hasAbility$String(Ability.CAN_BE_EQUIPPED)) ? spec.getDefaultRole() : (RandomUtils.randomInt(Monarch.logger, 'Choose land role', random, 3) === 0) ? this.refMountedRole : this.refArmedRole;
      let number$ = (RandomUtils.randomInt(Monarch.logger, 'Choose land#', random, 3) + 1) | 0;
      result = new AbstractUnit()._AbstractUnit$UnitType$String$int(unitType, role.getId(), number$);
    }
    let ref = this.getExpeditionaryForce();
    ref.add(result);
    Monarch.logger.info('Add to ' + this.player.getDebugName() + ' REF: capacity=' + ref.getCapacity() + ' spaceRequired=' + ref.getSpaceRequired() + ' => ' + $J.str(result));
    return result;
  }
  /**
   * Update the intervention force, adding land units depending on
   * turns passed, and naval units sufficient to transport all land
   * units.
   *
   * Called when the IVF is created.
   */
  updateInterventionForce(): void {
    let spec = this.getSpecification();
    let interventionTurns = spec.getInteger(GameOptions.INTERVENTION_TURNS);
    let updates = $J.idiv(this.getGame().getTurn().getNumber(), interventionTurns);
    let ivf = this.getInterventionForce();
    if (interventionTurns > 0 && updates > 0) {
      for (const $it2 = ivf.getLandUnitsList().iterator(); $it2.hasNext(); ) {
        let au = $it2.next();
        ivf.add(new AbstractUnit()._AbstractUnit$UnitType$String$int(au.getType(spec), au.getRoleId(), updates));
      }
      ivf.prepareToBoard(null);
    }
  }
  /**
   * Gets a additions to the colonial forces.
   *
   * @param random The {@code Random} number source to use.
   * @param naval If the addition should be a naval unit.
   * @return An addition to the colonial forces.
   */
  getSupport(random: Random, naval: boolean): List<AbstractUnit> {
    this.initializeCaches();
    let spec = this.getSpecification();
    let support = new ArrayList();
    if (naval) {
      support.add(new AbstractUnit()._AbstractUnit$UnitType$String$int(RandomUtils.getRandomMember$Logger$String$List$Random(Monarch.logger, 'Choose naval support', this.navalTypes, random), Specification.DEFAULT_ROLE_ID, 1));
      this.setSupportSea(true);
      return support;
    }
    let difficulty = spec.getInteger(GameOptions.MONARCH_SUPPORT);
    switch (difficulty) {
      case 4:
        support.add(new AbstractUnit()._AbstractUnit$UnitType$String$int(RandomUtils.getRandomMember$Logger$String$List$Random(Monarch.logger, 'Choose bombard', this.bombardTypes, random), Specification.DEFAULT_ROLE_ID, 1));
        support.add(new AbstractUnit()._AbstractUnit$UnitType$String$int(RandomUtils.getRandomMember$Logger$String$List$Random(Monarch.logger, 'Choose mounted', this.landTypes, random), this.mountedRole.getId(), 2));
        break;
      case 3:
        support.add(new AbstractUnit()._AbstractUnit$UnitType$String$int(RandomUtils.getRandomMember$Logger$String$List$Random(Monarch.logger, 'Choose mounted', this.landTypes, random), this.mountedRole.getId(), 2));
        support.add(new AbstractUnit()._AbstractUnit$UnitType$String$int(RandomUtils.getRandomMember$Logger$String$List$Random(Monarch.logger, 'Choose soldier', this.landTypes, random), this.armedRole.getId(), 1));
        break;
      case 2:
        support.add(new AbstractUnit()._AbstractUnit$UnitType$String$int(RandomUtils.getRandomMember$Logger$String$List$Random(Monarch.logger, 'Choose mounted', this.landTypes, random), this.mountedRole.getId(), 2));
        break;
      case 1:
        support.add(new AbstractUnit()._AbstractUnit$UnitType$String$int(RandomUtils.getRandomMember$Logger$String$List$Random(Monarch.logger, 'Choose mounted', this.landTypes, random), this.mountedRole.getId(), 1));
        support.add(new AbstractUnit()._AbstractUnit$UnitType$String$int(RandomUtils.getRandomMember$Logger$String$List$Random(Monarch.logger, 'Choose soldier', this.landTypes, random), this.armedRole.getId(), 1));
        break;
      case 0:
        support.add(new AbstractUnit()._AbstractUnit$UnitType$String$int(RandomUtils.getRandomMember$Logger$String$List$Random(Monarch.logger, 'Choose soldier', this.landTypes, random), this.armedRole.getId(), 1));
        break;
      default:
        break;
    }
    return support;
  }
  /**
   * Check if the monarch provides support for a war.
   *
   * @param enemy The enemy {@code Player}.
   * @param random A pseudo-random number source.
   * @return A list of {@code AbstractUnit}s provided as support.
   */
  getWarSupport(enemy: Player, random: Random): List<AbstractUnit> {
    let spec = this.getSpecification();
    let baseStrength = this.player.calculateStrength(false);
    let enemyStrength = enemy.calculateStrength(false);
    let strengthRatio = Player.strengthRatio(baseStrength, enemyStrength);
    let result = new ArrayList();
    let NOSUPPORT = 0.6;
    let p = 10 * (NOSUPPORT - strengthRatio);
    if (p >= 1 || (p > 0 && p > RandomUtils.randomDouble(Monarch.logger, 'War support?', random))) {
      let wsf = this.getWarSupportForce();
      result.addAll(wsf.getUnitList());
      let supportStrength: number;
      let fullRatio: number;
      let strength: number;
      let ratio: number;
      supportStrength = wsf.calculateStrength(false);
      fullRatio = Player.strengthRatio(baseStrength + supportStrength, enemyStrength);
      if (fullRatio < NOSUPPORT) {
        for (const $it3 = result.iterator(); $it3.hasNext(); ) {
          let au = $it3.next();
          au.addToNumber((RandomUtils.randomInt(Monarch.logger, 'Vary war force ' + au.getId(), random, 3) - 1) | 0);
        }
      } else if (enemyStrength <= 0) {
        while (result.size() > 1) {
          result.removeAt(0);
        }
        result.get(0).setNumber(1);
      } else {
        outer:
        for (const $it4 = result.iterator(); $it4.hasNext(); ) {
          let au = $it4.next();
          for (let n = (au.getNumber() - 1) | 0; n >= 1; n--) {
            au.setNumber(n);
            strength = AbstractUnit.calculateStrength(spec, result);
            ratio = Player.strengthRatio(baseStrength + strength, enemyStrength);
            if (ratio < NOSUPPORT) {
              break outer;
            }
          }
        }
      }
      strength = AbstractUnit.calculateStrength(spec, result);
      ratio = Player.strengthRatio(baseStrength + strength, enemyStrength);
      Monarch.logger.finest('War support: initially=' + $J.dstr(supportStrength) + '/' + $J.dstr(fullRatio) + ' finally=' + $J.dstr(strength) + '/' + $J.dstr(ratio));
    }
    return result;
  }
  /**
   * Gets some units available as mercenaries.
   *
   * @param random The {@code Random} number source to use.
   * @param mercs A list to load with mercenary {@code AbstractUnit}s.
   * @return The price the monarch will ask or negative if nothing to offer.
   */
  loadMercenaries(random: Random, mercs: List<AbstractUnit>): number {
    this.initializeCaches();
    mercs.clear();
    let spec = this.getSpecification();
    let defaultRole = spec.getDefaultRole();
    let mercPrice = spec.getInteger(GameOptions.MERCENARY_PRICE);
    let landRoles = new ArrayList();
    landRoles.add(this.armedRole);
    landRoles.add(this.mountedRole);
    let count = (RandomUtils.randomInt(Monarch.logger, 'Mercenary count', random, 2) + 2) | 0;
    let price = 0;
    let unitType = null;
    let unitTypes = new ArrayList(this.mercenaryTypes);
    while (count > 0 && !unitTypes.isEmpty()) {
      unitType = RandomUtils.getRandomMember$Logger$String$List$Random(Monarch.logger, 'Merc unit', unitTypes, random);
      unitTypes.remove(unitType);
      let role = (unitType.hasAbility$String(Ability.CAN_BE_EQUIPPED)) ? RandomUtils.getRandomMember$Logger$String$List$Random(Monarch.logger, 'Merc role', landRoles, random) : defaultRole;
      let n = (RandomUtils.randomInt(Monarch.logger, 'Merc count ' + $J.str(unitType), random, Math.min(count, 2)) + 1) | 0;
      let au = new AbstractUnit()._AbstractUnit$UnitType$String$int(unitType, role.getId(), 1);
      let newPrice = this.player.getEuropeanPurchasePrice(au);
      if (newPrice <= 0 || newPrice === Constants.INFINITY) {
        break;
      }
      newPrice = Math.imul(newPrice, $J.idiv(mercPrice, 100));
      while (n > 0 && !this.player.checkGold((price + Math.imul(newPrice, n)) | 0)) {
        n--;
      }
      if (n > 0) {
        au.setNumber(n);
        mercs.add(au);
        price = (price + Math.imul(newPrice, n)) | 0;
        count = (count - n) | 0;
      } else {
        unitTypes.remove(unitType);
      }
    }
    return price;
  }
  /**
   * Load the mercenary force, reduced to the point of being
   * affordable if possible.
   *
   * @param random The {@code Random} number source to use.
   * @param mercs A list to load with mercenary {@code AbstractUnit}s.
   * @return The price the monarch will ask, or negative if nothing to offer.
   */
  loadMercenaryForce(random: Random, mercs: List<AbstractUnit>): number {
    this.initializeCaches();
    mercs.clear();
    mercs.addAll(this.getMercenaryForce().getUnitList());
    let prices = new ArrayList(mercs.size());
    for (const $it5 = mercs.iterator(); $it5.hasNext(); ) {
      let au = $it5.next();
      let price = $J.idiv(this.player.getMercenaryHirePrice(au), au.getNumber());
      prices.add(price);
    }
    let i = 0;
    let mercPrice = 0;
    while (i < mercs.size()) {
      let price = prices.get(i);
      if (price <= 0 || price === Constants.INFINITY) {
        prices.removeAt(i);
        mercs.removeAt(i);
      } else {
        mercPrice = (mercPrice + Math.imul(price, mercs.get(i).getNumber())) | 0;
        i++;
      }
    }
    while (!mercs.isEmpty()) {
      if (this.player.checkGold(mercPrice)) {
        return mercPrice;
      }
      let r = RandomUtils.randomInt(Monarch.logger, 'merc downsize', random, mercs.size());
      mercPrice = (mercPrice - prices.get(r)) | 0;
      let au = mercs.get(r);
      if (au.getNumber() > 1) {
        au.addToNumber(-1);
      } else {
        prices.removeAt(r);
        mercs.removeAt(r);
      }
    }
    return -1;
  }
  /**
   * {@inheritDoc}
   */
  getNameKey(): string {
    return this.player.getNation().getRulerNameKey();
  }
  /**
   * {@inheritDoc}
   */
  copyIn<T>(other: T): boolean {
    let o = this.copyInCast(other, $J.cls(Monarch));
    if (o == null || !super.copyIn(o)) {
      return false;
    }
    let game = this.getGame();
    this.player = game.updateRef$FreeColGameObject(o.getPlayer());
    this.supportSea = o.getSupportSea();
    this.displeasure = o.getDispleasure();
    this.expeditionaryForce = o.getExpeditionaryForce();
    this.interventionForce = o.getInterventionForce();
    return true;
  }
  /**
   * {@inheritDoc}
   */
  writeAttributes(xw: FreeColXMLWriter): void {
    super.writeAttributes(xw);
    xw.writeAttribute$String$FreeColObject(Monarch.PLAYER_TAG, this.player);
    if (xw.validFor(this.player)) {
      xw.writeAttribute$String$boolean(Monarch.SUPPORT_SEA_TAG, this.supportSea);
      xw.writeAttribute$String$boolean(Monarch.DISPLEASURE_TAG, this.displeasure);
    }
  }
  /**
   * {@inheritDoc}
   */
  writeChildren(xw: FreeColXMLWriter): void {
    super.writeChildren(xw);
    if (xw.validFor(this.player)) {
      this.getExpeditionaryForce().toXML$FreeColXMLWriter$String(xw, Monarch.EXPEDITIONARY_FORCE_TAG);
      this.getInterventionForce().toXML$FreeColXMLWriter$String(xw, Monarch.INTERVENTION_FORCE_TAG);
    }
  }
  /**
   * {@inheritDoc}
   */
  readAttributes(xr: FreeColXMLReader): void {
    super.readAttributes(xr);
    this.player = xr.findFreeColGameObject(this.getGame(), Monarch.PLAYER_TAG, $J.cls(Player), null, true);
    this.supportSea = xr.getAttribute$String$boolean(Monarch.SUPPORT_SEA_TAG, false);
    this.displeasure = xr.getAttribute$String$boolean(Monarch.DISPLEASURE_TAG, false);
  }
  /**
   * {@inheritDoc}
   */
  readChildren(xr: FreeColXMLReader): void {
    let spec = this.getSpecification();
    if (this.expeditionaryForce == null) {
      this.expeditionaryForce = new Force()._Force$Specification(spec);
    }
    if (this.interventionForce == null) {
      this.interventionForce = new Force()._Force$Specification(spec);
    }
    super.readChildren(xr);
  }
  /**
   * {@inheritDoc}
   */
  readChild(xr: FreeColXMLReader): void {
    let tag = xr.getLocalName();
    if ($J.equals(Monarch.EXPEDITIONARY_FORCE_TAG, tag)) {
      this.expeditionaryForce.readFromXML(xr);
    } else if ($J.equals(Monarch.INTERVENTION_FORCE_TAG, tag)) {
      this.interventionForce.readFromXML(xr);
    } else if ($J.equals(Monarch.MERCENARY_FORCE_TAG, tag)) {
      new Force()._Force$Specification(this.getSpecification()).readFromXML(xr);
    } else {
      super.readChild(xr);
    }
  }
  /**
   * {@inheritDoc}
   */
  getXMLTagName(): string {
    return Monarch.TAG;
  }
  static $clinit() {
    Monarch.logger = Logger.getLogger($J.cls(Monarch).getName());
  }
}

/**
 * Constants describing monarch actions.
 */
export class Monarch$MonarchAction extends JEnum {
  static NO_ACTION: Monarch$MonarchAction = null;
  static RAISE_TAX_ACT: Monarch$MonarchAction = null;
  static RAISE_TAX_WAR: Monarch$MonarchAction = null;
  static FORCE_TAX: Monarch$MonarchAction = null;
  static LOWER_TAX_WAR: Monarch$MonarchAction = null;
  static LOWER_TAX_OTHER: Monarch$MonarchAction = null;
  static WAIVE_TAX: Monarch$MonarchAction = null;
  static ADD_TO_REF: Monarch$MonarchAction = null;
  static DECLARE_PEACE: Monarch$MonarchAction = null;
  static DECLARE_WAR: Monarch$MonarchAction = null;
  static SUPPORT_LAND: Monarch$MonarchAction = null;
  static SUPPORT_SEA: Monarch$MonarchAction = null;
  static MONARCH_MERCENARIES: Monarch$MonarchAction = null;
  static HESSIAN_MERCENARIES: Monarch$MonarchAction = null;
  static DISPLEASURE: Monarch$MonarchAction = null;
  static $VALUES: Monarch$MonarchAction[] = null;
  _Monarch$MonarchAction($name: string, $ordinal: number): this {
    this._JEnum($name, $ordinal);
    return this;
  }
  /**
   * Get a key for this action.
   *
   * @return A message key.
   */
  getKey(): string {
    return 'monarch.action.' + StringUtils.getEnumKey(this);
  }
  getTextKey(): string {
    return 'model.' + this.getKey() + '.text';
  }
  getYesKey(): string {
    return 'model.' + this.getKey() + '.yes';
  }
  getNoKey(): string {
    return 'model.' + this.getKey() + '.no';
  }
  getHeaderKey(): string {
    return 'model.' + this.getKey() + '.header';
  }
  static values(): Monarch$MonarchAction[] { return Monarch$MonarchAction.$VALUES.slice(); }
  static valueOf(name: string): Monarch$MonarchAction { return $J.enumValueOf(Monarch$MonarchAction, name); }
  static $clinit() {
    Monarch$MonarchAction.NO_ACTION = new Monarch$MonarchAction()._Monarch$MonarchAction('NO_ACTION', 0);
    Monarch$MonarchAction.RAISE_TAX_ACT = new Monarch$MonarchAction()._Monarch$MonarchAction('RAISE_TAX_ACT', 1);
    Monarch$MonarchAction.RAISE_TAX_WAR = new Monarch$MonarchAction()._Monarch$MonarchAction('RAISE_TAX_WAR', 2);
    Monarch$MonarchAction.FORCE_TAX = new Monarch$MonarchAction()._Monarch$MonarchAction('FORCE_TAX', 3);
    Monarch$MonarchAction.LOWER_TAX_WAR = new Monarch$MonarchAction()._Monarch$MonarchAction('LOWER_TAX_WAR', 4);
    Monarch$MonarchAction.LOWER_TAX_OTHER = new Monarch$MonarchAction()._Monarch$MonarchAction('LOWER_TAX_OTHER', 5);
    Monarch$MonarchAction.WAIVE_TAX = new Monarch$MonarchAction()._Monarch$MonarchAction('WAIVE_TAX', 6);
    Monarch$MonarchAction.ADD_TO_REF = new Monarch$MonarchAction()._Monarch$MonarchAction('ADD_TO_REF', 7);
    Monarch$MonarchAction.DECLARE_PEACE = new Monarch$MonarchAction()._Monarch$MonarchAction('DECLARE_PEACE', 8);
    Monarch$MonarchAction.DECLARE_WAR = new Monarch$MonarchAction()._Monarch$MonarchAction('DECLARE_WAR', 9);
    Monarch$MonarchAction.SUPPORT_LAND = new Monarch$MonarchAction()._Monarch$MonarchAction('SUPPORT_LAND', 10);
    Monarch$MonarchAction.SUPPORT_SEA = new Monarch$MonarchAction()._Monarch$MonarchAction('SUPPORT_SEA', 11);
    Monarch$MonarchAction.MONARCH_MERCENARIES = new Monarch$MonarchAction()._Monarch$MonarchAction('MONARCH_MERCENARIES', 12);
    Monarch$MonarchAction.HESSIAN_MERCENARIES = new Monarch$MonarchAction()._Monarch$MonarchAction('HESSIAN_MERCENARIES', 13);
    Monarch$MonarchAction.DISPLEASURE = new Monarch$MonarchAction()._Monarch$MonarchAction('DISPLEASURE', 14);
    Monarch$MonarchAction.$VALUES = [Monarch$MonarchAction.NO_ACTION, Monarch$MonarchAction.RAISE_TAX_ACT, Monarch$MonarchAction.RAISE_TAX_WAR, Monarch$MonarchAction.FORCE_TAX, Monarch$MonarchAction.LOWER_TAX_WAR, Monarch$MonarchAction.LOWER_TAX_OTHER, Monarch$MonarchAction.WAIVE_TAX, Monarch$MonarchAction.ADD_TO_REF, Monarch$MonarchAction.DECLARE_PEACE, Monarch$MonarchAction.DECLARE_WAR, Monarch$MonarchAction.SUPPORT_LAND, Monarch$MonarchAction.SUPPORT_SEA, Monarch$MonarchAction.MONARCH_MERCENARIES, Monarch$MonarchAction.HESSIAN_MERCENARIES, Monarch$MonarchAction.DISPLEASURE];
  }
}

$J.define(Monarch, 'net.sf.freecol.common.model.Monarch', { kind: 'class', ifaces: ['net.sf.freecol.common.model.Named'], sup: 'net.sf.freecol.common.model.FreeColGameObject', ctors: { 'net.sf.freecol.common.model.Game,java.lang.String': '_Monarch$Game$String', 'net.sf.freecol.common.model.Game,net.sf.freecol.common.model.Player': '_Monarch$Game$Player' }, returns: { 'getXMLTagName': 'java.lang.String', 'getNameKey': 'java.lang.String', 'getNavalREFUnitType': 'net.sf.freecol.common.model.UnitType', 'getActionChoices': 'java.util.List', 'getDispleasure': 'boolean', 'getSupportSea': 'boolean', 'getWarSupportForce': 'net.sf.freecol.common.model.Force', 'getMercenaryForce': 'net.sf.freecol.common.model.Force', 'getInterventionForce': 'net.sf.freecol.common.model.Force', 'getExpeditionaryForce': 'net.sf.freecol.common.model.Force', 'getPlayer': 'net.sf.freecol.common.model.Player' }, clinit: true, lazy: ['logger'] });
$J.define(Monarch$MonarchAction, 'net.sf.freecol.common.model.Monarch$MonarchAction', { kind: 'enum', sup: 'java.lang.Enum', ctors: { '': '_Monarch$MonarchAction' }, returns: { 'getHeaderKey': 'java.lang.String', 'getNoKey': 'java.lang.String', 'getYesKey': 'java.lang.String', 'getTextKey': 'java.lang.String', 'getKey': 'java.lang.String' }, clinit: true, lazy: ['$VALUES', 'NO_ACTION', 'RAISE_TAX_ACT', 'RAISE_TAX_WAR', 'FORCE_TAX', 'LOWER_TAX_WAR', 'LOWER_TAX_OTHER', 'WAIVE_TAX', 'ADD_TO_REF', 'DECLARE_PEACE', 'DECLARE_WAR', 'SUPPORT_LAND', 'SUPPORT_SEA', 'MONARCH_MERCENARIES', 'HESSIAN_MERCENARIES', 'DISPLEASURE'] });
$J.module(() => {
  Ability = $J.load('net.sf.freecol.common.model.Ability');
  AbstractUnit = $J.load('net.sf.freecol.common.model.AbstractUnit');
  Constants = $J.load('net.sf.freecol.common.model.Constants');
  Force = $J.load('net.sf.freecol.common.model.Force');
  Player = $J.load('net.sf.freecol.common.model.Player');
  Player$PlayerType = $J.load('net.sf.freecol.common.model.Player$PlayerType');
  Specification = $J.load('net.sf.freecol.common.model.Specification');
  GameOptions = $J.load('net.sf.freecol.common.option.GameOptions');
  CollectionUtils = $J.load('net.sf.freecol.common.util.CollectionUtils');
  RandomChoice = $J.load('net.sf.freecol.common.util.RandomChoice');
  RandomUtils = $J.load('net.sf.freecol.common.util.RandomUtils');
  StringUtils = $J.load('net.sf.freecol.common.util.StringUtils');
});
