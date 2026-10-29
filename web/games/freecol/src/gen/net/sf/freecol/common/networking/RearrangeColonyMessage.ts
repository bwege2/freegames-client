// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/common/networking/RearrangeColonyMessage.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J, ArrayList, Exception, HashMap, JObject, JString, NumberFormatException } from '../../../../../../jre/index.ts';
import { AttributeMessage } from './AttributeMessage.ts';

let Colony, FreeColObject, Unit, Message$MessagePriority;

/**
 * The message sent when the client requests rearrangeing of a colony.
 */
export class RearrangeColonyMessage extends AttributeMessage {
  static readonly TAG: string = 'rearrangeColony';
  static readonly COLONY_TAG: string = 'colony';
  /**
   * Create a new {@code RearrangeColonyMessage} with the
   * supplied colony.  Add changes with addChange().
   *
   * @param colony The {@code Colony} that is rearranging.
   * @param workers A list of worker {@code Unit}s to rearrange.
   * @param scratch A scratch {@code Colony} laid out as required.
   */
  _RearrangeColonyMessage$Colony$List$Colony(colony: Colony, workers: List<Unit>, scratch: Colony): this {
    this._AttributeMessage$String$StringArr(RearrangeColonyMessage.TAG, [RearrangeColonyMessage.COLONY_TAG, colony.getId()]);
    this.setArrangementAttributes(RearrangeColonyMessage$Arrangement.getArrangements(colony, workers, scratch));
    return this;
  }
  /**
   * Create a new {@code RearrangeColonyMessage} from a stream.
   *
   * @param game The {@code Game} to read within.
   * @param xr The {@code FreeColXMLReader} to read from.
   */
  _RearrangeColonyMessage$Game$FreeColXMLReader(game: Game, xr: FreeColXMLReader): this {
    this._AttributeMessage$String$Map(RearrangeColonyMessage.TAG, RearrangeColonyMessage.getAttributeMap(xr));
    return this;
  }
  /**
   * Read the attributes from the stream.
   *
   * @param xr The {@code FreeColXMLReader} to read from.
   * @return An attribute map.
   */
  static getAttributeMap(xr: FreeColXMLReader): JMap<string, string> {
    let n = xr.getAttribute$String$int(FreeColObject.ARRAY_SIZE_TAG, 0);
    let ret = new HashMap((Math.imul(5, n) + 1) | 0);
    ret.put(RearrangeColonyMessage.COLONY_TAG, xr.getAttribute$String$String(RearrangeColonyMessage.COLONY_TAG, null));
    for (let i = 0; i < n; i++) {
      ret.put(RearrangeColonyMessage$Arrangement.unitKey(i), xr.getAttribute$String$String(RearrangeColonyMessage$Arrangement.unitKey(i), null));
      ret.put(RearrangeColonyMessage$Arrangement.locKey(i), xr.getAttribute$String$String(RearrangeColonyMessage$Arrangement.locKey(i), null));
      ret.put(RearrangeColonyMessage$Arrangement.workKey(i), xr.getAttribute$String$String(RearrangeColonyMessage$Arrangement.workKey(i), null));
      ret.put(RearrangeColonyMessage$Arrangement.roleKey(i), xr.getAttribute$String$String(RearrangeColonyMessage$Arrangement.roleKey(i), null));
      ret.put(RearrangeColonyMessage$Arrangement.roleCountKey(i), xr.getAttribute$String$String(RearrangeColonyMessage$Arrangement.roleCountKey(i), null));
    }
    return ret;
  }
  /**
   * Set the attributes consequent to a list of arrangements.
   *
   * @param arrangements The list of {@code Arrangement}.
   */
  setArrangementAttributes(arrangements: List<RearrangeColonyMessage$Arrangement>): void {
    let i = 0;
    for (const $it0 = arrangements.iterator(); $it0.hasNext(); ) {
      let a = $it0.next();
      this.setStringAttribute(RearrangeColonyMessage$Arrangement.unitKey(i), a.unit.getId());
      this.setStringAttribute(RearrangeColonyMessage$Arrangement.locKey(i), a.loc.getId());
      if (a.work_ != null) {
        this.setStringAttribute(RearrangeColonyMessage$Arrangement.workKey(i), a.work_.getId());
      }
      this.setStringAttribute(RearrangeColonyMessage$Arrangement.roleKey(i), a.role.toString());
      this.setStringAttribute(RearrangeColonyMessage$Arrangement.roleCountKey(i), String(a.roleCount));
      i++;
    }
    this.setIntegerAttribute(FreeColObject.ARRAY_SIZE_TAG, i);
  }
  /**
   * {@inheritDoc}
   */
  currentPlayerMessage(): boolean {
    return true;
  }
  /**
   * {@inheritDoc}
   */
  getPriority(): Message$MessagePriority {
    return Message$MessagePriority.NORMAL;
  }
  /**
   * {@inheritDoc}
   */
  serverHandler(freeColServer: FreeColServer, serverPlayer: ServerPlayer): ChangeSet {
    let colonyId = this.getStringAttribute(RearrangeColonyMessage.COLONY_TAG);
    let game = serverPlayer.getGame();
    let arrangements = this.getArrangements(game);
    let colony: Colony;
    try {
      colony = serverPlayer.getOurFreeColGameObject(colonyId, $J.cls(Colony));
    } catch ($e1) {
      if ($J.isa($e1, Exception)) {
        let e = $J.exc($e1);
        return serverPlayer.clientError$String(e.getMessage());
      } else {
        throw $e1;
      }
    }
    if (arrangements.isEmpty()) {
      return serverPlayer.clientError$String('Empty rearrangement list.');
    }
    let i = 0;
    for (const $it2 = arrangements.iterator(); $it2.hasNext(); ) {
      let uc = $it2.next();
      if (uc.unit == null) {
        return serverPlayer.clientError$String('Invalid unit ' + i);
      }
      if (uc.loc == null) {
        return serverPlayer.clientError$String('Invalid location ' + i);
      }
      if (uc.role == null) {
        return serverPlayer.clientError$String('Invalid role ' + i);
      }
      if (uc.roleCount < 0) {
        return serverPlayer.clientError$String('Invalid role count ' + i);
      }
    }
    return this.igc$FreeColServer(freeColServer).rearrangeColony(serverPlayer, colony, arrangements);
  }
  /**
   * Check if the are no arrangements present.
   *
   * @return True if there are no arrangements.
   */
  isEmpty(): boolean {
    return this.getIntegerAttribute(FreeColObject.ARRAY_SIZE_TAG, 0) === 0;
  }
  /**
   * Get arrangements from the attributes.
   *
   * @param game The {@code Game} to create arrangements in.
   * @return A list of {@code Arrangement}s.
   */
  getArrangements(game: Game): List<RearrangeColonyMessage$Arrangement> {
    let n = this.getIntegerAttribute(FreeColObject.ARRAY_SIZE_TAG, 0);
    let ret = new ArrayList(n);
    for (let i = 0; i < n; i++) {
      ret.add(new RearrangeColonyMessage$Arrangement()._RearrangeColonyMessage$Arrangement$Game$String$String$String$String$String(game, this.getStringAttribute(RearrangeColonyMessage$Arrangement.unitKey(i)), this.getStringAttribute(RearrangeColonyMessage$Arrangement.locKey(i)), this.getStringAttribute(RearrangeColonyMessage$Arrangement.workKey(i)), this.getStringAttribute(RearrangeColonyMessage$Arrangement.roleKey(i)), this.getStringAttribute(RearrangeColonyMessage$Arrangement.roleCountKey(i))));
    }
    return ret;
  }
}

/**
 * Container for the unit change information.
 */
export class RearrangeColonyMessage$Arrangement extends JObject {
  unit: Unit = null;
  loc: Location = null;
  work_: GoodsType = null;
  role: Role = null;
  roleCount: number = 0;
  _RearrangeColonyMessage$Arrangement$(): this {
    return this;
  }
  _RearrangeColonyMessage$Arrangement$Unit$Location$GoodsType$Role$int(unit: Unit, loc: Location, work: GoodsType, role: Role, roleCount: number): this {
    this.unit = unit;
    this.loc = loc;
    this.work_ = work;
    this.role = role;
    this.roleCount = roleCount;
    return this;
  }
  _RearrangeColonyMessage$Arrangement$Game$String$String$String$String$String(game: Game, unitId: string, locId: string, workId: string, roleId: string, roleCount: string): this {
    this.init(game, unitId, locId, workId, roleId, roleCount);
    return this;
  }
  init(game: Game, unitId: string, locId: string, workId: string, roleId: string, roleCount: string): void {
    this.unit = game.getFreeColGameObject$String$Class(unitId, $J.cls(Unit));
    this.loc = game.findFreeColLocation(locId);
    this.work_ = (workId == null || (workId.length === 0)) ? null : game.getSpecification().getGoodsType(workId);
    this.role = game.getSpecification().getRole(roleId);
    try {
      this.roleCount = $J.parseInt(roleCount);
    } catch ($e3) {
      if ($J.isa($e3, NumberFormatException)) {
        let nfe = $J.exc($e3);
        this.roleCount = 0;
      } else {
        throw $e3;
      }
    }
  }
  static unitKey(i: number): string {
    return FreeColObject.arrayKey(i) + 'unit';
  }
  static locKey(i: number): string {
    return FreeColObject.arrayKey(i) + 'loc';
  }
  static workKey(i: number): string {
    return FreeColObject.arrayKey(i) + 'work';
  }
  static roleKey(i: number): string {
    return FreeColObject.arrayKey(i) + 'role';
  }
  static roleCountKey(i: number): string {
    return FreeColObject.arrayKey(i) + 'count';
  }
  /**
   * Create new arrangements for a given list of worker units on the
   * basis of a scratch colony configuration.
   *
   * @param colony The original {@code Colony}.
   * @param workers A list of worker {@code Unit}s to arrange.
   * @param scratch The scratch {@code Colony}.
   * @return A list of {@code Arrangement}s.
   */
  static getArrangements(colony: Colony, workers: List<Unit>, scratch: Colony): List<RearrangeColonyMessage$Arrangement> {
    let ret = new ArrayList(workers.size());
    for (const $it4 = workers.iterator(); $it4.hasNext(); ) {
      let u = $it4.next();
      let su = scratch.getCorresponding(u);
      if ($J.equals(u.getLocation().getId(), su.getLocation().getId()) && u.getWorkType() === su.getWorkType() && u.getRole() === su.getRole() && u.getRoleCount() === su.getRoleCount()) {
        continue;
      }
      ret.add(new RearrangeColonyMessage$Arrangement()._RearrangeColonyMessage$Arrangement$Unit$Location$GoodsType$Role$int(u, colony.getCorresponding(su.getLocation()), su.getWorkType(), su.getRole(), su.getRoleCount()));
    }
    return ret;
  }
  /**
   * Role comparison for use in rearrangeColony.
   *
   * @param other The {@code Arrangement} to compare to.
   * @return A comparison value.
   */
  roleComparison(other: RearrangeColonyMessage$Arrangement): number {
    let cmp = this.role.compareTo(other.role);
    if (cmp === 0) {
      cmp = (this.roleCount - other.roleCount) | 0;
    }
    return cmp;
  }
  /**
   * {@inheritDoc}
   */
  toString(): string {
    return '[Arrangement ' + this.unit.getId() + ' at ' + this.loc.getId() + ' ' + this.role.getRoleSuffix() + '.' + this.roleCount + ((this.work_ == null) ? '' : ' work ' + this.work_.getId()) + ']';
  }
}

$J.define(RearrangeColonyMessage, 'net.sf.freecol.common.networking.RearrangeColonyMessage', { kind: 'class', sup: 'net.sf.freecol.common.networking.AttributeMessage', ctors: { 'net.sf.freecol.common.model.Game,net.sf.freecol.common.io.FreeColXMLReader': '_RearrangeColonyMessage$Game$FreeColXMLReader', 'net.sf.freecol.common.model.Colony,java.util.List,net.sf.freecol.common.model.Colony': '_RearrangeColonyMessage$Colony$List$Colony' }, returns: { 'isEmpty': 'boolean', 'getPriority': 'net.sf.freecol.common.networking.Message$MessagePriority' } });
$J.define(RearrangeColonyMessage$Arrangement, 'net.sf.freecol.common.networking.RearrangeColonyMessage$Arrangement', { kind: 'class', sup: 'java.lang.Object', ctors: { 'net.sf.freecol.common.model.Game,java.lang.String,java.lang.String,java.lang.String,java.lang.String,java.lang.String': '_RearrangeColonyMessage$Arrangement$Game$String$String$String$String$String', 'net.sf.freecol.common.model.Unit,net.sf.freecol.common.model.Location,net.sf.freecol.common.model.GoodsType,net.sf.freecol.common.model.Role,int': '_RearrangeColonyMessage$Arrangement$Unit$Location$GoodsType$Role$int', '': '_RearrangeColonyMessage$Arrangement$' } });
$J.module(() => {
  Colony = $J.load('net.sf.freecol.common.model.Colony');
  FreeColObject = $J.load('net.sf.freecol.common.model.FreeColObject');
  Unit = $J.load('net.sf.freecol.common.model.Unit');
  Message$MessagePriority = $J.load('net.sf.freecol.common.networking.Message$MessagePriority');
});
