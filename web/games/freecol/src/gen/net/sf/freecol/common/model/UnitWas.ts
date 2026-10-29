// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/common/model/UnitWas.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J, JString, Logger } from '../../../../../../jre/index.ts';
import { ObjectWas } from './ObjectWas.ts';

let AbstractGoods, Building, Colony$ColonyChangeEvent, ColonyTile, Europe, Tile, Unit, WorkLocation, Utils;

/**
 * Helper container to remember a unit state prior to some change,
 * and fire off any consequent property changes.
 */
export class UnitWas extends ObjectWas {
  static logger: Logger = null;
  unit: Unit = null;
  type: UnitType = null;
  role: Role = null;
  roleCount: number = 0;
  loc: Location = null;
  work_: GoodsType = null;
  workAmount: number = 0;
  movesLeft: number = 0;
  units: List<Unit> = null;
  colony: Colony = null;
  /**
   * Record the state of a unit.
   *
   * @param unit The {@code Unit} to remember.
   */
  _UnitWas(unit: Unit): this {
    this._ObjectWas();
    this.unit = unit;
    this.type = unit.getType();
    this.role = unit.getRole();
    this.roleCount = unit.getRoleCount();
    this.loc = unit.getLocation();
    this.work_ = unit.getWorkType();
    this.workAmount = this.getAmount(this.loc, this.work_);
    this.movesLeft = unit.getMovesLeft();
    this.units = unit.getUnitList();
    this.colony = unit.getColony();
    if (unit.getGoodsContainer() != null) {
      unit.getGoodsContainer().saveState();
    }
    return this;
  }
  getUnit(): Unit {
    return this.unit;
  }
  getLocation(): Location {
    return this.loc;
  }
  getWorkType(): GoodsType {
    return this.work_;
  }
  /**
   * {@inheritDoc}
   */
  fireChanges(): boolean {
    let newType = null;
    let newRole = null;
    let newRoleCount = 0;
    let newLoc = null;
    let newWork = null;
    let newWorkAmount = 0;
    let newMovesLeft = 0;
    let ret = false;
    if (!this.unit.isDisposed()) {
      newLoc = this.unit.getLocation();
      if (this.colony != null) {
        newType = this.unit.getType();
        newRole = this.unit.getRole();
        newRoleCount = this.unit.getRoleCount();
        newWork = this.unit.getWorkType();
        newWorkAmount = (newWork == null) ? 0 : this.getAmount(newLoc, newWork);
      }
      newMovesLeft = this.unit.getMovesLeft();
    }
    let oldFcgo = this.loc;
    let newFcgo = newLoc;
    if (this.loc !== newLoc) {
      oldFcgo.firePropertyChange$String$Object$Object(this.change(oldFcgo), this.unit, null);
      if (newLoc != null) {
        newFcgo.firePropertyChange$String$Object$Object(this.change(newFcgo), null, this.unit);
      }
      ret = true;
    }
    if (this.colony != null) {
      if (this.type !== newType && newType != null) {
        let pc = Colony$ColonyChangeEvent.UNIT_TYPE_CHANGE.toString();
        this.colony.firePropertyChange$String$Object$Object(pc, this.type, newType);
        ret = true;
      } else if (this.role !== newRole && newRole != null) {
        let pc = Tile.UNIT_CHANGE;
        this.colony.firePropertyChange$String$Object$Object(pc, this.role.toString(), newRole.toString());
        ret = true;
      }
      if (this.work_ !== newWork) {
        if (this.work_ != null && oldFcgo != null && this.workAmount !== 0) {
          oldFcgo.firePropertyChange$String$int$int(this.work_.getId(), this.workAmount, 0);
        }
        if (newWork != null && newFcgo != null && newWorkAmount !== 0) {
          newFcgo.firePropertyChange$String$int$int(newWork.getId(), 0, newWorkAmount);
        }
        ret = true;
      } else if (this.workAmount !== newWorkAmount) {
        newFcgo.firePropertyChange$String$int$int(newWork.getId(), this.workAmount, newWorkAmount);
        ret = true;
      }
    }
    if (this.role !== newRole && newRole != null) {
      this.unit.firePropertyChange$String$Object$Object(Unit.ROLE_CHANGE, this.role, newRole);
      ret = true;
    } else if (this.roleCount !== newRoleCount && newRoleCount >= 0) {
      this.unit.firePropertyChange$String$int$int(Unit.ROLE_CHANGE, this.roleCount, newRoleCount);
      ret = true;
    }
    if (this.unit.getGoodsContainer() != null) {
      ret = !!(ret | this.unit.getGoodsContainer().fireChanges());
    }
    if (!this.units.equals(this.unit.getUnitList())) {
      this.unit.firePropertyChange$String$Object$Object(Unit.CARGO_CHANGE, null, this.unit);
      ret = true;
    }
    if (this.movesLeft !== newMovesLeft) {
      this.unit.firePropertyChange$String$int$int(Unit.MOVE_CHANGE, this.movesLeft, newMovesLeft);
      ret = true;
    }
    return ret;
  }
  change(fcgo: FreeColGameObject): string {
    return (fcgo instanceof Tile) ? Tile.UNIT_CHANGE : (fcgo instanceof Europe) ? Europe.UNIT_CHANGE : (fcgo instanceof ColonyTile) ? ColonyTile.UNIT_CHANGE : (fcgo instanceof Building) ? Building.UNIT_CHANGE : (fcgo instanceof Unit) ? Unit.CARGO_CHANGE : null;
  }
  getAmount(location: Location, goodsType: GoodsType): number {
    if (goodsType == null) {
      return 0;
    }
    if (location instanceof WorkLocation) {
      let info = (location).getProductionInfo();
      return AbstractGoods.getCount(goodsType, info.getProduction());
    }
    return 0;
  }
  /**
   * {@inheritDoc}
   */
  compareTo(uw: UnitWas): number {
    let roles = this.unit.getAvailableRolesList(null);
    let cmp = ((uw.loc).getUnitCapacity() - (this.loc).getUnitCapacity()) | 0;
    if (cmp === 0) {
      cmp = (roles.indexOf(this.role) - roles.indexOf(uw.role)) | 0;
    }
    return cmp;
  }
  /**
   * {@inheritDoc}
   */
  equals(o: any): boolean {
    if (o instanceof UnitWas) {
      let other = o;
      return this.compareTo(other) === 0 && super.equals(other);
    }
    return false;
  }
  /**
   * {@inheritDoc}
   */
  hashCode(): number {
    let hash = super.hashCode();
    hash = (Math.imul(37, hash) + Utils.hashCode(this.unit)) | 0;
    hash = (Math.imul(37, hash) + Utils.hashCode(this.type)) | 0;
    hash = (Math.imul(37, hash) + Utils.hashCode(this.role)) | 0;
    hash = (Math.imul(37, hash) + this.roleCount) | 0;
    hash = (Math.imul(37, hash) + Utils.hashCode(this.loc)) | 0;
    hash = (Math.imul(37, hash) + Utils.hashCode(this.work_)) | 0;
    hash = (Math.imul(37, hash) + this.workAmount) | 0;
    hash = (Math.imul(37, hash) + this.movesLeft) | 0;
    return (Math.imul(37, hash) + Utils.hashCode(this.colony)) | 0;
  }
  /**
   * {@inheritDoc}
   */
  toString(): string {
    let tile = this.colony.getTile$();
    let roleStr = '/' + this.role.getSuffix$();
    if (this.roleCount > 0) {
      roleStr += '.' + this.roleCount;
    }
    let locStr = (this.loc == null) ? '' : (this.loc instanceof Building) ? (this.loc).getType().getSuffix$() : (this.loc instanceof ColonyTile) ? tile.getDirection((this.loc).getWorkTile()).toString() : (this.loc instanceof Tile) ? (this.loc.getId() + roleStr) : this.loc.getId();
    let newLoc = this.unit.getLocation();
    let newRoleStr = '/' + this.unit.getRole().getSuffix$();
    if (this.unit.getRoleCount() > 0) {
      newRoleStr += '.' + this.unit.getRoleCount();
    }
    let newLocStr = (newLoc == null) ? '' : (newLoc instanceof Building) ? (newLoc).getType().getSuffix$() : (newLoc instanceof ColonyTile) ? tile.getDirection((newLoc).getWorkTile()).toString() : (newLoc instanceof Tile) ? (newLoc.getId() + newRoleStr) : newLoc.getId();
    let newWork = this.unit.getWorkType();
    let newWorkAmount = (newWork == null) ? 0 : this.getAmount(newLoc, newWork);
    return JString.trim((JString.format('%-30s %-25s -> %-25s', this.unit.getId() + ':' + this.unit.getType().getSuffix$(), locStr + ((this.work_ == null || this.workAmount <= 0) ? '' : '(' + String(this.workAmount) + ' ' + this.work_.getSuffix$() + ')'), newLocStr + ((newWork == null || newWorkAmount <= 0) ? '' : '(' + String(newWorkAmount) + ' ' + newWork.getSuffix$() + ')'))));
  }
  static $clinit() {
    UnitWas.logger = Logger.getLogger($J.cls(UnitWas).getName());
  }
}

$J.define(UnitWas, 'net.sf.freecol.common.model.UnitWas', { kind: 'class', ifaces: ['java.lang.Comparable'], sup: 'net.sf.freecol.common.model.ObjectWas', ctors: { 'net.sf.freecol.common.model.Unit': '_UnitWas' }, returns: { 'hashCode': 'int', 'getWorkType': 'net.sf.freecol.common.model.GoodsType', 'getLocation': 'net.sf.freecol.common.model.Location', 'getUnit': 'net.sf.freecol.common.model.Unit' }, clinit: true, lazy: ['logger'] });
$J.module(() => {
  AbstractGoods = $J.load('net.sf.freecol.common.model.AbstractGoods');
  Building = $J.load('net.sf.freecol.common.model.Building');
  Colony$ColonyChangeEvent = $J.load('net.sf.freecol.common.model.Colony$ColonyChangeEvent');
  ColonyTile = $J.load('net.sf.freecol.common.model.ColonyTile');
  Europe = $J.load('net.sf.freecol.common.model.Europe');
  Tile = $J.load('net.sf.freecol.common.model.Tile');
  Unit = $J.load('net.sf.freecol.common.model.Unit');
  WorkLocation = $J.load('net.sf.freecol.common.model.WorkLocation');
  Utils = $J.load('net.sf.freecol.common.util.Utils');
});
