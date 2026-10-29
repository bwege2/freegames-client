// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/common/model/Role.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J, ArrayList, Comparator, JObject, StringBuilder } from '../../../../../../jre/index.ts';
import { BuildableType } from './BuildableType.ts';

let Ability, AbstractGoods, Colony$NoBuildReason, Modifier, Specification, UnitType, CollectionUtils, StringUtils;

/**
 * The role of a unit.
 */
export class Role extends BuildableType {
  static readonly TAG: string = 'role';
  /**
   * A comparator to order roles by descending total military
   * effectiveness.
   */
  static militaryComparator: Comparator<Role> = null;
  /**
   * The Role to downgrade to after losing a battle. Defaults to
   * {@code null}. Note that some UnitTypes and Roles may be
   * disposed instead of downgraded when losing a battle.
   */
  downgrade_: Role = null;
  /**
   * The maximum multiple of required goods this Role may
   * carry.  Defaults to {@code 1}.
   */
  maximumCount: number = 0;
  /**
   * The expert unit for this Role, e.g. a hardy pioneer is an
   * expert for the pioneer role.
   */
  expertUnit: UnitType = null;
  /**
   * The role changes by capture available for this role.
   */
  roleChanges: List<Role$RoleChange> = null;
  static readonly CAPTURE_TAG: string = 'capture';
  static readonly DOWNGRADE_TAG: string = 'downgrade';
  static readonly FROM_TAG: string = 'from';
  static readonly EXPERT_UNIT_TAG: string = 'expert-unit';
  static readonly MAXIMUM_COUNT_TAG: string = 'maximum-count';
  static readonly ROLE_CHANGE_TAG: string = 'role-change';
  static readonly OLD_EXPERT_UNIT_TAG: string = 'expertUnit';
  static readonly OLD_MAXIMUM_COUNT_TAG: string = 'maximumCount';
  /**
   * Creates a new {@code Role} instance.
   *
   * @param id The object identifier.
   * @param specification The {@code Specification} to refer to.
   */
  _Role(id: string, specification: Specification): this {
    this._BuildableType(id, specification);
    this.maximumCount = 1;
    this.expertUnit = null;
    this.roleChanges = null;
    return this;
  }
  /**
   * Is this the default role?
   *
   * @param roleId The role identifier to test.
   * @return True if this is the default role.
   */
  static isDefaultRoleId(roleId: string): boolean {
    return $J.equals(Specification.DEFAULT_ROLE_ID, roleId);
  }
  /**
   * Is this the default role?
   *
   * @return True if this is the default role.
   */
  isDefaultRole(): boolean {
    return Role.isDefaultRoleId(this.getId());
  }
  /**
   * Get the last part of a role identifier.
   *
   * @return The role suffix.
   */
  getRoleSuffix(): string {
    return Role.getRoleIdSuffix(this.getId());
  }
  /**
   * Get the last part of a role identifier.
   *
   * @param roleId A role identifier.
   * @return The role suffix.
   */
  static getRoleIdSuffix(roleId: string): string {
    return StringUtils.lastPart(roleId, '.');
  }
  /**
   * Get the downgraded role from this one.
   *
   * @return The downgraded role.
   */
  getDowngrade(): Role {
    return this.downgrade_;
  }
  /**
   * Sets the downgraded role.
   *
   * @param newDowngrade The new downgraded role.
   */
  setDowngrade(newDowngrade: Role): void {
    this.downgrade_ = newDowngrade;
  }
  /**
   * Gets the maximum goods count for the role.
   *
   * @return The maximum goods count.
   */
  getMaximumCount(): number {
    return this.maximumCount;
  }
  /**
   * Sets the maximum goods count for this role.
   *
   * @param newMaximumCount The new maximum goods count.
   */
  setMaximumCount(newMaximumCount: number): void {
    this.maximumCount = newMaximumCount;
  }
  /**
   * Gets the expert profession for this role.
   *
   * @return The expert type.
   */
  getExpertUnit(): UnitType {
    return this.expertUnit;
  }
  /**
   * Sets the expert profession for this role.
   *
   * @param newExpertUnit The new expert type.
   */
  setExpertUnit(newExpertUnit: UnitType): void {
    this.expertUnit = newExpertUnit;
  }
  /**
   * Get the required goods for this role, considering also the role count.
   *
   * @param roleCount The role count.
   * @return A list of required goods.
   */
  getRequiredGoodsList$int(roleCount: number): List<AbstractGoods> {
    let result = this.getRequiredGoodsList$();
    if (roleCount > 1 && !result.isEmpty()) {
      for (const $it0 = result.iterator(); $it0.hasNext(); ) {
        let ag = $it0.next();
        ag.setAmount(Math.imul(roleCount, ag.getAmount()));
      }
    }
    return result;
  }
  /**
   * Get the required goods for this role, considering also the role count,
   * as a stream.
   *
   * @param roleCount The role count.
   * @return A stream of required goods.
   */
  getRequiredGoods$int(roleCount: number): Stream<AbstractGoods> {
    return this.getRequiredGoodsList$int(roleCount).stream();
  }
  /**
   * Get the price of the required goods in a given market.
   *
   * @param market The {@code Market} to evaluate in.
   * @return The price of the goods for this role.
   */
  getRequiredGoodsPrice(market: Market): number {
    return CollectionUtils.sum$Stream$ToIntFunction(this.getRequiredGoods$(), (ag) => market.getBidPrice(ag.getType(), Math.imul(ag.getAmount(), this.getMaximumCount())));
  }
  /**
   * Get the role changes that can allow a unit to assume this role.
   *
   * @return A list of {@code RoleChange}s.
   */
  getRoleChanges(): List<Role$RoleChange> {
    if (this.roleChanges == null) {
      this.roleChanges = new ArrayList();
    }
    return this.roleChanges;
  }
  /**
   * Set the role change list.
   *
   * @param roleChanges The new list of {@code RoleChange}s.
   */
  setRoleChanges(roleChanges: List<Role$RoleChange>): void {
    if (this.roleChanges == null) {
      this.roleChanges = new ArrayList();
    } else {
      this.roleChanges.clear();
    }
    this.roleChanges.addAll(roleChanges);
  }
  /**
   * Add a new role change.
   *
   * @param from The source role identifier.
   * @param capture The identifier for the role to capture.
   */
  addRoleChange(from: string, capture: string): void {
    if (this.roleChanges == null) {
      this.roleChanges = new ArrayList();
    }
    this.roleChanges.add(new Role$RoleChange()._Role$RoleChange(from, capture));
  }
  /**
   * Get the offense value for this role.
   *
   * @return The offense value.
   */
  getOffence(): number {
    return this.apply$float$Turn$String(0, null, Modifier.OFFENCE);
  }
  /**
   * Is this an offensive role?
   *
   * @return True if this is an offensive role.
   */
  isOffensive(): boolean {
    return this.hasModifier$String(Modifier.OFFENCE);
  }
  /**
   * Get the defence value for this role.
   *
   * @return The defence value.
   */
  getDefence(): number {
    return this.apply$float$Turn$String(0, null, Modifier.DEFENCE);
  }
  /**
   * Is this an defensive role?
   *
   * @return True if this is an defensive role.
   */
  isDefensive(): boolean {
    return this.hasModifier$String(Modifier.DEFENCE);
  }
  /**
   * Is this role compatible with another?
   *
   * @param other The other {@code Role} to compare with.
   * @return True if the other role is compatible.
   */
  isCompatibleWith(other: Role): boolean {
    return Role.rolesCompatible(this, other);
  }
  /**
   * Are two roles compatible.
   *
   * @param role1 A {@code Role} to compare.
   * @param role2 The other {@code Role} to compare.
   * @return True if the roles are compatible.
   */
  static rolesCompatible(role1: Role, role2: Role): boolean {
    if (role1 == null) {
      return role2 == null;
    } else if (role2 == null) {
      return false;
    } else {
      return role1 === role2 || role1.getDowngrade() === role2 || role2.getDowngrade() === role1;
    }
  }
  /**
   * Gets a list of goods required to change from the first role to
   * the second.  The first role may be {@code null} implying
   * the default role, the second must not.  Note that excess goods
   * that are left over after the change will appear on the list
   * with negative amounts.
   *
   * @param from The current {@code Role}.
   * @param fromCount The role count for the current role.
   * @param to The new {@code Role} to assume.
   * @param toCount The role count for the new role.
   * @return A list of {@code AbstractGoods} required to
   *     make the change.
   */
  static getGoodsDifference(from: Role, fromCount: number, to: Role, toCount: number): List<AbstractGoods> {
    let result = new ArrayList();
    if (from !== to && !(from == null && to.isDefaultRole())) {
      let fromGoods = (from == null) ? new ArrayList() : from.getRequiredGoodsList$int(fromCount);
      let toGoods = to.getRequiredGoodsList$int(toCount);
      for (const $it1 = toGoods.iterator(); $it1.hasNext(); ) {
        let ag = $it1.next();
        let amount = (ag.getAmount() - AbstractGoods.getCount(ag.getType(), fromGoods)) | 0;
        if (amount !== 0) {
          result.add(new AbstractGoods()._AbstractGoods$GoodsType$int(ag.getType(), amount));
        }
      }
      result.addAll(CollectionUtils.transform$Collection$Predicate$Function(fromGoods, (ag) => !CollectionUtils.any$Collection$Predicate(toGoods, AbstractGoods.matches(ag.getType())), (ag) => new AbstractGoods()._AbstractGoods$GoodsType$int(ag.getType(), -ag.getAmount())));
    }
    return result;
  }
  /**
   * Establish a simple ordering.
   *
   * Normal roles, then REF-specific roles, then native-specific
   * roles.  Reduce by role-specific equipment amounts to
   * further separate the levels such that the heavier armed roles
   * sort first.
   *
   * @return A role index.
   */
  getRoleIndex(): number {
    let base = (this.requiresAbility(Ability.NATIVE)) ? 30 : (this.requiresAbility(Ability.REF_UNIT)) ? 20 : 10;
    return (base - this.getRequiredGoodsList$().size()) | 0;
  }
  /**
   * Filter a list of proposed roles by availability.
   *
   * @param player The {@code Player} to own the unit.
   * @param type The {@code UnitType} to check.
   * @param roles A list of proposed {@code Role}s.
   * @return A list of available {@code Role}s.
   */
  static getAvailableRoles(player: Player, type$: UnitType, roles: List<Role>): List<Role> {
    return CollectionUtils.transform$Collection$Predicate(roles, (r) => r.isAvailableTo([player, type$]));
  }
  /**
   * Longer format debug helper.
   *
   * @return A more detailed description of this role.
   */
  toFullString(): string {
    let sb = new StringBuilder(32);
    sb.append('[Role ').append(this.getSuffix$());
    CollectionUtils.forEachMapEntry$Map$Consumer(this.getRequiredAbilities(), (e) => sb.append(String.fromCharCode(32 /* ' ' */)).append(e.getKey()).append(String.fromCharCode(61 /* '=' */)).append($J.str(e.getValue())));
    sb.append(String.fromCharCode(93 /* ']' */));
    return sb.toString();
  }
  /**
   * {@inheritDoc}
   */
  canBeBuiltInColony(colony: Colony, assumeBuilt: List<BuildableType>): Colony$NoBuildReason {
    return Colony$NoBuildReason.NONE;
  }
  /**
   * {@inheritDoc}
   */
  copyIn<T>(other: T): boolean {
    let o = this.copyInCast(other, $J.cls(Role));
    if (o == null || !super.copyIn(o)) {
      return false;
    }
    this.downgrade_ = o.getDowngrade();
    this.maximumCount = o.getMaximumCount();
    this.expertUnit = o.getExpertUnit();
    this.setRoleChanges(o.getRoleChanges());
    return true;
  }
  /**
   * {@inheritDoc}
   */
  writeAttributes(xw: FreeColXMLWriter): void {
    super.writeAttributes(xw);
    if (this.downgrade_ != null) {
      xw.writeAttribute$String$FreeColObject(Role.DOWNGRADE_TAG, this.downgrade_);
    }
    if (this.expertUnit != null) {
      xw.writeAttribute$String$FreeColObject(Role.EXPERT_UNIT_TAG, this.expertUnit);
    }
    if (this.maximumCount > 1) {
      xw.writeAttribute$String$int(Role.MAXIMUM_COUNT_TAG, this.maximumCount);
    }
  }
  /**
   * {@inheritDoc}
   */
  writeChildren(xw: FreeColXMLWriter): void {
    super.writeChildren(xw);
    for (const $it2 = this.getRoleChanges().iterator(); $it2.hasNext(); ) {
      let rc = $it2.next();
      xw.writeStartElement(Role.ROLE_CHANGE_TAG);
      xw.writeAttribute(Role.FROM_TAG, rc.from);
      xw.writeAttribute(Role.CAPTURE_TAG, rc.capture);
      xw.writeEndElement();
    }
  }
  /**
   * {@inheritDoc}
   */
  readAttributes(xr: FreeColXMLReader): void {
    super.readAttributes(xr);
    let spec = this.getSpecification();
    this.downgrade_ = xr.getType(spec, Role.DOWNGRADE_TAG, $J.cls(Role), null);
    if (xr.hasAttribute(Role.OLD_EXPERT_UNIT_TAG)) {
      this.expertUnit = xr.getType(spec, Role.OLD_EXPERT_UNIT_TAG, $J.cls(UnitType), null);
    } else {
      this.expertUnit = xr.getType(spec, Role.EXPERT_UNIT_TAG, $J.cls(UnitType), null);
    }
    if (xr.hasAttribute(Role.OLD_MAXIMUM_COUNT_TAG)) {
      this.maximumCount = xr.getAttribute$String$int(Role.OLD_MAXIMUM_COUNT_TAG, 1);
    } else {
      this.maximumCount = xr.getAttribute$String$int(Role.MAXIMUM_COUNT_TAG, 1);
    }
  }
  /**
   * {@inheritDoc}
   */
  clearContainers$FreeColXMLReader(xr: FreeColXMLReader): void {
    super.clearContainers$FreeColXMLReader(xr);
    this.roleChanges = null;
  }
  /**
   * {@inheritDoc}
   */
  readChildren(xr: FreeColXMLReader): void {
    super.readChildren(xr);
  }
  /**
   * {@inheritDoc}
   */
  readChild(xr: FreeColXMLReader): void {
    let tag = xr.getLocalName();
    if ($J.equals(Role.ROLE_CHANGE_TAG, tag)) {
      let from = xr.getAttribute$String$String(Role.FROM_TAG, null);
      let capture = xr.getAttribute$String$String(Role.CAPTURE_TAG, null);
      this.addRoleChange(from, capture);
      xr.closeTag$String(Role.ROLE_CHANGE_TAG);
    } else {
      super.readChild(xr);
    }
  }
  /**
   * {@inheritDoc}
   */
  getXMLTagName(): string {
    return Role.TAG;
  }
  static $clinit() {
    Role.militaryComparator = Comparator.reversed((Comparator.comparingDouble((r) => r.getOffence() + r.getDefence())));
  }
}

/**
 * Container for valid role changes.
 */
export class Role$RoleChange extends JObject {
  from: string = null;
  capture: string = null;
  _Role$RoleChange(from: string, capture: string): this {
    this.from = from;
    this.capture = capture;
    return this;
  }
  getFrom(spec: Specification): Role {
    return spec.getRole(this.from);
  }
  getCapture(spec: Specification): Role {
    return spec.getRole(this.capture);
  }
}

$J.define(Role, 'net.sf.freecol.common.model.Role', { kind: 'class', sup: 'net.sf.freecol.common.model.BuildableType', ctors: { 'java.lang.String,net.sf.freecol.common.model.Specification': '_Role' }, returns: { 'getXMLTagName': 'java.lang.String', 'getRoleIndex': 'int', 'isDefensive': 'boolean', 'getDefence': 'double', 'isOffensive': 'boolean', 'getOffence': 'double', 'getRoleChanges': 'java.util.List', 'getExpertUnit': 'net.sf.freecol.common.model.UnitType', 'getMaximumCount': 'int', 'getDowngrade': 'net.sf.freecol.common.model.Role', 'getRoleSuffix': 'java.lang.String', 'isDefaultRole': 'boolean' }, meths: { 'clearContainers(net.sf.freecol.common.io.FreeColXMLReader)': 'clearContainers$FreeColXMLReader', 'getRequiredGoods(int)': 'getRequiredGoods$int', 'getRequiredGoodsList(int)': 'getRequiredGoodsList$int' }, clinit: true, lazy: ['militaryComparator'] });
$J.define(Role$RoleChange, 'net.sf.freecol.common.model.Role$RoleChange', { kind: 'class', sup: 'java.lang.Object', ctors: { 'java.lang.String,java.lang.String': '_Role$RoleChange' } });
$J.module(() => {
  Ability = $J.load('net.sf.freecol.common.model.Ability');
  AbstractGoods = $J.load('net.sf.freecol.common.model.AbstractGoods');
  Colony$NoBuildReason = $J.load('net.sf.freecol.common.model.Colony$NoBuildReason');
  Modifier = $J.load('net.sf.freecol.common.model.Modifier');
  Specification = $J.load('net.sf.freecol.common.model.Specification');
  UnitType = $J.load('net.sf.freecol.common.model.UnitType');
  CollectionUtils = $J.load('net.sf.freecol.common.util.CollectionUtils');
  StringUtils = $J.load('net.sf.freecol.common.util.StringUtils');
});
