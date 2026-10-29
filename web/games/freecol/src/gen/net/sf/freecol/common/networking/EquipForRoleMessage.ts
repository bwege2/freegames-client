// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/common/networking/EquipForRoleMessage.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J, Exception, JString, NumberFormatException } from '../../../../../../jre/index.ts';
import { AttributeMessage } from './AttributeMessage.ts';

let Unit, Message$MessagePriority;

/**
 * The message sent to equip a unit for a particular role.
 */
export class EquipForRoleMessage extends AttributeMessage {
  static readonly TAG: string = 'equipForRole';
  static readonly COUNT_TAG: string = 'count';
  static readonly ROLE_TAG: string = 'role';
  static readonly UNIT_TAG: string = 'unit';
  /**
   * Create a new {@code EquipForRoleMessage} for the supplied
   * Unit and Role.
   *
   * @param unit The {@code Unit} to equip.
   * @param role The {@code Role} to equip for.
   * @param roleCount The role count.
   */
  _EquipForRoleMessage$Unit$Role$int(unit: Unit, role: Role, roleCount: number): this {
    this._AttributeMessage$String$StringArr(EquipForRoleMessage.TAG, [EquipForRoleMessage.UNIT_TAG, unit.getId(), EquipForRoleMessage.ROLE_TAG, role.getId(), EquipForRoleMessage.COUNT_TAG, String(roleCount)]);
    return this;
  }
  /**
   * Create a new {@code EquipForRoleMessage} from a stream.
   *
   * @param game The {@code Game} to read within.
   * @param xr The {@code FreeColXMLReader} to read from.
   * @exception XMLStreamException if the stream is corrupt.
   */
  _EquipForRoleMessage$Game$FreeColXMLReader(game: Game, xr: FreeColXMLReader): this {
    this._AttributeMessage$String$FreeColXMLReader$StringArr(EquipForRoleMessage.TAG, xr, [EquipForRoleMessage.UNIT_TAG, EquipForRoleMessage.ROLE_TAG, EquipForRoleMessage.COUNT_TAG]);
    return this;
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
    let game = freeColServer.getGame();
    let unitId = this.getStringAttribute(EquipForRoleMessage.UNIT_TAG);
    let roleId = this.getStringAttribute(EquipForRoleMessage.ROLE_TAG);
    let countString = this.getStringAttribute(EquipForRoleMessage.COUNT_TAG);
    let unit: Unit;
    try {
      unit = serverPlayer.getOurFreeColGameObject(unitId, $J.cls(Unit));
    } catch ($e0) {
      if ($J.isa($e0, Exception)) {
        let e = $J.exc($e0);
        return serverPlayer.clientError$String(e.getMessage());
      } else {
        throw $e0;
      }
    }
    if (unit.isInEurope()) {
    } else if (!unit.hasTile()) {
      return serverPlayer.clientError$String('Unit is not on the map: ' + unitId);
    } else if (unit.getSettlement() == null) {
      return serverPlayer.clientError$String('Unit is not in a settlement: ' + unitId);
    }
    let role = game.getSpecification().getRole(roleId);
    if (role == null) {
      return serverPlayer.clientError$String('Not a role: ' + roleId);
    }
    let count: number;
    try {
      count = $J.parseInt(countString);
    } catch ($e1) {
      if ($J.isa($e1, NumberFormatException)) {
        let nfe = $J.exc($e1);
        return serverPlayer.clientError$String('Role count is not an integer: ' + countString);
      } else {
        throw $e1;
      }
    }
    if (count < 0 || count > role.getMaximumCount()) {
      return serverPlayer.clientError$String('Invalid role count: ' + countString);
    }
    return this.igc$FreeColServer(freeColServer).equipForRole(serverPlayer, unit, role, count);
  }
}

$J.define(EquipForRoleMessage, 'net.sf.freecol.common.networking.EquipForRoleMessage', { kind: 'class', sup: 'net.sf.freecol.common.networking.AttributeMessage', ctors: { 'net.sf.freecol.common.model.Game,net.sf.freecol.common.io.FreeColXMLReader': '_EquipForRoleMessage$Game$FreeColXMLReader', 'net.sf.freecol.common.model.Unit,net.sf.freecol.common.model.Role,int': '_EquipForRoleMessage$Unit$Role$int' }, returns: { 'getPriority': 'net.sf.freecol.common.networking.Message$MessagePriority' } });
$J.module(() => {
  Unit = $J.load('net.sf.freecol.common.model.Unit');
  Message$MessagePriority = $J.load('net.sf.freecol.common.networking.Message$MessagePriority');
});
