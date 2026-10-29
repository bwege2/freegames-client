// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/server/model/ServerColonyTile.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J, Logger } from '../../../../../../jre/index.ts';
import { ColonyTile } from '../../common/model/ColonyTile.ts';

let ModelMessage, ModelMessage$MessageType, ChangeSet$See;

/**
 * The server version of a colony tile.
 */
export class ServerColonyTile extends ColonyTile {
  static logger: Logger = null;
  /**
   * Trivial constructor for Game.newInstance.
   *
   * @param game The {@code Game} this object belongs to.
   * @param id The object identifier.
   */
  _ServerColonyTile$Game$String(game: Game, id: string): this {
    this._ColonyTile$Game$String(game, id);
    return this;
  }
  /**
   * Creates at new ServerColonyTile.
   *
   * @param game The {@code Game} this object belongs to.
   * @param colony The {@code Colony} this object belongs to.
   * @param workTile The tile in which this {@code ColonyTile}
   *                 represents a {@code WorkLocation} for.
   */
  _ServerColonyTile$Game$Colony$Tile(game: Game, colony: Colony, workTile: Tile): this {
    this._ColonyTile$Game$Colony$Tile(game, colony, workTile);
    return this;
  }
  /**
   * This method is called only when a new turn is beginning.  It
   * will reduce the quantity of the bonus {@code Resource}
   * that is on the given tile, if any and if applicable.
   *
   * @param tile The {@code Tile} to check for a resource.
   * @param goodsType The {@code GoodsType} the goods type to expend.
   * @param unitType The {@code UnitType} doing the production.
   * @return The {@code Resource} if it is exhausted by this
   *     call (so it can be used in a message), otherwise null.
   */
  expendResource(tile: Tile, goodsType: GoodsType, unitType: UnitType): Resource {
    if (!tile.hasResource()) {
      return null;
    }
    let resource = tile.getResource();
    if (resource.isUnlimited()) {
      return null;
    }
    if (resource.useQuantity$GoodsType$UnitType$int(goodsType, unitType, tile.getPotentialProduction(goodsType, unitType)) === 0) {
      tile.cacheUnseen$();
      tile.removeResource();
      return resource;
    }
    return null;
  }
  /**
   * New turn for this colony tile.
   *
   * @param random A {@code Random} number source.
   * @param lb A {@code LogBuilder} to log to.
   * @param cs A {@code ChangeSet} to update.
   */
  csNewTurn(random: Random, lb: LogBuilder, cs: ChangeSet): void {
    let colony = this.getColony();
    let owner = colony.getOwner();
    let workTile = this.getWorkTile();
    if (!this.isColonyCenterTile() && !this.isEmpty() && this.canBeWorked()) {
      for (const $it0 = this.getUnitList().iterator(); $it0.hasNext(); ) {
        let unit = $it0.next();
        let resource = this.expendResource(workTile, unit.getWorkType(), unit.getType());
        if (resource != null) {
          lb.add([' ', this.getId(), ' exhausted resource ', resource.getType().getSuffix$()]);
          cs.addMessage(owner, new ModelMessage()._ModelMessage$MessageType$String$FreeColGameObject(ModelMessage$MessageType.WARNING, 'model.colonyTile.resourceExhausted', colony).addNamed$String$Named('%resource%', resource).addName$String$String('%colony%', colony.getName()));
          cs.add$See$FreeColGameObjectArr(ChangeSet$See.perhaps(), [workTile]);
          break;
        }
      }
    }
  }
  static $clinit() {
    ServerColonyTile.logger = Logger.getLogger($J.cls(ServerColonyTile).getName());
  }
}

$J.define(ServerColonyTile, 'net.sf.freecol.server.model.ServerColonyTile', { kind: 'class', ifaces: ['net.sf.freecol.server.model.TurnTaker'], sup: 'net.sf.freecol.common.model.ColonyTile', ctors: { 'net.sf.freecol.common.model.Game,net.sf.freecol.common.model.Colony,net.sf.freecol.common.model.Tile': '_ServerColonyTile$Game$Colony$Tile', 'net.sf.freecol.common.model.Game,java.lang.String': '_ServerColonyTile$Game$String' }, clinit: true, lazy: ['logger'] });
$J.module(() => {
  ModelMessage = $J.load('net.sf.freecol.common.model.ModelMessage');
  ModelMessage$MessageType = $J.load('net.sf.freecol.common.model.ModelMessage$MessageType');
  ChangeSet$See = $J.load('net.sf.freecol.common.networking.ChangeSet$See');
});
