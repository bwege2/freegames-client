// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/common/networking/QuestionMessage.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { WrapperMessage } from './WrapperMessage.ts';

/**
 * The basic question message wrapper.
 */
export class QuestionMessage extends WrapperMessage {
  static readonly TAG: string = 'question';
  /**
   * Create a new {@code QuestionMessage} of a given type.
   *
   * @param replyId The reply id.
   * @param message The {@code Message} to encapsulate.
   */
  _QuestionMessage$int$Message(replyId: number, message: Message): this {
    this._WrapperMessage$String$int$Message(QuestionMessage.TAG, replyId, message);
    return this;
  }
  /**
   * Create a new {@code QuestionMessage} from a stream.
   *
   * @param game The {@code Game} to read within.
   * @param xr The {@code FreeColXMLReader} to read from.
   * @exception XMLStreamException if the stream is corrupt.
   * @exception FreeColException if the internal message can not be read.
   */
  _QuestionMessage$Game$FreeColXMLReader(game: Game, xr: FreeColXMLReader): this {
    this._WrapperMessage$String$Game$FreeColXMLReader(QuestionMessage.TAG, game, xr);
    return this;
  }
}

$J.define(QuestionMessage, 'net.sf.freecol.common.networking.QuestionMessage', { kind: 'class', sup: 'net.sf.freecol.common.networking.WrapperMessage', ctors: { 'net.sf.freecol.common.model.Game,net.sf.freecol.common.io.FreeColXMLReader': '_QuestionMessage$Game$FreeColXMLReader', 'int,net.sf.freecol.common.networking.Message': '_QuestionMessage$int$Message' } });
