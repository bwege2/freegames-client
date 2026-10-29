// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/common/networking/TrivialMessage.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J, Collections, RuntimeException } from '../../../../../../jre/index.ts';
import { Message } from './Message.ts';

let FreeColException, ContinueMessage, DisconnectMessage, EndTurnMessage, EnterRevengeModeMessage, Message$MessagePriority, ReconnectMessage, RequestLaunchMessage, RetireMessage, StartGameMessage;

/**
 * The basic trivial message, with just a name.
 */
export class TrivialMessage extends Message {
  static continueMessage: ContinueMessage = null;
  static disconnectMessage: DisconnectMessage = null;
  static endTurnMessage: EndTurnMessage = null;
  static enterRevengeModeMessage: EnterRevengeModeMessage = null;
  static reconnectMessage: ReconnectMessage = null;
  static requestLaunchMessage: RequestLaunchMessage = null;
  static retireMessage: RetireMessage = null;
  static startGameMessage: StartGameMessage = null;
  /**
   * The actual message type.
   */
  type: string = null;
  /**
   * Create a new {@code TrivialMessage} of a given type.
   *
   * @param type The message type.
   */
  _TrivialMessage$String(type$: string): this {
    this._Message();
    this.type = type$;
    return this;
  }
  /**
   * Create a new {@code TrivialMessage} from a stream.
   *
   * Note: only call this from direct subclasses of TrivialMessage as it
   * consumes the whole message.
   *
   * @param tag The message tag.
   * @param game The {@code Game} this message belongs to.
   * @param xr The {@code FreeColXMLReader} to read from.
   * @exception XMLStreamException if the stream is corrupt.
   */
  _TrivialMessage$String$Game$FreeColXMLReader(tag: string, game: Game, xr: FreeColXMLReader): this {
    this._TrivialMessage$String(tag);
    xr.closeTag$String(tag);
    return this;
  }
  /**
   * {@inheritDoc}
   */
  getType$(): string {
    return this.type;
  }
  /**
   * {@inheritDoc}
   */
  setType(type$: string): void {
    this.type = type$;
  }
  /**
   * {@inheritDoc}
   */
  hasAttribute(key: string): boolean {
    return false;
  }
  /**
   * {@inheritDoc}
   */
  getStringAttribute(key: string): string {
    return null;
  }
  /**
   * {@inheritDoc}
   */
  setStringAttribute(key: string, value: string): void {
    if (key == null || value == null) {
    } else {
      throw new RuntimeException(this.getType$() + '.setStringAttribute NYI');
    }
  }
  /**
   * {@inheritDoc}
   */
  getStringAttributeMap(): JMap<string, string> {
    return Collections.emptyMap();
  }
  /**
   * {@inheritDoc}
   */
  getChildCount(): number {
    return 0;
  }
  /**
   * {@inheritDoc}
   */
  getChildren$(): List<FreeColObject> {
    return Collections.emptyList();
  }
  /**
   * {@inheritDoc}
   */
  setChildren(fcos: List<FreeColObject>): void {
    if (fcos == null || fcos.isEmpty()) {
    } else {
      throw new RuntimeException(this.getType$() + '.setChildren NYI');
    }
  }
  /**
   * {@inheritDoc}
   */
  appendChild<T>(fco: T): void {
    if (fco == null) {
    } else {
      throw new RuntimeException(this.getType$() + '.append NYI');
    }
  }
  /**
   * {@inheritDoc}
   */
  appendChildren<T>(fcos: Collection<T>): void {
    if (fcos == null) {
    } else {
      throw new RuntimeException(this.getType$() + '.append NYI');
    }
  }
  /**
   * {@inheritDoc}
   */
  currentPlayerMessage(): boolean {
    return false;
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
    throw new FreeColException()._FreeColException$String(this.getType$() + ' aiHandler NYI');
  }
  /**
   * {@inheritDoc}
   */
  clientHandler(freeColClient: FreeColClient): void {
    throw new FreeColException()._FreeColException$String(this.getType$() + ' clientHandler NYI');
  }
  /**
   * {@inheritDoc}
   */
  serverHandler(freeColServer: FreeColServer, serverPlayer: ServerPlayer): ChangeSet {
    return serverPlayer.clientError$String('Invalid message type: ' + this.getType$());
  }
  static $clinit() {
    TrivialMessage.continueMessage = new ContinueMessage()._ContinueMessage$();
    TrivialMessage.disconnectMessage = new DisconnectMessage()._DisconnectMessage$();
    TrivialMessage.endTurnMessage = new EndTurnMessage()._EndTurnMessage$();
    TrivialMessage.enterRevengeModeMessage = new EnterRevengeModeMessage()._EnterRevengeModeMessage$();
    TrivialMessage.reconnectMessage = new ReconnectMessage()._ReconnectMessage$();
    TrivialMessage.requestLaunchMessage = new RequestLaunchMessage()._RequestLaunchMessage$();
    TrivialMessage.retireMessage = new RetireMessage()._RetireMessage$();
    TrivialMessage.startGameMessage = new StartGameMessage()._StartGameMessage$();
  }
}

$J.define(TrivialMessage, 'net.sf.freecol.common.networking.TrivialMessage', { kind: 'class', sup: 'net.sf.freecol.common.networking.Message', ctors: { 'java.lang.String,net.sf.freecol.common.model.Game,net.sf.freecol.common.io.FreeColXMLReader': '_TrivialMessage$String$Game$FreeColXMLReader', 'java.lang.String': '_TrivialMessage$String' }, returns: { 'getPriority': 'net.sf.freecol.common.networking.Message$MessagePriority', 'getChildren$': 'java.util.List', 'getChildCount': 'int', 'getStringAttributeMap': 'java.util.Map', 'getType$': 'java.lang.String' }, meths: { 'getChildren()': 'getChildren$', 'getType()': 'getType$' }, clinit: true, lazy: ['continueMessage', 'disconnectMessage', 'endTurnMessage', 'enterRevengeModeMessage', 'reconnectMessage', 'requestLaunchMessage', 'retireMessage', 'startGameMessage'] });
$J.module(() => {
  FreeColException = $J.load('net.sf.freecol.common.FreeColException');
  ContinueMessage = $J.load('net.sf.freecol.common.networking.ContinueMessage');
  DisconnectMessage = $J.load('net.sf.freecol.common.networking.DisconnectMessage');
  EndTurnMessage = $J.load('net.sf.freecol.common.networking.EndTurnMessage');
  EnterRevengeModeMessage = $J.load('net.sf.freecol.common.networking.EnterRevengeModeMessage');
  Message$MessagePriority = $J.load('net.sf.freecol.common.networking.Message$MessagePriority');
  ReconnectMessage = $J.load('net.sf.freecol.common.networking.ReconnectMessage');
  RequestLaunchMessage = $J.load('net.sf.freecol.common.networking.RequestLaunchMessage');
  RetireMessage = $J.load('net.sf.freecol.common.networking.RetireMessage');
  StartGameMessage = $J.load('net.sf.freecol.common.networking.StartGameMessage');
});
