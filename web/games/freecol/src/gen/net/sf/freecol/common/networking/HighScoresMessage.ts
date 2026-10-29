// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/common/networking/HighScoresMessage.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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

let HighScore, Message$MessagePriority;

/**
 * The message sent when an high score query/response occurs.
 */
export class HighScoresMessage extends ObjectMessage {
  static readonly TAG: string = 'highScores';
  static readonly KEY_TAG: string = 'key';
  /**
   * Create a new {@code HighScoresMessage} in request form (no
   * scores attached).
   *
   * @param key A message key for the final display.
   * @param scores The list of high scores, or null.
   */
  _HighScoresMessage$String$List(key: string, scores: List<HighScore>): this {
    this._ObjectMessage$String$StringArr(HighScoresMessage.TAG, [HighScoresMessage.KEY_TAG, key]);
    this.appendChildren(scores);
    return this;
  }
  /**
   * Create a new {@code HighScoresMessage} from a stream.
   *
   * @param game The {@code Game} this message belongs to.
   * @param xr The {@code FreeColXMLReader} to read from.
   * @exception XMLStreamException if there is a problem reading the stream.
   */
  _HighScoresMessage$Game$FreeColXMLReader(game: Game, xr: FreeColXMLReader): this {
    this._ObjectMessage$String$FreeColXMLReader$StringArr(HighScoresMessage.TAG, xr, [HighScoresMessage.KEY_TAG]);
    let scores = new ArrayList();
    while (xr.moreTags()) {
      let tag = xr.getLocalName();
      if ($J.equals(HighScore.TAG, tag)) {
        scores.add(new HighScore()._HighScore$FreeColXMLReader(xr));
      } else {
        this.expected(HighScore.TAG, tag);
      }
      xr.expectTag(tag);
    }
    xr.expectTag(HighScoresMessage.TAG);
    this.appendChildren(scores);
    return this;
  }
  /**
   * Accessor for the key.
   *
   * @return The key.
   */
  getKey(): string {
    return this.getStringAttribute(HighScoresMessage.KEY_TAG);
  }
  /**
   * Accessor for the scores list.
   *
   * @return The list of {@code HighScore}s.
   */
  getScores(): List<HighScore> {
    return this.getChildren$Class($J.cls(HighScore));
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
    let key = this.getKey();
    let scores = this.getScores();
    this.igc$FreeColClient(freeColClient).highScoresHandler(key, scores);
    this.clientGeneric(freeColClient);
  }
  /**
   * {@inheritDoc}
   */
  serverHandler(freeColServer: FreeColServer, serverPlayer: ServerPlayer): ChangeSet {
    return this.igc$FreeColServer(freeColServer).getHighScores(serverPlayer, this.getKey());
  }
}

$J.define(HighScoresMessage, 'net.sf.freecol.common.networking.HighScoresMessage', { kind: 'class', sup: 'net.sf.freecol.common.networking.ObjectMessage', ctors: { 'net.sf.freecol.common.model.Game,net.sf.freecol.common.io.FreeColXMLReader': '_HighScoresMessage$Game$FreeColXMLReader', 'java.lang.String,java.util.List': '_HighScoresMessage$String$List' }, returns: { 'getPriority': 'net.sf.freecol.common.networking.Message$MessagePriority', 'getScores': 'java.util.List', 'getKey': 'java.lang.String' } });
$J.module(() => {
  HighScore = $J.load('net.sf.freecol.common.model.HighScore');
  Message$MessagePriority = $J.load('net.sf.freecol.common.networking.Message$MessagePriority');
});
