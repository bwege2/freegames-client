// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/common/networking/SpySettlementMessage.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { ObjectMessage } from './ObjectMessage.ts';

let FreeColXMLReader$ReadScope, FreeColXMLWriter$WriteScope, Ability, Colony, Tile, Unit, Unit$MoveType, Message$MessagePriority;

/**
 * The message sent when spying on a settlement.
 */
export class SpySettlementMessage extends ObjectMessage {
  static readonly TAG: string = 'spySettlement';
  static readonly SETTLEMENT_TAG: string = 'settlement';
  static readonly UNIT_TAG: string = 'unit';
  /**
   * Create a new {@code SpySettlementMessage} request with the
   * supplied unit and settlement
   *
   * @param unit The {@code Unit} that is spying.
   * @param settlement The {@code Settlement} the unit is looking at.
   */
  _SpySettlementMessage$Unit$Settlement(unit: Unit, settlement: Settlement): this {
    this._ObjectMessage$String$StringArr(SpySettlementMessage.TAG, [SpySettlementMessage.SETTLEMENT_TAG, settlement.getId(), SpySettlementMessage.UNIT_TAG, unit.getId()]);
    this.appendChild(settlement.getTile$());
    return this;
  }
  /**
   * Create a new {@code SpySettlementMessage} from a stream.
   *
   * @param game The {@code Game} this message belongs to.
   * @param xr The {@code FreeColXMLReader} to read from.
   * @exception XMLStreamException if there is a problem reading the stream.
   */
  _SpySettlementMessage$Game$FreeColXMLReader(game: Game, xr: FreeColXMLReader): this {
    this._ObjectMessage$String$FreeColXMLReader$StringArr(SpySettlementMessage.TAG, xr, [SpySettlementMessage.SETTLEMENT_TAG, SpySettlementMessage.UNIT_TAG]);
    let rs = xr.replaceScope(FreeColXMLReader$ReadScope.NOINTERN);
    let spyTile = null;
    try {
      while (xr.moreTags()) {
        let tag = xr.getLocalName();
        if ($J.equals(Tile.TAG, tag)) {
          if (spyTile == null) {
            spyTile = xr.readFreeColObject$Game$Class(game, $J.cls(Tile));
          } else {
            this.expected(SpySettlementMessage.TAG, tag);
          }
        } else {
          this.expected(Tile.TAG, tag);
        }
        xr.expectTag(tag);
      }
      xr.expectTag(SpySettlementMessage.TAG);
    } finally {
      xr.replaceScope(rs);
    }
    this.appendChild(spyTile);
    return this;
  }
  getSpyTile(): Tile {
    return this.getChild(0, $J.cls(Tile));
  }
  getUnit(player: Player): Unit {
    return player.getOurFreeColGameObject(this.getStringAttribute(SpySettlementMessage.UNIT_TAG), $J.cls(Unit));
  }
  getColony(game: Game): Colony {
    return game.getFreeColGameObject$String$Class(this.getStringAttribute(SpySettlementMessage.SETTLEMENT_TAG), $J.cls(Colony));
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
  writeChildren(xw: FreeColXMLWriter): void {
    let spyTile = this.getSpyTile();
    if (spyTile != null) {
      let ws = xw.getWriteScope();
      if (xw.getClientPlayer() != null) {
        ws = xw.replaceScope(FreeColXMLWriter$WriteScope.toServer());
      }
      try {
        spyTile.toXML$FreeColXMLWriter(xw);
      } finally {
        xw.replaceScope(ws);
      }
    }
  }
  /**
   * {@inheritDoc}
   */
  clientHandler(freeColClient: FreeColClient): void {
    let spyTile = this.getSpyTile();
    this.igc$FreeColClient(freeColClient).spySettlementHandler(spyTile);
    this.clientGeneric(freeColClient);
  }
  /**
   * {@inheritDoc}
   */
  serverHandler(freeColServer: FreeColServer, serverPlayer: ServerPlayer): ChangeSet {
    let game = freeColServer.getGame();
    let unitId = this.getStringAttribute(SpySettlementMessage.UNIT_TAG);
    let unit: Unit;
    try {
      unit = this.getUnit(serverPlayer);
    } catch ($e0) {
      if ($J.isa($e0, Exception)) {
        let e = $J.exc($e0);
        return serverPlayer.clientError$String(e.getMessage());
      } else {
        throw $e0;
      }
    }
    if (!unit.hasAbility$String(Ability.SPY_ON_COLONY)) {
      return serverPlayer.clientError$String('Unit lacks ability to spy on colony: ' + unitId);
    }
    let settlementId = this.getStringAttribute(SpySettlementMessage.SETTLEMENT_TAG);
    let colony = this.getColony(game);
    if (colony == null) {
      return serverPlayer.clientError$String('Not a colony: ' + settlementId);
    }
    let tile = colony.getTile$();
    if (!unit.getTile$().isAdjacent(tile)) {
      return serverPlayer.clientError$String('Unit ' + unitId + ' not adjacent to colony: ' + settlementId);
    }
    let type$ = unit.getMoveType$Tile(tile);
    if (type$ !== Unit$MoveType.ENTER_FOREIGN_COLONY_WITH_SCOUT) {
      return serverPlayer.clientError$String('Unable to enter at: ' + colony.getName() + ': ' + type$.whyIllegal());
    }
    return this.igc$FreeColServer(freeColServer).spySettlement(serverPlayer, unit, colony);
  }
}

$J.define(SpySettlementMessage, 'net.sf.freecol.common.networking.SpySettlementMessage', { kind: 'class', sup: 'net.sf.freecol.common.networking.ObjectMessage', ctors: { 'net.sf.freecol.common.model.Game,net.sf.freecol.common.io.FreeColXMLReader': '_SpySettlementMessage$Game$FreeColXMLReader', 'net.sf.freecol.common.model.Unit,net.sf.freecol.common.model.Settlement': '_SpySettlementMessage$Unit$Settlement' }, returns: { 'getPriority': 'net.sf.freecol.common.networking.Message$MessagePriority', 'getSpyTile': 'net.sf.freecol.common.model.Tile' } });
$J.module(() => {
  FreeColXMLReader$ReadScope = $J.load('net.sf.freecol.common.io.FreeColXMLReader$ReadScope');
  FreeColXMLWriter$WriteScope = $J.load('net.sf.freecol.common.io.FreeColXMLWriter$WriteScope');
  Ability = $J.load('net.sf.freecol.common.model.Ability');
  Colony = $J.load('net.sf.freecol.common.model.Colony');
  Tile = $J.load('net.sf.freecol.common.model.Tile');
  Unit = $J.load('net.sf.freecol.common.model.Unit');
  Unit$MoveType = $J.load('net.sf.freecol.common.model.Unit$MoveType');
  Message$MessagePriority = $J.load('net.sf.freecol.common.networking.Message$MessagePriority');
});
