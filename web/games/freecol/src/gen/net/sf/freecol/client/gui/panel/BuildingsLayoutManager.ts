// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/client/gui/panel/BuildingsLayoutManager.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
/**
 *  Copyright (C) 2002-2023   The FreeCol Team
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
import { $J, ArrayList, Collections, JObject, Random } from '../../../../../../../jre/index.ts';

let Dimension, Point, Rectangle, JViewport, ColonyPanel$BuildingsPanel$EmptyBuildingSite, WrapLayout;

/**
 * A specific layout manager for {@code BuildingsPanel}.
 *
 * This layout manager tries to lay out all the buildings in a randomized
 * pattern using the preferred size of the building (that is, the maximum
 * required size of the building for all levels).
 *
 * A {@link WrapLayout} with the minimum building size is used as a
 * fallback if this layout manager fails to layout all the buildings
 * within the container's current size. 
 *
 * @see BuildingsPanel
 */
export class BuildingsLayoutManager extends JObject {
  /**
   * A seed that is used when laying out the component. The
   * same layout will be reached if no sizes (buildings or the
   * container) have been changed.
   */
  layoutSeed: number = 0;
  /**
   * Fallback rendering if there's insufficent room for rendering
   * all the buildings.
   */
  wrapLayout: WrapLayout = null;
  $init_BuildingsLayoutManager() {
    this.layoutSeed = 1;
    this.wrapLayout = new WrapLayout()._WrapLayout();
  }
  /**
   * Creates a new layout manager with a standard seed.
   */
  _BuildingsLayoutManager$(): this {
    this._BuildingsLayoutManager$long(1);
    return this;
  }
  /**
   * Creates a new layout manager.
   *
   * @param layoutSeed A seed that is used when laying out the component. The
   *      same layout will be reached if no sizes (buildings or the container)
   *      have been changed.
   */
  _BuildingsLayoutManager$long(layoutSeed: number): this {
    this.$init_BuildingsLayoutManager();
    this.layoutSeed = layoutSeed;
    return this;
  }
  /**
   * Returns the preferred dimensions for this layout given the <i>visible</i>
   * components in the specified target container.
   *
   * @param parent the component which needs to be laid out
   * @return the preferred dimensions to lay out the subcomponents of the
   *         specified container
   */
  preferredLayoutSize(parent: Container): Dimension {
    let size = this.determineInitialSize(parent);
    if (this.randomizedPlacement(parent, size, true)) {
      return size;
    }
    this.setAllEmptyBuildingSiteVisibility(parent, false);
    return this.wrapLayout.layoutSize$Container$int$boolean(parent, size.width_, false);
  }
  determineInitialSize(parent: Container): Dimension {
    if (parent.getParent() != null && parent.getParent() instanceof JViewport) {
      return parent.getParent().getSize$();
    }
    return new Dimension()._Dimension$int$int(0, 0);
  }
  /**
   * Just returns a minimum size. The initial size is determined by the
   * parent of the given parent.
   */
  minimumLayoutSize(parent: Container): Dimension {
    return new Dimension()._Dimension$int$int(1, 1);
  }
  /**
   * Layout of all children of the given {@code parent}
   *
   * @param parent The {@code Container} that should get its children
   *      positioned.
   */
  layoutContainer$Container(parent: Container): void {
    {
      let size = parent.getSize$();
      let skipRandomizedPlacement = false;
      if (parent.getParent() != null && parent.getParent() instanceof JViewport) {
        let newSize = parent.getParent().getSize$();
        if (!size.equals(newSize)) {
          skipRandomizedPlacement = true;
        }
      }
      if (!skipRandomizedPlacement) {
        this.setAllEmptyBuildingSiteVisibility(parent, true);
        if (this.randomizedPlacement(parent, size, false)) {
          return;
        }
      }
      this.setAllEmptyBuildingSiteVisibility(parent, false);
      this.wrapLayout.layoutContainer$Container$boolean(parent, false);
    }
  }
  setAllEmptyBuildingSiteVisibility(parent: Container, visible: boolean): void {
    for (let c of parent.getComponents()) {
      if (c instanceof ColonyPanel$BuildingsPanel$EmptyBuildingSite) {
        c.setVisible(visible);
      }
    }
  }
  randomizedPlacement(parent: Container, size: Dimension, dryRun: boolean): boolean {
    let r = new Random(this.layoutSeed);
    let entries = this.getAllEntries(parent, size);
    if (this.isDefinitelyNotEnoughRoomForLayout(entries, size)) {
      return false;
    }
    this.sortWithLargestFirst(entries);
    let MAX_TOTAL_TRIES = 24;
    let MAX_FREE_PLACEMENT = 6;
    let MAX_PLACE_ENTRY = 10000;
    let padding = 16;
    for (let j = 0; j < MAX_TOTAL_TRIES; j++) {
      let usedRectangles = new ArrayList(entries.size());
      let placeEntries: List<BuildingsLayoutManager$Entry>;
      if (j > MAX_FREE_PLACEMENT) {
        placeEntries = this.placeFirstFourEntriesInTheCorners(size, entries, usedRectangles);
      } else {
        placeEntries = entries;
      }
      let entriesRemaining = placeEntries.size();
      for (const $it0 = placeEntries.iterator(); $it0.hasNext(); ) {
        let entry = $it0.next();
        let placed = false;
        for (let i = 0; i < ($J.idiv(MAX_PLACE_ENTRY, (Math.imul(entriesRemaining, entriesRemaining)))); i++) {
          let x = r.nextInt((size.width_ - entry.bounds_.width_) | 0);
          let y = r.nextInt((size.height_ - entry.bounds_.height_) | 0);
          let bounds = new Rectangle()._Rectangle$int$int$int$int(x, y, entry.bounds_.width_, entry.bounds_.height_);
          if (!this.overlaps(bounds, usedRectangles)) {
            usedRectangles.add(new Rectangle()._Rectangle$int$int$int$int((bounds.x_ - $J.idiv(padding, 2)) | 0, (bounds.y_ - $J.idiv(padding, 2)) | 0, (bounds.width_ + padding) | 0, (bounds.height_ + padding) | 0));
            entry.bounds_ = bounds;
            placed = true;
            break;
          }
        }
        if (!placed) {
          break;
        }
        entriesRemaining--;
      }
      if (entriesRemaining === 0) {
        if (!dryRun) {
          for (const $it1 = entries.iterator(); $it1.hasNext(); ) {
            let entry = $it1.next();
            entry.component.setBounds$Rectangle(entry.bounds_);
          }
        }
        return true;
      }
      padding = $J.idiv(padding, 2);
      if (padding < 0) {
        padding = 0;
      }
    }
    return false;
  }
  placeFirstFourEntriesInTheCorners(size: Dimension, entries: List<BuildingsLayoutManager$Entry>, usedRectangles: List<Rectangle>): List<BuildingsLayoutManager$Entry> {
    let e0 = entries.get(0);
    let e1 = entries.get(1);
    let e2 = entries.get(2);
    let e3 = entries.get(3);
    e0.bounds_ = new Rectangle()._Rectangle$int$int$int$int(0, 0, e0.bounds_.width_, e0.bounds_.height_);
    usedRectangles.add(e0.bounds_);
    e1.bounds_ = new Rectangle()._Rectangle$int$int$int$int(0, (size.height_ - e1.bounds_.height_) | 0, e1.bounds_.width_, e1.bounds_.height_);
    usedRectangles.add(e1.bounds_);
    e2.bounds_ = new Rectangle()._Rectangle$int$int$int$int((size.width_ - e1.bounds_.width_) | 0, 0, e2.bounds_.width_, e2.bounds_.height_);
    usedRectangles.add(e2.bounds_);
    e3.bounds_ = new Rectangle()._Rectangle$int$int$int$int((size.width_ - e3.bounds_.width_) | 0, (size.height_ - e3.bounds_.height_) | 0, e3.bounds_.width_, e3.bounds_.height_);
    usedRectangles.add(e3.bounds_);
    return entries.subList(4, entries.size());
  }
  isDefinitelyNotEnoughRoomForLayout(entries: List<BuildingsLayoutManager$Entry>, size: Dimension): boolean {
    if (entries.isEmpty()) {
      return false;
    }
    let minimumArea = entries.stream().map(($p0) => BuildingsLayoutManager.areaOf($p0)).reduce((a, b) => a + b).get();
    return minimumArea > (size.width_) * size.height_;
  }
  /**
   * Finds all components that are children to the given parent.
   *
   * @return The list of children (called entries).
   */
  getAllEntries(parent: Container, size: Dimension): List<BuildingsLayoutManager$Entry> {
    let entries = new ArrayList(parent.getComponentCount());
    for (let c of parent.getComponents()) {
      if (!c.isVisible$()) {
        continue;
      }
      let componentSize = c.getPreferredSize$();
      entries.add(new BuildingsLayoutManager$Entry()._BuildingsLayoutManager$Entry(c, new Rectangle()._Rectangle$int$int$int$int(0, 0, componentSize.width_, componentSize.height_)));
    }
    return entries;
  }
  sortWithLargestFirst(entries: List<BuildingsLayoutManager$Entry>): void {
    Collections.sort(entries, (a, b) => $J.icmp(BuildingsLayoutManager.areaOf(b), BuildingsLayoutManager.areaOf(a)));
  }
  static areaOf(a: BuildingsLayoutManager$Entry): number {
    return (a.bounds_.width_) * a.bounds_.height_;
  }
  overlaps(rectangle: Rectangle, list: List<Rectangle>): boolean {
    for (const $it2 = list.iterator(); $it2.hasNext(); ) {
      let r = $it2.next();
      if (rectangle.intersects$Rectangle(r)) {
        return true;
      }
    }
    return false;
  }
  determineOffsetForCentering(displaySize: Dimension, contentSize: Dimension): Point {
    return new Point()._Point$int$int($J.idiv(((displaySize.width_ - contentSize.width_) | 0), 2), $J.idiv(((displaySize.height_ - contentSize.height_) | 0), 2));
  }
  reposition(bounds: Rectangle, offset: Point): Rectangle {
    return new Rectangle()._Rectangle$int$int$int$int((bounds.x_ + offset.x_) | 0, (bounds.y_ + offset.y_) | 0, bounds.width_, bounds.height_);
  }
  addLayoutComponent$String$Component(name: string, comp: Component): void {
  }
  removeLayoutComponent(comp: Component): void {
  }
}

export class BuildingsLayoutManager$Entry extends JObject {
  component: Component = null;
  bounds_: Rectangle = null;
  _BuildingsLayoutManager$Entry(component: Component, bounds: Rectangle): this {
    this.component = component;
    this.bounds_ = bounds;
    return this;
  }
}

$J.define(BuildingsLayoutManager, 'net.sf.freecol.client.gui.panel.BuildingsLayoutManager', { kind: 'class', ifaces: ['java.awt.LayoutManager'], sup: 'java.lang.Object', ctors: { 'long': '_BuildingsLayoutManager$long', '': '_BuildingsLayoutManager$' }, meths: { 'addLayoutComponent(java.lang.String,java.awt.Component)': 'addLayoutComponent$String$Component', 'layoutContainer(java.awt.Container)': 'layoutContainer$Container' } });
$J.define(BuildingsLayoutManager$Entry, 'net.sf.freecol.client.gui.panel.BuildingsLayoutManager$Entry', { kind: 'class', sup: 'java.lang.Object', ctors: { 'java.awt.Component,java.awt.Rectangle': '_BuildingsLayoutManager$Entry' } });
$J.module(() => {
  Dimension = $J.load('java.awt.Dimension');
  Point = $J.load('java.awt.Point');
  Rectangle = $J.load('java.awt.Rectangle');
  JViewport = $J.load('javax.swing.JViewport');
  ColonyPanel$BuildingsPanel$EmptyBuildingSite = $J.load('net.sf.freecol.client.gui.panel.ColonyPanel$BuildingsPanel$EmptyBuildingSite');
  WrapLayout = $J.load('net.sf.freecol.client.gui.panel.WrapLayout');
});
