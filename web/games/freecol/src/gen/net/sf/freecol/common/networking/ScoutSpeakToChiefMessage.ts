// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/common/networking/ScoutSpeakToChiefMessage.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J, Exception } from '../../../../../../jre/index.ts';
import { AttributeMessage } from './AttributeMessage.ts';

let Ability, IndianSettlement, Unit, Unit$MoveType, Message$MessagePriority, ServerUnit;

/**
 * The message sent when speaking to a chief.
 */
export class ScoutSpeakToChiefMessage extends AttributeMessage {
  static readonly TAG: string = 'scoutSpeakToChief';
  static readonly RESULT_TAG: string = 'result';
  static readonly SETTLEMENT_TAG: string = 'settlement';
  static readonly UNIT_TAG: string = 'unit';
  /**
   * Create a new {@code ScoutSpeakToChiefMessage} with the
   * supplied unit, settlement and result.
   *
   * Result is null in a request.
   *
   * @param unit The {@code Unit} that is learning.
   * @param is The {@code IndianSettlement} to talk to.
   * @param result The result of speaking.
   */
  _ScoutSpeakToChiefMessage$Unit$IndianSettlement$String(unit: Unit, is$: IndianSettlement, result: string): this {
    this._AttributeMessage$String$StringArr(ScoutSpeakToChiefMessage.TAG, [ScoutSpeakToChiefMessage.UNIT_TAG, unit.getId(), ScoutSpeakToChiefMessage.SETTLEMENT_TAG, is$.getId(), ScoutSpeakToChiefMessage.RESULT_TAG, result]);
    return this;
  }
  /**
   * Create a new {@code ScoutSpeakToChiefMessage} from a stream.
   *
   * @param game The {@code Game} this message belongs to.
   * @param xr A {@code FreeColXMLReader} to read from.
   * @exception XMLStreamException if the stream is corrupt.
   */
  _ScoutSpeakToChiefMessage$Game$FreeColXMLReader(game: Game, xr: FreeColXMLReader): this {
    this._AttributeMessage$String$FreeColXMLReader$StringArr(ScoutSpeakToChiefMessage.TAG, xr, [ScoutSpeakToChiefMessage.UNIT_TAG, ScoutSpeakToChiefMessage.SETTLEMENT_TAG, ScoutSpeakToChiefMessage.RESULT_TAG]);
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
    return Message$MessagePriority.LATE;
  }
  /**
   * {@inheritDoc}
   */
  aiHandler(freeColServer: FreeColServer, aiPlayer: AIPlayer): void {
  }
  /**
   * {@inheritDoc}
   */
  clientHandler(freeColClient: FreeColClient): void {
    let game = freeColClient.getGame();
    let unit = this.getUnit(game);
    let is$ = this.getSettlement(game);
    let result = this.getResult();
    this.igc$FreeColClient(freeColClient).scoutSpeakToChiefHandler(unit, is$, result);
    this.clientGeneric(freeColClient);
  }
  /**
   * {@inheritDoc}
   */
  serverHandler(freeColServer: FreeColServer, serverPlayer: ServerPlayer): ChangeSet {
    let unitId = this.getStringAttribute(ScoutSpeakToChiefMessage.UNIT_TAG);
    let settlementId = this.getStringAttribute(ScoutSpeakToChiefMessage.SETTLEMENT_TAG);
    let unit: ServerUnit;
    try {
      unit = serverPlayer.getOurFreeColGameObject(unitId, $J.cls(ServerUnit));
    } catch ($e0) {
      if ($J.isa($e0, Exception)) {
        let e = $J.exc($e0);
        return serverPlayer.clientError$String(e.getMessage());
      } else {
        throw $e0;
      }
    }
    if (!unit.hasAbility$String(Ability.SPEAK_WITH_CHIEF)) {
      return serverPlayer.clientError$String('Unit lacks ability to speak to chief: ' + unitId);
    }
    let is$: IndianSettlement;
    try {
      is$ = unit.getAdjacentSettlement(settlementId, $J.cls(IndianSettlement));
    } catch ($e1) {
      if ($J.isa($e1, Exception)) {
        let e = $J.exc($e1);
        return serverPlayer.clientError$String(e.getMessage());
      } else {
        throw $e1;
      }
    }
    let type$ = unit.getMoveType$Tile(is$.getTile$());
    if (type$ !== Unit$MoveType.ENTER_INDIAN_SETTLEMENT_WITH_SCOUT) {
      return serverPlayer.clientError$String('Unable to enter ' + is$.getName() + ': ' + type$.whyIllegal());
    }
    return this.igc$FreeColServer(freeColServer).scoutSpeakToChief(serverPlayer, unit, is$);
  }
  getUnit(game: Game): Unit {
    return game.getFreeColGameObject$String$Class(this.getStringAttribute(ScoutSpeakToChiefMessage.UNIT_TAG), $J.cls(Unit));
  }
  getSettlement(game: Game): IndianSettlement {
    return game.getFreeColGameObject$String$Class(this.getStringAttribute(ScoutSpeakToChiefMessage.SETTLEMENT_TAG), $J.cls(IndianSettlement));
  }
  getResult(): string {
    let result = this.getStringAttribute(ScoutSpeakToChiefMessage.RESULT_TAG);
    return (result == null) ? '' : result;
  }
}

$J.define(ScoutSpeakToChiefMessage, 'net.sf.freecol.common.networking.ScoutSpeakToChiefMessage', { kind: 'class', sup: 'net.sf.freecol.common.networking.AttributeMessage', ctors: { 'net.sf.freecol.common.model.Game,net.sf.freecol.common.io.FreeColXMLReader': '_ScoutSpeakToChiefMessage$Game$FreeColXMLReader', 'net.sf.freecol.common.model.Unit,net.sf.freecol.common.model.IndianSettlement,java.lang.String': '_ScoutSpeakToChiefMessage$Unit$IndianSettlement$String' }, returns: { 'getResult': 'java.lang.String', 'getPriority': 'net.sf.freecol.common.networking.Message$MessagePriority' } });
$J.module(() => {
  Ability = $J.load('net.sf.freecol.common.model.Ability');
  IndianSettlement = $J.load('net.sf.freecol.common.model.IndianSettlement');
  Unit = $J.load('net.sf.freecol.common.model.Unit');
  Unit$MoveType = $J.load('net.sf.freecol.common.model.Unit$MoveType');
  Message$MessagePriority = $J.load('net.sf.freecol.common.networking.Message$MessagePriority');
  ServerUnit = $J.load('net.sf.freecol.server.model.ServerUnit');
});
