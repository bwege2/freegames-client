// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/common/networking/PayArrearsMessage.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { AttributeMessage } from './AttributeMessage.ts';

let Message$MessagePriority;

/**
 * The message sent when paying tax arrears.
 */
export class PayArrearsMessage extends AttributeMessage {
  static readonly TAG: string = 'payArrears';
  static readonly GOODS_TYPE_TAG: string = 'goodsType';
  /**
   * Create a new {@code PayArrearsMessage} with the
   * supplied goods type.
   *
   * @param type The {@code GoodsType} to pay arrears for.
   */
  _PayArrearsMessage$GoodsType(type$: GoodsType): this {
    this._AttributeMessage$String$StringArr(PayArrearsMessage.TAG, [PayArrearsMessage.GOODS_TYPE_TAG, type$.getId()]);
    return this;
  }
  /**
   * Create a new {@code PayArrearsMessage} from a stream.
   *
   * @param game The {@code Game} to read within.
   * @param xr The {@code FreeColXMLReader} to read from.
   * @exception XMLStreamException if the stream is corrupt.
   */
  _PayArrearsMessage$Game$FreeColXMLReader(game: Game, xr: FreeColXMLReader): this {
    this._AttributeMessage$String$FreeColXMLReader$StringArr(PayArrearsMessage.TAG, xr, [PayArrearsMessage.GOODS_TYPE_TAG]);
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
    let goodsType = freeColServer.getSpecification().getGoodsType(this.getStringAttribute(PayArrearsMessage.GOODS_TYPE_TAG));
    return this.igc$FreeColServer(freeColServer).payArrears(serverPlayer, goodsType);
  }
}

$J.define(PayArrearsMessage, 'net.sf.freecol.common.networking.PayArrearsMessage', { kind: 'class', sup: 'net.sf.freecol.common.networking.AttributeMessage', ctors: { 'net.sf.freecol.common.model.Game,net.sf.freecol.common.io.FreeColXMLReader': '_PayArrearsMessage$Game$FreeColXMLReader', 'net.sf.freecol.common.model.GoodsType': '_PayArrearsMessage$GoodsType' }, returns: { 'getPriority': 'net.sf.freecol.common.networking.Message$MessagePriority' } });
$J.module(() => {
  Message$MessagePriority = $J.load('net.sf.freecol.common.networking.Message$MessagePriority');
});
