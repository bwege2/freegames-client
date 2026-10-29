// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/common/model/UnitType.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J, ArrayList, Collections, Comparator } from '../../../../../../jre/index.ts';
import { BuildableType } from './BuildableType.ts';

let Ability, AbstractGoods, Colony$NoBuildReason, Constants, Consumer, FreeColObject, FreeColSpecObjectType, GoodsType, Modifier, Role, Scope, Specification, TypeCountMap, UnitChangeType, CollectionUtils;

/**
 * The various types of units in FreeCol.
 */
export class UnitType extends BuildableType {
  static readonly TAG: string = 'unit-type';
  /**
   * Comparator for defence ability.
   */
  static defenceComparator: Comparator<UnitType> = null;
  /**
   * The default offence value.
   */
  static readonly DEFAULT_OFFENCE: number = 0;
  /**
   * The default offence value.
   */
  static readonly DEFAULT_DEFENCE: number = 1;
  /**
   * The offence of this UnitType. Only Units with an offence value
   * greater than zero can attack.
   */
  baseOffence: number = 0;
  /**
   * The defence of this UnitType.
   */
  baseDefence: number = 0;
  /**
   * The capacity of this UnitType.
   */
  space: number = 0;
  /**
   * Is this the default unit type?
   */
  defaultUnitType: boolean = false;
  /**
   * The number of hit points this UnitType has. At the moment, this
   * is only used for ships. All other UnitTypes are downgraded or
   * destroyed if they lose a battle.
   */
  hitPoints: number = 0;
  /**
   * The space taken by this UnitType.
   */
  spaceTaken: number = 0;
  /**
   * The skill level of this UnitType.
   */
  skill: number = 0;
  /**
   * The price of this UnitType.
   */
  price_: number = 0;
  /**
   * The optional price of this UnitType for use by mercenary forces.
   */
  mercenaryPrice: number = 0;
  /**
   * The initial moves of this UnitType.
   */
  movement: number = 0;
  /**
   * The maximum distance of tiles this UnitType can observe.
   */
  lineOfSight: number = 0;
  /**
   * The probability of recruiting a Unit of this type in Europe.
   */
  recruitProbability: number = 0;
  /**
   * The expert production of this UnitType.
   */
  expertProduction: GoodsType = null;
  /**
   * How much a Unit of this type contributes to the Player's score.
   */
  scoreValue: number = 0;
  /**
   * The maximum experience a unit of this type can accumulate.
   */
  maximumExperience: number = 0;
  attackRange: number = 0;
  /**
   * The maximum attrition this UnitType can accumulate without
   * being destroyed.
   */
  maximumAttrition: number = 0;
  /**
   * Consumption order.
   */
  priority: number = 0;
  /**
   * The skill this UnitType teaches, mostly its own.
   */
  skillTaught: UnitType = null;
  /**
   * The default role for a unit of this type.
   */
  defaultRole: Role = null;
  /**
   * The goods consumed per turn when in a settlement.
   */
  consumption: TypeCountMap<GoodsType> = null;
  static readonly ATTACK_RANGE_TAG: string = 'attack-range';
  static readonly CONSUMES_TAG: string = 'consumes';
  static readonly DEFAULT_ROLE_TAG: string = 'default-role';
  static readonly DEFAULT_UNIT_TAG: string = 'default-unit';
  static readonly DEFENCE_TAG: string = 'defence';
  static readonly EXPERT_PRODUCTION_TAG: string = 'expert-production';
  static readonly HIT_POINTS_TAG: string = 'hit-points';
  static readonly LINE_OF_SIGHT_TAG: string = 'line-of-sight';
  static readonly MERCENARY_PRICE_TAG: string = 'mercenary-price';
  static readonly MOVEMENT_TAG: string = 'movement';
  static readonly MAXIMUM_EXPERIENCE_TAG: string = 'maximum-experience';
  static readonly MAXIMUM_ATTRITION_TAG: string = 'maximum-attrition';
  static readonly OFFENCE_TAG: string = 'offence';
  static readonly PRICE_TAG: string = 'price';
  static readonly PRIORITY_TAG: string = 'priority';
  static readonly RECRUIT_PROBABILITY_TAG: string = 'recruit-probability';
  static readonly SCORE_VALUE_TAG: string = 'score-value';
  static readonly SKILL_TAG: string = 'skill';
  static readonly SKILL_TAUGHT_TAG: string = 'skill-taught';
  static readonly SPACE_TAG: string = 'space';
  static readonly SPACE_TAKEN_TAG: string = 'space-taken';
  static readonly UNIT_TAG: string = 'unit';
  static readonly OLD_DEFAULT_EQUIPMENT_TAG: string = 'default-equipment';
  static readonly OLD_DEFAULT_UNIT_TAG: string = 'defaultUnit';
  static readonly OLD_HIT_POINTS_TAG: string = 'hitPoints';
  static readonly OLD_LINE_OF_SIGHT_TAG: string = 'lineOfSight';
  static readonly OLD_MAXIMUM_EXPERIENCE_TAG: string = 'maximumExperience';
  static readonly OLD_MAXIMUM_ATTRITION_TAG: string = 'maximumAttrition';
  static readonly OLD_RECRUIT_PROBABILITY_TAG: string = 'recruitProbability';
  static readonly OLD_SCORE_VALUE_TAG: string = 'scoreValue';
  static readonly OLD_SKILL_TAUGHT_TAG: string = 'skillTaught';
  static readonly OLD_SPACE_TAKEN_TAG: string = 'spaceTaken';
  static readonly DOWNGRADE_TAG: string = 'downgrade';
  static readonly UPGRADE_TAG: string = 'upgrade';
  /**
   * Creates a new {@code UnitType} instance.
   *
   * @param id            The object identifier.
   * @param specification The {@code Specification} to refer to.
   */
  _UnitType(id: string, specification: Specification): this {
    this._BuildableType(id, specification);
    this.baseOffence = UnitType.DEFAULT_OFFENCE;
    this.baseDefence = UnitType.DEFAULT_DEFENCE;
    this.space = 0;
    this.defaultUnitType = false;
    this.hitPoints = 0;
    this.spaceTaken = 1;
    this.skill = Constants.UNDEFINED;
    this.price_ = Constants.UNDEFINED;
    this.mercenaryPrice = Constants.UNDEFINED;
    this.movement = 3;
    this.lineOfSight = 1;
    this.recruitProbability = 0;
    this.expertProduction = null;
    this.scoreValue = 0;
    this.maximumExperience = 0;
    this.attackRange = 0;
    this.maximumAttrition = Constants.INFINITY;
    this.priority = Consumer.UNIT_PRIORITY;
    this.skillTaught = null;
    this.defaultRole = null;
    this.consumption = null;
    this.defaultRole = specification.getDefaultRole();
    return this;
  }
  /**
   * Get a key for the working as this unit type message.
   *
   * @return A message key.
   */
  getWorkingAsKey(): string {
    return this.getId() + '.workingAs';
  }
  /**
   * Can this unit type carry units?
   *
   * @return True if units can be carried.
   */
  canCarryUnits(): boolean {
    return this.hasAbility$String(Ability.CARRY_UNITS);
  }
  /**
   * Can this unit type carry goods?
   *
   * @return True if goods can be carried.
   */
  canCarryGoods(): boolean {
    return this.hasAbility$String(Ability.CARRY_GOODS);
  }
  /**
   * Can this unit type carry treasure?
   *
   * @return True if unit can carry treasure
   */
  canCarryTreasure(): boolean {
    return this.hasAbility$String(Ability.CARRY_TREASURE);
  }
  /**
   * Gets the score for acquiring a unit of this type.
   *
   * @return The score for this unit type.
   */
  getScoreValue(): number {
    return this.scoreValue;
  }
  /**
   * Get the base offence value.
   *
   * @return The base offence value.
   */
  getBaseOffence(): number {
    return this.baseOffence;
  }
  /**
   * Get the offence of this unit type.
   *
   * @return The offence value.
   */
  getOffence(): number {
    return this.apply$float$Turn$String(Math.fround(this.baseOffence), null, Modifier.OFFENCE);
  }
  /**
   * Is this an offensive unit type?
   *
   * @return True if base offensive ability is greater than the default.
   */
  isOffensive(): boolean {
    return this.getBaseOffence() > UnitType.DEFAULT_OFFENCE;
  }
  /**
   * Get the base defence value.
   *
   * @return The defence value.
   */
  getBaseDefence(): number {
    return this.baseDefence;
  }
  /**
   * Get the total defence of this unit type.
   *
   * @return The defence value.
   */
  getDefence(): number {
    return this.apply$float$Turn$String(Math.fround(this.baseDefence), null, Modifier.DEFENCE);
  }
  /**
   * Is this a defensive unit type?
   *
   * Default defence is 1, same a for colonists, thus to be defensive, a
   * colonist must have a military role. Artillery of all sorts has
   * higher defense so they are automatically defensive.
   *
   * @return True if base defensive ability is greater than the default.
   */
  isDefensive(): boolean {
    return this.getBaseDefence() > UnitType.DEFAULT_DEFENCE;
  }
  /**
   * Is this the default unit type?
   *
   * @return True if this is the default unit type.
   */
  isDefaultUnitType(): boolean {
    return this.defaultUnitType;
  }
  /**
   * Get the `line of sight' distance (in tiles).
   *
   * @return The line of sight distance.
   */
  getLineOfSight(): number {
    return this.lineOfSight;
  }
  /**
   * Sets `line of sight' (used by Introspector).
   */
  setLineOfSight(lineOfSight: number): void {
    this.lineOfSight = lineOfSight;
  }
  /**
   * Get the space this unit type has to carry cargo.
   *
   * @return The cargo capacity of this unit type.
   */
  getSpace(): number {
    return this.space;
  }
  /**
   * Set the space this unit type has to carry cargo.
   * Required by the test suite.
   *
   * @param newSpace The new cargo capacity.
   */
  setSpace(newSpace: number): void {
    this.space = newSpace;
  }
  /**
   * Get the unit type hit points.
   *
   * @return The hit points.
   */
  getHitPoints(): number {
    return this.hitPoints;
  }
  /**
   * Sets `hit points' (used by Introspector).
   */
  setHitPoints(hitPoints: number): void {
    this.hitPoints = hitPoints;
  }
  /**
   * Gets the number of cargo slots a unit of this type takes on a carrier.
   *
   * @return The number of cargo slots.
   */
  getSpaceTaken(): number {
    return Math.max(this.spaceTaken, (this.space + 1) | 0);
  }
  /**
   * Set the number of cargo slots a unit of this type takes on a carrier.
   * Required by the test suite.
   *
   * @param newSpaceTaken The new number of cargo slots.
   */
  setSpaceTaken(newSpaceTaken: number): void {
    this.spaceTaken = newSpaceTaken;
  }
  /**
   * Is this UnitType recruitable in Europe?
   *
   * @return True if European-recruitable.
   */
  isRecruitable(): boolean {
    return this.recruitProbability > 0;
  }
  /**
   * Get the relative probability of recruiting this unit in Europe.
   *
   * @return A relative probability.
   */
  getRecruitProbability(): number {
    return this.recruitProbability;
  }
  /**
   * Get the skill level associated with this unit type.
   *
   * @return The skill level.
   */
  getSkill(): number {
    return this.skill;
  }
  /**
   * Set the skill level associated with this unit type.
   * Required by the test suite.
   *
   * @param newSkill The new skill level.
   */
  setSkill(newSkill: number): void {
    this.skill = newSkill;
  }
  /**
   * Get the base price of this unit type.
   * For the actual price of the unit, use
   * {@link Europe#getUnitPrice(UnitType)}
   *
   * @return The base price.
   */
  getPrice(): number {
    return this.price_;
  }
  /**
   * Get the special price used by mercenary forces when there is no
   * standard base price (e.g. ManOWar).
   *
   * @return The mercenary price.
   */
  getMercenaryPrice(): number {
    return this.mercenaryPrice;
  }
  /**
   * Set the mercenary price.
   *
   * @param price The mercenary price.
   */
  setMercenaryPrice(price: number): void {
    this.mercenaryPrice = price;
  }
  /**
   * Get the base movement of this unit type.
   *
   * @return The base movement.
   */
  getMovement(): number {
    return this.movement;
  }
  /**
   * Get the maximum experience required a unit of this type may achieve.
   *
   * @return The maximum experience.
   */
  getMaximumExperience(): number {
    return this.maximumExperience;
  }
  /**
   * Is this unit type subject to attrition?
   *
   * @return True if attrition can happen for this unit type.
   */
  hasMaximumAttrition(): boolean {
    return this.maximumAttrition !== Constants.INFINITY;
  }
  /**
   * Get the maximum attrition for this unit type (greater attrition than
   * this destroys the unit).
   *
   * @return The maximum attrition.
   */
  getMaximumAttrition(): number {
    return this.maximumAttrition;
  }
  /**
   * Get the type of goods this unit type has expert ability to produce.
   *
   * @return The expert production {@code GoodsType}.
   */
  getExpertProduction(): GoodsType {
    return this.expertProduction;
  }
  /**
   * Get the skill taught by this unit type.
   *
   * @return The skill taught by this unit type.
   */
  getSkillTaught(): UnitType {
    return this.skillTaught;
  }
  /**
   * Gets the default role of this unit type, mostly model.role.default.
   *
   * @return The default {@code Role}.
   */
  getDefaultRole(): Role {
    return this.defaultRole;
  }
  /**
   * Returns a list of roles for which a unit of this type is an
   * expert.
   *
   * @return a list of expert roles
   */
  getExpertRoles(): List<Role> {
    return CollectionUtils.transform$Stream$Predicate(this.getSpecification().getRoles(), CollectionUtils.matchKey$Object$Function(this, ($p0) => $p0.getExpertUnit()));
  }
  /**
   * Get a role identifier for display routines to use for this unit type.
   *
   * @return A suitable role identifier for display purposes.
   */
  getDisplayRoleId(): string {
    let r = CollectionUtils.first$Collection(this.getExpertRoles());
    return (r != null) ? r.getId() : Specification.DEFAULT_ROLE_ID;
  }
  /**
   * Get the type that this unit type can be educated to by a
   * teacher unit type, if any.
   *
   * @param teacherType The {@code UnitType} of the teacher.
   * @return The {@code UnitType} that this unit type can be educated
   *         to by the teacher unit type, or null if education is not possible.
   */
  getTeachingType(teacherType: UnitType): UnitType {
    let spec = this.getSpecification();
    let taught = teacherType.getSkillTaught();
    let taughtLevel = taught.getSkill();
    if (this.getSkill() >= taughtLevel) {
      return null;
    }
    let todo = new ArrayList();
    for (const $it0 = spec.getUnitChanges(UnitChangeType.EDUCATION, this).iterator(); $it0.hasNext(); ) {
      let uc = $it0.next();
      if (uc.to === taught) {
        return taught;
      }
      if (uc.to.getSkill() < taughtLevel) {
        todo.add(uc.to);
      }
    }
    for (const $it1 = todo.iterator(); $it1.hasNext(); ) {
      let ut = $it1.next();
      if (ut.getTeachingType(teacherType) != null) {
        return ut;
      }
    }
    return null;
  }
  /**
   * Is this a naval unit type?
   *
   * @return True if this is a naval unit type.
   */
  isNaval(): boolean {
    return this.hasAbility$String(Ability.NAVAL_UNIT);
  }
  /**
   * Is this a person, not a ship or wagon?
   *
   * @return True if this unit type represents a person
   */
  isPerson(): boolean {
    return this.hasAbility$String(Ability.PERSON);
  }
  /**
   * Is this unit type able to build a colony?
   *
   * @return True if this unit type can build colonies.
   */
  canBuildColony(): boolean {
    return this.hasAbility$String(Ability.FOUND_COLONY);
  }
  /**
   * Can this unit type move to the High Seas?
   *
   * ATM this is synonymous with being a naval unit, but we should use
   * this routine instead of isNaval() in case this changes.
   *
   * @return True if units of this type can move to the High Seas.
   */
  canMoveToHighSeas(): boolean {
    return this.isNaval();
  }
  /**
   * Does this UnitType have a skill?
   *
   * @return True if this unit type has a skill.
   */
  hasSkill(): boolean {
    return this.skill !== Constants.UNDEFINED;
  }
  /**
   * Does this UnitType have a price?
   *
   * @return True if the unit type has a price.
   */
  hasPrice(): boolean {
    return this.price_ !== Constants.UNDEFINED;
  }
  /**
   * Get the consumption map.
   *
   * @return The map of the consumed goods.
   */
  getConsumption(): TypeCountMap<GoodsType> {
    return this.consumption;
  }
  /**
   * Set the consumption map.
   *
   * @param consumption The new map of the consumed goods.
   */
  setConsumption(consumption: TypeCountMap<GoodsType>): void {
    this.consumption = consumption;
  }
  /**
   * Gets the number of units of the given GoodsType this UnitType
   * consumes per turn (when in a settlement).
   *
   * @param goodsType The {@code GoodsType} to consume.
   * @return The amount of goods consumed per turn.
   */
  getConsumptionOf(goodsType: GoodsType): number {
    return (this.consumption == null) ? 0 : this.consumption.getCount(goodsType);
  }
  /**
   * Add consumption.
   *
   * @param type   The {@code GoodsType} to consume.
   * @param amount The amount of goods to consume.
   */
  addConsumption(type$: GoodsType, amount: number): void {
    if (this.consumption == null) {
      this.consumption = new TypeCountMap()._TypeCountMap();
    }
    this.consumption.incrementCount(type$, amount);
  }
  /**
   * {@inheritDoc}
   */
  canBeBuiltInColony(colony: Colony, assumeBuilt: List<BuildableType>): Colony$NoBuildReason {
    if (!this.hasAbility$String(Ability.PERSON) && !colony.hasAbility$String$FreeColSpecObjectType(Ability.BUILD, this) && (CollectionUtils.none$Collection$Predicate(assumeBuilt, (bt) => bt.hasAbility$String$FreeColSpecObjectType(Ability.BUILD, this)))) {
      return Colony$NoBuildReason.MISSING_BUILD_ABILITY;
    }
    return Colony$NoBuildReason.NONE;
  }
  getMinimumIndex(colony: Colony, buildQueueList: JList<BuildableType>, UNABLE_TO_BUILD: number): number {
    let buildQueue = buildQueueList.getModel();
    if (colony.canBuild$BuildableType(this)) {
      return 0;
    }
    for (let index = 0; index < buildQueue.getSize(); index++) {
      if (buildQueue.getElementAt(index).hasAbility$String$FreeColSpecObjectType(Ability.BUILD, this)) {
        return (index + 1) | 0;
      }
    }
    return UNABLE_TO_BUILD;
  }
  getMaximumIndex(colony: Colony, buildQueueList: JList<BuildableType>, UNABLE_TO_BUILD: number): number {
    let buildQueue = buildQueueList.getModel();
    let buildQueueLastPos = buildQueue.getSize();
    let canBuild = false;
    if (colony.canBuild$BuildableType(this)) {
      canBuild = true;
    }
    if (canBuild) {
      return buildQueueLastPos;
    }
    for (let index = 0; index < buildQueue.getSize(); index++) {
      let toBuild = buildQueue.getElementAt(index);
      if (toBuild === this) {
        continue;
      }
      if (toBuild.hasAbility$String$FreeColSpecObjectType(Ability.BUILD, this)) {
        return buildQueueLastPos;
      }
    }
    return UNABLE_TO_BUILD;
  }
  /**
   * {@inheritDoc}
   */
  getConsumedGoods(): List<AbstractGoods> {
    return (this.consumption == null) ? Collections.emptyList() : CollectionUtils.transform$Collection$Predicate$Function(this.consumption.keySet(), (gt) => this.consumption.getCount(gt) !== 0, (gt) => new AbstractGoods()._AbstractGoods$GoodsType$int(gt, this.consumption.getCount(gt)));
  }
  /**
   * {@inheritDoc}
   */
  getPriority(): number {
    return this.priority;
  }
  getAttackRange(): number {
    return this.attackRange;
  }
  /**
   * Sets attack range (used by Introspector).
   */
  setAttackRange(attackRange: number): void {
    this.attackRange = attackRange;
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
  copyIn<T>(other: T): boolean {
    let o = this.copyInCast(other, $J.cls(UnitType));
    if (o == null || !super.copyIn(o)) {
      return false;
    }
    this.baseOffence = o.getBaseOffence();
    this.baseDefence = o.getBaseDefence();
    this.space = o.getSpace();
    this.defaultUnitType = o.isDefaultUnitType();
    this.hitPoints = o.getHitPoints();
    this.spaceTaken = o.getSpaceTaken();
    this.skill = o.getSkill();
    this.price_ = o.getPrice();
    this.movement = o.getMovement();
    this.lineOfSight = o.getLineOfSight();
    this.recruitProbability = o.getRecruitProbability();
    this.expertProduction = o.getExpertProduction();
    this.scoreValue = o.getScoreValue();
    this.maximumExperience = o.getMaximumExperience();
    this.maximumAttrition = o.getMaximumAttrition();
    this.priority = o.getPriority();
    this.skillTaught = o.getSkillTaught();
    this.defaultRole = o.getDefaultRole();
    this.consumption = o.getConsumption();
    return true;
  }
  /**
   * {@inheritDoc}
   */
  writeAttributes(xw: FreeColXMLWriter): void {
    super.writeAttributes(xw);
    xw.writeAttribute$String$int(UnitType.OFFENCE_TAG, this.baseOffence);
    xw.writeAttribute$String$int(UnitType.DEFENCE_TAG, this.baseDefence);
    xw.writeAttribute$String$boolean(UnitType.DEFAULT_UNIT_TAG, this.defaultUnitType);
    xw.writeAttribute$String$int(UnitType.MOVEMENT_TAG, this.movement);
    xw.writeAttribute$String$int(UnitType.LINE_OF_SIGHT_TAG, this.lineOfSight);
    xw.writeAttribute$String$int(UnitType.SCORE_VALUE_TAG, this.scoreValue);
    xw.writeAttribute$String$int(UnitType.SPACE_TAG, this.space);
    xw.writeAttribute$String$int(UnitType.SPACE_TAKEN_TAG, this.spaceTaken);
    xw.writeAttribute$String$int(UnitType.HIT_POINTS_TAG, this.hitPoints);
    xw.writeAttribute$String$int(UnitType.ATTACK_RANGE_TAG, this.attackRange);
    xw.writeAttribute$String$int(UnitType.MAXIMUM_EXPERIENCE_TAG, this.maximumExperience);
    if (this.hasMaximumAttrition()) {
      xw.writeAttribute$String$int(UnitType.MAXIMUM_ATTRITION_TAG, this.maximumAttrition);
    }
    xw.writeAttribute$String$int(UnitType.RECRUIT_PROBABILITY_TAG, this.recruitProbability);
    if (this.hasSkill()) {
      xw.writeAttribute$String$int(UnitType.SKILL_TAG, this.skill);
    }
    if (this.hasPrice()) {
      xw.writeAttribute$String$int(UnitType.PRICE_TAG, this.price_);
    }
    if (this.mercenaryPrice !== Constants.UNDEFINED) {
      xw.writeAttribute$String$int(UnitType.MERCENARY_PRICE_TAG, this.mercenaryPrice);
    }
    xw.writeAttribute$String$FreeColObject(UnitType.SKILL_TAUGHT_TAG, this.skillTaught);
    if (this.expertProduction != null) {
      xw.writeAttribute$String$FreeColObject(UnitType.EXPERT_PRODUCTION_TAG, this.expertProduction);
    }
    xw.writeAttribute$String$int(UnitType.PRIORITY_TAG, this.priority);
  }
  /**
   * {@inheritDoc}
   */
  writeChildren(xw: FreeColXMLWriter): void {
    super.writeChildren(xw);
    let spec = this.getSpecification();
    if (this.defaultRole != null && this.defaultRole !== spec.getDefaultRole()) {
      xw.writeStartElement(UnitType.DEFAULT_ROLE_TAG);
      xw.writeAttribute$String$FreeColObject(FreeColObject.ID_ATTRIBUTE_TAG, this.defaultRole);
      xw.writeEndElement();
    }
    if (this.consumption != null) {
      for (const $it2 = this.consumption.keySet().iterator(); $it2.hasNext(); ) {
        let goodsType = $it2.next();
        xw.writeStartElement(UnitType.CONSUMES_TAG);
        xw.writeAttribute$String$FreeColObject(FreeColObject.ID_ATTRIBUTE_TAG, goodsType);
        xw.writeAttribute$String$int(FreeColObject.VALUE_TAG, this.consumption.getCount(goodsType));
        xw.writeEndElement();
      }
    }
  }
  /**
   * {@inheritDoc}
   */
  readAttributes(xr: FreeColXMLReader): void {
    super.readAttributes(xr);
    let spec = this.getSpecification();
    let parent = xr.getAlreadyInitializedType(spec, FreeColSpecObjectType.EXTENDS_TAG, $J.cls(UnitType), this);
    this.baseOffence = xr.getAttribute$String$int(UnitType.OFFENCE_TAG, parent.baseOffence);
    this.baseDefence = xr.getAttribute$String$int(UnitType.DEFENCE_TAG, parent.baseDefence);
    if (xr.hasAttribute(UnitType.OLD_DEFAULT_UNIT_TAG)) {
      this.defaultUnitType = xr.getAttribute$String$boolean(UnitType.OLD_DEFAULT_UNIT_TAG, false);
    } else {
      this.defaultUnitType = xr.getAttribute$String$boolean(UnitType.DEFAULT_UNIT_TAG, false);
    }
    this.movement = xr.getAttribute$String$int(UnitType.MOVEMENT_TAG, parent.movement);
    if (xr.hasAttribute(UnitType.OLD_LINE_OF_SIGHT_TAG)) {
      this.lineOfSight = xr.getAttribute$String$int(UnitType.OLD_LINE_OF_SIGHT_TAG, parent.lineOfSight);
    } else {
      this.lineOfSight = xr.getAttribute$String$int(UnitType.LINE_OF_SIGHT_TAG, parent.lineOfSight);
    }
    if (xr.hasAttribute(UnitType.OLD_SCORE_VALUE_TAG)) {
      this.scoreValue = xr.getAttribute$String$int(UnitType.OLD_SCORE_VALUE_TAG, parent.scoreValue);
    } else {
      this.scoreValue = xr.getAttribute$String$int(UnitType.SCORE_VALUE_TAG, parent.scoreValue);
    }
    this.space = xr.getAttribute$String$int(UnitType.SPACE_TAG, parent.space);
    if (xr.hasAttribute(UnitType.OLD_HIT_POINTS_TAG)) {
      this.hitPoints = xr.getAttribute$String$int(UnitType.OLD_HIT_POINTS_TAG, parent.hitPoints);
    } else {
      this.hitPoints = xr.getAttribute$String$int(UnitType.HIT_POINTS_TAG, parent.hitPoints);
    }
    this.attackRange = xr.getAttribute$String$int(UnitType.ATTACK_RANGE_TAG, parent.attackRange);
    if (xr.hasAttribute(UnitType.OLD_SPACE_TAKEN_TAG)) {
      this.spaceTaken = xr.getAttribute$String$int(UnitType.OLD_SPACE_TAKEN_TAG, parent.spaceTaken);
    } else {
      this.spaceTaken = xr.getAttribute$String$int(UnitType.SPACE_TAKEN_TAG, parent.spaceTaken);
    }
    if (xr.hasAttribute(UnitType.OLD_MAXIMUM_EXPERIENCE_TAG)) {
      this.maximumExperience = xr.getAttribute$String$int(UnitType.OLD_MAXIMUM_EXPERIENCE_TAG, parent.maximumExperience);
    } else {
      this.maximumExperience = xr.getAttribute$String$int(UnitType.MAXIMUM_EXPERIENCE_TAG, parent.maximumExperience);
    }
    if (xr.hasAttribute(UnitType.OLD_MAXIMUM_ATTRITION_TAG)) {
      this.maximumAttrition = xr.getAttribute$String$int(UnitType.OLD_MAXIMUM_ATTRITION_TAG, parent.maximumAttrition);
    } else {
      this.maximumAttrition = xr.getAttribute$String$int(UnitType.MAXIMUM_ATTRITION_TAG, parent.maximumAttrition);
    }
    if (xr.hasAttribute(UnitType.OLD_SKILL_TAUGHT_TAG)) {
      this.skillTaught = xr.getType(spec, UnitType.OLD_SKILL_TAUGHT_TAG, $J.cls(UnitType), this);
    } else {
      this.skillTaught = xr.getType(spec, UnitType.SKILL_TAUGHT_TAG, $J.cls(UnitType), this);
    }
    if (xr.hasAttribute(UnitType.OLD_RECRUIT_PROBABILITY_TAG)) {
      this.recruitProbability = xr.getAttribute$String$int(UnitType.OLD_RECRUIT_PROBABILITY_TAG, parent.recruitProbability);
    } else {
      this.recruitProbability = xr.getAttribute$String$int(UnitType.RECRUIT_PROBABILITY_TAG, parent.recruitProbability);
    }
    this.priority = xr.getAttribute$String$int(UnitType.PRIORITY_TAG, Consumer.UNIT_PRIORITY);
    this.skill = xr.getAttribute$String$int(UnitType.SKILL_TAG, parent.skill);
    this.price_ = xr.getAttribute$String$int(UnitType.PRICE_TAG, parent.price_);
    this.mercenaryPrice = xr.getAttribute$String$int(UnitType.MERCENARY_PRICE_TAG, parent.mercenaryPrice);
    this.expertProduction = xr.getType(spec, UnitType.EXPERT_PRODUCTION_TAG, $J.cls(GoodsType), parent.expertProduction);
    if (parent !== this) {
      if (!xr.hasAttribute(BuildableType.REQUIRED_POPULATION_TAG)) {
        this.setRequiredPopulation(parent.getRequiredPopulation());
      }
    }
  }
  /**
   * {@inheritDoc}
   */
  clearContainers$FreeColXMLReader(xr: FreeColXMLReader): void {
    super.clearContainers$FreeColXMLReader(xr);
    this.consumption = null;
  }
  /**
   * {@inheritDoc}
   */
  readChildren(xr: FreeColXMLReader): void {
    let spec = this.getSpecification();
    this.defaultRole = spec.getDefaultRole();
    let parent = xr.getAlreadyInitializedType(spec, FreeColSpecObjectType.EXTENDS_TAG, $J.cls(UnitType), this);
    if (parent !== this) {
      this.defaultRole = parent.defaultRole;
      if (parent.consumption != null) {
        if (this.consumption == null) {
          this.consumption = new TypeCountMap()._TypeCountMap();
        }
        this.consumption.putAll(parent.consumption);
      }
      this.addFeatures(parent);
      if (parent.isAbstractType()) {
        this.getFeatureContainer().replaceSource(parent, this);
      }
    }
    super.readChildren(xr);
  }
  /**
   * {@inheritDoc}
   */
  readChild(xr: FreeColXMLReader): void {
    let spec = this.getSpecification();
    let tag = xr.getLocalName();
    if ($J.equals(UnitType.CONSUMES_TAG, tag)) {
      this.addConsumption(xr.getType(spec, FreeColObject.ID_ATTRIBUTE_TAG, $J.cls(GoodsType), null), xr.getAttribute$String$int(FreeColObject.VALUE_TAG, Constants.UNDEFINED));
      xr.closeTag$String(UnitType.CONSUMES_TAG);
    } else if ($J.equals(UnitType.OLD_DEFAULT_EQUIPMENT_TAG, tag)) {
      xr.swallowTag(UnitType.OLD_DEFAULT_EQUIPMENT_TAG);
    } else if ($J.equals(UnitType.DEFAULT_ROLE_TAG, tag)) {
      this.defaultRole = xr.getType(spec, FreeColObject.ID_ATTRIBUTE_TAG, $J.cls(Role), spec.getDefaultRole());
      xr.closeTag$String(UnitType.DEFAULT_ROLE_TAG);
    } else if ($J.equals(UnitType.DOWNGRADE_TAG, tag) || $J.equals(UnitType.UPGRADE_TAG, tag)) {
      xr.closeTag$String$StringArr(tag, [Scope.TAG]);
    } else {
      super.readChild(xr);
    }
  }
  /**
   * {@inheritDoc}
   */
  getXMLTagName(): string {
    return UnitType.TAG;
  }
  /**
   * {@inheritDoc}
   */
  toString(): string {
    return this.getId();
  }
  static $clinit() {
    UnitType.defenceComparator = Comparator.comparingDouble(($p0) => $p0.getDefence());
  }
}

$J.define(UnitType, 'net.sf.freecol.common.model.UnitType', { kind: 'class', ifaces: ['net.sf.freecol.common.model.Consumer'], sup: 'net.sf.freecol.common.model.BuildableType', ctors: { 'java.lang.String,net.sf.freecol.common.model.Specification': '_UnitType' }, returns: { 'getXMLTagName': 'java.lang.String', 'getAttackRange': 'int', 'getPriority': 'int', 'getConsumedGoods': 'java.util.List', 'getConsumption': 'net.sf.freecol.common.model.TypeCountMap', 'hasPrice': 'boolean', 'hasSkill': 'boolean', 'isPerson': 'boolean', 'isNaval': 'boolean', 'getDisplayRoleId': 'java.lang.String', 'getExpertRoles': 'java.util.List', 'getDefaultRole': 'net.sf.freecol.common.model.Role', 'getSkillTaught': 'net.sf.freecol.common.model.UnitType', 'getExpertProduction': 'net.sf.freecol.common.model.GoodsType', 'getMaximumAttrition': 'int', 'hasMaximumAttrition': 'boolean', 'getMaximumExperience': 'int', 'getMovement': 'int', 'getMercenaryPrice': 'int', 'getPrice': 'int', 'getSkill': 'int', 'getRecruitProbability': 'int', 'isRecruitable': 'boolean', 'getSpaceTaken': 'int', 'getHitPoints': 'int', 'getSpace': 'int', 'getLineOfSight': 'int', 'isDefaultUnitType': 'boolean', 'isDefensive': 'boolean', 'getDefence': 'double', 'getBaseDefence': 'int', 'isOffensive': 'boolean', 'getOffence': 'double', 'getBaseOffence': 'int', 'getScoreValue': 'int', 'getWorkingAsKey': 'java.lang.String' }, meths: { 'clearContainers(net.sf.freecol.common.io.FreeColXMLReader)': 'clearContainers$FreeColXMLReader' }, clinit: true, lazy: ['defenceComparator'] });
$J.module(() => {
  Ability = $J.load('net.sf.freecol.common.model.Ability');
  AbstractGoods = $J.load('net.sf.freecol.common.model.AbstractGoods');
  Colony$NoBuildReason = $J.load('net.sf.freecol.common.model.Colony$NoBuildReason');
  Constants = $J.load('net.sf.freecol.common.model.Constants');
  Consumer = $J.load('net.sf.freecol.common.model.Consumer');
  FreeColObject = $J.load('net.sf.freecol.common.model.FreeColObject');
  FreeColSpecObjectType = $J.load('net.sf.freecol.common.model.FreeColSpecObjectType');
  GoodsType = $J.load('net.sf.freecol.common.model.GoodsType');
  Modifier = $J.load('net.sf.freecol.common.model.Modifier');
  Role = $J.load('net.sf.freecol.common.model.Role');
  Scope = $J.load('net.sf.freecol.common.model.Scope');
  Specification = $J.load('net.sf.freecol.common.model.Specification');
  TypeCountMap = $J.load('net.sf.freecol.common.model.TypeCountMap');
  UnitChangeType = $J.load('net.sf.freecol.common.model.UnitChangeType');
  CollectionUtils = $J.load('net.sf.freecol.common.util.CollectionUtils');
});
