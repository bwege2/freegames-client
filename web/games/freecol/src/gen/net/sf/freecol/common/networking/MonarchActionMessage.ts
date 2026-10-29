// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/common/networking/MonarchActionMessage.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J, RuntimeException } from '../../../../../../jre/index.ts';
import { ObjectMessage } from './ObjectMessage.ts';

let Monarch$MonarchAction, StringTemplate, Message$MessagePriority;

/**
 * The message sent when doing a monarch action.
 */
export class MonarchActionMessage extends ObjectMessage {
  static readonly TAG: string = 'monarchAction';
  static readonly ACTION_TAG: string = 'action';
  static readonly MONARCH_TAG: string = 'monarch';
  static readonly RESULT_TAG: string = 'result';
  static readonly TAX_TAG: string = 'tax';
  /**
   * Create a new {@code MonarchActionMessage} with the given action
   * to be sent to the client to solicit a response.
   *
   * @param action The {@code MonarchAction} to do.
   * @param template A {@code StringTemplate} describing the action.
   * @param monarchKey The resource key for the monarch image.
   */
  _MonarchActionMessage$MonarchAction$StringTemplate$String(action: Monarch$MonarchAction, template: StringTemplate, monarchKey: string): this {
    this._ObjectMessage$String$StringArr(MonarchActionMessage.TAG, [MonarchActionMessage.ACTION_TAG, action.toString(), MonarchActionMessage.MONARCH_TAG, monarchKey]);
    this.appendChild(template);
    return this;
  }
  /**
   * Create a new {@code MonarchActionMessage} from a stream.
   *
   * @param game The {@code Game} this message belongs to.
   * @param xr The {@code FreeColXMLReader} to read from.
   * @exception XMLStreamException if there is a problem reading the stream.
   */
  _MonarchActionMessage$Game$FreeColXMLReader(game: Game, xr: FreeColXMLReader): this {
    this._ObjectMessage$String$FreeColXMLReader$StringArr(MonarchActionMessage.TAG, xr, [MonarchActionMessage.ACTION_TAG, MonarchActionMessage.MONARCH_TAG, MonarchActionMessage.TAX_TAG, MonarchActionMessage.RESULT_TAG]);
    let template = null;
    while (xr.moreTags()) {
      let tag = xr.getLocalName();
      if ($J.equals(StringTemplate.TAG, tag)) {
        if (template == null) {
          template = xr.readFreeColObject$Game$Class(game, $J.cls(StringTemplate));
        } else {
          this.expected(MonarchActionMessage.TAG, tag);
        }
      } else {
        this.expected(StringTemplate.TAG, tag);
      }
      xr.expectTag(tag);
    }
    xr.expectTag(MonarchActionMessage.TAG);
    this.appendChild(template);
    return this;
  }
  /**
   * Gets the monarch action type of this message.
   *
   * @return The monarch action type.
   */
  getAction(): Monarch$MonarchAction {
    return this.getEnumAttribute(MonarchActionMessage.ACTION_TAG, $J.cls(Monarch$MonarchAction), null);
  }
  /**
   * Gets the template of this message.
   *
   * @return The template.
   */
  getTemplate(): StringTemplate {
    return this.getChild(0, $J.cls(StringTemplate));
  }
  /**
   * Gets the monarch key.
   *
   * @return The monarch key.
   */
  getMonarchKey(): string {
    return this.getStringAttribute(MonarchActionMessage.MONARCH_TAG);
  }
  /**
   * Gets the tax amount attached to this message.
   *
   * @return The tax amount, or negative if none present.
   */
  getTax(): number {
    return this.getIntegerAttribute(MonarchActionMessage.TAX_TAG, -1);
  }
  /**
   * Gets the result.
   *
   * @return The result.
   */
  getResult(): boolean {
    return this.getBooleanAttribute(MonarchActionMessage.RESULT_TAG, null);
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
    let mp = null;
    let action = this.getAction();
    switch (action) {
      case Monarch$MonarchAction.RAISE_TAX_ACT:
      case Monarch$MonarchAction.RAISE_TAX_WAR:
      case Monarch$MonarchAction.MONARCH_MERCENARIES:
      case Monarch$MonarchAction.HESSIAN_MERCENARIES:
        mp = Message$MessagePriority.EARLY;
        break;
      case Monarch$MonarchAction.NO_ACTION:
      case Monarch$MonarchAction.FORCE_TAX:
      case Monarch$MonarchAction.WAIVE_TAX:
      case Monarch$MonarchAction.DISPLEASURE:
        mp = Message$MessagePriority.NORMAL;
        break;
      case Monarch$MonarchAction.LOWER_TAX_OTHER:
      case Monarch$MonarchAction.LOWER_TAX_WAR:
      case Monarch$MonarchAction.ADD_TO_REF:
      case Monarch$MonarchAction.DECLARE_PEACE:
      case Monarch$MonarchAction.DECLARE_WAR:
      case Monarch$MonarchAction.SUPPORT_LAND:
      case Monarch$MonarchAction.SUPPORT_SEA:
        mp = Message$MessagePriority.LATE;
        break;
    }
    if (mp == null) {
      throw new RuntimeException('Missing priority for action: ' + $J.str(action));
    }
    return mp;
  }
  /**
   * {@inheritDoc}
   */
  aiHandler(freeColServer: FreeColServer, aiPlayer: AIPlayer): void {
    let action = this.getAction();
    let tax = this.getTax();
    aiPlayer.monarchActionHandler(action, tax);
  }
  /**
   * {@inheritDoc}
   */
  clientHandler(freeColClient: FreeColClient): void {
    let action = this.getAction();
    let template = this.getTemplate();
    let key = this.getMonarchKey();
    this.igc$FreeColClient(freeColClient).monarchActionHandler(action, template, key);
    this.clientGeneric(freeColClient);
  }
  /**
   * {@inheritDoc}
   */
  serverHandler(freeColServer: FreeColServer, serverPlayer: ServerPlayer): ChangeSet {
    return this.igc$FreeColServer(freeColServer).monarchAction(serverPlayer, this.getAction(), this.getResult());
  }
  /**
   * Sets the tax amount attached to this message.
   *
   * @param tax The tax amount.
   * @return This message.
   */
  setTax(tax: number): MonarchActionMessage {
    this.setStringAttribute(MonarchActionMessage.TAX_TAG, String(tax));
    return this;
  }
  /**
   * Sets the result.
   *
   * @param accept The new result.
   * @return This message.
   */
  setResult(accept: boolean): MonarchActionMessage {
    this.setStringAttribute(MonarchActionMessage.RESULT_TAG, String(accept));
    return this;
  }
}

$J.define(MonarchActionMessage, 'net.sf.freecol.common.networking.MonarchActionMessage', { kind: 'class', sup: 'net.sf.freecol.common.networking.ObjectMessage', ctors: { 'net.sf.freecol.common.model.Game,net.sf.freecol.common.io.FreeColXMLReader': '_MonarchActionMessage$Game$FreeColXMLReader', 'net.sf.freecol.common.model.Monarch$MonarchAction,net.sf.freecol.common.model.StringTemplate,java.lang.String': '_MonarchActionMessage$MonarchAction$StringTemplate$String' }, returns: { 'getPriority': 'net.sf.freecol.common.networking.Message$MessagePriority', 'getResult': 'java.lang.Boolean', 'getTax': 'int', 'getMonarchKey': 'java.lang.String', 'getTemplate': 'net.sf.freecol.common.model.StringTemplate', 'getAction': 'net.sf.freecol.common.model.Monarch$MonarchAction' } });
$J.module(() => {
  Monarch$MonarchAction = $J.load('net.sf.freecol.common.model.Monarch$MonarchAction');
  StringTemplate = $J.load('net.sf.freecol.common.model.StringTemplate');
  Message$MessagePriority = $J.load('net.sf.freecol.common.networking.Message$MessagePriority');
});
