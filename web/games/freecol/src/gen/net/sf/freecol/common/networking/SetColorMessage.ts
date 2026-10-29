// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/common/networking/SetColorMessage.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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

let Color, Message, Message$MessagePriority;

/**
 * The message that changes the player color.
 */
export class SetColorMessage extends AttributeMessage {
  static readonly TAG: string = 'setColor';
  static readonly COLOR_TAG: string = 'color';
  static readonly NATION_TAG: string = 'nation';
  /**
   * Create a new {@code SetColorMessage}.
   *
   * @param nation The {@code Nation} that is changing color.
   * @param color The new {@code Color}.
   */
  _SetColorMessage$Nation$Color(nation: Nation, color: Color): this {
    this._AttributeMessage$String$StringArr(SetColorMessage.TAG, [SetColorMessage.NATION_TAG, nation.getId(), SetColorMessage.COLOR_TAG, String(color.getRGB())]);
    return this;
  }
  /**
   * Create a new {@code SetAvailableMessage} from a stream.
   *
   * @param game The {@code Game} this message belongs to (null here).
   * @param xr The {@code FreeColXMLReader} to read from.
   * @exception XMLStreamException if the stream is corrupt.
   */
  _SetColorMessage$Game$FreeColXMLReader(game: Game, xr: FreeColXMLReader): this {
    this._AttributeMessage$String$FreeColXMLReader$StringArr(SetColorMessage.TAG, xr, [SetColorMessage.NATION_TAG, SetColorMessage.COLOR_TAG]);
    return this;
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
  clientHandler(freeColClient: FreeColClient): void {
    let game = freeColClient.getGame();
    let spec = game.getSpecification();
    let nation = this.getNation(spec);
    let color = this.getColor();
    if (nation == null) {
      Message.logger.warning('Invalid nation: ' + this.toString());
      return;
    }
    if (color == null) {
      Message.logger.warning('Invalid color: ' + this.toString());
      return;
    }
    this.pgc$FreeColClient(freeColClient).setColorHandler(nation, color);
  }
  /**
   * {@inheritDoc}
   */
  serverHandler(freeColServer: FreeColServer, serverPlayer: ServerPlayer): ChangeSet {
    if (serverPlayer == null) {
      Message.logger.warning('setColor from unknown connection');
    }
    let spec = freeColServer.getGame().getSpecification();
    let nation = this.getNation(spec);
    let color = this.getColor();
    if (nation == null) {
      return serverPlayer.clientError$String('Invalid nation: ' + this.toString());
    } else if (color == null) {
      return serverPlayer.clientError$String('Invalid color: ' + this.toString());
    }
    return this.pgc$FreeColServer(freeColServer).setColor(serverPlayer, nation, color);
  }
  /**
   * Get the nation whose color is changing.
   *
   * @param spec The {@code Specification} to look up the nation in.
   * @return The {@code Nation}.
   */
  getNation(spec: Specification): Nation {
    return spec.getNation(this.getStringAttribute(SetColorMessage.NATION_TAG));
  }
  /**
   * Get the color.
   *
   * @return The new {@code Color}.
   */
  getColor(): Color {
    let color = null;
    try {
      let rgb = this.getIntegerAttribute(SetColorMessage.COLOR_TAG, 0);
      color = new Color()._Color$int(rgb);
    } catch ($e0) {
      if ($J.isa($e0, NumberFormatException)) {
        let nfe = $J.exc($e0);
      } else {
        throw $e0;
      }
    }
    return color;
  }
}

$J.define(SetColorMessage, 'net.sf.freecol.common.networking.SetColorMessage', { kind: 'class', sup: 'net.sf.freecol.common.networking.AttributeMessage', ctors: { 'net.sf.freecol.common.model.Game,net.sf.freecol.common.io.FreeColXMLReader': '_SetColorMessage$Game$FreeColXMLReader', 'net.sf.freecol.common.model.Nation,java.awt.Color': '_SetColorMessage$Nation$Color' }, returns: { 'getColor': 'java.awt.Color', 'getPriority': 'net.sf.freecol.common.networking.Message$MessagePriority' } });
$J.module(() => {
  Color = $J.load('java.awt.Color');
  Message = $J.load('net.sf.freecol.common.networking.Message');
  Message$MessagePriority = $J.load('net.sf.freecol.common.networking.Message$MessagePriority');
});
