// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/server/ai/WorkLocationPlan.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J, Logger, StringBuilder } from '../../../../../../jre/index.ts';
import { AIObject } from './AIObject.ts';

/**
 * Objects of this class contains AI-information for a single
 * {@link net.sf.freecol.common.model.WorkLocation}.
 */
export class WorkLocationPlan extends AIObject {
  static logger: Logger = null;
  static readonly TAG: string = 'workLocationPlan';
  /**
   * The work location the plan is for.
   */
  workLocation: WorkLocation = null;
  /**
   * The goods to produce.
   */
  goodsType: GoodsType = null;
  /**
   * Creates a new {@code WorkLocationPlan}.
   *
   * @param aiMain The main AI-object.
   * @param workLocation The {@code WorkLocation} to create
   *      a plan for.
   * @param goodsType The goodsType to be produced on the
   *      {@code workLocation} using this plan.
   */
  _WorkLocationPlan(aiMain: AIMain, workLocation: WorkLocation, goodsType: GoodsType): this {
    this._AIObject$AIMain(aiMain);
    this.workLocation = workLocation;
    this.goodsType = goodsType;
    this.setInitialized();
    return this;
  }
  /**
   * {@inheritDoc}
   */
  setInitialized(): void {
    this.initialized = this.getWorkLocation() != null && this.getGoodsType() != null;
  }
  /**
   * Gets the {@code WorkLocation} this
   * {@code WorkLocationPlan} controls.
   *
   * @return The {@code WorkLocation}.
   */
  getWorkLocation(): WorkLocation {
    return this.workLocation;
  }
  /**
   * Gets the type of goods which should be produced at the
   * {@code WorkLocation}.
   *
   * @return The type of goods.
   * @see net.sf.freecol.common.model.Goods
   * @see net.sf.freecol.common.model.WorkLocation
   */
  getGoodsType(): GoodsType {
    return this.goodsType;
  }
  /**
   * Sets the type of goods to be produced at the {@code WorkLocation}.
   *
   * @param goodsType The type of goods.
   * @see net.sf.freecol.common.model.Goods
   * @see net.sf.freecol.common.model.WorkLocation
   */
  setGoodsType(goodsType: GoodsType): void {
    this.goodsType = goodsType;
  }
  /**
   * Is this a food producing plan?
   *
   * @return True if this plan produces food.
   */
  isFoodPlan(): boolean {
    return this.goodsType.isFoodType();
  }
  /**
   * {@inheritDoc}
   */
  getXMLTagName(): string {
    return WorkLocationPlan.TAG;
  }
  /**
   * {@inheritDoc}
   */
  toString(): string {
    let sb = new StringBuilder(32);
    sb.append(String.fromCharCode(91 /* '[' */)).append(this.getId()).append(String.fromCharCode(32 /* ' ' */)).append(this.goodsType.getSuffix$()).append(' at ').append(this.workLocation.getId()).append(String.fromCharCode(93 /* ']' */));
    return sb.toString();
  }
  static $clinit() {
    WorkLocationPlan.logger = Logger.getLogger($J.cls(WorkLocationPlan).getName());
  }
}

$J.define(WorkLocationPlan, 'net.sf.freecol.server.ai.WorkLocationPlan', { kind: 'class', sup: 'net.sf.freecol.server.ai.AIObject', ctors: { 'net.sf.freecol.server.ai.AIMain,net.sf.freecol.common.model.WorkLocation,net.sf.freecol.common.model.GoodsType': '_WorkLocationPlan' }, returns: { 'getXMLTagName': 'java.lang.String', 'isFoodPlan': 'boolean', 'getGoodsType': 'net.sf.freecol.common.model.GoodsType', 'getWorkLocation': 'net.sf.freecol.common.model.WorkLocation' }, clinit: true, lazy: ['logger'] });
