// @ts-nocheck
// MigLayout 5.3 core/net/miginfocom/layout/Grid.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
/*
 * License (BSD):
 * ==============
 *
 * Copyright (c) 2004, Mikael Grev, MiG InfoCom AB. (miglayout (at) miginfocom (dot) com)
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without modification,
 * are permitted provided that the following conditions are met:
 * Redistributions of source code must retain the above copyright notice, this list
 * of conditions and the following disclaimer.
 * Redistributions in binary form must reproduce the above copyright notice, this
 * list of conditions and the following disclaimer in the documentation and/or other
 * materials provided with the distribution.
 * Neither the name of the MiG InfoCom AB nor the names of its contributors may be
 * used to endorse or promote products derived from this software without specific
 * prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
 * ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 * WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED.
 * IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT,
 * INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING,
 * BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA,
 * OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY,
 * WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE)
 * ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY
 * OF SUCH DAMAGE.
 *
 * @version 1.0
 * @author Mikael Grev, MiG InfoCom AB
 *         Date: 2006-sep-08
 */
import { $J, ArrayList, Arrays, Character, HashMap, IllegalArgumentException, JObject, JString, LinkedHashMap, TreeSet, WeakHashMap, WeakReference } from '../../../../jre/index.ts';

let CC, DimConstraint, LayoutUtil, LinkHandler, PlatformDefaults, ResizeConstraint, UnitConverter, UnitValue;

/**
 * Holds components in a grid. Does most of the logic behind the layout manager.
 */
export class Grid extends JObject {
  static readonly TEST_GAPS: boolean = true;
  static GROW_100: number[] = null;
  static DOCK_DIM_CONSTRAINT: DimConstraint = null;
  /**
   * This is the maximum grid position for "normal" components. Docking components use the space out to
   * <code>MAX_DOCK_GRID</code> and below 0.
   */
  static readonly MAX_GRID: number = 30000;
  /**
   * Docking components will use the grid coordinates <code>-MAX_DOCK_GRID -> 0</code> and <code>MAX_GRID -> MAX_DOCK_GRID</code>.
   */
  static readonly MAX_DOCK_GRID: number = 32767;
  /**
   * A constraint used for gaps.
   */
  static GAP_RC_CONST: ResizeConstraint = null;
  static GAP_RC_CONST_PUSH: ResizeConstraint = null;
  /**
   * Used for components that doesn't have a CC set. Not that it's really really important that the CC is never changed in this Grid class.
   */
  static DEF_CC: CC = null;
  /**
   * The constraints. Never <code>null</code>.
   */
  lc: LC = null;
  /**
   * The parent that is layout out and this grid is done for. Never <code>null</code>.
   */
  container: ContainerWrapper = null;
  /**
   * An x, y array implemented as a sparse array to accommodate for any grid size without wasting memory (or rather 15 bit (0-MAX_GRID * 0-MAX_GRID).
   */
  grid: LinkedHashMap<number, Grid$Cell> = null;
  wrapGapMap: HashMap<number, BoundSize> = null;
  /**
   * The size of the grid. Row count and column count.
   */
  rowIndexes: TreeSet<number> = null;
  /**
   * The size of the grid. Row count and column count.
   */
  colIndexes: TreeSet<number> = null;
  /**
   * The row and column specifications.
   */
  rowConstr: AC = null;
  /**
   * The row and column specifications.
   */
  colConstr: AC = null;
  /**
   * The in the constructor calculated min/pref/max sizes of the rows and columns.
   */
  colFlowSpecs: Grid$FlowSizeSpec = null;
  /**
   * The in the constructor calculated min/pref/max sizes of the rows and columns.
   */
  rowFlowSpecs: Grid$FlowSizeSpec = null;
  /**
   * Components that are connections in one dimension (such as baseline alignment for instance) are grouped together and stored here.
   * One for each row/column.
   */
  colGroupLists: ArrayList<Grid$LinkedDimGroup>[] = null;
  /**
   * Components that are connections in one dimension (such as baseline alignment for instance) are grouped together and stored here.
   * One for each row/column.
   */
  rowGroupLists: ArrayList<Grid$LinkedDimGroup>[] = null;
  /**
   * The in the constructor calculated min/pref/max size of the whole grid.
   */
  width_: number[] = null;
  /**
   * The in the constructor calculated min/pref/max size of the whole grid.
   */
  height_: number[] = null;
  /**
   * If debug is on contains the bounds for things to paint when calling {@link ContainerWrapper#paintDebugCell(int, int, int, int)}
   */
  debugRects: ArrayList<number[]> = null;
  /**
   * If any of the absolute coordinates for component bounds has links the name of the target is in this Set.
   * Since it requires some memory and computations this is checked at the creation so that
   * the link information is only created if needed later.
   * <p>
   * The boolean is true for groups id:s and null for normal id:s.
   */
  linkTargetIDs: HashMap<string, boolean> = null;
  dockOffY: number = 0;
  dockOffX: number = 0;
  pushXs: number[] = null;
  pushYs: number[] = null;
  callbackList: ArrayList<LayoutCallback> = null;
  lastRefWidth: number = 0;
  lastRefHeight: number = 0;
  static PARENT_ROWCOL_SIZES_MAP: WeakHashMap<any, number[][]>[] = null;
  static PARENT_GRIDPOS_MAP: WeakHashMap<any, ArrayList<Grid$WeakCell>> = null;
  /**
   * Constructor.
   * @param container The container that will be laid out.
   * @param lc The form flow constraints.
   * @param rowConstr The rows specifications. If more cell rows are required, the last element will be used for when there is no corresponding element in this array.
   * @param colConstr The columns specifications. If more cell rows are required, the last element will be used for when there is no corresponding element in this array.
   * @param ccMap The map containing the parsed constraints for each child component of <code>parent</code>. Will not be altered. Can have null CC which will use a common
   * cached one.
   * @param callbackList A list of callbacks or <code>null</code> if none. Will not be altered.
   */
  _Grid(container: ContainerWrapper, lc: LC, rowConstr: AC, colConstr: AC, ccMap: JMap<ComponentWrapper, CC>, callbackList: ArrayList<LayoutCallback>): this {
    this.grid = new LinkedHashMap();
    this.wrapGapMap = null;
    this.rowIndexes = new TreeSet();
    this.colIndexes = new TreeSet();
    this.colFlowSpecs = null;
    this.rowFlowSpecs = null;
    this.width_ = null;
    this.height_ = null;
    this.debugRects = null;
    this.linkTargetIDs = null;
    this.lastRefWidth = 0;
    this.lastRefHeight = 0;
    this.lc = lc;
    this.rowConstr = rowConstr;
    this.colConstr = colConstr;
    this.container = container;
    this.callbackList = callbackList;
    let wrap = lc.getWrapAfter() !== 0 ? lc.getWrapAfter() : (lc.isFlowX() ? colConstr : rowConstr).getConstaints().length;
    let useVisualPadding = lc.isVisualPadding();
    let comps = container.getComponents();
    let hasTagged = false;
    let hasPushX = false;
    let hasPushY = false;
    let hitEndOfRow = false;
    let cellXY = $J.newArray(2, 0);
    let spannedRects = new ArrayList(2);
    let specs = (lc.isFlowX() ? rowConstr : colConstr).getConstaints();
    let sizeGroupsX = 0;
    let sizeGroupsY = 0;
    let dockInsets = null;
    LinkHandler.clearTemporaryBounds(container.getLayout());
    for (let i = 0; i < comps.length; ) {
      let comp = comps[i];
      let rootCc = Grid.getCC(comp, ccMap);
      this.addLinkIDs(rootCc);
      let hideMode = comp.isVisible() ? -1 : rootCc.getHideMode() !== -1 ? rootCc.getHideMode() : lc.getHideMode();
      if (hideMode === 3) {
        this.setLinkedBounds(comp, rootCc, comp.getX(), comp.getY(), comp.getWidth(), comp.getHeight(), rootCc.isExternal());
        i++;
        continue;
      }
      if (rootCc.getHorizontal().getSizeGroup() != null) {
        sizeGroupsX++;
      }
      if (rootCc.getVertical().getSizeGroup() != null) {
        sizeGroupsY++;
      }
      if (this.getPos(comp, rootCc) != null || rootCc.isExternal()) {
        let cw = new Grid$CompWrap().$o(this)._Grid$CompWrap(comp, rootCc, hideMode, useVisualPadding);
        let cell = this.grid.get(null);
        if (cell == null) {
          this.grid.put(null, new Grid$Cell()._Grid$Cell$CompWrap(cw));
        } else {
          cell.compWraps.add(cw);
        }
        if (!rootCc.isBoundsInGrid() || rootCc.isExternal()) {
          this.setLinkedBounds(comp, rootCc, comp.getX(), comp.getY(), comp.getWidth(), comp.getHeight(), rootCc.isExternal());
          i++;
          continue;
        }
      }
      if (rootCc.getDockSide() !== -1) {
        if (dockInsets == null) {
          dockInsets = [-Grid.MAX_DOCK_GRID, -Grid.MAX_DOCK_GRID, Grid.MAX_DOCK_GRID, Grid.MAX_DOCK_GRID];
        }
        this.addDockingCell(dockInsets, rootCc.getDockSide(), new Grid$CompWrap().$o(this)._Grid$CompWrap(comp, rootCc, hideMode, useVisualPadding));
        i++;
        continue;
      }
      let cellFlowX = rootCc.getFlowX();
      let cell = null;
      if (rootCc.isNewline()) {
        this.wrap(cellXY, rootCc.getNewlineGapSize());
      } else if (hitEndOfRow) {
        this.wrap(cellXY, null);
      }
      hitEndOfRow = false;
      let isRowInGridMode = !lc.isNoGrid() && !(LayoutUtil.getIndexSafe(specs, lc.isFlowX() ? cellXY[1] : cellXY[0])).isNoGrid();
      let cx = rootCc.getCellX();
      let cy = rootCc.getCellY();
      if ((cx < 0 || cy < 0) && isRowInGridMode && rootCc.getSkip() === 0) {
        while (!this.isCellFree(cellXY[1], cellXY[0], spannedRects)) {
          if (Math.abs(this.increase(cellXY, 1)) >= wrap) {
            this.wrap(cellXY, null);
          }
        }
      } else {
        if (cx >= 0 && cy >= 0) {
          if (cy >= 0) {
            cellXY[0] = cx;
            cellXY[1] = cy;
          } else {
            if (lc.isFlowX()) {
              cellXY[0] = cx;
            } else {
              cellXY[1] = cx;
            }
          }
          this.ensureIndexSizes(cx, cy);
        }
        cell = this.getCell(cellXY[1], cellXY[0]);
      }
      for (let s = 0, skipCount = rootCc.getSkip(); s < skipCount; s++) {
        do {
          if (Math.abs(this.increase(cellXY, 1)) >= wrap) {
            this.wrap(cellXY, null);
          }
        } while (!this.isCellFree(cellXY[1], cellXY[0], spannedRects));
      }
      if (cell == null) {
        let spanx = Math.min(!isRowInGridMode && lc.isFlowX() ? LayoutUtil.INF : rootCc.getSpanX(), (Grid.MAX_GRID - cellXY[0]) | 0);
        let spany = Math.min(!isRowInGridMode && !lc.isFlowX() ? LayoutUtil.INF : rootCc.getSpanY(), (Grid.MAX_GRID - cellXY[1]) | 0);
        cell = new Grid$Cell()._Grid$Cell$int$int$boolean(spanx, spany, cellFlowX != null ? cellFlowX : lc.isFlowX());
        this.setCell(cellXY[1], cellXY[0], cell);
        if (spanx > 1 || spany > 1) {
          spannedRects.add([cellXY[0], cellXY[1], spanx, spany]);
        }
      }
      let wrapHandled = false;
      let splitLeft = isRowInGridMode ? (rootCc.getSplit() - 1) | 0 : LayoutUtil.INF;
      let splitExit = false;
      let spanRestOfRow = (lc.isFlowX() ? rootCc.getSpanX() : rootCc.getSpanY()) === LayoutUtil.INF;
      for (; splitLeft >= 0 && i < comps.length; splitLeft--) {
        let compAdd = comps[i];
        let cc = Grid.getCC(compAdd, ccMap);
        this.addLinkIDs(cc);
        let visible = compAdd.isVisible();
        hideMode = visible ? -1 : cc.getHideMode() !== -1 ? cc.getHideMode() : lc.getHideMode();
        if (cc.isExternal() || hideMode === 3) {
          i++;
          splitLeft++;
          continue;
        }
        hasPushX = !!(hasPushX | ((visible || hideMode > 1) && (cc.getPushX() != null)));
        hasPushY = !!(hasPushY | ((visible || hideMode > 1) && (cc.getPushY() != null)));
        if (cc !== rootCc) {
          if (cc.isNewline() || !cc.isBoundsInGrid() || cc.getDockSide() !== -1) {
            break;
          }
          if (splitLeft > 0 && cc.getSkip() > 0) {
            splitExit = true;
            break;
          }
        }
        let cw = new Grid$CompWrap().$o(this)._Grid$CompWrap(compAdd, cc, hideMode, useVisualPadding);
        cell.compWraps.add(cw);
        cell.hasTagged = !!(cell.hasTagged | cc.getTag() != null);
        hasTagged = !!(hasTagged | cell.hasTagged);
        if (cc !== rootCc) {
          if (cc.getHorizontal().getSizeGroup() != null) {
            sizeGroupsX++;
          }
          if (cc.getVertical().getSizeGroup() != null) {
            sizeGroupsY++;
          }
        }
        i++;
        if (cc.isWrap() || (spanRestOfRow && splitLeft === 0)) {
          if (cc.isWrap()) {
            this.wrap(cellXY, cc.getWrapGapSize());
          } else {
            hitEndOfRow = true;
          }
          wrapHandled = true;
          break;
        }
      }
      if (!wrapHandled && isRowInGridMode) {
        let span = lc.isFlowX() ? cell.spanx : cell.spany;
        if (((Math.abs((lc.isFlowX() ? cellXY[0] : cellXY[1])) + span) | 0) >= wrap) {
          hitEndOfRow = true;
        } else {
          this.increase(cellXY, splitExit ? (span - 1) | 0 : span);
        }
      }
    }
    if (sizeGroupsX > 0 || sizeGroupsY > 0) {
      let sizeGroupMapX = sizeGroupsX > 0 ? new HashMap(sizeGroupsX) : null;
      let sizeGroupMapY = sizeGroupsY > 0 ? new HashMap(sizeGroupsY) : null;
      let sizeGroupCWs = new ArrayList(Math.max(sizeGroupsX, sizeGroupsY));
      for (const $it0 = this.grid.values().iterator(); $it0.hasNext(); ) {
        let cell = $it0.next();
        for (let i = 0; i < cell.compWraps.size(); i++) {
          let cw = cell.compWraps.get(i);
          let sgx = cw.cc.getHorizontal().getSizeGroup();
          let sgy = cw.cc.getVertical().getSizeGroup();
          if (sgx != null || sgy != null) {
            if (sgx != null && sizeGroupMapX != null) {
              Grid.addToSizeGroup(sizeGroupMapX, sgx, cw.getSizes(true));
            }
            if (sgy != null && sizeGroupMapY != null) {
              Grid.addToSizeGroup(sizeGroupMapY, sgy, cw.getSizes(false));
            }
            sizeGroupCWs.add(cw);
          }
        }
      }
      for (const $it1 = sizeGroupCWs.iterator(); $it1.hasNext(); ) {
        let cw = $it1.next();
        if (sizeGroupMapX != null) {
          cw.setForcedSizes(sizeGroupMapX.get(cw.cc.getHorizontal().getSizeGroup()), true);
        }
        if (sizeGroupMapY != null) {
          cw.setForcedSizes(sizeGroupMapY.get(cw.cc.getVertical().getSizeGroup()), false);
        }
      }
    }
    if (hasTagged) {
      Grid.sortCellsByPlatform(this.grid.values(), container);
    }
    let ltr = LayoutUtil.isLeftToRight(lc, container);
    for (const $it2 = this.grid.values().iterator(); $it2.hasNext(); ) {
      let cell = $it2.next();
      let cws = cell.compWraps;
      for (let i = 0, lastI = (cws.size() - 1) | 0; i <= lastI; i++) {
        let cw = cws.get(i);
        let cwBef = i > 0 ? cws.get((i - 1) | 0).comp : null;
        let cwAft = i < lastI ? cws.get((i + 1) | 0).comp : null;
        let tag = Grid.getCC(cw.comp, ccMap).getTag();
        let ccBef = cwBef != null ? Grid.getCC(cwBef, ccMap) : null;
        let ccAft = cwAft != null ? Grid.getCC(cwAft, ccMap) : null;
        cw.calcGaps(cwBef, ccBef, cwAft, ccAft, tag, cell.flowx, ltr);
      }
    }
    this.dockOffX = Grid.getDockInsets(this.colIndexes);
    this.dockOffY = Grid.getDockInsets(this.rowIndexes);
    this.ensureIndexSizes(colConstr.getCount(), rowConstr.getCount());
    this.colGroupLists = this.divideIntoLinkedGroups(false);
    this.rowGroupLists = this.divideIntoLinkedGroups(true);
    this.pushXs = hasPushX || lc.isFillX() ? this.getDefaultPushWeights(false) : null;
    this.pushYs = hasPushY || lc.isFillY() ? this.getDefaultPushWeights(true) : null;
    if (LayoutUtil.isDesignTime(container)) {
      Grid.saveGrid(container, this.grid);
    }
    return this;
  }
  ensureIndexSizes(colCount: number, rowCount: number): void {
    for (let i = 0; i < colCount; i++) {
      this.colIndexes.add(i);
    }
    for (let i = 0; i < rowCount; i++) {
      this.rowIndexes.add(i);
    }
  }
  static getCC(comp: ComponentWrapper, ccMap: JMap<ComponentWrapper, CC>): CC {
    let cc = ccMap.get(comp);
    return cc != null ? cc : Grid.DEF_CC;
  }
  addLinkIDs(cc: CC): void {
    let linkIDs = cc.getLinkTargets();
    for (let linkID of linkIDs) {
      if (this.linkTargetIDs == null) {
        this.linkTargetIDs = new HashMap();
      }
      this.linkTargetIDs.put(linkID, null);
    }
  }
  /**
   * If the container (parent) that this grid is laying out has changed its bounds, call this method to
   * clear any cached values min/pref/max sizes of the components and rows/columns.
   * <p>
   * If any component can have changed cell the grid needs to be recreated.
   */
  invalidateContainerSize(): void {
    this.colFlowSpecs = null;
    this.invalidateComponentSizes();
  }
  invalidateComponentSizes(): void {
    for (const $it3 = this.grid.values().iterator(); $it3.hasNext(); ) {
      let cell = $it3.next();
      for (const $it4 = cell.compWraps.iterator(); $it4.hasNext(); ) {
        let compWrap = $it4.next();
        compWrap.invalidateSizes();
      }
    }
  }
  /**
   * @deprecated since 5.0 Last boolean is not needed and is gotten from the new {@link net.miginfocom.layout.ComponentWrapper#getContentBias()} instead;
   */
  layout$intArr$UnitValue$UnitValue$boolean$boolean(bounds: number[], alignX: UnitValue, alignY: UnitValue, debug: boolean, notUsed: boolean): boolean {
    return this.layoutImpl(bounds, alignX, alignY, debug, false);
  }
  /**
   * Does the actual layout. Uses many values calculated in the constructor.
   * @param bounds The bounds to layout against. Normally that of the parent. [x, y, width, height].
   * @param alignX The alignment for the x-axis. Can be null.
   * @param alignY The alignment for the y-axis. Can be null.
   * @param debug If debug information should be saved in {@link #debugRects}.
   * @return If the layout has changed the preferred size and there is need for a new layout. This can happen if one or more components
   * in the grid has a content bias according to {@link net.miginfocom.layout.ComponentWrapper#getContentBias()}.
   * @since 5.0
   */
  layout$intArr$UnitValue$UnitValue$boolean(bounds: number[], alignX: UnitValue, alignY: UnitValue, debug: boolean): boolean {
    return this.layoutImpl(bounds, alignX, alignY, debug, false);
  }
  /**
   * Does the actual layout. Uses many values calculated in the constructor.
   * @param bounds The bounds to layout against. Normally that of the parent. [x, y, width, height].
   * @param alignX The alignment for the x-axis. Can be null.
   * @param alignY The alignment for the y-axis. Can be null.
   * @param debug If debug information should be saved in {@link #debugRects}.
   * @param trialRun If true the bounds calculated will not be transferred to the components. Only the internal size
   * of the components will be calculated.
   * @return If the layout has changed the preferred size and there is need for a new layout. This can happen if one or more components
   * in the grid has a content bias according to {@link net.miginfocom.layout.ComponentWrapper#getContentBias()}.
   * @since 5.0
   */
  layoutImpl(bounds: number[], alignX: UnitValue, alignY: UnitValue, debug: boolean, trialRun: boolean): boolean {
    if (debug) {
      this.debugRects = new ArrayList();
    }
    if (this.colFlowSpecs == null) {
      this.checkSizeCalcs(bounds[2], bounds[3]);
    }
    this.resetLinkValues(true, true);
    this.layoutInOneDim(bounds[2], alignX, false, this.pushXs);
    this.layoutInOneDim(bounds[3], alignY, true, this.pushYs);
    let endGrpXMap = null;
    let endGrpYMap = null;
    let compCount = this.container.getComponentCount();
    let addVisualPadding = this.lc.isVisualPadding();
    let layoutAgain = false;
    if (compCount > 0) {
      for (let j = 0; j < (this.linkTargetIDs != null ? 2 : 1); j++) {
        let doAgain: boolean;
        let count = 0;
        do {
          doAgain = false;
          for (const $it5 = this.grid.values().iterator(); $it5.hasNext(); ) {
            let cell = $it5.next();
            for (const $it6 = cell.compWraps.iterator(); $it6.hasNext(); ) {
              let cw = $it6.next();
              if (j === 0) {
                doAgain = !!(doAgain | this.doAbsoluteCorrections(cw, bounds));
                if (!doAgain) {
                  if (cw.cc.getHorizontal().getEndGroup() != null) {
                    endGrpXMap = Grid.addToEndGroup(endGrpXMap, cw.cc.getHorizontal().getEndGroup(), (cw.x_ + cw.w) | 0);
                  }
                  if (cw.cc.getVertical().getEndGroup() != null) {
                    endGrpYMap = Grid.addToEndGroup(endGrpYMap, cw.cc.getVertical().getEndGroup(), (cw.y_ + cw.h) | 0);
                  }
                }
                if (this.linkTargetIDs != null && (this.linkTargetIDs.containsKey('visual') || this.linkTargetIDs.containsKey('container'))) {
                  layoutAgain = true;
                }
              }
              if (this.linkTargetIDs == null || j === 1) {
                if (cw.cc.getHorizontal().getEndGroup() != null) {
                  cw.w = (endGrpXMap.get(cw.cc.getHorizontal().getEndGroup()) - cw.x_) | 0;
                }
                if (cw.cc.getVertical().getEndGroup() != null) {
                  cw.h = (endGrpYMap.get(cw.cc.getVertical().getEndGroup()) - cw.y_) | 0;
                }
                cw.x_ = (cw.x_ + bounds[0]) | 0;
                cw.y_ = (cw.y_ + bounds[1]) | 0;
                if (!trialRun) {
                  cw.transferBounds(addVisualPadding);
                }
                if (this.callbackList != null) {
                  for (const $it7 = this.callbackList.iterator(); $it7.hasNext(); ) {
                    let callback = $it7.next();
                    callback.correctBounds(cw.comp);
                  }
                }
              }
            }
          }
          this.clearGroupLinkBounds();
          if (++count > (((compCount << 3) + 10) | 0)) {
            $J.err.println('Unstable cyclic dependency in absolute linked values.');
            break;
          }
        } while (doAgain);
      }
    }
    if (debug) {
      for (const $it8 = this.grid.values().iterator(); $it8.hasNext(); ) {
        let cell = $it8.next();
        let compWraps = cell.compWraps;
        for (const $it9 = compWraps.iterator(); $it9.hasNext(); ) {
          let cw = $it9.next();
          let hGrp = Grid.getGroupContaining(this.colGroupLists, cw);
          let vGrp = Grid.getGroupContaining(this.rowGroupLists, cw);
          if (hGrp != null && vGrp != null) {
            this.debugRects.add([(hGrp.lStart + bounds[0] - (hGrp.fromEnd ? hGrp.lSize : 0)) | 0, (vGrp.lStart + bounds[1] - (vGrp.fromEnd ? vGrp.lSize : 0)) | 0, hGrp.lSize, vGrp.lSize]);
          }
        }
      }
    }
    return layoutAgain;
  }
  paintDebug(): void {
    if (this.debugRects != null) {
      this.container.paintDebugOutline(this.lc.isVisualPadding());
      let painted = new ArrayList();
      for (const $it10 = this.debugRects.iterator(); $it10.hasNext(); ) {
        let r = $it10.next();
        if (!painted.contains(r)) {
          this.container.paintDebugCell(r[0], r[1], r[2], r[3]);
          painted.add(r);
        }
      }
      for (const $it11 = this.grid.values().iterator(); $it11.hasNext(); ) {
        let cell = $it11.next();
        let compWraps = cell.compWraps;
        for (const $it12 = compWraps.iterator(); $it12.hasNext(); ) {
          let compWrap = $it12.next();
          compWrap.comp.paintDebugOutline(this.lc.isVisualPadding());
        }
      }
    }
  }
  getContainer(): ContainerWrapper {
    return this.container;
  }
  getWidth$(): number[] {
    return this.getWidth$int(this.lastRefHeight);
  }
  getWidth$int(refHeight: number): number[] {
    this.checkSizeCalcs(this.lastRefWidth, refHeight);
    return this.width_.slice();
  }
  getHeight$(): number[] {
    return this.getHeight$int(this.lastRefWidth);
  }
  getHeight$int(refWidth: number): number[] {
    this.checkSizeCalcs(refWidth, this.lastRefHeight);
    return this.height_.slice();
  }
  checkSizeCalcs(refWidth: number, refHeight: number): void {
    if (this.colFlowSpecs == null) {
      this.calcGridSizes(refWidth, refHeight);
    }
    if ((refWidth > 0 && refWidth !== this.lastRefWidth) || (refHeight > 0 && refHeight !== this.lastRefHeight)) {
      let refBounds = [0, 0, (refWidth > 0 ? refWidth : this.width_[LayoutUtil.PREF]), (refHeight > 0 ? refHeight : this.height_[LayoutUtil.PREF])];
      this.layoutImpl(refBounds, null, null, false, true);
      this.calcGridSizes(refWidth, refHeight);
    }
    this.lastRefWidth = refWidth;
    this.lastRefHeight = refHeight;
  }
  calcGridSizes(refWidth: number, refHeight: number): void {
    let colSpecs = this.calcRowsOrColsSizes(true, refWidth);
    let rowSpecs = this.calcRowsOrColsSizes(false, refHeight);
    this.colFlowSpecs = colSpecs;
    this.rowFlowSpecs = rowSpecs;
    this.width_ = this.getMinPrefMaxSumSize(true, colSpecs.sizes);
    this.height_ = this.getMinPrefMaxSumSize(false, rowSpecs.sizes);
    if (this.linkTargetIDs == null) {
      this.resetLinkValues(false, true);
    } else {
      this.layout$intArr$UnitValue$UnitValue$boolean([0, 0, refWidth, refHeight], null, null, false);
      this.resetLinkValues(false, false);
    }
    this.adjustSizeForAbsolute(true);
    this.adjustSizeForAbsolute(false);
  }
  getPos(cw: ComponentWrapper, cc: CC): UnitValue[] {
    let callbackPos = null;
    if (this.callbackList != null) {
      for (let i = 0; i < this.callbackList.size() && callbackPos == null; i++) {
        callbackPos = this.callbackList.get(i).getPosition(cw);
      }
    }
    let ccPos = cc.getPos();
    if (callbackPos == null || ccPos == null) {
      return callbackPos != null ? callbackPos : ccPos;
    }
    for (let i = 0; i < 4; i++) {
      let cbUv = callbackPos[i];
      if (cbUv != null) {
        ccPos[i] = cbUv;
      }
    }
    return ccPos;
  }
  getCallbackSize(cw: ComponentWrapper): BoundSize[] {
    if (this.callbackList != null) {
      for (const $it13 = this.callbackList.iterator(); $it13.hasNext(); ) {
        let callback = $it13.next();
        let bs = callback.getSize(cw);
        if (bs != null) {
          return bs;
        }
      }
    }
    return null;
  }
  static getDockInsets(set$: TreeSet<number>): number {
    let c = 0;
    for (const $it14 = set$.iterator(); $it14.hasNext(); ) {
      let i = $it14.next();
      if (i < -Grid.MAX_GRID) {
        c++;
      } else {
        break;
      }
    }
    return c;
  }
  /**
   * @param cw Never <code>null</code>.
   * @param cc Never <code>null</code>.
   * @param external The bounds should be stored even if they are not in {@link #linkTargetIDs}.
   * @return If a change has been made.
   */
  setLinkedBounds(cw: ComponentWrapper, cc: CC, x: number, y: number, w: number, h: number, external: boolean): boolean {
    let id = cc.getId() != null ? cc.getId() : cw.getLinkId();
    if (id == null) {
      return false;
    }
    let gid = null;
    let grIx = id.indexOf(String.fromCharCode(46 /* '.' */));
    if (grIx !== -1) {
      gid = id.substring(0, grIx);
      id = id.substring((grIx + 1) | 0);
    }
    let lay = this.container.getLayout();
    let changed = false;
    if (external || (this.linkTargetIDs != null && this.linkTargetIDs.containsKey(id))) {
      changed = LinkHandler.setBounds$Object$String$int$int$int$int$boolean$boolean(lay, id, x, y, w, h, !external, false);
    }
    if (gid != null && (external || (this.linkTargetIDs != null && this.linkTargetIDs.containsKey(gid)))) {
      if (this.linkTargetIDs == null) {
        this.linkTargetIDs = new HashMap(4);
      }
      this.linkTargetIDs.put(gid, true);
      changed = !!(changed | LinkHandler.setBounds$Object$String$int$int$int$int$boolean$boolean(lay, gid, x, y, w, h, !external, true));
    }
    return changed;
  }
  /**
   * Go to next cell.
   * @param p The point to increase
   * @param cnt How many cells to advance.
   * @return The new value in the "increasing" dimension.
   */
  increase(p: number[], cnt: number): number {
    return this.lc.isFlowX() ? (p[0] = (p[0] + cnt) | 0) : (p[1] = (p[1] + cnt) | 0);
  }
  /**
   * Wraps to the next row or column depending on if horizontal flow or vertical flow is used.
   * @param cellXY The point to wrap and thus set either x or y to 0 and increase the other one.
   * @param gapSize The gaps size specified in a "wrap XXX" or "newline XXX" or <code>null</code> if none.
   */
  wrap(cellXY: number[], gapSize: BoundSize): void {
    let flowx = this.lc.isFlowX();
    cellXY[0] = flowx ? 0 : (cellXY[0] + 1) | 0;
    cellXY[1] = flowx ? (cellXY[1] + 1) | 0 : 0;
    if (gapSize != null) {
      if (this.wrapGapMap == null) {
        this.wrapGapMap = new HashMap(8);
      }
      this.wrapGapMap.put(cellXY[flowx ? 1 : 0], gapSize);
    }
    if (flowx) {
      this.rowIndexes.add(cellXY[1]);
    } else {
      this.colIndexes.add(cellXY[0]);
    }
  }
  /**
   * Sort components (normally buttons in a button bar) so they appear in the correct order.
   * @param cells The cells to sort.
   * @param parent The parent.
   */
  static sortCellsByPlatform(cells: Collection<Grid$Cell>, parent: ContainerWrapper): void {
    let order = PlatformDefaults.getButtonOrder();
    let orderLo = order.toLowerCase();
    let unrelSize = PlatformDefaults.convertToPixels(1, 'u', true, 0, parent, null);
    if (unrelSize === UnitConverter.UNABLE) {
      throw new IllegalArgumentException('\'unrelated\' not recognized by PlatformDefaults!');
    }
    let gapUnrel = [unrelSize, unrelSize, LayoutUtil.NOT_SET];
    let flGap = [0, 0, LayoutUtil.NOT_SET];
    for (const $it15 = cells.iterator(); $it15.hasNext(); ) {
      let cell = $it15.next();
      if (!cell.hasTagged) {
        continue;
      }
      let prevCW = null;
      let nextUnrel = false;
      let nextPush = false;
      let sortedList = new ArrayList(cell.compWraps.size());
      for (let i = 0, iSz = orderLo.length; i < iSz; i++) {
        let c = orderLo.charCodeAt(i);
        if (c === 43 /* '+' */ || c === 95 /* '_' */) {
          nextUnrel = true;
          if (c === 43 /* '+' */) {
            nextPush = true;
          }
        } else {
          let tag = PlatformDefaults.getTagForChar(c);
          if (tag != null) {
            for (let j = 0, jSz = cell.compWraps.size(); j < jSz; j++) {
              let cw = cell.compWraps.get(j);
              if ($J.equals(tag, cw.cc.getTag())) {
                if (Character.isUpperCase(order.charCodeAt(i))) {
                  cw.adjustMinHorSizeUp($J.d2i(PlatformDefaults.getMinimumButtonWidthIncludingPadding(0, parent, cw.comp)));
                }
                sortedList.add(cw);
                if (nextUnrel) {
                  (prevCW != null ? prevCW : cw).mergeGapSizes(gapUnrel, cell.flowx, prevCW == null);
                  if (nextPush) {
                    cw.forcedPushGaps = 1;
                    nextUnrel = false;
                    nextPush = false;
                  }
                }
                if (c === 117 /* 'u' */) {
                  nextUnrel = true;
                }
                prevCW = cw;
              }
            }
          }
        }
      }
      if (sortedList.size() > 0) {
        let cw = sortedList.get((sortedList.size() - 1) | 0);
        if (nextUnrel) {
          cw.mergeGapSizes(gapUnrel, cell.flowx, false);
          if (nextPush) {
            cw.forcedPushGaps |= 2;
          }
        }
        if (cw.cc.getHorizontal().getGapAfter() == null) {
          cw.setGaps(flGap, 3);
        }
        cw = sortedList.get(0);
        if (cw.cc.getHorizontal().getGapBefore() == null) {
          cw.setGaps(flGap, 1);
        }
      }
      if (cell.compWraps.size() === sortedList.size()) {
        cell.compWraps.clear();
      } else {
        cell.compWraps.removeAll(sortedList);
      }
      cell.compWraps.addAll(sortedList);
    }
  }
  getDefaultPushWeights(isRows: boolean): number[] {
    let groupLists = isRows ? this.rowGroupLists : this.colGroupLists;
    let pushWeightArr = Grid.GROW_100;
    for (let i = 0, ix = 1; i < groupLists.length; i++, ix = (ix + 2) | 0) {
      let grps = groupLists[i];
      let rowPushWeight = null;
      for (const $it16 = grps.iterator(); $it16.hasNext(); ) {
        let grp = $it16.next();
        for (let c = 0; c < grp._compWraps.size(); c++) {
          let cw = grp._compWraps.get(c);
          let hideMode = cw.comp.isVisible() ? -1 : cw.cc.getHideMode() !== -1 ? cw.cc.getHideMode() : this.lc.getHideMode();
          let pushWeight = hideMode < 2 ? (isRows ? cw.cc.getPushY() : cw.cc.getPushX()) : null;
          if (rowPushWeight == null || (pushWeight != null && +pushWeight > +rowPushWeight)) {
            rowPushWeight = pushWeight;
          }
        }
      }
      if (rowPushWeight != null) {
        if (pushWeightArr === Grid.GROW_100) {
          pushWeightArr = $J.newArray(((groupLists.length << 1) + 1) | 0, null);
        }
        pushWeightArr[ix] = rowPushWeight;
      }
    }
    return pushWeightArr;
  }
  clearGroupLinkBounds(): void {
    if (this.linkTargetIDs == null) {
      return;
    }
    for (const $it17 = this.linkTargetIDs.entrySet().iterator(); $it17.hasNext(); ) {
      let o = $it17.next();
      if (o.getValue() === true) {
        LinkHandler.clearBounds(this.container.getLayout(), o.getKey());
      }
    }
  }
  resetLinkValues(parentSize: boolean, compLinks: boolean): void {
    let lay = this.container.getLayout();
    if (compLinks) {
      LinkHandler.clearTemporaryBounds(lay);
    }
    let defIns = !this.hasDocks();
    let parW = parentSize ? this.lc.getWidth().constrain(this.container.getWidth(), Math.fround(Grid.getParentSize(this.container, true)), this.container) : 0;
    let parH = parentSize ? this.lc.getHeight().constrain(this.container.getHeight(), Math.fround(Grid.getParentSize(this.container, false)), this.container) : 0;
    let insX = LayoutUtil.getInsets(this.lc, 0, defIns).getPixels(0, this.container, null);
    let insY = LayoutUtil.getInsets(this.lc, 1, defIns).getPixels(0, this.container, null);
    let visW = (parW - insX - LayoutUtil.getInsets(this.lc, 2, defIns).getPixels(0, this.container, null)) | 0;
    let visH = (parH - insY - LayoutUtil.getInsets(this.lc, 3, defIns).getPixels(0, this.container, null)) | 0;
    LinkHandler.setBounds$Object$String$int$int$int$int$boolean$boolean(lay, 'visual', insX, insY, visW, visH, true, false);
    LinkHandler.setBounds$Object$String$int$int$int$int$boolean$boolean(lay, 'container', 0, 0, parW, parH, true, false);
  }
  /**
   * Returns the {@link net.miginfocom.layout.Grid.LinkedDimGroup} that has the {@link net.miginfocom.layout.Grid.CompWrap}
   * <code>cw</code>.
   * @param groupLists The lists to search in.
   * @param cw The component wrap to find.
   * @return The linked group or <code>null</code> if none had the component wrap.
   */
  static getGroupContaining(groupLists: ArrayList<Grid$LinkedDimGroup>[], cw: Grid$CompWrap): Grid$LinkedDimGroup {
    for (let groups of groupLists) {
      for (const $it18 = groups.iterator(); $it18.hasNext(); ) {
        let group = $it18.next();
        let cwList = group._compWraps;
        for (const $it19 = cwList.iterator(); $it19.hasNext(); ) {
          let aCwList = $it19.next();
          if (aCwList === cw) {
            return group;
          }
        }
      }
    }
    return null;
  }
  doAbsoluteCorrections(cw: Grid$CompWrap, bounds: number[]): boolean {
    let changed = false;
    let stSz = this.getAbsoluteDimBounds(cw, bounds[2], true);
    if (stSz != null) {
      cw.setDimBounds(stSz[0], stSz[1], true);
    }
    stSz = this.getAbsoluteDimBounds(cw, bounds[3], false);
    if (stSz != null) {
      cw.setDimBounds(stSz[0], stSz[1], false);
    }
    if (this.linkTargetIDs != null) {
      changed = this.setLinkedBounds(cw.comp, cw.cc, cw.x_, cw.y_, cw.w, cw.h, false);
    }
    return changed;
  }
  /**
   * Adjust grid's width or height for the absolute components' positions.
   */
  adjustSizeForAbsolute(isHor: boolean): void {
    let curSizes = isHor ? this.width_ : this.height_;
    let absCell = this.grid.get(null);
    if (absCell == null || absCell.compWraps.size() === 0) {
      return;
    }
    let cws = absCell.compWraps;
    let maxEnd = 0;
    for (let j = 0, cwSz = absCell.compWraps.size(); j < ((cwSz + 3) | 0); j++) {
      let doAgain = false;
      for (let i = 0; i < cwSz; i++) {
        let cw = cws.get(i);
        let stSz = this.getAbsoluteDimBounds(cw, 0, isHor);
        let end = (stSz[0] + stSz[1]) | 0;
        if (maxEnd < end) {
          maxEnd = end;
        }
        if (this.linkTargetIDs != null) {
          doAgain = !!(doAgain | this.setLinkedBounds(cw.comp, cw.cc, stSz[0], stSz[0], stSz[1], stSz[1], false));
        }
      }
      if (!doAgain) {
        break;
      }
      maxEnd = 0;
      this.clearGroupLinkBounds();
    }
    maxEnd = (maxEnd + (LayoutUtil.getInsets(this.lc, isHor ? 3 : 2, !this.hasDocks())).getPixels(0, this.container, null)) | 0;
    if (curSizes[LayoutUtil.MIN] < maxEnd) {
      curSizes[LayoutUtil.MIN] = maxEnd;
    }
    if (curSizes[LayoutUtil.PREF] < maxEnd) {
      curSizes[LayoutUtil.PREF] = maxEnd;
    }
  }
  getAbsoluteDimBounds(cw: Grid$CompWrap, refSize: number, isHor: boolean): number[] {
    if (cw.cc.isExternal()) {
      if (isHor) {
        return [cw.comp.getX(), cw.comp.getWidth()];
      } else {
        return [cw.comp.getY(), cw.comp.getHeight()];
      }
    }
    let pad = cw.cc.getPadding();
    let pos = this.getPos(cw.comp, cw.cc);
    if (pos == null && pad == null) {
      return null;
    }
    let st = isHor ? cw.x_ : cw.y_;
    let sz = isHor ? cw.w : cw.h;
    if (pos != null) {
      let stUV = pos[isHor ? 0 : 1];
      let endUV = pos[isHor ? 2 : 3];
      let minSz = cw.getSize$int$boolean$Grid_CompWrap(LayoutUtil.MIN, isHor);
      let maxSz = cw.getSize$int$boolean$Grid_CompWrap(LayoutUtil.MAX, isHor);
      sz = Math.min(Math.max(cw.getSize$int$boolean$Grid_CompWrap(LayoutUtil.PREF, isHor), minSz), maxSz);
      if (stUV != null) {
        st = stUV.getPixels(Math.fround(stUV.getUnit() === UnitValue.ALIGN ? sz : refSize), this.container, cw.comp);
        if (endUV != null) {
          sz = Math.min(Math.max(((isHor ? ((cw.x_ + cw.w) | 0) : ((cw.y_ + cw.h) | 0)) - st) | 0, minSz), maxSz);
        }
      }
      if (endUV != null) {
        if (stUV != null) {
          sz = Math.min(Math.max((endUV.getPixels(Math.fround(refSize), this.container, cw.comp) - st) | 0, minSz), maxSz);
        } else {
          st = (endUV.getPixels(Math.fround(refSize), this.container, cw.comp) - sz) | 0;
        }
      }
    }
    if (pad != null) {
      let uv = pad[isHor ? 1 : 0];
      let p = uv != null ? uv.getPixels(Math.fround(refSize), this.container, cw.comp) : 0;
      st = (st + p) | 0;
      uv = pad[isHor ? 3 : 2];
      sz = (sz + (-p + (uv != null ? uv.getPixels(Math.fround(refSize), this.container, cw.comp) : 0))) | 0;
    }
    return [st, sz];
  }
  layoutInOneDim(refSize: number, align: UnitValue, isRows: boolean, defaultPushWeights: number[]): void {
    let fromEnd = !(isRows ? this.lc.isTopToBottom() : LayoutUtil.isLeftToRight(this.lc, this.container));
    let primDCs = (isRows ? this.rowConstr : this.colConstr).getConstaints();
    let fss = isRows ? this.rowFlowSpecs : this.colFlowSpecs;
    let rowCols = isRows ? this.rowGroupLists : this.colGroupLists;
    let rowColSizes = LayoutUtil.calculateSerial(fss.sizes, fss.resConstsInclGaps, defaultPushWeights, LayoutUtil.PREF, refSize);
    if (LayoutUtil.isDesignTime(this.container)) {
      let indexes = isRows ? this.rowIndexes : this.colIndexes;
      let ixArr = $J.newArray(indexes.size(), 0);
      let ix = 0;
      for (const $it20 = indexes.iterator(); $it20.hasNext(); ) {
        let i = $it20.next();
        ixArr[ix++] = i;
      }
      Grid.putSizesAndIndexes(this.container.getComponent(), rowColSizes, ixArr, isRows);
    }
    let curPos = align != null ? align.getPixels(Math.fround((refSize - LayoutUtil.sum$intArr(rowColSizes)) | 0), this.container, null) : 0;
    if (fromEnd) {
      curPos = (refSize - curPos) | 0;
    }
    for (let i = 0; i < rowCols.length; i++) {
      let linkedGroups = rowCols[i];
      let scIx = (i - (isRows ? this.dockOffY : this.dockOffX)) | 0;
      let bIx = i << 1;
      let bIx2 = (bIx + 1) | 0;
      curPos = (curPos + (fromEnd ? -rowColSizes[bIx] : rowColSizes[bIx])) | 0;
      let primDC = scIx >= 0 ? primDCs[scIx >= primDCs.length ? (primDCs.length - 1) | 0 : scIx] : Grid.DOCK_DIM_CONSTRAINT;
      let rowSize = rowColSizes[bIx2];
      for (const $it21 = linkedGroups.iterator(); $it21.hasNext(); ) {
        let group = $it21.next();
        let groupSize = rowSize;
        if (group.span_ > 1) {
          groupSize = LayoutUtil.sum$intArr$int$int(rowColSizes, bIx2, Math.min(((group.span_ << 1) - 1) | 0, (rowColSizes.length - bIx2 - 1) | 0));
        }
        group.layout(primDC, curPos, groupSize, group.span_);
      }
      curPos = (curPos + (fromEnd ? -rowSize : rowSize)) | 0;
    }
  }
  static addToSizeGroup(sizeGroups: HashMap<string, number[]>, sizeGroup: string, size: number[]): void {
    let sgSize = sizeGroups.get(sizeGroup);
    if (sgSize == null) {
      sizeGroups.put(sizeGroup, [size[LayoutUtil.MIN], size[LayoutUtil.PREF], size[LayoutUtil.MAX]]);
    } else {
      sgSize[LayoutUtil.MIN] = Math.max(size[LayoutUtil.MIN], sgSize[LayoutUtil.MIN]);
      sgSize[LayoutUtil.PREF] = Math.max(size[LayoutUtil.PREF], sgSize[LayoutUtil.PREF]);
      sgSize[LayoutUtil.MAX] = Math.min(size[LayoutUtil.MAX], sgSize[LayoutUtil.MAX]);
    }
  }
  static addToEndGroup(endGroups: HashMap<string, number>, endGroup: string, end: number): HashMap<string, number> {
    if (endGroup != null) {
      if (endGroups == null) {
        endGroups = new HashMap(4);
      }
      let oldEnd = endGroups.get(endGroup);
      if (oldEnd == null || end > oldEnd) {
        endGroups.put(endGroup, end);
      }
    }
    return endGroups;
  }
  /**
   * Calculates Min, Preferred and Max size for the columns OR rows.
   * @param isHor If it is the horizontal dimension to calculate.
   * @param containerSize The reference container size in the dimension. If <= 0 it will be replaced by the actual container's size.
   * @return The sizes in a {@link net.miginfocom.layout.Grid.FlowSizeSpec}.
   */
  calcRowsOrColsSizes(isHor: boolean, containerSize: number): Grid$FlowSizeSpec {
    let groupsLists = isHor ? this.colGroupLists : this.rowGroupLists;
    let defPush = isHor ? this.pushXs : this.pushYs;
    if (containerSize <= 0) {
      containerSize = isHor ? this.container.getWidth() : this.container.getHeight();
    }
    let cSz = isHor ? this.lc.getWidth() : this.lc.getHeight();
    if (!cSz.isUnset()) {
      containerSize = cSz.constrain(containerSize, Math.fround(Grid.getParentSize(this.container, isHor)), this.container);
    }
    let primDCs = (isHor ? this.colConstr : this.rowConstr).getConstaints();
    let primIndexes = isHor ? this.colIndexes : this.rowIndexes;
    let rowColBoundSizes = $J.newArray(primIndexes.size(), null);
    let sizeGroupMap = new HashMap(4);
    let allDCs = $J.newArray(primIndexes.size(), null);
    let primIt = primIndexes.iterator();
    for (let r = 0; r < rowColBoundSizes.length; r++) {
      let cellIx = primIt.next();
      let rowColSizes = $J.newArray(3, 0);
      if (cellIx >= -Grid.MAX_GRID && cellIx <= Grid.MAX_GRID) {
        allDCs[r] = primDCs[cellIx >= primDCs.length ? (primDCs.length - 1) | 0 : cellIx];
      } else {
        allDCs[r] = Grid.DOCK_DIM_CONSTRAINT;
      }
      let groups = groupsLists[r];
      let groupSizes = [Grid.getTotalGroupsSizeParallel(groups, LayoutUtil.MIN, false), Grid.getTotalGroupsSizeParallel(groups, LayoutUtil.PREF, false), LayoutUtil.INF];
      Grid.correctMinMax(groupSizes);
      let dimSize = allDCs[r].getSize();
      for (let sType = LayoutUtil.MIN; sType <= LayoutUtil.MAX; sType++) {
        let rowColSize = groupSizes[sType];
        let uv = dimSize.getSize(sType);
        if (uv != null) {
          let unit = uv.getUnit();
          if (unit === UnitValue.PREF_SIZE) {
            rowColSize = groupSizes[LayoutUtil.PREF];
          } else if (unit === UnitValue.MIN_SIZE) {
            rowColSize = groupSizes[LayoutUtil.MIN];
          } else if (unit === UnitValue.MAX_SIZE) {
            rowColSize = groupSizes[LayoutUtil.MAX];
          } else {
            rowColSize = uv.getPixels(Math.fround(containerSize), this.container, null);
          }
        } else if (cellIx >= -Grid.MAX_GRID && cellIx <= Grid.MAX_GRID && rowColSize === 0) {
          rowColSize = LayoutUtil.isDesignTime(this.container) ? LayoutUtil.getDesignTimeEmptySize() : 0;
        }
        rowColSizes[sType] = rowColSize;
      }
      Grid.correctMinMax(rowColSizes);
      Grid.addToSizeGroup(sizeGroupMap, allDCs[r].getSizeGroup(), rowColSizes);
      rowColBoundSizes[r] = rowColSizes;
    }
    if (sizeGroupMap.size() > 0) {
      for (let r = 0; r < rowColBoundSizes.length; r++) {
        if (allDCs[r].getSizeGroup() != null) {
          rowColBoundSizes[r] = sizeGroupMap.get(allDCs[r].getSizeGroup());
        }
      }
    }
    let resConstrs = Grid.getRowResizeConstraints(allDCs);
    let fillInPushGaps = $J.newArray((allDCs.length + 1) | 0, false);
    let gapSizes = this.getRowGaps(allDCs, containerSize, isHor, fillInPushGaps);
    let fss = Grid.mergeSizesGapsAndResConstrs(resConstrs, fillInPushGaps, rowColBoundSizes, gapSizes);
    this.adjustMinPrefForSpanningComps(allDCs, defPush, fss, groupsLists);
    return fss;
  }
  static getParentSize(cw: ComponentWrapper, isHor: boolean): number {
    let p = cw.getParent();
    return p != null ? (isHor ? cw.getWidth() : cw.getHeight()) : 0;
  }
  getMinPrefMaxSumSize(isHor: boolean, sizes: number[][]): number[] {
    let retSizes = $J.newArray(3, 0);
    let sz = isHor ? this.lc.getWidth() : this.lc.getHeight();
    for (let i = 0; i < sizes.length; i++) {
      if (sizes[i] != null) {
        let size = sizes[i];
        for (let sType = LayoutUtil.MIN; sType <= LayoutUtil.MAX; sType++) {
          if (sz.getSize(sType) != null) {
            if (i === 0) {
              retSizes[sType] = sz.getSize(sType).getPixels(Math.fround(Grid.getParentSize(this.container, isHor)), this.container, null);
            }
          } else {
            let s = size[sType];
            if (s !== LayoutUtil.NOT_SET) {
              if (sType === LayoutUtil.PREF) {
                let bnd = size[LayoutUtil.MAX];
                if (bnd !== LayoutUtil.NOT_SET && bnd < s) {
                  s = bnd;
                }
                bnd = size[LayoutUtil.MIN];
                if (bnd > s) {
                  s = bnd;
                }
              }
              retSizes[sType] = (retSizes[sType] + s) | 0;
            }
            if (size[LayoutUtil.MAX] === LayoutUtil.NOT_SET || retSizes[LayoutUtil.MAX] > LayoutUtil.INF) {
              retSizes[LayoutUtil.MAX] = LayoutUtil.INF;
            }
          }
        }
      }
    }
    Grid.correctMinMax(retSizes);
    return retSizes;
  }
  static getRowResizeConstraints(specs: DimConstraint[]): ResizeConstraint[] {
    let resConsts = $J.newArray(specs.length, null);
    for (let i = 0; i < resConsts.length; i++) {
      resConsts[i] = specs[i].resize_;
    }
    return resConsts;
  }
  static getComponentResizeConstraints(compWraps: ArrayList<Grid$CompWrap>, isHor: boolean): ResizeConstraint[] {
    let resConsts = $J.newArray(compWraps.size(), null);
    for (let i = 0; i < resConsts.length; i++) {
      let fc = compWraps.get(i).cc;
      resConsts[i] = fc.getDimConstraint(isHor).resize_;
      let dock = fc.getDockSide();
      if (isHor ? (dock === 0 || dock === 2) : (dock === 1 || dock === 3)) {
        let dc = resConsts[i];
        resConsts[i] = new ResizeConstraint()._ResizeConstraint$int$Float$int$Float(dc.shrinkPrio_, dc.shrink_, dc.growPrio_, ResizeConstraint.WEIGHT_100);
      }
    }
    return resConsts;
  }
  static getComponentGapPush(compWraps: ArrayList<Grid$CompWrap>, isHor: boolean): boolean[] {
    let barr = $J.newArray((compWraps.size() + 1) | 0, false);
    for (let i = 0; i < barr.length; i++) {
      let push = i > 0 && compWraps.get((i - 1) | 0).isPushGap(isHor, false);
      if (!push && i < ((barr.length - 1) | 0)) {
        push = compWraps.get(i).isPushGap(isHor, true);
      }
      barr[i] = push;
    }
    return barr;
  }
  /**
   * Returns the row gaps in pixel sizes. One more than there are <code>specs</code> sent in.
   * @param specs
   * @param refSize
   * @param isHor
   * @param fillInPushGaps If the gaps are pushing. <b>NOTE!</b> this argument will be filled in and thus changed!
   * @return The row gaps in pixel sizes. One more than there are <code>specs</code> sent in.
   */
  getRowGaps(specs: DimConstraint[], refSize: number, isHor: boolean, fillInPushGaps: boolean[]): number[][] {
    let defGap = isHor ? this.lc.getGridGapX() : this.lc.getGridGapY();
    if (defGap == null) {
      defGap = isHor ? PlatformDefaults.getGridGapX() : PlatformDefaults.getGridGapY();
    }
    let defGapArr = defGap.getPixelSizes(Math.fround(refSize), this.container, null);
    let defIns = !this.hasDocks();
    let firstGap = LayoutUtil.getInsets(this.lc, isHor ? 1 : 0, defIns);
    let lastGap = LayoutUtil.getInsets(this.lc, isHor ? 3 : 2, defIns);
    let retValues = $J.newArray((specs.length + 1) | 0, null);
    for (let i = 0, wgIx = 0; i < retValues.length; i++) {
      let specBefore = i > 0 ? specs[(i - 1) | 0] : null;
      let specAfter = i < specs.length ? specs[i] : null;
      let edgeBefore = (specBefore === Grid.DOCK_DIM_CONSTRAINT || specBefore == null);
      let edgeAfter = (specAfter === Grid.DOCK_DIM_CONSTRAINT || specAfter == null);
      if (edgeBefore && edgeAfter) {
        continue;
      }
      let wrapGapSize = (this.wrapGapMap == null || isHor === this.lc.isFlowX() ? null : this.wrapGapMap.get(wgIx++));
      if (wrapGapSize == null) {
        let gapBefore = specBefore != null ? specBefore.getRowGaps(this.container, null, refSize, false) : null;
        let gapAfter = specAfter != null ? specAfter.getRowGaps(this.container, null, refSize, true) : null;
        if (edgeBefore && gapAfter == null && firstGap != null) {
          let bef = firstGap.getPixels(Math.fround(refSize), this.container, null);
          retValues[i] = [bef, bef, bef];
        } else if (edgeAfter && gapBefore == null && firstGap != null) {
          let aft = lastGap.getPixels(Math.fround(refSize), this.container, null);
          retValues[i] = [aft, aft, aft];
        } else {
          retValues[i] = gapAfter !== gapBefore ? Grid.mergeSizes$intArr$intArr(gapAfter, gapBefore) : [defGapArr[0], defGapArr[1], defGapArr[2]];
        }
        if (specBefore != null && specBefore.isGapAfterPush() || specAfter != null && specAfter.isGapBeforePush()) {
          fillInPushGaps[i] = true;
        }
      } else {
        if (wrapGapSize.isUnset()) {
          retValues[i] = [defGapArr[0], defGapArr[1], defGapArr[2]];
        } else {
          retValues[i] = wrapGapSize.getPixelSizes(Math.fround(refSize), this.container, null);
        }
        fillInPushGaps[i] = wrapGapSize.getGapPush();
      }
    }
    return retValues;
  }
  static getGaps(compWraps: ArrayList<Grid$CompWrap>, isHor: boolean): number[][] {
    let compCount = compWraps.size();
    let retValues = $J.newArray((compCount + 1) | 0, null);
    retValues[0] = compWraps.get(0).getGaps(isHor, true);
    for (let i = 0; i < compCount; i++) {
      let gap1 = compWraps.get(i).getGaps(isHor, false);
      let gap2 = i < ((compCount - 1) | 0) ? compWraps.get((i + 1) | 0).getGaps(isHor, true) : null;
      (retValues[(i + 1) | 0]) = Grid.mergeSizes$intArr$intArr(gap1, gap2);
    }
    return retValues;
  }
  hasDocks(): boolean {
    return (this.dockOffX > 0 || this.dockOffY > 0 || this.rowIndexes.last() > Grid.MAX_GRID || this.colIndexes.last() > Grid.MAX_GRID);
  }
  /**
   * Adjust min/pref size for columns(or rows) that has components that spans multiple columns (or rows).
   * @param specs The specs for the columns or rows. Last index will be used if <code>count</code> is greater than this array's length.
   * @param defPush The default grow weight if the specs does not have anyone that will grow. Comes from "push" in the CC.
   * @param fss
   * @param groupsLists
   */
  adjustMinPrefForSpanningComps(specs: DimConstraint[], defPush: number[], fss: Grid$FlowSizeSpec, groupsLists: ArrayList<Grid$LinkedDimGroup>[]): void {
    for (let r = (groupsLists.length - 1) | 0; r >= 0; r--) {
      let groups = groupsLists[r];
      for (const $it22 = groups.iterator(); $it22.hasNext(); ) {
        let group = $it22.next();
        if (group.span_ === 1) {
          continue;
        }
        let sizes = group.getMinPrefMax();
        for (let s = LayoutUtil.MIN; s <= LayoutUtil.PREF; s++) {
          let cSize = sizes[s];
          if (cSize === LayoutUtil.NOT_SET) {
            continue;
          }
          let rowSize = 0;
          let sIx = ((r << 1) + 1) | 0;
          let len = ((Math.min((group.span_ << 1), (fss.sizes.length - sIx) | 0)) - 1) | 0;
          for (let j = sIx; j < ((sIx + len) | 0); j++) {
            let sz = fss.sizes[j][s];
            if (sz !== LayoutUtil.NOT_SET) {
              rowSize = (rowSize + sz) | 0;
            }
          }
          if (rowSize < cSize && len > 0) {
            for (let eagerness = 0, newRowSize = 0; eagerness < 4 && newRowSize < cSize; eagerness++) {
              newRowSize = fss.expandSizes(specs, defPush, cSize, sIx, len, s, eagerness);
            }
          }
        }
      }
    }
  }
  /**
   * For one dimension divide the component wraps into logical groups. One group for component wraps that share a common something,
   * line the property to layout by base line.
   * @param isRows If rows, and not columns, are to be divided.
   * @return One <code>ArrayList<LinkedDimGroup></code> for every row/column.
   */
  divideIntoLinkedGroups(isRows: boolean): ArrayList<Grid$LinkedDimGroup>[] {
    let fromEnd = !(isRows ? this.lc.isTopToBottom() : LayoutUtil.isLeftToRight(this.lc, this.container));
    let primIndexes = isRows ? this.rowIndexes : this.colIndexes;
    let secIndexes = isRows ? this.colIndexes : this.rowIndexes;
    let primDCs = (isRows ? this.rowConstr : this.colConstr).getConstaints();
    let groupLists = $J.newArray(primIndexes.size(), null);
    let gIx = 0;
    for (const $it23 = primIndexes.iterator(); $it23.hasNext(); ) {
      let i = $it23.next();
      let dc: DimConstraint;
      if (i >= -Grid.MAX_GRID && i <= Grid.MAX_GRID) {
        dc = primDCs[i >= primDCs.length ? (primDCs.length - 1) | 0 : i];
      } else {
        dc = Grid.DOCK_DIM_CONSTRAINT;
      }
      let groupList = new ArrayList(4);
      groupLists[gIx++] = groupList;
      for (const $it24 = secIndexes.iterator(); $it24.hasNext(); ) {
        let ix = $it24.next();
        let cell = isRows ? this.getCell(i, ix) : this.getCell(ix, i);
        if (cell == null || cell.compWraps.size() === 0) {
          continue;
        }
        let span = (isRows ? cell.spany : cell.spanx);
        if (span > 1) {
          span = Grid.convertSpanToSparseGrid(i, span, primIndexes);
        }
        let isPar = (cell.flowx === isRows);
        if ((!isPar && cell.compWraps.size() > 1) || span > 1) {
          let linkType = isPar ? Grid$LinkedDimGroup.TYPE_PARALLEL : Grid$LinkedDimGroup.TYPE_SERIAL;
          let lg = new Grid$LinkedDimGroup()._Grid$LinkedDimGroup('p,' + ix, span, linkType, !isRows, fromEnd);
          lg.setCompWraps(cell.compWraps);
          groupList.add(lg);
        } else {
          for (let cwIx = 0; cwIx < cell.compWraps.size(); cwIx++) {
            let cw = cell.compWraps.get(cwIx);
            let rowBaselineAlign = (isRows && this.lc.isTopToBottom() && dc.getAlignOrDefault(!isRows) === UnitValue.BASELINE_IDENTITY);
            let isBaseline = isRows && cw.isBaselineAlign(rowBaselineAlign);
            let linkCtx = isBaseline ? 'baseline' : null;
            let foundList = false;
            for (let glIx = 0, lastGl = (groupList.size() - 1) | 0; glIx <= lastGl; glIx++) {
              let group = groupList.get(glIx);
              if (group.linkCtx === linkCtx || linkCtx != null && $J.equals(linkCtx, group.linkCtx)) {
                group.addCompWrap(cw);
                foundList = true;
                break;
              }
            }
            if (!foundList) {
              let linkType = isBaseline ? Grid$LinkedDimGroup.TYPE_BASELINE : Grid$LinkedDimGroup.TYPE_PARALLEL;
              let lg = new Grid$LinkedDimGroup()._Grid$LinkedDimGroup(linkCtx, 1, linkType, !isRows, fromEnd);
              lg.addCompWrap(cw);
              groupList.add(lg);
            }
          }
        }
      }
    }
    return groupLists;
  }
  /**
   * Spanning is specified in the uncompressed grid number. They can for instance be more than 60000 for the outer
   * edge dock grid cells. When the grid is compressed and indexed after only the cells that area occupied the span
   * is erratic. This method use the row/col indexes and corrects the span to be correct for the compressed grid.
   * @param span The span in the uncompressed grid. <code>LayoutUtil.INF</code> will be interpreted to span the rest
   * of the column/row excluding the surrounding docking components.
   * @param indexes The indexes in the correct dimension.
   * @return The converted span.
   */
  static convertSpanToSparseGrid(curIx: number, span: number, indexes: TreeSet<number>): number {
    let lastIx = (curIx + span) | 0;
    let retSpan = 1;
    for (const $it25 = indexes.iterator(); $it25.hasNext(); ) {
      let ix = $it25.next();
      if (ix <= curIx) {
        continue;
      }
      if (ix >= lastIx) {
        break;
      }
      retSpan++;
    }
    return retSpan;
  }
  isCellFree(r: number, c: number, occupiedRects: ArrayList<number[]>): boolean {
    if (this.getCell(r, c) != null) {
      return false;
    }
    for (const $it26 = occupiedRects.iterator(); $it26.hasNext(); ) {
      let rect = $it26.next();
      if (rect[0] <= c && rect[1] <= r && ((rect[0] + rect[2]) | 0) > c && ((rect[1] + rect[3]) | 0) > r) {
        return false;
      }
    }
    return true;
  }
  getCell(r: number, c: number): Grid$Cell {
    return this.grid.get(((r << 16) + (c & 65535)) | 0);
  }
  setCell(r: number, c: number, cell: Grid$Cell): void {
    if (c < 0 || r < 0) {
      throw new IllegalArgumentException('Cell position cannot be negative. row: ' + r + ', col: ' + c);
    }
    if (c > Grid.MAX_GRID || r > Grid.MAX_GRID) {
      throw new IllegalArgumentException('Cell position out of bounds. Out of cells. row: ' + r + ', col: ' + c);
    }
    this.rowIndexes.add(r);
    this.colIndexes.add(c);
    this.grid.put(((r << 16) + (c & 65535)) | 0, cell);
  }
  /**
   * Adds a docking cell. That cell is outside the normal cell indexes.
   * @param dockInsets The current dock insets. Will be updated!
   * @param side top == 0, left == 1, bottom = 2, right = 3.
   * @param cw The compwrap to put in a cell and add.
   */
  addDockingCell(dockInsets: number[], side: number, cw: Grid$CompWrap): void {
    let r: number;
    let c: number;
    let spanx = 1;
    let spany = 1;
    switch (side) {
      case 0:
      case 2:
        r = side === 0 ? dockInsets[0]++ : dockInsets[2]--;
        c = dockInsets[1];
        spanx = (dockInsets[3] - dockInsets[1] + 1) | 0;
        this.colIndexes.add(dockInsets[3]);
        break;
      case 1:
      case 3:
        c = side === 1 ? dockInsets[1]++ : dockInsets[3]--;
        r = dockInsets[0];
        spany = (dockInsets[2] - dockInsets[0] + 1) | 0;
        this.rowIndexes.add(dockInsets[2]);
        break;
      default:
        throw new IllegalArgumentException('Internal error 123.');
    }
    this.rowIndexes.add(r);
    this.colIndexes.add(c);
    this.grid.put(((r << 16) + (c & 65535)) | 0, new Grid$Cell()._Grid$Cell$CompWrap$int$int$boolean(cw, spanx, spany, spanx > 1));
  }
  static layoutBaseline(parent: ContainerWrapper, compWraps: ArrayList<Grid$CompWrap>, dc: DimConstraint, start: number, size: number, sizeType: number, spanCount: number): void {
    let aboveBelow = Grid.getBaselineAboveBelow(compWraps, sizeType, true);
    let blRowSize = aboveBelow.sum();
    let cc = compWraps.get(0).cc;
    let align = cc.getVertical().getAlign();
    if (spanCount === 1 && align == null) {
      align = dc.getAlignOrDefault(false);
    }
    if (align === UnitValue.BASELINE_IDENTITY) {
      align = UnitValue.CENTER;
    }
    let offset = (start + aboveBelow.maxAbove + (align != null ? Math.max(0, align.getPixels(Math.fround((size - blRowSize) | 0), parent, null)) : 0)) | 0;
    for (const $it27 = compWraps.iterator(); $it27.hasNext(); ) {
      let cw = $it27.next();
      cw.y_ = (cw.y_ + offset) | 0;
      if (((cw.y_ + cw.h) | 0) > ((start + size) | 0)) {
        cw.h = (start + size - cw.y_) | 0;
      }
    }
  }
  static layoutSerial(parent: ContainerWrapper, compWraps: ArrayList<Grid$CompWrap>, dc: DimConstraint, start: number, size: number, isHor: boolean, spanCount: number, fromEnd: boolean): void {
    let fss = Grid.mergeSizesGapsAndResConstrs(Grid.getComponentResizeConstraints(compWraps, isHor), Grid.getComponentGapPush(compWraps, isHor), Grid.getComponentSizes(compWraps, isHor), Grid.getGaps(compWraps, isHor));
    let pushW = dc.isFill() ? Grid.GROW_100 : null;
    let sizes = LayoutUtil.calculateSerial(fss.sizes, fss.resConstsInclGaps, pushW, LayoutUtil.PREF, size);
    Grid.setCompWrapBounds$ContainerWrapper$intArr$ArrayList$UnitValue$int$int$boolean$boolean(parent, sizes, compWraps, dc.getAlignOrDefault(isHor), start, size, isHor, fromEnd);
  }
  static setCompWrapBounds$ContainerWrapper$intArr$ArrayList$UnitValue$int$int$boolean$boolean(parent: ContainerWrapper, allSizes: number[], compWraps: ArrayList<Grid$CompWrap>, rowAlign: UnitValue, start: number, size: number, isHor: boolean, fromEnd: boolean): void {
    let totSize = LayoutUtil.sum$intArr(allSizes);
    let cc = compWraps.get(0).cc;
    let align = Grid.correctAlign(cc, rowAlign, isHor, fromEnd);
    let cSt = start;
    let slack = (size - totSize) | 0;
    if (slack > 0 && align != null) {
      let al = Math.min(slack, Math.max(0, align.getPixels(Math.fround(slack), parent, null)));
      cSt = (cSt + (fromEnd ? -al : al)) | 0;
    }
    for (let i = 0, bIx = 0, iSz = compWraps.size(); i < iSz; i++) {
      let cw = compWraps.get(i);
      if (fromEnd) {
        cSt = (cSt - allSizes[bIx++]) | 0;
        cw.setDimBounds((cSt - allSizes[bIx]) | 0, allSizes[bIx], isHor);
        cSt = (cSt - allSizes[bIx++]) | 0;
      } else {
        cSt = (cSt + allSizes[bIx++]) | 0;
        cw.setDimBounds(cSt, allSizes[bIx], isHor);
        cSt = (cSt + allSizes[bIx++]) | 0;
      }
    }
  }
  static layoutParallel(parent: ContainerWrapper, compWraps: ArrayList<Grid$CompWrap>, dc: DimConstraint, start: number, size: number, isHor: boolean, fromEnd: boolean): void {
    let sizes = $J.newArray(compWraps.size(), null);
    for (let i = 0; i < sizes.length; i++) {
      let cw = compWraps.get(i);
      let cDc = cw.cc.getDimConstraint(isHor);
      let resConstr = [cw.isPushGap(isHor, true) ? Grid.GAP_RC_CONST_PUSH : Grid.GAP_RC_CONST, cDc.resize_, cw.isPushGap(isHor, false) ? Grid.GAP_RC_CONST_PUSH : Grid.GAP_RC_CONST];
      let sz = [cw.getGaps(isHor, true), cw.getSizes(isHor), cw.getGaps(isHor, false)];
      let pushW = dc.isFill() ? Grid.GROW_100 : null;
      sizes[i] = LayoutUtil.calculateSerial(sz, resConstr, pushW, LayoutUtil.PREF, size);
    }
    let rowAlign = dc.getAlignOrDefault(isHor);
    Grid.setCompWrapBounds$ContainerWrapper$intArrArr$ArrayList$UnitValue$int$int$boolean$boolean(parent, sizes, compWraps, rowAlign, start, size, isHor, fromEnd);
  }
  static setCompWrapBounds$ContainerWrapper$intArrArr$ArrayList$UnitValue$int$int$boolean$boolean(parent: ContainerWrapper, sizes: number[][], compWraps: ArrayList<Grid$CompWrap>, rowAlign: UnitValue, start: number, size: number, isHor: boolean, fromEnd: boolean): void {
    for (let i = 0; i < sizes.length; i++) {
      let cw = compWraps.get(i);
      let align = Grid.correctAlign(cw.cc, rowAlign, isHor, fromEnd);
      let cSizes = sizes[i];
      let gapBef = cSizes[0];
      let cSize = cSizes[1];
      let gapAft = cSizes[2];
      let cSt = fromEnd ? (start - gapBef) | 0 : (start + gapBef) | 0;
      let slack = (size - cSize - gapBef - gapAft) | 0;
      if (slack > 0 && align != null) {
        let al = Math.min(slack, Math.max(0, align.getPixels(Math.fround(slack), parent, null)));
        cSt = (cSt + (fromEnd ? -al : al)) | 0;
      }
      cw.setDimBounds(fromEnd ? (cSt - cSize) | 0 : cSt, cSize, isHor);
    }
  }
  static correctAlign(cc: CC, rowAlign: UnitValue, isHor: boolean, fromEnd: boolean): UnitValue {
    let align = (isHor ? cc.getHorizontal() : cc.getVertical()).getAlign();
    if (align == null) {
      align = rowAlign;
    }
    if (align === UnitValue.BASELINE_IDENTITY) {
      align = UnitValue.CENTER;
    }
    if (fromEnd) {
      if (align === UnitValue.LEFT) {
        align = UnitValue.RIGHT;
      } else if (align === UnitValue.RIGHT) {
        align = UnitValue.LEFT;
      }
    }
    return align;
  }
  static getBaselineAboveBelow(compWraps: ArrayList<Grid$CompWrap>, sType: number, centerBaseline: boolean): Grid$AboveBelow {
    let maxAbove = -2147483648;
    let maxBelow = -2147483648;
    for (const $it28 = compWraps.iterator(); $it28.hasNext(); ) {
      let cw = $it28.next();
      let height = cw.getSize$int$boolean$Grid_CompWrap(sType, false);
      if (height >= LayoutUtil.INF) {
        return new Grid$AboveBelow()._Grid$AboveBelow($J.idiv(LayoutUtil.INF, 2), $J.idiv(LayoutUtil.INF, 2));
      }
      let baseline = cw.getBaseline(sType);
      let above = (baseline + cw.getGapBefore(sType, false)) | 0;
      maxAbove = Math.max(above, maxAbove);
      maxBelow = Math.max((height - baseline + cw.getGapAfter(sType, false)) | 0, maxBelow);
      if (centerBaseline) {
        cw.setDimBounds(-baseline, height, false);
      }
    }
    return new Grid$AboveBelow()._Grid$AboveBelow(maxAbove, maxBelow);
  }
  static getTotalSizeParallel(compWraps: ArrayList<Grid$CompWrap>, sType: number, isHor: boolean): number {
    let size = sType === LayoutUtil.MAX ? LayoutUtil.INF : 0;
    for (const $it29 = compWraps.iterator(); $it29.hasNext(); ) {
      let cw = $it29.next();
      let cwSize = cw.getSizeInclGaps(sType, isHor);
      if (cwSize >= LayoutUtil.INF) {
        return LayoutUtil.INF;
      }
      if (sType === LayoutUtil.MAX ? cwSize < size : cwSize > size) {
        size = cwSize;
      }
    }
    return Grid.constrainSize(size);
  }
  static getTotalSizeSerial(compWraps: ArrayList<Grid$CompWrap>, sType: number, isHor: boolean): number {
    let totSize = 0;
    for (let i = 0, iSz = compWraps.size(), lastGapAfter = 0; i < iSz; i++) {
      let wrap = compWraps.get(i);
      let gapBef = wrap.getGapBefore(sType, isHor);
      if (gapBef > lastGapAfter) {
        totSize = (totSize + (gapBef - lastGapAfter)) | 0;
      }
      totSize = (totSize + wrap.getSize$int$boolean$Grid_CompWrap(sType, isHor)) | 0;
      totSize = (totSize + (lastGapAfter = wrap.getGapAfter(sType, isHor))) | 0;
      if (totSize >= LayoutUtil.INF) {
        return LayoutUtil.INF;
      }
    }
    return Grid.constrainSize(totSize);
  }
  static getTotalGroupsSizeParallel(groups: ArrayList<Grid$LinkedDimGroup>, sType: number, countSpanning: boolean): number {
    let size = sType === LayoutUtil.MAX ? LayoutUtil.INF : 0;
    for (const $it30 = groups.iterator(); $it30.hasNext(); ) {
      let group = $it30.next();
      if (countSpanning || group.span_ === 1) {
        let grpSize = group.getMinPrefMax()[sType];
        if (grpSize >= LayoutUtil.INF) {
          return LayoutUtil.INF;
        }
        if (sType === LayoutUtil.MAX ? grpSize < size : grpSize > size) {
          size = grpSize;
        }
      }
    }
    return Grid.constrainSize(size);
  }
  /**
   * @param compWraps
   * @param isHor
   * @return Might contain LayoutUtil.NOT_SET
   */
  static getComponentSizes(compWraps: ArrayList<Grid$CompWrap>, isHor: boolean): number[][] {
    let compSizes = $J.newArray(compWraps.size(), null);
    for (let i = 0; i < compSizes.length; i++) {
      compSizes[i] = compWraps.get(i).getSizes(isHor);
    }
    return compSizes;
  }
  /**
   * Merges sizes and gaps together with Resize Constraints. For gaps {@link #GAP_RC_CONST} is used.
   * @param resConstr One resize constraint for every row/component. Can be lesser in length and the last element should be used for missing elements.
   * @param gapPush If the corresponding gap should be considered pushing and thus want to take free space if left over. Should be one more than resConstrs!
   * @param minPrefMaxSizes The sizes (min/pref/max) for every row/component.
   * @param gapSizes The gaps before and after each row/component packed in one double sized array.
   * @return A holder for the merged values.
   */
  static mergeSizesGapsAndResConstrs(resConstr: ResizeConstraint[], gapPush: boolean[], minPrefMaxSizes: number[][], gapSizes: number[][]): Grid$FlowSizeSpec {
    let sizes = $J.newArray(((minPrefMaxSizes.length << 1) + 1) | 0, null);
    let resConstsInclGaps = $J.newArray(sizes.length, null);
    sizes[0] = gapSizes[0];
    for (let i = 0, crIx = 1; i < minPrefMaxSizes.length; i++, crIx = (crIx + 2) | 0) {
      resConstsInclGaps[crIx] = resConstr[i];
      sizes[crIx] = minPrefMaxSizes[i];
      (sizes[(crIx + 1) | 0]) = gapSizes[(i + 1) | 0];
      if ((sizes[(crIx - 1) | 0]) != null) {
        (resConstsInclGaps[(crIx - 1) | 0]) = (gapPush[i < gapPush.length ? i : (gapPush.length - 1) | 0]) ? Grid.GAP_RC_CONST_PUSH : Grid.GAP_RC_CONST;
      }
      if (i === ((minPrefMaxSizes.length - 1) | 0) && (sizes[(crIx + 1) | 0]) != null) {
        (resConstsInclGaps[(crIx + 1) | 0]) = (gapPush[((i + 1) | 0) < gapPush.length ? ((i + 1) | 0) : (gapPush.length - 1) | 0]) ? Grid.GAP_RC_CONST_PUSH : Grid.GAP_RC_CONST;
      }
    }
    for (let i = 0; i < sizes.length; i++) {
      if (sizes[i] == null) {
        sizes[i] = $J.newArray(3, 0);
      }
    }
    return new Grid$FlowSizeSpec()._Grid$FlowSizeSpec(sizes, resConstsInclGaps);
  }
  static mergeSizes$intArr$intArr(oldValues: number[], newValues: number[]): number[] {
    if (oldValues == null) {
      return newValues;
    }
    if (newValues == null) {
      return oldValues;
    }
    let ret = $J.newArray(oldValues.length, 0);
    for (let i = 0; i < ret.length; i++) {
      ret[i] = Grid.mergeSizes$int$int$boolean(oldValues[i], newValues[i], true);
    }
    return ret;
  }
  static mergeSizes$int$int$boolean(oldValue: number, newValue: number, toMax: boolean): number {
    if (oldValue === LayoutUtil.NOT_SET || oldValue === newValue) {
      return newValue;
    }
    if (newValue === LayoutUtil.NOT_SET) {
      return oldValue;
    }
    return toMax !== oldValue > newValue ? newValue : oldValue;
  }
  static constrainSize(s: number): number {
    return s > 0 ? (s < LayoutUtil.INF ? s : LayoutUtil.INF) : 0;
  }
  static correctMinMax(s: number[]): void {
    if (s[LayoutUtil.MIN] > s[LayoutUtil.MAX]) {
      s[LayoutUtil.MIN] = s[LayoutUtil.MAX];
    }
    if (s[LayoutUtil.PREF] < s[LayoutUtil.MIN]) {
      s[LayoutUtil.PREF] = s[LayoutUtil.MIN];
    }
    if (s[LayoutUtil.PREF] > s[LayoutUtil.MAX]) {
      s[LayoutUtil.PREF] = s[LayoutUtil.MAX];
    }
  }
  static extractSubArray(specs: DimConstraint[], arr: number[], ix: number, len: number): number[] {
    if (arr == null || arr.length < ((ix + len) | 0)) {
      let growLastArr = $J.newArray(len, null);
      for (let i = (ix + len - 1) | 0; i >= 0; i = (i - 2) | 0) {
        let specIx = (i >> 1);
        if (specs[specIx] !== Grid.DOCK_DIM_CONSTRAINT) {
          (growLastArr[(i - ix) | 0]) = ResizeConstraint.WEIGHT_100;
          return growLastArr;
        }
      }
      return growLastArr;
    }
    let newArr = $J.newArray(len, null);
    $J.system_arraycopy(arr, ix, newArr, 0, len);
    return newArr;
  }
  static putSizesAndIndexes(parComp: any, sizes: number[], ixArr: number[], isRows: boolean): void {
    if (Grid.PARENT_ROWCOL_SIZES_MAP == null) {
      Grid.PARENT_ROWCOL_SIZES_MAP = [new WeakHashMap(4), new WeakHashMap(4)];
    }
    (Grid.PARENT_ROWCOL_SIZES_MAP[isRows ? 0 : 1]).put(parComp, [ixArr, sizes]);
  }
  static getSizesAndIndexes(parComp: any, isRows: boolean): number[][] {
    if (Grid.PARENT_ROWCOL_SIZES_MAP == null) {
      return null;
    }
    return (Grid.PARENT_ROWCOL_SIZES_MAP[isRows ? 0 : 1]).get(parComp);
  }
  static saveGrid(parComp: ComponentWrapper, grid: LinkedHashMap<number, Grid$Cell>): void {
    if (Grid.PARENT_GRIDPOS_MAP == null) {
      Grid.PARENT_GRIDPOS_MAP = new WeakHashMap(4);
    }
    let weakCells = new ArrayList(grid.size());
    for (const $it31 = grid.entrySet().iterator(); $it31.hasNext(); ) {
      let e = $it31.next();
      let cell = e.getValue();
      let xyInt = e.getKey();
      if (xyInt != null) {
        let x = (xyInt << 16) >> 16;
        let y = xyInt >> 16;
        for (const $it32 = cell.compWraps.iterator(); $it32.hasNext(); ) {
          let cw = $it32.next();
          weakCells.add(new Grid$WeakCell()._Grid$WeakCell(cw.comp.getComponent(), x, y, cell.spanx, cell.spany));
        }
      }
    }
    Grid.PARENT_GRIDPOS_MAP.put(parComp.getComponent(), weakCells);
  }
  static getGridPositions(parComp: any): HashMap<any, number[]> {
    let weakCells = Grid.PARENT_GRIDPOS_MAP != null ? Grid.PARENT_GRIDPOS_MAP.get(parComp) : null;
    if (weakCells == null) {
      return null;
    }
    let retMap = new HashMap();
    for (const $it33 = weakCells.iterator(); $it33.hasNext(); ) {
      let wc = $it33.next();
      let component = wc.componentRef.get();
      if (component != null) {
        retMap.put(component, [wc.x_, wc.y_, wc.spanX, wc.spanY]);
      }
    }
    return retMap;
  }
  static $clinit() {
    Grid.GROW_100 = [ResizeConstraint.WEIGHT_100];
    Grid.DOCK_DIM_CONSTRAINT = new DimConstraint()._DimConstraint();
    Grid.DOCK_DIM_CONSTRAINT.setGrowPriority(0);
    Grid.GAP_RC_CONST = new ResizeConstraint()._ResizeConstraint$int$Float$int$Float(200, ResizeConstraint.WEIGHT_100, 50, null);
    Grid.GAP_RC_CONST_PUSH = new ResizeConstraint()._ResizeConstraint$int$Float$int$Float(200, ResizeConstraint.WEIGHT_100, 50, ResizeConstraint.WEIGHT_100);
    Grid.DEF_CC = new CC()._CC();
    Grid.PARENT_ROWCOL_SIZES_MAP = null;
    Grid.PARENT_GRIDPOS_MAP = null;
  }
}

/**
 * A simple representation of a cell in the grid. Contains a number of component wraps, if they span more than one cell.
 */
export class Grid$Cell extends JObject {
  spanx: number = 0;
  spany: number = 0;
  flowx: boolean = false;
  compWraps: ArrayList<Grid$CompWrap> = null;
  hasTagged: boolean = false;
  $init_Grid_Cell() {
    this.compWraps = new ArrayList(2);
    this.hasTagged = false;
  }
  _Grid$Cell$CompWrap(cw: Grid$CompWrap): this {
    this._Grid$Cell$CompWrap$int$int$boolean(cw, 1, 1, true);
    return this;
  }
  _Grid$Cell$int$int$boolean(spanx: number, spany: number, flowx: boolean): this {
    this._Grid$Cell$CompWrap$int$int$boolean(null, spanx, spany, flowx);
    return this;
  }
  _Grid$Cell$CompWrap$int$int$boolean(cw: Grid$CompWrap, spanx: number, spany: number, flowx: boolean): this {
    this.$init_Grid_Cell();
    if (cw != null) {
      this.compWraps.add(cw);
    }
    this.spanx = spanx;
    this.spany = spany;
    this.flowx = flowx;
    return this;
  }
}

/**
 * A number of component wraps that share a layout "something" <b>in one dimension</b>
 */
export class Grid$LinkedDimGroup extends JObject {
  static readonly TYPE_SERIAL: number = 0;
  static readonly TYPE_PARALLEL: number = 1;
  static readonly TYPE_BASELINE: number = 2;
  linkCtx: string = null;
  span_: number = 0;
  linkType: number = 0;
  isHor: boolean = false;
  fromEnd: boolean = false;
  _compWraps: ArrayList<Grid$CompWrap> = null;
  lStart: number = 0;
  lSize: number = 0;
  _Grid$LinkedDimGroup(linkCtx: string, span: number, linkType: number, isHor: boolean, fromEnd: boolean): this {
    this._compWraps = new ArrayList(4);
    this.lStart = 0;
    this.lSize = 0;
    this.linkCtx = linkCtx;
    this.span_ = span;
    this.linkType = linkType;
    this.isHor = isHor;
    this.fromEnd = fromEnd;
    return this;
  }
  addCompWrap(cw: Grid$CompWrap): void {
    this._compWraps.add(cw);
  }
  setCompWraps(cws: ArrayList<Grid$CompWrap>): void {
    if (this._compWraps !== cws) {
      this._compWraps.clear();
      this._compWraps.addAll(cws);
    }
  }
  layout(dc: DimConstraint, start: number, size: number, spanCount: number): void {
    this.lStart = start;
    this.lSize = size;
    if (this._compWraps.isEmpty()) {
      return;
    }
    let parent = this._compWraps.get(0).comp.getParent();
    if (this.linkType === Grid$LinkedDimGroup.TYPE_PARALLEL) {
      Grid.layoutParallel(parent, this._compWraps, dc, start, size, this.isHor, this.fromEnd);
    } else if (this.linkType === Grid$LinkedDimGroup.TYPE_BASELINE) {
      Grid.layoutBaseline(parent, this._compWraps, dc, start, size, LayoutUtil.PREF, spanCount);
    } else {
      Grid.layoutSerial(parent, this._compWraps, dc, start, size, this.isHor, spanCount, this.fromEnd);
    }
  }
  /**
   * Returns the min/pref/max sizes for this cell. Returned array <b>must not be altered</b>
   * @return A shared min/pref/max array of sizes. Always of length 3 and never <code>null</code>. Will always be of type STATIC and PIXEL.
   */
  getMinPrefMax(): number[] {
    let sizes = $J.newArray(3, 0);
    if (!this._compWraps.isEmpty()) {
      for (let sType = LayoutUtil.MIN; sType <= LayoutUtil.PREF; sType++) {
        if (this.linkType === Grid$LinkedDimGroup.TYPE_PARALLEL) {
          sizes[sType] = Grid.getTotalSizeParallel(this._compWraps, sType, this.isHor);
        } else if (this.linkType === Grid$LinkedDimGroup.TYPE_BASELINE) {
          let aboveBelow = Grid.getBaselineAboveBelow(this._compWraps, sType, false);
          sizes[sType] = aboveBelow.sum();
        } else {
          sizes[sType] = Grid.getTotalSizeSerial(this._compWraps, sType, this.isHor);
        }
      }
      sizes[LayoutUtil.MAX] = LayoutUtil.INF;
    }
    return sizes;
  }
}

/**
 * Wraps a {@link java.awt.Component} together with its constraint. Caches a lot of information about the component so
 * for instance not the preferred size has to be calculated more than once.
 *
 * Note! Does not ask the min/pref/max sizes again after the constructor. This means that
 */
export class Grid$CompWrap extends JObject {
  comp: ComponentWrapper = null;
  cc: CC = null;
  eHideMode: number = 0;
  useVisualPadding: boolean = false;
  sizesOk: boolean = false;
  isAbsolute_: boolean = false;
  gaps: number[][] = null;
  horSizes: number[] = null;
  verSizes: number[] = null;
  x_: number = 0;
  y_: number = 0;
  w: number = 0;
  h: number = 0;
  forcedPushGaps: number = 0;
  /**
   * @param c
   * @param cc
   * @param eHideMode Effective hide mode. <= 0 means visible.
   * @param useVisualPadding
   */
  _Grid$CompWrap(c: ComponentWrapper, cc: CC, eHideMode: number, useVisualPadding: boolean): this {
    this.sizesOk = false;
    this.horSizes = $J.newArray(3, 0);
    this.verSizes = $J.newArray(3, 0);
    this.x_ = LayoutUtil.NOT_SET;
    this.y_ = LayoutUtil.NOT_SET;
    this.w = LayoutUtil.NOT_SET;
    this.h = LayoutUtil.NOT_SET;
    this.forcedPushGaps = 0;
    this.comp = c;
    this.cc = cc;
    this.eHideMode = eHideMode;
    this.useVisualPadding = useVisualPadding;
    this.isAbsolute_ = cc.getHorizontal().getSize().isAbsolute() && cc.getVertical().getSize().isAbsolute();
    if (eHideMode > 1) {
      this.gaps = $J.newArray(4, null);
      for (let i = 0; i < this.gaps.length; i++) {
        this.gaps[i] = $J.newArray(3, 0);
      }
    }
    return this;
  }
  getSizes(isHor: boolean): number[] {
    this.validateSize();
    return isHor ? this.horSizes : this.verSizes;
  }
  validateSize(): void {
    let callbackSz = this.$outer.getCallbackSize(this.comp);
    if (this.isAbsolute_ && this.sizesOk && callbackSz == null) {
      return;
    }
    if (this.eHideMode <= 0) {
      let contentBias = this.comp.getContentBias();
      let sizeHint = contentBias === -1 ? -1 : (contentBias === 0 ? (this.w !== LayoutUtil.NOT_SET ? this.w : this.comp.getWidth()) : (this.h !== LayoutUtil.NOT_SET ? this.h : this.comp.getHeight()));
      let hBS = (callbackSz != null && callbackSz[0] != null) ? callbackSz[0] : this.cc.getHorizontal().getSize();
      let vBS = (callbackSz != null && callbackSz[1] != null) ? callbackSz[1] : this.cc.getVertical().getSize();
      for (let i = LayoutUtil.MIN; i <= LayoutUtil.MAX; i++) {
        switch (contentBias) {
          case -1:
          default:
            this.horSizes[i] = this.getSize$BoundSize$int$boolean$boolean$int$Grid_CompWrap(hBS, i, true, this.useVisualPadding, -1);
            this.verSizes[i] = this.getSize$BoundSize$int$boolean$boolean$int$Grid_CompWrap(vBS, i, false, this.useVisualPadding, -1);
            break;
          case 0:
            this.horSizes[i] = this.getSize$BoundSize$int$boolean$boolean$int$Grid_CompWrap(hBS, i, true, this.useVisualPadding, -1);
            this.verSizes[i] = this.getSize$BoundSize$int$boolean$boolean$int$Grid_CompWrap(vBS, i, false, this.useVisualPadding, sizeHint > 0 ? sizeHint : this.horSizes[i]);
            break;
          case 1:
            this.verSizes[i] = this.getSize$BoundSize$int$boolean$boolean$int$Grid_CompWrap(vBS, i, false, this.useVisualPadding, -1);
            this.horSizes[i] = this.getSize$BoundSize$int$boolean$boolean$int$Grid_CompWrap(hBS, i, true, this.useVisualPadding, sizeHint > 0 ? sizeHint : this.verSizes[i]);
            break;
        }
      }
      Grid.correctMinMax(this.horSizes);
      Grid.correctMinMax(this.verSizes);
    } else {
      Arrays.fill(this.horSizes, 0);
      Arrays.fill(this.verSizes, 0);
    }
    this.sizesOk = true;
  }
  getSize$BoundSize$int$boolean$boolean$int$Grid_CompWrap(uvs: BoundSize, sizeType: number, isHor: boolean, useVP: boolean, sizeHint: number): number {
    let size: number;
    if (uvs == null || uvs.getSize(sizeType) == null) {
      switch (sizeType) {
        case LayoutUtil.MIN:
          size = isHor ? this.comp.getMinimumWidth(sizeHint) : this.comp.getMinimumHeight(sizeHint);
          break;
        case LayoutUtil.PREF:
          size = isHor ? this.comp.getPreferredWidth(sizeHint) : this.comp.getPreferredHeight(sizeHint);
          break;
        default:
          size = isHor ? this.comp.getMaximumWidth(sizeHint) : this.comp.getMaximumHeight(sizeHint);
          break;
      }
      if (useVP) {
        let visualPadding = this.comp.getVisualPadding();
        if (visualPadding != null && visualPadding.length > 0) {
          size = (size - (isHor ? ((visualPadding[1] + visualPadding[3]) | 0) : ((visualPadding[0] + visualPadding[2]) | 0))) | 0;
        }
      }
    } else {
      let par = this.comp.getParent();
      let refValue = Math.fround(isHor ? par.getWidth() : par.getHeight());
      size = uvs.getSize(sizeType).getPixels(refValue, par, this.comp);
    }
    return size;
  }
  calcGaps(before: ComponentWrapper, befCC: CC, after: ComponentWrapper, aftCC: CC, tag: string, flowX: boolean, isLTR: boolean): void {
    let par = this.comp.getParent();
    let parW = par.getWidth();
    let parH = par.getHeight();
    let befGap = before != null ? (flowX ? befCC.getHorizontal() : befCC.getVertical()).getGapAfter() : null;
    let aftGap = after != null ? (flowX ? aftCC.getHorizontal() : aftCC.getVertical()).getGapBefore() : null;
    this.mergeGapSizes(this.cc.getVertical().getComponentGaps(par, this.comp, befGap, (flowX ? null : before), tag, parH, 0, isLTR), false, true);
    this.mergeGapSizes(this.cc.getHorizontal().getComponentGaps(par, this.comp, befGap, (flowX ? before : null), tag, parW, 1, isLTR), true, true);
    this.mergeGapSizes(this.cc.getVertical().getComponentGaps(par, this.comp, aftGap, (flowX ? null : after), tag, parH, 2, isLTR), false, false);
    this.mergeGapSizes(this.cc.getHorizontal().getComponentGaps(par, this.comp, aftGap, (flowX ? after : null), tag, parW, 3, isLTR), true, false);
  }
  setDimBounds(start: number, size: number, isHor: boolean): void {
    if (isHor) {
      if (start !== this.x_ || this.w !== size) {
        this.x_ = start;
        this.w = size;
        if (this.comp.getContentBias() === LayoutUtil.HORIZONTAL) {
          this.invalidateSizes();
        }
      }
    } else {
      if (start !== this.y_ || this.h !== size) {
        this.y_ = start;
        this.h = size;
        if (this.comp.getContentBias() === LayoutUtil.VERTICAL) {
          this.invalidateSizes();
        }
      }
    }
  }
  invalidateSizes(): void {
    this.sizesOk = false;
  }
  isPushGap(isHor: boolean, isBefore: boolean): boolean {
    if (isHor && ((isBefore ? 1 : 2) & this.forcedPushGaps) !== 0) {
      return true;
    }
    let dc = this.cc.getDimConstraint(isHor);
    let s = isBefore ? dc.getGapBefore() : dc.getGapAfter();
    return s != null && s.getGapPush();
  }
  /**
   * Transfers the bounds to the component
   */
  transferBounds(addVisualPadding: boolean): void {
    if (this.cc.isExternal()) {
      return;
    }
    let compX = this.x_;
    let compY = this.y_;
    let compW = this.w;
    let compH = this.h;
    if (addVisualPadding) {
      let visualPadding = this.comp.getVisualPadding();
      if (visualPadding != null) {
        compX = (compX - visualPadding[1]) | 0;
        compY = (compY - visualPadding[0]) | 0;
        compW = (compW + (visualPadding[1] + visualPadding[3])) | 0;
        compH = (compH + (visualPadding[0] + visualPadding[2])) | 0;
      }
    }
    this.comp.setBounds(compX, compY, compW, compH);
  }
  setForcedSizes(sizes: number[], isHor: boolean): void {
    if (sizes == null) {
      return;
    }
    $J.system_arraycopy(sizes, 0, this.getSizes(isHor), 0, 3);
    this.sizesOk = true;
  }
  setGaps(minPrefMax: number[], ix: number): void {
    if (this.gaps == null) {
      this.gaps = [null, null, null, null];
    }
    this.gaps[ix] = minPrefMax;
  }
  mergeGapSizes(sizes: number[], isHor: boolean, isTL: boolean): void {
    if (this.gaps == null) {
      this.gaps = [null, null, null, null];
    }
    if (sizes == null) {
      return;
    }
    let gapIX = this.getGapIx(isHor, isTL);
    let oldGaps = this.gaps[gapIX];
    if (oldGaps == null) {
      oldGaps = [0, 0, LayoutUtil.INF];
      this.gaps[gapIX] = oldGaps;
    }
    oldGaps[LayoutUtil.MIN] = Math.max(sizes[LayoutUtil.MIN], oldGaps[LayoutUtil.MIN]);
    oldGaps[LayoutUtil.PREF] = Math.max(sizes[LayoutUtil.PREF], oldGaps[LayoutUtil.PREF]);
    oldGaps[LayoutUtil.MAX] = Math.min(sizes[LayoutUtil.MAX], oldGaps[LayoutUtil.MAX]);
  }
  getGapIx(isHor: boolean, isTL: boolean): number {
    return isHor ? (isTL ? 1 : 3) : (isTL ? 0 : 2);
  }
  getSizeInclGaps(sizeType: number, isHor: boolean): number {
    return this.filter(sizeType, (this.getGapBefore(sizeType, isHor) + this.getSize$int$boolean$Grid_CompWrap(sizeType, isHor) + this.getGapAfter(sizeType, isHor)) | 0);
  }
  getSize$int$boolean$Grid_CompWrap(sizeType: number, isHor: boolean): number {
    return this.filter(sizeType, this.getSizes(isHor)[sizeType]);
  }
  getGapBefore(sizeType: number, isHor: boolean): number {
    let gaps = this.getGaps(isHor, true);
    return gaps != null ? this.filter(sizeType, gaps[sizeType]) : 0;
  }
  getGapAfter(sizeType: number, isHor: boolean): number {
    let gaps = this.getGaps(isHor, false);
    return gaps != null ? this.filter(sizeType, gaps[sizeType]) : 0;
  }
  getGaps(isHor: boolean, isTL: boolean): number[] {
    return this.gaps[this.getGapIx(isHor, isTL)];
  }
  filter(sizeType: number, size: number): number {
    if (size === LayoutUtil.NOT_SET) {
      return sizeType !== LayoutUtil.MAX ? 0 : LayoutUtil.INF;
    }
    return Grid.constrainSize(size);
  }
  isBaselineAlign(defValue: boolean): boolean {
    let g = this.cc.getVertical().getGrow();
    if (g != null && $J.d2i(+g) !== 0) {
      return false;
    }
    let al = this.cc.getVertical().getAlign();
    return (al != null ? al === UnitValue.BASELINE_IDENTITY : defValue) && this.comp.hasBaseline();
  }
  getBaseline(sizeType: number): number {
    return this.comp.getBaseline(this.getSize$int$boolean$Grid_CompWrap(sizeType, true), this.getSize$int$boolean$Grid_CompWrap(sizeType, false));
  }
  adjustMinHorSizeUp(minSize: number): void {
    let sz = this.getSizes(true);
    if (sz[LayoutUtil.MIN] < minSize) {
      sz[LayoutUtil.MIN] = minSize;
    }
    Grid.correctMinMax(sz);
  }
}

export class Grid$AboveBelow extends JObject {
  maxAbove: number = 0;
  maxBelow: number = 0;
  _Grid$AboveBelow(maxAbove: number, maxBelow: number): this {
    this.maxAbove = maxAbove;
    this.maxBelow = maxBelow;
    return this;
  }
  sum(): number {
    return (this.maxAbove + this.maxBelow) | 0;
  }
}

export class Grid$FlowSizeSpec extends JObject {
  sizes: number[][] = null;
  resConstsInclGaps: ResizeConstraint[] = null;
  _Grid$FlowSizeSpec(sizes: number[][], resConstsInclGaps: ResizeConstraint[]): this {
    this.sizes = sizes;
    this.resConstsInclGaps = resConstsInclGaps;
    return this;
  }
  /**
   * @param specs The specs for the columns or rows. Last index will be used of <code>fromIx + len</code> is greater than this array's length.
   * @param targetSize The size to try to meet.
   * @param defGrow The default grow weight if the specs does not have anyone that will grow. Comes from "push" in the CC.
   * @param fromIx
   * @param len
   * @param sizeType
   * @param eagerness How eager the algorithm should be to try to expand the sizes.
   * <ul>
   * <li>0 - Grow only rows/columns which have the <code>sizeType</code> set to be the containing components AND which has a grow weight &gt; 0.
   * <li>1 - Grow only rows/columns which have the <code>sizeType</code> set to be the containing components AND which has a grow weight &gt; 0 OR unspecified.
   * <li>2 - Grow all rows/columns that have a grow weight &gt; 0.
   * <li>3 - Grow all rows/columns that have a grow weight &gt; 0 OR unspecified.
   * </ul>
   * @return The new size.
   */
  expandSizes(specs: DimConstraint[], defGrow: number[], targetSize: number, fromIx: number, len: number, sizeType: number, eagerness: number): number {
    let resConstr = $J.newArray(len, null);
    let sizesToExpand = $J.newArray(len, null);
    for (let i = 0; i < len; i++) {
      let minPrefMax = this.sizes[(i + fromIx) | 0];
      sizesToExpand[i] = [minPrefMax[sizeType], minPrefMax[LayoutUtil.PREF], minPrefMax[LayoutUtil.MAX]];
      if (eagerness <= 1 && i % 2 === 0) {
        let cIx = ((i + fromIx - 1) | 0) >> 1;
        let spec = LayoutUtil.getIndexSafe(specs, cIx);
        let sz = spec.getSize();
        if ((sizeType === LayoutUtil.MIN && sz.getMin() != null && sz.getMin().getUnit() !== UnitValue.MIN_SIZE) || (sizeType === LayoutUtil.PREF && sz.getPreferred() != null && sz.getPreferred().getUnit() !== UnitValue.PREF_SIZE)) {
          continue;
        }
      }
      resConstr[i] = LayoutUtil.getIndexSafe(this.resConstsInclGaps, (i + fromIx) | 0);
    }
    let growW = (eagerness === 1 || eagerness === 3) ? Grid.extractSubArray(specs, defGrow, fromIx, len) : null;
    let newSizes = LayoutUtil.calculateSerial(sizesToExpand, resConstr, growW, LayoutUtil.PREF, targetSize);
    let newSize = 0;
    for (let i = 0; i < len; i++) {
      let s = newSizes[i];
      (this.sizes[(i + fromIx) | 0])[sizeType] = s;
      newSize = (newSize + s) | 0;
    }
    return newSize;
  }
}

export class Grid$WeakCell extends JObject {
  componentRef: WeakReference<any> = null;
  x_: number = 0;
  y_: number = 0;
  spanX: number = 0;
  spanY: number = 0;
  _Grid$WeakCell(component: any, x: number, y: number, spanX: number, spanY: number): this {
    this.componentRef = new WeakReference(component);
    this.x_ = x;
    this.y_ = y;
    this.spanX = spanX;
    this.spanY = spanY;
    return this;
  }
}

$J.define(Grid, 'net.miginfocom.layout.Grid', { kind: 'class', sup: 'java.lang.Object', ctors: { 'net.miginfocom.layout.ContainerWrapper,net.miginfocom.layout.LC,net.miginfocom.layout.AC,net.miginfocom.layout.AC,java.util.Map,java.util.ArrayList': '_Grid' }, meths: { 'mergeSizes(int,int,boolean)': 'mergeSizes$int$int$boolean', 'mergeSizes(int[],int[])': 'mergeSizes$intArr$intArr', 'setCompWrapBounds(net.miginfocom.layout.ContainerWrapper,int[][],java.util.ArrayList,net.miginfocom.layout.UnitValue,int,int,boolean,boolean)': 'setCompWrapBounds$ContainerWrapper$intArrArr$ArrayList$UnitValue$int$int$boolean$boolean', 'setCompWrapBounds(net.miginfocom.layout.ContainerWrapper,int[],java.util.ArrayList,net.miginfocom.layout.UnitValue,int,int,boolean,boolean)': 'setCompWrapBounds$ContainerWrapper$intArr$ArrayList$UnitValue$int$int$boolean$boolean', 'getHeight(int)': 'getHeight$int', 'getHeight()': 'getHeight$', 'getWidth(int)': 'getWidth$int', 'getWidth()': 'getWidth$', 'layout(int[],net.miginfocom.layout.UnitValue,net.miginfocom.layout.UnitValue,boolean)': 'layout$intArr$UnitValue$UnitValue$boolean', 'layout(int[],net.miginfocom.layout.UnitValue,net.miginfocom.layout.UnitValue,boolean,boolean)': 'layout$intArr$UnitValue$UnitValue$boolean$boolean' }, clinit: true, lazy: ['GROW_100', 'DOCK_DIM_CONSTRAINT', 'GAP_RC_CONST', 'GAP_RC_CONST_PUSH', 'DEF_CC', 'PARENT_ROWCOL_SIZES_MAP', 'PARENT_GRIDPOS_MAP'] });
$J.define(Grid$Cell, 'net.miginfocom.layout.Grid$Cell', { kind: 'class', sup: 'java.lang.Object', ctors: { 'net.miginfocom.layout.Grid$CompWrap,int,int,boolean': '_Grid$Cell$CompWrap$int$int$boolean', 'int,int,boolean': '_Grid$Cell$int$int$boolean', 'net.miginfocom.layout.Grid$CompWrap': '_Grid$Cell$CompWrap' } });
$J.define(Grid$LinkedDimGroup, 'net.miginfocom.layout.Grid$LinkedDimGroup', { kind: 'class', sup: 'java.lang.Object', ctors: { 'java.lang.String,int,int,boolean,boolean': '_Grid$LinkedDimGroup' } });
$J.define(Grid$CompWrap, 'net.miginfocom.layout.Grid$CompWrap', { kind: 'class', sup: 'java.lang.Object', ctors: { 'net.miginfocom.layout.ComponentWrapper,net.miginfocom.layout.CC,int,boolean': '_Grid$CompWrap' }, meths: { 'getSize(int,boolean)': 'getSize$int$boolean$Grid_CompWrap', 'getSize(net.miginfocom.layout.BoundSize,int,boolean,boolean,int)': 'getSize$BoundSize$int$boolean$boolean$int$Grid_CompWrap' }, inner: true });
$J.define(Grid$AboveBelow, 'net.miginfocom.layout.Grid$AboveBelow', { kind: 'class', sup: 'java.lang.Object', ctors: { 'int,int': '_Grid$AboveBelow' } });
$J.define(Grid$FlowSizeSpec, 'net.miginfocom.layout.Grid$FlowSizeSpec', { kind: 'class', sup: 'java.lang.Object', ctors: { 'int[][],net.miginfocom.layout.ResizeConstraint[]': '_Grid$FlowSizeSpec' } });
$J.define(Grid$WeakCell, 'net.miginfocom.layout.Grid$WeakCell', { kind: 'class', sup: 'java.lang.Object', ctors: { 'java.lang.Object,int,int,int,int': '_Grid$WeakCell' } });
$J.module(() => {
  CC = $J.load('net.miginfocom.layout.CC');
  DimConstraint = $J.load('net.miginfocom.layout.DimConstraint');
  LayoutUtil = $J.load('net.miginfocom.layout.LayoutUtil');
  LinkHandler = $J.load('net.miginfocom.layout.LinkHandler');
  PlatformDefaults = $J.load('net.miginfocom.layout.PlatformDefaults');
  ResizeConstraint = $J.load('net.miginfocom.layout.ResizeConstraint');
  UnitConverter = $J.load('net.miginfocom.layout.UnitConverter');
  UnitValue = $J.load('net.miginfocom.layout.UnitValue');
});
