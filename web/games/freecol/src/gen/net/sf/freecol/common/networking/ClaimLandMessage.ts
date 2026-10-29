// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/common/networking/ClaimLandMessage.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J, JString, NumberFormatException } from '../../../../../../jre/index.ts';
import { AttributeMessage } from './AttributeMessage.ts';

let FreeColObject, Player$NoClaimReason, Settlement, Tile, Unit, Message$MessagePriority;

/**
 * The message sent when the client requests claiming land.
 */
export class ClaimLandMessage extends AttributeMessage {
  static readonly TAG: string = 'claimLand';
  static readonly CLAIMANT_TAG: string = 'claimant';
  static readonly PRICE_TAG: string = 'price';
  static readonly TILE_TAG: string = 'tile';
  /**
   * Create a new {@code ClaimLandMessage}.
   *
   * @param tile The {@code Tile} to claim.
   * @param claimant The {@code Unit} or {@code Settlement}
   *     claiming the tile.
   * @param price The price to pay for the tile, negative if stealing.
   */
  _ClaimLandMessage$Tile$FreeColGameObject$int(tile: Tile, claimant: FreeColGameObject, price: number): this {
    this._AttributeMessage$String$StringArr(ClaimLandMessage.TAG, [ClaimLandMessage.TILE_TAG, tile.getId(), ClaimLandMessage.CLAIMANT_TAG, claimant.getId(), ClaimLandMessage.PRICE_TAG, String(price)]);
    return this;
  }
  /**
   * Create a new {@code ClaimLandMessage} from a stream.
   *
   * @param game The {@code Game} this message belongs to.
   * @param xr The {@code FreeColXMLReader} to read from.
   * @exception XMLStreamException if the stream is corrupt.
   */
  _ClaimLandMessage$Game$FreeColXMLReader(game: Game, xr: FreeColXMLReader): this {
    this._AttributeMessage$String$FreeColXMLReader$StringArr(ClaimLandMessage.TAG, xr, [ClaimLandMessage.TILE_TAG, ClaimLandMessage.CLAIMANT_TAG, ClaimLandMessage.PRICE_TAG]);
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
    let tileId = this.getStringAttribute(ClaimLandMessage.TILE_TAG);
    let claimantId = this.getStringAttribute(ClaimLandMessage.CLAIMANT_TAG);
    let priceString = this.getStringAttribute(ClaimLandMessage.PRICE_TAG);
    let tile = game.getFreeColGameObject$String$Class(tileId, $J.cls(Tile));
    if (tile == null) {
      return serverPlayer.clientError$String('Not a file: ' + tileId);
    }
    let c = FreeColObject.getFreeColObjectClassByName(FreeColObject.getIdTypeByName(claimantId));
    let unit = null;
    let settlement = null;
    if ($J.cls(Unit).isAssignableFrom(c)) {
      unit = serverPlayer.getOurFreeColGameObject(claimantId, $J.cls(Unit));
      if (unit.getTile$() !== tile) {
        return serverPlayer.clientError$String('Unit not at tile: ' + tileId);
      }
      if (tile.getOwningSettlement() == null) {
        for (const $it0 = tile.getSurroundingTiles$int(1).iterator(); $it0.hasNext(); ) {
          let t = $it0.next();
          let colony = t.getColony();
          if (serverPlayer.owns(colony)) {
            settlement = colony;
            break;
          }
        }
      }
    } else if ($J.cls(Settlement).isAssignableFrom(c)) {
      settlement = serverPlayer.getOurFreeColGameObject(claimantId, $J.cls(Settlement));
      if (settlement.getOwner().isEuropean() && !settlement.getTile$().isAdjacent(tile)) {
        return serverPlayer.clientError$String('Settlement can not claim tile: ' + tileId);
      }
    } else {
      return serverPlayer.clientError$String('Not a unit or settlement: ' + claimantId);
    }
    let price: number;
    try {
      price = $J.parseInt(priceString);
    } catch ($e1) {
      if ($J.isa($e1, NumberFormatException)) {
        let e = $J.exc($e1);
        return serverPlayer.clientError$String('Bad price: ' + priceString);
      } else {
        throw $e1;
      }
    }
    let value = serverPlayer.getLandPrice(tile);
    let owner = tile.getOwner();
    let ownerSettlement = tile.getOwningSettlement();
    if (owner == null) {
      price = 0;
    } else if (owner === serverPlayer) {
      if (settlement != null && ownerSettlement != null && tile.isInUse()) {
        return serverPlayer.clientError$String('Can not claim tile ' + tile.getId() + ': already owned.');
      }
      price = 0;
    } else if (owner.isEuropean()) {
      if (tile.getOwningSettlement() == null || tile.getOwningSettlement() === settlement) {
        price = 0;
      } else {
        return serverPlayer.clientError$String('Can not claim tile ' + tile.getId() + ': European owners will not sell.');
      }
    } else {
      let why = serverPlayer.canClaimForSettlementReason(tile);
      switch (why) {
        case Player$NoClaimReason.NONE:
          break;
        case Player$NoClaimReason.NATIVES:
          if (price >= 0) {
            if (price < value) {
              return serverPlayer.clientError$String('Can not claim tile ' + tile.getId() + ': insufficient offer.');
            }
            if (!serverPlayer.checkGold(price)) {
              return serverPlayer.clientError$String('Can not pay for tile: ' + tile.getId() + ': insufficient funds.');
            }
          }
          break;
        default:
          return serverPlayer.clientError$String('Can not claim tile ' + tile.getId() + ': ' + $J.str(why));
      }
    }
    return this.igc$FreeColServer(freeColServer).claimLand(serverPlayer, tile, settlement, price);
  }
}

$J.define(ClaimLandMessage, 'net.sf.freecol.common.networking.ClaimLandMessage', { kind: 'class', sup: 'net.sf.freecol.common.networking.AttributeMessage', ctors: { 'net.sf.freecol.common.model.Game,net.sf.freecol.common.io.FreeColXMLReader': '_ClaimLandMessage$Game$FreeColXMLReader', 'net.sf.freecol.common.model.Tile,net.sf.freecol.common.model.FreeColGameObject,int': '_ClaimLandMessage$Tile$FreeColGameObject$int' }, returns: { 'getPriority': 'net.sf.freecol.common.networking.Message$MessagePriority' } });
$J.module(() => {
  FreeColObject = $J.load('net.sf.freecol.common.model.FreeColObject');
  Player$NoClaimReason = $J.load('net.sf.freecol.common.model.Player$NoClaimReason');
  Settlement = $J.load('net.sf.freecol.common.model.Settlement');
  Tile = $J.load('net.sf.freecol.common.model.Tile');
  Unit = $J.load('net.sf.freecol.common.model.Unit');
  Message$MessagePriority = $J.load('net.sf.freecol.common.networking.Message$MessagePriority');
});
