// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/common/model/BuildQueue.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J, ArrayList, Collections, JEnum, JObject, Stream, StringBuilder } from '../../../../../../jre/index.ts';

let AbstractGoods, BuildingType, Consumer, ProductionInfo, GameOptions, CollectionUtils;

/**
 * A queue of things for a colony to build.
 */
export class BuildQueue<T> extends JObject {
  /**
   * A list of Buildable items.
   */
  queue: List<T> = null;
  /**
   * What to do when an item has been completed.
   */
  completionAction: BuildQueue$CompletionAction = null;
  /**
   * The build priority.
   */
  priority: number = 0;
  /**
   * The colony to queue buildables for.
   */
  colony: Colony = null;
  /**
   * Create a new build queue.
   *
   * @param colony The {@code Colony} to build for.
   * @param action The action on build completion.
   * @param priority The build priority.
   */
  _BuildQueue(colony: Colony, action: BuildQueue$CompletionAction, priority: number): this {
    this.queue = new ArrayList();
    this.completionAction = BuildQueue$CompletionAction.REMOVE;
    this.priority = Consumer.COLONY_PRIORITY;
    this.colony = colony;
    this.completionAction = action;
    this.priority = priority;
    return this;
  }
  clear(): void {
    this.queue.clear();
  }
  add(buildable: T): void {
    this.queue.add(buildable);
  }
  getValues(): List<T> {
    return this.queue;
  }
  setValues(values: List<T>): void {
    this.clear();
    this.queue.addAll(values);
  }
  remove(index: number): void {
    this.queue.removeAt(index);
  }
  size(): number {
    return this.queue.size();
  }
  isEmpty(): boolean {
    return this.queue.isEmpty();
  }
  getCompletionAction(): BuildQueue$CompletionAction {
    return this.completionAction;
  }
  setCompletionAction(newCompletionAction: BuildQueue$CompletionAction): void {
    this.completionAction = newCompletionAction;
  }
  /**
   * Get the type of building currently being built.
   *
   * @return The type of building currently being built.
   */
  getCurrentlyBuilding(): T {
    return (this.queue.isEmpty()) ? null : this.queue.get(0);
  }
  /**
   * Sets the current type of buildable to be built and if it is a building
   * insist that there is only one in the queue.
   *
   * @param buildable The {@code T} to build.
   */
  setCurrentlyBuilding(buildable: T): void {
    if (buildable == null) {
      this.clear();
    } else {
      if (buildable instanceof BuildingType && this.queue.contains(buildable)) {
        this.queue.remove(buildable);
      }
      this.queue.add(0, buildable);
    }
  }
  /**
   * Get the {@code ProductionInfo} for this BuildQueue.
   *
   * @param input A list of input {@code AbstractGoods}.
   * @return The {@code ProductionInfo} for this BuildQueue.
   */
  getProductionInfo(input: List<AbstractGoods>): ProductionInfo {
    let result = new ProductionInfo()._ProductionInfo();
    let current = this.getCurrentlyBuilding();
    if (current != null) {
      let overflow = this.colony.getSpecification().getBoolean(GameOptions.SAVE_PRODUCTION_OVERFLOW);
      let consumption = new ArrayList();
      for (const $it0 = current.getRequiredGoodsList$().iterator(); $it0.hasNext(); ) {
        let ag = $it0.next();
        let available = CollectionUtils.find$Collection$Predicate(input, AbstractGoods.matches(ag.getType()));
        if (available != null && ag.getAmount() <= available.getAmount()) {
          let amount = (overflow || ag.getType().isStorable()) ? ag.getAmount() : available.getAmount();
          consumption.add(new AbstractGoods()._AbstractGoods$GoodsType$int(ag.getType(), amount));
        } else {
          return result;
        }
      }
      result.setConsumption(consumption);
    }
    return result;
  }
  /**
   * {@inheritDoc}
   */
  getConsumedGoods(): List<AbstractGoods> {
    let current = this.getCurrentlyBuilding();
    return (current == null) ? Collections.emptyList() : current.getRequiredGoodsList$();
  }
  /**
   * {@inheritDoc}
   */
  getPriority(): number {
    return this.priority;
  }
  /**
   * {@inheritDoc}
   */
  getConsumptionModifiers(id: string): Stream<Modifier> {
    return Stream.empty();
  }
  /**
   * {@inheritDoc}
   */
  toString(): string {
    let sb = new StringBuilder(64);
    sb.append('[BuildQueue (').append(this.colony.getName()).append(String.fromCharCode(41 /* ')' */));
    for (const $it1 = this.queue.iterator(); $it1.hasNext(); ) {
      let item = $it1.next();
      sb.append(String.fromCharCode(32 /* ' ' */)).append(item.getId());
    }
    sb.append(String.fromCharCode(93 /* ']' */));
    return sb.toString();
  }
}

export class BuildQueue$CompletionAction extends JEnum {
  static REMOVE: BuildQueue$CompletionAction = null;
  static REMOVE_EXCEPT_LAST: BuildQueue$CompletionAction = null;
  static SHUFFLE: BuildQueue$CompletionAction = null;
  static ADD_RANDOM: BuildQueue$CompletionAction = null;
  static $VALUES: BuildQueue$CompletionAction[] = null;
  _BuildQueue$CompletionAction($name: string, $ordinal: number): this {
    this._JEnum($name, $ordinal);
    return this;
  }
  static values(): BuildQueue$CompletionAction[] { return BuildQueue$CompletionAction.$VALUES.slice(); }
  static valueOf(name: string): BuildQueue$CompletionAction { return $J.enumValueOf(BuildQueue$CompletionAction, name); }
  static $clinit() {
    BuildQueue$CompletionAction.REMOVE = new BuildQueue$CompletionAction()._BuildQueue$CompletionAction('REMOVE', 0);
    BuildQueue$CompletionAction.REMOVE_EXCEPT_LAST = new BuildQueue$CompletionAction()._BuildQueue$CompletionAction('REMOVE_EXCEPT_LAST', 1);
    BuildQueue$CompletionAction.SHUFFLE = new BuildQueue$CompletionAction()._BuildQueue$CompletionAction('SHUFFLE', 2);
    BuildQueue$CompletionAction.ADD_RANDOM = new BuildQueue$CompletionAction()._BuildQueue$CompletionAction('ADD_RANDOM', 3);
    BuildQueue$CompletionAction.$VALUES = [BuildQueue$CompletionAction.REMOVE, BuildQueue$CompletionAction.REMOVE_EXCEPT_LAST, BuildQueue$CompletionAction.SHUFFLE, BuildQueue$CompletionAction.ADD_RANDOM];
  }
}

$J.define(BuildQueue, 'net.sf.freecol.common.model.BuildQueue', { kind: 'class', ifaces: ['net.sf.freecol.common.model.Consumer'], sup: 'java.lang.Object', ctors: { 'net.sf.freecol.common.model.Colony,net.sf.freecol.common.model.BuildQueue$CompletionAction,int': '_BuildQueue' }, returns: { 'getPriority': 'int', 'getConsumedGoods': 'java.util.List', 'getCurrentlyBuilding': 'net.sf.freecol.common.model.BuildableType', 'getCompletionAction': 'net.sf.freecol.common.model.BuildQueue$CompletionAction', 'isEmpty': 'boolean', 'getValues': 'java.util.List' } });
$J.define(BuildQueue$CompletionAction, 'net.sf.freecol.common.model.BuildQueue$CompletionAction', { kind: 'enum', sup: 'java.lang.Enum', ctors: { '': '_BuildQueue$CompletionAction' }, clinit: true, lazy: ['$VALUES', 'REMOVE', 'REMOVE_EXCEPT_LAST', 'SHUFFLE', 'ADD_RANDOM'] });
$J.module(() => {
  AbstractGoods = $J.load('net.sf.freecol.common.model.AbstractGoods');
  BuildingType = $J.load('net.sf.freecol.common.model.BuildingType');
  Consumer = $J.load('net.sf.freecol.common.model.Consumer');
  ProductionInfo = $J.load('net.sf.freecol.common.model.ProductionInfo');
  GameOptions = $J.load('net.sf.freecol.common.option.GameOptions');
  CollectionUtils = $J.load('net.sf.freecol.common.util.CollectionUtils');
});
