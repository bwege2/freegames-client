// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/common/model/mission/ImprovementMission.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
 *  MERCHANTLIMIT or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU General Public License for more details.
 *
 *  You should have received a copy of the GNU General Public License
 *  along with FreeCol.  If not, see <http://www.gnu.org/licenses/>.
 */
import { $J } from '../../../../../../../jre/index.ts';
import { AbstractMission } from './AbstractMission.ts';

let Ability, TileImprovement, Mission$MissionState, CollectionUtils;

/**
 * The ImprovementMission causes a Unit to add a TileImprovement to a
 * particular Tile.
 */
export class ImprovementMission extends AbstractMission {
  static readonly TAG: string = 'improvementMission';
  /**
   * The improvement of this Mission.
   */
  improvement: TileImprovement = null;
  static readonly IMPROVEMENT_TAG: string = 'improvement';
  /**
   * Creates a new {@code ImprovementMission} instance.
   *
   * @param game a {@code Game} value
   */
  _ImprovementMission$Game(game: Game): this {
    this._AbstractMission$Game(game);
    return this;
  }
  /**
   * Creates a new {@code ImprovementMission} instance.
   *
   * @param game a {@code Game} value
   * @param xr a {@code FreeColXMLReader} value
   */
  _ImprovementMission$Game$FreeColXMLReader(game: Game, xr: FreeColXMLReader): this {
    this._AbstractMission$Game$FreeColXMLReader(game, xr);
    return this;
  }
  /**
   * Creates a new {@code ImprovementMission} instance.
   *
   * @param game a {@code Game} value
   * @param id The object identifier.
   */
  _ImprovementMission$Game$String(game: Game, id: string): this {
    this._AbstractMission$Game$String(game, id);
    return this;
  }
  /**
   * Get the {@code Improvement} value.
   *
   * @return an {@code TileImprovement} value
   */
  getImprovement(): TileImprovement {
    return this.improvement;
  }
  /**
   * Set the {@code Improvement} value.
   *
   * @param newImprovement The new Improvement value.
   */
  setImprovement(newImprovement: TileImprovement): void {
    this.improvement = newImprovement;
  }
  /**
   * {@inheritDoc}
   */
  doMission(): Mission$MissionState {
    let work = this.getUnit().hasAbility$String(Ability.EXPERT_PIONEER) ? 2 : 1;
    this.setTurnCount((this.getTurnCount() - work) | 0);
    this.getUnit().setMovesLeft(0);
    return (this.getTurnCount() <= 0) ? Mission$MissionState.COMPLETED : Mission$MissionState.OK;
  }
  /**
   * Returns true if the mission is still valid.
   *
   * @return a {@code boolean} value
   */
  isValid(): boolean {
    return this.improvement != null && this.improvement.isWorkerAllowed(this.getUnit()) && super.isValid();
  }
  /**
   * Returns true if the given Unit is allowed to build at least one
   * TileImprovementType.
   *
   * @param unit an {@code Unit} value
   * @return false
   */
  static isValidFor(unit: Unit): boolean {
    let spec = unit.getGame().getSpecification();
    return CollectionUtils.any$Collection$Predicate(spec.getTileImprovementTypeList(), (ti) => ti.isWorkerAllowed(unit));
  }
  /**
   * {@inheritDoc}
   */
  writeAttributes(xw: FreeColXMLWriter): void {
    super.writeAttributes(xw);
    xw.writeAttribute$String$FreeColObject(ImprovementMission.IMPROVEMENT_TAG, this.improvement);
  }
  /**
   * {@inheritDoc}
   */
  readAttributes(xr: FreeColXMLReader): void {
    super.readAttributes(xr);
    this.improvement = xr.makeFreeColObject(this.getGame(), ImprovementMission.IMPROVEMENT_TAG, $J.cls(TileImprovement), true);
  }
  /**
   * {@inheritDoc}
   */
  getXMLTagName(): string {
    return ImprovementMission.TAG;
  }
}

$J.define(ImprovementMission, 'net.sf.freecol.common.model.mission.ImprovementMission', { kind: 'class', sup: 'net.sf.freecol.common.model.mission.AbstractMission', ctors: { 'net.sf.freecol.common.model.Game,java.lang.String': '_ImprovementMission$Game$String', 'net.sf.freecol.common.model.Game,net.sf.freecol.common.io.FreeColXMLReader': '_ImprovementMission$Game$FreeColXMLReader', 'net.sf.freecol.common.model.Game': '_ImprovementMission$Game' }, returns: { 'getXMLTagName': 'java.lang.String', 'isValid': 'boolean', 'getImprovement': 'net.sf.freecol.common.model.TileImprovement' } });
$J.module(() => {
  Ability = $J.load('net.sf.freecol.common.model.Ability');
  TileImprovement = $J.load('net.sf.freecol.common.model.TileImprovement');
  Mission$MissionState = $J.load('net.sf.freecol.common.model.mission.Mission$MissionState');
  CollectionUtils = $J.load('net.sf.freecol.common.util.CollectionUtils');
});
