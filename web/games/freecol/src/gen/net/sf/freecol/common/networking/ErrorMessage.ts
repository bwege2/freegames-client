// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/common/networking/ErrorMessage.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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

let FreeCol, StringTemplate, Message$MessagePriority;

/**
 * The message sent when an error occurs.
 */
export class ErrorMessage extends ObjectMessage {
  static readonly TAG: string = 'error';
  static readonly MESSAGE_TAG: string = 'message';
  /**
   * Create a new {@code ErrorMessage} with the given template
   * and optional message.
   *
   * @param template The {@code StringTemplate} to send.
   * @param message An optional non-i18n message.
   */
  _ErrorMessage$StringTemplate$String(template: StringTemplate, message: string): this {
    this._ObjectMessage$String$StringArr(ErrorMessage.TAG, [ErrorMessage.MESSAGE_TAG, message]);
    this.appendChild(template);
    return this;
  }
  /**
   * Create a new {@code ErrorMessage} with the given template
   *
   * @param template The {@code StringTemplate} to send.
   */
  _ErrorMessage$StringTemplate(template: StringTemplate): this {
    this._ObjectMessage$String(ErrorMessage.TAG);
    this.appendChild(template);
    return this;
  }
  /**
   * Create a new {@code ErrorMessage} with the standard client
   * error template and given message.
   *
   * @param message The message.
   */
  _ErrorMessage$String(message: string): this {
    this._ErrorMessage$StringTemplate$String(StringTemplate.template$String('server.reject'), message);
    return this;
  }
  /**
   * Create a new {@code ErrorMessage} from an exception with
   * the standard client error template as the fallback.
   *
   * @param ex The {@code Exception} to use.
   */
  _ErrorMessage$Exception(ex: Exception): this {
    this._ErrorMessage$StringTemplate(FreeCol.errorFromException$Exception$String(ex, 'server.reject'));
    return this;
  }
  /**
   * Create a new {@code ErrorMessage} from an exception using a 
   * template key that expects a %message% parameter.
   *
   * @param key The template key.
   * @param ex The {@code Exception} to extract a message from.
   */
  _ErrorMessage$String$Exception(key: string, ex: Exception): this {
    this._ErrorMessage$StringTemplate$String(StringTemplate.template$String(key).addName$String$String('%message%', ex.getMessage()), null);
    return this;
  }
  /**
   * Create a new {@code ErrorMessage} from a stream.
   *
   * @param game The {@code Game} this message belongs to.
   * @param xr The {@code FreeColXMLReader} to read from.
   * @exception XMLStreamException if there is a problem reading the stream.
   */
  _ErrorMessage$Game$FreeColXMLReader(game: Game, xr: FreeColXMLReader): this {
    this._ObjectMessage$String$FreeColXMLReader$StringArr(ErrorMessage.TAG, xr, [ErrorMessage.MESSAGE_TAG]);
    let template = null;
    while (xr.moreTags()) {
      let tag = xr.getLocalName();
      if ($J.equals(StringTemplate.TAG, tag)) {
        if (template == null) {
          template = xr.readFreeColObject$Game$Class(game, $J.cls(StringTemplate));
        } else {
          this.expected(ErrorMessage.TAG, tag);
        }
      } else {
        this.expected(StringTemplate.TAG, tag);
      }
    }
    xr.expectTag(ErrorMessage.TAG);
    this.appendChild(template);
    return this;
  }
  /**
   * Get the template.
   *
   * @return The template.
   */
  getTemplate(): StringTemplate {
    return this.getChild(0, $J.cls(StringTemplate));
  }
  /**
   * Get the non-i18n message.
   *
   * @return The message.
   */
  getMessage(): string {
    return this.getStringAttribute(ErrorMessage.MESSAGE_TAG);
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
    let template = this.getTemplate();
    let message = this.getMessage();
    if (freeColClient.isInGame()) {
      this.igc$FreeColClient(freeColClient).errorHandler(template, message);
      this.clientGeneric(freeColClient);
    } else {
      this.pgc$FreeColClient(freeColClient).errorHandler(template, message);
    }
  }
}

$J.define(ErrorMessage, 'net.sf.freecol.common.networking.ErrorMessage', { kind: 'class', sup: 'net.sf.freecol.common.networking.ObjectMessage', ctors: { 'net.sf.freecol.common.model.Game,net.sf.freecol.common.io.FreeColXMLReader': '_ErrorMessage$Game$FreeColXMLReader', 'java.lang.String,java.lang.Exception': '_ErrorMessage$String$Exception', 'java.lang.Exception': '_ErrorMessage$Exception', 'java.lang.String': '_ErrorMessage$String', 'net.sf.freecol.common.model.StringTemplate': '_ErrorMessage$StringTemplate', 'net.sf.freecol.common.model.StringTemplate,java.lang.String': '_ErrorMessage$StringTemplate$String' }, returns: { 'getPriority': 'net.sf.freecol.common.networking.Message$MessagePriority', 'getMessage': 'java.lang.String', 'getTemplate': 'net.sf.freecol.common.model.StringTemplate' } });
$J.module(() => {
  FreeCol = $J.load('net.sf.freecol.FreeCol');
  StringTemplate = $J.load('net.sf.freecol.common.model.StringTemplate');
  Message$MessagePriority = $J.load('net.sf.freecol.common.networking.Message$MessagePriority');
});
