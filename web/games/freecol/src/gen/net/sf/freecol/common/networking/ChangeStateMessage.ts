// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/common/networking/ChangeStateMessage.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J, Exception, JString } from '../../../../../../jre/index.ts';
import { AttributeMessage } from './AttributeMessage.ts';

let Unit, Unit$UnitState, Message$MessagePriority;

/**
 * The message sent when changing a unit state.
 */
export class ChangeStateMessage extends AttributeMessage {
  static readonly TAG: string = 'changeState';
  static readonly STATE_TAG: string = 'state';
  static readonly UNIT_TAG: string = 'unit';
  /**
   * Create a new {@code ChangeStateMessage} with the
   * supplied unit and state.
   *
   * @param unit The {@code Unit} to change the state of.
   * @param state The new state.
   */
  _ChangeStateMessage$Unit$UnitState(unit: Unit, state: Unit$UnitState): this {
    this._AttributeMessage$String$StringArr(ChangeStateMessage.TAG, [ChangeStateMessage.UNIT_TAG, unit.getId(), ChangeStateMessage.STATE_TAG, $J.str(state)]);
    return this;
  }
  /**
   * Create a new {@code ChangeStateMessage} from a stream.
   *
   * @param game The {@code Game} this message belongs to.
   * @param xr The {@code FreeColXMLReader} to read from.
   * @exception XMLStreamException if the stream is corrupt.
   */
  _ChangeStateMessage$Game$FreeColXMLReader(game: Game, xr: FreeColXMLReader): this {
    this._AttributeMessage$String$FreeColXMLReader$StringArr(ChangeStateMessage.TAG, xr, [ChangeStateMessage.UNIT_TAG, ChangeStateMessage.STATE_TAG]);
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
    let unitId = this.getStringAttribute(ChangeStateMessage.UNIT_TAG);
    let stateString = this.getStringAttribute(ChangeStateMessage.STATE_TAG);
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
    let state: Unit$UnitState;
    try {
      state = $J.enumValueOf($J.cls(Unit$UnitState), stateString);
    } catch ($e1) {
      if ($J.isa($e1, Exception)) {
        let e = $J.exc($e1);
        return serverPlayer.clientError$String(e.getMessage());
      } else {
        throw $e1;
      }
    }
    if (!unit.checkSetState(state)) {
      return serverPlayer.clientError$String('Unit ' + unitId + ' can not change state: ' + $J.str(unit.getState()) + ' -> ' + stateString);
    }
    return this.igc$FreeColServer(freeColServer).changeState(serverPlayer, unit, state);
  }
}

$J.define(ChangeStateMessage, 'net.sf.freecol.common.networking.ChangeStateMessage', { kind: 'class', sup: 'net.sf.freecol.common.networking.AttributeMessage', ctors: { 'net.sf.freecol.common.model.Game,net.sf.freecol.common.io.FreeColXMLReader': '_ChangeStateMessage$Game$FreeColXMLReader', 'net.sf.freecol.common.model.Unit,net.sf.freecol.common.model.Unit$UnitState': '_ChangeStateMessage$Unit$UnitState' }, returns: { 'getPriority': 'net.sf.freecol.common.networking.Message$MessagePriority' } });
$J.module(() => {
  Unit = $J.load('net.sf.freecol.common.model.Unit');
  Unit$UnitState = $J.load('net.sf.freecol.common.model.Unit$UnitState');
  Message$MessagePriority = $J.load('net.sf.freecol.common.networking.Message$MessagePriority');
});
