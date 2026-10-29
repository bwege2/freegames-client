// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/common/networking/EmigrateUnitMessage.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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

let Ability, Europe$MigrationType, Message$MessagePriority;

/**
 * The message sent when a unit is to emigrate.
 */
export class EmigrateUnitMessage extends AttributeMessage {
  static readonly TAG: string = 'emigrateUnit';
  static readonly SLOT_TAG: string = 'slot';
  /**
   * Create a new {@code EmigrateUnitMessage} with the supplied slot.
   *
   * @param slot The slot to select the migrant from.
   */
  _EmigrateUnitMessage$int(slot: number): this {
    this._AttributeMessage$String$StringArr(EmigrateUnitMessage.TAG, [EmigrateUnitMessage.SLOT_TAG, String(slot)]);
    return this;
  }
  /**
   * Create a new {@code EmigrateUnitMessage} from a stream.
   *
   * @param game The {@code Game} this message belongs to.
   * @param xr The {@code FreeColXMLReader} to read from.
   * @exception XMLStreamException if the stream is corrupt.
   */
  _EmigrateUnitMessage$Game$FreeColXMLReader(game: Game, xr: FreeColXMLReader): this {
    this._AttributeMessage$String$FreeColXMLReader$StringArr(EmigrateUnitMessage.TAG, xr, [EmigrateUnitMessage.SLOT_TAG]);
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
    let slotString = this.getStringAttribute(EmigrateUnitMessage.SLOT_TAG);
    let europe = serverPlayer.getEurope();
    if (europe == null) {
      return serverPlayer.clientError$String('No Europe to migrate from.');
    }
    let slot: number;
    try {
      slot = $J.parseInt(slotString);
    } catch ($e0) {
      if ($J.isa($e0, NumberFormatException)) {
        let e = $J.exc($e0);
        return serverPlayer.clientError$String('Bad slot: ' + slotString);
      } else {
        throw $e0;
      }
    }
    if (!Europe$MigrationType.validMigrantSlot(slot)) {
      return serverPlayer.clientError$String('Invalid slot for recruitment: ' + slot);
    }
    let type$: Europe$MigrationType;
    if (serverPlayer.getRemainingEmigrants() > 0) {
      if (Europe$MigrationType.unspecificMigrantSlot(slot)) {
        return serverPlayer.clientError$String('Specific slot expected for FoY migration');
      }
      type$ = Europe$MigrationType.FOUNTAIN;
    } else if (serverPlayer.checkEmigrate()) {
      if (Europe$MigrationType.specificMigrantSlot(slot) && !serverPlayer.hasAbility$String(Ability.SELECT_RECRUIT)) {
        return serverPlayer.clientError$String('selectRecruit ability absent');
      }
      type$ = Europe$MigrationType.NORMAL;
    } else {
      let cost = europe.getCurrentRecruitPrice();
      if (!serverPlayer.checkGold(cost)) {
        return serverPlayer.clientError$String('No migrants available at cost ' + cost + ' for player with ' + serverPlayer.getGold() + ' gold');
      }
      type$ = Europe$MigrationType.RECRUIT;
    }
    return this.igc$FreeColServer(freeColServer).emigrate(serverPlayer, slot, type$);
  }
}

$J.define(EmigrateUnitMessage, 'net.sf.freecol.common.networking.EmigrateUnitMessage', { kind: 'class', sup: 'net.sf.freecol.common.networking.AttributeMessage', ctors: { 'net.sf.freecol.common.model.Game,net.sf.freecol.common.io.FreeColXMLReader': '_EmigrateUnitMessage$Game$FreeColXMLReader', 'int': '_EmigrateUnitMessage$int' }, returns: { 'getPriority': 'net.sf.freecol.common.networking.Message$MessagePriority' } });
$J.module(() => {
  Ability = $J.load('net.sf.freecol.common.model.Ability');
  Europe$MigrationType = $J.load('net.sf.freecol.common.model.Europe$MigrationType');
  Message$MessagePriority = $J.load('net.sf.freecol.common.networking.Message$MessagePriority');
});
