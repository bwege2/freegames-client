// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/common/networking/AnimateMoveMessage.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J } from '../../../../../../jre/index.ts';
import { ObjectMessage } from './ObjectMessage.ts';

let FreeColXMLReader$ReadScope, Tile, Unit, Message, Message$MessagePriority;

/**
 * The message sent to tell a client to show a movement animation.
 */
export class AnimateMoveMessage extends ObjectMessage {
  static readonly TAG: string = 'animateMove';
  static readonly NEW_TILE_TAG: string = 'newTile';
  static readonly OLD_TILE_TAG: string = 'oldTile';
  static readonly UNIT_TAG: string = 'unit';
  /**
   * Create a new {@code AnimateMoveMessage} for the supplied unit and
   * direction.
   *
   * @param unit The {@code Unit} to move.
   * @param oldTile The {@code Tile} to move from.
   * @param newTile The {@code Tile} to move to.
   * @param appears If true, the unit is newly appearing, and either it
   *     or its carrier must be present in this message.
   */
  _AnimateMoveMessage$Unit$Tile$Tile$boolean(unit: Unit, oldTile: Tile, newTile: Tile, appears: boolean): this {
    this._ObjectMessage$String$StringArr(AnimateMoveMessage.TAG, [AnimateMoveMessage.UNIT_TAG, unit.getId(), AnimateMoveMessage.NEW_TILE_TAG, newTile.getId(), AnimateMoveMessage.OLD_TILE_TAG, oldTile.getId()]);
    if (appears) {
      this.appendChild((unit.isOnCarrier()) ? unit.getCarrier() : unit);
    }
    return this;
  }
  /**
   * Create a new {@code AnimateMoveMessage} from a stream.
   *
   * @param game The {@code Game} this message belongs to.
   * @param xr The {@code FreeColXMLReader} to read from.
   * @exception XMLStreamException if there is a problem reading the stream.
   */
  _AnimateMoveMessage$Game$FreeColXMLReader(game: Game, xr: FreeColXMLReader): this {
    this._ObjectMessage$String$FreeColXMLReader$StringArr(AnimateMoveMessage.TAG, xr, [AnimateMoveMessage.NEW_TILE_TAG, AnimateMoveMessage.OLD_TILE_TAG, AnimateMoveMessage.UNIT_TAG]);
    let rs = xr.replaceScope(FreeColXMLReader$ReadScope.NOINTERN);
    let unit = null;
    try {
      while (xr.moreTags()) {
        let tag = xr.getLocalName();
        if ($J.equals(Unit.TAG, tag)) {
          if (unit == null) {
            unit = xr.readFreeColObject$Game$Class(game, $J.cls(Unit));
          } else {
            this.expected(AnimateMoveMessage.TAG, tag);
          }
        } else {
          this.expected(Unit.TAG, tag);
        }
        xr.expectTag(tag);
      }
      xr.expectTag(AnimateMoveMessage.TAG);
    } finally {
      xr.replaceScope(rs);
    }
    this.appendChild(unit);
    return this;
  }
  /**
   * Get the unit that is moving.
   *
   * @param game The {@code Game} to look up the unit in.
   * @return The {@code Unit} that moves.
   */
  getUnit(game: Game): Unit {
    let uid = this.getStringAttribute(AnimateMoveMessage.UNIT_TAG);
    let unit = game.getFreeColGameObject$String$Class(uid, $J.cls(Unit));
    if (unit == null) {
      if ((unit = this.getChild(0, $J.cls(Unit))) == null) {
        Message.logger.warning('Move animation missing unit: ' + uid);
      } else {
        unit.intern();
        if (!$J.equals(unit.getId(), uid)) {
          unit = unit.getCarriedUnitById(uid);
          if (unit == null) {
            Message.logger.warning('Move animation missing carried unit: ' + uid);
          }
        }
      }
    }
    return unit;
  }
  /**
   * Get the tile to move to.
   *
   * @param game The {@code Game} to look up the tile in.
   * @return The new {@code Tile}.
   */
  getNewTile(game: Game): Tile {
    return game.getFreeColGameObject$String$Class(this.getStringAttribute(AnimateMoveMessage.NEW_TILE_TAG), $J.cls(Tile));
  }
  /**
   * Get the tile to move from.
   *
   * @param game The {@code Game} to look up the tile in.
   * @return The old {@code Tile}.
   */
  getOldTile(game: Game): Tile {
    return game.getFreeColGameObject$String$Class(this.getStringAttribute(AnimateMoveMessage.OLD_TILE_TAG), $J.cls(Tile));
  }
  /**
   * {@inheritDoc}
   */
  getPriority(): Message$MessagePriority {
    return Message$MessagePriority.ANIMATION;
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
    let player = freeColClient.getMyPlayer();
    let oldTile = this.getOldTile(game);
    let newTile = this.getNewTile(game);
    let unit = this.getUnit(game);
    if (unit == null) {
      return;
    }
    if (oldTile == null) {
      Message.logger.warning('Animation for: ' + player.getId() + ' missing old Tile.');
      return;
    }
    if (newTile == null) {
      Message.logger.warning('Animation for: ' + player.getId() + ' missing new Tile.');
      return;
    }
    this.igc$FreeColClient(freeColClient).animateMoveHandler(unit, oldTile, newTile);
    this.clientGeneric(freeColClient);
  }
}

$J.define(AnimateMoveMessage, 'net.sf.freecol.common.networking.AnimateMoveMessage', { kind: 'class', sup: 'net.sf.freecol.common.networking.ObjectMessage', ctors: { 'net.sf.freecol.common.model.Game,net.sf.freecol.common.io.FreeColXMLReader': '_AnimateMoveMessage$Game$FreeColXMLReader', 'net.sf.freecol.common.model.Unit,net.sf.freecol.common.model.Tile,net.sf.freecol.common.model.Tile,boolean': '_AnimateMoveMessage$Unit$Tile$Tile$boolean' }, returns: { 'getPriority': 'net.sf.freecol.common.networking.Message$MessagePriority' } });
$J.module(() => {
  FreeColXMLReader$ReadScope = $J.load('net.sf.freecol.common.io.FreeColXMLReader$ReadScope');
  Tile = $J.load('net.sf.freecol.common.model.Tile');
  Unit = $J.load('net.sf.freecol.common.model.Unit');
  Message = $J.load('net.sf.freecol.common.networking.Message');
  Message$MessagePriority = $J.load('net.sf.freecol.common.networking.Message$MessagePriority');
});
