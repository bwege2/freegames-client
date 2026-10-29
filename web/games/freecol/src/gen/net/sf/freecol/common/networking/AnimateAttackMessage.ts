// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/common/networking/AnimateAttackMessage.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J, ArrayList } from '../../../../../../jre/index.ts';
import { ObjectMessage } from './ObjectMessage.ts';

let FreeColXMLReader$ReadScope, Tile, Unit, Message, Message$MessagePriority;

/**
 * The message sent to tell a client to show an attack animation.
 */
export class AnimateAttackMessage extends ObjectMessage {
  static readonly TAG: string = 'animateAttack';
  static readonly ATTACKER_TAG: string = 'attacker';
  static readonly ATTACKER_TILE_TAG: string = 'attackerTile';
  static readonly DEFENDER_TAG: string = 'defender';
  static readonly DEFENDER_TILE_TAG: string = 'defenderTile';
  static readonly SUCCESS_TAG: string = 'success';
  /**
   * Create a new {@code AnimateAttackMessage} for the supplied attacker,
   * defender, result and visibility information.
   *
   * @param attacker The attacking {@code Unit}.
   * @param defender The defending {@code Unit}.
   * @param result Whether the attack succeeds.
   * @param addAttacker Whether to attach the attacker unit.
   * @param addDefender Whether to attach the defender unit.
   */
  _AnimateAttackMessage$Unit$Unit$boolean$boolean$boolean(attacker: Unit, defender: Unit, result: boolean, addAttacker: boolean, addDefender: boolean): this {
    this._ObjectMessage$String$StringArr(AnimateAttackMessage.TAG, [AnimateAttackMessage.ATTACKER_TAG, attacker.getId(), AnimateAttackMessage.ATTACKER_TILE_TAG, attacker.getTile$().getId(), AnimateAttackMessage.DEFENDER_TAG, defender.getId(), AnimateAttackMessage.DEFENDER_TILE_TAG, defender.getTile$().getId(), AnimateAttackMessage.SUCCESS_TAG, String(result)]);
    if (addAttacker) {
      this.appendChild((attacker.isOnCarrier()) ? attacker.getCarrier() : attacker);
    }
    if (addDefender) {
      this.appendChild((defender.isOnCarrier()) ? defender.getCarrier() : defender);
    }
    return this;
  }
  /**
   * Create a new {@code AnimateAttackMessage} from a stream.
   *
   * @param game The {@code Game} this message belongs to.
   * @param xr The {@code FreeColXMLReader} to read from.
   * @exception XMLStreamException if there is a problem reading the stream.
   */
  _AnimateAttackMessage$Game$FreeColXMLReader(game: Game, xr: FreeColXMLReader): this {
    this._ObjectMessage$String$FreeColXMLReader$StringArr(AnimateAttackMessage.TAG, xr, [AnimateAttackMessage.ATTACKER_TAG, AnimateAttackMessage.ATTACKER_TILE_TAG, AnimateAttackMessage.DEFENDER_TAG, AnimateAttackMessage.DEFENDER_TILE_TAG, AnimateAttackMessage.SUCCESS_TAG]);
    let rs = xr.replaceScope(FreeColXMLReader$ReadScope.NOINTERN);
    let units = new ArrayList();
    try {
      while (xr.moreTags()) {
        let tag = xr.getLocalName();
        if ($J.equals(Unit.TAG, tag)) {
          let u = xr.readFreeColObject$Game$Class(game, $J.cls(Unit));
          if (u != null) {
            units.add(u);
          }
        } else {
          this.expected(Unit.TAG, tag);
        }
        xr.expectTag(tag);
      }
      xr.expectTag(AnimateAttackMessage.TAG);
    } finally {
      xr.replaceScope(rs);
    }
    this.appendChildren(units);
    return this;
  }
  /**
   * Get a unit by key.
   *
   * @param game The {@code Game} to look up the unit in.
   * @param key An attribute key to extract the unit identifier with.
   * @return The attacker {@code Unit}.
   */
  getUnit(game: Game, key: string): Unit {
    let id = this.getStringAttribute(key);
    if (id == null) {
      return null;
    }
    let unit = game.getFreeColGameObject$String$Class(id, $J.cls(Unit));
    if (unit != null) {
      return unit;
    }
    for (const $it0 = this.getChildren$Class($J.cls(Unit)).iterator(); $it0.hasNext(); ) {
      let u = $it0.next();
      if ($J.equals(id, u.getId())) {
        u.intern();
        return u;
      }
      if ((u = u.getCarriedUnitById(id)) != null) {
        u.intern();
        return u;
      }
    }
    return null;
  }
  /**
   * Get the attacker unit.
   *
   * @param game The {@code Game} to look up the unit in.
   * @return The attacker {@code Unit}.
   */
  getAttacker(game: Game): Unit {
    return this.getUnit(game, AnimateAttackMessage.ATTACKER_TAG);
  }
  /**
   * Get the defender unit.
   *
   * @param game The {@code Game} to look up the unit in.
   * @return The defender {@code Unit}.
   */
  getDefender(game: Game): Unit {
    return this.getUnit(game, AnimateAttackMessage.DEFENDER_TAG);
  }
  /**
   * Get the attacker tile.
   *
   * @param game The {@code Game} to look up the tile in.
   * @return The attacker {@code Tile}.
   */
  getAttackerTile(game: Game): Tile {
    return game.getFreeColGameObject$String$Class(this.getStringAttribute(AnimateAttackMessage.ATTACKER_TILE_TAG), $J.cls(Tile));
  }
  /**
   * Get the defender tile.
   *
   * @param game The {@code Game} to look up the tile in.
   * @return The defender {@code Tile}.
   */
  getDefenderTile(game: Game): Tile {
    return game.getFreeColGameObject$String$Class(this.getStringAttribute(AnimateAttackMessage.DEFENDER_TILE_TAG), $J.cls(Tile));
  }
  /**
   * Get the result of the attack.
   *
   * @return The result.
   */
  getResult(): boolean {
    return this.getBooleanAttribute(AnimateAttackMessage.SUCCESS_TAG, false);
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
    let attackerTile = this.getAttackerTile(game);
    let defenderTile = this.getDefenderTile(game);
    let result = this.getResult();
    let attacker = this.getAttacker(game);
    let defender = this.getDefender(game);
    if (attacker == null) {
      Message.logger.warning('Attack animation missing attacker unit.');
      return;
    }
    if (defender == null) {
      Message.logger.warning('Attack animation missing defender unit.');
      return;
    }
    if (attackerTile == null) {
      Message.logger.warning('Attack animation for: ' + player.getId() + ' omitted attacker tile.');
    }
    if (defenderTile == null) {
      Message.logger.warning('Attack animation for: ' + player.getId() + ' omitted defender tile.');
    }
    this.igc$FreeColClient(freeColClient).animateAttackHandler(attacker, defender, attackerTile, defenderTile, result);
    this.clientGeneric(freeColClient);
  }
}

$J.define(AnimateAttackMessage, 'net.sf.freecol.common.networking.AnimateAttackMessage', { kind: 'class', sup: 'net.sf.freecol.common.networking.ObjectMessage', ctors: { 'net.sf.freecol.common.model.Game,net.sf.freecol.common.io.FreeColXMLReader': '_AnimateAttackMessage$Game$FreeColXMLReader', 'net.sf.freecol.common.model.Unit,net.sf.freecol.common.model.Unit,boolean,boolean,boolean': '_AnimateAttackMessage$Unit$Unit$boolean$boolean$boolean' }, returns: { 'getPriority': 'net.sf.freecol.common.networking.Message$MessagePriority', 'getResult': 'boolean' } });
$J.module(() => {
  FreeColXMLReader$ReadScope = $J.load('net.sf.freecol.common.io.FreeColXMLReader$ReadScope');
  Tile = $J.load('net.sf.freecol.common.model.Tile');
  Unit = $J.load('net.sf.freecol.common.model.Unit');
  Message = $J.load('net.sf.freecol.common.networking.Message');
  Message$MessagePriority = $J.load('net.sf.freecol.common.networking.Message$MessagePriority');
});
