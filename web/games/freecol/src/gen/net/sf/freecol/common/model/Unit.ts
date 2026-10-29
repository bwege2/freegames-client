// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/common/model/Unit.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J, Collections, Collectors, Comparator, Exception, HashSet, IllegalArgumentException, IllegalStateException, JEnum, JObject, JString, Logger, RuntimeException, Stream, StringBuilder, UnsupportedOperationException } from '../../../../../../jre/index.ts';
import { GoodsLocation } from './GoodsLocation.ts';

let Messages, Ability, AbstractGoods, Colony, CombatModel$CombatOdds, Constants, Direction, Europe, FreeColObject, Goods, GoodsContainer, GoodsType, HighSeas, IndianSettlement, IndianSettlement$ContactLevel, Location, Map_, Modifier, Modifier$ModifierType, PathNode, Player, ProductionInfo, Role, Settlement, StringTemplate, Tile, TileImprovement, TradeRoute, UnitChangeType, UnitLocation$NoAddReason, UnitType, WorkLocation, CostDeciders, GoalDeciders, GameOptions, CollectionUtils, StringUtils;

/**
 * Represents all pieces that can be moved on the map-board. This includes:
 * colonists, ships, wagon trains e.t.c.
 *
 * Every {@code Unit} is owned by a {@link Player} and has a
 * {@link Location}.
 */
export class Unit extends GoodsLocation {
  static logger: Logger = null;
  /**
   * Class index for units.
   */
  static readonly UNIT_CLASS_INDEX: number = 40;
  static readonly TAG: string = 'unit';
  /**
   * A large number of turns, denoting pathfinding failure.  Do not use
   * INFINITY as further calculation might use this.
   */
  static readonly MANY_TURNS: number = 10000;
  /**
   * Default value of unpriced units, used in evaluate_for.
   */
  static readonly DEFAULT_UNIT_VALUE: number = 500;
  static readonly CARGO_CHANGE: string = 'CARGO_CHANGE';
  static readonly MOVE_CHANGE: string = 'MOVE_CHANGE';
  static readonly ROLE_CHANGE: string = 'ROLE_CHANGE';
  /**
   * Compare units by location.
   */
  static locComparator: Comparator<Unit> = null;
  /**
   * A comparator to compare units by type, then role index, then
   * the FCO order.
   */
  static typeRoleComparator: Comparator<Unit> = null;
  /**
   * A comparator to compare units by increasing skill level.
   */
  static increasingSkillComparator: Comparator<Unit> = null;
  /**
   * A comparator to compare units by decreasing skill level.
   */
  static decreasingSkillComparator: Comparator<Unit> = null;
  /**
   * Comparator to rank settlements by accessibility by sea to Europe.
   */
  static settlementStartComparator: Comparator<Settlement> = null;
  /**
   * Useful predicate for finding sentried land units.
   */
  static sentryPred: Predicate<Unit> = null;
  /**
   * The individual name of this unit, not of the unit type.
   */
  name: string = null;
  /**
   * The owner player.
   */
  owner: Player = null;
  /**
   * The unit type.
   */
  type: UnitType = null;
  /**
   * Current unit state.
   */
  state: Unit$UnitState = null;
  /**
   * Current unit role.
   */
  role: Role = null;
  /**
   * The amount of role-equipment this unit carries, subject to
   * role.getMaximumCount().  Currently zero or one except for pioneers.
   */
  roleCount: number = 0;
  /**
   * The current unit location.
   */
  location_: Location = null;
  /**
   * The last entry location used by this unit.
   */
  entryLocation: Location = null;
  /**
   * The number of moves this unit has left this turn.
   */
  movesLeft: number = 0;
  /**
   * What type of goods this unit produces in its occupation.
   */
  workType: GoodsType = null;
  /**
   * What type of goods this unit last earned experience producing.
   */
  experienceType: GoodsType = null;
  /**
   * The mount of experience a unit has earned.
   */
  experience: number = 0;
  /**
   * The number of turns until the work is finished (e.g. sailing,
   * improving), or '-1' if a Unit can stay in its state forever.
   */
  workLeft: number = 0;
  /**
   * What is being improved (to be used only for PIONEERs - where
   * they are working.
   */
  workImprovement: TileImprovement = null;
  /**
   * The student of this Unit, if it has one.
   */
  student: Unit = null;
  /**
   * The teacher of this Unit, if it has one.
   */
  teacher: Unit = null;
  /**
   * Number of turns of training needed by this unit.
   */
  turnsOfTraining: number = 0;
  /**
   * The original nationality.
   */
  nationality: string = null;
  /**
   * The original ethnicity.
   */
  ethnicity: string = null;
  /**
   * The home settlement of a native unit.
   */
  indianSettlement: IndianSettlement = null;
  /**
   * For now; only used by ships when repairing.
   */
  hitPoints: number = 0;
  /**
   * A destination for go-to moves.
   */
  destination: Location = null;
  /**
   * The trade route this unit has.
   */
  tradeRoute: TradeRoute = null;
  /**
   * Which stop in a trade route the unit is going to.
   */
  currentStop: number = 0;
  /**
   * To be used only for type == TREASURE_TRAIN
   */
  treasureAmount: number = 0;
  /**
   * The attrition this unit has accumulated.  At the moment, this
   * equals the number of turns it has spent in the open.
   */
  attrition: number = 0;
  /**
   * The amount of goods carried by this unit.  This variable is
   * only used by the clients.  A negative value signals that the
   * variable is not in use.
   *
   * @see #getVisibleGoodsCount()
   */
  visibleGoodsCount: number = 0;
  static readonly ATTRITION_TAG: string = 'attrition';
  static readonly COUNT_TAG: string = 'count';
  static readonly CURRENT_STOP_TAG: string = 'currentStop';
  static readonly DESTINATION_TAG: string = 'destination';
  static readonly ENTRY_LOCATION_TAG: string = 'entryLocation';
  static readonly ETHNICITY_TAG: string = 'ethnicity';
  static readonly EXPERIENCE_TAG: string = 'experience';
  static readonly EXPERIENCE_TYPE_TAG: string = 'experienceType';
  static readonly HIT_POINTS_TAG: string = 'hitPoints';
  static readonly INDIAN_SETTLEMENT_TAG: string = 'indianSettlement';
  static readonly LOCATION_TAG: string = 'location';
  static readonly MOVES_LEFT_TAG: string = 'movesLeft';
  static readonly NAME_TAG: string = 'name';
  static readonly NATIONALITY_TAG: string = 'nationality';
  static readonly OWNER_TAG: string = 'owner';
  static readonly ROLE_TAG: string = 'role';
  static readonly ROLE_COUNT_TAG: string = 'roleCount';
  static readonly STATE_TAG: string = 'state';
  static readonly STUDENT_TAG: string = 'student';
  static readonly TRADE_ROUTE_TAG: string = 'tradeRoute';
  static readonly TEACHER_TAG: string = 'teacher';
  static readonly TREASURE_AMOUNT_TAG: string = 'treasureAmount';
  static readonly TURNS_OF_TRAINING_TAG: string = 'turnsOfTraining';
  static readonly UNIT_TYPE_TAG: string = 'unitType';
  static readonly VISIBLE_GOODS_COUNT_TAG: string = 'visibleGoodsCount';
  static readonly WORK_LEFT_TAG: string = 'workLeft';
  static readonly WORK_TYPE_TAG: string = 'workType';
  static readonly OLD_EQUIPMENT_TAG: string = 'equipment';
  static readonly OLD_TILE_IMPROVEMENT_TAG: string = 'tileimprovement';
  $init_Unit() {
    this.name = null;
    this.state = Unit$UnitState.ACTIVE;
    this.experience = 0;
    this.turnsOfTraining = 0;
    this.nationality = null;
    this.ethnicity = null;
    this.indianSettlement = null;
    this.destination = null;
    this.tradeRoute = null;
    this.currentStop = -1;
    this.attrition = 0;
  }
  /**
   * Constructor for ServerUnit.
   *
   * @param game The enclosing {@code Game}.
   */
  _Unit$Game(game: Game): this {
    this._GoodsLocation$Game(game);
    this.$init_Unit();
    this.initialize();
    return this;
  }
  /**
   * Creates a new {@code Unit} with the given
   * identifier.  The object should later be initialized by calling
   * {@link #readFromXML(FreeColXMLReader)}.
   *
   * @param game The enclosing {@code Game}.
   * @param id The object identifier.
   */
  _Unit$Game$String(game: Game, id: string): this {
    this._GoodsLocation$Game$String(game, id);
    this.$init_Unit();
    this.initialize();
    return this;
  }
  /**
   * Initialize the nationality and ethnicity.
   */
  initialize(): void {
    let owner = this.getOwner();
    if (owner != null && this.isPerson()) {
      this.setNationality(owner.getNationId());
      this.setEthnicity(owner.getNationId());
    }
  }
  /**
   * Get the individual name of this unit.
   *
   * @return The individual name.
   */
  getName(): string {
    return this.name;
  }
  /**
   * Set the individual name of this unit.
   *
   * @param newName The new name.
   */
  setName(newName: string): void {
    this.name = newName;
  }
  /**
   * Get the name of the apparent owner of this Unit,
   * (like getOwner().getNationAsString() but handles pirates).
   *
   * @return The name of the apparent owner of this {@code Unit}.
   */
  getApparentOwnerName(): StringTemplate {
    let own = (this.isOwnerHidden()) ? this.getGame().getUnknownEnemy() : this.owner;
    return own.getNationLabel();
  }
  /**
   * Get a plain string template for a unit.
   *
   * @return The {@code StringTemplate} to describe the given unit.
   */
  getLabel$(): StringTemplate {
    return this.getLabel$UnitLabelType(Unit$UnitLabelType.PLAIN);
  }
  /**
   * Get a string template for a unit.
   *
   * The PLAIN template contains:
   * - The type of the unit
   * - A role if not the default
   * - The specific name of the unit if it has one
   * The NATIONAL template adds the nation
   * The FULL template adds equipment annotations
   *
   * @param ult The type of label to get.
   * @return The {@code StringTemplate} to describe the given unit.
   */
  getLabel$UnitLabelType(ult: Unit$UnitLabelType): StringTemplate {
    let type$ = this.getType();
    let role = this.getRole();
    let owner = this.getOwner();
    if (type$ == null || role == null || owner == null) {
      return null;
    }
    {
      let extra: StringTemplate;
      switch (ult) {
        case Unit$UnitLabelType.PLAIN:
          return Messages.getUnitLabel(this.getName(), type$.getId(), 1, null, role.getId(), null);
        case Unit$UnitLabelType.NATIONAL:
          if (role.getMaximumCount() > 1) {
          } else {
            return Messages.getUnitLabel(this.getName(), type$.getId(), 1, owner.getNationId(), role.getId(), null);
          }
        case Unit$UnitLabelType.FULL:
          extra = null;
          if (role.isDefaultRole()) {
            if (this.canCarryTreasure()) {
              extra = StringTemplate.template$String('goldAmount').addAmount('%amount%', this.getTreasureAmount());
            } else {
              let noEquipment = false;
              let expertRoles = type$.getExpertRoles();
              for (const $it0 = expertRoles.iterator(); $it0.hasNext(); ) {
                let someRole = $it0.next();
                let key = someRole.getId() + '.noequipment';
                if (Messages.containsKey(key)) {
                  extra = StringTemplate.key$String(key);
                  break;
                }
              }
            }
          } else {
            let equipmentKey = role.getId() + '.equipment';
            if (Messages.containsKey(equipmentKey)) {
              extra = AbstractGoods.getAbstractLabel(equipmentKey, 1);
            } else {
              let requiredGoods = role.getRequiredGoodsList$int(this.getRoleCount());
              let first = true;
              extra = StringTemplate.label('');
              for (const $it1 = requiredGoods.iterator(); $it1.hasNext(); ) {
                let ag = $it1.next();
                if (first) {
                  first = false;
                } else {
                  extra.addName$String(' ');
                }
                extra.addStringTemplate$StringTemplate(ag.getLabel$());
              }
            }
          }
          return Messages.getUnitLabel(this.getName(), type$.getId(), 1, owner.getNationId(), role.getId(), extra);
        default:
          break;
      }
    }
    return null;
  }
  /**
   * Get the basic i18n description for this unit.
   *
   * @return A {@code String} describing this unit.
   */
  getDescription$(): string {
    return Messages.message$StringTemplate(this.getLabel$());
  }
  /**
   * Get the basic i18n description for this unit.
   *
   * @param ult The label type required.
   * @return A {@code String} describing this unit.
   */
  getDescription$UnitLabelType(ult: Unit$UnitLabelType): string {
    return Messages.message$StringTemplate(this.getLabel$UnitLabelType(ult));
  }
  /**
   * Get a label for the chance of success in a potential combat.
   *
   * @param tile The {@code Tile} to attack into.
   * @return A suitable label.
   */
  getCombatLabel(tile: Tile): StringTemplate {
    let combatOdds = this.getGame().getCombatModel().calculateCombatOdds$FreeColGameObject$FreeColGameObject(this, tile.getDefendingUnit(this));
    let unknown$ = combatOdds.win === CombatModel$CombatOdds.UNKNOWN_ODDS || tile.hasSettlement();
    return StringTemplate.template$String('model.unit.attackTileOdds').addName$String$String('%chance%', (unknown$) ? '??' : String($J.d2i((combatOdds.win * 100))));
  }
  /**
   * Get a destination label for this unit.
   *
   * @return A {@code StringTemplate} describing where this unit
   *     is going.
   */
  getDestinationLabel(): StringTemplate {
    let type$ = (this.isPerson()) ? 'person' : (this.isNaval()) ? 'ship' : 'other';
    return Unit.getUnitDestinationLabel(type$, this.getDestination(), this.getOwner());
  }
  /**
   * Get a destination label for a given unit tag, destination and player.
   *
   * @param tag The unit tag for the "goingTo" message.
   * @param destination The destination {@code Location}.
   * @param player The {@code Player} viewpoint.
   * @return A {@code StringTemplate} describing the unit movement.
   */
  static getUnitDestinationLabel(tag: string, destination: Location, player: Player): StringTemplate {
    return StringTemplate.template$String('model.unit.goingTo').addTagged('%type%', tag).addStringTemplate$String$StringTemplate('%location%', destination.getLocationLabelFor(player));
  }
  /**
   * Get a string template describing the repair state of this unit.
   *
   * @return A repair label.
   */
  getRepairLabel(): StringTemplate {
    return StringTemplate.template$String('model.unit.underRepair').addAmount('%turns%', this.getTurnsForRepair());
  }
  /**
   * Get the {@code UnitType} value.
   *
   * @return The current {@code UnitType}.
   */
  getType(): UnitType {
    return this.type;
  }
  /**
   * Sets the type of the unit.
   *
   * -vis: Has visibility issues as the line of sight may change.
   *
   * @param type The new type of the unit.
   */
  setType(type$: UnitType): void {
    this.type = type$;
  }
  /**
   * Changes the type of the unit.
   *
   * -vis: Has visibility issues as the line of sight may change.
   *
   * @param unitType The new type of the unit.
   * @return True if the type change succeeds.
   */
  changeType(unitType: UnitType): boolean {
    if (!unitType.isAvailableTo([this.owner])) {
      return false;
    }
    let health = (this.getHitPoints()) / this.getMaximumHitPoints();
    this.setType(unitType);
    if (this.getMovesLeft() > this.getInitialMovesLeft()) {
      this.setMovesLeft(this.getInitialMovesLeft());
    }
    this.hitPoints = $J.d2i((unitType.getHitPoints() * health));
    if (this.getTeacher() != null) {
      if (!this.canBeStudent(this.getTeacher())) {
        this.getTeacher().setStudent(null);
        this.setTeacher(null);
      }
    } else if (this.getStudent() != null) {
      if (!this.getStudent().canBeStudent(this)) {
        this.getStudent().setTeacher(null);
        this.setStudent(null);
      }
    }
    return true;
  }
  /**
   * Score this unit.
   *
   * Just delegates to unit type for now.
   *
   * @return The score for this unit.
   */
  getScoreValue(): number {
    return (this.type == null) ? 0 : this.type.getScoreValue();
  }
  /**
   * Checks if this {@code Unit} is naval.
   *
   * @return True if this is a naval {@code Unit}.
   */
  isNaval(): boolean {
    return (this.type == null) ? false : this.type.isNaval();
  }
  /**
   * Is this a unit that hides its ownership?
   *
   * @return True if the owner should be hidden from clients.
   */
  isOwnerHidden(): boolean {
    return (this.type == null) ? false : this.type.hasAbility$String(Ability.PIRACY);
  }
  /**
   * Checks if this unit is an undead.
   *
   * @return True if the unit is undead.
   */
  isUndead(): boolean {
    return this.hasAbility$String(Ability.UNDEAD);
  }
  /**
   * Can this unit carry treasure (like a treasure train)?
   *
   * @return True if this {@code Unit} can carry treasure.
   */
  canCarryTreasure(): boolean {
    return this.hasAbility$String(Ability.CARRY_TREASURE);
  }
  /**
   * Can this unit capture enemy goods?
   *
   * @return True if this {@code Unit} is capable of capturing goods.
   */
  canCaptureGoods(): boolean {
    return this.hasAbility$String(Ability.CAPTURE_GOODS);
  }
  /**
   * Checks if this is a trading {@code Unit}, meaning that it
   * can trade with settlements.
   *
   * @return True if this is a trading unit.
   */
  isTradingUnit(): boolean {
    return this.canCarryGoods() && this.owner.isEuropean();
  }
  /**
   * Checks if this {@code Unit} is a `colonist'.  A unit is a
   * colonist if it is European and can build a new {@code Colony}.
   *
   * @return True if this unit is a colonist.
   */
  isColonist(): boolean {
    return this.type.hasAbility$String(Ability.FOUND_COLONY) && this.owner.hasAbility$String(Ability.FOUNDS_COLONIES);
  }
  /**
   * Checks if this {@code Unit} is able to carry {@link Locatable}s.
   *
   * @return True if this unit can carry goods or other units.
   */
  isCarrier(): boolean {
    return this.type.canCarryGoods() || this.type.canCarryUnits();
  }
  /**
   * Checks if this unit is a person, that is not a ship or wagon.
   *
   * @return True if this unit is a person.
   */
  isPerson(): boolean {
    return (this.type == null) ? false : this.type.hasAbility$String(Ability.PERSON);
  }
  /**
   * Gets the state of this {@code Unit}.
   *
   * @return The state of this {@code Unit}.
   */
  getState(): Unit$UnitState {
    return this.state;
  }
  /**
   * Checks if a {@code Unit} can get the given state set.
   *
   * @param s The new state for this Unit.  Should be one of
   *     {UnitState.ACTIVE, FORTIFIED, ...}.
   * @return True if the {@code Unit} state can be changed to
   *     the new value.
   */
  checkSetState(s: Unit$UnitState): boolean {
    if (this.getState() === s) {
      return false;
    }
    switch (s) {
      case Unit$UnitState.ACTIVE:
        return true;
      case Unit$UnitState.FORTIFIED:
        return this.getState() === Unit$UnitState.FORTIFYING;
      case Unit$UnitState.FORTIFYING:
        return this.getMovesLeft() > 0;
      case Unit$UnitState.IMPROVING:
        return this.getMovesLeft() > 0 && this.isOnTile() && this.getOwner().canAcquireForImprovement(this.getLocation().getTile$());
      case Unit$UnitState.IN_COLONY:
        return !this.isNaval();
      case Unit$UnitState.SENTRY:
        return true;
      case Unit$UnitState.SKIPPED:
        return this.getState() === Unit$UnitState.ACTIVE;
      default:
        Unit.logger.warning('Invalid unit state: ' + $J.str(s));
        return false;
    }
  }
  /**
   * Sets a new state for this unit and initializes the amount of
   * work the unit has left.
   *
   * If the work needs turns to be completed (for instance when
   * plowing), then the moves the unit has still left will be used
   * up. Some work (basically building a road with a hardy pioneer)
   * might actually be finished already in this method-call, in
   * which case the state is set back to UnitState.ACTIVE.
   *
   * @param s The new state for this Unit.  Should be one of
   *     {UnitState.ACTIVE, UnitState.FORTIFIED, ...}.
   */
  setState(s: Unit$UnitState): void {
    if (this.state === s) {
      return;
    } else if (!this.checkSetState(s)) {
      throw new IllegalStateException('Illegal UnitState transition: ' + $J.str(this.state) + ' -> ' + $J.str(s));
    } else {
      this.setStateUnchecked(s);
    }
  }
  /**
   * Actually set the unit state.
   *
   * @param s The new {@code UnitState}.
   */
  setStateUnchecked(s: Unit$UnitState): void {
    switch (this.state) {
      case Unit$UnitState.IMPROVING:
        if (this.workImprovement != null && this.getWorkLeft() > 0) {
          let tile: Tile;
          if (!this.workImprovement.isComplete() && (tile = this.workImprovement.getTile$()) != null && tile.getTileItemContainer() != null && (CollectionUtils.none$Stream$Predicate(tile.getUnits(), (u) => u !== this && u.getState() === Unit$UnitState.IMPROVING && u.getWorkImprovement() === this.workImprovement))) {
            this.workImprovement.getTile$().getTileItemContainer().removeTileItem(this.workImprovement);
          }
          this.setWorkImprovement(null);
        }
        break;
      default:
        break;
    }
    switch (s) {
      case Unit$UnitState.ACTIVE:
      case Unit$UnitState.FORTIFYING:
      case Unit$UnitState.SENTRY:
        this.setWorkLeft(-1);
        break;
      case Unit$UnitState.FORTIFIED:
        this.setWorkLeft(-1);
        this.movesLeft = 0;
        break;
      case Unit$UnitState.IMPROVING:
        if (this.workImprovement == null) {
          this.setWorkLeft(-1);
        } else {
          this.setWorkLeft((this.workImprovement.getTurnsToComplete() + ((this.getMovesLeft() > 0) ? 0 : 1)) | 0);
        }
        this.movesLeft = 0;
        break;
      case Unit$UnitState.SKIPPED:
        break;
      default:
        this.setWorkLeft(-1);
    }
    this.state = s;
  }
  /**
   * Sets the given state to all the units that are carried.
   *
   * @param state The {@code UnitState} to set..
   */
  setStateToAllChildren(state: Unit$UnitState): void {
    if (this.canCarryUnits()) {
      for (const $it2 = this.getUnitList().iterator(); $it2.hasNext(); ) {
        let u = $it2.next();
        u.setState(state);
      }
    }
  }
  /**
   * Change the owner of this unit.
   *
   * -vis: This routine calls setOwner() and thus has visibility
   * implications.  Ideally it should be in ServerUnit but we keep
   * it here for the benefit of the test suite.
   *
   * @param owner The new owner {@code Player}.
   */
  changeOwner(owner: Player): void {
    let oldOwner = this.owner;
    if (oldOwner === owner) {
      return;
    }
    if (oldOwner == null) {
      Unit.logger.warning('Unit ' + this.getId() + ' had no owner, when changing owner to ' + owner.getId());
    }
    this.getGame().notifyOwnerChanged(this, oldOwner, owner);
    this.setOwner(owner);
    for (const $it3 = this.getUnitList().iterator(); $it3.hasNext(); ) {
      let u = $it3.next();
      u.changeOwner(owner);
    }
    if (this.getTeacher() != null && !this.canBeStudent(this.getTeacher())) {
      this.getTeacher().setStudent(null);
      this.setTeacher(null);
    }
    if (this.getTradeRoute() != null) {
      this.setTradeRoute(null);
    }
    if (this.getDestination() != null) {
      this.setDestination(null);
    }
    this.changeHomeIndianSettlement(null);
    if (oldOwner != null) {
      oldOwner.removeUnit(this);
    }
    if (owner != null) {
      owner.addUnit(this);
    }
  }
  /**
   * Gets the unit role.
   *
   * @return The {@code Role} of this {@code Unit}.
   */
  getRole(): Role {
    return this.role;
  }
  /**
   * Sets the {@code Role} of this {@code Unit}.
   *
   * @param role The new {@code Role}.
   */
  setRole(role: Role): void {
    this.role = role;
  }
  /**
   * Get the role count.
   *
   * @return The current role count.
   */
  getRoleCount(): number {
    return this.roleCount;
  }
  /**
   * Set the role count.
   *
   * @param roleCount The new role count.
   */
  setRoleCount(roleCount: number): void {
    this.roleCount = roleCount;
  }
  /**
   * Does this unit have the default role?
   *
   * @return True if the unit has the default {@code Role}.
   */
  hasDefaultRole(): boolean {
    return this.role.isDefaultRole();
  }
  /**
   * Get the last part of the role identifier, which is often used as
   * part of a message key.
   *
   * @return The role suffix.
   */
  getRoleSuffix(): string {
    return Role.getRoleIdSuffix(this.role.getId());
  }
  /**
   * Change the current role of this unit.
   *
   * @param role The new {@code Role}.
   * @param roleCount The new role count.
   */
  changeRole(role: Role, roleCount: number): void {
    if (!role.isCompatibleWith(this.getRole())) {
      this.setExperience(0);
    }
    this.setRole(role);
    this.setRoleCount((role.isDefaultRole()) ? 0 : roleCount);
  }
  /**
   * Change the current role count.  On zero, revert to default role.
   *
   * @param delta The change to apply to the role count.
   * @return True if the role count reached zero.
   */
  changeRoleCount(delta: number): boolean {
    this.roleCount = Math.max(0, (this.roleCount + delta) | 0);
    if (this.roleCount !== 0) {
      return false;
    }
    this.role = this.getSpecification().getDefaultRole();
    return true;
  }
  /**
   * Is a role available to this unit?
   *
   * @param role The {@code Role} to test.
   * @return True if the role is available to this unit.
   */
  roleIsAvailable(role: Role): boolean {
    return role.isAvailableTo([this]);
  }
  /**
   * Filter a list of roles to return only those available to this unit.
   *
   * @param roles The list of {@code Role}s to filter, if null all
   *     available roles are used.
   * @return A list of available {@code Role}s.
   */
  getAvailableRolesList(roles: List<Role>): List<Role> {
    if (roles == null) {
      roles = this.getSpecification().getRolesList();
    }
    return CollectionUtils.transform$Collection$Predicate(roles, (r) => this.roleIsAvailable(r));
  }
  /**
   * Filter a list of roles to return only those available to this unit,
   * returning a stream.
   *
   * @param roles The list of {@code Role}s to filter, if null all
   *     available roles are used.
   * @return A stream of available {@code Role}s.
   */
  getAvailableRoles(roles: List<Role>): Stream<Role> {
    return this.getAvailableRolesList(roles).stream();
  }
  /**
   * Get a military role for this unit.
   *
   * @return A military {@code Role}, or null if none found.
   */
  getMilitaryRole(): Role {
    let bestMilitaryRole = this.getSpecification().getMilitaryRoles().filter((r) => this.roleIsAvailable(r) && !r.hasAbility$String(Ability.SPEAK_WITH_CHIEF)).sorted((a, b) => $J.dcmp(b.getOffence(), a.getOffence())).findFirst().orElse(null);
    return bestMilitaryRole;
  }
  /**
   * Gets the military roles for this unit that is not a scout.
   *
   * @return A sorted list of military roles for this unit, with
   *      the best roles first.
   */
  getSortedMilitaryRoles(): List<Role> {
    return this.getSpecification().getMilitaryRoles().filter((r) => this.roleIsAvailable(r) && !r.hasAbility$String(Ability.SPEAK_WITH_CHIEF)).sorted((a, b) => $J.dcmp(b.getOffence(), a.getOffence())).collect(Collectors.toList());
  }
  /**
   * Get the change in goods required to change to a new role/count.
   *
   * @param role The new {@code Role} to change to.
   * @param roleCount The new role count.
   * @return A list of {@code AbstractGoods} defining the change
   *     in goods required.
   */
  getGoodsDifference(role: Role, roleCount: number): List<AbstractGoods> {
    return Role.getGoodsDifference(this.getRole(), this.getRoleCount(), role, roleCount);
  }
  /**
   * Sets the units location without updating any other variables
   *
   * get/setLocation are in Locatable interface.
   *
   * -vis: This routine changes player visibility.
   *
   * @param newLocation The new {@code Location}.
   */
  setLocationNoUpdate(newLocation: Location): void {
    this.location_ = newLocation;
  }
  /**
   * Verifies if the unit is aboard a carrier
   *
   * @return True if the unit is aboard a carrier.
   */
  isOnCarrier(): boolean {
    return this.getLocation() instanceof Unit;
  }
  /**
   * Is this unit on a tile?
   *
   * @return True if the unit is on a tile.
   */
  isOnTile(): boolean {
    return this.getLocation() instanceof Tile;
  }
  /**
   * Gets the carrier this unit is aboard if any.
   *
   * @return The carrier this unit is aboard, or null if none.
   */
  getCarrier(): Unit {
    return (this.isOnCarrier()) ? (this.getLocation()) : null;
  }
  /**
   * Checks whether this {@code Unit} is at sea off the map, or
   * on board of a carrier that is.
   *
   * @return True if at sea.
   */
  isAtSea(): boolean {
    return (this.isOnCarrier()) ? this.getCarrier().isAtSea() : this.getLocation() instanceof HighSeas;
  }
  /**
   * Checks if this unit is running a mission.
   *
   * @return True if this unit is running a mission.
   */
  isInMission(): boolean {
    return this.hasAbility$String(Ability.ESTABLISH_MISSION) && this.getLocation() instanceof IndianSettlement;
  }
  /**
   * Checks whether this unit is working inside a colony.
   *
   * @return True if in colony.
   */
  isInColony(): boolean {
    return this.getLocation() instanceof WorkLocation;
  }
  /**
   * Is this unit on a tile?
   *
   * @return True if this unit is on a tile.
   */
  hasTile(): boolean {
    return this.getTile$() != null;
  }
  /**
   * Gets the work location this unit is working in.
   *
   * @return The current {@code WorkLocation}, or null if none.
   */
  getWorkLocation(): WorkLocation {
    return (this.isInColony()) ? this.getLocation() : null;
  }
  /**
   * Get the work tile this unit is working in, if any.
   *
   * @return The current work {@code Tile}, if any.
   */
  getWorkTile(): Tile {
    return (this.getLocation() instanceof WorkLocation) ? (this.getLocation()).getWorkTile() : null;
  }
  /**
   * Gets the entry location for this unit to use when returning from
   * {@link Europe}.
   *
   * @return The entry {@code Location}.
   */
  getEntryLocation(): Location {
    return this.entryLocation;
  }
  /**
   * Sets the entry location in which this unit will be put when
   * returning from {@link Europe}.
   *
   * @param entryLocation The new entry {@code Location}.
   * @see #getEntryLocation
   */
  setEntryLocation(entryLocation: Location): void {
    this.entryLocation = entryLocation;
    if (this.entryLocation != null) {
      let tile = this.entryLocation.getTile$();
      if (tile != null) {
        this.owner.setEntryTile(tile);
      }
    }
  }
  /**
   * Gets the entry tile for this unit, or if null the default
   * entry location for the owning player.
   *
   * @return The entry {@code Tile}.
   */
  getFullEntryLocation(): Tile {
    return (this.entryLocation != null) ? this.entryLocation.getTile$() : this.owner.getEntryTile();
  }
  /**
   * Get the moves left this turn.
   *
   * @return The number of moves this {@code Unit} has left.
   */
  getMovesLeft(): number {
    return this.movesLeft;
  }
  /**
   * Get a carried unit by identifier.
   *
   * @param id The identifier of the carried unit.
   * @return The {@code Unit} found, or null if not present.
   */
  getCarriedUnitById(id: string): Unit {
    if (id == null) {
      return null;
    }
    for (const $it4 = this.getUnitList().iterator(); $it4.hasNext(); ) {
      let u = $it4.next();
      if ($J.equals(id, u.getId())) {
        return u;
      }
    }
    return null;
  }
  /**
   * Sets the moves left this turn.
   *
   * @param moves The new amount of moves left this {@code Unit}
   *     should have.
   */
  setMovesLeft(moves: number): void {
    this.movesLeft = (moves < 0) ? 0 : moves;
  }
  /**
   * Gets the type of goods this unit is producing in its current occupation.
   *
   * @return The type of goods this unit is producing.
   */
  getWorkType(): GoodsType {
    return this.workType;
  }
  /**
   * Set the type of goods this unit is producing in its current
   * occupation.
   *
   * @param type The {@code GoodsType} to produce.
   */
  setWorkType(type$: GoodsType): void {
    this.workType = type$;
  }
  /**
   * Change the type of goods this unit is producing in its current
   * occupation.  Updates the work location production and the unit
   * experience type if necessary.
   *
   * @param type The {@code GoodsType} to produce.
   */
  changeWorkType(type$: GoodsType): void {
    this.setWorkType(type$);
    let wl = this.getWorkLocation();
    if (wl != null) {
      wl.updateProductionType();
    }
  }
  /**
   * Gets the type of goods this unit has accrued experience producing.
   *
   * @return The {@code GoodsType} this unit would produce.
   */
  getExperienceType(): GoodsType {
    return this.experienceType;
  }
  /**
   * Sets the type of goods this unit has accrued experience producing.
   *
   * @param type The {@code GoodsType} this unit would produce.
   */
  changeExperienceType(type$: GoodsType): void {
    if (this.experienceType !== type$) {
      this.experience = 0;
      this.experienceType = type$;
    }
  }
  /**
   * Gets the experience of this {@code Unit} at its current
   * experienceType.
   *
   * @return The experience of this {@code Unit} at its current
   *     experienceType.
   * @see #modifyExperience
   */
  getExperience(): number {
    return this.experience;
  }
  /**
   * Sets the experience of this {@code Unit} at its current
   * experienceType.
   *
   * @param experience The new experience of this {@code Unit}
   *     at its current experienceType.
   * @see #modifyExperience
   */
  setExperience(experience: number): void {
    this.experience = Math.min(experience, this.getType().getMaximumExperience());
  }
  /**
   * Modifies the experience of this {@code Unit} at its current
   * experienceType.
   *
   * @param value The value by which to modify the experience of this
   *     {@code Unit}.
   * @see #getExperience
   */
  modifyExperience(value: number): void {
    this.experience = (this.experience + value) | 0;
  }
  /**
   * Gets the amount of work left.
   *
   * @return The amount of work left.
   */
  getWorkLeft(): number {
    return this.workLeft;
  }
  /**
   * Sets the amount of work left.
   *
   * @param workLeft The new amount of work left.
   */
  setWorkLeft(workLeft: number): void {
    this.workLeft = workLeft;
  }
  /**
   * Get the number of turns of work left.
   *
   * @return The number of turns of work left.
   */
  getWorkTurnsLeft(): number {
    return (this.state === Unit$UnitState.IMPROVING && this.type.hasAbility$String(Ability.EXPERT_PIONEER)) ? $J.idiv(((this.getWorkLeft() + 1) | 0), 2) : this.getWorkLeft();
  }
  /**
   * Gets the TileImprovement that this pioneer is contributing to.
   *
   * @return The {@code TileImprovement} the pioneer is working on.
   */
  getWorkImprovement(): TileImprovement {
    return this.workImprovement;
  }
  /**
   * Sets the TileImprovement that this pioneer is contributing to.
   *
   * @param imp The new {@code TileImprovement} the pioneer is to
   *     work on.
   */
  setWorkImprovement(imp: TileImprovement): void {
    this.workImprovement = imp;
  }
  /**
   * Get the unit being taught.
   *
   * @return A student {@code Unit} if any.
   */
  getStudent(): Unit {
    return this.student;
  }
  /**
   * Set the student unit.
   *
   * @param newStudent The new student {@code Unit}.
   */
  setStudent(newStudent: Unit): void {
    let oldStudent = this.student;
    if (oldStudent === newStudent) {
      return;
    }
    if (newStudent == null) {
      this.student = null;
      if (oldStudent != null && oldStudent.getTeacher() === this) {
        oldStudent.setTeacher(null);
      }
    } else if (newStudent.getColony() != null && newStudent.getColony() === this.getColony() && newStudent.canBeStudent(this)) {
      if (oldStudent != null && oldStudent.getTeacher() === this) {
        oldStudent.setTeacher(null);
      }
      this.student = newStudent;
      newStudent.setTeacher(this);
    } else {
      throw new IllegalStateException('Unit can not be student: ' + $J.str(newStudent));
    }
  }
  /**
   * Get the unit teaching this one.
   *
   * @return A teacher {@code Unit}.
   */
  getTeacher(): Unit {
    return this.teacher;
  }
  /**
   * Set the teacher for this unit.
   *
   * @param newTeacher The new teacher {@code Unit}.
   */
  setTeacher(newTeacher: Unit): void {
    let oldTeacher = this.teacher;
    if (newTeacher === oldTeacher) {
      return;
    }
    if (newTeacher == null) {
      this.teacher = null;
      if (oldTeacher != null && oldTeacher.getStudent() === this) {
        oldTeacher.setStudent(null);
      }
    } else {
      let skillTaught = newTeacher.getType().getSkillTaught();
      if (newTeacher.getColony() != null && newTeacher.getColony() === this.getColony() && this.getColony().canTrain$UnitType(skillTaught)) {
        if (oldTeacher != null && oldTeacher.getStudent() === this) {
          oldTeacher.setStudent(null);
        }
        this.teacher = newTeacher;
        this.teacher.setStudent(this);
      } else {
        throw new IllegalStateException('Unit can not be teacher: ' + $J.str(newTeacher));
      }
    }
  }
  /**
   * Gets the number of turns this unit has been training.
   *
   * @return The number of turns of training this {@code Unit} has
   *     given.
   * @see #setTurnsOfTraining
   * @see #getNeededTurnsOfTraining
   */
  getTurnsOfTraining(): number {
    return this.turnsOfTraining;
  }
  /**
   * Sets the number of turns this unit has been training.
   *
   * @param turnsOfTraining The number of turns of training this
   *     {@code Unit} has given.
   * @see #getNeededTurnsOfTraining
   */
  setTurnsOfTraining(turnsOfTraining: number): void {
    this.turnsOfTraining = turnsOfTraining;
  }
  /**
   * Gets the number of turns this unit has to train to educate a student.
   * This value is only meaningful for units that can be put in a school.
   *
   * @return The turns of training needed to teach its current type
   *     to a free colonist or to promote an indentured servant or a
   *     petty criminal.
   * @see #getTurnsOfTraining
   */
  getNeededTurnsOfTraining(): number {
    let result = 0;
    if (this.student != null) {
      result = this.getSpecification().getNeededTurnsOfTraining(this.getType(), this.student.getType());
      if (this.getColony() != null) {
        result = (result - this.getColony().getProductionBonus()) | 0;
      }
    }
    return result;
  }
  /**
   * Get a unit change for this unit.
   *
   * @param change The identifier for the required change type.
   * @return The {@code UnitChange} found, or null if the
   *     change is impossible.
   */
  getUnitChange$String(change: string): UnitTypeChange {
    return this.getUnitChange$String$UnitType(change, null);
  }
  /**
   * Get a unit change for this unit.
   *
   * @param change The identifier for the required change type.
   * @param toType A {@code UnitType} to change to.
   * @return The {@code UnitChange} found, or null if the
   *     change is impossible.
   */
  getUnitChange$String$UnitType(change: string, toType: UnitType): UnitTypeChange {
    let uct = this.getSpecification().getUnitChangeType(change);
    if (uct != null && uct.getOwnerChange()) {
      throw new RuntimeException('2-arg getUnitChange of ' + $J.str(this) + ' change=' + change + ' which changes owner');
    }
    return this.getUnitChange$String$UnitType$Player(change, toType, this.getOwner());
  }
  /**
   * Get a unit change for this unit, including the ownership check.
   *
   * @param change The identifier for the required change type.
   * @param toType A {@code UnitType} to change to.
   * @param player The expected {@code Player} that will own the unit.
   * @return The {@code UnitChange} found, or null if the
   *     change is impossible.
   */
  getUnitChange$String$UnitType$Player(change: string, toType: UnitType, player: Player): UnitTypeChange {
    if (player == null) {
      throw new RuntimeException('getUnitChange null player: ' + change);
    }
    let uct = this.getSpecification().getUnitChangeType(change);
    if (uct != null && uct.getOwnerChange() !== (player !== this.getOwner())) {
      throw new RuntimeException('getUnitChange of ' + $J.str(this) + ' change=' + change + ' getOwnerChange=' + uct.getOwnerChange() + ' != player-change=' + (player !== this.getOwner()) + ' player=' + player.getSuffix$() + ' owner=' + this.getOwner().getSuffix$());
    }
    let uc = (uct == null || !uct.appliesTo(this)) ? null : uct.getUnitChange(this.getType(), toType);
    return (uc == null || !uc.isAvailableTo(player) || !uc.appliesTo(this)) ? null : uc;
  }
  /**
   * Get the skill another unit type can teach this unit.
   *
   * Public for the test suite.
   *
   * @param teacherType The {@code UnitType} to teach this unit.
   * @return The {@code UnitType} (skill) this unit can learn.
   */
  getTeachingType$UnitType(teacherType: UnitType): UnitType {
    let ret = (this.getSpecification().getUnitChangeType(UnitChangeType.EDUCATION).appliesTo(this)) ? this.getType().getTeachingType(teacherType) : null;
    return (ret == null || !ret.isAvailableTo([this.getOwner()])) ? null : ret;
  }
  /**
   * Get the skill another unit can teach this unit.
   *
   * @param teacher The {@code Unit} to teach this unit.
   * @return The {@code UnitType} (skill) this unit can learn.
   */
  getTeachingType$Unit(teacher: Unit): UnitType {
    return this.getTeachingType$UnitType(teacher.getType());
  }
  /**
   * Can this unit be a student of a teacher unit?
   *
   * @param teacher The teacher {@code Unit} which is trying to
   *     teach it.
   * @return True if the unit can be taught by the teacher.
   */
  canBeStudent(teacher: Unit): boolean {
    return teacher != null && teacher !== this && this.getTeachingType$Unit(teacher) != null;
  }
  /**
   * Gets the nationality of this Unit.
   *
   * Nationality represents a Unit's personal allegiance to a
   * nation.  This may conflict with who currently issues orders to
   * the Unit (the owner).
   *
   * @return The nationality of this Unit.
   */
  getNationality(): string {
    return this.nationality;
  }
  /**
   * Sets the nationality of this Unit.  A unit will change
   * nationality when it switches owners willingly.  Currently only
   * Converts do this, but it opens the possibility of
   * naturalisation.
   *
   * @param newNationality The new nationality of this Unit.
   */
  setNationality(newNationality: string): void {
    this.nationality = newNationality;
  }
  /**
   * Gets the ethnicity of this Unit.
   *
   * Ethnicity is inherited from the inhabitants of the place where
   * the Unit was born.  Allows former converts to become
   * native-looking colonists.
   *
   * @return The ethnicity of this Unit.
   */
  getEthnicity(): string {
    return this.ethnicity;
  }
  /**
   * Sets the ethnicity of this Unit.
   *
   * @param newEthnicity The new ethnicity of this Unit.
   */
  setEthnicity(newEthnicity: string): void {
    this.ethnicity = newEthnicity;
  }
  /**
   * Identifies whether this unit came from a native tribe.
   *
   * @return Whether this unit looks native or not.
   */
  hasNativeEthnicity(): boolean {
    try {
      return this.getGame().getSpecification().getNation(this.ethnicity).getType().isIndian();
    } catch ($e5) {
      if ($J.isa($e5, Exception)) {
        let e = $J.exc($e5);
        return false;
      } else {
        throw $e5;
      }
    }
  }
  /**
   * Gets the {@code IndianSettlement} home for this unit.
   *
   * @return The home {@code IndianSettlement} of this unit.
   */
  getHomeIndianSettlement(): IndianSettlement {
    return this.indianSettlement;
  }
  /**
   * Sets the home {@code IndianSettlement} for this unit.
   *
   * @param indianSettlement The {@code IndianSettlement} that this unit
   *     considers to be its home.
   */
  setHomeIndianSettlement(indianSettlement: IndianSettlement): void {
    this.indianSettlement = indianSettlement;
  }
  /**
   * Changes the home {@code IndianSettlement} for this unit.
   *
   * @param indianSettlement The {@code IndianSettlement} that should
   *     now own this {@code Unit} and be considered this unit's home.
   * @return The old {@code IndianSettlement}.
   */
  changeHomeIndianSettlement(indianSettlement: IndianSettlement): IndianSettlement {
    if (this.indianSettlement != null) {
      this.indianSettlement.removeOwnedUnit(this);
    }
    let ret = this.indianSettlement;
    this.indianSettlement = indianSettlement;
    if (indianSettlement != null) {
      indianSettlement.addOwnedUnit(this);
    }
    return ret;
  }
  /**
   * Gets the unit hit points.
   *
   * This is currently only used for damaged ships, but might get an
   * extended use later.
   *
   * @return The hit points this {@code Unit} has.
   * @see UnitType#getHitPoints
   */
  getHitPoints(): number {
    return this.hitPoints;
  }
  /**
   * Gets the maximum hitspoints for the unit.
   *
   * @return The hit points this {@code Unit} has at full health.
   * @see UnitType#getHitPoints
   */
  getMaximumHitPoints(): number {
    return this.type.getHitPoints();
  }
  /**
   * Sets the hit points for this unit.
   *
   * @param hitPoints The new hit points for this unit.
   */
  setHitPoints(hitPoints: number): void {
    this.hitPoints = hitPoints;
  }
  /**
   * Checks if this unit is under repair.
   *
   * @return True if under repair.
   */
  isDamagedAndUnderForcedRepair(): boolean {
    return this.isDamaged() && !this.getSpecification().hasAbility(Ability.HITPOINTS_COMBAT_MODEL);
  }
  isDamaged(): boolean {
    return this.hitPoints < this.getMaximumHitPoints();
  }
  /**
   * Get how many turns left to be repaired
   *
   * @return The number of turns left to be repaired.
   */
  getTurnsForRepair(): number {
    return (this.getMaximumHitPoints() - this.getHitPoints()) | 0;
  }
  /**
   * Get the destination of this unit.
   *
   * @return The destination {@code Location} of this {@code Unit}.
   */
  getDestination(): Location {
    return this.destination;
  }
  /**
   * Sets the destination of this unit.
   *
   * @param newDestination The new destination {@code Location}.
   */
  setDestination(newDestination: Location): void {
    this.destination = newDestination;
  }
  /**
   * Get the unit trade route, if any.
   *
   * @return The {@code TradeRoute}, or null if none.
   */
  getTradeRoute(): TradeRoute {
    return this.tradeRoute;
  }
  /**
   * Set the unit trade route.
   *
   * @param newTradeRoute The new {@code TradeRoute} value.
   */
  setTradeRoute(newTradeRoute: TradeRoute): void {
    this.tradeRoute = newTradeRoute;
  }
  /**
   * Get the stop the unit is heading for or at.
   *
   * @return The target {@code TradeRouteStop}.
   */
  getStop(): TradeRouteStop {
    return (this.validateCurrentStop() < 0) ? null : this.getTradeRoute().getStop(this.currentStop);
  }
  /**
   * Get the stop the unit is heading for or at.
   *
   * @return The target {@code TradeRouteStop}.
   */
  getCurrentStops(): List<TradeRouteStop> {
    if (this.validateCurrentStop() < 0) {
      return null;
    }
    let stops = this.getTradeRoute().getStopList();
    CollectionUtils.rotate(stops, this.currentStop);
    return stops;
  }
  /**
   * Get the current trade route stop.
   *
   * @return The current stop index.
   */
  getCurrentStop(): number {
    return this.currentStop;
  }
  /**
   * Set the current stop.
   *
   * @param currentStop A new value for the currentStop.
   */
  setCurrentStop(currentStop: number): void {
    this.currentStop = currentStop;
  }
  /**
   * Validate and return the current stop.
   *
   * @return The current stop index, or negative on failure.
   */
  validateCurrentStop(): number {
    if (this.tradeRoute == null) {
      this.currentStop = -1;
    } else {
      let stopCount = this.tradeRoute.getStopCount();
      if (stopCount <= 0) {
        this.currentStop = -1;
      } else if (this.currentStop < 0 || this.currentStop >= stopCount) {
        this.currentStop = 0;
      }
    }
    return this.currentStop;
  }
  /**
   * Convenience function to check if a unit is at a stop.
   *
   * @param stop The {@code TradeRouteStop} to check.
   * @return True if the unit is at the given stop.
   */
  atStop(stop: TradeRouteStop): boolean {
    return Map_.isSameLocation(this.getLocation(), stop.getLocation());
  }
  /**
   * Get the current trade location.
   *
   * @return The {@code TradeLocation} for this unit.
   */
  getTradeLocation(): TradeLocation {
    let colony: Colony;
    let is$: IndianSettlement;
    return ((colony = this.getColony()) != null) ? colony : ((is$ = this.getIndianSettlement()) != null) ? is$ : (this.isInEurope()) ? this.getOwner().getEurope() : null;
  }
  /**
   * Get the current amount of treasure in this unit.
   *
   * @return The amount of treasure.
   * @exception IllegalStateException if this is not a treasure
   *     carrying unit.
   */
  getTreasureAmount(): number {
    return this.treasureAmount;
  }
  /**
   * Set the amount of treasure in this unit.
   *
   * @param amount The new amount of treasure.
   */
  setTreasureAmount(amount: number): void {
    this.treasureAmount = amount;
  }
  /**
   * Gets the attrition of this unit.
   *
   * @return The attrition of this unit.
   */
  getAttrition(): number {
    return this.attrition;
  }
  /**
   * Sets the attrition of this unit.
   *
   * @param attrition The new attrition of this unit.
   */
  setAttrition(attrition: number): void {
    this.attrition = attrition;
  }
  /**
   * Get the visible amount of goods that is carried by this unit.
   *
   * @return The visible amount of goods carried by this {@code Unit}.
   */
  getVisibleGoodsCount(): number {
    return (this.visibleGoodsCount >= 0) ? this.visibleGoodsCount : this.getGoodsSpaceTaken();
  }
  /**
   * Gets a role that can be equipped automatically assumed
   * in case of an attack.
   *
   * Paul Revere makes an unarmed colonist in a settlement pick up a
   * stock-piled musket if attacked, so the bonus should be applied
   * for unarmed colonists inside colonies where there are muskets
   * available.  Natives can also auto-arm.
   *
   * @return A {@code Role} that can be automatically assumed
   *     by this unit, or null if none.
   */
  getAutomaticRole(): Role {
    if (!this.hasDefaultRole()) {
      return null;
    }
    let settlement = (this.isInColony()) ? this.getColony() : (this.getLocation() instanceof IndianSettlement) ? this.getLocation() : null;
    if (settlement == null) {
      return null;
    }
    let spec = this.getSpecification();
    return CollectionUtils.find$Collection$Predicate(CollectionUtils.transform$Stream$Predicate$Function(CollectionUtils.flatten$Stream$Function(this.getAbilities$String(Ability.AUTOMATIC_EQUIPMENT), ($p0) => $p0.getScopes()), CollectionUtils.alwaysTrue(), (s) => spec.getRole(s.getType())), (r) => r != null && settlement.containsGoods(this.getGoodsDifference(r, 1)));
  }
  /**
   * After winning a battle, can this unit capture the loser's role
   * equipment?
   *
   * @param role The loser unit {@code Role}.
   * @return The {@code Role} available to this unit as a result
   *     of capturing the loser equipment.
   */
  canCaptureEquipment(role: Role): Role {
    if (!this.hasAbility$String(Ability.CAPTURE_EQUIPMENT)) {
      return null;
    }
    let spec = this.getSpecification();
    let oldRole = this.getRole();
    return CollectionUtils.find$Stream$Predicate(this.getAvailableRoles(spec.getMilitaryRolesList()), (r) => CollectionUtils.any$Collection$Predicate(r.getRoleChanges(), (rc) => rc.getFrom(spec) === oldRole && rc.getCapture(spec) === role));
  }
  /**
   * Does losing a piece of equipment mean the death of this unit?
   *
   * @return True if the unit is doomed.
   */
  losingEquipmentKillsUnit(): boolean {
    return this.hasAbility$String(Ability.DISPOSE_ON_ALL_EQUIPMENT_LOST) && this.getRole().getDowngrade() == null;
  }
  /**
   * Does losing equipment mean the demotion of this unit?
   *
   * @return True if the unit is to be demoted.
   */
  losingEquipmentDemotesUnit(): boolean {
    return this.hasAbility$String(Ability.DEMOTE_ON_ALL_EQUIPMENT_LOST) && this.getRole().getDowngrade() == null;
  }
  /**
   * Does the unit have arms?
   *
   * @return True if the unit has arms.
   */
  isArmed(): boolean {
    return this.hasAbility$String(Ability.ARMED);
  }
  /**
   * Does the unit have a mount?
   *
   * @return True if the unit have a mount.
   */
  isMounted(): boolean {
    return this.hasAbility$String(Ability.MOUNTED);
  }
  /**
   * Is the unit a beached ship?
   *
   * @return True if the unit is a beached ship.
   */
  isBeached$(): boolean {
    return this.isBeached$Tile(this.getTile$());
  }
  /**
   * Would this unit be beached if it was on a particular tile?
   *
   * @param tile The {@code Tile} to check.
   * @return True if the unit is a beached ship.
   */
  isBeached$Tile(tile: Tile): boolean {
    return tile != null && tile.isLand() && !tile.hasSettlement() && this.isNaval();
  }
  /**
   * Checks if this is an defensive unit. That is: a unit which can
   * be used to defend a {@code Settlement}.
   *
   * Note! As this method is used by the AI it really means that the
   * unit can defend as is. To be specific an unarmed colonist is
   * not defensive yet, even if Paul Revere and stockpiled muskets
   * are available. That check is only performed on an actual
   * attack.
   *
   * A settlement is lost when there are no more defensive units.
   *
   * @return True if this is a defensive unit meaning it can be used
   *     to defend a {@code Colony}.  This would normally mean
   *     that a defensive unit also will be offensive.
   */
  isDefensiveUnit(): boolean {
    return (this.type.isDefensive() || this.getRole().isDefensive()) && !this.isCarrier();
  }
  /**
   * Checks if this is an offensive unit.  That is, one that can
   * attack other units.
   *
   * @return True if this is an offensive unit.
   */
  isOffensiveUnit(): boolean {
    return this.type.isOffensive() || this.getRole().isOffensive();
  }
  /**
   * Can this unit ambush another?
   *
   * @param defender The defending {@code Unit}.
   * @return True if an ambush attack is possible.
   */
  canAmbush(defender: Unit): boolean {
    return this.isOnTile() && this.getSettlement() == null && defender.isOnTile() && defender.getSettlement() == null && defender.getState() !== Unit$UnitState.FORTIFIED && (this.hasAbility$String(Ability.AMBUSH_BONUS) || defender.hasAbility$String(Ability.AMBUSH_PENALTY)) && (this.getTile$().hasAbility$String(Ability.AMBUSH_TERRAIN) || defender.getTile$().hasAbility$String(Ability.AMBUSH_TERRAIN));
  }
  /**
   * Is an alternate unit a better defender than the current choice.
   * Prefer if there is no current defender, or if the alternate
   * unit is better armed, or provides greater defensive power and
   * does not replace a defensive unit defender with a non-defensive
   * unit.
   *
   * @param defender The current defender {@code Unit}.
   * @param defenderPower Its defence power.
   * @param other An alternate {@code Unit}.
   * @param otherPower Its defence power.
   * @return True if the other unit should be preferred.
   */
  static betterDefender(defender: Unit, defenderPower: number, other: Unit, otherPower: number): boolean {
    if (defender == null) {
      return true;
    } else if (defender.isPerson() && other.isPerson() && !defender.isArmed() && other.isArmed()) {
      return true;
    } else if (defender.isPerson() && other.isPerson() && defender.isArmed() && !other.isArmed()) {
      return false;
    } else if (!defender.isDefensiveUnit() && other.isDefensiveUnit()) {
      return true;
    } else if (defender.isDefensiveUnit() && !other.isDefensiveUnit()) {
      return false;
    } else {
      return defenderPower < otherPower;
    }
  }
  /**
   * Finds the closest {@code Location} to this tile where
   * this ship can be repaired, excluding the current colony.
   *
   * @return The closest {@code Location} where a ship can be
   *     repaired.
   */
  getRepairLocation(): Location {
    let player = this.getOwner();
    let notHere = this.getTile$().getColony();
    let repairPred = (c) => c !== notHere && c.hasAbility$String(Ability.REPAIR_UNITS);
    let loc = this.getClosestColony$List(CollectionUtils.transform$Stream$Predicate(player.getColonies(), repairPred));
    return (loc != null) ? loc : player.getEurope();
  }
  /**
   * Damage this unit (which should be a ship).
   *
   * @param repair A {@code Location} to send the ship to for repair.
   */
  damageShip(repair: Location): void {
    this.setHitPoints(1);
    this.setDestination(null);
    this.setLocation(repair);
    this.setState(Unit$UnitState.ACTIVE);
    this.setMovesLeft(0);
  }
  /**
   * Gets the cost of moving this {@code Unit} onto the given
   * {@code Tile}. A call to {@link #getMoveType(Tile)} will return
   * {@code MOVE_NO_MOVES}, if  returns a move cost
   * larger than the {@link #getMovesLeft moves left}.
   *
   * @param target The {@code Tile} this {@code Unit} will move
   *            onto.
   * @return The cost of moving this unit onto the given {@code Tile}.
   */
  getMoveCost$Tile(target: Tile): number {
    return this.getMoveCost$Tile$Tile$int(this.getTile$(), target, this.getMovesLeft());
  }
  /**
   * Gets the cost of moving this {@code Unit} from the given
   * {@code Tile} onto the given {@code Tile}. A call to
   * {@link #getMoveType(Tile, Tile, int)} will return
   * {@code MOVE_NO_MOVES}, if {@link #getMoveCost} returns a move cost
   * larger than the {@link #getMovesLeft} moves left.
   *
   * @param from The {@code Tile} this {@code Unit} will
   *     move from.
   * @param target The {@code Tile} this {@code Unit} will
   *     move onto.
   * @param ml The amount of moves this Unit has left.
   * @return The cost of moving this unit onto the given {@code Tile}.
   */
  getMoveCost$Tile$Tile$int(from: Tile, target: Tile, ml: number): number {
    let cost = target.getType().getBasicMoveCost();
    if (target.isLand() && !this.isNaval()) {
      let container = target.getTileItemContainer();
      if (container != null) {
        cost = container.getMoveCost(from, target, cost);
      }
    }
    if (this.isBeached$Tile(from)) {
      cost = ml;
    } else if (cost > ml) {
      if ((((ml + 2) | 0) >= this.getInitialMovesLeft() || cost <= ((ml + 2) | 0) || target.hasSettlement()) && ml !== 0) {
        cost = ml;
      }
    }
    return cost;
  }
  /**
   * Gets the type of a move made in a specified direction.
   *
   * @param direction The {@code Direction} of the move.
   * @return The move type.
   */
  getMoveType$Direction(direction: Direction): Unit$MoveType {
    let target: Tile;
    return (!this.hasTile()) ? Unit$MoveType.MOVE_NO_TILE : ((target = this.getTile$().getNeighbourOrNull(direction)) == null) ? Unit$MoveType.MOVE_ILLEGAL : this.getMoveType$Tile(target);
  }
  /**
   * Gets the type of a move that is made when moving from one tile
   * to another.
   *
   * @param target The target {@code Tile} of the move.
   * @return The move type.
   */
  getMoveType$Tile(target: Tile): Unit$MoveType {
    return (!this.hasTile()) ? Unit$MoveType.MOVE_NO_TILE : this.getMoveType$Tile$Tile$int(this.getTile$(), target, this.getMovesLeft());
  }
  /**
   * Gets the type of a move that is made when moving from one tile
   * to another.
   *
   * @param from The origin {@code Tile} of the move.
   * @param target The target {@code Tile} of the move.
   * @param ml The amount of moves this unit has left.
   * @return The move type.
   */
  getMoveType$Tile$Tile$int(from: Tile, target: Tile, ml: number): Unit$MoveType {
    let move = this.getSimpleMoveType$Tile$Tile(from, target);
    if (move.isLegal()) {
      switch (move) {
        case Unit$MoveType.ATTACK_UNIT:
        case Unit$MoveType.ATTACK_SETTLEMENT:
          if (ml <= 0) {
            move = Unit$MoveType.MOVE_NO_MOVES;
          }
          break;
        default:
          if (ml <= 0 || (from != null && this.getMoveCost$Tile$Tile$int(from, target, ml) > ml)) {
            move = Unit$MoveType.MOVE_NO_MOVES;
          }
          break;
      }
    }
    return move;
  }
  /**
   * Gets the type of a move that is made when moving from one tile
   * to another, without checking if the unit has moves left or
   * logging errors.
   *
   * @param from The origin {@code Tile} of the move.
   * @param target The target {@code Tile} of the move.
   * @return The move type, which will be one of the extended illegal move
   *         types on failure.
   */
  getSimpleMoveType$Tile$Tile(from: Tile, target: Tile): Unit$MoveType {
    return (this.isNaval()) ? this.getNavalMoveType(from, target) : this.getLandMoveType(from, target);
  }
  /**
   * Gets the type of a move that is made when moving from one tile
   * to another, without checking if the unit has moves left or
   * logging errors.
   *
   * @param target The target {@code Tile} of the move.
   * @return The move type, which will be one of the extended illegal move
   *         types on failure.
   */
  getSimpleMoveType$Tile(target: Tile): Unit$MoveType {
    return (!this.hasTile()) ? Unit$MoveType.MOVE_NO_TILE : this.getSimpleMoveType$Tile$Tile(this.getTile$(), target);
  }
  /**
   * Gets the type of a move made in a specified direction,
   * without checking if the unit has moves left or logging errors.
   *
   * @param direction The direction of the move.
   * @return The move type.
   */
  getSimpleMoveType$Direction(direction: Direction): Unit$MoveType {
    let target: Tile;
    return (!this.hasTile()) ? Unit$MoveType.MOVE_NO_TILE : ((target = this.getTile$().getNeighbourOrNull(direction)) == null) ? Unit$MoveType.MOVE_ILLEGAL : this.getSimpleMoveType$Tile$Tile(this.getTile$(), target);
  }
  /**
   * Gets the type of a move that is made when moving a naval unit
   * from one tile to another.
   *
   * @param from The origin {@code Tile} of the move.
   * @param target The target {@code Tile} of the move.
   * @return The move type.
   */
  getNavalMoveType(from: Tile, target: Tile): Unit$MoveType {
    if (target == null) {
      return (this.getOwner().canMoveToEurope()) ? Unit$MoveType.MOVE_HIGH_SEAS : Unit$MoveType.MOVE_NO_EUROPE;
    } else if (this.isDamagedAndUnderForcedRepair()) {
      return Unit$MoveType.MOVE_NO_REPAIR;
    }
    if (target.isLand()) {
      let settlement = target.getSettlement();
      if (settlement == null) {
        return Unit$MoveType.MOVE_NO_ACCESS_LAND;
      } else if (settlement.getOwner() === this.getOwner()) {
        return Unit$MoveType.MOVE;
      } else if (this.isTradingUnit()) {
        return this.getTradeMoveType(settlement);
      } else {
        return Unit$MoveType.MOVE_NO_ACCESS_SETTLEMENT;
      }
    } else {
      let defender = target.getFirstUnit();
      if (defender != null && !this.getOwner().owns(defender)) {
        return (this.isOffensiveUnit()) ? Unit$MoveType.ATTACK_UNIT : Unit$MoveType.MOVE_NO_ATTACK_CIVILIAN;
      } else {
        return (target.isDirectlyHighSeasConnected()) ? Unit$MoveType.MOVE_HIGH_SEAS : Unit$MoveType.MOVE;
      }
    }
  }
  /**
   * Gets the type of a move that is made when moving a land unit to
   * from one tile to another.
   *
   * @param from The origin {@code Tile} of the move.
   * @param target The target {@code Tile} of the move.
   * @return The move type.
   */
  getLandMoveType(from: Tile, target: Tile): Unit$MoveType {
    if (target == null) {
      return Unit$MoveType.MOVE_ILLEGAL;
    }
    let owner = this.getOwner();
    let defender = target.getFirstUnit();
    if (target.isLand()) {
      let settlement = target.getSettlement();
      if (settlement == null) {
        if (defender != null && owner !== defender.getOwner()) {
          if (defender.isNaval()) {
            return Unit$MoveType.ATTACK_UNIT;
          } else if (!this.isOffensiveUnit()) {
            return Unit$MoveType.MOVE_NO_ATTACK_CIVILIAN;
          } else {
            return (this.allowMoveFrom(from)) ? Unit$MoveType.ATTACK_UNIT : Unit$MoveType.MOVE_NO_ATTACK_MARINE;
          }
        } else if (target.hasLostCityRumour() && owner.isEuropean()) {
          return Unit$MoveType.EXPLORE_LOST_CITY_RUMOUR;
        } else {
          return Unit$MoveType.MOVE;
        }
      } else if (owner === settlement.getOwner()) {
        return Unit$MoveType.MOVE;
      } else if (this.isTradingUnit()) {
        return this.getTradeMoveType(settlement);
      } else if (this.isColonist()) {
        if (settlement instanceof Colony && this.hasAbility$String(Ability.NEGOTIATE)) {
          return (this.allowMoveFrom(from)) ? Unit$MoveType.ENTER_FOREIGN_COLONY_WITH_SCOUT : Unit$MoveType.MOVE_NO_ACCESS_WATER;
        } else if (settlement instanceof IndianSettlement && this.hasAbility$String(Ability.SPEAK_WITH_CHIEF)) {
          let is$ = settlement;
          if (!from.isLand() && is$.getContactLevel(owner) === IndianSettlement$ContactLevel.UNCONTACTED) {
            return Unit$MoveType.MOVE_NO_ACCESS_CONTACT;
          }
          return (this.allowMoveFrom(from)) ? Unit$MoveType.ENTER_INDIAN_SETTLEMENT_WITH_SCOUT : Unit$MoveType.MOVE_NO_ACCESS_WATER;
        } else if (this.isOffensiveUnit()) {
          return (this.allowMoveFrom(from)) ? Unit$MoveType.ATTACK_SETTLEMENT : Unit$MoveType.MOVE_NO_ATTACK_MARINE;
        } else if (this.hasAbility$String(Ability.ESTABLISH_MISSION)) {
          return this.getMissionaryMoveType(from, settlement);
        } else {
          return this.getLearnMoveType(from, settlement);
        }
      } else if (this.isOffensiveUnit()) {
        return (this.allowMoveFrom(from)) ? Unit$MoveType.ATTACK_SETTLEMENT : Unit$MoveType.MOVE_NO_ATTACK_MARINE;
      } else {
        return Unit$MoveType.MOVE_NO_ACCESS_SETTLEMENT;
      }
    } else {
      return (defender == null || !this.getOwner().owns(defender)) ? Unit$MoveType.MOVE_NO_ACCESS_EMBARK : (CollectionUtils.any$Stream$Predicate(target.getUnits(), (u) => u.canAdd(this))) ? Unit$MoveType.EMBARK : Unit$MoveType.MOVE_NO_ACCESS_FULL;
    }
  }
  /**
   * Get the {@code MoveType} when moving a trading unit to a
   * settlement.
   *
   * @param settlement The {@code Settlement} to move to.
   * @return The appropriate {@code MoveType}.
   */
  getTradeMoveType(settlement: Settlement): Unit$MoveType {
    let owner = this.getOwner();
    if (settlement instanceof Colony) {
      return (owner.atWarWith(settlement.getOwner())) ? Unit$MoveType.MOVE_NO_ACCESS_WAR : (!this.hasAbility$String(Ability.TRADE_WITH_FOREIGN_COLONIES)) ? Unit$MoveType.MOVE_NO_ACCESS_TRADE : Unit$MoveType.ENTER_SETTLEMENT_WITH_CARRIER_AND_GOODS;
    } else if (settlement instanceof IndianSettlement) {
      return (!this.allowContact(settlement) || (this.isNaval() && (settlement).getContactLevel(owner) === IndianSettlement$ContactLevel.UNCONTACTED)) ? Unit$MoveType.MOVE_NO_ACCESS_CONTACT : (this.hasGoodsCargo() || this.getSpecification().getBoolean(GameOptions.EMPTY_TRADERS)) ? Unit$MoveType.ENTER_SETTLEMENT_WITH_CARRIER_AND_GOODS : Unit$MoveType.MOVE_NO_ACCESS_GOODS;
    } else {
      return Unit$MoveType.MOVE_ILLEGAL;
    }
  }
  /**
   * Get the {@code MoveType} when moving a colonist to a settlement.
   *
   * @param from The {@code Tile} to move from.
   * @param settlement The {@code Settlement} to move to.
   * @return The appropriate {@code MoveType}.
   */
  getLearnMoveType(from: Tile, settlement: Settlement): Unit$MoveType {
    if (settlement instanceof Colony) {
      return Unit$MoveType.MOVE_NO_ACCESS_SETTLEMENT;
    } else if (settlement instanceof IndianSettlement) {
      return (!this.allowContact(settlement)) ? Unit$MoveType.MOVE_NO_ACCESS_CONTACT : (!this.allowMoveFrom(from)) ? Unit$MoveType.MOVE_NO_ACCESS_WATER : (this.getUnitChange$String(UnitChangeType.NATIVES) == null) ? Unit$MoveType.MOVE_NO_ACCESS_SKILL : Unit$MoveType.ENTER_INDIAN_SETTLEMENT_WITH_FREE_COLONIST;
    } else {
      return Unit$MoveType.MOVE_ILLEGAL;
    }
  }
  /**
   * Get the {@code MoveType} when moving a missionary to a settlement.
   *
   * @param from The {@code Tile} to move from.
   * @param settlement The {@code Settlement} to move to.
   * @return The appropriate {@code MoveType}.
   */
  getMissionaryMoveType(from: Tile, settlement: Settlement): Unit$MoveType {
    if (settlement instanceof Colony) {
      return Unit$MoveType.MOVE_NO_ACCESS_SETTLEMENT;
    } else if (settlement instanceof IndianSettlement) {
      return (!this.allowContact(settlement)) ? Unit$MoveType.MOVE_NO_ACCESS_CONTACT : (!this.allowMoveFrom(from)) ? Unit$MoveType.MOVE_NO_ACCESS_WATER : (settlement.getOwner().missionsBanned(this.getOwner())) ? Unit$MoveType.MOVE_NO_ACCESS_MISSION_BAN : Unit$MoveType.ENTER_INDIAN_SETTLEMENT_WITH_MISSIONARY;
    } else {
      return Unit$MoveType.MOVE_ILLEGAL;
    }
  }
  /**
   * Is this unit allowed to move from a source tile?
   * Implements the restrictions on moving from water.
   *
   * @param from The {@code Tile} to consider.
   * @return True if the move is allowed.
   */
  allowMoveFrom(from: Tile): boolean {
    return from.isLand() || (!this.getOwner().isREF() && this.getSpecification().getBoolean(GameOptions.AMPHIBIOUS_MOVES));
  }
  /**
   * Is this unit allowed to contact a settlement?
   *
   * @param settlement The {@code Settlement} to consider.
   * @return True if the contact is allowed.
   */
  allowContact(settlement: Settlement): boolean {
    return this.getOwner().hasContacted(settlement.getOwner());
  }
  /**
   * Does a basic check whether a unit can ever expect to move to a tile.
   *
   * @param tile The code {@code Tile} to check.
   * @return True if some sort of legal move to the tile exists, including
   *     special cases where there is an interaction but the unit does not
   *     actually move, such as trade.
   */
  isTileAccessible(tile: Tile): boolean {
    return (this.isNaval()) ? (!tile.isLand() || (tile.hasSettlement() && this.getOwner().owns(tile.getSettlement()))) : tile.isLand();
  }
  /**
   * Gets the amount of moves this unit has at the beginning of each turn.
   *
   * @return The amount of moves this unit has at the beginning of
   *     each turn.
   */
  getInitialMovesLeft(): number {
    let turn = this.getGame().getTurn();
    return $J.d2i(this.apply$float$Turn$String$FreeColSpecObjectType(Math.fround(this.type.getMovement()), turn, Modifier.MOVEMENT_BONUS, this.type));
  }
  /**
   * Make a label showing the unit moves left.
   *
   * @return A movement label.
   */
  getMovesAsString(): string {
    let sb = new StringBuilder(16);
    let quotient = $J.idiv(this.getMovesLeft(), 3);
    let remainder = this.getMovesLeft() % 3;
    if (quotient > 0 || remainder === 0) {
      sb.append(String(quotient));
    }
    if (remainder > 0) {
      sb.append(String.fromCharCode(40 /* '(' */)).append(String(remainder)).append('/3) ');
    }
    sb.append(String.fromCharCode(47 /* \u002f */)).append(String($J.idiv(this.getInitialMovesLeft(), 3)));
    return sb.toString();
  }
  /**
   * Gets the number of turns this unit will need to sail to/from Europe.
   *
   * @return The number of turns to sail to/from Europe.
   */
  getSailTurns(): number {
    let base = Math.fround(this.getSpecification().getInteger(GameOptions.TURNS_TO_SAIL));
    return $J.d2i(this.getOwner().apply$float$Turn$String$FreeColSpecObjectType(base, this.getGame().getTurn(), Modifier.SAIL_HIGH_SEAS, this.type));
  }
  /**
   * Checks if this {@code Unit} can be moved to the high seas
   * from its current location.
   *
   * @return True if this unit can move immediately to the high seas.
   */
  canMoveToHighSeas(): boolean {
    let highSeasMovePred = (t) => t.isDirectlyHighSeasConnected() && this.getMoveType$Tile(t) === Unit$MoveType.MOVE_HIGH_SEAS;
    return (this.isAtSea()) ? true : (this.isInEurope()) ? this.getType().canMoveToHighSeas() : (this.hasTile()) ? (this.getType().canMoveToHighSeas() && this.getOwner().canMoveToEurope() && (this.getTile$().isDirectlyHighSeasConnected() || CollectionUtils.any$Collection$Predicate(this.getTile$().getSurroundingTiles$int$int(1, 1), highSeasMovePred))) : false;
  }
  /**
   * Check if this unit can build a colony.  Does not consider whether
   * the tile where the unit is located is suitable,
   * @see Player#canClaimToFoundSettlement(Tile)
   *
   * @return {@code true} if this unit can build a colony.
   */
  canBuildColony(): boolean {
    let spec = this.getSpecification();
    return this.hasTile() && this.type.canBuildColony() && this.getMovesLeft() > 0 && (!this.getOwner().isRebel() || spec.getBoolean(GameOptions.FOUND_COLONY_DURING_REBELLION));
  }
  /**
   * Is this unit at a specified location?
   *
   * @param loc The {@code Location} to test.
   * @return True if the locations are the same, or on the same tile.
   */
  isAtLocation(loc: Location): boolean {
    let ourLoc = this.getLocation();
    let otherLoc = (loc instanceof Unit) ? (loc).getLocation() : loc;
    if (ourLoc instanceof Unit) {
      ourLoc = (ourLoc).getLocation();
    }
    return Map_.isSameLocation(ourLoc, otherLoc);
  }
  /**
   * Gets the best (closest) entry location for this unit to reach a
   * given tile.
   *
   * @param tile The target {@code Tile}.
   * @return The best entry location tile to arrive on the map at, or null
   *     if none found.
   */
  getBestEntryTile(tile: Tile): Tile {
    return this.getGame().getMap().getBestEntryTile(this, tile, null, null);
  }
  /**
   * Resolves a destination for a unit on the high seas.
   * That is, the location where the unit will appear when it leaves
   * the high seas, which will either be Europe or a tile.
   *
   * @return The location the unit should appear next after leaving
   *      the high seas.
   */
  resolveDestination(): Location {
    if (!this.isAtSea()) {
      throw new RuntimeException('Not at sea: ' + $J.str(this));
    }
    let ret = null;
    let stop = this.getStop();
    let dst = (TradeRoute.isStopValid$Unit$TradeRouteStop(this, stop)) ? stop.getLocation() : this.getDestination();
    if (dst instanceof Europe) {
      return dst;
    }
    ret = (dst != null && dst.getTile$() != null) ? this.getBestEntryTile(dst.getTile$()) : this.getFullEntryLocation();
    if (ret == null) {
      Unit.logger.warning('resolveDestination(' + $J.str(dst) + ') is null for: ' + $J.str(this));
    }
    return ret;
  }
  /**
   * Set movesLeft to 0 if has some spent moves and it's in a colony
   *
   * @see #add(Locatable)
   * @see #remove(Locatable)
   */
  spendAllMoves(): void {
    if (this.getColony() != null && this.getMovesLeft() < this.getInitialMovesLeft()) {
      this.setMovesLeft(0);
    }
  }
  /**
   * Is this unit ready to operate a trade route?
   *
   * @return True if the unit is ready to trade.
   */
  isReadyToTrade(): boolean {
    return !this.isDisposed() && !this.isDamagedAndUnderForcedRepair() && !this.isAtSea() && !this.isOnCarrier() && !this.isInColony() && this.getTradeRoute() != null && this.getState() !== Unit$UnitState.FORTIFYING && this.getState() !== Unit$UnitState.SKIPPED && this.getMovesLeft() > 0;
  }
  /**
   * Basic checks for whether a unit is usable ATM.
   *
   * @return True if the unit might be useful at present.
   */
  readyAndAble(): boolean {
    return !this.isDisposed() && !this.isDamagedAndUnderForcedRepair() && !this.isAtSea() && !this.isOnCarrier() && !this.isInColony() && this.getState() === Unit$UnitState.ACTIVE && this.getMovesLeft() > 0;
  }
  /**
   * Is this unit a suitable `next active unit', that is, the unit
   * needs to be currently movable by the player.
   *
   * Used as a predicate in Player.nextActiveUnitIterator.
   *
   * @return True if this unit could still be moved by the player.
   */
  isCandidateForNextActiveUnit(): boolean {
    return this.couldMove() && !this.isInEurope();
  }
  /**
   * Checks if the unit is currently movable by the player.
   *
   * @return True if this unit could still be moved by the player.
   */
  couldMove(): boolean {
    return this.readyAndAble() && this.getDestination() == null && this.getTradeRoute() == null;
  }
  /**
   * Is this unit a suitable `going-to unit', that is, the unit
   * needs have a valid destination and be able to progress towards it.
   *
   * Used as a predicate in Player.nextGoingToUnitIterator.
   *
   * @return True if this unit can go to its destination.
   */
  goingToDestination(): boolean {
    return this.readyAndAble() && this.getTradeRoute() == null && this.getDestination() != null;
  }
  /**
   * Is this unit available to move along a trade route?
   *
   * Used as a predicate in Player.nextTradeRouteUnitIterator.
   *
   * @return True if this unit can follow a trade route.
   */
  followingTradeRoute(): boolean {
    return this.readyAndAble() && this.getTradeRoute() != null;
  }
  /**
   * Gets a suitable location to start path searches for a unit.
   *
   * Must handle all the cases where the unit is off the map, and
   * take account of the use of a carrier.
   *
   * @return A suitable starting location, or null if none found.
   */
  getPathStartLocation(): Location {
    let carrier = this.getCarrier();
    let ret = this.getTile$();
    if (this.isOnCarrier()) {
      if (ret != null) {
      } else if (carrier.getDestination() == null) {
        ret = null;
      } else if (carrier.getDestination() instanceof Map_) {
        ret = carrier.getFullEntryLocation();
      } else if (carrier.getDestination() instanceof Settlement) {
        ret = carrier.getDestination();
      } else {
        ret = null;
      }
    } else if (this.isNaval()) {
      if (ret != null) {
      } else if (this.getDestination() == null || this.getDestination() instanceof Map_) {
        ret = this.getFullEntryLocation();
      } else if (this.getDestination() instanceof Settlement) {
        ret = this.getDestination();
      } else {
        ret = this.getFullEntryLocation();
      }
    }
    if (ret != null) {
      return ret;
    }
    let owner = this.getOwner();
    let sett = CollectionUtils.minimize$Stream$Comparator(owner.getSettlements(), Unit.settlementStartComparator);
    if (sett == null) {
      sett = CollectionUtils.first$Stream(owner.getSettlements());
    }
    if (sett != null) {
      return sett;
    }
    if (owner.isREF()) {
      return CollectionUtils.minimize$Stream$Comparator(CollectionUtils.flatten$Collection$Function(owner.getRebels(), ($p0) => $p0.getSettlements()), Unit.settlementStartComparator);
    }
    let loc = this.getFullEntryLocation();
    return (loc == null || loc.getTile$() == null) ? null : CollectionUtils.find$Collection$Predicate(loc.getTile$().getSurroundingTiles$int$int(1, Constants.INFINITY), ($p0) => $p0.isLand());
  }
  /**
   * Should the unit use transport to get to a specified tile?
   *
   * True if:
   * - The location is not null
   * - The unit is not naval
   * - The unit is not there already
   * AND
   *   - there is no path OR the path uses an existing carrier
   *
   * @param loc The {@code Location} to go to.
   * @return True if the unit should use transport.
   */
  shouldTakeTransportTo(loc: Location): boolean {
    let path: PathNode;
    return loc != null && !this.isNaval() && !this.isAtLocation(loc) && ((path = this.findPath$Location$Location$Unit(this.getLocation(), loc, this.getCarrier())) == null || path.usesCarrier());
  }
  /**
   * Gets the trivial path for this unit.  That is, the path to the
   * nearest available safe settlement.
   *
   * @return A path to the trivial target, or null if none found.
   */
  getTrivialPath(): PathNode {
    if (this.isDisposed() || this.getLocation() == null) {
      return null;
    }
    if (!this.isNaval()) {
      return this.findOurNearestSettlement$();
    }
    let path = this.findOurNearestPort();
    if (path == null) {
      let tile = this.getTile$();
      if (tile != null && tile.isOnRiver() && tile.isHighSeasConnected()) {
        path = this.search(this.getLocation(), GoalDeciders.getCornerGoalDecider(), CostDeciders.avoidSettlementsAndBlockingUnits(), Constants.INFINITY, null);
        if (path == null && tile.isRiverCorner()) {
          return new PathNode()._PathNode(tile, 0, 0, false, null, null);
        }
      }
    }
    return path;
  }
  /**
   * Get a comparator to rank locations by proximity to a start location,
   * using this unit+optional carrier and cost decider.
   *
   * @param start The starting {@code Location}.
   * @param carrier An optional carrier {@code Unit}.
   * @param costDecider An option {@code CostDecider}.
   * @return A suitable {@code Comparator}.
   */
  getPathComparator(start: Location, carrier: Unit, costDecider: CostDecider): Comparator<Tile> {
    return CollectionUtils.cachingIntComparator((t) => {
      let p = this.findPath$Location$Location$Unit$CostDecider$LogBuilder(start, t, carrier, costDecider, null);
      return (p == null) ? Constants.INFINITY : p.getTotalTurns();
    });
  }
  /**
   * Finds the fastest path from the current location to the
   * specified one.  No carrier is provided, and the default cost
   * decider for this unit is used.
   *
   * @param end The {@code Location} in which the path ends.
   * @return A {@code PathNode} from the current location to the
   *     end location, or null if none found.
   */
  findPath$Location(end: Location): PathNode {
    return this.findPath$Location$Location(this.getLocation(), end);
  }
  /**
   * Finds the fastest path from a given location to a specified
   * one.  No carrier is provided, and the default cost decider for
   * this unit is used.
   *
   * @param start The {@code Location} at which the path starts.
   * @param end The {@code Location} in which the path ends.
   * @return A {@code PathNode} from the current location to the
   *     end location, or null if none found.
   */
  findPath$Location$Location(start: Location, end: Location): PathNode {
    return this.findPath$Location$Location$Unit(start, end, null);
  }
  /**
   * Finds the fastest path from a given location to a specified
   * one, with an optional carrier.  The default cost decider for
   * the relevant unit is used.
   *
   * @param start The {@code Location} at which the path starts.
   * @param end The {@code Location} in which the path ends.
   * @param carrier An optional carrier {@code Unit} to use.
   * @return A {@code PathNode} from the current location to the
   *     end location, or null if none found.
   */
  findPath$Location$Location$Unit(start: Location, end: Location, carrier: Unit): PathNode {
    return this.findPath$Location$Location$Unit$CostDecider$LogBuilder(start, end, carrier, null, null);
  }
  /**
   * Finds a quickest path between specified locations, optionally
   * using a carrier and special purpose cost decider.
   *
   * @param start The {@code Location} to start at.
   * @param end The {@code Location} to end at.
   * @param carrier An optional carrier {@code Unit} to carry the unit.
   * @param costDecider An optional {@code CostDecider} for
   *     determining the movement costs (uses default cost deciders
   *     for the unit/s if not provided).
   * @param lb An optional {@code LogBuilder} to log the path to.
   * @return A {@code PathNode}, or null if no path is found.
   * @exception IllegalArgumentException if the destination is null,
   *     (FIXME) this is a temporary debugging measure.
   */
  findPath$Location$Location$Unit$CostDecider$LogBuilder(start: Location, end: Location, carrier: Unit, costDecider: CostDecider, lb: LogBuilder): PathNode {
    if (end == null) {
      throw new IllegalArgumentException('findPath to null for ' + $J.str(this) + ' from ' + $J.str(start) + ' on ' + $J.str(carrier));
    }
    return this.getGame().getMap().findPath(this, this.realStart(start, carrier), end, carrier, costDecider, lb);
  }
  /**
   * Unified argument tests for full path searches, which then finds
   * the actual starting location for the path.  Deals with special
   * cases like starting on a carrier and/or high seas.
   *
   * @param start The {@code Location} in which the path starts from.
   * @param carrier An optional naval carrier {@code Unit} to use.
   * @return The actual starting location.
   * @throws IllegalArgumentException If there are any argument problems.
   */
  realStart(start: Location, carrier: Unit): Location {
    if (carrier != null && !carrier.canCarryUnits()) {
      throw new IllegalArgumentException('Non-carrier carrier: ' + $J.str(carrier));
    } else if (carrier != null && !carrier.couldCarry$Unit(this)) {
      throw new IllegalArgumentException('Carrier could not carry unit: ' + $J.str(carrier) + '/' + $J.str(this));
    }
    let entry: Location;
    if (start == null) {
      throw new IllegalArgumentException('Null start: ' + $J.str(this));
    } else if (start instanceof Unit) {
      let unitLoc = (start).getLocation();
      if (unitLoc == null) {
        throw new IllegalArgumentException('Null on-carrier start: ' + $J.str(this) + '/' + $J.str(start));
      } else if (unitLoc instanceof HighSeas) {
        if (carrier == null) {
          throw new IllegalArgumentException('Null carrier when starting on high seas: ' + $J.str(this));
        } else if (carrier !== start) {
          throw new IllegalArgumentException('Wrong carrier when starting on high seas: ' + $J.str(this) + '/' + $J.str(carrier) + ' != ' + $J.str(start));
        }
        entry = carrier.resolveDestination();
      } else {
        entry = unitLoc;
      }
    } else if (start instanceof HighSeas) {
      if (this.isOnCarrier()) {
        entry = this.getCarrier().resolveDestination();
      } else if (this.isNaval()) {
        entry = this.resolveDestination();
      } else {
        throw new IllegalArgumentException('No carrier when starting on high seas: ' + $J.str(this) + '/' + $J.str(this.getLocation()));
      }
    } else if (start instanceof Europe || start.getTile$() != null) {
      entry = start;
    } else {
      throw new IllegalArgumentException('Invalid start: ' + $J.str(start));
    }
    return (entry.getTile$() != null) ? entry.getTile$() : entry;
  }
  /**
   * Convenience wrapper for the
   * {@link net.sf.freecol.common.model.Map#search} function.
   *
   * @param start The {@code Location} to start the search from.
   * @param gd The object responsible for determining whether a
   *     given {@code PathNode} is a goal or not.
   * @param cd An optional {@code CostDecider}
   *     responsible for determining the path cost.
   * @param maxTurns The maximum number of turns the given
   *     {@code Unit} is allowed to move. This is the
   *     maximum search range for a goal.
   * @param carrier An optional naval carrier {@code Unit} to use.
   * @return The path to a goal, or null if none can be found.
   */
  search(start: Location, gd: GoalDecider, cd: CostDecider, maxTurns: number, carrier: Unit): PathNode {
    return (start == null) ? null : this.getGame().getMap().search(this, this.realStart(start, carrier), gd, cd, maxTurns, carrier, null);
  }
  /**
   * Finds a quickest path to a neighbouring tile to a specified target
   * tile, optionally using a carrier and special purpose cost decider.
   *
   * @param start The {@code Location} to start at.
   * @param end The {@code Tile} to end at a neighbour of.
   * @param carrier An optional carrier {@code Unit} to carry the unit.
   * @param costDecider An optional {@code CostDecider} for
   *     determining the movement costs (uses default cost deciders
   *     for the unit/s if not provided).
   * @return A {@code PathNode}, or null if no path is found.
   */
  findPathToNeighbour(start: Location, end: Tile, carrier: Unit, costDecider: CostDecider): PathNode {
    let owner = this.getOwner();
    let endPred = (t) => (this.isTileAccessible(t) && (t.getFirstUnit() == null || owner.owns(t.getFirstUnit())));
    let best = CollectionUtils.minimize$Collection$Predicate$Comparator(end.getSurroundingTiles$int$int(1, 1), endPred, this.getPathComparator(start, carrier, costDecider));
    return (best == null) ? null : this.findPath$Location$Location$Unit$CostDecider$LogBuilder(start, best, carrier, costDecider, null);
  }
  /**
   * Gets the number of turns required for this unit to reach a
   * destination location from its current position.  If the unit is
   * currently on a carrier, it will be used.
   *
   * @param end The destination {@code Location}.
   * @return The number of turns it will take to reach the destination,
   *         or {@code MANY_TURNS} if no path can be found.
   */
  getTurnsToReach$Location(end: Location): number {
    return this.getTurnsToReach$Location$Location(this.getLocation(), end);
  }
  /**
   * Gets the number of turns required for this unit to reach a
   * destination location from a starting location.  If the unit is
   * currently on a carrier, it will be used.
   *
   * @param start The {@code Location} to start the search from.
   * @param end The destination {@code Location}.
   * @return The number of turns it will take to reach the {@code end},
   *         or {@code MANY_TURNS} if no path can be found.
   */
  getTurnsToReach$Location$Location(start: Location, end: Location): number {
    return this.getTurnsToReach$Location$Location$Unit$CostDecider(start, end, this.getCarrier(), CostDeciders.avoidSettlementsAndBlockingUnits());
  }
  /**
   * Gets the number of turns required for this unit to reach a
   * destination location from a starting location, using an optional
   * carrier and cost decider.
   *
   * @param start The {@code Location} to start the search from.
   * @param end The destination {@code Location}.
   * @param carrier An optional carrier {@code Unit} to use.
   * @param costDecider An optional {@code CostDecider} to
   *     score the path with.
   * @return The number of turns it will take to reach the {@code end},
   *         or {@code MANY_TURNS} if no path can be found.
   */
  getTurnsToReach$Location$Location$Unit$CostDecider(start: Location, end: Location, carrier: Unit, costDecider: CostDecider): number {
    let path = this.findPath$Location$Location$Unit$CostDecider$LogBuilder(start, end, carrier, costDecider, null);
    return (path == null) ? Unit.MANY_TURNS : path.getTotalTurns();
  }
  /**
   * Get the colony that can be reached by this unit in the least number
   * of turns.
   *
   * @param colonies A list of {@code Colony}s.
   * @return The nearest {@code Colony}, or null if none found.
   */
  getClosestColony$List(colonies: List<Colony>): Colony {
    return this.getClosestColony$Stream(colonies.stream());
  }
  /**
   * Get the colony that can be reached by this unit in the least number
   * of turns.
   *
   * @param colonies A stream of {@code Colony}s.
   * @return The nearest {@code Colony}, or null if none found.
   */
  getClosestColony$Stream(colonies: Stream<Colony>): Colony {
    let comp = CollectionUtils.cachingIntComparator((col) => (col == null) ? (Unit.MANY_TURNS - 1) | 0 : this.getTurnsToReach$Location(col));
    return CollectionUtils.minimize$Stream$Comparator(CollectionUtils.concat(Stream.of(null), [colonies]), comp);
  }
  /**
   * Find a path for this unit to the nearest settlement with the
   * same owner that is reachable without a carrier.
   *
   * @param excludeStart If true, ignore any settlement the unit is
   *     currently in.
   * @param range An upper bound on the number of moves.
   * @param coastal If true, the settlement must have a path to Europe.
   * @return The nearest matching settlement if any, otherwise null.
   */
  findOurNearestSettlement$boolean$int$boolean(excludeStart: boolean, range: number, coastal: boolean): PathNode {
    let player = this.getOwner();
    if (!player.hasSettlements() || !this.hasTile()) {
      return null;
    }
    return this.findOurNearestSettlement$Tile$boolean$int$boolean(this.getTile$(), excludeStart, range, coastal);
  }
  /**
   * Find a path for this unit to the nearest settlement with the
   * same owner that is reachable without a carrier.
   *
   * @param startTile The {@code Tile} to start searching from.
   * @param excludeStart If true, ignore any settlement the unit is
   *     currently in.
   * @param range An upper bound on the number of moves.
   * @param coastal If true, the settlement must have a path to Europe.
   * @return The nearest matching settlement if any, otherwise null.
   */
  findOurNearestSettlement$Tile$boolean$int$boolean(startTile: Tile, excludeStart: boolean, range: number, coastal: boolean): PathNode {
    let player = this.getOwner();
    if (startTile == null || !player.hasSettlements()) {
      return null;
    }
    let gd = new Unit$ClosestSettlementGoalDecider()._Unit$ClosestSettlementGoalDecider((excludeStart) ? startTile : null, coastal);
    return this.search(startTile, gd, CostDeciders.avoidIllegal(), range, null);
  }
  /**
   * Find a path for this unit to the nearest settlement with the
   * same owner that is reachable without a carrier.
   *
   * @return A path to the nearest settlement if any, otherwise null.
   */
  findOurNearestSettlement$(): PathNode {
    return this.findOurNearestSettlement$boolean$int$boolean(false, 2147483647, false);
  }
  /**
   * Find a path for this unit to the nearest settlement with the
   * same owner that is reachable without a carrier and is connected to
   * Europe by sea, or Europe if it is closer.
   *
   * @return A path to the nearest settlement if any, otherwise null
   *     (for now including if in Europe or at sea).
   */
  findOurNearestPort(): PathNode {
    let ePath = null;
    let eTurns = -1;
    let europe = this.getOwner().getEurope();
    if (this.getType().canMoveToHighSeas()) {
      ePath = (europe == null) ? null : this.findPath$Location(europe);
      eTurns = (ePath == null) ? -1 : ePath.getTotalTurns();
    }
    let sPath = this.findOurNearestSettlement$boolean$int$boolean(false, Constants.INFINITY, true);
    let sTurns = (sPath == null) ? -1 : sPath.getTotalTurns();
    return (ePath == null) ? sPath : (sPath == null) ? ePath : (sTurns <= eTurns) ? sPath : ePath;
  }
  /**
   * Find a path to a settlement nearer to a destination.
   *
   * Used to find where to deliver goods to/from inland colonies,
   * or when blocked.
   *
   * @param dst The destination {@code Location}.
   * @return A path to the port, or null if none found.
   */
  findIntermediatePort(dst: Location): PathNode {
    let ignoreSrc = this.getSettlement();
    let ignoreDst = dst.getSettlement();
    let srcTile = this.getTile$();
    let dstTile = dst.getTile$();
    let dstCont = (dstTile == null) ? -1 : dstTile.getContiguity();
    let settlementComparator = CollectionUtils.cachingIntComparator((s) => {
      let p = this.findPath$Location(s);
      return (p == null) ? Constants.INFINITY : (p.getTotalTurns() + dstTile.getDistanceTo(s.getTile$())) | 0;
    });
    let type$: Unit$PortMode;
    if (this.isNaval()) {
      if (!srcTile.isHighSeasConnected()) {
        type$ = Unit$PortMode.LAKE;
      } else if (dstTile == null) {
        type$ = Unit$PortMode.NO_HIGH_SEAS;
      } else if (dstTile.isHighSeasConnected()) {
        type$ = (this.getTile$().isOnRiver()) ? Unit$PortMode.NO_HIGH_SEAS : Unit$PortMode.BLOCKED;
      } else {
        type$ = Unit$PortMode.BLOCKED;
      }
    } else {
      if (dstTile == null || this.getTile$().getContiguity() !== dstCont) {
        type$ = (srcTile.isHighSeasConnected()) ? Unit$PortMode.NO_HIGH_SEAS : Unit$PortMode.BLOCKED;
      } else {
        type$ = Unit$PortMode.LAND;
      }
    }
    let path = null;
    let sett: Settlement;
    {
      let portPredicate: Predicate<Settlement>, contiguityPred: Predicate<Settlement>;
      switch (type$) {
        case Unit$PortMode.LAKE:
          break;
        case Unit$PortMode.NO_HIGH_SEAS:
          path = this.search(this.getLocation(), GoalDeciders.getReduceHighSeasCountGoalDecider(this), null, Constants.INFINITY, null);
          break;
        case Unit$PortMode.BLOCKED:
          portPredicate = (s) => s !== ignoreSrc && s !== ignoreDst;
          sett = CollectionUtils.minimize$Collection$Predicate$Comparator(this.getOwner().getConnectedPortList(), portPredicate, settlementComparator);
          path = (sett == null) ? null : this.findPath$Location(sett);
          break;
        case Unit$PortMode.LAND:
          contiguityPred = (s) => s !== ignoreSrc && s !== ignoreDst && s.getTile$().getContiguity() === dstCont;
          sett = CollectionUtils.minimize$Stream$Predicate$Comparator(this.getOwner().getSettlements(), contiguityPred, settlementComparator);
          path = (sett == null) ? null : this.findPath$Location(sett);
          break;
      }
    }
    return (path != null) ? path : this.findOurNearestSettlement$boolean$int$boolean(false, Constants.INFINITY, false);
  }
  /**
   * Find a path for this unit to the nearest settlement with the
   * same owner that is reachable without a carrier, excepting any
   * on the current tile.
   *
   * @return The nearest settlement if any, otherwise null.
   */
  findOurNearestOtherSettlement(): PathNode {
    return this.findOurNearestSettlement$boolean$int$boolean(true, 2147483647, false);
  }
  /**
   * Can this unit attack a specified defender?
   *
   * A naval unit can never attack a land unit or settlement,
   * but a land unit *can* attack a naval unit if it is beached.
   * Otherwise naval units can only fight at sea, land units
   * only on land.
   *
   * @param defender The defending {@code Unit}.
   * @return True if this unit can attack.
   */
  canAttack(defender: Unit): boolean {
    if (defender == null || !defender.hasTile() || !this.isOffensiveUnit()) {
      return false;
    }
    let tile = defender.getTile$();
    return (this.isNaval()) ? !tile.hasSettlement() && defender.isNaval() : !defender.isNaval() || defender.isBeached$();
  }
  /**
   * Searches for a unit that is a credible threatening unit to this
   * unit within a range.
   *
   * @param range The number of turns to search for a threat in.
   * @param threat The maximum tolerable probability of a potentially
   *            threatening unit defeating this unit in combat.
   * @return A path to the threat, or null if not found.
   */
  searchForDanger(range: number, threat: number): PathNode {
    let cm = this.getGame().getCombatModel();
    let start = this.getTile$();
    let threatDecider = new (Unit$1())().$o(this).$c(cm, threat, start, range).$init_anon();
    let reverseRange = $J.idiv(Math.imul(range, (((this.isNaval()) ? this.getSpecification().getFastestNavalUnitType() : this.getSpecification().getFastestLandUnitType()).getMovement())), this.getType().getMovement());
    return (start == null) ? null : this.search(start, threatDecider, CostDeciders.avoidIllegal(), reverseRange, this.getCarrier());
  }
  /**
   * Checks if there is a credible threatening unit to this unit
   * within a range of moves.
   *
   * @param range The number of turns to search for a threat within.
   * @param threat The maximum tolerable probability of a potentially
   *            threatening unit defeating this unit in combat.
   * @return True if a threat was found.
   */
  isInDanger(range: number, threat: number): boolean {
    return this.searchForDanger(range, threat) != null;
  }
  /**
   * Gets the line of sight of this {@code Unit}.  That is the
   * distance this {@code Unit} can sight new tiles.
   *
   * @return The line of sight of this {@code Unit}.
   */
  getLineOfSight(): number {
    let turn = this.getGame().getTurn();
    return $J.d2i(FreeColObject.applyModifiers$float$Turn$Stream(Math.fround(this.type.getLineOfSight()), turn, Stream.concat(this.getModifiers$String$FreeColSpecObjectType$Turn(Modifier.LINE_OF_SIGHT_BONUS, this.type, turn), ((this.hasTile() && this.getTile$().isExplored()) ? this.getTile$().getType().getModifiers$String$FreeColSpecObjectType$Turn(Modifier.LINE_OF_SIGHT_BONUS, this.type, turn) : Stream.empty()))));
  }
  /**
   * Get the tiles visible to this unit.
   *
   * @return A set of visible {@code Tile}s.
   */
  getVisibleTileSet(): JSet<Tile> {
    let tile = this.getTile$();
    return (tile == null) ? Collections.emptySet() : new HashSet(tile.getSurroundingTiles$int$int(0, this.getLineOfSight()));
  }
  /**
   * Get the goods carried by this unit.
   *
   * @param compact If true create a compact list.
   * @return A list of {@code Goods}.
   */
  getGoodsInternal(compact: boolean): List<Goods> {
    let gc = this.getGoodsContainer();
    if (gc == null) {
      return Collections.emptyList();
    }
    let goods = (compact) ? gc.getCompactGoodsList() : gc.getGoodsList();
    for (const $it6 = goods.iterator(); $it6.hasNext(); ) {
      let g = $it6.next();
      g.setLocation(this);
    }
    return goods;
  }
  /**
   * Get the goods carried by this unit.
   *
   * @return A list of {@code Goods}.
   */
  getGoodsList(): List<Goods> {
    return this.getGoodsInternal(false);
  }
  /**
   * Get a compact version of the goods carried by this unit.
   *
   * @return A compact list of {@code Goods}.
   */
  getCompactGoodsList(): List<Goods> {
    return this.getGoodsInternal(true);
  }
  /**
   * Can this unit carry other units?
   *
   * @return True if the unit can carry units.
   */
  canCarryUnits(): boolean {
    return this.hasAbility$String(Ability.CARRY_UNITS);
  }
  /**
   * Could this unit carry a specified one?
   * This ignores the current load.
   *
   * @param u The potential cargo {@code Unit}.
   * @return True if this unit can carry the cargo.
   */
  couldCarry$Unit(u: Unit): boolean {
    return this.canCarryUnits() && this.getCargoCapacity() >= u.getSpaceTaken();
  }
  /**
   * Can this unit carry goods.
   *
   * @return True if the unit can carry goods.
   */
  canCarryGoods(): boolean {
    return this.hasAbility$String(Ability.CARRY_GOODS);
  }
  /**
   * Could this unit carry some specified goods?
   * This ignores the current load.
   *
   * @param g The potential cargo {@code Goods}.
   * @return True if this unit can carry the cargo.
   */
  couldCarry$Goods(g: Goods): boolean {
    return this.canCarryGoods() && this.getCargoCapacity() >= g.getSpaceTaken();
  }
  /**
   * Gets the number of free cargo slots left on this unit.
   *
   * @return The number of free cargo slots on this unit.
   */
  getSpaceLeft(): number {
    return (this.getCargoCapacity() - this.getCargoSpaceTaken()) | 0;
  }
  /**
   * Is there free space left on this unit?
   *
   * @return True if there is free space.
   */
  hasSpaceLeft(): boolean {
    return this.getSpaceLeft() > 0;
  }
  /**
   * Gets the total space this unit has to carry cargo.
   *
   * @return The total space.
   */
  getCargoCapacity(): number {
    return this.type.getSpace();
  }
  /**
   * Gets the space occupied by goods in this unit.  Must defend
   * against goods container being null as this can be called in the
   * client on foreign units, which will not have goods containers.
   *
   * @return The number cargo slots occupied by goods.
   */
  getGoodsSpaceTaken(): number {
    if (!this.canCarryGoods()) {
      return 0;
    }
    let gc = this.getGoodsContainer();
    return (gc == null) ? 0 : gc.getSpaceTaken();
  }
  /**
   * Gets the space occupied by units in this unit.
   *
   * @return The number of cargo slots occupied by units.
   */
  getUnitSpaceTaken(): number {
    return (this.canCarryUnits()) ? (CollectionUtils.sum$Stream$ToIntFunction(this.getUnits(), ($p0) => $p0.getSpaceTaken())) : 0;
  }
  /**
   * Gets the space occupied by cargo in this unit (both goods and units).
   *
   * @return The number of occupied cargo slots.
   */
  getCargoSpaceTaken(): number {
    return (this.getGoodsSpaceTaken() + this.getUnitSpaceTaken()) | 0;
  }
  /**
   * Is this unit carrying any goods cargo?
   *
   * @return True if the unit is carrying any goods cargo.
   */
  hasGoodsCargo(): boolean {
    return this.getGoodsSpaceTaken() > 0;
  }
  /**
   * Is this unit carrying any cargo (goods or unit).
   *
   * @return True if the unit is carrying any cargo.
   */
  hasCargo(): boolean {
    return this.getCargoSpaceTaken() > 0;
  }
  /**
   * Gets the extra amount of a specified type of goods that could
   * be loaded onto this unit.  Includes empty cargo slots and any
   * spare space in a slot partially filled with the specified
   * goods.
   *
   * @param type The {@code GoodsType} to examine.
   * @return The amount of goods that could be loaded onto this unit.
   */
  getLoadableAmount(type$: GoodsType): number {
    if (!this.canCarryGoods()) {
      return 0;
    }
    let result = Math.imul(this.getSpaceLeft(), GoodsContainer.CARGO_SIZE);
    let count = this.getGoodsCount(type$) % GoodsContainer.CARGO_SIZE;
    if (count !== 0) {
      result = (result + (GoodsContainer.CARGO_SIZE - count)) | 0;
    }
    return result;
  }
  /**
   * Get a label for the current unit occupation.
   *
   * @param player The {@code Player} viewing the unit, as the
   *     owner has access to more information.
   * @param full If true, return a more detailed result.
   * @return A {@code StringTemplate} for the unit occupation.
   */
  getOccupationLabel(player: Player, full: boolean): StringTemplate {
    let tradeRoute = this.getTradeRoute();
    let ret: StringTemplate;
    if (player != null && player.owns(this)) {
      if (this.isDamagedAndUnderForcedRepair()) {
        if (full) {
          ret = StringTemplate.label(':').add$String('model.unit.occupation.underRepair').addName$String(String(this.getTurnsForRepair()));
        } else {
          ret = StringTemplate.key$String('model.unit.occupation.underRepair');
        }
      } else if (tradeRoute != null) {
        if (full) {
          ret = StringTemplate.label(':').add$String('model.unit.occupation.inTradeRoute').addName$String(tradeRoute.getName());
        } else {
          ret = StringTemplate.key$String('model.unit.occupation.inTradeRoute');
        }
      } else if (this.getState() === Unit$UnitState.ACTIVE && this.getMovesLeft() === 0 && !this.isInEurope()) {
        ret = StringTemplate.key$String('model.unit.occupation.activeNoMovesLeft');
      } else if (this.getState() === Unit$UnitState.IMPROVING && this.getWorkImprovement() != null) {
        if (full) {
          ret = StringTemplate.label(':').add$String($J.str(this.getWorkImprovement().getType()) + '.occupationString').addName$String(String(this.getWorkTurnsLeft()));
        } else {
          ret = StringTemplate.key$String($J.str(this.getWorkImprovement().getType()) + '.occupationString');
        }
      } else if (this.getDestination() != null) {
        ret = StringTemplate.key$String('model.unit.occupation.goingSomewhere');
      } else {
        ret = StringTemplate.key$String('model.unit.' + this.getState().getKey());
      }
    } else {
      if (this.isNaval()) {
        ret = StringTemplate.name_(String(this.getVisibleGoodsCount()));
      } else {
        ret = StringTemplate.key$String('model.unit.occupation.activeNoMovesLeft');
      }
    }
    return ret;
  }
  /**
   * Gets the probability that an attack by this unit will provoke a
   * native to convert.
   *
   * @return A probability of conversion.
   */
  getConvertProbability(): number {
    let spec = this.getSpecification();
    let opt = spec.getInteger(GameOptions.NATIVE_CONVERT_PROBABILITY);
    return Math.fround(Math.fround(0.01) * this.apply$float$Turn$String(Math.fround(opt), this.getGame().getTurn(), Modifier.NATIVE_CONVERT_BONUS));
  }
  /**
   * Gets the probability that an attack by this unit will provoke natives
   * to burn our missions.
   *
   * FIXME: enhance burn probability proportionally with tension
   *
   * @return A probability of burning missions.
   */
  getBurnProbability(): number {
    let spec = this.getSpecification();
    return Math.fround(Math.fround(0.01) * spec.getInteger(GameOptions.BURN_PROBABILITY));
  }
  /**
   * Checks if the treasure train can be cashed in at it's current
   * {@code Location}.
   *
   * @return {@code true} if the treasure train can be cashed in.
   * @exception IllegalStateException if this unit is not a treasure train.
   */
  canCashInTreasureTrain$(): boolean {
    return this.canCashInTreasureTrain$Location(this.getLocation());
  }
  /**
   * Checks if the treasure train can be cashed in at the given
   * {@code Location}.
   *
   * @param loc The {@code Location}.
   * @return {@code true} if the treasure train can be cashed in.
   * @exception IllegalStateException if this unit is not a treasure train.
   */
  canCashInTreasureTrain$Location(loc: Location): boolean {
    if (!this.canCarryTreasure()) {
      throw new RuntimeException('Can\'t carry treasure: ' + $J.str(this));
    }
    if (loc == null) {
      return false;
    }
    if (this.getOwner().getEurope() == null) {
      return loc.getColony() != null;
    }
    if (loc.getColony() != null) {
      return loc.getColony().isConnectedPort() && (this.getOwner().getCarriersForUnit(this).isEmpty() || this.getTransportFee() === 0);
    }
    return loc instanceof Europe || (loc instanceof Unit && (loc).isInEurope());
  }
  /**
   * Get the fee that would have to be paid to transport this
   * treasure to Europe.
   *
   * @return The fee required for transport.
   */
  getTransportFee(): number {
    if (!this.isInEurope() && this.getOwner().getEurope() != null) {
      let fee = Math.fround((Math.imul(this.getSpecification().getInteger(GameOptions.TREASURE_TRANSPORT_FEE), this.getTreasureAmount())) / 100);
      return $J.d2i(this.getOwner().apply$float$Turn$String$FreeColSpecObjectType(fee, this.getGame().getTurn(), Modifier.TREASURE_TRANSPORT_FEE, this.type));
    }
    return 0;
  }
  /**
   * Gets the skill level.
   *
   * @return The level of skill for this unit.  A higher value
   *     signals a more advanced type of units.
   */
  getSkillLevel(): number {
    return Unit.getUnitSkillLevel(this.type);
  }
  /**
   * Gets the skill level of the given type of {@code Unit}.
   *
   * @param unitType The type of {@code Unit}.
   * @return The level of skill for the given unit.  A higher value
   *     signals a more advanced type of units.
   */
  static getUnitSkillLevel(unitType: UnitType): number {
    return (unitType.hasSkill()) ? unitType.getSkill() : 0;
  }
  /**
   * Gets the appropriate trade bonuses due to a missionary unit.
   *
   * @param sense The sense to apply the modifiers.
   * @return The missionary trade bonuses.
   */
  getMissionaryTradeModifiers(sense: boolean): JSet<Modifier> {
    let mapper = (m) => {
      let mod = Modifier.makeModifier(m);
      if (!sense) {
        mod.setValue(Math.fround(-m.getValue$()));
      }
      return mod;
    };
    return CollectionUtils.transform$Stream$Predicate$Function$Collector(this.getModifiers$String(Modifier.MISSIONARY_TRADE_BONUS), (m) => m.getValue$() !== Math.fround(0), mapper, Collectors.toSet());
  }
  /**
   * Adds a feature to the Unit.  This method always throws an
   * {@code UnsupportedOperationException}, since features can
   * not be added to Units directly.
   *
   * @param feature The {@code Feature} to add.
   */
  addFeature(feature: Feature): void {
    throw new UnsupportedOperationException('Can not add Feature to Unit directly!');
  }
  /**
   * Gets the {@code ProductionInfo} for this unit.
   *
   * FIXME: the input parameter is ignored! Fix?
   *
   * @param input A list of input {@code AbstractGoods}.
   * @return The {@code ProductionInfo} for this unit.
   */
  getProductionInfo(input: List<AbstractGoods>): ProductionInfo {
    let result = new ProductionInfo()._ProductionInfo();
    result.setConsumption(this.getType().getConsumedGoods());
    result.setMaximumConsumption(this.getType().getConsumedGoods());
    return result;
  }
  /**
   * Score this unit with its suitability for pioneering.
   *
   * A pioneer must be a colonst.  Favour:
   * - existing pioneers especially if on the map
   * - expert pioneer units
   * - then by skill but not other experts
   *
   * @return A pioneering score.
   */
  getPioneerScore(): number {
    let ht = (this.hasTile()) ? 100 : 0;
    return (this.getLocation() == null || !this.isColonist()) ? -1000 : (this.hasAbility$String(Ability.IMPROVE_TERRAIN)) ? (900 + ht) | 0 : (this.hasAbility$String(Ability.EXPERT_PIONEER)) ? 700 : (!this.hasDefaultRole()) ? 0 : (this.getSkillLevel() > 0) ? 0 : (200 + Math.imul(this.getSkillLevel(), 50)) | 0;
  }
  /**
   * Score this unit with its suitability for scouting.
   *
   * A scout must be a colonist.  Favour:
   * - existing scouts especially if on the map
   * - expert scouts
   * - lower skill level as scouting is a good career for crims and servants
   *   which might become seasoned scouts
   *
   * @return A scouting score.
   */
  getScoutScore(): number {
    let ht = (this.hasTile()) ? 100 : 0;
    return (this.getLocation() == null || !this.isColonist()) ? -1000 : (this.hasAbility$String(Ability.SPEAK_WITH_CHIEF)) ? (900 + ht) | 0 : (this.hasAbility$String(Ability.EXPERT_SCOUT)) ? 700 : (!this.hasDefaultRole()) ? 0 : (this.getSkillLevel() <= 0) ? Math.imul(-200, this.getSkillLevel()) : 0;
  }
  /**
   * Evaluate this unit for trade purposes.
   *
   * @param player The {@code Player} to evaluate for.
   * @return A value of this unit.
   */
  evaluateFor(player: Player): number {
    let europe = player.getEurope();
    if (europe == null) {
      return Unit.DEFAULT_UNIT_VALUE;
    }
    let price = europe.getUnitPrice(this.getType());
    return (price === Constants.UNDEFINED) ? Unit.DEFAULT_UNIT_VALUE : price;
  }
  /**
   * Get modifiers required for combat.
   *
   * This can be replaced with just getModifiers() when accepted
   * specifications have all combat modifiers with correct index
   * values.
   *
   * @param id The identifier to get combat modifiers for.
   * @param fcgot An optional {@code FreeColSpecObjectType} the
   *     modifier applies to.
   * @param turn An optional applicable {@code Turn}.
   * @return The set of {@code Modifier}s found.
   */
  getCombatModifiers(id: string, fcgot: FreeColSpecObjectType, turn: Turn): JSet<Modifier> {
    let owner = this.getOwner();
    let unitType = this.getType();
    let result = new HashSet();
    result.addAll(CollectionUtils.transform$Stream$Predicate$Function(unitType.getModifiers$String$FreeColSpecObjectType$Turn(id, fcgot, turn), CollectionUtils.alwaysTrue(), (m) => m.setModifierIndex((m.getType() === Modifier$ModifierType.ADDITIVE) ? Modifier.UNIT_ADDITIVE_COMBAT_INDEX : Modifier.UNIT_NORMAL_COMBAT_INDEX)));
    result.addAll(CollectionUtils.transform$Stream$Predicate$Function(owner.getModifiers$String$FreeColSpecObjectType$Turn(id, fcgot, turn), CollectionUtils.alwaysTrue(), (m) => m.setModifierIndex(Modifier.GENERAL_COMBAT_INDEX)));
    result.addAll(CollectionUtils.transform$Stream$Predicate$Function(this.role.getModifiers$String$FreeColSpecObjectType$Turn(id, fcgot, turn), CollectionUtils.alwaysTrue(), (m) => m.setModifierIndex(Modifier.ROLE_COMBAT_INDEX)));
    return result;
  }
  /**
   * Is this unit a person that is making a given goods type, but not
   * an expert at it.
   *
   * @param work The {@code GoodsType} to check.
   * @return True if this unit is a non-expert worker.
   */
  nonExpertWorker(work: GoodsType): boolean {
    return this.isPerson() && this.getWorkType() === work && this.getType().getExpertProduction() !== work;
  }
  /**
   * Try to swap this unit if it is an expert for another that is
   * doing its job.
   *
   * @param others A list of other {@code Unit}s to test against.
   * @return The unit that was replaced by this expert, or null if none.
   */
  trySwapExpert(others: List<Unit>): Unit {
    let work = this.getType().getExpertProduction();
    if (work == null) {
      return null;
    }
    let other = CollectionUtils.find$Collection$Predicate(others, (u) => u.nonExpertWorker(work));
    if (other != null) {
      this.swapWork(other);
    }
    return other;
  }
  /**
   * Swap work with another unit.
   *
   * @param other The other {@code Unit}.
   */
  swapWork(other: Unit): void {
    let colony = this.getColony();
    let oldRole = this.getRole();
    let oldRoleCount = this.getRoleCount();
    let work = this.getType().getExpertProduction();
    let oldWork = this.getWorkType();
    let l1 = this.getLocation();
    let l2 = other.getLocation();
    other.setLocation(colony.getTile$());
    this.setLocation(l2);
    this.changeWorkType(work);
    other.setLocation(l1);
    if (oldWork != null) {
      other.changeWorkType(oldWork);
    }
    let tmpRole = other.getRole();
    let tmpRoleCount = other.getRoleCount();
    other.changeRole(oldRole, oldRoleCount);
    this.changeRole(tmpRole, tmpRoleCount);
  }
  /**
   * Gets the tile in a given direction.
   *
   * @param directionString The direction.
   * @return The {@code Tile} in the given direction.
   * @throws IllegalStateException if there is trouble.
   */
  getNeighbourTile(directionString: string): Tile {
    if (!this.hasTile()) {
      throw new IllegalStateException('Unit is not on the map: ' + this.getId());
    }
    let direction = $J.enumValueOf($J.cls(Direction), directionString);
    let tile = this.getTile$().getNeighbourOrNull(direction);
    if (tile == null) {
      throw new IllegalStateException('Could not find tile in direction: ' + $J.str(direction) + ' from unit: ' + this.getId());
    }
    return tile;
  }
  /**
   * Get a settlement by identifier, validating as much as possible.
   * Designed for message unpacking where the identifier should not
   * be trusted.
   *
   * @param <T> The {@link Settlement} type.
   * @param settlementId The identifier of the {@code Settlement} to find.
   * @param returnClass The expected returned settlement class.
   * @return The settlement corresponding to the settlementId argument.
   */
  getAdjacentSettlement<T>(settlementId: string, returnClass: JClass<T>): T {
    let game = this.getOwner().getGame();
    let ret = game.getFreeColGameObject$String$Class(settlementId, returnClass);
    if (ret == null) {
      throw new IllegalStateException('Not a settlement: ' + settlementId);
    } else if (ret.getTile$() == null) {
      throw new IllegalStateException('Settlement is not on the map: ' + settlementId);
    } else if (!this.getOwner().hasContacted(ret.getOwner())) {
      throw new IllegalStateException('Player ' + this.getOwner().getId() + ' has not contacted: ' + ret.getOwner().getId());
    }
    if (!this.hasTile()) {
      throw new IllegalStateException('Unit is not on the map: ' + this.getId());
    } else if (this.getTile$().getDistanceTo(ret.getTile$()) > 1) {
      throw new IllegalStateException('Unit ' + this.getId() + ' is not adjacent to settlement: ' + settlementId);
    } else if (this.getOwner() === ret.getOwner()) {
      throw new IllegalStateException('Unit: ' + this.getId() + ' and settlement: ' + settlementId + ' are both owned by player: ' + this.getOwner().getId());
    }
    return ret;
  }
  /**
   * Copy the unit, reduce visibility into any carrier and reference
   * to a settlement.
   *
   * This is used when unit information is attached to an animation.
   * The normal scope rules are inadequate there as the unit *must* be
   * visible, but would normally be invisible if in a settlement or
   * on a carrier.
   *
   * @param tile The {@code Tile} the unit appears at.
   * @param player The {@code Player} the copy is for.
   * @return This {@code Unit} with reduced visibility.
   */
  reduceVisibility(tile: Tile, player: Player): Unit {
    let game = this.getGame();
    let ret = this.copy$Game$Player(game, player);
    if (this.isOnCarrier()) {
      let carrier = this.getCarrier().copy$Game$Player(game, player);
      carrier.removeAll();
      carrier.add(ret);
      carrier.setLocationNoUpdate(tile);
      ret.setLocationNoUpdate(carrier);
    } else {
      ret.setLocationNoUpdate(tile);
      ret.setWorkType(null);
      ret.setState(Unit$UnitState.ACTIVE);
    }
    return ret;
  }
  /**
   * {@inheritDoc}
   */
  getConsumedGoods(): List<AbstractGoods> {
    return this.type.getConsumedGoods();
  }
  /**
   * {@inheritDoc}
   */
  getPriority(): number {
    return this.type.getPriority();
  }
  /**
   * {@inheritDoc}
   */
  getConsumptionModifiers(id: string): Stream<Modifier> {
    return this.getModifiers$String(id);
  }
  /**
   * {@inheritDoc}
   */
  getOwner(): Player {
    return this.owner;
  }
  /**
   * {@inheritDoc}
   *
   * -vis: This routine has visibility implications.
   */
  setOwner(player: Player): void {
    this.owner = player;
  }
  /**
   * Gets the location of this unit.
   *
   * @return The location of this {@code Unit}.
   */
  getLocation(): Location {
    return this.location_;
  }
  /**
   * Sets the location of this unit.
   *
   * -vis: This routine changes player visibility.
   * -til: While units do not contribute to tile appearance as such, if
   *     they move in/out of a colony the visible colony size changes.
   *
   * @param newLocation The {@code Location} where this {@code Unit}
   *      is to be located.
   * @return True if the location change succeeds.
   */
  setLocation(newLocation: Location): boolean {
    if (newLocation instanceof Colony) {
      return (newLocation).joinColony(this);
    }
    if (newLocation === this.location_) {
      return true;
    }
    if (newLocation != null && !newLocation.canAdd(this)) {
      Unit.logger.warning('Can not add ' + $J.str(this) + ' to ' + $J.str(newLocation));
      return false;
    }
    let oldColony = (this.isInColony()) ? this.location_.getColony() : null;
    let newColony = (newLocation instanceof WorkLocation) ? newLocation.getColony() : null;
    let withinColony = newColony != null && newColony === oldColony;
    let preserveEducation = withinColony && ((this.location_).canTeach() === (newLocation).canTeach());
    if (oldColony != null && !preserveEducation) {
      oldColony.updateEducation(this, false);
    }
    if (this.location_ == null) {
    } else if (!this.location_.remove(this)) {
      throw new RuntimeException('Failed to remove ' + $J.str(this) + ' from ' + this.location_.getId());
    }
    if (newLocation == null) {
      this.setLocationNoUpdate(null);
    } else if (!newLocation.add(this)) {
      throw new RuntimeException('Failed to add ' + $J.str(this) + ' to ' + newLocation.getId());
    }
    if (newColony != null && !preserveEducation) {
      newColony.updateEducation(this, true);
    }
    if (!withinColony) {
      if (oldColony != null) {
        oldColony.updatePopulation();
      }
      if (newColony != null) {
        newColony.updatePopulation();
      }
    }
    return true;
  }
  /**
   * Checks if this {@code Unit} is located in Europe.  That
   * is; either directly or onboard a carrier which is in Europe.
   *
   * @return True if in {@code Europe}.
   */
  isInEurope(): boolean {
    return (this.isOnCarrier()) ? this.getCarrier().isInEurope() : this.getLocation() instanceof Europe;
  }
  /**
   * {@inheritDoc}
   */
  getTile$(): Tile {
    return (this.getLocation() != null) ? this.getLocation().getTile$() : null;
  }
  /**
   * {@inheritDoc}
   */
  getLocationLabel(): StringTemplate {
    return StringTemplate.template$String('model.unit.onBoard').addStringTemplate$String$StringTemplate('%unit%', this.getLabel$());
  }
  /**
   * {@inheritDoc}
   */
  add(locatable: Locatable): boolean {
    if (!this.canAdd(locatable)) {
      return false;
    } else if (locatable instanceof Unit) {
      let unit = locatable;
      if (super.add(locatable)) {
        this.spendAllMoves();
        unit.setState(Unit$UnitState.SENTRY);
        return true;
      }
    } else if (locatable instanceof Goods) {
      let goods = locatable;
      if (super.addGoods$AbstractGoods(goods)) {
        this.spendAllMoves();
        return true;
      }
    } else {
      throw new IllegalStateException('Can not be added to unit: ' + $J.str(locatable));
    }
    return false;
  }
  /**
   * {@inheritDoc}
   */
  remove(locatable: Locatable): boolean {
    if (locatable == null) {
      throw new RuntimeException('Locatable must not be null: ' + $J.str(this));
    } else if (locatable instanceof Unit && this.canCarryUnits()) {
      if (super.remove(locatable)) {
        this.spendAllMoves();
        return true;
      }
    } else if (locatable instanceof Goods && this.canCarryGoods()) {
      if (super.removeGoods$AbstractGoods(locatable) != null) {
        this.spendAllMoves();
        return true;
      }
    } else {
      Unit.logger.warning('Tried to remove from unit: ' + $J.str(locatable));
    }
    return false;
  }
  /**
   * {@inheritDoc}
   */
  getSettlement(): Settlement {
    let loc = this.getLocation();
    return (loc != null) ? loc.getSettlement() : null;
  }
  /**
   * {@inheritDoc}
   */
  up(): Location {
    return (this.isInEurope()) ? this.getLocation().up() : (this.isInColony()) ? this.getColony() : (this.hasTile()) ? this.getTile$().up() : this;
  }
  /**
   * {@inheritDoc}
   */
  getRank(): number {
    return Location.rankOf(this.getLocation());
  }
  /**
   * {@inheritDoc}
   */
  toShortString(): string {
    let sb = new StringBuilder(32);
    sb.append(this.getId()).append(String.fromCharCode(45 /* '-' */)).append(this.getType().getSuffix$());
    if (!this.hasDefaultRole()) {
      sb.append(String.fromCharCode(45 /* '-' */)).append(this.getRoleSuffix());
      let count = this.getRoleCount();
      if (count > 1) {
        sb.append(String.fromCharCode(46 /* '.' */)).append(String(count));
      }
    }
    return sb.toString();
  }
  /**
   * {@inheritDoc}
   */
  getSpaceTaken(): number {
    return this.type.getSpaceTaken();
  }
  /**
   * {@inheritDoc}
   */
  getNoAddReason(locatable: Locatable): UnitLocation$NoAddReason {
    if (locatable === this) {
      return UnitLocation$NoAddReason.ALREADY_PRESENT;
    } else if (locatable instanceof Unit) {
      return (!this.canCarryUnits()) ? UnitLocation$NoAddReason.WRONG_TYPE : (locatable.getSpaceTaken() > this.getSpaceLeft()) ? UnitLocation$NoAddReason.CAPACITY_EXCEEDED : super.getNoAddReason(locatable);
    } else if (locatable instanceof Goods) {
      let goods = locatable;
      return (!this.canCarryGoods()) ? UnitLocation$NoAddReason.WRONG_TYPE : (goods.getAmount() > this.getLoadableAmount(goods.getType())) ? UnitLocation$NoAddReason.CAPACITY_EXCEEDED : UnitLocation$NoAddReason.NONE;
    }
    return super.getNoAddReason(locatable);
  }
  /**
   * {@inheritDoc}
   */
  invalidateCache(): void {
  }
  /**
   * {@inheritDoc}
   */
  getGoodsCapacity(): number {
    return this.getCargoCapacity();
  }
  canAttackRanged(tile: Tile): boolean {
    return this.getType().getAttackRange() >= this.getTile$().getDistanceTo(tile) && (tile.getSettlement() != null && tile.getSettlement().getOwner() !== this.getOwner() || tile.getDefendingUnit(this) != null && tile.getDefendingUnit(this).getOwner() !== this.getOwner());
  }
  /**
   * {@inheritDoc}
   *
   * -vis: This routine can change player visibility.
   */
  disposeResources(): void {
    let loc = this.getLocation();
    if (loc != null) {
      loc.remove(this);
    }
    if (this.teacher != null) {
      this.teacher.setStudent(null);
      this.teacher = null;
    }
    if (this.student != null) {
      this.student.setTeacher(null);
      this.student = null;
    }
    this.changeHomeIndianSettlement(null);
    this.getOwner().removeUnit(this);
    super.disposeResources();
  }
  /**
   * {@inheritDoc}
   */
  getLinkTarget(player: Player): FreeColGameObject {
    return (this.hasTile()) ? this.getTile$().up() : player.getEurope();
  }
  /**
   * {@inheritDoc}
   */
  checkIntegrity(fix: boolean, lb: LogBuilder): Constants$IntegrityType {
    let result = super.checkIntegrity(fix, lb);
    if (this.role == null) {
      if (fix) {
        this.role = this.getSpecification().getDefaultRole();
        lb.add(['\n  Missing role set to default for: ', this.getId()]);
        result = result.fix();
      } else {
        lb.add(['\n  Missing role for: ', this.getId()]);
        result = result.fail();
      }
    }
    if (this.destination != null) {
      if (!(this.destination).isInitialized()) {
        if (fix) {
          this.destination = null;
          lb.add(['\n  Uninitialized destination cleared for: ', this.getId()]);
          result = result.fix();
        } else {
          lb.add(['\n  Uninitialized destination for: ', this.getId()]);
          result = result.fail();
        }
      }
    }
    if (this.state === Unit$UnitState.IMPROVING && this.workImprovement == null) {
      if (fix) {
        this.state = Unit$UnitState.ACTIVE;
        lb.add(['\n  Improving unit without improvement made active: ', this.getId()]);
        result = result.fix();
      } else {
        lb.add(['\n  Improving unit without improvement: ', this.getId()]);
        result = result.fail();
      }
    }
    return result;
  }
  /**
   * {@inheritDoc}
   */
  getAbilities$String$FreeColSpecObjectType$Turn(id: string, fcgot: FreeColSpecObjectType, turn: Turn): Stream<Ability> {
    let owner = this.getOwner();
    let unitType = this.getType();
    return CollectionUtils.concat(unitType.getAbilities$String(id), [this.role.getAbilities$String$FreeColSpecObjectType$Turn(id, fcgot, turn), owner.getAbilities$String$FreeColSpecObjectType$Turn(id, fcgot, turn), this.getLocationAbilities(id, turn)]);
  }
  /**
   * Get abilities specific to this location.
   *
   * This is here just to simplify getAbilities().  Perhaps one day
   * it could be wrapped back in, but there is unresolved complexity.
   *
   * FIXME: extend this to all locations?  May simplify code.  Units
   * are also Locations however, which complicates the issue as we
   * do not want Units aboard other Units to share the abilities of
   * the carriers.
   *
   * @param id The identifier to check.
   * @param turn The turn that applies.
   * @return A stream of {@code Ability}s found.
   */
  getLocationAbilities(id: string, turn: Turn): Stream<Ability> {
    let unitType = this.getType();
    let settlement = this.getSettlement();
    if (settlement != null) {
      return settlement.getAbilities$String$FreeColSpecObjectType$Turn(id, unitType, turn);
    }
    if (this.isInEurope()) {
      let europe = this.owner.getEurope();
      if (europe != null) {
        return europe.getAbilities$String$FreeColSpecObjectType$Turn(id, this.getType(), turn);
      }
    }
    return Stream.empty();
  }
  /**
   * {@inheritDoc}
   */
  getModifiers$String$FreeColSpecObjectType$Turn(id: string, fcgot: FreeColSpecObjectType, turn: Turn): Stream<Modifier> {
    let owner = this.getOwner();
    let unitType = this.getType();
    return CollectionUtils.concat(unitType.getModifiers$String$FreeColSpecObjectType$Turn(id, fcgot, turn), [owner.getModifiers$String$FreeColSpecObjectType$Turn(id, fcgot, turn), this.role.getModifiers$String$FreeColSpecObjectType$Turn(id, fcgot, turn)]);
  }
  /**
   * {@inheritDoc}
   */
  getClassIndex(): number {
    return Unit.UNIT_CLASS_INDEX;
  }
  /**
   * {@inheritDoc}
   */
  copyIn<T>(other: T): boolean {
    let o = this.copyInCast(other, $J.cls(Unit));
    if (o == null || !super.copyIn(o)) {
      return false;
    }
    let game = this.getGame();
    this.name = o.getName();
    this.owner = game.updateRef$FreeColGameObject(o.getOwner());
    this.type = o.getType();
    this.state = o.getState();
    this.role = o.getRole();
    this.roleCount = o.getRoleCount();
    this.location_ = game.updateLocationRef(o.getLocation());
    this.entryLocation = game.updateLocationRef(o.getEntryLocation());
    this.movesLeft = o.getMovesLeft();
    this.workType = o.getWorkType();
    this.experienceType = o.getExperienceType();
    this.experience = o.getExperience();
    this.workLeft = o.getWorkLeft();
    this.workImprovement = game.update$FreeColGameObject$boolean(o.getWorkImprovement(), true);
    this.student = game.updateRef$FreeColGameObject(o.getStudent());
    this.teacher = game.updateRef$FreeColGameObject(o.getTeacher());
    this.turnsOfTraining = o.getTurnsOfTraining();
    this.nationality = o.getNationality();
    this.ethnicity = o.getEthnicity();
    this.indianSettlement = game.updateRef$FreeColGameObject(o.getIndianSettlement());
    this.hitPoints = o.getHitPoints();
    this.destination = game.updateLocationRef(o.getDestination());
    this.tradeRoute = game.updateRef$FreeColGameObject(o.getTradeRoute());
    this.currentStop = o.getCurrentStop();
    this.treasureAmount = o.getTreasureAmount();
    this.attrition = o.getAttrition();
    this.visibleGoodsCount = o.getVisibleGoodsCount();
    this.owner.addUnit(this);
    return true;
  }
  /**
   * {@inheritDoc}
   */
  getDisplayObject(): FreeColObject {
    return this.getType();
  }
  /**
   * {@inheritDoc}
   */
  writeAttributes(xw: FreeColXMLWriter): void {
    super.writeAttributes(xw);
    if (this.name != null) {
      xw.writeAttribute(Unit.NAME_TAG, this.name);
    }
    xw.writeAttribute$String$FreeColObject(Unit.UNIT_TYPE_TAG, this.type);
    xw.writeAttribute$String$int(Unit.MOVES_LEFT_TAG, this.movesLeft);
    xw.writeAttribute$String$Enum(Unit.STATE_TAG, this.state);
    xw.writeAttribute$String$FreeColObject(Unit.ROLE_TAG, this.role);
    xw.writeAttribute$String$int(Unit.ROLE_COUNT_TAG, this.roleCount);
    xw.writeAttribute$String$int(Unit.HIT_POINTS_TAG, this.hitPoints);
    if (!xw.validFor(this.getOwner()) && this.isOwnerHidden()) {
      xw.writeAttribute$String$FreeColObject(Unit.OWNER_TAG, this.getGame().getUnknownEnemy());
    } else {
      xw.writeAttribute$String$FreeColObject(Unit.OWNER_TAG, this.getOwner());
      if (this.nationality != null) {
        xw.writeAttribute(Unit.NATIONALITY_TAG, this.nationality);
      }
      if (this.ethnicity != null) {
        xw.writeAttribute(Unit.ETHNICITY_TAG, this.ethnicity);
      }
    }
    if (this.location_ != null) {
      xw.writeLocationAttribute(Unit.LOCATION_TAG, this.location_);
    }
    xw.writeAttribute$String$int(Unit.TREASURE_AMOUNT_TAG, this.treasureAmount);
    if (xw.validFor(this.getOwner())) {
      if (this.entryLocation != null) {
        xw.writeLocationAttribute(Unit.ENTRY_LOCATION_TAG, this.entryLocation);
      }
      xw.writeAttribute$String$int(Unit.TURNS_OF_TRAINING_TAG, this.turnsOfTraining);
      if (this.workType != null) {
        xw.writeAttribute$String$FreeColObject(Unit.WORK_TYPE_TAG, this.workType);
      }
      if (this.experienceType != null) {
        xw.writeAttribute$String$FreeColObject(Unit.EXPERIENCE_TYPE_TAG, this.experienceType);
      }
      xw.writeAttribute$String$int(Unit.EXPERIENCE_TAG, this.experience);
      xw.writeAttribute$String$FreeColObject(Unit.INDIAN_SETTLEMENT_TAG, this.indianSettlement);
      xw.writeAttribute$String$int(Unit.WORK_LEFT_TAG, this.workLeft);
      xw.writeAttribute$String$int(Unit.ATTRITION_TAG, this.attrition);
      if (this.student != null) {
        xw.writeAttribute$String$FreeColObject(Unit.STUDENT_TAG, this.student);
      }
      if (this.teacher != null) {
        xw.writeAttribute$String$FreeColObject(Unit.TEACHER_TAG, this.teacher);
      }
      if (this.destination != null) {
        xw.writeLocationAttribute(Unit.DESTINATION_TAG, this.destination);
      }
      if (this.tradeRoute != null) {
        xw.writeAttribute$String$FreeColObject(Unit.TRADE_ROUTE_TAG, this.tradeRoute);
        xw.writeAttribute$String$int(Unit.CURRENT_STOP_TAG, this.currentStop);
      }
    } else {
      if (this.getType().canCarryGoods()) {
        xw.writeAttribute$String$int(Unit.VISIBLE_GOODS_COUNT_TAG, this.getVisibleGoodsCount());
      }
    }
  }
  /**
   * {@inheritDoc}
   */
  writeChildren(xw: FreeColXMLWriter): void {
    if (xw.validFor(this.getOwner())) {
      super.writeChildren(xw);
      if (this.workImprovement != null) {
        this.workImprovement.toXML$FreeColXMLWriter(xw);
      }
    }
  }
  /**
   * {@inheritDoc}
   */
  readAttributes(xr: FreeColXMLReader): void {
    super.readAttributes(xr);
    let spec = this.getSpecification();
    let game = this.getGame();
    let oldWorkLocation = this.getWorkLocation();
    this.name = xr.getAttribute$String$String(Unit.NAME_TAG, null);
    let oldOwner = this.owner;
    this.owner = xr.findFreeColGameObject(game, Unit.OWNER_TAG, $J.cls(Player), null, true);
    this.type = xr.getType(spec, Unit.UNIT_TYPE_TAG, $J.cls(UnitType), null);
    this.state = xr.getAttribute$String$Class$Enum(Unit.STATE_TAG, $J.cls(Unit$UnitState), Unit$UnitState.ACTIVE);
    this.role = xr.getType(spec, Unit.ROLE_TAG, $J.cls(Role), spec.getDefaultRole());
    this.roleCount = xr.getAttribute$String$int(Unit.ROLE_COUNT_TAG, this.role.getMaximumCount());
    this.setLocationNoUpdate(xr.getLocationAttribute(game, Unit.LOCATION_TAG, true));
    this.entryLocation = xr.getLocationAttribute(game, Unit.ENTRY_LOCATION_TAG, true);
    this.movesLeft = xr.getAttribute$String$int(Unit.MOVES_LEFT_TAG, 0);
    this.workLeft = xr.getAttribute$String$int(Unit.WORK_LEFT_TAG, 0);
    this.attrition = xr.getAttribute$String$int(Unit.ATTRITION_TAG, 0);
    this.nationality = xr.getAttribute$String$String(Unit.NATIONALITY_TAG, null);
    this.ethnicity = xr.getAttribute$String$String(Unit.ETHNICITY_TAG, null);
    this.turnsOfTraining = xr.getAttribute$String$int(Unit.TURNS_OF_TRAINING_TAG, 0);
    this.hitPoints = xr.getAttribute$String$int(Unit.HIT_POINTS_TAG, -1);
    this.teacher = xr.makeFreeColObject(game, Unit.TEACHER_TAG, $J.cls(Unit), false);
    this.student = xr.makeFreeColObject(game, Unit.STUDENT_TAG, $J.cls(Unit), false);
    this.setHomeIndianSettlement(xr.makeFreeColObject(game, Unit.INDIAN_SETTLEMENT_TAG, $J.cls(IndianSettlement), false));
    this.treasureAmount = xr.getAttribute$String$int(Unit.TREASURE_AMOUNT_TAG, 0);
    this.destination = xr.getLocationAttribute(game, Unit.DESTINATION_TAG, true);
    this.tradeRoute = xr.findFreeColGameObject(game, Unit.TRADE_ROUTE_TAG, $J.cls(TradeRoute), null, false);
    this.currentStop = (this.tradeRoute == null) ? -1 : xr.getAttribute$String$int(Unit.CURRENT_STOP_TAG, 0);
    this.experienceType = xr.getType(spec, Unit.EXPERIENCE_TYPE_TAG, $J.cls(GoodsType), null);
    if (this.experienceType == null && this.workType != null) {
      this.experienceType = this.workType;
    }
    this.experience = xr.getAttribute$String$int(Unit.EXPERIENCE_TAG, 0);
    this.visibleGoodsCount = xr.getAttribute$String$int(Unit.VISIBLE_GOODS_COUNT_TAG, -1);
    this.setWorkType(xr.getType(spec, Unit.WORK_TYPE_TAG, $J.cls(GoodsType), null));
    let wl = this.getWorkLocation();
    if (wl != null && wl !== oldWorkLocation) {
      wl.updateProductionType();
    }
    if (xr.shouldIntern()) {
      game.checkOwners(this, oldOwner);
    }
  }
  /**
   * {@inheritDoc}
   */
  readChildren(xr: FreeColXMLReader): void {
    if (this.getGoodsContainer() != null) {
      this.getGoodsContainer().removeAll();
    }
    this.workImprovement = null;
    super.readChildren(xr);
  }
  /**
   * {@inheritDoc}
   */
  readChild(xr: FreeColXMLReader): void {
    let game = this.getGame();
    let tag = xr.getLocalName();
    if ($J.equals(Unit.OLD_EQUIPMENT_TAG, tag)) {
      xr.swallowTag(Unit.OLD_EQUIPMENT_TAG);
    } else if ($J.equals(TileImprovement.TAG, tag) || $J.equals(Unit.OLD_TILE_IMPROVEMENT_TAG, tag)) {
      this.workImprovement = xr.readFreeColObject$Game$Class(game, $J.cls(TileImprovement));
    } else {
      super.readChild(xr);
    }
  }
  /**
   * {@inheritDoc}
   */
  getXMLTagName(): string {
    return Unit.TAG;
  }
  /**
   * {@inheritDoc}
   */
  toString(): string {
    return this.toString$String('');
  }
  /**
   * Gets a string representation of this unit.
   *
   * @param prefix A prefix (e.g. "AIUnit")
   * @return A string representation of this {@code Unit}.
   */
  toString$String(prefix: string): string {
    let sb = new StringBuilder(64);
    sb.append(String.fromCharCode(91 /* '[' */)).append(prefix).append(this.getId());
    if (!this.isInitialized()) {
      sb.append(' uninitialized');
    } else if (this.isDisposed()) {
      sb.append(' disposed');
    } else if (this.owner == null) {
      sb.append(' unowned');
    } else if (this.getType() == null) {
      sb.append(' untyped');
    } else {
      sb.append(String.fromCharCode(32 /* ' ' */)).append(StringUtils.lastPart(this.owner.getNationId(), '.')).append(String.fromCharCode(32 /* ' ' */)).append(this.getType().getSuffix$());
      if (!this.hasDefaultRole()) {
        sb.append(String.fromCharCode(45 /* '-' */)).append(this.getRoleSuffix());
        let count = this.getRoleCount();
        if (count > 1) {
          sb.append(String.fromCharCode(46 /* '.' */)).append(String(count));
        }
      }
      sb.append(String.fromCharCode(32 /* ' ' */)).append(this.getMovesAsString());
    }
    sb.append(String.fromCharCode(93 /* ']' */));
    return sb.toString();
  }
  static $clinit() {
    Unit.logger = Logger.getLogger($J.cls(Unit).getName());
    Unit.locComparator = Comparator.comparingInt((u) => Location.rankOf(u));
    Unit.typeRoleComparator = Comparator.thenComparing(Comparator.thenComparingInt((Comparator.comparing(($p0) => $p0.getType())), (u) => u.getRole().getRoleIndex()), FreeColObject.fcoComparator);
    Unit.increasingSkillComparator = Comparator.comparingInt(($p0) => $p0.getSkillLevel());
    Unit.decreasingSkillComparator = Comparator.reversed(Unit.increasingSkillComparator);
    Unit.settlementStartComparator = CollectionUtils.cachingIntComparator((s) => (s == null || !s.getTile$().isHighSeasConnected()) ? Constants.INFINITY : s.getTile$().getHighSeasCount());
    Unit.sentryPred = (u) => !u.isNaval() && u.getState() === Unit$UnitState.SENTRY;
  }
}

export class Unit$ClosestSettlementGoalDecider extends JObject {
  /**
   * A tile to exclude.
   */
  exclude: Tile = null;
  /**
   * Require a connected port.
   */
  coastal: boolean = false;
  /**
   * Best value so far.
   */
  bestValue: number = 0;
  /**
   * Best path so far.
   */
  best: PathNode = null;
  /**
   * Build a new goal decider to find the closest path to a settlement
   * owned by the player controlling the searching unit.
   *
   * @param exclude An optional tile to exclude.
   * @param coastal If true, a connected port is required.
   */
  _Unit$ClosestSettlementGoalDecider(exclude: Tile, coastal: boolean): this {
    this.exclude = exclude;
    this.coastal = coastal;
    this.bestValue = 2147483647;
    this.best = null;
    return this;
  }
  /**
   * {@inheritDoc}
   */
  getGoal(): PathNode {
    return this.best;
  }
  /**
   * {@inheritDoc}
   */
  hasSubGoals(): boolean {
    return true;
  }
  /**
   * {@inheritDoc}
   */
  check(u: Unit, path: PathNode): boolean {
    let t = path.getTile();
    if (t == null || t === this.exclude) {
      return false;
    }
    let settlement = t.getSettlement();
    let value: number;
    if (settlement != null && u.getOwner().owns(settlement) && (!this.coastal || settlement.isConnectedPort()) && (value = path.getTotalTurns()) < this.bestValue) {
      this.bestValue = value;
      this.best = path;
      return true;
    }
    return false;
  }
}

/**
 * A state a Unit can have.
 */
export class Unit$UnitState extends JEnum {
  static ACTIVE: Unit$UnitState = null;
  static FORTIFIED: Unit$UnitState = null;
  static SENTRY: Unit$UnitState = null;
  static IN_COLONY: Unit$UnitState = null;
  static IMPROVING: Unit$UnitState = null;
  static FORTIFYING: Unit$UnitState = null;
  static SKIPPED: Unit$UnitState = null;
  static $VALUES: Unit$UnitState[] = null;
  _Unit$UnitState($name: string, $ordinal: number): this {
    this._JEnum($name, $ordinal);
    return this;
  }
  /**
   * Get the stem key for this unit state.
   *
   * @return The stem key.
   */
  getKey(): string {
    return 'unitState.' + StringUtils.getEnumKey(this);
  }
  static values(): Unit$UnitState[] { return Unit$UnitState.$VALUES.slice(); }
  static valueOf(name: string): Unit$UnitState { return $J.enumValueOf(Unit$UnitState, name); }
  static $clinit() {
    Unit$UnitState.ACTIVE = new Unit$UnitState()._Unit$UnitState('ACTIVE', 0);
    Unit$UnitState.FORTIFIED = new Unit$UnitState()._Unit$UnitState('FORTIFIED', 1);
    Unit$UnitState.SENTRY = new Unit$UnitState()._Unit$UnitState('SENTRY', 2);
    Unit$UnitState.IN_COLONY = new Unit$UnitState()._Unit$UnitState('IN_COLONY', 3);
    Unit$UnitState.IMPROVING = new Unit$UnitState()._Unit$UnitState('IMPROVING', 4);
    Unit$UnitState.FORTIFYING = new Unit$UnitState()._Unit$UnitState('FORTIFYING', 5);
    Unit$UnitState.SKIPPED = new Unit$UnitState()._Unit$UnitState('SKIPPED', 6);
    Unit$UnitState.$VALUES = [Unit$UnitState.ACTIVE, Unit$UnitState.FORTIFIED, Unit$UnitState.SENTRY, Unit$UnitState.IN_COLONY, Unit$UnitState.IMPROVING, Unit$UnitState.FORTIFYING, Unit$UnitState.SKIPPED];
  }
}

/**
 * Internal state for findIntermediatePort.
 */
export class Unit$PortMode extends JEnum {
  static LAKE: Unit$PortMode = null;
  static NO_HIGH_SEAS: Unit$PortMode = null;
  static BLOCKED: Unit$PortMode = null;
  static LAND: Unit$PortMode = null;
  static $VALUES: Unit$PortMode[] = null;
  _Unit$PortMode($name: string, $ordinal: number): this {
    this._JEnum($name, $ordinal);
    return this;
  }
  static values(): Unit$PortMode[] { return Unit$PortMode.$VALUES.slice(); }
  static valueOf(name: string): Unit$PortMode { return $J.enumValueOf(Unit$PortMode, name); }
  static $clinit() {
    Unit$PortMode.LAKE = new Unit$PortMode()._Unit$PortMode('LAKE', 0);
    Unit$PortMode.NO_HIGH_SEAS = new Unit$PortMode()._Unit$PortMode('NO_HIGH_SEAS', 1);
    Unit$PortMode.BLOCKED = new Unit$PortMode()._Unit$PortMode('BLOCKED', 2);
    Unit$PortMode.LAND = new Unit$PortMode()._Unit$PortMode('LAND', 3);
    Unit$PortMode.$VALUES = [Unit$PortMode.LAKE, Unit$PortMode.NO_HIGH_SEAS, Unit$PortMode.BLOCKED, Unit$PortMode.LAND];
  }
}

/**
 * What type of unit label do we want?
 */
export class Unit$UnitLabelType extends JEnum {
  static PLAIN: Unit$UnitLabelType = null;
  static NATIONAL: Unit$UnitLabelType = null;
  static FULL: Unit$UnitLabelType = null;
  static $VALUES: Unit$UnitLabelType[] = null;
  _Unit$UnitLabelType($name: string, $ordinal: number): this {
    this._JEnum($name, $ordinal);
    return this;
  }
  static values(): Unit$UnitLabelType[] { return Unit$UnitLabelType.$VALUES.slice(); }
  static valueOf(name: string): Unit$UnitLabelType { return $J.enumValueOf(Unit$UnitLabelType, name); }
  static $clinit() {
    Unit$UnitLabelType.PLAIN = new Unit$UnitLabelType()._Unit$UnitLabelType('PLAIN', 0);
    Unit$UnitLabelType.NATIONAL = new Unit$UnitLabelType()._Unit$UnitLabelType('NATIONAL', 1);
    Unit$UnitLabelType.FULL = new Unit$UnitLabelType()._Unit$UnitLabelType('FULL', 2);
    Unit$UnitLabelType.$VALUES = [Unit$UnitLabelType.PLAIN, Unit$UnitLabelType.NATIONAL, Unit$UnitLabelType.FULL];
  }
}

/**
 * A move type.
 *
 * @see Unit#getMoveType(Direction)
 */
export class Unit$MoveType extends JEnum {
  /**
   * The reason why this move type is illegal.
   */
  reason: string = null;
  /**
   * Does this move type imply progress towards a destination.
   */
  progress: boolean = false;
  static MOVE: Unit$MoveType = null;
  static MOVE_HIGH_SEAS: Unit$MoveType = null;
  static EXPLORE_LOST_CITY_RUMOUR: Unit$MoveType = null;
  static ATTACK_UNIT: Unit$MoveType = null;
  static ATTACK_SETTLEMENT: Unit$MoveType = null;
  static EMBARK: Unit$MoveType = null;
  static ENTER_INDIAN_SETTLEMENT_WITH_FREE_COLONIST: Unit$MoveType = null;
  static ENTER_INDIAN_SETTLEMENT_WITH_SCOUT: Unit$MoveType = null;
  static ENTER_INDIAN_SETTLEMENT_WITH_MISSIONARY: Unit$MoveType = null;
  static ENTER_FOREIGN_COLONY_WITH_SCOUT: Unit$MoveType = null;
  static ENTER_SETTLEMENT_WITH_CARRIER_AND_GOODS: Unit$MoveType = null;
  static MOVE_NO_MOVES: Unit$MoveType = null;
  static MOVE_NO_ACCESS_LAND: Unit$MoveType = null;
  static MOVE_NO_ACCESS_BEACHED: Unit$MoveType = null;
  static MOVE_NO_ACCESS_EMBARK: Unit$MoveType = null;
  static MOVE_NO_ACCESS_FULL: Unit$MoveType = null;
  static MOVE_NO_ACCESS_GOODS: Unit$MoveType = null;
  static MOVE_NO_ACCESS_CONTACT: Unit$MoveType = null;
  static MOVE_NO_ACCESS_MISSION_BAN: Unit$MoveType = null;
  static MOVE_NO_ACCESS_SETTLEMENT: Unit$MoveType = null;
  static MOVE_NO_ACCESS_SKILL: Unit$MoveType = null;
  static MOVE_NO_ACCESS_TRADE: Unit$MoveType = null;
  static MOVE_NO_ACCESS_WAR: Unit$MoveType = null;
  static MOVE_NO_ACCESS_WATER: Unit$MoveType = null;
  static MOVE_NO_ATTACK_CIVILIAN: Unit$MoveType = null;
  static MOVE_NO_ATTACK_MARINE: Unit$MoveType = null;
  static MOVE_NO_EUROPE: Unit$MoveType = null;
  static MOVE_NO_REPAIR: Unit$MoveType = null;
  static MOVE_NO_TILE: Unit$MoveType = null;
  static MOVE_ILLEGAL: Unit$MoveType = null;
  static $VALUES: Unit$MoveType[] = null;
  _Unit$MoveType$String($name: string, $ordinal: number, reason: string): this {
    this._JEnum($name, $ordinal);
    this.reason = reason;
    this.progress = false;
    return this;
  }
  _Unit$MoveType$String$boolean($name: string, $ordinal: number, reason: string, progress: boolean): this {
    this._JEnum($name, $ordinal);
    this.reason = reason;
    this.progress = progress;
    return this;
  }
  isLegal(): boolean {
    return this.reason == null;
  }
  whyIllegal(): string {
    return (this.reason == null) ? '(none)' : this.reason;
  }
  isProgress(): boolean {
    return this.progress;
  }
  isAttack(): boolean {
    return this === Unit$MoveType.ATTACK_UNIT || this === Unit$MoveType.ATTACK_SETTLEMENT;
  }
  static values(): Unit$MoveType[] { return Unit$MoveType.$VALUES.slice(); }
  static valueOf(name: string): Unit$MoveType { return $J.enumValueOf(Unit$MoveType, name); }
  static $clinit() {
    Unit$MoveType.MOVE = new Unit$MoveType()._Unit$MoveType$String$boolean('MOVE', 0, null, true);
    Unit$MoveType.MOVE_HIGH_SEAS = new Unit$MoveType()._Unit$MoveType$String$boolean('MOVE_HIGH_SEAS', 1, null, true);
    Unit$MoveType.EXPLORE_LOST_CITY_RUMOUR = new Unit$MoveType()._Unit$MoveType$String$boolean('EXPLORE_LOST_CITY_RUMOUR', 2, null, true);
    Unit$MoveType.ATTACK_UNIT = new Unit$MoveType()._Unit$MoveType$String$boolean('ATTACK_UNIT', 3, null, false);
    Unit$MoveType.ATTACK_SETTLEMENT = new Unit$MoveType()._Unit$MoveType$String$boolean('ATTACK_SETTLEMENT', 4, null, false);
    Unit$MoveType.EMBARK = new Unit$MoveType()._Unit$MoveType$String$boolean('EMBARK', 5, null, false);
    Unit$MoveType.ENTER_INDIAN_SETTLEMENT_WITH_FREE_COLONIST = new Unit$MoveType()._Unit$MoveType$String$boolean('ENTER_INDIAN_SETTLEMENT_WITH_FREE_COLONIST', 6, null, false);
    Unit$MoveType.ENTER_INDIAN_SETTLEMENT_WITH_SCOUT = new Unit$MoveType()._Unit$MoveType$String$boolean('ENTER_INDIAN_SETTLEMENT_WITH_SCOUT', 7, null, false);
    Unit$MoveType.ENTER_INDIAN_SETTLEMENT_WITH_MISSIONARY = new Unit$MoveType()._Unit$MoveType$String$boolean('ENTER_INDIAN_SETTLEMENT_WITH_MISSIONARY', 8, null, false);
    Unit$MoveType.ENTER_FOREIGN_COLONY_WITH_SCOUT = new Unit$MoveType()._Unit$MoveType$String$boolean('ENTER_FOREIGN_COLONY_WITH_SCOUT', 9, null, false);
    Unit$MoveType.ENTER_SETTLEMENT_WITH_CARRIER_AND_GOODS = new Unit$MoveType()._Unit$MoveType$String$boolean('ENTER_SETTLEMENT_WITH_CARRIER_AND_GOODS', 10, null, false);
    Unit$MoveType.MOVE_NO_MOVES = new Unit$MoveType()._Unit$MoveType$String('MOVE_NO_MOVES', 11, 'Attempt to move without moves left');
    Unit$MoveType.MOVE_NO_ACCESS_LAND = new Unit$MoveType()._Unit$MoveType$String('MOVE_NO_ACCESS_LAND', 12, 'Attempt to move a naval unit onto land');
    Unit$MoveType.MOVE_NO_ACCESS_BEACHED = new Unit$MoveType()._Unit$MoveType$String('MOVE_NO_ACCESS_BEACHED', 13, 'Attempt to move onto foreign beached ship');
    Unit$MoveType.MOVE_NO_ACCESS_EMBARK = new Unit$MoveType()._Unit$MoveType$String('MOVE_NO_ACCESS_EMBARK', 14, 'Attempt to embark onto absent or foreign carrier');
    Unit$MoveType.MOVE_NO_ACCESS_FULL = new Unit$MoveType()._Unit$MoveType$String('MOVE_NO_ACCESS_FULL', 15, 'Attempt to embark onto full carrier');
    Unit$MoveType.MOVE_NO_ACCESS_GOODS = new Unit$MoveType()._Unit$MoveType$String('MOVE_NO_ACCESS_GOODS', 16, 'Attempt to trade without goods');
    Unit$MoveType.MOVE_NO_ACCESS_CONTACT = new Unit$MoveType()._Unit$MoveType$String('MOVE_NO_ACCESS_CONTACT', 17, 'Attempt to interact with natives before contact');
    Unit$MoveType.MOVE_NO_ACCESS_MISSION_BAN = new Unit$MoveType()._Unit$MoveType$String('MOVE_NO_ACCESS_MISSION_BAN', 18, 'Attempt to use missionary at banned settlement');
    Unit$MoveType.MOVE_NO_ACCESS_SETTLEMENT = new Unit$MoveType()._Unit$MoveType$String('MOVE_NO_ACCESS_SETTLEMENT', 19, 'Attempt to move into foreign settlement');
    Unit$MoveType.MOVE_NO_ACCESS_SKILL = new Unit$MoveType()._Unit$MoveType$String('MOVE_NO_ACCESS_SKILL', 20, 'Attempt to learn skill with incapable unit');
    Unit$MoveType.MOVE_NO_ACCESS_TRADE = new Unit$MoveType()._Unit$MoveType$String('MOVE_NO_ACCESS_TRADE', 21, 'Attempt to trade without authority');
    Unit$MoveType.MOVE_NO_ACCESS_WAR = new Unit$MoveType()._Unit$MoveType$String('MOVE_NO_ACCESS_WAR', 22, 'Attempt to trade while at war');
    Unit$MoveType.MOVE_NO_ACCESS_WATER = new Unit$MoveType()._Unit$MoveType$String('MOVE_NO_ACCESS_WATER', 23, 'Attempt to move into a settlement by water');
    Unit$MoveType.MOVE_NO_ATTACK_CIVILIAN = new Unit$MoveType()._Unit$MoveType$String('MOVE_NO_ATTACK_CIVILIAN', 24, 'Attempt to attack with civilian unit');
    Unit$MoveType.MOVE_NO_ATTACK_MARINE = new Unit$MoveType()._Unit$MoveType$String('MOVE_NO_ATTACK_MARINE', 25, 'Attempt to attack from on board ship');
    Unit$MoveType.MOVE_NO_EUROPE = new Unit$MoveType()._Unit$MoveType$String('MOVE_NO_EUROPE', 26, 'Attempt to move to Europe by incapable unit');
    Unit$MoveType.MOVE_NO_REPAIR = new Unit$MoveType()._Unit$MoveType$String('MOVE_NO_REPAIR', 27, 'Attempt to move a unit that is under repair');
    Unit$MoveType.MOVE_NO_TILE = new Unit$MoveType()._Unit$MoveType$String('MOVE_NO_TILE', 28, 'Attempt to move when not on a tile');
    Unit$MoveType.MOVE_ILLEGAL = new Unit$MoveType()._Unit$MoveType$String('MOVE_ILLEGAL', 29, 'Unspecified illegal move');
    Unit$MoveType.$VALUES = [Unit$MoveType.MOVE, Unit$MoveType.MOVE_HIGH_SEAS, Unit$MoveType.EXPLORE_LOST_CITY_RUMOUR, Unit$MoveType.ATTACK_UNIT, Unit$MoveType.ATTACK_SETTLEMENT, Unit$MoveType.EMBARK, Unit$MoveType.ENTER_INDIAN_SETTLEMENT_WITH_FREE_COLONIST, Unit$MoveType.ENTER_INDIAN_SETTLEMENT_WITH_SCOUT, Unit$MoveType.ENTER_INDIAN_SETTLEMENT_WITH_MISSIONARY, Unit$MoveType.ENTER_FOREIGN_COLONY_WITH_SCOUT, Unit$MoveType.ENTER_SETTLEMENT_WITH_CARRIER_AND_GOODS, Unit$MoveType.MOVE_NO_MOVES, Unit$MoveType.MOVE_NO_ACCESS_LAND, Unit$MoveType.MOVE_NO_ACCESS_BEACHED, Unit$MoveType.MOVE_NO_ACCESS_EMBARK, Unit$MoveType.MOVE_NO_ACCESS_FULL, Unit$MoveType.MOVE_NO_ACCESS_GOODS, Unit$MoveType.MOVE_NO_ACCESS_CONTACT, Unit$MoveType.MOVE_NO_ACCESS_MISSION_BAN, Unit$MoveType.MOVE_NO_ACCESS_SETTLEMENT, Unit$MoveType.MOVE_NO_ACCESS_SKILL, Unit$MoveType.MOVE_NO_ACCESS_TRADE, Unit$MoveType.MOVE_NO_ACCESS_WAR, Unit$MoveType.MOVE_NO_ACCESS_WATER, Unit$MoveType.MOVE_NO_ATTACK_CIVILIAN, Unit$MoveType.MOVE_NO_ATTACK_MARINE, Unit$MoveType.MOVE_NO_EUROPE, Unit$MoveType.MOVE_NO_REPAIR, Unit$MoveType.MOVE_NO_TILE, Unit$MoveType.MOVE_ILLEGAL];
  }
}

let $Unit$1: any = null;
/** An anonymous class (Unit.java:3391). */
function Unit$1(): any {
  return $Unit$1 ??= $J.local(class extends JObject {
    found: PathNode = null;
    $init_anon() {
      this.found = null;
      return this;
    }
    getGoal(): PathNode {
      return this.found;
    }
    hasSubGoals(): boolean {
      return false;
    }
    check(unit: Unit, path: PathNode): boolean {
      let tile = path.getTile();
      if (tile == null) {
        return false;
      }
      let first = tile.getFirstUnit();
      if (first == null || !this.$outer.getOwner().atWarWith(first.getOwner())) {
        return false;
      }
      let attackerPred = (u) => {
        let p: PathNode;
        return (u.canAttack(unit) && this.$cv_cm.calculateCombatOdds$FreeColGameObject$FreeColGameObject(u, unit).win >= this.$cv_threat && (p = u.findPath$Location(this.$cv_start)) != null && p.getTotalTurns() < this.$cv_range);
      };
      if (CollectionUtils.any$Collection(CollectionUtils.transform$Stream$Predicate(tile.getUnits(), attackerPred))) {
        this.found = path;
        return true;
      }
      return false;
    }
    $c($cm, $threat, $start, $range): this {
      this.$cv_cm = $cm; this.$cv_threat = $threat; this.$cv_start = $start; this.$cv_range = $range;
      return this;
    }
  }, 'net.sf.freecol.common.model.Unit$1', ['net.sf.freecol.common.model.pathfinding.GoalDecider']);
}

$J.define(Unit, 'net.sf.freecol.common.model.Unit', { kind: 'class', ifaces: ['net.sf.freecol.common.model.Consumer', 'net.sf.freecol.common.model.Locatable', 'net.sf.freecol.common.model.Movable', 'net.sf.freecol.common.model.Nameable', 'net.sf.freecol.common.model.Ownable'], sup: 'net.sf.freecol.common.model.GoodsLocation', ctors: { 'net.sf.freecol.common.model.Game,java.lang.String': '_Unit$Game$String', 'net.sf.freecol.common.model.Game': '_Unit$Game' }, returns: { 'getXMLTagName': 'java.lang.String', 'getDisplayObject': 'net.sf.freecol.common.model.FreeColObject', 'getClassIndex': 'int', 'getGoodsCapacity': 'int', 'getSpaceTaken': 'int', 'getRank': 'int', 'getSettlement': 'net.sf.freecol.common.model.Settlement', 'getLocationLabel': 'net.sf.freecol.common.model.StringTemplate', 'getTile$': 'net.sf.freecol.common.model.Tile', 'isInEurope': 'boolean', 'getLocation': 'net.sf.freecol.common.model.Location', 'getOwner': 'net.sf.freecol.common.model.Player', 'getPriority': 'int', 'getConsumedGoods': 'java.util.List', 'getScoutScore': 'int', 'getPioneerScore': 'int', 'getSkillLevel': 'int', 'getTransportFee': 'int', 'getBurnProbability': 'float', 'getConvertProbability': 'float', 'hasCargo': 'boolean', 'hasGoodsCargo': 'boolean', 'getCargoSpaceTaken': 'int', 'getUnitSpaceTaken': 'int', 'getGoodsSpaceTaken': 'int', 'getCargoCapacity': 'int', 'hasSpaceLeft': 'boolean', 'getSpaceLeft': 'int', 'getCompactGoodsList': 'java.util.List', 'getGoodsList': 'java.util.List', 'getVisibleTileSet': 'java.util.Set', 'getLineOfSight': 'int', 'getTrivialPath': 'net.sf.freecol.common.model.PathNode', 'getPathStartLocation': 'net.sf.freecol.common.model.Location', 'isCandidateForNextActiveUnit': 'boolean', 'isReadyToTrade': 'boolean', 'getSailTurns': 'int', 'getMovesAsString': 'java.lang.String', 'getInitialMovesLeft': 'int', 'getRepairLocation': 'net.sf.freecol.common.model.Location', 'isOffensiveUnit': 'boolean', 'isDefensiveUnit': 'boolean', 'isBeached$': 'boolean', 'isMounted': 'boolean', 'isArmed': 'boolean', 'getAutomaticRole': 'net.sf.freecol.common.model.Role', 'getVisibleGoodsCount': 'int', 'getAttrition': 'int', 'getTreasureAmount': 'int', 'getTradeLocation': 'net.sf.freecol.common.model.TradeLocation', 'getCurrentStop': 'int', 'getCurrentStops': 'java.util.List', 'getStop': 'net.sf.freecol.common.model.TradeRouteStop', 'getTradeRoute': 'net.sf.freecol.common.model.TradeRoute', 'getDestination': 'net.sf.freecol.common.model.Location', 'getTurnsForRepair': 'int', 'isDamaged': 'boolean', 'isDamagedAndUnderForcedRepair': 'boolean', 'getMaximumHitPoints': 'int', 'getHitPoints': 'int', 'getHomeIndianSettlement': 'net.sf.freecol.common.model.IndianSettlement', 'hasNativeEthnicity': 'boolean', 'getEthnicity': 'java.lang.String', 'getNationality': 'java.lang.String', 'getNeededTurnsOfTraining': 'int', 'getTurnsOfTraining': 'int', 'getTeacher': 'net.sf.freecol.common.model.Unit', 'getStudent': 'net.sf.freecol.common.model.Unit', 'getWorkImprovement': 'net.sf.freecol.common.model.TileImprovement', 'getWorkTurnsLeft': 'int', 'getWorkLeft': 'int', 'getExperience': 'int', 'getExperienceType': 'net.sf.freecol.common.model.GoodsType', 'getWorkType': 'net.sf.freecol.common.model.GoodsType', 'getMovesLeft': 'int', 'getFullEntryLocation': 'net.sf.freecol.common.model.Tile', 'getEntryLocation': 'net.sf.freecol.common.model.Location', 'getWorkTile': 'net.sf.freecol.common.model.Tile', 'getWorkLocation': 'net.sf.freecol.common.model.WorkLocation', 'hasTile': 'boolean', 'isInColony': 'boolean', 'isInMission': 'boolean', 'isAtSea': 'boolean', 'getCarrier': 'net.sf.freecol.common.model.Unit', 'isOnTile': 'boolean', 'isOnCarrier': 'boolean', 'getSortedMilitaryRoles': 'java.util.List', 'getMilitaryRole': 'net.sf.freecol.common.model.Role', 'getRoleSuffix': 'java.lang.String', 'hasDefaultRole': 'boolean', 'getRoleCount': 'int', 'getRole': 'net.sf.freecol.common.model.Role', 'getState': 'net.sf.freecol.common.model.Unit$UnitState', 'isPerson': 'boolean', 'isCarrier': 'boolean', 'isColonist': 'boolean', 'isTradingUnit': 'boolean', 'isUndead': 'boolean', 'isOwnerHidden': 'boolean', 'isNaval': 'boolean', 'getScoreValue': 'int', 'getType': 'net.sf.freecol.common.model.UnitType', 'getRepairLabel': 'net.sf.freecol.common.model.StringTemplate', 'getDestinationLabel': 'net.sf.freecol.common.model.StringTemplate', 'getDescription$': 'java.lang.String', 'getLabel$': 'net.sf.freecol.common.model.StringTemplate', 'getApparentOwnerName': 'net.sf.freecol.common.model.StringTemplate', 'getName': 'java.lang.String' }, meths: { 'toString(java.lang.String)': 'toString$String', 'getModifiers(java.lang.String,net.sf.freecol.common.model.FreeColSpecObjectType,net.sf.freecol.common.model.Turn)': 'getModifiers$String$FreeColSpecObjectType$Turn', 'getAbilities(java.lang.String,net.sf.freecol.common.model.FreeColSpecObjectType,net.sf.freecol.common.model.Turn)': 'getAbilities$String$FreeColSpecObjectType$Turn', 'getTile()': 'getTile$', 'canCashInTreasureTrain(net.sf.freecol.common.model.Location)': 'canCashInTreasureTrain$Location', 'canCashInTreasureTrain()': 'canCashInTreasureTrain$', 'couldCarry(net.sf.freecol.common.model.Goods)': 'couldCarry$Goods', 'couldCarry(net.sf.freecol.common.model.Unit)': 'couldCarry$Unit', 'findOurNearestSettlement()': 'findOurNearestSettlement$', 'findOurNearestSettlement(net.sf.freecol.common.model.Tile,boolean,int,boolean)': 'findOurNearestSettlement$Tile$boolean$int$boolean', 'findOurNearestSettlement(boolean,int,boolean)': 'findOurNearestSettlement$boolean$int$boolean', 'getClosestColony(java.util.stream.Stream)': 'getClosestColony$Stream', 'getClosestColony(java.util.List)': 'getClosestColony$List', 'getTurnsToReach(net.sf.freecol.common.model.Location,net.sf.freecol.common.model.Location,net.sf.freecol.common.model.Unit,net.sf.freecol.common.model.pathfinding.CostDecider)': 'getTurnsToReach$Location$Location$Unit$CostDecider', 'getTurnsToReach(net.sf.freecol.common.model.Location,net.sf.freecol.common.model.Location)': 'getTurnsToReach$Location$Location', 'getTurnsToReach(net.sf.freecol.common.model.Location)': 'getTurnsToReach$Location', 'findPath(net.sf.freecol.common.model.Location,net.sf.freecol.common.model.Location,net.sf.freecol.common.model.Unit,net.sf.freecol.common.model.pathfinding.CostDecider,net.sf.freecol.common.util.LogBuilder)': 'findPath$Location$Location$Unit$CostDecider$LogBuilder', 'findPath(net.sf.freecol.common.model.Location,net.sf.freecol.common.model.Location,net.sf.freecol.common.model.Unit)': 'findPath$Location$Location$Unit', 'findPath(net.sf.freecol.common.model.Location,net.sf.freecol.common.model.Location)': 'findPath$Location$Location', 'findPath(net.sf.freecol.common.model.Location)': 'findPath$Location', 'getSimpleMoveType(net.sf.freecol.common.model.Direction)': 'getSimpleMoveType$Direction', 'getSimpleMoveType(net.sf.freecol.common.model.Tile)': 'getSimpleMoveType$Tile', 'getSimpleMoveType(net.sf.freecol.common.model.Tile,net.sf.freecol.common.model.Tile)': 'getSimpleMoveType$Tile$Tile', 'getMoveType(net.sf.freecol.common.model.Tile,net.sf.freecol.common.model.Tile,int)': 'getMoveType$Tile$Tile$int', 'getMoveType(net.sf.freecol.common.model.Tile)': 'getMoveType$Tile', 'getMoveType(net.sf.freecol.common.model.Direction)': 'getMoveType$Direction', 'getMoveCost(net.sf.freecol.common.model.Tile,net.sf.freecol.common.model.Tile,int)': 'getMoveCost$Tile$Tile$int', 'getMoveCost(net.sf.freecol.common.model.Tile)': 'getMoveCost$Tile', 'isBeached(net.sf.freecol.common.model.Tile)': 'isBeached$Tile', 'isBeached()': 'isBeached$', 'getTeachingType(net.sf.freecol.common.model.Unit)': 'getTeachingType$Unit', 'getTeachingType(net.sf.freecol.common.model.UnitType)': 'getTeachingType$UnitType', 'getUnitChange(java.lang.String,net.sf.freecol.common.model.UnitType,net.sf.freecol.common.model.Player)': 'getUnitChange$String$UnitType$Player', 'getUnitChange(java.lang.String,net.sf.freecol.common.model.UnitType)': 'getUnitChange$String$UnitType', 'getUnitChange(java.lang.String)': 'getUnitChange$String', 'getDescription(net.sf.freecol.common.model.Unit$UnitLabelType)': 'getDescription$UnitLabelType', 'getDescription()': 'getDescription$', 'getLabel(net.sf.freecol.common.model.Unit$UnitLabelType)': 'getLabel$UnitLabelType', 'getLabel()': 'getLabel$' }, clinit: true, lazy: ['logger', 'locComparator', 'typeRoleComparator', 'increasingSkillComparator', 'decreasingSkillComparator', 'settlementStartComparator', 'sentryPred'] });
$J.define(Unit$ClosestSettlementGoalDecider, 'net.sf.freecol.common.model.Unit$ClosestSettlementGoalDecider', { kind: 'class', ifaces: ['net.sf.freecol.common.model.pathfinding.GoalDecider'], sup: 'java.lang.Object', ctors: { 'net.sf.freecol.common.model.Tile,boolean': '_Unit$ClosestSettlementGoalDecider' }, returns: { 'hasSubGoals': 'boolean', 'getGoal': 'net.sf.freecol.common.model.PathNode' } });
$J.define(Unit$UnitState, 'net.sf.freecol.common.model.Unit$UnitState', { kind: 'enum', sup: 'java.lang.Enum', ctors: { '': '_Unit$UnitState' }, returns: { 'getKey': 'java.lang.String' }, clinit: true, lazy: ['$VALUES', 'ACTIVE', 'FORTIFIED', 'SENTRY', 'IN_COLONY', 'IMPROVING', 'FORTIFYING', 'SKIPPED'] });
$J.define(Unit$PortMode, 'net.sf.freecol.common.model.Unit$PortMode', { kind: 'enum', sup: 'java.lang.Enum', ctors: { '': '_Unit$PortMode' }, clinit: true, lazy: ['$VALUES', 'LAKE', 'NO_HIGH_SEAS', 'BLOCKED', 'LAND'] });
$J.define(Unit$UnitLabelType, 'net.sf.freecol.common.model.Unit$UnitLabelType', { kind: 'enum', sup: 'java.lang.Enum', ctors: { '': '_Unit$UnitLabelType' }, clinit: true, lazy: ['$VALUES', 'PLAIN', 'NATIONAL', 'FULL'] });
$J.define(Unit$MoveType, 'net.sf.freecol.common.model.Unit$MoveType', { kind: 'enum', sup: 'java.lang.Enum', ctors: { 'java.lang.String,boolean': '_Unit$MoveType$String$boolean', 'java.lang.String': '_Unit$MoveType$String' }, returns: { 'isAttack': 'boolean', 'isProgress': 'boolean', 'isLegal': 'boolean' }, clinit: true, lazy: ['$VALUES', 'MOVE', 'MOVE_HIGH_SEAS', 'EXPLORE_LOST_CITY_RUMOUR', 'ATTACK_UNIT', 'ATTACK_SETTLEMENT', 'EMBARK', 'ENTER_INDIAN_SETTLEMENT_WITH_FREE_COLONIST', 'ENTER_INDIAN_SETTLEMENT_WITH_SCOUT', 'ENTER_INDIAN_SETTLEMENT_WITH_MISSIONARY', 'ENTER_FOREIGN_COLONY_WITH_SCOUT', 'ENTER_SETTLEMENT_WITH_CARRIER_AND_GOODS', 'MOVE_NO_MOVES', 'MOVE_NO_ACCESS_LAND', 'MOVE_NO_ACCESS_BEACHED', 'MOVE_NO_ACCESS_EMBARK', 'MOVE_NO_ACCESS_FULL', 'MOVE_NO_ACCESS_GOODS', 'MOVE_NO_ACCESS_CONTACT', 'MOVE_NO_ACCESS_MISSION_BAN', 'MOVE_NO_ACCESS_SETTLEMENT', 'MOVE_NO_ACCESS_SKILL', 'MOVE_NO_ACCESS_TRADE', 'MOVE_NO_ACCESS_WAR', 'MOVE_NO_ACCESS_WATER', 'MOVE_NO_ATTACK_CIVILIAN', 'MOVE_NO_ATTACK_MARINE', 'MOVE_NO_EUROPE', 'MOVE_NO_REPAIR', 'MOVE_NO_TILE', 'MOVE_ILLEGAL'] });
$J.module(() => {
  Messages = $J.load('net.sf.freecol.common.i18n.Messages');
  Ability = $J.load('net.sf.freecol.common.model.Ability');
  AbstractGoods = $J.load('net.sf.freecol.common.model.AbstractGoods');
  Colony = $J.load('net.sf.freecol.common.model.Colony');
  CombatModel$CombatOdds = $J.load('net.sf.freecol.common.model.CombatModel$CombatOdds');
  Constants = $J.load('net.sf.freecol.common.model.Constants');
  Direction = $J.load('net.sf.freecol.common.model.Direction');
  Europe = $J.load('net.sf.freecol.common.model.Europe');
  FreeColObject = $J.load('net.sf.freecol.common.model.FreeColObject');
  Goods = $J.load('net.sf.freecol.common.model.Goods');
  GoodsContainer = $J.load('net.sf.freecol.common.model.GoodsContainer');
  GoodsType = $J.load('net.sf.freecol.common.model.GoodsType');
  HighSeas = $J.load('net.sf.freecol.common.model.HighSeas');
  IndianSettlement = $J.load('net.sf.freecol.common.model.IndianSettlement');
  IndianSettlement$ContactLevel = $J.load('net.sf.freecol.common.model.IndianSettlement$ContactLevel');
  Location = $J.load('net.sf.freecol.common.model.Location');
  Map_ = $J.load('net.sf.freecol.common.model.Map');
  Modifier = $J.load('net.sf.freecol.common.model.Modifier');
  Modifier$ModifierType = $J.load('net.sf.freecol.common.model.Modifier$ModifierType');
  PathNode = $J.load('net.sf.freecol.common.model.PathNode');
  Player = $J.load('net.sf.freecol.common.model.Player');
  ProductionInfo = $J.load('net.sf.freecol.common.model.ProductionInfo');
  Role = $J.load('net.sf.freecol.common.model.Role');
  Settlement = $J.load('net.sf.freecol.common.model.Settlement');
  StringTemplate = $J.load('net.sf.freecol.common.model.StringTemplate');
  Tile = $J.load('net.sf.freecol.common.model.Tile');
  TileImprovement = $J.load('net.sf.freecol.common.model.TileImprovement');
  TradeRoute = $J.load('net.sf.freecol.common.model.TradeRoute');
  UnitChangeType = $J.load('net.sf.freecol.common.model.UnitChangeType');
  UnitLocation$NoAddReason = $J.load('net.sf.freecol.common.model.UnitLocation$NoAddReason');
  UnitType = $J.load('net.sf.freecol.common.model.UnitType');
  WorkLocation = $J.load('net.sf.freecol.common.model.WorkLocation');
  CostDeciders = $J.load('net.sf.freecol.common.model.pathfinding.CostDeciders');
  GoalDeciders = $J.load('net.sf.freecol.common.model.pathfinding.GoalDeciders');
  GameOptions = $J.load('net.sf.freecol.common.option.GameOptions');
  CollectionUtils = $J.load('net.sf.freecol.common.util.CollectionUtils');
  StringUtils = $J.load('net.sf.freecol.common.util.StringUtils');
});
