// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/common/networking/ChatMessage.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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

let Color, Message$MessagePriority;

/**
 * The message that contains a chat string.
 */
export class ChatMessage extends AttributeMessage {
  static readonly TAG: string = 'chat';
  static readonly COLOR_TAG: string = 'color';
  static readonly MESSAGE_TAG: string = 'message';
  static readonly PRIVATE_TAG: string = 'private';
  static readonly SENDER_TAG: string = 'sender';
  /**
   * Create a new {@code ChatMessage} with the
   * supplied message.
   *
   * @param player The player that is sending the message.
   * @param message The text of the message to send.
   * @param privateChat Whether this message is private.
   */
  _ChatMessage$Player$String$boolean(player: Player, message: string, privateChat: boolean): this {
    this._AttributeMessage$String$StringArr(ChatMessage.TAG, [ChatMessage.COLOR_TAG, String(player.getNationColor().getRGB()), ChatMessage.MESSAGE_TAG, message, ChatMessage.PRIVATE_TAG, String(privateChat), ChatMessage.SENDER_TAG, player.getName()]);
    return this;
  }
  /**
   * Create a new {@code ChatMessage} from a stream.
   *
   * @param game The {@code Game} this message belongs to.
   * @param xr The {@code FreeColXMLReader} to read from.
   * @exception XMLStreamException if the stream is corrupt.
   */
  _ChatMessage$Game$FreeColXMLReader(game: Game, xr: FreeColXMLReader): this {
    this._AttributeMessage$String$FreeColXMLReader$StringArr(ChatMessage.TAG, xr, [ChatMessage.COLOR_TAG, ChatMessage.MESSAGE_TAG, ChatMessage.SENDER_TAG, ChatMessage.PRIVATE_TAG]);
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
  aiHandler(freeColServer: FreeColServer, aiPlayer: AIPlayer): void {
  }
  /**
   * {@inheritDoc}
   */
  clientHandler(freeColClient: FreeColClient): void {
    let game = freeColClient.getGame();
    let color = this.getColor();
    let sender = this.getSender();
    let text = this.getMessage();
    let isPrivate = this.isPrivate();
    if (sender == null || text == null) {
      return;
    }
    if (freeColClient.isInGame()) {
      this.igc$FreeColClient(freeColClient).chatHandler(sender, text, color, isPrivate);
    } else {
      this.pgc$FreeColClient(freeColClient).chatHandler(sender, text, color, isPrivate);
    }
  }
  /**
   * {@inheritDoc}
   */
  serverHandler(freeColServer: FreeColServer, serverPlayer: ServerPlayer): ChangeSet {
    this.setStringAttribute(ChatMessage.SENDER_TAG, serverPlayer.getId());
    return this.igc$FreeColServer(freeColServer).chat(serverPlayer, this.getMessage(), this.isPrivate());
  }
  /**
   * Get the color.
   *
   * @return The new {@code Color}.
   */
  getColor(): Color {
    let color = null;
    try {
      let rgb = this.getIntegerAttribute(ChatMessage.COLOR_TAG, 0);
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
  /**
   * What is the text of this ChatMessage?
   *
   * @return The text of this ChatMessage.
   */
  getMessage(): string {
    return this.getStringAttribute(ChatMessage.MESSAGE_TAG);
  }
  /**
   * Is this ChatMessage private?
   *
   * @return True if this ChatMessage is private.
   */
  isPrivate(): boolean {
    return this.getBooleanAttribute(ChatMessage.PRIVATE_TAG, false);
  }
  /**
   * Who sent this ChatMessage?
   *
   * @return The sender tag for this ChatMessage.
   */
  getSender(): string {
    return this.getStringAttribute(ChatMessage.SENDER_TAG);
  }
}

$J.define(ChatMessage, 'net.sf.freecol.common.networking.ChatMessage', { kind: 'class', sup: 'net.sf.freecol.common.networking.AttributeMessage', ctors: { 'net.sf.freecol.common.model.Game,net.sf.freecol.common.io.FreeColXMLReader': '_ChatMessage$Game$FreeColXMLReader', 'net.sf.freecol.common.model.Player,java.lang.String,boolean': '_ChatMessage$Player$String$boolean' }, returns: { 'getSender': 'java.lang.String', 'isPrivate': 'boolean', 'getMessage': 'java.lang.String', 'getColor': 'java.awt.Color', 'getPriority': 'net.sf.freecol.common.networking.Message$MessagePriority' } });
$J.module(() => {
  Color = $J.load('java.awt.Color');
  Message$MessagePriority = $J.load('net.sf.freecol.common.networking.Message$MessagePriority');
});
